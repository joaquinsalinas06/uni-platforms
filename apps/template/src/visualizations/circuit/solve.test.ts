import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  solveCircuit, reqBetween, resolveMergedValues, checkExpect, formatSI, formatSITex, thresholds, evalKey,
  kvlTerms, meshSystem, type Circuit, type CPart,
} from './solve.ts';

// Netlists compactos: las coordenadas sólo importan cuando hay mallas.
const P = (id: string, kind: string, from: string, to: string, value?: number, extra: Partial<CPart> = {}): CPart => ({ id, kind, from, to, value, label: id, ...extra });
const R = (id: string, from: string, to: string, value: number) => P(id, 'resistor', from, to, value);
const W = (id: string, from: string, to: string) => P(id, 'wire', from, to);
const C = (parts: CPart[], extra: Partial<Circuit> = {}): Circuit => ({ nodes: [], parts, ...extra });
const near = (got: number, want: number, tol = 1e-3) =>
  assert.ok(Math.abs(got - want) <= tol * Math.abs(want) + 1e-9, `esperaba ${want}, obtuve ${got}`);

// ─── templates/circuit-examples.mdx ───
test('template 1: reducción serie→paralelo con piezas fundidas, Req(A,C) = 1500', () => {
  const steps = [
    { circuit: C([R('R1', 'A', 'm', 1000), R('R2', 'm', 'C', 2000), W('w1', 'A', 'a2'), W('w2', 'C', 'c2'), R('R3', 'a2', 'c2', 3000)]) },
    { circuit: C([P('R12', 'resistor', 'A', 'C', undefined, { mergedFrom: ['R1', 'R2'], mergeKind: 'series' }), W('w1', 'A', 'a2'), W('w2', 'C', 'c2'), R('R3', 'a2', 'c2', 3000)]) },
    { circuit: C([P('Req', 'resistor', 'A', 'C', undefined, { mergedFrom: ['R12', 'R3'], mergeKind: 'parallel' })], { req: { between: ['A', 'C'] } }), expect: { 'Req(A,C)': 1500 } },
  ];
  const r = resolveMergedValues(steps);
  assert.equal(r[1].circuit!.parts[0].value, 3000);
  assert.equal(r[2].circuit!.parts[0].value, 1500);
  near(solveCircuit(r[2].circuit!).req!, 1500);
  near(reqBetween(r[0].circuit!, 'A', 'C')!, 1500);
  assert.deepEqual(checkExpect({ steps }), []);
  assert.equal(steps[1].circuit.parts[0].value, undefined, 'no muta la entrada');
});

const meshT = (): Circuit => ({
  nodes: [
    { id: 'g', x: 0, y: 4, ground: true }, { id: 't', x: 0, y: 0 }, { id: 'a', x: 4, y: 0, label: 'a' },
    { id: 'b', x: 8, y: 0 }, { id: 'a2', x: 4, y: 4 }, { id: 'b2', x: 8, y: 4 },
  ],
  parts: [
    P('E', 'vsource', 'g', 't', 10), R('R1', 't', 'a', 1000), R('R2', 'a', 'a2', 2000), W('w1', 'a', 'b'),
    R('R3', 'b', 'b2', 2000), W('w2', 'b2', 'a2'), W('w3', 'a2', 'g'),
  ],
  loops: [
    { id: 'm1', path: ['g', 't', 'a', 'a2'], dir: 'cw', label: 'I₁' },
    { id: 'm2', path: ['a', 'b', 'b2', 'a2'], dir: 'cw', label: 'I₂' },
  ],
});

test('template 2: mallas, I(R1)=5 mA, I(R2)=I(R3)=2.5 mA, corriente en cables por KCL', () => {
  const s = solveCircuit(meshT());
  near(s.currents.R1, 0.005);
  near(s.currents.R2, 0.0025);
  near(s.currents.R3, 0.0025);
  near(s.currents.w1, 0.0025);
  near(s.currents.w3, 0.005);
  near(s.potentials.a, 5);
  near(evalKey(meshT(), s, 'P(E)')!, 0.05);
  near(evalKey(meshT(), s, 'P(R1)')!, 0.025);
  near(evalKey(meshT(), s, 'V(a,g)')!, 5);
});

