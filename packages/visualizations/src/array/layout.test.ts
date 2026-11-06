import test from 'node:test';
import assert from 'node:assert/strict';
import { arrayLayout, sharedCellWidth } from './layout.ts';

const rows = [{ id: 'm', label: 'Memoria', cells: [1, 2, 3, 4, 5, 6].map((v) => ({ value: v })) }];

test('celdas en fila, ids <fila>-<i>, mismo y y paso constante', () => {
  const f = arrayLayout({ rows });
  assert.equal(f.nodes.length, 6);
  assert.equal(f.nodes[0].id, 'm-0');
  assert.ok(new Set(f.nodes.map((n) => n.y)).size === 1);
  assert.ok(f.nodes[1].x > f.nodes[0].x);
});

test('un span rodea exactamente su tramo y cabe en el lienzo', () => {
  const f = arrayLayout({ rows, spans: [{ id: 'b0', row: 'm', from: 0, to: 2, label: 'B' }] });
  const g = f.groups[0];
  assert.ok(g.x < f.nodes[0].x - (f.nodes[0].w ?? 0) / 2 + 1);
  assert.ok(g.x + g.w > f.nodes[2].x);
  assert.ok(g.x + g.w < f.nodes[3].x);
  assert.ok(g.x + g.w <= f.width);
});

test('links a celdas inexistentes se descartan; el ancho de celda crece con el texto', () => {
  const f = arrayLayout({ rows, links: [{ from: 'm-0', to: 'm-5' }, { from: 'm-0', to: 'zz' }] });
  assert.equal(f.edges.length, 1);
  assert.ok(sharedCellWidth([{ rows: [{ id: 'r', cells: [{ value: 'abracadabra$' }] }] }]) > sharedCellWidth([{ rows }]));
});

test('una caption larga se parte en líneas que caben en el lienzo', () => {
  const caption = 'Con B = 4 hay cuatro bloques. La pieza C1 (casillas 4 a 6) cruza la frontera entre el bloque 1 y el 2.';
  const f = arrayLayout({ rows, caption }, { width: 520 });
  const caps = f.annotations.filter((a) => a.id.startsWith('caption'));
  assert.ok(caps.length >= 2);
  assert.equal(caps.map((c) => c.text).join(' '), caption);
  assert.ok(caps.every((c) => c.x + c.text.length * 7.2 <= f.width));
  assert.ok(caps[caps.length - 1].y < f.height);
});

test('con índices sobre las celdas el panel deja sitio a su etiqueta', () => {
  const tagged = [{ id: 'm', cells: [{ value: 'a', tag: '0' }, { value: 'b', tag: '1' }] }];
  const plain = [{ id: 'm', cells: [{ value: 'a' }, { value: 'b' }] }];
  const sp = [{ id: 's', row: 'm', from: 0, to: 1, label: 'LO=0' }];
  const t = arrayLayout({ rows: tagged, spans: sp });
  const p = arrayLayout({ rows: plain, spans: sp });
  assert.ok(t.groups[0].y >= 0 && p.groups[0].y >= 0); // nada sale por arriba del lienzo
  // distancia panel→celda: con índices es mayor (la etiqueta va por encima de ellos)
  assert.ok(t.nodes[0].y - t.groups[0].y > p.nodes[0].y - p.groups[0].y);
});

test('varias filas no se solapan verticalmente', () => {
  const f = arrayLayout({ rows: [rows[0], { id: 'k', cells: [{ value: 7 }] }] });
  const ys = [...new Set(f.nodes.map((n) => n.y))];
  assert.ok(ys[1] - ys[0] >= 60);
});
