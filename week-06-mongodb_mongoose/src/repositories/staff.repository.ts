// ============================================
// REPOSITORY: Staff (entidad secundaria)
// ============================================

import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';
import { Staff } from '../models/staff.model';
import { AppError } from '../errors/AppError';
import type { CreateStaffDto, UpdateStaffDto } from '../schemas/staff.schema';

export async function findAll(): Promise<unknown[]> {
  return Staff.find().sort({ name: 1 }).lean();
}

export async function findById(id: string): Promise<unknown> {
  try {
    const staff = await Staff.findById(id).lean();
    if (!staff) {
      throw new AppError(404, `Staff ${id} not found`);
    }
    return staff;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) {
      throw new AppError(400, 'ID inválido');
    }
    throw err;
  }
}

export async function create(dto: CreateStaffDto): Promise<unknown> {
  try {
    const staff = await Staff.create(dto);
    return staff.toJSON();
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      throw new AppError(409, 'Ya existe un miembro del staff con ese correo');
    }
    throw err;
  }
}

export async function update(id: string, dto: UpdateStaffDto): Promise<unknown> {
  try {
    const staff = await Staff.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    }).lean();
    if (!staff) {
      throw new AppError(404, `Staff ${id} not found`);
    }
    return staff;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) {
      throw new AppError(400, 'ID inválido');
    }
    if (err instanceof MongoServerError && err.code === 11000) {
      throw new AppError(409, 'Ya existe un miembro del staff con ese correo');
    }
    throw err;
  }
}

export async function remove(id: string): Promise<void> {
  try {
    const staff = await Staff.findByIdAndDelete(id).lean();
    if (!staff) {
      throw new AppError(404, `Staff ${id} not found`);
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) {
      throw new AppError(400, 'ID inválido');
    }
    throw err;
  }
}
