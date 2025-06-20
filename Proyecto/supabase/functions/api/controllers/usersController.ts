
import { usersService } from '../services/usersService.ts';
import { getAuthenticatedUser, getUserProfile } from '../utils/auth.ts';

export const usersController = {
  async getUserProfile(req: Request) {
    try {
      const authHeader = req.headers.get('authorization');
      const user = await getAuthenticatedUser(authHeader);
      
      const profile = await getUserProfile(user.id);
      
      return {
        status: 200,
        body: { data: profile }
      };
    } catch (error) {
      return {
        status: 401,
        body: { error: error.message }
      };
    }
  },

  async createUser(req: Request) {
    try {
      const authHeader = req.headers.get('authorization');
      const user = await getAuthenticatedUser(authHeader);
      
      const userData = await req.json();
      userData.auth_id = user.id;
      userData.email = user.email;
      
      const newUser = await usersService.createUser(userData);
      
      return {
        status: 201,
        body: { data: newUser }
      };
    } catch (error) {
      return {
        status: 400,
        body: { error: error.message }
      };
    }
  },

  async updateUserProfile(req: Request) {
    try {
      const authHeader = req.headers.get('authorization');
      const user = await getAuthenticatedUser(authHeader);
      const profile = await getUserProfile(user.id);
      
      const updateData = await req.json();
      const updatedProfile = await usersService.updateUser(profile.id, updateData);
      
      return {
        status: 200,
        body: { data: updatedProfile }
      };
    } catch (error) {
      return {
        status: 400,
        body: { error: error.message }
      };
    }
  }
};
