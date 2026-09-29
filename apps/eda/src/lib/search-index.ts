import { getCollection } from 'astro:content';
import { knowledgeMap } from './knowledge-map';

export type SearchEntry = {
  kind: 'topic' | 'operation';
  title: string;
  /** Semana (tema) o estructura dueña (operación). */
  subtitle: string;
  href: string;
  ready: boolean;
};

/**
 * El índice del buscador Ctrl-K: los 33 temas del knowledge map + toda
 * operación ya escrita en la colección `docs`. ~130 entradas — de sobra
 * chico para un filtro por subcadena en el cliente, sin índice externo.
 */
export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const topics: SearchEntry[] = Object.entries(knowledgeMap.topics).map(([id, t]) => ({
    kind: 'topic',
    title: t.title,
    subtitle: t.week,
    href: `/structures/${id}`,
    ready: t.status === 'generated',
  }));

  const docs = await getCollection('docs');
  const operations: SearchEntry[] = docs
    .filter((d) => d.data.kind === 'operation')
    .map((d) => {
      const structureId = d.id.split('/')[0];
      const structure = knowledgeMap.topics[structureId];
      return {
        kind: 'operation' as const,
        title: (d.data as { title: string }).title,
        subtitle: structure?.title ?? structureId,
        href: `/structures/${d.id}`,
        ready: structure?.status === 'generated',
      };
    });

  return [...topics, ...operations];
}
