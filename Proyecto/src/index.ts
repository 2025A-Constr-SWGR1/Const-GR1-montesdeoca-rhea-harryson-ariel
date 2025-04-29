import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './data/database';
import usuarioRoutes from './routes/usuario.route';

dotenv.config(); // Cargar variables de entorno

const app = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

connectDB()

// Middleware (opcional)
app.use(express.json());
app.use('/usuario', usuarioRoutes);

app.get('/', (req: Request, res: Response): void => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}`);
});
