-- ============================================
-- MecaApp - Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Tabla profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'mechanic')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla vehicles
-- (Estructura real de la base de datos: client_id, notes, sin updated_at)
-- Relación: un perfil (cliente) puede tener N vehículos (carros/motos);
-- cada vehículo pertenece a un solo cliente (FK client_id) y una placa es
-- única (UNIQUE(plate)), por lo que profiles no necesita campos extra.
-- vehicle_type: NULL = sin clasificar, 'car' = carro, 'motorcycle' = moto
CREATE TABLE vehicles (
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
  UNIQUE(plate)
);

-- 3. Funcion para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Funcion para crear profile automaticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger que ejecuta handle_new_user al crear usuario en auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 7. Habilitar RLS en ambas tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- 8. Policies para profiles
-- Usuarios pueden ver su propio profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuarios pueden actualizar su propio profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Usuarios pueden insertar su propio profile (backup del trigger)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 9. Policies para vehicles
-- Usuarios pueden ver sus propios vehiculos
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = client_id);

-- Usuarios pueden insertar sus propios vehiculos
CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Usuarios pueden actualizar sus propios vehiculos
CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = client_id);

-- Usuarios pueden eliminar sus propios vehiculos
CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = client_id);

-- 10. Index para busquedas frecuentes
CREATE INDEX idx_vehicles_client_id ON vehicles(client_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- 11. Policies para mecanicos (solo lectura)
-- Mecanicos pueden ver todos los profiles
CREATE POLICY "Mechanics can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'mechanic'
    )
  );

-- Mecanicos pueden ver todos los vehiculos
CREATE POLICY "Mechanics can view all vehicles"
  ON vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'mechanic'
    )
  );

-- 12. Tabla orders (solicitudes de servicio)
-- Relacion: un cliente crea N ordenes; cada orden es para un vehiculo y un mecanico.
-- plan_id/plan_name/plan_price_usd son un snapshot del plan estatico definido en codigo (lib/plans-data.ts).
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  mechanic_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price_usd NUMERIC NOT NULL DEFAULT 0,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'motorcycle')),
  client_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_mechanic_id ON orders(mechanic_id);

-- 13. RLS y policies para orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Mechanics can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = mechanic_id);

-- 14. Policy para que los clientes puedan listar los mecanicos (selector de "Solicitar Servicio")
CREATE POLICY "Users can view mechanics"
  ON profiles FOR SELECT
  USING (role = 'mechanic');
