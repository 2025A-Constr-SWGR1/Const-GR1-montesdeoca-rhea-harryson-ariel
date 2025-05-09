import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import connectDB from './data/database';
import { alquilerRoutes } from './routes/alquiler.routes';
import { aportacionRoutes } from './routes/aportacion.routes';
import { usuarioRoutes } from './routes/usuario.routes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json());

// Rutas
app.use('/usuario', usuarioRoutes());
app.use('/aportacion', aportacionRoutes());
app.use('/alquiler', alquilerRoutes());

// Ruta de prueba
app.get('/', (req: Request, res: Response): void => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

// Manejo de errores
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
