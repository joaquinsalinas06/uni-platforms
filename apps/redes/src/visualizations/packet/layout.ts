// Layout puro de `packet`: rejilla de bits (ancho ∝ bits, regla 0…width−1)
// o encapsulamiento por capas (cada capa agrega su cabecera a la izquierda,
// en una columna fija: las filas quedan alineadas bajo el mensaje M).
import type { NodeState } from '../canvas-types.ts';
import { textW } from '../net-style.ts';

export type PktField = { label: string; bits: number; value?: string | number; state?: NodeState };
export type PktLayer = { label: string; header?: string; trailer?: string; payload?: string; state?: NodeState };
export type PacketStep = { fields?: { width?: number; rows: PktField[][] }; layers?: PktLayer[] };

export const W = 640;
const PAD = 28;
const ROW_H = 48;
const RULER = 36;

export type Box = {
  key: string;
  kind: 'field' | 'header' | 'trailer' | 'payload' | 'layer';
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  fs: number;
  value?: string;
  bits?: number;
  tone?: number;
  state?: NodeState;
};
export type Txt = { key: string; x: number; y: number; text: string; anchor: 'start' | 'middle' | 'end'; size: number; state?: NodeState };
export type PacketFrame = { boxes: Box[]; texts: Txt[]; ticks: string; height: number };

/** Rótulo que cabe en `w`: achica hasta 9.5 px y, si no alcanza, parte en dos líneas. */
export function fit(label: string, w: number, size = 12.5): { lines: string[]; fs: number } {
  for (let fs = size; fs >= 9.5; fs -= 0.5) if (textW(label, fs, false) <= w - 8) return { lines: [label], fs };
  const words = label.split(' ');
  if (words.length > 1) {
    let best = { lines: [label], fs: 9.5 }, worst = Infinity;
    for (let c = 1; c < words.length; c++) {
      const a = words.slice(0, c).join(' '), b = words.slice(c).join(' ');
      const m = Math.max(a.length, b.length);
      if (m < worst) { worst = m; best = { lines: [a, b], fs: 9.5 }; }
    }
    for (let fs = size; fs >= 9.5; fs -= 0.5) if (Math.max(...best.lines.map((l) => textW(l, fs, false))) <= w - 6) return { lines: best.lines, fs };
    return best;
  }
  return { lines: [label], fs: 9.5 };
}

function fieldsLayout(spec: NonNullable<PacketStep['fields']>): PacketFrame {
  const width = spec.width ?? 32;
  const cw = W - 2 * PAD;
  const bp = cw / width;
  const X = (b: number) => PAD + b * bp;
  const boxes: Box[] = [];
  spec.rows.forEach((row, r) => {
    let b = 0;
    row.forEach((f, c) => {
      const bits = Math.min(f.bits, width - b);
      if (bits <= 0) return;
      const w = bits * bp;
      boxes.push({ key: `f${r}-${c}`, kind: 'field', x: X(b), y: RULER + r * ROW_H, w, h: ROW_H, ...fit(f.label, w), value: f.value === undefined ? undefined : String(f.value), bits: f.bits, state: f.state });
      b += bits;
    });
  });
  // Regla: marca por bit si caben (≥ 5 px), mayor cada 8; números en 0, mitad y último.
  let ticks = '';
  for (let b = 0; b <= width; b++) {
    const major = b % 8 === 0 || b === width;
    if (!major && bp < 5) continue;
    ticks += `M${X(b)},${RULER}v${major ? -7 : -3.5}`;
  }
  const marks = [...new Set([0, Math.floor(width / 2), width - 1])];
  const texts: Txt[] = marks.map((b) => ({ key: `r${b}`, x: X(b) + bp / 2, y: RULER - 11, text: String(b), anchor: 'middle', size: 10.5 }));
  return { boxes, texts, ticks, height: RULER + spec.rows.length * ROW_H + 10 };
}

type Ctx = { headW: number; trailW: number; maxHeads: number; gutter: number };

