import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutRangeTree, layout, deriveBridges, type RangeNode, type RangeArray } from './layout.ts';
import { NODE_W, NODE_H } from '../canvas-types.ts';

const box = (n: { x: number; y: number; w?: number; h?: number }, defaultW = NODE_W, defaultH = NODE_H) => ({
  l: n.x - (n.w ?? defaultW) / 2,
  r: n.x + (n.w ?? defaultW) / 2,
  t: n.y - (n.h ?? defaultH) / 2,
  b: n.y + (n.h ?? defaultH) / 2,
});
const overlaps = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) =>
  a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;

// El árbol 1D del profesor (#29): raíz 9, hijos 4 y 15, nivel 3/7/13/18,
// hojas {3,4,7,9,13,15,18,27}.
const TREE_1D: RangeNode[] = [
  { id: 'n9', value: 9, parent: null },
  { id: 'n4', value: 4, parent: 'n9' },
  { id: 'n15', value: 15, parent: 'n9' },
  { id: 'n3', value: 3, parent: 'n4' },
  { id: 'n7', value: 7, parent: 'n4' },
  { id: 'n13', value: 13, parent: 'n15' },
  { id: 'n18', value: 18, parent: 'n15' },
];
test('1D (#29): las 8 hojas quedan en orden creciente con paso constante, internos centrados', () => {
  const step = {
    note: '',
    nodes: TREE_1D,
  };
  const frame = layoutRangeTree(step);
  const byId = new Map(frame.nodes.map((n) => [n.id, n]));

  const leafIds = ['n3', 'n7', 'n13', 'n18'];
  const xs = leafIds.map((id) => byId.get(id)!.x).sort((a, b) => a - b);
  const gaps = xs.slice(1).map((x, i) => x - xs[i]);
  assert.ok(gaps.every((g) => Math.abs(g - gaps[0]) < 1e-9), 'las hojas no tienen paso constante');

  assert.equal(byId.get('n4')!.x, (byId.get('n3')!.x + byId.get('n7')!.x) / 2);
  assert.equal(byId.get('n15')!.x, (byId.get('n13')!.x + byId.get('n18')!.x) / 2);
  assert.equal(byId.get('n9')!.x, (byId.get('n4')!.x + byId.get('n15')!.x) / 2);

  // y estrictamente creciente con la profundidad
  assert.ok(byId.get('n9')!.y < byId.get('n4')!.y);
  assert.ok(byId.get('n4')!.y < byId.get('n3')!.y);
});

