import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';

export const usuarioRoutes = () => {
  const router = Router();
  const controller = new UsuarioController();

  // Create a new user
  router.post('/', controller.createUsuario);

  // Get all users
  router.get('/', controller.getAllUsuarios);

  // Get user by ID
  router.get('/:id', controller.getUsuario);

  // Get user by código único
  router.get('/codigo/:codigo_unico', controller.getUsuarioByCodigoUnico);

  // Update user
  router.put('/:id', controller.updateUsuario);

  // Delete user
  router.delete('/:id', controller.deleteUsuario);

  return router;
};