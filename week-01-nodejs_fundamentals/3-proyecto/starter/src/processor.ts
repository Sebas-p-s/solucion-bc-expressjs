// ============================================
// PROCESSOR — Filtra y calcula estadísticas
// ============================================

import type { Item, ItemSummary } from './types.js';

/**
 * Filtra la lista de items por categoría.
 */
export function filterByCategory(items: Item[], categoryFilter: string | null): Item[] {
  // 1. Si categoryFilter es null, retornar todos los items
  if (!categoryFilter) {
    return items;
  }

  const normalizedFilter = categoryFilter.toLowerCase();
  const filtered = items.filter((item) => item.category.toLowerCase() === normalizedFilter);

  // 3. Si no hay items en esa categoría, lanzar un Error con las disponibles
  if (filtered.length === 0) {
    const availableCategories = Array.from(new Set(items.map((item) => item.category)));
    throw new Error(
      `La categoría "${categoryFilter}" no existe o no tiene elementos. Categorías disponibles: ${availableCategories.join(', ')}`
    );
  }

  // 2. Retornar solo los items de esa categoría
  return filtered;
}

/**
 * Calcula las estadísticas y resumen de la lista de items recibida.
 */
export function calculateSummary(items: Item[]): ItemSummary {
  if (items.length === 0) {
    throw new Error('No se pueden calcular estadísticas para una lista vacía de items.');
  }

  const total = items.length;
  const active = items.filter((item) => item.active).length;
  const inactive = total - active;

  // Suma total y precio promedio redondeado a 2 decimales
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const averagePrice = Number((totalPrice / total).toFixed(2));

  // Extremos: Ítem más caro y más barato
  const mostExpensive = items.reduce((prev, curr) => (curr.price > prev.price ? curr : prev));
  const cheapest = items.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));

  // Categorías únicas
  const categories = Array.from(new Set(items.map((item) => item.category)));

  return {
    total,
    active,
    inactive,
    averagePrice,
    mostExpensive,
    cheapest,
    categories
  };
}