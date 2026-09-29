// Layout de árbol compartido por `persistent` (árbol de versiones) y
// `range-tree` (el range tree en sí y su árbol secundario 2D).
//
// Deliberadamente NO es tree/layout.ts: ese layout ordena los hijos por
// `value` y decide el lado (izquierda/derecha) comparando contra el padre —
// correcto para un heap, incorrecto aquí. El árbol de versiones tiene un
// orden estructural (no por valor), y en un range tree los nodos internos
// guardan el MÁXIMO del subárbol izquierdo, así que el valor del padre no
// separa a los hijos. Aquí el orden es simplemente el orden de aparición en
// el arreglo de entrada.
//
// Separado en `tidy` (columnas y profundidad, sin escalar) + `scale` (a un
// rectángulo en píxeles) para poder meter un árbol dentro de un panel — el
// árbol secundario del range tree 2D, colgado del nodo ancla — sin duplicar
// el algoritmo.

export type OrderedNode = { id: string; label: string; parent: string | null };
export type Placed = { id: string; label: string; x: number; y: number; depth: number };

/**
 * Asigna columna (sin escalar, en el orden de aparición de las hojas) y
 * profundidad a cada nodo. Un padre con un solo hijo se desplaza ±0.5 de
 * columna, igual que en tree/layout.ts, para que un camino degenerado se
 * abanice en vez de apilarse en una sola columna vertical.
 */
export function tidy(nodes: OrderedNode[]): Placed[] {
  const children = new Map<string | null, OrderedNode[]>();
  for (const n of nodes) {
    const list = children.get(n.parent) ?? [];
    list.push(n);
    children.set(n.parent, list);
  }

  const out: Placed[] = [];
  let column = 0;

  const visit = (node: OrderedNode, depth: number): number => {
    const kids = children.get(node.id) ?? [];
    const xs = kids.map((k) => visit(k, depth + 1));

    let cx: number;
    if (xs.length === 0) cx = column++;
    // Hijo único: no hay "izquierda/derecha" sin un valor que comparar (a
    // diferencia de tree/layout.ts), así que el desplazamiento es siempre en
    // el mismo sentido — basta para que un camino degenerado se abanique.
    else if (xs.length === 1) cx = xs[0] + 0.5;
    else cx = (Math.min(...xs) + Math.max(...xs)) / 2;

    out.push({ id: node.id, label: node.label, x: cx, y: depth, depth });
    return cx;
  };

  for (const root of children.get(null) ?? []) visit(root, 0);
  return out;
}

/** Rectángulo destino, en píxeles. */
export type ScaleBox = { x0: number; width: number; y0: number; rowGap: number };

/** Reescala las columnas de `tidy` a `[x0, x0+width]` y la profundidad a
 * `y0 + depth * rowGap`. No asume nada sobre cuántos nodos hay: con uno solo,
 * lo centra. */
export function scale(placed: Placed[], box: ScaleBox): Placed[] {
  if (placed.length === 0) return [];
  const xs = placed.map((p) => p.x);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  const span = max - min;
  const gap = box.width / (span + 2);

  return placed.map((p) => ({
    ...p,
    x: span === 0 ? box.x0 + box.width / 2 : box.x0 + gap * (p.x - min + 1),
    y: box.y0 + p.depth * box.rowGap,
  }));
}
