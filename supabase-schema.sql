-- ============================================
-- MecaApp - Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Script idempotente: puede re-ejecutarse sin romper ni duplicar datos.
-- Orden: tablas -> indices -> funciones -> triggers -> RLS -> seed.
-- ============================================

-- ============================================
-- 1. TABLAS
-- ============================================

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'mechanic', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- vehicles
-- Un perfil (cliente) puede tener N vehiculos. La placa es unica por cliente.
-- vehicle_type: NULL = sin clasificar, 'car' = carro, 'motorcycle' = moto
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  notes TEXT,
  vehicle_type TEXT CHECK (vehicle_type IN ('car', 'motorcycle')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT vehicles_client_plate_key UNIQUE (client_id, plate)
);

-- plans (catalogo global de planes de servicio)
-- Solo los administradores gestionan el catalogo; el resto solo lo lee.
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'motorcycle')),
  tagline TEXT NOT NULL DEFAULT '',
  price_usd NUMERIC NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'mes',
  services TEXT[] NOT NULL DEFAULT '{}',
  highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- orders (solicitudes de servicio)
-- plan_id/plan_name/plan_price_usd son un snapshot del plan: editar o borrar un
-- plan no altera las ordenes existentes. ON DELETE RESTRICT impide borrar
-- vehiculos/perfiles con ordenes asociadas.
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  mechanic_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price_usd NUMERIC NOT NULL DEFAULT 0,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'motorcycle')),
  client_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- order_steps (checklist de avance de una orden)
