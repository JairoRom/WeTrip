import express from 'express';
import {
  getPlacesByCity,
  getPlaceById,
  createPlace,
  updatePlace,
  togglePlace,
  deletePlace,
  importPlacesFromOSM
} from '../controllers/placeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/city/:cityId', getPlacesByCity);
router.get('/:id', getPlaceById);

// Rutas protegidas (solo admin)
router.post('/', authenticate, authorize('admin'), createPlace);
router.put('/:id', authenticate, authorize('admin'), updatePlace);
router.patch('/:id/toggle', authenticate, authorize('admin'), togglePlace);
router.delete('/:id', authenticate, authorize('admin'), deletePlace);
router.post('/import/:cityId', authenticate, authorize('admin'), importPlacesFromOSM);

export default router;