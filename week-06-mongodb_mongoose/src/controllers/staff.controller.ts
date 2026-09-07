// ============================================
// CONTROLLER: Staff
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as service from '../services/staff.service';
import { createStaffSchema, updateStaffSchema } from '../schemas/staff.schema';
import { objectIdSchema } from '../schemas/child.schema';
import { AppError } from '../errors/AppError';

// Convierte un ZodError en un AppError(400) legible; deja pasar cualquier otro error
function toAppError(err: unknown): unknown {
  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join(', ');
    return new AppError(400, message);
  }
  return err;
}

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await service.getAll();
    res.json(items);
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
    const dto = createStaffSchema.parse(req.body);
    const item = await service.createStaff(dto);
    res.status(201).json(item);
  } catch (err) {
    next(toAppError(err));
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = objectIdSchema.parse(req.params['id']);
    const dto = updateStaffSchema.parse(req.body);
    const item = await service.updateStaff(id, dto);
    res.json(item);
  } catch (err) {
    next(toAppError(err));
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = objectIdSchema.parse(req.params['id']);
    await service.deleteStaff(id);
    res.status(204).send();
  } catch (err) {
    next(toAppError(err));
  }
}
