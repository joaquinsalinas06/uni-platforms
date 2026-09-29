import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { visualizationSchema } from './lib/schemas';

const theory = z.object({
  kind: z.literal('theory'),
  title: z.string(),
  visualization: visualizationSchema.optional(),
});

const algorithm = z.object({
  kind: z.literal('algorithm'),
  title: z.string(),
  order: z.number().int(),
  /** Archivos en cpp/topics/<id>/, cuando el tema lo amerita (p.ej. un
   * colectivo MPI con su propio ejemplo en C++). */
  cppSteps: z.array(z.string()).default([]),
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
    schema: z.discriminatedUnion('kind', [theory, algorithm]),
  }),
  units: defineCollection({
    loader: glob({ pattern: '*.md', base: './content/units' }),
    schema: z.object({
      title: z.string(),
      summary: z.string(),
      sourceFiles: z.array(z.string()).default([]),
    }),
  }),
  // Página única de ejemplos y ejercicios para todo el curso — ver
  // templates/practica.md. No hay examples.md/exercises.md por tema.
  practica: defineCollection({
    loader: glob({ pattern: 'practica.md', base: './content' }),
    schema: z.object({
      title: z.string(),
      items: z
        .array(
          z.object({
            level: z.number().int().min(1).max(6),
            statement: z.string(),
            hints: z.array(z.string()).min(1, 'un ejercicio sin pistas no puede revelar solución'),
            solution: z.string().optional(),
            cppFile: z.string().optional(),
          }),
        )
        .default([]),
    }),
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
      pattern: '**/*.md',
      base: './content/evaluaciones',
      // id = "pd1/2026-i", "parciales/2025-ii-s01", etc.
      generateId: ({ entry }) => entry.replace(/\.md$/, ''),
    }),
    schema: z.object({
      title: z.string(),
      category: z.enum(['pd1', 'pd2', 'pd3', 'parciales']),
      categoryLabel: z.string(),
      order: z.number().int().default(0),
    }),
  }),
};
