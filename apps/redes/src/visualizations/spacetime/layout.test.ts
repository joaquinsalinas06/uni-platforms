import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spacetimeLayout, niceTicks, TOP, PLOT_H, MIN_THICK } from './layout.ts';

const columns = [{ id: 'e', label: 'Emisor' }, { id: 'r', label: 'Receptor' }];
const Y = (t: number, max: number) => TOP + (t / max) * PLOT_H;

test('paralelogramo: esquinas en tStart, tStart+tProp, +tTrans con escala real', () => {
  const f = spacetimeLayout({ columns, time: { max: 40 }, sends: [{ from: 'e', to: 'r', tStart: 2, tTrans: 8, tProp: 10, kind: 'data' }] });
  const [a, b, c, d] = f.sends[0].pts;
  const [e, r] = f.columns;
  assert.deepEqual([a.x, b.x, c.x, d.x], [e.x, r.x, r.x, e.x]);
  assert.equal(a.y, Y(2, 40));
  assert.equal(b.y, Y(12, 40), 'borde superior llega en tStart + tProp');
  assert.equal(d.y, Y(10, 40), 'borde inferior sale en tStart + tTrans');
  assert.equal(c.y, Y(20, 40), 'y llega en tStart + tTrans + tProp');
});

test('tTrans diminuto frente a tProp sigue visible (grosor mínimo)', () => {
  // Stop-and-wait del contrato: L/R = 0,008 ms, tProp = 15 ms → 0,1 px real.
  const f = spacetimeLayout({ columns, time: { max: 32 }, sends: [{ from: 'e', to: 'r', tStart: 0, tTrans: 0.008, tProp: 15, kind: 'data' }] });
  const [a, , , d] = f.sends[0].pts;
  assert.ok(Y(0.008, 32) - Y(0, 32) < 1, 'a escala real sería sub-píxel');
  assert.equal(d.y - a.y, MIN_THICK);
});

test('ack es una línea; lost corta a mitad de camino', () => {
  const f = spacetimeLayout({ columns, time: { max: 30 }, sends: [
    { from: 'r', to: 'e', tStart: 10, tProp: 10, kind: 'ack' },
    { from: 'e', to: 'r', tStart: 0, tTrans: 2, tProp: 10, kind: 'data', lost: true },
  ] });
  const [ack, lost] = f.sends;
  assert.equal(ack.pts.length, 2);
  assert.equal(ack.tip.x, f.columns[0].x);
  const mid = (f.columns[0].x + f.columns[1].x) / 2;
  assert.ok(Math.abs(lost.pts[1].x - mid) < 1e-9);
  assert.ok(Math.abs(lost.pts[1].y - Y(5, 30)) < 1e-9, "llega a la mitad del tiempo de propagación");
});

test('ticks: dados o redondos automáticos; corchete a la izquierda de la primera columna', () => {
  assert.deepEqual(niceTicks(32), [0, 10, 20, 30]);
  assert.deepEqual(niceTicks(1), [0, 0.2, 0.4, 0.6, 0.8, 1]);
  const f = spacetimeLayout({ columns, time: { max: 32, ticks: [0, 15, 30], unit: 'ms' }, sends: [], spans: [{ column: 'e', tStart: 0, tEnd: 30, label: 'RTT', kind: 'rtt' }] });
  assert.deepEqual(f.ticks.map((t) => t.text), ['0', '15', '30']);
  const s = f.spans[0];
  assert.equal(s.side, -1);
  assert.ok(s.x < f.columns[0].x && s.x > f.axisX);
  assert.equal(s.y1, Y(30, 32));
});
