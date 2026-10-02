import { z } from 'astro/zod';
import { NODE_STATES } from '../visualizations/canvas-types.ts';

// Única fuente de verdad de los contratos. La importan: el build de Astro
// (src/content.config.ts, src/lib/topics.ts) y scripts/check-knowledge-map.mjs.
// No duplicar ninguno de estos schemas en otro archivo.

export const VISUALIZATION_TYPES = [
  'circuit',
  'xy-chart',
  'sequence',
  'flow',
  'dag',
  'network-topology',
  'timeline',
  'memory-layout',
  'net-scene',
  'spacetime',
  'window',
  'packet',
  'fsm',
] as const;

/** Canal de COLOR SEMÁNTICO, separado de `state` (que sigue siendo el rol del
 * paso: active/marked/answer/muted…). Vocabulario cerrado: ninguna familia ni
 * ningún contenido inventa un tono nuevo. Cada tono tiene su token CSS
 * `--tone-<nombre>` (claro y oscuro) en src/styles/global.css. */
export const TONES = ['series', 'parallel', 'bridge', 'si', 'ge', 'mesh1', 'mesh2', 'mesh3', 'mesh4', 'current'] as const;
const tone = z.enum(TONES);
const state = z.enum(NODE_STATES);

// El nodo de una visualización. Reusado tal cual por `dag` y por
// `network-topology` (ambas familias son, en el fondo, nodos + aristas).
const vizNode = z.object({
  id: z.string(),
  value: z.union([z.string(), z.number()]),
  /** Nombre de variable mostrado arriba de la caja (p.ej. "p0", "T1"). */
  tag: z.string().optional(),
  parent: z.string().nullable().default(null),
  state: state.optional(),
});

const vizLink = z.object({
  from: z.string(),
  to: z.string(),
  kind: z.enum(['tree', 'shared', 'pointer']).default('tree'),
  label: z.string().optional(),
  curve: z.number().optional(),
  bidirectional: z.boolean().default(false),
});

// ─────────────────────────── circuit ───────────────────────────
// Convenciones (NO negociables, el solver y el renderer dependen de ellas):
//  · Coordenadas en celdas de rejilla (enteros o medios), origen arriba-izq.
//  · Toda pieza va de `from` a `to` (ids de nodo). Sentido positivo = from→to.
//  · vsource: `from` = terminal −, `to` = terminal +.
//  · isource: la flecha apunta de `from` a `to`.
//  · diode / led: `from` = ánodo, `to` = cátodo.
//  · `value` en unidades SI sin prefijo (ohm, volt, ampere): 2200, no "2.2k".
//    El renderer formatea (2.2 kΩ). `label` es el NOMBRE ("R1", "E"), corto.
//  · Nunca se escriben a mano ecuaciones ni resultados numéricos: los calcula
//    el solver (src/visualizations/circuit/solve.ts) a partir del netlist.
export const PART_KINDS = [
  'resistor', 'pot', 'vsource', 'isource', 'diode', 'led', 'wire', 'open',
  'switch', 'button', 'ammeter', 'voltmeter', 'galvanometer', 'lamp', 'motor',
  'relay', 'capacitor', 'ac-source',
] as const;

const circuitNode = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  /** Nombre visible del nodo ("A", "B", "Va"). Sin label, el nodo no se rotula. */
  label: z.string().optional(),
  /** Punto de unión dibujado. default: automático (se dibuja si ≥3 conexiones). */
  dot: z.boolean().optional(),
  /** Mostrar el potencial calculado por el solver junto al nodo. */
  showPotential: z.boolean().default(false),
  /** Nodo de referencia (0 V). Si ninguno lo es, se toma el − de la primera fuente. */
  ground: z.boolean().default(false),
  state: state.optional(),
});

