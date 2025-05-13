import { Aportacion, AportacionModel, AvoCloudTemplate, AvoCoderTemplate, AvoTechTemplate, Plan } from '../models/aportacion';
import { deterministicHash } from '../utils/idEncoder';
import { UsuarioService } from './usuario.service';

export class AportacionService {
  private usuarioService: UsuarioService;

  constructor() {
    this.usuarioService = new UsuarioService();
  }

  private getTemplateByPlan(plan: Plan) {
    switch (plan) {
      case Plan.AvoCloud:
        return AvoCloudTemplate;
      case Plan.AvoTech:
        return AvoTechTemplate;
      case Plan.AvoCoder:
        return AvoCoderTemplate;
      default:
        throw new Error('Plan no válido');
    }
  }

  async createAportacion(usuario_id: string, plan: Plan, periodo: string): Promise<Aportacion> {
    try {
      // Verificar si el usuario existe
      const usuario = await this.usuarioService.getUsuario(usuario_id);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar si el usuario ya tiene una aportación activa
      const aportacionExistente = await this.getAportacionByUsuario(usuario_id);
      if (aportacionExistente) {
        throw new Error('El usuario ya tiene una aportación activa');
      }

      // Obtener el template del plan
      const template = this.getTemplateByPlan(plan);

      // Crear la aportación con el template y el ID personalizado hasheado
      const aportacion = new AportacionModel({
        _id: deterministicHash(`${periodo}${usuario.codigo_unico}`),
        ...template,
        periodo,
        usuario_id
      });

      return await aportacion.save();
    } catch (error) {
      throw error;
    }
  }

  async getAportacion(id: string): Promise<Aportacion | null> {
    try {
      // El ID ya viene hasheado del controlador
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

  async getAportacionByCodigoUnico(codigo_unico: string): Promise<Aportacion | null> {
    try {
      // Primero obtener el usuario por su código único
      const usuario = await this.usuarioService.getUsuarioByCodigoUnico(codigo_unico);
      if (!usuario) {
        return null;
      }

      // Luego buscar la aportación por el ID del usuario
      return await this.getAportacionByUsuario(usuario._id);
    } catch (error) {
      throw error;
    }
  }

  async updateAportacion(id: string, updateData: Partial<Aportacion>): Promise<Aportacion | null> {
    try {
      // No permitir actualizar campos sensibles
      delete updateData._id;
      delete updateData.usuario_id;
      delete updateData.nombre_plan;

      // El ID ya viene hasheado del controlador
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
      // El ID ya viene hasheado del controlador
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