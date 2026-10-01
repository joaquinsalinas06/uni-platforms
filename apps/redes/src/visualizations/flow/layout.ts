// Layout puro de `flow`: diagramas de flujo (termostato, aforo + gas),
// máquinas de estados (cliente MQTT, broker/consumer) y diagramas de bloques
// (nodo agrícola: controlador al centro, entradas a la izquierda, salidas a
// la derecha, potencia abajo). Tres pasos: asignar (col, fila) según el
// modo → convertir a px con anchos/altos por columna/fila → rutear flechas.
// `x`/`y` de una forma fuerzan su (col, fila). Sin React/JSX.
import { charW, LINE_H, type CanvasNode, type CanvasPath, type CanvasText, type Frame, type NodeShape, type NodeState } from '../canvas-types.ts';

export type FlowKind = 'start' | 'end' | 'process' | 'decision' | 'io' | 'state' | 'block';
export type FlowShapeIn = { id: string; kind: FlowKind; label: string; x?: number; y?: number; initial?: boolean; state?: NodeState };
export type FlowArrowIn = { from: string; to: string; label?: string; kind?: 'flow' | 'data' | 'power'; state?: NodeState };
export type FlowMode = 'flowchart' | 'fsm' | 'blocks';

const FONT = 12;
const LABEL = 10.5;
const MARGIN = 16;
const tw = (s: string, size = FONT) => s.length * charW(size);

type Box = { id: string; kind: FlowKind; lines: string[]; w: number; h: number; col: number; row: number; cx: number; cy: number; state?: NodeState };
type Pt = [number, number];

const SHAPE: Record<FlowKind, NodeShape> = {
  start: 'ellipse', end: 'ellipse', process: 'rect', decision: 'diamond', io: 'parallelogram', state: 'circle', block: 'rounded',
};

function size(kind: FlowKind, lines: string[]): { w: number; h: number } {
  const t = Math.max(...lines.map((l) => tw(l)));
  const th = lines.length * LINE_H;
  switch (kind) {
    case 'start': case 'end': return { w: Math.max(84, t + 36), h: Math.max(34, th + 14) };
    case 'process': return { w: Math.max(96, t + 24), h: th + 18 };
    case 'io': return { w: Math.max(110, t + 52), h: th + 18 };
    case 'block': return { w: Math.max(112, t + 28), h: Math.max(46, th + 24) };
    case 'state': { const d = Math.max(58, t + 18, th + 24); return { w: d, h: d }; }
    case 'decision': {
      // Rombo aplanado (h = w/2) que contiene el rectángulo del texto:
      // p/a + q/b ≤ 1 con b = a/2 ⇒ a ≥ p + 2q.
      const a = t / 2 + th + 10;
      return { w: Math.max(116, 2 * a), h: Math.max(58, a) };
    }
  }
}

/** Sin '\n' explícito, una etiqueta larga se parte por palabras: una forma
 * de 40 caracteres en una línea ensancha todo el diagrama. */
