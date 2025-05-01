import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';

export const usuarioRoutes = () => {
  const router = Router();
  const controller = new UsuarioController();

  router.post('/', controller.postUser);
  router.get('/:id', controller.getUserByCodigoUnico);
  router.put('/:id', controller.updateUser);
  router.delete('/:id', controller.deleteUser);

  return router;
};