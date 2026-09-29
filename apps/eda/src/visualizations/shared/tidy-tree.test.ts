import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tidy, scale, type OrderedNode } from './tidy-tree.ts';

const byId = (placed: ReturnType<typeof tidy>) => new Map(placed.map((p) => [p.id, p]));

test('el padre queda centrado entre sus dos hijos', () => {
  const tree: OrderedNode[] = [
    { id: 'r', label: 'r', parent: null },
    { id: 'l', label: 'l', parent: 'r' },
    { id: 'd', label: 'd', parent: 'r' },
  ];
  const n = byId(tidy(tree));
  assert.equal(n.get('r')!.x, (n.get('l')!.x + n.get('d')!.x) / 2);
});

test('el orden horizontal es el orden de aparición, NO el valor — la diferencia con tree/layout.ts', () => {
  // A propósito, los ids no están ordenados alfabética ni numéricamente: si
  // tidy() ordenara por valor (como hace tree/layout.ts), el árbol de
  // versiones y el range tree saldrían mal, porque ninguno de los dos separa
  // a sus hijos por valor.
  const tree: OrderedNode[] = [
    { id: 'v1', label: 'v1', parent: null },
    { id: 'v3', label: 'v3', parent: 'v1' }, // aparece antes...
    { id: 'v2', label: 'v2', parent: 'v1' }, // ...que este, aunque "v2" < "v3"
  ];
  const placed = tidy(tree);
  const order = [...placed].sort((a, b) => a.x - b.x).map((p) => p.id);
  assert.deepEqual(order.filter((id) => id !== 'v1'), ['v3', 'v2']);
});

test('7 nodos en árbol binario completo (versión de 3 niveles): 4 hojas equiespaciadas', () => {
  const tree: OrderedNode[] = [
    { id: '1', label: '1', parent: null },
    { id: '2', label: '2', parent: '1' },
    { id: '3', label: '3', parent: '1' },
    { id: '4', label: '4', parent: '2' },
    { id: '5', label: '5', parent: '2' },
    { id: '6', label: '6', parent: '3' },
    { id: '7', label: '7', parent: '3' },
  ];
  const placed = byId(tidy(tree));
  const leaves = ['4', '5', '6', '7'].map((id) => placed.get(id)!.x).sort((a, b) => a - b);
  const gaps = leaves.slice(1).map((x, i) => x - leaves[i]);
  assert.ok(gaps.every((g) => Math.abs(g - gaps[0]) < 1e-9), 'las 4 hojas no están equiespaciadas');
  assert.equal(placed.get('2')!.x, (placed.get('4')!.x + placed.get('5')!.x) / 2);
  assert.equal(placed.get('3')!.x, (placed.get('6')!.x + placed.get('7')!.x) / 2);
  assert.equal(placed.get('1')!.x, (placed.get('2')!.x + placed.get('3')!.x) / 2);
});

test('un camino degenerado se abanica (cada nivel se desplaza) en vez de apilarse vertical', () => {
  const chain: OrderedNode[] = ['a', 'b', 'c', 'd'].map((id, i) => ({
    id,
    label: id,
    parent: i === 0 ? null : ['a', 'b', 'c', 'd'][i - 1],
  }));
  const placed = tidy(chain).sort((a, b) => a.depth - b.depth);
  for (let i = 1; i < placed.length; i++) {
    assert.notEqual(placed[i].x, placed[i - 1].x, `nivel ${i} no se desplazó`);
  }
});

test('sin nodos no revienta', () => {
  assert.deepEqual(tidy([]), []);
});

test('scale mete todo dentro del rectángulo pedido', () => {
  const tree: OrderedNode[] = [
    { id: 'r', label: 'r', parent: null },
    { id: 'l', label: 'l', parent: 'r' },
    { id: 'd', label: 'd', parent: 'r' },
    { id: 'll', label: 'll', parent: 'l' },
  ];
  const box = { x0: 100, width: 200, y0: 10, rowGap: 50 };
  const placed = scale(tidy(tree), box);
  for (const p of placed) {
    assert.ok(p.x >= box.x0 && p.x <= box.x0 + box.width, `x=${p.x} fuera de [${box.x0}, ${box.x0 + box.width}]`);
  }
  const root = placed.find((p) => p.id === 'r')!;
  assert.equal(root.y, box.y0);
  const child = placed.find((p) => p.id === 'l')!;
  assert.equal(child.y, box.y0 + box.rowGap);
});

test('scale con un solo nodo lo centra, sin dividir por cero', () => {
  const placed = scale(tidy([{ id: 'only', label: 'only', parent: null }]), {
    x0: 0,
    width: 100,
    y0: 0,
    rowGap: 40,
  });
  assert.equal(placed[0].x, 50);
});

test('scale sobre vacío no revienta', () => {
  assert.deepEqual(scale([], { x0: 0, width: 100, y0: 0, rowGap: 40 }), []);
});
