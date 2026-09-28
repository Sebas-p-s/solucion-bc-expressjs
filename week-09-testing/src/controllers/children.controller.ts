import type { Request, Response, NextFunction } from 'express';
import * as childrenService from '../services/children.service.js';
import {
  createChildSchema,
  updateChildSchema,
  childIdSchema,
  listChildrenSchema,
} from '../validators/children.schema.js';

// Los ZodError se propagan con next(err): el error.middleware los convierte en 422.

export async function getChildrenHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { query } = listChildrenSchema.parse({ query: req.query });
    const children = await childrenService.getAll(query);
    res.status(200).json({ data: children, total: children.length });
  } catch (err) {
    next(err);
  }
}

export async function getChildByIdHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { params } = childIdSchema.parse({ params: req.params });
    const child = await childrenService.getById(params.id);
    res.status(200).json({ data: child });
  } catch (err) {
    next(err);
  }
}

export async function createChildHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { body } = createChildSchema.parse({ body: req.body });
    const user = res.locals['user'] as { sub: string };
    const child = await childrenService.create(body, user.sub);
    res.status(201).json({ data: child });
  } catch (err) {
    next(err);
  }
}

export async function updateChildHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { params } = childIdSchema.parse({ params: req.params });
    const { body } = updateChildSchema.parse({ body: req.body });
    const user = res.locals['user'] as { sub: string; role: string };
    const child = await childrenService.update(params.id, body, user.sub, user.role);
    res.status(200).json({ data: child });
  } catch (err) {
    next(err);
  }
}

export async function deleteChildHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { params } = childIdSchema.parse({ params: req.params });
    const user = res.locals['user'] as { sub: string; role: string };
    await childrenService.remove(params.id, user.sub, user.role);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
