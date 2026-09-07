// src/controllers/children.controller.ts — Capa HTTP
import { Request, Response, NextFunction } from 'express';
import * as service from '../services/children.service';
import { createChildSchema, updateChildSchema } from '../schemas/children.schema';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query['page']) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 10));
    const result = await service.listChildren(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params['id']);
    const child = await service.getChild(id);
    res.json(child);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = createChildSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ status: 'error', message: result.error.issues.map((i) => i.message).join(', ') });
      return;
    }
    const child = await service.createChild(result.data);
    res.status(201).json(child);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params['id']);
    const result = updateChildSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ status: 'error', message: result.error.issues.map((i) => i.message).join(', ') });
      return;
    }
    const child = await service.updateChild(id, result.data);
    res.json(child);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params['id']);
    await service.deleteChild(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
