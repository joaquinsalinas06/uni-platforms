// Galería de casos borde del renderer de circuitos (/lab/circuitos). Cada
// caso está pensado para romper algo: mallas compartidas, fuentes en ramas
// comunes, puentes anidados, diodos mezclados, rótulos largos, densidad.
// Los tests (layout.test.ts) recorren TODOS estos specs y verifican geometría.

export type GalleryCase = { id: string; title: string; blurb: string; viz: any };

// ── 1-4: los ejemplos canónicos de templates/circuit-examples.mdx ──
const meshNodes = [
  { id: 'g', x: 0, y: 4, ground: true }, { id: 't', x: 0, y: 0 }, { id: 'a', x: 4, y: 0, label: 'a' },
  { id: 'b', x: 8, y: 0 }, { id: 'a2', x: 4, y: 4 }, { id: 'b2', x: 8, y: 4 },
];
const meshParts = [
  { id: 'E', kind: 'vsource', from: 'g', to: 't', value: 10, label: 'E' },
  { id: 'R1', kind: 'resistor', from: 't', to: 'a', value: 1000, label: 'R1' },
  { id: 'R2', kind: 'resistor', from: 'a', to: 'a2', value: 2000, label: 'R2' },
  { id: 'w1', kind: 'wire', from: 'a', to: 'b' },
  { id: 'R3', kind: 'resistor', from: 'b', to: 'b2', value: 2000, label: 'R3' },
  { id: 'w2', kind: 'wire', from: 'b2', to: 'a2' },
  { id: 'w3', kind: 'wire', from: 'a2', to: 'g' },
];
const meshLoops = [
  { id: 'm1', path: ['g', 't', 'a', 'a2'], dir: 'cw', label: 'I₁', tone: 'mesh1' },
  { id: 'm2', path: ['a', 'b', 'b2', 'a2'], dir: 'cw', label: 'I₂', tone: 'mesh2' },
];
const siGeNodes = [{ id: 'g', x: 0, y: 4, ground: true }, { id: 't', x: 0, y: 0 }, { id: 'a', x: 4, y: 0 }, { id: 'a2', x: 4, y: 4 }];
const siGeParts = [
  { id: 'E', kind: 'vsource', from: 'g', to: 't', value: 5, label: 'E' },
  { id: 'D1', kind: 'diode', model: 'si', from: 't', to: 'a', label: 'D1', tone: 'si' },
  { id: 'D2', kind: 'diode', model: 'ge', from: 't', to: 'a', via: [[0, -2], [4, -2]], label: 'D2', tone: 'ge' },
  { id: 'R1', kind: 'resistor', from: 'a', to: 'a2', value: 1000, label: 'R1' },
  { id: 'w1', kind: 'wire', from: 'a2', to: 'g' },
];

export const TEMPLATE_CASES: GalleryCase[] = [
  {
    id: 't1-serie-paralelo',
    title: 'Plantilla 1 · serie → paralelo',
    blurb: 'El ejemplo canónico: R1+R2 se funden en R12, luego R12‖R3.',
    viz: {
      type: 'circuit',
      title: 'Req entre A y C',
      steps: [
        {
          note: 'El nodo m sólo conecta a R1 y R2 y por él no sale ninguna otra rama: R1 y R2 están en serie.',
          circuit: {
            nodes: [{ id: 'A', x: 0, y: 0, label: 'A' }, { id: 'm', x: 4, y: 0 }, { id: 'C', x: 8, y: 0, label: 'C' }, { id: 'a2', x: 0, y: 4 }, { id: 'c2', x: 8, y: 4 }],
            parts: [
              { id: 'R1', kind: 'resistor', from: 'A', to: 'm', value: 1000, label: 'R1' },
              { id: 'R2', kind: 'resistor', from: 'm', to: 'C', value: 2000, label: 'R2' },
              { id: 'w1', kind: 'wire', from: 'A', to: 'a2' },
              { id: 'w2', kind: 'wire', from: 'C', to: 'c2' },
              { id: 'R3', kind: 'resistor', from: 'a2', to: 'c2', value: 3000, label: 'R3' },
            ],
            groups: [{ parts: ['R1', 'R2'], tone: 'series', label: 'serie' }],
          },
        },
        {
          note: 'R12 = R1 + R2. Ahora R12 y R3 comparten los MISMOS dos nodos (A y C): están en paralelo.',
          circuit: {
            nodes: [{ id: 'A', x: 0, y: 0, label: 'A' }, { id: 'C', x: 8, y: 0, label: 'C' }, { id: 'a2', x: 0, y: 4 }, { id: 'c2', x: 8, y: 4 }],
            parts: [
              { id: 'R12', kind: 'resistor', from: 'A', to: 'C', label: 'R12', mergedFrom: ['R1', 'R2'], mergeKind: 'series' },
              { id: 'w1', kind: 'wire', from: 'A', to: 'a2' },
              { id: 'w2', kind: 'wire', from: 'C', to: 'c2' },
              { id: 'R3', kind: 'resistor', from: 'a2', to: 'c2', value: 3000, label: 'R3' },
            ],
            groups: [{ parts: ['R12', 'R3'], tone: 'parallel', label: 'paralelo' }],
          },
        },
        {
          note: 'Req = R12 ‖ R3.',
          circuit: {
            nodes: [{ id: 'A', x: 0, y: 0, label: 'A' }, { id: 'C', x: 8, y: 0, label: 'C' }],
            parts: [{ id: 'Req', kind: 'resistor', from: 'A', to: 'C', label: 'Req', mergedFrom: ['R12', 'R3'], mergeKind: 'parallel', state: 'answer' }],
            req: { between: ['A', 'C'] },
          },
          expect: { 'Req(A,C)': 1500 },
        },
      ],
    },
  },
  {
    id: 't2-mallas',
    title: 'Plantilla 2 · método de mallas',
    blurb: 'Recorrido KVL término a término y sistema completo.',
    viz: {
      type: 'circuit',
      title: 'Método de mallas',
      steps: [1, 2, 3, 4]
        .map((k) => ({
          note: k < 4 ? `Recorro la malla I₁ en sentido horario, elemento ${k}.` : 'Malla I₁ cerrada: la suma de caídas es cero.',
          circuit: { nodes: meshNodes, parts: meshParts, loops: meshLoops, kvl: k < 4 ? { loop: 'm1', upto: k } : { loop: 'm1' } },
        }))
        .concat([
          {
            note: 'Con las dos mallas planteadas se resuelve el sistema. R2 es compartida: su corriente es I₁ − I₂.',
            circuit: {
              nodes: meshNodes,
              parts: meshParts.map((p) => (p.id === 'R2' ? { ...p, state: 'answer' } : p)),
              loops: meshLoops,
              showSystem: true,
              currents: [{ part: 'R2', label: 'I_{R2}', showValue: true }],
            } as any,
            expect: { 'I(R1)': 0.005, 'I(R2)': 0.0025, 'I(R3)': 0.0025 },
          } as any,
        ]),
    },
  },
  {
    id: 't3-si-ge',
    title: 'Plantilla 3 · Si ‖ Ge',
    blurb: 'Hipótesis que falla (✗) y se corrige (✓); D2 va por arriba con via.',
    viz: {
      type: 'circuit',
      title: 'Si ‖ Ge',
      steps: [
        {
          note: 'Hipótesis 1: los dos conducen. Entonces V_ta tendría que valer 0.7 V y 0.3 V a la vez: imposible.',
          circuit: { nodes: siGeNodes, parts: siGeParts, diodes: [{ part: 'D1', assume: 'on' }, { part: 'D2', assume: 'on' }], hypothesis: 'D1 ON · D2 ON' },
        },
        {
          note: 'Hipótesis 2: sólo el Ge conduce (se enciende primero, 0.3 V < 0.7 V). Se valida: V_D1 = 0.3 V < 0.7 V, así que D1 queda OFF. ✓',
          circuit: {
            nodes: siGeNodes,
            parts: siGeParts,
            diodes: [{ part: 'D1', assume: 'off' }, { part: 'D2', assume: 'on' }],
            hypothesis: 'D1 OFF · D2 ON',
            currents: [{ part: 'R1', label: 'I', showValue: true }],
          },
          expect: { 'I(R1)': 0.0047 },
        },
      ],
    },
  },
  {
    id: 't4-umbral',
    title: 'Plantilla 4 · umbral de conducción (estático)',
    blurb: 'El paso único del slider, como figura estática.',
    viz: {
      type: 'circuit',
      static: true,
      steps: [
        {
          note: 'Con E = 2 V el diodo conduce: la corriente es (2 − 0.7)/1 kΩ.',
          circuit: {
            nodes: siGeNodes,
            parts: [
              { id: 'E', kind: 'vsource', from: 'g', to: 't', value: 2, label: 'E' },
              { id: 'D1', kind: 'diode', model: 'si', from: 't', to: 'a', label: 'D1', tone: 'si' },
              { id: 'R1', kind: 'resistor', from: 'a', to: 'a2', value: 1000, label: 'R1' },
              { id: 'w1', kind: 'wire', from: 'a2', to: 'g' },
            ],
            currents: [{ part: 'R1', label: 'I', showValue: true }],
          },
          expect: { 'I(R1)': 0.0013 },
        },
      ],
    },
  },
];


