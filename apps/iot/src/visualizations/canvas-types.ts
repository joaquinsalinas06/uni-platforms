// Contrato de VisualizationCanvas + convención visual de estados. Puro: sin
// React, sin DOM, sin JSX — así lo puede importar cualquier layout.ts de
// cualquier familia sin romper `node --test` (type-stripping nativo de Node,
// que no puede quitar JSX de un .tsx).
//
// Todo lo que no era parte del contrato original (CanvasNode/CanvasEdge/
// CanvasStep con sólo {id,label,x,y} / {from,to} / {note,nodes,edges,
// highlight}) es OPCIONAL: un CanvasStep de la familia `tree` sigue siendo
// válido tal cual y se renderiza idéntico a como lo hacía antes.

/** Caja de nodo por defecto: la misma que hoy hardcodea el canvas. */
export const NODE_W = 38;
export const NODE_H = 32;
/** Celda de arreglo (familia range-tree/layers): esquinas rectas, sin el aire
 * de una caja de nodo. */
export const CELL_W = 34;
export const CELL_H = 26;
/** Puerto de un puntero entrante (nodo gordo / split): un punto, no una caja. */
export const PORT_R = 4.5;
/** Alto de una fila de texto dentro de un nodo `record` (nodo gordo). */
export const LINE_H = 15;
export const PAD_X = 10;

/** Ancho aproximado de un glyph de IBM Plex Mono al tamaño dado. */
export function charW(fontSize: number): number {
  return fontSize * 0.6;
}

/** Ancho mínimo para que `text` (mono, `fontSize`) no se salga de la caja. */
export function boxWidth(text: string, fontSize = 14, min = NODE_W): number {
  return Math.max(min, text.length * charW(fontSize) + 2 * PAD_X);
}

/** ellipse/diamond/parallelogram/circle/rounded/rect: símbolos de diagrama de
 * flujo, FSM y bloques (familias `flow` y `sequence`). Respetan `lines`
 * (texto multi-línea centrado) igual que `record`. */
export type NodeShape = 'box' | 'cell' | 'record' | 'port' | 'subtree' | 'ellipse' | 'diamond' | 'parallelogram' | 'circle' | 'rounded' | 'rect';

/** Trazo libre en coordenadas del lienzo: curvas de `xy-chart`, líneas de
 * vida y mensajes de `sequence`, flechas ortogonales de `flow`. Se pinta
 * encima de `groups` y debajo de aristas y nodos. Color: `state` (active =
 * accent…) gana sobre `tone` (`--tone-<t>`), que gana sobre `color`. */
export type CanvasPath = {
  id: string;
  d: string;
  /** true = relleno (área, banda, punto) con `opacity` (default 0.16); si no, trazo. */
  fill?: boolean;
  /** default 1.5 */
  width?: number;
  dash?: string;
  opacity?: number;
  state?: NodeState;
  tone?: string;
  /** Color CSS explícito, p.ej. 'var(--muted)'. default var(--ink). */
  color?: string;
  /** Punta de flecha al final, del mismo color que el trazo. */
  arrow?: boolean;
};

export function pathColor(p: Pick<CanvasPath, 'state' | 'tone' | 'color'>): string {
  switch (p.state) {
    case 'active': return 'var(--accent)';
    case 'answer': return 'var(--answer)';
    case 'marked': return 'var(--marked)';
    case 'muted': return 'var(--faint)';
  }
  if (p.tone) return `var(--tone-${p.tone}, var(--ink))`;
  return p.color ?? 'var(--ink)';
}

/**
 * Vocabulario cerrado de estados — ninguna familia inventa uno nuevo.
 * `active` es el ÚNICO que usa el azul (`--accent`). `marked` (ámbar,
 * delimitador) y `answer` (carmesí, respuesta canónica) son los otros dos
 * estados con color — cada uno con su propia variable, nunca `--accent`.
 * `shared`/`copied`/`muted` siguen sin color: se distinguen por relleno,
 * contorno, opacidad y trazo. Ver AGENTS.md § Diseño.
 */
