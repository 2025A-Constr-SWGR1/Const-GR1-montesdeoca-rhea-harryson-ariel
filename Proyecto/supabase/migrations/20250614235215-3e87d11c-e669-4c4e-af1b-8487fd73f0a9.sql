
-- Crear tabla de usuarios/clientes
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de consolas
CREATE TABLE public.consoles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- ej: "PlayStation 5", "Xbox Series X", "Nintendo Switch"
  model TEXT, -- ej: "Standard", "Digital Edition"
  serial_number TEXT UNIQUE,
  daily_rate DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'damaged')),
  condition TEXT NOT NULL DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  purchase_date DATE,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de alquileres de consolas
CREATE TABLE public.rentals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  console_id UUID REFERENCES public.consoles(id) NOT NULL,
  rental_date DATE NOT NULL DEFAULT CURRENT_DATE,
  return_date DATE,
  expected_return_date DATE NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2),
  deposit_amount DECIMAL(10,2), -- depósito de garantía
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Anyone can create user profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Políticas para consolas (públicas para lectura)
CREATE POLICY "Anyone can view consoles" ON public.consoles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage consoles" ON public.consoles
  FOR ALL USING (false); -- Solo administradores

-- Políticas para alquileres
CREATE POLICY "Users can view their own rentals" ON public.rentals
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create their own rentals" ON public.rentals
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consoles_updated_at BEFORE UPDATE ON public.consoles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON public.rentals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar consolas de ejemplo
INSERT INTO public.consoles (name, model, serial_number, daily_rate, status, condition) VALUES
('PlayStation 5', 'Standard Edition', 'PS5-001', 15.00, 'available', 'excellent'),
('PlayStation 5', 'Digital Edition', 'PS5-002', 12.00, 'available', 'good'),
('Xbox Series X', 'Standard', 'XSX-001', 14.00, 'available', 'excellent'),
('Xbox Series S', 'Standard', 'XSS-001', 10.00, 'rented', 'good'),
('Nintendo Switch', 'OLED Model', 'NSW-001', 8.00, 'available', 'excellent'),
('Nintendo Switch', 'Standard', 'NSW-002', 7.00, 'available', 'good');
