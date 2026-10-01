import { test } from 'node:test';
import assert from 'node:assert/strict';
import { windowLayouts, CELL, PITCH } from './layout.ts';

const cells = (states: string[]) => states.map((state, n) => ({ n, state: state as never }));

test('el marco cubre exactamente las celdas [base, base+size)', () => {
  const [f] = windowLayouts([{ windows: [{ role: 'sender', label: 'Emisor', base: 2, size: 4, cells: cells(['acked', 'acked', 'sent', 'sent', 'usable', 'usable', 'unusable']) }] }]);
  const { frame, cells: cs } = f.rows[0];
  assert.ok(frame.x < cs[2].x && frame.x > cs[1].x + CELL, 'empieza justo antes de la celda base');
  assert.ok(frame.x + frame.w > cs[5].x + CELL && frame.x + frame.w < cs[6].x, 'termina justo después de base+size−1');
  assert.equal(f.rows[0].marker!.text, 'base=2');
});

test('entre pasos el marco se desliza: mismo origen, x crece con base', () => {
  const w = (base: number) => ({ windows: [{ role: 'sender' as const, label: 'E', base, size: 3, cells: cells(['sent', 'sent', 'sent', 'usable', 'usable', 'usable']) }] });
  const [a, b] = windowLayouts([w(0), w(2)]);
  assert.equal(b.rows[0].frame.x - a.rows[0].frame.x, 2 * PITCH);
  assert.equal(a.rows[0].cells[0].x, b.rows[0].cells[0].x);
});

test('seqSpace: números módulo; leyenda sólo con estados usados', () => {
  const [f] = windowLayouts([{ windows: [{ role: 'receiver', label: 'Receptor', base: 0, size: 2, seqSpace: 4, cells: cells(['received', 'received', 'received', 'received', 'expected', 'buffered']) }] }]);
  assert.deepEqual(f.rows[0].cells.map((c) => c.text), ['0', '1', '2', '3', '0', '1']);
  assert.deepEqual(f.legend.map((l) => l.state), ['buffered', 'expected', 'received']);
  assert.equal(f.rows[0].marker!.text, 'esperado=0');
});