// ─────────────────────────── helpers ───────────────────────────
const N = (id: string, x: number, y: number, o: object = {}) => ({ id, x, y, ...o });
const R = (id: string, from: string, to: string, value?: number, o: object = {}) => ({ id, kind: 'resistor', from, to, value, label: id, ...o });
const Rv = (id: string, from: string, to: string, value: number, o: object = {}) => ({ id, kind: 'resistor', from, to, value, ...o });
const W = (id: string, from: string, to: string, o: object = {}) => ({ id, kind: 'wire', from, to, ...o });
const V = (id: string, from: string, to: string, value: number, o: object = {}) => ({ id, kind: 'vsource', from, to, value, label: id, ...o });
const D = (id: string, from: string, to: string, model: 'si' | 'ge', o: object = {}) => ({ id, kind: 'diode', from, to, model, label: id, tone: model, ...o });
const k = 1000;

// ── 1 malla ──
const oneMesh = {
  nodes: [N('g', 0, 4, { ground: true }), N('t', 0, 0), N('a', 4, 0, { label: 'a' }), N('b', 8, 0), N('c', 8, 4, { label: 'c' })],
  parts: [V('E', 'g', 't', 12), R('R1', 't', 'a', 1 * k), R('R2', 'a', 'b', 2 * k), R('R3', 'b', 'c', 3 * k), W('w', 'c', 'g')],
  loops: [{ id: 'm', path: ['g', 't', 'a', 'b', 'c'], dir: 'ccw', label: 'I', tone: 'mesh1' }],
};

// ── 2 mallas con fuente en la rama compartida ──
const sharedSrc = {
  nodes: [N('bl', 0, 4, { ground: true }), N('tl', 0, 0), N('tm', 4, 0, { label: 'x' }), N('tr', 8, 0), N('bm', 4, 4), N('br', 8, 4)],
  parts: [
    V('E1', 'bl', 'tl', 10), R('R1', 'tl', 'tm', 1 * k), V('E2', 'bm', 'tm', 5), R('R2', 'tm', 'tr', 2 * k), R('R3', 'tr', 'br', 2 * k),
    W('w1', 'br', 'bm'), W('w2', 'bm', 'bl'),
  ],
  loops: [
    { id: 'm1', path: ['bl', 'tl', 'tm', 'bm'], dir: 'cw', label: 'I₁', tone: 'mesh1' },
    { id: 'm2', path: ['bm', 'tm', 'tr', 'br'], dir: 'ccw', label: 'I₂', tone: 'mesh2' },
  ],
};

// ── 3 ventanas (4 ramas verticales), fuente hacia abajo en una rama compartida ──
const threeWin = {
  nodes: [
    N('a0', 0, 0), N('a1', 5, 0), N('a2', 10, 0), N('a3', 15, 0),
    N('b0', 0, 5, { ground: true }), N('b1', 5, 5), N('b2', 10, 5), N('b3', 15, 5),
  ],
  parts: [
    V('E1', 'b0', 'a0', 12), R('R1', 'a0', 'a1', 1 * k), R('R2', 'a1', 'a2', 2 * k), R('R3', 'a2', 'a3', 1 * k),
    R('R4', 'a1', 'b1', 4 * k), V('E2', 'a2', 'b2', 3), R('R5', 'a3', 'b3', 2 * k),
    W('w1', 'b3', 'b2'), R('R6', 'b2', 'b1', 1 * k), W('w3', 'b1', 'b0'),
  ],
  loops: [
    { id: 'm1', path: ['b0', 'a0', 'a1', 'b1'], dir: 'cw', label: 'I₁', tone: 'mesh1' },
    { id: 'm2', path: ['b1', 'a1', 'a2', 'b2'], dir: 'cw', label: 'I₂', tone: 'mesh2' },
    { id: 'm3', path: ['b2', 'a2', 'a3', 'b3'], dir: 'cw', label: 'I₃', tone: 'mesh3' },
  ],
};

// ── lazo exterior + 2 interiores ──
const outerInner = {
  nodes: [N('a0', 0, 0), N('a1', 5, 0), N('a2', 10, 0), N('b0', 0, 5, { ground: true }), N('b1', 5, 5), N('b2', 10, 5)],
  parts: [V('E', 'b0', 'a0', 9), R('R1', 'a0', 'a1', 1 * k), R('R2', 'a1', 'a2', 2 * k), R('R3', 'a1', 'b1', 3 * k), R('R4', 'a2', 'b2', 6 * k), W('w1', 'b2', 'b1'), W('w2', 'b1', 'b0')],
  loops: [
    { id: 'm1', path: ['b0', 'a0', 'a1', 'b1'], dir: 'cw', label: 'I₁', tone: 'mesh1' },
    { id: 'm2', path: ['b1', 'a1', 'a2', 'b2'], dir: 'cw', label: 'I₂', tone: 'mesh2' },
    { id: 'm3', path: ['b0', 'a0', 'a1', 'a2', 'b2', 'b1'], dir: 'cw', label: 'I₃', tone: 'mesh3' },
  ],
};

// ── 4 mallas en 2×2: el nodo central toca las cuatro ──
const grid4 = {
  nodes: [
    N('a0', 0, 0), N('a1', 5, 0), N('a2', 10, 0),
    N('b0', 0, 5), N('b1', 5, 5, { label: 'o' }), N('b2', 10, 5),
    N('c0', 0, 10, { ground: true }), N('c1', 5, 10), N('c2', 10, 10),
  ],
  parts: [
    R('R1', 'a0', 'a1', 1 * k), R('R2', 'a1', 'a2', 1 * k),
    V('E1', 'b0', 'a0', 10), R('R3', 'a1', 'b1', 2 * k), R('R4', 'a2', 'b2', 1 * k),
    R('R5', 'b0', 'b1', 2 * k), R('R6', 'b1', 'b2', 3 * k),
    W('w1', 'c0', 'b0'), R('R7', 'b1', 'c1', 1 * k), V('E2', 'c2', 'b2', 5),
    R('R8', 'c0', 'c1', 1 * k), W('w2', 'c1', 'c2'),
  ],
  loops: [
    { id: 'm1', path: ['b0', 'a0', 'a1', 'b1'], dir: 'cw', label: 'I₁', tone: 'mesh1' },
    { id: 'm2', path: ['b1', 'a1', 'a2', 'b2'], dir: 'cw', label: 'I₂', tone: 'mesh2' },
    { id: 'm3', path: ['c0', 'b0', 'b1', 'c1'], dir: 'ccw', label: 'I₃', tone: 'mesh3' },
    { id: 'm4', path: ['c1', 'b1', 'b2', 'c2'], dir: 'ccw', label: 'I₄', tone: 'mesh4' },
  ],
};

// ── E compartida por 3 lazos (lazos fundamentales anidados) ──
const nested3 = {
  nodes: [
    N('a0', 0, 0), N('a1', 5, 0), N('a2', 10, 0), N('a3', 15, 0),
    N('b0', 0, 5, { ground: true }), N('b1', 5, 5), N('b2', 10, 5), N('b3', 15, 5),
  ],
  parts: [
    V('E', 'b0', 'a0', 15), W('t1', 'a0', 'a1'), R('R1', 'a1', 'a2', 1 * k), R('R2', 'a2', 'a3', 1 * k),
    R('R3', 'a1', 'b1', 3 * k), R('R4', 'a2', 'b2', 3 * k), R('R5', 'a3', 'b3', 3 * k),
    W('w1', 'b3', 'b2'), W('w2', 'b2', 'b1'), W('w3', 'b1', 'b0'),
  ],
  loops: [
    { id: 'L1', path: ['b0', 'a0', 'a1', 'b1'], dir: 'cw', label: 'I₁', tone: 'mesh1' },
    { id: 'L2', path: ['b0', 'a0', 'a1', 'a2', 'b2', 'b1'], dir: 'cw', label: 'I₂', tone: 'mesh2' },
    { id: 'L3', path: ['b0', 'a0', 'a1', 'a2', 'a3', 'b3', 'b2', 'b1'], dir: 'cw', label: 'I₃', tone: 'mesh3' },
  ],
};

