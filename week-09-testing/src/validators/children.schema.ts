import { z } from 'zod';

const group = z.enum(['párvulos', 'pre-jardín', 'jardín', 'transición']);
const phone = z.string().regex(/^[0-9+\- ]{7,20}$/, 'Invalid phone number');

export const createChildSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(150),
    age: z.number().int().min(1).max(6),
    group,
    documentId: z.string().min(3).max(30),
    parentName: z.string().min(2).max(150),
    parentPhone: phone,
    assignedStaff: z.string().max(150).optional(),
    activities: z.array(z.string().max(60)).optional(),
  }),
});

export const updateChildSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(150).optional(),
    age: z.number().int().min(1).max(6).optional(),
    group: group.optional(),
    parentName: z.string().min(2).max(150).optional(),
    parentPhone: phone.optional(),
    assignedStaff: z.string().max(150).optional(),
    activities: z.array(z.string().max(60)).optional(),
    active: z.boolean().optional(),
  }),
});

export const childIdSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid MongoDB ID'),
  }),
});

export const listChildrenSchema = z.object({
  query: z.object({ group: group.optional() }),
});
