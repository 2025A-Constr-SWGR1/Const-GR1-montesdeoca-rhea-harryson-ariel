import { vi } from 'vitest';

// Mock del cliente de Supabase
export const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  })),
};

// Mock de usuarios
export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
  },
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

// Mock de juegos
export const mockGames = [
  {
    id: '1',
    title: 'The Legend of Zelda: Breath of the Wild',
    description: 'An adventure game',
    genre: 'Adventure',
    platform: 'Nintendo Switch',
    release_date: '2017-03-03',
    rental_price: 5.99,
    availability_status: 'available',
    image_url: 'https://example.com/zelda.jpg',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Super Mario Odyssey',
    description: 'A platformer game',
    genre: 'Platformer',
    platform: 'Nintendo Switch',
    release_date: '2017-10-27',
    rental_price: 4.99,
    availability_status: 'rented',
    image_url: 'https://example.com/mario.jpg',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
  },
];

// Mock de consolas
export const mockConsoles = [
  {
    id: '1',
    name: 'Nintendo Switch',
    brand: 'Nintendo',
    model: 'OLED',
    rental_price: 15.99,
    availability_status: 'available',
    image_url: 'https://example.com/switch.jpg',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'PlayStation 5',
    brand: 'Sony',
    model: 'Standard',
    rental_price: 25.99,
    availability_status: 'rented',
    image_url: 'https://example.com/ps5.jpg',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
  },
];

// Mock de rentals
export const mockRentals = [
  {
    id: '1',
    user_id: mockUser.id,
    game_id: '1',
    console_id: '1',
    start_date: '2023-06-01',
    end_date: '2023-06-08',
    total_cost: 41.93,
    status: 'active',
    created_at: '2023-06-01T00:00:00.000Z',
    updated_at: '2023-06-01T00:00:00.000Z',
  },
];

export default {
  mockSupabase,
  mockUser,
  mockGames,
  mockConsoles,
  mockRentals,
};