// ── fuentes en todas las orientaciones + fuente de corriente compartida (supermalla) ──
const orient = {
  nodes: [N('a0', 0, 0), N('a1', 5, 0), N('a2', 10, 0), N('b0', 0, 5, { ground: true }), N('b1', 5, 5), N('b2', 10, 5)],
  parts: [
    V('E1', 'b0', 'a0', 12), V('E2', 'a1', 'a0', 2, { label: 'E2' }), R('R1', 'a1', 'a2', 2 * k),
    { id: 'Is', kind: 'isource', from: 'b1', to: 'a1', value: 0.002, label: 'Is' },
    V('E3', 'a2', 'b2', 4), R('R2', 'b2', 'b1', 1 * k), R('R3', 'b1', 'b0', 1 * k),
  ],
  loops: [
    { id: 'm1', path: ['b0', 'a0', 'a1', 'b1'], dir: 'cw', label: 'I₁', tone: 'mesh1' },
    { id: 'm2', path: ['b1', 'a1', 'a2', 'b2'], dir: 'cw', label: 'I₂', tone: 'mesh2' },
  ],
};

export const MESH_CASES: GalleryCase[] = [
  {
    id: 'm1-una-malla',
    title: '1 malla, antihoraria, con caída marcada',
    blurb: 'Recorrido KVL paso a paso en sentido antihorario; + VR2 − con valor; corriente sobre un cable.',
    viz: {
      type: 'circuit',
      title: 'Una sola malla',
      steps: [
        ...[1, 2, 3, 4].map((u) => ({ note: `Tramo ${u} de la malla (antihorario).`, circuit: { ...oneMesh, kvl: { loop: 'm', upto: u } } })),
        {
          note: 'Cerrada: la suma de caídas es cero. I = 12 V / 6 kΩ.',
          circuit: { ...oneMesh, kvl: { loop: 'm' }, voltages: [{ part: 'R2', label: 'V_{R2}', plus: 'from', showValue: true }], currents: [{ part: 'w', label: 'I', showValue: true }] },
          expect: { 'I(R1)': 0.002, 'V(a,b)': 4 },
        },
      ],
    },
  },
  {
    id: 'm2-fuente-compartida',
    title: '2 mallas, fuente en la rama compartida, cw + ccw',
    blurb: 'E2 pertenece a las dos mallas; una malla va horaria y la otra antihoraria.',
    viz: {
      type: 'circuit',
      steps: [
        { note: 'KVL en la malla I₂ (antihoraria): la fuente compartida E2 se recorre de + a −.', circuit: { ...sharedSrc, kvl: { loop: 'm2' } } },
        {
          note: 'Sistema completo.',
          circuit: { ...sharedSrc, showSystem: true, currents: [{ part: 'R1', label: 'I_{R1}', showValue: true }, { part: 'R3', label: 'I_{R3}', showValue: true }] },
          expect: { 'I(R1)': 0.005, 'I(R2)': 0.00125, 'V(tm)': 5 },
        },
      ],
    },
  },
  {
    id: 'm3-ventanas',
    title: '3 mallas en fila, fuente apuntando hacia abajo',
    blurb: 'R4, E2 y R6 son compartidas por dos mallas; E2 tiene el + arriba en el cable pero su `from` es el nodo de arriba.',
    viz: { type: 'circuit', steps: [{ note: 'Tres mallas horarias.', circuit: { ...threeWin, showSystem: true } }] },
  },
  {
    id: 'm3-exterior',
    title: '3 lazos: 1 exterior grande + 2 interiores',
    blurb: 'El lazo exterior no es una ventana: su flecha corre por dentro del perímetro, sin tapar las interiores.',
    viz: {
      type: 'circuit',
      steps: [
        { note: 'Los tres lazos a la vez.', circuit: outerInner },
        ...[1, 3, 5].map((u) => ({ note: `KVL por el lazo exterior, hasta el tramo ${u}.`, circuit: { ...outerInner, kvl: { loop: 'm3', upto: u } } })),
        { note: 'Lazo exterior cerrado.', circuit: { ...outerInner, kvl: { loop: 'm3' } } },
      ],
    },
  },
  {
    id: 'm4-cuadricula',
    title: '4 mallas (2×2), sentidos mezclados',
    blurb: 'El nodo central o toca las cuatro mallas; dos van horarias y dos antihorarias.',
    viz: { type: 'circuit', steps: [{ note: 'Cuatro mallas.', circuit: { ...grid4, showSystem: true } }] },
  },
  {
    id: 'm3-pieza-en-tres',
    title: 'Una pieza en tres lazos',
    blurb: 'Lazos fundamentales anidados: E y el cable de arriba pertenecen a I₁, I₂ e I₃ a la vez.',
    viz: { type: 'circuit', steps: [{ note: 'Tres lazos anidados, todos por E.', circuit: { ...nested3, showSystem: true } }] },
  },
  {
    id: 'fuentes-orientaciones',
    title: 'Fuentes en todas las orientaciones + supermalla',
    blurb: 'E1 hacia arriba, E2 horizontal hacia la izquierda, E3 hacia abajo; Is compartida entre las dos mallas.',
    viz: { type: 'circuit', steps: [{ note: 'La fuente de corriente compartida obliga a una supermalla.', circuit: { ...orient, showSystem: true } }] },
  },
];

// ─────────────────────────── reducciones ───────────────────────────

// Cadena: [R1 + ((R2+R3) ‖ R4)] + (R5 ‖ R6), todo ‖ R7.  6 fusiones.
const chainNodes = [
  N('A', 0, 0, { label: 'A' }), N('n1', 4, 0), N('m', 8, 0), N('n2', 12, 0), N('B', 16, 0, { label: 'B' }),
  N('n1d', 4, 4), N('n2d', 12, 4), N('Bd', 16, 4), N('Ad', 0, 8), N('Bdd', 16, 8),
];
const pick = (ids: string[]) => chainNodes.filter((n) => ids.includes(n.id));
const chainSteps = [
  {
    note: 'Por el nodo m sólo pasan R2 y R3: están en serie.',
    circuit: {
      nodes: chainNodes,
      parts: [
        R('R1', 'A', 'n1', 1 * k), R('R2', 'n1', 'm', 2 * k), R('R3', 'm', 'n2', 4 * k), W('d1', 'n1', 'n1d'), R('R4', 'n1d', 'n2d', 3 * k), W('d2', 'n2', 'n2d'),
        R('R5', 'n2', 'B', 6 * k), R('R6', 'n2d', 'Bd', 3 * k), W('d3', 'B', 'Bd'), W('d4', 'A', 'Ad'), R('R7', 'Ad', 'Bdd', 20 * k), W('d5', 'Bd', 'Bdd'),
      ],
      groups: [{ parts: ['R2', 'R3'], tone: 'series', label: 'serie' }],
    },
  },
  {
    note: 'R23 = R2 + R3 = 6 kΩ, y queda entre n1 y n2, igual que R4: paralelo.',
    circuit: {
      nodes: chainNodes.filter((n) => n.id !== 'm'),
      parts: [
        R('R1', 'A', 'n1', 1 * k), R('R23', 'n1', 'n2', undefined, { mergedFrom: ['R2', 'R3'], mergeKind: 'series' }), W('d1', 'n1', 'n1d'), R('R4', 'n1d', 'n2d', 3 * k), W('d2', 'n2', 'n2d'),
        R('R5', 'n2', 'B', 6 * k), R('R6', 'n2d', 'Bd', 3 * k), W('d3', 'B', 'Bd'), W('d4', 'A', 'Ad'), R('R7', 'Ad', 'Bdd', 20 * k), W('d5', 'Bd', 'Bdd'),
      ],
      groups: [{ parts: ['R23', 'R4'], tone: 'parallel', label: 'paralelo' }],
    },
  },
  {
    note: 'R234 = R23 ‖ R4 = 2 kΩ. Ahora R1 y R234 están en serie (n1 ya no tiene otra rama).',
    circuit: {
      nodes: pick(['A', 'n1', 'n2', 'B', 'n2d', 'Bd', 'Ad', 'Bdd']),
      parts: [
        R('R1', 'A', 'n1', 1 * k), R('R234', 'n1', 'n2', undefined, { mergedFrom: ['R23', 'R4'], mergeKind: 'parallel' }), W('d2', 'n2', 'n2d'),
        R('R5', 'n2', 'B', 6 * k), R('R6', 'n2d', 'Bd', 3 * k), W('d3', 'B', 'Bd'), W('d4', 'A', 'Ad'), R('R7', 'Ad', 'Bdd', 20 * k), W('d5', 'Bd', 'Bdd'),
      ],
      groups: [{ parts: ['R1', 'R234'], tone: 'series', label: 'serie' }],
    },
  },
  {
    note: 'Ra = R1 + R234 = 3 kΩ. Del otro lado, R5 y R6 comparten n2 y B: paralelo.',
    circuit: {
      nodes: pick(['A', 'n2', 'B', 'n2d', 'Bd', 'Ad', 'Bdd']),
      parts: [
        R('Ra', 'A', 'n2', undefined, { mergedFrom: ['R1', 'R234'], mergeKind: 'series' }), W('d2', 'n2', 'n2d'),
        R('R5', 'n2', 'B', 6 * k), R('R6', 'n2d', 'Bd', 3 * k), W('d3', 'B', 'Bd'), W('d4', 'A', 'Ad'), R('R7', 'Ad', 'Bdd', 20 * k), W('d5', 'Bd', 'Bdd'),
      ],
      groups: [{ parts: ['R5', 'R6'], tone: 'parallel', label: 'paralelo' }],
    },
  },
  {
    note: 'R56 = R5 ‖ R6 = 2 kΩ, en serie con Ra.',
    circuit: {
      nodes: pick(['A', 'n2', 'B', 'Bd', 'Ad', 'Bdd']),
      parts: [
        R('Ra', 'A', 'n2', 3 * k), R('R56', 'n2', 'B', undefined, { mergedFrom: ['R5', 'R6'], mergeKind: 'parallel' }), W('d3', 'B', 'Bd'), W('d4', 'A', 'Ad'), R('R7', 'Ad', 'Bdd', 20 * k), W('d5', 'Bd', 'Bdd'),
      ],
      groups: [{ parts: ['Ra', 'R56'], tone: 'series', label: 'serie' }],
    },
  },
  {
    note: 'Rb = Ra + R56 = 5 kΩ, entre A y B, igual que R7: paralelo.',
    circuit: {
      nodes: pick(['A', 'B', 'Bd', 'Ad', 'Bdd']),
      parts: [R('Rb', 'A', 'B', undefined, { mergedFrom: ['Ra', 'R56'], mergeKind: 'series' }), W('d3', 'B', 'Bd'), W('d4', 'A', 'Ad'), R('R7', 'Ad', 'Bdd', 20 * k), W('d5', 'Bd', 'Bdd')],
      groups: [{ parts: ['Rb', 'R7'], tone: 'parallel', label: 'paralelo' }],
    },
  },
  {
    note: 'Req = Rb ‖ R7 = 4 kΩ.',
    circuit: {
      nodes: pick(['A', 'B']),
      parts: [R('Req', 'A', 'B', undefined, { mergedFrom: ['Rb', 'R7'], mergeKind: 'parallel', state: 'answer' })],
      req: { between: ['A', 'B'] },
    },
    expect: { 'Req(A,B)': 4000 },
  },
];

