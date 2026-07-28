// ============================================
// WRITER — Escribe el reporte en disco
// ============================================

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { Report } from './types.js';

/**
 * Guarda el reporte en un archivo JSON en la ruta indicada.
 */
export async function writeReport(outputPath: string, report: Report): Promise<void> {
  try {
    const absolutePath = resolve(outputPath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`✅ Reporte generado con éxito en: ${outputPath}`);
  } catch (error: any) {
    throw new Error(`No se pudo guardar el archivo de reporte: ${error.message}`);
  }
}