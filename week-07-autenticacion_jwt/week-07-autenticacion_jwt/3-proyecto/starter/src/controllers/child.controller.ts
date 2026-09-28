import { Request, Response, NextFunction } from 'express';
import * as childService from '../services/child.service';
import { createChildSchema, updateChildSchema } from '../schemas/child.schema';

// ============================================
// CONTROLADOR DEL RECURSO PRINCIPAL — Child
// ============================================
// Valida con Zod, delega al servicio y maneja la respuesta HTTP.
// ============================================

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const children = await childService.getAll();
    res.status(200).json(children);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const child = await childService.getById(req.params.id as string);
    res.status(200).json(child);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = createChildSchema.parse(req.body);
    const userId = req.user!.sub;
    const child = await childService.create(dto, userId);
    res.status(201).json(child);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = updateChildSchema.parse(req.body);
    const child = await childService.update(req.params.id as string, dto);
    res.status(200).json(child);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await childService.remove(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
