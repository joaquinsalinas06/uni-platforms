import { z } from 'astro/zod';
import { NODE_STATES } from '../visualizations/canvas-types.ts';

// Única fuente de verdad de los contratos. La importan: el build de Astro
// (src/content.config.ts, src/lib/topics.ts) y scripts/check-knowledge-map.mjs.
// No duplicar ninguno de estos schemas en otro archivo.

export const VISUALIZATION_TYPES = ['xy-chart', 'dag', 'network-topology', 'timeline', 'memory-layout'] as const;

// El nodo de una visualización. Reusado tal cual por `dag` y por
// `network-topology` (ambas familias son, en el fondo, nodos + aristas).
const vizNode = z.object({
  id: z.string(),
  value: z.union([z.string(), z.number()]),
  /** Nombre de variable mostrado arriba de la caja (p.ej. "p0", "T1"). */
  tag: z.string().optional(),
  parent: z.string().nullable().default(null),
  state: z.enum(NODE_STATES).optional(),
});

const vizLink = z.object({
  from: z.string(),
  to: z.string(),
  kind: z.enum(['tree', 'shared', 'pointer']).default('tree'),
  label: z.string().optional(),
  curve: z.number().optional(),
  bidirectional: z.boolean().default(false),
});

export const visualizationSchema = z.object({
  type: z.enum(VISUALIZATION_TYPES),
  /** default de todos los pasos; cada paso puede sobreescribirlo. Las 5
   * familias de este curso son heterogéneas (a diferencia de las 3 de EDA,
   * todas basadas en árbol) — `mode` queda como string libre, cada
   * layout.ts de familia valida sus propios modos permitidos. */
  mode: z.string().optional(),
  steps: z
    .array(
      z.object({
        note: z.string(),
        nodes: z.array(vizNode).default([]),
        highlight: z.array(z.string()).default([]),
        mode: z.string().optional(),
        links: z.array(vizLink).optional(),
        /** `xy-chart`: curvas y parámetros de un paso (p.ej. un valor de f_s
         * o p en Amdahl/Gustafson). */
        series: z
          .array(z.object({ id: z.string(), label: z.string(), points: z.array(z.tuple([z.number(), z.number()])) }))
          .optional(),
        params: z.record(z.number()).optional(),
        /** `timeline`: carriles (procesos/hilos) y eventos/mensajes sobre ellos. */
        lanes: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
        events: z
          .array(z.object({ lane: z.string(), tStart: z.number(), tEnd: z.number(), label: z.string(), state: z.enum(NODE_STATES).optional() }))
          .optional(),
        messages: z
          .array(z.object({ fromLane: z.string(), toLane: z.string(), tStart: z.number(), tEnd: z.number(), label: z.string().optional() }))
          .optional(),
        /** `network-topology`: procesos, y flujo de datos animado entre ellos
         * (broadcast/scatter/gather/reduce). */
        processes: z.array(z.object({ id: z.string(), label: z.string(), state: z.enum(NODE_STATES).optional() })).optional(),
        dataFlow: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().optional() })).optional(),
        /** `memory-layout`: tira de bytes contigua/con stride/con padding. */
        blocks: z
          .array(z.object({ id: z.string(), label: z.string(), bytes: z.number(), offset: z.number(), state: z.enum(NODE_STATES).optional() }))
          .optional(),
        /** La nota acumulada de un paso (p.ej. el valor parcial de una reducción). */
        caption: z.string().optional(),
      }),
    )
    .min(1),
});

const complexityCase = z.object({
  // Sólo la cota que el profesor sí da es obligatoria — no inventar mejor/
  // promedio/espacio si el material no los distingue.
  worst: z.string(),
  best: z.string().optional(),
  avg: z.string().optional(),
  space: z.string().optional(),
  // El brief prohíbe dar complejidad sin razonamiento: sin esto el build falla.
  reasoning: z.string().min(20, 'la complejidad necesita su razonamiento, no solo la notación'),
  /** Cita de dónde sale la cota: "U2.1-...-apuntes.pdf#12". */
  source: z.string().optional(),
});

export const metaSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['concept', 'algorithm', 'model']).default('concept'),
  unit: z.string(),
  prerequisites: z.array(z.string()).default([]),
  buildsOn: z.array(z.string()).default([]),
  usedBy: z.array(z.string()).default([]),
  complexity: z.record(complexityCase).default({}),
  professorAnalysisStyle: z.string().optional(),
  hasVisualization: z.boolean().default(false),
  visualizationType: z.enum(VISUALIZATION_TYPES).optional(),
  placeholder: z.boolean().default(false),
});

export const topicSchema = z.object({
  type: z.enum(['concept', 'algorithm', 'model']),
  title: z.string(),
  unit: z.string(),
  prerequisites: z.array(z.string()).default([]),
  buildsOn: z.array(z.string()).default([]),
  usedBy: z.array(z.string()).default([]),
  subtopics: z.array(z.string()).default([]),
  sourceSlides: z.array(z.string()).default([]),
  hasVisualization: z.boolean().default(false),
  visualizationType: z.enum(VISUALIZATION_TYPES).optional(),
  complexityStyleFromProfessor: z.string().optional(),
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
