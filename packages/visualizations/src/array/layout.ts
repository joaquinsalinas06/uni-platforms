// Layout puro de `array` — la "pizarra de celdas": una o varias filas de celdas
// (memoria en bloques, sparse table, suffix array + LCP, layout vEB, cadenas
// de bits), con llaves que agrupan tramos (`spans`) y flechas entre celdas.
// Sin React/JSX para poder testearlo con `node --test`.
//
// Ids de celda: `<idFila>-<índice>` salvo que la celda traiga `id` propio.
import { boxWidth, type CanvasEdge, type CanvasGroup, type CanvasNode, type CanvasText, type Frame, type NodeState } from '../canvas-types.ts';

export type ArrayCell = { id?: string; value: string | number; /** índice/etiqueta pequeña ARRIBA de la celda */ tag?: string; state?: NodeState };
export type ArrayRow = { id: string; label?: string; cells: ArrayCell[] };
/** Tramo contiguo de una fila (índices inclusivos) rodeado por un panel con etiqueta (un bloque B, un cluster). */
export type ArraySpan = { id: string; row: string; from: number; to: number; label?: string; state?: NodeState };
export type ArrayLink = { from: string; to: string; label?: string; curve?: number; kind?: 'tree' | 'shared' | 'pointer' };
export type ArrayInput = { rows?: ArrayRow[]; spans?: ArraySpan[]; links?: ArrayLink[]; caption?: string };

const CELL_H = 30;
const GAP = 2;
const PAD_X = 16;
const PAD_T = 22;
const ROW_STEP = 82;
const SPAN_PAD = 5;
const FONT = 13;

/** Corte por palabras a `max` caracteres por línea (una palabra más larga ocupa su propia línea). */
export function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if (cur && cur.length + 1 + w.length > max) {
      out.push(cur);
      cur = w;
    } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) out.push(cur);
  return out;
}

export function cellId(row: ArrayRow, i: number): string {
  return row.cells[i]?.id ?? `${row.id}-${i}`;
}

/** Ancho de celda común a TODOS los pasos (así la fila no "respira" al avanzar). */
export function sharedCellWidth(inputs: ArrayInput[]): number {
  let w = 34;
  for (const s of inputs) for (const r of s.rows ?? []) for (const c of r.cells) w = Math.max(w, boxWidth(String(c.value), FONT, 0));
  return Math.ceil(w);
}

export function arrayLayout(input: ArrayInput, opts: { cellW?: number; width?: number; labelW?: number } = {}): Frame {
  const rows = input.rows ?? [];
  const cw = opts.cellW ?? sharedCellWidth([input]);
  const labelW = opts.labelW ?? (rows.some((r) => r.label) ? Math.min(150, Math.max(...rows.map((r) => (r.label ?? '').length)) * 7 + 12) : 0);
  const left = PAD_X + labelW;
  const x0s = (i: number) => left + Math.max(0, i) * (cw + GAP);
  const maxCells = rows.length ? Math.max(...rows.map((r) => r.cells.length)) : 0;
  const spanReach = Math.max(0, ...(input.spans ?? []).map((s) => x0s(s.from) + Math.max((s.to - s.from + 1) * (cw + GAP), (s.label?.length ?? 0) * 6.6 + 12)));
  const natural = Math.max(left + maxCells * (cw + GAP) + PAD_X, spanReach + PAD_X);
  const width = Math.max(opts.width ?? 0, natural);

  const nodes: CanvasNode[] = [];
  const annotations: CanvasText[] = [];
  const groups: CanvasGroup[] = [];
  const x0 = (i: number) => left + i * (cw + GAP);
  // margen superior: lo que sobresale del panel de un tramo en la primera fila (etiqueta + índices)
  const topExtra = (input.spans ?? []).some((sp) => rows.find((r) => r.id === sp.row)?.cells.some((c) => c.tag)) ? 14 : 0;
  const rowY = (ri: number) => PAD_T + topExtra + ri * ROW_STEP + 18;

  rows.forEach((r, ri) => {
    const y = rowY(ri);
    if (r.label) annotations.push({ id: `${r.id}-label`, text: r.label, x: left - 10, y: y + 4, anchor: 'end', size: 12, weight: 600 });
    r.cells.forEach((c, i) => {
      nodes.push({ id: cellId(r, i), label: String(c.value), shape: 'cell', x: x0(i) + cw / 2, y, w: cw, h: CELL_H, tag: c.tag, state: c.state });
    });
  });

  for (const s of input.spans ?? []) {
    const ri = rows.findIndex((r) => r.id === s.row);
    if (ri < 0) continue;
    const from = Math.max(0, s.from);
    const to = Math.min(rows[ri].cells.length - 1, s.to);
    if (to < from) continue;
    const natural = (to - from + 1) * (cw + GAP) - GAP + 2 * SPAN_PAD;
    // si la fila trae índices (`tag`) sobre las celdas, el panel sube otros 14px
    // para que su etiqueta no se pise con ellos
    const lift = rows[ri].cells.some((c) => c.tag) ? 14 : 0;
    groups.push({
      id: s.id,
      label: s.label,
      x: x0(from) - SPAN_PAD,
      y: rowY(ri) - CELL_H / 2 - SPAN_PAD - 16 - lift,
      // el panel nunca es más angosto que su etiqueta (mono 10px ≈ 6.4px/car., en mayúsculas)
      w: Math.max(natural, (s.label?.length ?? 0) * 6.6 + 12),
      h: CELL_H + 2 * SPAN_PAD + 16 + lift,
      style: 'ghost',
    });
  }

  const known = new Set(nodes.map((n) => n.id));
  const edges: CanvasEdge[] = (input.links ?? [])
    .filter((l) => known.has(l.from) && known.has(l.to))
    .map((l) => ({ from: l.from, to: l.to, kind: l.kind ?? 'pointer', arrow: true, label: l.label, curve: l.curve ?? 22 }));

  const bottom = rows.length ? rowY(rows.length - 1) + CELL_H / 2 + SPAN_PAD + 14 : 40;
  // La caption se parte en líneas que quepan en el ancho disponible (mono 12px ≈ 7.2px/car.):
  // el texto SVG no se ajusta solo y se cortaba en el borde del lienzo.
  const lines = input.caption ? wrap(input.caption, Math.max(20, Math.floor((width - left - PAD_X) / 7.3))) : [];
  lines.forEach((t, i) => annotations.push({ id: `caption-${i}`, text: t, x: left, y: bottom + 14 + i * 16, size: 12, state: 'muted' }));
  const height = bottom + (lines.length ? 14 + lines.length * 16 + 8 : 8);

  return { nodes, edges, groups, annotations, width, height };
}