test('kvlTerms: término a término, pieza compartida como R(I1 − I2), forma simplificada', () => {
  const c = meshT();
  assert.deepEqual(kvlTerms(c, 'm1', 1).terms, [{ part: 'E', tex: '-10\\,\\text{V}' }]);
  assert.equal(kvlTerms(c, 'm1', 3).terms[2].tex, '+ 2\\,\\text{k}\\Omega\\,(I_{1} - I_{2})');
  assert.equal(kvlTerms(c, 'm1', 3).closedTex, undefined);
  const full = kvlTerms(c, 'm1');
  assert.match(full.closedTex!, /= 0 \\;\\Rightarrow\\; 3\\,\\text\{k\}\\Omega\\,I_\{1\} - 2\\,\\text\{k\}\\Omega\\,I_\{2\} = 10\\,\\text\{V\}$/);
  assert.equal(kvlTerms(c, 'm2').terms[1].tex, '+ 2\\,\\text{k}\\Omega\\,(I_{2} - I_{1})');
});

test('kvlTerms: el sentido cw se respeta aunque el path esté listado antihorario', () => {
  const c = meshT();
  c.loops![0] = { id: 'm1', path: ['g', 'a2', 'a', 't'], dir: 'cw', label: 'I₁' };
  assert.deepEqual(kvlTerms(c, 'm1').terms.map((t) => t.part), ['E', 'R1', 'R2']);
  c.loops![0] = { id: 'm1', path: ['g', 't', 'a', 'a2'], dir: 'ccw', label: 'I₁' };
  const t = kvlTerms(c, 'm1').terms;
  assert.deepEqual(t.map((x) => x.part), ['R2', 'R1', 'E']);
  assert.equal(t[2].tex, '+ 10\\,\\text{V}'); // recorrida de + a −
});

test('meshSystem: resuelve y cruza con MNA', () => {
  const m = meshSystem(meshT());
  near(m.solution['I₁'], 0.005);
  near(m.solution['I₂'], 0.0025);
  assert.ok(m.crossCheck.ok);
  assert.equal(m.equations.length, 2);
});

const siGe = (d1?: 'on' | 'off', d2?: 'on' | 'off'): Circuit => ({
  nodes: [{ id: 'g', x: 0, y: 4, ground: true }, { id: 't', x: 0, y: 0 }, { id: 'a', x: 4, y: 0 }, { id: 'a2', x: 4, y: 4 }],
  parts: [P('E', 'vsource', 'g', 't', 5), P('D1', 'diode', 't', 'a', undefined, { model: 'si' }), P('D2', 'diode', 't', 'a', undefined, { model: 'ge' }), R('R1', 'a', 'a2', 1000), W('w1', 'a2', 'g')],
  diodes: d1 ? [{ part: 'D1', assume: d1 }, { part: 'D2', assume: d2! }] : [],
});

test('template 3: Si‖Ge — ambos ON es imposible; D1 OFF · D2 ON es válido con I = 4.7 mA', () => {
  const bad = solveCircuit(siGe('on', 'on'));
  assert.equal(bad.ok, false);
  assert.match(bad.reason!, /D1 y D2 ON: la tensión entre los terminales de D2 tendría que valer 0\.7 V y 0\.3 V a la vez/);
  const ok = solveCircuit(siGe('off', 'on'));
  assert.ok(ok.ok);
  near(ok.currents.R1, 0.0047);
  assert.ok(ok.diodes.D1.valid && ok.diodes.D2.valid);
  near(ok.diodes.D1.vd, 0.3);
  const wrong = solveCircuit(siGe('on', 'off'));
  assert.ok(wrong.ok);
  assert.equal(wrong.diodes.D2.valid, false, 'Ge OFF con 0.7 V encima: hipótesis falsa');
  assert.match(wrong.reason!, /D2 supuesto OFF/);
  const auto = solveCircuit(siGe());
  assert.equal(auto.diodes.D1.actual, 'off');
  assert.equal(auto.diodes.D2.actual, 'on');
});

test('serie y paralelo: Req', () => {
  near(reqBetween(C([R('a', 'A', 'm', 100), R('b', 'm', 'B', 220)]), 'A', 'B')!, 320);
  near(reqBetween(C([R('a', 'A', 'B', 1000), R('b', 'A', 'B', 1000), R('c', 'A', 'B', 500)]), 'A', 'B')!, 250);
  // con fuentes: se anulan (V en corto, I abierta)
  const c = C([P('E', 'vsource', 'B', 'x', 9), R('a', 'x', 'A', 1000), R('b', 'A', 'B', 1000), P('I', 'isource', 'A', 'B', 0.001), R('c', 'A', 'y', 5)]);
  near(reqBetween(c, 'A', 'B')!, 500);
});

const bridge = (r5: number) => C([R('R1', 'A', 'c', 1000), R('R2', 'A', 'd', 2000), R('R3', 'c', 'B', 2000), R('R4', 'd', 'B', 1000), R('R5', 'c', 'd', r5)]);

