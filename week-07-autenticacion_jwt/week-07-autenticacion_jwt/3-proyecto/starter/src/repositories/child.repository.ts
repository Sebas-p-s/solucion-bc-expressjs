import mongoose from 'mongoose';
import { ChildModel, IChild } from '../models/child.model';
import { CreateChildDto, UpdateChildDto } from '../schemas/child.schema';

// ============================================
// REPOSITORIO DEL RECURSO PRINCIPAL — Child
// ============================================

export async function findAll(): Promise<IChild[]> {
  // Solo los niños activos, los más recientes primero
  return ChildModel.find({ active: true }).sort({ createdAt: -1 });
}

export async function findById(id: string): Promise<IChild | null> {
  return ChildModel.findById(id);
}

export async function create(
  data: CreateChildDto & { createdBy: string }
): Promise<IChild> {
  return ChildModel.create({
    ...data,
    createdBy: new mongoose.Types.ObjectId(data.createdBy),
  });
}

export async function updateById(
  id: string,
  data: UpdateChildDto
): Promise<IChild | null> {
  return ChildModel.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
  });
}

export async function deleteById(id: string): Promise<boolean> {
  const deleted = await ChildModel.findByIdAndDelete(id);
  return deleted !== null;
}
