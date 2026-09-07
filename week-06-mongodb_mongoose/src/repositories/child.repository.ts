// ============================================
// REPOSITORY: Child (entidad principal, con populate)
// ============================================

import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';
import { Child } from '../models/child.model';
import { AppError } from '../errors/AppError';
import type { CreateChildDto, UpdateChildDto } from '../schemas/child.schema';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export async function findAll(
  page: number,
  limit: number,
  search?: string,
): Promise<PaginatedResult<unknown>> {
  const skip = (page - 1) * limit;
  const filter = search ? { fullName: { $regex: search, $options: 'i' } } : {};

  const [data, total] = await Promise.all([
    Child.find(filter)
      .populate('assignedStaff')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Child.countDocuments(filter),
  ]);

  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findById(id: string): Promise<unknown> {
  try {
    const child = await Child.findById(id).populate('assignedStaff').lean();
    if (!child) {
      throw new AppError(404, `Child ${id} not found`);
    }
    return child;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) {
      throw new AppError(400, 'ID inválido');
    }
    throw err;
  }
}

export async function create(dto: CreateChildDto): Promise<unknown> {
  try {
    const child = await Child.create(dto);
    return child.toJSON();
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      throw new AppError(409, 'Ya existe un registro con ese valor único');
    }
    if (err instanceof mongoose.Error.CastError) {
      throw new AppError(400, 'assignedStaff no es un ID válido');
    }
    throw err;
  }
}

export async function update(id: string, dto: UpdateChildDto): Promise<unknown> {
  try {
    const child = await Child.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    })
      .populate('assignedStaff')
      .lean();
    if (!child) {
      throw new AppError(404, `Child ${id} not found`);
    }
    return child;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) {
      throw new AppError(400, 'ID inválido');
    }
    if (err instanceof MongoServerError && err.code === 11000) {
      throw new AppError(409, 'Ya existe un registro con ese valor único');
    }
    throw err;
  }
}

export async function remove(id: string): Promise<void> {
  try {
    const child = await Child.findByIdAndDelete(id).lean();
    if (!child) {
      throw new AppError(404, `Child ${id} not found`);
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) {
      throw new AppError(400, 'ID inválido');
    }
    throw err;
  }
}
