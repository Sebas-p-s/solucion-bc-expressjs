// ============================================
// SCHEMAS — validación del recurso Child con Zod
// ============================================
import { z } from 'zod';

// Al menos 3 campos obligatorios con validaciones de tipo/rango,
// 1 con mensaje de error personalizado, 1 numérico .positive(),
// y campos opcionales/.default()
export const createChildSchema = z.object({
  fullName: z
    .string({ error: 'fullName es obligatorio' })
    .min(1, 'fullName no puede estar vacío')
    .trim(),
  birthDate: z
    .string({ error: 'birthDate es obligatorio' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate debe tener formato YYYY-MM-DD'),
  guardianName: z
    .string({ error: 'guardianName es obligatorio' })
    .min(1, 'guardianName no puede estar vacío')
    .trim(),
  monthlyFee: z
    .number({ error: 'monthlyFee es obligatorio' })
    .positive('monthlyFee debe ser mayor a 0'),
  allergies: z.string().trim().default('Ninguna'),
  active: z.boolean().default(true),
});

// Reutiliza createChildSchema con .partial() para actualizaciones parciales
export const updateChildSchema = createChildSchema.partial();

// Tipos inferidos desde los schemas (single source of truth)
export type CreateChildDto = z.infer<typeof createChildSchema>;
export type UpdateChildDto = z.infer<typeof updateChildSchema>;
