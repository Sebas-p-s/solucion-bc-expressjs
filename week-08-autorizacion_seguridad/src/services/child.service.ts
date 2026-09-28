import mongoose from 'mongoose';
import { Child, IChild } from '../models/child.model.js';
import { AppError } from '../errors/AppError.js';
import type { CreateChildDto, UpdateChildDto } from '../schemas/child.schema.js';

function assertValidId(id: string): void {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'Invalid child id');
}

export async function findAll(): Promise<IChild[]> {
  return Child.find({ active: true }).sort({ createdAt: -1 });
}

export async function findById(id: string): Promise<IChild | null> {
  assertValidId(id);
  return Child.findById(id);
}

export async function create(data: CreateChildDto, userId: string): Promise<IChild> {
  try {
    return await Child.create({ ...data, createdBy: userId });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw new AppError(409, 'A child with that documentId is already registered');
    }
    throw err;
  }
}

export async function update(
  id: string,
  data: UpdateChildDto,
  requesterId: string,
  requesterRole: string
): Promise<IChild | null> {
  assertValidId(id);
  const child = await Child.findById(id);
  if (!child) return null;

  // Solo el dueño (quien matriculó al niño) o un admin puede editarlo
  if (requesterRole !== 'admin' && child.createdBy !== requesterId) {
    throw new AppError(403, 'You can only update children you registered');
  }

  return Child.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
}

export async function remove(id: string): Promise<IChild | null> {
  assertValidId(id);
  return Child.findByIdAndDelete(id);
}
