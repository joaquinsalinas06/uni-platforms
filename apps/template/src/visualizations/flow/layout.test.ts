import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flowLayout, detectMode, type FlowShapeIn, type FlowArrowIn } from './layout.ts';
import type { CanvasNode } from '../canvas-types.ts';

type F = ReturnType<typeof flowLayout>;
const node = (f: F, id: string) => f.nodes.find((n) => n.id === id)!;
const arrowPts = (f: F, from: string, to: string) => {
  const p = f.paths!.find((q) => q.id.startsWith(`a-${from}-${to}-`))!;
  return [...p.d.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])] as [number, number]);
};
/** ¿Algún tramo ortogonal de la ruta atraviesa el interior de una forma que no es su origen/destino? */
function crosses(f: F, pts: [number, number][], skip: string[]): string | null {
  for (const n of f.nodes as CanvasNode[]) {
    if (skip.includes(n.id)) continue;
    const l = n.x - n.w! / 2 + 2, r = n.x + n.w! / 2 - 2, t = n.y - n.h! / 2 + 2, b = n.y + n.h! / 2 - 2;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const hit = Math.max(Math.min(x0, x1), l) <= Math.min(Math.max(x0, x1), r) && Math.max(Math.min(y0, y1), t) <= Math.min(Math.max(y0, y1), b);
      if (hit) return n.id;
    }
  }
  return null;
}

const thermo: [FlowShapeIn[], FlowArrowIn[]] = [
  [
    { id: 'i', kind: 'start', label: 'Inicio' },
    { id: 'cfg', kind: 'process', label: 'Configurar pines' },
    { id: 'leer', kind: 'io', label: 'Leer temperatura' },
    { id: 'd', kind: 'decision', label: '¿Temp > 27 °C?' },
    { id: 'on', kind: 'process', label: 'Ventilador ON' },
    { id: 'off', kind: 'process', label: 'Ventilador OFF' },
  ],
  [
    { from: 'i', to: 'cfg' }, { from: 'cfg', to: 'leer' }, { from: 'leer', to: 'd' },
    { from: 'd', to: 'on', label: 'V' }, { from: 'd', to: 'off', label: 'F' },
    { from: 'on', to: 'leer' }, { from: 'off', to: 'leer' },
  ],
];

test('modo: flowchart / fsm / blocks según los kinds', () => {
  assert.equal(detectMode(thermo[0]), 'flowchart');
  assert.equal(detectMode([{ id: 'a', kind: 'state', label: 'A' }]), 'fsm');
  assert.equal(detectMode([{ id: 'a', kind: 'block', label: 'A' }]), 'blocks');
  assert.equal(detectMode([{ id: 'a', kind: 'block', label: 'A' }], 'fsm'), 'fsm');
});

test('termostato: F baja por el espinazo, V sale a la derecha en la misma fila', () => {
  const f = flowLayout(...thermo);
  const d = node(f, 'd'), on = node(f, 'on'), off = node(f, 'off');
  assert.equal(d.shape, 'diamond');
  assert.equal(node(f, 'leer').shape, 'parallelogram');
  assert.equal(node(f, 'i').shape, 'ellipse');
  assert.ok(Math.abs(on.y - d.y) < 1 && on.x > d.x, 'V a la derecha, misma fila');
  assert.ok(Math.abs(off.x - d.x) < 1 && off.y > d.y, 'F debajo');
  const labels = f.annotations.filter((a) => a.id.startsWith('al-')).map((a) => a.text).sort();
  assert.deepEqual(labels, ['F', 'V']);
});

test('ninguna flecha atraviesa una forma (termostato, bucles incluidos)', () => {
  const f = flowLayout(...thermo);
  for (const [a, b] of [['on', 'leer'], ['off', 'leer'], ['d', 'on'], ['d', 'off'], ['cfg', 'leer']]) {
    assert.equal(crosses(f, arrowPts(f, a, b), [a, b]), null, `${a}→${b}`);
  }
});

test('bucle de retorno: sube por un carril fuera de las formas y entra por arriba', () => {
  const f = flowLayout(...thermo);
  const pts = arrowPts(f, 'off', 'leer');
  const leer = node(f, 'leer');
  const minX = Math.min(...f.nodes.map((n) => n.x - n.w! / 2));
  assert.ok(Math.min(...pts.map((p) => p[0])) < minX, 'el carril queda a la izquierda de todo');
  const last = pts[pts.length - 1];
  assert.ok(Math.abs(last[0] - leer.x) < 1 && Math.abs(last[1] - (leer.y - leer.h! / 2)) < 1);
});

test('FSM: estados en círculo, inicial con flecha, auto-lazo', () => {
  const f = flowLayout(
    [{ id: 'off', kind: 'state', label: 'DESCONECTADO', initial: true }, { id: 'ing', kind: 'state', label: 'CONECTANDO' }, { id: 'on', kind: 'state', label: 'CONECTADO' }],
    [{ from: 'off', to: 'ing', label: 'CONNECT' }, { from: 'ing', to: 'on', label: 'CONNACK' }, { from: 'ing', to: 'off', label: 'timeout' }, { from: 'on', to: 'on', label: 'PING' }, { from: 'on', to: 'off', label: 'caída' }],
  );
  assert.ok(f.nodes.every((n) => n.shape === 'circle' && n.w === n.h));
  assert.ok(node(f, 'off').x < node(f, 'ing').x && node(f, 'ing').x < node(f, 'on').x);
  assert.ok(f.paths!.some((p) => p.id === 'init-off'));
  assert.match(f.paths!.find((p) => p.id.startsWith('a-on-on-'))!.d, /C/);
  // on→off salta a ing: arco (Q), no línea recta a través de CONECTANDO.
  assert.match(f.paths!.find((p) => p.id.startsWith('a-on-off-'))!.d, /Q/);
});

