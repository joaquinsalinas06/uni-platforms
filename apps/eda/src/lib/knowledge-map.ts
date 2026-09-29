import fs from 'node:fs';
import path from 'node:path';
import { knowledgeMapSchema, type KnowledgeMap } from './schemas';

export const CONTENT_DIR = path.resolve(process.cwd(), 'content');

export function loadKnowledgeMap(): KnowledgeMap {
  const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'knowledge-map.json'), 'utf8'));
  const parsed = knowledgeMapSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`knowledge-map.json inválido:\n${JSON.stringify(parsed.error.format(), null, 2)}`);
  }
  return parsed.data;
}

export const knowledgeMap = loadKnowledgeMap();

/** El `type` del schema es en inglés; la interfaz está toda en español. */
export const TYPE_LABEL = {
  structure: 'estructura',
  algorithm: 'algoritmo',
  concept: 'concepto',
} as const;

export function topic(id: string) {
  const t = knowledgeMap.topics[id];
  if (!t) throw new Error(`topic "${id}" no existe en knowledge-map.json`);
  return t;
}

/** Prerrequisitos transitivos, en orden de aprendizaje. */
export function prerequisiteChain(id: string, seen = new Set<string>()): string[] {
  for (const p of knowledgeMap.topics[id]?.prerequisites ?? []) {
    if (seen.has(p)) continue;
    seen.add(p);
    prerequisiteChain(p, seen);
  }
  return [...seen];
}
