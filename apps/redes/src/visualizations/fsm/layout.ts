// Layout puro de `fsm`: máquinas de estados al estilo de las slides (Kurose).
// Estados como elipses a la medida de su rótulo; transiciones con tarjeta
// EVENTO / ACCIÓN; ida y vuelta entre el mismo par como dos arcos; bucles
// repartidos alrededor del estado. Colocación automática (fila de 2–3,
// cuadrado de 4 en el orden del ciclo) que se ESPACIA sola hasta que nada
// choca. `fsmIssues` lista lo que aún choca (auditor de solapes). Sin React.
import type { NodeState } from '../canvas-types.ts';
import { r2, textW } from '../net-style.ts';
import { grow, overlapArea, polyHitsRect, quadAt, union, type Pt, type Rect } from '../geom.ts';

export type FsmState = { id: string; label: string; initial?: boolean; final?: boolean; x?: number; y?: number; state?: NodeState };
export type FsmTransition = { from: string; to: string; event: string; action?: string; state?: NodeState; bend?: number };
export type FsmStep = { states?: FsmState[]; transitions?: FsmTransition[] };

const EV = 11, AC = 10.5, ST = 12.5;
const LH_EV = 14, LH_AC = 13.5, LH_ST = 15;
const PAD = 7;
const MARGIN = 14;

export type StateL = FsmState & { cx: number; cy: number; rx: number; ry: number; lines: string[]; fs: number; lh: number };
export type Card = Rect & { ev: string[]; ac: string[]; fsEv: number; fsAc: number; lhEv: number; lhAc: number; rule: number };
export type EdgeL = {
  id: string;
  from: string;
  to: string;
  state?: NodeState;
  loop: boolean;
  d: string;
  /** Muestras del trazo (para choques y para el viaje de la ficha). */
  pts: Pt[];
  head: { x: number; y: number; angle: number };
  card: Card;
};
export type FsmFrame = { k: number; width: number; height: number; states: StateL[]; edges: EdgeL[]; init: { from: Pt; to: Pt }[] };

/** Rótulo en líneas de ≤ max caracteres, cortando de preferencia tras "&&", "||", ";" o ",". */
export function wrapCode(text: string, max: number): string[] {
  const out: string[] = [];
  for (const piece of text.split('\n')) {
    let cur = '';
    // Primero trozos entre cortes preferidos ("ACK 1" no queda partido); un trozo
    // más largo que la línea se parte en espacios.
    const chunks = piece.split(/(?<=&& |\|\| |; |, )/).flatMap((c) => (c.trimEnd().length > max ? c.split(/(?<= )/) : [c]));
    for (const tok of chunks) {
      if (cur && (cur + tok).trimEnd().length > max) { out.push(cur.trimEnd()); cur = tok; } else cur += tok;
    }
    if (cur.trim()) out.push(cur.trimEnd());
  }
  return out.length ? out : [''];
}

function wrapWords(text: string, max: number): string[] {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) out.push(cur);
  return out;
}

function cardOf(t: FsmTransition, k: number): Omit<Card, 'x' | 'y'> {
  const max = k > 1 ? 19 : 28;
  const ev = wrapCode(t.event, max);
  const ac = wrapCode(t.action && t.action.trim() ? t.action : 'Λ', max);
  const fsEv = EV * k, fsAc = AC * k, lhEv = LH_EV * k, lhAc = LH_AC * k;
  const w = Math.max(...ev.map((l) => textW(l, fsEv)), ...ac.map((l) => textW(l, fsAc))) + 2 * PAD;
  const rule = PAD + ev.length * lhEv + 2;
  const h = rule + 5 + ac.length * lhAc + PAD - 3;
  return { w, h, ev, ac, fsEv, fsAc, lhEv, lhAc, rule };
}

