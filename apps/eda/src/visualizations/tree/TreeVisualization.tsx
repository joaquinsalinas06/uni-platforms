import VisualizationCanvas, { type CanvasStep, type CanvasNode, type CanvasEdge, type CanvasGroup } from '../../components/VisualizationCanvas';
import { boxWidth } from '../canvas-types';
import { layout, layoutParent, labelWidth, LABEL_FONT, ROW_LABELED, W, type TreeNode } from './layout';

export type TreeLink = {
  from: string;
  to: string;
  /** `path-parent`: puntero discontinuo del hijo (raíz de un árbol
   * auxiliar) a su padre en el árbol representado, sin relación de hijo —
   * link-cut trees. Se dibuja como `pointer` discontinuo. */
  kind?: 'tree' | 'shared' | 'pointer' | 'path-parent';
  label?: string;
  curve?: number;
  dash?: boolean;
  /** Un par real de punteros opuestos entre los MISMOS dos nodos (`left`/
   * `right` de una lista circular de hermanos) es UNA arista con flecha en
   * ambos extremos — declarar las dos direcciones por separado las dibuja
   * exactamente superpuestas. */
  bidirectional?: boolean;
};
export type TreeStep = {
  note: string;
  nodes: TreeNode[];
  highlight: string[];
  /** Aristas extra además de las derivadas de `parent` (p.ej. un puntero de
   * acceso directo indexado). Se agregan, no reemplazan las de `parent`. */
  links?: TreeLink[];
  /** Paneles lado a lado: cada uno es un árbol/bosque INDEPENDIENTE, con su
   * propia caja y etiqueta — para mostrar dos montículos que coexisten
   * antes de fusionarse (Union), no una sola mezcla prematura. Un nodo sin
   * `panel` cae en el primero. Si falta esto, el paso es un solo bosque,
   * como siempre. */
  panels?: { id: string; label: string }[];
  /** Bosque: orden de los árboles de izquierda a derecha (ver LayoutOptions.roots). */
  roots?: string[];
};

type EdgeLabel = { id: string; text: string; x: number; y: number; state: 'idle' | 'active' | 'muted' };

/** Chips de los rótulos de arista, en coordenadas ya resueltas del paso. */
function edgeLabels(s: TreeStep, placed: CanvasNode[]): EdgeLabel[] {
  const at = new Map(placed.map((n) => [n.id, n]));
  return s.nodes.flatMap((n) => {
    const p = layoutParent(n, s.roots);
    if (!n.edgeLabel || n.edge === false || !p || !at.has(p) || !at.has(n.id)) return [];
    const a = at.get(p)!, b = at.get(n.id)!;
    const state = s.highlight.includes(n.id) || s.highlight.includes(p) ? 'active' : n.state === 'muted' ? 'muted' : 'idle';
    return [{ id: n.id, text: n.edgeLabel, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, state }];
  });
}

/**
 * Un link con rótulo (fail, dic, pp) pinta su chip en el punto de control de
 * su curva. Si a la recta le cae encima un rótulo de arista o un nodo, se le
 * busca una curvatura cuyo chip y cuyo trazo queden libres; si no hay
 * ninguna, el link sigue recto y es el rótulo de arista el que se corre a
 * lo largo de su arista, dentro del hueco entre filas. Un link sin rótulo
 * que va entre padre e hijo (suffix link o fallo a la raíz) se curva para no
 * correr encima de la arista. Sólo toca links sin `curve` explícito.
 */
