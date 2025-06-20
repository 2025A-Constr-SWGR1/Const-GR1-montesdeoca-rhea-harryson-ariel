
import { consolesController } from '../controllers/consolesController.ts';

export async function consolesRoutes(req: Request, path: string, method: string) {
  switch (method) {
    case 'GET':
      if (path === '' || path === '/') {
        return await consolesController.getAllConsoles(req);
      }
      if (path.startsWith('/')) {
        const id = path.substring(1);
        return await consolesController.getConsoleById(req, id);
      }
      break;
      
    case 'POST':
      if (path === '' || path === '/') {
        return await consolesController.createConsole(req);
      }
      break;
      
    case 'PUT':
      if (path.startsWith('/')) {
        const id = path.substring(1);
        return await consolesController.updateConsole(req, id);
      }
      break;
      
    case 'DELETE':
      if (path.startsWith('/')) {
        const id = path.substring(1);
        return await consolesController.deleteConsole(req, id);
      }
      break;
  }
  
  return {
    status: 404,
    body: { error: 'Console route not found' }
  };
}
