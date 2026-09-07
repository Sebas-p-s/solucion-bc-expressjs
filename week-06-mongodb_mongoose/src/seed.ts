// ============================================
// SEED — Insertar datos de prueba
// Dominio: Jardín infantil privado
// ============================================
// Regla: insertar la entidad SECUNDARIA (Staff) primero,
// luego la PRINCIPAL (Child) usando los _id del Staff.

import 'dotenv/config';
import { connectDB, disconnectDB } from './lib/mongoose';
import { Staff } from './models/staff.model';
import { Child } from './models/child.model';

async function seed(): Promise<void> {
  await connectDB();

  // Limpiar colecciones (orden inverso: principal primero, luego secundaria)
  await Child.deleteMany({});
  await Staff.deleteMany({});
  console.log('Collections cleared');

  // Paso A — Insertar Staff y capturar _id
  const [anaTorres, camilaRuiz, davidLeon] = await Staff.insertMany([
    {
      name: 'Ana Torres',
      role: 'profesora',
      phone: '3011234567',
      email: 'ana.torres@jardin.edu.co',
    },
    {
      name: 'Camila Ruiz',
      role: 'profesora',
      phone: '3001112233',
      email: 'camila.ruiz@jardin.edu.co',
    },
    {
      name: 'David León',
      role: 'coordinadora',
      phone: '3157894561',
      email: 'david.leon@jardin.edu.co',
    },
  ]);
  console.log('Staff insertado');

  // Paso B — Insertar Children referenciando el _id del Staff asignado
  await Child.insertMany([
    {
      fullName: 'Sofía Ramírez',
      age: 4,
      group: 'pre-jardín',
      parentName: 'Laura Ramírez',
      parentPhone: '3011234567',
      activities: ['pintura', 'música'],
      active: true,
      assignedStaff: anaTorres!._id,
    },
    {
      fullName: 'Mateo Gómez',
      age: 3,
      group: 'párvulos',
      parentName: 'Carlos Gómez',
      parentPhone: '3109876543',
      activities: ['motricidad'],
      active: true,
      assignedStaff: anaTorres!._id,
    },
    {
      fullName: 'Valeria Pérez',
      age: 5,
      group: 'transición',
      parentName: 'Diana Pérez',
      parentPhone: '3001112233',
      activities: ['danza'],
      active: true,
      assignedStaff: camilaRuiz!._id,
    },
    {
      fullName: 'Samuel Torres',
      age: 4,
      group: 'jardín',
      parentName: 'Andrea Torres',
      parentPhone: '3157894561',
      activities: ['música', 'deporte'],
      active: false,
      assignedStaff: davidLeon!._id,
    },
    {
      fullName: 'Emma Castro',
      age: 4,
      group: 'jardín',
      parentName: 'Julián Castro',
      parentPhone: '3201234567',
      activities: ['pintura'],
      active: true,
      assignedStaff: camilaRuiz!._id,
    },
  ]);
  console.log('Children insertados');

  console.log('Seed completado exitosamente');
  await disconnectDB();
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
