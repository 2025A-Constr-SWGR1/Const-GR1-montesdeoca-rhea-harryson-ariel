
import { consolesService } from '../services/consolesService.ts';
import { getAuthenticatedUser } from '../utils/auth.ts';

export const consolesController = {
  async getAllConsoles(req: Request) {
    try {
      const authHeader = req.headers.get('authorization');
      await getAuthenticatedUser(authHeader);
      
      const consoles = await consolesService.getAllConsoles();
      
      return {
        status: 200,
        body: { data: consoles }
      };
    } catch (error) {
      return {
        status: 401,
        body: { error: error.message }
      };
    }
  },

  async getConsoleById(req: Request, id: string) {
    try {
      const authHeader = req.headers.get('authorization');
      await getAuthenticatedUser(authHeader);
      
      const console = await consolesService.getConsoleById(id);
      
      return {
        status: 200,
        body: { data: console }
      };
    } catch (error) {
      return {
        status: error.message.includes('not found') ? 404 : 401,
        body: { error: error.message }
      };
    }
  },

  async createConsole(req: Request) {
    try {
      const authHeader = req.headers.get('authorization');
      await getAuthenticatedUser(authHeader);
      
      const consoleData = await req.json();
      const newConsole = await consolesService.createConsole(consoleData);
      
      return {
        status: 201,
        body: { data: newConsole }
      };
    } catch (error) {
      return {
        status: 400,
        body: { error: error.message }
      };
    }
  },

  async updateConsole(req: Request, id: string) {
    try {
      const authHeader = req.headers.get('authorization');
      await getAuthenticatedUser(authHeader);
      
      const updateData = await req.json();
      const updatedConsole = await consolesService.updateConsole(id, updateData);
      
      return {
        status: 200,
        body: { data: updatedConsole }
      };
    } catch (error) {
      return {
        status: error.message.includes('not found') ? 404 : 400,
        body: { error: error.message }
      };
    }
  },

  async deleteConsole(req: Request, id: string) {
    try {
      const authHeader = req.headers.get('authorization');
      await getAuthenticatedUser(authHeader);
      
      await consolesService.deleteConsole(id);
      
      return {
        status: 200,
        body: { message: 'Console deleted successfully' }
      };
    } catch (error) {
      return {
        status: error.message.includes('not found') ? 404 : 400,
        body: { error: error.message }
      };
    }
  }
};
