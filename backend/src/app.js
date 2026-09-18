import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { syncDatabase } from './models/index.js';

// IMPORTAR RUTAS
import authRoutes from './routes/authRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import placeRoutes from './routes/placeRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import cityDetailRoutes from './routes/cityDetailRoutes.js';
import userRoutes from './routes/userRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import tagRoutes from './routes/tagRoutes.js';

dotenv.config();

// Para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend estático
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🚀 WeTrip API funcionando',
    timestamp: new Date().toISOString()
  });
});

// USAR RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/city-detail', cityDetailRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/tags', tagRoutes);

// Fallback para React Router
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Iniciar servidor
const startServer = async () => {
  try {
    await syncDatabase();

    app.listen(PORT, () => {
      console.log('🚀 Servidor WeTrip corriendo en puerto ${PORT}');
      console.log('📝 Ambiente: ${process.env.NODE_ENV}');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();