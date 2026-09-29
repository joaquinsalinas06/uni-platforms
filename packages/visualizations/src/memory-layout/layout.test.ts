import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryLayoutLayout } from './layout.ts';

test('bloques contiguos: ancho proporcional a bytes, sin hueco entre ellos', () => {
  const frame = memoryLayoutLayout([
    { id: 'a', label: 'int', bytes: 4, offset: 0 },
    { id: 'b', label: 'double', bytes: 8, offset: 4 },
  ]);
  const [a, b] = frame.nodes;
  assert.ok(b.w! > a.w!); // 8 bytes > 4 bytes
  // el borde derecho de a coincide con el borde izquierdo de b (sin hueco)
  assert.equal(a.x + a.w! / 2, b.x - b.w! / 2);
});

test('un hueco de padding entre bloques se ve como espacio en blanco (offset del siguiente > fin del anterior)', () => {
  const frame = memoryLayoutLayout([
    { id: 'a', label: 'char', bytes: 1, offset: 0 },
    { id: 'b', label: 'int', bytes: 4, offset: 4 }, // 3 bytes de padding entre 1 y 4
  ]);
  const [a, b] = frame.nodes;
  const aEnd = a.x + a.w! / 2;
  const bStart = b.x - b.w! / 2;
  assert.ok(bStart > aEnd);
});

test('la regla numérica marca cada límite de bloque (inicio y fin)', () => {
  const frame = memoryLayoutLayout([{ id: 'a', label: 'int', bytes: 4, offset: 0 }]);
  const ticks = frame.annotations.filter((a) => a.id.startsWith('tick-')).map((a) => a.text);
  assert.deepEqual(ticks, ['0', '4']);
});

test('el nombre de cada campo se dibuja como anotación (no como `tag`, que en un struct real chocaría entre vecinos)', () => {
  const frame = memoryLayoutLayout([{ id: 'a', label: 'int', bytes: 4, offset: 0 }]);
  const labels = frame.annotations.filter((a) => a.id.startsWith('label-'));
  assert.equal(labels.length, 1);
  assert.equal(labels[0].text, 'int');
  assert.equal(frame.nodes[0].tag, undefined);
});

test('dos campos angostos y contiguos cuyos nombres chocarían van en filas distintas', () => {
  const frame = memoryLayoutLayout([
    { id: 'a', label: 'char', bytes: 1, offset: 0 },
    { id: 'b', label: 'padding', bytes: 3, offset: 1 },
  ]);
  const ya = frame.annotations.find((a) => a.id === 'label-a')!.y;
  const yb = frame.annotations.find((a) => a.id === 'label-b')!.y;
  assert.notEqual(ya, yb);
});

test('opts.width comparte el mismo ancho entre pasos: el offset 0 cae siempre en el mismo x, nunca se recentra', () => {
  const angosto = memoryLayoutLayout([{ id: 'a', label: 'char', bytes: 1, offset: 0 }]);
  const compartido = memoryLayoutLayout([{ id: 'a', label: 'char', bytes: 1, offset: 0 }], { width: 800 });
  assert.equal(compartido.width, 800);
  assert.equal(angosto.nodes[0].x, compartido.nodes[0].x); // ancla a la izquierda, no se centra en el width impuesto
});

test('sin bloques no revienta', () => {
  const frame = memoryLayoutLayout([]);
  assert.equal(frame.nodes.length, 0);
  assert.ok(Number.isFinite(frame.width));
});