// ── Elipse: punto en el parámetro φ y prueba de pertenencia.
const onEllipse = (s: StateL, phi: number, g = 0): Pt => ({ x: s.cx + (s.rx + g) * Math.cos(phi), y: s.cy + (s.ry + g) * Math.sin(phi) });
const insideE = (s: StateL, p: Pt, g = 2) => ((p.x - s.cx) / (s.rx + g)) ** 2 + ((p.y - s.cy) / (s.ry + g)) ** 2 < 1;
const ebox = (s: StateL, g = 0): Rect => ({ x: s.cx - s.rx - g, y: s.cy - s.ry - g, w: 2 * (s.rx + g), h: 2 * (s.ry + g) });
/** ¿La polilínea entra en la elipse (encogida `g`)? */
const polyInE = (pts: Pt[], s: StateL, g = 3) => pts.some((p) => ((p.x - s.cx) / (s.rx - g)) ** 2 + ((p.y - s.cy) / (s.ry - g)) ** 2 < 1);
const cubicAt = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const u = 1 - t;
  return { x: u ** 3 * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t ** 3 * d.x, y: u ** 3 * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t ** 3 * d.y };
};
const P = (p: Pt): Pt => ({ x: r2(p.x), y: r2(p.y) });
const deg = (v: Pt) => r2((Math.atan2(v.y, v.x) * 180) / Math.PI);
const rectHit = (a: Rect, b: Rect) => overlapArea(a, b) > 2;
/** Costos redondeados: un empate no puede depender del último bit de Math.cos (SSR ≠ navegador). */
const q3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) : v);

/** Rejilla automática: 1–3 en fila, 4 en cuadrado siguiendo el ciclo desde el inicial, más en dos filas. */
function autoGrid(states: FsmState[], trans: FsmTransition[], vertical = false): Map<string, { c: number; r: number }> {
  const start = states.find((s) => s.initial) ?? states[0];
  const order: string[] = [];
  const q = start ? [start.id] : [];
  while (q.length) {
    const u = q.shift()!;
    if (order.includes(u)) continue;
    order.push(u);
    for (const t of trans) if (t.from === u && t.to !== u && !order.includes(t.to)) q.push(t.to);
  }
  for (const s of states) if (!order.includes(s.id)) order.push(s.id);
  const n = order.length;
  const pos = new Map<string, { c: number; r: number }>();
  // Móvil: 2–3 estados en columna (la figura queda alta y angosta, legible en 375 px).
  if (n <= 3 || (vertical && n <= 4)) order.forEach((id, i) => pos.set(id, vertical ? { c: 0, r: i } : { c: i, r: 0 }));
  else {
    const half = Math.ceil(n / 2);
    // Serpiente: ida arriba (izq→der), vuelta abajo (der→izq): el ciclo queda como en las slides.
    order.forEach((id, i) => pos.set(id, i < half ? { c: i, r: 0 } : { c: n - 1 - i, r: 1 }));
  }
  return pos;
}

