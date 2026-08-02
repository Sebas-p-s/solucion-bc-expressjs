import type { Child, CreateChildDto, UpdateChildDto } from './types.js';

// Store en memoria — simula una base de datos sin persistencia
// Los datos se pierden al reiniciar el servidor (se usará BD a partir de week-05)
const children: Child[] = [
  {
    id: 1,
    fullName: 'Sofía Ramírez',
    age: 4,
    group: 'Pre-jardín',
    parentName: 'Laura Ramírez',
    parentPhone: '3011234567',
    assignedStaff: 'Profesora Ana Torres',
    activities: ['pintura', 'música'],
    allergies: null,
    active: true,
    enrollmentDate: '2025-02-01',
  },
  {
    id: 2,
    fullName: 'Mateo Gómez',
    age: 3,
    group: 'Párvulos',
    parentName: 'Carlos Gómez',
    parentPhone: '3109876543',
    assignedStaff: 'Profesora Ana Torres',
    activities: ['motricidad'],
    allergies: 'maní',
    active: true,
    enrollmentDate: '2025-01-20',
  },
];
let nextId = 3;

// Retorna todos los niños registrados
export function getAll(): Child[] {
  return children;
}

// Busca y retorna un niño por id, o undefined si no existe
export function getById(id: number): Child | undefined {
  return children.find((child) => child.id === id);
}

// Crea un nuevo niño con id autoincremental y lo agrega al store
export function create(data: CreateChildDto): Child {
  const newChild: Child = { id: nextId++, ...data };
  children.push(newChild);
  return newChild;
}

// Actualiza los campos de un niño existente; retorna undefined si no existe
export function update(id: number, data: UpdateChildDto): Child | undefined {
  const child = getById(id);
  if (!child) {
    return undefined;
  }
  Object.assign(child, data);
  return child;
}

// Elimina un niño del store; retorna true si existía, false si no
export function remove(id: number): boolean {
  const index = children.findIndex((child) => child.id === id);
  if (index === -1) {
    return false;
  }
  children.splice(index, 1);
  return true;
}
