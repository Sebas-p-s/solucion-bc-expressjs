// ============================================
// TYPES — recurso principal: Child (niño/a del jardín)
// ============================================

export interface Child {
  id: number;
  fullName: string;      // nombre completo del niño/a
  birthDate: string;     // formato YYYY-MM-DD
  guardianName: string;  // nombre del padre/madre/acudiente
  monthlyFee: number;    // valor de la mensualidad
  allergies: string;     // alergias conocidas, "Ninguna" por defecto
  active: boolean;       // si sigue matriculado/a
  createdAt: Date;
}

// Tipos de respuesta genéricos — no necesitan cambio
export interface SingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ValidationErrorResponse {
  error: string;
  message: string;
  issues: Array<{ field: string; message: string }>;
}

export interface ErrorResponse {
  error: string;
  message: string;
  stack?: string;
}
