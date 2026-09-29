import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sequenceLayout, newFromPrev } from './layout.ts';

const actors = [{ id: 'p', label: 'Publisher' }, { id: 'b', label: 'Broker' }, { id: 's', label: 'Subscriber' }];
const ann = (f: ReturnType<typeof sequenceLayout>, id: string) => f.annotations.find((a) => a.id === id)!;
const path = (f: ReturnType<typeof sequenceLayout>, id: string) => f.paths!.find((p) => p.id === id)!;
const xs = (d: string) => [...d.matchAll(/[MH](-?[\d.]+)/g)].map((m) => Number(m[1]));

test('cabeceras en orden, una línea de vida por actor, mensajes de arriba hacia abajo', () => {
  const f = sequenceLayout(actors, [
    { from: 'p', to: 'b', label: 'PUBLISH', flags: 'QoS 2' },
    { from: 'b', to: 'p', label: 'PUBREC' },
    { from: 'b', to: 's', label: 'PUBLISH' },
  ]);
  const [p, b, s] = f.nodes;
  assert.ok(p.x < b.x && b.x < s.x);
  assert.equal(f.paths!.filter((q) => q.id.startsWith('life-')).length, 3);
  assert.ok(ann(f, 'm0-label').y < ann(f, 'm1-label').y && ann(f, 'm1-label').y < ann(f, 'm2-label').y);
  assert.equal(ann(f, 'm0-flags').text, 'QoS 2');
  assert.ok(ann(f, 'm0-flags').y > ann(f, 'm0-label').y, 'flags debajo de la etiqueta');
  // PUBREC va de b a p: la flecha termina en la línea de vida de p.
  const [x0, x1] = xs(path(f, 'm1-arrow').d);
  assert.ok(x0 > x1 && Math.abs(x1 - p.x) <= 1.5);
});

test('lost: la flecha se corta a mitad de camino, sin punta, con ✕', () => {
  const f = sequenceLayout(actors.slice(0, 2), [{ from: 'b', to: 'p', label: 'PUBACK', lost: true }]);
  const a = path(f, 'm0-arrow');
  assert.equal(a.arrow, false);
  const [x0, x1] = xs(a.d);
  const [p, b] = f.nodes;
  assert.ok(x1 > p.x + 20 && x1 < b.x - 20, 'se detiene entre las dos líneas de vida');
  assert.ok(path(f, 'm0-x'));
  void x0;
});

test('store, auto-mensaje y divisor', () => {
  const f = sequenceLayout(actors.slice(0, 2), [
    { from: 'p', to: 'b', label: 'PUBLISH', store: 'guarda msg' },
    { from: 'b', to: 'b', label: 'timeout' },
    { from: 'p', to: 'b', label: '60 s sin tráfico', divider: true },
  ]);
  assert.equal(ann(f, 'm0-store').text, 'guarda msg');
  assert.ok(Math.abs(ann(f, 'm0-store').x - f.nodes[1].x) < 1, 'la nota va en el receptor');
  assert.match(path(f, 'm1-arrow').d, /V/);
  assert.ok(path(f, 'm2-div'));
});

test('un rótulo largo abre el hueco entre líneas de vida', () => {
  const short = sequenceLayout(actors.slice(0, 2), [{ from: 'p', to: 'b', label: 'A' }]);
  const long = sequenceLayout(actors.slice(0, 2), [{ from: 'p', to: 'b', label: 'PUBLISH "Temperature=25°C" con un texto muy largo' }]);
  assert.ok(long.nodes[1].x - long.nodes[0].x > short.nodes[1].x - short.nodes[0].x);
  const l = ann(long, 'm0-label');
  const w = l.text.length * 12 * 0.6;
  assert.ok(l.x - w / 2 >= long.nodes[0].x && l.x + w / 2 <= long.nodes[1].x, 'el rótulo cabe entre las dos líneas');
});

test('paso que extiende al anterior: sólo el mensaje nuevo queda active', () => {
  const m1 = [{ from: 'p', to: 'b', label: 'CONNECT' }];
  const m2 = [...m1, { from: 'b', to: 'p', label: 'CONNACK' }];
  const nf = newFromPrev(m1, m2);
  assert.equal(nf, 1);
  const f = sequenceLayout(actors.slice(0, 2), m2, { newFrom: nf });
  assert.equal(path(f, 'm0-arrow').state, undefined);
  assert.equal(path(f, 'm1-arrow').state, 'active');
  assert.equal(newFromPrev([{ from: 'x', to: 'y', label: 'otro' }], m2), undefined);
});

test('minHeight alarga las líneas de vida', () => {
  const f = sequenceLayout(actors, [{ from: 'p', to: 'b', label: 'X' }], { minHeight: 500 });
  assert.equal(f.height, 500);
});
