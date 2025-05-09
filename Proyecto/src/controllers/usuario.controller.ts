import { Request, Response } from 'express';
import { Facultad } from '../models/usuario';
import { UsuarioService } from '../services/usuario.service';

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor() {
    this.usuarioService = new UsuarioService();
  }

  createUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, apellido, cedula, correo, celular, clave, codigo_unico, facultad, esAportante } = req.body;

      // Validación básica
      if (!nombre || !apellido || !cedula || !correo || !celular || !clave || !codigo_unico || !facultad) {
        res.status(400).json({ error: 'Todos los campos son obligatorios' });
        return;
      }

      // Validar facultad
      if (!Object.values(Facultad).includes(facultad)) {
        res.status(400).json({ error: 'Facultad no válida' });
        return;
      }

      const usuario = await this.usuarioService.createUsuario({
        nombre,
        apellido,
        cedula,
        correo,
        celular,
        clave,
        codigo_unico,
        facultad,
        esAportante: esAportante || false
      });

      res.status(201).json(usuario);
    } catch (error) {
      if ((error as Error).message.includes('duplicate key')) {
        res.status(409).json({ error: 'Ya existe un usuario con ese código único o cédula' });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  };

  getUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const usuario = await this.usuarioService.getUsuario(id);
      
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getUsuarioByCodigoUnico = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigo_unico } = req.params;
      const usuario = await this.usuarioService.getUsuarioByCodigoUnico(codigo_unico);
      
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // No permitir actualizar campos sensibles
      delete updateData._id;
      delete updateData.codigo_unico;
      delete updateData.cedula;

      const usuario = await this.usuarioService.updateUsuario(id, updateData);
      
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  deleteUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const usuario = await this.usuarioService.deleteUsuario(id);
      
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAllUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = await this.usuarioService.getAllUsuarios();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}