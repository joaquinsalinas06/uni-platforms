import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routingTableLayouts, routingTableIssues, STACK_MIN } from './layout.ts';

const graph = { devices: [{ id: 'u', kind: 'router' as const, label: 'u', x: 0, y: 50 }, { id: 'v', kind: 'router' as const, label: 'v', x: 100, y: 50 }], cables: [{ from: 'u', to: 'v', label: '2' }] };
const dij = (n: number) => ({
  mode: 'dijkstra',
  columns: ['v', 'w', 'x', 'y', 'z'],
  rows: Array.from({ length: n }, (_, i) => ({ label: i === 5 ? '5 · uxyvwz' : `${i} · u`, cells: ['2,u', '5,u', '1,u', '∞', '∞'].map((value) => ({ value })) })),
  graph,
});

test('mismo lienzo en todos los pasos aunque crezcan las filas', () => {
  const fs = routingTableLayouts([dij(1), dij(3), dij(6)]);
  assert.equal(new Set(fs.map((f) => `${f.width}x${f.height}`)).size, 1);
  assert.equal(fs[2].rows.length, 6);
  assert.equal(fs[0].rows[0].cells[1].x, fs[2].rows[0].cells[1].x, 'columnas fijas entre pasos');
});

test('apilado: el grafo va debajo y el lienzo cabe en ~390 px (Dijkstra de 5 columnas y DV de 9)', () => {
  const [f] = routingTableLayouts([dij(6)], false);
  assert.ok(f.graph!.y >= f.rows[5].y + 30, 'grafo debajo de la tabla');
  assert.ok(f.width <= 400, `ancho ${f.width}`);
  const dv = { mode: 'dv', columns: 'abcdefghi'.split(''), rows: ['a', 'b', 'c'].map((label) => ({ label, cells: 'abcdefghi'.split('').map(() => ({ value: '∞' })) })) };
  const [g] = routingTableLayouts([dv], false);
  assert.ok(g.width >= STACK_MIN && g.width <= 430, `ancho DV ${g.width}`);
  assert.deepEqual(routingTableIssues([dij(6), dv]), [[], []]);
});

test('ancho: grafo al lado; filas mal formadas se reportan', () => {
  const [f] = routingTableLayouts([dij(2)], true);
  assert.ok(f.graph!.x > f.head[4].x + f.head[4].w && f.graph!.y === 0);
  const bad = { ...dij(1), rows: [{ label: '0', cells: [{ value: '1' }] }] };
  assert.match(routingTableIssues([bad])[0].join(), /1 celdas para 5 columnas/);
});
