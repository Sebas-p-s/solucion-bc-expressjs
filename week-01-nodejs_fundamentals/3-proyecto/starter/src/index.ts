import { readItems } from './reader.js';
import { filterByCategory, calculateSummary } from './processor.js';
import { writeReport } from './writer.js';
import type { Report } from './types.js';

async function main() {
  const args = process.argv.slice(2);
  let categoryFilter: string | null = null;

  const categoryIndex = args.indexOf('--category');
  if (categoryIndex !== -1 && args[categoryIndex + 1]) {
    categoryFilter = args[categoryIndex + 1];
  }

  const dataPath = 'data/items.json';
  const outputPath = 'output/report.json';

  console.log('🏫 Iniciando procesador de datos - Jardín Infantil Privado...\n');

  try {
    // 1. Leer datos
    const allItems = await readItems(dataPath);

    // 2. Filtrar por categoría (si se especificó)
    const filteredItems = filterByCategory(allItems, categoryFilter);

    // 3. Calcular métricas del resumen
    const summary = calculateSummary(filteredItems);

    // Mostrar consola
    console.log('📊 Resumen del Catálogo:');
    console.log(`- Total de ítems: ${summary.total}`);
    console.log(`- Activos: ${summary.active} | Inactivos: ${summary.inactive}`);
    console.log(`- Precio/Costo promedio: $${summary.averagePrice}`);
    if (summary.mostExpensive) {
      console.log(`- Más costoso: ${summary.mostExpensive.name} ($${summary.mostExpensive.price})`);
    }
    if (summary.cheapest) {
      console.log(`- Más económico: ${summary.cheapest.name} ($${summary.cheapest.price})`);
    }
    console.log('');

    // 4. Armar el reporte final
    const report: Report = {
      generatedAt: new Date().toISOString(),
      appliedFilter: categoryFilter,
      summary,
      items: filteredItems
    };

    // 5. Guardar reporte en archivo JSON
    await writeReport(outputPath, report);

  } catch (error: any) {
    console.error('❌ Error durante la ejecución:', error.message);
    process.exit(1);
  }
}

main();