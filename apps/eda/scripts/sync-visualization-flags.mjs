#!/usr/bin/env node
// Los agentes de contenido son dueños de su meta.yaml; el knowledge map lo
// mantiene el agente de integración. Cuando un agente añade un diagrama, marca
// hasVisualization en SU meta.yaml — y esto propaga ese hecho al mapa, que es
// lo que el check compara. Sin esto, cada diagrama nuevo rompe `pnpm check`.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const MAP = 'content/knowledge-map.json';
const raw = fs.readFileSync(MAP, 'utf8');
const map = JSON.parse(raw);
let out = raw;
const changes = [];

for (const [id, topic] of Object.entries(map.topics)) {
  const metaPath = path.join('content/structures', id, 'meta.yaml');
  if (!fs.existsSync(metaPath)) continue;
  const meta = YAML.parse(fs.readFileSync(metaPath, 'utf8'));

  const has = meta.hasVisualization === true;
  const type = meta.visualizationType;
  if (has === topic.hasVisualization && type === topic.visualizationType) continue;

  // Reescritura acotada a la entrada de este tema, para no reformatear el archivo.
  const start = out.indexOf(`"${id}": {`);
  const end = out.indexOf('\n    }', start);
  let block = out.slice(start, end);

  block = block.replace(/"hasVisualization": (true|false)/, `"hasVisualization": ${has}`);
  if (has && type) {
    block = /"visualizationType"/.test(block)
      ? block.replace(/"visualizationType": "[^"]*"/, `"visualizationType": "${type}"`)
      : block.replace(/("hasVisualization": true)/, `$1,\n      "visualizationType": "${type}"`);
  } else {
    block = block.replace(/,\n\s*"visualizationType": "[^"]*"/, '');
  }

  out = out.slice(0, start) + block + out.slice(end);
  changes.push(`${id}: hasVisualization=${has}${has && type ? ` (${type})` : ''}`);
}

if (changes.length) {
  JSON.parse(out); // no escribir JSON roto
  fs.writeFileSync(MAP, out);
  for (const c of changes) console.log(`  · ${c}`);
  console.log(`${changes.length} tema(s) sincronizado(s)`);
} else {
  console.log('nada que sincronizar');
}
