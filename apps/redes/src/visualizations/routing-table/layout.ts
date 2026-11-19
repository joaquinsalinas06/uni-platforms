// Layout puro de `routing-table`: tabla D,p de Dijkstra (filas = pasos) o
// vector de distancias (filas = nodos, columnas = destinos) y, opcional, el
// grafo de `net-scene` al lado (ancho) o debajo (angosto). Anchos y alto se
// calculan sobre TODOS los pasos: la tabla no salta entre pasos.
import type { NodeState } from '../canvas-types.ts';
import { textW } from '../net-style.ts';
import { overlapArea, type Rect } from '../geom.ts';
import { W as NET_W, H as NET_H, type NetDevice, type NetCable } from '../net-scene/layout.ts';

export type RtCell = { value?: string; state?: NodeState; closed?: boolean };
export type RtRow = { label: string; cells: RtCell[] };
export type RtStep = { mode?: string; columns?: unknown[]; rows?: RtRow[]; graph?: { devices?: NetDevice[]; cables?: NetCable[] } };

export const FS = 13;
export const FS_HEAD = 12;
/** Texto agrandado de móvil (MAX_BOOST de net-kit): las celdas ya lo admiten. */
const BOOST = 1.25;
const PAD = 12;
export const CELL_H = 30;
export const HEAD_H = 28;
const GAP = 3;
const LEGEND_H = 20;
/** Grafo al lado: escala del lienzo de net-scene (640×402). */
const SIDE_SCALE = 0.75;
/** Ancho mínimo del lienzo apilado: ~1 unidad por px en un móvil de 390 px. */
export const STACK_MIN = 360;

export const CORNER: Record<string, string> = { dijkstra: 'paso · N′', dv: 'nodo' };
export const LEGEND: { key: 'active' | 'marked' | 'closed' | 'answer'; label: Record<string, string> }[] = [
  { key: 'active', label: { dijkstra: 'mejoró en este paso', dv: 'cambió en este instante' } },
  { key: 'marked', label: { dijkstra: 'mínimo: entra a N′', dv: 'señalado' } },
  { key: 'answer', label: { dijkstra: 'resultado', dv: 'resultado' } },
  { key: 'closed', label: { dijkstra: 'ya en N′', dv: 'sin dato' } },
];

/** Vacío o "inf" se leen como ∞ sólo si el autor lo escribe: "" es celda en blanco. */
export const show = (v?: string) => (v === 'inf' || v === 'Infinity' ? '∞' : v ?? '');

export type CellL = { key: string; x: number; y: number; w: number; h: number; text: string; state?: NodeState; closed: boolean };
export type RowL = { key: string; label: string; y: number; cells: CellL[] };
export type RtFrame = {
  mode: string;
  width: number;
  height: number;
  corner: { x: number; y: number; w: number; h: number; text: string };
  head: { key: string; x: number; y: number; w: number; text: string }[];
  rows: RowL[];
  legend: { key: string; label: string; x: number; y: number }[];
  graph?: { x: number; y: number; scale: number; step: { devices: NetDevice[]; cables: NetCable[] } };
};

const cols = (s: RtStep): string[] => (s.columns ?? []).map((c) => (typeof c === 'string' ? c : String((c as { label?: string }).label ?? '')));