-- Se siembra desde plans.services al crear la orden (snapshot, como plan_name)
-- y el mecanico puede anadir/quitar/marcar puntos mientras la orden este
-- aceptada o en curso. El cliente lo ve en modo lectura.
CREATE TABLE IF NOT EXISTS order_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_vehicles_client_created_at ON vehicles(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_orders_client_created_at ON orders(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_mechanic_created_at ON orders(mechanic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_plan_id ON orders(plan_id);
CREATE INDEX IF NOT EXISTS idx_plans_vehicle_sort ON plans(vehicle_type, sort_order);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_order_steps_order ON order_steps(order_id, sort_order);

-- ============================================
-- 3. FUNCIONES
-- ============================================

-- updated_at automatico
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Proteccion de columnas sensibles de profiles: solo el service_role
-- (servidor de Next) puede escribir role/email.
CREATE OR REPLACE FUNCTION prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'user';
      NEW.email := LOWER(NEW.email);
    ELSE
      NEW.role := OLD.role;
      NEW.email := OLD.email;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Helpers de autorizacion usados por las policies. SECURITY DEFINER para leer
-- profiles sin volver a evaluar su RLS (evita recursion infinita).
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('mechanic', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Crea el profile al registrarse. Siempre nace como 'user'; la promocion a
-- mechanic/admin la hace el servidor (service_role) tras validar el owner/admins.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Validacion de integridad al crear una orden: aunque se llame a PostgREST
-- directo, los datos derivados del plan y la pertenencia del vehiculo se
-- verifican aqui.
CREATE OR REPLACE FUNCTION validate_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_vehicle_client UUID;
  v_vehicle_type TEXT;
  v_mechanic_role TEXT;
  v_plan_id UUID;
  v_plan_name TEXT;
  v_plan_price NUMERIC;
  v_plan_type TEXT;
  v_plan_active BOOLEAN;
BEGIN
  SELECT client_id, vehicle_type
    INTO v_vehicle_client, v_vehicle_type
    FROM public.vehicles WHERE id = NEW.vehicle_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El vehículo no existe';
  END IF;

  IF v_vehicle_client <> NEW.client_id THEN
    RAISE EXCEPTION 'El vehículo no pertenece al cliente';
  END IF;

  IF v_vehicle_type IS NULL THEN
    RAISE EXCEPTION 'El vehículo debe estar clasificado antes de solicitar el servicio';
  END IF;

  SELECT role INTO v_mechanic_role FROM public.profiles WHERE id = NEW.mechanic_id;
  IF v_mechanic_role IS NULL OR v_mechanic_role <> 'mechanic' THEN
    RAISE EXCEPTION 'El mecánico seleccionado no es válido';
  END IF;

  BEGIN
    v_plan_id := NEW.plan_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'El plan seleccionado no es válido';
  END;

  SELECT name, price_usd, vehicle_type, is_active
    INTO v_plan_name, v_plan_price, v_plan_type, v_plan_active
    FROM public.plans WHERE id = v_plan_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El plan seleccionado no existe';
  END IF;

  IF NOT v_plan_active THEN
    RAISE EXCEPTION 'El plan seleccionado no está activo';
  END IF;

  IF v_plan_type <> v_vehicle_type THEN
    RAISE EXCEPTION 'El plan no corresponde al tipo del vehículo';
  END IF;

  NEW.plan_id := v_plan_id::text;
  NEW.plan_name := v_plan_name;
  NEW.plan_price_usd := v_plan_price;
  NEW.vehicle_type := v_plan_type;

  RETURN NEW;
END;
$$;

-- Transiciones de estado validas + campos base inmutables.
CREATE OR REPLACE FUNCTION validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.client_id <> OLD.client_id
     OR NEW.vehicle_id <> OLD.vehicle_id
     OR NEW.mechanic_id <> OLD.mechanic_id
     OR NEW.plan_id <> OLD.plan_id THEN
    RAISE EXCEPTION 'No se pueden modificar los datos base de una orden';
  END IF;

  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'pending' AND NEW.status IN ('accepted', 'cancelled'))
    OR (OLD.status = 'accepted' AND NEW.status IN ('in_progress', 'cancelled'))
    OR (OLD.status = 'in_progress' AND NEW.status IN ('completed', 'cancelled'))
  ) THEN
    RAISE EXCEPTION 'Transición de estado no permitida';
  END IF;

  RETURN NEW;
END;
$$;

-- Pasos visibles para el cliente dueno, el mecanico asignado y los admins.
CREATE OR REPLACE FUNCTION is_order_member(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = p_order_id
      AND (o.client_id = auth.uid() OR o.mechanic_id = auth.uid() OR public.is_admin())
  );
$$;

-- Solo el mecanico asignado puede mutar el checklist de su orden.
CREATE OR REPLACE FUNCTION is_order_mechanic(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = p_order_id AND o.mechanic_id = auth.uid()
  );
$$;

-- Siembra el checklist desde los servicios del plan al crear la orden.
-- SECURITY DEFINER para que el cliente (quien inserta la orden) pueda generar
-- los pasos indirectamente; el guard de abajo lo limita a ordenes nuevas.
CREATE OR REPLACE FUNCTION seed_order_steps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.order_steps (order_id, title, sort_order)
  SELECT NEW.id, s.title, s.ord
    FROM public.plans p,
         unnest(p.services) WITH ORDINALITY AS s(title, ord)
   WHERE p.id::text = NEW.plan_id
     AND NULLIF(TRIM(s.title), '') IS NOT NULL;
  RETURN NEW;
END;
$$;

-- Guardia del checklist: solo se modifica con la orden aceptada o en curso
-- (anadir pasos tambien admite 'pending' para el siembra), y sincroniza
-- completed_at con done. service_role (migraciones) queda exento.
CREATE OR REPLACE FUNCTION validate_order_step_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_status TEXT;
  v_role TEXT := auth.role();
BEGIN
  -- service_role (migraciones/backfill) y SQL Editor (auth.role() NULL) exentos.
  IF v_role IS NULL OR v_role = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT status INTO v_status
    FROM public.orders
   WHERE id = COALESCE(NEW.order_id, OLD.order_id);

  IF TG_OP = 'INSERT' THEN
    IF v_status NOT IN ('pending', 'accepted', 'in_progress') THEN
      RAISE EXCEPTION 'No se pueden anadir pasos a una orden cerrada';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF v_status NOT IN ('pending', 'accepted', 'in_progress') THEN
      RAISE EXCEPTION 'No se pueden quitar pasos de una orden cerrada';
    END IF;
    RETURN OLD;
  END IF;

  IF v_status NOT IN ('accepted', 'in_progress') THEN
    RAISE EXCEPTION 'El checklist solo se modifica con la orden aceptada o en curso';
  END IF;

  NEW.completed_at := CASE
    WHEN NEW.done THEN COALESCE(OLD.completed_at, NOW())
    ELSE NULL
  END;
  IF NEW.order_id <> OLD.order_id THEN
    RAISE EXCEPTION 'No se puede mover un paso a otra orden';
  END IF;
  RETURN NEW;
END;
$$;

-- Impide borrar un plan con ordenes asociadas.CREATE OR REPLACE FUNCTION prevent_plan_delete_with_orders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.orders WHERE plan_id = OLD.id::text) THEN
    RAISE EXCEPTION 'No se puede eliminar un plan con órdenes asociadas';
  END IF;
  RETURN OLD;
END;
$$;

-- Conteo global de ordenes por plan. SECURITY DEFINER con guardia de rol admin.
CREATE OR REPLACE FUNCTION get_plan_order_counts()
RETURNS TABLE (plan_id TEXT, order_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo los administradores pueden consultar el conteo de órdenes';
  END IF;

  RETURN QUERY
    SELECT o.plan_id, COUNT(*)::bigint
    FROM public.orders o
    GROUP BY o.plan_id;
END;
$$;

-- ============================================
-- 4. TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation ON profiles;
CREATE TRIGGER prevent_profile_privilege_escalation
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_profile_privilege_escalation();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS validate_order ON orders;
CREATE TRIGGER validate_order
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order();

DROP TRIGGER IF EXISTS validate_order_status_transition ON orders;
CREATE TRIGGER validate_order_status_transition
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_status_transition();

DROP TRIGGER IF EXISTS seed_order_steps ON orders;
CREATE TRIGGER seed_order_steps
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION seed_order_steps();

DROP TRIGGER IF EXISTS validate_order_step_change ON order_steps;
CREATE TRIGGER validate_order_step_change
  BEFORE INSERT OR UPDATE OR DELETE ON order_steps
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_step_change();

DROP TRIGGER IF EXISTS prevent_plan_delete_with_orders ON plans;
CREATE TRIGGER prevent_plan_delete_with_orders
  BEFORE DELETE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION prevent_plan_delete_with_orders();

-- ============================================
-- 5. RLS Y POLICIES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_steps ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Mechanics can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (is_staff());

DROP POLICY IF EXISTS "Users can view mechanics" ON profiles;
CREATE POLICY "Users can view mechanics"
  ON profiles FOR SELECT
  USING (role = 'mechanic');

-- vehicles
DROP POLICY IF EXISTS "Users can view own vehicles" ON vehicles;
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Users can insert own vehicles" ON vehicles;
CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Users can update own vehicles" ON vehicles;
CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Users can delete own vehicles" ON vehicles;
CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Mechanics can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Staff can view all vehicles" ON vehicles;
CREATE POLICY "Staff can view all vehicles"
  ON vehicles FOR SELECT
  USING (is_staff());

-- orders
DROP POLICY IF EXISTS "Clients can view own orders" ON orders;
CREATE POLICY "Clients can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients can insert own orders" ON orders;
CREATE POLICY "Clients can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients can delete own orders" ON orders;
DROP POLICY IF EXISTS "Clients can delete own pending orders" ON orders;
CREATE POLICY "Clients can delete own pending orders"
  ON orders FOR DELETE
  USING (auth.uid() = client_id AND status = 'pending');

DROP POLICY IF EXISTS "Mechanics can view own orders" ON orders;
CREATE POLICY "Mechanics can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = mechanic_id);

DROP POLICY IF EXISTS "Mechanics can update own orders" ON orders;
CREATE POLICY "Mechanics can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = mechanic_id)
  WITH CHECK (auth.uid() = mechanic_id);

-- order_steps
DROP POLICY IF EXISTS "Order members can view steps" ON order_steps;
CREATE POLICY "Order members can view steps"
  ON order_steps FOR SELECT
  USING (is_order_member(order_id));

DROP POLICY IF EXISTS "Mechanics can insert own order steps" ON order_steps;
CREATE POLICY "Mechanics can insert own order steps"
  ON order_steps FOR INSERT
  WITH CHECK (is_order_mechanic(order_id));

DROP POLICY IF EXISTS "Mechanics can update own order steps" ON order_steps;
CREATE POLICY "Mechanics can update own order steps"
  ON order_steps FOR UPDATE
  USING (is_order_mechanic(order_id))
  WITH CHECK (is_order_mechanic(order_id));

DROP POLICY IF EXISTS "Mechanics can delete own order steps" ON order_steps;
CREATE POLICY "Mechanics can delete own order steps"
  ON order_steps FOR DELETE
  USING (is_order_mechanic(order_id));

-- plans
DROP POLICY IF EXISTS "Authenticated users can view plans" ON plans;
CREATE POLICY "Authenticated users can view plans"
  ON plans FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Mechanics can insert plans" ON plans;
DROP POLICY IF EXISTS "Admins can insert plans" ON plans;
CREATE POLICY "Admins can insert plans"
  ON plans FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Mechanics can update plans" ON plans;
DROP POLICY IF EXISTS "Admins can update plans" ON plans;
CREATE POLICY "Admins can update plans"
  ON plans FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Mechanics can delete plans" ON plans;
DROP POLICY IF EXISTS "Admins can delete plans" ON plans;
CREATE POLICY "Admins can delete plans"
  ON plans FOR DELETE
  USING (is_admin());

-- ============================================
-- 6. SEED INICIAL DEL CATALOGO (solo si esta vacio)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.plans) THEN
    INSERT INTO public.plans (name, vehicle_type, tagline, price_usd, services, highlighted, sort_order) VALUES
      (
        'Esencial Carro',
        'car',
        'Lo básico para mantener tu carro al día',
        19,
        ARRAY[
          'Cambio de aceite y filtro de aceite',
          'Revisión de niveles (frenos, refrigerante, dirección)',
          'Inspección general de 15 puntos'
        ],
        FALSE,
        1
      ),
      (
        'Integral Carro',
        'car',
        'Mantenimiento completo para uso diario',
        39,
        ARRAY[
          'Todo lo del plan Esencial',
          'Filtro de aire y filtro de combustible',
          'Revisión de frenos (pastillas y discos)',
          'Alineación y balanceo',
          'Diagnóstico computarizado'
        ],
        FALSE,
        2
      ),
      (
        'Premium Carro',
        'car',
        'Cuidado total con atención prioritaria',
        79,
        ARRAY[
          'Todo lo del plan Integral',
          'Revisión de suspensión y amortiguadores',
          'Sistema eléctrico y batería',
          'Aire acondicionado',
          'Atención prioritaria y soporte 24/7'
        ],
        TRUE,
        3
      ),
      (
        'Moto 150',
        'motorcycle',
        'Para motos 150cc de uso urbano',
        12,
        ARRAY[
          'Cambio de aceite',
          'Ajuste y lubricación de cadena',
          'Revisión de frenos y desgaste de llantas',
          'Revisión de luces y cables'
        ],
        FALSE,
        4
      ),
      (
        'Moto 200–250',
        'motorcycle',
        'Para motos 200–250cc, listas para la ruta',
        24,
        ARRAY[
          'Todo lo del plan Moto 150',
          'Filtro de aire',
          'Ajuste de válvulas',
          'Revisión de carburación o inyección',
          'Engrase general'
        ],
        FALSE,
        5
      ),
      (
        'Moto 600',
        'motorcycle',
        'Para motos 600cc de alta cilindrada',
        49,
        ARRAY[
          'Todo lo del plan Moto 200–250',
          'Mantenimiento de inyección electrónica',
          'Líquido de frenos',
          'Revisión de suspensión y horquilla',
          'Diagnóstico completo'
        ],
        TRUE,
        6
      );
  END IF;
END;
$$;
