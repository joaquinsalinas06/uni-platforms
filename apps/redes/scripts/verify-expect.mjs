#!/usr/bin/env node
// Verifica cada `expect` de los bloques circuit contra el solver (tolerancia 1 %).
// Uso: node scripts/verify-expect.mjs <archivo|carpeta>...   (sin args: content/ + src/pages/lab/)
// Sale con 1 si hay discrepancias o bloques no evaluables.
import { walk, vizBlocks } from './viz-blocks.mjs';
const { checkExpect, formatSI } = await import('../src/visualizations/circuit/solve.ts');

const args = process.argv.slice(2);
const files = (args.length ? args : ['content', 'src/pages/lab']).flatMap((p) => walk(p, true));

const unitOf = (k) => (k.startsWith('I(') ? 'A' : k.startsWith('V(') ? 'V' : k.startsWith('Req(') ? 'Ω' : k.startsWith('P(') ? 'W' : '');
let bad = 0, n = 0, keys = 0;
for (const f of files) {
  for (const b of vizBlocks(f)) {
    const viz = b.viz;
    // Un bloque que usa variables (p.ej. viz={g.viz} en una galería .astro) no es un literal: se avisa y se salta.
    if (b.error) { console.warn(`⚠ ${f}:${b.at} bloque no literal, sin verificar — ${b.error.message}`); continue; }
    if (viz?.type !== 'circuit') continue;
    n++;
    keys += viz.steps.reduce((s, st) => s + Object.keys(st.expect ?? {}).length, 0);
    for (const m of checkExpect(viz)) {
      bad++;
      const off = !b.code ? -1 : b.code.indexOf(`'${m.key}'`) >= 0 ? b.code.indexOf(`'${m.key}'`) : b.code.indexOf(`"${m.key}"`);
      const line = typeof b.at === 'string' ? b.at : b.at + (off >= 0 ? b.code.slice(0, off).split('\n').length - 1 : 0);
      const u = unitOf(m.key);
      const got = Number.isNaN(m.got) ? `— (${m.message ?? 'sin valor'})` : `${formatSI(m.got, u, 4)} [${m.got}]`;
      console.error(`✗ ${f}:${line} paso ${m.step + 1} ${m.key}: esperado ${formatSI(m.expected, u, 4)} [${m.expected}], solver ${got}`);
    }
  }
}
console.log(`${bad ? '✗' : '✓'} ${keys} valores esperados en ${n} circuito(s) de ${files.length} archivo(s); ${bad} discrepancia(s)`);
process.exit(bad ? 1 : 0);
