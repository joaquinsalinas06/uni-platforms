#!/usr/bin/env node
// Descarga Files de Canvas (UTEC) por semana a apps/<app>/raw-materials/semNN/ y extrae texto.
// Uso: CANVAS_TOKEN=... node scripts/canvas-pull.mjs [minWeek=8] [app...]
// El token se lee SOLO del entorno; nunca se guarda.
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, extname, basename } from 'node:path';

const BASE = 'https://utec.instructure.com/api/v1';
const COURSES = { eda: [24666], iot: [24674], redes: [24792, 24793] };
// ponytail: exclusiones fijas por nombre; mover a flags si crecen.
const SKIP = [/pcb/i, /\.pcap(ng)?$/i];

const token = process.env.CANVAS_TOKEN;
if (!token) { console.error('Falta CANVAS_TOKEN'); process.exit(1); }
const minWeek = Number(process.argv[2] ?? 8);
const apps = process.argv.slice(3).length ? process.argv.slice(3) : Object.keys(COURSES);
const H = { Authorization: `Bearer ${token}` };

const api = async (url) => {
  const r = await fetch(url.startsWith('http') ? url : BASE + url, { headers: H });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};

for (const app of apps) {
  const root = join('apps', app, 'raw-materials');
  const manifest = {};
  for (const course of COURSES[app]) {
    const modules = await api(`/courses/${course}/modules?include[]=items&per_page=100`);
    for (const m of modules) {
      const wk = Number(m.name.match(/Semana\s+(\d+)/i)?.[1]);
      if (!wk || wk < minWeek) continue;
      const items = m.items ?? (await api(`/courses/${course}/modules/${m.id}/items?per_page=100`));
      for (const it of items.filter((i) => i.type === 'File')) {
        const f = await api(it.url);
        const name = f.display_name || f.filename;
        if (SKIP.some((re) => re.test(name))) continue;
        const dir = join(root, `sem${String(wk).padStart(2, '0')}`);
        mkdirSync(dir, { recursive: true });
        const dest = join(dir, name);
        if (!existsSync(dest)) {
          const r = await fetch(f.url);
          if (!r.ok) { console.error('FALLÓ', name, r.status); continue; }
          await writeFile(dest, Buffer.from(await r.arrayBuffer()));
          console.log('↓', dest);
        }
        if (extname(name).toLowerCase() === '.pdf') {
          const txt = join(root, 'text', basename(name, extname(name)) + '.txt');
          mkdirSync(join(root, 'text'), { recursive: true });
          if (!existsSync(txt)) execFileSync('pdftotext', ['-layout', dest, txt]);
        }
        (manifest[`sem${wk}`] ??= []).push({ course, name, path: dest });
      }
    }
  }
  writeFileSync(join(root, 'canvas-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✓ ${app}: ${Object.values(manifest).flat().length} archivos`);
}