test('Wheatstone equilibrado: Req sin tocar la rama central, corriente central nula', () => {
  const c = C([R('R1', 'A', 'c', 1000), R('R2', 'A', 'd', 2000), R('R3', 'c', 'B', 2000), R('R4', 'd', 'B', 4000), P('G', 'galvanometer', 'c', 'd', 50), P('E', 'vsource', 'B', 'A', 6)]);
  near(reqBetween(c, 'A', 'B')!, 2000); // 3k ‖ 6k, la fuente entre A y B se retira
  const s = solveCircuit(c);
  assert.ok(Math.abs(s.currents.G) < 1e-10);
});

test('Wheatstone desequilibrado: coincide con Δ→Y a mano (1.4 kΩ)', () => {
  near(reqBetween(bridge(1000), 'A', 'B')!, 1400);
});

test('Δ→Y y Y→Δ en resolveMergedValues', () => {
  const base = bridge(1000);
  const steps = [
    { circuit: base },
    {
      circuit: C([
        P('Ya', 'resistor', 'A', 'n', undefined, { mergedFrom: ['R1', 'R2', 'R5'], mergeKind: 'delta-wye' }),
        P('Yc', 'resistor', 'c', 'n', undefined, { mergedFrom: ['R1', 'R2', 'R5'], mergeKind: 'delta-wye' }),
        P('Yd', 'resistor', 'd', 'n', undefined, { mergedFrom: ['R1', 'R2', 'R5'], mergeKind: 'delta-wye' }),
        R('R3', 'c', 'B', 2000), R('R4', 'd', 'B', 1000),
      ]),
    },
    {
      circuit: C([
        P('Dac', 'resistor', 'A', 'c', undefined, { mergedFrom: ['Ya', 'Yc', 'Yd'], mergeKind: 'wye-delta' }),
        P('Dad', 'resistor', 'A', 'd', undefined, { mergedFrom: ['Ya', 'Yc', 'Yd'], mergeKind: 'wye-delta' }),
        P('Dcd', 'resistor', 'c', 'd', undefined, { mergedFrom: ['Ya', 'Yc', 'Yd'], mergeKind: 'wye-delta' }),
        R('R3', 'c', 'B', 2000), R('R4', 'd', 'B', 1000),
      ]),
    },
  ];
  const r = resolveMergedValues(steps);
  const v = (i: number, id: string) => r[i].circuit!.parts.find((p) => p.id === id)!.value!;
  near(v(1, 'Ya'), 500);
  near(v(1, 'Yc'), 250);
  near(v(1, 'Yd'), 500);
  near(v(2, 'Dac'), 1000);
  near(v(2, 'Dad'), 2000);
  near(v(2, 'Dcd'), 1000);
  near(reqBetween(r[1].circuit!, 'A', 'B')!, 1400);
});

// 3 mallas a mano (mA, kΩ):  6I1 − 4I2 = 12 ; −4I1 + 7I2 − 2I3 = 0 ; −2I2 + 3I3 = −6
//   ⇒ I2 = 4/3, I1 = 26/9, I3 = −10/9
const mesh3 = (e2 = 6): Circuit => ({
  nodes: [
    { id: 'g0', x: 0, y: 4, ground: true }, { id: 'g1', x: 4, y: 4 }, { id: 'g2', x: 8, y: 4 }, { id: 'g3', x: 12, y: 4 },
    { id: 't0', x: 0, y: 0 }, { id: 't1', x: 4, y: 0 }, { id: 't2', x: 8, y: 0 }, { id: 't3', x: 12, y: 0 },
  ],
  parts: [
    P('E1', 'vsource', 'g0', 't0', 12), R('R1', 't0', 't1', 2000), R('R2', 't1', 'g1', 4000), R('R3', 't1', 't2', 1000),
    R('R4', 't2', 'g2', 2000), R('R5', 't2', 't3', 1000), P('E2', 'vsource', 'g3', 't3', e2),
    W('w1', 'g0', 'g1'), W('w2', 'g1', 'g2'), W('w3', 'g2', 'g3'),
  ],
  loops: [
    { id: 'm1', path: ['g0', 't0', 't1', 'g1'], dir: 'cw', label: 'I₁' },
    { id: 'm2', path: ['g1', 't1', 't2', 'g2'], dir: 'cw', label: 'I₂' },
    { id: 'm3', path: ['g2', 't2', 't3', 'g3'], dir: 'cw', label: 'I₃' },
  ],
});

