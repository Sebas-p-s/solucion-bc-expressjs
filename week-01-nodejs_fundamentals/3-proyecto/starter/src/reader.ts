// ============================================
// READER — Lee y parsea el archivo JSON
// ============================================

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Item } from './types.js';

/**
 * Lee el archivo JSON desde la ruta especificada y lo parsea a un arreglo de Items.
 */
export async function readItems(filePath: string): Promise<Item[]> {
  try {
    const absolutePath = resolve(filePath);
    const content = await readFile(absolutePath, 'utf-8');
    const data: Item[] = JSON.parse(content);
    return data;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`El archivo de entrada no existe en la ruta: "${filePath}"`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`El archivo JSON en "${filePath}" tiene un formato inválido.`);
    }
    throw error;
  }
}