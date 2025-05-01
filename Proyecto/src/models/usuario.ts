import mongoose, { Schema, Document } from 'mongoose';

// Enums
export enum Facultad {
  FIS = "FIS",
  FICA = "FICA",
  FIQ = "FIQ",
  FCA = "FCA",
}

export interface Usuario extends Document {
  _id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  celular: string;
  clave: string;
  codigo_unico: string;
  facultad: Facultad;
  esAportante: boolean;
  aportacion_id?: string;
}

const UsuariosSchema = new Schema({
  _id: { type: String, required: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  cedula: { type: String, required: true },
  correo: { type: String, required: true },
  codigo_unico: { type: String, required: true },
  celular: { type: String, required: true },
  clave: { type: String, required: true },
  facultad: {
    type: String,
    enum: Object.values(Facultad),
    required: true,
  },
  esAportante: {
    type: Boolean,
    required: true,
  },
  aportacion_id: {
    type: String,
    ref: 'Aportacion',
    default: null,
  },
});

export const UsuarioModel = mongoose.model<Usuario>('Usuario', UsuariosSchema);