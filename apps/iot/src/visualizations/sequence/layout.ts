// Layout puro de `sequence`: líneas de vida verticales con cabecera, mensajes
// como flechas horizontales de arriba hacia abajo (MQTT QoS 0/1/2, CONNECT,
// SUBSCRIBE, LWT, keep-alive, HTTP vs WebSocket vs CoAP). Etiqueta encima de
// la flecha, flags debajo, ✕ a mitad de camino si se pierde, nota `store` en
// el receptor, auto-mensajes en bucle y filas separadoras (`divider`).
// Sin React/JSX: se testea con `node --test`.
import { charW, type CanvasNode, type CanvasPath, type CanvasText, type Frame, type NodeState } from '../canvas-types.ts';

export type SeqActor = { id: string; label: string; state?: NodeState };
export type SeqMsg = {
  from: string;
  to: string;
  label: string;
  flags?: string;
  lost?: boolean;
  store?: string;
  state?: NodeState;
  divider?: boolean;
};

const LABEL = 12;
const FLAGS = 10.5;
const NOTE = 10.5;
const MIN_GAP = 150;
const MARGIN = 16;
const TOP = 8;
const SELF_W = 30;
const tw = (s: string | undefined, size: number) => (s ? s.length * charW(size) : 0);

export type SeqOpts = {
  highlight?: string[];
  /** Mensajes con índice ≥ newFrom se pintan `active` si ninguno trae
   * `state` (el mensaje "de este paso"). */
  newFrom?: number;
  /** Alto mínimo: las líneas de vida se alargan hasta ahí (todos los pasos
   * de una spec comparten alto, así la cabecera no salta). */
  minHeight?: number;
};

