import { Router } from 'express';
import {
  getChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild,
} from '../controllers/child.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

// Los datos de niños son información sensible de menores de edad:
// NINGUNA ruta es pública, todas requieren token válido.
router.get('/', authMiddleware, getChildren);
router.get('/:id', authMiddleware, getChildById);

// Matricular un niño: cualquier usuario autenticado
router.post('/', authMiddleware, createChild);

// Actualizar: autenticado; el service verifica dueño O admin
router.patch('/:id', authMiddleware, updateChild);

// Eliminar: solo admin (requireRole SIEMPRE después de authMiddleware)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteChild);

export default router;
