import { test } from 'node:test';
import assert from 'node:assert/strict';
import { packetLayouts, fit } from './layout.ts';

const udp = { width: 32, rows: [
  [{ label: 'puerto origen', bits: 16 }, { label: 'puerto destino', bits: 16, value: 53 }],
  [{ label: 'longitud', bits: 16 }, { label: 'checksum', bits: 16 }],
  [{ label: 'datos (mensaje de aplicación)', bits: 32 }],
] };

test('ancho de campo proporcional a sus bits; filas apiladas', () => {
  const [f] = packetLayouts([{ fields: udp }]);
  const [a, b, , , d] = f.boxes;
  assert.equal(a.w, b.w);
  assert.equal(b.x, a.x + a.w, 'contiguos');
  assert.equal(d.w, a.w * 2, '32 bits = el doble de 16');
  assert.ok(d.y > a.y);
  assert.equal(b.value, '53');
  assert.deepEqual(f.texts.map((t) => t.text), ['0', '16', '31']);
});

test('un campo que se pasa del ancho de fila se recorta a lo que queda', () => {
  const [f] = packetLayouts([{ fields: { width: 32, rows: [[{ label: 'a', bits: 24 }, { label: 'b', bits: 16 }]] } }]);
  assert.equal(f.boxes[1].w, f.boxes[0].w / 3);
});

test('rótulo largo en campo angosto: achica y parte en dos líneas', () => {
  const r = fit('longitud de cabecera', 60);
  assert.equal(r.lines.length, 2);
  assert.ok(r.fs >= 9.5);
  assert.deepEqual(fit('ok', 200).lines, ['ok']);
});

test('encapsulamiento: cada capa agrega su cabecera a la izquierda, en columna fija', () => {
  const layers = [{ label: 'aplicación' }, { label: 'transporte', header: 'Ht' }, { label: 'red', header: 'Hn' }, { label: 'enlace', header: 'Hl', trailer: 'Tl' }];
  const [f] = packetLayouts([{ layers }]);
  const box = (k: string) => f.boxes.find((b) => b.key === k)!;
  assert.equal(box('m0').x, box('m3').x, 'M alineado en todas las filas');
  assert.equal(box('h1-1').x, box('h1-3').x, 'Ht no se mueve al agregar Hn y Hl');
  assert.ok(box('h3-3').x < box('h2-3').x && box('h2-3').x < box('h1-3').x, 'la más nueva, la más externa');
  assert.ok(box('tr3-3').x >= box('m3').x + box('m3').w);
  assert.equal(f.boxes.filter((b) => b.key.endsWith('-0')).length, 0, 'aplicación: sólo M');
});
