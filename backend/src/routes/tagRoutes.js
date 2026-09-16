import express from 'express';
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  setPlaceTags
} from '../controllers/tagController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Público
router.get('/', getTags);

// Admin
router.post('/', authenticate, authorize('admin'), createTag);
router.put('/:id', authenticate, authorize('admin'), updateTag);
router.delete('/:id', authenticate, authorize('admin'), deleteTag);
router.post('/place/:placeId', authenticate, authorize('admin'), setPlaceTags);

export default router;