const WRAP: Record<FlowKind, number> = { start: 20, end: 20, process: 24, io: 24, block: 20, decision: 18, state: 12 };
export function wrapLabel(label: string, max: number): string[] {
  if (label.includes('\n') || label.length <= max) return label.split('\n');
  // " · " es el separador que usan los autores en vez de '\n': corte preferido.
  const lines: string[] = [];
  for (const part of label.split(' · ')) {
    let cur = '';
    for (const w of part.split(' ')) {
      if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

const NO = /^(f|falso|false|no|n|0)$/i;
export function detectMode(shapes: FlowShapeIn[], mode?: string): FlowMode {
  if (mode === 'flowchart' || mode === 'fsm' || mode === 'blocks') return mode;
  if (shapes.some((s) => s.kind === 'state')) return 'fsm';
  if (shapes.length && shapes.every((s) => s.kind === 'block')) return 'blocks';
  return 'flowchart';
}

// ───────────────────────── (col, fila) por modo ─────────────────────────
type Cell = { col: number; row: number };

/** Diagrama de flujo: la columna 0 es el "espinazo" (se baja por la salida
 * F de cada decisión, como en la guía del curso); la otra salida (V) abre
 * una rama lateral en la MISMA fila de la decisión. Lo que ya está colocado
 * no se vuelve a colocar: esa flecha es un retorno (bucle) o una unión. */
function assignFlowchart(shapes: FlowShapeIn[], arrows: FlowArrowIn[]): Map<string, Cell> {
  const byId = new Map(shapes.map((s) => [s.id, s]));
  const out = (id: string) => arrows.filter((a) => a.from === id && byId.has(a.to) && a.to !== id);
  const cells = new Map<string, Cell>();
  const taken = new Set<string>();
  const put = (id: string, col: number, row: number) => {
    while (taken.has(`${col},${row}`)) col++;
    cells.set(id, { col, row });
    taken.add(`${col},${row}`);
  };
  const mainOut = (id: string) => {
    const o = out(id);
    if (byId.get(id)!.kind !== 'decision') return o[0];
    return o.find((a) => NO.test((a.label ?? '').trim())) ?? o[o.length - 1];
  };
  const sideQueue: FlowArrowIn[] = [];
  const walk = (start: string, col: number, row: number) => {
    let cur: string | undefined = start;
    while (cur && !cells.has(cur)) {
      put(cur, col, row);
      col = cells.get(cur)!.col;
      const main = mainOut(cur);
      for (const a of out(cur)) if (a !== main) sideQueue.push(a);
      cur = main?.to;
      row++;
    }
  };
  const start = shapes.find((s) => s.kind === 'start') ?? shapes.find((s) => s.initial) ?? shapes[0];
  if (start) walk(start.id, 0, 0);
  while (sideQueue.length) {
    const a = sideQueue.shift()!;
    if (cells.has(a.to)) continue;
    const from = cells.get(a.from)!;
    walk(a.to, from.col + 1, from.row);
  }
  let row = Math.max(-1, ...[...cells.values()].map((c) => c.row)) + 1;
  for (const s of shapes) if (!cells.has(s.id)) walk(s.id, 0, row++);
  return cells;
}

/** FSM: columna = profundidad BFS desde el estado inicial; cada columna se
 * centra verticalmente. */
function assignFsm(shapes: FlowShapeIn[], arrows: FlowArrowIn[]): Map<string, Cell> {
  const depth = new Map<string, number>();
  const order = [shapes.find((s) => s.initial) ?? shapes[0], ...shapes].filter(Boolean);
  for (const root of order) {
    if (depth.has(root.id)) continue;
    const base = depth.size ? Math.max(...depth.values()) + 1 : 0;
    depth.set(root.id, base);
    const q = [root.id];
    while (q.length) {
      const u = q.shift()!;
      for (const a of arrows) {
        if (a.from === u && a.to !== u && !depth.has(a.to) && shapes.some((s) => s.id === a.to)) {
          depth.set(a.to, depth.get(u)! + 1);
          q.push(a.to);
        }
      }
    }
  }
  // Cadena/ciclo de > 3 estados (rdt2.1, rdt3.0): en serpiente de 2 filas, como en
  // las slides: la ida arriba (izq→der) y la vuelta abajo (der→izq).
  const byDepth = new Map<number, number>();
  for (const d of depth.values()) byDepth.set(d, (byDepth.get(d) ?? 0) + 1);
  const n = byDepth.size;
  if (n > 3 && [...byDepth.values()].every((c) => c === 1) && [...byDepth.keys()].every((d) => d < n)) {
    const half = Math.ceil(n / 2);
    return new Map(shapes.map((s) => {
      const d = depth.get(s.id)!;
      return [s.id, d < half ? { col: d, row: 0 } : { col: n - 1 - d, row: 1 }];
    }));
  }
  return centerColumns(shapes, depth);
}

function centerColumns(shapes: FlowShapeIn[], colOf: Map<string, number>): Map<string, Cell> {
  const cols = new Map<number, string[]>();
  for (const s of shapes) {
    const c = colOf.get(s.id) ?? 0;
    cols.set(c, [...(cols.get(c) ?? []), s.id]);
  }
  const cells = new Map<string, Cell>();
  for (const [col, ids] of cols) ids.forEach((id, i) => cells.set(id, { col, row: i - (ids.length - 1) / 2 }));
  return cells;
}

/** Bloques: el controlador (más conexiones de datos) al centro; lo que le
 * entra a la izquierda, lo que sale a la derecha (y así hacia afuera); las
 * fuentes (sólo flechas `power` salientes) van debajo, en `placeBlocks`. */
function blockRoles(shapes: FlowShapeIn[], arrows: FlowArrowIn[]) {
  const sources = new Set(shapes.filter((s) => arrows.some((a) => a.from === s.id && a.kind === 'power') && !arrows.some((a) => a.to === s.id) && !arrows.some((a) => a.from === s.id && a.kind !== 'power')).map((s) => s.id));
  const data = arrows.filter((a) => a.kind !== 'power');
  const deg = (id: string) => data.filter((a) => a.from === id || a.to === id).length;
  const hub = [...shapes].filter((s) => !sources.has(s.id)).sort((a, b) => deg(b.id) - deg(a.id))[0]?.id;
  return { sources, hub };
}

function assignBlocks(shapes: FlowShapeIn[], arrows: FlowArrowIn[]): Map<string, Cell> {
  const { sources, hub } = blockRoles(shapes, arrows);
  const links = arrows.filter((a) => !sources.has(a.from));
  const col = new Map<string, number>();
  const q: string[] = [];
  const seed = (id: string, c: number) => { col.set(id, c); q.push(id); };
  if (hub) seed(hub, 0);
  for (const s of shapes) {
    if (!sources.has(s.id) && !col.has(s.id) && !q.length) seed(s.id, 0);
    while (q.length) {
      const u = q.shift()!;
      for (const a of links) {
        if (a.from === u && !col.has(a.to)) seed(a.to, col.get(u)! + 1);
        if (a.to === u && !col.has(a.from)) seed(a.from, col.get(u)! - 1);
      }
    }
  }
  const cells = new Map<string, Cell>();
  const count = new Map<number, number>();
  for (const s of shapes) {
    const c = sources.has(s.id)
      ? Math.min(...arrows.filter((a) => a.from === s.id && col.has(a.to)).map((a) => Math.abs(col.get(a.to)!)), 0)
      : col.get(s.id) ?? 0;
    const r = count.get(c) ?? 0;
    count.set(c, r + 1);
    cells.set(s.id, { col: c, row: sources.has(s.id) ? 1000 + r : r });
  }
  return cells;
}

/** Posición vertical de un diagrama de bloques: las columnas vecinas del
 * controlador se apilan centradas y el controlador crece hasta recibirlas a
 * todas de frente (flechas horizontales rectas); más afuera, cada bloque se
 * alinea con el que lo alimenta; las fuentes, debajo de todo. */
function placeBlocks(boxes: Map<string, Box>, arrows: FlowArrowIn[], shapes: FlowShapeIn[]) {
  const { sources, hub } = blockRoles(shapes, arrows);
  const all = [...boxes.values()];
  const H = hub ? boxes.get(hub)! : all[0];
  if (!H) return;
  const GAP = 18;
  const colMembers = (c: number) => all.filter((b) => b.col === c && !sources.has(b.id) && b !== H).sort((a, b) => a.row - b.row);
  for (const dc of [-1, 1]) {
    const m = colMembers(H.col + dc);
    if (m.length < 2) continue;
    const total = m.reduce((s, b) => s + b.h, 0) + GAP * (m.length - 1);
    H.h = Math.max(H.h, total - m[0].h / 2 - m[m.length - 1].h / 2 + 30);
  }
  H.cy = 0;
  const cols = [...new Set(all.map((b) => b.col))].sort((a, b) => Math.abs(a - H.col) - Math.abs(b - H.col));
  for (const c of cols) {
    const m = colMembers(c);
    if (!m.length) continue;
    if (Math.abs(c - H.col) === 1) {
      const total = m.reduce((s, b) => s + b.h, 0) + GAP * (m.length - 1);
      let y = H.cy - total / 2;
      for (const b of m) { b.cy = y + b.h / 2; y += b.h + GAP; }
      continue;
    }
    let floor = -Infinity;
    for (const b of m) {
      const inner = c - Math.sign(c - H.col);
      const feeder = arrows.map((a) => (a.to === b.id ? a.from : a.from === b.id ? a.to : null)).map((id) => id && boxes.get(id)).find((o) => o && o.col === inner);
      b.cy = Math.max(feeder ? feeder.cy : H.cy + H.h / 2 + 40 + b.h / 2, floor + b.h / 2);
      floor = b.cy + b.h / 2 + GAP;
    }
  }
  const bottom = Math.max(...all.filter((b) => !sources.has(b.id)).map((b) => b.cy + b.h / 2));
  for (const b of all) if (sources.has(b.id)) b.cy = bottom + 52 + b.h / 2;
}

// ───────────────────────── geometría de puertos ─────────────────────────
const top = (b: Box): Pt => [b.cx, b.cy - b.h / 2];
const bottom = (b: Box): Pt => [b.cx, b.cy + b.h / 2];
const inset = (b: Box) => (b.kind === 'io' ? Math.min(14, b.h * 0.35) / 2 : 0);
const right = (b: Box, y = b.cy): Pt => [b.cx + b.w / 2 - inset(b), y];
const left = (b: Box, y = b.cy): Pt => [b.cx - b.w / 2 + inset(b), y];
const r1 = (v: number) => Math.round(v * 10) / 10;
const poly = (p: Pt[]) => p.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)},${r1(y)}`).join('');

type Route = { pts?: Pt[]; d?: string; label?: { x: number; y: number; anchor: 'start' | 'middle' | 'end'; grow?: 'up' | 'down' | 'center' } };

/** Rótulo de flecha en líneas: respeta '\n' y parte lo largo (evento && guarda / acción; acción) en ≤ 32 caracteres. */
const ARROW_WRAP = 32;
export function arrowLines(label: string): string[] {
  const out: string[] = [];
  for (const raw of label.split('\n')) {
    // "/ acción": la barra nunca queda sola en su línea.
    const piece = raw.replace(/^\/ /, '/\u00a0');
    let cur = '';
    // Cortes preferidos después de '; ', ' && ', ' || ', y si no, en cualquier espacio.
    for (const tok of piece.split(/(?<=; |&& |\|\| | )/)) {
      if (cur && (cur + tok).trimEnd().length > ARROW_WRAP) { out.push(cur.trimEnd()); cur = tok; } else cur += tok;
    }
    if (cur.trim()) out.push(cur.trimEnd());
  }
  return out.length ? out : [label];
}
const LABEL_LH = 13;
const labelW = (label: string) => Math.max(...arrowLines(label).map((l) => tw(l, LABEL)));

/** Rótulo en el tramo más largo de una ruta ortogonal. */
function midLabel(pts: Pt[], outerX?: number): Route['label'] {
  let best = 0, bi = 0;
  for (let i = 1; i < pts.length; i++) {
    const L = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
    if (L > best) { best = L; bi = i; }
  }
  const [a, b] = [pts[bi - 1], pts[bi]];
  if (Math.abs(a[1] - b[1]) < 1) return { x: (a[0] + b[0]) / 2, y: a[1] - 5, anchor: 'middle', grow: 'up' };
  // Tramo vertical: el rótulo va del lado de afuera (lejos de las formas).
  const out = outerX !== undefined && a[0] < outerX;
  return { x: a[0] + (out ? -6 : 6), y: (a[1] + b[1]) / 2 + 4, anchor: out ? 'end' : 'start', grow: 'center' };
}

export function flowLayout(shapes: FlowShapeIn[], arrows: FlowArrowIn[], opts: { mode?: string; highlight?: string[] } = {}): Frame {
  const mode = detectMode(shapes, opts.mode);
  const highlight = opts.highlight ?? [];
  const valid = arrows.filter((a) => shapes.some((s) => s.id === a.from) && shapes.some((s) => s.id === a.to));
  const cells = mode === 'fsm' ? assignFsm(shapes, valid) : mode === 'blocks' ? assignBlocks(shapes, valid) : assignFlowchart(shapes, valid);
  for (const s of shapes) if (s.x !== undefined && s.y !== undefined) cells.set(s.id, { col: s.x, row: s.y });

  const boxes = new Map<string, Box>();
  for (const s of shapes) {
    const lines = wrapLabel(s.label, WRAP[s.kind]);
    const { w, h } = size(s.kind, lines);
    const c = cells.get(s.id)!;
    boxes.set(s.id, { id: s.id, kind: s.kind, lines, w, h, col: c.col, row: c.row, cx: 0, cy: 0, state: s.state ?? (highlight.includes(s.id) ? 'active' : undefined) });
  }
  const B = (id: string) => boxes.get(id)!;

  // ── Columnas y filas → px. El hueco entre columnas se abre para los
  // rótulos de las flechas que lo cruzan.
  const colKeys = [...new Set([...boxes.values()].map((b) => b.col))].sort((a, b) => a - b);
  const rowKeys = [...new Set([...boxes.values()].map((b) => b.row))].sort((a, b) => a - b);
  const baseGapX = mode === 'flowchart' ? 56 : 72;
  const baseGapY = mode === 'flowchart' ? 34 : mode === 'fsm' ? 64 : 44;
  const colX = new Map<number, number>();
  let x = 0;
  colKeys.forEach((c, i) => {
    const w = Math.max(...[...boxes.values()].filter((b) => b.col === c).map((b) => b.w));
    if (i > 0) {
      const prev = colKeys[i - 1];
      const pw = Math.max(...[...boxes.values()].filter((b) => b.col === prev).map((b) => b.w));
      const need = Math.max(0, ...valid
        .filter((a) => a.label && [B(a.from).col, B(a.to).col].sort((p, q) => p - q).join() === [prev, c].join())
        .map((a) => labelW(a.label!) + (mode === 'fsm' ? 40 : 28)));
      x += pw / 2 + Math.max(baseGapX, need) + w / 2;
    }
    colX.set(c, x);
  });
  const rowY = new Map<number, number>();
  let y = 0;
  rowKeys.forEach((r, i) => {
    const h = Math.max(...[...boxes.values()].filter((b) => b.row === r).map((b) => b.h));
    if (i > 0) {
      const prev = rowKeys[i - 1];
      const ph = Math.max(...[...boxes.values()].filter((b) => b.row === prev).map((b) => b.h));
      // Filas fraccionarias (columnas centradas) no se separan de más.
      const step = r - prev;
      y += step >= 1 ? ph / 2 + baseGapY + h / 2 : (ph / 2 + baseGapY + h / 2) * Math.max(step, 0.5);
    }
    rowY.set(r, y);
  });
  for (const b of boxes.values()) { b.cx = colX.get(b.col)!; b.cy = rowY.get(b.row)!; }
  if (mode === 'blocks' && !shapes.every((sh) => sh.x !== undefined && sh.y !== undefined)) placeBlocks(boxes, valid, shapes);

  const all = [...boxes.values()];
  const pairs = new Set(valid.map((a) => `${a.from}>${a.to}`));

  // ── Rutas. `draw` sólo depende de la posición de las cajas: se llama una
  // vez para medir la extensión y otra ya trasladada a (MARGIN, MARGIN).
  const draw = () => {
  const extent = { l: Math.min(...all.map((b) => b.cx - b.w / 2)), r: Math.max(...all.map((b) => b.cx + b.w / 2)) };
  const leftLanes = new Map<string, number>();
  const rightLanes = new Map<string, number>();
  const lane = (m: Map<string, number>, key: string, sign: number) => {
    if (!m.has(key)) m.set(key, (sign < 0 ? extent.l : extent.r) + sign * (22 + m.size * 12));
    return m.get(key)!;
  };
  const occupied = (col: number, r0: number, r1_: number, except: string[]) =>
    all.some((b) => b.col === col && b.row > Math.min(r0, r1_) && b.row < Math.max(r0, r1_) && !except.includes(b.id));

  const routeFlowchart = (a: FlowArrowIn): Route => {
    const A = B(a.from), T = B(a.to);
    const outs = valid.filter((o) => o.from === a.from && o.to !== a.from);
    const isDec = A.kind === 'decision';
    const main = isDec ? (outs.find((o) => NO.test((o.label ?? '').trim())) ?? outs[outs.length - 1]) : outs[0];
    let exit: 'bottom' | 'right' | 'left' = !isDec || a === main ? 'bottom' : outs.filter((o) => o !== main).indexOf(a) === 1 ? 'left' : 'right';
    // Bucle dentro de una rama lateral: sube por el carril pegado a la
    // izquierda de esa columna y entra por el costado (no cruza el espinazo).
    const sideLoop = T.row < A.row && T.col === A.col && A.col > Math.min(...all.map((b) => b.col));
    if (sideLoop && isDec && exit === 'bottom' && outs.length < 3) exit = 'left';
    // Una decisión del espinazo que vuelve hacia arriba sale por la
    // izquierda: los bucles van por el carril izquierdo y las uniones hacia
    // abajo por el derecho, así no se cruzan.
    const minCol = Math.min(...all.map((b) => b.col));
    if (isDec && exit === 'right' && T.row < A.row && A.col === minCol && outs.length < 3) exit = 'left';
    const joinAbove = (from: Pt[]): Pt[] => {
      const jy = T.cy - T.h / 2 - 14;
      const last = from[from.length - 1];
      return [...from, [last[0], jy], [T.cx, jy], top(T)];
    };
    if (a.from === a.to) {
      const p = right(A);
      return { d: `M${r1(p[0])},${r1(p[1] - 6)}h18v12h-16` };
    }
    // Rótulo de salida de decisión (V/F) pegado al vértice.
    const exitLabel = (p: Pt): Route['label'] =>
      exit === 'bottom' ? { x: p[0] + 7, y: p[1] + 13, anchor: 'start' } : exit === 'right' ? { x: p[0] + 7, y: p[1] - 6, anchor: 'start' } : { x: p[0] - 7, y: p[1] - 6, anchor: 'end' };
    let pts: Pt[];
    const start: Pt = exit === 'bottom' ? bottom(A) : exit === 'right' ? right(A) : left(A);
    if (T.row > A.row && T.col === A.col && !occupied(A.col, A.row, T.row, [A.id, T.id]) && exit === 'bottom') {
      pts = [start, top(T)];
    } else if (T.row === A.row && T.col !== A.col) {
      pts = T.col > A.col ? [right(A), left(T)] : [left(A), right(T)];
    } else if (T.row > A.row) {
      if (T.col < A.col || T.col === A.col) {
        // Rama lateral que vuelve al espinazo más abajo: sale por la
        // derecha, baja por un carril y entra al destino por la derecha.
        const lx = lane(rightLanes, `to-${T.id}`, 1);
        const s = exit === 'bottom' ? right(A) : start;
        pts = [s, [lx, s[1]], [lx, T.cy], right(T)];
      } else {
        pts = [start, [T.cx, start[1]], top(T)];
        if (exit === 'bottom') pts = [start, [start[0], (start[1] + T.cy - T.h / 2) / 2], [T.cx, (start[1] + T.cy - T.h / 2) / 2], top(T)];
      }
    } else if (sideLoop && exit !== 'right') {
      const lx = Math.min(...all.filter((b) => b.col === A.col).map((b) => b.cx - b.w / 2)) - 18;
      const s: Pt[] = exit === 'left' ? [left(A)] : [bottom(A), [A.cx, A.cy + A.h / 2 + 12]];
      pts = [...s, [lx, s[s.length - 1][1]], [lx, T.cy], left(T)];
    } else {
      // Retorno (bucle) a una fila anterior: nunca a través de las formas.
      if (exit === 'left' && A.col === minCol) {
        const lx = lane(leftLanes, `to-${T.id}`, -1);
        pts = joinAbove([left(A), [lx, A.cy]]);
      } else if (exit === 'bottom' && A.col <= T.col) {
        const lx = lane(leftLanes, `to-${T.id}`, -1);
        const b = bottom(A);
        pts = joinAbove([b, [b[0], b[1] + 14], [lx, b[1] + 14]]);
      } else if (A.col > T.col && !occupied(A.col, T.row - 1, A.row, [A.id])) {
        pts = joinAbove([top(A)]);
      } else {
        const lx = lane(rightLanes, `up-${T.id}`, 1);
        const s = exit === 'left' ? left(A) : right(A);
        pts = joinAbove([s, [lx, s[1]]]);
      }
    }
    const label = a.label ? (isDec ? exitLabel(pts[0]) : midLabel(pts, (extent.l + extent.r) / 2)) : undefined;
    return { pts, label };
  };

  const circleAt = (b: Box, ux: number, uy: number, off = 0): Pt => {
    const r = b.w / 2;
    const t = Math.sqrt(Math.max(0, r * r - off * off));
    return [b.cx + ux * t - uy * off, b.cy + uy * t + ux * off];
  };
  const routeFsm = (a: FlowArrowIn): Route => {
    const A = B(a.from), T = B(a.to);
    const r = A.w / 2;
    if (a.from === a.to) {
      // Varios bucles en un estado: el 1.º arriba, el 2.º abajo, el 3.º más arriba…
      const k = valid.filter((o) => o.from === a.from && o.to === a.from).indexOf(a);
      // El primer bucle apunta hacia afuera del diagrama: arriba en la fila de arriba, abajo en la de abajo.
      const midY = (Math.min(...all.map((b) => b.cy)) + Math.max(...all.map((b) => b.cy))) / 2;
      const away = A.cy > midY + 1 ? -1 : 1;
      // 1.º afuera en vertical, 2.º hacia el costado de afuera, 3.º y 4.º los opuestos.
      const outX = A.cx < (extent.l + extent.r) / 2 - 1 ? -1 : 1;
      const slot = k % 4;
      if (slot === 1 || slot === 3) {
        const sx = slot === 1 ? outX : -outX, h = 44 + 28 * Math.floor(k / 4);
        const p1: Pt = [A.cx + sx * r * 0.87, A.cy - r * 0.5], p2: Pt = [A.cx + sx * r * 0.87, A.cy + r * 0.5];
        return {
          d: `M${r1(p1[0])},${r1(p1[1])}C${r1(p1[0] + sx * h)},${r1(p1[1] - 22)} ${r1(p2[0] + sx * h)},${r1(p2[1] + 22)} ${r1(p2[0])},${r1(p2[1])}`,
          label: { x: A.cx + sx * (r * 0.87 + h * 0.75 + 8), y: A.cy + 4, anchor: sx > 0 ? 'start' : 'end', grow: 'center' },
        };
      }
      const sg = (slot === 2 ? -1 : 1) * away, h = 44 + 28 * Math.floor(k / 4);
      const p1: Pt = [A.cx - r * 0.5, A.cy - sg * r * 0.87], p2: Pt = [A.cx + r * 0.5, A.cy - sg * r * 0.87];
      return { d: `M${r1(p1[0])},${r1(p1[1])}C${r1(p1[0] - 22)},${r1(p1[1] - sg * h)} ${r1(p2[0] + 22)},${r1(p2[1] - sg * h)} ${r1(p2[0])},${r1(p2[1])}`, label: { x: A.cx, y: A.cy - sg * (r + h - 6) + (sg < 0 ? 12 : 0), anchor: 'middle', grow: sg > 0 ? 'up' : 'down' } };
    }
    const dx = T.cx - A.cx, dy = T.cy - A.cy, L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    const between = all.some((o) => o !== A && o !== T && Math.abs((o.cx - A.cx) * uy - (o.cy - A.cy) * ux) < o.w / 2 + 6 && ((o.cx - A.cx) * ux + (o.cy - A.cy) * uy) > 0 && ((o.cx - A.cx) * ux + (o.cy - A.cy) * uy) < L);
    if (!between) {
      const off = pairs.has(`${a.to}>${a.from}`) ? 8 : 0;
      const p = circleAt(A, ux, uy, off), q = circleAt(T, -ux, -uy, -off);
      const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      const horiz = Math.abs(uy) < 0.35;
      // Par ida/vuelta: cada flecha se corre hacia su normal (-uy, ux) y su
      // rótulo va de ESE lado, así ninguno pisa la otra flecha.
      // Sin par: el rótulo de un tramo vertical va hacia AFUERA del diagrama.
      const outward = (A.cx + T.cx) / 2 < (extent.l + extent.r) / 2 ? -1 : 1;
      const nx = off ? -uy : horiz ? 0 : outward, ny = off ? ux : -1;
      return {
        pts: [p, q],
        label: horiz ? { x: mx, y: ny > 0 ? my + 15 : my - 7, anchor: 'middle', grow: ny > 0 ? 'down' : 'up' } : { x: mx + (nx > 0 ? 8 : -8), y: my + 4, anchor: nx > 0 ? 'start' : 'end', grow: 'center' },
      };
    }
    // Arco por debajo (o por arriba si va hacia la derecha) sin cruzar estados.
    const downward = dx < 0;
    const sgn = downward ? 1 : -1;
    const p: Pt = [A.cx + (downward ? -0.5 : 0.5) * r, A.cy + sgn * 0.87 * r];
    const q: Pt = [T.cx + (downward ? 0.5 : -0.5) * (T.w / 2), T.cy + sgn * 0.87 * (T.w / 2)];
    const depth = 36 + Math.abs(dx) * 0.18;
    const cy = (downward ? Math.max(A.cy + A.h / 2, T.cy + T.h / 2) : Math.min(A.cy - A.h / 2, T.cy - T.h / 2)) + sgn * depth * 2 - sgn * 0.87 * r;
    const cx = (p[0] + q[0]) / 2;
    const apex = 0.25 * p[1] + 0.5 * cy + 0.25 * q[1];
    return { d: `M${r1(p[0])},${r1(p[1])}Q${r1(cx)},${r1(cy)} ${r1(q[0])},${r1(q[1])}`, label: { x: cx, y: downward ? apex + 14 : apex - 6, anchor: 'middle', grow: downward ? 'down' : 'up' } };
  };

  const routeBlocks = (a: FlowArrowIn): Route => {
    const A = B(a.from), T = B(a.to);
    const ovY = [Math.max(A.cy - A.h / 2, T.cy - T.h / 2) + 8, Math.min(A.cy + A.h / 2, T.cy + T.h / 2) - 8];
    const ovX = [Math.max(A.cx - A.w / 2, T.cx - T.w / 2) + 10, Math.min(A.cx + A.w / 2, T.cx + T.w / 2) - 10];
    let pts: Pt[];
    if (ovY[0] <= ovY[1] && T.col !== A.col) {
      const yy = Math.min(Math.max(A.cy, ovY[0]), ovY[1]);
      const yl = Math.min(Math.max(T.cy, ovY[0]), ovY[1]);
      const y0 = A.h <= T.h ? yy : yl;
      pts = T.cx > A.cx ? [right(A, y0), left(T, y0)] : [left(A, y0), right(T, y0)];
    } else if (ovX[0] <= ovX[1]) {
      const x0 = Math.min(Math.max(A.w <= T.w ? A.cx : T.cx, ovX[0]), ovX[1]);
      pts = T.cy > A.cy ? [[x0, A.cy + A.h / 2], [x0, T.cy - T.h / 2]] : [[x0, A.cy - A.h / 2], [x0, T.cy + T.h / 2]];
    } else {
      // Codo en L: sale de frente hacia el destino y entra por arriba/abajo.
      const s = T.cx > A.cx ? right(A) : left(A);
      pts = [s, [T.cx, s[1]], T.cy > A.cy ? top(T) : bottom(T)];
    }
    return { pts, label: a.label ? midLabel(pts, (extent.l + extent.r) / 2) : undefined };
  };

  const paths: CanvasPath[] = [];
  const annotations: CanvasText[] = [];
  const pts: Pt[] = all.flatMap((b) => [[b.cx - b.w / 2, b.cy - b.h / 2], [b.cx + b.w / 2, b.cy + b.h / 2]] as Pt[]);

  valid.forEach((a, k) => {
    const route = mode === 'fsm' ? routeFsm(a) : mode === 'blocks' ? routeBlocks(a) : routeFlowchart(a);
    const d = route.d ?? poly(route.pts!);
    const state = a.state === 'idle' ? undefined : a.state;
    const power = a.kind === 'power';
    paths.push({ id: `a-${a.from}-${a.to}-${k}`, d, arrow: true, width: (power ? 3 : 1.5) + (state === 'active' ? 0.5 : 0), state });
    if (route.pts) pts.push(...route.pts);
    if (a.label && route.label) {
      const l = route.label;
      const lines = arrowLines(a.label);
      const n = lines.length;
      lines.forEach((text, j) => {
        const y = l.grow === 'down' ? l.y + j * LABEL_LH : l.grow === 'center' ? l.y + (j - (n - 1) / 2) * LABEL_LH : l.y - (n - 1 - j) * LABEL_LH;
        annotations.push({
          id: `al-${a.from}-${a.to}-${k}${j ? `-${j}` : ''}`, text, x: l.x, y, anchor: l.anchor, size: LABEL, weight: 600, bg: true,
          color: state === 'active' ? 'var(--accent)' : state === 'muted' ? 'var(--faint)' : 'var(--ink)',
        });
        const w = tw(text, LABEL);
        const x0 = l.anchor === 'middle' ? l.x - w / 2 : l.anchor === 'end' ? l.x - w : l.x;
        pts.push([x0 - 4, y - 12], [x0 + w + 4, y + 4]);
      });
    }
  });

  // Flecha de estado inicial (FSM): punto negro → estado.
  for (const s of shapes) {
    if (!s.initial) continue;
    const b = B(s.id);
    const p: Pt = [b.cx - b.w / 2 - 30, b.cy];
    paths.push({ id: `init-dot-${s.id}`, d: `M${p[0] - 4},${p[1]}a4,4 0 1,0 8,0a4,4 0 1,0 -8,0`, fill: true, opacity: 1 });
    paths.push({ id: `init-${s.id}`, d: `M${p[0]},${p[1]}H${b.cx - b.w / 2}`, arrow: true, width: 1.5 });
    pts.push([p[0] - 6, p[1]]);
  }
  // Self-loops / arcos: su caja aproximada entra en la extensión.
  for (const p of paths) {
    for (const seg of p.d.matchAll(/([MLQC])([^A-Za-z]*)/g)) {
      const v = seg[2].trim().split(/[\s,]+/).map(Number);
      // El control de una Q queda al doble de la flecha real: sólo su extremo cuenta.
      for (let i = seg[1] === 'Q' ? 2 : 0; i + 1 < v.length; i += 2) pts.push([v[i], v[i + 1]]);
    }
  }

  return { paths, annotations, pts };
  };

  let { pts } = draw();
  const dx = MARGIN - Math.min(...pts.map((p) => p[0]));
  const dy = MARGIN - Math.min(...pts.map((p) => p[1]));
  for (const b of all) { b.cx += dx; b.cy += dy; }
  const out = draw();
  pts = out.pts;
  const { paths, annotations } = out;
  const width = Math.ceil(Math.max(...pts.map((p) => p[0])) + MARGIN);
  let height = Math.ceil(Math.max(...pts.map((p) => p[1])) + MARGIN);
  if (valid.some((a) => a.kind === 'power')) {
    // Leyenda: la potencia se distingue por el grosor del trazo.
    const ly = height + 2;
    paths.push({ id: 'legend-power', d: `M${MARGIN},${ly}h26`, width: 3 });
    paths.push({ id: 'legend-data', d: `M${MARGIN + 110},${ly}h26`, width: 1.5 });
    annotations.push({ id: 'legend-power-l', text: 'potencia', x: MARGIN + 32, y: ly + 4, size: 10.5 });
    annotations.push({ id: 'legend-data-l', text: 'datos/control', x: MARGIN + 142, y: ly + 4, size: 10.5 });
    height += 22;
  }
  const nodes: CanvasNode[] = all.map((b) => ({
    id: b.id, label: b.lines.join('\n'), lines: b.lines, shape: SHAPE[b.kind], x: b.cx, y: b.cy, w: b.w, h: b.h, state: b.state,
  }));
  return { nodes, edges: [], groups: [], paths, annotations, width, height };
}
/** Lo que aún choca, por paso: rótulos de flecha entre sí, sobre formas, o un diagrama
 * tan ancho que en una columna de lectura (~720 px) el texto quedaría ilegible. */
export function flowIssues(steps: { shapes?: FlowShapeIn[]; arrows?: FlowArrowIn[]; mode?: string; highlight?: string[] }[]): string[][] {
  return steps.map((st) => {
    const f = flowLayout(st.shapes ?? [], st.arrows ?? [], { mode: st.mode, highlight: st.highlight });
    const out: string[] = [];
    const box = (a: CanvasText) => {
      const w = tw(a.text, a.size ?? 12);
      const x0 = a.anchor === 'middle' ? a.x - w / 2 : a.anchor === 'end' ? a.x - w : a.x;
      return { x: x0, y: a.y - (a.size ?? 12) * 0.8, w, h: (a.size ?? 12) * 1.05 };
    };
    const labs = f.annotations.filter((a) => a.id.startsWith('al-')).map((a) => ({ a, r: box(a) }));
    const hit = (p: { x: number; y: number; w: number; h: number }, q: { x: number; y: number; w: number; h: number }) => {
      const w = Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x), h = Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y);
      return w > 1 && h > 1;
    };
    labs.forEach((l, i) => {
      for (const o of labs.slice(i + 1)) if (hit(l.r, o.r)) out.push(`rótulo «${l.a.text}» pisa «${o.a.text}»`);
      for (const n of f.nodes) {
        const w = n.w ?? 40, h = n.h ?? 30;
        // Estados (círculos): distancia del rectángulo del rótulo al centro.
        if (n.shape === 'circle') {
          const cx = Math.max(l.r.x, Math.min(n.x, l.r.x + l.r.w)), cy = Math.max(l.r.y, Math.min(n.y, l.r.y + l.r.h));
          if (Math.hypot(cx - n.x, cy - n.y) < w / 2 - 1) out.push(`rótulo «${l.a.text}» pisa el estado «${n.label.replace(/\n/g, ' ')}»`);
        } else if (hit(l.r, { x: n.x - w / 2, y: n.y - h / 2, w, h })) out.push(`rótulo «${l.a.text}» pisa «${n.label.replace(/\n/g, ' ')}»`);
      }
    });
    if ((f.width ?? 0) > 1100) out.push(`diagrama de ${f.width} px de ancho: en pantalla el texto queda diminuto`);
    return out;
  });
}
