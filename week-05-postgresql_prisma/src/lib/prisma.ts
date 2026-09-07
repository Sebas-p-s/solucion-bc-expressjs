// src/lib/prisma.ts — Singleton de PrismaClient
// Evita crear una nueva instancia en cada hot-reload de desarrollo

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env['NODE_ENV'] === 'production' ? ['error'] : ['query', 'warn', 'error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
