
-- Add new columns to users table for the expanded registration
ALTER TABLE public.users ADD COLUMN cedula TEXT;
ALTER TABLE public.users ADD COLUMN apellido TEXT;
ALTER TABLE public.users ADD COLUMN codigo_unico TEXT;
ALTER TABLE public.users ADD COLUMN celular TEXT;
ALTER TABLE public.users ADD COLUMN facultad TEXT;
ALTER TABLE public.users ADD COLUMN es_aportante BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN tipo_aportacion TEXT;

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  precio_casillero DECIMAL(10,2) NOT NULL,
  benefits JSONB NOT NULL,
  discounts JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  gratis_al_mes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans (readable by all authenticated users)
CREATE POLICY "Plans are viewable by authenticated users" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid()::text = (SELECT auth_id::text FROM public.users WHERE id = user_id));

CREATE POLICY "Users can insert their own subscriptions" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = (SELECT auth_id::text FROM public.users WHERE id = user_id));

CREATE POLICY "Users can update their own subscriptions" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (auth.uid()::text = (SELECT auth_id::text FROM public.users WHERE id = user_id));

-- Insert the default subscription plans
INSERT INTO public.subscription_plans (name, price, precio_casillero, benefits, discounts) VALUES 
('AvoCloud', 7.99, 4.50, 
 '{"billar": {"disponible": true}, "pingPong": {"disponible": true}}',
 '[{"nombre": "taza", "descuento": 0.10}, {"nombre": "billar", "descuento": 0.50}, {"nombre": "pingPong", "descuento": 0.20}, {"nombre": "eventos", "descuento": 0}]'),
('AvoTech', 14.99, 3.00,
 '{"billar": {"disponible": true}, "pingPong": {"disponible": true}, "hockey": {"disponible": true}}',
 '[{"nombre": "ropa", "descuento": 0.10}, {"nombre": "taza", "descuento": 0.25}, {"nombre": "billar", "descuento": 0.50}, {"nombre": "pingPong", "descuento": 0.20}, {"nombre": "hockey", "descuento": 0.25}, {"nombre": "eventos", "descuento": 0}]'),
('Avocoder', 19.99, 0.00,
 '{"billar": {"disponible": true}, "pingPong": {"disponible": true}, "hockey": {"disponible": true}, "consolas": {"disponible": true}}',
 '[{"nombre": "ropa", "descuento": 0.25}, {"nombre": "taza", "descuento": 1.00}, {"nombre": "billar", "descuento": 0.50}, {"nombre": "pingPong", "descuento": 0.20}, {"nombre": "hockey", "descuento": 0.25}, {"nombre": "consolas", "descuento": 0.50}, {"nombre": "eventos", "descuento": 0}]');

-- Add trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON public.subscription_plans 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON public.user_subscriptions 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
