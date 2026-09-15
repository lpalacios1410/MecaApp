-- ============================================
-- MecaApp - Migracion sobre base de datos existente
-- Ejecutar una sola vez en el SQL Editor de Supabase.
-- No borra datos. Idempotente (usa IF EXISTS / OR REPLACE).
-- ============================================

-- 1. Nuevo rol 'admin'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'mechanic', 'admin'));

-- 2. updated_at con search_path seguro
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

-- 3. Helpers de autorizacion para policies (SECURITY DEFINER, evitan recursion)
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

-- 4. Proteccion de columnas sensibles de profiles
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

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation ON profiles;
CREATE TRIGGER prevent_profile_privilege_escalation
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_profile_privilege_escalation();

-- 5. Los registros nuevos siempre nacen como 'user'
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

-- 6. Placa unica por cliente (antes era global)
DO $$
BEGIN
  IF EXISTS (
    SELECT client_id, plate FROM vehicles
    GROUP BY client_id, plate HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Existen vehículos duplicados por (client_id, plate). Resuélvelos antes de continuar.';
  END IF;
END;
$$;

ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_plate_key;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_client_plate_key;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_client_plate_key UNIQUE (client_id, plate);

-- 7. Cascadas destructivas -> RESTRICT
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE RESTRICT;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_vehicle_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_vehicle_id_fkey
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_mechanic_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_mechanic_id_fkey
  FOREIGN KEY (mechanic_id) REFERENCES profiles(id) ON DELETE RESTRICT;

-- 8. Indice para el conteo de ordenes por plan
CREATE INDEX IF NOT EXISTS idx_orders_plan_id ON orders(plan_id);

-- 9. Policies de orders: borrado solo si esta pendiente
DROP POLICY IF EXISTS "Clients can delete own orders" ON orders;
DROP POLICY IF EXISTS "Clients can delete own pending orders" ON orders;
CREATE POLICY "Clients can delete own pending orders"
  ON orders FOR DELETE
  USING (auth.uid() = client_id AND status = 'pending');

-- 10. Policy de orders: el mecanico puede actualizar sus ordenes
DROP POLICY IF EXISTS "Mechanics can update own orders" ON orders;
CREATE POLICY "Mechanics can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = mechanic_id)
  WITH CHECK (auth.uid() = mechanic_id);

-- 11. Validacion de integridad al crear orden
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

DROP TRIGGER IF EXISTS validate_order ON orders;
CREATE TRIGGER validate_order
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order();

-- 12. Transiciones de estado validas + campos base inmutables
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

DROP TRIGGER IF EXISTS validate_order_status_transition ON orders;
CREATE TRIGGER validate_order_status_transition
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_status_transition();

-- 13. Plans: gestion solo para admins
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

-- 14. Impide borrar un plan con ordenes
CREATE OR REPLACE FUNCTION prevent_plan_delete_with_orders()
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

DROP TRIGGER IF EXISTS prevent_plan_delete_with_orders ON plans;
CREATE TRIGGER prevent_plan_delete_with_orders
  BEFORE DELETE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION prevent_plan_delete_with_orders();

-- 15. Staff (mechanic/admin) puede ver profiles y vehicles
DROP POLICY IF EXISTS "Mechanics can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (is_staff());

DROP POLICY IF EXISTS "Mechanics can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Staff can view all vehicles" ON vehicles;
CREATE POLICY "Staff can view all vehicles"
  ON vehicles FOR SELECT
  USING (is_staff());

-- 16. get_plan_order_counts pasa a ser solo admin
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

-- 17. Promociona un administrador existente (descomenta y ajusta el correo).
-- La allowlist del servidor (ADMIN_EMAILS) solo actua al registrarse; para una
-- cuenta ya creada, promocionala aqui una vez:
--
-- UPDATE profiles SET role = 'admin' WHERE lower(email) = lower('tu-correo@dominio.com');
--
-- (Este UPDATE funciona porque el SQL Editor corriendo como postgres no tiene
--  un JWT de request, así que auth.role() es NULL y la guardia no se activa.)
