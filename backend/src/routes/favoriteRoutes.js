import express from 'express';
import {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  isFavorite
} from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación (cualquier usuario logueado)
router.use(authenticate);

router.get('/', getMyFavorites);
router.post('/', addFavorite);
router.delete('/:cityId', removeFavorite);
router.get('/check/:cityId', isFavorite);

export default router;