function build(step: FsmStep, k: number, spread: number): FsmFrame {
  const specS = step.states ?? [];
  const specT = (step.transitions ?? []).filter((t) => specS.some((s) => s.id === t.from) && specS.some((s) => s.id === t.to));
  const grid = autoGrid(specS, specT, k > 1);
  const cards = specT.map((t) => cardOf(t, k));
  const wide = Math.max(140, ...cards.map((c) => c.w));
  const tall = Math.max(60, ...cards.map((c) => c.h));
  const gx = (wide + 150) * spread, gy = (tall + 90) * spread;
  const states: StateL[] = specS.map((s) => {
    const fs = ST * k, lh = LH_ST * k;
    const lines = wrapWords(s.label, k > 1 ? 11 : 13);
    const tw = Math.max(...lines.map((l) => textW(l, fs, false)));
    const rx = Math.max(44 * k, tw / 2 + 18), ry = Math.max(26 * k, (lines.length * lh) / 2 + 13);
    const g = grid.get(s.id)!;
    const cx = s.x !== undefined ? (s.x / 100) * gx * 3 : g.c * gx;
    const cy = s.y !== undefined ? (s.y / 100) * gy * 2 : g.r * gy;
    return { ...s, cx, cy, rx, ry, lines, fs, lh };
  });
  const byId = new Map(states.map((s) => [s.id, s]));
  const centroid = { x: states.reduce((a, s) => a + s.cx, 0) / (states.length || 1), y: states.reduce((a, s) => a + s.cy, 0) / (states.length || 1) };

  const edges: EdgeL[] = [];
  const placedCards: Rect[] = [];
  const allPolys: Pt[][] = [];
  const sameDir = new Map<string, number>();

  // ── Transiciones entre estados distintos.
  specT.forEach((t, idx) => {
    if (t.from === t.to) return;
    const A = byId.get(t.from)!, B = byId.get(t.to)!;
    const key = `${t.from}>${t.to}`;
    const nth = sameDir.get(key) ?? 0;
    sameDir.set(key, nth + 1);
    const dx = B.cx - A.cx, dy = B.cy - A.cy, L = Math.hypot(dx, dy) || 1;
    const u = { x: dx / L, y: dy / L };
    const n = { x: u.y, y: -u.x }; // izquierda del sentido (y hacia abajo)
    const back = specT.some((o) => o.from === t.to && o.to === t.from);
    const through = states.some((s) => s !== A && s !== B && polyInE([0.25, 0.5, 0.75].map((f) => ({ x: A.cx + dx * f, y: A.cy + dy * f })), s, -6));
    const bend = t.bend ?? (back || through || nth ? 0.32 + 0.18 * nth : 0);
    const mid = { x: (A.cx + B.cx) / 2, y: (A.cy + B.cy) / 2 };
    const c = { x: mid.x + n.x * bend * L, y: mid.y + n.y * bend * L };
    const samples = Array.from({ length: 81 }, (_, i) => quadAt({ x: A.cx, y: A.cy }, c, { x: B.cx, y: B.cy }, i / 80));
    const t0 = samples.findIndex((p) => !insideE(A, p, 3));
    let t1 = samples.length - 1;
    while (t1 > 0 && insideE(B, samples[t1], 3)) t1--;
    const pts = samples.slice(Math.max(0, t0), t1 + 1).map(P);
    const end = pts[pts.length - 1], pre = pts[Math.max(0, pts.length - 4)];
    // Tarjeta en el vértice del arco, del lado de la curva; recta: del lado opuesto al centro.
    const apex = quadAt({ x: A.cx, y: A.cy }, c, { x: B.cx, y: B.cy }, 0.5);
    const toC = { x: centroid.x - apex.x, y: centroid.y - apex.y };
    const side = bend ? Math.sign(bend) : n.x * toC.x + n.y * toC.y > 0 ? -1 : 1;
    const base = cards[idx];
    let best: Card | undefined, bestCost = Infinity;
    for (const sd of [side, -side])
      for (const along of [0, -0.12, 0.12, -0.24, 0.24]) {
        const q = quadAt({ x: A.cx, y: A.cy }, c, { x: B.cx, y: B.cy }, 0.5 + along);
        const nn = { x: n.x * sd, y: n.y * sd };
        const off = Math.min(Math.abs(nn.x) > 0.01 ? base.w / 2 / Math.abs(nn.x) : Infinity, Math.abs(nn.y) > 0.01 ? base.h / 2 / Math.abs(nn.y) : Infinity) + 6;
        const card = { ...base, x: q.x + nn.x * off - base.w / 2, y: q.y + nn.y * off - base.h / 2 };
        const cost = placedCards.filter((r) => rectHit(r, card)).length * 10 + states.filter((s) => rectHit(ebox(s, 4), card)).length * 10 + allPolys.filter((pl) => polyHitsRect(pl, grow(card, 2))).length * 5 + (sd !== side ? 1 : 0) + Math.abs(along) * 4;
        if (q3(cost) < q3(bestCost)) { bestCost = cost; best = card; }
      }
    placedCards.push(best!);
    allPolys.push(pts);
    edges.push({ id: `t-${t.from}-${t.to}-${nth}`, from: t.from, to: t.to, state: t.state, loop: false, d: `M${pts[0].x},${pts[0].y}` + pts.slice(1).map((p) => `L${p.x},${p.y}`).join(''), pts, head: { ...end, angle: deg({ x: end.x - pre.x, y: end.y - pre.y }) }, card: best! });
  });

  // ── Bucles: el ángulo libre más alejado de las demás flechas del estado y del centro del diagrama.
  const loopsAt = new Map<string, number[]>();
  specT.forEach((t, idx) => {
    if (t.from !== t.to) return;
    const S = byId.get(t.from)!;
    const used = loopsAt.get(S.id) ?? [];
    const dirs = edges.filter((e) => !e.loop && (e.from === S.id || e.to === S.id)).map((e) => {
      const p = e.from === S.id ? e.pts[Math.min(6, e.pts.length - 1)] : e.pts[Math.max(0, e.pts.length - 7)];
      return Math.atan2(p.y - S.cy, p.x - S.cx);
    });
    const toCenter = Math.atan2(centroid.y - S.cy, centroid.x - S.cx);
    const angDist = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    const base = cards[idx];
    let best: { card: Card; pts: Pt[]; d: string; head: EdgeL['head']; th: number } | undefined, bestCost = Infinity;
    for (let j = 0; j < 8; j++) {
      const th = -Math.PI / 2 + (j * Math.PI) / 4;
      const spread_ = 0.42, Lc = 72;
      const p1 = onEllipse(S, th - spread_), p2 = onEllipse(S, th + spread_);
      const dir = (a: number) => ({ x: Math.cos(a), y: Math.sin(a) });
      const c1 = { x: p1.x + dir(th - 0.55).x * Lc, y: p1.y + dir(th - 0.55).y * Lc };
      const c2 = { x: p2.x + dir(th + 0.55).x * Lc, y: p2.y + dir(th + 0.55).y * Lc };
      const pts = Array.from({ length: 25 }, (_, i) => P(cubicAt(p1, c1, c2, p2, i / 24)));
      const apex = pts[12];
      const v = dir(th);
      // Pegada al vértice del bucle: la distancia mínima para que la tarjeta no lo tape.
      const off = Math.min(Math.abs(v.x) > 0.01 ? base.w / 2 / Math.abs(v.x) : Infinity, Math.abs(v.y) > 0.01 ? base.h / 2 / Math.abs(v.y) : Infinity) + 5;
      const card = { ...base, x: apex.x + v.x * off - base.w / 2, y: apex.y + v.y * off - base.h / 2 };
      const near = Math.min(Math.PI, ...dirs.map((a) => angDist(a, th)), ...used.map((a) => angDist(a, th)));
      const cost =
        placedCards.filter((r) => rectHit(r, card)).length * 30 +
        states.filter((s) => rectHit(ebox(s, 4), card)).length * 30 +
        states.filter((s) => s !== S && polyInE(pts, s, -2)).length * 30 +
        allPolys.filter((pl) => polyHitsRect(pl, grow(card, 2)) || pl.some((p) => polyHitsRect(pts, rectAround(p, 2)))).length * 12 +
        (near < 0.5 ? 25 : near < 0.9 ? 6 : 0) +
        (Math.PI - angDist(th, toCenter)) * 1.5 +
        (Math.abs(Math.sin(th)) < 0.2 ? 1.2 : 0); // un poco preferidos: arriba/abajo/diagonales
      if (q3(cost) < q3(bestCost)) {
        bestCost = cost;
        const pre = pts[pts.length - 4], end = pts[pts.length - 1];
        best = { card, pts, th, d: `M${P(p1).x},${P(p1).y}C${r2(c1.x)},${r2(c1.y)} ${r2(c2.x)},${r2(c2.y)} ${P(p2).x},${P(p2).y}`, head: { ...end, angle: deg({ x: end.x - pre.x, y: end.y - pre.y }) } };
      }
    }
    used.push(best!.th);
    loopsAt.set(S.id, used);
    placedCards.push(best!.card);
    allPolys.push(best!.pts);
    edges.push({ id: `l-${t.from}-${used.length - 1}`, from: t.from, to: t.to, state: t.state, loop: true, d: best!.d, pts: best!.pts, head: best!.head, card: best!.card });
  });

  // ── Entrada del estado inicial: punto y flecha punteada desde el lado libre.
  const init = states.filter((s) => s.initial).map((s) => {
    const cands = [Math.PI, -Math.PI / 2, Math.PI / 2, 0, (-3 * Math.PI) / 4, (3 * Math.PI) / 4];
    let pick = cands[0];
    for (const a of cands) {
      const from = onEllipse(s, a, 36), to = onEllipse(s, a, 3);
      const seg = [from, { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }, to];
      if (!placedCards.some((r) => polyHitsRect(seg, grow(r, 3))) && !allPolys.some((pl) => pl.some((p) => polyHitsRect(seg, rectAround(p, 3))))) { pick = a; break; }
    }
    return { from: P(onEllipse(s, pick, 36)), to: P(onEllipse(s, pick, 3)) };
  });

  // ── Encuadre: todo a partir de (MARGIN, MARGIN).
  const boxes = [...states.map((s) => ebox(s, 6)), ...edges.map((e) => e.card as Rect), ...edges.flatMap((e) => e.pts.map((p) => rectAround(p, 3))), ...init.map((x) => rectAround(x.from, 6))];
  const bb = union(boxes.length ? boxes : [{ x: 0, y: 0, w: 100, h: 60 }]);
  const ox = MARGIN - bb.x, oy = MARGIN - bb.y;
  const mv = (p: Pt): Pt => P({ x: p.x + ox, y: p.y + oy });
  for (const s of states) { s.cx = r2(s.cx + ox); s.cy = r2(s.cy + oy); }
  for (const e of edges) {
    e.pts = e.pts.map(mv);
    e.d = e.d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, x, y) => `${r2(+x + ox)},${r2(+y + oy)}`);
    e.head = { ...mv(e.head), angle: e.head.angle };
    e.card = { ...e.card, x: r2(e.card.x + ox), y: r2(e.card.y + oy) };
  }
  const initL = init.map((x) => ({ from: mv(x.from), to: mv(x.to) }));
  return { k, width: Math.ceil(bb.w + 2 * MARGIN), height: Math.ceil(bb.h + 2 * MARGIN), states, edges, init: initL };
}