export function sequenceLayout(actors: SeqActor[], msgs: SeqMsg[], opts: SeqOpts = {}): Frame {
  const highlight = opts.highlight ?? [];
  const idx = new Map(actors.map((a, i) => [a.id, i]));
  const n = actors.length;
  const headLines = actors.map((a) => a.label.split('\n'));
  const headW = headLines.map((ls) => Math.max(84, Math.max(...ls.map((l) => tw(l, 12))) + 24));
  const headH = Math.max(...headLines.map((ls) => 30 + (ls.length - 1) * 15), 30);

  // ── Separación entre líneas de vida: lo que pidan cabeceras y rótulos.
  const gaps = Array.from({ length: Math.max(0, n - 1) }, (_, i) => Math.max(MIN_GAP, (headW[i] + headW[i + 1]) / 2 + 20));
  let rightExtra = 0;
  const msgW = (m: SeqMsg) => (Math.max(tw(m.label, LABEL), tw(m.flags, FLAGS)) + 30) / (m.lost ? 0.58 : 1);
  for (const m of msgs) {
    if (m.divider) continue;
    const a = idx.get(m.from), b = idx.get(m.to);
    if (a === undefined || b === undefined) continue;
    if (a === b) {
      const need = SELF_W + 10 + Math.max(tw(m.label, LABEL), tw(m.flags, FLAGS)) + 12;
      if (a < n - 1) gaps[a] = Math.max(gaps[a], need);
      else rightExtra = Math.max(rightExtra, need - headW[a] / 2);
      continue;
    }
    const lo = Math.min(a, b), hi = Math.max(a, b);
    const have = gaps.slice(lo, hi).reduce((s, g) => s + g, 0);
    const need = msgW(m);
    if (have < need) for (let k = lo; k < hi; k++) gaps[k] += (need - have) / (hi - lo);
  }
  const xs: number[] = [];
  actors.forEach((_, i) => xs.push(i === 0 ? 0 : xs[i - 1] + gaps[i - 1]));

  // Extensión horizontal: cabeceras, notas `store`, auto-mensajes al final.
  let minX = Math.min(...xs.map((x, i) => x - headW[i] / 2), 0);
  let maxX = Math.max(...xs.map((x, i) => x + headW[i] / 2), 0) + Math.max(0, rightExtra);
  for (const m of msgs) {
    const b = idx.get(m.to);
    if (m.store && b !== undefined) {
      const w = tw(m.store, NOTE) + 16;
      minX = Math.min(minX, xs[b] - w / 2);
      maxX = Math.max(maxX, xs[b] + w / 2);
    }
  }
  for (const m of msgs) {
    if (!m.divider) continue;
    const w = tw(m.label, 10.5) + 24;
    const mid = (minX + maxX) / 2;
    minX = Math.min(minX, mid - w / 2);
    maxX = Math.max(maxX, mid + w / 2);
  }
  const off = MARGIN - minX;
  const X = (i: number) => xs[i] + off;
  const width = Math.ceil(maxX - minX + 2 * MARGIN);

  const nodes: CanvasNode[] = [];
  const paths: CanvasPath[] = [];
  const annotations: CanvasText[] = [];

  actors.forEach((a, i) => {
    nodes.push({
      id: `actor-${a.id}`,
      label: a.label,
      lines: headLines[i],
      shape: 'rounded',
      x: X(i),
      y: TOP + headH / 2,
      w: headW[i],
      h: headH,
      state: a.state ?? (highlight.includes(a.id) ? 'active' : undefined),
    });
  });

  const auto = opts.newFrom !== undefined && !msgs.some((m) => m.state);
  let y = TOP + headH + 14;
  msgs.forEach((m, k) => {
    const id = `m${k}`;
    const state: NodeState | undefined = m.state ?? (auto && k >= opts.newFrom! ? 'active' : undefined);
    const ink = state === 'active' ? 'var(--accent)' : state === 'muted' ? 'var(--faint)' : state === 'answer' ? 'var(--answer)' : 'var(--ink)';
    const pstate = state === 'idle' ? undefined : state;
    // Sobre la franja del mensaje activo el chip toma el color de la franja.
    const chip = state === 'active' ? 'color-mix(in srgb, var(--accent) 7%, var(--fill))' : true;
    if (m.divider) {
      const dy = y + 12;
      paths.push({ id: `${id}-div`, d: `M${MARGIN},${dy}H${width - MARGIN}`, width: 1, dash: '2 4', color: 'var(--muted)', state: pstate });
      annotations.push({ id: `${id}-label`, text: m.label, x: width / 2, y: dy + 3.5, anchor: 'middle', size: 10.5, bg: true, color: state ? ink : 'var(--muted)' });
      y += 30;
      return;
    }
    const a = idx.get(m.from), b = idx.get(m.to);
    if (a === undefined || b === undefined) return;
    const rowTop = y;
    y += 18;
    const ay = y;
    const xa = X(a), xb = X(b);
    if (a === b) {
      const loop = `M${xa},${ay}H${xa + SELF_W}V${ay + 18}H${xa + 1}`;
      paths.push({ id: `${id}-arrow`, d: loop, width: state === 'active' ? 2 : 1.5, arrow: true, state: pstate });
      annotations.push({ id: `${id}-label`, text: m.label, x: xa + SELF_W + 8, y: ay + 5, size: LABEL, weight: 600, color: ink, bg: chip });
      if (m.flags) annotations.push({ id: `${id}-flags`, text: m.flags, x: xa + SELF_W + 8, y: ay + 19, size: FLAGS, bg: chip, color: state === 'muted' ? 'var(--faint)' : undefined });
      y += m.flags ? 26 : 20;
    } else {
      const dir = Math.sign(xb - xa);
      const end = m.lost ? xa + (xb - xa) * 0.58 : xb - dir * 1;
      paths.push({ id: `${id}-arrow`, d: `M${xa + dir},${ay}H${end}`, width: state === 'active' ? 2 : 1.5, arrow: !m.lost, state: pstate });
      if (m.lost) {
        paths.push({ id: `${id}-x`, d: `M${end - 5},${ay - 5}l10,10m0,-10l-10,10`, width: 2.25, color: 'var(--answer)' });
      }
      // Perdido: el rótulo va sobre el tramo que sí se dibujó, lejos del ✕.
      const mid = m.lost ? (xa + end) / 2 : (xa + xb) / 2;
      annotations.push({ id: `${id}-label`, text: m.label, x: mid, y: ay - 6, anchor: 'middle', size: LABEL, weight: 600, color: ink, bg: chip });
      if (m.flags) annotations.push({ id: `${id}-flags`, text: m.flags, x: mid, y: ay + 13, anchor: 'middle', size: FLAGS, bg: chip, color: state === 'muted' ? 'var(--faint)' : undefined });
      y += m.flags ? 18 : 6;
    }
    if (m.store) {
      const w = tw(m.store, NOTE) + 16;
      const cy = y + 13;
      const box = `M${xb - w / 2},${cy - 10}H${xb + w / 2}V${cy + 10}H${xb - w / 2}Z`;
      paths.push({ id: `${id}-note-bg`, d: box, fill: true, opacity: 1, color: 'var(--paper)' });
      paths.push({ id: `${id}-note`, d: box, width: 1, dash: '3 2', color: 'var(--muted)', state: state === 'active' ? 'active' : undefined });
      annotations.push({ id: `${id}-store`, text: m.store, x: xb, y: cy + 3.5, anchor: 'middle', size: NOTE, color: 'var(--ink)' });
      y += 28;
    }
    y += 10;
    if (state === 'active') {
      // Franja tenue detrás del mensaje del paso: se encuentra de un vistazo.
      paths.unshift({ id: `${id}-band`, d: `M${MARGIN / 2},${rowTop}H${width - MARGIN / 2}V${y - 2}H${MARGIN / 2}Z`, fill: true, opacity: 0.07, state: 'active' });
    }
  });

  const height = Math.max(Math.ceil(y + 8), opts.minHeight ?? 0);
  // Líneas de vida debajo de todo lo demás (van primero en `paths`).
  paths.unshift(...actors.map((a, i) => ({
    id: `life-${a.id}`,
    d: `M${X(i)},${TOP + headH}V${height - 6}`,
    width: 1,
    dash: '4 4',
    color: 'var(--muted)',
  })));

  return { nodes, edges: [], groups: [], annotations, paths, width, height };
}

/** Índice del primer mensaje nuevo si `cur` extiende a `prev` (mismos
 * mensajes al principio); si no, undefined. */
export function newFromPrev(prev: SeqMsg[] | undefined, cur: SeqMsg[]): number | undefined {
  if (!prev || cur.length <= prev.length) return undefined;
  const same = prev.every((m, i) => m.from === cur[i].from && m.to === cur[i].to && m.label === cur[i].label);
  return same ? prev.length : undefined;
}
