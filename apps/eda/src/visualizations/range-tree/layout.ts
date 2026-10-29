// Familia `range-tree`: range-tree (1D y 2D anidado), fractional-cascading y
// layered-range-tree. Dos layouts, no uno — el caso de "capas" no es un
// árbol (son arreglos ordenados con puentes entre posiciones), forzarlo en
// el layout de árbol sería peor que tenerlos separados.

import { tidy, scale, type OrderedNode } from '../shared/tidy-tree.ts';
import { boxWidth, CELL_W, CELL_H, type Frame, type CanvasNode, type CanvasEdge, type CanvasGroup, type CanvasText } from '../canvas-types.ts';

export const W = 720;
const ROW_GAP = 56;
const TOP = 34;

export type RangeState = 'idle' | 'marked' | 'answer' | 'muted';
export type RangeMode = 'tree' | 'layers';

export type RangeNode = {
  id: string;
  value: string | number;
  parent?: string | null;
  state?: RangeState;
  tag?: string;
  /** 'primary' (default) | 'secondary' | cualquier otro id de panel del 2D anidado. */
  panel?: string;
};

export type RangePanel = { id: string; label: string; anchor?: string };

export type RangeArray = {
  id: string;
  label?: string;
  /** 0 = fila del padre, 1 = fila de los hijos. */
  row: number;
  /** default 'full' */
  slot?: 'left' | 'right' | 'full';
  cells: (string | number)[];
  states?: RangeState[];
};

export type RangeBridge = { from: string; fromIndex: number; to: string; toIndex: number; active?: boolean };

export type RangeStep = {
  note: string;
  /** default 'tree' */
  mode?: RangeMode;
  nodes?: RangeNode[];
  panels?: RangePanel[];
  arrays?: RangeArray[];
  /** Si falta, se derivan por lower_bound — ver deriveBridges(). */
  bridges?: RangeBridge[];
  highlight?: string[];
  caption?: string;
};

function toOrdered(nodes: RangeNode[]): OrderedNode[] {
  return nodes.map((n) => ({ id: n.id, label: String(n.value), parent: n.parent ?? null }));
}

function wrapLabel(text: string, width: number, fontSize = 11): string[] {
  const limit = Math.max(8, Math.floor(width / (fontSize * 0.6)));
  const lines: string[] = [];
  for (const word of text.split(/\s+/)) {
    const chunks = word.match(new RegExp(`.{1,${limit}}`, 'gu')) ?? [];
    for (const chunk of chunks) {
      const last = lines.length-1;
      if (last >= 0 && lines[last].length + chunk.length + 1 <= limit) lines[last] += ' '+chunk;
      else lines.push(chunk);
    }
  }
  return lines;
}

/** Ancho mínimo a escala 1: los nodos de una misma fila nunca se pisan. */
function minimumTreeWidth(nodes: RangeNode[]): number {
  const placed = tidy(toOrdered(nodes));
  const pad = Math.max(24, ...nodes.map((n) => boxWidth(String(n.value)) / 2 + 12));
  let gap = 0;
  for (const a of placed) for (const b of placed) {
    if (a.depth === b.depth && b.x > a.x) {
      gap = Math.max(gap, (boxWidth(a.label) / 2 + boxWidth(b.label) / 2 + 12) / (b.x-a.x));
    }
  }
  const xs = placed.map((n) => n.x);
  const span = placed.length ? Math.max(...xs)-Math.min(...xs) : 0;
  return Math.max(300, gap * (span+2) + pad*2);
}

export function rangeTreeWidth(step: RangeStep): number {
  const primary = (step.nodes ?? []).filter((n) => !n.panel || n.panel === 'primary');
  return Math.max(minimumTreeWidth(primary), ...(step.panels ?? []).map((p) => minimumTreeWidth((step.nodes ?? []).filter((n) => n.panel === p.id)) + 48));
}

/** 1D (#29), la consulta (#35) y el 2D anidado (#47): árbol primario en X, y
 * un árbol secundario colgado del nodo ancla dentro de un panel propio.
 *
 * Propiedad importante: la geometría NUNCA depende de `state` — durante los
 * pasos de una consulta ningún nodo cambia de posición, sólo de color, que
 * es lo que hace legible el paso a paso. */
