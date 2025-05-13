import { Aportacion, AportacionModel, Plan } from '../models/aportacion';
import { Facultad, Usuario, UsuarioModel } from '../models/usuario';
import { AportacionService } from '../services/aportacion.service';

// Mock the deterministicHash function
jest.mock('../utils/idEncoder', () => ({
  deterministicHash: jest.fn((input: string) => `hashed_${input}`)
}));

describe('AportacionService', () => {
  let aportacionService: AportacionService;

  beforeEach(async () => {
    await AportacionModel.deleteMany({});
    await UsuarioModel.deleteMany({});
    aportacionService = new AportacionService();
  });

  afterEach(async () => {
    // Additional cleanup after each test
    await AportacionModel.deleteMany({});
    await UsuarioModel.deleteMany({});
  });

  const createTestUser = async (suffix: string): Promise<Usuario> => {
    const usuarioData = {
      nombre: 'Test',
      apellido: 'User',
      cedula: `1234567890${suffix}`,
      correo: `test.${suffix}@example.com`,
      celular: '1234567890',
      clave: 'password123',
      codigo_unico: `COD${suffix}`,
      facultad: Facultad.FIS,
      esAportante: true
    };

    const usuario = await UsuarioModel.create({
      _id: `hashed_${usuarioData.codigo_unico}`,
      ...usuarioData
    });

    return usuario;
  };

  describe('createAportacion', () => {
    it('should create a new contribution successfully', async () => {
      const usuario = await createTestUser('123');
      const periodo = '2025A';
      const plan = Plan.AvoCloud;

      const aportacion = await aportacionService.createAportacion(usuario._id.toString(), plan, periodo) as Aportacion & { _id: string };

      expect(aportacion).toBeDefined();
      expect(aportacion._id).toBe(`hashed_${periodo}${usuario.codigo_unico}`);
      expect(aportacion.nombre_plan).toBe(plan);
      expect(aportacion.periodo).toBe(periodo);
      expect(aportacion.usuario_id).toBe(usuario._id);
    });

    it('should throw error when user already has an active contribution', async () => {
      const usuario = await createTestUser('123');
      const periodo = '2025A';
      const plan = Plan.AvoCloud;

      await aportacionService.createAportacion(usuario._id.toString(), plan, periodo);

      await expect(aportacionService.createAportacion(usuario._id.toString(), plan, periodo))
        .rejects
        .toThrow('El usuario ya tiene una aportación activa');
    });
  });

  describe('getAportacion', () => {
    it('should return contribution by id', async () => {
      const usuario = await createTestUser('123');
      const periodo = '2025A';
      const plan = Plan.AvoCloud;

      const createdAportacion = await aportacionService.createAportacion(usuario._id.toString(), plan, periodo) as Aportacion & { _id: string };
      const foundAportacion = await aportacionService.getAportacion(createdAportacion._id) as Aportacion & { _id: string };

      expect(foundAportacion).toBeDefined();
      expect(foundAportacion._id).toBe(createdAportacion._id);
    });

    it('should return null for non-existent contribution id', async () => {
      const foundAportacion = await aportacionService.getAportacion('non_existent_id');
      expect(foundAportacion).toBeNull();
    });
  });

  describe('getAportacionByUsuario', () => {
    it('should return contribution by user id', async () => {
      const usuario = await createTestUser('123');
      const periodo = '2025A';
      const plan = Plan.AvoCloud;

      await aportacionService.createAportacion(usuario._id.toString(), plan, periodo);
      const foundAportacion = await aportacionService.getAportacionByUsuario(usuario._id.toString()) as Aportacion & { _id: string };

      expect(foundAportacion).toBeDefined();
      expect(foundAportacion.usuario_id).toBe(usuario._id);
    });

    it('should return null for non-existent user id', async () => {
      const foundAportacion = await aportacionService.getAportacionByUsuario('non_existent_user');
      expect(foundAportacion).toBeNull();
    });
  });

  describe('updateAportacion', () => {
    it('should update contribution successfully', async () => {
      const usuario = await createTestUser('123');
      const periodo = '2025A';
      const plan = Plan.AvoCloud;

      const createdAportacion = await aportacionService.createAportacion(usuario._id.toString(), plan, periodo) as Aportacion & { _id: string };
      const updatedAportacion = await aportacionService.updateAportacion(createdAportacion._id, {
        precio: 8.99
      }) as Aportacion & { _id: string };

      expect(updatedAportacion).toBeDefined();
      expect(updatedAportacion.precio).toBe(8.99);
    });

    it('should return null when updating non-existent contribution', async () => {
      const updatedAportacion = await aportacionService.updateAportacion('non_existent_id', {
        precio: 8.99
      });
      expect(updatedAportacion).toBeNull();
    });
  });

  describe('deleteAportacion', () => {
    it('should delete contribution successfully', async () => {
      const usuario = await createTestUser('123');
      const periodo = '2025A';
      const plan = Plan.AvoCloud;

      const createdAportacion = await aportacionService.createAportacion(usuario._id.toString(), plan, periodo) as Aportacion & { _id: string };
      const deletedAportacion = await aportacionService.deleteAportacion(createdAportacion._id) as Aportacion & { _id: string };

      expect(deletedAportacion).toBeDefined();
      expect(deletedAportacion._id).toBe(createdAportacion._id);

      const foundAportacion = await aportacionService.getAportacion(createdAportacion._id);
      expect(foundAportacion).toBeNull();
    });

    it('should return null when deleting non-existent contribution', async () => {
      const deletedAportacion = await aportacionService.deleteAportacion('non_existent_id');
      expect(deletedAportacion).toBeNull();
    });
  });

  describe('getAllAportaciones', () => {
    it('should return all contributions', async () => {
      const usuario1 = await createTestUser('123');
      const usuario2 = await createTestUser('456');
      
      const aportacionesData = [
        { usuario_id: usuario1._id.toString(), periodo: '2025A', plan: Plan.AvoCloud },
        { usuario_id: usuario2._id.toString(), periodo: '2025A', plan: Plan.AvoTech }
      ];

      await Promise.all(
        aportacionesData.map(data => 
          aportacionService.createAportacion(data.usuario_id, data.plan, data.periodo)
        )
      );
      
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