# Proyecto Semana 03 — API REST con Arquitectura en Capas: Jardín Infantil Privado

**Autor:** Juan Sebastián Pachón Sandoval
**Documento:** 3228973B
**Dominio asignado (`bc-expressjs`):** Jardín infantil privado
**Entidades del dominio:** children, parents, staff, activities

## 🎯 Descripción

API REST en **Express 5 + TypeScript** con arquitectura en 4 capas
(`routes → controllers → services → repositories`) para la gestión de
niños matriculados en un jardín infantil privado.

El recurso principal es `Child`. Las demás entidades del dominio se
representan como atributos:
- **parents** → `parentName`, `parentPhone`
- **staff** → `assignedStaff`
- **activities** → `activities` (arreglo de strings)

## 🏗️ Arquitectura

```
src/
├── routes/children.routes.ts        # Mapeo URL → controller
├── controllers/children.controller.ts # extraer → llamar service → responder
├── services/children.service.ts       # paginación + validaciones de dominio
└── repositories/children.repository.ts # único acceso al store, copias defensivas
```

**Regla de negocio del dominio:** la edad de un niño debe estar entre 1 y 6
años (validado en la capa de servicio, en `create` y `update`).

## 🗂️ Recurso: `Child`

```ts
interface Child {
  id: number;
  fullName: string;
  age: number;
  group: string;          // "Párvulos" | "Pre-jardín" | "Jardín" | "Transición"
  parentName: string;
  parentPhone: string;
  assignedStaff: string;
  activities: string[];
  active: boolean;
  createdAt: string;
}
```

## 🚀 Endpoints

| Método | Ruta                       | Status | Descripción                        |
|--------|----------------------------|--------|-------------------------------------|
| GET    | `/api/v1/children`         | 200    | Listar con paginación `?page&limit` |
| GET    | `/api/v1/children/:id`     | 200/404| Obtener por ID                      |
| POST   | `/api/v1/children`         | 201    | Crear nuevo niño                    |
| PUT    | `/api/v1/children/:id`     | 200/404| Actualizar niño existente           |
| DELETE | `/api/v1/children/:id`     | 204/404| Eliminar niño                       |
| GET    | `/health`                  | 200    | Estado del servidor                 |

### Contratos de respuesta

```json
// GET /children?page=1&limit=2 → 200
{ "data": [...], "total": 4, "page": 1, "limit": 2 }

// GET /children/1 → 200
{ "data": { "id": 1, "fullName": "Sofía Ramírez", ... } }

// POST /children → 201
{ "data": { "id": 5, "fullName": "Emma Castro", ... } }

// GET /children/999 → 404
{ "error": "Not Found", "message": "Child 999 not found" }
```

## 🧪 Cómo correr el proyecto

```bash
pnpm install       # o npm install
cp .env.example .env
pnpm dev            # modo desarrollo
pnpm build           # compila TypeScript
```

## 🧪 Pruebas con curl

```bash
# Listar (paginado)
curl "http://localhost:3000/api/v1/children?page=1&limit=2"

# Obtener por ID
curl http://localhost:3000/api/v1/children/1

# Crear
curl -X POST http://localhost:3000/api/v1/children \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Emma Castro","age":4,"group":"Jardín","parentName":"Julian Castro","parentPhone":"3201234567","assignedStaff":"Profesora Ana Torres","activities":["pintura"],"active":true}'

# Actualizar
curl -X PUT http://localhost:3000/api/v1/children/1 \
  -H "Content-Type: application/json" \
  -d '{"age":5}'

# Eliminar
curl -X DELETE http://localhost:3000/api/v1/children/4
```

## 📌 Decisiones de diseño

- **Store en memoria** dentro del repository (4 niños semilla), con `id`
  autoincremental. Sin persistencia entre reinicios.
- **parents, staff, activities** se modelaron como atributos de `Child`
  en lugar de recursos independientes, dado el alcance de un único
  recurso con CRUD que exige el proyecto.
- **Validación de dominio** (edad 1–6 años) vive en la capa de servicio,
  no en el controller ni el repository, respetando la separación de
  responsabilidades pedida en la arquitectura.
- El **error handler global** de `app.ts` captura cualquier error lanzado
  en el servicio (como la validación de edad) y responde con `500` y un
  mensaje descriptivo.
