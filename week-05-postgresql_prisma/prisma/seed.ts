// prisma/seed.ts — Datos iniciales del dominio: Jardín infantil privado
// Ejecutar con: pnpm dlx prisma db seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed...');

  // 1. Limpiar datos existentes (idempotencia) — principal primero por la FK
  await prisma.child.deleteMany();
  await prisma.staff.deleteMany();
  console.log('🧹 Colecciones limpiadas');

  // 2. Crear el recurso secundario (Staff) primero
  const anaTorres = await prisma.staff.create({
    data: {
      name: 'Ana Torres',
      role: 'profesora',
      phone: '3011234567',
      email: 'ana.torres@jardin.edu.co',
    },
  });

  const camilaRuiz = await prisma.staff.create({
    data: {
      name: 'Camila Ruiz',
      role: 'profesora',
      phone: '3001112233',
      email: 'camila.ruiz@jardin.edu.co',
    },
  });

  const davidLeon = await prisma.staff.create({
    data: {
      name: 'David León',
      role: 'coordinadora',
      phone: '3157894561',
      email: 'david.leon@jardin.edu.co',
    },
  });
  console.log('✅ 3 miembros del staff creados');

  // 3. Crear el recurso principal (Child) referenciando el staff creado
  const result = await prisma.child.createMany({
    data: [
      {
        fullName: 'Sofía Ramírez',
        age: 4,
        group: 'pre-jardín',
        documentId: 'RC-0001',
        parentName: 'Laura Ramírez',
        parentPhone: '3011234567',
        activities: ['pintura', 'música'],
        active: true,
        staffId: anaTorres.id,
      },
      {
        fullName: 'Mateo Gómez',
        age: 3,
        group: 'párvulos',
        documentId: 'RC-0002',
        parentName: 'Carlos Gómez',
        parentPhone: '3109876543',
        activities: ['motricidad'],
        active: true,
        staffId: anaTorres.id,
      },
      {
        fullName: 'Valeria Pérez',
        age: 5,
        group: 'transición',
        documentId: 'RC-0003',
        parentName: 'Diana Pérez',
        parentPhone: '3001112233',
        activities: ['danza'],
        active: true,
        staffId: camilaRuiz.id,
      },
      {
        fullName: 'Samuel Torres',
        age: 4,
        group: 'jardín',
        documentId: 'RC-0004',
        parentName: 'Andrea Torres',
        parentPhone: '3157894561',
        activities: ['música', 'deporte'],
        active: false,
        staffId: davidLeon.id,
      },
      {
        fullName: 'Emma Castro',
        age: 4,
        group: 'jardín',
        documentId: 'RC-0005',
        parentName: 'Julián Castro',
        parentPhone: '3201234567',
        activities: ['pintura'],
        active: true,
        staffId: camilaRuiz.id,
      },
    ],
  });
  console.log(`✅ ${result.count} niños creados`);

  console.log('🌱 Seed completado exitosamente');
}

main()
  .catch((err: unknown) => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
