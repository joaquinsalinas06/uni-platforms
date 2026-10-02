import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { visualizationSchema } from './lib/schemas';

const theory = z.object({
  kind: z.literal('theory'),
  title: z.string(),
  visualization: visualizationSchema.optional(),
});

// Un subtema: content/topics/<id>/subtopics/<name>.md(x). Sus `##` son los
// sub-subtemas (índice en el SectionRail).
const subtopic = z.object({
  kind: z.literal('subtopic'),
  title: z.string(),
  order: z.number().int(),
  visualization: visualizationSchema.optional(),
});

export const collections = {
  // Todo el markdown de un tema vive bajo content/topics/<id>/.
  // El id de la entrada empieza siempre por el id del tema.
  docs: defineCollection({
    loader: glob({
      pattern: '**/*.{md,mdx}',
      base: './content/topics',
      // id = ruta sin extensión: "mpi-intro/theory", "pram-models/models/logp".
      // .mdx es para el tema puntual que necesita diagramas intercalados a
      // mitad de la explicación; el resto sigue en .md.
      generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
    }),
    schema: z.discriminatedUnion('kind', [theory, subtopic]),
  }),
  units: defineCollection({
    loader: glob({ pattern: '*.md', base: './content/units' }),
    schema: z.object({
      title: z.string(),
      summary: z.string(),
      sourceFiles: z.array(z.string()).default([]),
    }),
  }),
  // Página única de ejemplos y ejercicios para todo el curso: content/practica.mdx.
  // El cuerpo MDX ES el contenido (## por semana, ExerciseBlock con la solución
  // como hijos, ver templates/exercise-solution.md). No hay exercises.md por tema.
  practica: defineCollection({
    loader: glob({ pattern: 'practica.mdx', base: './content' }),
    schema: z.object({ title: z.string() }),
  }),
  // Formulario de referencia rápida: todas las fórmulas del curso en una
  // sola página, agrupadas por unidad. El cuerpo del markdown ES el
  // contenido (como units/), no hay campos estructurados más allá del título.
  formulario: defineCollection({
    loader: glob({ pattern: 'formulario.md', base: './content' }),
    schema: z.object({
      title: z.string(),
    }),
  }),
  // Exámenes reales del curso (PDs, parciales, ejercicios de repaso), con
  // enunciado + solución completa por pregunta — separado de practica.md
  // porque acá la fuente es el examen real del profesor, no material de
  // laboratorio. Un archivo por examen/semestre; el cuerpo markdown ES el
  // contenido (pregunta tras pregunta), no hay schema estructurado por
  // pregunta — cada examen trae su propia forma (tablas, figuras, código).
  evaluaciones: defineCollection({
    loader: glob({
      pattern: '**/*.{md,mdx}',
      base: './content/evaluaciones',
      // id = "pd1/2026-i", "parciales/2025-ii-s01", etc.
      generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
    }),
    schema: z.object({
      title: z.string(),
      category: z.enum(['parciales', 'laboratorio']),
      categoryLabel: z.string(),
      order: z.number().int().default(0),
      /** PDF original del examen, servido desde public/ (p. ej.
       * "/evaluaciones/parciales/2025-ii.pdf"): botón de descarga. */
      pdf: z.string().optional(),
      /** De dónde sale el examen, en una línea ("Examen Parcial CS4054, 2025-II"). */
      source: z.string().optional(),
    }),
  }),
};
