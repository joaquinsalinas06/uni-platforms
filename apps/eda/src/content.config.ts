import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { visualizationSchema } from './lib/schemas';

const theory = z.object({
  kind: z.literal('theory'),
  title: z.string(),
  visualization: visualizationSchema.optional(),
});

const operation = z.object({
  kind: z.literal('operation'),
  title: z.string(),
  order: z.number().int(),
  /** Archivos en cpp/structures/<id>/, en orden progresivo: nodo → implementación completa. */
  cppSteps: z.array(z.string()).default([]),
  visualization: visualizationSchema.optional(),
});

const examples = z.object({
  kind: z.literal('examples'),
  title: z.string(),
});

const exercises = z.object({
  kind: z.literal('exercises'),
  title: z.string(),
  items: z
    .array(
      z.object({
        level: z.number().int().min(1).max(6),
        statement: z.string(),
        // El brief prohíbe revelar la solución antes de las pistas progresivas.
        hints: z.array(z.string()).min(1, 'un ejercicio sin pistas no puede revelar solución'),
        solution: z.string().optional(),
      }),
    )
    .default([]),
});

const mastery = z.object({
  kind: z.literal('mastery'),
  title: z.string(),
  canExplain: z.array(z.string()).default([]),
  canDo: z.array(z.string()).default([]),
});

export const collections = {
  // Todo el markdown de una estructura vive bajo content/structures/<id>/.
  // El id de la entrada empieza siempre por el id de la estructura.
  docs: defineCollection({
    loader: glob({
      pattern: '**/*.{md,mdx}',
      base: './content/structures',
      // id = ruta sin extensión: "demo-bst/theory", "demo-bst/operations/insert".
      // .mdx es para el tema puntual que necesita diagramas intercalados a
      // mitad de la explicación (ver AGENTS.md § MDX); el resto sigue en .md.
      generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
    }),
    schema: z.discriminatedUnion('kind', [theory, operation, examples, exercises, mastery]),
  }),
  weeks: defineCollection({
    loader: glob({ pattern: '*.md', base: './content/weeks' }),
    schema: z.object({
      title: z.string(),
      summary: z.string(),
      sourceFiles: z.array(z.string()).default([]),
    }),
  }),
};
