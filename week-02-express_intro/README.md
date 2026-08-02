# Proyecto Semana 02 — API REST Jardín Infantil Privado

**Autor:** Juan Sebastián Pachón Sandoval
**Documento:** 3228973B
**Dominio asignado (`bc-expressjs`):** Jardín infantil privado
**Entidades del dominio:** children, parents, staff, activities

## 🎯 Descripción

API REST construida con **Express 5 + TypeScript** para la gestión de niños
matriculados en un jardín infantil privado. El recurso principal es `Child`
(niño), el cual referencia dentro de sus propios atributos a las demás
entidades del dominio:

- **parents** → `parentName`, `parentPhone`
- **staff** → `assignedStaff`
- **activities** → `activities` (arreglo de actividades extracurriculares)

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
  allergies: string | null;
  active: boolean;
  enrollmentDate: string; // formato ISO YYYY-MM-DD
}
```

## 🚀 Endpoints

| Método | Ruta                     | Descripción                     | Status      |
|--------|--------------------------|----------------------------------|-------------|
| GET    | `/api/v1/children`       | Listar todos los niños           | 200         |
| GET    | `/api/v1/children/:id`   | Obtener un niño por ID           | 200 / 404   |
| POST   | `/api/v1/children`       | Registrar un nuevo niño          | 201         |
| PUT    | `/api/v1/children/:id`   | Actualizar los datos de un niño  | 200 / 404   |
| DELETE | `/api/v1/children/:id`   | Eliminar un niño                 | 204 / 404   |
| GET    | `/health`                | Estado del servidor              | 200         |

## 🛠️ Middlewares

1. `express.json()` — parseo de body
2. Logger personalizado — método, URL, status y tiempo de respuesta
3. Rutas del recurso principal
4. Handler 404 — rutas no encontradas
5. Error handler global (4 parámetros, siempre al final)

## 🧪 Cómo correr el proyecto

```bash
npm install     # o pnpm install
npm run dev     # modo desarrollo con recarga automática
npm run build   # compila TypeScript a dist/
npm start       # ejecuta el build compilado
```

## 🧪 Pruebas con curl

```bash
# Listar niños
curl http://localhost:3000/api/v1/children

# Crear un niño
curl -X POST http://localhost:3000/api/v1/children \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Valeria Pérez",
    "age": 5,
    "group": "Transición",
    "parentName": "Diana Pérez",
    "parentPhone": "3001112233",
    "assignedStaff": "Profesora Camila Ruiz",
    "activities": ["danza"],
    "allergies": null,
    "active": true,
    "enrollmentDate": "2026-01-15"
  }'

# Obtener por ID
curl http://localhost:3000/api/v1/children/1

# Actualizar
curl -X PUT http://localhost:3000/api/v1/children/1 \
  -H "Content-Type: application/json" \
  -d '{ "age": 5 }'

# Eliminar
curl -X DELETE http://localhost:3000/api/v1/children/2
# Esperado: 204 sin body
```

## 📌 Decisiones de diseño

- Se usa un **array en memoria** (`store.ts`) como base de datos temporal,
  con `id` autoincremental — no hay persistencia entre reinicios (se
  incorporará una base de datos real a partir de la semana 05).
- `parents`, `staff` y `activities` se modelaron como **atributos del
  recurso `Child`** en lugar de recursos independientes, ya que el alcance
  del proyecto semanal exige un único recurso con CRUD completo.
- El servidor implementa **graceful shutdown** ante `SIGTERM`/`SIGINT`
  para cerrar conexiones de forma limpia.
