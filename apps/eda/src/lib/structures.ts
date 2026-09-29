import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { metaSchema, type Meta } from './schemas';
import { CONTENT_DIR } from './knowledge-map';

const STRUCTURES_DIR = path.join(CONTENT_DIR, 'structures');
const CPP_DIR = path.resolve(process.cwd(), 'cpp/structures');

/** meta.yaml es la interfaz de coordinación entre subagentes: si está mal, el build falla. */
export function loadMeta(id: string): Meta {
  const raw = YAML.parse(fs.readFileSync(path.join(STRUCTURES_DIR, id, 'meta.yaml'), 'utf8'));
  const parsed = metaSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`meta.yaml inválido en ${id}:\n${JSON.stringify(parsed.error.format(), null, 2)}`);
  }
  if (parsed.data.id !== id) {
    throw new Error(`meta.yaml de ${id} declara id "${parsed.data.id}"`);
  }
  return parsed.data;
}

export function structureIds(): string[] {
  if (!fs.existsSync(STRUCTURES_DIR)) return [];
  return fs
    .readdirSync(STRUCTURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function allMeta(): Meta[] {
  return structureIds().map(loadMeta);
}

/** Lee los pasos de C++ de una operación. Fuente: cpp/structures/<id>/<archivo>. */
export function readCppSteps(id: string, files: string[]) {
  return files.map((file) => {
    const full = path.join(CPP_DIR, id, file);
    if (!fs.existsSync(full)) throw new Error(`falta ${path.relative(process.cwd(), full)}`);
    return { label: file.replace(/\.cpp$/, ''), code: fs.readFileSync(full, 'utf8') };
  });
}
