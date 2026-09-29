// Layout puro de `xy-chart` — Amdahl/Gustafson/speedup vs p, nbody
// divide-and-conquer. Sin React/JSX: se testea con `node --test`.
//
// El contrato de canvas-types.ts no tiene un tipo "curva SVG" — sólo cajas
// (CanvasNode) y aristas rectas/curvas entre dos cajas (CanvasEdge). Una
// curva se dibuja entonces como lo que de verdad es: una cadena de puntos
// (nodos `shape: 'port'`, el mismo punto que ya usa `pointer` en árboles)
// unidos por aristas rectas consecutivas — el zig-zag entre puntos
// suficientemente cercanos SE VE como una curva continua, y el marcador en
// cada punto es justo lo que un gráfico de esta familia necesita mostrar.
import {
  type CanvasNode,
  type CanvasEdge,
  type CanvasGroup,
  type CanvasText,
  type Frame,
  type NodeState,
} from '../canvas-types.ts';

export type XySeries = { id: string; label: string; points: [number, number][] };

export type XyChartInput = {
  series: XySeries[];
  /** Igual convención que `highlight` en el resto de familias: si no está
   * vacío, la(s) serie(s) nombradas se pintan `active` y el resto `muted`
   * (contraste). Vacío = todas `idle` (sin énfasis). El schema no tiene un
   * campo de estado por serie — se deriva de `highlight` como en todo el resto. */
  highlight?: string[];
};

const PAD_LEFT = 46;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 30;
const TICKS = 5;

function niceNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const r = Math.round(n * 100) / 100;
  return String(r);
}

function seriesState(id: string, highlight: string[]): NodeState {
  if (highlight.length === 0) return 'idle';
  return highlight.includes(id) ? 'active' : 'muted';
}

/** Curvatura de un segmento cur→next, estilo Catmull-Rom: usa `prev`/`next`
 * (ya en coordenadas de pantalla) para estimar la tangente local en el punto
 * medio y la proyecta sobre la normal de la cuerda cur→next — así una serie
 * con pocos puntos de control se ve como una curva suave en vez de zig-zag.
 * En un extremo de la serie (falta `prev` o `next`) no hay tangente que
 * estimar: recto (0). */
function segmentCurve(
  prev: [number, number] | undefined,
  cur: [number, number],
  next: [number, number] | undefined,
  toX: (x: number) => number,
  toY: (y: number) => number,
): number {
  if (!prev || !next) return 0;
  const p = [toX(prev[0]), toY(prev[1])];
  const c = [toX(cur[0]), toY(cur[1])];
  const n = [toX(next[0]), toY(next[1])];
  // Tangente en el punto medio del segmento cur→next, estimada por la cuerda
  // prev→next (Catmull-Rom clásico).
  const tx = n[0] - p[0];
  const ty = n[1] - p[1];
  const dx = n[0] - c[0];
  const dy = n[1] - c[1];
  const len = Math.hypot(dx, dy) || 1;
  // Normal unitaria de la cuerda cur→next.
  const nx = -dy / len;
  const ny = dx / len;
  // Proyección de la tangente sobre esa normal — cuánto "se sale" la curva
  // de la línea recta — atenuada para no sobre-curvar.
  return (tx * nx + ty * ny) * 0.5;
}

