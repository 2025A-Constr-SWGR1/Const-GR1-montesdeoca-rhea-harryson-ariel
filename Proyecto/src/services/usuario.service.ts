import { Usuario, UsuarioModel } from '../models/usuario';
import { deterministicHash } from '../utils/idEncoder';

export class UsuarioService {
  async createUsuario(usuarioData: Partial<Usuario>): Promise<Usuario> {
    try {
      // Generar ID hasheado
      const hashedId = deterministicHash(usuarioData.codigo_unico!);
      
      // Verificar si ya existe un usuario con el mismo código único o cédula
      const existingUsuario = await UsuarioModel.findOne({
        $or: [
          { codigo_unico: usuarioData.codigo_unico },
          { cedula: usuarioData.cedula }
        ]
      });

      if (existingUsuario) {
        throw new Error('Ya existe un usuario con ese código único o cédula');
      }

      const usuario = new UsuarioModel({
        _id: hashedId,
        ...usuarioData
      });

      return await usuario.save();
    } catch (error) {
      throw error;
    }
  }

  async getUsuario(id: string): Promise<Usuario | null> {
    try {
      return await UsuarioModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async getUsuarioByCodigoUnico(codigo_unico: string): Promise<Usuario | null> {
    try {
      return await UsuarioModel.findOne({ codigo_unico });
    } catch (error) {
      throw error;
    }
  }

  async updateUsuario(id: string, updateData: Partial<Usuario>): Promise<Usuario | null> {
    try {
      return await UsuarioModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteUsuario(id: string): Promise<Usuario | null> {
    try {
      return await UsuarioModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  async getAllUsuarios(): Promise<Usuario[]> {
    try {
      return await UsuarioModel.find();
    } catch (error) {
      throw error;
    }
  }
}