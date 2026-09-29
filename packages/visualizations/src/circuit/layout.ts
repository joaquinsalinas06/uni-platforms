// Layout puro de `circuit`: netlist en celdas de rejilla → escena en px
// (cables ortogonales con hueco para el símbolo, glifos, rótulos sin solapes,
// flechas de corriente, marcas ±, flechas de malla, recorrido KVL, halos,
// veredictos de diodos) + panel de ecuaciones. Sin React ni DOM: lo prueban
// los tests con node --test y lo consume CircuitVisualization.tsx.
import type {
  CanvasPath,
  CanvasPanel,
  CanvasScene,
  CanvasStep,
  NodeState,
  PanelRow,
  SceneDot,
  SceneHalo,
  SceneSymbol,
  SceneText,
  SceneWalker,
  SceneWire,
} from '../canvas-types.ts';
import { arrowHead, glyph, measure } from './symbols.ts';
import { formatSI, formatSITex, isDiode, resolveMergedValues, solveCircuit, vfOf, type CPart, type Circuit, type Solution } from './solve.ts';
import { kvlTerms, loopCrossings, meshSystem, orientedPath, texLabel } from './kvl.ts';

/** px por celda. 4 celdas (80 px) = un símbolo (≤ 36 px) + sus cables + un rótulo al lado. */
export const CELL = 20;

type Tone = string;
type Pt = [number, number];
export type Box = [number, number, number, number];

type Group = { parts: string[]; tone: Tone; label?: string };
type Loop = { id: string; path: string[]; dir?: 'cw' | 'ccw'; label: string; tone: Tone };
export type CircuitSpec = Circuit & {
  nodes: (Circuit['nodes'][number] & { dot?: boolean; showPotential?: boolean; state?: NodeState })[];
  parts: (CPart & { via?: Pt[]; tone?: Tone; state?: NodeState })[];
  groups?: Group[];
  loops?: Loop[];
  kvl?: { loop: string; upto?: number };
  showSystem?: boolean;
  currents?: { part: string; label: string; dir?: 'forward' | 'reverse'; showValue?: boolean }[];
  voltages?: { part: string; label: string; plus?: 'from' | 'to'; showValue?: boolean }[];
  diodes?: { part: string; assume: 'on' | 'off'; showModel?: boolean }[];
  hypothesis?: string;
  req?: { between: [string, string] };
  equations?: { tex: string; part?: string; state?: NodeState }[];
  variant?: 'schematic' | 'breadboard' | 'wiring';
};
type StepIn = { note: string; circuit?: CircuitSpec; [k: string]: unknown };

// ─────────────────────────── geometría ───────────────────────────

