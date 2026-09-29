// Layout puro de `xy-chart`: señales (sin(2t)+4sin(5t)), espectros (stem),
// cuantización/PWM (step), muestreo (samples), áreas y alcances por
// tecnología (bars, eje x log). Todo se dibuja con CanvasPath (curvas,
// ejes, rejilla, referencias) + CanvasText (ticks, rótulos). Sin nodos.
// Sin React/JSX: se testea con `node --test`.
import { charW, pathColor, type CanvasPath, type CanvasText, type Frame, type NodeState } from '../canvas-types.ts';

export type XyAxis = { label?: string; min?: number; max?: number; log?: boolean; ticks?: number[] };
export type XyRef = { at: number; label?: string; state?: NodeState; tone?: string };
export type XyBand = { from: number; to: number; axis?: 'x' | 'y'; label?: string };
export type XyKind = 'line' | 'stem' | 'step' | 'samples' | 'area' | 'bars';
export type XySeries = {
  id: string;
  label: string;
  points?: [number, number][];
  fn?: string;
  domain?: [number, number];
  samples?: number;
  kind?: XyKind;
  bars?: { label: string; from: number; to: number }[];
  tone?: string;
  state?: NodeState;
};
export type XyChartInput = {
  series: XySeries[];
  x?: XyAxis;
  y?: XyAxis;
  hlines?: XyRef[];
  vlines?: XyRef[];
  bands?: XyBand[];
  params?: Record<string, number>;
  highlight?: string[];
};

// ───────────────────────── fn: expresión en x ─────────────────────────
const M = Math;
const HELPERS: Record<string, unknown> = {
  sin: M.sin, cos: M.cos, tan: M.tan, asin: M.asin, acos: M.acos, atan: M.atan, atan2: M.atan2,
  abs: M.abs, sign: M.sign, sqrt: M.sqrt, exp: M.exp, log: M.log, log10: M.log10, log2: M.log2,
  floor: M.floor, ceil: M.ceil, round: M.round, trunc: M.trunc, max: M.max, min: M.min, pow: M.pow, hypot: M.hypot,
  PI: M.PI, E: M.E,
  /** Onda cuadrada ±1 con el período de sin(x) (2π). */
  square: (x: number) => (M.sin(x) >= 0 ? 1 : -1),
  /** PWM: `duty` en 0..1 (o 0..100 %), período, nivel bajo y alto. */
  pwm: (x: number, duty = 0.5, period = 1, low = 0, high = 1) => {
    const d = duty > 1 ? duty / 100 : duty;
    const ph = ((x % period) + period) % period;
    return ph < d * period ? high : low;
  },
  /** Escalón unitario u(x). */
  step: (x: number) => (x >= 0 ? 1 : 0),
};

/** Compila `expr` (variable `x`, alias `t`/`n`) a una función. "Seguro a
 * medias": sólo admite identificadores de HELPERS, x/t/n y `params`, y
 * rechaza asignaciones, strings, llaves y corchetes — una spec del curso no
 * puede colar código arbitrario, y una expresión mal escrita revienta el
 * build con un mensaje claro en vez de dibujar basura. */
