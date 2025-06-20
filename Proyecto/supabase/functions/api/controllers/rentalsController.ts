
import { rentalsService } from '../services/rentalsService.ts';
import { getAuthenticatedUser, getUserProfile } from '../utils/auth.ts';

export const rentalsController = {
  async getUserRentals(req: Request) {
    try {
      const authHeader = req.headers.get('authorization');
      const user = await getAuthenticatedUser(authHeader);
      const profile = await getUserProfile(user.id);
      
      const rentals = await rentalsService.getUserRentals(profile.id);
      
      return {
        status: 200,
        body: { data: rentals }
      };
    } catch (error) {
      return {
        status: 401,
        body: { error: error.message }
      };
    }
  },

  async getRentalById(req: Request, id: string) {
    try {
      const authHeader = req.headers.get('authorization');
      const user = await getAuthenticatedUser(authHeader);
      const profile = await getUserProfile(user.id);
      
      const rental = await rentalsService.getRentalById(id, profile.id);
      
      return {
        status: 200,
        body: { data: rental }
      };
    } catch (error) {
      return {
        status: error.message.includes('not found') ? 404 : 401,
        body: { error: error.message }
      };
    }
  },

  async createRental(req: Request) {
    try {
      const authHeader = req.headers.get('authorization');
      const user = await getAuthenticatedUser(authHeader);
      const profile = await getUserProfile(user.id);
      
      const rentalData = await req.json();
      rentalData.user_id = profile.id;
      
      const newRental = await rentalsService.createRental(rentalData);
      
      return {
        status: 201,
        body: { data: newRental }
      };
    } catch (error) {
      return {
        status: 400,
        body: { error: error.message }
      };
    }
  },

  async updateRental(req: Request, id: string) {
    try {
      const authHeader = req.headers.get('authorization');
      const user = await getAuthenticatedUser(authHeader);
      const profile = await getUserProfile(user.id);
      
      const updateData = await req.json();
      const updatedRental = await rentalsService.updateRental(id, updateData, profile.id);
      
      return {
        status: 200,
        body: { data: updatedRental }
      };
    } catch (error) {
      return {
        status: error.message.includes('not found') ? 404 : 400,
        body: { error: error.message }
      };
    }
  },

  async returnRental(req: Request, id: string) {
    try {
      const authHeader = req.headers.get('authorization');
      const user = await getAuthenticatedUser(authHeader);
      const profile = await getUserProfile(user.id);
      
      const returnedRental = await rentalsService.returnRental(id, profile.id);
      
      return {
        status: 200,
        body: { data: returnedRental }
      };
    } catch (error) {
      return {
        status: error.message.includes('not found') ? 404 : 400,
        body: { error: error.message }
      };
    }
  }
};
