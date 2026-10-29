// Layout puro de `geometric` — la vista geométrica de un BST (optimalidad
// dinámica): un acceso a la clave x en el tiempo t es el punto (x, t); el
// costo de una ejecución es el número de puntos; "arboralmente satisfecho"
// es una propiedad de los RECTÁNGULOS que definen pares de puntos. Plano
// clave (eje horizontal, 1..xMax) × tiempo (eje vertical, 1..tMax, crece
// hacia ARRIBA como en las diapositivas del profesor).
//
// Todo se dibuja con CanvasPath (rejilla, puntos, rectángulos, segmentos) +
// CanvasText (ticks y etiquetas): sin nodos ni aristas. Sin React/JSX, para
// poder testearlo con `node --test`.
import { charW, type CanvasPath, type CanvasText, type Frame, type NodeState } from '../canvas-types.ts';

/** Punto (clave x, tiempo t). `kind: 'added'` = punto que NO es un acceso de
 * la entrada sino que lo agregó el algoritmo (Greedy, la ejecución del BST):
 * se dibuja como anillo hueco; `'input'` (default) como punto relleno. */
export type GeoPoint = { id: string; x: number; t: number; label?: string; kind?: 'input' | 'added'; state?: NodeState };

/** Extremo de un rectángulo o segmento: id de un punto, o coordenadas (x, t). */
export type GeoEnd = string | [number, number];

/** Rectángulo (o su borde) definido por dos esquinas opuestas. */
export type GeoRect = { id: string; a: GeoEnd; b: GeoEnd; label?: string; state?: NodeState; fill?: boolean; dash?: boolean };

export type GeoSegment = { id: string; from: GeoEnd; to: GeoEnd; label?: string; state?: NodeState; dash?: boolean; arrow?: boolean };

export type GeometricInput = {
  points?: GeoPoint[];
  rects?: GeoRect[];
  segments?: GeoSegment[];
  /** Llaves 1..xMax (default: la mayor x que aparezca). */
  xMax?: number;
  /** Tiempos 1..tMax (default: el mayor t que aparezca). */
  tMax?: number;
  /** Etiqueta de cada llave 1..xMax en el eje (default: el número). */
  xLabels?: string[];
  /** Fila (tiempo) que se está procesando en este paso: se resalta con una banda. */
  row?: number;
  highlight?: string[];
};

const PAD_L = 44;
const PAD_R = 18;
const PAD_T = 22;
const PAD_B = 64;
const DOT_R = 5.5;
const HALO_R = 12;
/** Escalonado de la entrada de puntos (ms entre uno y el siguiente) y su tope. */
const STAGGER = 55;
const STAGGER_MAX = 12;
const CELL_MIN = 26;
const CELL_MAX = 56;

