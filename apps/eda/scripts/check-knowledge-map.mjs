#!/usr/bin/env node
// Agente de QA de la Fase 6, en miniatura. Corre con `pnpm check`.
// Atrapa lo que rompen los subagentes en paralelo: temas huérfanos, carpetas
// fuera del mapa, y referencias a ids que no existen.

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'astro/zod';
import YAML from 'yaml';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content');
const STRUCTURES = path.join(CONTENT, 'structures');

// Los schemas viven en src/lib/schemas.ts. Se leen con el loader de TS de Node.
const { knowledgeMapSchema, metaSchema } = await import('../src/lib/schemas.ts');

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const map = knowledgeMapSchema.parse(JSON.parse(fs.readFileSync(path.join(CONTENT, 'knowledge-map.json'), 'utf8')));

const ids = new Set(Object.keys(map.topics));
const folders = new Set(
  fs.existsSync(STRUCTURES)
    ? fs.readdirSync(STRUCTURES, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    : [],
);

// 1. Toda referencia apunta a un id que existe.
for (const [id, t] of Object.entries(map.topics)) {
  for (const field of ['prerequisites', 'buildsOn', 'usedBy']) {
    for (const ref of t[field]) {
      if (!ids.has(ref)) fail(`${id}.${field} → "${ref}" no existe en topics`);
    }
  }
}

// 2. Toda semana declara temas que existen; todo tema pertenece a su semana.
const weekIds = new Set(map.weeks.map((w) => w.id));
for (const w of map.weeks) {
  for (const id of w.topics) {
    if (!ids.has(id)) fail(`${w.id} lista "${id}", que no existe en topics`);
    else if (map.topics[id].week !== w.id) fail(`"${id}" dice week=${map.topics[id].week} pero lo lista ${w.id}`);
  }
}
for (const [id, t] of Object.entries(map.topics)) {
  if (!weekIds.has(t.week)) fail(`"${id}" apunta a la semana inexistente ${t.week}`);
  if (!map.weeks.find((w) => w.id === t.week)?.topics.includes(id)) {
    fail(`"${id}" quedó huérfano: ${t.week} no lo lista (no aparecería en la navegación)`);
  }
}

// 3. status=generated ⟺ hay carpeta con meta.yaml válido.
for (const [id, t] of Object.entries(map.topics)) {
  if (t.status !== 'generated') continue;
  if (!folders.has(id)) {
    fail(`"${id}" está marcado generated pero falta content/structures/${id}/`);
    continue;
  }
  const metaPath = path.join(STRUCTURES, id, 'meta.yaml');
  if (!fs.existsSync(metaPath)) {
    fail(`falta content/structures/${id}/meta.yaml`);
    continue;
  }
  const parsed = metaSchema.safeParse(YAML.parse(fs.readFileSync(metaPath, 'utf8')));
  if (!parsed.success) {
    fail(`meta.yaml inválido en ${id}: ${JSON.stringify(parsed.error.issues)}`);
  } else {
    // meta.yaml y knowledge-map.json repiten estos campos a propósito (el
    // subagente sólo ve su meta.yaml). Si divergen, la navegación y la página
    // dicen cosas distintas. Es la deriva típica del trabajo en paralelo.
    const m = parsed.data;
    const same = (field, a, b) => {
      if (a !== b) fail(`${id}: meta.yaml dice ${field}=${a}, el mapa dice ${b}`);
    };
    same('week', m.week, t.week);
    same('type', m.type, t.type);
    same('hasVisualization', m.hasVisualization, t.hasVisualization);
    for (const field of ['prerequisites', 'buildsOn', 'usedBy']) {
      const a = [...m[field]].sort().join(',');
      const b = [...t[field]].sort().join(',');
      if (a !== b) fail(`${id}: meta.yaml tiene ${field}=[${a}], el mapa tiene [${b}]`);
    }
    // Toda operación del mapa necesita su archivo, y ninguno puede sobrar.
    const opsDir = path.join(STRUCTURES, id, 'operations');
    const files = fs.existsSync(opsDir)
      ? fs.readdirSync(opsDir).filter((f) => /\.mdx?$/.test(f)).map((f) => f.replace(/\.mdx?$/, ''))
      : [];
    for (const op of t.operations) {
      if (!files.includes(op)) fail(`${id}: falta operations/${op}.md (el mapa lo lista)`);
    }
    for (const f of files) {
      if (!t.operations.includes(f)) fail(`${id}: operations/${f}.md no está en el mapa`);
    }
  }

  // Un tema puede escribirse en .mdx si intercala diagramas en la prosa.
  const theory = ['theory.md', 'theory.mdx'].map((f) => path.join(STRUCTURES, id, f));
  if (!theory.some((f) => fs.existsSync(f))) fail(`falta content/structures/${id}/theory.md(x)`);
}

// 4. Ninguna carpeta fuera del mapa (un subagente que escribió donde no debía).
for (const folder of folders) {
  if (!ids.has(folder)) fail(`content/structures/${folder}/ no está en knowledge-map.json`);
  else if (map.topics[folder].status !== 'generated') {
    // Estado normal mientras un subagente está escribiendo. Sólo deja de serlo
    // cuando el agente de integración cierra la semana y pone status=generated.
    warn(`${folder}/ en curso — el mapa lo tiene como pending`);
  }
}

// 5. Frontmatter de todos los .md de contenido.
// El fallo recurrente de los subagentes es un string con ": " sin comillas, que
// YAML convierte en un mapa. El build de Astro lo caza, pero el build no se
// puede correr mientras hay agentes escribiendo — y aquí sí.
const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        return e.isDirectory() ? walk(full) : /\.mdx?$/.test(e.name) ? [full] : [];
      })
    : [];

const strings = (where, value) => {
  if (!Array.isArray(value)) return;
  value.forEach((v, i) => {
    if (typeof v !== 'string') {
      fail(`${where}[${i}] no es texto — ¿un ": " sin comillas en el YAML? → ${JSON.stringify(v)}`);
    }
  });
};

for (const file of [...walk(STRUCTURES), ...walk(path.join(CONTENT, 'weeks'))]) {
  const raw = fs.readFileSync(file, 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) continue;
  const rel = path.relative(ROOT, file);
  let data;
  try {
    data = YAML.parse(fm[1]);
  } catch (e) {
    fail(`${rel}: frontmatter YAML inválido — ${e.message.split('\n')[0]}`);
    continue;
  }
  if (!data || typeof data !== 'object') continue;
  strings(`${rel} canExplain`, data.canExplain);
  strings(`${rel} canDo`, data.canDo);
  for (const [i, item] of (data.items ?? []).entries()) {
    if (typeof item !== 'object' || item === null) {
      fail(`${rel} items[${i}] no es un objeto`);
      continue;
    }
    for (const k of ['statement', 'solution']) {
      if (k in item && typeof item[k] !== 'string') {
        fail(`${rel} items[${i}].${k} no es texto — ¿un ": " sin comillas?`);
      }
    }
    strings(`${rel} items[${i}].hints`, item.hints);
    if (!item.hints?.length) fail(`${rel} items[${i}] no tiene pistas`);
  }
}

for (const w of warnings) console.warn(`  ~ ${w}`);

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s):\n`);
  for (const e of errors) console.error(`  · ${e}`);
  process.exit(1);
}
console.log(`✓ knowledge map coherente — ${ids.size} temas, ${folders.size} carpetas, ${map.weeks.length} semanas`);
