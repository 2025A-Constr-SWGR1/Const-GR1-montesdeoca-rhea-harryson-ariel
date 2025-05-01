import { Request, Response } from 'express';
import { AportacionService } from '../services/aportacion.service';

export class AportacionController {
  private aportacionService: AportacionService;

  constructor() {
    this.aportacionService = new AportacionService();
  }

  createAportacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const aportacion = await this.aportacionService.createAportacion(req.body);
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