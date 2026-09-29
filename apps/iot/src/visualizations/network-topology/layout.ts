// Layout puro de `network-topology` — mpi-intro, mpi-collectives
// (bcast/scatter/gather/reduce/allgather/allreduce), partitioning-randomized
// (broadcast lineal vs árbol). Geometría fija por topología, inferida de la
// FORMA de `dataFlow`:
//   - todos-a-uno / uno-a-todos (gather/scatter/bcast/reduce) → radial, el
//     proceso hub (el que aparece como único `from` o único `to`) al centro.
//   - cadena (cada proceso manda/recibe a lo sumo de otro, forma un camino)
//     → fila lineal (broadcast en árbol lineal, pipeline).
//   - todo lo demás (sin dataFlow, o many-to-many como allgather/allreduce)
//     → anillo, todos los procesos a igual distancia del centro.
import type { CanvasNode, CanvasEdge, Frame } from '../canvas-types.ts';

export type NtProcess = { id: string; label: string; state?: CanvasNode['state'] };
export type NtDataFlow = { from: string; to: string; label?: string };

const RADIUS = 95;
const CENTER_Y_OFFSET = 10;

function ring(processes: NtProcess[], width: number, height: number): Map<string, { x: number; y: number }> {
  const cx = width / 2;
  const cy = height / 2 + CENTER_Y_OFFSET;
  const pos = new Map<string, { x: number; y: number }>();
  processes.forEach((p, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, processes.length) - Math.PI / 2;
    pos.set(p.id, { x: cx + RADIUS * Math.cos(angle), y: cy + RADIUS * Math.sin(angle) });
  });
  return pos;
}

function radial(
  processes: NtProcess[],
  hubId: string,
  width: number,
  height: number,
): Map<string, { x: number; y: number }> {
  const cx = width / 2;
  const cy = height / 2 + CENTER_Y_OFFSET;
  const others = processes.filter((p) => p.id !== hubId);
  const pos = new Map<string, { x: number; y: number }>();
  pos.set(hubId, { x: cx, y: cy });
  others.forEach((p, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, others.length) - Math.PI / 2;
    pos.set(p.id, { x: cx + RADIUS * Math.cos(angle), y: cy + RADIUS * Math.sin(angle) });
  });
  return pos;
}

function line(processes: NtProcess[], width: number, height: number): Map<string, { x: number; y: number }> {
  const y = height / 2;
  const gap = Math.min(90, (width - 60) / Math.max(1, processes.length - 1));
  const startX = width / 2 - (gap * (processes.length - 1)) / 2;
  const pos = new Map<string, { x: number; y: number }>();
  processes.forEach((p, i) => pos.set(p.id, { x: startX + i * gap, y }));
  return pos;
}

/** Detecta hub uno-a-todos/todos-a-uno: un `from` único con >1 destinos
 * distintos, o un `to` único con >1 orígenes distintos. */
function findHub(dataFlow: NtDataFlow[]): string | null {
  const froms = new Set(dataFlow.map((d) => d.from));
  const tos = new Set(dataFlow.map((d) => d.to));
  if (froms.size === 1 && tos.size > 1) return [...froms][0];
  if (tos.size === 1 && froms.size > 1) return [...tos][0];
  return null;
}

/** Detecta cadena: cada proceso involucrado tiene a lo sumo 1 flujo entrante
 * y 1 saliente (un pipeline / broadcast en árbol lineal). */
function isChain(dataFlow: NtDataFlow[]): boolean {
  if (dataFlow.length === 0) return false;
  const outCount = new Map<string, number>();
  const inCount = new Map<string, number>();
  const involved = new Set<string>();
  for (const d of dataFlow) {
    outCount.set(d.from, (outCount.get(d.from) ?? 0) + 1);
    inCount.set(d.to, (inCount.get(d.to) ?? 0) + 1);
    involved.add(d.from);
    involved.add(d.to);
  }
  const degreeOk = [...outCount.values()].every((c) => c <= 1) && [...inCount.values()].every((c) => c <= 1);
  if (!degreeOk) return false;
  // Un intercambio par a par (p0<->p1) cumple "≤1 entrante/saliente" por
  // nodo pero es un CICLO de 2, no una fila — exige exactamente un origen
  // sin entrada (`inCount` 0) para ser una fila genuina de un solo tramo.
  const startsWithNoIncoming = [...involved].filter((id) => (inCount.get(id) ?? 0) === 0);
  return startsWithNoIncoming.length === 1;
}

export function networkTopologyLayout(
  processes: NtProcess[],
  dataFlow: NtDataFlow[] = [],
  opts: { width?: number; height?: number } = {},
): Frame {
  const width = opts.width ?? 460;
  const height = opts.height ?? 260;

  const hub = findHub(dataFlow);
  let pos: Map<string, { x: number; y: number }>;
  let topology: 'radial' | 'line' | 'ring';
  if (hub) {
    pos = radial(processes, hub, width, height);
    topology = 'radial';
  } else if (isChain(dataFlow)) {
    pos = line(processes, width, height);
    topology = 'line';
  } else {
    pos = ring(processes, width, height);
    topology = 'ring';
  }

  const nodes: CanvasNode[] = processes.map((p) => {
    const xy = pos.get(p.id) ?? { x: width / 2, y: height / 2 };
    return { id: p.id, label: p.label, x: xy.x, y: xy.y, state: p.state };
  });

  const edges: CanvasEdge[] = dataFlow.map((d, i) => ({
    id: `flow-${i}-${d.from}-${d.to}`,
    from: d.from,
    to: d.to,
    kind: 'pointer',
    label: d.label,
    arrow: true,
    // En anillo, dos flujos entre el mismo par pero direcciones opuestas
    // (allgather/allreduce) se curvan para no superponerse — igual criterio
    // que ya usa VisualizationCanvas por defecto para `pointer`, pero acá
    // se fuerza explícito porque en radial/line la mayoría de las aristas
    // SÍ deben ir rectas (mensaje único hub↔hoja).
    curve: topology === 'ring' ? 18 : 0,
    // Todo `dataFlow` de esta familia representa datos moviéndose
    // literalmente por la red (un mensaje/paquete de un colectivo MPI), así
    // que la partícula de flujo aplica siempre, no condicionalmente.
    flow: true,
  }));

  return { nodes, edges, groups: [], annotations: [], width, height };
}

export { findHub, isChain };
