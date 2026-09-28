import { Request, Response, NextFunction } from 'express';
import * as childService from '../services/child.service.js';
import { createChildSchema, updateChildSchema } from '../schemas/child.schema.js';
import { AppError } from '../errors/AppError.js';
import { ZodError } from 'zod';

// Convierte errores de validación de Zod en AppError(400)
function handleError(err: unknown, next: NextFunction): void {
  if (err instanceof ZodError) {
    return next(new AppError(400, err.issues.map((i) => i.message).join(', ')));
  }
  next(err);
}

export async function getChildren(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const children = await childService.findAll();
    res.json({ data: children, total: children.length });
  } catch (err) {
    handleError(err, next);
  }
}

export async function getChildById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    const child = await childService.findById(req.params.id);
    if (!child) throw new AppError(404, 'Child not found');
    res.json({ data: child });
  } catch (err) {
    handleError(err, next);
  }
}

export async function createChild(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Not authenticated');
    const { body } = createChildSchema.parse({ body: req.body });
    const child = await childService.create(body, req.user.sub);
    res.status(201).json({ message: 'Child registered', data: child });
  } catch (err) {
    handleError(err, next);
  }
}

export async function updateChild(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Not authenticated');
    const { body } = updateChildSchema.parse({ body: req.body });
    const child = await childService.update(req.params.id, body, req.user.sub, req.user.role);
    if (!child) throw new AppError(404, 'Child not found');
    res.json({ message: 'Child updated', data: child });
  } catch (err) {
    handleError(err, next);
  }
}

export async function deleteChild(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    const child = await childService.remove(req.params.id);
    if (!child) throw new AppError(404, 'Child not found');
    res.json({ message: 'Child deleted' });
  } catch (err) {
    handleError(err, next);
  }
}
