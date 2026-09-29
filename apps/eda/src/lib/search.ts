// Filtro y orden del buscador Ctrl-K. Puro: sin DOM, testeable con node:test.

export type Searchable = { title: string; kind: 'topic' | 'operation' };

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtra por subcadena (sin acentos, sin mayúsculas) y ordena: coincidencia
 * de prefijo antes que coincidencia interna, temas antes que operaciones.
 * Devuelve los índices originales de `items` que hicieron match, en orden.
 */
export function rank<T extends Searchable>(items: readonly T[], query: string): T[] {
  const q = normalize(query);
  if (!q) return [];

  const scored: { item: T; score: number; pos: number }[] = [];
  items.forEach((item, i) => {
    const t = normalize(item.title);
    const idx = t.indexOf(q);
    if (idx === -1) return;
    const prefixScore = idx === 0 ? 0 : 1;
    const kindScore = item.kind === 'topic' ? 0 : 1;
    scored.push({ item, score: prefixScore * 10 + kindScore, pos: i });
  });

  scored.sort((a, b) => a.score - b.score || a.pos - b.pos);
  return scored.map((s) => s.item);
}
