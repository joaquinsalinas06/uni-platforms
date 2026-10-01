// Layout puro de `spacetime`: columnas verticales (emisor, routers, receptor),
// tiempo hacia abajo con escala REAL. Un envío de datos es un paralelogramo:
// grosor vertical = tTrans, pendiente = tProp. ACK/control: línea fina.
import type { NodeState } from '../canvas-types.ts';
import { fmtNum, r2, textW } from '../net-style.ts';

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
};
export type SpanL = { id: string; x: number; y0: number; y1: number; side: 1 | -1; label: string; kind: string; state?: NodeState };
export type StFrame = { columns: ColumnL[]; ticks: { t: number; y: number; text: string }[]; unit: string; sends: SendL[]; spans: SpanL[]; plotTop: number; plotBottom: number; axisX: number };

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
export function spacetimeLayout(step: StStep, marginSpans: StSpan[] = step.spans ?? []): StFrame {
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
    const id = `s${k}-${s.from}-${s.to}`;
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
    return [{ id: `sp${k}-${s.column}`, x: cx + side * (14 + lane * SPAN_LANE), y0: Y(s.tStart), y1: Y(s.tEnd), side, label: s.label, kind: s.kind ?? 'rtt', state: s.state }];
  });

  return { columns, ticks, unit, sends, spans: spanL, plotTop: TOP, plotBottom: TOP + PLOT_H, axisX: 40 };
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
