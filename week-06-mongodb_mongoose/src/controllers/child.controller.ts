// ============================================
// CONTROLLER: Child
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as service from '../services/child.service';
import {
  createChildSchema,
  updateChildSchema,
  objectIdSchema,
} from '../schemas/child.schema';
import { AppError } from '../errors/AppError';

// Convierte un ZodError en un AppError(400) legible; deja pasar cualquier otro error
function toAppError(err: unknown): unknown {
  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join(', ');
    return new AppError(400, message);
  }
  return err;
}

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 10;
    const search = req.query['search'] as string | undefined;
    const result = await service.getAll(page, limit, search);
    res.json(result);
  } catch (err) {
    next(toAppError(err));
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = objectIdSchema.parse(req.params['id']);
    const item = await service.getById(id);
    res.json(item);
  } catch (err) {
    next(toAppError(err));
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = createChildSchema.parse(req.body);
    const item = await service.createChild(dto);
    res.status(201).json(item);
  } catch (err) {
    next(toAppError(err));
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = objectIdSchema.parse(req.params['id']);
    const dto = updateChildSchema.parse(req.body);
    const item = await service.updateChild(id, dto);
    res.json(item);
  } catch (err) {
    next(toAppError(err));
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = objectIdSchema.parse(req.params['id']);
    await service.deleteChild(id);
    res.status(204).send();
  } catch (err) {
    next(toAppError(err));
  }
}