/** Todos los pasos juntos. `wide`: grafo al lado de la tabla; si no, debajo. */
export function routingTableLayouts(steps: RtStep[], wide = true): RtFrame[] {
  const mode = steps.find((s) => s.mode === 'dv') ? 'dv' : 'dijkstra';
  const nCols = Math.max(0, ...steps.map((s) => cols(s).length));
  const colW = Array.from({ length: nCols }, (_, j) =>
    Math.ceil(Math.max(24, ...steps.flatMap((s) => [textW(cols(s)[j] ?? '', FS_HEAD * BOOST, false), ...(s.rows ?? []).map((r) => textW(show(r.cells[j]?.value), FS * BOOST))])) + 12),
  );
  const corner = CORNER[mode];
  const labelW = Math.ceil(Math.max(textW(corner, FS_HEAD * BOOST, false), ...steps.flatMap((s) => (s.rows ?? []).map((r) => textW(r.label, FS * BOOST)))) + 16);
  const tableW = labelW + colW.reduce((a, b) => a + b + GAP, 0);
  const nRows = Math.max(0, ...steps.map((s) => s.rows?.length ?? 0));
  const tableH = HEAD_H + GAP + nRows * (CELL_H + GAP);

  const used = new Set(steps.flatMap((s) => (s.rows ?? []).flatMap((r) => r.cells.flatMap((c) => [c.state, c.closed ? 'closed' : undefined]))));
  const legendItems = LEGEND.filter((l) => used.has(l.key)).map((l) => ({ key: l.key, label: l.label[mode] }));
  // Leyenda en líneas que caben en el ancho de la tabla (muestra 14 + texto sans 10.5·BOOST).
  const lineMax = Math.max(tableW, wide ? 180 : STACK_MIN - 2 * PAD);
  const legend: RtFrame['legend'] = [];
  let lx = 0, ly = 0, legendW = 0;
  for (const l of legendItems) {
    const w = 22 + textW(l.label, 10.5 * BOOST, false) + 12;
    if (lx > 0 && lx + w > lineMax) { lx = 0; ly += LEGEND_H; }
    legend.push({ ...l, x: PAD + lx, y: 8 + tableH + 10 + ly });
    lx += w;
    legendW = Math.max(legendW, lx - 12);
  }
  const blockH = 8 + tableH + (legend.length ? 10 + ly + LEGEND_H : 0);

  const hasGraph = steps.some((s) => s.graph?.devices?.length);
  let width = Math.max(Math.max(tableW, legendW) + 2 * PAD, wide ? 0 : STACK_MIN);
  let height = blockH;
  let gx = 0, gy = 0, scale = 1;
  if (hasGraph) {
    if (wide) {
      scale = SIDE_SCALE;
      gx = PAD + Math.max(tableW, legendW) + 20;
      gy = 0;
      width = gx + NET_W * scale + PAD;
      height = Math.max(blockH, NET_H * scale);
    } else {
      scale = Math.min(1, (width - 2 * PAD) / NET_W);
      gx = (width - NET_W * scale) / 2;
      gy = blockH + 8;
      height = gy + NET_H * scale;
    }
  }
  const x0 = wide || !hasGraph ? PAD : Math.max(PAD, (width - tableW) / 2);
  const legendShift = x0 - PAD;

  return steps.map((s) => {
    const names = cols(s);
    const y0 = 8;
    let x = x0 + labelW + GAP;
    const head = colW.map((w, j) => {
      const h = { key: `h${j}`, x, y: y0, w, text: names[j] ?? '' };
      x += w + GAP;
      return h;
    });
    const rows = (s.rows ?? []).map((r, i) => {
      const y = y0 + HEAD_H + GAP + i * (CELL_H + GAP);
      return {
        key: `r${i}`,
        label: r.label,
        y,
        cells: head.map((h, j) => {
          const c = r.cells[j] ?? {};
          return { key: `r${i}c${j}`, x: h.x, y, w: h.w, h: CELL_H, text: show(c.value), state: c.state, closed: !!c.closed };
        }),
      };
    });
    const g = s.graph?.devices?.length ? { devices: s.graph.devices, cables: s.graph.cables ?? [] } : undefined;
    return {
      mode,
      width,
      height,
      corner: { x: x0, y: y0, w: labelW, h: HEAD_H, text: corner },
      head,
      rows,
      legend: legend.map((l) => ({ ...l, x: l.x + legendShift })),
      graph: g ? { x: gx, y: gy, scale, step: g } : undefined,
    };
  });
}

/** Lo que choca o falta, por paso (desktop y apilado). */
export function routingTableIssues(steps: RtStep[]): string[][] {
  const wide = routingTableLayouts(steps, true), narrow = routingTableLayouts(steps, false);
  return steps.map((s, i) => {
    const out: string[] = [];
    const n = cols(s).length;
    (s.rows ?? []).forEach((r) => r.cells.length !== n && out.push(`fila «${r.label}»: ${r.cells.length} celdas para ${n} columnas`));
    for (const [tag, f] of [['', wide[i]], ['[móvil] ', narrow[i]]] as const) {
      if (!Number.isFinite(f.width) || !Number.isFinite(f.height)) out.push(`${tag}lienzo sin tamaño (${f.width}×${f.height})`);
      const boxes: { r: Rect; what: string }[] = [];
      for (const r of f.rows) for (const c of r.cells) {
        if (c.x + c.w > f.width || c.y + c.h > f.height) out.push(`${tag}celda de «${r.label}» se sale del lienzo`);
        if (textW(c.text, FS * BOOST) > c.w - 4) out.push(`${tag}«${c.text}» no cabe en su celda`);
      }
      f.legend.forEach((l) => boxes.push({ r: { x: l.x, y: l.y - 7, w: 22 + textW(l.label, 10.5 * BOOST, false), h: 14 }, what: `leyenda «${l.label}»` }));
      if (f.graph) boxes.push({ r: { x: f.graph.x, y: f.graph.y, w: NET_W * f.graph.scale, h: NET_H * f.graph.scale }, what: 'grafo' });
      const last = f.rows.length ? f.rows[f.rows.length - 1].y + CELL_H : f.corner.y + HEAD_H;
      boxes.push({ r: { x: f.corner.x, y: f.corner.y, w: f.head.length ? f.head[f.head.length - 1].x + f.head[f.head.length - 1].w - f.corner.x : f.corner.w, h: last - f.corner.y }, what: 'tabla' });
      boxes.forEach((a, j) => {
        if (a.r.x < 0 || a.r.x + a.r.w > f.width + 0.5) out.push(`${tag}${a.what} se sale del lienzo`);
        for (const b of boxes.slice(j + 1)) if (overlapArea(a.r, b.r) > 2) out.push(`${tag}${a.what} pisa ${b.what}`);
      });
    }
    return out;
  });
}
