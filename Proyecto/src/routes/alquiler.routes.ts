import { Router } from 'express';
import { AlquilerController } from '../controllers/alquiler.controller';

export const alquilerRoutes = () => {
  const router = Router();
  const controller = new AlquilerController();

  // Create a new rental for a user
  router.post('/usuario/:codigo_unico', controller.createAlquiler);

  // Get all rentals
  router.get('/', controller.getAllAlquileres);

  // Get rental by ID
  router.get('/:id', controller.getAlquiler);

  // Get rentals by user código único
  router.get('/usuario/:codigo_unico', controller.getAlquilerByUsuario);

  // Finalize rental
  router.put('/:id/finalizar', controller.finalizarAlquiler);

  // Delete rental
  router.delete('/:id', controller.deleteAlquiler);

  return router;
};