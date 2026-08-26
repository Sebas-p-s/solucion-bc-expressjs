// ============================================
// SERVICE — lógica de negocio
// ============================================
import { Child, PaginatedResponse } from '../types';
import * as repo from '../repositories/children.repository';
import { AppError } from '../errors/AppError';

interface FindAllOptions {
  page: number;
  limit: number;
}

// Paginación offset: start = (page-1)*limit
export async function findAll(opts: FindAllOptions): Promise<PaginatedResponse<Child>> {
  const { page, limit } = opts;
  const all = await repo.findAll();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, total: all.length, page, limit };
}

export async function findById(id: number): Promise<Child> {
  const child = await repo.findById(id);
  if (!child) throw new AppError(404, `Niño/a con id ${id} no encontrado`);
  return child;
}

export async function create(dto: repo.CreateChildRepoDto): Promise<Child> {
  // Aquí se podría añadir validación de unicidad con AppError(409, ...)
  return repo.create(dto);
}

export async function update(id: number, dto: repo.UpdateChildRepoDto): Promise<Child> {
  const exists = await repo.findById(id);
  if (!exists) throw new AppError(404, `Niño/a con id ${id} no encontrado`);
  const updated = await repo.update(id, dto);
  return updated!;
}

export async function remove(id: number): Promise<void> {
  const exists = await repo.findById(id);
  if (!exists) throw new AppError(404, `Niño/a con id ${id} no encontrado`);
  await repo.remove(id);
}
