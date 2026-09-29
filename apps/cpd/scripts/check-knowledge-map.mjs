#!/usr/bin/env node
// Agente de QA de integración, en miniatura. Corre con `pnpm check`.
// Atrapa lo que rompen los subagentes en paralelo: temas huérfanos, carpetas
// fuera del mapa, y referencias a ids que no existen.

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content');
const TOPICS = path.join(CONTENT, 'topics');

// Los schemas viven en src/lib/schemas.ts. Se leen con el loader de TS de Node.
const { knowledgeMapSchema, metaSchema } = await import('../src/lib/schemas.ts');

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const map = knowledgeMapSchema.parse(JSON.parse(fs.readFileSync(path.join(CONTENT, 'knowledge-map.json'), 'utf8')));

const ids = new Set(Object.keys(map.topics));
const folders = new Set(
  fs.existsSync(TOPICS)
    ? fs.readdirSync(TOPICS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
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

// 2. Toda unidad declara temas que existen; todo tema pertenece a su unidad.
const unitIds = new Set(map.units.map((u) => u.id));
for (const u of map.units) {
  for (const id of u.topics) {
    if (!ids.has(id)) fail(`${u.id} lista "${id}", que no existe en topics`);
    else if (map.topics[id].unit !== u.id) fail(`"${id}" dice unit=${map.topics[id].unit} pero lo lista ${u.id}`);
  }
}
for (const [id, t] of Object.entries(map.topics)) {
  if (!unitIds.has(t.unit)) fail(`"${id}" apunta a la unidad inexistente ${t.unit}`);
  if (!map.units.find((u) => u.id === t.unit)?.topics.includes(id)) {
    fail(`"${id}" quedó huérfano: ${t.unit} no lo lista (no aparecería en la navegación)`);
  }
}

// 3. status=generated ⟺ hay carpeta con meta.yaml válido.
for (const [id, t] of Object.entries(map.topics)) {
  if (t.status !== 'generated') continue;
  if (!folders.has(id)) {
    fail(`"${id}" está marcado generated pero falta content/topics/${id}/`);
    continue;
  }
  const metaPath = path.join(TOPICS, id, 'meta.yaml');
  if (!fs.existsSync(metaPath)) {
    fail(`falta content/topics/${id}/meta.yaml`);
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
    same('unit', m.unit, t.unit);
    same('type', m.type, t.type);
    same('hasVisualization', m.hasVisualization, t.hasVisualization);
    for (const field of ['prerequisites', 'buildsOn', 'usedBy']) {
      const a = [...m[field]].sort().join(',');
      const b = [...t[field]].sort().join(',');
      if (a !== b) fail(`${id}: meta.yaml tiene ${field}=[${a}], el mapa tiene [${b}]`);
    }
    // Todo subtema del mapa (algorithms/ o models/) necesita su archivo, y
    // ninguno puede sobrar.
    const subtopicFiles = ['algorithms', 'models'].flatMap((sub) => {
      const dir = path.join(TOPICS, id, sub);
      return fs.existsSync(dir)
        ? fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f)).map((f) => f.replace(/\.mdx?$/, ''))
        : [];
    });
    for (const sub of t.subtopics) {
      if (!subtopicFiles.includes(sub)) fail(`${id}: falta algorithms|models/${sub}.md (el mapa lo lista)`);
    }
    for (const f of subtopicFiles) {
      if (!t.subtopics.includes(f)) fail(`${id}: algorithms|models/${f}.md no está en el mapa`);
    }
  }

  // Un tema puede escribirse en .mdx si intercala diagramas en la prosa.
  const theory = ['theory.md', 'theory.mdx'].map((f) => path.join(TOPICS, id, f));
  if (!theory.some((f) => fs.existsSync(f))) fail(`falta content/topics/${id}/theory.md(x)`);
}

// 4. Ninguna carpeta fuera del mapa (un subagente que escribió donde no debía).
for (const folder of folders) {
  if (!ids.has(folder)) fail(`content/topics/${folder}/ no está en knowledge-map.json`);
  else if (map.topics[folder].status !== 'generated') {
    // Estado normal mientras un subagente está escribiendo. Sólo deja de serlo
    // cuando el agente de integración cierra la unidad y pone status=generated.
    warn(`${folder}/ en curso — el mapa lo tiene como pending`);
  }
}

// 5. Frontmatter de todos los .md de contenido — el fallo recurrente de los
// subagentes es un string con ": " sin comillas, que YAML convierte en un
// mapa. El build de Astro lo caza, pero el build no se puede correr mientras
// hay agentes escribiendo — y aquí sí.
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

for (const file of [...walk(TOPICS), ...walk(path.join(CONTENT, 'units'))]) {
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

// 6. La página consolidada de práctica (content/practica.md) usa el mismo
// contrato items[]/hints que antes tenía cada exercises.md por tema — ahora
// vive en un único archivo para todo el curso.
const practicaPath = path.join(CONTENT, 'practica.md');
if (fs.existsSync(practicaPath)) {
  const raw = fs.readFileSync(practicaPath, 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    let data;
    try {
      data = YAML.parse(fm[1]);
    } catch (e) {
      fail(`content/practica.md: frontmatter YAML inválido — ${e.message.split('\n')[0]}`);
      data = null;
    }
    if (data) {
      for (const [i, item] of (data.items ?? []).entries()) {
        strings(`content/practica.md items[${i}].hints`, item.hints);
        if (!item.hints?.length) fail(`content/practica.md items[${i}] no tiene pistas`);
        if (item.cppFile && !fs.existsSync(path.join(ROOT, 'cpp/practica', item.cppFile))) {
          fail(`content/practica.md items[${i}].cppFile "${item.cppFile}" no existe en cpp/practica/`);
        }
      }
    }
  }
} else {
  warn('content/practica.md todavía no existe — página consolidada de ejemplos y ejercicios pendiente');
}

for (const w of warnings) console.warn(`  ~ ${w}`);

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s):\n`);
  for (const e of errors) console.error(`  · ${e}`);
  process.exit(1);
}
console.log(`✓ knowledge map coherente — ${ids.size} temas, ${folders.size} carpetas, ${map.units.length} unidades`);
