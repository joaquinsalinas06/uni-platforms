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
export function layout(nodes: TreeNode[]): LaidOut[] {
  const children = new Map<string | null, TreeNode[]>();
  for (const n of nodes) {
    const list = children.get(n.parent) ?? [];
    list.push(n);
    children.set(n.parent, list);
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

  for (const root of children.get(null) ?? []) visit(root, 0);
  if (out.length === 0) return out;

  // Normaliza: los desplazamientos de hijo único pueden dar columnas negativas.
  const min = Math.min(...out.map((n) => n.x));
  const max = Math.max(...out.map((n) => n.x));
  const gap = W / (max - min + 2);
  return out.map((n) => ({ ...n, x: gap * (n.x - min + 1), y: 34 + n.y * ROW }));
}