const circuitPart = z.object({
  id: z.string(),
  kind: z.enum(PART_KINDS),
  from: z.string(),
  to: z.string(),
  value: z.number().optional(),
  label: z.string().optional(),
  /** Sólo diode: modelo de caída constante. si = 0.7 V, ge = 0.3 V, led = 2 V por defecto. */
  model: z.enum(['si', 'ge']).optional(),
  /** Sobrescribe la caída del diodo/LED (V). */
  vf: z.number().optional(),
  /** Puntos intermedios del cable [[x,y],…] para doblar la ruta. */
  via: z.array(z.tuple([z.number(), z.number()])).optional(),
  /** Esta pieza resulta de fundir otras (reducción serie/paralelo, Δ↔Y).
   * Si falta `value`, el motor lo calcula desde las piezas de origen. */
  mergedFrom: z.array(z.string()).optional(),
  /** Cómo se fundieron, para rotular la fórmula (R1+R2 / R1‖R2). */
  mergeKind: z.enum(['series', 'parallel', 'delta-wye', 'wye-delta']).optional(),
  tone: tone.optional(),
  state: state.optional(),
});

export const circuitSchema = z.object({
  nodes: z.array(circuitNode),
  parts: z.array(circuitPart),
  /** Halos: grupos que se reducen (serie/paralelo) o el rombo de un puente. */
  groups: z.array(z.object({ parts: z.array(z.string()), tone, label: z.string().optional() })).default([]),
  /** Mallas: `path` = ids de nodos EN ORDEN alrededor de la malla (cerrada
   * implícitamente). Se dibuja la flecha circular dentro. */
  loops: z
    .array(z.object({ id: z.string(), path: z.array(z.string()).min(3), dir: z.enum(['cw', 'ccw']).default('cw'), label: z.string(), tone }))
    .default([]),
  /** Recorrido KVL en curso: la flecha avanza por `loop` hasta la pieza nº
   * `upto` (1-based, en el orden de `path`) y el panel de ecuaciones muestra
   * los términos hasta ahí. `upto` omitido = malla completa + ecuación cerrada. */
  kvl: z.object({ loop: z.string(), upto: z.number().int().optional() }).optional(),
  /** Mostrar el sistema de ecuaciones de todas las mallas y su solución. */
  showSystem: z.boolean().default(false),
  /** Flechas de corriente rotuladas. dir 'forward' = sentido from→to de la pieza. */
  currents: z.array(z.object({ part: z.string(), label: z.string(), dir: z.enum(['forward', 'reverse']).default('forward'), showValue: z.boolean().default(false) })).default([]),
  /** Marcas + − y rótulo de caída sobre una pieza. plus = extremo positivo. */
  voltages: z.array(z.object({ part: z.string(), label: z.string(), plus: z.enum(['from', 'to']).default('from'), showValue: z.boolean().default(false) })).default([]),
  /** Hipótesis sobre los diodos en ESTE paso. El motor resuelve con esas
   * hipótesis, valida (ON exige I≥0; OFF exige V_AK < Vγ) y pinta el
   * veredicto. showModel: dibujar el equivalente (fuente Vγ / circuito abierto). */
  diodes: z.array(z.object({ part: z.string(), assume: z.enum(['on', 'off']), showModel: z.boolean().default(true) })).default([]),
  /** Texto corto del badge de hipótesis ("D1 ON · D2 OFF"). */
  hypothesis: z.string().optional(),
  /** Resistencia equivalente a mostrar/verificar entre dos nodos. */
  req: z.object({ between: z.tuple([z.string(), z.string()]) }).optional(),
  /** Ecuaciones libres (sólo cuando no son KVL/KCL generables): KaTeX. */
  equations: z.array(z.object({ tex: z.string(), part: z.string().optional(), state: state.optional() })).default([]),
  /** Variante de dibujo. breadboard = protoboard con rieles/columnas. */
  variant: z.enum(['schematic', 'breadboard', 'wiring']).default('schematic'),
});

