import { test } from 'node:test';
import assert from 'node:assert/strict';
import { networkTopologyLayout, findHub, isChain } from './layout.ts';

const procs = [
  { id: 'p0', label: 'P0' },
  { id: 'p1', label: 'P1' },
  { id: 'p2', label: 'P2' },
  { id: 'p3', label: 'P3' },
];

test('sin dataFlow: anillo, todos a igual distancia del centro', () => {
  const frame = networkTopologyLayout(procs, []);
  const cx = frame.width / 2;
  const cy = frame.height / 2 + 10;
  const dists = frame.nodes.map((n) => Math.hypot(n.x - cx, n.y - cy));
  dists.forEach((d) => assert.ok(Math.abs(d - dists[0]) < 0.001));
});

test('broadcast (uno a todos): el emisor queda al centro (dist 0), el resto en el borde', () => {
  const dataFlow = procs.slice(1).map((p) => ({ from: 'p0', to: p.id }));
  assert.equal(findHub(dataFlow), 'p0');
  const frame = networkTopologyLayout(procs, dataFlow);
  const p0 = frame.nodes.find((n) => n.id === 'p0')!;
  const cx = frame.width / 2;
  const cy = frame.height / 2 + 10;
  assert.ok(Math.hypot(p0.x - cx, p0.y - cy) < 0.001);
  const p1 = frame.nodes.find((n) => n.id === 'p1')!;
  assert.ok(Math.hypot(p1.x - cx, p1.y - cy) > 50);
});

test('gather (todos a uno): el receptor queda al centro', () => {
  const dataFlow = procs.slice(1).map((p) => ({ from: p.id, to: 'p0' }));
  assert.equal(findHub(dataFlow), 'p0');
});

test('cadena (pipeline lineal): cada proceso a lo sumo 1 entrante y 1 saliente → disposición en fila (misma y)', () => {
  const dataFlow = [
    { from: 'p0', to: 'p1' },
    { from: 'p1', to: 'p2' },
    { from: 'p2', to: 'p3' },
  ];
  assert.equal(isChain(dataFlow), true);
  const frame = networkTopologyLayout(procs, dataFlow);
  const ys = frame.nodes.map((n) => n.y);
  ys.forEach((y) => assert.equal(y, ys[0]));
  // y ordenados por x en el mismo orden que la cadena
  const byX = [...frame.nodes].sort((a, b) => a.x - b.x).map((n) => n.id);
  assert.deepEqual(byX, ['p0', 'p1', 'p2', 'p3']);
});

test('allreduce/allgather (many-to-many): no es hub ni cadena → cae a anillo', () => {
  const dataFlow = [
    { from: 'p0', to: 'p1' },
    { from: 'p1', to: 'p0' },
    { from: 'p2', to: 'p3' },
    { from: 'p3', to: 'p2' },
  ];
  assert.equal(findHub(dataFlow), null);
  assert.equal(isChain(dataFlow), false);
});

test('dataFlow se dibuja como aristas con flecha', () => {
  const frame = networkTopologyLayout(procs, [{ from: 'p0', to: 'p1', label: 'msg' }]);
  assert.equal(frame.edges.length, 1);
  assert.equal(frame.edges[0].arrow, true);
  assert.equal(frame.edges[0].label, 'msg');
});
