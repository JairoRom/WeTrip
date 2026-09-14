import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  changeRole,
  toggleUser,
  deleteUser
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol admin
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/role', changeRole);
router.patch('/:id/toggle', toggleUser);
router.delete('/:id', deleteUser);

export default router;