// src/schemas/children.schema.ts — Validación Zod para el recurso Child
import { z } from 'zod';

export const createChildSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es requerido').max(150),
  age: z.number().int().min(1, 'La edad mínima es 1 año').max(6, 'La edad máxima es 6 años'),
  group: z.enum(['párvulos', 'pre-jardín', 'jardín', 'transición']),
  documentId: z.string().min(1, 'El documento es requerido').max(30),
  parentName: z.string().min(1, 'El nombre del acudiente es requerido').max(150),
  parentPhone: z.string().min(7, 'Teléfono inválido').max(20),
  activities: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  staffId: z.number().int().positive('staffId debe ser un entero positivo'),
});

export const updateChildSchema = createChildSchema.partial();

// Tipos inferidos de Zod — no duplican las interfaces generadas por Prisma
export type CreateChildDto = z.infer<typeof createChildSchema>;
export type UpdateChildDto = z.infer<typeof updateChildSchema>;
