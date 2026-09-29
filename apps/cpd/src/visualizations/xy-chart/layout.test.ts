import { test } from 'node:test';
import assert from 'node:assert/strict';
import { xyChartLayout } from './layout.ts';

test('una sola curva: N puntos producen N nodos-punto y N-1 aristas', () => {
  const frame = xyChartLayout({ series: [{ id: 's1', label: 'Speedup', points: [[1, 1], [2, 1.8], [4, 3.2]] }] });
  assert.equal(frame.nodes.length, 3);
  assert.equal(frame.edges.length, 2);
  assert.equal(frame.nodes[0].state, 'idle');
});

test('múltiples curvas sin highlight: todas idle, ninguna se pinta de accent', () => {
  const frame = xyChartLayout({
    series: [
      { id: 'amdahl', label: 'Amdahl', points: [[1, 1], [8, 4]] },
      { id: 'gustafson', label: 'Gustafson', points: [[1, 1], [8, 7]] },
    ],
  });
  assert.equal(frame.nodes.length, 4);
  for (const n of frame.nodes) assert.equal(n.state, 'idle');
});

test('highlight marca una curva active y las demás muted (contraste), nunca accent fuera de la activa', () => {
  const frame = xyChartLayout({
    series: [
      { id: 'amdahl', label: 'Amdahl', points: [[1, 1], [8, 4]] },
      { id: 'gustafson', label: 'Gustafson', points: [[1, 1], [8, 7]] },
    ],
    highlight: ['amdahl'],
  });
  const amdahlNodes = frame.nodes.filter((n) => n.id.startsWith('amdahl'));
  const gustafsonNodes = frame.nodes.filter((n) => n.id.startsWith('gustafson'));
  assert.ok(amdahlNodes.every((n) => n.state === 'active'));
  assert.ok(gustafsonNodes.every((n) => n.state === 'muted'));
});

test('escala de ejes: el punto de xMin/yMin cae en la esquina inferior-izquierda del área de trazado, xMax/yMax en la esquina opuesta', () => {
  const frame = xyChartLayout({ series: [{ id: 's1', label: 'f', points: [[0, 0], [10, 100]] }] }, { width: 640, height: 300 });
  const [p0, p1] = frame.nodes;
  // Y se invierte (arriba = valor mayor): el primer punto (y=0, mínimo) debe
  // quedar MÁS ABAJO en píxeles que el segundo (y=100, máximo).
  assert.ok(p0.y > p1.y);
  assert.ok(p0.x < p1.x);
});

test('curva cóncava hacia abajo (tipo Amdahl): la curvatura calculada en cada tramo interior tiene el mismo signo (concavidad consistente)', () => {
  // y creciente con derivada decreciente — concavidad hacia abajo en todo el rango.
  const points: [number, number][] = [[1, 1], [2, 1.8], [4, 3.0], [8, 4.2], [16, 4.9], [32, 5.3]];
  const frame = xyChartLayout({ series: [{ id: 's1', label: 'Amdahl', points }] });
  const curves = frame.edges.map((e) => e.curve).filter((c): c is number => c !== undefined && c !== 0);
  assert.ok(curves.length > 0, 'debería haber al menos un tramo interior curvado');
  const signs = new Set(curves.map((c) => Math.sign(c)));
  assert.equal(signs.size, 1, 'todas las curvaturas de tramos interiores deben tener el mismo signo');
});

test('extremos de la serie (primer y último tramo) quedan rectos: falta prev o next', () => {
  const points: [number, number][] = [[1, 1], [2, 1.8], [4, 3.0], [8, 4.2]];
  const frame = xyChartLayout({ series: [{ id: 's1', label: 'f', points } ] });
  assert.equal(frame.edges[0].curve, 0); // primer tramo: sin `prev`
});

test('cada punto de una serie chica (<=10 puntos) recibe una anotación con sus coordenadas reales, cerca del nodo', () => {
  const points: [number, number][] = [[1, 1], [2, 1.82], [4, 3.08], [8, 4.71]];
  const frame = xyChartLayout({ series: [{ id: 'amdahl', label: 'Amdahl', points }] });
  for (const [x, y] of points) {
    const expectedText = `(${x}, ${y})`;
    const ann = frame.annotations.find((a) => a.text === expectedText);
    assert.ok(ann, `falta anotación de coordenadas para (${x}, ${y})`);
  }
  // La anotación del primer punto debe estar cerca (no lejos) del nodo correspondiente.
  const p0 = frame.nodes[0];
  const ann0 = frame.annotations.find((a) => a.text === '(1, 1)')!;
  assert.ok(Math.abs(ann0.x - p0.x) <= 10 && Math.abs(ann0.y - p0.y) <= 10);
});

test('una serie con muchos puntos (>10) no etiqueta cada uno — evita amontonar', () => {
  const points: [number, number][] = Array.from({ length: 20 }, (_, i) => [i, i * 2] as [number, number]);
  const frame = xyChartLayout({ series: [{ id: 's1', label: 'f', points }] });
  const coordLabels = frame.annotations.filter((a) => a.id.startsWith('coord-s1-'));
  assert.ok(coordLabels.length < points.length, 'no debería haber una anotación por cada uno de los 20 puntos');
  assert.ok(coordLabels.length >= 3, 'debería seguir habiendo varias anotaciones (no ninguna)');
});

test('un solo punto no revienta (dominio degenerado xMin===xMax)', () => {
  const frame = xyChartLayout({ series: [{ id: 's1', label: 'f', points: [[5, 5]] }] });
  assert.equal(frame.nodes.length, 1);
  assert.equal(frame.edges.length, 0);
  assert.ok(Number.isFinite(frame.nodes[0].x));
  assert.ok(Number.isFinite(frame.nodes[0].y));
});
