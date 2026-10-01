// Layout puro de `spacetime`: columnas verticales (emisor, routers, receptor),
// tiempo hacia abajo con escala REAL. Un envío de datos es un paralelogramo:
// grosor vertical = tTrans, pendiente = tProp. ACK/control: línea fina.
import type { NodeState } from '../canvas-types.ts';
import { fmtNum, r2, textW } from '../net-style.ts';
import { obox, oOverlap, type OBox } from '../geom.ts';

export type StColumn = { id: string; label: string };
export type StTime = { unit?: string; max: number; ticks?: number[] };
export type StSend = { from: string; to: string; tStart: number; tTrans?: number; tProp: number; label?: string; kind?: 'data' | 'ack' | 'ctrl'; lost?: boolean; state?: NodeState };
export type StSpan = { column: string; tStart: number; tEnd: number; label: string; kind?: 'rtt' | 'timeout' | 'trans' | 'prop' | 'queue'; state?: NodeState };
export type StStep = { columns?: StColumn[]; time?: StTime; sends?: StSend[]; spans?: StSpan[] };

export const W = 640;
export const TOP = 54;
export const PLOT_H = 380;
export const H = TOP + PLOT_H + 22;
/** Grosor mínimo (px) de una banda de datos: un tTrans de 0,008 ms frente a
 * 15 ms de propagación sería 0,2 px — invisible. */
export const MIN_THICK = 3;
const AXIS = 58;
const SPAN_LANE = 26;
const RIGHT = 24;
export const SEND_FS = 11;
export const SPAN_FS = 11;

type Pt = { x: number; y: number };
export type ColumnL = StColumn & { x: number };
export type SendL = {
  id: string;
  kind: 'data' | 'ack' | 'ctrl';
  state?: NodeState;
  lost: boolean;
  label?: string;
  /** data: 4 esquinas (arriba-origen, arriba-destino, abajo-destino, abajo-origen). ack/ctrl: [origen, destino]. */
  pts: Pt[];
  /** Centro y ángulo (grados) del rótulo, ya sobre la banda/línea. */
  mid: Pt;
  angle: number;
  /** Fin del trazo (punta de flecha o ✕). */
  tip: Pt;
  /** Caja del rótulo (centro, tamaño, ángulo legible), elegida sin pisar a otros. */
  lab?: OBox;
};
export type SpanL = { id: string; x: number; y0: number; y1: number; side: 1 | -1; label: string; kind: string; state?: NodeState; lab: OBox; vertical: boolean };
export type StFrame = { heads: OBox[]; columns: ColumnL[]; ticks: { t: number; y: number; text: string }[]; unit: string; sends: SendL[]; spans: SpanL[]; plotTop: number; plotBottom: number; axisX: number };

const UNIT: Record<string, string> = { 'μs': 'µs', us: 'µs' };

/** ~6 ticks "redondos" (1, 2, 5 × 10^k) entre 0 y max. */
export function niceTicks(max: number, n = 6): number[] {
  const raw = max / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let t = 0; t <= max + step * 1e-9; t += step) out.push(Number(t.toPrecision(10)));
  return out;
}

/** `marginSpans`: corchetes que reservan margen (todos los pasos de la spec),
 * así las columnas no saltan cuando un paso agrega un corchete. */
