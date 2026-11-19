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
    { id: 'a', label: 'char (1 byte, sin signo)', bytes: 1, offset: 0 },
    { id: 'b', label: 'padding (3 bytes de relleno)', bytes: 3, offset: 1 },
  ]);
  const ya = frame.annotations.find((a) => a.id === 'label-a')!.y;
  const yb = frame.annotations.find((a) => a.id === 'label-b')!.y;
  assert.notEqual(ya, yb);
});

test('tres nombres largos y vecinos abren una tercera fila en vez de pisarse', () => {
  const frame = memoryLayoutLayout([
    { id: 'a', label: 'Byte 1: Tipo · DUP · QoS · RETAIN', bytes: 1, offset: 0 },
    { id: 'b', label: 'Remaining Length (1-4 B)', bytes: 1, offset: 1 },
    { id: 'c', label: 'Header variable (opcional)', bytes: 2, offset: 2 },
  ]);
  const ys = ['a', 'b', 'c'].map((id) => frame.annotations.find((a) => a.id === `label-${id}`)!.y);
  assert.equal(new Set(ys).size, 3);
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

test('unit: el rótulo de tamaño usa la unidad dada (default B)', () => {
  const b = memoryLayoutLayout([{ id: 'p', label: 'preámbulo', bytes: 12.25, offset: 0 }], { unit: 'sím' });
  assert.equal(b.nodes[0].label, '12.25 sím');
  const d = memoryLayoutLayout([{ id: 'a', label: 'double', bytes: 8, offset: 0 }]);
  assert.equal(d.nodes[0].label, '8 B');
});

test('bloques enormes caben en el ancho y uno chico junto a ellos sigue visible, con su tamaño afuera', () => {
  const f = memoryLayoutLayout([
    { id: 'h', label: 'cabecera IP', bytes: 20, offset: 0 },
    { id: 'd', label: 'datos', bytes: 1480, offset: 20 },
  ], { width: 356 });
  const [h, d] = f.nodes;
  assert.ok(f.width <= 356);
  assert.ok(h.w! >= 30);
  assert.ok(d.w! > h.w!);
  assert.equal(h.x + h.w! / 2, d.x - d.w! / 2); // siguen contiguos
  assert.ok(f.annotations.some((a) => a.id === 'size-h' && a.text === '20 B'));
  assert.equal(d.label, '1480 B');
  // el tick del límite cae en el borde real del bloque, no en offset × escala
  assert.equal(f.annotations.find((a) => a.id === 'tick-20')!.x, h.x + h.w! / 2);
});
