// Extracción de bloques de visualización del contenido, compartida por
// validate-viz.mjs, verify-expect.mjs y los tests del layout de circuitos.
import fs from 'node:fs';
import path from 'node:path';

/** Archivos .md/.mdx (y .astro si `astro`) bajo cada ruta. */
export const walk = (p, astro = false) =>
  !fs.existsSync(p) ? [] : fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((f) => walk(path.join(p, f), astro)) : (astro ? /\.(mdx?|astro)$/ : /\.mdx?$/).test(p) ? [p] : [];

// Extrae el literal JS de viz={{ … }} contando llaves (respetando strings).
export function blocks(src) {
  const out = [];
  let i = 0;
  while ((i = src.indexOf('viz={', i)) !== -1) {
    let j = i + 4, depth = 0, q = null;
    for (; j < src.length; j++) {
      const c = src[j];
      if (q) { if (c === '\\') j++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === '`') q = c;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) break;
    }
    out.push({ at: src.slice(0, i).split('\n').length, code: src.slice(i + 5, j) });
    i = j;
  }
  return out;
}

/** Todos los bloques de un archivo; `viz` ya evaluado (o `error` si el literal no evalúa). */
export function vizBlocks(file) {
  const src = fs.readFileSync(file, 'utf8');
  return blocks(src).map((b) => {
    try { return { ...b, viz: new Function(`return (${b.code})`)() }; } catch (e) { return { ...b, error: e }; }
  });
}
