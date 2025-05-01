import mongoose, { Schema, Document } from 'mongoose';

// Interfaces

interface Juego {
  nombre: string;
  tipo: string; // Ej: PlayStation, Xbox, Mesa de PingPong...
}

export interface Alquiler extends Document {
  usuario_id: string;
  juego: Juego;
  estado: 'activo' | 'finalizado';
  precio: number;
  duracion_horas: number;
}

// Schemas

const JuegoSchema = new Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
});

const AlquileresSchema: Schema = new Schema({
  usuario_id: {
    type: String,
    required: true,
    ref: 'Usuario',
  },
  juego: { type: JuegoSchema, required: true },
  estado: {
    type: String,
    enum: ['activo', 'finalizado'],
    default: 'activo',
  },
  precio: {
    type: Number,
    required: true,
  },
  duracion_horas: {
    type: Number,
    required: true,
  },
});

// Modelo

export const AlquilerModel = mongoose.model<Alquiler>('Alquiler', AlquileresSchema);