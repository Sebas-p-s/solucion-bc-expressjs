# 🚀 bc-expressjs — Semana 04: Validación, Errores y Logging

## 🎯 Dominio asignado

**Jardín infantil privado** — recurso principal: **Child** (niño/a matriculado/a).

## 📋 Campos del schema (`src/schemas/child.schema.ts`)

| Campo | Tipo | Validación |
|---|---|---|
| `fullName` | string | obligatorio, no vacío |
| `birthDate` | string | obligatorio, formato `YYYY-MM-DD` (mensaje personalizado) |
| `guardianName` | string | obligatorio, no vacío |
| `monthlyFee` | number | obligatorio, `.positive()` |
| `allergies` | string | opcional, `.default('Ninguna')` |
| `active` | boolean | opcional, `.default(true)` |

`updateChildSchema` reutiliza `createChildSchema.partial()` para permitir actualizaciones parciales.

## 📊 Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/children` | Listar con paginación (`page`, `limit`) |
| `GET` | `/api/v1/children/:id` | Obtener por id |
| `POST` | `/api/v1/children` | Crear validando con Zod |
| `PUT` | `/api/v1/children/:id` | Actualizar (campos opcionales) |
| `DELETE` | `/api/v1/children/:id` | Eliminar |
| `GET` | `/health` | Health check |

## 🛠️ Arquitectura

Rutas → Controladores → Servicios → Repositorios (en memoria).
- `AppError` para errores operacionales (404, 409, etc.)
- `errorHandler` (4 parámetros) distingue `ZodError → 400`, `AppError → statusCode`, genérico → 500
- Logging con Winston (consola coloreada en dev, JSON + archivo `logs/error.log` en producción) y Morgan integrado

## ▶️ Cómo ejecutar

```bash
pnpm install
pnpm dev
```

El servidor queda en `http://localhost:3000`.
