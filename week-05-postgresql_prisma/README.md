# Proyecto Semana 05 — API con PostgreSQL y Prisma ORM: Jardín Infantil Privado

**Autor:** Juan Sebastián Pachón Sandoval
**Documento:** 3228973B
**Dominio asignado (`bc-expressjs`):** Jardín infantil privado
**Entidades del dominio:** children, parents, staff, activities

## 🎯 Descripción

API REST en **Express 5 + TypeScript + Prisma ORM + PostgreSQL**, migrando
el almacenamiento en memoria de semanas anteriores a una base de datos
relacional real, con migraciones versionadas y manejo de errores de Prisma.

## 🗂️ Modelo de datos

**Entidad secundaria — `Staff`** (relación 1:N con `Child`):
```prisma
model Staff {
  id        Int      @id @default(autoincrement())
  name      String
  role      String   // "profesora" | "auxiliar" | "coordinadora"
  phone     String
  email     String   @unique
  children  Child[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Entidad principal — `Child`** (con FK a `Staff`):
```prisma
model Child {
  id          Int      @id @default(autoincrement())
  fullName    String
  age         Int
  group       String   // "párvulos" | "pre-jardín" | "jardín" | "transición"
  documentId  String   @unique   // registro civil / T.I. del niño
  parentName  String
  parentPhone String
  activities  String[]
  active      Boolean  @default(true)
  staff       Staff    @relation(fields: [staffId], references: [id])
  staffId     Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

`parentName`/`parentPhone` (padres) y `activities` (actividades) se
modelaron como atributos de `Child`. `staff` es la relación 1:N real,
igual al patrón Hospital→Patient/Doctor sugerido en el enunciado.

## 🚀 Endpoints (`/api/v1/children`)

| Método | Ruta | Status | Descripción |
|---|---|---|---|
| GET | `/api/v1/children?page=1&limit=10` | 200 | Listado paginado con `include: { staff: true }` |
| GET | `/api/v1/children/:id` | 200/404 | Detalle con relación al staff |
| POST | `/api/v1/children` | 201/400/409 | Crear (Zod + P2002 duplicado) |
| PUT | `/api/v1/children/:id` | 200/404/409 | Actualizar |
| DELETE | `/api/v1/children/:id` | 204/404 | Eliminar |

### Contratos de respuesta

```json
// GET /children?page=1&limit=10 → 200
{ "data": [ { "id": 1, "fullName": "Sofía Ramírez", "...": "...", "staff": { "id": 1, "name": "Ana Torres", "...": "..." } } ], "total": 5, "page": 1, "limit": 10 }

// POST /children con documentId duplicado → 409
{ "status": "error", "message": "Ya existe un niño registrado con ese documento" }

// GET /children/:id inexistente → 404
{ "status": "error", "message": "Niño no encontrado" }

// POST /children con staffId inexistente → 400
{ "status": "error", "message": "El staffId indicado no existe" }
```

## ⚠️ Manejo de errores Prisma

| Código Prisma | Situación | Respuesta |
|---|---|---|
| `P2002` | `documentId` o `email` (staff) duplicado | `AppError(409, ...)` |
| `P2025` | `update`/`delete` sobre un `id` que no existe | `AppError(404, ...)` |
| `P2003` | `staffId` que no existe (FK inválida) | `AppError(400, ...)` |
| Zod inválido | body mal formado | `400` directo desde el controller |

## 🧪 Cómo correr el proyecto

```bash
docker compose up -d                       # levanta PostgreSQL
cp .env.example .env
pnpm install                                 # o npm install (ejecuta `prisma generate`)
pnpm dlx prisma migrate dev --name init       # crea prisma/migrations/ y aplica el schema
pnpm dlx prisma db seed                        # inserta 3 Staff + 5 Children
pnpm dev                                        # arranca el servidor
```

## 🧪 Pruebas con curl

```bash
# Listar (paginado, con staff incluido)
curl "http://localhost:3000/api/v1/children?page=1&limit=2"

# Obtener por ID
curl http://localhost:3000/api/v1/children/1

# Crear (usa un staffId real que veas en el listado, ej. 1)
curl -X POST http://localhost:3000/api/v1/children \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Nuevo Niño","age":4,"group":"jardín","documentId":"RC-0006","parentName":"Padre Ejemplo","parentPhone":"3000000000","activities":["pintura"],"active":true,"staffId":1}'

# documentId duplicado → 409
curl -X POST http://localhost:3000/api/v1/children \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Otro","age":4,"group":"jardín","documentId":"RC-0001","parentName":"Test","parentPhone":"3000000000","staffId":1}'

# staffId inexistente → 400
curl -X POST http://localhost:3000/api/v1/children \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Otro","age":4,"group":"jardín","documentId":"RC-0099","parentName":"Test","parentPhone":"3000000000","staffId":999}'

# Actualizar
curl -X PUT http://localhost:3000/api/v1/children/1 -H "Content-Type: application/json" -d '{"age":5}'

# Eliminar
curl -X DELETE http://localhost:3000/api/v1/children/4
```

## 📌 Decisiones de diseño

- **Tipos derivados de Prisma Client** (`import type { Child } from '@prisma/client'`)
  en vez de duplicar interfaces — solo se define un DTO propio con Zod
  (`CreateChildDto`/`UpdateChildDto`) para la validación de entrada, tal
  como pide la rúbrica.
- **Singleton de `PrismaClient`** en `src/lib/prisma.ts` con el patrón
  `globalForPrisma`, evitando múltiples conexiones en hot-reload.
- **`staffId` como scalar FK directo** en el DTO (en vez de `connect`
  anidado) — Prisma acepta ambas formas cuando el campo escalar de la
  relación está declarado explícitamente en el schema.
- **`documentId` como campo único** del niño (registro civil/T.I.) para
  demostrar `P2002`, separado del `email` único de `Staff`.
- **Winston** (`src/config/logger.ts`, dado) se usa en `server.ts` en
  lugar de `console.log`, y `prisma.$disconnect()` se llama en el
  graceful shutdown (`SIGTERM`/`SIGINT`).

## ⚠️ Nota de verificación

Para armar esta solución instalé PostgreSQL real (no memoria) y levanté
una instancia con el mismo usuario/contraseña/base que el
`docker-compose.yml` del proyecto. Sin embargo, **no pude ejecutar
`prisma generate` ni `prisma migrate dev` en el entorno donde trabajo**:
el CLI de Prisma necesita descargar su motor (`schema-engine`) desde
`binaries.prisma.sh`, un dominio bloqueado por la configuración de red de
este entorno — no es una limitación de tu máquina ni del proyecto en sí,
sino específica de este sandbox. En una máquina normal (la tuya, sin
restricciones de red) `pnpm install` descarga ese motor sin problema.

Revisé cada archivo manualmente contra la documentación de Prisma
(`findMany`/`count`/`create`/`update`/`delete`, códigos `P2002`/`P2025`/
`P2003`, `include`, scalar FK en `ChildUncheckedCreateInput`) para
minimizar el riesgo de errores, pero **es importante que corras tú mismo
`pnpm install`, `prisma migrate dev --name init` y `prisma db seed`**
antes de dar por buena la entrega, y me avises si algo no compila o no
corre como se espera para corregirlo de inmediato.
