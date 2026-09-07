// src/repositories/children.repository.ts — Acceso a datos con Prisma
import type { Child } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import type { CreateChildDto, UpdateChildDto } from '../schemas/children.schema';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function findAll(
  page: number,
  limit: number,
): Promise<PaginatedResult<Child>> {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.child.findMany({
      skip,
      take: limit,
      include: { staff: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.child.count(),
  ]);

  return { data, total, page, limit };
}

export async function findById(id: number): Promise<Child | null> {
  return prisma.child.findUnique({
    where: { id },
    include: { staff: true },
  });
}

export async function create(data: CreateChildDto): Promise<Child> {
  try {
    return await prisma.child.create({ data });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Ya existe un niño registrado con ese documento');
    }
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2003') {
      // Foreign key inválida (staffId que no existe)
      throw new AppError(400, 'El staffId indicado no existe');
    }
    throw err;
  }
}

export async function update(id: number, data: UpdateChildDto): Promise<Child> {
  try {
    return await prisma.child.update({ where: { id }, data });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError(404, 'Niño no encontrado');
    }
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Ya existe un niño registrado con ese documento');
    }
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new AppError(400, 'El staffId indicado no existe');
    }
    throw err;
  }
}

export async function remove(id: number): Promise<void> {
  try {
    await prisma.child.delete({ where: { id } });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError(404, 'Niño no encontrado');
    }
    throw err;
  }
}
