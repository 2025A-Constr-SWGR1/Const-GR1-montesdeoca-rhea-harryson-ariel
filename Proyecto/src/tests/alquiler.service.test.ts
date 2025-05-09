import mongoose from 'mongoose';
import { Alquiler, AlquilerModel } from '../models/alquiler';
import { AlquilerService } from '../services/alquiler.service';

describe('AlquilerService', () => {
  let alquilerService: AlquilerService;

  beforeEach(async () => {
    await AlquilerModel.deleteMany({});
    alquilerService = new AlquilerService();
  });

  describe('createAlquiler', () => {
    it('should create a new rental successfully', async () => {
      const alquilerData = {
        usuario_id: 'user123',
        juego: {
          nombre: 'PlayStation 5',
          tipo: 'consola'
        },
        estado: 'activo' as const,
        precio: 5.00,
        duracion_horas: 2
      };

      const alquiler = await alquilerService.createAlquiler(alquilerData);

      expect(alquiler).toBeDefined();
      expect(alquiler.juego.nombre).toBe(alquilerData.juego.nombre);
      expect(alquiler.usuario_id).toBe(alquilerData.usuario_id);
    });
  });

  describe('getAlquiler', () => {
    it('should return rental by id', async () => {
      const alquilerData = {
        usuario_id: 'user123',
        juego: {
          nombre: 'PlayStation 5',
          tipo: 'consola'
        },
        estado: 'activo' as const,
        precio: 5.00,
        duracion_horas: 2
      };

      const createdAlquiler = await alquilerService.createAlquiler(alquilerData) as Alquiler & { _id: mongoose.Types.ObjectId };
      const foundAlquiler = await alquilerService.getAlquiler(createdAlquiler._id.toString()) as Alquiler & { _id: mongoose.Types.ObjectId };

      expect(foundAlquiler).toBeDefined();
      expect(foundAlquiler._id.toString()).toStrictEqual(createdAlquiler._id.toString());
    });

    it('should return null for non-existent rental id', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const foundAlquiler = await alquilerService.getAlquiler(nonExistentId.toString());
      expect(foundAlquiler).toBeNull();
    });
  });

  describe('getAlquilerActivoByUsuario', () => {
    it('should return active rental by user id', async () => {
      const alquilerData = {
        usuario_id: 'user123',
        juego: {
          nombre: 'PlayStation 5',
          tipo: 'consola'
        },
        estado: 'activo' as const,
        precio: 5.00,
        duracion_horas: 2
      };

      await alquilerService.createAlquiler(alquilerData);
      const foundAlquiler = await alquilerService.getAlquilerActivoByUsuario('user123');

      expect(foundAlquiler).toBeDefined();
      expect(foundAlquiler?.usuario_id).toBe('user123');
      expect(foundAlquiler?.estado).toBe('activo');
    });

    it('should return null for non-existent user id', async () => {
      const foundAlquiler = await alquilerService.getAlquilerActivoByUsuario('non_existent_user');
      expect(foundAlquiler).toBeNull();
    });
  });

  describe('getAlquileresByUsuario', () => {
    it('should return all rentals by user id', async () => {
      const alquileresData = [
        {
          usuario_id: 'user123',
          juego: {
            nombre: 'PlayStation 5',
            tipo: 'consola'
          },
          estado: 'activo' as const,
          precio: 5.00,
          duracion_horas: 2
        },
        {
          usuario_id: 'user123',
          juego: {
            nombre: 'Xbox Series X',
            tipo: 'consola'
          },
          estado: 'finalizado' as const,
          precio: 4.50,
          duracion_horas: 3
        }
      ];

      await Promise.all(alquileresData.map(data => alquilerService.createAlquiler(data)));
      const alquileres = await alquilerService.getAlquileresByUsuario('user123');

      expect(alquileres).toHaveLength(2);
      // Ordenar por nombre del juego para asegurar un orden consistente
      const sortedAlquileres = alquileres.sort((a, b) => a.juego.nombre.localeCompare(b.juego.nombre));
      expect(sortedAlquileres[0].juego.nombre).toBe('PlayStation 5');
      expect(sortedAlquileres[1].juego.nombre).toBe('Xbox Series X');
    });

    it('should return empty array for non-existent user id', async () => {
      const alquileres = await alquilerService.getAlquileresByUsuario('non_existent_user');
      expect(alquileres).toHaveLength(0);
    });
  });

  describe('finalizarAlquiler', () => {
    it('should finalize rental successfully', async () => {
      const alquilerData = {
        usuario_id: 'user123',
        juego: {
          nombre: 'PlayStation 5',
          tipo: 'consola'
        },
        estado: 'activo' as const,
        precio: 5.00,
        duracion_horas: 2
      };

      const createdAlquiler = await alquilerService.createAlquiler(alquilerData) as Alquiler & { _id: mongoose.Types.ObjectId };
      const finalizedAlquiler = await alquilerService.finalizarAlquiler(createdAlquiler._id.toString());

      expect(finalizedAlquiler).toBeDefined();
      expect(finalizedAlquiler?.estado).toBe('finalizado');
    });

    it('should return null when finalizing non-existent rental', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const finalizedAlquiler = await alquilerService.finalizarAlquiler(nonExistentId.toString());
      expect(finalizedAlquiler).toBeNull();
    });
  });

  describe('deleteAlquiler', () => {
    it('should delete rental successfully', async () => {
      const alquilerData = {
        usuario_id: 'user123',
        juego: {
          nombre: 'PlayStation 5',
          tipo: 'consola'
        },
        estado: 'activo' as const,
        precio: 5.00,
        duracion_horas: 2
      };

      const createdAlquiler = await alquilerService.createAlquiler(alquilerData) as Alquiler & { _id: mongoose.Types.ObjectId };
      const deletedAlquiler = await alquilerService.deleteAlquiler(createdAlquiler._id.toString()) as Alquiler & { _id: mongoose.Types.ObjectId };

      expect(deletedAlquiler).toBeDefined();
      expect(deletedAlquiler._id.toString()).toStrictEqual(createdAlquiler._id.toString());

      const foundAlquiler = await alquilerService.getAlquiler(createdAlquiler._id.toString());
      expect(foundAlquiler).toBeNull();
    });

    it('should return null when deleting non-existent rental', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const deletedAlquiler = await alquilerService.deleteAlquiler(nonExistentId.toString());
      expect(deletedAlquiler).toBeNull();
    });
  });

  describe('getAllAlquileres', () => {
    it('should return all rentals', async () => {
      const alquileresData = [
        {
          usuario_id: 'user123',
          juego: {
            nombre: 'PlayStation 5',
            tipo: 'consola'
          },
          estado: 'activo' as const,
          precio: 5.00,
          duracion_horas: 2
        },
        {
          usuario_id: 'user456',
          juego: {
            nombre: 'Xbox Series X',
            tipo: 'consola'
          },
          estado: 'finalizado' as const,
          precio: 4.50,
          duracion_horas: 3
        }
      ];

      await Promise.all(alquileresData.map(data => alquilerService.createAlquiler(data)));
      const alquileres = await alquilerService.getAllAlquileres();

      expect(alquileres).toHaveLength(2);
      // Ordenar por nombre del juego para asegurar un orden consistente
      const sortedAlquileres = alquileres.sort((a, b) => a.juego.nombre.localeCompare(b.juego.nombre));
      expect(sortedAlquileres[0].juego.nombre).toBe('PlayStation 5');
      expect(sortedAlquileres[1].juego.nombre).toBe('Xbox Series X');
    });

    it('should return empty array when no rentals exist', async () => {
      const alquileres = await alquilerService.getAllAlquileres();
      expect(alquileres).toHaveLength(0);
    });
  });
}); 