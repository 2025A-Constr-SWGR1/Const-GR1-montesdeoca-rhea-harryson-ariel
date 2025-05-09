import { Alquiler, AlquilerModel } from '../models/alquiler';

export class AlquilerService {
  async createAlquiler(alquilerData: Partial<Alquiler>): Promise<Alquiler> {
    try {
      const alquiler = new AlquilerModel(alquilerData);
      return await alquiler.save();
    } catch (error) {
      throw error;
    }
  }

  async getAlquiler(id: string): Promise<Alquiler | null> {
    try {
      return await AlquilerModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async getAlquilerActivoByUsuario(usuario_id: string): Promise<Alquiler | null> {
    try {
      return await AlquilerModel.findOne({
        usuario_id,
        estado: 'activo'
      });
    } catch (error) {
      throw error;
    }
  }

  async getAlquileresByUsuario(usuario_id: string): Promise<Alquiler[]> {
    try {
      return await AlquilerModel.find({ usuario_id });
    } catch (error) {
      throw error;
    }
  }

  async finalizarAlquiler(id: string): Promise<Alquiler | null> {
    try {
      return await AlquilerModel.findByIdAndUpdate(
        id,
        { $set: { estado: 'finalizado' } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteAlquiler(id: string): Promise<Alquiler | null> {
    try {
      return await AlquilerModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  async getAllAlquileres(): Promise<Alquiler[]> {
    try {
      return await AlquilerModel.find();
    } catch (error) {
      throw error;
    }
  }

  async updateAlquiler(
    id: string,
    alquilerData: Partial<Omit<Alquiler, '_id'>>,
  ): Promise<Alquiler | null> {
    return await AlquilerModel.findByIdAndUpdate(id, alquilerData, { new: true }).exec();
  }

  async findAlquileres(filter: Partial<Alquiler>): Promise<Alquiler[]> {
    return await AlquilerModel.find(filter as any).exec();
  }
}