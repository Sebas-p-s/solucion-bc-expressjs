// ============================================
// REPOSITORY — Capa de acceso a datos
// ============================================
// Reglas de esta capa:
// - Único punto de acceso al store (array en memoria)
// - Todos los métodos son async Promise<T>
// - Retorna copias defensivas (no la referencia interna)
// - Si no encuentra un elemento, retorna undefined

import { Child, CreateChildDto, UpdateChildDto } from '../types';

const store: Child[] = [
  {
    id: 1,
    fullName: 'Sofía Ramírez',
    age: 4,
    group: 'Pre-jardín',
    parentName: 'Laura Ramírez',
    parentPhone: '3011234567',
    assignedStaff: 'Profesora Ana Torres',
    activities: ['pintura', 'música'],
    active: true,
    createdAt: new Date('2025-02-01').toISOString(),
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
    active: true,
    createdAt: new Date('2025-01-20').toISOString(),
  },
  {
    id: 3,
    fullName: 'Valeria Pérez',
    age: 5,
    group: 'Transición',
    parentName: 'Diana Pérez',
    parentPhone: '3001112233',
    assignedStaff: 'Profesora Camila Ruiz',
    activities: ['danza'],
    active: true,
    createdAt: new Date('2025-03-10').toISOString(),
  },
  {
    id: 4,
    fullName: 'Samuel Torres',
    age: 4,
    group: 'Jardín',
    parentName: 'Andrea Torres',
    parentPhone: '3157894561',
    assignedStaff: 'Profesor David León',
    activities: ['música', 'deporte'],
    active: false,
    createdAt: new Date('2024-11-05').toISOString(),
  },
];
let nextId = 5;

export async function findAll(): Promise<Child[]> {
  return [...store];
}

export async function findById(id: number): Promise<Child | undefined> {
  const child = store.find((item) => item.id === id);
  return child ? { ...child } : undefined;
}

export async function create(dto: CreateChildDto): Promise<Child> {
  const child: Child = { id: nextId++, ...dto, createdAt: new Date().toISOString() };
  store.push(child);
  return { ...child };
}

export async function update(id: number, dto: UpdateChildDto): Promise<Child | undefined> {
  const index = store.findIndex((item) => item.id === id);
  if (index === -1) return undefined;
  store[index] = { ...store[index]!, ...dto };
  return { ...store[index]! };
}

export async function remove(id: number): Promise<boolean> {
  const index = store.findIndex((item) => item.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}
