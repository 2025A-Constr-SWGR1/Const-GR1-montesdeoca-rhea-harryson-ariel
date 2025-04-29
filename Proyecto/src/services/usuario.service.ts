import { UsuarioModel } from '../models/usuario';
import { Usuario } from '../models/usuario'

export class UsuarioService {
  async createUser(usuarioData: Usuario): Promise<Usuario> {
    const usuario = new UsuarioModel(usuarioData);
    return await usuario.save();
  }

  async getUser(id: string): Promise<Usuario | null> {
    return await UsuarioModel.findById(id).exec();
  }

  async updateUser(id: string, usuarioData: Partial<Usuario>): Promise<Usuario | null> {
    return await UsuarioModel.findByIdAndUpdate(id, usuarioData, { new: true }).exec();
  }

  async deleteUser(id: string): Promise<Usuario | null> {
    return await UsuarioModel.findByIdAndDelete(id).exec();
  }
}