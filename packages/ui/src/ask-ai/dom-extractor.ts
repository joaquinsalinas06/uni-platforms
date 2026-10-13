import type { PageTechnicalDetails } from './types';

/**
 * Resume un bloque de visualización (<Visualization>) en texto estructurado
 * tanto para el HTML estático (SSR) como para el contexto enviado al LLM.
 */
export function summarizeVisualization(viz: Record<string, any>, steps: Record<string, any>[]): string {
  const titlePart = viz.title ? `"${viz.title}" ` : '';
  const modePart = viz.mode ? `, modo: ${viz.mode}` : '';
  return [
    `Diagrama interactivo ${titlePart}[tipo: ${viz.type}${modePart}, ${steps.length} paso(s)]:`,
    ...steps.slice(0, 12).map((s, idx) => {
      const desc = s.note || s.caption || s.title || `Paso ${idx + 1}`;
      const extras: string[] = [];
      if (Array.isArray(s.nodes) && s.nodes.length > 0) {
        extras.push(
          `nodos=[${s.nodes
            .slice(0, 10)
            .map((n: any) => `${n.label ?? n.value ?? n.id}${n.parent ? `→${n.parent}` : ''}`)
            .join(', ')}]`
        );
      }
      if (Array.isArray(s.components) && s.components.length > 0) {
        extras.push(
          `componentes=[${s.components
            .slice(0, 10)
            .map((c: any) => `${c.kind ?? c.type ?? ''}:${c.label ?? c.id ?? ''}${c.value ? `=${c.value}` : ''}`)
            .join(', ')}]`
        );
      }
      return `  - Paso ${idx + 1}: ${desc}${extras.length ? ` (${extras.join('; ')})` : ''}`;
    }),
  ].join('\n');
}

/**
 * Serializa un nodo DOM o DocumentFragment preservando el código fuente LaTeX
 * original de KaTeX ($...$ y $$...$$) y las notas de diagramas.
 */
export function serializeNodeWithKatex(node: Node): {
  text: string;
  latexFormulas: string[];
  diagramNotes: string[];
} {
  const latexSet = new Set<string>();
  const diagramSet = new Set<string>();

  function walk(n: Node): string {
    if (n.nodeType === Node.TEXT_NODE) return n.textContent ?? '';
    if (n.nodeType !== Node.ELEMENT_NODE && n.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return '';

    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as HTMLElement;
      if (
        el.hasAttribute('data-ai-widget') ||
        el.classList.contains('katex-html') ||
        el.tagName === 'SCRIPT' ||
        el.tagName === 'STYLE'
      ) {
        return '';
      }

      const diagAttr = el.getAttribute('data-ai-diagram');
      if (diagAttr) diagramSet.add(diagAttr.trim());

      if (el.classList.contains('katex-display')) {
        const tex = el.querySelector('annotation[encoding="application/x-tex"]')?.textContent?.trim();
        if (tex) {
          latexSet.add(`$$${tex}$$`);
          return `\n$$${tex}$$\n`;
        }
      }

      if (el.classList.contains('katex')) {
        const tex = el.querySelector('annotation[encoding="application/x-tex"]')?.textContent?.trim();
        if (tex) {
          latexSet.add(`$${tex}$`);
          return `$${tex}$`;
        }
      }

      if (el.tagName === 'FIGURE') {
        const img = el.querySelector('img');
        const cap = el.querySelector('figcaption')?.textContent?.trim();
        const alt = img?.getAttribute('alt')?.trim();
        const src = img?.getAttribute('src');
        const absUrl = src && typeof window !== 'undefined' ? new URL(src, window.location.origin).href : src;
        const figDesc = `Figura${cap ? ` (${cap})` : ''}: ${alt || 'imagen técnica'}${absUrl ? ` [URL imagen: ${absUrl}]` : ''}`;
        diagramSet.add(figDesc);
        return `\n[${figDesc}]\n`;
      }

      if (el.tagName === 'PRE') {
        return `\n\`\`\`\n${(el.innerText || el.textContent || '').trim()}\n\`\`\`\n`;
      }

      if (el.tagName === 'CODE' && el.parentElement?.tagName !== 'PRE') {
        return `\`${(el.textContent || '').trim()}\``;
      }

      if (/^H[1-4]$/.test(el.tagName)) {
        const prefix = '#'.repeat(Number(el.tagName[1]));
        return `\n\n${prefix} ${Array.from(el.childNodes).map(walk).join('').trim()}\n`;
      }

      if (['P', 'LI', 'TR', 'BLOCKQUOTE', 'SECTION', 'DIV'].includes(el.tagName)) {
        const inner = Array.from(el.childNodes).map(walk).join('');
        if (el.tagName === 'LI') return `\n- ${inner.trim()}`;
        if (el.tagName === 'TR') return `\n${inner.trim()}`;
        if (el.tagName === 'TD' || el.tagName === 'TH') return `${inner.trim()} | `;
        if (el.tagName === 'P') return `\n${inner.trim()}\n`;
        return inner;
      }
    }

    return Array.from(n.childNodes).map(walk).join('');
  }

  return {
    text: walk(node).replace(/\n{3,}/g, '\n\n').trim(),
    latexFormulas: Array.from(latexSet),
    diagramNotes: Array.from(diagramSet),
  };
}

