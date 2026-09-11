import express from 'express';
import { getPlacesByCity, createPlace, updatePlace, togglePlace, deletePlace } from '../controllers/placeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Ruta pública (obtener lugares por ciudad)
router.get('/city/:cityId', getPlacesByCity);

// Rutas protegidas (solo admin)
router.post('/', authenticate, authorize('admin'), createPlace);
router.put('/:id', authenticate, authorize('admin'), updatePlace);
router.patch('/:id/toggle', authenticate, authorize('admin'), togglePlace);
router.delete('/:id', authenticate, authorize('admin'), deletePlace);

export default router;