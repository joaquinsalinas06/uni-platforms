// Layout puro de `dag` — usado por temas como iot-architecture, sensors o
// actuators para sus árboles de conceptos. Sugiyama simplificado y
// determinista: nivel = distancia desde la raíz siguiendo `parent`, posición
// horizontal repartida uniformemente dentro de cada nivel. Nada de
// simulación física — dos renders del mismo input dan el mismo layout.
import type { CanvasNode, CanvasEdge, Frame } from '../canvas-types.ts';

export type DagNode = {
  id: string;
  value: string | number;
  tag?: string;
  parent: string | null;
  state?: CanvasNode['state'];
};

export type DagLink = {
  from: string;
  to: string;
  kind?: CanvasEdge['kind'];
  label?: string;
  curve?: number;
  bidirectional?: boolean;
};

const LEVEL_H = 70;
const NODE_GAP = 64;
const TOP_PAD = 30;

/** Barycenter de Sugiyama: reordena cada nivel (in-place) por la posición
 * promedio de sus predecesores/sucesores ya ordenados en el nivel vecino, en
 * pasadas alternadas top-down/bottom-up. Determinista: el desempate usa el
 * índice ORIGINAL del nodo dentro de su nivel, así que un nodo sin
 * predecesores/sucesores conocidos (o con barycenter empatado) mantiene su
 * posición relativa en vez de barajarse. */
function orderLevels(
  levels: Map<number, DagNode[]>,
  predecessors: Map<string, string[]>,
  successors: Map<string, string[]>,
  passes = 3,
): void {
  const levelKeys = [...levels.keys()].sort((a, b) => a - b);
  const indexOf = (row: DagNode[]) => new Map(row.map((n, i) => [n.id, i]));
  const reorderBy = (row: DagNode[], neighborIndex: Map<string, number>, neighbors: Map<string, string[]>) => {
    const scored = row.map((n, i) => {
      const idxs = (neighbors.get(n.id) ?? [])
        .map((id) => neighborIndex.get(id))
        .filter((v): v is number => v !== undefined);
      const bary = idxs.length ? idxs.reduce((a, b) => a + b, 0) / idxs.length : i;
      return { n, i, bary };
    });
    scored.sort((a, b) => a.bary - b.bary || a.i - b.i);
    row.splice(0, row.length, ...scored.map((s) => s.n));
  };

  for (let pass = 0; pass < passes; pass++) {
    for (let li = 1; li < levelKeys.length; li++) {
      const prevIndex = indexOf(levels.get(levelKeys[li - 1])!);
      reorderBy(levels.get(levelKeys[li])!, prevIndex, predecessors);
    }
    for (let li = levelKeys.length - 2; li >= 0; li--) {
      const nextIndex = indexOf(levels.get(levelKeys[li + 1])!);
      reorderBy(levels.get(levelKeys[li])!, nextIndex, successors);
    }
  }
}

