import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timelineLayout } from './layout.ts';

const lanes = [
  { id: 'p0', label: 'P0' },
  { id: 'p1', label: 'P1' },
];

test('cada lane es una fila: distinto y, mismo orden que el array', () => {
  const frame = timelineLayout(lanes, []);
  const lineGroups = frame.groups.filter((g) => g.id.startsWith('lane-'));
  assert.equal(lineGroups.length, 2);
  assert.ok(lineGroups[0].y < lineGroups[1].y);
});

test('un evento se posiciona dentro de su lane, ancho proporcional a su duración', () => {
  const frame = timelineLayout(lanes, [
    { lane: 'p0', tStart: 0, tEnd: 5, label: 'compute' },
    { lane: 'p0', tStart: 5, tEnd: 6, label: 'sync' },
  ]);
  const [ev1, ev2] = frame.nodes;
  assert.ok(ev1.w! > ev2.w!); // 5 unidades vs 1
  assert.equal(ev1.y, ev2.y); // misma lane
});

test('un mensaje entre lanes distintas produce una arista send→recv con ángulo (distinto y en los extremos)', () => {
  const frame = timelineLayout(lanes, [], [{ fromLane: 'p0', toLane: 'p1', tStart: 1, tEnd: 4, label: 'msg' }]);
  assert.equal(frame.edges.length, 1);
  const send = frame.nodes.find((n) => n.id === frame.edges[0].from)!;
  const recv = frame.nodes.find((n) => n.id === frame.edges[0].to)!;
  assert.notEqual(send.y, recv.y);
  assert.ok(recv.x > send.x); // llega después de que se mandó
  assert.equal(frame.edges[0].label, 'msg');
});

test('un evento angosto con label largo no lo dibuja adentro (se saldría de la caja) — sale como anotación arriba', () => {
  const frame = timelineLayout(lanes, [
    { lane: 'p0', tStart: 0, tEnd: 1, label: 'copia al buffer' },
    { lane: 'p0', tStart: 1, tEnd: 4, label: 'sigue operando' },
  ]);
  const short = frame.nodes.find((n) => n.id === 'event-0')!;
  assert.equal(short.label, '');
  const ann = frame.annotations.find((a) => a.id === 'event-label-0');
  assert.equal(ann?.text, 'copia al buffer');
});

test('dos eventos angostos y consecutivos cuyos nombres chocarían van en filas distintas', () => {
  // Un tercer evento lejano estira el dominio de tiempo (0-20) para que los
  // dos primeros, de 1 unidad cada uno, queden angostos de verdad — igual
  // que "copia al buffer"/"sigue operando" en el caso real que rompía.
  const frame = timelineLayout(lanes, [
    { lane: 'p0', tStart: 0, tEnd: 1, label: 'copia al buffer' },
    { lane: 'p0', tStart: 1, tEnd: 2, label: 'revisa estado' },
    { lane: 'p0', tStart: 2, tEnd: 20, label: 'sigue' },
  ]);
  const y0 = frame.annotations.find((a) => a.id === 'event-label-0')!.y;
  const y1 = frame.annotations.find((a) => a.id === 'event-label-1')!.y;
  assert.notEqual(y0, y1);
});

test('un evento activo agrega el cursor "now" alineado a su x', () => {
  const frame = timelineLayout(lanes, [
    { lane: 'p0', tStart: 0, tEnd: 5, label: 'compute' },
    { lane: 'p0', tStart: 5, tEnd: 6, label: 'sync', state: 'active' },
  ]);
  const cursor = frame.groups.find((g) => g.id === 'now-cursor');
  const activeEvent = frame.nodes.find((n) => n.state === 'active')!;
  assert.ok(cursor);
  assert.equal(cursor!.x, activeEvent.x);
});

test('sin ningún nodo activo, no se agrega el cursor "now"', () => {
  const frame = timelineLayout(lanes, [{ lane: 'p0', tStart: 0, tEnd: 5, label: 'compute' }]);
  assert.equal(frame.groups.find((g) => g.id === 'now-cursor'), undefined);
});

test('sin eventos ni mensajes no revienta (dominio de tiempo degenerado)', () => {
  const frame = timelineLayout(lanes, [], []);
  assert.equal(frame.nodes.length, 0);
  assert.ok(Number.isFinite(frame.height));
});