// Puente de Wheatstone en rombo: nodos en diagonal, el motor rutea en L (rectángulo).
const bridgeNodes = [
  N('L', 0, 4, { label: 'L' }), N('T', 4, 0, { label: 'T' }), N('Rn', 8, 4, { label: 'R' }), N('Bn', 4, 8, { label: 'B' }),
  N('s', -5, 4), N('g', -5, 11, { ground: true }), N('gr', 8, 11),
];
const bridgeBase = (r1: number, r2: number, r3: number, r4: number, extra: object = {}) => [
  V('E', 'g', 's', 12), W('ws', 's', 'L'), R('R1', 'L', 'T', r1), R('R2', 'T', 'Rn', r2), R('R3', 'L', 'Bn', r3), R('R4', 'Bn', 'Rn', r4),
  R('R5', 'T', 'Bn', 5 * k, extra), W('wr', 'Rn', 'gr'), W('wg', 'gr', 'g'),
];
const withPot = (ids: string[]) => bridgeNodes.map((n) => (ids.includes(n.id) ? { ...n, showPotential: true } : n));

const balanced = [
  { note: 'Puente de Wheatstone. ¿Circula corriente por R5?', circuit: { nodes: bridgeNodes, parts: bridgeBase(1 * k, 2 * k, 3 * k, 6 * k), groups: [{ parts: ['R1', 'R2', 'R3', 'R4', 'R5'], tone: 'bridge', label: 'puente' }] } },
  {
    note: 'R1/R2 = R3/R4 = 1/2: V_T = V_B. Sin diferencia de potencial, R5 no lleva corriente.',
    circuit: { nodes: withPot(['T', 'Bn']), parts: bridgeBase(1 * k, 2 * k, 3 * k, 6 * k, { state: 'muted' }), currents: [{ part: 'R5', label: 'I_5', showValue: true }] },
    expect: { 'I(R5)': 0, 'V(T,Bn)': 0 },
  },
  {
    note: 'Se quita la rama central: quedan R1+R2 y R3+R4 en serie.',
    circuit: {
      nodes: bridgeNodes,
      parts: bridgeBase(1 * k, 2 * k, 3 * k, 6 * k).filter((p) => p.id !== 'R5'),
      groups: [{ parts: ['R1', 'R2'], tone: 'series', label: 'serie' }, { parts: ['R3', 'R4'], tone: 'series', label: 'serie' }],
    },
  },
  {
    note: 'R12 = 3 kΩ y R34 = 9 kΩ, las dos entre L y R: paralelo.',
    circuit: {
      nodes: bridgeNodes.filter((n) => n.id !== 'T' && n.id !== 'Bn'),
      parts: [
        V('E', 'g', 's', 12), W('ws', 's', 'L'),
        R('R12', 'L', 'Rn', undefined, { via: [[0, 0], [8, 0]], mergedFrom: ['R1', 'R2'], mergeKind: 'series' }),
        R('R34', 'L', 'Rn', undefined, { via: [[0, 8], [8, 8]], mergedFrom: ['R3', 'R4'], mergeKind: 'series' }),
        W('wr', 'Rn', 'gr'), W('wg', 'gr', 'g'),
      ],
      groups: [{ parts: ['R12', 'R34'], tone: 'parallel', label: 'paralelo' }],
    },
  },
  {
    note: 'Req = R12 ‖ R34 = 2.25 kΩ.',
    circuit: {
      nodes: bridgeNodes.filter((n) => n.id !== 'T' && n.id !== 'Bn'),
      parts: [V('E', 'g', 's', 12), W('ws', 's', 'L'), R('Req', 'L', 'Rn', undefined, { via: [[0, 0], [8, 0]], mergedFrom: ['R12', 'R34'], mergeKind: 'parallel', state: 'answer' }), W('wr', 'Rn', 'gr'), W('wg', 'gr', 'g')],
      req: { between: ['L', 'Rn'] },
    },
    expect: { 'Req(L,Rn)': 2250 },
  },
];

const unbalanced = [
  {
    note: 'R1/R2 ≠ R3/R4: V_T ≠ V_B y R5 sí lleva corriente. No es serie ni paralelo.',
    circuit: { nodes: withPot(['T', 'Bn']), parts: bridgeBase(1 * k, 1 * k, 2 * k, 1 * k, { state: 'active' }), currents: [{ part: 'R5', label: 'I_5', showValue: true }] },
  },
  {
    note: 'El triángulo L–T–B (R1, R3, R5) se convierte en estrella.',
    circuit: { nodes: bridgeNodes, parts: bridgeBase(1 * k, 1 * k, 2 * k, 1 * k), groups: [{ parts: ['R1', 'R3', 'R5'], tone: 'bridge', label: 'Δ' }] },
  },
  {
    note: 'Δ → Y: cada rama de la estrella = producto de las dos adyacentes / suma de las tres.',
    circuit: {
      nodes: [...bridgeNodes, N('o', 2, 4, { label: 'o' })],
      parts: [
        V('E', 'g', 's', 12), W('ws', 's', 'L'),
        R('Ra', 'L', 'o', undefined, { mergedFrom: ['R1', 'R3', 'R5'], mergeKind: 'delta-wye' }),
        R('Rt', 'o', 'T', undefined, { mergedFrom: ['R1', 'R3', 'R5'], mergeKind: 'delta-wye' }),
        R('Rb', 'o', 'Bn', undefined, { mergedFrom: ['R1', 'R3', 'R5'], mergeKind: 'delta-wye' }),
        R('R2', 'T', 'Rn', 1 * k), R('R4', 'Bn', 'Rn', 1 * k), W('wr', 'Rn', 'gr'), W('wg', 'gr', 'g'),
      ],
      groups: [{ parts: ['Ra', 'Rt', 'Rb'], tone: 'bridge', label: 'Y' }],
    },
  },
];

