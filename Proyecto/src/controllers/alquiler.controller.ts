import { Request, Response } from 'express';
import { AlquilerService } from '../services/alquiler.service';

export class AlquilerController {
  private alquilerService: AlquilerService;

  constructor() {
    this.alquilerService = new AlquilerService();
  }

  createAlquiler = async (req: Request, res: Response): Promise<void> => {
    try {
      const alquiler = await this.alquilerService.createAlquiler(req.body);
      res.status(201).json(alquiler);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAlquiler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const alquiler = await this.alquilerService.getAlquiler(id);
      if (alquiler) {
        res.status(200).json(alquiler);
      } else {
        res.status(404).json({ message: 'Alquiler no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateAlquiler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const alquiler = await this.alquilerService.updateAlquiler(id, req.body);
      if (alquiler) {
        res.status(200).json(alquiler);
      } else {
        res.status(404).json({ message: 'Alquiler no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  deleteAlquiler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.alquilerService.deleteAlquiler(id);
      if (success) {
        res.status(204).send(); // No content
      } else {
        res.status(404).json({ message: 'Alquiler no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}