import { AportacionModel, Aportacion } from '../models/aportacion';

export class AportacionService {
  async createAportacion(aportacionData: Omit<Aportacion, '_id'>): Promise<Aportacion> {
    return await new AportacionModel(aportacionData).save();
  }

  async getAportacion(id: string): Promise<Aportacion | null> {
    return await AportacionModel.findById(id).exec();
  }

  async updateAportacion(
    id: string,
    aportacionData: Partial<Omit<Aportacion, '_id'>>,
  ): Promise<Aportacion | null> {
    return await AportacionModel.findByIdAndUpdate(id, aportacionData, { new: true }).exec();
  }

  async deleteAportacion(id: string): Promise<Aportacion | null> {
    return await AportacionModel.findByIdAndDelete(id).exec();
  }

  async findAportaciones(filter: Partial<Aportacion>): Promise<Aportacion[]> {
    return await AportacionModel.find(filter as any).exec();
  }
}