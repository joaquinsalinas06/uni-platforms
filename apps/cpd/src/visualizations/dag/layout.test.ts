import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dagLayout } from './layout.ts';

test('un solo nodo: nivel 0, sin aristas', () => {
  const frame = dagLayout([{ id: 'a', value: 'A', parent: null }]);
  assert.equal(frame.nodes.length, 1);
  assert.equal(frame.edges.length, 0);
  assert.equal(frame.nodes[0].y, 30);
});

test('cadena lineal: cada nodo un nivel más abajo que el anterior, misma x', () => {
  const frame = dagLayout([
    { id: 'a', value: 'A', parent: null },
    { id: 'b', value: 'B', parent: 'a' },
    { id: 'c', value: 'C', parent: 'b' },
  ]);
  const [a, b, c] = frame.nodes;
  assert.ok(a.y < b.y && b.y < c.y);
  assert.equal(a.x, b.x);
  assert.equal(b.x, c.x);
  assert.equal(frame.edges.length, 2);
});

test('árbol binario: los dos hijos del mismo nivel quedan a distinta x, mismo y', () => {
  const frame = dagLayout([
    { id: 'root', value: 'R', parent: null },
    { id: 'l', value: 'L', parent: 'root' },
    { id: 'r', value: 'R2', parent: 'root' },
  ]);
  const l = frame.nodes.find((n) => n.id === 'l')!;
  const r = frame.nodes.find((n) => n.id === 'r')!;
  assert.equal(l.y, r.y);
  assert.notEqual(l.x, r.x);
});

test('DAG con múltiples padres: `parent` decide el nivel/posición, `links` agrega la arista extra sin duplicar la del backbone', () => {
  const frame = dagLayout(
    [
      { id: 'a', value: 'A', parent: null },
      { id: 'b', value: 'B', parent: null },
      { id: 'c', value: 'C', parent: 'a' },
    ],
    [{ from: 'b', to: 'c', kind: 'pointer', label: 'join' }],
  );
  const c = frame.nodes.find((n) => n.id === 'c')!;
  assert.equal(c.y, 100); // nivel 1 (30 + 70)
  assert.equal(frame.edges.length, 2); // a->c (backbone) + b->c (link)
  const extra = frame.edges.find((e) => e.from === 'b' && e.to === 'c')!;
  assert.equal(extra.label, 'join');
  assert.equal(extra.arrow, true);
});

test('árbol de reducción con todo `parent: null`: el nivel sale de `links`, no de `parent` (el caso real: un merge de 2 entradas no cabe en un solo `parent`)', () => {
  const frame = dagLayout(
    [
      { id: 'l0', value: '+', parent: null },
      { id: 'l1', value: '+', parent: null },
      { id: 'l2', value: '+', parent: null },
      { id: 'l3', value: '+', parent: null },
      { id: 'm0', value: '+', parent: null },
      { id: 'm1', value: '+', parent: null },
      { id: 'n0', value: '+', parent: null },
    ],
    [
      { from: 'l0', to: 'm0', kind: 'tree' },
      { from: 'l1', to: 'm0', kind: 'tree' },
      { from: 'l2', to: 'm1', kind: 'tree' },
      { from: 'l3', to: 'm1', kind: 'tree' },
      { from: 'm0', to: 'n0', kind: 'tree' },
      { from: 'm1', to: 'n0', kind: 'tree' },
    ],
  );
  const y = (id: string) => frame.nodes.find((n) => n.id === id)!.y;
  assert.equal(y('l0'), y('l1'));
  assert.equal(y('l1'), y('l2'));
  assert.ok(y('l0') < y('m0'), 'las hojas quedan arriba de su combinación');
  assert.equal(y('m0'), y('m1'));
  assert.ok(y('m0') < y('n0'), 'la raíz de la reducción queda en el nivel más bajo');
  assert.equal(frame.edges.length, 6);
});

test('opts.width fuerza un ancho compartido y sigue centrando la fila dentro de él (lo que evita el desplazamiento de zoom entre pasos de tamaño distinto)', () => {
  const frame = dagLayout(
    [
      { id: 'a', value: 'A', parent: null },
      { id: 'b', value: 'B', parent: null },
    ],
    [],
    { width: 640 },
  );
  assert.equal(frame.width, 640);
  const [a, b] = frame.nodes;
  const center = (a.x + b.x) / 2;
  assert.ok(Math.abs(center - 320) < 1, 'la fila queda centrada en el ancho impuesto, no en su ancho natural');
});

test('barycenter reduce cruces: A->D y B->C con [A,B]/[C,D] en el orden de inserción quedarían cruzados, tras reordenar C queda del lado de B y D del lado de A', () => {
  const frame = dagLayout(
    [
      { id: 'a', value: 'A', parent: null },
      { id: 'b', value: 'B', parent: null },
      { id: 'c', value: 'C', parent: null },
      { id: 'd', value: 'D', parent: null },
    ],
    [
      { from: 'a', to: 'd', kind: 'tree' },
      { from: 'b', to: 'c', kind: 'tree' },
    ],
  );
  const x = (id: string) => frame.nodes.find((n) => n.id === id)!.x;
  // a queda a la izquierda de b (orden de inserción preservado en el nivel 0,
  // sin predecesores que reordenar), y tras el barycenter c (conectado a b)
  // debe quedar del mismo lado que b, d (conectado a a) del lado de a.
  assert.ok(x('a') < x('b'));
  assert.ok(x('d') < x('c'), 'd (colgado de a) debe quedar del lado de a, antes que c (colgado de b)');
});

test('layout determinista: mismo input, mismo output', () => {
  const input: Parameters<typeof dagLayout>[0] = [
    { id: 'a', value: 'A', parent: null },
    { id: 'b', value: 'B', parent: 'a' },
  ];
  const f1 = dagLayout(input);
  const f2 = dagLayout(input);
  assert.deepEqual(f1, f2);
});

test('criticalPath marca de "answer" sólo los nodos/aristas del camino, dejando el resto sin tocar', () => {
  const frame = dagLayout(
    [
      { id: 'a', value: 'A', parent: null },
      { id: 'b', value: 'B', parent: 'a' },
      { id: 'c', value: 'C', parent: 'b' },
      { id: 'e', value: 'E', parent: 'a' }, // rama lateral, fuera del camino crítico
    ],
    [],
    { criticalPath: ['a', 'b', 'c'] },
  );
  assert.equal(frame.nodes.find((n) => n.id === 'c')!.state, 'answer');
  assert.equal(frame.nodes.find((n) => n.id === 'a')!.state, 'answer');
  assert.equal(frame.nodes.find((n) => n.id === 'e')!.state, undefined);

  const bc = frame.edges.find((e) => e.from === 'b' && e.to === 'c')!;
  assert.equal(bc.state, 'answer');
  const ae = frame.edges.find((e) => e.from === 'a' && e.to === 'e')!;
  assert.equal(ae.state, undefined);
});

test('criticalPath es aditivo: sin pasar la opción, el comportamiento es idéntico al de antes', () => {
  const nodes: Parameters<typeof dagLayout>[0] = [
    { id: 'a', value: 'A', parent: null },
    { id: 'b', value: 'B', parent: 'a' },
  ];
  const withoutOpts = dagLayout(nodes);
  const withEmptyOpts = dagLayout(nodes, [], {});
  assert.deepEqual(withoutOpts, withEmptyOpts);
});
