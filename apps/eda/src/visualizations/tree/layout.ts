import type { NodeState } from '../canvas-types.ts';

export type TreeNode = {
  id: string;
  value: string | number;
  /** Nombre de variable/puntero mostrado arriba de la caja — ver CanvasNode.tag. */
  tag?: string;
  parent: string | null;
  /** Si falta, el canvas lo deriva de `highlight` (activo/en reposo) — pero
   * un estado explícito (marked/answer/shared/copied/muted) SIEMPRE tiene
   * que sobrevivir hasta el canvas. */
  state?: NodeState;
  /** Sólo para árboles BINARIOS con UN solo hijo, donde el orden de
   * declaración no basta para saber de qué lado cuelga. En heaps y en
   * árboles multivía (binomial, Fibonacci) no se usa: ahí la posición la
   * fija el orden de los hermanos. */
  side?: 'left' | 'right';
  /** Este nodo representa un subárbol entero (p.ej. "A"/"B"/"C" en una
   * rotación), no una clave suelta — se dibuja como un triángulo, la
   * convención de los libros, no como una caja normal. */
  collapsed?: boolean;
  /** Panel al que pertenece (p.ej. "H1"/"H2" en Union): cada panel es su
   * propio bosque, posicionado aparte. Ver TreeStep.panels. */
  panel?: string;
  /** Si es `false`, el nodo se POSICIONA bajo `parent` (misma fila que sus
   * hermanos) pero NO se dibuja la arista — para una estructura donde el
   * padre real sólo guarda UN puntero a un hijo cualquiera (Fibonacci
   * heap, montículo binomial: `child`/`sibling` + hermanos enlazados
   * entre sí), dibujar una línea de `parent` a CADA hijo mentiría sobre
   * cuántos punteros existen de verdad — eso se dibuja aparte, con
   * `links`. Default `true` (el comportamiento de siempre). */
  edge?: boolean;
  /** Rótulo de la arista padre→hijo (la subcadena de un suffix tree, la
   * letra de un trie, el peso de una arista). Se dibuja en el punto medio
   * de la arista, con un chip de fondo; el layout ensancha columnas para
   * que los rótulos de una misma franja no se pisen. */
  edgeLabel?: string;
};
export type LaidOut = {
  id: string;
  label: string;
  x: number;
  y: number;
  collapsed?: boolean;
  state?: NodeState;
  tag?: string;
};

export const W = 640;
const ROW = 56;
/** Fila más alta cuando hay rótulos de arista: el chip vive entre filas. */
export const ROW_LABELED = 72;
/** Rótulo de arista: IBM Plex Mono 10px ≈ 6px por carácter + relleno del chip. */
export const LABEL_FONT = 10;
export const labelWidth = (text: string) => text.length * LABEL_FONT * 0.6 + 8;
const LABEL_PAD = 6;

export type LayoutOptions = {
  /** Orden de los árboles de un bosque, de izquierda a derecha. Un id listado
   * se trata como raíz aunque tenga `parent` (su arista no se dibuja: es un
   * path-parent, no una relación de hijo). Entre árboles queda una columna
   * libre. Sin esto, las raíces van en orden de declaración, como siempre. */
  roots?: string[];
  /** Alto de fila en px (default ROW). */
  row?: number;
};

/** El padre que cuenta para el layout: `null` si el nodo es raíz forzada. */
export const layoutParent = (n: TreeNode, roots?: string[]) => (roots?.includes(n.id) ? null : n.parent);

/**
 * Convierte {id, value, parent} en coordenadas.
 *
 * Los hermanos se colocan en el ORDEN EN QUE SE DECLARAN, nunca ordenados por
 * valor. Es lo único correcto para las tres formas que usa el curso:
 *   - montículo: el hijo izquierdo es A[2i] y el derecho A[2i+1]; la posición
 *     la fija el índice del arreglo, y AMBOS hijos son menores que el padre,
 *     así que compararlos con el padre no distingue lados;
 *   - binomial / Fibonacci: árboles multivía, donde "izquierda" y "derecha"
 *     ni siquiera existen — sólo el orden de los hermanos;
 *   - BST: los agentes declaran izquierdo y luego derecho.
 *
 * Cada padre se centra sobre sus hijos. Un padre con UN solo hijo se desplaza
 * media columna sólo si el nodo declara `side`, que es el único caso donde el
 * lado importa y el orden no lo revela (un BST con un hijo).
 */
