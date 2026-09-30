#!/usr/bin/env node
// Detecta el patrón: un id de nodo aparece en un paso, desaparece en uno o
// más pasos intermedios, y reaparece más tarde — eso rompe la animación por
// key de React (el nodo "puebla y reaparece" en vez de deslizarse).
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const TOPICS = 'content/topics';
// `dag` y `network-topology` son las dos familias con nodos persistentes
// entre pasos (interpolación por key) — las únicas donde este patrón rompe
// la animación. `xy-chart`/`timeline`/`memory-layout` no usan `nodes`.
const NODE_BASED_FAMILIES = new Set(['dag', 'network-topology']);
let found = 0;

for (const id of fs.readdirSync(TOPICS)) {
  const files = ['theory.md', 'theory.mdx']
    .map((f) => path.join(TOPICS, id, f))
    .filter((f) => fs.existsSync(f));
  for (const sub of ['algorithms', 'models']) {
    const dir = path.join(TOPICS, id, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) files.push(path.join(dir, f));
  }

  for (const full of files) {
    const raw = fs.readFileSync(full, 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    let data;
    try {
      data = YAML.parse(fm[1]);
    } catch {
      continue;
    }
    const viz = data.visualization;
    if (!viz || !NODE_BASED_FAMILIES.has(viz.type) || !viz.steps) continue;

    const seenBefore = new Set();
    let missingSince = new Map(); // id -> step index desde que falta
    viz.steps.forEach((step, i) => {
      const idsNow = new Set((step.nodes ?? []).map((n) => n.id));
      for (const prevId of seenBefore) {
        if (!idsNow.has(prevId) && !missingSince.has(prevId)) {
          missingSince.set(prevId, i);
        }
      }
      for (const nowId of idsNow) {
        if (missingSince.has(nowId)) {
          console.log(`${full}: nodo "${nowId}" desaparece en paso ${missingSince.get(nowId) + 1} y reaparece en paso ${i + 1}`);
          found++;
          missingSince.delete(nowId);
        }
      }
      for (const idNow of idsNow) seenBefore.add(idNow);
    });
  }
}
console.log(`\ntotal: ${found} casos de nodos que desaparecen y reaparecen`);
