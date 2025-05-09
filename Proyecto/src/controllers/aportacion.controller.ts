import { Request, Response } from 'express';
import { Plan } from '../models/aportacion';
import { AportacionService } from '../services/aportacion.service';
import { UsuarioService } from '../services/usuario.service';

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
      const { nombre_plan, periodo, precio, precio_Casillero, gratisAlMes, descuentos } = req.body;

      // Validación básica
      if (!nombre_plan || !periodo || !precio) {
        res.status(400).json({ error: 'Los campos nombre_plan, periodo y precio son obligatorios' });
        return;
      }

      // Validar plan
      if (!Object.values(Plan).includes(nombre_plan)) {
        res.status(400).json({ error: 'Plan no válido' });
        return;
      }

      // Buscar usuario por su codigo_unico
      const usuario = await this.usuarioService.getUsuarioByCodigoUnico(codigo_unico);
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Verificar si el usuario ya tiene una aportación activa
      const aportacionExistente = await this.aportacionService.getAportacionByUsuario(usuario._id);
      if (aportacionExistente) {
        res.status(409).json({ error: 'El usuario ya tiene una aportación activa' });
        return;
      }

      const aportacionData = {
        nombre_plan,
        periodo,
        precio,
        precio_Casillero,
        gratisAlMes,
        descuentos,
        usuario_id: usuario._id
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
      const usuario = await this.usuarioService.getUsuarioByCodigoUnico(codigo_unico);
      
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const aportacion = await this.aportacionService.getAportacionByUsuario(usuario._id);
      
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

      // No permitir actualizar campos sensibles
      delete updateData._id;
      delete updateData.usuario_id;

      const aportacion = await this.aportacionService.updateAportacion(id, updateData);
      
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
      const aportacion = await this.aportacionService.deleteAportacion(id);
      
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