test('3 mallas: MNA y mallas coinciden con la solución a mano', () => {
  const s = solveCircuit(mesh3());
  near(s.currents.R1, 26 / 9 / 1000);
  near(s.currents.R2, (26 / 9 - 4 / 3) / 1000);
  near(s.currents.R4, (4 / 3 + 10 / 9) / 1000);
  near(s.currents.R5, -10 / 9 / 1000);
  const m = meshSystem(mesh3());
  near(m.solution['I₁'], 26 / 9 / 1000);
  near(m.solution['I₂'], 4 / 3 / 1000);
  near(m.solution['I₃'], -10 / 9 / 1000);
  assert.ok(m.crossCheck.ok);
  assert.match(kvlTerms(mesh3(), 'm3').closedTex!, /\+ 6\\,\\text\{V\}/);
});

test('supermalla: fuente de corriente compartida entre dos mallas', () => {
  // I1 + 5 I2 = 10 (supermalla) ; I2 − I1 = 1 mA  ⇒ I1 = 5/6 mA, I2 = 11/6 mA
  const c: Circuit = {
    nodes: [{ id: 'g0', x: 0, y: 4, ground: true }, { id: 't0', x: 0, y: 0 }, { id: 't1', x: 4, y: 0 }, { id: 'g1', x: 4, y: 4 }, { id: 't2', x: 8, y: 0 }, { id: 'g2', x: 8, y: 4 }],
    parts: [P('E', 'vsource', 'g0', 't0', 10), R('R1', 't0', 't1', 1000), P('Is', 'isource', 'g1', 't1', 0.001), R('R2', 't1', 't2', 2000), R('R3', 't2', 'g2', 3000), W('w1', 'g0', 'g1'), W('w2', 'g1', 'g2')],
    loops: [
      { id: 'm1', path: ['g0', 't0', 't1', 'g1'], dir: 'cw', label: 'I₁' },
      { id: 'm2', path: ['t1', 't2', 'g2', 'g1'], dir: 'cw', label: 'I₂' },
    ],
  };
  const s = solveCircuit(c);
  near(s.currents.R1, 5 / 6 / 1000);
  near(s.currents.R3, 11 / 6 / 1000);
  near(s.potentials.t1, 10 - 5 / 6);
  const m = meshSystem(c);
  near(m.solution['I₁'], 5 / 6 / 1000);
  near(m.solution['I₂'], 11 / 6 / 1000);
  assert.ok(m.crossCheck.ok);
  assert.ok(m.equations.some((e) => e.startsWith('\\text{supermalla')));
});

test('diodo en inversa: OFF, sin corriente, V_AK = −E', () => {
  const s = solveCircuit(C([P('E', 'vsource', 'g', 't', 5), P('D', 'diode', 'a', 't'), R('R', 'a', 'g', 1000)], { nodes: [{ id: 'g', x: 0, y: 0, ground: true }] }));
  assert.equal(s.diodes.D.actual, 'off');
  near(s.diodes.D.vd, -5);
  assert.equal(s.currents.R, 0);
  const forced = solveCircuit(C([P('E', 'vsource', 'g', 't', 5), P('D', 'diode', 'a', 't'), R('R', 'a', 'g', 1000)], { diodes: [{ part: 'D', assume: 'on' }] }));
  assert.equal(forced.diodes.D.valid, false);
  assert.match(forced.reason!, /supuesto ON/);
});

test('umbral de conducción: Si a 0.7 V, Ge a 0.3 V, LED a 2 V', () => {
  const mk = (extra: Partial<CPart>, kind = 'diode') => C([P('E', 'vsource', 'g', 't', 2), P('D1', kind, 't', 'a', undefined, extra), R('R1', 'a', 'g', 1000)]);
  const [si] = thresholds(mk({ model: 'si' }), 'E', 0, 3, 0.05);
  assert.equal(si.becomes, 'on');
  near(si.at, 0.7);
  near(thresholds(mk({ model: 'ge' }), 'E', 0, 3)[0].at, 0.3);
  near(thresholds(mk({}, 'led'), 'E', 0, 3)[0].at, 2);
  near(solveCircuit(mk({ model: 'si' }), { E: 1.7 }).currents.R1, 0.001);
});

