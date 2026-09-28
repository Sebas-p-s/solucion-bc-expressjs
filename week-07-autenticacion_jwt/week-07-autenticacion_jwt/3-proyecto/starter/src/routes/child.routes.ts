import { Router } from 'express';
import * as childController from '../controllers/child.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

// ============================================
// RUTAS DEL RECURSO PRINCIPAL — Child
// ============================================
// Son datos de menores de edad: NINGUNA ruta es pública,
// todas están protegidas con authMiddleware.
// ============================================

const router = Router();

// Todas las rutas de este router requieren autenticación
router.use(authMiddleware);

// GET /api/v1/children — listar todos
router.get('/', childController.getAll);

// GET /api/v1/children/:id — obtener uno por ID
router.get('/:id', childController.getById);

// POST /api/v1/children — matricular un niño
router.post('/', childController.create);

// PATCH /api/v1/children/:id — actualizar parcialmente
router.patch('/:id', childController.update);

// DELETE /api/v1/children/:id — eliminar
router.delete('/:id', childController.remove);

export default router;
