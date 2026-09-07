# Proyecto Semana 06 — API REST con MongoDB + Mongoose: Jardín Infantil Privado

**Autor:** Juan Sebastián Pachón Sandoval
**Documento:** 3228973B
**Dominio asignado (`bc-expressjs`):** Jardín infantil privado
**Entidades del dominio:** children, parents, staff, activities

## 🎯 Descripción

API REST en **Express 5 + TypeScript + Mongoose + MongoDB** con dos
entidades relacionadas:

| Entidad | Tipo | Descripción |
|---|---|---|
| **Staff** | Secundaria (sin referencias) | Profesoras/coordinadoras del jardín |
| **Child** | Principal (referencia a Staff) | Niños matriculados, cada uno con un `assignedStaff` |

`parentName`/`parentPhone` (padres) y `activities` (actividades) se
modelaron como atributos dentro de `Child`, ya que el alcance del
proyecto pide solo dos entidades relacionadas.

## 🗂️ Modelos

**Staff** (`src/models/staff.model.ts`):
```ts
interface IStaff {
  name: string;
  role: 'profesora' | 'auxiliar' | 'coordinadora';
  phone: string;
  email: string;   // único
}
```

**Child** (`src/models/child.model.ts`):
```ts
interface IChild {
  fullName: string;
  age: number;               // 1 a 6 años
  group: 'párvulos' | 'pre-jardín' | 'jardín' | 'transición';
  parentName: string;
  parentPhone: string;
  activities: string[];
  active: boolean;
  assignedStaff: ObjectId;   // referencia a Staff
}
```

## 🚀 Endpoints

**Staff** (`/api/v1/staff`) — CRUD simple:
| Método | Ruta | Status |
|---|---|---|
| GET | `/api/v1/staff` | 200 |
| GET | `/api/v1/staff/:id` | 200/404 |
| POST | `/api/v1/staff` | 201/409 (email duplicado) |
| PUT | `/api/v1/staff/:id` | 200/404/409 |
| DELETE | `/api/v1/staff/:id` | 204/404 |

**Children** (`/api/v1/children`) — CRUD con paginación y `populate()`:
| Método | Ruta | Status |
|---|---|---|
| GET | `/api/v1/children?page=1&limit=10&search=` | 200 |
| GET | `/api/v1/children/:id` | 200/404 |
| POST | `/api/v1/children` | 201/400 (assignedStaff inválido) |
| PUT | `/api/v1/children/:id` | 200/404 |
| DELETE | `/api/v1/children/:id` | 204/404 |

### Contratos de respuesta

```json
// GET /children?page=1&limit=2 → 200
{ "data": [ { "...": "...", "assignedStaff": { "_id": "...", "name": "Ana Torres", ... } } ], "total": 5, "page": 1, "totalPages": 3 }

// POST /children con assignedStaff inválido → 400
{ "message": "ID de staff inválido" }

// POST /staff con email duplicado → 409
{ "message": "Ya existe un miembro del staff con ese correo" }

// GET /children/:id con id inexistente → 404
{ "message": "Child <id> not found" }
```

## ⚠️ Manejo de errores

- **400** — `CastError` de Mongoose (ID mal formado) y errores de validación Zod
- **404** — documento no encontrado (`findById`/`findByIdAndUpdate`/`findByIdAndDelete` retorna `null`)
- **409** — código `11000` de MongoDB (violación de índice único, ej. `email` de Staff)

## 🧪 Cómo correr el proyecto

```bash
docker-compose up -d      # levanta MongoDB en Docker
cp .env.example .env
pnpm install                # o npm install
pnpm seed                    # inserta Staff y Children de prueba
pnpm dev                      # arranca el servidor
```

## 🧪 Pruebas con curl

```bash
# Listar staff
curl http://localhost:3000/api/v1/staff

# Listar niños con populate y paginación
curl "http://localhost:3000/api/v1/children?page=1&limit=2"

# Crear un niño (usa un _id real de Staff obtenido del listado anterior)
curl -X POST http://localhost:3000/api/v1/children \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Nuevo Niño","age":4,"group":"jardín","parentName":"Padre Ejemplo","parentPhone":"3000000000","activities":["pintura"],"active":true,"assignedStaff":"<ID_DE_STAFF>"}'

# assignedStaff inválido → 400
curl -X POST http://localhost:3000/api/v1/children \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Prueba","age":4,"group":"jardín","parentName":"Test","parentPhone":"3000000000","assignedStaff":"no-es-un-id"}'

# Email duplicado en Staff → 409
curl -X POST http://localhost:3000/api/v1/staff \
  -H "Content-Type: application/json" \
  -d '{"name":"Otra Persona","role":"auxiliar","phone":"3000000000","email":"ana.torres@jardin.edu.co"}'
```

## 📌 Decisiones de diseño

- **Staff como entidad secundaria** (en vez de "Group"/salón) porque
  encaja con el patrón sugerido en el enunciado (análogo a
  Hospital→Patient/Doctor): cada niño tiene un profesor o coordinador
  asignado, modelado como referencia real en MongoDB.
- **Validación en dos capas**: Mongoose (`required`, `enum`, `min`/`max`)
  a nivel de esquema, y Zod a nivel de request antes de tocar la base de
  datos — así los errores de forma se detectan antes de llegar a Mongo.
  Los `ZodError` se convierten a `AppError(400)` dentro de cada
  controller para no modificar el `errorHandler.ts` dado.
- **`.lean()`** en todas las consultas de lectura para retornar objetos
  planos de JS en vez de documentos completos de Mongoose (mejor
  rendimiento, ya que no se necesitan los métodos de instancia).
- **Regla de negocio de edad (1–6 años)** se validó tanto en Mongoose
  (`min`/`max`) como en Zod, para que el rechazo ocurra lo antes posible.

## ⚠️ Nota de verificación

Este proyecto **compila sin errores de TypeScript** (`pnpm build`), pero
no fue posible ejecutarlo contra una instancia real de MongoDB en el
entorno donde se generó (sin Docker disponible). Verifica el
funcionamiento end-to-end corriendo `docker-compose up -d` y `pnpm seed`
en tu máquina antes de tomar las capturas de evidencia.
