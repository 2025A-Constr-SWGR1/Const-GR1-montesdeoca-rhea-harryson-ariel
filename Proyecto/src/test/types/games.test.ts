import type { Game, GameRental, RentalOption } from '@/types/games';
import { describe, expect, it } from 'vitest';

describe('Game Types', () => {
  describe('Game interface', () => {
    it('should accept valid game object', () => {
      const game: Game = {
        id: '1',
        name: 'Mesa de Billar 1',
        type: 'billar',
        identifier: 'B001',
        status: 'available',
        image_url: 'https://example.com/billar.jpg',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      };

      expect(game.id).toBe('1');
      expect(game.type).toBe('billar');
      expect(game.status).toBe('available');
    });

    it('should accept game without optional fields', () => {
      const game: Game = {
        id: '2',
        name: 'Mesa de Ping Pong 1',
        type: 'ping_pong',
        identifier: 'PP001',
        status: 'rented',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      };

      expect(game.image_url).toBeUndefined();
      expect(game.type).toBe('ping_pong');
    });

    it('should enforce correct game types', () => {
      const gameTypes: Game['type'][] = ['billar', 'ping_pong', 'air_hockey', 'videojuego'];
      
      gameTypes.forEach(type => {
        const game: Game = {
          id: '1',
          name: 'Test Game',
          type,
          identifier: 'T001',
          status: 'available',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        };
        
        expect(game.type).toBe(type);
      });
    });

    it('should enforce correct status values', () => {
      const statuses: Game['status'][] = ['available', 'rented', 'maintenance'];
      
      statuses.forEach(status => {
        const game: Game = {
          id: '1',
          name: 'Test Game',
          type: 'billar',
          identifier: 'T001',
          status,
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        };
        
        expect(game.status).toBe(status);
      });
    });
  });

  describe('RentalOption interface', () => {
    it('should accept valid rental option object', () => {
      const rentalOption: RentalOption = {
        id: '1',
        game_type: 'billar',
        duration_minutes: 60,
        price: 15.99,
        created_at: '2023-01-01T00:00:00.000Z',
      };

      expect(rentalOption.game_type).toBe('billar');
      expect(rentalOption.duration_minutes).toBe(60);
      expect(rentalOption.price).toBe(15.99);
    });

    it('should accept different game types for rental options', () => {
      const gameTypes: RentalOption['game_type'][] = ['billar', 'ping_pong', 'air_hockey', 'videojuego'];
      
      gameTypes.forEach(gameType => {
        const option: RentalOption = {
          id: '1',
          game_type: gameType,
          duration_minutes: 30,
          price: 10.99,
          created_at: '2023-01-01T00:00:00.000Z',
        };
        
        expect(option.game_type).toBe(gameType);
      });
    });
  });

  describe('GameRental interface', () => {
    it('should accept valid game rental object', () => {
      const gameRental: GameRental = {
        id: '1',
        user_id: 'user-1',
        game_id: 'game-1',
        rental_option_id: 'option-1',
        start_time: '2023-06-01T10:00:00.000Z',
        expected_end_time: '2023-06-01T11:00:00.000Z',
        total_amount: 15.99,
        status: 'active',
        created_at: '2023-06-01T10:00:00.000Z',
        updated_at: '2023-06-01T10:00:00.000Z',
      };

      expect(gameRental.status).toBe('active');
      expect(gameRental.total_amount).toBe(15.99);
    });

    it('should accept game rental with optional fields', () => {
      const gameRental: GameRental = {
        id: '1',
        user_id: 'user-1',
        game_id: 'game-1',
        rental_option_id: 'option-1',
        start_time: '2023-06-01T10:00:00.000Z',
        end_time: '2023-06-01T11:00:00.000Z',
        expected_end_time: '2023-06-01T11:00:00.000Z',
        total_amount: 15.99,
        status: 'completed',
        notes: 'Completed successfully',
        created_at: '2023-06-01T10:00:00.000Z',
        updated_at: '2023-06-01T11:00:00.000Z',
        games: {
          id: 'game-1',
          name: 'Test Game',
          type: 'billar',
          identifier: 'B001',
          status: 'available',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
        rental_options: {
          id: 'option-1',
          game_type: 'billar',
          duration_minutes: 60,
          price: 15.99,
          created_at: '2023-01-01T00:00:00.000Z',
        },
      };

      expect(gameRental.end_time).toBeDefined();
      expect(gameRental.notes).toBe('Completed successfully');
      expect(gameRental.games?.name).toBe('Test Game');
      expect(gameRental.rental_options?.price).toBe(15.99);
    });

    it('should enforce correct rental status values', () => {
      const statuses: GameRental['status'][] = ['active', 'completed', 'cancelled'];
      
      statuses.forEach(status => {
        const rental: GameRental = {
          id: '1',
          user_id: 'user-1',
          game_id: 'game-1',
          rental_option_id: 'option-1',
          start_time: '2023-06-01T10:00:00.000Z',
          expected_end_time: '2023-06-01T11:00:00.000Z',
          total_amount: 15.99,
          status,
          created_at: '2023-06-01T10:00:00.000Z',
          updated_at: '2023-06-01T10:00:00.000Z',
        };
        
        expect(rental.status).toBe(status);
      });
    });
  });
});
