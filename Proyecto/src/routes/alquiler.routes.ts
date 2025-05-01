import { Router } from 'express';
import { AlquilerController } from '../controllers/alquiler.controller';

export const alquilerRoutes = () => {
  const router = Router();
  const controller = new AlquilerController();

  router.post('/', controller.createAlquiler);
  router.get('/:id', controller.getAlquiler);
  router.put('/:id', controller.updateAlquiler);
  router.delete('/:id', controller.deleteAlquiler);

  return router;
};