# Proyecto Semana 08 — API Segura con RBAC: Jardín Infantil Privado

**Autor:** Juan Sebastián Pachón Sandoval · **Documento:** 3228973B
**Dominio (`bc-expressjs`):** Jardín infantil privado (children, parents, staff, activities)

## 🎯 Descripción

API REST (Express 5 + TypeScript + MongoDB/Mongoose) para gestionar los niños matriculados en un jardín infantil, protegida con autenticación JWT, **RBAC**, Helmet, CORS con whitelist, rate limiting diferenciado y sanitización de entradas.

**Recurso principal:** `Child` (niño). `parents` → `parentName`/`parentPhone`; `staff` → `assignedStaff`; `activities` → `activities[]`. Campo único: `documentId` (registro civil / T.I.).

**Decisión de diseño:** los datos de niños son información sensible de menores, por eso **ninguna ruta de `children` es pública**: hasta la lectura exige token.

## 👥 Roles y permisos

| Acción | Sin token | `user` (personal/acudiente) | `admin` (dirección) |
|---|---|---|---|
| Ver listado / detalle de niños | ❌ 401 | ✅ | ✅ |
| Matricular un niño (POST) | ❌ 401 | ✅ | ✅ |
| Editar un niño (PATCH) | ❌ 401 | ✅ solo los que él matriculó (si no, 403) | ✅ cualquiera |
| Eliminar un niño (DELETE) | ❌ 401 | ❌ 403 | ✅ |

## 🚀 Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/v1/auth/register` | Público (rate limit 5/15 min) |
| POST | `/api/v1/auth/login` | Público (rate limit 5/15 min) |
| POST | `/api/v1/auth/refresh` | Cookie refreshToken |
| POST | `/api/v1/auth/logout` · GET `/auth/me` | Autenticado |
| GET | `/api/v1/users/dashboard` | Autenticado |
| GET | `/api/v1/children` | Autenticado |
| GET | `/api/v1/children/:id` | Autenticado |
| POST | `/api/v1/children` | Autenticado |
| PATCH | `/api/v1/children/:id` | Autenticado + dueño **o** admin |
| DELETE | `/api/v1/children/:id` | Autenticado + `requireRole('admin')` |
| GET | `/api/v1/health` | Público |

Códigos: `400` validación / id inválido · `401` sin token o inválido · `403` rol/dueño incorrecto · `404` no existe · `409` `documentId` duplicado · `429` rate limit.

## 🛡️ Capas de seguridad aplicadas

| Capa | Implementación |
|---|---|
| Autenticación | JWT access (15 min) + refresh token en cookie `httpOnly`, `sameSite: strict` |
| RBAC | `authMiddleware` → `requireRole('admin')` (siempre en ese orden) + verificación de dueño en el service |
| Helmet | `helmet()` global: CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, etc. |
| CORS | Whitelist explícita (`localhost:5173`, `localhost:3001`); origen no permitido → `403` |
| Rate limit | Global 100 req/15 min · Auth 5 req/15 min (fuerza bruta) · headers `RateLimit-*` visibles |
| Sanitización | `express-mongo-sanitize` (elimina claves `$…`/`.`) en body, query y params + Zod rechaza `<` `>` (XSS) |
| Errores seguros | Sin stack traces al cliente; el detalle solo va al log del servidor |
| Secretos | Todo en `.env` (ver `.env.example`), nada hardcodeado |

## 🔧 Correcciones al starter (incompatibilidades con Express 5)

1. `app.options('*', …)` **impedía arrancar el servidor** (la sintaxis `'*'` ya no es válida en Express 5). Se eliminó: `app.use(cors(...))` ya responde los preflight.
2. `mongoSanitize()` **devolvía 500 en todas las peticiones** (intenta reasignar `req.query`, que en Express 5 es de solo lectura). Se reemplazó por `src/middlewares/sanitize.ts`, que usa `mongoSanitize.sanitize()` limpiando in place.
3. `errorHandler`: los `ZodError` ahora responden `400` (antes `500`) y el CORS bloqueado responde `403`.

## ▶️ Cómo correr

```bash
docker compose up -d
cp .env.example .env
pnpm install        # o npm install
pnpm dev            # http://localhost:3000
```
Usuarios semilla: `user@test.com / User1234!` · `admin@test.com / Admin1234!`

## 🧪 Pruebas rápidas (curl)

```bash
# login → copia el accessToken
curl -X POST localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"user@test.com","password":"User1234!"}'
# sin token → 401
curl -i localhost:3000/api/v1/children
# matricular un niño
curl -X POST localhost:3000/api/v1/children -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"fullName":"Sofia Ramirez","age":4,"group":"pre-jardín","documentId":"RC-0001","parentName":"Laura Ramirez","parentPhone":"3011234567","activities":["pintura"]}'
# user intenta borrar → 403 ; admin → 200
curl -i -X DELETE localhost:3000/api/v1/children/<ID> -H "Authorization: Bearer <TOKEN>"
# headers de seguridad
curl -i localhost:3000/api/v1/health
# 429: repetir login inválido más de 5 veces
```

## ✅ Verificación realizada

Probé 23 escenarios end-to-end (401/403/200 por rol, dueño vs admin, 409, 400 por edad/HTML/id malformado, inyección NoSQL, CORS permitido/bloqueado, preflight, Helmet, headers de rate limit y 429). En el entorno de pruebas usé **FerretDB** (compatible con el protocolo de MongoDB) en lugar de MongoDB real; por una limitación de FerretDB, en la copia de prueba `updateRefreshToken` usó `updateOne` — el código entregado conserva `findByIdAndUpdate` del starter, que funciona en MongoDB real. Conviene que confirmes el login una vez con tu `docker compose up -d`.
