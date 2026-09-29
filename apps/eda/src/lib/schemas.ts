import { z } from 'astro/zod';
import { NODE_STATES } from '../visualizations/canvas-types.ts';

// Única fuente de verdad de los contratos. La importan: el build de Astro
// (src/content.config.ts, src/lib/structures.ts) y scripts/check-knowledge-map.mjs.
// No duplicar ninguno de estos schemas en otro archivo.

export const VISUALIZATION_TYPES = ['tree', 'graph', 'persistent', 'range-tree'] as const;

// Los distintos "modos" de layout dentro de una familia. `tree` y `layers`
// son de range-tree; los otros tres de persistent. hasVisualization/
// visualizationType no cambian — esto sólo afina cómo se posiciona.
export const VISUALIZATION_MODES = ['path-copying', 'version-tree', 'fat-node', 'tree', 'layers'] as const;

// El nodo de una visualización. TODO lo añadido aquí sobre {id, value,
// parent} es opcional: el frontmatter ya escrito (max-heapify, build-max-heap,
// union, binomial-link) sólo usa esos tres campos y sigue validando igual.
const vizNode = z.object({
  id: z.string(),
  value: z.union([z.string(), z.number()]),
  /** Nombre de variable mostrado arriba de la caja (p.ej. "p", "x") —
   * ver CanvasNode.tag. Opcional, no cambia nada de lo ya escrito. */
  tag: z.string().optional(),
  parent: z.string().nullable().default(null),
  state: z.enum(NODE_STATES).optional(),
  /** Sólo para un BST binario con UN hijo, donde el orden de hermanos no
   * revela el lado. En heaps y árboles multivía no se usa. */
  side: z.enum(['left', 'right']).optional(),
  /** Panel/versión al que pertenece (path copying: v0/v1; range-tree 2D: primary/secondary). */
  version: z.string().optional(),
  panel: z.string().optional(),
  /** Nodo gordo: registro de modificaciones, en orden. */
  fields: z
    .array(
      z.object({
        name: z.string(),
        value: z.union([z.string(), z.number()]),
        time: z.number().int().optional(),
      }),
    )
    .optional(),
  /** Este nodo representa un subárbol entero (p.ej. A/B/C de una rotación),
   * no una clave suelta — se dibuja como triángulo (familia `tree`). */
  collapsed: z.boolean().optional(),
  /** `false`: se posiciona bajo `parent` pero NO se dibuja esa arista —
   * para un padre que sólo guarda un puntero a un hijo cualquiera (el
   * resto enlazado por `links`), no uno por hijo. Default `true`. */
  edge: z.boolean().default(true),
});

const vizLink = z.object({
  from: z.string(),
  to: z.string(),
  kind: z.enum(['tree', 'shared', 'pointer']).default('tree'),
  label: z.string().optional(),
  /** Curvatura explícita (family `tree`; persistent/range-tree ya la
   * calculan solos). Para un par de punteros opuestos entre los mismos dos
   * nodos (izquierda de uno = derecha del otro) — sin esto se dibujan
   * exactamente encima, indistinguibles. Positivo/negativo = lado. */
  curve: z.number().optional(),
  /** UN par de punteros reales en direcciones opuestas entre los MISMOS dos
   * nodos (p.ej. `left`/`right` de una lista circular de hermanos) es UNA
   * arista con flecha en ambos extremos, no dos aristas superpuestas — así
   * se ve en la lista de hermanos de un montículo binomial/Fibonacci. Sólo
   * para `kind: pointer`. Default `false` (una sola punta, como siempre). */
  bidirectional: z.boolean().default(false),
});

const vizArray = z.object({
  id: z.string(),
  label: z.string().optional(),
  row: z.number().int().min(0),
  slot: z.enum(['left', 'right', 'full']).default('full'),
  cells: z.array(z.union([z.string(), z.number()])).min(1),
  states: z.array(z.enum(NODE_STATES)).optional(),
});

export const visualizationSchema = z.object({
  type: z.enum(VISUALIZATION_TYPES),
  /** default de todos los pasos; cada paso puede sobreescribirlo. */
  mode: z.enum(VISUALIZATION_MODES).optional(),
  steps: z
    .array(
      z.object({
        note: z.string(),
        // `nodes` pasa de requerido a con default: estrictamente más
        // permisivo que antes, así que nada que validaba deja de validar.
        nodes: z.array(vizNode).default([]),
        highlight: z.array(z.string()).default([]),
        mode: z.enum(VISUALIZATION_MODES).optional(),
        links: z.array(vizLink).optional(),
        /** Paneles de versión, en orden de izquierda a derecha (persistent: path-copying). */
        versions: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
        /** Paneles del 2D anidado (range-tree), colgados de `anchor`. */
        panels: z.array(z.object({ id: z.string(), label: z.string(), anchor: z.string().optional() })).optional(),
        /** Punteros entrantes que un split puede redirigir (fat-node). */
        ports: z.array(z.object({ id: z.string(), label: z.string().optional(), to: z.string() })).optional(),
        /** Arreglos en capas (layered range tree / fractional cascading). */
        arrays: z.array(vizArray).optional(),
        /** Si falta, se derivan por lower_bound — ver range-tree/layout.ts. */
        bridges: z
          .array(
            z.object({
              from: z.string(),
              fromIndex: z.number().int().min(0),
              to: z.string(),
              toIndex: z.number().int().min(0),
              active: z.boolean().default(false),
            }),
          )
          .optional(),
        /** La secuencia de Euler acumulada, la etiqueta `[l,r]` de una consulta, etc. */
        caption: z.string().optional(),
      }),
    )
    .min(1),
});

const complexityCase = z.object({
  // Sólo la cota que el profesor sí da es obligatoria. En este curso casi nunca
  // distingue mejor/promedio ni menciona espacio: dejar esos campos vacíos es
  // FIEL al material; rellenarlos sería inventar. La tabla muestra "no lo da".
  worst: z.string(),
  best: z.string().optional(),
  avg: z.string().optional(),
  space: z.string().optional(),
  // El brief prohíbe dar complejidad sin razonamiento: sin esto el build falla.
  reasoning: z.string().min(20, 'la complejidad necesita su razonamiento, no solo la notación'),
  /** Cita de dónde sale la cota: "Sem_1_Heaps_I-1.pdf#19". */
  source: z.string().optional(),
});

export const metaSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['structure', 'algorithm', 'concept']).default('structure'),
  week: z.string(),
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
  type: z.enum(['structure', 'algorithm', 'concept']),
  title: z.string(),
  week: z.string(),
  prerequisites: z.array(z.string()).default([]),
  buildsOn: z.array(z.string()).default([]),
  usedBy: z.array(z.string()).default([]),
  operations: z.array(z.string()).default([]),
  sourceSlides: z.array(z.string()).default([]),
  hasVisualization: z.boolean().default(false),
  visualizationType: z.enum(VISUALIZATION_TYPES).optional(),
  complexityStyleFromProfessor: z.string().optional(),
  // Concepto indispensable que no aparece explícito en las PPTs. Nunca inventar temas del curso.
  supportConcept: z.boolean().default(false),
  placeholder: z.boolean().default(false),
  status: z.enum(['pending', 'generated']).default('pending'),
});

export const knowledgeMapSchema = z.object({
  weeks: z.array(
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
