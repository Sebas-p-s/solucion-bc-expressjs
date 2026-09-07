// src/services/children.service.ts — Lógica de negocio
import * as repo from '../repositories/children.repository';
import { AppError } from '../errors/AppError';
import type { CreateChildDto, UpdateChildDto } from '../schemas/children.schema';

export async function listChildren(page: number, limit: number) {
  return repo.findAll(page, limit);
}

export async function getChild(id: number) {
  const child = await repo.findById(id);
  if (!child) {
    throw new AppError(404, 'Niño no encontrado');
  }
  return child;
}

export async function createChild(data: CreateChildDto) {
  return repo.create(data);
}

export async function updateChild(id: number, data: UpdateChildDto) {
  return repo.update(id, data);
}

export async function deleteChild(id: number) {
  return repo.remove(id);
}
