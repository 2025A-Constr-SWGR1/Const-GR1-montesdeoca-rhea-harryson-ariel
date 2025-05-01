import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuario.service';
import { deterministicHash } from '../utils/idEncoder';

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor() {
    this.usuarioService = new UsuarioService();
  }

  postUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuario = await this.usuarioService.createUser(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  // ✅ Busca por codigo_unico → genera el hash → busca en BD
  getUserByCodigoUnico = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const usuario = await this.usuarioService.getUserByCodigoUnico(id);
      console.log("id",id)

      if (usuario) {
        res.status(200).json(usuario);
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const hashedId = deterministicHash(id); // Asegúrate de importarlo
      const usuario = await this.usuarioService.updateUser(hashedId, req.body);
      if (usuario) {
        res.status(200).json(usuario);
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const hashedId = deterministicHash(id); 
      const success = await this.usuarioService.deleteUser(hashedId);
      if (!success) {
        res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Usuario eliminado correctamente'});
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}