// Δ → Y puro.
const delta = {
  nodes: [N('a', 0, 7, { label: 'a' }), N('b', 8, 7, { label: 'b' }), N('c', 4, 0, { label: 'c' })],
  parts: [R('Rab', 'a', 'b', 10 * k), R('Rbc', 'b', 'c', 20 * k), R('Rca', 'c', 'a', 30 * k)],
};

// ── EP-2025II P5 (redibujo fiel) ──
const ep25p5 = {
  nodes: [
    N('t0', 0, 0), N('N1', 4, 0), N('N2', 16, 0), N('N3', 22, 0), N('N4', 26, 0), N('N5', 30, 0), N('N6', 37, 0), N('N7', 45, 0), N('N8', 48, 0),
    N('g0', 0, 12, { ground: true }), N('b3', 4, 12), N('b11', 16, 12), N('b17', 22, 12), N('b29', 34, 12), N('b43', 48, 12), N('b47', 52, 12),
    N('P', 4, 6, { label: 'P' }), N('Q', 16, 6, { label: 'Q' }), N('Ta', 10, 3), N('Ba', 10, 9),
    N('S', 22, 6), N('c4', 26, 6), N('U', 30, 4), N('cU', 34, 4), N('cL', 30, 8), N('Vn', 34, 8),
    N('Tb', 41, -3), N('Bb', 41, 3), N('Wn', 48, 6), N('cW', 52, 6),
  ],
  parts: [
    V('E', 'g0', 't0', 8), W('a1', 't0', 'N1'), W('a2', 'N1', 'N2'), Rv('r1k', 'N2', 'N3', 1 * k), W('a3', 'N3', 'N4'), W('a4', 'N4', 'N5'), W('a5', 'N5', 'N6'), W('a6', 'N7', 'N8'),
    W('z1', 'g0', 'b3'), W('z2', 'b3', 'b11'), W('z3', 'b11', 'b17'), W('z4', 'b17', 'b29'), W('z5', 'b29', 'b43'), W('z6', 'b43', 'b47'),
    Rv('r3k', 'N1', 'P', 3 * k), Rv('r75', 'P', 'b3', 7.5 * k), Rv('r48', 'N2', 'Q', 4.8 * k), Rv('r12', 'Q', 'b11', 12 * k),
    Rv('p5', 'P', 'Ta', 5 * k), Rv('p1', 'Ta', 'Q', 1 * k), Rv('p33', 'P', 'Q', 3.3 * k), Rv('p10', 'P', 'Ba', 10 * k), Rv('p21', 'Ba', 'Q', 2.1 * k),
    Rv('s3', 'N3', 'S', 3 * k), Rv('s1', 'S', 'b17', 1 * k), Rv('s2', 'N4', 'c4', 2 * k), Rv('s4', 'c4', 'S', 4 * k),
    Rv('u300', 'N5', 'U', 300), Rv('u2', 'U', 'cU', 2 * k), Rv('u16', 'cU', 'Vn', 16 * k), Rv('u15', 'U', 'cL', 15 * k), Rv('u3', 'cL', 'Vn', 3 * k), Rv('u700', 'Vn', 'b29', 700),
    Rv('q1', 'N6', 'Tb', 3 * k), Rv('q2', 'Tb', 'N7', 3 * k), Rv('q3', 'N6', 'N7', 3 * k), Rv('q4', 'N6', 'Bb', 3 * k), Rv('q5', 'Bb', 'N7', 3 * k),
    Rv('w15', 'N8', 'Wn', 1.5 * k), Rv('w9a', 'Wn', 'b43', 9 * k), Rv('w9b', 'Wn', 'cW', 9 * k), W('wcw', 'cW', 'b47'), Rv('w9c', 'Wn', 'b47', 9 * k),
  ],
};

// ── EP-2026I P5 (circuito derecho, redibujo fiel) ──
const ep26p5 = {
  nodes: [
    N('T0', 0, 0), N('T1', 3, 0), N('T2', 12, 0), N('T3', 15, 0), N('T4', 20, 0), N('T5', 30, 0), N('T6', 33, 0), N('T7', 42, 0),
    N('B0', 0, 12, { ground: true }), N('B1', 3, 12), N('B2', 7, 12), N('B3', 10, 12), N('B4', 17, 12), N('B5', 38, 12), N('B6', 42, 12),
    N('L', 3, 5), N('K', 7, 2), N('M', 7, 8), N('P', 10, 6), N('Q', 17, 4), N('J', 22, 8),
    N('Tb', 25, -3), N('Bb', 25, 3), N('U', 33, 4), N('cU', 38, 4), N('cL', 33, 8), N('Wn', 38, 8), N('X', 42, 6),
  ],
  parts: [
    V('E', 'B0', 'T0', 20),
    W('a1', 'T0', 'T1'), W('a2', 'T1', 'T2'), W('a3', 'T2', 'T3'), W('a4', 'T3', 'T4'), W('a5', 'T5', 'T6'), W('a6', 'T6', 'T7'),
    W('z1', 'B0', 'B1'), W('z2', 'B1', 'B2'), W('z3', 'B2', 'B3'), W('z4', 'B3', 'B4'), Rv('r405', 'B4', 'B5', 40.5 * k), W('z6', 'B5', 'B6'),
    Rv('l1', 'T1', 'L', 1 * k), Rv('l8', 'L', 'B1', 8 * k), Rv('l5', 'L', 'K', 5 * k), Rv('l7', 'K', 'M', 7 * k), Rv('l6', 'L', 'M', 6 * k), Rv('l4', 'M', 'B2', 4 * k),
    Rv('m4', 'T2', 'P', 4 * k), Rv('m6', 'P', 'B3', 6 * k), Rv('m3', 'P', 'Q', 3 * k), Rv('m5', 'T3', 'Q', 5 * k), Rv('m10', 'Q', 'B4', 10 * k), Rv('m12', 'Q', 'J', 12 * k), Rv('m18', 'J', 'B4', 18 * k),
    Rv('q1', 'T4', 'Tb', 9 * k), Rv('q2', 'Tb', 'T5', 9 * k), Rv('q3', 'T4', 'T5', 9 * k), Rv('q4', 'T4', 'Bb', 9 * k), Rv('q5', 'Bb', 'T5', 9 * k),
    Rv('u1', 'T6', 'U', 2.5 * k), Rv('u2', 'U', 'cU', 2.5 * k), Rv('u3', 'cU', 'Wn', 2.5 * k), Rv('u4', 'U', 'cL', 2.5 * k), Rv('u5', 'cL', 'Wn', 2.5 * k), Rv('u6', 'Wn', 'B5', 5 * k),
    Rv('x1', 'T7', 'X', 1 * k), { id: 'R', kind: 'resistor', from: 'X', to: 'B6', label: 'R', state: 'marked' },
  ],
};

