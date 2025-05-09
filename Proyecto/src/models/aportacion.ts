import mongoose, { Schema, Document } from 'mongoose';

// Enums
export enum Plan {
  AvoCloud = "AvoCloud",
  AvoTech = "AvoTech",
  AvoCoder = "AvoCoder",
}

// Interfaces internas
interface GratisAlMes {
  billar?: { usado: boolean };
  pingPong?: { usado: boolean };
  hockey?: { usado: boolean };
  consolas?: { usado: boolean };
}

interface Descuento {
  nombre: string;
  descuento: number;
}

// Interface principal
export interface Aportacion extends Document {
  nombre_plan: Plan;
  periodo: string; // 2025A, 2025B, 2026A, 2026B, etc.
  precio: number;
  precio_Casillero: number;
  gratisAlMes: GratisAlMes;
  descuentos: Descuento[];
  usuario_id: string; // Relación con Usuarios
}

// Schemas
const GratisAlMesSchema = new Schema({
  billar: { type: Schema.Types.Mixed, default: { usado: false } },
  pingPong: { type: Schema.Types.Mixed, default: { usado: false } },
  hockey: { type: Schema.Types.Mixed, default: { usado: false } },
  consolas: { type: Schema.Types.Mixed, default: { usado: false } },
});

const DescuentoSchema = new Schema({
  nombre: String,
  descuento: Number,
});

const AportacionesSchema: Schema = new Schema({
  nombre_plan: { type: String, enum: Object.values(Plan), required: true },
  precio: { type: Number, required: true },
  precio_Casillero: { type: Number },
  gratisAlMes: { type: GratisAlMesSchema },
  descuentos: { type: [DescuentoSchema] },
  usuario_id: {
    type: String,
    required: true,
    ref: 'Usuario',
  },
});

// Modelo
export const AportacionModel = mongoose.model<Aportacion>('Aportacion', AportacionesSchema);