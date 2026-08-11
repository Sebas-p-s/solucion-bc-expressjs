// ============================================
// CONTROLLER — Interfaz HTTP
// ============================================
// Reglas de esta capa:
// - Exactamente 3 pasos: extraer → llamar service → responder
// - Sin lógica de negocio
// - Maneja los 404 cuando el service retorna undefined
// - Siempre usa try/catch y pasa errores a next(err)

import { Request, Response, NextFunction } from 'express';
import * as service from '../services/children.service';
import { CreateChildDto, UpdateChildDto, ErrorResponse } from '../types';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Paso 1 — extraer page y limit de req.query (con fallbacks 1 y 10)
    const page = Number(req.query['page'] ?? 1);
    const limit = Number(req.query['limit'] ?? 10);

    // Paso 2 — llamar service.findAll
    const result = await service.findAll({ page, limit });

    // Paso 3 — responder
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Paso 1 — extraer id de req.params
    const id = Number(req.params['id']);

    // Paso 2 — llamar service.findById
    const child = await service.findById(id);

    // Paso 3 — responder (404 si no existe)
    if (!child) {
      const errorResponse: ErrorResponse = { error: 'Not Found', message: `Child ${id} not found` };
      res.status(404).json(errorResponse);
      return;
    }
    res.json({ data: child });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Paso 1 — extraer dto del body
    const dto = req.body as CreateChildDto;

    // Paso 2 — llamar service.create
    const child = await service.create(dto);

    // Paso 3 — responder 201
    res.status(201).json({ data: child });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Paso 1 — extraer id de params y dto del body
    const id = Number(req.params['id']);
    const dto = req.body as UpdateChildDto;

    // Paso 2 — llamar service.update
    const child = await service.update(id, dto);

    // Paso 3 — responder (404 si no existe)
    if (!child) {
      const errorResponse: ErrorResponse = { error: 'Not Found', message: `Child ${id} not found` };
      res.status(404).json(errorResponse);
      return;
    }
    res.json({ data: child });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Paso 1 — extraer id de params
    const id = Number(req.params['id']);

    // Paso 2 — llamar service.remove
    const wasDeleted = await service.remove(id);

    // Paso 3 — responder (404 si no existía, 204 si se eliminó)
    if (!wasDeleted) {
      const errorResponse: ErrorResponse = { error: 'Not Found', message: `Child ${id} not found` };
      res.status(404).json(errorResponse);
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