export const NODE_STATES = [
  'idle',
  'active',
  'marked',
  'answer',
  'shared',
  'copied',
  'muted',
] as const;
export type NodeState = (typeof NODE_STATES)[number];

export type EdgeKind = 'tree' | 'shared' | 'pointer';
export type EdgeState = 'idle' | 'active' | 'marked' | 'answer' | 'muted';

export type CanvasNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  /** Nombre de variable/puntero mostrado ARRIBA de la caja (p.ej. "p", "x",
   * "headLeft") cuando el id del nodo no es el valor que se lee dentro —
   * "p(8)" en la prosa sin esto se veía como una caja con sólo "8" adentro,
   * sin ninguna pista de que ese nodo se llama `p`. Opcional: la mayoría
   * de los diagramas del curso usan ids técnicos (n4, v1, t2) que NO
   * deberían mostrarse así — sólo se pinta cuando el autor lo pide. */
  tag?: string;
  /** default 'box' */
  shape?: NodeShape;
  /** default NODE_W / NODE_H según `shape` */
  w?: number;
  h?: number;
  /** Contenido multi-línea (nodo gordo: campo, valor, tiempo). Si falta se usa `label`. */
  lines?: string[];
  /** Índice de fila tras la cual va la regla separadora de un `record`. */
  divider?: number;
  /** Si falta, se deriva de `highlight` (compatibilidad con `tree`). */
  state?: NodeState;
};

export type CanvasEdge = {
  from: string;
  to: string;
  /** Key estable — hace falta cuando dos aristas pueden compartir `from-to`
   * entre pasos con significados distintos (path copying). Default `${from}-${to}`. */
  id?: string;
  /** default 'tree' */
  kind?: EdgeKind;
  /** Si falta, se deriva de `highlight` (compatibilidad con `tree`). */
  state?: EdgeState;
  /** default false */
  arrow?: boolean;
  /** Punta de flecha también en `from` — un par real de punteros opuestos
   * entre los mismos dos nodos (izquierda/derecha de una lista circular de
   * hermanos) dibujado como UNA arista, no dos superpuestas. default false. */
  arrowStart?: boolean;
  /** Desviación perpendicular del control cuadrático, en px. default 0 (recta). */
  curve?: number;
  label?: string;
  /** Esta arista representa datos moviéndose literalmente por la red (un
   * mensaje/paquete), no sólo una relación — sólo se anima si además está
   * `active` en el paso actual. default false. */
  flow?: boolean;
};

/** Panel de fondo: versiones coexistiendo, el árbol secundario 2D, una fila
 * de arreglo. Permite "un árbol dentro de otro" sin anidar el modelo. */
export type CanvasGroup = {
  id: string;
  label?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** default 'panel' */
  style?: 'panel' | 'ghost';
};

/** Anotación libre: la secuencia de Euler creciendo, la etiqueta `[5,16]`
 * de una consulta, los índices pL/pR de un puente. */
export type CanvasText = {
  id: string;
  text: string;
  x: number;
  y: number;
  /** default 'start' */
  anchor?: 'start' | 'middle' | 'end';
  /** default 12 */
  size?: number;
  /** default 'idle' */
  state?: 'idle' | 'active' | 'muted';
  /** Color CSS explícito (gana sobre `state`). */
  color?: string;
  /** default 400 */
  weight?: number;
  /** Chip de fondo (color del lienzo, o el color CSS dado): el texto no se
   * pierde sobre líneas que lo cruzan. */
  bg?: boolean | string;
};

export type CanvasStep = {
  note: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  highlight: string[];
  groups?: CanvasGroup[];
  annotations?: CanvasText[];
  paths?: CanvasPath[];
  /** Escena de símbolos (circuitos): cables, glifos, halos, marcas. Ver CanvasScene. */
  scene?: CanvasScene;
  /** Panel lateral de ecuaciones (KaTeX), ligado a las piezas por id. */
  panel?: CanvasPanel;
  /** Ancho/alto que necesita este paso, si es menor que el más grande de
   * todos — el canvas hace zoom-fit (nunca estira) a este tamaño y lo
   * centra en ambos ejes. Sin `height`, sólo se ajustaba el ancho: un paso
   * angosto con contenido alto (un registro de varias líneas, un tag, un
   * caption cerca del borde) terminaba con un zoom pensado sólo para el
   * eje horizontal, que en el vertical lo sacaba del viewBox por arriba. */
  width?: number;
  height?: number;
};