// ─── EP-2026I P6 (E = 12 V) ───
const ep26p6 = (E = 12) => C([
  P('V1', 'vsource', 'g', 'T1', E),
  P('D1', 'diode', 'T1', 'n1', undefined, { model: 'si' }), P('D2', 'diode', 'n1', 'n2', undefined, { model: 'ge' }),
  R('R8', 'n2', 'n3', 1000), P('V2', 'vsource', 'g', 'n3', 2),
  R('R2', 'T1', 'T2', 1000),
  P('D3', 'diode', 'T2', 'n4', undefined, { model: 'si' }), P('D4', 'diode', 'n4', 'n5', undefined, { model: 'si' }),
  P('D5', 'diode', 'n5', 'n6', undefined, { model: 'ge' }), R('R9', 'n6', 'B2', 2000),
  R('R3', 'B2', 'g', 2000),
  R('R5', 'T2', 'T3', 3000), R('R4', 'T3', 'n7', 5000), P('D8', 'diode', 'n7', 'n8', undefined, { model: 'ge' }),
  P('V4', 'vsource', 'B3', 'n8', 2), R('R1', 'B3', 'B2', 2000),
  R('R6', 'T3', 'n9', 2000), P('D6', 'diode', 'n9', 'n10', undefined, { model: 'si' }), P('V3', 'vsource', 'n11', 'n10', 3.7),
  P('D7', 'diode', 'B4', 'n11', undefined, { model: 'si' }), R('R7', 'B4', 'B3', 3000),
], { nodes: [{ id: 'g', x: 0, y: 0, ground: true }] });

test('EP-2026I P6: Ix, i2, Vb, P(E), E mínimo para D1, i3 en ese E', () => {
  // a mano: 28·V(T2) = 274.8 ⇒ V(T2) = 9.8143 V; i2 = 1.8714 mA; i3 = 0.3143 mA; i1 = 9 mA
  const c = ep26p6();
  const s = solveCircuit(c);
  assert.ok(s.ok);
  assert.ok(Math.abs(s.currents.D6) < 1e-9, 'Ix = 0: D6 y D7 enfrentados');
  near(s.currents.D1, 0.009);
  near(s.currents.D3, 0.0018714);
  near(s.currents.R4, 0.00031429);
  near(evalKey(c, s, 'V(T1,T2)')!, 2.18571);
  near(evalKey(c, s, 'V(n2,n3)')!, 9);
  near(evalKey(c, s, 'P(V1)')!, 12 * 0.0111857);
  const th = thresholds(c, 'V1', 0, 12, 0.1).find((t) => t.diode === 'D1')!;
  near(th.at, 3);
  const s3 = solveCircuit(ep26p6(3.0001));
  assert.equal(s3.diodes.D1.actual, 'on');
  assert.ok(Math.abs(s3.currents.R4) < 1e-9, 'i3 = 0: D8 no conduce con E = 3 V');
  near(s3.currents.D3, 0.00026, 1e-2);
});

// ─── EP-2025II P6 (E = 15 V) ───
const ep25p6 = (E = 15) => C([
  P('V1', 'vsource', 'g', 'TL', E), R('R1', 'TL', 'A', 1000), R('R4', 'A', 'B', 2000),
  P('D8', 'diode', 'A', 'n1', undefined, { model: 'si' }), R('R2', 'n1', 'Va', 1000),
  R('R6', 'Va', 'g', 2000), R('R5', 'C', 'Va', 4000),
  P('D1', 'diode', 'B', 'n2', undefined, { model: 'ge' }), P('D2', 'diode', 'n2', 'n3', undefined, { model: 'si' }),
  P('V2', 'vsource', 'C', 'n3', 3),
  P('D6', 'diode', 'B', 'RT', undefined, { model: 'si' }), P('D4', 'diode', 'RT', 'n4', undefined, { model: 'ge' }),
  R('R3', 'n4', 'n5', 3000), P('D5', 'diode', 'BR', 'n5', undefined, { model: 'ge' }),
  P('D7', 'diode', 'BR', 'C', undefined, { model: 'si' }),
], { nodes: [{ id: 'g', x: 0, y: 0, ground: true }] });

test('EP-2025II P6: Ix, I, Va, Vb, P(R2), E mínimo para D1–D2', () => {
  // a mano: 27·I = 96.8 mA ⇒ I = 3.5852 mA; i1 = 14.3 − 3I; i2 = (11 − 3I)/6
  const c = ep25p6();
  const s = solveCircuit(c);
  assert.ok(Math.abs(s.currents.D6) < 1e-9, 'Ix = 0: D4 y D5 enfrentados');
  near(s.currents.R1, 0.0035852);
  near(s.potentials.Va, 7.17037);
  near(evalKey(c, s, 'V(A,B)')!, 0.081481);
  near(evalKey(c, s, 'P(R2)')!, 0.0035444 ** 2 * 1000);
  const th = thresholds(c, 'V1', 0, 20, 0.1).find((t) => t.diode === 'D1')!;
  near(th.at, 13.9);
  assert.equal(solveCircuit(ep25p6(13.8)).diodes.D1.actual, 'off');
});