export const REDUCTION_CASES: GalleryCase[] = [
  { id: 'reduccion-cadena', title: 'Serie dentro de paralelo dentro de serie (6 fusiones)', blurb: 'Cada fusión: las piezas brillan en el tono del grupo y colapsan en la nueva. Los nodos no se mueven.', viz: { type: 'circuit', title: 'Req entre A y B', steps: chainSteps } },
  { id: 'wheatstone-balanceado', title: 'Wheatstone balanceado: la rama central se apaga', blurb: 'Rombo de nodos no alineados, ruteado en L; V_T = V_B; R5 se desvanece y el resto se reduce.', viz: { type: 'circuit', steps: balanced } },
  { id: 'wheatstone-desbalanceado', title: 'Wheatstone desbalanceado → Δ a Y', blurb: 'I₅ ≠ 0; el triángulo R1-R3-R5 colapsa hacia el centro y nace la estrella.', viz: { type: 'circuit', steps: unbalanced } },
  {
    id: 'delta-estrella',
    title: 'Δ → Y puro',
    blurb: 'El triángulo colapsa hacia el centro; la estrella crece desde él.',
    viz: {
      type: 'circuit',
      steps: [
        { note: 'Triángulo entre a, b y c.', circuit: { ...delta, groups: [{ parts: ['Rab', 'Rbc', 'Rca'], tone: 'bridge', label: 'Δ' }] } },
        {
          note: 'Estrella equivalente con centro o.',
          circuit: {
            nodes: [...delta.nodes, N('o', 4, 4.5, { label: 'o' })],
            parts: [
              R('Ra', 'a', 'o', undefined, { mergedFrom: ['Rab', 'Rbc', 'Rca'], mergeKind: 'delta-wye' }),
              R('Rb', 'b', 'o', undefined, { mergedFrom: ['Rab', 'Rbc', 'Rca'], mergeKind: 'delta-wye' }),
              R('Rc', 'c', 'o', undefined, { mergedFrom: ['Rab', 'Rbc', 'Rca'], mergeKind: 'delta-wye' }),
            ],
            groups: [{ parts: ['Ra', 'Rb', 'Rc'], tone: 'bridge', label: 'Y' }],
          },
          expect: { 'Req(a,b)': 8333.33 },
        },
      ],
    },
  },
  {
    id: 'ep25-p5',
    title: 'EP-2025II · Pregunta 5 (dos puentes)',
    blurb: 'Redibujo fiel: puente balanceado a la izquierda, rombo 3 kΩ arriba a la derecha, triple 9 kΩ (el cable diagonal del original, ruteado en L).',
    viz: {
      type: 'circuit',
      title: 'EP-2025II P5 · Req vista desde E',
      steps: [
        {
          note: 'El circuito del examen. E = 8 V.',
          circuit: { ...ep25p5, groups: [{ parts: ['p5', 'p1', 'p33', 'p10', 'p21'], tone: 'bridge', label: 'puente' }, { parts: ['q1', 'q2', 'q3', 'q4', 'q5'], tone: 'parallel', label: '3 caminos' }] },
        },
        {
          note: '3k/7.5k = 4.8k/12k: el puente de la izquierda está balanceado, V_P = V_Q.',
          circuit: { ...ep25p5, nodes: ep25p5.nodes.map((n) => (n.id === 'P' || n.id === 'Q' ? { ...n, showPotential: true } : n)), parts: ep25p5.parts.map((p) => (['p5', 'p1', 'p33', 'p10', 'p21'].includes(p.id) ? { ...p, state: 'muted' } : p)) },
          expect: { 'V(P,Q)': 0 },
        },
        { note: 'Req vista desde la fuente: 1.888 kΩ. P = E²/Req.', circuit: { ...ep25p5, req: { between: ['t0', 'g0'] } }, expect: { 'Req(t0,g0)': 1887.64, 'P(E)': 0.033905 } },
      ],
    },
  },
  {
    id: 'ep26-p5',
    title: 'EP-2026I · Pregunta 5 (circuito derecho)',
    blurb: 'Redibujo fiel: triángulos (sus lados diagonales, ruteados en L), rombo de 9 kΩ, escalera 2.5 kΩ y la R desconocida (marcada).',
    viz: { type: 'circuit', static: true, title: 'EP-2026I P5', steps: [{ note: '', circuit: ep26p5 }] },
  },
];

// ─────────────────────────── diodos ───────────────────────────
const sq = [N('g', 0, 4, { ground: true }), N('t', 0, 0), N('a', 4, 0), N('a2', 4, 4)];
const reverseParts = [V('E', 'g', 't', 5), D('D1', 'a', 't', 'si'), R('R1', 'a', 'a2', 1 * k), W('w', 'a2', 'g')];

const seriesSrc = {
  nodes: [N('g', 0, 4, { ground: true }), N('t', 0, 0), N('a', 4, 0), N('b', 8, 0), N('c', 8, 4)],
  parts: [V('E1', 'g', 't', 10), D('D1', 't', 'a', 'si'), V('V2', 'b', 'a', 3), R('R1', 'b', 'c', 1 * k), W('w', 'c', 'g')],
};

// 5 diodos Si/Ge mezclados.
const mixed = {
  nodes: [
    N('g', 0, 6, { ground: true }), N('t', 0, 0), N('n', 4, 0, { label: 'n', showPotential: true }), N('n2', 9, 0), N('n3', 14, 0), N('n4', 19, 0),
    N('x1', 4, 3), N('x2', 9, 3), N('x3', 14, 3), N('x4', 19, 3), N('g1', 4, 6), N('g2', 9, 6), N('g3', 14, 6), N('g4', 19, 6),
  ],
  parts: [
    V('E', 'g', 't', 10), D('D1', 't', 'n', 'si'), W('t1', 'n', 'n2'), W('t2', 'n2', 'n3'), W('t3', 'n3', 'n4'),
    D('D2', 'n', 'x1', 'ge'), R('R2', 'x1', 'g1', 1 * k),
    D('D3', 'n2', 'x2', 'si'), R('R3', 'x2', 'g2', 1 * k),
    D('D4', 'x3', 'n3', 'ge'), R('R4', 'x3', 'g3', 1 * k),
    D('D5', 'n4', 'x4', 'si'), V('V5', 'g4', 'x4', 12),
    W('b1', 'g4', 'g3'), W('b2', 'g3', 'g2'), W('b3', 'g2', 'g1'), W('b4', 'g1', 'g'),
  ],
};
const mixedHyp = (st: Record<string, 'on' | 'off'>) => Object.entries(st).map(([part, assume]) => ({ part, assume }));
const hypText = (st: Record<string, 'on' | 'off'>) => Object.entries(st).map(([p, a]) => `${p} ${a.toUpperCase()}`).join(' · ');

// EP-2025II P6
const ep25p6 = {
  nodes: [
    N('GL', 0, 10, { ground: true }), N('TL', 0, 0), N('n1', 6, 0), N('n2', 12, 0), N('n3', 18, 0), N('r1', 18, 3), N('r2', 18, 7), N('BR', 18, 10),
    N('m1', 6, 4), N('Va', 6, 10, { label: 'Va', showPotential: true }), N('k1', 12, 3), N('k2', 12, 6), N('n7', 12, 10),
  ],
  parts: [
    V('V1', 'GL', 'TL', 15, { label: 'E' }), R('R1', 'TL', 'n1', 1 * k), R('R4', 'n1', 'n2', 2 * k), D('D6', 'n2', 'n3', 'si'),
    D('D4', 'n3', 'r1', 'ge'), R('R3', 'r1', 'r2', 3 * k), D('D5', 'BR', 'r2', 'ge'),
    D('D8', 'n1', 'm1', 'si'), R('R2', 'm1', 'Va', 1 * k),
    D('D1', 'n2', 'k1', 'ge'), D('D2', 'k1', 'k2', 'si'), V('V2', 'n7', 'k2', 3),
    R('R6', 'GL', 'Va', 2 * k), R('R5', 'Va', 'n7', 4 * k), D('D7', 'BR', 'n7', 'si'),
  ],
  currents: [
    { part: 'R1', label: 'I' }, { part: 'D6', label: 'I_x' }, { part: 'R2', label: 'i_1' }, { part: 'V2', label: 'i_2', dir: 'reverse' },
  ],
  voltages: [{ part: 'R4', label: 'V_b', plus: 'from' }],
};

// EP-2026I P6
const ep26p6 = {
  nodes: [
    N('TL', 0, 0), N('a1', 4, 0), N('a2', 10, 0), N('a3', 16, 0), N('TR', 22, 0),
    N('BL', 0, 14), N('b1', 4, 14, { ground: true }), N('b2', 10, 14), N('b3', 16, 14), N('BR', 22, 14),
    N('d1', 4, 3), N('d2', 4, 6, { label: 'Va', showPotential: true }), N('d3', 4, 9),
    N('e1', 10, 3), N('e2', 10, 6), N('e3', 10, 9), N('f1', 16, 5), N('f2', 16, 8), N('c1', 22, 4), N('c2', 22, 8),
  ],
  parts: [
    V('V1', 'BL', 'TL', 12, { label: 'E' }), W('w0', 'TL', 'a1'), R('R2', 'a1', 'a2', 1 * k), R('R5', 'a2', 'a3', 3 * k), R('R6', 'a3', 'TR', 2 * k),
    D('D6', 'TR', 'c1', 'si'), V('V3', 'c2', 'c1', 3.7), D('D7', 'BR', 'c2', 'si'),
    D('D1', 'a1', 'd1', 'si'), D('D2', 'd1', 'd2', 'ge'), R('R8', 'd2', 'd3', 1 * k), V('V2', 'b1', 'd3', 2),
    D('D3', 'a2', 'e1', 'si'), D('D4', 'e1', 'e2', 'si'), D('D5', 'e2', 'e3', 'ge'), R('R9', 'e3', 'b2', 2 * k),
    R('R4', 'a3', 'f1', 5 * k), D('D8', 'f1', 'f2', 'ge'), V('V4', 'b3', 'f2', 2),
    W('w1', 'BL', 'b1'), R('R3', 'b1', 'b2', 2 * k), R('R1', 'b2', 'b3', 2 * k), R('R7', 'b3', 'BR', 3 * k),
  ],
  currents: [{ part: 'D1', label: 'i_1' }, { part: 'D4', label: 'i_2' }, { part: 'R4', label: 'i_3' }, { part: 'D6', label: 'I_x' }],
  voltages: [{ part: 'R2', label: 'V_b', plus: 'from' }, { part: 'R5', label: 'V_c', plus: 'from' }],
};

