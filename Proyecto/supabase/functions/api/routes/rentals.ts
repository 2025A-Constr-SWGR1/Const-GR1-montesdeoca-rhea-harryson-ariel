
import { rentalsController } from '../controllers/rentalsController.ts';

export async function rentalsRoutes(req: Request, path: string, method: string) {
  switch (method) {
    case 'GET':
      if (path === '' || path === '/') {
        return await rentalsController.getUserRentals(req);
      }
      if (path.startsWith('/')) {
        const id = path.substring(1);
        return await rentalsController.getRentalById(req, id);
      }
      break;
      
    case 'POST':
      if (path === '' || path === '/') {
        return await rentalsController.createRental(req);
      }
      break;
      
    case 'PUT':
      if (path.startsWith('/')) {
        const segments = path.substring(1).split('/');
        const id = segments[0];
        const action = segments[1];
        
        if (action === 'return') {
          return await rentalsController.returnRental(req, id);
        } else {
          return await rentalsController.updateRental(req, id);
        }
      }
      break;
  }
  
  return {
    status: 404,
    body: { error: 'Rental route not found' }
  };
}
