import { Router } from 'express';
import { AportacionController } from '../controllers/aportacion.controller';

export const aportacionRoutes = () => {
  const router = Router();
  const controller = new AportacionController();

  // Rutas principales
  router.get('/', controller.getAllAportaciones);

  // Rutas por usuario
  router.post('/usuario/:codigo_unico', controller.createAportacion);
  router.get('/usuario/:codigo_unico', controller.getAportacionByUsuario);

  // Rutas por ID hasheado (periodo + codigo_unico)
  router.get('/id/:id', controller.getAportacion);
  router.put('/id/:id', controller.updateAportacion);
  router.delete('/id/:id', controller.deleteAportacion);

  return router;
};