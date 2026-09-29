import { z } from 'astro/zod';
import { NODE_STATES } from './canvas-types';

// Única fuente de verdad de los contratos visuales y curriculares.
// Soporta todas las familias de EDA, CPD, IoT y futuros cursos.

export const ALL_VISUALIZATION_TYPES = [
  'tree',
  'graph',
  'persistent',
  'range-tree',
  'circuit',
  'xy-chart',
  'sequence',
  'flow',
  'dag',
  'network-topology',
  'timeline',
  'memory-layout',
] as const;

export const VISUALIZATION_TYPES = ALL_VISUALIZATION_TYPES;
export type VisualizationType = (typeof ALL_VISUALIZATION_TYPES)[number];

export const VISUALIZATION_MODES = [
  'path-copying',
  'version-tree',
  'fat-node',
  'tree',
  'layers',
] as const;

export const TONES = [
  'series',
  'parallel',
  'bridge',
  'si',
  'ge',
  'mesh1',
  'mesh2',
  'mesh3',
  'mesh4',
  'current',
] as const;

export const tone = z.enum(TONES);
export const state = z.enum(NODE_STATES);

// Nodo de visualización universal
export const vizNode = z.object({
  id: z.string(),
  label: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  tag: z.string().optional(),
  parent: z.string().nullable().optional(),
  shape: z.enum(['rect', 'rounded', 'circle', 'ellipse', 'diamond', 'parallelogram', 'box', 'cell', 'record', 'port', 'subtree']).optional(),
  state: state.optional(),
  tone: tone.optional(),
  lines: z.array(z.string()).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  fields: z.record(z.union([z.string(), z.number()])).optional(),
  incoming: z.array(z.string()).optional(),
  copyFrom: z.string().optional(),
});

// Arista universal
export const vizEdge = z.object({
  from: z.string(),
  to: z.string(),
  kind: z.enum(['tree', 'shared', 'pointer']).optional(),
  state: z.enum(['idle', 'active', 'marked', 'answer', 'muted']).optional(),
  label: z.string().optional(),
  tone: tone.optional(),
  flow: z.boolean().optional(),
  curve: z.number().optional(),
  bidirectional: z.boolean().default(false),
});

// Grupo de nodos
export const vizGroup = z.object({
  id: z.string(),
  label: z.string().optional(),
  nodes: z.array(z.string()),
  tone: tone.optional(),
});

// Texto flotante
export const vizText = z.object({
  x: z.number(),
  y: z.number(),
  text: z.string(),
  tone: tone.optional(),
  fontSize: z.number().optional(),
});

// Paso interactivo
export const vizStep = z.object({
  title: z.string().optional(),
  note: z.string().optional(),
  highlight: z.array(z.string()).default([]),
  nodes: z.array(vizNode).default([]),
  edges: z.array(vizEdge).default([]),
  groups: z.array(vizGroup).default([]),
  texts: z.array(vizText).default([]),
  structures: z.record(z.any()).optional(),
});

// Esquemas específicos por familia
export const circuitComponentSchema = z.object({
  id: z.string(),
  type: z.enum(['R', 'VS', 'IS', 'D', 'LED', 'SW', 'C', 'L', 'NODE', 'GND']),
  value: z.union([z.number(), z.string()]).optional(),
  nodes: z.array(z.string()),
  tone: tone.optional(),
  label: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  rotation: z.number().optional(),
});

export const circuitSchema = z.object({
  type: z.literal('circuit'),
  components: z.array(circuitComponentSchema).optional(),
  steps: z.array(vizStep).optional(),
  interactive: z.any().optional(),
  practice: z.any().optional(),
  title: z.string().optional(),
  static: z.boolean().optional(),
  minScale: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const baseVizSchema = z.object({
  type: z.enum(ALL_VISUALIZATION_TYPES),
  mode: z.enum(VISUALIZATION_MODES).optional(),
  title: z.string().optional(),
  steps: z.array(vizStep).default([]),
  static: z.boolean().optional(),
  minScale: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const visualizationSchema = z.union([circuitSchema, baseVizSchema]);
export type VisualizationConfig = z.infer<typeof visualizationSchema>;

// Contratos Curriculares y Metadatos de Cursos
export const formulaSchema = z.object({
  name: z.string(),
  tex: z.string(),
  reasoning: z.string().default(''),
  source: z.string().optional(),
});

export const metaSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  type: z.enum(['concept', 'method', 'lab']).default('concept'),
  unit: z.string(),
  order: z.number().optional(),
  summary: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  buildsOn: z.array(z.string()).default([]),
  usedBy: z.array(z.string()).default([]),
  formulas: z.array(formulaSchema).default([]),
  hasVisualization: z.boolean().default(false),
  visualizationType: z.enum(VISUALIZATION_TYPES).optional(),
  placeholder: z.boolean().default(false),
});

export const topicSchema = z.object({
  type: z.enum(['concept', 'method', 'lab']).default('concept'),
  title: z.string(),
  unit: z.string(),
  prerequisites: z.array(z.string()).default([]),
  buildsOn: z.array(z.string()).default([]),
  usedBy: z.array(z.string()).default([]),
  subtopics: z.array(z.string()).default([]),
  sourceSlides: z.array(z.string()).default([]),
  hasVisualization: z.boolean().default(false),
  visualizationType: z.enum(VISUALIZATION_TYPES).optional(),
  supportConcept: z.boolean().default(false),
  placeholder: z.boolean().default(false),
  status: z.enum(['pending', 'generated']).default('pending'),
});

export const knowledgeMapSchema = z.object({
  course: z.string().optional(),
  code: z.string().optional(),
  units: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      sourceFiles: z.array(z.string()).default([]),
      topics: z.array(z.string()).default([]),
    }),
  ),
  topics: z.record(topicSchema).default({}),
});

export type Meta = z.infer<typeof metaSchema>;
export type KnowledgeMap = z.infer<typeof knowledgeMapSchema>;
export type Topic = z.infer<typeof topicSchema>;
