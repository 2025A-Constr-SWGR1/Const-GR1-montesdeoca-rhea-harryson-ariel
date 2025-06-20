
export interface Game {
  id: string;
  name: string;
  type: 'billar' | 'ping_pong' | 'air_hockey' | 'videojuego';
  identifier: string;
  status: 'available' | 'rented' | 'maintenance';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RentalOption {
  id: string;
  game_type: 'billar' | 'ping_pong' | 'air_hockey' | 'videojuego';
  duration_minutes: number;
  price: number;
  created_at: string;
}

export interface GameRental {
  id: string;
  user_id: string;
  game_id: string;
  rental_option_id: string;
  start_time: string;
  end_time?: string;
  expected_end_time: string;
  total_amount: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  games?: Game;
  rental_options?: RentalOption;
}
