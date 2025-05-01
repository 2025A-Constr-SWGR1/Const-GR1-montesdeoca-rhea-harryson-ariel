import { UsuarioModel, Usuario } from '../models/usuario';
import { deterministicHash } from '../utils/idEncoder';

export class UsuarioService {
  async createUser(usuarioData: Omit<Usuario, '_id'>): Promise<Usuario> {
    const { codigo_unico } = usuarioData;
    if (!codigo_unico) {
      throw new Error('El campo codigo_unico es obligatorio');
    }

    const generatedId = deterministicHash(codigo_unico);

    const nuevoUsuario = new UsuarioModel({
      ...usuarioData,
      _id: generatedId,
    });

    return await nuevoUsuario.save();
  }

  // 👇 Ahora recibe `codigo_unico` y genera el hash antes de buscar
  async getUserByCodigoUnico(codigo_unico: string): Promise<Usuario | null> {
    const hashedId = deterministicHash(codigo_unico);
    console.log("hashedId:",hashedId)
    return await UsuarioModel.findById(hashedId).exec();
  }

  async updateUser(id: string, usuarioData: Partial<Omit<Usuario, '_id'>>): Promise<Usuario | null> {
    return await UsuarioModel.findByIdAndUpdate(id, usuarioData, { new: true }).exec();
  }

  async deleteUser(id: string): Promise<Usuario | null> {
    return await UsuarioModel.findByIdAndDelete(id).exec();
  }

  async findUsers(filter: Partial<Usuario>): Promise<Usuario[]> {
    return await UsuarioModel.find(filter as any).exec();
  }
}