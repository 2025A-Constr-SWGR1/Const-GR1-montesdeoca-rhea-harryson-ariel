import { Facultad, UsuarioModel } from '../models/usuario';
import { UsuarioService } from '../services/usuario.service';

// Mock the deterministicHash function
jest.mock('../utils/idEncoder', () => ({
  deterministicHash: jest.fn((input: string) => `hashed_${input}`)
}));

describe('UsuarioService', () => {
  let usuarioService: UsuarioService;

  beforeEach(async () => {
    // Clear the database before each test
    await UsuarioModel.deleteMany({});
    usuarioService = new UsuarioService();
  });

  afterEach(async () => {
    // Additional cleanup after each test
    await UsuarioModel.deleteMany({});
  });

  const createTestUserData = (suffix: string) => ({
    nombre: suffix === '123' ? 'John' : 'Jane',
    apellido: 'Doe',
    cedula: `1234567890${suffix}`,
    correo: `john${suffix}@example.com`,
    celular: '1234567890',
    clave: 'password123',
    codigo_unico: `COD${suffix}`,
    facultad: Facultad.FIS,
    esAportante: true
  });

  describe('createUsuario', () => {
    it('should create a new user successfully', async () => {
      const usuarioData = createTestUserData('123');

      const usuario = await usuarioService.createUsuario(usuarioData);

      expect(usuario).toBeDefined();
      expect(usuario._id).toBe(`hashed_${usuarioData.codigo_unico}`);
      expect(usuario.nombre).toBe(usuarioData.nombre);
      expect(usuario.codigo_unico).toBe(usuarioData.codigo_unico);
    });

    it('should throw error when creating user with duplicate codigo_unico', async () => {
      const usuarioData = createTestUserData('123');

      await usuarioService.createUsuario(usuarioData);

      const duplicateData = {
        ...usuarioData,
        correo: 'john2@example.com',
        cedula: '0987654321' // Different cédula to avoid duplicate key error
      };

      await expect(usuarioService.createUsuario(duplicateData))
        .rejects
        .toThrow('Ya existe un usuario con ese código único o cédula');
    });
  });

  describe('getUsuario', () => {
    it('should return user by id', async () => {
      const usuarioData = createTestUserData('123');

      const createdUsuario = await usuarioService.createUsuario(usuarioData);
      const foundUsuario = await usuarioService.getUsuario(createdUsuario._id);

      expect(foundUsuario).toBeDefined();
      expect(foundUsuario?._id).toBe(createdUsuario._id);
    });

    it('should return null for non-existent user id', async () => {
      const foundUsuario = await usuarioService.getUsuario('non_existent_id');
      expect(foundUsuario).toBeNull();
    });
  });

  describe('getUsuarioByCodigoUnico', () => {
    it('should return user by codigo_unico', async () => {
      const usuarioData = createTestUserData('123');

      await usuarioService.createUsuario(usuarioData);
      const foundUsuario = await usuarioService.getUsuarioByCodigoUnico(usuarioData.codigo_unico);

      expect(foundUsuario).toBeDefined();
      expect(foundUsuario?.codigo_unico).toBe(usuarioData.codigo_unico);
    });

    it('should return null for non-existent codigo_unico', async () => {
      const foundUsuario = await usuarioService.getUsuarioByCodigoUnico('NON_EXISTENT');
      expect(foundUsuario).toBeNull();
    });
  });

  describe('updateUsuario', () => {
    it('should update user successfully', async () => {
      const usuarioData = createTestUserData('123');

      const createdUsuario = await usuarioService.createUsuario(usuarioData);
      const updatedUsuario = await usuarioService.updateUsuario(createdUsuario._id, {
        nombre: 'John Updated'
      });

      expect(updatedUsuario).toBeDefined();
      expect(updatedUsuario?.nombre).toBe('John Updated');
    });

    it('should return null when updating non-existent user', async () => {
      const updatedUsuario = await usuarioService.updateUsuario('non_existent_id', {
        nombre: 'John Updated'
      });
      expect(updatedUsuario).toBeNull();
    });
  });

  describe('deleteUsuario', () => {
    it('should delete user successfully', async () => {
      const usuarioData = createTestUserData('123');

      const createdUsuario = await usuarioService.createUsuario(usuarioData);
      const deletedUsuario = await usuarioService.deleteUsuario(createdUsuario._id);

      expect(deletedUsuario).toBeDefined();
      expect(deletedUsuario?._id).toBe(createdUsuario._id);

      const foundUsuario = await usuarioService.getUsuario(createdUsuario._id);
      expect(foundUsuario).toBeNull();
    });

    it('should return null when deleting non-existent user', async () => {
      const deletedUsuario = await usuarioService.deleteUsuario('non_existent_id');
      expect(deletedUsuario).toBeNull();
    });
  });

  describe('getAllUsuarios', () => {
    it('should return all users', async () => {
      const usuariosData = [
        createTestUserData('123'),
        createTestUserData('456')
      ];

      await Promise.all(usuariosData.map(data => usuarioService.createUsuario(data)));
      const usuarios = await usuarioService.getAllUsuarios();

      expect(usuarios).toHaveLength(2);
      // Ordenar por nombre para asegurar un orden consistente
      const sortedUsuarios = usuarios.sort((a, b) => a.nombre.localeCompare(b.nombre));
      expect(sortedUsuarios[0].nombre).toBe('Jane');
      expect(sortedUsuarios[1].nombre).toBe('John');
    });

    it('should return empty array when no users exist', async () => {
      const usuarios = await usuarioService.getAllUsuarios();
      expect(usuarios).toHaveLength(0);
    });
  });
}); 