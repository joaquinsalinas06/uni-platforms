import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layout, W, type TreeNode } from './layout.ts';

const byId = (nodes: ReturnType<typeof layout>) => new Map(nodes.map((n) => [n.id, n]));

test('el padre queda centrado entre sus dos hijos', () => {
  const tree: TreeNode[] = [
    { id: 'r', value: 8, parent: null },
    { id: 'l', value: 3, parent: 'r' },
    { id: 'd', value: 10, parent: 'r' },
  ];
  const n = byId(layout(tree));
  assert.equal(n.get('r')!.x, (n.get('l')!.x + n.get('d')!.x) / 2);
  assert.ok(n.get('l')!.x < n.get('r')!.x && n.get('r')!.x < n.get('d')!.x);
});

test('el orden horizontal es el inorden', () => {
  const tree: TreeNode[] = [
    { id: 'n8', value: 8, parent: null },
    { id: 'n3', value: 3, parent: 'n8' },
    { id: 'n10', value: 10, parent: 'n8' },
    { id: 'n1', value: 1, parent: 'n3' },
    { id: 'n6', value: 6, parent: 'n3' },
  ];
  const order = layout(tree)
    .sort((a, b) => a.x - b.x)
    .map((n) => n.label);
  assert.deepEqual(order, ['1', '3', '6', '8', '10']);
});

test('un árbol degenerado se abanica en vez de apilarse en vertical', () => {
  // Cadena de hijos DERECHOS de un BST. Como cada nodo tiene un solo hijo, el
  // orden de hermanos no revela el lado: hay que declararlo con `side`.
  const chain: TreeNode[] = [1, 2, 3, 4, 5].map((v, i) => ({
    id: `n${v}`,
    value: v,
    parent: i === 0 ? null : `n${v - 1}`,
    ...(i === 0 ? {} : { side: 'right' as const }),
  }));
  const nodes = layout(chain);
  const xs = nodes.sort((a, b) => a.y - b.y).map((n) => n.x);
  // Cada nivel se desplaza a la derecha; ninguno comparte columna con su padre.
  for (let i = 1; i < xs.length; i++) assert.ok(xs[i] > xs[i - 1], `nivel ${i} no se desplazó`);
  // Y todo cabe en el lienzo.
  for (const n of nodes) assert.ok(n.x > 0 && n.x < W, `x=${n.x} fuera del viewBox`);
});

test('sin nodos no revienta', () => {
  assert.deepEqual(layout([]), []);
});

test('un nodo `collapsed` (subárbol entero) conserva la marca y se posiciona como hoja', () => {
  // El caso real: una rotación con A/B/C como subárboles completos colgando
  // de n y p — no son claves sueltas, tienen que dibujarse distinto.
  const tree: TreeNode[] = [
    { id: 'p', value: 'p', parent: null },
    { id: 'n', value: 'n', parent: 'p' },
    { id: 'C', value: 'C', parent: 'p', collapsed: true },
    { id: 'A', value: 'A', parent: 'n', collapsed: true },
    { id: 'B', value: 'B', parent: 'n', collapsed: true },
  ];
  const n = byId(layout(tree));
  assert.equal(n.get('A')!.collapsed, true);
  assert.equal(n.get('B')!.collapsed, true);
  assert.equal(n.get('C')!.collapsed, true);
  assert.equal(n.get('p')!.collapsed, undefined, 'un nodo normal no debería quedar marcado');
  assert.equal(n.get('n')!.collapsed, undefined);
});

// Regresión: el layout ordenaba los hermanos por valor y repartía izquierda/
// derecha comparándolos con el padre, que es la regla de un BST. En un
// montículo los DOS hijos son menores que el padre, así que caían del mismo
// lado y el árbol salía en diagonal. Ningún test lo cubría.
test('un montículo máximo se dibuja como árbol, no en diagonal', () => {
  // A = [14, 8, 10, 4, 2, 9, 3] tras Max-Heapify: los dos hijos < padre.
  const heap: TreeNode[] = [
    { id: 'n1', value: 14, parent: null },
    { id: 'n2', value: 8, parent: 'n1' },
    { id: 'n3', value: 10, parent: 'n1' },
    { id: 'n4', value: 4, parent: 'n2' },
    { id: 'n5', value: 2, parent: 'n2' },
    { id: 'n6', value: 9, parent: 'n3' },
    { id: 'n7', value: 3, parent: 'n3' },
  ];
  const n = byId(layout(heap));
  // La raíz va centrada entre sus dos hijos, no a un extremo.
  assert.equal(n.get('n1')!.x, (n.get('n2')!.x + n.get('n3')!.x) / 2);
  // El orden horizontal es el de declaración (= orden del arreglo), no el de valor:
  // 4, 2, 8, 9, 3 ... es decir n4 < n2 < n5 y n6 < n3 < n7.
  assert.ok(n.get('n4')!.x < n.get('n2')!.x && n.get('n2')!.x < n.get('n5')!.x);
  assert.ok(n.get('n6')!.x < n.get('n3')!.x && n.get('n3')!.x < n.get('n7')!.x);
  // Y el subárbol izquierdo entero queda a la izquierda del derecho.
  assert.ok(n.get('n5')!.x < n.get('n6')!.x);
});

test('un árbol multivía respeta el orden de los hermanos', () => {
  // Un B_3 binomial: la raíz tiene tres hijos de grados 2, 1 y 0.
  const b3: TreeNode[] = [
    { id: 'r', value: 1, parent: null },
    { id: 'a', value: 9, parent: 'r' },
    { id: 'b', value: 5, parent: 'r' },
    { id: 'c', value: 3, parent: 'r' },
  ];
  const n = byId(layout(b3));
  assert.ok(n.get('a')!.x < n.get('b')!.x && n.get('b')!.x < n.get('c')!.x);
  assert.equal(n.get('r')!.x, (n.get('a')!.x + n.get('c')!.x) / 2);
});

test('side decide el lado cuando hay un solo hijo (BST)', () => {
  const izq = byId(layout([
    { id: 'p', value: 10, parent: null },
    { id: 'h', value: 5, parent: 'p', side: 'left' },
  ]));
  assert.ok(izq.get('h')!.x < izq.get('p')!.x);
  const der = byId(layout([
    { id: 'p', value: 10, parent: null },
    { id: 'h', value: 20, parent: 'p', side: 'right' },
  ]));
  assert.ok(der.get('h')!.x > der.get('p')!.x);
});

test('un `state` explícito sobrevive al layout — no sólo el derivado de highlight', () => {
  // Bug real: layout() armaba LaidOut con {id,label,x,y,collapsed} y
  // descartaba `state` en el camino, así que marked/answer/shared/copied/
  // muted nunca llegaban al canvas — sólo "active" (vía highlight) se veía.
  const n = byId(
    layout([
      { id: 'a', value: 1, parent: null, state: 'muted' },
      { id: 'b', value: 2, parent: 'a', state: 'answer' },
    ]),
  );
  assert.equal(n.get('a')!.state, 'muted');
  assert.equal(n.get('b')!.state, 'answer');
});

test('sin `state`, el nodo no lo trae (queda para que highlight decida)', () => {
  const n = byId(layout([{ id: 'a', value: 1, parent: null }]));
  assert.equal(n.get('a')!.state, undefined);
});
