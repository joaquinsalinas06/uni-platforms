// Layout puro de `timeline` — pram-models (APRAM/BSP/LogP),
// mpi-blocking-nonblocking (eager/rendezvous, deadlock). Cada `lane` es una
// fila horizontal; `events` son barras posicionadas por tiempo dentro de su
// fila (nodo `shape: 'cell'`, un rectángulo — igual convención que una
// celda de arreglo); `messages` son diagonales entre dos filas dibujadas
// como una arista entre dos puntos (`shape: 'port'`) — el ángulo de la
// diagonal ES la diferencia de tiempo, el diagrama clásico de LogP.
import { boxWidth, type CanvasNode, type CanvasEdge, type CanvasGroup, type CanvasText, type Frame } from '../canvas-types.ts';

export type TlLane = { id: string; label: string };
export type TlEvent = { lane: string; tStart: number; tEnd: number; label: string; state?: CanvasNode['state'] };
export type TlMessage = { fromLane: string; toLane: string; tStart: number; tEnd: number; label?: string; state?: CanvasNode['state'] };

const LABEL_W = 64;
const PAD_RIGHT = 16;
const LANE_H = 56;
const TOP_PAD = 20;
const EVENT_H = 24;

export function timelineLayout(
  lanes: TlLane[],
  events: TlEvent[] = [],
  messages: TlMessage[] = [],
  opts: { width?: number } = {},
): Frame {
  const width = opts.width ?? 560;
  const height = TOP_PAD * 2 + Math.max(1, lanes.length) * LANE_H;

  const laneY = new Map(lanes.map((l, i) => [l.id, TOP_PAD + LANE_H / 2 + i * LANE_H]));

  const allTimes = [...events.flatMap((e) => [e.tStart, e.tEnd]), ...messages.flatMap((m) => [m.tStart, m.tEnd])];
  let tMin = allTimes.length ? Math.min(...allTimes) : 0;
  let tMax = allTimes.length ? Math.max(...allTimes) : 1;
  if (tMin === tMax) tMax = tMin + 1;
  const plotLeft = LABEL_W;
  const plotRight = width - PAD_RIGHT;
  const toX = (t: number) => plotLeft + ((t - tMin) / (tMax - tMin)) * (plotRight - plotLeft);

  const groups: CanvasGroup[] = [];
  const annotations: CanvasText[] = [];
  lanes.forEach((l) => {
    const y = laneY.get(l.id)!;
    groups.push({ id: `lane-${l.id}`, x: plotLeft, y, w: plotRight - plotLeft, h: 1, style: 'ghost' });
    annotations.push({ id: `lane-label-${l.id}`, text: l.label, x: 4, y, anchor: 'start', size: 11 });
  });

  const nodes: CanvasNode[] = [];
  const edges: CanvasEdge[] = [];

  // Un evento corto ("copia al buffer", 1 de 5 unidades de ancho total) es
  // más angosto que su propio texto — con `label` fijo adentro (w explícito,
  // sin el piso de `boxWidth` que aplica VisualizationCanvas) el texto se
  // salía de la caja y se metía en el evento vecino, que arranca justo donde
  // termina éste. Si no entra, el nombre sale como anotación arriba, en dos
  // filas alternadas por lane — mismo criterio que ya resuelve esto en
  // memory-layout — para que dos eventos consecutivos angostos no choquen.
  const lastRowEndByLane = new Map<string, [number, number]>();
  events.forEach((e, i) => {
    const y = laneY.get(e.lane);
    if (y === undefined) return;
    const x1 = toX(e.tStart);
    const x2 = toX(e.tEnd);
    const cx = (x1 + x2) / 2;
    const w = Math.max(4, x2 - x1);
    const fits = w >= boxWidth(e.label, 12, 0);
    nodes.push({
      id: `event-${i}`,
      label: fits ? e.label : '',
      shape: 'cell',
      x: cx,
      y,
      w,
      h: EVENT_H,
      state: e.state,
    });
    if (!fits) {
      const halfW = boxWidth(e.label, 11, 0) / 2;
      const rowEnds = lastRowEndByLane.get(e.lane) ?? [-Infinity, -Infinity];
      const row = cx - halfW >= rowEnds[0] + 4 ? 0 : cx - halfW >= rowEnds[1] + 4 ? 1 : 0;
      rowEnds[row] = cx + halfW;
      lastRowEndByLane.set(e.lane, rowEnds);
      annotations.push({
        id: `event-label-${i}`,
        text: e.label,
        x: cx,
        y: y - EVENT_H / 2 - (row === 0 ? 8 : 20),
        anchor: 'middle',
        size: 10,
      });
    }
  });

  messages.forEach((m, i) => {
    const fromY = laneY.get(m.fromLane);
    const toY = laneY.get(m.toLane);
    if (fromY === undefined || toY === undefined) return;
    const sendId = `msg-${i}-send`;
    const recvId = `msg-${i}-recv`;
    nodes.push({ id: sendId, label: '', shape: 'port', x: toX(m.tStart), y: fromY, state: m.state });
    nodes.push({ id: recvId, label: '', shape: 'port', x: toX(m.tEnd), y: toY });
    edges.push({ id: `msg-edge-${i}`, from: sendId, to: recvId, kind: 'pointer', label: m.label, arrow: true });
  });

  // Cursor vertical de "ahora": una línea punteada que cruza todas las lanes
  // alineada con el primer nodo activo (evento o send de un mensaje) del
  // paso — el "dónde estamos" que el profesor marca a mano en sus diagramas
  // de LogP/APRAM en la pizarra.
  const activeX = nodes.find((n) => n.state === 'active')?.x;
  if (activeX !== undefined) {
    groups.push({ id: 'now-cursor', x: activeX, y: TOP_PAD - 6, w: 1, h: height - TOP_PAD * 2 + 12, style: 'ghost' });
  }

  return { nodes, edges, groups, annotations, width, height };
}