/** Lo que devuelve el layout puro de cada familia para UN paso. */
export type Frame = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  groups: CanvasGroup[];
  annotations: CanvasText[];
  paths?: CanvasPath[];
  /** Alto que necesita este paso. */
  height: number;
  /** Ancho que necesita este paso, si es mayor que el ancho por defecto de
   * la familia (p.ej. un registro de nodo gordo con muchas modificaciones). */
  width?: number;
};

/** Un nodo sin `state` explícito hereda el comportamiento de hoy: activo si
 * está en `highlight`, si no, en reposo. */
export function resolveState(node: { id: string; state?: NodeState }, highlight: string[]): NodeState {
  if (node.state) return node.state;
  return highlight.includes(node.id) ? 'active' : 'idle';
}

export function resolveEdgeState(
  edge: { from: string; to: string; state?: EdgeState },
  highlight: string[],
): EdgeState {
  if (edge.state) return edge.state;
  return highlight.includes(edge.from) || highlight.includes(edge.to) ? 'active' : 'idle';
}

export type NodeVisual = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  dash?: string;
  opacity: number;
  text: string;
  /** Doble contorno = frontera (el amarillo del profesor: delimitador). */
  double?: boolean;
};

/** Nombre en palabras del estado, para el `<title>` accesible del nodo: el
 * estado no puede depender sólo del trazo para quien usa lector de pantalla. */
export const STATE_LABEL: Record<NodeState, string> = {
  idle: 'en reposo',
  active: 'activo — lo que se toca en este paso',
  marked: 'delimitador',
  answer: 'respuesta canónica',
  shared: 'compartido con la versión anterior',
  copied: 'copiado en esta versión',
  muted: 'descartado',
};

/**
 * Estilo visual de cada estado. `active` es el ÚNICO que menciona
 * `var(--accent)` — es la regla del brief convertida en función, y
 * `canvas-types.test.ts` la verifica por máquina.
 */
export function nodeStyle(state: NodeState): NodeVisual {
  switch (state) {
    case 'idle':
      return { fill: 'var(--paper)', stroke: 'var(--rule)', strokeWidth: 1.5, opacity: 1, text: 'var(--ink)' };
    case 'active':
      return {
        fill: 'var(--accent)',
        stroke: 'var(--accent)',
        strokeWidth: 1.5,
        opacity: 1,
        text: 'var(--accent-ink)',
      };
    case 'marked':
      return {
        fill: 'var(--marked)',
        stroke: 'var(--marked-ink)',
        strokeWidth: 2,
        opacity: 1,
        text: 'var(--marked-ink)',
        double: true,
      };
    case 'answer':
      return { fill: 'var(--answer)', stroke: 'var(--answer)', strokeWidth: 1.5, opacity: 1, text: 'var(--answer-ink)' };
    case 'shared':
      return {
        fill: 'var(--sunken)',
        stroke: 'var(--rule)',
        strokeWidth: 1.5,
        dash: '4 3',
        opacity: 0.75,
        text: 'var(--muted)',
      };
    case 'copied':
      return { fill: 'var(--paper)', stroke: 'var(--ink)', strokeWidth: 2, opacity: 1, text: 'var(--ink)' };
    case 'muted':
      return {
        fill: 'var(--fill)',
        stroke: 'var(--rule)',
        strokeWidth: 1.5,
        dash: '2 3',
        opacity: 0.45,
        text: 'var(--faint)',
      };
  }
}

export type EdgeVisual = { stroke: string; strokeWidth: number; dash?: string };

/**
 * Estilo de arista por familia + estado. Una arista sólo se pinta de azul
 * cuando une algo activo — nunca por decoración.
 */