function dodgeLinkLabels(edges: CanvasEdge[], auto: Set<CanvasEdge>, nodes: CanvasNode[], labels: EdgeLabel[], row: number) {
  const at = new Map(nodes.map((n) => [n.id, n]));
  const box = (n: CanvasNode) => ({ x: n.x, y: n.y, w: n.w ?? boxWidth(n.label), h: n.h ?? 32 });
  const hits = (k: { x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number) =>
    Math.abs(k.x - x) < (k.w + w) / 2 + 2 && Math.abs(k.y - y) < (k.h + h) / 2 + 1;
  const chip = (l: EdgeLabel) => ({ x: l.x, y: l.y, w: labelWidth(l.text), h: 15 });
  for (const e of edges) {
    if (!auto.has(e)) continue;
    const onTreeEdge = edges.some((t) => !auto.has(t) && ((t.from === e.from && t.to === e.to) || (t.from === e.to && t.to === e.from)));
    if (!e.label) {
      if (onTreeEdge) e.curve = 24;
      continue;
    }
    const a = at.get(e.from), b = at.get(e.to);
    if (!a || !b) continue;
    const others = nodes.filter((n) => n !== a && n !== b).map(box);
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, w = e.label.length * 6.8 + 8;
    const ctrl = (c: number) => (Math.abs(dy) < 1 ? { x: mx, y: my + Math.abs(c) } : { x: mx - (dy / len) * c, y: my + (dx / len) * c });
    const free = (c: number) => {
      const p = ctrl(c);
      if (labels.some((l) => hits(chip(l), p.x, p.y, w, 13)) || others.some((k) => hits(k, p.x, p.y, w, 13))) return false;
      // El trazo (cuadrática a→p→b) tampoco puede cruzar otro nodo.
      return [0.25, 0.5, 0.75].every((t) => {
        const x = (1 - t) ** 2 * a.x + 2 * t * (1 - t) * p.x + t * t * b.x;
        const y = (1 - t) ** 2 * a.y + 2 * t * (1 - t) * p.y + t * t * b.y;
        return !others.some((k) => hits(k, x, y, 0, 0));
      });
    };
    const c = [...(onTreeEdge ? [] : [0]), 24, -24, 40, -40, 56, -56].find(free);
    if (c !== undefined) {
      e.curve = c;
      continue;
    }
    // Sin curva libre: el rótulo de arista se corre por su arista, lejos del chip del link.
    const slack = row / 2 - 16 - 7.5 - 1;
    for (const l of labels) {
      if (!hits(chip(l), mx, my, w, 13)) continue;
      const child = at.get(l.id)!;
      const shift = Math.sign(l.y - my || -1) * slack;
      const k = (child.x - l.x) / (child.y - l.y || 1);
      l.x += k * shift;
      l.y += shift;
    }
  }
}

const LABEL_INK = { idle: 'var(--ink)', active: 'var(--accent)', muted: 'var(--faint)' } as const;

function EdgeLabels({ labels }: { labels: EdgeLabel[] }) {
  return (
    <g aria-hidden="true">
      {labels.map((l) => {
        const w = labelWidth(l.text);
        return (
          <g key={l.id} transform={`translate(${l.x}, ${l.y})`} style={{ transition: 'transform 450ms cubic-bezier(.2,.7,.3,1)' }}>
            <rect x={-w / 2} y={-7.5} width={w} height={15} rx={3} fill="var(--paper)" stroke="var(--rule)" strokeWidth={1} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={LABEL_FONT} fontWeight={600} fontFamily="var(--font-mono)" fill={LABEL_INK[l.state]} style={{ transition: 'fill 300ms' }}>
              {l.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}

const GAP = 28;
const TOP = 10;

function collapsedShape(n: { collapsed?: boolean; label: string }) {
  return n.collapsed ? { shape: 'subtree' as const, w: boxWidth(n.label, 14, 44), h: 40 } : {};
}

/**
 * Familia "árbol". Único trabajo: posicionar los nodos (ver ./layout.ts).
 * El render, la línea de tiempo y la animación los pone VisualizationCanvas.
 */
export default function TreeVisualization({ steps }: { steps: TreeStep[] }) {
  // Con rótulos de arista, TODA la secuencia usa la fila alta (si no, el
  // árbol saltaría de alto entre pasos).
  const labeled = steps.some((s) => s.nodes.some((n) => n.edgeLabel));
  const opts = (s: TreeStep) => ({ roots: s.roots, row: labeled ? ROW_LABELED : undefined });
  const span = (ns: { x: number }[]) => (ns.length ? Math.min(...ns.map((n) => n.x)) + Math.max(...ns.map((n) => n.x)) : W);
  // Ancho común: los rótulos pueden pedir más que W. Cada paso se estira a
  // ese ancho (márgenes simétricos ⇒ sigue centrado; estirar sólo separa).
  const width = labeled ? Math.max(W, ...steps.filter((s) => !s.panels?.length).map((s) => span(layout(s.nodes, opts(s))))) : W;
  const labelsByStep: EdgeLabel[][] = [];
  const canvasSteps: CanvasStep[] = steps.map((s) => {
    const auto = new Set<CanvasEdge>();
    const edges: CanvasEdge[] = [
      ...s.nodes.filter((n) => layoutParent(n, s.roots) && n.edge !== false).map((n) => ({ from: n.parent!, to: n.id })),
      // `pointer` siempre lleva punta de flecha — igual que ya hacen
      // persistent/range-tree (layout.ts de cada familia); acá faltaba, así
      // que un link `kind: 'pointer'` se veía como una línea suelta sin
      // indicar dirección, indistinguible de una arista `tree` normal.
      ...(s.links ?? []).map((l) => {
        const pp = l.kind === 'path-parent';
        const e: CanvasEdge = {
          from: l.from,
          to: l.to,
          kind: l.kind === 'path-parent' ? 'pointer' : l.kind,
          label: l.label,
          arrow: pp || l.kind === 'pointer',
          arrowStart: l.kind === 'pointer' && l.bidirectional === true,
          curve: l.curve ?? 0,
          dash: pp || l.dash,
        };
        if (labeled && l.curve === undefined) auto.add(e);
        return e;
      }),
    ];

    if (!s.panels || s.panels.length === 0) {
      // Camino de siempre: un solo bosque, sin paneles.
      const laid = layout(s.nodes, opts(s));
      const k = labeled ? width / span(laid) : 1;
      const nodes = laid.map((n) => ({ ...n, x: n.x * k, ...collapsedShape(n) }));
      labelsByStep.push(edgeLabels(s, nodes));
      dodgeLinkLabels(edges, auto, nodes, labelsByStep.at(-1)!, labeled ? ROW_LABELED : 56);
      return { note: s.note, highlight: s.highlight, nodes, edges };
    }

    // Cada panel es SU PROPIO bosque, posicionado por separado (layout() ya
    // normaliza a [0, W]) y luego reescalado a su propia franja horizontal
    // — así dos montículos se ven a la vez, cada uno reconocible, en vez de
    // una sola mezcla prematura de nodos.
    const bandW = (W - GAP * (s.panels.length - 1)) / s.panels.length;
    const placedByPanel = s.panels.map((p, i) => {
      const nodesIn = s.nodes.filter((n) => (n.panel ?? s.panels![0].id) === p.id);
      const x0 = i * (bandW + GAP);
      const laid = layout(nodesIn, opts(s));
      const lw = labeled ? span(laid) : W;
      const placed = laid.map((n) => ({
        ...n,
        x: x0 + (n.x / lw) * bandW,
        ...collapsedShape(n),
      }));
      return { panel: p, x0, placed };
    });

    const nodes: CanvasNode[] = placedByPanel.flatMap((g) => g.placed);
    labelsByStep.push(edgeLabels(s, nodes));
    dodgeLinkLabels(edges, auto, nodes, labelsByStep.at(-1)!, labeled ? ROW_LABELED : 56);
    const maxY = Math.max(TOP, ...nodes.map((n) => n.y), 34);
    const groups: CanvasGroup[] = placedByPanel.map((g) => ({
      id: g.panel.id,
      label: g.panel.label,
      x: g.x0 - 10,
      y: TOP - 4,
      w: bandW + 20,
      h: maxY - TOP + 4 + 40,
    }));

    return { note: s.note, highlight: s.highlight, nodes, edges, groups };
  });

  // El lienzo crece con el árbol/panel más profundo de la secuencia.
  const deepest = Math.max(...canvasSteps.flatMap((s) => s.nodes.map((n) => n.y)), 34);
  const hasGroups = canvasSteps.some((s) => (s.groups ?? []).length > 0);
  return (
    <VisualizationCanvas
      minScale={0.9}
      steps={canvasSteps}
      width={width}
      height={deepest + (hasGroups ? 60 : 44)}
      render={labeled ? (i) => <EdgeLabels labels={labelsByStep[i]} /> : undefined}
    />
  );
}
