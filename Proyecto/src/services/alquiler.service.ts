import { AlquilerModel, Alquiler } from '../models/alquiler';

export class AlquilerService {
  async createAlquiler(alquilerData: Omit<Alquiler, '_id'>): Promise<Alquiler> {
    return await new AlquilerModel(alquilerData).save();
  }

  async getAlquiler(id: string): Promise<Alquiler | null> {
    return await AlquilerModel.findById(id).exec();
  }

  async updateAlquiler(
    id: string,
    alquilerData: Partial<Omit<Alquiler, '_id'>>,
  ): Promise<Alquiler | null> {
    return await AlquilerModel.findByIdAndUpdate(id, alquilerData, { new: true }).exec();
  }

  async deleteAlquiler(id: string): Promise<Alquiler | null> {
    return await AlquilerModel.findByIdAndDelete(id).exec();
  }

  async findAlquileres(filter: Partial<Alquiler>): Promise<Alquiler[]> {
    return await AlquilerModel.find(filter as any).exec();
  }
}