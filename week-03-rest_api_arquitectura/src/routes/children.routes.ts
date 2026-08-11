// ============================================
// ROUTES — Mapeo de URLs a controllers
// ============================================
// Las rutas solo conectan: URL + Método HTTP → función del controller.
// No contienen lógica ni acceden a servicios directamente.

import { Router } from 'express';
import * as controller from '../controllers/children.controller';

export const childrenRouter = Router();

childrenRouter.get('/', controller.getAll);
childrenRouter.get('/:id', controller.getById);
childrenRouter.post('/', controller.create);
childrenRouter.put('/:id', controller.update);
childrenRouter.delete('/:id', controller.remove);