// ─── EP-2025II P5 (E = 8 V) ───
const ep25p5 = () => C([
    P('E', 'vsource', 'G', 'T', 8),
    R('a', 'T', 'L1', 3000), R('b', 'L1', 'G', 7500), R('c', 'T', 'L2', 4800), R('d', 'L2', 'G', 12000),
    R('e', 'L1', 'x1', 5000), R('f', 'x1', 'L2', 1000), R('g', 'L1', 'L2', 3300), R('h', 'L1', 'x2', 10000), R('i', 'x2', 'L2', 2100),
    R('r1k', 'T', 'U', 1000), R('j', 'U', 'W', 3000), R('k', 'U', 'y1', 2000), R('l', 'y1', 'W', 4000), R('m', 'W', 'G', 1000),
    R('n', 'U', 'P1', 300), R('o', 'P1', 'P1b', 15000), R('p', 'P1b', 'P2', 3000), R('q', 'P1', 'P3', 2000), R('r', 'P3', 'P2', 16000), R('s', 'P2', 'G', 700),
    R('d1', 'U', 'e1', 3000), R('d2', 'e1', 'V', 3000), R('d3', 'U', 'V', 3000), R('d4', 'U', 'e2', 3000), R('d5', 'e2', 'V', 3000),
    R('t', 'V', 'Y', 1500), R('u', 'Y', 'G', 9000), R('v', 'Y', 'G', 9000), R('w', 'Y', 'G', 9000),
  ]);
test('EP-2025II P5: Req vista por la fuente y potencia', () => {
  const c = ep25p5();
  // a mano: puente izq. equilibrado (3/7.5 = 4.8/12) ⇒ 10.5k ‖ 16.8k = 84/13 k;
  // U–G = 3k ‖ 10k ‖ 6k = 5/3 k; Req = (1k + 5/3k) ‖ 84/13 k = 1.88764 kΩ
  const req = 1 / (3 / 8000 + 13 / 84000);
  near(reqBetween(c, 'T', 'G')!, req);
  near(evalKey(c, solveCircuit(c), 'P(E)')!, 64 / req);
  const s = solveCircuit(c);
  assert.ok(Math.abs(s.currents.g) < 1e-9 && Math.abs(s.currents.e) < 1e-9, 'rama central del puente sin corriente');
});

// ─── EP-2026I P5 ───
test('EP-2026I P5a: R del potenciómetro por equilibrio (lecturas del multímetro)', () => {
  // brazos: 2.86 V/714 µA = 4k, 2.14 V/714 µA = 3k, 2.86 V/238 µA = 12k ⇒ R = 3k·12k/4k = 9k
  const c = C([P('E', 'vsource', 'b', 't', 5), R('Ra', 't', 'l', 4000), R('Rb', 'l', 'b', 3000), R('Rc', 't', 'r', 12000), P('R', 'pot', 'r', 'b', 9000), P('G', 'galvanometer', 'l', 'r', 100)]);
  const s = solveCircuit(c);
  near(s.currents.Ra, 714e-6, 2e-3);
  near(s.currents.Rc, 238e-6, 2e-3);
  near(s.currents.E, 952e-6, 2e-3);
  near(evalKey(c, s, 'V(r,b)')!, 2.14, 2e-3);
  assert.ok(Math.abs(s.currents.G) < 1e-10);
});

const ep26p5 = () => C([
    P('E', 'vsource', 'G', 'P', 20),
    R('a1', 'P', 'M1', 1000), R('a2', 'M1', 'G', 8000), R('a3', 'M1', 'c1', 5000), R('a4', 'c1', 'M2', 7000), R('a5', 'M1', 'M2', 6000), R('a6', 'M2', 'G', 4000),
    R('b1', 'P', 'N1', 4000), R('b2', 'N1', 'G', 6000), R('b3', 'N1', 'N2', 3000), R('b4', 'P', 'N2', 5000), R('b5', 'N2', 'G', 10000), R('b6', 'N2', 'c2', 12000), R('b7', 'c2', 'G', 18000),
    R('d1', 'P', 'e1', 9000), R('d2', 'e1', 'Q', 9000), R('d3', 'P', 'Q', 9000), R('d4', 'P', 'e2', 9000), R('d5', 'e2', 'Q', 9000),
    R('k1', 'Q', 'K1', 2500), R('k2', 'K1', 'k2', 2500), R('k3', 'k2', 'K2', 2500), R('k4', 'K1', 'k3', 2500), R('k5', 'k3', 'K2', 2500), R('k6', 'K2', 'BR', 5000),
    R('r1', 'Q', 'r1', 1000), P('R', 'pot', 'r1', 'BR', 9000), R('r2', 'BR', 'G', 40500),
  ]);
