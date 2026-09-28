import { z } from 'zod';

// ============================================
// SCHEMA DEL RECURSO PRINCIPAL — Jardín infantil privado
// ============================================

const groups = ['párvulos', 'pre-jardín', 'jardín', 'transición'] as const;

export const createChildSchema = z.object({
  fullName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  age: z.number().int().min(1, 'La edad mínima es 1').max(6, 'La edad máxima es 6'),
  group: z.enum(groups),
  documentId: z.string().trim().min(3, 'El documento debe tener al menos 3 caracteres').max(30),
  parentName: z.string().trim().min(2, 'El nombre del acudiente debe tener al menos 2 caracteres').max(150),
  parentPhone: z.string().regex(/^[0-9+\- ]{7,20}$/, 'Teléfono inválido'),
  assignedStaff: z.string().trim().max(150).optional(),
  activities: z.array(z.string().trim().max(60)).default([]),
});

// Actualización parcial: todos los campos opcionales.
// documentId no se puede cambiar una vez matriculado el niño.
export const updateChildSchema = createChildSchema
  .omit({ documentId: true })
  .partial()
  .extend({ active: z.boolean().optional() });

export type CreateChildDto = z.infer<typeof createChildSchema>;
export type UpdateChildDto = z.infer<typeof updateChildSchema>;
