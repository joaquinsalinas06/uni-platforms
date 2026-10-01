import { test } from 'node:test';
import assert from 'node:assert/strict';
import { netSceneLayout, toCanvas, W, H, R } from './layout.ts';

const devices = [
  { id: 'h', kind: 'laptop' as const, label: 'Host', x: 0, y: 100 },
  { id: 'l', kind: 'dns' as const, label: 'DNS local', sub: 'dns.poly.edu', x: 50, y: 100 },
  { id: 'r', kind: 'dns' as const, label: 'Raíz', x: 100, y: 0 },
];

test('la rejilla 0–100 cae dentro del lienzo, con margen para rótulos', () => {
  const a = toCanvas(0, 0), b = toCanvas(100, 100);
  assert.ok(a.x >= R && a.y >= R, 'esquina superior izquierda con margen');
  assert.ok(b.x <= W - R && b.y <= H - 50, 'abajo queda sitio para label + sub');
  const m = toCanvas(50, 50);
  assert.equal(m.x, W / 2);
  const f = netSceneLayout({ devices });
  assert.equal(f.devices[1].cx, m.x);
});

test('ida y vuelta entre el mismo par van por lados opuestos y se recortan al ícono', () => {
  const f = netSceneLayout({ devices, packets: [{ from: 'h', to: 'l', label: 'A?', order: 1 }, { from: 'l', to: 'h', label: 'A', order: 2 }] });
  const [go, back] = f.packets;
  // Horizontal hacia la derecha: la izquierda del sentido es hacia arriba (y menor).
  assert.ok(go.s.y < f.devices[0].cy && back.s.y > f.devices[0].cy);
  assert.ok(go.s.x > f.devices[0].cx + R - 1 && go.e.x < f.devices[1].cx - R + 1);
  assert.ok(go.chip!.y < go.s.y, 'el chip va afuera, del mismo lado que la flecha');
  assert.ok(go.badge && go.badge.x > go.s.x && go.badge.x < go.e.x);
});

test('lost: la flecha termina a mitad de camino', () => {
  const f = netSceneLayout({ devices, packets: [{ from: 'h', to: 'l', label: 'x', lost: true }] });
  const p = f.packets[0];
  const mid = (f.devices[0].cx + f.devices[1].cx) / 2;
  assert.ok(Math.abs(p.e.x - mid) < 1);
  assert.deepEqual(p.rest, p.e);
});

test('cable con chapita tasa · retardo; zona envuelve a sus dispositivos', () => {
  const f = netSceneLayout({ devices, cables: [{ from: 'h', to: 'l', rate: '10 Mbps', delay: '5 ms' }], zones: [{ label: 'LAN', devices: ['h', 'l'] }] });
  assert.equal(f.cables[0].chip!.text, '10 Mbps · 5 ms');
  const z = f.zones[0];
  for (const d of f.devices.slice(0, 2)) assert.ok(d.cx > z.x && d.cx < z.x + z.w && d.cy > z.y && d.cy < z.y + z.h);
  assert.ok(z.x + z.w < f.devices[2].cx, 'la raíz queda fuera');
});
