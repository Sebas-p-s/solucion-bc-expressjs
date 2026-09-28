export type UserRole = 'user' | 'admin';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

// ============================================================
// Dominio: Jardín infantil privado — recurso principal: Child
// ============================================================

export type ChildGroup = 'párvulos' | 'pre-jardín' | 'jardín' | 'transición';

export interface CreateChildDto {
  fullName: string;
  age: number;
  group: ChildGroup;
  documentId: string;
  parentName: string;
  parentPhone: string;
  assignedStaff?: string;
  activities?: string[];
}

export interface UpdateChildDto {
  fullName?: string;
  age?: number;
  group?: ChildGroup;
  parentName?: string;
  parentPhone?: string;
  assignedStaff?: string;
  activities?: string[];
  active?: boolean;
}

export interface ChildFilters {
  group?: ChildGroup;
  createdBy?: string;
}
