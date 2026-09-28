# Proyecto Semana 09 — Testing de API REST: Jardín Infantil Privado

**Autor:** Juan Sebastián Pachón Sandoval · **Documento:** 3228973B
**Dominio (`bc-expressjs`):** Jardín infantil privado (children, parents, staff, activities)

## 🎯 Descripción

Suite de tests con **Jest + ts-jest + Supertest + MongoDB Memory Server** para la API del jardín infantil. Recurso principal: `Child` (niño) en `/api/v1/children`.

Reglas de negocio del dominio (en `children.service.ts`):
- La edad debe estar entre **1 y 6 años** (400).
- `documentId` (registro civil / T.I.) es **único** (409).
- Solo quien matriculó al niño **o un admin** puede editarlo/eliminarlo (403).

## 🧪 Suites

| Archivo | Tipo | Qué prueba |
|---|---|---|
| `children.service.test.ts` | Unit (repo mockeado con `jest.mock`) | getAll (vacío, con datos, filtro), getById (200/404), create (ok, 409, 400 con edades 0/7/15), update (dueño, admin, 403, 404, 400), remove (dueño, admin, 403, 404) |
| `children.routes.test.ts` | Integración (Supertest + MongoDB Memory Server) | GET vacío/listado/filtro/422, POST 201/401/422/409, GET :id 200/404/422, PUT 200 dueño/admin, 403, 401, 404, DELETE 204/403/404, health |
| `auth.service.test.ts` | Unit (repo mockeado) | register (ok sin password, 409), login (401 usuario/clave, token JWT), getMe (ok, 404), `toHaveBeenCalledWith` |
| `auth.middleware.test.ts` | Unit | `authenticate` (401/token válido) y `authorize` (200/403) |
| `auth.integration.test.ts` | Integración | register 201/422/409, login 200/401, `/auth/me` |

Buenas prácticas aplicadas: patrón **AAA**, `clearMocks: true` en `jest.config.ts`, `afterEach` que limpia la base entre tests, `it.each` para casos límite de edad, y asserts reales en todos los tests.

## ▶️ Comandos

```bash
pnpm install          # o npm install
pnpm test             # todos los tests
pnpm test:watch
pnpm test:coverage    # reporte en coverage/index.html
```
> La **primera** ejecución de los tests de integración descarga el binario de MongoDB que usa `mongodb-memory-server` (requiere internet, una sola vez).

## 📊 Cobertura

Umbrales en `jest.config.ts`: statements 80 · branches 70 · functions 80 · lines 80.
Resultado obtenido: **statements 98.3% · branches 82.2% · functions 100% · lines 99.1%** (65 tests).

## 🔧 Correcciones al starter

Al ejecutar los tests aparecieron problemas heredados que hubo que resolver:

1. **`jest.config.ts`**: los fuentes importan con `.js` (`'../models/x.js'`) y Jest no los resolvía (`Cannot find module`). Se agregó `moduleNameMapper`.
2. **`jest.setup.ts` (nuevo)**: carga `.env.test`; el starter nunca lo cargaba y los tests usaban secretos por defecto.
3. **`auth.service.ts`**: el cast `IUser as Record<string, unknown>` no compilaba con `strict` → `as unknown as Record<…>`.
4. **`users.repository.createUser`** *(seguridad)*: `register` respondía con el documento de Mongoose "aplastado", filtrando campos internos y **el hash de la contraseña dentro de `_doc`**. Ahora devuelve `toObject()`; hay un test de regresión.

## ✅ Verificación realizada

Los 65 tests pasan. En mi entorno de pruebas no se puede descargar el binario de MongoDB, así que ejecuté los tests de integración contra **FerretDB** (servidor compatible con MongoDB) sustituyendo `mongodb-memory-server` por un stub **solo en esa verificación**; el código entregado usa `mongodb-memory-server` real, tal como pide el enunciado. Los unit tests (35) se ejecutaron tal cual con `jest.config.ts`. Conviene que corras `pnpm test:coverage` una vez en tu equipo.
