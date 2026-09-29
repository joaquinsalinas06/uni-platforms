// Peso relativo del crecimiento asintótico, sólo para dar escala visual a la
// notación (una barra, nunca un número inventado). Puro y testeado — lo usan
// ComplexityTable.astro y la vista de comparación.

// El material usa Θ (no sólo O) y "lg" (no "log"): sin normalizar, casi
// ninguna cota real del curso caía en la tabla y la barra no discriminaba
// nada (todo al default).
export function normalizeComplexity(o: string): string {
  return o
    .replace(/[ΘΩ]/g, 'O')
    .replace(/log/gi, 'lg')
    .replace(/\s+/g, ' ')
    .trim();
}

const WEIGHT: Record<string, number> = {
  'O(1)': 1,
  'O(lg n)': 2,
  'O(lg^2 n)': 3,
  'O(√n)': 4,
  'O(n)': 7,
  'O(n lg n)': 8,
  'O(n^2)': 10,
  'O(n²)': 10,
};

/** Peso 1-10; una notación que el curso no cubre cae al medio (5), ni
 * confirma ni descarta nada — sólo evita que la barra quede vacía. */
export function growthWeight(o: string): number {
  return WEIGHT[normalizeComplexity(o)] ?? 5;
}
