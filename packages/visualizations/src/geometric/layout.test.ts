import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geometricLayout, geometry, pointCount } from './layout.ts';

const path = (f: ReturnType<typeof geometricLayout>, id: string) => f.paths!.find((p) => p.id === id);
const ann = (f: ReturnType<typeof geometricLayout>, id: string) => f.annotations.find((a) => a.id === id);

// Ejemplo de la clase: claves {1..4}, accesos 3, 1, 4, 2 → (3,1) (1,2) (4,3) (2,4).
const accesos = [
  { id: 'a', x: 3, t: 1 },
  { id: 'b', x: 1, t: 2 },
  { id: 'c', x: 4, t: 3 },
  { id: 'd', x: 2, t: 4 },
];

test('la escala se deduce de los puntos y el tiempo crece hacia arriba', () => {
  const g = geometry({ points: accesos }, 560);
  assert.equal(g.xMax, 4);
  assert.equal(g.tMax, 4);
  assert.ok(g.py(4) < g.py(1), 't=4 queda más arriba (menor y) que t=1');
  assert.ok(g.px(1) < g.px(4));
});

test('un punto de entrada es relleno; uno agregado es un anillo (sin relleno)', () => {
  const f = geometricLayout({ points: [{ id: 'a', x: 1, t: 1 }, { id: 'e', x: 2, t: 1, kind: 'added' }] });
  assert.equal(path(f, 'a')!.fill, true);
  assert.notEqual(path(f, 'e')!.fill, true);
});

test('el rectángulo entre dos puntos es el mismo sin importar el orden de las esquinas', () => {
  const pts = [{ id: 'p', x: 1, t: 1 }, { id: 'q', x: 4, t: 2 }];
  const f1 = geometricLayout({ points: pts, rects: [{ id: 'r', a: 'p', b: 'q' }] });
  const f2 = geometricLayout({ points: pts, rects: [{ id: 'r', a: 'q', b: 'p' }] });
  assert.equal(path(f1, 'r')!.d, path(f2, 'r')!.d);
});

test('un rectángulo puede usar coordenadas sueltas (esquina virtual)', () => {
  const f = geometricLayout({ points: [{ id: 'p', x: 1, t: 1 }], rects: [{ id: 'r', a: 'p', b: [3, 2] }] });
  assert.ok(path(f, 'r'));
  assert.equal(geometry({ points: [{ id: 'p', x: 1, t: 1 }], rects: [{ id: 'r', a: 'p', b: [3, 2] }] }, 560).xMax, 3);
});

test('un id de punto que no existe revienta con un mensaje claro', () => {
  assert.throws(() => geometricLayout({ points: [], rects: [{ id: 'r', a: 'x', b: [1, 1] }] }), /no existe/);
});

test('highlight pinta de activo el punto o rectángulo nombrado', () => {
  const f = geometricLayout({ points: [{ id: 'p', x: 1, t: 1 }], highlight: ['p'] });
  assert.equal(path(f, 'p')!.state, 'active');
});

test('ticks: una etiqueta por llave y por tiempo; xLabels reemplaza los números', () => {
  const f = geometricLayout({ points: accesos, xLabels: ['a', 'b', 'c', 'd'] });
  assert.equal(ann(f, 'tx-3')!.text, 'c');
  assert.equal(ann(f, 'tt-4')!.text, '4');
});

test('pointCount cuenta puntos distintos (el costo de la ejecución)', () => {
  assert.equal(pointCount({ points: accesos }), 4);
  assert.equal(pointCount({ points: [...accesos, { id: 'dup', x: 3, t: 1 }] }), 4);
});

test('el alto crece con el número de tiempos', () => {
  const chico = geometricLayout({ points: [{ id: 'p', x: 1, t: 1 }] });
  const grande = geometricLayout({ points: [{ id: 'p', x: 1, t: 1 }, { id: 'q', x: 1, t: 6 }] });
  assert.ok(grande.height > chico.height);
});

test('row resalta la fila con una banda y pone su tick en activo', () => {
  const f = geometricLayout({ points: [{ id: 'p', x: 1, t: 2 }], row: 2 });
  assert.ok(path(f, 'row-band'));
  assert.equal(ann(f, 'tt-2')!.state, 'active');
  assert.equal(ann(f, 'tt-1')!.state, undefined);
});

test('el punto activo lleva halo; los demás no', () => {
  const f = geometricLayout({ points: [{ id: 'p', x: 1, t: 1, state: 'active' }, { id: 'q', x: 2, t: 2 }] });
  assert.ok(path(f, 'p-halo'));
  assert.equal(path(f, 'q-halo'), undefined);
});

test('entradas: los puntos crecen escalonados y los rectángulos se trazan', () => {
  const f = geometricLayout({
    points: [{ id: 'a', x: 1, t: 1 }, { id: 'b', x: 3, t: 2 }],
    rects: [{ id: 'r', a: 'a', b: 'b', fill: true }],
  });
  assert.equal(path(f, 'a')!.enter, 'grow');
  assert.ok((path(f, 'b')!.delay ?? 0) > (path(f, 'a')!.delay ?? 0));
  assert.equal(path(f, 'r')!.enter, 'draw');
  assert.ok((path(f, 'r-fill')!.delay ?? 0) > (path(f, 'r')!.delay ?? 0));
});
