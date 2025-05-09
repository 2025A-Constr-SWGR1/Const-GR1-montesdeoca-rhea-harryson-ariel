import { Router } from 'express';
import { AportacionController } from '../controllers/aportacion.controller';

export const aportacionRoutes = () => {
  const router = Router();
  const controller = new AportacionController();

  // Create a new contribution for a user
  router.post('/usuario/:codigo_unico', controller.createAportacion);

  // Get all contributions
  router.get('/', controller.getAllAportaciones);

  // Get contribution by ID
  router.get('/:id', controller.getAportacion);

  // Get contribution by user código único
  router.get('/usuario/:codigo_unico', controller.getAportacionByUsuario);

  // Update contribution
  router.put('/:id', controller.updateAportacion);

  // Delete contribution
  router.delete('/:id', controller.deleteAportacion);

  return router;
};