import { getCollection } from 'astro:content';
import { knowledgeMap } from './knowledge-map';

export type SearchEntry = {
  kind: 'topic' | 'algorithm';
  title: string;
  /** Unidad (tema) o tema dueño (algoritmo/modelo). */
  subtitle: string;
  href: string;
  ready: boolean;
};

/**
 * El índice del buscador Ctrl-K: los temas del knowledge map + todo
 * algoritmo/modelo ya escrito en la colección `docs`. Suficientemente chico
 * para un filtro por subcadena en el cliente, sin índice externo.
 */
export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const topics: SearchEntry[] = Object.entries(knowledgeMap.topics).map(([id, t]) => ({
    kind: 'topic',
    title: t.title,
    subtitle: t.unit,
    href: `/topics/${id}`,
    ready: t.status === 'generated',
  }));

  const docs = await getCollection('docs');
  const algorithms: SearchEntry[] = docs
    .filter((d) => d.data.kind === 'algorithm')
    .map((d) => {
      const topicId = d.id.split('/')[0];
      const topic = knowledgeMap.topics[topicId];
      return {
        kind: 'algorithm' as const,
        title: (d.data as { title: string }).title,
        subtitle: topic?.title ?? topicId,
        href: `/topics/${d.id}`,
        ready: topic?.status === 'generated',
      };
    });

  return [...topics, ...algorithms];
}
