import type { CanvasPath, CanvasText, Frame, NodeState } from '../canvas-types.ts';

export type XY = [number, number];
export type PlanarPoint = { id: string; x: number; y: number; label?: string; state?: NodeState };
export type PlanarSegment = { id: string; from: XY; to: XY; label?: string; state?: NodeState; dash?: boolean; arrow?: boolean };
export type PlanarPolygon = { id: string; vertices: XY[]; label?: string; labelAt?: XY; state?: NodeState };
export type PlanarInput = {
  bounds: [number, number, number, number];
  points?: PlanarPoint[];
  segments?: PlanarSegment[];
  polygons?: PlanarPolygon[];
  query?: { x: number; y: number };
  mode?: 'parity' | 'ray' | 'dominance' | 'range' | 'sweep';
  range?: [number, number, number, number];
  sweepX?: number;
  /** At an endpoint, remove only after processing queries at that x. */
  sweepAfter?: boolean;
  rayDirection?: 'up' | 'right';
  showRay?: boolean;
  showHits?: boolean;
  xLabel?: string;
  yLabel?: string;
};
const EPS = 1e-9;
const between = (x: number, a: number, b: number) => x >= Math.min(a, b) - EPS && x <= Math.max(a, b) + EPS;
export function onSegment(p: XY, a: XY, b: XY): boolean {
  const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  return Math.abs(cross) <= EPS * Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1])) && between(p[0], a[0], b[0]) && between(p[1], a[1], b[1]);
}
/** Half-open y intervals count a vertex once; horizontal edges never toggle parity. */
export function polygonQuery(p: XY, vertices: XY[]) {
  const hits: XY[] = [];
  let boundary = false;
  vertices.forEach((a, i) => {
    const b = vertices[(i + 1) % vertices.length];
    if (onSegment(p, a, b)) boundary = true;
    if ((a[1] > p[1]) !== (b[1] > p[1])) {
      const x = a[0] + (p[1] - a[1]) * (b[0] - a[0]) / (b[1] - a[1]);
      if (x > p[0]) hits.push([x, p[1]]);
    }
  });
  hits.sort((a, b) => a[0] - b[0]);
  // Two incident edges at a tangency do not cross from inside to outside.
  const crossings = hits.filter((p, i) => {
    const first = hits.findIndex(h => Math.abs(h[0] - p[0]) < EPS);
    const count = hits.filter(h => Math.abs(h[0] - p[0]) < EPS).length;
    return i === first && count % 2 === 1;
  });
  return { hits: crossings, location: boundary ? 'frontera' : hits.length % 2 ? 'dentro' : 'fuera' };
}

/** Nearest intersection on a closed segment, including collinear verticals. */
export function rayHits(query: XY, segments: PlanarSegment[], direction: 'up' | 'right' = 'up') {
  const axis = direction === 'up' ? 0 : 1;
  const along = 1 - axis;
  return segments.flatMap((s) => {
    const a = s.from, b = s.to;
    if (!between(query[axis], a[axis], b[axis])) return [];
    let v: number;
    if (Math.abs(a[axis] - b[axis]) < EPS) {
      if (Math.abs(query[axis] - a[axis]) > EPS || Math.max(a[along], b[along]) < query[along] - EPS) return [];
      v = Math.max(query[along], Math.min(a[along], b[along]));
    } else {
      v = a[along] + (query[axis] - a[axis]) * (b[along] - a[along]) / (b[axis] - a[axis]);
      if (v < query[along] - EPS) return [];
    }
    const point: XY = direction === 'up' ? [query[0], v] : [v, query[1]];
    return [{ id: s.id, point, distance: Math.max(0, v - query[along]) }];
  }).sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
}

export function sweepOrder(input: PlanarInput) {
  const x = input.sweepX ?? input.bounds[0];
  return (input.segments ?? []).flatMap((s) => {
    if (Math.abs(s.from[0] - s.to[0]) < EPS || !between(x, s.from[0], s.to[0])) return [];
    if (input.sweepAfter && x >= Math.max(s.from[0], s.to[0]) - EPS) return [];
    const y = s.from[1] + (x - s.from[0]) * (s.to[1] - s.from[1]) / (s.to[0] - s.from[0]);
    return [{ id: s.id, point: [x, y] as XY }];
  }).sort((a, b) => a.point[1] - b.point[1] || a.id.localeCompare(b.id));
}