export function layout(nodes: TreeNode[], opts: LayoutOptions = {}): LaidOut[] {
  const { roots } = opts;
  const children = new Map<string | null, TreeNode[]>();
  for (const n of nodes) {
    const p = layoutParent(n, roots);
    const list = children.get(p) ?? [];
    list.push(n);
    children.set(p, list);
  }
  const out: LaidOut[] = [];
  let column = 0;

  const visit = (node: TreeNode, depth: number): number => {
    const kids = children.get(node.id) ?? [];
    const xs = kids.map((k) => visit(k, depth + 1));

    let cx: number;
    if (xs.length === 0) {
      cx = column++;
    } else if (xs.length === 1 && kids[0].side) {
      // Único caso donde el orden no dice el lado: un BST con un solo hijo.
      cx = kids[0].side === 'left' ? xs[0] + 0.5 : xs[0] - 0.5;
    } else {
      cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    }

    out.push({
      id: node.id,
      label: String(node.value),
      x: cx,
      y: depth,
      collapsed: node.collapsed,
      state: node.state,
      tag: node.tag,
    });
    return cx;
  };

  let top = children.get(null) ?? [];
  if (roots) {
    const rank = (n: TreeNode) => (roots.includes(n.id) ? roots.indexOf(n.id) : roots.length);
    top = [...top].sort((a, b) => rank(a) - rank(b));
  }
  top.forEach((root, i) => {
    if (roots && i > 0) column++; // columna libre entre árboles del bosque
    visit(root, 0);
  });
  if (out.length === 0) return out;

  // Un hijo único que se desplaza media columna puede caer sobre una hoja de
  // otro subárbol de la misma fila. Se separan esos nodos a una columna como
  // mínimo; sólo cambia los casos que se solaparían.
  const rows = new Map<number, LaidOut[]>();
  for (const n of out) rows.set(n.y, [...(rows.get(n.y) ?? []), n]);
  for (const row of rows.values()) {
    row.sort((a, b) => a.x - b.x);
    for (let i = 1; i < row.length; i++) row[i].x = Math.max(row[i].x, row[i - 1].x + 1);
  }

  // Normaliza: los desplazamientos de hijo único pueden dar columnas negativas.
  const min = Math.min(...out.map((n) => n.x));
  const max = Math.max(...out.map((n) => n.x));
  let gap = W / (max - min + 2);

  // Rótulos de arista: todos los de una franja (entre la fila d y la d+1)
  // quedan a la misma altura, en el punto medio x de su arista. Si dos
  // vecinos no caben, se ensancha la columna (el lienzo crece más allá de W)
  // en vez de solaparlos. Sin rótulos, el layout es idéntico al de siempre.
  const at = new Map(out.map((n) => [n.id, n]));
  const bands = new Map<number, { x: number; w: number }[]>();
  for (const n of nodes) {
    const p = layoutParent(n, roots);
    if (!n.edgeLabel || n.edge === false || !p || !at.has(p)) continue;
    const c = at.get(n.id)!;
    const band = bands.get(c.y) ?? [];
    band.push({ x: (c.x + at.get(p)!.x) / 2, w: labelWidth(n.edgeLabel) });
    bands.set(c.y, band);
  }
  for (const band of bands.values()) {
    band.sort((a, b) => a.x - b.x);
    for (let i = 1; i < band.length; i++) {
      const dx = band[i].x - band[i - 1].x;
      if (dx > 0) gap = Math.max(gap, ((band[i].w + band[i - 1].w) / 2 + LABEL_PAD) / dx);
    }
  }

  const row = opts.row ?? ROW;
  return out.map((n) => ({ ...n, x: gap * (n.x - min + 1), y: 34 + n.y * row }));
}
