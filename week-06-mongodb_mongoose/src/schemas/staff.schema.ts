// ============================================
// SCHEMA ZOD: Staff (entidad secundaria)
// ============================================

import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  role: z.enum(['profesora', 'auxiliar', 'coordinadora']),
  phone: z.string().min(7, 'Teléfono inválido').max(20),
  email: z.string().email('Correo inválido').max(150),
});

export const updateStaffSchema = createStaffSchema.partial();

export type CreateStaffDto = z.infer<typeof createStaffSchema>;
export type UpdateStaffDto = z.infer<typeof updateStaffSchema>;
