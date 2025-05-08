import { Router } from 'express';
import { AportacionController } from '../controllers/aportacion.controller';

export const aportacionRoutes = () => {
  const router = Router();
  const controller = new AportacionController();

  router.post('/usuario/:codigo_unico', controller.createAportacion);
  
  router.get('/:id', controller.getAportacion);
  router.put('/:id', controller.updateAportacion);
  router.delete('/:id', controller.deleteAportacion);

  return router;
};