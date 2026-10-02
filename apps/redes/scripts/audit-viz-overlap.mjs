#!/usr/bin/env node
// Detector determinista de solapes: corre el layout PURO de cada familia sobre
// cada paso de cada bloque y lista choques de cajas (íconos, rótulos, chips,
// zonas, corchetes, campos…). Uso: node scripts/audit-viz-overlap.mjs [ruta…]
// (sin args: content/ + templates/ + src/pages/lab). Sale con 1 si hay choques.
import { walk, vizBlocks } from './viz-blocks.mjs';
const { visualizationSchema } = await import('../src/lib/schemas.ts');
const { netSceneLayout, netSceneIssues } = await import('../src/visualizations/net-scene/layout.ts');
const { spacetimeIssues } = await import('../src/visualizations/spacetime/layout.ts');
const { windowIssues } = await import('../src/visualizations/window/layout.ts');
const { packetIssues } = await import('../src/visualizations/packet/layout.ts');
const { flowIssues } = await import('../src/visualizations/flow/layout.ts');
const { fsmIssues } = await import('../src/visualizations/fsm/layout.ts');
const only = process.env.FAMILY;

/** familia → (pasos) → issues por paso (string[][]) */
const AUDIT = {
  // Escritorio (k = 1) y móvil (texto ×1.25, MAX_BOOST de net-kit): los dos tienen que quedar limpios.
  'net-scene': (steps) => steps.map((s) => [...netSceneIssues(netSceneLayout(s)), ...netSceneIssues(netSceneLayout(s, 1.25)).map((m) => `[móvil] ${m}`)]),
  spacetime: spacetimeIssues,
  window: windowIssues,
  packet: packetIssues,
  flow: flowIssues,
  fsm: fsmIssues,
};

const args = process.argv.slice(2);
const files = (args.length ? args : ['content', 'templates', 'src/pages/lab']).flatMap((p) => walk(p, true));
let blocks = 0, hits = 0;
for (const f of files) {
  for (const b of vizBlocks(f)) {
    if (b.error || !AUDIT[b.viz?.type] || (only && b.viz.type !== only)) continue;
    const r = visualizationSchema.safeParse(b.viz);
    if (!r.success) continue;
    blocks++;
    const viz = r.data;
    const steps = viz.mode ? viz.steps.map((s) => ({ mode: viz.mode, ...s })) : viz.steps;
    const per = AUDIT[viz.type](steps);
    // Mismo choque en pasos seguidos: se informa una vez con el rango.
    const seen = new Map();
    per.forEach((list, i) => [...new Set(list)].forEach((m) => (seen.has(m) ? seen.get(m).push(i + 1) : seen.set(m, [i + 1]))));
    for (const [m, at] of seen) {
      hits++;
      const pasos = at.length === steps.length && steps.length > 1 ? 'todos los pasos' : `paso ${at.length > 3 ? `${at[0]}…${at[at.length - 1]}` : at.join(',')}`;
      console.log(`✗ ${f}:${b.at} «${viz.title ?? viz.type}» ${pasos}: ${m}`);
    }
  }
}
console.log(`${hits ? '✗' : '✓'} ${hits} solape(s) en ${blocks} bloque(s) de ${files.length} archivo(s)`);
process.exit(hits ? 1 : 0);