export function spacetimeLayout(step: StStep, marginSpans: StSpan[] = step.spans ?? [], k = 1): StFrame {
  const cols = step.columns ?? [];
  const max = step.time?.max || 1;
  const unit = UNIT[step.time?.unit ?? 'ms'] ?? step.time?.unit ?? 'ms';
  const Y = (t: number) => TOP + (Math.max(0, t) / max) * PLOT_H;
  const spans = step.spans ?? [];
  const firstId = cols[0]?.id;
  // Corchetes: a la izquierda de la primera columna, a la derecha de las demás.
  const lastId = cols[cols.length - 1]?.id;
  const leftLanes = lanes(spans.filter((s) => s.column === firstId));
  const rightLanes = lanes(spans.filter((s) => s.column === lastId && s.column !== firstId));
  const nl = Math.max(leftLanes.count, lanes(marginSpans.filter((s) => s.column === firstId)).count);
  const nr = Math.max(rightLanes.count, lanes(marginSpans.filter((s) => s.column === lastId && s.column !== firstId)).count);
  const left = AXIS + (nl ? nl * SPAN_LANE + 10 : 0);
  const right = RIGHT + (nr ? nr * SPAN_LANE + 6 : 0);
  const halfHead = Math.max(0, ...cols.map((c) => textW(c.label, 12, false) / 2 + 10));
  const x0 = Math.max(left, AXIS + halfHead * 0.5), x1 = W - Math.max(right, halfHead * 1.4);
  const columns: ColumnL[] = cols.map((c, i) => ({ ...c, x: cols.length === 1 ? (x0 + x1) / 2 : x0 + (i * (x1 - x0)) / (cols.length - 1) }));
  const X = new Map(columns.map((c) => [c.id, c.x]));

  const ticks = (step.time?.ticks ?? niceTicks(max)).filter((t) => t >= 0 && t <= max).map((t) => ({ t, y: Y(t), text: fmtNum(t) }));

  const sends: SendL[] = [];
  (step.sends ?? []).forEach((s, k) => {
    const xa = X.get(s.from), xb = X.get(s.to);
    if (xa === undefined || xb === undefined) return;
    const kind = s.kind ?? 'data';
    const tTrans = s.tTrans ?? 0;
    // Perdido: se dibuja sólo la mitad del recorrido (en x y en tiempo de propagación).
    const f = s.lost ? 0.5 : 1;
    const xe = s.lost ? (xa + xb) / 2 : xb;
    const top0 = Y(s.tStart), top1 = Y(s.tStart + s.tProp * f);
    const id = `s-${s.from}-${s.to}-${s.tStart}-${kind}`;
    void k;
    const angle = r2((Math.atan2(top1 - top0, xe - xa) * 180) / Math.PI);
    if (kind === 'data') {
      const thick = Math.max(MIN_THICK, Y(s.tStart + tTrans) - top0);
      const pts = [{ x: xa, y: top0 }, { x: xe, y: top1 }, { x: xe, y: top1 + thick }, { x: xa, y: top0 + thick }];
      sends.push({ id, kind, state: s.state, lost: !!s.lost, label: s.label, pts, mid: { x: (xa + xe) / 2, y: (top0 + top1) / 2 + thick / 2 }, angle, tip: { x: xe, y: top1 + thick / 2 } });
    } else {
      const pts = [{ x: xa, y: top0 }, { x: xe, y: top1 }];
      sends.push({ id, kind, state: s.state, lost: !!s.lost, label: s.label, pts, mid: { x: (xa + xe) / 2, y: (top0 + top1) / 2 }, angle, tip: { x: xe, y: top1 } });
    }
  });

  const spanL: SpanL[] = spans.flatMap((s, k) => {
    const cx = X.get(s.column);
    if (cx === undefined) return [];
    const isLeft = s.column === firstId && cols.length > 1;
    const lane = (isLeft ? leftLanes : s.column === lastId ? rightLanes : lanes(spans.filter((q) => q.column === s.column))).of.get(s) ?? 0;
    const side: 1 | -1 = isLeft ? -1 : 1;
    const x = cx + side * (14 + lane * SPAN_LANE), y0 = Y(s.tStart), y1 = Y(s.tEnd);
    const tw = textW(s.label, SPAN_FS * k) + 6;
    // Corchete corto (d_trans de 2 ms): el rótulo vertical no cabe → horizontal, al costado.
    const vertical = y1 - y0 >= tw + 2;
    const lab: OBox = vertical ? { cx: x + side * 10 * k, cy: (y0 + y1) / 2, w: tw, h: 13 * k, angle: -90 } : { cx: x + side * (8 + tw / 2), cy: (y0 + y1) / 2, w: tw, h: 13 * k, angle: 0 };
    void k;
    return [{ id: `sp-${s.column}-${s.tStart}-${s.label}`, x, y0, y1, side, label: s.label, kind: s.kind ?? 'rtt', state: s.state, lab, vertical }];
  });

  // Corchetes muy cortos (escala de 16 s con tramos de 0,2 s): rótulos horizontales apilados.
  spanL.forEach((q, i) => {
    for (let n = 0; n < 6 && spanL.slice(0, i).some((o) => oOverlap(q.lab, o.lab)); n++) {
      if (q.vertical) { q.vertical = false; q.lab = { ...q.lab, angle: 0, cx: q.x + q.side * (8 + q.lab.w / 2) }; continue; }
      q.lab = { ...q.lab, cy: q.lab.cy + 14 * k };
    }
  });

  const heads: OBox[] = columns.map((c) => ({ cx: c.x, cy: TOP - 28, w: textW(c.label, 12.5 * k, false) + 18, h: 24, angle: 0 }));
  const lines: OBox[] = columns.map((c) => ({ cx: c.x, cy: TOP + PLOT_H / 2, w: 2, h: PLOT_H, angle: 0 }));
  // Rótulos de envíos: el del paso primero; a lo largo del envío y de ambos lados, el primero libre.
  const fixed: OBox[] = [...heads, ...spanL.flatMap((q) => [q.lab, bracket(q)])];
  const placed: OBox[] = [];
  const prio = (q: SendL) => (q.state === 'active' || q.state === 'answer' ? 0 : q.state === 'muted' ? 2 : 1);
  for (const q of [...sends].sort((a, b) => prio(a) - prio(b))) {
    if (!q.label) continue;
    const up = q.angle > 90 || q.angle < -90 ? q.angle + 180 : q.angle;
    const thick = q.kind === 'data' ? q.pts[3].y - q.pts[0].y : 0;
    const w = textW(q.label, SEND_FS * k) + 4, h = 13 * k;
    const a = (up * Math.PI) / 180, n = { x: Math.sin(a), y: -Math.cos(a) };
    const p0 = q.pts[0], p1 = q.pts[1];
    let best: OBox | undefined, bestHits = Infinity;
    for (const t of [0.5, 0.36, 0.64, 0.24, 0.76]) {
      for (const side of [1, -1]) {
        // Centro sobre el borde de arriba (o de abajo) de la banda, a lo largo del envío.
        const ex = p0.x + (p1.x - p0.x) * t, ey = p0.y + (p1.y - p0.y) * t + thick / 2;
        const off = thick / 2 + 4 + h / 2;
        const b: OBox = { cx: r2(ex + n.x * off * side), cy: r2(ey + n.y * off * side), w, h, angle: up };
        const hits = [...fixed, ...placed].filter((o) => oOverlap(b, o)).length + lines.filter((o) => oOverlap(b, o, 4)).length + (b.cx - w / 2 < 0 || b.cx + w / 2 > W ? 1 : 0);
        if (hits < bestHits) { bestHits = hits; best = b; }
        if (!hits) break;
      }
      if (!bestHits) break;
    }
    q.lab = best;
    if (best) placed.push(best);
  }

  return { heads, columns, ticks, unit, sends, spans: spanL, plotTop: TOP, plotBottom: TOP + PLOT_H, axisX: 40 };
}

