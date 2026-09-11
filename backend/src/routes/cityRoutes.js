import express from 'express';
import { getCities, getCityById, createCity, updateCity, deleteCity } from '../controllers/cityController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (cualquier visitante)
router.get('/', getCities);
router.get('/:id', getCityById);

// Rutas protegidas (solo admin)
router.post('/', authenticate, authorize('admin'), createCity);
router.put('/:id', authenticate, authorize('admin'), updateCity);
router.delete('/:id', authenticate, authorize('admin'), deleteCity);

export default router;