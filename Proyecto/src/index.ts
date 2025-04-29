import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

const app = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Middleware (opcional)
app.use(express.json());

app.get('/', (req: Request, res: Response): void => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
