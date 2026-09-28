import { AppError } from '../errors/AppError.js';
import type { ChildFilters, CreateChildDto, UpdateChildDto } from '../types/index.js';
import type { IChild } from '../models/child.model.js';
import * as childrenRepo from '../repositories/children.repository.js';

// ============================================================
// CHILDREN SERVICE — lógica de negocio del jardín infantil
// ============================================================
// Reglas de dominio:
//   - La edad de un niño debe estar entre 1 y 6 años
//   - El documentId (registro civil / T.I.) es único
//   - Solo quien matriculó al niño o un admin puede editarlo/eliminarlo
// ============================================================

const MIN_AGE = 1;
const MAX_AGE = 6;

function assertValidAge(age: number): void {
  if (age < MIN_AGE || age > MAX_AGE) {
    throw new AppError(400, `Age must be between ${MIN_AGE} and ${MAX_AGE} years`);
  }
}

export async function getAll(filters: ChildFilters = {}): Promise<IChild[]> {
  return childrenRepo.findAllChildren(filters);
}

export async function getById(id: string): Promise<IChild> {
  const child = await childrenRepo.findChildById(id);
  if (!child) throw new AppError(404, 'Child not found');
  return child;
}

export async function create(dto: CreateChildDto, createdBy: string): Promise<IChild> {
  assertValidAge(dto.age);

  const duplicated = await childrenRepo.findChildByDocumentId(dto.documentId);
  if (duplicated) throw new AppError(409, 'A child with that documentId is already registered');

  return childrenRepo.createChild(dto, createdBy);
}

export async function update(
  id: string,
  dto: UpdateChildDto,
  requesterId: string,
  requesterRole: string,
): Promise<IChild> {
  const existing = await childrenRepo.findChildById(id);
  if (!existing) throw new AppError(404, 'Child not found');

  // Solo el creador o un admin puede actualizar
  if (existing.createdBy !== requesterId && requesterRole !== 'admin') {
    throw new AppError(403, 'Insufficient permissions');
  }

  if (dto.age !== undefined) assertValidAge(dto.age);

  const updated = await childrenRepo.updateChild(id, dto);
  if (!updated) throw new AppError(404, 'Child not found');
  return updated;
}

export async function remove(id: string, requesterId: string, requesterRole: string): Promise<void> {
  const existing = await childrenRepo.findChildById(id);
  if (!existing) throw new AppError(404, 'Child not found');

  // Solo el creador o un admin puede eliminar
  if (existing.createdBy !== requesterId && requesterRole !== 'admin') {
    throw new AppError(403, 'Insufficient permissions');
  }

  await childrenRepo.deleteChild(id);
}