export function layoutRangeTree(step: RangeStep, canvasWidth = W): Frame {
  const nodes = step.nodes ?? [];
  const primary = nodes.filter((n) => (n.panel ?? 'primary') === 'primary');
  const secondaryPanels = (step.panels ?? []).filter((p) => p.id !== 'primary');
  const hasSecondary = secondaryPanels.length > 0;

  const sidePanels = hasSecondary && canvasWidth >= 560 && minimumTreeWidth(primary) <= canvasWidth*0.6 && secondaryPanels.every((p) => minimumTreeWidth(nodes.filter((n) => n.panel === p.id)) <= canvasWidth*0.3);
  const primaryWidth = sidePanels ? canvasWidth * 0.6 : canvasWidth;
  const primaryPad = Math.max(24, ...primary.map((n) => boxWidth(String(n.value)) / 2 + 12));
  const placedPrimary = scale(tidy(toOrdered(primary)), {
    x0: primaryPad,
    width: Math.max(0, primaryWidth - primaryPad * 2),
    y0: TOP,
    rowGap: ROW_GAP,
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const posById = new Map(placedPrimary.map((p) => [p.id, p]));

  const outNodes: CanvasNode[] = placedPrimary.map((p) => {
    const src = byId.get(p.id)!;
    return {
      id: p.id,
      label: p.label,
      x: p.x,
      y: p.y,
      w: boxWidth(p.label),
      state: src.state,
      tag: src.tag,
    };
  });

  const groups: CanvasGroup[] = [];
  const annotations: CanvasText[] = [];
  let maxY = Math.max(TOP, ...placedPrimary.map((p) => p.y));
  const outEdges: CanvasEdge[] = primary
    .filter((n) => n.parent)
    .map((n) => ({ from: n.parent!, to: n.id, kind: 'tree' }));

  let panelTop = sidePanels ? TOP - 8 : maxY + 42;
  for (const panel of secondaryPanels) {
    const secondary = nodes.filter((n) => n.panel === panel.id);
    const panelX0 = sidePanels ? canvasWidth * 0.66 : 24;
    const panelWidth = sidePanels ? canvasWidth * 0.3 : canvasWidth - 48;
    const titleLines = wrapLabel(panel.label, panelWidth - 16);
    titleLines.forEach((text, i) => annotations.push({ id: `${panel.id}-title-${i}`, text, x: panelX0 + 8, y: panelTop + 16 + i*14, size: 11 }));
    const secondaryPad = Math.max(12, ...secondary.map((n) => boxWidth(String(n.value)) / 2 + 6));
    const placedSecondary = scale(tidy(toOrdered(secondary)), {
      x0: panelX0 + secondaryPad,
      width: Math.max(0, panelWidth - secondaryPad * 2),
      y0: panelTop + 48 + Math.max(0, titleLines.length-1)*14,
      rowGap: ROW_GAP,
    });
    const secondaryById = new Map(secondary.map((n) => [n.id, n]));
    for (const p of placedSecondary) {
      const src = secondaryById.get(p.id)!;
      outNodes.push({ id: p.id, label: p.label, x: p.x, y: p.y, w: boxWidth(p.label), state: src.state, tag: src.tag });
    }
    for (const n of secondary) {
      if (n.parent) outEdges.push({ from: n.parent, to: n.id, kind: 'tree' });
    }
    const panelBottom = Math.max(TOP, ...placedSecondary.map((p) => p.y)) + 30;
    groups.push({
      id: panel.id,
      label: undefined,
      x: panelX0,
      y: panelTop,
      w: panelWidth,
      h: panelBottom - panelTop,
      style: 'panel',
    });
    maxY = Math.max(maxY, panelBottom);
    panelTop = panelBottom + 24;

    if (panel.anchor && posById.get(panel.anchor) && placedSecondary[0]) {
      const root = placedSecondary.reduce((a, b) => (a.depth < b.depth ? a : b));
      outEdges.push({
        from: panel.anchor,
        to: root.id,
        id: `${panel.anchor}->${panel.id}`,
        kind: 'pointer',
        arrow: true,
        curve: 24,
      });
    }
  }

  return { nodes: outNodes, edges: outEdges, groups, annotations, height: maxY + 24, width: canvasWidth };
}

/** Deriva los puentes padre→hijo por `lower_bound`: el primer índice `j` tal
 * que `child[j] >= parentValue`, exactamente el pL/pR que el propio Merge
 * del profesor ya calcula. Evita que el frontmatter escriba un puente
 * inconsistente a mano. */
export function deriveBridges(parent: RangeArray, child: RangeArray): RangeBridge[] {
  return parent.cells.map((value, i) => {
    let j = child.cells.findIndex((c) => c >= value);
    if (j === -1) j = child.cells.length;
    return { from: parent.id, fromIndex: i, to: child.id, toIndex: j, active: false };
  });
}

/** Reserva el final del arreglo: lower_bound puede devolver n, no n−1. */
export function layersWidth(step: RangeStep): number {
  const arrays = step.arrays ?? [];
  const groups = new Map<string, RangeArray[]>();
  for (const a of arrays) {
    const key = `${a.row}:${a.slot ?? 'full'}`;
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  const singleWidths = arrays.map((a) => {
    const cellWidth = Math.max(CELL_W, ...a.cells.map((v) => boxWidth(String(v), 12, CELL_W)));
    const rowWidth = (a.cells.length + 1) * (cellWidth + 6) + 48;
    return a.slot === 'left' || a.slot === 'right' ? rowWidth * 2 : rowWidth;
  });
  const groupWidths = [...groups.values()].filter((g) => g.length > 1).map((g) => {
    const width = g.reduce((sum,a) => {
      const cw = Math.max(CELL_W, ...a.cells.map((v) => boxWidth(String(v),12,CELL_W)));
      return sum + Math.max(a.cells.length*(cw+6)-6, (a.label?.length ?? 0)*6.6) + 24;
    },0) + 48;
    return g[0].slot === 'left' || g[0].slot === 'right' ? width*2 : width;
  });
  return Math.max(300, ...singleWidths, ...groupWidths);
}

const slotBox = (slot: RangeArray['slot'] | undefined, canvasWidth: number): { x0: number; width: number } => {
  if (slot === 'left') return { x0: 24, width: canvasWidth / 2 - 48 };
  if (slot === 'right') return { x0: canvasWidth / 2 + 24, width: canvasWidth / 2 - 48 };
  return { x0: 24, width: canvasWidth - 48 };
};

/** Filas ordenadas, puentes y posiciones fin (n), sin recortar los rótulos. */
export function layoutLayers(step: RangeStep, canvasWidth = layersWidth(step)): Frame {
  const arrays = step.arrays ?? [];
  const outNodes: CanvasNode[] = [];
  const annotations: CanvasText[] = [];
  const cellPos = new Map<string, { x: number; y: number }>();
  const bridges = step.bridges ?? arrays
    .filter((a) => a.row === 0)
    .flatMap((parentArr) => arrays
      .filter((c) => c.row === parentArr.row + 1 && (c.slot === 'left' || c.slot === 'right' || !c.slot))
      .flatMap((childArr) => deriveBridges(parentArr, childArr)));
  const ends = new Set<string>();
  for (const b of bridges) {
    for (const [id, index] of [[b.from, b.fromIndex], [b.to, b.toIndex]] as const) {
      const arr = arrays.find((a) => a.id === id);
      if (arr && index === arr.cells.length) ends.add(id);
    }
  }

  for (const arr of arrays) {
    const lane = slotBox(arr.slot, canvasWidth);
    const siblings = arrays.filter((a) => a.row === arr.row && (a.slot ?? 'full') === (arr.slot ?? 'full'));
    const width = lane.width / siblings.length;
    const x0 = lane.x0 + siblings.indexOf(arr)*width;
    const y = 52 + arr.row * 100;
    const cellWidth = Math.max(CELL_W, ...arr.cells.map((v) => boxWidth(String(v), 12, CELL_W)));
    const gap = cellWidth + 6;
    const values = ends.has(arr.id) ? [...arr.cells, 'fin'] : arr.cells;
    const startX = x0 + width / 2 - gap * (values.length - 1) / 2;

    if (arr.label) {
      annotations.push({ id: `${arr.id}-label`, text: arr.label, x: startX - cellWidth / 2, y: y - 25, anchor: 'start', size: 11 });
    }
    values.forEach((value, i) => {
      const x = startX + i * gap;
      cellPos.set(`${arr.id}:${i}`, { x, y });
      outNodes.push({
        id: `${arr.id}:${i}`, label: String(value), x, y,
        shape: 'cell', w: cellWidth, h: CELL_H,
        state: i === arr.cells.length ? 'shared' : arr.states?.[i],
      });
    });
  }

  const outEdges: CanvasEdge[] = bridges
    .map((b) => {
      const fromId = `${b.from}:${b.fromIndex}`;
      const toId = `${b.to}:${b.toIndex}`;
      const from = cellPos.get(fromId);
      const to = cellPos.get(toId);
      if (!from || !to) return null;
      const dir = to.x >= from.x ? 1 : -1;
      return {
        from: fromId,
        to: toId,
        id: `${fromId}->${toId}`,
        kind: 'pointer' as const,
        arrow: true,
        curve: 14 * dir,
        state: b.active ? ('active' as const) : undefined,
      };
    })
    .filter((e): e is CanvasEdge => e !== null);

  const maxRow = Math.max(0, ...arrays.map((a) => a.row));
  const height = 52 + maxRow * 100 + (ends.size ? 58 : 30);
  if (ends.size) annotations.push({ id: 'end-legend', text: 'fin = índice n; no es un elemento', x: 24, y: height - 12, size: 10 });

  return { nodes: outNodes, edges: outEdges, groups: [], annotations, height, width: canvasWidth };
}

export function layout(step: RangeStep, width?: number): Frame {
  return (step.mode ?? 'tree') === 'layers' ? layoutLayers(step, width) : layoutRangeTree(step, width);
}
