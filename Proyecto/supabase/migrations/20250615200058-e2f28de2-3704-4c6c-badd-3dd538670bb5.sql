
-- Habilitar réplica completa para capturar todos los cambios en tiempo real
ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER TABLE public.game_rentals REPLICA IDENTITY FULL;

-- Agregar las tablas a la publicación de tiempo real de Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rentals;