/** Carriles para corchetes que se solapan en el tiempo (codicioso). */
function lanes(spans: StSpan[]): { count: number; of: Map<StSpan, number> } {
  const ends: number[] = [];
  const of = new Map<StSpan, number>();
  for (const s of [...spans].sort((a, b) => a.tStart - b.tStart)) {
    let l = ends.findIndex((e) => e <= s.tStart);
    if (l === -1) l = ends.push(0) - 1;
    ends[l] = s.tEnd;
    of.set(s, l);
  }
  return { count: ends.length, of };
}
const bracket = (q: SpanL): OBox => ({ cx: q.x - (q.side * 2.5), cy: (q.y0 + q.y1) / 2, w: 5, h: Math.max(1, q.y1 - q.y0), angle: 0 });

/** Lo que aún choca, por paso (para el auditor y los tests). */
export function spacetimeIssues(steps: StStep[]): string[][] {
  // Escritorio y móvil (texto ×1.25, MAX_BOOST de net-kit).
  const a = issuesAt(steps, 1), b = issuesAt(steps, 1.25);
  return a.map((l, i) => [...l, ...b[i].map((m) => `[móvil] ${m}`)]);
}
function issuesAt(steps: StStep[], k: number): string[][] {
  const all = steps.flatMap((s) => s.spans ?? []);
  return steps.map((st) => {
    const f = spacetimeLayout(st, all, k);
    const out: string[] = [];
    const labs = f.sends.filter((q) => q.lab).map((q) => ({ b: q.lab!, what: `rótulo «${q.label}»` }));
    const spans = f.spans.flatMap((q) => [{ b: q.lab, what: `corchete «${q.label}»` }, { b: bracket(q), what: `trazo del corchete «${q.label}»` }]);
    const heads = f.heads.map((b, i) => ({ b, what: `cabecera «${f.columns[i].label}»` }));
    const lines = f.columns.map((c) => ({ b: { cx: c.x, cy: f.plotTop + PLOT_H / 2, w: 2, h: PLOT_H, angle: 0 } as OBox, what: `línea de «${c.label}»` }));
    labs.forEach((l, i) => {
      for (const o of [...labs.slice(i + 1), ...spans, ...heads]) if (oOverlap(l.b, o.b)) out.push(`${l.what} pisa ${o.what}`);
      for (const o of lines) if (oOverlap(l.b, o.b, 4)) out.push(`${l.what} cruza la ${o.what}`);
      if (l.b.cx - l.b.w / 2 < 0 || l.b.cx + l.b.w / 2 > W) out.push(`${l.what} se sale del lienzo`);
    });
    f.spans.forEach((q, i) => {
      for (const o of [...f.spans.slice(i + 1).map((r) => ({ b: r.lab, what: `corchete «${r.label}»` })), ...heads]) if (oOverlap(q.lab, o.b)) out.push(`corchete «${q.label}» pisa ${o.what}`);
      for (const o of lines) if (oOverlap(q.lab, o.b, 2)) out.push(`corchete «${q.label}» cruza la ${o.what}`);
    });
    for (let i = 0; i < f.heads.length; i++) for (let j = i + 1; j < f.heads.length; j++) if (oOverlap(f.heads[i], f.heads[j])) out.push(`cabeceras «${f.columns[i].label}» y «${f.columns[j].label}» se pisan`);
    return out;
  });
}