export function planarResult(input: PlanarInput): { summary: string; hits: XY[]; selected: string[] } {
  const q = input.query;
  if (input.mode === 'parity' && q) {
    const results = (input.polygons ?? []).map(p => ({ id: p.id, ...polygonQuery([q.x, q.y], p.vertices) }));
    const boundary = results.find(r => r.location === 'frontera');
    const inside = results.filter(r => r.location === 'dentro');
    return { summary: boundary ? `Q está en la frontera de ${boundary.id}. La paridad no decide el borde.` : results.map(r => `${r.id}: ${r.hits.length} cruces → ${r.location}`).join(' · ') + (inside.length ? '' : ' · cara infinita'), hits: boundary ? [] : (inside[0] ?? results[0])?.hits ?? [], selected: boundary ? [boundary.id] : inside.map(r => r.id) };
  }
  if (input.mode === 'ray' && q) {
    const hits = rayHits([q.x, q.y], input.segments ?? [], input.rayDirection);
    const nearest = hits.filter(h => Math.abs(h.distance - (hits[0]?.distance ?? 0)) < EPS);
    return { summary: hits.length ? `Primer impacto: ${nearest.map(h => h.id).join(', ')} · (${hits[0].point.map(v => +v.toFixed(2)).join(', ')})` : 'Sin impacto: el rayo continúa hacia el infinito.', hits: nearest.filter((h,i) => nearest.findIndex(other => Math.hypot(other.point[0]-h.point[0], other.point[1]-h.point[1]) < EPS) === i).map(h => h.point), selected: nearest.map(h => h.id) };
  }
  if (input.mode === 'dominance' && q) {
    const selected = (input.points ?? []).filter(p => p.x <= q.x && p.y <= q.y).map(p => p.id);
    return { summary: `${selected.length} dominados: ${selected.join(', ') || 'ninguno'}`, hits: (input.points ?? []).filter(p => selected.includes(p.id)).map(p => [p.x, q.y]), selected };
  }
  if (input.mode === 'range' && input.range) {
    const [x0, y0, x1, y1] = input.range;
    const selected = (input.points ?? []).filter(p => between(p.x, x0, x1) && between(p.y, y0, y1)).map(p => p.id);
    return { summary: `${selected.length} puntos en el rango: ${selected.join(', ') || 'ninguno'}`, hits: [], selected };
  }
  if (input.mode === 'sweep') {
    const order = sweepOrder(input);
    const verticals = (input.segments ?? []).filter(s => Math.abs(s.from[0] - s.to[0]) < EPS && Math.abs(s.from[0] - (input.sweepX ?? input.bounds[0])) < EPS);
    const hits = verticals.flatMap(v => order.filter(s => between(s.point[1], v.from[1], v.to[1])).map(s => s.point));
    return { summary: `Orden de abajo arriba: ${order.map(s => s.id).join(' < ') || 'vacío'}${verticals.length ? ` · ${hits.length} cruces con la vertical` : ''}`, hits, selected: order.map(s => s.id) };
  }
  return { summary: '', hits: [], selected: [] };
}

export function planeGeometry(bounds: PlanarInput['bounds'], width = 640) {
  const [x0, y0, x1, y1] = bounds;
  const scale = Math.min((width - 88) / (x1 - x0), 390 / (y1 - y0));
  const plotWidth = (x1 - x0) * scale;
  const plotHeight = (y1 - y0) * scale;
  const left = (width - plotWidth) / 2;
  const top = 32;
  return { width, height: plotHeight + 84, left, top, plotWidth, plotHeight, scale, px: (x: number) => left + (x - x0) * scale, py: (y: number) => top + (y1 - y) * scale };
}

