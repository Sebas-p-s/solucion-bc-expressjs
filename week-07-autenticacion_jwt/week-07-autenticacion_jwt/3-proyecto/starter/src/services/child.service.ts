import mongoose from 'mongoose';
import { IChild } from '../models/child.model';
import * as childRepository from '../repositories/child.repository';
import { CreateChildDto, UpdateChildDto } from '../schemas/child.schema';
import { AppError } from '../errors/AppError';

// ============================================
// SERVICIO DEL RECURSO PRINCIPAL — Child
// ============================================

function assertValidId(id: string): void {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'Id de niño inválido');
}

export async function getAll(): Promise<IChild[]> {
  return childRepository.findAll();
}

export async function getById(id: string): Promise<IChild> {
  assertValidId(id);
  const child = await childRepository.findById(id);
  if (!child) throw new AppError(404, 'Niño no encontrado');
  return child;
}

export async function create(dto: CreateChildDto, userId: string): Promise<IChild> {
  try {
    return await childRepository.create({ ...dto, createdBy: userId });
  } catch (err) {
    // 11000 = clave duplicada de MongoDB (documentId único)
    if ((err as { code?: number }).code === 11000) {
      throw new AppError(409, 'Ya existe un niño matriculado con ese documento');
    }
    throw err;
  }
}

export async function update(id: string, dto: UpdateChildDto): Promise<IChild> {
  await getById(id); // lanza 400 / 404 si no existe
  const updated = await childRepository.updateById(id, dto);
  if (!updated) throw new AppError(404, 'Niño no encontrado');
  return updated;
}

export async function remove(id: string): Promise<void> {
  assertValidId(id);
  const deleted = await childRepository.deleteById(id);
  if (!deleted) throw new AppError(404, 'Niño no encontrado');
}
