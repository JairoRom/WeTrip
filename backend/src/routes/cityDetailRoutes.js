import express from 'express';
import { getCityDetail } from '../controllers/cityDetailController.js';

const router = express.Router();

// Ruta pública: obtener detalle de una ciudad
router.get('/:id', getCityDetail);

export default router;