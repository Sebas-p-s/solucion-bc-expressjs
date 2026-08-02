// ============================================
// TYPES: Interfaz del recurso principal
// ============================================
// Dominio: Jardín infantil privado
// Recurso principal: Child (niño/niña matriculado en el jardín)
// Las entidades relacionadas del dominio (parents, staff, activities)
// se representan como atributos dentro de Child.

export interface Child {
  id: number;
  fullName: string;          // Nombre completo del niño/niña
  age: number;                // Edad en años
  group: string;               // Salón/grupo: "Párvulos", "Pre-jardín", "Jardín", "Transición"
  parentName: string;          // Nombre del padre/madre/acudiente
  parentPhone: string;         // Teléfono de contacto del acudiente
  assignedStaff: string;        // Nombre de la profesora/cuidador asignado
  activities: string[];        // Actividades extracurriculares en las que participa
  allergies: string | null;    // Alergias conocidas, null si no tiene
  active: boolean;              // true = matrícula activa, false = retirado
  enrollmentDate: string;      // Fecha de matrícula en formato ISO (YYYY-MM-DD)
}

// DTO usado para crear un nuevo niño (sin id, se genera automáticamente)
export type CreateChildDto = Omit<Child, 'id'>;

// DTO para actualización (todos los campos editables)
export type UpdateChildDto = Partial<CreateChildDto>;