/** Valores esperados — `pnpm test` los verifica con el solver (tolerancia 1 %).
 * Claves: "I(R2)" corriente from→to de una pieza, "V(a)" potencial de nodo,
 * "V(a,b)" = V(a)−V(b), "Req(A,B)", "P(R4)" potencia consumida, "P(E)"
 * potencia entregada por una fuente. */
const expectSchema = z.record(z.number());

// ─────────────────────────── xy-chart ───────────────────────────
const xySeries = z.object({
  id: z.string(),
  label: z.string(),
  /** Puntos explícitos… */
  points: z.array(z.tuple([z.number(), z.number()])).optional(),
  /** …o una expresión en x (alias t, n) con JS Math sin prefijo (sin, cos,
   * tan, abs, sign, sqrt, exp, log, floor, ceil, round, max, min, pow, PI, E)
   * más square(x) (cuadrada ±1, período 2π), pwm(x, duty, period, low, high)
   * y step(x) (escalón). Nombres de `params` también valen. Ej:
   * "sin(2*x)+4*sin(5*x)". stem/samples con fn: `samples` = separación Ts. */
  fn: z.string().optional(),
  domain: z.tuple([z.number(), z.number()]).optional(),
  /** Nº de muestras para fn (default 240) o separación Ts para `samples`. */
  samples: z.number().optional(),
  kind: z.enum(['line', 'stem', 'step', 'samples', 'area', 'bars']).default('line'),
  /** Sólo bars: barras horizontales [from, to] por categoría (alcance de tecnologías). */
  bars: z.array(z.object({ label: z.string(), from: z.number(), to: z.number() })).optional(),
  tone: tone.optional(),
  state: state.optional(),
});
const axis = z.object({ label: z.string().optional(), min: z.number().optional(), max: z.number().optional(), log: z.boolean().default(false), ticks: z.array(z.number()).optional() });
const refLine = z.object({ at: z.number(), label: z.string().optional(), state: state.optional(), tone: tone.optional() });

// ─────────────────────────── sequence ───────────────────────────
const seqMsg = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string(),
  /** Flags cortos bajo la etiqueta ("QoS 1 · DUP=1"). */
  flags: z.string().optional(),
  /** Se pierde a mitad del camino (✕). */
  lost: z.boolean().default(false),
  /** Nota lateral en el actor destino al recibir ("guarda msg"). */
  store: z.string().optional(),
  state: state.optional(),
  /** Fila separadora a todo lo ancho, sin flecha: `label` es el texto
   * ("— 60 s sin tráfico —", "cliente desconectado"). from/to se ignoran. */
  divider: z.boolean().optional(),
});

// ─────────────────────────── flow ───────────────────────────
const flowShape = z.object({
  id: z.string(),
  kind: z.enum(['start', 'end', 'process', 'decision', 'io', 'state', 'block']),
  label: z.string(),
  /** Posición opcional en rejilla; sin ella el layout decide (arriba→abajo). */
  x: z.number().optional(),
  y: z.number().optional(),
  initial: z.boolean().default(false),
  state: state.optional(),
});
const flowArrow = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  /** power = línea de potencia (gruesa) vs datos, en diagramas de bloques. */
  kind: z.enum(['flow', 'data', 'power']).default('flow'),
  state: state.optional(),
});

// ─────────── familias de redes (contrato: templates/viz-redes.md) ───────────
export const DEVICE_KINDS = ['host', 'laptop', 'phone', 'server', 'router', 'switch', 'dns', 'cloud', 'tracker'] as const;
const netDevice = z.object({
  id: z.string(),
  kind: z.enum(DEVICE_KINDS),
  label: z.string(),
  sub: z.string().optional(),
  x: z.number(),
  y: z.number(),
  state: state.optional(),
});
const netCable = z.object({ from: z.string(), to: z.string(), label: z.string().optional(), rate: z.string().optional(), delay: z.string().optional(), state: state.optional() });
const netPacket = z.object({ from: z.string(), to: z.string(), label: z.string().default(''), order: z.number().optional(), lost: z.boolean().default(false), state: state.optional() });
const netZone = z.object({ label: z.string(), devices: z.array(z.string()) });