export const DIODE_CASES: GalleryCase[] = [
  {
    id: 'diodo-inverso',
    title: 'Diodo en inversa',
    blurb: 'Suponer ON da I < 0 (✗); OFF se valida con V_AK < 0.7 V (✓). El modelo OFF se dibuja como circuito abierto.',
    viz: {
      type: 'circuit',
      steps: [
        { note: 'Hipótesis: D1 ON.', circuit: { nodes: sq, parts: reverseParts, diodes: [{ part: 'D1', assume: 'on' }], hypothesis: 'D1 ON' } },
        { note: 'Hipótesis: D1 OFF.', circuit: { nodes: sq, parts: reverseParts, diodes: [{ part: 'D1', assume: 'off' }], hypothesis: 'D1 OFF', voltages: [{ part: 'D1', label: 'V_{AK}', plus: 'from', showValue: true }] }, expect: { 'I(R1)': 0 } },
      ],
    },
  },
  {
    id: 'diodo-serie-fuente',
    title: 'Diodo en serie con una fuente opuesta',
    blurb: 'E1 − 0.7 − V2 = I·R1.',
    viz: {
      type: 'circuit',
      steps: [{ note: 'D1 ON: I = (10 − 0.7 − 3) / 1 kΩ.', circuit: { ...seriesSrc, diodes: [{ part: 'D1', assume: 'on' }], hypothesis: 'D1 ON', currents: [{ part: 'R1', label: 'I', showValue: true }] }, expect: { 'I(R1)': 0.0063 } }],
    },
  },
  {
    id: 'diodos-mixtos',
    title: '5 diodos Si/Ge mezclados: hipótesis falla y se corrige',
    blurb: 'Primero todos ON (✗ en los que no cumplen), luego la combinación consistente (✓).',
    viz: {
      type: 'circuit',
      steps: [
        { note: 'Sin hipótesis: el motor busca el estado consistente.', circuit: mixed },
        { note: 'Hipótesis: los cinco conducen. Imposible: D5 ON fijaría x4 a la vez en 8.6 V y 12 V.', circuit: { ...mixed, diodes: mixedHyp({ D1: 'on', D2: 'on', D3: 'on', D4: 'on', D5: 'on' }), hypothesis: hypText({ D1: 'on', D2: 'on', D3: 'on', D4: 'on', D5: 'on' }) } },
        { note: 'Hipótesis: D5 OFF, el resto ON. D4 da corriente negativa: falla.', circuit: { ...mixed, diodes: mixedHyp({ D1: 'on', D2: 'on', D3: 'on', D4: 'on', D5: 'off' }), hypothesis: hypText({ D1: 'on', D2: 'on', D3: 'on', D4: 'on', D5: 'off' }) } },
        { note: 'Corregida.', circuit: { ...mixed, diodes: mixedHyp({ D1: 'on', D2: 'on', D3: 'on', D4: 'off', D5: 'off' }), hypothesis: hypText({ D1: 'on', D2: 'on', D3: 'on', D4: 'off', D5: 'off' }) } },
      ],
    },
  },
  {
    id: 'ep25-p6',
    title: 'EP-2025II · Pregunta 6 (diodos)',
    blurb: 'Redibujo fiel con I→, Ix, i1, i2, +Vb− y Va; 7 diodos Si/Ge.',
    viz: { type: 'circuit', title: 'EP-2025II P6 · E = 15 V', steps: [{ note: 'Sin hipótesis: el motor encuentra el estado de cada diodo.', circuit: ep25p6 }] },
  },
  {
    id: 'ep26-p6',
    title: 'EP-2026I · Pregunta 6 (diodos)',
    blurb: 'Redibujo fiel con i1, i2, i3, Ix, +Vb−, +Vc− y Va; 8 diodos Si/Ge.',
    viz: { type: 'circuit', title: 'EP-2026I P6 · E = 12 V', steps: [{ note: 'Sin hipótesis: el motor encuentra el estado de cada diodo.', circuit: ep26p6 }] },
  },
];