/**
 * Extrae del DOM activo (<main>) los metadatos técnicos de la página:
 * enlace en vivo del usuario, estructura de secciones, fórmulas KaTeX y diagramas.
 */
export function extractPageTechnicalDetails(): PageTechnicalDetails {
  if (typeof window === 'undefined') {
    return {
      pageTitle: '',
      courseLabel: '',
      currentUrl: '',
      headings: [],
      katexFormulas: [],
      diagrams: [],
      fullMarkdown: '',
    };
  }

  const main = document.querySelector('main');
  const currentUrl = window.location.href;
  const pageTitle =
    main?.querySelector('h1')?.textContent?.trim() ||
    document.title.split('·')[0]?.trim() ||
    document.title;
  const courseLabel =
    document.querySelector('body > header a')?.textContent?.replace(/\s+/g, ' ').trim() || '';

  if (!main) {
    return { pageTitle, courseLabel, currentUrl, headings: [], katexFormulas: [], diagrams: [], fullMarkdown: '' };
  }

  const headings = Array.from(main.querySelectorAll('h2, h3'))
    .map((h) => h.textContent?.replace(/\s+/g, ' ').trim() || '')
    .filter(Boolean);

  const katexSet = new Set<string>();
  main.querySelectorAll('.katex-display annotation[encoding="application/x-tex"]').forEach((ann) => {
    const tex = ann.textContent?.trim();
    if (tex) katexSet.add(`$$${tex}$$`);
  });
  main.querySelectorAll('.katex annotation[encoding="application/x-tex"]').forEach((ann) => {
    if (katexSet.size >= 18) return;
    const tex = ann.textContent?.trim();
    if (tex && tex.length > 2 && !katexSet.has(`$$${tex}$$`)) {
      katexSet.add(`$${tex}$`);
    }
  });

  const diagramList: string[] = [];
  const seenDiagrams = new Set<string>();

  main.querySelectorAll<HTMLElement>('[data-ai-diagram]').forEach((el) => {
    const summary = el.getAttribute('data-ai-diagram')?.trim();
    if (summary && !seenDiagrams.has(summary)) {
      seenDiagrams.add(summary);
      diagramList.push(summary);
    }
  });

  main.querySelectorAll<SVGSVGElement>('svg').forEach((svg, idx) => {
    if (svg.closest('[data-ai-diagram]') || svg.closest('button') || svg.closest('a')) return;
    const width = svg.viewBox?.baseVal?.width || svg.clientWidth || 0;
    if (width < 120) return;

    const container = svg.closest('section, figure, div.my-6, div.my-8') as HTMLElement | null;
    const labels = Array.from(svg.querySelectorAll('text'))
      .map((t) => t.textContent?.trim() || '')
      .filter((t) => t.length > 0)
      .slice(0, 20);
    const caption =
      container?.querySelector('figcaption, p.text-sm, .tag')?.textContent?.replace(/\s+/g, ' ').trim() || '';

    if (labels.length > 0 || caption) {
      const desc = `Diagrama visual #${idx + 1}${caption ? ` (${caption})` : ''}: etiquetas/nodos visibles [${labels.join(', ')}]`;
      if (!seenDiagrams.has(desc)) {
        seenDiagrams.add(desc);
        diagramList.push(desc);
      }
    }
  });

  return {
    pageTitle,
    courseLabel,
    currentUrl,
    headings,
    katexFormulas: Array.from(katexSet),
    diagrams: diagramList,
    fullMarkdown: serializeNodeWithKatex(main).text,
  };
}
