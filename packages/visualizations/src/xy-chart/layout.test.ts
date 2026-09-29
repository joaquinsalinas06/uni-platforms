import { test } from 'node:test';
import assert from 'node:assert/strict';
import { xyChartLayout, compileFn, seriesPoints, fmt } from './layout.ts';

const ann = (f: ReturnType<typeof xyChartLayout>, id: string) => f.annotations.find((a) => a.id === id);
const path = (f: ReturnType<typeof xyChartLayout>, id: string) => f.paths!.find((p) => p.id === id);

test('fn: Math sin prefijo + helpers square/pwm/step', () => {
  const f = compileFn('sin(2*x)+4*sin(5*x)');
  const x = 0.3;
  assert.ok(Math.abs(f(x) - (Math.sin(0.6) + 4 * Math.sin(1.5))) < 1e-12);
  assert.equal(compileFn('square(x)')(1), 1);
  assert.equal(compileFn('square(x)')(4), -1);
  assert.equal(compileFn('pwm(x, 0.25, 2, 0, 5)')(0.4), 5);
  assert.equal(compileFn('pwm(x, 25, 2, 0, 5)')(0.6), 0);
  assert.equal(compileFn('A*step(t-1)', { A: 3 })(2), 3);
  assert.equal(compileFn('1e-3*x')(1000), 1);
});

test('fn: rechaza identificadores desconocidos y asignaciones', () => {
  assert.throws(() => compileFn('alert(1)'), /desconocido/);
  assert.throws(() => compileFn('x.constructor'), /desconocido/);
  assert.throws(() => compileFn('x = 2'), /inválida/);
  assert.throws(() => compileFn('"a"'), /inválida/);
  assert.doesNotThrow(() => compileFn('x >= 2 ? 1 : 0'));
});

test('espectro sin(2t)+4sin(5t): dos stems limpios con sus valores, el de ω=5 más alto', () => {
  const f = xyChartLayout({ series: [{ id: 'F', label: '|F(ω)|', kind: 'stem', points: [[2, 1], [5, 4]] }], x: { label: 'ω', min: 0, max: 7 } });
  const l1 = ann(f, 'v-F-0')!, l4 = ann(f, 'v-F-1')!;
  assert.equal(l1.text, '1');
  assert.equal(l4.text, '4');
  assert.ok(l4.x > l1.x);
  assert.ok(l4.y < l1.y, 'el stem de 4 queda más arriba');
  assert.equal((path(f, 's-F-stems')!.d.match(/M/g) ?? []).length, 2);
});

test('step: escalera con tramos H/V (PWM, cuantización)', () => {
  const f = xyChartLayout({ series: [{ id: 'p', label: 'PWM', kind: 'step', fn: 'pwm(x,0.3,1,0,5)', domain: [0, 3] }], hlines: [{ at: 1.5, label: 'V_prom' }] });
  assert.match(path(f, 's-p')!.d, /H[\d.]+V/);
  assert.equal(ann(f, 'hline-label-0')!.text, 'V_prom');
});

test('samples: un punto por cada nTs + la curva analógica tenue', () => {
  const s = { id: 's', label: 'x[n]', kind: 'samples' as const, fn: 'sin(x)', domain: [0, 6] as [number, number], samples: 0.5 };
  assert.equal(seriesPoints(s, undefined).length, 13);
  const f = xyChartLayout({ series: [s] });
  assert.equal((path(f, 's-s-dots')!.d.match(/M/g) ?? []).length, 13);
  assert.ok(path(f, 's-s-analog')!.opacity! < 1);
});

test('bars en x log: alcances por tecnología, rótulo por categoría y LoRaWAN a la derecha de NFC', () => {
  const f = xyChartLayout({
    series: [{ id: 'r', label: 'alcance', kind: 'bars', bars: [{ label: 'NFC', from: 0.01, to: 0.1 }, { label: 'LoRaWAN', from: 2000, to: 15000 }] }],
    x: { label: 'alcance (m)', log: true },
  });
  assert.equal(ann(f, 'cat-0')!.text, 'NFC');
  assert.equal(ann(f, 'cat-1')!.text, 'LoRaWAN');
  assert.ok(ann(f, 'range-1')!.x > ann(f, 'range-0')!.x);
  const ticks = f.annotations.filter((a) => a.id.startsWith('tick-x-')).map((a) => a.text);
  assert.ok(ticks.includes('1') && ticks.includes('10k'), `ticks por década: ${ticks}`);
});

test('highlight: la serie nombrada active y las demás muted', () => {
  const f = xyChartLayout({
    series: [{ id: 'a', label: 'A', points: [[0, 0], [1, 1]] }, { id: 'b', label: 'B', points: [[0, 1], [1, 0]] }],
    highlight: ['a'],
  });
  assert.equal(path(f, 's-a')!.state, 'active');
  assert.equal(path(f, 's-b')!.state, 'muted');
  assert.ok(ann(f, 'legend-label-a') && ann(f, 'legend-label-b'), 'leyenda con ≥2 series');
});

test('valores negativos: línea de cero y y-min por debajo de 0', () => {
  const f = xyChartLayout({ series: [{ id: 's', label: 'f', fn: '4*sin(x)', domain: [0, 6.3] }] });
  assert.ok(path(f, 'zero'));
  assert.ok(f.annotations.some((a) => a.id.startsWith('tick-y-') && a.text.startsWith('−')));
});

test('vlines cercanas: los rótulos se apilan, no se pisan', () => {
  const f = xyChartLayout({ series: [{ id: 's', label: 'f', fn: '1-exp(-x)', domain: [0, 5] }], vlines: [{ at: 1, label: 'τ = RC' }, { at: 1.05, label: '63.2 %' }] });
  assert.notEqual(ann(f, 'vline-label-0')!.y, ann(f, 'vline-label-1')!.y);
});

test('un solo punto no revienta', () => {
  const f = xyChartLayout({ series: [{ id: 's', label: 'f', points: [[5, 5]] }] });
  assert.ok(f.paths!.every((p) => !p.d.includes('NaN')));
});

test('fmt: compacto con k y signo menos tipográfico', () => {
  assert.equal(fmt(15000), '15k');
  assert.equal(fmt(0.1), '0.1');
  assert.equal(fmt(-2.5), '−2.5');
});
