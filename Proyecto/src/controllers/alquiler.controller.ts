import { Request, Response } from 'express';
import { AlquilerService } from '../services/alquiler.service';
import { UsuarioService } from '../services/usuario.service';

export class AlquilerController {
  private alquilerService: AlquilerService;
  private usuarioService: UsuarioService;

  constructor() {
    this.alquilerService = new AlquilerService();
    this.usuarioService = new UsuarioService();
  }

  createAlquiler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigo_unico } = req.params;
      const { juego, precio, duracion_horas } = req.body;

      // Validación básica
      if (!juego || !juego.nombre || !juego.tipo || !precio || !duracion_horas) {
        res.status(400).json({ error: 'Todos los campos son obligatorios' });
        return;
      }

      // Buscar usuario por su codigo_unico
      const usuario = await this.usuarioService.getUsuarioByCodigoUnico(codigo_unico);
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Verificar si el usuario tiene un alquiler activo
      const alquilerActivo = await this.alquilerService.getAlquilerActivoByUsuario(usuario._id);
      if (alquilerActivo) {
        res.status(409).json({ error: 'El usuario ya tiene un alquiler activo' });
        return;
      }

      const alquilerData = {
        usuario_id: usuario._id,
        juego,
        estado: 'activo',
        precio,
        duracion_horas
      };

      const alquiler = await this.alquilerService.createAlquiler(alquilerData);
      res.status(201).json(alquiler);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAlquiler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const alquiler = await this.alquilerService.getAlquiler(id);
      
      if (!alquiler) {
        res.status(404).json({ error: 'Alquiler no encontrado' });
        return;
      }

      res.status(200).json(alquiler);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAlquilerByUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigo_unico } = req.params;
      const usuario = await this.usuarioService.getUsuarioByCodigoUnico(codigo_unico);
      
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const alquileres = await this.alquilerService.getAlquileresByUsuario(usuario._id);
      res.status(200).json(alquileres);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  finalizarAlquiler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const alquiler = await this.alquilerService.finalizarAlquiler(id);
      
      if (!alquiler) {
        res.status(404).json({ error: 'Alquiler no encontrado' });
        return;
      }

      res.status(200).json(alquiler);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  deleteAlquiler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const alquiler = await this.alquilerService.deleteAlquiler(id);
      
      if (!alquiler) {
        res.status(404).json({ error: 'Alquiler no encontrado' });
        return;
      }

      res.status(200).json({ message: 'Alquiler eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAllAlquileres = async (req: Request, res: Response): Promise<void> => {
    try {
      const alquileres = await this.alquilerService.getAllAlquileres();
      res.status(200).json(alquileres);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}