const rectAround = (p: Pt, r: number): Rect => ({ x: p.x - r, y: p.y - r, w: 2 * r, h: 2 * r });

/** Espaciado creciente hasta que no quede ningún choque (o el que menos tenga). */
export function fsmLayout(step: FsmStep, k = 1): FsmFrame {
  let best: FsmFrame | undefined, bestN = Infinity;
  for (const spread of [0.7, 0.8, 0.9, 1, 1.15, 1.3, 1.5, 1.75]) {
    const f = build(step, k, spread);
    const n = fsmFrameIssues(f).length;
    if (n < bestN) { bestN = n; best = f; }
    if (!n) break;
  }
  return best!;
}

/** Lo que choca en un fotograma: tarjetas, estados, flechas y bucles. */
export function fsmFrameIssues(f: FsmFrame): string[] {
  const out: string[] = [];
  const name = (e: EdgeL) => `«${e.card.ev[0]}»`;
  f.edges.forEach((e, i) => {
    for (const o of f.edges.slice(i + 1)) if (rectHit(e.card, o.card)) out.push(`tarjeta ${name(e)} pisa tarjeta ${name(o)}`);
    for (const s of f.states) if (rectHit(ebox(s, 2), e.card)) out.push(`tarjeta ${name(e)} pisa el estado «${s.label}»`);
    for (const o of f.edges) if (o !== e && polyHitsRect(o.pts, grow(e.card, -1))) out.push(`la flecha ${name(o)} cruza la tarjeta ${name(e)}`);
    for (const s of f.states) if (s.id !== e.from && s.id !== e.to && polyInE(e.pts, s)) out.push(`la flecha ${name(e)} atraviesa el estado «${s.label}»`);
    if (e.loop) for (const o of f.edges.slice(i + 1)) if (o.loop && o.from === e.from && o.pts.some((p) => polyHitsRect(e.pts, rectAround(p, 1.5)))) out.push(`bucles ${name(e)} y ${name(o)} se cruzan`);
  });
  for (let i = 0; i < f.states.length; i++) for (let j = i + 1; j < f.states.length; j++) if (rectHit(ebox(f.states[i], 6), ebox(f.states[j], 6))) out.push(`estados «${f.states[i].label}» y «${f.states[j].label}» se pisan`);
  for (const x of f.init) for (const e of f.edges) if (polyHitsRect([x.from, x.to], grow(e.card, 1))) out.push(`la entrada inicial cruza la tarjeta ${name(e)}`);
  return out;
}

/** Por paso, en escritorio y en móvil (texto ×1.25). */
export function fsmIssues(steps: FsmStep[]): string[][] {
  return steps.map((s) => [...fsmFrameIssues(fsmLayout(s)), ...fsmFrameIssues(fsmLayout(s, 1.25)).map((m) => `[móvil] ${m}`)]);
}