const r1 = (v: number) => Math.round(v * 10) / 10;
const dot = (x: number, y: number, r: number) =>
  `M${r1(x - r)},${r1(y)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;

export type Geometry = { cw: number; ch: number; xMax: number; tMax: number; px: (x: number) => number; py: (t: number) => number };

/** Escala del plano: casilla cuadrada (acotada), llaves a lo ancho. */
export function geometry(input: GeometricInput, width: number): Geometry {
  const pts = input.points ?? [];
  const xMax = input.xMax ?? Math.max(1, ...pts.map((p) => p.x), ...endsX(input));
  const tMax = input.tMax ?? Math.max(1, ...pts.map((p) => p.t), ...endsT(input));
  const cw = (width - PAD_L - PAD_R) / xMax;
  const ch = Math.max(CELL_MIN, Math.min(CELL_MAX, cw));
  return {
    cw,
    ch,
    xMax,
    tMax,
    px: (x) => PAD_L + (x - 0.5) * cw,
    py: (t) => PAD_T + (tMax - t + 0.5) * ch,
  };
}

function endsOf(input: GeometricInput): GeoEnd[] {
  return [
    ...(input.rects ?? []).flatMap((r) => [r.a, r.b]),
    ...(input.segments ?? []).flatMap((s) => [s.from, s.to]),
  ].filter((e): e is [number, number] => Array.isArray(e));
}
const endsX = (i: GeometricInput) => endsOf(i).map((e) => e[0]);
const endsT = (i: GeometricInput) => endsOf(i).map((e) => e[1]);

function resolve(end: GeoEnd, byId: Map<string, GeoPoint>, where: string): [number, number] {
  if (Array.isArray(end)) return end;
  const p = byId.get(end);
  if (!p) throw new Error(`geometric: ${where} refiere al punto "${end}", que no existe en este paso`);
  return [p.x, p.t];
}

export function geometricLayout(input: GeometricInput, opts: { width?: number; height?: number } = {}): Frame {
  const W = opts.width ?? 560;
  const g = geometry(input, W);
  const highlight = input.highlight ?? [];
  const points = input.points ?? [];
  const byId = new Map(points.map((p) => [p.id, p]));
  const paths: CanvasPath[] = [];
  const annotations: CanvasText[] = [];

  const stateOf = (id: string, s?: NodeState): NodeState | undefined => s ?? (highlight.includes(id) ? 'active' : undefined);

  const plotL = PAD_L;
  const plotR = W - PAD_R;
  const plotT = PAD_T;
  const plotB = PAD_T + g.tMax * g.ch;
  const row = input.row;

  // ── Banda de la fila que se procesa (debajo de todo): "ahora estamos aquí".
  if (row !== undefined && row >= 1 && row <= g.tMax) {
    const y0 = r1(g.py(row) - g.ch / 2), y1 = r1(g.py(row) + g.ch / 2);
    paths.push({ id: 'row-band', d: `M${plotL},${y0}H${r1(plotR)}V${y1}H${plotL}Z`, fill: true, opacity: 0.08, state: 'active', enter: 'fade' });
  }

  // ── Rejilla (tenue) y ejes.
  for (let x = 1; x <= g.xMax; x++) {
    paths.push({ id: `gx-${x}`, d: `M${r1(g.px(x))},${plotT}V${r1(plotB)}`, width: 1, dash: '1 5', color: 'var(--rule)', opacity: 0.8 });
    annotations.push({
      id: `tx-${x}`,
      text: input.xLabels?.[x - 1] ?? String(x),
      x: r1(g.px(x)),
      y: r1(plotB + 17),
      anchor: 'middle',
      size: 11,
    });
  }
  for (let t = 1; t <= g.tMax; t++) {
    paths.push({ id: `gt-${t}`, d: `M${plotL},${r1(g.py(t))}H${r1(plotR)}`, width: 1, dash: '1 5', color: 'var(--rule)', opacity: 0.8 });
    const actual = t === row;
    annotations.push({
      id: `tt-${t}`,
      text: String(t),
      x: plotL - 10,
      y: r1(g.py(t) + 4),
      anchor: 'end',
      size: 11,
      state: actual ? 'active' : undefined,
      weight: actual ? 600 : undefined,
    });
  }
  paths.push({ id: 'axis-x', d: `M${plotL},${r1(plotB)}H${r1(plotR)}`, width: 1.25, color: 'var(--muted)', arrow: true });
  paths.push({ id: 'axis-t', d: `M${plotL},${r1(plotB)}V${plotT - 8}`, width: 1.25, color: 'var(--muted)', arrow: true });
  annotations.push({ id: 'lbl-x', text: 'llave', x: r1(plotR), y: r1(plotB + 31), anchor: 'end', size: 10, state: 'muted' });
  annotations.push({ id: 'lbl-t', text: 'tiempo', x: plotL + 8, y: plotT - 6, anchor: 'start', size: 10, state: 'muted' });

  // ── Rectángulos (debajo de los puntos): el contorno se TRAZA al aparecer y el
  // relleno llega después, para que se lea "este par define este rectángulo".
  (input.rects ?? []).forEach((r, k) => {
    const [x1, t1] = resolve(r.a, byId, `rect ${r.id}`);
    const [x2, t2] = resolve(r.b, byId, `rect ${r.id}`);
    const xa = r1(g.px(Math.min(x1, x2))), xb = r1(g.px(Math.max(x1, x2)));
    const ya = r1(g.py(Math.max(t1, t2))), yb = r1(g.py(Math.min(t1, t2)));
    const state = stateOf(r.id, r.state);
    const d = `M${xa},${ya}H${xb}V${yb}H${xa}Z`;
    const delay = 120 + k * 140;
    if (r.fill) paths.push({ id: `${r.id}-fill`, d, fill: true, opacity: 0.12, state, enter: 'fade', delay: delay + 280 });
    paths.push({ id: r.id, d, width: state ? 2 : 1.6, dash: r.dash ? '5 4' : undefined, state, enter: 'draw', delay });
    if (r.label) {
      annotations.push({ id: `${r.id}-lbl`, text: r.label, x: xb - 4, y: ya + 14, anchor: 'end', size: 11, weight: 600, bg: 'var(--paper)' });
    }
  });

  // ── Segmentos: se trazan de origen a destino.
  (input.segments ?? []).forEach((s, k) => {
    const [x1, t1] = resolve(s.from, byId, `segmento ${s.id}`);
    const [x2, t2] = resolve(s.to, byId, `segmento ${s.id}`);
    const state = stateOf(s.id, s.state);
    paths.push({
      id: s.id,
      d: `M${r1(g.px(x1))},${r1(g.py(t1))}L${r1(g.px(x2))},${r1(g.py(t2))}`,
      width: state ? 2.5 : 2,
      dash: s.dash ? '5 4' : undefined,
      arrow: s.arrow,
      state,
      enter: 'draw',
      delay: 120 + k * 160,
    });
    if (s.label) {
      annotations.push({
        id: `${s.id}-lbl`,
        text: s.label,
        x: r1((g.px(x1) + g.px(x2)) / 2),
        y: r1((g.py(t1) + g.py(t2)) / 2 - 8),
        anchor: 'middle',
        size: 11,
        weight: 600,
        bg: 'var(--paper)',
      });
    }
  });

  // ── Puntos (encima). Relleno = acceso de la entrada; anillo (con fondo papel,
  // para que la rejilla no lo cruce) = punto agregado. El punto activo lleva un
  // halo: es lo que se está mirando en este paso.
  points.forEach((p, k) => {
    const state = stateOf(p.id, p.state);
    const cx = g.px(p.x), cy = g.py(p.t);
    const delay = Math.min(k, STAGGER_MAX) * STAGGER;
    if (state === 'active') {
      paths.push({ id: `${p.id}-halo`, d: dot(cx, cy, HALO_R), fill: true, opacity: 0.18, state, enter: 'grow', delay });
    }
    if (p.kind === 'added') {
      paths.push({ id: `${p.id}-bg`, d: dot(cx, cy, DOT_R), fill: true, opacity: 1, color: 'var(--paper)', enter: 'grow', delay });
      paths.push({ id: p.id, d: dot(cx, cy, DOT_R), width: 2.2, state, enter: 'grow', delay });
    } else {
      paths.push({ id: p.id, d: dot(cx, cy, DOT_R), fill: true, opacity: 1, state, enter: 'grow', delay });
    }
    if (p.label) {
      const labelWidth = p.label.length * charW(11);
      const left = cx + DOT_R + 5 + labelWidth > W - PAD_R;
      annotations.push({ id: `${p.id}-lbl`, text: p.label, x: r1(cx + (left ? -DOT_R - 5 : DOT_R + 5)), y: r1(cy - DOT_R - 3), anchor: left ? 'end' : 'start', size: 11, weight: 600, bg: 'var(--paper)' });
    }
  });

  const total = pointCount(input);
  const requested = new Set(points.filter((p) => p.kind !== 'added').map((p) => `${p.x},${p.t}`)).size;
  annotations.push({
    id: 'point-count', text: `Entrada: ${requested} · Extra: ${total - requested} · Total: ${total}`,
    x: PAD_L, y: plotB + 54, anchor: 'start', size: 11,
    color: 'var(--ink)',
  });

  const height = opts.height ?? plotB + PAD_B;
  return { nodes: [], edges: [], groups: [], annotations, paths, height, width: W };
}

/** Cuenta los puntos distintos del paso (el "costo" de la ejecución). */
export function pointCount(input: GeometricInput): number {
  return new Set((input.points ?? []).map((p) => `${p.x},${p.t}`)).size;
}

export { charW };
