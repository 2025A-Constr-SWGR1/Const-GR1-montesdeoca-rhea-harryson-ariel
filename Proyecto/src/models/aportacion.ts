import mongoose, { Document, Schema } from 'mongoose';

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
  _id: { type: String },
  nombre_plan: { type: String, enum: Object.values(Plan), required: true },
  periodo: { type: String, required: true },
  precio: { type: Number, required: true },
  precio_Casillero: { type: Number, required: true },
  gratisAlMes: { type: GratisAlMesSchema, required: true },
  descuentos: { type: [DescuentoSchema], required: true },
  usuario_id: {
    type: String,
    required: true,
    ref: 'Usuario',
  },
});

// Plan Templates
export const AvoCloudTemplate = {
  nombre_plan: Plan.AvoCloud,
  precio: 7.99,
  precio_Casillero: 4.50,
  gratisAlMes: {
    billar: { usado: false },
    pingPong: { usado: false }
  },
  descuentos: [
    { nombre: "taza", descuento: 0.10 },
    { nombre: "billar", descuento: 0.50 },
    { nombre: "pingPong", descuento: 0.20 },
    { nombre: "eventos", descuento: 0 }
  ]
};

export const AvoTechTemplate = {
  nombre_plan: Plan.AvoTech,
  precio: 14.99,
  precio_Casillero: 3.00,
  gratisAlMes: {
    billar: { usado: false },
    pingPong: { usado: false },
    hockey: { usado: false }
  },
  descuentos: [
    { nombre: "ropa", descuento: 0.10 },
    { nombre: "taza", descuento: 0.25 },
    { nombre: "billar", descuento: 0.50 },
    { nombre: "pingPong", descuento: 0.20 },
    { nombre: "hockey", descuento: 0.25 },
    { nombre: "eventos", descuento: 0 }
  ]
};

export const AvoCoderTemplate = {
  nombre_plan: Plan.AvoCoder,
  precio: 19.99,
  precio_Casillero: 0.00,
  gratisAlMes: {
    billar: { usado: false },
    pingPong: { usado: false },
    hockey: { usado: false },
    consolas: { usado: false }
  },
  descuentos: [
    { nombre: "ropa", descuento: 0.25 },
    { nombre: "taza", descuento: 1.00 },
    { nombre: "billar", descuento: 0.50 },
    { nombre: "pingPong", descuento: 0.20 },
    { nombre: "hockey", descuento: 0.25 },
    { nombre: "consolas", descuento: 0.50 },
    { nombre: "eventos", descuento: 0 }
  ]
};

// Modelo
export const AportacionModel = mongoose.model<Aportacion>('Aportacion', AportacionesSchema);