test('bloques: controlador al centro, entradas a la izquierda, salidas a la derecha, fuente debajo; potencia gruesa', () => {
  const f = flowLayout(
    [
      { id: 'hum', kind: 'block', label: 'Sensor' }, { id: 'btn', kind: 'block', label: 'Botón' },
      { id: 'mcu', kind: 'block', label: 'Arduino' }, { id: 'lcd', kind: 'block', label: 'LCD' },
      { id: 'rel', kind: 'block', label: 'Relé' }, { id: 'mot', kind: 'block', label: 'Motor' }, { id: 'src', kind: 'block', label: 'Fuente 9V' },
    ],
    [
      { from: 'hum', to: 'mcu', kind: 'data' }, { from: 'btn', to: 'mcu', kind: 'data' }, { from: 'mcu', to: 'lcd', kind: 'data' },
      { from: 'mcu', to: 'rel', kind: 'data' }, { from: 'rel', to: 'mot', kind: 'power' }, { from: 'src', to: 'mcu', kind: 'power' }, { from: 'src', to: 'rel', kind: 'power' },
    ],
  );
  const mcu = node(f, 'mcu');
  assert.ok(node(f, 'hum').x < mcu.x && node(f, 'btn').x < mcu.x);
  assert.ok(node(f, 'lcd').x > mcu.x && node(f, 'rel').x > mcu.x && node(f, 'mot').x > node(f, 'rel').x);
  assert.ok(node(f, 'src').y > mcu.y + mcu.h! / 2);
  // Entradas: flechas horizontales rectas (2 puntos a la misma altura) al controlador.
  for (const id of ['hum', 'btn']) {
    const pts = arrowPts(f, id, 'mcu');
    assert.equal(pts.length, 2);
    assert.ok(Math.abs(pts[0][1] - pts[1][1]) < 0.5);
  }
  assert.equal(f.paths!.find((p) => p.id.startsWith('a-src-mcu-'))!.width, 3);
  assert.equal(f.paths!.find((p) => p.id.startsWith('a-hum-mcu-'))!.width, 1.5);
});

test('x/y fuerzan columna y fila', () => {
  const f = flowLayout([{ id: 'a', kind: 'block', label: 'A', x: 0, y: 0 }, { id: 'b', kind: 'block', label: 'B', x: 0, y: 1 }], [{ from: 'a', to: 'b' }]);
  assert.ok(Math.abs(node(f, 'a').x - node(f, 'b').x) < 1 && node(f, 'b').y > node(f, 'a').y);
});

test('aforo + gas (guía, figura 4): ramas V a la derecha, sin flechas a través de formas', () => {
  const P = 'process', D = 'decision', I = 'io';
  const shapes = ([['i', 'start'], ['cfg', P], ['gas', I], ['dg', D], ['pel', P], ['da', D], ['comp', P], ['pir', I], ['dm', D], ['inc', P], ['btn', I], ['db', D], ['dec', P], ['lcd', P]] as const)
    .map(([id, kind]) => ({ id, kind, label: id.toUpperCase() + ' ' + 'x'.repeat(8) }));
  const e = (from: string, to: string, label?: string) => ({ from, to, label });
  const arrows = [
    e('i', 'cfg'), e('cfg', 'gas'), e('gas', 'dg'), e('dg', 'pel', 'V'), e('dg', 'da', 'F'), e('pel', 'gas'),
    e('da', 'comp', 'V'), e('da', 'pir', 'F'), e('comp', 'btn'), e('pir', 'dm'), e('dm', 'inc', 'V'), e('dm', 'btn', 'F'), e('inc', 'btn'),
    e('btn', 'db'), e('db', 'dec', 'V'), e('db', 'lcd', 'F'), e('dec', 'lcd'), e('lcd', 'gas'),
  ];
  const f = flowLayout(shapes, arrows);
  for (const [d, side] of [['dg', 'pel'], ['da', 'comp'], ['dm', 'inc'], ['db', 'dec']]) {
    assert.ok(Math.abs(node(f, side).y - node(f, d).y) < 1 && node(f, side).x > node(f, d).x, `${side} junto a ${d}`);
  }
  for (const a of arrows) assert.equal(crosses(f, arrowPts(f, a.from, a.to), [a.from, a.to]), null, `${a.from}→${a.to}`);
});

test('etiquetas largas sin \\n se parten por palabras; con \\n se respetan', async () => {
  const { wrapLabel } = await import('./layout.ts');
  assert.deepEqual(wrapLabel('Microcontrolador (Arduino MEGA2560)', 20), ['Microcontrolador', '(Arduino MEGA2560)']);
  assert.deepEqual(wrapLabel('Configurar I/O, LCD · Aforo = 0', 24), ['Configurar I/O, LCD', 'Aforo = 0']);
  assert.deepEqual(wrapLabel('a b\nc', 1), ['a b', 'c']);
});
