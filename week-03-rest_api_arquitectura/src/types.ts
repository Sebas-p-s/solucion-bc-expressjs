// ============================================
// TYPES — Dominio: Jardín infantil privado
// ============================================
// Recurso principal: Child (niño/niña matriculado)
// Entidades relacionadas (parents, staff, activities) están representadas
// como atributos de Child.

export interface Child {
  id: number;
  fullName: string;        // Nombre completo del niño/niña
  age: number;               // Edad en años
  group: string;              // "Párvulos" | "Pre-jardín" | "Jardín" | "Transición"
  parentName: string;         // Nombre del padre/madre/acudiente
  parentPhone: string;        // Teléfono de contacto del acudiente
  assignedStaff: string;       // Profesora/cuidador asignado
  activities: string[];       // Actividades extracurriculares
  active: boolean;             // true = matrícula activa, false = retirado
  createdAt: string;          // Fecha de creación del registro (ISO)
}

// DTO para crear — sin campos auto-generados
export type CreateChildDto = Omit<Child, 'id' | 'createdAt'>;

// DTO para actualizar — todos los campos opcionales
export type UpdateChildDto = Partial<CreateChildDto>;

// Contratos de respuesta (no cambiar nombres — son genéricos)
export interface SingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
