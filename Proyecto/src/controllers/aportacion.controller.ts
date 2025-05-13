import { Request, Response } from 'express';
import { Plan } from '../models/aportacion';
import { AportacionService } from '../services/aportacion.service';
import { UsuarioService } from '../services/usuario.service';
import { deterministicHash } from '../utils/idEncoder';

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
      const { plan, periodo } = req.body;

      // Validación básica
      if (!plan || !periodo) {
        res.status(400).json({ error: 'Los campos plan y periodo son obligatorios' });
        return;
      }

      // Validar plan
      if (!Object.values(Plan).includes(plan)) {
        res.status(400).json({ error: 'Plan no válido' });
        return;
      }

      // Buscar usuario por su codigo_unico
      const usuario = await this.usuarioService.getUsuarioByCodigoUnico(codigo_unico);
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const aportacion = await this.aportacionService.createAportacion(
        usuario._id,
        plan,
        periodo
      );

      res.status(201).json(aportacion);
    } catch (error) {
      if ((error as Error).message.includes('ya tiene una aportación activa')) {
        res.status(409).json({ error: (error as Error).message });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  };

  getAportacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const hashedId = deterministicHash(id);
      const aportacion = await this.aportacionService.getAportacion(hashedId);
      
      if (!aportacion) {
        res.status(404).json({ error: 'Aportación no encontrada' });
        return;
      }

      res.status(200).json(aportacion);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAportacionByUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigo_unico } = req.params;
      const aportacion = await this.aportacionService.getAportacionByCodigoUnico(codigo_unico);
      
      if (!aportacion) {
        res.status(404).json({ error: 'No se encontró aportación para este usuario' });
        return;
      }

      res.status(200).json(aportacion);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateAportacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const hashedId = deterministicHash(id);

      const aportacion = await this.aportacionService.updateAportacion(hashedId, updateData);
      
      if (!aportacion) {
        res.status(404).json({ error: 'Aportación no encontrada' });
        return;
      }

      res.status(200).json(aportacion);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  deleteAportacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const hashedId = deterministicHash(id);
      const aportacion = await this.aportacionService.deleteAportacion(hashedId);
      
      if (!aportacion) {
        res.status(404).json({ error: 'Aportación no encontrada' });
        return;
      }

      res.status(200).json({ message: 'Aportación eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAllAportaciones = async (req: Request, res: Response): Promise<void> => {
    try {
      const aportaciones = await this.aportacionService.getAllAportaciones();
      res.status(200).json(aportaciones);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}