export function compileFn(expr: string, params: Record<string, number> = {}): (x: number) => number {
  const scope = { ...HELPERS, ...params };
  if (/[;{}[\]`'"\\]|(^|[^<>=!])=(?!=)/.test(expr)) throw new Error(`xy-chart fn inválida: "${expr}"`);
  const idents = expr.replace(/(\d*\.)?\d+(e[+-]?\d+)?/gi, '0').match(/[A-Za-z_$][\w$]*/g) ?? [];
  for (const id of idents) {
    if (!Object.hasOwn(scope, id) && id !== 'x' && id !== 't' && id !== 'n') {
      throw new Error(`xy-chart fn: identificador desconocido "${id}" en "${expr}"`);
    }
  }
  const names = Object.keys(scope);
  const f = new Function(...names, 'x', `"use strict"; const t = x, n = x; return (${expr});`) as (...a: unknown[]) => number;
  const vals = names.map((k) => scope[k]);
  return (x: number) => {
    const y = Number(f(...vals, x));
    return Number.isFinite(y) ? y : NaN;
  };
}

// ───────────────────────── escalas y ticks ─────────────────────────
function niceStep(span: number, target: number): number {
  const raw = span / Math.max(1, target);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const f = raw / mag;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
}

function linTicks(min: number, max: number, target: number): number[] {
  const step = niceStep(max - min, target);
  const out: number[] = [];
  for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}

function logTicks(min: number, max: number): number[] {
  const out: number[] = [];
  const decades = Math.log10(max / min);
  const mult = decades < 1.5 ? [1, 2, 5] : [1];
  for (let k = Math.floor(Math.log10(min)); k <= Math.ceil(Math.log10(max)); k++) {
    for (const m of mult) {
      const v = m * 10 ** k;
      if (v >= min * (1 - 1e-9) && v <= max * (1 + 1e-9)) out.push(v);
    }
  }
  return out;
}

/** 15000 → "15k", 0.1 → "0.1", -2.5 → "−2.5". */
export function fmt(v: number): string {
  if (v === 0 || Object.is(v, -0)) return '0';
  const a = Math.abs(v);
  const sign = v < 0 ? '−' : '';
  const trim = (n: number) => String(Number(n.toPrecision(3)));
  if (a >= 1e6) return sign + trim(a / 1e6) + 'M';
  if (a >= 1e3) return sign + trim(a / 1e3) + 'k';
  return sign + String(Number(a.toPrecision(4)));
}

type Scale = { toPx: (v: number) => number; ticks: number[]; min: number; max: number; log: boolean };

function makeScale(min: number, max: number, a: XyAxis | undefined, p0: number, p1: number, target: number, nice: boolean): Scale {
  const log = !!a?.log;
  if (log) {
    min = Math.max(min, 1e-12);
    if (max <= min) max = min * 10;
    if (nice && a?.min === undefined) min = 10 ** Math.floor(Math.log10(min) + 1e-9);
    if (nice && a?.max === undefined) max = 10 ** Math.ceil(Math.log10(max) - 1e-9);
    const l0 = Math.log10(min), l1 = Math.log10(max);
    return { min, max, log, ticks: a?.ticks ?? logTicks(min, max), toPx: (v) => p0 + ((Math.log10(Math.max(v, 1e-12)) - l0) / (l1 - l0)) * (p1 - p0) };
  }
  if (max === min) { min -= 1; max += 1; }
  if (nice) {
    const step = niceStep(max - min, target);
    if (a?.min === undefined) min = Math.floor(min / step + 1e-9) * step;
    if (a?.max === undefined) max = Math.ceil(max / step - 1e-9) * step;
  }
  return { min, max, log, ticks: a?.ticks ?? linTicks(min, max, target), toPx: (v) => p0 + ((v - min) / (max - min)) * (p1 - p0) };
}

// ───────────────────────── geometría ─────────────────────────
const r1 = (v: number) => Math.round(v * 10) / 10;
const circle = (x: number, y: number, r: number) => `M${r1(x - r)},${r1(y)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;
const textW = (s: string, size: number) => s.length * charW(size);

const DEFAULT_TONES = [undefined, 'mesh1', 'mesh2', 'mesh3', 'mesh4', 'series', 'parallel'];

/** Puntos de la serie en coordenadas de datos. */
export function seriesPoints(s: XySeries, x: XyAxis | undefined, params: Record<string, number> = {}): [number, number][] {
  if (s.points) return s.points;
  if (!s.fn) return [];
  const f = compileFn(s.fn, params);
  const [a, b] = s.domain ?? [x?.min ?? 0, x?.max ?? 10];
  const kind = s.kind ?? 'line';
  const out: [number, number][] = [];
  if (kind === 'stem' || kind === 'samples') {
    const ts = s.samples ?? (kind === 'stem' ? 1 : (b - a) / 20);
    for (let k = Math.ceil(a / ts - 1e-9); k * ts <= b + 1e-9; k++) out.push([k * ts, f(k * ts)]);
    return out;
  }
  const n = Math.max(2, Math.round(s.samples ?? 400));
  const log = !!x?.log && a > 0;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const xv = log ? 10 ** (Math.log10(a) + t * (Math.log10(b) - Math.log10(a))) : a + t * (b - a);
    out.push([xv, f(xv)]);
  }
  return out;
}

/** Curva continua de apoyo de una serie `samples` con fn (la señal analógica). */
function denseCurve(s: XySeries, x: XyAxis | undefined, params: Record<string, number>): [number, number][] {
  if (!s.fn) return s.points ?? [];
  return seriesPoints({ ...s, kind: 'line', samples: 400 }, x, params);
}

export function xyChartLayout(input: XyChartInput, opts: { width?: number; height?: number } = {}): Frame {
  const W = opts.width ?? 640;
  const params = input.params ?? {};
  const highlight = input.highlight ?? [];
  const series = input.series ?? [];
  const barsMode = series.some((s) => s.kind === 'bars');

  const paths: CanvasPath[] = [];
  const annotations: CanvasText[] = [];

  const pts = new Map(series.map((s) => [s.id, s.kind === 'bars' ? [] : seriesPoints(s, input.x, params)]));
  const dense = new Map(series.filter((s) => s.kind === 'samples').map((s) => [s.id, denseCurve(s, input.x, params)]));

  // Estado/tono de cada serie: explícito > highlight (activa/las demás muted) > paleta por índice.
  const paint = (s: XySeries, i: number): Pick<CanvasPath, 'state' | 'tone' | 'color'> => {
    const state = s.state ?? (highlight.length ? (highlight.includes(s.id) ? 'active' : 'muted') : undefined);
    return { state: state === 'idle' ? undefined : state, tone: s.tone ?? DEFAULT_TONES[i % DEFAULT_TONES.length] };
  };

  // ── Leyenda (≥2 series) arriba, en filas que se parten al ancho.
  const legendRows: { s: XySeries; i: number; x: number; row: number }[] = [];
  if (series.length >= 2) {
    let lx = 0, row = 0;
    series.forEach((s, i) => {
      const w = 22 + textW(s.label, 11) + 18;
      if (lx > 0 && lx + w > W - 60) { lx = 0; row++; }
      legendRows.push({ s, i, x: lx, row });
      lx += w;
    });
  }
  const legendH = legendRows.length ? (Math.max(...legendRows.map((l) => l.row)) + 1) * 18 + 4 : 0;

  // ── Rangos de datos.
  const xs: number[] = [], ys: number[] = [];
  for (const s of series) {
    if (s.kind === 'bars') for (const b of s.bars ?? []) xs.push(b.from, b.to);
    for (const [px, py] of [...(pts.get(s.id) ?? []), ...(dense.get(s.id) ?? [])]) {
      xs.push(px);
      if (Number.isFinite(py)) ys.push(py);
    }
    if (s.fn && s.domain) xs.push(...s.domain);
    if (s.kind === 'stem' || s.kind === 'samples' || s.kind === 'area') ys.push(0);
  }
  for (const r of input.vlines ?? []) xs.push(r.at);
  for (const r of input.hlines ?? []) ys.push(r.at);
  for (const b of input.bands ?? []) (b.axis === 'y' ? ys : xs).push(b.from, b.to);
  const finite = (a: number[]) => a.filter((v) => Number.isFinite(v) && (!input.x?.log || v > 0));
  const fx = finite(xs);
  let xMin = input.x?.min ?? (fx.length ? Math.min(...fx) : 0);
  let xMax = input.x?.max ?? (fx.length ? Math.max(...fx) : 1);
  // Stems/muestras sueltos no deben quedar pegados al borde del eje.
  if (!input.x?.log && series.some((s) => !s.fn && (s.kind === 'stem' || s.kind === 'samples'))) {
    const pad = (xMax - xMin || 1) * 0.06;
    if (input.x?.min === undefined) xMin -= pad;
    if (input.x?.max === undefined) xMax += pad;
  }
  const fy = ys.filter(Number.isFinite);
  let yMin = input.y?.min ?? (fy.length ? Math.min(...fy) : 0);
  let yMax = input.y?.max ?? (fy.length ? Math.max(...fy) : 1);
  // Aire arriba/abajo para los rótulos de valor de un stem y para que una
  // curva no toque el borde.
  const yPad = (yMax - yMin || 1) * (series.some((s) => s.kind === 'stem') ? 0.14 : 0.04);
  if (input.y?.max === undefined && !input.y?.log) yMax += yMax > 0 || yMin === yMax ? yPad : 0;
  if (input.y?.min === undefined && !input.y?.log && yMin < 0) yMin -= yPad;

  // ── Márgenes.
  const cats = barsMode ? series.filter((s) => s.kind === 'bars').flatMap((s) => (s.bars ?? []).map((b) => ({ ...b, s }))) : [];
  const yLabelH = input.y?.label && !barsMode ? 18 : 0;
  // En barras, los rótulos de vlines van en una franja propia sobre el trazado (no sobre la primera barra).
  const refStrip = barsMode && (input.vlines ?? []).some((v) => v.label) ? 16 : 0;
  const top = 12 + legendH + yLabelH + refStrip;
  const bottom = input.x?.label ? 44 : 28;
  const H = opts.height ?? (barsMode ? top + cats.length * 30 + bottom + 8 : 300);
  const plotTop = top, plotBottom = H - bottom;
  // La escala Y hace falta antes del margen izquierdo (ancho de sus ticks).
  const yTarget = Math.max(3, Math.floor((plotBottom - plotTop) / 44));
  const yScale = makeScale(yMin, yMax, input.y, plotBottom, plotTop, yTarget, true);
  const leftText = barsMode
    ? Math.max(...cats.map((c) => textW(c.label, 11)), 20)
    : Math.max(...yScale.ticks.map((t) => textW(fmt(t), 10)), 10);
  const plotLeft = Math.ceil(leftText + (barsMode ? 16 : 12));
  const plotRight = W - 14;
  const xTarget = Math.max(3, Math.floor((plotRight - plotLeft) / 80));
  const xScale = makeScale(xMin, xMax, input.x, plotLeft, plotRight, xTarget, !!input.x?.log || barsMode);
  const X = xScale.toPx, Y = yScale.toPx;

  // ── Rejilla, ejes, ticks.
  let grid = '';
  for (const t of xScale.ticks) grid += `M${r1(X(t))},${plotTop}V${plotBottom}`;
  if (!barsMode) for (const t of yScale.ticks) grid += `M${plotLeft},${r1(Y(t))}H${plotRight}`;
  paths.push({ id: 'grid', d: grid, width: 1, color: 'var(--rule)' });
  for (const b of input.bands ?? []) {
    const d = b.axis === 'y'
      ? `M${plotLeft},${r1(Y(b.to))}H${plotRight}V${r1(Y(b.from))}H${plotLeft}Z`
      : `M${r1(X(b.from))},${plotTop}H${r1(X(b.to))}V${plotBottom}H${r1(X(b.from))}Z`;
    paths.push({ id: `band-${b.from}-${b.to}`, d, fill: true, opacity: 0.1, color: 'var(--muted)' });
    if (b.label) {
      annotations.push({
        id: `band-label-${b.from}-${b.to}`, text: b.label, size: 10, anchor: 'middle', bg: true,
        x: b.axis === 'y' ? (plotLeft + plotRight) / 2 : (X(b.from) + X(b.to)) / 2,
        y: b.axis === 'y' ? (Y(b.from) + Y(b.to)) / 2 + 4 : plotBottom - 7,
      });
    }
  }
  let axisD = `M${plotLeft},${plotTop}V${plotBottom}H${plotRight}`;
  for (const t of xScale.ticks) axisD += `M${r1(X(t))},${plotBottom}v4`;
  if (!barsMode) for (const t of yScale.ticks) axisD += `M${plotLeft},${r1(Y(t))}h-4`;
  paths.push({ id: 'axes', d: axisD, width: 1, color: 'var(--muted)' });
  const zeroY = !barsMode && yScale.min < 0 && yScale.max > 0 && !yScale.log ? Y(0) : null;
  if (zeroY !== null) paths.push({ id: 'zero', d: `M${plotLeft},${r1(zeroY)}H${plotRight}`, width: 1, color: 'var(--muted)' });
  const baseY = zeroY ?? (yScale.log ? plotBottom : Y(Math.max(yScale.min, Math.min(yScale.max, 0))));

  // Ticks X: se saltan los que chocarían con el anterior.
  let lastRight = -Infinity;
  for (const t of xScale.ticks) {
    const txt = fmt(t), w = textW(txt, 10), cx = X(t);
    if (cx - w / 2 < lastRight + 6) continue;
    lastRight = cx + w / 2;
    annotations.push({ id: `tick-x-${t}`, text: txt, x: cx, y: plotBottom + 15, anchor: 'middle', size: 10 });
  }
  if (!barsMode) for (const t of yScale.ticks) annotations.push({ id: `tick-y-${t}`, text: fmt(t), x: plotLeft - 7, y: Y(t) + 3.5, anchor: 'end', size: 10 });
  if (input.x?.label) annotations.push({ id: 'x-label', text: input.x.label, x: (plotLeft + plotRight) / 2, y: H - 10, anchor: 'middle', size: 11, color: 'var(--ink)' });
  if (yLabelH) annotations.push({ id: 'y-label', text: input.y!.label!, x: plotLeft - Math.min(plotLeft - 4, 8), y: plotTop - 8, anchor: 'start', size: 11, color: 'var(--ink)' });

  // ── Series.
  const inY = (v: number) => Number.isFinite(v) && v >= yScale.min - (yScale.max - yScale.min) * 0.02 && v <= yScale.max + (yScale.max - yScale.min) * 0.02;
  const polyline = (p: [number, number][]) => {
    let d = '', pen = false;
    for (const [px, py] of p) {
      if (!inY(py)) { pen = false; continue; }
      d += `${pen ? 'L' : 'M'}${r1(X(px))},${r1(Y(py))}`;
      pen = true;
    }
    return d;
  };

  let barRow = 0;
  series.forEach((s, i) => {
    const kind = s.kind ?? 'line';
    const color = paint(s, i);
    const p = pts.get(s.id) ?? [];
    const muted = color.state === 'muted';
    const valueColor = muted ? 'var(--faint)' : 'var(--ink)';
    if (kind === 'line') {
      paths.push({ id: `s-${s.id}`, d: polyline(p), width: 2, ...color });
      if (s.points && p.length <= 12) paths.push({ id: `s-${s.id}-dots`, d: p.filter(([, y]) => inY(y)).map(([x, y]) => circle(X(x), Y(y), 3)).join(''), fill: true, opacity: 1, ...color });
    } else if (kind === 'area') {
      const d = polyline(p);
      const vis = p.filter(([, y]) => inY(y));
      if (vis.length > 1) paths.push({ id: `s-${s.id}-fill`, d: `${d}L${r1(X(vis[vis.length - 1][0]))},${r1(baseY)}L${r1(X(vis[0][0]))},${r1(baseY)}Z`, fill: true, opacity: 0.12, ...color });
      paths.push({ id: `s-${s.id}`, d, width: 2, ...color });
    } else if (kind === 'step') {
      let d = '';
      p.forEach(([x, y], k) => {
        if (!inY(y)) return;
        d += k === 0 || !inY(p[k - 1][1]) ? `M${r1(X(x))},${r1(Y(y))}` : `H${r1(X(x))}V${r1(Y(y))}`;
      });
      paths.push({ id: `s-${s.id}`, d, width: 2, ...color });
    } else if (kind === 'stem' || kind === 'samples') {
      if (kind === 'samples') {
        paths.push({ id: `s-${s.id}-analog`, d: polyline(dense.get(s.id) ?? []), width: 1.25, opacity: 0.35, ...color });
      }
      const vis = p.filter(([, y]) => inY(y));
      paths.push({ id: `s-${s.id}-stems`, d: vis.map(([x, y]) => `M${r1(X(x))},${r1(baseY)}V${r1(Y(y))}`).join(''), width: kind === 'stem' ? 2 : 1, opacity: kind === 'stem' ? 1 : 0.55, ...color });
      paths.push({ id: `s-${s.id}-dots`, d: vis.map(([x, y]) => circle(X(x), Y(y), kind === 'stem' ? 3.5 : 3)).join(''), fill: true, opacity: 1, ...color });
      // Rótulo de valor en cada stem (espectro: |F| = 1 en ω=2, 4 en ω=5).
      if (kind === 'stem' && vis.length <= 24) {
        const minGap = Math.max(...vis.map(([, y]) => textW(fmt(y), 10))) + 4;
        const spaced = vis.length < 2 || (X(vis[1][0]) - X(vis[0][0])) >= minGap;
        vis.forEach(([x, y], k) => {
          if (y === 0 && (!spaced || vis.some(([, v]) => v !== 0))) return;
          annotations.push({ id: `v-${s.id}-${k}`, text: fmt(y), x: X(x), y: y >= 0 ? Y(y) - 8 : Y(y) + 15, anchor: 'middle', size: 10, weight: 600, color: valueColor });
        });
      }
    } else if (kind === 'bars') {
      const rowH = (plotBottom - plotTop) / Math.max(1, cats.length);
      for (const b of s.bars ?? []) {
        const cy = plotTop + rowH * (barRow + 0.5);
        const x0 = X(Math.max(b.from, xScale.min)), x1 = X(Math.min(b.to, xScale.max));
        const hh = Math.min(9, rowH * 0.32);
        const rect = `M${r1(x0)},${r1(cy - hh)}H${r1(Math.max(x1, x0 + 2))}V${r1(cy + hh)}H${r1(x0)}Z`;
        paths.push({ id: `bar-${s.id}-${barRow}`, d: rect, fill: true, opacity: muted ? 0.12 : 0.3, ...color });
        paths.push({ id: `bar-${s.id}-${barRow}-o`, d: rect, width: 1.25, ...color });
        annotations.push({ id: `cat-${barRow}`, text: b.label, x: plotLeft - 8, y: cy + 4, anchor: 'end', size: 11, color: 'var(--ink)' });
        const txt = b.from === b.to ? fmt(b.to) : `${fmt(b.from)}–${fmt(b.to)}`;
        const tw = textW(txt, 10);
        const right = x1 + 6 + tw <= plotRight;
        annotations.push({
          id: `range-${barRow}`, text: txt, size: 10, color: valueColor, bg: true,
          x: right ? x1 + 6 : x0 - 6 >= plotLeft + tw ? x0 - 6 : x0 + 4, y: cy + 3.5,
          anchor: right ? 'start' : x0 - 6 >= plotLeft + tw ? 'end' : 'start',
        });
        barRow++;
      }
    }
  });

  // ── Referencias. Los rótulos se apilan si chocarían.
  const placed: { x0: number; x1: number; y: number }[] = [];
  const free = (x0: number, x1: number, y: number) => !placed.some((b) => Math.abs(b.y - y) < 13 && x0 < b.x1 + 4 && x1 > b.x0 - 4);
  for (const [k, r] of (input.hlines ?? []).entries()) {
    const y = Y(r.at);
    if (y < plotTop - 1 || y > plotBottom + 1) continue;
    const c = { state: r.state === 'idle' ? undefined : r.state, tone: r.tone, color: 'var(--muted)' };
    paths.push({ id: `hline-${k}`, d: `M${plotLeft},${r1(y)}H${plotRight}`, width: 1.25, dash: '5 4', ...c });
    if (r.label) {
      const tw = textW(r.label, 10);
      let ly = y - 5;
      if (!free(plotRight - 4 - tw, plotRight - 4, ly) || ly < plotTop + 10) ly = y + 13;
      placed.push({ x0: plotRight - 4 - tw, x1: plotRight - 4, y: ly });
      annotations.push({ id: `hline-label-${k}`, text: r.label, x: plotRight - 4, y: ly, anchor: 'end', size: 10, weight: 600, bg: true, color: c.state || c.tone ? pathColor(c) : 'var(--ink)' });
    }
  }
  for (const [k, r] of (input.vlines ?? []).entries()) {
    const x = X(r.at);
    if (x < plotLeft - 1 || x > plotRight + 1) continue;
    const c = { state: r.state === 'idle' ? undefined : r.state, tone: r.tone, color: 'var(--muted)' };
    paths.push({ id: `vline-${k}`, d: `M${r1(x)},${plotTop}V${plotBottom}`, width: 1.25, dash: '5 4', ...c });
    if (r.label) {
      const tw = textW(r.label, 10);
      const left = x + 4 + tw > plotRight;
      const x0 = left ? x - 4 - tw : x + 4;
      let ly = refStrip ? plotTop - 5 : plotTop + 11;
      while (!free(x0, x0 + tw, ly)) ly += 13;
      placed.push({ x0, x1: x0 + tw, y: ly });
      annotations.push({ id: `vline-label-${k}`, text: r.label, x: left ? x - 4 : x + 4, y: ly, anchor: left ? 'end' : 'start', size: 10, weight: 600, bg: true, color: c.state || c.tone ? pathColor(c) : 'var(--ink)' });
    }
  }

  // ── Leyenda.
  for (const l of legendRows) {
    const ly = 12 + l.row * 18;
    const lx = plotLeft + l.x;
    const kind = l.s.kind ?? 'line';
    const d = kind === 'stem' || kind === 'samples' ? `M${lx + 9},${ly + 5}V${ly - 5}` + circle(lx + 9, ly - 5, 2.5) : `M${lx},${ly}H${lx + 18}`;
    paths.push({ id: `legend-${l.s.id}`, d, width: kind === 'bars' ? 7 : 2, opacity: kind === 'bars' ? 0.5 : undefined, ...paint(l.s, l.i) });
    annotations.push({ id: `legend-label-${l.s.id}`, text: l.s.label, x: lx + 24, y: ly + 4, size: 11, color: 'var(--ink)' });
  }

  return { nodes: [], edges: [], groups: [], annotations, paths, width: W, height: H };
}
