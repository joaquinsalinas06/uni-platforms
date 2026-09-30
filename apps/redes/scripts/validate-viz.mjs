#!/usr/bin/env node
// Valida cada `<Visualization viz={{…}} />` de los .mdx dados contra visualizationSchema.
// Uso: node scripts/validate-viz.mjs <archivo|carpeta>...   (sin args: content/)
import { walk, vizBlocks } from './viz-blocks.mjs';
const { visualizationSchema } = await import('../src/lib/schemas.ts');

const files = (process.argv.slice(2).length ? process.argv.slice(2) : ['content']).flatMap((p) => walk(p));

let bad = 0, n = 0;
for (const f of files) {
  for (const b of vizBlocks(f)) {
    n++;
    const obj = b.viz;
    if (b.error) { bad++; console.error(`✗ ${f}:${b.at} JS inválido — ${b.error.message}\n${b.code.slice(0,120)} … ${b.code.slice(-80)}`); continue; }
    const r = visualizationSchema.safeParse(obj);
    if (!r.success) { bad++; console.error(`✗ ${f}:${b.at}\n${r.error.issues.map((x) => `   ${x.path.join('.')}: ${x.message}`).join('\n')}`); }
  }
}
console.log(`${bad ? '✗' : '✓'} ${n - bad}/${n} bloques válidos en ${files.length} archivo(s)`);
process.exit(bad ? 1 : 0);