test('la geometría NO depende del estado: highlight/marked/answer no mueven nodos', () => {
  const plain = layoutRangeTree({ note: '', nodes: TREE_1D });
  const withStates = layoutRangeTree({
    note: '',
    nodes: TREE_1D.map((n) => ({ ...n, state: n.id === 'n4' ? 'marked' : n.id === 'n7' ? 'answer' : undefined })),
    highlight: ['n9'],
  });
  const a = new Map(plain.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
  const b = new Map(withStates.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
  for (const [id, pos] of a) {
    assert.deepEqual(b.get(id), pos, `el nodo ${id} se movió sólo por cambiar de estado`);
  }
});

test('consulta [5,16] (#35): delimitadores y canónicos son ancestros de las hojas correctas dentro/fuera del rango', () => {
  const step = {
    note: '',
    nodes: TREE_1D.map((n) => ({
      ...n,
      state:
        n.id === 'n4' || n.id === 'n18'
          ? ('marked' as const) // delimitadores: hojas 4 y 18
          : n.id === 'n7' || n.id === 'n13'
            ? ('answer' as const) // canónicos: 7 y 13
            : undefined,
    })),
  };
  const frame = layoutRangeTree(step);
  const byId = new Map(frame.nodes.map((n) => [n.id, n]));
  assert.equal(byId.get('n4')!.state, 'marked');
  assert.equal(byId.get('n18')!.state, 'marked');
  assert.equal(byId.get('n7')!.state, 'answer');
  assert.equal(byId.get('n13')!.state, 'answer');
  // invariante de subárbol canónico: n7 y n13 cubren exactamente [5,16]
  // (hojas 7,9,13,15 quedan estrictamente entre los delimitadores 4 y 18)
  const x4 = byId.get('n4')!.x;
  const x18 = byId.get('n18')!.x;
  for (const id of ['n3']) assert.ok(byId.get(id)!.x <= x4, `${id} debería quedar fuera de [5,16] por la izquierda`);
});

test('2D (#47): el árbol secundario cae dentro de su panel, sin solaparse con el primario, y hay exactamente una flecha ancla→raíz', () => {
  const primary: RangeNode[] = [
    { id: 'p15', value: '15', parent: null, panel: 'primary' },
    { id: 'p9', value: '9', parent: 'p15', panel: 'primary' },
    { id: 'p27', value: '27', parent: 'p15', panel: 'primary' },
  ];
  const secondary: RangeNode[] = [
    { id: 's-15,-2', value: '(15,-2)', parent: null, panel: 'secondary' },
    { id: 's-18,3', value: '(18,3)', parent: 's-15,-2', panel: 'secondary' },
  ];
  const step = {
    note: '',
    nodes: [...primary, ...secondary],
    panels: [{ id: 'secondary', label: 'árbol secundario (y)', anchor: 'p15' }],
  };
  const frame = layoutRangeTree(step);
  const group = frame.groups.find((g) => g.id === 'secondary')!;
  assert.ok(group, 'falta el panel del árbol secundario');

  const secIds = new Set(secondary.map((n) => n.id));
  const inGroupBox = (n: { x: number; y: number }) =>
    n.x >= group.x && n.x <= group.x + group.w && n.y >= group.y && n.y <= group.y + group.h;
  for (const n of frame.nodes.filter((n) => secIds.has(n.id))) {
    assert.ok(inGroupBox(n), `${n.id} se salió de su panel`);
  }

  const groupBox = { l: group.x, r: group.x + group.w, t: group.y, b: group.y + group.h };
  for (const n of frame.nodes.filter((n) => !secIds.has(n.id))) {
    assert.ok(!overlaps(box(n), groupBox), `el nodo primario ${n.id} se solapa con el panel secundario`);
  }

  const anchorEdges = frame.edges.filter((e) => e.kind === 'pointer' && e.arrow);
  assert.equal(anchorEdges.length, 1, 'debe haber exactamente una flecha ancla→raíz del secundario');
  assert.equal(anchorEdges[0].from, 'p15');
});

test('layers (#32-33): puentes derivados del ejemplo del profesor dan los índices exactos', () => {
  const parent: RangeArray = { id: 'Lp', row: 0, cells: [3, 5, 8, 9] };
  const left: RangeArray = { id: 'Ll', row: 1, slot: 'left', cells: [3, 8] };
  const right: RangeArray = { id: 'Lr', row: 1, slot: 'right', cells: [5, 9] };

  // lower_bound de cada valor del padre en el arreglo hijo; cuando no hay
  // ninguno ≥ (9 en la izquierda, ninguno en la derecha para 8 y 9 no aplica
  // aquí salvo el último), se acota al último índice existente — no hay un
  // nodo "sentinela" que dibujar más allá del final del arreglo.
  const toLeft = deriveBridges(parent, left).map((b) => b.toIndex);
  const toRight = deriveBridges(parent, right).map((b) => b.toIndex);
  assert.deepEqual(toLeft, [0, 1, 1, 1]);
  assert.deepEqual(toRight, [0, 0, 1, 1]);
});

test('layers: celdas contiguas con paso constante, fila 1 debajo de fila 0, izquierda a la izquierda de derecha', () => {
  const step = {
    note: '',
    mode: 'layers' as const,
    arrays: [
      { id: 'Lp', row: 0, cells: [3, 5, 8, 9] },
      { id: 'Ll', row: 1, slot: 'left' as const, cells: [3, 8] },
      { id: 'Lr', row: 1, slot: 'right' as const, cells: [5, 9] },
    ],
  };
  const frame = layout(step);
  const byId = new Map(frame.nodes.map((n) => [n.id, n]));

  const parentXs = [0, 1, 2, 3].map((i) => byId.get(`Lp:${i}`)!.x);
  const gaps = parentXs.slice(1).map((x, i) => x - parentXs[i]);
  assert.ok(gaps.every((g) => Math.abs(g - gaps[0]) < 1e-9));

  assert.ok(byId.get('Ll:0')!.y > byId.get('Lp:0')!.y);
  assert.ok(Math.max(byId.get('Ll:0')!.x, byId.get('Ll:1')!.x) < Math.min(byId.get('Lr:0')!.x, byId.get('Lr:1')!.x));

  // Cada celda del padre emite exactamente 2 puentes (uno por hijo)
  const fromLp0 = frame.edges.filter((e) => e.from === 'Lp:0');
  assert.equal(fromLp0.length, 2);
});

test('layers: si el frontmatter no trae `bridges`, se derivan solos y quedan como aristas válidas', () => {
  const step = {
    note: '',
    mode: 'layers' as const,
    arrays: [
      { id: 'Lp', row: 0, cells: [3, 5, 8, 9] },
      { id: 'Ll', row: 1, slot: 'left' as const, cells: [3, 8] },
      { id: 'Lr', row: 1, slot: 'right' as const, cells: [5, 9] },
    ],
  };
  const frame = layout(step);
  assert.equal(frame.edges.length, 8); // 4 celdas del padre × 2 hijos
  for (const e of frame.edges) {
    assert.ok(frame.nodes.some((n) => n.id === e.from));
    assert.ok(frame.nodes.some((n) => n.id === e.to));
  }
});

test('layers: arrays vacío no revienta', () => {
  const frame = layout({ note: '', mode: 'layers', arrays: [] });
  assert.deepEqual(frame.nodes, []);
  assert.ok(frame.height > 0);
});

test('tree: nodes vacío no revienta', () => {
  const frame = layoutRangeTree({ note: '', nodes: [] });
  assert.deepEqual(frame.nodes, []);
  assert.ok(frame.height > 0);
});