function layersLayout(layers: PktLayer[], ctx: Ctx): PacketFrame {
  const boxes: Box[] = [];
  const texts: Txt[] = [];
  const H = 36, GAP = 10, TOP = 8;
  const encap = ctx.headW > 0 || ctx.trailW > 0;
  if (!encap) {
    // Pila simple de capas (5 capas TCP/IP).
    layers.forEach((l, i) => boxes.push({ key: `l${i}`, kind: 'layer', x: PAD + 40, y: TOP + i * (H + 6), w: W - 2 * PAD - 80, h: H, ...fit(l.label, W - 2 * PAD - 80, 13), tone: i, state: l.state }));
    return { boxes, texts, ticks: '', height: TOP + layers.length * (H + 6) + 4 };
  }
  const xM = ctx.gutter + ctx.maxHeads * ctx.headW;
  const mW = Math.min(150, W - PAD - xM - ctx.trailW * 2);
  const payload = layers[0]?.payload ?? 'M';
  layers.forEach((l, i) => {
    const y = TOP + i * (H + GAP);
    texts.push({ key: `t${i}`, x: PAD, y: y + H / 2, text: l.label, anchor: 'start', size: 12, state: l.state });
    boxes.push({ key: `m${i}`, kind: 'payload', x: xM, y, w: mW, h: H, ...fit(payload, mW), state: l.state === 'active' ? undefined : l.state });
    // Cabeceras de esta capa y de las anteriores: la más nueva, la más externa.
    let h = 0, t = 0;
    layers.slice(0, i + 1).forEach((q, j) => {
      if (q.header) {
        h++;
        boxes.push({ key: `h${j}-${i}`, kind: 'header', x: xM - h * ctx.headW, y, w: ctx.headW, h: H, ...fit(q.header, ctx.headW, 12), tone: j, state: j === i ? l.state : undefined });
      }
      if (q.trailer) {
        t++;
        boxes.push({ key: `tr${j}-${i}`, kind: 'trailer', x: xM + mW + (t - 1) * ctx.trailW, y, w: ctx.trailW, h: H, ...fit(q.trailer, ctx.trailW, 12), tone: j, state: j === i ? l.state : undefined });
      }
    });
  });
  return { boxes, texts, ticks: '', height: TOP + layers.length * (H + GAP) };
}

/** Todos los pasos juntos: las columnas de cabecera no cambian entre pasos. */
export function packetLayouts(steps: PacketStep[]): PacketFrame[] {
  const all = steps.flatMap((s) => s.layers ?? []);
  const heads = all.filter((l) => l.header).map((l) => l.header!);
  const trails = all.filter((l) => l.trailer).map((l) => l.trailer!);
  const ctx: Ctx = {
    headW: heads.length ? Math.max(48, ...heads.map((h) => textW(h, 12) + 18)) : 0,
    trailW: trails.length ? Math.max(44, ...trails.map((h) => textW(h, 12) + 18)) : 0,
    maxHeads: Math.max(0, ...steps.map((s) => (s.layers ?? []).filter((l) => l.header).length)),
    gutter: PAD + Math.max(60, ...all.map((l) => textW(l.label, 12, false))) + 14,
  };
  const frames = steps.map((s) => {
    const parts = [s.fields ? fieldsLayout(s.fields) : undefined, s.layers?.length ? layersLayout(s.layers, ctx) : undefined].filter(Boolean) as PacketFrame[];
    if (parts.length < 2) return parts[0] ?? { boxes: [], texts: [], ticks: '', height: 40 };
    // Ambos en un paso: capas debajo de la rejilla.
    const dy = parts[0].height + 14;
    const b = parts[1];
    return { boxes: [...parts[0].boxes, ...b.boxes.map((x) => ({ ...x, y: x.y + dy }))], texts: [...parts[0].texts, ...b.texts.map((x) => ({ ...x, y: x.y + dy }))], ticks: parts[0].ticks, height: dy + b.height };
  });
  const height = Math.max(...frames.map((f) => f.height));
  return frames.map((f) => ({ ...f, height }));
}
