import { z } from 'zod';

// Rechaza caracteres HTML (< >) para prevenir XSS almacenado
const noHtml = (label: string) => z.string().regex(/^[^<>]*$/, `${label} must not contain HTML characters`);

export const createChildSchema = z.object({
  body: z.object({
    fullName: noHtml('fullName').min(2, 'fullName must be at least 2 characters').max(150),
    age: z.number().int().min(1, 'Minimum age is 1').max(6, 'Maximum age is 6'),
    group: z.enum(['párvulos', 'pre-jardín', 'jardín', 'transición']),
    documentId: noHtml('documentId').min(3).max(30),
    parentName: noHtml('parentName').min(2).max(150),
    parentPhone: z.string().regex(/^[0-9+\- ]{7,20}$/, 'Invalid phone number'),
    assignedStaff: noHtml('assignedStaff').max(150).optional(),
    activities: z.array(noHtml('activity').max(60)).default([]),
  }),
});

export const updateChildSchema = z.object({
  body: z.object({
    fullName: noHtml('fullName').min(2).max(150).optional(),
    age: z.number().int().min(1).max(6).optional(),
    group: z.enum(['párvulos', 'pre-jardín', 'jardín', 'transición']).optional(),
    parentName: noHtml('parentName').min(2).max(150).optional(),
    parentPhone: z.string().regex(/^[0-9+\- ]{7,20}$/, 'Invalid phone number').optional(),
    assignedStaff: noHtml('assignedStaff').max(150).optional(),
    activities: z.array(noHtml('activity').max(60)).optional(),
    active: z.boolean().optional(),
  }),
});

export type CreateChildDto = z.infer<typeof createChildSchema>['body'];
export type UpdateChildDto = z.infer<typeof updateChildSchema>['body'];
