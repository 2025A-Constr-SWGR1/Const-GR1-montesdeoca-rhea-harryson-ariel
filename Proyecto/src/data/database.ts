import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // Cargar las variables de entorno

const connectDB = async () => {
  try {
    // Verifica si la URL de la base de datos está definida
    const uri = process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('La URL de la base de datos no está definida en las variables de entorno.');
    }

    // Conéctate a MongoDB usando el URI de Railway
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB en Railway');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB en Railway:', error);
  }
};

export default connectDB;