const stSend = z.object({
  from: z.string(),
  to: z.string(),
  tStart: z.number(),
  tTrans: z.number().default(0),
  tProp: z.number(),
  label: z.string().optional(),
  kind: z.enum(['data', 'ack', 'ctrl']).default('data'),
  lost: z.boolean().default(false),
  state: state.optional(),
});
const stSpan = z.object({ column: z.string(), tStart: z.number(), tEnd: z.number(), label: z.string(), kind: z.enum(['rtt', 'timeout', 'trans', 'prop', 'queue']).default('rtt'), state: state.optional() });

export const CELL_STATES = ['acked', 'sent', 'usable', 'unusable', 'buffered', 'expected', 'received'] as const;
const slidingWindow = z.object({
  role: z.enum(['sender', 'receiver']),
  label: z.string(),
  base: z.number(),
  size: z.number(),
  seqSpace: z.number().optional(),
  cells: z.array(z.object({ n: z.number(), state: z.enum(CELL_STATES) })),
});

const pktField = z.object({ label: z.string(), bits: z.number().positive(), value: z.union([z.string(), z.number()]).optional(), state: state.optional() });
const pktLayer = z.object({
  label: z.string(),
  header: z.string().optional(),
  trailer: z.string().optional(),
  /** Aditivo: texto del bloque de datos más interno (default "M"). Sólo se lee de la primera capa. */
  payload: z.string().optional(),
  state: state.optional(),
});

const fsmState = z.object({ id: z.string(), label: z.string(), initial: z.boolean().optional(), final: z.boolean().optional(), x: z.number().optional(), y: z.number().optional(), state: state.optional() });
const fsmTransition = z.object({ from: z.string(), to: z.string(), event: z.string(), action: z.string().optional(), state: state.optional(), bend: z.number().optional() });

const step = z.object({
  note: z.string(),
  nodes: z.array(vizNode).default([]),
  highlight: z.array(z.string()).default([]),
  mode: z.string().optional(),
  links: z.array(vizLink).optional(),
  /** `circuit` */
  circuit: circuitSchema.optional(),
  expect: expectSchema.optional(),
  /** `xy-chart`: curvas de un paso. */
  series: z.array(xySeries).optional(),
  x: axis.optional(),
  y: axis.optional(),
  hlines: z.array(refLine).optional(),
  vlines: z.array(refLine).optional(),
  bands: z.array(z.object({ from: z.number(), to: z.number(), axis: z.enum(['x', 'y']).default('x'), label: z.string().optional() })).optional(),
  params: z.record(z.number()).optional(),
  /** `sequence`: actores (líneas de vida) y mensajes en orden temporal. */
  actors: z.array(z.object({ id: z.string(), label: z.string(), state: state.optional() })).optional(),
  msgs: z.array(seqMsg).optional(),
  /** `flow`: formas y flechas. */
  shapes: z.array(flowShape).optional(),
  arrows: z.array(flowArrow).optional(),
  /** `timeline`: carriles (procesos/hilos) y eventos/mensajes sobre ellos. */
  lanes: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  events: z.array(z.object({ lane: z.string(), tStart: z.number(), tEnd: z.number(), label: z.string(), state: state.optional() })).optional(),
  messages: z.array(z.object({ fromLane: z.string(), toLane: z.string(), tStart: z.number(), tEnd: z.number(), label: z.string().optional() })).optional(),
  /** `network-topology`: procesos y flujo de datos animado entre ellos. */
  processes: z.array(z.object({ id: z.string(), label: z.string(), state: state.optional() })).optional(),
  dataFlow: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().optional() })).optional(),
  /** `memory-layout` */
  blocks: z.array(z.object({ id: z.string(), label: z.string(), bytes: z.number(), offset: z.number(), state: state.optional() })).optional(),
  /** `net-scene` */
  devices: z.array(netDevice).optional(),
  cables: z.array(netCable).optional(),
  packets: z.array(netPacket).optional(),
  zones: z.array(netZone).optional(),
  /** `spacetime` */
  columns: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  time: z.object({ unit: z.enum(['ms', 'µs', 'μs', 'us', 'ns', 's']).default('ms'), max: z.number().positive(), ticks: z.array(z.number()).optional() }).optional(),
  sends: z.array(stSend).optional(),
  spans: z.array(stSpan).optional(),
  /** `window` */
  windows: z.array(slidingWindow).optional(),
  /** `packet` */
  fields: z.object({ width: z.number().int().positive().default(32), rows: z.array(z.array(pktField)) }).optional(),
  layers: z.array(pktLayer).optional(),
  /** `fsm` */
  states: z.array(fsmState).optional(),
  transitions: z.array(fsmTransition).optional(),
  /** Nota acumulada del paso. */
  caption: z.string().optional(),
});

