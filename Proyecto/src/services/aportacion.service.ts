import { Aportacion, AportacionModel } from '../models/aportacion';

export class AportacionService {
  async createAportacion(aportacionData: Partial<Aportacion>): Promise<Aportacion> {
    try {
      const aportacion = new AportacionModel(aportacionData);
      return await aportacion.save();
    } catch (error) {
      throw error;
    }
  }

  async getAportacion(id: string): Promise<Aportacion | null> {
    try {
      return await AportacionModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async getAportacionByUsuario(usuario_id: string): Promise<Aportacion | null> {
    try {
      return await AportacionModel.findOne({ usuario_id });
    } catch (error) {
      throw error;
    }
  }

  async updateAportacion(id: string, updateData: Partial<Aportacion>): Promise<Aportacion | null> {
    try {
      return await AportacionModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteAportacion(id: string): Promise<Aportacion | null> {
    try {
      return await AportacionModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  async getAllAportaciones(): Promise<Aportacion[]> {
    try {
      return await AportacionModel.find();
    } catch (error) {
      throw error;
    }
  }
}