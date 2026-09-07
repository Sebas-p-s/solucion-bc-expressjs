// ============================================
// SERVICE: Child (delega al repositorio)
// ============================================

import * as repo from '../repositories/child.repository';
import type { CreateChildDto, UpdateChildDto } from '../schemas/child.schema';

export async function getAll(page: number, limit: number, search?: string) {
  return repo.findAll(page, limit, search);
}

export async function getById(id: string) {
  return repo.findById(id);
}

export async function createChild(dto: CreateChildDto) {
  return repo.create(dto);
}

export async function updateChild(id: string, dto: UpdateChildDto) {
  return repo.update(id, dto);
}

export async function deleteChild(id: string) {
  return repo.remove(id);
}