export function edgeStyle(kind: EdgeKind, state: EdgeState): EdgeVisual {
  if (state === 'active') return { stroke: 'var(--accent)', strokeWidth: 2 };
  if (state === 'answer') return { stroke: 'var(--answer)', strokeWidth: 2.5 };
  if (state === 'marked') return { stroke: 'var(--marked-ink)', strokeWidth: 2, dash: '5 2' };
  if (state === 'muted') return { stroke: 'var(--rule)', strokeWidth: 1.5, dash: '2 3' };
  switch (kind) {
    case 'tree':
      return { stroke: 'var(--rule)', strokeWidth: 1.5 };
    case 'shared':
      return { stroke: 'var(--rule)', strokeWidth: 1.5, dash: '4 3' };
    case 'pointer':
      return { stroke: 'var(--ink)', strokeWidth: 1.5 };
  }
}

// ─────────────── escena de símbolos (familia `circuit`) ───────────────
// Todo en coordenadas del lienzo, ya resuelto por el layout puro. El canvas
// sólo dibuja y anima: mismo `id` entre pasos = mismo elemento (se desliza);
// un id nuevo entra (fade/scale); uno que se va sale; un símbolo con
// `mergedFrom` hace que sus fuentes brillen en `mergeTone` y colapsen hacia él.

/** Cable (polilínea ortogonal, con hueco donde va el cuerpo del símbolo). */
export type SceneWire = { id: string; d: string; state?: NodeState; tone?: string; width?: number; dash?: string };
/** Glifo (ver circuit/symbols.ts). `angle` en grados, eje local +x = from→to. */
export type SceneSymbol = {
  id: string;
  kind: string;
  x: number;
  y: number;
  angle: number;
  variant?: string;
  state?: NodeState;
  tone?: string;
  /** Pieza a la que pertenece (para enlazar con el panel al pasar el mouse). */
  part?: string;
  mergedFrom?: string[];
  mergeTone?: string;
};
/** Una línea de texto; `y` es el centro. Admite subíndices `_x` / `_{xy}`. */
export type SceneText = {
  id: string;
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
  weight?: number;
  mono?: boolean;
  /** Color de texto: ink/muted/faint, o un tono/estado (gana state > tone). */
  color?: 'ink' | 'muted' | 'faint' | 'ok' | 'bad';
  tone?: string;
  state?: NodeState;
  /** Fondo tipo chip (badges: hipótesis, Req, potenciales). */
  chip?: boolean;
  part?: string;
};
export type SceneDot = { id: string; x: number; y: number; r: number; hollow?: boolean; ring?: boolean };
/** Halo: envolvente convexa (path cerrado) engordada `pad` px con esquinas redondas. */
export type SceneHalo = { id: string; d: string; pad: number; tone: string };
/** Recorrido KVL: `d` es la malla completa; se pinta la fracción `frac` y la punta en `head`. */
export type SceneWalker = { id: string; d: string; frac: number; tone: string; head: { x: number; y: number; angle: number } };
export type CanvasScene = {
  /** Origen del dibujo: se traslada (-x,-y) para que el bbox común empiece en 0. */
  origin: { x: number; y: number };
  wires: SceneWire[];
  symbols: SceneSymbol[];
  texts: SceneText[];
  /** Flechas de corriente, flechas de malla, marcas ±: trazos libres. */
  marks: CanvasPath[];
  dots: SceneDot[];
  halos: SceneHalo[];
  walker?: SceneWalker;
  variant?: 'schematic' | 'breadboard' | 'wiring';
  /** Placa de protoboard (variant breadboard), en coordenadas de escena. */
  board?: { x: number; y: number; w: number; h: number };
};

export type PanelTerm = { part: string; tex: string; active?: boolean };
export type PanelRow = {
  id: string;
  /** KaTeX de la fila completa… */
  tex?: string;
  /** …o términos sueltos (KVL), cada uno ligado a su pieza. */
  terms?: PanelTerm[];
  /** Piezas que la fila menciona: se iluminan juntas al pasar el mouse. */
  parts?: string[];
  state?: NodeState;
  tone?: string;
  /** head = subtítulo en mono; note = texto plano pequeño. */
  kind?: 'head' | 'eq' | 'note';
  /** Veredicto de una hipótesis (✓/✗ con su color). */
  verdict?: 'ok' | 'bad';
};
export type CanvasPanel = { rows: PanelRow[] };
