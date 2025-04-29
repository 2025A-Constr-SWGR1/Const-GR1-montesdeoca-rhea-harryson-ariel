import express, { Router} from 'express';
import { UsuarioController } from '../controllers/usuario.controller';

const router: Router = express.Router();
const usuarioController = new UsuarioController();

router.post('/', usuarioController.postUser)

router.get('/:id', usuarioController.getUser)

router.put('/:id', usuarioController.updateUser)

router.delete('/:id', usuarioController.deleteUser)

export default router;