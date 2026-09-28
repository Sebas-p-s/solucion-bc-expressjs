import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getChildrenHandler,
  getChildByIdHandler,
  createChildHandler,
  updateChildHandler,
  deleteChildHandler,
} from '../controllers/children.controller.js';

export const childrenRouter = Router();

childrenRouter.get('/', getChildrenHandler);
childrenRouter.get('/:id', getChildByIdHandler);
childrenRouter.post('/', authenticate, createChildHandler);
childrenRouter.put('/:id', authenticate, updateChildHandler);
childrenRouter.delete('/:id', authenticate, deleteChildHandler);
