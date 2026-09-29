import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { metaSchema, type Meta } from './schemas';
import { CONTENT_DIR } from './knowledge-map';

const TOPICS_DIR = path.join(CONTENT_DIR, 'topics');

/** meta.yaml es la interfaz de coordinación entre subagentes: si está mal, el build falla. */
export function loadMeta(id: string): Meta {
  const raw = YAML.parse(fs.readFileSync(path.join(TOPICS_DIR, id, 'meta.yaml'), 'utf8'));
  const parsed = metaSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`meta.yaml inválido en ${id}:\n${JSON.stringify(parsed.error.format(), null, 2)}`);
  }
  if (parsed.data.id !== id) {
    throw new Error(`meta.yaml de ${id} declara id "${parsed.data.id}"`);
  }
  return parsed.data;
}

export function topicIds(): string[] {
  if (!fs.existsSync(TOPICS_DIR)) return [];
  return fs
    .readdirSync(TOPICS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function allMeta(): Meta[] {
  return topicIds().map(loadMeta);
}