test('EP-2026I P5b: Req = 2.5 kΩ, P = 160 mW con 20 V', () => {
  const c = ep26p5();
  // a mano: bloque A = 1k + 8k‖8k = 5k; bloque B puente equilibrado (4/6 = 5/7.5) = 10k‖12.5k;
  // rama derecha 4.5k + (10k‖10k) + 40.5k = 50k ⇒ Req = 5k ‖ 5.556k ‖ 50k = 2.5k
  near(reqBetween(c, 'P', 'G')!, 2500);
  near(evalKey(c, solveCircuit(c), 'P(E)')!, 0.16);
});

test('checkExpect reporta discrepancias con clave, esperado y obtenido', () => {
  const steps = [{ circuit: meshT(), expect: { 'I(R1)': 0.005, 'I(R2)': 0.003, 'V(zz)': 1 } }];
  const m = checkExpect({ steps });
  assert.equal(m.length, 2);
  assert.equal(m[0].key, 'I(R2)');
  near(m[0].got, 0.0025);
  assert.ok(Number.isNaN(m[1].got));
});

test('formatSI / formatSITex', () => {
  assert.equal(formatSI(2200, 'Ω'), '2.2 kΩ');
  assert.equal(formatSI(0.0047, 'A'), '4.7 mA');
  assert.equal(formatSI(0.3, 'V'), '0.3 V');
  assert.equal(formatSI(470, 'Ω'), '470 Ω');
  assert.equal(formatSI(-0.00125, 'A'), '−1.25 mA');
  assert.equal(formatSI(0, 'A'), '0 A');
  assert.equal(formatSI(40500, 'Ω'), '40.5 kΩ');
  assert.equal(formatSITex(2000, 'Ω'), '2\\,\\text{k}\\Omega');
  assert.equal(formatSITex(0.00005, 'A'), '50\\,\\mu \\text{A}');
});

// ─── práctica: reducir ───
import { classifyPair, mergePair, deltaToWye, carriesNoCurrent, removePart, practiceStatus } from './solve.ts';

const tpl = (): Circuit => ({
  nodes: [{ id: 'A', x: 0, y: 0, label: 'A' }, { id: 'm', x: 4, y: 0 }, { id: 'C', x: 8, y: 0, label: 'C' }, { id: 'a2', x: 0, y: 4 }, { id: 'c2', x: 8, y: 4 }],
  parts: [R('R1', 'A', 'm', 1000), R('R2', 'm', 'C', 2000), W('w1', 'A', 'a2'), W('w2', 'C', 'c2'), R('R3', 'a2', 'c2', 3000)],
});

test('práctica: serie → paralelo hasta Req, con cables que funden nodos', () => {
  const bt: [string, string] = ['A', 'C'];
  let c = tpl();
  assert.equal(classifyPair(c, 'R1', 'R3', bt).kind, 'none');
  assert.equal(classifyPair(c, 'R1', 'R2', bt).kind, 'series');
  const m1 = mergePair(c, 'R1', 'R2', 'series', bt);
  assert.equal(m1.part.value, 3000);
  assert.equal(m1.part.label, 'R12');
  assert.deepEqual(m1.part.via, [[4, 0]]);
  c = m1.circuit;
  assert.ok(!c.nodes.some((n) => n.id === 'm'), 'el nodo intermedio desaparece');
  assert.equal(classifyPair(c, 'R1_R2', 'R3', bt).kind, 'parallel');
  const m2 = mergePair(c, 'R1_R2', 'R3', 'parallel', bt);
  near(m2.part.value!, 1500);
  const deg = (n: string) => m2.circuit.parts.filter((p) => p.from === n || p.to === n).length;
  assert.ok(m2.circuit.parts.every((p) => p.kind !== 'wire' || [p.from, p.to].every((n) => deg(n) > 1 || bt.includes(n))), 'sin cables colgantes');
  assert.equal(m2.circuit.parts.find((p) => p.id === 'R1_R2_R3')!.from, 'a2', 'paralelo: se queda con el trazo más directo (R3)');
  assert.deepEqual(practiceStatus(m2.circuit, bt), { resistors: ['R1_R2_R3'], done: true, value: m2.part.value });
});

