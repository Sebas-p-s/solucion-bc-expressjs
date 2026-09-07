// src/routes/children.routes.ts — Definición de rutas del recurso Child
import { Router } from 'express';
import * as ctrl from '../controllers/children.controller';

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
