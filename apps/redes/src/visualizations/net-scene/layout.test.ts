import { test } from 'node:test';
import assert from 'node:assert/strict';
import { netSceneLayout, netSceneIssues, toCanvas, wrap2, W, H, R } from './layout.ts';
import { overlapArea, polyHitsRect, quadSamples } from '../geom.ts';

const devices = [
  { id: 'h', kind: 'laptop' as const, label: 'Host', x: 0, y: 100 },
  { id: 'l', kind: 'dns' as const, label: 'DNS local', sub: 'dns.poly.edu', x: 50, y: 100 },
  { id: 'r', kind: 'dns' as const, label: 'Raíz', x: 100, y: 0 },
];

test('la rejilla 0–100 cae dentro del lienzo, con margen para rótulos', () => {
  const a = toCanvas(0, 0), b = toCanvas(100, 100);
  assert.ok(a.x >= R && a.y >= R / 2);
  assert.ok(b.x <= W - R && b.y <= H - 50, 'abajo queda sitio para label + sub');
  assert.equal(toCanvas(50, 50).x, W / 2);
  const f = netSceneLayout({ devices });
  assert.equal(f.devices[1].cx, W / 2);
  assert.deepEqual(netSceneIssues(f), []);
});

test('ida y vuelta entre el mismo par van por lados opuestos y salen del borde del ícono', () => {
  const f = netSceneLayout({ devices, packets: [{ from: 'h', to: 'l', label: 'A?', order: 1 }, { from: 'l', to: 'h', label: 'A', order: 2 }] });
  const [go, back] = f.packets;
  assert.ok(go.s.y < f.devices[0].cy && back.s.y > f.devices[0].cy);
  assert.ok(go.s.x >= f.devices[0].icon.x + f.devices[0].icon.w && go.e.x <= f.devices[1].icon.x);
  assert.deepEqual(netSceneIssues(f), []);
});

test('lost: la flecha termina a mitad de camino', () => {
  const f = netSceneLayout({ devices, packets: [{ from: 'h', to: 'l', label: 'x', lost: true }] });
  const p = f.packets[0];
  const mid = (f.devices[0].cx + f.devices[1].cx) / 2;
  assert.ok(Math.abs(p.e.x - mid) < 2);
  assert.deepEqual(p.rest, p.e);
});

test('un paquete que pasaría por un ícono ajeno se curva y lo esquiva', () => {
  const row = [
    { id: 'a', kind: 'host' as const, label: 'A', x: 0, y: 50 },
    { id: 'm', kind: 'router' as const, label: 'M', x: 50, y: 50 },
    { id: 'b', kind: 'host' as const, label: 'B', x: 100, y: 50 },
  ];
  const f = netSceneLayout({ devices: row, packets: [{ from: 'a', to: 'b', label: 'datos' }] });
  const p = f.packets[0];
  assert.ok(Math.abs(p.c.y - (p.s.y + p.e.y) / 2) > 20, 'control fuera de la recta');
  assert.equal(polyHitsRect(quadSamples(p.s, p.c, p.e), f.devices[1].icon), false);
  assert.deepEqual(netSceneIssues(f), []);
});

test('rótulos que chocan se parten o se mueven; chips no pisan íconos', () => {
  assert.deepEqual(wrap2('borde (centro de datos)'), ['borde', '(centro de datos)']);
  const tight = [
    { id: 'p1', kind: 'laptop' as const, label: 'Par 1', sub: 'u_1 · d_1', x: 88, y: 14 },
    { id: 'p2', kind: 'laptop' as const, label: 'Par 2', sub: 'u_2 · d_2', x: 88, y: 38 },
    { id: 'p3', kind: 'laptop' as const, label: 'Par 3', sub: 'u_3 · d_3', x: 88, y: 60 },
  ];
  const f = netSceneLayout({ devices: tight });
  for (const a of f.devices) for (const b of f.devices) if (a !== b) assert.equal(overlapArea(a.icon, b.block), 0);
  const g = netSceneLayout({ devices: devices.slice(0, 2), packets: [{ from: 'h', to: 'l', label: 'A? gaia.cs.umass.edu', order: 1 }] });
  assert.deepEqual(netSceneIssues(g), []);
});

test('zonas: no se pisan entre sí ni envuelven a un dispositivo ajeno', () => {
  const ds = [
    { id: 'h', kind: 'laptop' as const, label: 'Host', x: 8, y: 30 },
    { id: 'ra', kind: 'router' as const, label: 'Router de acceso', x: 34, y: 52 },
    { id: 'c1', kind: 'router' as const, label: 'ISP regional', x: 56, y: 25 },
    { id: 'c3', kind: 'router' as const, label: 'ISP global', x: 74, y: 52 },
    { id: 's', kind: 'server' as const, label: 'Servidor', sub: 'borde (centro de datos)', x: 100, y: 52 },
  ];
  const f = netSceneLayout({ devices: ds, zones: [{ label: 'Red de acceso', devices: ['h', 'ra'] }, { label: 'Núcleo', devices: ['c1', 'c3'] }] });
  assert.equal(overlapArea(f.zones[0], f.zones[1]), 0);
  assert.equal(overlapArea(f.zones[1], f.devices[4].icon), 0);
  assert.deepEqual(netSceneIssues(f), []);
});
