
import { consolesRoutes } from './consoles.ts';
import { rentalsRoutes } from './rentals.ts';
import { usersRoutes } from './users.ts';

export async function router(req: Request, path: string) {
  const method = req.method;
  
  // Routes for consoles
  if (path.startsWith('/consoles')) {
    return await consolesRoutes(req, path.replace('/consoles', ''), method);
  }
  
  // Routes for rentals
  if (path.startsWith('/rentals')) {
    return await rentalsRoutes(req, path.replace('/rentals', ''), method);
  }
  
  // Routes for users
  if (path.startsWith('/users')) {
    return await usersRoutes(req, path.replace('/users', ''), method);
  }
  
  // Health check
  if (path === '/health') {
    return {
      status: 200,
      body: { message: 'AEIS API is running', timestamp: new Date().toISOString() }
    };
  }
  
  return {
    status: 404,
    body: { error: 'Route not found' }
  };
}
