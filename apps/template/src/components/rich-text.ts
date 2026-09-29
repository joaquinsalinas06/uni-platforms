import katex from 'katex';

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Markdown en línea mínimo + KaTeX para enunciado/pistas/solución: el
 * texto viene de props (no pasa por el pipeline de remark), igual que la
 * nota de VisualizationCanvas. Soporta $…$, $$…$$, `código`, **negrita**,
 * *itálica* o _itálica_, listas `- ` / `1. ` y saltos de línea. Todo lo demás
 * se escapa. */
export function renderRich(src: string): string {
  const slots: string[] = [];
  const keep = (html: string) => `\u0000${slots.push(html) - 1}\u0000`;
  let t = src
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, f) => keep(katex.renderToString(f.trim(), { throwOnError: false, displayMode: true })))
    .replace(/\$([^$\n]+?)\$/g, (_, f) => keep(katex.renderToString(f, { throwOnError: false })))
    .replace(/`([^`\n]+)`/g, (_, c) => keep(`<code>${esc(c)}</code>`));
  t = esc(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*([^*\n]+)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^\w])_([^_\n]+)_(?!\w)/g, '$1<em>$2</em>');
  // Bloques: párrafos separados por línea en blanco; líneas "- " / "1. " → lista.
  const html = t.split(/\n{2,}/).map((block) => {
    const lines = block.split('\n');
    const ul = lines.every((l) => /^\s*[-•]\s+/.test(l));
    const ol = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
    if (ul || ol) {
      const items = lines.map((l) => `<li>${l.replace(/^\s*([-•]|\d+[.)])\s+/, '')}</li>`).join('');
      return ol ? `<ol class="rich-list list-decimal">${items}</ol>` : `<ul class="rich-list list-disc">${items}</ul>`;
    }
    return `<p>${lines.join('<br>')}</p>`;
  }).join('');
  return html.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[Number(i)]);
}
