// ============================================
// SCHEMA ZOD: Child (entidad principal, con ref a Staff)
// ============================================

import { z } from 'zod';

// ObjectId: 24 caracteres hexadecimales
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z.string().regex(objectIdRegex, 'ID inválido');

export const createChildSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es requerido').max(150),
  age: z.number().int().min(1, 'La edad mínima es 1 año').max(6, 'La edad máxima es 6 años'),
  group: z.enum(['párvulos', 'pre-jardín', 'jardín', 'transición']),
  parentName: z.string().min(1, 'El nombre del acudiente es requerido').max(150),
  parentPhone: z.string().min(7, 'Teléfono inválido').max(20),
  activities: z.array(z.string()).default([]),
  active: z.boolean().default(true),

  // Campo de referencia — debe ser un ObjectId válido de Staff
  assignedStaff: z.string().regex(objectIdRegex, 'ID de staff inválido'),
});

export const updateChildSchema = createChildSchema.partial();

export type CreateChildDto = z.infer<typeof createChildSchema>;
export type UpdateChildDto = z.infer<typeof updateChildSchema>;
