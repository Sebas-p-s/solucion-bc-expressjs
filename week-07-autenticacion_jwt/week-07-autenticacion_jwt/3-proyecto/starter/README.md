# Proyecto Semana 07 — API con Autenticación JWT: Jardín Infantil Privado

**Autor:** Juan Sebastián Pachón Sandoval
**Dominio (`bc-expressjs`):** Jardín infantil privado (children, parents, staff, activities)

## 🎯 Descripción

API REST (Express 5 + TypeScript + MongoDB/Mongoose) para gestionar los niños matriculados en un jardín infantil, con autenticación completa: **bcrypt**, **JWT access/refresh** y **cookies HttpOnly**.

**Recurso principal:** `Child` (niño). Las demás entidades del dominio son atributos del niño: `parents` → `parentName` / `parentPhone`, `staff` → `assignedStaff`, `activities` → `activities[]`. Campo único: `documentId` (registro civil / T.I.).

Son datos de menores de edad, así que **ninguna ruta de `children` es pública**: hasta la lectura exige estar autenticado.

## 🔐 Sistema de autenticación

| Criterio | Implementación |
|---|---|
| Contraseñas | `bcrypt.hash()` con 10 salt rounds; `password` con `select: false` |
| Login | `bcrypt.compare()`; mismo mensaje (`Credenciales inválidas`) para email inexistente y contraseña errónea |
| Access token | JWT firmado con `JWT_ACCESS_SECRET`, expira en 15 min, cookie `accessToken` |
| Refresh token | JWT firmado con `JWT_REFRESH_SECRET` (distinto), expira en 7 días, cookie `refreshToken` limitada a `/api/v1/auth` |
| Cookies | `httpOnly`, `sameSite: 'lax'`, `secure` activo en producción |
| Refresh en BD | Solo se guarda un **hash** del refresh token, nunca el token en claro |
| Rotación | Cada `/refresh` genera un token nuevo y el anterior deja de servir (401) |
| Logout | Limpia ambas cookies y borra el hash en la BD |
| Secretos | Todo en `.env` (ver `.env.example`), nada hardcodeado |

## 🚀 Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/v1/auth/register` | Público |
| POST | `/api/v1/auth/login` | Público |
| POST | `/api/v1/auth/refresh` | Cookie `refreshToken` |
| GET | `/api/v1/auth/me` | Autenticado |
| POST | `/api/v1/auth/logout` | Autenticado |
| GET | `/api/v1/children` | Autenticado |
| GET | `/api/v1/children/:id` | Autenticado |
| POST | `/api/v1/children` | Autenticado (guarda `createdBy`) |
| PATCH | `/api/v1/children/:id` | Autenticado |
| DELETE | `/api/v1/children/:id` | Autenticado |

Códigos: `201` creado · `204` eliminado · `400` validación o id malformado · `401` sin sesión / token inválido · `404` no existe · `409` email o `documentId` duplicado.

## 🧒 Modelo `Child`

| Campo | Tipo | Regla |
|---|---|---|
| `fullName` | string | 2–150 caracteres |
| `age` | number | entero, 1 a 6 |
| `group` | enum | `párvulos` · `pre-jardín` · `jardín` · `transición` |
| `documentId` | string | único, 3–30 caracteres (no se puede editar) |
| `parentName` | string | 2–150 caracteres |
| `parentPhone` | string | 7–20 caracteres (dígitos, `+`, `-`, espacio) |
| `assignedStaff` | string | opcional |
| `activities` | string[] | por defecto `[]` |
| `active` | boolean | por defecto `true`; el listado solo muestra activos |
| `createdBy` | ObjectId → User | quien matriculó al niño |

## 🔧 Cambios respecto al starter

1. `resource` → `child` en modelo, schema, repositorio, servicio, controlador y rutas; router montado en `/api/v1/children`.
2. `errorHandler`: los `ZodError` ahora responden `400` (antes caían en el `500`).
3. `auth.service.ts`: el refresh token se pasa por **SHA-256 antes de bcrypt**. bcrypt solo lee los primeros 72 bytes y un JWT mide ~170, así que sin esto todos los refresh tokens de un mismo usuario producen el mismo hash y el token viejo seguía funcionando después de rotar.

## ▶️ Cómo correr

```bash
docker compose up -d
cp .env.example .env      # y cambia los dos secretos (openssl rand -base64 64)
pnpm install              # o npm install
pnpm dev                  # http://localhost:3000
```

## 🧪 Pruebas rápidas (curl)

```bash
B=localhost:3000/api/v1

# registro + login (guarda las cookies en jar.txt)
curl -X POST $B/auth/register -H "Content-Type: application/json" \
  -d '{"email":"sebas@test.com","password":"Test1234!","name":"Sebas"}'
curl -i -c jar.txt -X POST $B/auth/login -H "Content-Type: application/json" \
  -d '{"email":"sebas@test.com","password":"Test1234!"}'

# sin cookie → 401
curl -i $B/children

# matricular un niño
curl -b jar.txt -X POST $B/children -H "Content-Type: application/json" \
  -d '{"fullName":"Sofia Ramirez","age":4,"group":"pre-jardín","documentId":"RC-0001","parentName":"Laura Ramirez","parentPhone":"3011234567","activities":["pintura"]}'

# listar / obtener / actualizar / eliminar
curl -b jar.txt $B/children
curl -b jar.txt -X PATCH $B/children/<ID> -H "Content-Type: application/json" -d '{"group":"jardín"}'
curl -b jar.txt -X DELETE $B/children/<ID>

# refresh (rota los tokens) y logout
curl -b jar.txt -c jar.txt -X POST $B/auth/refresh
curl -b jar.txt -X POST $B/auth/logout
curl -i -b jar.txt -X POST $B/auth/refresh      # → 401 tras logout
```

## ✅ Verificación realizada

Probé 23 escenarios end-to-end: registro (201/409/400), login con credenciales buenas y malas (mismo mensaje), cookies `HttpOnly`, acceso sin cookie (401), CRUD completo de `children` (201/409/400/404/204), `/me`, refresh con rotación, **reuso de un refresh token viejo (401)**, logout y refresh posterior (401).

En el entorno de pruebas usé **FerretDB** (compatible con MongoDB) en lugar de MongoDB real. Por una limitación suya con `findByIdAndUpdate`, en la copia de prueba `updateRefreshToken` usó `updateOne`; el código entregado conserva `findByIdAndUpdate` del starter, que funciona en MongoDB real. Conviene confirmar el login una vez con tu `docker compose up -d`.
