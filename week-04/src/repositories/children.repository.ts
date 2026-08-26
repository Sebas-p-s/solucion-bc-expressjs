// ============================================
// REPOSITORY — capa de acceso a datos (en memoria)
// ============================================
import { Child } from '../types';

export type CreateChildRepoDto = Omit<Child, 'id' | 'createdAt'>;
export type UpdateChildRepoDto = Partial<CreateChildRepoDto>;

let children: Child[] = [
  {
    id: 1,
    fullName: 'Mariana Gómez Ríos',
    birthDate: '2021-03-14',
    guardianName: 'Laura Ríos',
    monthlyFee: 350000,
    allergies: 'Ninguna',
    active: true,
    createdAt: new Date(),
  },
  {
    id: 2,
    fullName: 'Samuel Torres Peña',
    birthDate: '2020-11-02',
    guardianName: 'Carlos Torres',
    monthlyFee: 350000,
    allergies: 'Maní',
    active: true,
    createdAt: new Date(),
  },
  {
    id: 3,
    fullName: 'Valentina Ruiz Cano',
    birthDate: '2022-01-20',
    guardianName: 'Diana Cano',
    monthlyFee: 380000,
    allergies: 'Ninguna',
    active: true,
    createdAt: new Date(),
  },
];

let nextId = 4;

// Todos los métodos son async y hacen copias defensivas ({ ...child })

export async function findAll(): Promise<Child[]> {
  return [...children];
}

export async function findById(id: number): Promise<Child | undefined> {
  return children.find((c) => c.id === id);
}

export async function create(dto: CreateChildRepoDto): Promise<Child> {
  const child: Child = { id: nextId++, ...dto, createdAt: new Date() };
  children.push(child);
  return { ...child };
}

export async function update(id: number, dto: UpdateChildRepoDto): Promise<Child | undefined> {
  const index = children.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  children[index] = { ...children[index]!, ...dto };
  return { ...children[index]! };
}

export async function remove(id: number): Promise<boolean> {
  const index = children.findIndex((c) => c.id === id);
  if (index === -1) return false;
  children.splice(index, 1);
  return true;
}
