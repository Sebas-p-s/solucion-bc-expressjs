# 🚀 Bootcamp Node.js & Express.js — Soluciones

Este repositorio contiene las soluciones semanales a los ejercicios y proyectos del bootcamp.

---

## 📂 Semana 01 — Fundamentos de Node.js, TypeScript y CLI

En esta primera semana desarrollamos una **herramienta de línea de comandos (CLI)** en Node.js + TypeScript utilizando módulos ESM y la API de promesas de Node.js (`fs/promises`).

### 🎯 Proyecto Adaptado: Procesador de Datos — Jardín Infantil Privado
El sistema lee una base de datos local en JSON, procesa métricas estadísticas y genera reportes dinámicos.

* **Dominio asignado:** Jardín Infantil Privado
* **Categorías de datos:**
  * `children`: Programas y servicios para niños/as.
  * `parents`: Talleres y eventos para padres de familia.
  * `staff`: Gestión y nómina/servicios del personal docente.
  * `activities`: Actividades extracurriculares y talleres.

---

### 🛠️ Lo que se implementó:

1. **Lectura Asíncrona de Archivos (`src/reader.ts`):** 
   - Implementación de `fs/promises` para leer y parsear el catálogo `data/items.json`.
   - Manejo de errores amigable si el archivo no existe o tiene errores de formato JSON.

2. **Procesamiento de Métricas y Filtros (`src/processor.ts`):**
   - Función `filterByCategory`: Filtra el catálogo según el argumento pasado por CLI.
   - Función `calculateSummary`: Calcula métricas en tiempo real (total de elementos, activos vs inactivos, precio promedio, elemento más costoso y más económico, y categorías disponibles).

3. **Generación de Reporte (`src/writer.ts`):**
   - Creación automática del directorio y archivo de salida `output/report.json` con la fecha y métricas procesadas.

4. **Entrada de Comandos CLI (`src/index.ts`):**
   - Manejo de argumentos con `process.argv` (soporte para `--category <nombre>`).

5. **Escribir TypeScript Estricto:**
   - Tipado fuerte en `src/types.ts` y compilación limpia pasando el comando `pnpm build` (`tsc --noEmit`).

---

### 🧪 Cómo ejecutar el proyecto de la Semana 01

```bash
# 1. Entrar a la carpeta del proyecto
cd bootcamp/week-01-nodejs_fundamentals/3-proyecto/starter

# 2. Instalar dependencias
pnpm install

# 3. Ejecutar sin filtros (procesa todo el catálogo)
pnpm dev

# 4. Ejecutar filtrando por categoría
pnpm dev -- --category activities
pnpm dev -- --category children

# 5. Validar tipos con TypeScript
pnpm build