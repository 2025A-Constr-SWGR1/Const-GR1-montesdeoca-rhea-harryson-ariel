import mongoose from 'mongoose';
import { Aportacion, AportacionModel, Plan } from '../models/aportacion';
import { AportacionService } from '../services/aportacion.service';

describe('AportacionService', () => {
  let aportacionService: AportacionService;

  beforeEach(async () => {
    await AportacionModel.deleteMany({});
    aportacionService = new AportacionService();
  });

  describe('createAportacion', () => {
    it('should create a new contribution successfully', async () => {
      const aportacionData = {
        nombre_plan: Plan.AvoCloud,
        periodo: '2025A',
        precio: 7.99,
        precio_Casillero: 4.50,
        gratisAlMes: {
          billar: { usado: false },
          pingPong: { usado: false }
        },
        descuentos: [
          { nombre: 'taza', descuento: 0.10 },
          { nombre: 'billar', descuento: 0.50 }
        ],
        usuario_id: 'user123'
      };

      const aportacion = await aportacionService.createAportacion(aportacionData);

      expect(aportacion).toBeDefined();
      expect(aportacion.nombre_plan).toBe(aportacionData.nombre_plan);
      expect(aportacion.usuario_id).toBe(aportacionData.usuario_id);
    });
  });

  describe('getAportacion', () => {
    it('should return contribution by id', async () => {
      const aportacionData = {
        nombre_plan: Plan.AvoCloud,
        periodo: '2025A',
        precio: 7.99,
        precio_Casillero: 4.50,
        gratisAlMes: {
          billar: { usado: false },
          pingPong: { usado: false }
        },
        descuentos: [
          { nombre: 'taza', descuento: 0.10 },
          { nombre: 'billar', descuento: 0.50 }
        ],
        usuario_id: 'user123'
      };

      const createdAportacion = await aportacionService.createAportacion(aportacionData) as Aportacion & { _id: mongoose.Types.ObjectId };
      const foundAportacion = await aportacionService.getAportacion(createdAportacion._id.toString()) as Aportacion & { _id: mongoose.Types.ObjectId };

      expect(foundAportacion).toBeDefined();
      expect(foundAportacion._id.toString()).toStrictEqual(createdAportacion._id.toString());
    });

    it('should return null for non-existent contribution id', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const foundAportacion = await aportacionService.getAportacion(nonExistentId.toString());
      expect(foundAportacion).toBeNull();
    });
  });

  describe('getAportacionByUsuario', () => {
    it('should return contribution by user id', async () => {
      const aportacionData = {
        nombre_plan: Plan.AvoCloud,
        periodo: '2025A',
        precio: 7.99,
        precio_Casillero: 4.50,
        gratisAlMes: {
          billar: { usado: false },
          pingPong: { usado: false }
        },
        descuentos: [
          { nombre: 'taza', descuento: 0.10 },
          { nombre: 'billar', descuento: 0.50 }
        ],
        usuario_id: 'user123'
      };

      await aportacionService.createAportacion(aportacionData);
      const foundAportacion = await aportacionService.getAportacionByUsuario('user123');

      expect(foundAportacion).toBeDefined();
      expect(foundAportacion?.usuario_id).toBe('user123');
    });

    it('should return null for non-existent user id', async () => {
      const foundAportacion = await aportacionService.getAportacionByUsuario('non_existent_user');
      expect(foundAportacion).toBeNull();
    });
  });

  describe('updateAportacion', () => {
    it('should update contribution successfully', async () => {
      const aportacionData = {
        nombre_plan: Plan.AvoCloud,
        periodo: '2025A',
        precio: 7.99,
        precio_Casillero: 4.50,
        gratisAlMes: {
          billar: { usado: false },
          pingPong: { usado: false }
        },
        descuentos: [
          { nombre: 'taza', descuento: 0.10 },
          { nombre: 'billar', descuento: 0.50 }
        ],
        usuario_id: 'user123'
      };

      const createdAportacion = await aportacionService.createAportacion(aportacionData) as Aportacion & { _id: mongoose.Types.ObjectId };
      const updatedAportacion = await aportacionService.updateAportacion(createdAportacion._id.toString(), {
        precio: 8.99
      });

      expect(updatedAportacion).toBeDefined();
      expect(updatedAportacion?.precio).toBe(8.99);
    });

    it('should return null when updating non-existent contribution', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updatedAportacion = await aportacionService.updateAportacion(nonExistentId.toString(), {
        precio: 8.99
      });
      expect(updatedAportacion).toBeNull();
    });
  });

  describe('deleteAportacion', () => {
    it('should delete contribution successfully', async () => {
      const aportacionData = {
        nombre_plan: Plan.AvoCloud,
        periodo: '2025A',
        precio: 7.99,
        precio_Casillero: 4.50,
        gratisAlMes: {
          billar: { usado: false },
          pingPong: { usado: false }
        },
        descuentos: [
          { nombre: 'taza', descuento: 0.10 },
          { nombre: 'billar', descuento: 0.50 }
        ],
        usuario_id: 'user123'
      };

      const createdAportacion = await aportacionService.createAportacion(aportacionData) as Aportacion & { _id: mongoose.Types.ObjectId };
      const deletedAportacion = await aportacionService.deleteAportacion(createdAportacion._id.toString()) as Aportacion & { _id: mongoose.Types.ObjectId };

      expect(deletedAportacion).toBeDefined();
      expect(deletedAportacion._id.toString()).toStrictEqual(createdAportacion._id.toString());

      const foundAportacion = await aportacionService.getAportacion(createdAportacion._id.toString());
      expect(foundAportacion).toBeNull();
    });

    it('should return null when deleting non-existent contribution', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const deletedAportacion = await aportacionService.deleteAportacion(nonExistentId.toString());
      expect(deletedAportacion).toBeNull();
    });
  });

  describe('getAllAportaciones', () => {
    it('should return all contributions', async () => {
      const aportacionesData = [
        {
          nombre_plan: Plan.AvoCloud,
          periodo: '2025A',
          precio: 7.99,
          precio_Casillero: 4.50,
          gratisAlMes: {
            billar: { usado: false },
            pingPong: { usado: false }
          },
          descuentos: [
            { nombre: 'taza', descuento: 0.10 },
            { nombre: 'billar', descuento: 0.50 }
          ],
          usuario_id: 'user123'
        },
        {
          nombre_plan: Plan.AvoTech,
          periodo: '2025A',
          precio: 14.99,
          precio_Casillero: 3.00,
          gratisAlMes: {
            billar: { usado: false },
            pingPong: { usado: false },
            hockey: { usado: false }
          },
          descuentos: [
            { nombre: 'ropa', descuento: 0.10 },
            { nombre: 'taza', descuento: 0.25 }
          ],
          usuario_id: 'user456'
        }
      ];

      await Promise.all(aportacionesData.map(data => aportacionService.createAportacion(data)));
      const aportaciones = await aportacionService.getAllAportaciones();

      expect(aportaciones).toHaveLength(2);
      // Ordenar por nombre_plan para asegurar un orden consistente
      const sortedAportaciones = aportaciones.sort((a, b) => a.nombre_plan.localeCompare(b.nombre_plan));
      expect(sortedAportaciones[0].nombre_plan).toBe(Plan.AvoCloud);
      expect(sortedAportaciones[1].nombre_plan).toBe(Plan.AvoTech);
    });

    it('should return empty array when no contributions exist', async () => {
      const aportaciones = await aportacionService.getAllAportaciones();
      expect(aportaciones).toHaveLength(0);
    });
  });
}); 