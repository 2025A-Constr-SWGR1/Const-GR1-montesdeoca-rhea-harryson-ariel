import { Request, Response } from 'express';
import { AportacionService } from '../services/aportacion.service';
import { UsuarioService } from '../services/usuario.service'; // Asegúrate de importar el servicio correcto
export class AportacionController {
  private aportacionService: AportacionService;
  private usuarioService: UsuarioService;

  constructor() {

    this.aportacionService = new AportacionService();
    this.usuarioService = new UsuarioService();
  }

  createAportacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigo_unico } = req.params;
  
      if (!codigo_unico) {
        res.status(400).json({ error: 'El campo codigo_unico es obligatorio' });
        return;
      }
  
      // Buscar usuario por su codigo_unico
      const usuario = await this.usuarioService.getUserByCodigoUnico(codigo_unico);
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
  
      // Asignar el usuario_id real (el _id hasheado)
      const aportacionData = {
        ...req.body,
        usuario_id: usuario._id // 👈 Usamos el ID hasheado del usuario
      };
  
      const aportacion = await this.aportacionService.createAportacion(aportacionData);
      res.status(201).json(aportacion);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAportacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const aportacion = await this.aportacionService.getAportacion(id);
      if (aportacion) {
        res.status(200).json(aportacion);
      } else {
        res.status(404).json({ message: 'Aportación no encontrada' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateAportacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const aportacion = await this.aportacionService.updateAportacion(id, req.body);
      if (aportacion) {
        res.status(200).json(aportacion);
      } else {
        res.status(404).json({ message: 'Aportación no encontrada' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  deleteAportacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.aportacionService.deleteAportacion(id);
      if (success) {
        res.status(204).send(); // No content
      } else {
        res.status(404).json({ message: 'Aportación no encontrada' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}