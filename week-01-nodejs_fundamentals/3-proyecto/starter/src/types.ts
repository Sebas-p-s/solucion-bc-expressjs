// ============================================
// TIPOS — Jardín Infantil Privado
// ============================================

// Recurso principal del jardín infantil
export interface Item {
  id: string;
  name: string;
  category: 'children' | 'parents' | 'staff' | 'activities' | string;
  price: number;
  capacity: number;
  active: boolean;
}

// Resumen que el procesador debe calcular
export interface ItemSummary {
  total: number;
  active: number;
  inactive: number;
  averagePrice: number;
  mostExpensive: Item;
  cheapest: Item;
  categories: string[];
}

// Reporte final que se escribirá en output/report.json
export interface Report {
  generatedAt: string;
  appliedFilter: string | null;
  summary: ItemSummary;
  items: Item[];
}