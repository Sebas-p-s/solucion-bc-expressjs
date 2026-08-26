// ============================================
// CONTROLLER — delgado, maneja req/res, llama service
// ============================================
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from '../services/children.service';
import {
  createChildSchema,
  updateChildSchema,
  CreateChildDto,
  UpdateChildDto,
} from '../schemas/child.schema';
import { SingleResponse, PaginatedResponse } from '../types';

// Schema para validar :id param
const idSchema = z.coerce.number().int().positive({
  message: 'El id debe ser un número entero positivo',
});

// Helper para extraer issues de un ZodError — evitar duplicación
function formatIssues(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'id',
    message: issue.message,
  }));
}

// Listar con paginación (page y limit por query params)
export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 10;
    const result = await service.findAll({ page, limit });
    res.json(result satisfies PaginatedResponse<typeof result.data[number]>);
  } catch (err) {
    next(err);
  }
}

// Obtener por id — valida :id con idSchema
export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = idSchema.safeParse(req.params['id']);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Parámetro inválido',
        issues: formatIssues(parsed.error),
      });
      return;
    }
    const child = await service.findById(parsed.data);
    res.json({ data: child } satisfies SingleResponse<typeof child>);
  } catch (err) {
    next(err);
  }
}

// Crear — valida body con createChildSchema
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = createChildSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Datos de entrada inválidos',
        issues: formatIssues(result.error),
      });
      return;
    }
    const dto: CreateChildDto = result.data;
    const child = await service.create(dto);
    res.status(201).json({ data: child } satisfies SingleResponse<typeof child>);
  } catch (err) {
    next(err);
  }
}

// Actualizar — valida :id + body (parcial)
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedId = idSchema.safeParse(req.params['id']);
    if (!parsedId.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Parámetro inválido',
        issues: formatIssues(parsedId.error),
      });
      return;
    }
    const result = updateChildSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Datos de entrada inválidos',
        issues: formatIssues(result.error),
      });
      return;
    }
    const dto: UpdateChildDto = result.data;
    const child = await service.update(parsedId.data, dto);
    res.json({ data: child } satisfies SingleResponse<typeof child>);
  } catch (err) {
    next(err);
  }
}

// Eliminar — valida :id, responde 204
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = idSchema.safeParse(req.params['id']);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Parámetro inválido',
        issues: formatIssues(parsed.error),
      });
      return;
    }
    await service.remove(parsed.data);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
