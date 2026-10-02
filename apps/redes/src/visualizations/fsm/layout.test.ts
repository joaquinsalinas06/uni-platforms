import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fsmLayout, fsmFrameIssues, wrapCode } from './layout.ts';

const rcv = {
  states: [{ id: 'r0', label: 'Esperar 0 de abajo', initial: true }, { id: 'r1', label: 'Esperar 1 de abajo' }],
  transitions: [
    { from: 'r0', to: 'r1', event: 'rdt_rcv(rcvpkt) && notcorrupt(rcvpkt) && has_seq0(rcvpkt)', action: 'extract(rcvpkt,data); deliver_data(data); udt_send(ACK)' },
    { from: 'r1', to: 'r0', event: 'rdt_rcv(rcvpkt) && has_seq1(rcvpkt)', action: 'udt_send(ACK)' },
    { from: 'r0', to: 'r0', event: 'rdt_rcv(rcvpkt) && corrupt(rcvpkt)', action: 'udt_send(NAK)' },
    { from: 'r0', to: 'r0', event: 'rdt_rcv(rcvpkt) && has_seq1(rcvpkt)', action: 'udt_send(ACK)' },
  ],
};
const inE = (s: { cx: number; cy: number; rx: number; ry: number }, p: { x: number; y: number }, g = 0) => ((p.x - s.cx) / (s.rx + g)) ** 2 + ((p.y - s.cy) / (s.ry + g)) ** 2;

test('wrapCode corta tras && y ;', () => {
  assert.deepEqual(wrapCode('rdt_rcv(rcvpkt) && corrupt(rcvpkt)', 20), ['rdt_rcv(rcvpkt) &&', 'corrupt(rcvpkt)']);
  assert.deepEqual(wrapCode('a=1; b=2', 5), ['a=1;', 'b=2']);
});

test('ida y vuelta: dos arcos por lados opuestos, puntas sobre el borde del destino', () => {
  const f = fsmLayout(rcv);
  const [go, back] = f.edges.filter((e) => !e.loop);
  const [r0, r1] = f.states;
  const midY = (p: { y: number }[]) => p[Math.floor(p.length / 2)].y;
  assert.ok(midY(go.pts) < r0.cy && midY(back.pts) > r0.cy, 'uno arriba, otro abajo');
  const d = inE(r1, go.head);
  assert.ok(d > 0.9 && d < 1.4, 'la punta toca el borde de la elipse destino');
});

test('Λ cuando no hay acción; bucles en ángulos distintos; nada choca', () => {
  const f = fsmLayout({ ...rcv, transitions: [...rcv.transitions, { from: 'r1', to: 'r1', event: 'timeout' }] });
  assert.deepEqual(f.edges.at(-1)!.card.ac, ['Λ']);
  const loops = f.edges.filter((e) => e.loop && e.from === 'r0');
  assert.equal(loops.length, 2);
  assert.notDeepEqual(loops[0].head, loops[1].head);
  assert.deepEqual(fsmFrameIssues(f), []);
  assert.deepEqual(fsmFrameIssues(fsmLayout(rcv, 1.25)), []);
});

test('4 estados en cuadrado siguiendo el ciclo desde el inicial', () => {
  const s = ['a', 'b', 'c', 'd'].map((id, i) => ({ id, label: `Estado ${id}`, initial: i === 0 }));
  const t = [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'a']].map(([from, to]) => ({ from, to, event: `${from}→${to}` }));
  const f = fsmLayout({ states: s, transitions: t });
  const [a, b, c, d] = f.states;
  assert.ok(a.cy === b.cy && c.cy === d.cy && a.cx === d.cx && b.cx === c.cx && a.cx < b.cx && a.cy < d.cy);
});
