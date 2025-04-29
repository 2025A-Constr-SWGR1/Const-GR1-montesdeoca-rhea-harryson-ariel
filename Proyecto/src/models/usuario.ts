import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

export enum Facultad {
  FIS = 'FIS',
  FICA = 'FICA',
  FIQ = 'FIQ',
  FCA = 'FCA',
}

export enum Plan {
  AvoCloud = 'AvoCloud',
  AvoTech = 'AvoTech',
  Avocoder = 'Avocoder',
}

class GratisAlMes {
    @prop()
    billar?: { usado: boolean };
  
    @prop()
    pingPong?: { usado: boolean };
  
    @prop()
    hockey?: { usado: boolean };
  
    @prop()
    consolas?: { usado: boolean };
  }

class Descuento {
  @prop({ required: true })
  nombre!: string;

  @prop({ required: true })
  descuento!: number;
}

class Aportacion {
  @prop({ required: true, enum: Plan })
  nombre_plan!: Plan;

  @prop({ required: true })
  precio!: number;

  @prop({ required: true })
  precio_Casillero!: number;

  @prop({ _id: false })
  gratisAlMes?: GratisAlMes;

  @prop({ type: () => [Descuento], default: [] })
  descuentos!: Descuento[];
}

@modelOptions({ schemaOptions: { collection: 'usuarios', timestamps: true } })
export class Usuario {
  @prop({ required: true, unique: true })
  cedula!: string;

  @prop({ required: true })
  nombre!: string;

  @prop({ required: true })
  apellido!: string;

  @prop({ required: true, unique: true })
  codigo_unico!: string;

  @prop({ required: true, unique: true })
  correo!: string;

  @prop({ required: true })
  celular!: string;

  @prop({ required: true })
  clave!: string;

  @prop({ required: true, enum: Facultad })
  facultad!: Facultad;

  @prop({ required: true })
  esAportante!: boolean;

  @prop({ _id: false })
  tipoAportacion?: Aportacion;
}

export const UsuarioModel = getModelForClass(Usuario);