export function dagLayout(
  nodes: DagNode[],
  links: DagLink[] = [],
  opts: { width?: number; criticalPath?: string[] } = {},
): Frame {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // Todo predecesor de un nodo, venga de `parent` (árbol de un solo padre) o
  // de `links` (un nodo con VARIOS padres — un merge/reducción no cabe en
  // `parent`, que es un solo string). Ambos usan la misma convención de
  // dirección: `from`/`parent` queda un nivel ARRIBA de `to`/el nodo hijo.
  // Sin sumar `links` acá, un DAG donde todo nodo trae `parent: null` (porque
  // su estructura real es de múltiples padres, expresada sólo en `links`)
  // caía entero en el nivel 0 — una sola fila plana en vez del árbol.
  const predecessors = new Map<string, string[]>();
  for (const n of nodes) {
    if (n.parent !== null && byId.has(n.parent)) {
      predecessors.set(n.id, [...(predecessors.get(n.id) ?? []), n.parent]);
    }
  }
  for (const l of links) {
    if (byId.has(l.from) && byId.has(l.to)) {
      predecessors.set(l.to, [...(predecessors.get(l.to) ?? []), l.from]);
    }
  }

  // Mapa inverso de `predecessors` — quién depende de mí. Se usa tanto para
  // la pasada bottom-up del barycenter como, potencialmente, por quien quiera
  // recorrer el DAG hacia adelante.
  const successors = new Map<string, string[]>();
  for (const [to, froms] of predecessors) {
    for (const from of froms) {
      successors.set(from, [...(successors.get(from) ?? []), to]);
    }
  }

  // Nivel = distancia MÁS LARGA desde una raíz (sin predecesores) — camino
  // más largo en un DAG, memoizado; un ciclo accidental (dato mal armado) se
  // corta tratando el nodo ya visitado como raíz en vez de reventar el layout.
  const levelCache = new Map<string, number>();
  function levelOf(id: string, seen = new Set<string>()): number {
    if (levelCache.has(id)) return levelCache.get(id)!;
    const preds = predecessors.get(id) ?? [];
    if (preds.length === 0 || seen.has(id)) {
      levelCache.set(id, 0);
      return 0;
    }
    const nextSeen = new Set(seen).add(id);
    const lvl = Math.max(...preds.map((p) => levelOf(p, nextSeen))) + 1;
    levelCache.set(id, lvl);
    return lvl;
  }

  const levels = new Map<number, DagNode[]>();
  for (const n of nodes) {
    const lvl = levelOf(n.id);
    if (!levels.has(lvl)) levels.set(lvl, []);
    levels.get(lvl)!.push(n);
  }

  orderLevels(levels, predecessors, successors);

  const maxPerLevel = Math.max(1, ...[...levels.values()].map((row) => row.length));
  const width = opts.width ?? Math.max(360, maxPerLevel * NODE_GAP + 40);

  const criticalPath = opts.criticalPath ?? [];
  const criticalSet = new Set(criticalPath);
  const criticalPairs = new Set(criticalPath.slice(1).map((id, i) => `${criticalPath[i]}->${id}`));

  const canvasNodes: CanvasNode[] = [];
  for (const [lvl, row] of levels) {
    const rowWidth = row.length * NODE_GAP;
    const startX = (width - rowWidth) / 2 + NODE_GAP / 2;
    row.forEach((n, i) => {
      canvasNodes.push({
        id: n.id,
        label: String(n.value),
        tag: n.tag,
        x: startX + i * NODE_GAP,
        y: TOP_PAD + lvl * LEVEL_H,
        state: n.state ?? (criticalSet.has(n.id) ? 'answer' : undefined),
      });
    });
  }

  // Arista de árbol implícita en `parent` (backbone), más las explícitas de
  // `links` (segundo padre, arista de canal/dependencia, etc.) — no se
  // pisan: un autor no repite en `links` lo que `parent` ya dibuja.
  const criticalEdgeState = (from: string, to: string): CanvasEdge['state'] =>
    criticalPairs.has(`${from}->${to}`) ? 'answer' : undefined;

  const edges: CanvasEdge[] = [];
  for (const n of nodes) {
    if (n.parent !== null && byId.has(n.parent)) {
      edges.push({ id: `${n.parent}-${n.id}`, from: n.parent, to: n.id, kind: 'tree', state: criticalEdgeState(n.parent, n.id) });
    }
  }
  for (const l of links) {
    edges.push({
      id: `link-${l.from}-${l.to}`,
      from: l.from,
      to: l.to,
      kind: l.kind ?? 'pointer',
      label: l.label,
      curve: l.curve,
      arrow: true,
      arrowStart: l.bidirectional ?? false,
      state: criticalEdgeState(l.from, l.to),
    });
  }

  const height = TOP_PAD * 2 + (levels.size - 1) * LEVEL_H + LEVEL_H / 2;

  return { nodes: canvasNodes, edges, groups: [], annotations: [], width, height: Math.max(height, 140) };
}