test('práctica: terminal no es nodo de serie; triángulo sugiere Δ→Y; puente equilibrado se quita', () => {
  const b = bridge(1000);
  const bt: [string, string] = ['A', 'B'];
  const v = classifyPair(b, 'R1', 'R2', bt);
  assert.equal(v.kind, 'none');
  assert.equal(v.delta, 'R5');
  const y = deltaToWye(b, ['R1', 'R2', 'R5'], bt);
  near(reqBetween(y, 'A', 'B')!, 1400);
  assert.equal(carriesNoCurrent(b, 'R5', bt), false);
  const bal = C([R('R1', 'A', 'c', 1000), R('R2', 'A', 'd', 2000), R('R3', 'c', 'B', 2000), R('R4', 'd', 'B', 4000), R('R5', 'c', 'd', 7)]);
  assert.equal(carriesNoCurrent(bal, 'R5', bt), true);
  const nb = removePart(bal, 'R5', bt);
  assert.equal(classifyPair(nb, 'R1', 'R3', bt).kind, 'series');
});

/** Reductor goloso que sólo usa las jugadas del modo práctica. */
function reduceAll(c0: Circuit, bt: [string, string]) {
  let c = c0, moves = 0;
  while (!practiceStatus(c, bt).done && moves++ < 200) {
    const rs = practiceStatus(c, bt).resistors;
    let done = false;
    for (let i = 0; i < rs.length && !done; i++)
      for (let j = i + 1; j < rs.length && !done; j++) {
        const v = classifyPair(c, rs[i], rs[j], bt);
        if (v.kind !== 'none') (c = mergePair(c, rs[i], rs[j], v.kind, bt).circuit), (done = true);
      }
    if (done) continue;
    const idle = rs.find((id) => carriesNoCurrent(c, id, bt));
    if (idle) { c = removePart(c, idle, bt); continue; }
    for (let i = 0; i < rs.length && !done; i++)
      for (let j = i + 1; j < rs.length && !done; j++) {
        const v = classifyPair(c, rs[i], rs[j], bt);
        if (v.delta) (c = deltaToWye(c, [rs[i], rs[j], v.delta], bt)), (done = true);
      }
    if (!done) break;
  }
  return { c, status: practiceStatus(c, bt), moves };
}

test('práctica: los dos circuitos de examen se reducen hasta la Req del solver', () => {
  for (const [c, bt, want] of [[ep25p5(), ['T', 'G'], 1 / (3 / 8000 + 13 / 84000)], [ep26p5(), ['P', 'G'], 2500], [bridge(1000), ['A', 'B'], 1400]] as const) {
    const r = reduceAll(c, bt as [string, string]);
    assert.ok(r.status.done, `no terminó: quedan ${r.status.resistors.join(',')}`);
    near(r.status.value!, want);
    const labels = r.c.parts.map((p) => p.label);
    assert.equal(new Set(labels).size, labels.length, 'rótulos únicos');
  }
});

test('Δ→Y con mergedFrom de 2 piezas (las que tocan el terminal): la 3.ª sale de la topología', () => {
  const steps = [
    { circuit: C([R('R1', 'X', 'Z', 6000), R('R2', 'X', 'Y', 3000), R('R3', 'Z', 'Y', 9000)]) },
    {
      circuit: C([
        P('Ra', 'resistor', 'O', 'X', undefined, { mergedFrom: ['R1', 'R2'], mergeKind: 'delta-wye' }),
        P('Rb', 'resistor', 'O', 'Y', undefined, { mergedFrom: ['R2', 'R3'], mergeKind: 'delta-wye' }),
        P('Rc', 'resistor', 'O', 'Z', undefined, { mergedFrom: ['R1', 'R3'], mergeKind: 'delta-wye' }),
      ]),
      expect: { 'Req(X,Y)': 2500 },
    },
  ];
  const r = resolveMergedValues(steps);
  assert.deepEqual(r[1].circuit!.parts.map((p) => p.value), [1000, 1500, 3000]);
  assert.deepEqual(checkExpect({ steps }), []);
});

test('resolveMergedValues: una pieza repetida sin value hereda el del paso anterior', () => {
  const steps = [
    { circuit: C([R('R1', 'a', 'b', 1000), R('R2', 'a', 'b', 1000)]) },
    { circuit: C([P('Ra', 'resistor', 'a', 'b', undefined, { mergedFrom: ['R1', 'R2'], mergeKind: 'parallel' })]) },
    { circuit: C([P('Ra', 'resistor', 'a', 'b')]) },
  ];
  assert.equal(resolveMergedValues(steps)[2].circuit!.parts[0].value, 500);
});