export function xyChartLayout(
  input: XyChartInput,
  opts: { width?: number; height?: number } = {},
): Frame {
  const width = opts.width ?? 640;
  const height = opts.height ?? 300;
  const highlight = input.highlight ?? [];
  const allPoints = input.series.flatMap((s) => s.points);

  const xs = allPoints.map((p) => p[0]);
  const ys = allPoints.map((p) => p[1]);
  let xMin = xs.length ? Math.min(...xs) : 0;
  let xMax = xs.length ? Math.max(...xs) : 1;
  let yMin = ys.length ? Math.min(...ys) : 0;
  let yMax = ys.length ? Math.max(...ys) : 1;
  if (xMin === xMax) { xMin -= 1; xMax += 1; }
  if (yMin === yMax) { yMin -= 1; yMax += 1; }

  const plotLeft = PAD_LEFT;
  const plotRight = width - PAD_RIGHT;
  const plotTop = PAD_TOP;
  const plotBottom = height - PAD_BOTTOM;

  const toX = (x: number) => plotLeft + ((x - xMin) / (xMax - xMin)) * (plotRight - plotLeft);
  const toY = (y: number) => plotBottom - ((y - yMin) / (yMax - yMin)) * (plotBottom - plotTop);

  const nodes: CanvasNode[] = [];
  const edges: CanvasEdge[] = [];
  const groups: CanvasGroup[] = [];
  const annotations: CanvasText[] = [];

  // Ejes: un rect de 1px de alto/ancho ES una línea — reusa CanvasGroup, no
  // hace falta ningún tipo nuevo en canvas-types.ts.
  groups.push({ id: 'axis-x', x: plotLeft, y: plotBottom, w: plotRight - plotLeft, h: 1, style: 'ghost' });
  groups.push({ id: 'axis-y', x: plotLeft, y: plotTop, w: 1, h: plotBottom - plotTop, style: 'ghost' });

  for (let i = 0; i <= TICKS; i++) {
    const t = i / TICKS;
    const xVal = xMin + t * (xMax - xMin);
    const yVal = yMin + t * (yMax - yMin);
    annotations.push({
      id: `tick-x-${i}`,
      text: niceNumber(xVal),
      x: toX(xVal),
      y: plotBottom + 14,
      anchor: 'middle',
      size: 10,
    });
    annotations.push({
      id: `tick-y-${i}`,
      text: niceNumber(yVal),
      x: plotLeft - 6,
      y: toY(yVal),
      anchor: 'end',
      size: 10,
    });
  }

  // Con muchas series juntas (p.ej. una comparación con 3+ curvas de 7+
  // puntos), etiquetar cada punto de cada serie amontona el gráfico. Con
  // pocos puntos (el caso real: Amdahl/Gustafson traen 7) se etiquetan todos;
  // por encima del umbral, 1 de cada N para mantenerlo legible.
  const POINT_LABEL_THRESHOLD = 10;

  for (const s of input.series) {
    const state = seriesState(s.id, highlight);
    const labelStep = s.points.length > POINT_LABEL_THRESHOLD
      ? Math.ceil(s.points.length / POINT_LABEL_THRESHOLD)
      : 1;
    const textState: 'idle' | 'active' | 'muted' =
      state === 'idle' ? 'idle' : state === 'active' ? 'active' : 'muted';
    s.points.forEach(([x, y], idx) => {
      const id = `${s.id}-p${idx}`;
      const px = toX(x);
      const py = toY(y);
      nodes.push({ id, label: '', shape: 'port', x: px, y: py, state });
      const isLast = idx === s.points.length - 1;
      if (idx % labelStep === 0 || isLast) {
        // Arriba-a-la-derecha del punto por defecto; cerca del borde derecho
        // (el último punto suele estar ahí) se ancla a la izquierda para no
        // salirse del plot.
        const nearRightEdge = px > plotRight - 40;
        annotations.push({
          id: `coord-${id}`,
          text: `(${niceNumber(x)}, ${niceNumber(y)})`,
          x: nearRightEdge ? px - 6 : px + 6,
          y: py - 6,
          anchor: nearRightEdge ? 'end' : 'start',
          size: 9,
          state: textState,
        });
      }
      if (idx > 0) {
        const curve = segmentCurve(s.points[idx - 2], s.points[idx - 1], s.points[idx], toX, toY);
        edges.push({
          from: `${s.id}-p${idx - 1}`,
          to: id,
          id: `${s.id}-e${idx}`,
          kind: 'tree',
          state: state === 'idle' ? undefined : state === 'active' ? 'active' : 'muted',
          curve,
        });
      }
    });
    const last = s.points[s.points.length - 1];
    if (last) {
      annotations.push({
        id: `label-${s.id}`,
        text: s.label,
        x: toX(last[0]) + 6,
        y: toY(last[1]),
        anchor: 'start',
        size: 11,
        state: state === 'muted' ? 'muted' : state === 'active' ? 'active' : 'idle',
      });
    }
  }

  return { nodes, edges, groups, annotations, width, height };
}
