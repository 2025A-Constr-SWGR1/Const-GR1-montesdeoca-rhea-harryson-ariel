
import { usersController } from '../controllers/usersController.ts';

export async function usersRoutes(req: Request, path: string, method: string) {
  switch (method) {
    case 'GET':
      if (path === '/profile' || path === '/profile/') {
        return await usersController.getUserProfile(req);
      }
      break;
      
    case 'POST':
      if (path === '' || path === '/') {
        return await usersController.createUser(req);
      }
      break;
      
    case 'PUT':
      if (path === '/profile' || path === '/profile/') {
        return await usersController.updateUserProfile(req);
      }
      break;
  }
  
  return {
    status: 404,
    body: { error: 'User route not found' }
  };
}
