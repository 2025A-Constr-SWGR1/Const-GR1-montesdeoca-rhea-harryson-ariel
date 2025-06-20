
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  precio_casillero: number;
  benefits: Record<string, any>;
  discounts: Array<{ nombre: string; descuento: number }>;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  gratis_al_mes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export enum Facultad {
  FIS = "FIS",
  FICA = "FICA", 
  FIQ = "FIQ",
  FCA = "FCA"
}

export enum Plan {
  AvoCloud = "AvoCloud",
  AvoTech = "AvoTech", 
  Avocoder = "Avocoder"
}
