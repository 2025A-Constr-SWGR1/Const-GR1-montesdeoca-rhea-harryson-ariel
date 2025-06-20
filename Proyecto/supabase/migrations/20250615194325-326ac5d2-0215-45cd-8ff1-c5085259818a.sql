
-- Agregar los juegos faltantes
INSERT INTO public.games (name, type, identifier, status) VALUES
  ('Mesa de Billar #2', 'billar', 'BILLAR-002', 'available'),
  ('Mesa de Air Hockey #2', 'air_hockey', 'AIR-002', 'available');

-- Crear una función para actualizar automáticamente el estado de los juegos
CREATE OR REPLACE FUNCTION update_game_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Marcar juegos como 'rented' si tienen alquileres activos
  UPDATE public.games 
  SET status = 'rented'
  WHERE id IN (
    SELECT DISTINCT game_id 
    FROM public.game_rentals 
    WHERE status = 'active' 
    AND now() < expected_end_time
  );
  
  -- Marcar juegos como 'available' si no tienen alquileres activos o han expirado
  UPDATE public.games 
  SET status = 'available'
  WHERE id NOT IN (
    SELECT DISTINCT game_id 
    FROM public.game_rentals 
    WHERE status = 'active' 
    AND now() < expected_end_time
  ) AND status != 'maintenance';
END;
$$;

-- Crear un trigger para actualizar el estado cuando se crea un alquiler
CREATE OR REPLACE FUNCTION trigger_update_game_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM update_game_status();
  RETURN NULL;
END;
$$;

-- Aplicar el trigger en inserts y updates de game_rentals
DROP TRIGGER IF EXISTS after_game_rental_change ON public.game_rentals;
CREATE TRIGGER after_game_rental_change
  AFTER INSERT OR UPDATE ON public.game_rentals
  FOR EACH ROW EXECUTE FUNCTION trigger_update_game_status();