const R2D = 180 / Math.PI;
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const fmt = (n: number) => +n.toFixed(2);
const pathOf = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${fmt(p[0])},${fmt(p[1])}`).join(' ');

export function overlap(a: Box, b: Box): number {
  const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);
  const h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
  return w > 0 && h > 0 ? w * h : 0;
}
/** Longitud del segmento que cae dentro de la caja (Liang–Barsky). */
export function segInBox(a: Pt, b: Pt, box: Box): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  let t0 = 0, t1 = 1;
  const clip = (p: number, q: number) => {
    if (p === 0) return q >= 0;
    const r = q / p;
    if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
    else { if (r < t0) return false; if (r < t1) t1 = r; }
    return true;
  };
  if (clip(-dx, a[0] - box[0]) && clip(dx, box[2] - a[0]) && clip(-dy, a[1] - box[1]) && clip(dy, box[3] - a[1]) && t1 > t0)
    return (t1 - t0) * Math.hypot(dx, dy);
  return 0;
}
function segDist(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
function boxDist(p: Pt, b: Box): number {
  const dx = Math.max(b[0] - p[0], 0, p[0] - b[2]);
  const dy = Math.max(b[1] - p[1], 0, p[1] - b[3]);
  return Math.hypot(dx, dy);
}
function inPoly(p: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const boxOfPts = (pts: Pt[], pad = 0): Box => [
  Math.min(...pts.map((p) => p[0])) - pad,
  Math.min(...pts.map((p) => p[1])) - pad,
  Math.max(...pts.map((p) => p[0])) + pad,
  Math.max(...pts.map((p) => p[1])) + pad,
];
const union = (a: Box | null, b: Box): Box => (a ? [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])] : b);
/** Punto a distancia `d` a lo largo de una polilínea (+ ángulo del tramo). */
function along(pts: Pt[], d: number): { p: Pt; angle: number } {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const L = dist(pts[i - 1], pts[i]);
    if (acc + L >= d - 1e-9 && L > 0) {
      const t = (d - acc) / L;
      return {
        p: [pts[i - 1][0] + t * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1])],
        angle: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]),
      };
    }
    acc += L;
  }
  const n = pts.length;
  return { p: pts[n - 1], angle: Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]) };
}
const polyLen = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + dist(pts[i], p), 0);

/** Offset de un polígono simple hacia adentro `d` px (inglete). */
function inset(poly: Pt[], d: number): Pt[] {
  let area = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const s = area > 0 ? 1 : -1; // y hacia abajo: area>0 = horario en pantalla
  const n = poly.length;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = poly[(i - 1 + n) % n], p1 = poly[i], p2 = poly[(i + 1) % n];
    const e1 = norm([p1[0] - p0[0], p1[1] - p0[1]]), e2 = norm([p2[0] - p1[0], p2[1] - p1[1]]);
    // normal hacia adentro (horario en pantalla → derecha del recorrido)
    const n1: Pt = [-e1[1] * s, e1[0] * s], n2: Pt = [-e2[1] * s, e2[0] * s];
    const bis = norm([n1[0] + n2[0], n1[1] + n2[1]]);
    const cos = bis[0] * n1[0] + bis[1] * n1[1] || 1;
    out.push([p1[0] + (bis[0] * d) / cos, p1[1] + (bis[1] * d) / cos]);
  }
  return out;
}
function norm(v: Pt): Pt {
  const L = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / L, v[1] / L];
}
/** Quita vértices colineales y repetidos de un polígono cerrado. */
function simplify(poly: Pt[]): Pt[] {
  let pts = poly.filter((p, i) => dist(p, poly[(i + 1) % poly.length]) > 0.5);
  let changed = true;
  while (changed && pts.length > 3) {
    changed = false;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i - 1 + pts.length) % pts.length], b = pts[i], c = pts[(i + 1) % pts.length];
      if (Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) < 0.5) {
        pts = pts.filter((_, j) => j !== i);
        changed = true;
        break;
      }
    }
  }
  return pts;
}

// ─────────────────────────── obstáculos y rótulos ───────────────────────────

type Item = { text: string; x: number; y: number; anchor: 'start' | 'middle' | 'end'; size: number; weight?: number; mono?: boolean; color?: SceneText['color']; tone?: Tone; state?: NodeState; chip?: boolean };
const LINE = 1.22;
export function textBox(t: { text: string; x: number; y: number; anchor?: string; size?: number; mono?: boolean; chip?: boolean }): Box {
  const size = t.size ?? 12;
  const w = measure(t.text, size, t.mono) + (t.chip ? 12 : 0);
  const h = size * LINE + (t.chip ? 6 : 0);
  const x0 = t.anchor === 'middle' ? t.x - w / 2 : t.anchor === 'end' ? t.x - w : t.x - (t.chip ? 6 : 0);
  return [x0, t.y - h / 2, x0 + w, t.y + h / 2];
}

type Obstacle = { box: Box; w: number };
type Cand = { items: Item[]; boxes: Box[]; marks?: CanvasPath[]; extra?: number };
class Field {
  boxes: Obstacle[] = [];
  segs: [Pt, Pt][] = [];
  /** Trazos blandos (contorno de halos): cruzarlos cuesta poco. */
  soft: [Pt, Pt][] = [];
  add(box: Box, w: number) { this.boxes.push({ box, w }); }
  cost(boxes: Box[], segW = 4): number {
    let c = 0;
    for (const b of boxes) {
      for (const o of this.boxes) c += overlap(b, o.box) * o.w;
      // Un cable que tacha un texto es peor de lo que su largo sugiere: cuota
      // fija por cruce (si no, tachar un rótulo sale más barato que moverlo).
      for (const [p, q] of this.segs) {
        const l = segInBox(p, q, b);
        if (l > 0.5) c += 150 + l * segW * 4;
      }
      for (const [p, q] of this.soft) c += segInBox(p, q, b) * 1.5;
    }
    return c;
  }
}
// ─────────────────────────── texto de piezas ───────────────────────────

const UNIT: Record<string, string> = { resistor: 'Ω', pot: 'Ω', vsource: 'V', 'ac-source': 'V', isource: 'A', capacitor: 'F', lamp: 'Ω', motor: 'Ω', relay: 'Ω', galvanometer: 'Ω' };
function valueText(p: CPart, modelOn: boolean, sol?: Solution, hasHyp?: boolean): string | undefined {
  if (isDiode(p)) {
    const base = p.kind === 'led' ? 'LED' : p.model === 'ge' ? 'Ge' : 'Si';
    if (modelOn) return `${base} · ${formatSI(vfOf(p), 'V')}`;
    if (p.vf != null) return `${base} · ${formatSI(p.vf, 'V')}`;
    if (!hasHyp && sol?.ok && sol.diodes[p.id]) return `${base} · ${sol.diodes[p.id].actual === 'on' ? 'ON' : 'OFF'}`;
    return base;
  }
  if (p.kind === 'switch' || p.kind === 'button' || p.kind === 'wire' || p.kind === 'open') return undefined;
  if (p.value == null) return undefined;
  const u = UNIT[p.kind];
  return u ? formatSI(p.value, u) : undefined;
}

const MERGE_TONE: Record<string, Tone> = { series: 'series', parallel: 'parallel', 'delta-wye': 'bridge', 'wye-delta': 'bridge' };

// ─────────────────────────── ruteo ortogonal ───────────────────────────
// Ningún cable va en diagonal: dos nodos no alineados se unen con una L, una Z
// o una U por fuera. Dos piezas entre el mismo par de nodos (paralelo, o un
// cable que las cortocircuita) nunca comparten tramo: la que llega después sale
// por un riel desplazado (U). Cada ruta candidata paga por pisar cables,
// cruzarlos, tocar nodos o esquinas ajenas y tapar símbolos; gana la más barata.
// Voraz en orden estable (lo que ya estaba en el paso anterior primero, y con
// premio por repetir su ruta): la misma pieza queda en el mismo riel de paso a
// paso, y una pieza fundida busca el lugar donde estaban sus fuentes.

type Seg = [Pt, Pt];
export type PrevGeom = { route: Pt[]; center?: Pt };
const EP = 0.5;
const eq = (p: Pt, q: Pt) => Math.abs(p[0] - q[0]) < EP && Math.abs(p[1] - q[1]) < EP;
const isH = (s: Seg) => Math.abs(s[0][1] - s[1][1]) < EP;
const segsOf = (r: Pt[]): Seg[] => r.slice(1).map((q, i) => [r[i], q]);
/** Índice del tramo más largo (el primero si empatan). */
function longestSeg(r: Pt[]): number {
  let k = 0;
  for (let i = 1; i < r.length - 1; i++) if (dist(r[i], r[i + 1]) > dist(r[k], r[k + 1]) + 1e-6) k = i;
  return k;
}
/** Largo del solape colineal de dos tramos ortogonales (0 si no se pisan). */
function collinear(s: Seg, t: Seg): number {
  if (isH(s) !== isH(t)) return 0;
  const ax = isH(s) ? 1 : 0, al = 1 - ax;
  if (Math.abs(s[0][ax] - t[0][ax]) >= EP) return 0;
  const lo = Math.max(Math.min(s[0][al], s[1][al]), Math.min(t[0][al], t[1][al]));
  const hi = Math.min(Math.max(s[0][al], s[1][al]), Math.max(t[0][al], t[1][al]));
  return Math.max(0, hi - lo);
}
/** Tramo donde va el símbolo: el más largo que no comparte con otro cable (un
 * tramo común es riel, no pieza) y en el que cabe el cuerpo; si no hay, el más largo. */
export function symbolSeg(r: Pt[], others: Seg[], hl: number): number {
  const segs = segsOf(r);
  let best = -1;
  segs.forEach((s, i) => {
    if (dist(s[0], s[1]) < 2 * hl + 4 || others.some((t) => collinear(s, t) > 1)) return;
    if (best < 0 || dist(s[0], s[1]) > dist(segs[best][0], segs[best][1]) + 1e-6) best = i;
  });
  return best < 0 ? longestSeg(r) : best;
}
/** Sin puntos repetidos ni vértices que siguen derecho. */
function clean(r: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const q of r) if (!out.length || !eq(out[out.length - 1], q)) out.push(q);
  for (let i = out.length - 2; i >= 1; i--) {
    const a = out[i - 1], b = out[i], c = out[i + 1];
    const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const dot = (b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1]);
    if (Math.abs(cross) < 1e-6 && dot > 0) out.splice(i, 1);
  }
  return out;
}
/** Costo de que el tramo `s` (nuestro) conviva con `t` (ya dibujado). `mine` =
 * posiciones de nuestros dos nodos: tocar a otro ahí es una unión legítima. */
function pairCost(s: Seg, t: Seg, mine: Pt[], bare = false): number {
  const ours = (p: Pt) => mine.some((m) => eq(m, p));
  const sh = isH(s), th = isH(t);
  if (sh === th) {
    const ax = sh ? 1 : 0, al = sh ? 0 : 1;
    const gap = Math.abs(s[0][ax] - t[0][ax]);
    const lo = Math.max(Math.min(s[0][al], s[1][al]), Math.min(t[0][al], t[1][al]));
    const hi = Math.min(Math.max(s[0][al], s[1][al]), Math.max(t[0][al], t[1][al]));
    const ov = hi - lo;
    if (gap < EP) {
      if (ov > 1) {
        // Tramo común desde un nodo compartido: es el mismo nodo, se dibuja
        // como un cable que se bifurca (con punto de unión). Si no parten del
        // mismo nodo, es un corto falso entre dos ramas.
        const shared = mine.some((m) => (eq(m, s[0]) || eq(m, s[1])) && (eq(m, t[0]) || eq(m, t[1])));
        return shared ? (bare ? 2 : 10 + ov * 0.1) : 3000 + ov * 5;
      }
      if (ov > -EP) {
        const p: Pt = sh ? [lo, s[0][1]] : [s[0][0], lo];
        return ours(p) ? 0 : 2000;
      }
      return 0;
    }
    return gap < 14 && ov > 4 ? 40 : 0;
  }
  const h = sh ? s : t, v = sh ? t : s;
  const I: Pt = [v[0][0], h[0][1]];
  if (I[0] < Math.min(h[0][0], h[1][0]) - EP || I[0] > Math.max(h[0][0], h[1][0]) + EP) return 0;
  if (I[1] < Math.min(v[0][1], v[1][1]) - EP || I[1] > Math.max(v[0][1], v[1][1]) + EP) return 0;
  const endS = eq(I, s[0]) || eq(I, s[1]), endT = eq(I, t[0]) || eq(I, t[1]);
  if (!endS && !endT) return 80; // cruce limpio: se tolera, pero se evita
  if (ours(I)) return 0; // nuestro nodo sobre su cable, o una bifurcación de un tramo común
  return 2000; // una esquina o un nodo cae en medio de otro cable (unión falsa)
}
function candidates(a: Pt, b: Pt, bare: boolean): Pt[][] {
  if (dist(a, b) < EP) return [[a, [a[0] + 1e-3, a[1]]]];
  const out: Pt[][] = [];
  // Rieles a ≥ 3 celdas si llevan símbolo: entre dos rieles cabe su rótulo
  // de dos líneas sin que se lea como de la pieza vecina. Un cable, a 2.
  const O = (bare ? [2, 3, 4, 5] : [3, 4, 5, 6]).map((k) => k * CELL);
  if (Math.abs(a[0] - b[0]) < EP || Math.abs(a[1] - b[1]) < EP) {
    out.push([a, b]);
    const u = norm([b[0] - a[0], b[1] - a[1]]);
    for (const o of O)
      for (const sg of [-1, 1]) {
        const n: Pt = [-u[1] * o * sg, u[0] * o * sg];
        out.push([a, [a[0] + n[0], a[1] + n[1]], [b[0] + n[0], b[1] + n[1]], b]);
      }
  } else {
    out.push([a, [b[0], a[1]], b], [a, [a[0], b[1]], b]);
    const half = CELL / 2;
    const mx = Math.round((a[0] + b[0]) / 2 / half) * half, my = Math.round((a[1] + b[1]) / 2 / half) * half;
    out.push([a, [mx, a[1]], [mx, b[1]], b], [a, [a[0], my], [b[0], my], b]);
    // L desplazadas: copias anidadas de cada L, por fuera (o > 0) o por dentro
    // (o < 0) del rectángulo que forman las dos L. Tres ramas entre dos nodos
    // no alineados se leen como tres caminos paralelos.
    const sx = Math.sign(b[0] - a[0]), sy = Math.sign(b[1] - a[1]);
    for (const o of [...O, ...O.map((x) => -x)]) {
      if (o < 0 && (-o >= Math.abs(b[0] - a[0]) || -o >= Math.abs(b[1] - a[1]))) continue;
      // L1 (horizontal primero): esquina (bx, ay), hacia afuera = (+sx, -sy)
      out.push([a, [a[0], a[1] - sy * o], [b[0] + sx * o, a[1] - sy * o], [b[0] + sx * o, b[1]], b]);
      // L2 (vertical primero): esquina (ax, by), hacia afuera = (-sx, +sy)
      out.push([a, [a[0] - sx * o, a[1]], [a[0] - sx * o, b[1] + sy * o], [b[0], b[1] + sy * o], b]);
    }
    for (const o of O) {
      const y0 = Math.min(a[1], b[1]) - o, y1 = Math.max(a[1], b[1]) + o;
      const x0 = Math.min(a[0], b[0]) - o, x1 = Math.max(a[0], b[0]) + o;
      out.push([a, [a[0], y0], [b[0], y0], b], [a, [a[0], y1], [b[0], y1], b], [a, [x0, a[1]], [x0, b[1]], b], [a, [x1, a[1]], [x1, b[1]], b]);
    }
  }
  return out.map(clean);
}
const symBox = (r: Pt[], hl: number, hw: number): Box | undefined => {
  if (!(hl > 0)) return undefined;
  const k = longestSeg(r);
  const [a, b] = [r[k], r[k + 1]];
  const c: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return isH([a, b]) ? [c[0] - hl - 2, c[1] - hw - 2, c[0] + hl + 2, c[1] + hw + 2] : [c[0] - hw - 2, c[1] - hl - 2, c[0] + hw + 2, c[1] + hl + 2];
};

/** Rutas ortogonales de todas las piezas (ver arriba). */
export function routeParts(
  c: CircuitSpec,
  P: (id: string) => Pt,
  size: (id: string) => { hl: number; hw: number },
  prev?: Map<string, PrevGeom>,
): Map<string, Pt[]> {
  const placed: { s: Seg; owner: string }[] = [];
  const syms: { box: Box; route: Pt[]; seg: number; hl: number; owner: string }[] = [];
  // Redes de cables ideales: un cable puede pasar por un nodo de su MISMA red.
  const net = new Map(c.nodes.map((n) => [n.id, n.id]));
  const root = (id: string): string => (net.get(id) === id || !net.has(id) ? id : root(net.get(id)!));
  for (const p of c.parts) if (p.kind === 'wire') net.set(root(p.from), root(p.to));
  const out = new Map<string, Pt[]>();
  // Un nodo sin piezas en este paso (quedó de un paso anterior) no estorba.
  const used = new Set(c.parts.flatMap((p) => [p.from, p.to]));
  const nodePts = c.nodes.filter((n) => used.has(n.id)).map((n) => ({ id: n.id, at: P(n.id) }));
  const sameRoute = (r: Pt[], q?: Pt[]) => !!q && q.length === r.length && q.every((x, i) => eq(x, r[i]));
  const cost = (p: CircuitSpec['parts'][number], r: Pt[], fit: boolean): number => {
    const { hl, hw } = size(p.id);
    const ends = [P(p.from), P(p.to)];
    const segs = segsOf(r);
    // Donde un tramo común (que sale de nuestro nodo sobre otro cable) se
    // separa hay una bifurcación legítima: tocar ahí no es una unión falsa.
    const mine = [...ends];
    for (const sg of [segs[0], segs[segs.length - 1]]) {
      const [n, far] = ends.some((e) => eq(e, sg[0])) ? [sg[0], sg[1]] : [sg[1], sg[0]];
      if (placed.some((t) => (eq(t.s[0], n) || eq(t.s[1], n)) && isH(t.s) === isH(sg) && segDist(far, t.s[0], t.s[1]) < EP)) mine.push(far);
    }
    let k = 0.05 * polyLen(r) + 4 * (r.length - 2);
    if (fit && hl > 0) {
      const i = longestSeg(r);
      if (dist(r[i], r[i + 1]) < 2 * hl + 4) k += 5000;
    }
    const bare = !(hl > 0);
    // Donde otro cable se sube a nuestro tramo (solape colineal) nace una unión.
    for (const s of segs) for (const t of placed) if (collinear(s, t.s) > 1) for (const q of t.s) if (segDist(q, s[0], s[1]) < EP) mine.push(q);
    for (const s of segs) {
      for (const t of placed) k += pairCost(s, t.s, mine, bare);
      for (const y of syms) {
        if (segInBox(s[0], s[1], y.box) <= 0.5) continue;
        // Un cable que corre sobre el tramo de un símbolo lo empuja a otro
        // tramo libre de su pieza (ver symbolSeg), si lo tiene: no estorba.
        const ss = segsOf(y.route);
        const moves = bare && collinear(s, ss[y.seg]) > 1 && ss.some((q, i) => i !== y.seg && dist(q[0], q[1]) >= 2 * y.hl + 4 && collinear(q, s) <= 1 && !placed.some((t) => t.owner !== y.owner && collinear(q, t.s) > 1));
        if (!moves) k += 800;
      }
    }
    for (const n of nodePts) {
      if (n.id === p.from || n.id === p.to) continue;
      if (bare && root(n.id) === root(p.from)) continue;
      if (segs.some(([a, b]) => segDist(n.at, a, b) < 4)) k += 2000;
    }
    const sb = fit ? symBox(r, hl, hw) : undefined;
    if (sb) {
      for (const t of placed) if (segInBox(t.s[0], t.s[1], sb) > 0.5) k += 400;
      for (const y of syms) if (overlap(sb, y.box) > 0) k += 800;
    }
    if (prev && fit) {
      if (sameRoute(r, prev.get(p.id)?.route)) k -= 40;
      const src = (p.mergedFrom ?? []).map((id) => prev.get(id)?.center).filter((q): q is Pt => !!q);
      if (src.length) {
        const i = longestSeg(r);
        const m: Pt = [(r[i][0] + r[i + 1][0]) / 2, (r[i][1] + r[i + 1][1]) / 2];
        const g: Pt = [src.reduce((s, q) => s + q[0], 0) / src.length, src.reduce((s, q) => s + q[1], 0) / src.length];
        k += 0.02 * dist(m, g); // sólo desempata (p.ej. qué L): no saca a una pieza de su ruta directa
      }
    }
    return k;
  };
  const aligned = (p: CircuitSpec['parts'][number]) => {
    const a = P(p.from), b = P(p.to);
    return Math.abs(a[0] - b[0]) < EP || Math.abs(a[1] - b[1]) < EP;
  };
  const key = (p: CircuitSpec['parts'][number]) => (p.via?.length ? 0 : 8) + (prev?.has(p.id) ? 0 : 4) + (aligned(p) ? 0 : 2) + (p.kind === 'wire' ? 1 : 0);
  const order = c.parts.map((p, i) => ({ p, i, k: key(p) })).sort((x, y) => x.k - y.k || x.i - y.i);
  for (const { p } of order) {
    const a = P(p.from), b = P(p.to);
    let r: Pt[];
    if (p.via?.length) {
      // `via` explícito se respeta; un tramo suyo en diagonal se dobla en L.
      const pts: Pt[] = [...p.via.map(([x, y]) => [x * CELL, y * CELL] as Pt), b];
      r = [a];
      for (const q of pts) {
        const s = r[r.length - 1];
        if (Math.abs(s[0] - q[0]) < EP || Math.abs(s[1] - q[1]) < EP) { r.push(q); continue; }
        const A: Pt[] = [...r, [q[0], s[1]], q], B: Pt[] = [...r, [s[0], q[1]], q];
        r = cost(p, A, false) <= cost(p, B, false) ? A : B;
      }
      r = clean(r);
      if (r.length < 2) r.push([r[0][0] + 1e-3, r[0][1]]);
    } else {
      let bc = Infinity;
      r = [a, b];
      for (const cd of candidates(a, b, !(size(p.id).hl > 0))) {
        const cc = cost(p, cd, true);
        if (cc < bc - 1e-9) (bc = cc), (r = cd);
      }
    }
    out.set(p.id, r);
    for (const s of segsOf(r)) placed.push({ s, owner: p.id });
    const { hl, hw } = size(p.id);
    const sb = p.kind === 'wire' ? undefined : symBox(r, hl, hw);
    if (sb) syms.push({ box: sb, route: r, seg: longestSeg(r), hl, owner: p.id });
  }
  return out;
}

// ─────────────────────────── layout de un paso ───────────────────────────

export type PartGeom = { id: string; route: Pt[]; center?: Pt; angle: number; hl: number; hw: number; diagonal: boolean; symbolBoxes: Box[]; /** tramo del símbolo */ seg: number };
export type StepLayout = {
  scene: CanvasScene;
  panel: CanvasPanel;
  bbox: Box;
  /** Para los tests: geometría resuelta y cajas de rótulos. */
  debug: { parts: PartGeom[]; labels: { id: string; box: Box }[]; nodes: Record<string, Pt> };
};
export type LayoutCtx = {
  sol: Solution;
  /** Piezas vistas en pasos anteriores (para rotular fusiones). */
  known?: Map<string, CPart>;
  /** Grupos del paso anterior (tono del brillo al fundir). */
  prevGroups?: Group[];
  /** Rutas y centros de los pasos anteriores (misma pieza → mismo riel). */
  prev?: Map<string, PrevGeom>;
};

/** Cajas de muestreo a lo largo del eje del símbolo (sirven también rotado). */
function symbolBoxes(c: Pt, ang: number, hl: number, hw: number): Box[] {
  const u: Pt = [Math.cos(ang), Math.sin(ang)];
  if (Math.abs(u[0]) > 0.999 || Math.abs(u[1]) > 0.999) {
    const ex = Math.abs(u[0]) * hl + Math.abs(u[1]) * hw, ey = Math.abs(u[1]) * hl + Math.abs(u[0]) * hw;
    return [[c[0] - ex, c[1] - ey, c[0] + ex, c[1] + ey]];
  }
  const out: Box[] = [];
  const n = Math.max(2, Math.ceil((2 * hl) / hw));
  for (let i = 0; i <= n; i++) {
    const t = -hl + (2 * hl * i) / n;
    const x = c[0] + u[0] * t, y = c[1] + u[1] * t;
    out.push([x - hw * 0.8, y - hw * 0.8, x + hw * 0.8, y + hw * 0.8]);
  }
  return out;
}

export function layoutCircuit(c: CircuitSpec, ctx: LayoutCtx): StepLayout {
  const { sol } = ctx;
  const nodes = new Map(c.nodes.map((n) => [n.id, n]));
  const P = (id: string): Pt => {
    const n = nodes.get(id);
    return n ? [n.x * CELL, n.y * CELL] : [0, 0];
  };
  const field = new Field();
  const wires: SceneWire[] = [];
  const symbols: SceneSymbol[] = [];
  const texts: SceneText[] = [];
  const marks: CanvasPath[] = [];
  const dots: SceneDot[] = [];
  const halos: SceneHalo[] = [];
  const labels: { id: string; box: Box }[] = [];
  let bbox: Box | null = null;
  const grow = (b: Box) => (bbox = union(bbox, b));

  const hyp = new Map((c.diodes ?? []).map((d) => [d.part, d]));
  const loops = c.loops ?? [];
  const kvl = c.kvl && loops.find((l) => l.id === c.kvl!.loop) ? c.kvl : undefined;

  // ── recorrido KVL: qué piezas ya se recorrieron ──
  const walkTone = new Map<string, Tone>();
  const walkNow = new Set<string>();
  let crossings: ReturnType<typeof loopCrossings> = [];
  if (kvl) {
    const loop = loops.find((l) => l.id === kvl.loop)!;
    crossings = loopCrossings(c, loop.id);
    const upto = kvl.upto ?? loop.path.length;
    for (const x of crossings) {
      if (x.seg >= upto) continue;
      walkTone.set(x.part.id, loop.tone);
      if (x.seg === upto - 1 && kvl.upto != null) walkNow.add(x.part.id);
    }
  }

  // ── piezas: ruta, símbolo, cable con hueco ──
  const geoms = new Map<string, PartGeom>();
  const degree = new Map<string, number>();
  const dirsAt = new Map<string, Pt[]>();
  const look = new Map(
    c.parts.map((p) => {
      const modelOn = isDiode(p) && hyp.get(p.id)?.assume === 'on' && hyp.get(p.id)?.showModel !== false;
      const modelOff = isDiode(p) && hyp.get(p.id)?.assume === 'off' && hyp.get(p.id)?.showModel !== false;
      const kind = p.kind === 'wire' ? null : modelOn ? 'vdrop' : p.kind;
      const variant = modelOff ? 'off' : (p.kind === 'switch' || p.kind === 'button') && p.value === 0 ? 'open' : undefined;
      return [p.id, { kind, variant, g: kind ? glyph(kind, variant) : { hl: 0, hw: 0 } }] as const;
    }),
  );
  const routes = routeParts(c, P, (id) => look.get(id)!.g, ctx.prev);
  const segsBy = new Map([...routes].map(([id, r]) => [id, segsOf(r)]));
  for (const p of c.parts) {
    const route = routes.get(p.id)!;
    degree.set(p.from, (degree.get(p.from) ?? 0) + 1);
    degree.set(p.to, (degree.get(p.to) ?? 0) + 1);
    const d0 = norm([route[1][0] - route[0][0], route[1][1] - route[0][1]]);
    const n = route.length;
    const d1 = norm([route[n - 2][0] - route[n - 1][0], route[n - 2][1] - route[n - 1][1]]);
    dirsAt.set(p.from, [...(dirsAt.get(p.from) ?? []), d0]);
    dirsAt.set(p.to, [...(dirsAt.get(p.to) ?? []), d1]);

    const { kind, variant, g } = look.get(p.id)!;
    const k = symbolSeg(route, [...segsBy].flatMap(([id, ss]) => (id === p.id ? [] : ss)), g.hl);
    const a = route[k], b = route[k + 1];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const diagonal = Math.abs(Math.sin(2 * ang)) > 1e-6;
    const center: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const tone = p.state ? undefined : walkTone.get(p.id) ?? p.tone ?? (isDiode(p) && p.kind === 'diode' ? (p.model === 'ge' ? 'ge' : 'si') : undefined);
    const state: NodeState | undefined = walkNow.has(p.id) ? 'active' : p.state;
    const gm: PartGeom = { id: p.id, route, angle: ang, hl: g.hl, hw: g.hw, diagonal, symbolBoxes: [], seg: k };
    if (kind) {
      gm.center = center;
      gm.symbolBoxes = symbolBoxes(center, ang, g.hl + 1, g.hw + 1);
      for (const bx of gm.symbolBoxes) field.add(bx, 40), grow(bx);
      const mergeTone = p.mergedFrom
        ? ctx.prevGroups?.find((gr) => gr.parts.some((id) => p.mergedFrom!.includes(id)))?.tone ?? MERGE_TONE[p.mergeKind ?? 'series']
        : undefined;
      symbols.push({
        id: `${p.id}:${kind}:${variant ?? ''}`,
        part: p.id,
        kind,
        x: fmt(center[0]),
        y: fmt(center[1]),
        angle: fmt(ang * R2D),
        variant,
        state,
        tone,
        mergedFrom: p.mergedFrom,
        mergeTone,
      });
      // cable: ruta hasta el cuerpo, hueco, resto
      const u: Pt = [Math.cos(ang), Math.sin(ang)];
      const s0: Pt = [center[0] - u[0] * g.hl, center[1] - u[1] * g.hl];
      const s1: Pt = [center[0] + u[0] * g.hl, center[1] + u[1] * g.hl];
      const first = [...route.slice(0, k + 1), s0];
      const second = [s1, ...route.slice(k + 1)];
      wires.push({ id: p.id, d: `${pathOf(first)} ${pathOf(second)}`, state: state === 'muted' ? 'muted' : undefined, tone: walkTone.get(p.id) && !p.state ? undefined : undefined });
      for (let i = 1; i < first.length; i++) field.segs.push([first[i - 1], first[i]]);
      for (let i = 1; i < second.length; i++) field.segs.push([second[i - 1], second[i]]);
    } else {
      wires.push({ id: p.id, d: pathOf(route), state: p.state === 'muted' ? 'muted' : p.state === 'active' ? 'active' : undefined });
      for (let i = 1; i < route.length; i++) field.segs.push([route[i - 1], route[i]]);
    }
    for (const q of route) grow([q[0], q[1], q[0], q[1]]);
    geoms.set(p.id, gm);
  }

  // ── bifurcaciones fuera de un nodo (tramo común): punto de unión ──
  {
    const seen = new Set<string>();
    for (const [id, r] of routes)
      for (const q of r.slice(1, -1)) {
        const k = `${fmt(q[0])},${fmt(q[1])}`;
        if (seen.has(k)) continue;
        if (![...routes].some(([o, r2]) => o !== id && segsOf(r2).some(([a, b]) => segDist(q, a, b) < EP))) continue;
        seen.add(k);
        dots.push({ id: `dot:j:${k}`, x: q[0], y: q[1], r: 3 });
      }
  }

  // ── nodos: puntos de unión, terminales abiertos, tierra ──
  for (const n of c.nodes) {
    const at = P(n.id);
    // un cable que pasa POR el nodo también se le une (cuenta como dos ramas)
    const through = c.parts.filter((p) => p.from !== n.id && p.to !== n.id && segsBy.get(p.id)!.some(([a, b]) => segDist(at, a, b) < EP)).length;
    const deg = (degree.get(n.id) ?? 0) + 2 * through;
    grow([at[0], at[1], at[0], at[1]]);
    if (n.ground) {
      const used = dirsAt.get(n.id) ?? [];
      const cand: Pt[] = [[0, 1], [-1, 0], [1, 0], [0, -1]];
      const free = cand.find((d) => !used.some((u) => u[0] * d[0] + u[1] * d[1] > 0.7)) ?? [0, 1];
      const ang = Math.atan2(free[1], free[0]);
      symbols.push({ id: `gnd:${n.id}`, kind: 'ground', x: at[0], y: at[1], angle: fmt(ang * R2D) });
      const tip: Pt = [at[0] + free[0] * 10, at[1] + free[1] * 10];
      const gb = boxOfPts([at, [at[0] + free[0] * 18 - free[1] * 9, at[1] + free[1] * 18 - free[0] * 9], [tip[0] + free[1] * 9, tip[1] + free[0] * 9]]);
      field.add(gb, 12);
      grow(gb);
    }
    if (n.dot === true || (n.dot !== false && deg >= 3)) dots.push({ id: `dot:${n.id}`, x: at[0], y: at[1], r: 3 });
    else if (n.dot !== false && deg === 1 && !n.ground) dots.push({ id: `dot:${n.id}`, x: at[0], y: at[1], r: 3, hollow: true });
    if (deg >= 1) field.add([at[0] - 3, at[1] - 3, at[0] + 3, at[1] + 3], 8);
  }

  // ── halos (grupos): unión de cápsulas, una por símbolo del grupo, más los
  // cables que lo unen a otra pieza del MISMO grupo. Se dibuja como trazo
  // grueso de extremos redondos (CanvasScene): nunca un casco convexo que tape
  // piezas ajenas.
  const groupsIn = c.groups ?? [];
  groupsIn.forEach((gr, gi) => {
    const members = c.parts.filter((p) => gr.parts.includes(p.id) && geoms.has(p.id));
    if (!members.length) return;
    const use = new Map<string, number>();
    for (const p of members) for (const n of [p.from, p.to]) use.set(n, (use.get(n) ?? 0) + 1);
    const pad = Math.max(...members.map((p) => geoms.get(p.id)!.hw), 4) + 8 + (groupsIn.some((o) => o !== gr && o.parts.length < gr.parts.length && o.parts.every((id) => gr.parts.includes(id))) ? 7 : 0);
    const others = c.parts.filter((p) => !gr.parts.includes(p.id)).map((p) => geoms.get(p.id)?.center).filter((q): q is Pt => !!q);
    const segs: Seg[] = [];
    const lead = (pts: Pt[], node: string) => {
      if ((use.get(node) ?? 0) < 2) return;
      for (const s of segsOf(pts)) if (!others.some((o) => segDist(o, s[0], s[1]) < pad + 2)) segs.push(s);
    };
    for (const p of members) {
      const gm = geoms.get(p.id)!;
      if (!gm.center) { lead(gm.route, p.from); continue; }
      const k = gm.seg;
      const u: Pt = [Math.cos(gm.angle), Math.sin(gm.angle)];
      const s0: Pt = [gm.center[0] - u[0] * gm.hl, gm.center[1] - u[1] * gm.hl];
      const s1: Pt = [gm.center[0] + u[0] * gm.hl, gm.center[1] + u[1] * gm.hl];
      segs.push([s0, s1]);
      lead([...gm.route.slice(0, k + 1), s0], p.from);
      lead([s1, ...gm.route.slice(k + 1)], p.to);
    }
    // Paralelo puro (todas entre los mismos dos nodos) o puente: rectángulo
    // redondeado relleno, si en él no cae nada ajeno al grupo.
    const pair = (p: CPart) => [p.from, p.to].sort().join('|');
    const rb = boxOfPts(members.flatMap((p) => geoms.get(p.id)!.route));
    const inner: Box = [rb[0] - pad + 2, rb[1] - pad + 2, rb[2] + pad - 2, rb[3] + pad - 2];
    const foreign = c.parts.some((p) => {
      if (gr.parts.includes(p.id)) return false;
      const gm = geoms.get(p.id)!;
      if (gm.center && gm.center[0] > inner[0] && gm.center[0] < inner[2] && gm.center[1] > inner[1] && gm.center[1] < inner[3]) return true;
      return segsOf(gm.route).some(([a, b]) => segInBox(a, b, [rb[0] + 1, rb[1] + 1, rb[2] - 1, rb[3] - 1]) > 2);
    });
    const rect = (gr.tone === 'bridge' || members.every((p) => pair(p) === pair(members[0]))) && members.length > 1 && !foreign;
    const d = rect
      ? `${pathOf([[rb[0], rb[1]], [rb[2], rb[1]], [rb[2], rb[3]], [rb[0], rb[3]]])} Z`
      : segs.filter((s) => dist(s[0], s[1]) > 0.01 || segs.length === 1).map((s) => pathOf(s)).join(' ');
    if (rect) segs.splice(0, segs.length, [[rb[0], rb[1]], [rb[2], rb[3]]]);
    halos.push({ id: `halo:${gi}:${gr.parts.join('+')}`, d, pad, tone: gr.tone });
    const hb = boxOfPts(segs.flat(), pad);
    grow(hb);
    // el contorno del halo también estorba a los rótulos (que no lo crucen)
    for (const s of segs) {
      const b = boxOfPts(s, pad + 1);
      const q: Pt[] = [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]];
      q.forEach((x, i) => field.soft.push([x, q[(i + 1) % 4]]));
    }
    (gr as Group & { _box?: Box })._box = hb;
  });
  // el halo más gordo (el que contiene a otro) va detrás
  halos.sort((a, b) => b.pad - a.pad);

  // ── mallas ──
  const loopCircles: { c: Pt; r: number }[] = [];
  let perim = 0;
  const allSegs = [...field.segs];
  for (const loop of loops) {
    const cr = loopCrossings(c, loop.id);
    if (!cr.length) continue;
    const poly: Pt[] = [];
    for (const x of cr) {
      const r = geoms.get(x.part.id)?.route;
      if (!r) continue;
      const seq = x.fwd ? r : [...r].reverse();
      for (const q of seq) if (!poly.length || dist(poly[poly.length - 1], q) > 0.5) poly.push(q);
    }
    if (poly.length > 1 && dist(poly[0], poly[poly.length - 1]) < 0.5) poly.pop();
    const shape = simplify(poly);
    if (shape.length < 3) continue;
    const inLoop = new Set(cr.map((x) => x.part.id));
    // ¿hay piezas adentro? entonces no es una "ventana": flecha por el perímetro.
    const inner = c.parts.some((p) => {
      if (inLoop.has(p.id)) return false;
      const r = geoms.get(p.id)!.route;
      return r.slice(1).some((q, i) => inPoly([(q[0] + r[i][0]) / 2, (q[1] + r[i][1]) / 2], shape) && segDist([(q[0] + r[i][0]) / 2, (q[1] + r[i][1]) / 2], shape[0], shape[0]) >= 0 && !onPoly([(q[0] + r[i][0]) / 2, (q[1] + r[i][1]) / 2], shape));
    });
    const cw = (loop.dir ?? 'cw') === 'cw';
    const tone = loop.tone;
    const lb = boxOfPts(shape);
    if (!inner) {
      // polo de inaccesibilidad por muestreo
      let best: Pt = [(lb[0] + lb[2]) / 2, (lb[1] + lb[3]) / 2], bd = -1;
      const ctr = best;
      for (let x = lb[0] + 4; x <= lb[2] - 4; x += 4)
        for (let y = lb[1] + 4; y <= lb[3] - 4; y += 4) {
          const q: Pt = [x, y];
          if (!inPoly(q, shape)) continue;
          let d = Infinity;
          for (const [a, b] of allSegs) d = Math.min(d, segDist(q, a, b));
          for (const o of field.boxes) if (o.w >= 12) d = Math.min(d, boxDist(q, o.box));
          for (const lc of loopCircles) d = Math.min(d, dist(q, lc.c) - lc.r);
          const score = d - dist(q, ctr) * 0.02;
          if (score > bd) (bd = score), (best = q);
        }
      const r = Math.max(9, Math.min(17, bd - 6));
      loopCircles.push({ c: best, r });
      const a0 = -Math.PI / 2 + (cw ? 0.45 : -0.45);
      const sweep = (cw ? 1 : -1) * (2 * Math.PI - 0.9);
      const a1 = a0 + sweep;
      const s: Pt = [best[0] + r * Math.cos(a0), best[1] + r * Math.sin(a0)];
      const e: Pt = [best[0] + r * Math.cos(a1), best[1] + r * Math.sin(a1)];
      marks.push({ id: `loop:${loop.id}`, d: `M${fmt(s[0])},${fmt(s[1])} A${fmt(r)},${fmt(r)} 0 1,${cw ? 1 : 0} ${fmt(e[0])},${fmt(e[1])}`, tone, width: 1.6 });
      const tang = a1 + (cw ? Math.PI / 2 : -Math.PI / 2);
      marks.push({ id: `loophead:${loop.id}`, d: arrowHead(e[0] + Math.cos(tang) * 2, e[1] + Math.sin(tang) * 2, tang, 3.4), tone, fill: true, opacity: 1 });
      texts.push({ id: `looplabel:${loop.id}`, x: fmt(best[0]), y: fmt(best[1]), text: loop.label, anchor: 'middle', size: 12, weight: 600, tone });
      const bx: Box = [best[0] - r - 3, best[1] - r - 3, best[0] + r + 3, best[1] + r + 3];
      field.add(bx, 10);
    } else {
      // lazo exterior: flecha que corre por dentro del perímetro
      const ring = inset(shape, 12 + 8 * perim++);
      const ordered = cw === isCw(ring) ? ring : [...ring].reverse();
      marks.push({ id: `loop:${loop.id}`, d: `${pathOf(ordered)} Z`, tone, width: 1.4, dash: '6 4', opacity: 0.9 });
      ordered.forEach((q, i) => field.segs.push([q, ordered[(i + 1) % ordered.length]]));
      // puntas en el medio de los dos tramos más largos
      const edges = ordered.map((q, i) => [q, ordered[(i + 1) % ordered.length]] as [Pt, Pt]).sort((x, y) => dist(y[0], y[1]) - dist(x[0], x[1]));
      edges.slice(0, 2).forEach(([a, b], i) => {
        const m: Pt = [a[0] + (b[0] - a[0]) * 0.3, a[1] + (b[1] - a[1]) * 0.3];
        const an = Math.atan2(b[1] - a[1], b[0] - a[0]);
        marks.push({ id: `loophead:${loop.id}:${i}`, d: arrowHead(m[0] + Math.cos(an) * 4, m[1] + Math.sin(an) * 4, an, 3.6), tone, fill: true, opacity: 1 });
      });
      // rótulo: esquina interior superior izquierda
      const tl = [...ordered].sort((p, q) => p[0] + p[1] - (q[0] + q[1]))[0];
      const t = { id: `looplabel:${loop.id}`, x: fmt(tl[0] + 6), y: fmt(tl[1] + 10), text: loop.label, anchor: 'start' as const, size: 12, weight: 600, tone };
      texts.push(t);
      field.add(textBox(t), 10);
    }
  }

  // ── rótulos de piezas ──
  const known = ctx.known ?? new Map<string, CPart>();
  // Los rótulos se piden todos primero y se resuelven juntos (voraz + dos
  // pasadas de refinamiento): así el orden de las piezas no decide quién se
  // queda con el hueco bueno. `from` = punto de anclaje: un rótulo que mira
  // hacia el centro del circuito paga un poco más que uno que mira afuera.
  const reqs: { id: string; cands: Cand[]; segW: number }[] = [];
  const bb0 = bbox ?? [0, 0, 1, 1];
  const centroid: Pt = [(bb0[0] + bb0[2]) / 2, (bb0[1] + bb0[3]) / 2];
  const place = (id: string, cands: Cand[], segW = 4, from?: Pt) => {
    if (from)
      for (const cd of cands) {
        const b = cd.boxes[0];
        const m: Pt = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
        if (dist(m, centroid) < dist(from, centroid) - 2) cd.extra = (cd.extra ?? 0) + 25;
        // cerca de su pieza: un rótulo lejano se lee como de otra
        cd.extra = (cd.extra ?? 0) + dist(m, from) * 0.8;
      }
    reqs.push({ id, cands, segW });
  };
  const mk = (it: Item): { it: Item; box: Box } => ({ it, box: textBox(it) });

  for (const p of c.parts) {
    const gm = geoms.get(p.id)!;
    if (!gm.center || p.kind === 'open') continue;
    const modelOn = isDiode(p) && hyp.get(p.id)?.assume === 'on' && hyp.get(p.id)?.showModel !== false;
    const name = p.label ?? (p.mergedFrom ? p.id : undefined);
    const value = valueText(p, modelOn, sol, hyp.has(p.id));
    if (!name && !value) continue;
    const st = p.state === 'active' || p.state === 'answer' || p.state === 'muted' ? p.state : walkNow.has(p.id) ? 'active' : undefined;
    const lines: Item[] = [];
    // Diodo con hipótesis: el veredicto del solver va pegado a su nombre (D1 ✓).
    const dv = hyp.has(p.id) && sol.ok ? sol.diodes[p.id] : undefined;
    if (name) lines.push({ text: dv ? `${name} ${dv.valid ? '✓' : '✗'}` : name, x: 0, y: 0, anchor: 'middle', size: 12, weight: 600, state: st, color: dv ? (dv.valid ? 'ok' : 'bad') : undefined });
    if (value) lines.push({ text: value, x: 0, y: 0, anchor: 'middle', size: 11.5, color: 'muted', state: st === 'muted' ? 'muted' : undefined });
    const [cx, cy] = gm.center;
    const ang = gm.angle;
    const u: Pt = [Math.cos(ang), Math.sin(ang)];
    const nrm: Pt = [-u[1], u[0]];
    const hw = gm.hw + 4;
    const lh = (it: Item) => it.size * LINE;
    const H = lines.reduce((s, it) => s + lh(it), 0);
    const stack = (x: number, yTop: number, anchor: Item['anchor']) => {
      let y = yTop;
      return lines.map((it) => {
        const r = mk({ ...it, x, y: y + lh(it) / 2, anchor });
        y += lh(it);
        return r;
      });
    };
    const cands: { items: Item[]; boxes: Box[] }[] = [];
    const add = (rs: { it: Item; box: Box }[]) => cands.push({ items: rs.map((r) => r.it), boxes: rs.map((r) => r.box) });
    const horizontal = Math.abs(u[0]) > 0.999;
    const vertical = Math.abs(u[1]) > 0.999;
    const slides = [0, -0.6, 0.6];
    if (horizontal) {
      for (const sl of slides) {
        const x = cx + sl * gm.hl;
        if (lines.length === 2) add([mk({ ...lines[0], x, y: cy - hw - lh(lines[0]) / 2 }), mk({ ...lines[1], x, y: cy + hw + lh(lines[1]) / 2 })]);
        add(stack(x, cy - hw - H, 'middle'));
        add(stack(x, cy + hw, 'middle'));
      }
      add(stack(cx + gm.hl + 6, cy - hw - H, 'start'));
      add(stack(cx - gm.hl - 6, cy - hw - H, 'end'));
    } else if (vertical) {
      for (const sl of [0, -0.5, 0.5, -1, 1]) {
        const y = cy + sl * gm.hl - H / 2;
        add(stack(cx + hw + 1, y, 'start'));
        add(stack(cx - hw - 1, y, 'end'));
      }
      if (lines.length === 2) add([mk({ ...lines[0], x: cx + hw + 1, y: cy - gm.hl / 2, anchor: 'start' }), mk({ ...lines[1], x: cx - hw - 1, y: cy + gm.hl / 2, anchor: 'end' })]);
    } else {
      const combos: number[][] = [];
      for (const off of [hw + 4, hw + 14]) for (const sl of [0, 0.5, -0.5, 1, -1]) for (const sgn of [1, -1]) combos.push([sgn, off, sl]);
      for (const [sgn, off, sl] of combos) {
        const px = cx + nrm[0] * sgn * off + u[0] * sl * gm.hl, py = cy + nrm[1] * sgn * off + u[1] * sl * gm.hl;
        const anchor: Item['anchor'] = Math.abs(nrm[0] * sgn) < 0.3 ? 'middle' : nrm[0] * sgn > 0 ? 'start' : 'end';
        const yTop = nrm[1] * sgn > 0.3 ? py : nrm[1] * sgn < -0.3 ? py - H : py - H / 2;
        add(stack(px, yTop, anchor));
      }
    }
    place(`label:${p.id}`, cands, 4, gm.center);
  }

  // ── rótulos de nodos (+ potencial) ──
  for (const n of c.nodes) {
    const V = sol.ok ? sol.potentials[n.id] : undefined;
    const pot = n.showPotential && V != null && Number.isFinite(V) ? formatSI(Math.abs(V) < 1e-9 ? 0 : V, 'V') : undefined;
    if (!n.label && !pot) continue;
    const text = n.label && pot ? `${n.label} = ${pot}` : (n.label ?? pot!);
    const [x, y] = P(n.id);
    const base: Item = { text, x, y, anchor: 'start', size: 12, weight: 600, chip: !!pot, state: n.state === 'active' || n.state === 'answer' ? n.state : undefined };
    const cands = [7, 16, 26].flatMap((d) => ([
      [d, -d - 4, 'start'], [-d, -d - 4, 'end'], [d, d + 5, 'start'], [-d, d + 5, 'end'],
      [0, -d - 8, 'middle'], [0, d + 9, 'middle'], [d + 3, 0, 'start'], [-d - 3, 0, 'end'],
    ] as [number, number, Item['anchor']][])).concat(
      // más lejos, por encima/debajo de la fila de rótulos de piezas: un chip
      // ancho en una malla estrecha no tiene hueco cerca del nodo.
      [40, 54].flatMap((d) => [[0, -d, 'middle'], [0, d, 'middle'], [8, -d, 'start'], [-8, -d, 'end'], [8, d, 'start'], [-8, d, 'end']] as [number, number, Item['anchor']][]),
    ).map(([dx, dy, anchor]) => {
      const it = { ...base, x: x + dx, y: y + dy, anchor };
      return { items: [it], boxes: [textBox(it)] };
    });
    place(`node:${n.id}`, cands, 4);
  }

  // ── flechas de corriente ──
  for (const cur of c.currents ?? []) {
    const p = c.parts.find((q) => q.id === cur.part);
    const gm = p && geoms.get(p.id);
    if (!p || !gm) continue;
    const sgn = cur.dir === 'reverse' ? -1 : 1;
    const Ival = sol.ok ? (sol.currents[p.id] ?? NaN) * sgn : NaN;
    const text = cur.showValue && Number.isFinite(Ival) ? `${cur.label} = ${formatSI(Ival, 'A')}` : cur.label;
    const cands: Cand[] = [];
    const segs = gm.route.slice(1).map((b, i) => [gm.route[i], b] as [Pt, Pt]);
    const headMark = (tip: Pt, an: number): CanvasPath => ({ id: `curhead:${p.id}`, d: arrowHead(tip[0], tip[1], an, 3.8), tone: 'current', fill: true, opacity: 1 });
    const labelAt = (m: Pt, nrm: Pt, side: number, off: number): Item => {
      const nx = nrm[0] * side, ny = nrm[1] * side;
      const lp: Pt = [m[0] + nx * off, m[1] + ny * off];
      const anchor: Item['anchor'] = Math.abs(nx) < 0.3 ? 'middle' : nx > 0 ? 'start' : 'end';
      return { text, x: lp[0], y: lp[1] + (ny > 0.3 ? 6 : ny < -0.3 ? -6 : 0), anchor, size: 12, weight: 600, tone: 'current' };
    };
    segs.forEach(([a, b]) => {
      const L = dist(a, b);
      if (L < 10) return;
      const u = norm([b[0] - a[0], b[1] - a[1]]);
      const dirv: Pt = [u[0] * sgn, u[1] * sgn];
      const an = Math.atan2(dirv[1], dirv[0]);
      const nrm: Pt = [-u[1], u[0]];
      const hasSym = !!gm.center && segDist(gm.center, a, b) < 0.5;
      // 1) flecha paralela al costado del símbolo
      if (hasSym)
        for (const side of [1, -1]) {
          const off = gm.hw + 8;
          const m: Pt = [gm.center![0] + nrm[0] * side * off, gm.center![1] + nrm[1] * side * off];
          const s0: Pt = [m[0] - dirv[0] * 9, m[1] - dirv[1] * 9];
          const e0: Pt = [m[0] + dirv[0] * 6, m[1] + dirv[1] * 6];
          const tip: Pt = [m[0] + dirv[0] * 11, m[1] + dirv[1] * 11];
          const it = labelAt(m, nrm, side, 8);
          cands.push({
            items: [it],
            boxes: [textBox(it), boxOfPts([s0, tip], 3)],
            marks: [{ id: `cur:${p.id}`, d: `M${fmt(s0[0])},${fmt(s0[1])} L${fmt(e0[0])},${fmt(e0[1])}`, tone: 'current', width: 1.6 }, headMark(tip, an)],
          });
        }
      // 2) punta sobre el cable (en un tramo libre o en los terminales del símbolo)
      const spots: number[] = [];
      if (hasSym) {
        const lead = L / 2 - gm.hl;
        if (lead >= 12) spots.push(lead / 2 / L, 1 - lead / 2 / L);
      } else spots.push(0.5, 0.25, 0.75);
      for (const f of spots) {
        const m: Pt = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
        const tip: Pt = [m[0] + dirv[0] * 4, m[1] + dirv[1] * 4];
        for (const side of [1, -1]) {
          const it = labelAt(m, nrm, side, 7);
          const horiz = Math.abs(u[0]) > 0.9;
          const variants: Item[] = horiz ? [it, { ...it, anchor: 'end', x: it.x + 6 }, { ...it, anchor: 'start', x: it.x - 6 }] : [it];
          for (const v of variants) cands.push({ items: [v], boxes: [textBox(v)], marks: [headMark(tip, an)], extra: hasSym ? 3 : 0 });
        }
      }
    });
    if (!cands.length) continue;
    place(`cur:${p.id}`, cands, 4, gm.center);
  }

  // ── tensiones: + rótulo − ──
  for (const v of c.voltages ?? []) {
    const p = c.parts.find((q) => q.id === v.part);
    const gm = p && geoms.get(p.id);
    if (!p || !gm) continue;
    const center = gm.center ?? along(gm.route, polyLen(gm.route) / 2).p;
    const ang = gm.center ? gm.angle : along(gm.route, polyLen(gm.route) / 2).angle;
    const u: Pt = [Math.cos(ang), Math.sin(ang)];
    const nrm: Pt = [-u[1], u[0]];
    const Vv = sol.ok ? sol.potentials[p.from] - sol.potentials[p.to] : NaN;
    const val = (v.plus ?? 'from') === 'from' ? Vv : -Vv;
    const text = v.showValue && Number.isFinite(val) ? `${v.label} = ${formatSI(val, 'V')}` : v.label;
    const plusAt = (v.plus ?? 'from') === 'from' ? -1 : 1;
    // horizontal: + y − flanquean el rótulo (nunca encima de él)
    const hl = Math.abs(u[1]) > 0.9 ? Math.max(gm.hl, 10) + 6 : Math.max(Math.max(gm.hl, 10) + 6, measure(text, 12) / 2 + 10);
    const cands: Cand[] = [];
    for (const side of [-1, 1]) {
      for (const extra of [0, 14, 28]) {
        const off = gm.hw + 10 + extra;
        const m: Pt = [center[0] + nrm[0] * side * off, center[1] + nrm[1] * side * off];
        const plus: Item = { text: '+', x: m[0] + u[0] * plusAt * hl, y: m[1] + u[1] * plusAt * hl, anchor: 'middle', size: 13, weight: 600 };
        const minus: Item = { text: '−', x: m[0] - u[0] * plusAt * hl, y: m[1] - u[1] * plusAt * hl, anchor: 'middle', size: 13, weight: 600 };
        const nx = nrm[0] * side;
        const vertical = Math.abs(u[1]) > 0.9;
        const lab: Item = vertical
          ? { text, x: m[0] + (nx > 0 ? -4 : 4), y: m[1], anchor: nx > 0 ? 'start' : 'end', size: 12, weight: 600 }
          : { text, x: m[0], y: m[1], anchor: 'middle', size: 12, weight: 600 };
        const items = [plus, minus, lab];
        cands.push({ items, boxes: items.map((it) => textBox(it)), extra: extra * 1.2 });
      }
    }
    place(`volt:${p.id}`, cands, 4, center);
  }

  // ── rótulos de halos ──
  (c.groups ?? []).forEach((gr, gi) => {
    const hb = (gr as Group & { _box?: Box })._box;
    if (!gr.label || !hb) return;
    const cx = (hb[0] + hb[2]) / 2;
    const mkL = (x: number, y: number, anchor: Item['anchor']) => {
      const it: Item = { text: gr.label!.toUpperCase(), x, y, anchor, size: 10, weight: 600, mono: true, tone: gr.tone };
      return { items: [it], boxes: [textBox(it)] };
    };
    place(`halo:${gi}`, [mkL(cx, hb[1] - 7, 'middle'), mkL(cx, hb[3] + 8, 'middle'), mkL(hb[0] + 4, hb[1] - 7, 'start'), mkL(hb[2] - 4, hb[1] - 7, 'end'), mkL(hb[2] + 5, (hb[1] + hb[3]) / 2, 'start'), mkL(hb[0] - 5, (hb[1] + hb[3]) / 2, 'end')], 2);
  });

  // ── resolver rótulos ──
  const pick: number[] = reqs.map(() => 0);
  const costOf = (ri: number, ci: number) => {
    const cd = reqs[ri].cands[ci];
    let cost = field.cost(cd.boxes, reqs[ri].segW) + (cd.extra ?? 0) + ci * 0.5;
    for (let rj = 0; rj < reqs.length; rj++) {
      if (rj === ri || pick[rj] < 0) continue;
      // Los rótulos de OTRAS piezas se inflan 4 px: pegados se leen como uno solo.
      for (const b of reqs[rj].cands[pick[rj]].boxes) for (const a of cd.boxes) cost += overlap(a, [b[0] - 4, b[1] - 3, b[2] + 4, b[3] + 3]) * 10;
    }
    return cost;
  };
  pick.fill(-1);
  for (let pass = 0; pass < 3; pass++)
    for (let ri = 0; ri < reqs.length; ri++) {
      const prevPick = pick[ri];
      pick[ri] = -1;
      let best = prevPick < 0 ? 0 : prevPick, bc = prevPick < 0 ? Infinity : costOf(ri, prevPick) - 0.01;
      for (let ci = 0; ci < reqs[ri].cands.length; ci++) {
        const cc = costOf(ri, ci);
        if (cc < bc) (bc = cc), (best = ci);
      }
      pick[ri] = best;
    }
  reqs.forEach((r, ri) => {
    const best = r.cands[pick[ri]];
    if (!best) return;
    best.items.forEach((it, i) => texts.push({ id: `${r.id}:${i}`, ...it, x: fmt(it.x), y: fmt(it.y) }));
    if (best.marks) marks.push(...best.marks);
    for (const b of best.boxes) grow(b), labels.push({ id: r.id, box: b });
  });

  // ── Req: anillo en los dos terminales ──
  if (c.req) for (const id of c.req.between) if (nodes.has(id)) { const [x, y] = P(id); dots.push({ id: `req:${id}`, x, y, r: 5.5, ring: true }); }

  // ── recorrido KVL (trazo que avanza) ──
  let walker: SceneWalker | undefined;
  if (kvl && crossings.length) {
    const loop = loops.find((l) => l.id === kvl.loop)!;
    const poly: Pt[] = [];
    const ends: number[] = [];
    for (const x of crossings) {
      const r = geoms.get(x.part.id)!.route;
      const seq = x.fwd ? r : [...r].reverse();
      for (const q of seq) if (!poly.length || dist(poly[poly.length - 1], q) > 0.5) poly.push(q);
      ends.push(polyLen(poly));
    }
    const total = polyLen(poly);
    const upto = kvl.upto ?? loop.path.length;
    let doneLen = 0;
    crossings.forEach((x, i) => { if (x.seg < upto) doneLen = ends[i]; });
    const frac = total ? Math.min(1, doneLen / total) : 1;
    const h = along(poly, Math.min(doneLen, total - 0.01));
    walker = { id: `walk:${loop.id}`, d: pathOf(poly), frac: fmt(frac), tone: loop.tone, head: { x: fmt(h.p[0]), y: fmt(h.p[1]), angle: fmt(h.angle * R2D) } };
  }

  // ── panel ──
  const rows: PanelRow[] = [];
  const nm = (id: string) => texLabel(known.get(id)?.label ?? c.parts.find((p) => p.id === id)?.label ?? id);
  const tx = (s: string) => (/^[A-Z][a-z0-9]+$/.test(s) ? `${s[0]}_{${s.slice(1)}}` : texLabel(s));
  for (const gr of c.groups ?? []) {
    const names = gr.parts.map((id) => tx(nm(id)));
    const what = gr.label ?? (gr.tone === 'series' ? 'serie' : gr.tone === 'parallel' ? 'paralelo' : 'grupo');
    rows.push({ id: `group:${gr.parts.join('+')}`, tex: `\\text{${what}: } ${names.join(',\\ ')}`, parts: gr.parts, tone: gr.tone });
  }
  for (const p of c.parts) {
    if (!p.mergedFrom?.length) continue;
    const srcs = p.mergedFrom.map((id) => tx(nm(id)));
    const k = p.mergeKind ?? 'series';
    const lhs = tx(p.label ?? p.id);
    const src = p.mergedFrom.map((id) => known.get(id) ?? c.parts.find((q) => q.id === id));
    let expr: string;
    if (k === 'series') expr = srcs.join(' + ');
    else if (k === 'parallel') expr = srcs.join(' \\parallel ');
    else if (k === 'delta-wye') {
      // terminal = el extremo de la rama Y que ya era nodo del triángulo
      const dn = new Set(src.flatMap((q) => (q ? [q.from, q.to] : [])));
      const term = dn.has(p.from) ? p.from : p.to;
      const adj = src.map((q, i) => (q && (q.from === term || q.to === term) ? srcs[i] : null)).filter(Boolean);
      expr = `\\dfrac{${adj.join('\\,')}}{${srcs.join(' + ')}}`;
    } else {
      const opp = src.findIndex((q) => q && ![q.from, q.to].includes(p.from) && ![q.from, q.to].includes(p.to));
      const [a, b, cc] = srcs;
      expr = `\\dfrac{${a}${b} + ${b}${cc} + ${cc}${a}}{${srcs[opp < 0 ? 2 : opp]}}`;
    }
    const val = p.value != null ? ` = ${formatSITex(p.value, 'Ω')}` : '';
    rows.push({ id: `merge:${p.id}`, tex: `${lhs} = ${expr}${val}`, parts: [p.id], tone: MERGE_TONE[k] });
  }
  if (kvl) {
    const loop = loops.find((l) => l.id === kvl.loop)!;
    const kt = kvlTerms(c, loop.id, kvl.upto);
    rows.push({ id: `kvlhead:${loop.id}`, kind: 'head', tex: `KVL · malla ${loop.label} (${(loop.dir ?? 'cw') === 'cw' ? 'horario' : 'antihorario'})`, tone: loop.tone });
    rows.push({ id: `kvl:${loop.id}`, terms: kt.terms.map((t) => ({ part: t.part, tex: t.tex, active: kvl.upto != null && walkNow.has(t.part) })), parts: kt.terms.map((t) => t.part) });
    if (!kt.terms.length) rows.push({ id: `kvl0:${loop.id}`, kind: 'note', tex: 'Todavía ningún término: sólo cables.' });
    if (kt.closedTex) rows.push({ id: `kvlclosed:${loop.id}`, tex: kt.closedTex, state: 'answer' });
  }
  if (c.showSystem && loops.length) {
    const ms = meshSystem(c);
    rows.push({ id: 'syshead', kind: 'head', tex: 'Sistema de mallas' });
    ms.equations.forEach((e, i) => rows.push({ id: `sys:${i}`, tex: e }));
    rows.push({ id: 'solhead', kind: 'head', tex: 'Solución' });
    for (const [k, v] of Object.entries(ms.solution)) {
      const lp = loops.find((l) => l.label === k);
      rows.push({ id: `sol:${k}`, tex: `${texLabel(k)} = ${Number.isFinite(v) ? formatSITex(v, 'A') : '?'}`, tone: lp?.tone, state: 'answer' });
    }
  }
  for (const d of c.diodes ?? []) {
    const p = c.parts.find((q) => q.id === d.part);
    const st = sol.diodes?.[d.part];
    if (!p || !st) continue;
    const name = `${tx(p.label ?? p.id)}\\,(\\text{${p.kind === 'led' ? 'LED' : p.model === 'ge' ? 'Ge' : 'Si'}})`;
    const tex =
      d.assume === 'on' && st.valid && st.actual === 'off'
        ? `${name}\\ \\text{OFF (en el umbral)}:\\ I_D = 0,\\ V_{AK} = ${formatSITex(vfOf(p), 'V')}`
        : d.assume === 'on'
        ? `${name}\\ \\text{ON}:\\ I_D = ${formatSITex(st.id, 'A')} ${st.id >= -1e-12 ? '\\ge' : '<'} 0`
        : `${name}\\ \\text{OFF}:\\ V_{AK} = ${formatSITex(st.vd, 'V')} ${st.vd < vfOf(p) ? '<' : '\\ge'} ${formatSITex(vfOf(p), 'V')}`;
    rows.push({ id: `diode:${d.part}`, tex, parts: [d.part], verdict: st.valid ? 'ok' : 'bad' });
  }
  if (c.req && sol.req != null) rows.push({ id: 'req', tex: `R_{eq}(${c.req.between.map((b) => nodes.get(b)?.label ?? b).join(',')}) = ${formatSITex(sol.req, 'Ω')}`, state: 'answer' });
  (c.equations ?? []).forEach((e, i) => rows.push({ id: `eq:${i}`, tex: e.tex, parts: e.part ? [e.part] : undefined, state: e.state }));
  if (!sol.ok && sol.reason) rows.push({ id: 'err', kind: 'note', tex: sol.reason, verdict: (c.diodes ?? []).length ? 'bad' : undefined });
  else if (sol.reason && (c.diodes ?? []).length) rows.push({ id: 'why', kind: 'note', tex: sol.reason });

  const scene: CanvasScene = { origin: { x: 0, y: 0 }, wires, symbols, texts, marks, dots, halos, walker, variant: c.variant };
  const P2: Record<string, Pt> = {};
  for (const n of c.nodes) P2[n.id] = P(n.id);
  return { scene, panel: { rows }, bbox: bbox ?? [0, 0, 1, 1], debug: { parts: [...geoms.values()], labels, nodes: P2 } };
}

function onPoly(p: Pt, poly: Pt[]): boolean {
  return poly.some((a, i) => segDist(p, a, poly[(i + 1) % poly.length]) < 0.5);
}
function isCw(poly: Pt[]): boolean {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s > 0;
}

// ─────────────────────────── todos los pasos ───────────────────────────

export type CircuitStepsOut = { steps: CanvasStep[]; width: number; height: number; layouts: StepLayout[] };

/** Pasos del schema → CanvasStep[] con un viewBox COMÚN (unión de todos los
 * pasos): los nodos nunca saltan entre pasos. */
export function circuitSteps(input: StepIn[], opts: { overrides?: Record<string, number> } = {}): CircuitStepsOut {
  const steps = resolveMergedValues(input as never[]) as StepIn[];
  const known = new Map<string, CPart>();
  let prevGroups: Group[] | undefined;
  const prev = new Map<string, PrevGeom>();
  const layouts: StepLayout[] = [];
  let U: Box | null = null;
  for (const s of steps) {
    const c = s.circuit;
    if (!c) {
      layouts.push({ scene: { origin: { x: 0, y: 0 }, wires: [], symbols: [], texts: [], marks: [], dots: [], halos: [] }, panel: { rows: [] }, bbox: [0, 0, 1, 1], debug: { parts: [], labels: [], nodes: {} } });
      continue;
    }
    let sol: Solution;
    try {
      sol = solveCircuit(c, opts.overrides ?? {});
    } catch (e) {
      sol = { ok: false, reason: String(e), potentials: {}, currents: {}, diodes: {} };
    }
    const lay = layoutCircuit(c, { sol, known, prevGroups, prev });
    for (const g of lay.debug.parts) prev.set(g.id, { route: g.route, center: g.center });
    for (const p of c.parts) known.set(p.id, p);
    prevGroups = c.groups;
    layouts.push(lay);
    U = union(U, lay.bbox);
  }
  const box: Box = U ?? [0, 0, 1, 1];
  const PAD = 14;
  const hasBadge = steps.some((s) => s.circuit?.hypothesis || s.circuit?.req);
  const top = hasBadge ? 30 : 0;
  const breadboard = steps.some((s) => s.circuit?.variant === 'breadboard');
  const bpad = breadboard ? 22 : 0;
  const origin = { x: box[0] - PAD - bpad, y: box[1] - PAD - top - bpad };
  const width = Math.ceil(box[2] - box[0] + 2 * PAD + 2 * bpad);
  const height = Math.ceil(box[3] - box[1] + 2 * PAD + top + 2 * bpad);
  const out: CanvasStep[] = steps.map((s, i) => {
    const lay = layouts[i];
    const c = s.circuit;
    const scene = { ...lay.scene, origin, texts: [...lay.scene.texts] };
    if (c?.hypothesis) {
      const v = verdictOf(lay);
      const mark = v === 'ok' ? '  ✓' : v === 'bad' ? '  ✗' : '';
      scene.texts.push({ id: 'badge:hyp', x: origin.x + PAD + bpad + 6, y: origin.y + PAD + 6, text: c.hypothesis + mark, anchor: 'start', size: 11, weight: 600, mono: true, chip: true, color: verdictOf(lay) });
    }
    if (c?.req) {
      const reqText = reqBadge(c, lay);
      if (reqText) scene.texts.push({ id: 'badge:req', x: origin.x + width - PAD - bpad - 6, y: origin.y + PAD + 6, text: reqText, anchor: 'end', size: 11, weight: 600, mono: true, chip: true, state: 'answer' });
    }
    if (c?.variant === 'breadboard') scene.board = { x: box[0] - PAD - bpad / 2, y: box[1] - PAD - bpad / 2, w: box[2] - box[0] + 2 * PAD + bpad, h: box[3] - box[1] + 2 * PAD + bpad };
    return { note: s.note, nodes: [], edges: [], highlight: [], scene, panel: lay.panel, width, height };
  });
  return { steps: out, width, height, layouts };
}

function verdictOf(lay: StepLayout): SceneText['color'] {
  const rows = lay.panel.rows.filter((r) => r.verdict && r.kind !== 'note');
  if (lay.panel.rows.some((r) => r.id === 'err' && r.verdict)) return 'bad';
  if (!rows.length) return 'ink';
  return rows.every((r) => r.verdict === 'ok') ? 'ok' : 'bad';
}
function reqBadge(c: CircuitSpec, lay: StepLayout): string | undefined {
  const row = lay.panel.rows.find((r) => r.id === 'req');
  if (!row) return undefined;
  // reconstruye el valor en texto plano desde el solver
  const sol = solveCircuit(c);
  if (sol.req == null) return undefined;
  const lab = (id: string) => c.nodes.find((n) => n.id === id)?.label ?? id;
  return `Req(${lab(c.req!.between[0])},${lab(c.req!.between[1])}) = ${formatSI(sol.req, 'Ω')}`;
}