export function planarLayout(input: PlanarInput, width = 640): Frame {
  const g = planeGeometry(input.bounds, width);
  const [x0, y0, x1, y1] = input.bounds;
  const paths: CanvasPath[] = [], annotations: CanvasText[] = [];
  const result = planarResult(input);
  const occupied: { x: number; y: number; w: number; h: number }[] = [];
  const label = (id: string, text: string, x: number, y: number) => {
    const w = text.length * 7.2 + 6;
    const candidates = [[x + 9, y - 10], [x + 9, y + 21], [x - w - 9, y - 10], [x - w - 9, y + 21]];
    const boxes = candidates.map(([a, b]) => ({ x: Math.max(3, Math.min(width - w - 3, a)), y: Math.max(16, Math.min(g.height - 22, b)), w, h: 17 }));
    const box = boxes.find(b => !occupied.some(o => b.x < o.x + o.w && b.x + b.w > o.x && b.y - b.h < o.y && b.y > o.y - o.h)) ?? boxes[0];
    occupied.push(box);
    annotations.push({ id: `${id}-label`, text, x: box.x, y: box.y, size: 12, weight: 500, color: 'var(--ink)', bg: 'var(--fill)' });
  };
  const line = (id: string, a: XY, b: XY, state?: NodeState, dash = false, arrow = false) => paths.push({ id, d: `M${g.px(a[0])},${g.py(a[1])}L${g.px(b[0])},${g.py(b[1])}`, state, width: state ? 2.6 : 1.8, dash: dash ? '5 4' : undefined, arrow, color: state ? undefined : 'var(--muted)' });
  const dot = (id: string, p: XY, state?: NodeState, r = 4.5) => paths.push({ id, d: `M${g.px(p[0]) - r},${g.py(p[1])}a${r},${r} 0 1,0 ${2*r},0a${r},${r} 0 1,0 ${-2*r},0`, fill: true, opacity: 1, state });
  const tickStep = (span: number) => { const rough = span / (width < 420 ? 4 : 7); const power = 10 ** Math.floor(Math.log10(rough)); return [1, 2, 5, 10].find(n => n * power >= rough)! * power; };
  const dx = tickStep(x1 - x0), dy = tickStep(y1 - y0);
  for (let x = Math.ceil(x0 / dx) * dx; x <= x1; x += dx) {
    paths.push({ id: `grid-x-${x}`, d: `M${g.px(x)},${g.top}v${g.plotHeight}`, color: 'var(--rule)', dash: '2 5' });
    annotations.push({ id: `tick-x-${x}`, text: String(+x.toFixed(4)), x: g.px(x), y: g.top + g.plotHeight + 20, anchor: 'middle', size: 11 });
  }
  for (let y = Math.ceil(y0 / dy) * dy; y <= y1; y += dy) {
    paths.push({ id: `grid-y-${y}`, d: `M${g.left},${g.py(y)}h${g.plotWidth}`, color: 'var(--rule)', dash: '2 5' });
    annotations.push({ id: `tick-y-${y}`, text: String(+y.toFixed(4)), x: g.left - 10, y: g.py(y) + 4, anchor: 'end', size: 11 });
  }
  line('axis-x', [x0, y0], [x1, y0], undefined, false, true);
  line('axis-y', [x0, y0], [x0, y1], undefined, false, true);
  annotations.push({ id: 'xlabel', text: input.xLabel ?? 'x', x: g.left + g.plotWidth, y: g.height - 9, anchor: 'end', size: 12 });
  annotations.push({ id: 'ylabel', text: input.yLabel ?? 'y', x: g.left, y: 17, size: 12 });
  const region = (id: string, vertices: XY[], state: NodeState = 'marked') => {
    const d = vertices.map((p, i) => `${i ? 'L' : 'M'}${g.px(p[0])},${g.py(p[1])}`).join('') + 'Z';
    paths.push({ id: `${id}-fill`, d, fill: true, opacity: 0.09, state });
    paths.push({ id, d, width: 2, state });
  };
  for (const p of input.polygons ?? []) {
    region(p.id, p.vertices, result.selected.includes(p.id) && input.showHits !== false ? 'answer' : p.state ?? 'marked');
    if (p.label) { const v = p.labelAt ?? p.vertices[0]; label(p.id, p.label, g.px(v[0]), g.py(v[1])); }
  }
  if (input.range) { const [a,b,c,d] = input.range; region('range', [[a,b],[c,b],[c,d],[a,d]]); }
  for (const s of input.segments ?? []) {
    const selected = result.selected.includes(s.id);
    line(s.id, s.from, s.to, input.showHits === false ? s.state : selected ? input.mode === 'sweep' ? 'active' : 'answer' : s.state, s.dash, s.arrow);
    if (s.label || selected) label(s.id, s.label ?? s.id, g.px((s.from[0] + s.to[0])/2), g.py((s.from[1] + s.to[1])/2));
  }
  if (input.mode === 'sweep') line('sweep', [input.sweepX ?? x0,y0], [input.sweepX ?? x0,y1], 'active', true, true);
  for (const p of input.points ?? []) {
    const selected = result.selected.includes(p.id);
    if (input.mode === 'dominance') line(`ray-${p.id}`, [p.x,p.y], [p.x,y1], selected ? 'answer' : undefined, true, true);
    const state = p.state ?? (selected ? 'answer' : undefined);
    dot(p.id, [p.x,p.y], state);
    label(p.id, p.label ?? p.id, g.px(p.x), g.py(p.y));
  }
  const q = input.query;
  if (q) {
    if (input.showRay !== false && ['ray','parity','dominance'].includes(input.mode ?? '')) {
      const end: XY = input.mode === 'dominance' ? [x0,q.y] : input.mode === 'parity' || input.rayDirection === 'right' ? [x1,q.y] : [q.x,y1];
      const stop = input.mode === 'ray' && input.showHits !== false ? result.hits[0] : undefined;
      line('query-ray', [q.x,q.y], stop ?? end, 'active', !stop, true);
    }
    dot('query', [q.x,q.y], 'active', 6);
    label('query', `Q (${+q.x.toFixed(1)}, ${+q.y.toFixed(1)})`, g.px(q.x), g.py(q.y));
  }
  if (input.showHits !== false) result.hits.forEach((p,i) => { dot(`hit-${i}`, p, 'answer', 5); label(`hit-${i}`, String(i+1), g.px(p[0]), g.py(p[1])); });
  return { nodes: [], edges: [], groups: [], paths, annotations, width, height: g.height };
}