export const visualizationSchema = z.object({
  type: z.enum(VISUALIZATION_TYPES),
  mode: z.string().optional(),
  /** Un solo paso sin controles: figura inline dentro de la prosa. */
  static: z.boolean().default(false),
  /** Título corto sobre la figura. */
  title: z.string().optional(),
  /** `circuit`: slider que cambia el valor de una fuente y re-resuelve en
   * vivo (estados de diodos, corrientes, potenciales). Usa el ÚLTIMO paso. */
  interactive: z.object({ part: z.string(), min: z.number(), max: z.number(), step: z.number().default(0.1), label: z.string().optional() }).optional(),
  /** `circuit`: modo práctica — el lector toca dos resistencias y el motor
   * dice si están en serie/paralelo y las funde, hasta Req entre `between`. */
  practice: z.object({ kind: z.literal('reduce'), between: z.tuple([z.string(), z.string()]) }).optional(),
  steps: z.array(step).min(1),
});

const formula = z.object({
  name: z.string(),
  /** KaTeX, sin delimitadores $. */
  tex: z.string(),
  // Nunca una fórmula sin su razonamiento: sin esto el build falla.
  reasoning: z.string().min(20, 'la fórmula necesita su razonamiento/cuándo se usa, no solo la notación'),
  /** "Sem4_IoTT-SignalRepr#18" */
  source: z.string().optional(),
});

export const metaSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['concept', 'method', 'lab']).default('concept'),
  unit: z.string(),
  prerequisites: z.array(z.string()).default([]),
  buildsOn: z.array(z.string()).default([]),
  usedBy: z.array(z.string()).default([]),
  formulas: z.array(formula).default([]),
  hasVisualization: z.boolean().default(false),
  visualizationType: z.enum(VISUALIZATION_TYPES).optional(),
  placeholder: z.boolean().default(false),
});

export const topicSchema = z.object({
  type: z.enum(['concept', 'method', 'lab']),
  title: z.string(),
  unit: z.string(),
  prerequisites: z.array(z.string()).default([]),
  buildsOn: z.array(z.string()).default([]),
  usedBy: z.array(z.string()).default([]),
  subtopics: z.array(z.string()).default([]),
  sourceSlides: z.array(z.string()).default([]),
  hasVisualization: z.boolean().default(false),
  visualizationType: z.enum(VISUALIZATION_TYPES).optional(),
  // Concepto indispensable que no aparece explícito en el material. Nunca inventar temas del curso.
  supportConcept: z.boolean().default(false),
  placeholder: z.boolean().default(false),
  status: z.enum(['pending', 'generated']).default('pending'),
});

export const knowledgeMapSchema = z.object({
  units: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      sourceFiles: z.array(z.string()).default([]),
      topics: z.array(z.string()).default([]),
    }),
  ),
  topics: z.record(topicSchema),
});

export type Meta = z.infer<typeof metaSchema>;
export type KnowledgeMap = z.infer<typeof knowledgeMapSchema>;
export type Topic = z.infer<typeof topicSchema>;
