
-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('billar', 'ping_pong', 'air_hockey', 'videojuego')),
  identifier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create rental options table
CREATE TABLE public.rental_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL CHECK (game_type IN ('billar', 'ping_pong', 'air_hockey', 'videojuego')),
  duration_minutes INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create game rentals table
CREATE TABLE public.game_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  game_id UUID NOT NULL REFERENCES public.games(id),
  rental_option_id UUID NOT NULL REFERENCES public.rental_options(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  expected_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rentals ENABLE ROW LEVEL SECURITY;

-- RLS policies for games (public read access)
CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);

-- RLS policies for rental options (public read access)
CREATE POLICY "Anyone can view rental options" ON public.rental_options FOR SELECT USING (true);

-- RLS policies for game rentals
CREATE POLICY "Users can view their own rentals" ON public.game_rentals 
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create their own rentals" ON public.game_rentals 
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their own rentals" ON public.game_rentals 
  FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Insert the correct games
INSERT INTO public.games (name, type, identifier, status) VALUES
  ('Mesa de Billar #1', 'billar', 'BILLAR-001', 'available'),
  ('Mesa de Ping Pong #1', 'ping_pong', 'PING-001', 'available'),
  ('Mesa de Air Hockey #1', 'air_hockey', 'AIR-001', 'available'),
  ('PlayStation 3 #1', 'videojuego', 'PS3-001', 'available'),
  ('Xbox Series S #1', 'videojuego', 'XBOX-001', 'available');

-- Insert rental options with correct prices (sin plan base prices)
INSERT INTO public.rental_options (game_type, duration_minutes, price) VALUES
  -- Billar
  ('billar', 30, 1.25),
  ('billar', 60, 2.25),
  
  -- Ping Pong
  ('ping_pong', 20, 0.50),
  ('ping_pong', 60, 1.00),
  
  -- Air Hockey
  ('air_hockey', 15, 0.50),
  
  -- Videojuegos (PS3 y Xbox Series S)
  ('videojuego', 30, 1.00),
  ('videojuego', 60, 2.00);

-- Update existing subscription plans instead of deleting them
UPDATE public.subscription_plans 
SET 
  discounts = '[{"nombre": "billar", "descuento": 20}, {"nombre": "ping_pong", "descuento": 50}]'
WHERE name = 'AvoCloud';

UPDATE public.subscription_plans 
SET 
  discounts = '[{"nombre": "billar", "descuento": 20}, {"nombre": "ping_pong", "descuento": 50}, {"nombre": "air_hockey", "descuento": 100}]'
WHERE name = 'AvoTech';

UPDATE public.subscription_plans 
SET 
  discounts = '[{"nombre": "billar", "descuento": 20}, {"nombre": "ping_pong", "descuento": 50}, {"nombre": "air_hockey", "descuento": 100}, {"nombre": "videojuegos", "descuento": 50}]'
WHERE name = 'Avocoder';

-- Insert the "Sin plan de aportación" plan if it doesn't exist
INSERT INTO public.subscription_plans (name, price, precio_casillero, benefits, discounts) 
SELECT 'Sin plan de aportación', 0.00, 0.00, '{}', '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Sin plan de aportación');

-- Add triggers for updated_at
CREATE TRIGGER update_games_updated_at 
  BEFORE UPDATE ON public.games 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_game_rentals_updated_at 
  BEFORE UPDATE ON public.game_rentals 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