// ─────────────────────────── bordes de dibujo ───────────────────────────
const shortC = {
  nodes: [N('g', 0, 4, { ground: true }), N('t', 0, 0), N('a', 4, 0, { label: 'a' }), N('a2', 4, 4), N('s', 8, 0), N('s2', 8, 4)],
  parts: [V('E', 'g', 't', 6), R('R1', 't', 'a', 2 * k), R('R2', 'a', 'a2', 3 * k), W('ws', 'a', 's'), W('short', 's', 's2', { state: 'active' }), W('w2', 's2', 'a2'), W('w3', 'a2', 'g')],
};
const sameNode = {
  nodes: [
    N('g', 0, 6, { ground: true }), N('t', 0, 0), N('a', 4, 0, { label: 'a', showPotential: true, state: 'active' }), N('a2', 4, 6),
    N('x', 12, 0), N('ap', 12, 6, { label: 'a′', showPotential: true, state: 'active' }), N('x2', 16, 0), N('x3', 16, 6),
  ],
  parts: [
    V('E', 'g', 't', 9), R('R1', 't', 'a', 1 * k), R('R2', 'a', 'a2', 2 * k), W('w1', 'a2', 'g'),
    W('long', 'a', 'ap', { via: [[4, -3], [20, -3], [20, 9], [12, 9]], state: 'active' }),
    R('R3', 'ap', 'x', 1 * k), R('R4', 'x', 'x2', 1 * k), R('R5', 'x2', 'x3', 1 * k), W('w4', 'x3', 'ap'),
  ],
};
const longLabels = {
  nodes: [N('g', 0, 5, { ground: true }), N('t', 0, 0), N('o', 6, 0, { label: 'Vout (salida del divisor)', showPotential: true }), N('o2', 6, 5), N('p', 12, 0), N('p2', 12, 5)],
  parts: [
    V('Vbat', 'g', 't', 3.7, { label: 'V_{batería}' }), R('Rs', 't', 'o', 4.7e6, { label: 'R_{sensor}' }), R('Rc', 'o', 'o2', 1.2e6, { label: 'R_{carga}' }),
    { id: 'Is', kind: 'isource', from: 'p2', to: 'p', value: 0.00000047, label: 'I_{fuga}' }, W('w1', 'o', 'p'), W('w2', 'p2', 'o2'), W('w3', 'o2', 'g'),
  ],
  currents: [{ part: 'Rs', label: 'I_{sensor}', showValue: true }],
  voltages: [{ part: 'Rc', label: 'V_{carga}', showValue: true }],
};
const dense = (() => {
  const nodes: any[] = [], parts: any[] = [];
  const C = 5, Rw = 3;
  for (let r = 0; r <= Rw; r++) for (let c = 0; c <= C; c++) nodes.push(N(`n${r}${c}`, c * 4, r * 4, r === Rw && c === 0 ? { ground: true } : {}));
  let i = 1;
  for (let r = 0; r <= Rw; r++) for (let c = 0; c < C; c++) parts.push((r + c) % 3 === 2 ? W(`h${r}${c}`, `n${r}${c}`, `n${r}${c + 1}`) : R(`R${i++}`, `n${r}${c}`, `n${r}${c + 1}`, ((i % 5) + 1) * k));
  for (let r = 0; r < Rw; r++) for (let c = 0; c <= C; c++) parts.push(c === 0 && r === 1 ? V('E', `n${r + 1}${c}`, `n${r}${c}`, 12) : R(`R${i++}`, `n${r}${c}`, `n${r + 1}${c}`, ((i % 4) + 1) * k));
  return { nodes, parts };
})();
const kinds = ['resistor', 'pot', 'vsource', 'isource', 'ac-source', 'diode', 'led', 'switch', 'button', 'ammeter', 'voltmeter', 'galvanometer', 'lamp', 'motor', 'relay', 'capacitor', 'open'];
const symbolsAll = (() => {
  const nodes: any[] = [], parts: any[] = [];
  kinds.forEach((kd, i) => {
    const x = (i % 6) * 6, y = Math.floor(i / 6) * 6;
    nodes.push(N(`a${i}`, x, y), N(`b${i}`, x + 4, y));
    parts.push({ id: `p${i}`, kind: kd, from: `a${i}`, to: `b${i}`, label: kd, value: kd === 'switch' || kd === 'button' ? (i % 2) : kd === 'resistor' || kd === 'pot' ? 1000 : kd === 'vsource' || kd === 'ac-source' ? 5 : kd === 'isource' ? 0.001 : kd === 'capacitor' ? 1e-6 : undefined, model: kd === 'diode' ? 'si' : undefined });
  });
  // un vertical de cada tipo con círculo, para ver letras derechas
  ['vsource', 'ammeter', 'motor', 'diode'].forEach((kd, j) => {
    const x = 36 + j * 5;
    nodes.push(N(`va${j}`, x, 0), N(`vb${j}`, x, 4));
    parts.push({ id: `v${j}`, kind: kd, from: `vb${j}`, to: `va${j}`, label: `${kd} ↑`, value: kd === 'vsource' ? 9 : undefined, model: kd === 'diode' ? 'ge' : undefined, tone: kd === 'diode' ? 'ge' : undefined });
  });
  return { nodes, parts };
})();
const ladder = (() => {
  const nodes: any[] = [N('g', 0, 20, { ground: true }), N('t', 0, 0)], parts: any[] = [V('E', 'g', 't', 10)];
  let prev = 't';
  for (let i = 0; i < 5; i++) {
    const y = i * 4;
    nodes.push(N(`r${i}`, 6, y, { label: `n${i + 1}` }), N(`l${i}`, 0, y + 4));
    parts.push(R(`Rs${i + 1}`, prev === 't' ? 't' : `r${i - 1}`, `r${i}`, 1 * k, prev === 't' ? {} : {}));
    prev = `r${i}`;
  }
  // arreglar: serie horizontal sólo arriba, luego vertical por la derecha
  return { nodes, parts };
})();
const tall = {
  nodes: [
    N('t', 0, 0), N('g', 0, 20, { ground: true }), N('r0', 5, 0, { label: 'n1' }), N('r1', 5, 5, { label: 'n2' }), N('r2', 5, 10, { label: 'n3' }), N('r3', 5, 15, { label: 'n4' }), N('r4', 5, 20),
    N('q0', 10, 0), N('q1', 10, 5), N('q2', 10, 10), N('q3', 10, 15), N('q4', 10, 20),
  ],
  parts: [
    V('E', 'g', 't', 10), R('R1', 't', 'r0', 1 * k), R('R2', 'r0', 'r1', 1 * k), R('R3', 'r1', 'r2', 1 * k), R('R4', 'r2', 'r3', 1 * k), R('R5', 'r3', 'r4', 1 * k), W('wg', 'r4', 'g'),
    W('h0', 'r0', 'q0'), R('R6', 'q0', 'q1', 2 * k), W('h1', 'q1', 'r1'), R('R7', 'q1', 'q2', 2 * k), W('h2', 'q2', 'r2'), R('R8', 'q2', 'q3', 2 * k), W('h3', 'q3', 'r3'), R('R9', 'q3', 'q4', 2 * k), W('h4', 'q4', 'r4'),
  ],
  currents: [{ part: 'R1', label: 'I', showValue: true }],
};
void ladder;
const board = {
  nodes: [N('p', 0, 0, { label: '5 V' }), N('a', 5, 0), N('b', 10, 0), N('c', 15, 0), N('c2', 15, 5), N('g', 0, 5, { ground: true })],
  parts: [
    V('V', 'g', 'p', 5), { id: 'S1', kind: 'button', from: 'p', to: 'a', value: 1, label: 'S1' }, R('R1', 'a', 'b', 220), { id: 'LED', kind: 'led', from: 'b', to: 'c', label: 'LED' },
    W('w1', 'c', 'c2'), W('w2', 'c2', 'g'),
  ],
  currents: [{ part: 'R1', label: 'I', showValue: true }],
  variant: 'breadboard',
};
const wiring = {
  nodes: [N('p', 0, 0, { label: '+5 V' }), N('a', 6, 0), N('a2', 6, 5), N('g', 0, 5, { ground: true }), N('m', 12, 0), N('m2', 12, 5)],
  parts: [
    V('V', 'g', 'p', 5), W('w1', 'p', 'a'), { id: 'K1', kind: 'relay', from: 'a', to: 'a2', value: 70, label: 'K1' }, W('w2', 'a2', 'g'),
    W('w3', 'a', 'm'), { id: 'M1', kind: 'motor', from: 'm', to: 'm2', value: 20, label: 'M1' }, W('w4', 'm2', 'a2'),
  ],
  variant: 'wiring',
};
const nestedHalo = {
  nodes: [N('A', 0, 0, { label: 'A' }), N('m', 4, 0), N('B', 8, 0, { label: 'B' }), N('A2', 0, 4), N('B2', 8, 4), N('A3', 0, 8), N('B3', 8, 8)],
  parts: [R('R1', 'A', 'm', 1 * k), R('R2', 'm', 'B', 1 * k), W('w1', 'A', 'A2'), W('w2', 'B', 'B2'), R('R3', 'A2', 'B2', 2 * k), W('w3', 'A2', 'A3'), W('w4', 'B2', 'B3'), R('R4', 'A3', 'B3', 2 * k)],
  groups: [{ parts: ['R1', 'R2', 'R3', 'R4'], tone: 'parallel', label: 'paralelo' }, { parts: ['R1', 'R2'], tone: 'series', label: 'serie' }],
};

export const DRAWING_CASES: GalleryCase[] = [
  {
    id: 'rama-en-corto',
    title: 'Rama en cortocircuito',
    blurb: 'Un cable en paralelo con R2 la anula: R2 se apaga y luego desaparece.',
    viz: {
      type: 'circuit',
      steps: [
        { note: 'El cable resaltado une a con el nodo de abajo.', circuit: { ...shortC, currents: [{ part: 'short', label: 'I_{corto}', showValue: true }] } },
        { note: 'Entre los extremos de R2 hay 0 V: no lleva corriente.', circuit: { ...shortC, parts: shortC.parts.map((p) => (p.id === 'R2' ? { ...p, state: 'muted' } : p)), currents: [{ part: 'R2', label: 'I_2', showValue: true }] }, expect: { 'I(R2)': 0, 'I(R1)': 0.003 } },
        { note: 'Se quita R2.', circuit: { ...shortC, parts: shortC.parts.filter((p) => p.id !== 'R2') } },
      ],
    },
  },
  {
    id: 'mismo-nodo',
    title: 'Dos puntos lejanos, el mismo nodo',
    blurb: 'Un cable largo con varios quiebres une a y a′: mismos potenciales.',
    viz: { type: 'circuit', steps: [{ note: 'a y a′ están unidos por un cable: son el mismo nodo.', circuit: sameNode, expect: { 'V(a,ap)': 0 } }] },
  },
  { id: 'rotulos-largos', title: 'Rótulos largos y valores extremos', blurb: 'Subíndices largos, MΩ, nA, un nodo con nombre largo y potencial.', viz: { type: 'circuit', steps: [{ note: 'Nada se debe pisar.', circuit: longLabels }] } },
  { id: 'denso', title: 'Circuito denso (malla 5×3 de resistencias)', blurb: 'Separación mínima de 4 celdas en todas direcciones; muchos rótulos compitiendo.', viz: { type: 'circuit', static: true, steps: [{ note: '', circuit: dense }] } },
  { id: 'simbolos', title: 'Todos los símbolos', blurb: 'Cada tipo de pieza del schema, horizontal; y cuatro verticales para ver los glifos derechos.', viz: { type: 'circuit', static: true, steps: [{ note: '', circuit: symbolsAll }] } },
  { id: 'alto-movil', title: 'Circuito alto (móvil 375 px)', blurb: 'Escalera vertical: en móvil no debe encogerse hasta volverse ilegible.', viz: { type: 'circuit', steps: [{ note: 'Escalera de 5 peldaños.', circuit: tall }] } },
  { id: 'halos-anidados', title: 'Halos anidados', blurb: 'Un grupo serie dentro de un grupo paralelo; los rótulos no se pisan.', viz: { type: 'circuit', static: true, steps: [{ note: '', circuit: nestedHalo }] } },
  { id: 'protoboard', title: 'Variante protoboard', blurb: 'Pulsador + resistencia + LED sobre una placa.', viz: { type: 'circuit', static: true, steps: [{ note: '', circuit: board }] } },
  { id: 'cableado', title: 'Variante cableado (relé + motor)', blurb: 'Cables gruesos, bobina de relé con contacto NO/COM/NC y motor.', viz: { type: 'circuit', static: true, steps: [{ note: '', circuit: wiring }] } },
];

export const GALLERY: GalleryCase[] = [...TEMPLATE_CASES, ...MESH_CASES, ...REDUCTION_CASES, ...DIODE_CASES, ...DRAWING_CASES];
