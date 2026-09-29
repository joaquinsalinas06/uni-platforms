# Computación Paralela y Distribuida — plataforma de apoyo

Clonada de EDA-Platform (mismo stack, misma distribución de carpetas):
Astro 7 + React 19 + Tailwind v4 + KaTeX + CodeMirror. Adaptada para un curso
de conceptos/algoritmos/modelos formales en vez de estructuras de datos.

## Principio rector

Una única fuente de verdad: **`content/knowledge-map.json`**. Ningún agente
inventa contenido. Cada agente lee el knowledge map + el material fuente
(`raw-materials/UX/` — symlink a `../teoria/UX/`) y escribe **sólo** dentro
del alcance que el mapa le asigna.

Eso es lo que permite paralelizar sin que los agentes se pisen ni inventen temas.

## Comandos

```sh
pnpm dev      # servidor de desarrollo (o `astro dev --background`)
pnpm build    # falla si algún meta.yaml o frontmatter viola el schema
pnpm check    # coherencia knowledge-map ↔ carpetas ↔ referencias
pnpm test     # tests del layout de visualización
```

Siempre **pnpm**. Dev server en segundo plano: `astro dev --background`, y
`astro dev stop|status|logs`.

## Estructura

```
content/
  knowledge-map.json          ← fuente de verdad; SÓLO lo toca el agente de integración
  units/u{1,2,3}.md
  topics/<id>/
    meta.yaml                 ← interfaz de coordinación entre agentes
    theory.md                 ← 9 secciones fijas
    algorithms/<name>.md      ← subtema tipo algoritmo (p.ej. un colectivo MPI)
    models/<name>.md          ← subtema tipo modelo formal (p.ej. BSP, LogP)
  practica.md                 ← ÚNICA página de ejemplos y ejercicios de todo el curso
cpp/topics/<id>/              ← sólo si un subtema tiene código propio
cpp/practica/                 ← código de laboratorio del profesor (PDs/PD3/consolidado)
templates/                    ← lo que recibe cada subagente
raw-materials/ -> ../teoria/  ← PDFs sin procesar (apuntes + slides), por unidad
src/
  lib/schemas.ts              ← TODOS los schemas Zod. No duplicarlos en otro lado.
  content.config.ts           ← Content Collections
  components/                 ← CodeEditor, VisualizationCanvas, ExerciseBlock…
  visualizations/<family>/    ← xy-chart, dag, network-topology, timeline, memory-layout
scripts/check-knowledge-map.mjs
```

### Diferencias deliberadas con EDA-Platform

- **Sin `examples.md`/`exercises.md`/`mastery-check.md` por tema.** Una sola
  página consolidada (`content/practica.md` → `/practica`) para todo el
  curso, alimentada por el código de laboratorio del profesor
  (`PDs/PD3/consolidado/cpp/` → `cpp/practica/`) y por los ejercicios
  "Participación" embebidos en los PDFs que no quedaron ya resueltos dentro
  de un `theory.md`/`algorithm.md` concreto.
- **`operations/` → `algorithms/` + `models/`.** Este curso no tiene
  operaciones tipo insert/delete; tiene algoritmos concretos (PCAM, una
  reducción PRAM, un colectivo MPI) y modelos formales (PRAM, BSP, LogP).
  Ambos usan `kind: algorithm` en el frontmatter — la distinción es sólo de
  carpeta, el lector no necesita verla en el schema.
- **`weeks` → `units`.** 3 unidades grandes en vez de 8 semanas.
- **5 familias de visualización nuevas**, ninguna basada en árbol:
  `xy-chart` (curvas paramétricas: Amdahl, Gustafson, speedup/eficiencia vs
  p), `dag` (grafos de tarea/canal, span/work, árboles de recursión),
  `network-topology` (topologías de red, colectivos MPI animados), `timeline`
  (diagramas de tiempo: APRAM, LogP, bloqueante/no-bloqueante), `memory-layout`
  (tipos de datos derivados de MPI). Ver `src/visualizations/registry.ts` —
  ninguna está implementada todavía; cada una se registra ahí en cuanto su
  `layout.ts` + componente existan.

## Fases

| Fase | Qué | Paraleliza |
| --- | --- | --- |
| 0 | Ingesta de material → actualizar knowledge map | no, incremental por unidad |
| 1 | Scaffolding (hecho) | secuencial |
| 2 | Teoría + algoritmos/modelos por tema | **sí, 3 agentes de contenido, uno por unidad** |
| 3 | Visualizaciones | sí, 1 agente, por familia |
| 4 | Página de práctica consolidada | parte del agente de contenido de U3 |
| 5 | Integración + QA | secuencial, cierre |

## Cómo se procesa una unidad nueva

```
1. Leer raw-materials/UX/ — EMPEZAR por los apuntes (LaTeX compilado, más
   completos), después las slides para completar detalles y figuras. No
   asumir que ninguna transcripción externa (p.ej. PDs/PD3/consolidado/md/)
   ya capturó todo — es orientación, no sustituto de leer el PDF.
2. Actualizar content/knowledge-map.json — ACTUALIZAR, nunca reescribir.
   Un concepto indispensable que no aparezca explícito en el material va como
   supportConcept: true; jamás como tema inventado del curso.
3. Resumir al usuario lo entendido y ESPERAR confirmación.
4. Por cada tema pendiente, lanzar un subagente con:
     - el fragmento del material que le toca (PDFs + su porción del mapa)
     - su meta.yaml
     - templates/
     - la ruta exacta donde debe escribir
5. Agente de integración (secuencial): cross-links, huérfanos,
   status: generated en el mapa, pnpm check && pnpm build.
```

### Reglas para los subagentes en paralelo

- Cada agente escribe **sólo** en `content/topics/<id>/` y `cpp/topics/<id>/`
  (o, si le toca la práctica, también en `content/practica.md` y `cpp/practica/`).
- **Nadie** edita `knowledge-map.json` salvo el agente de integración.
- Dos temas relacionados (Amdahl depende de DAG) se generan igual en
  paralelo: cada uno **referencia** al otro por id, no lo reexplica.
- Las visualizaciones son props sobre el componente base, nunca un componente
  nuevo desde cero.

## Restricciones (no negociables)

- No inventar temas "típicos" que no estén en el material.
- No gamificación, no dashboards de tarjetas, no gradientes, no animación decorativa.
- El código nunca como bloque estático: siempre editor interactivo y progresivo.
- Nunca complejidad/fórmula sin su razonamiento (el schema lo exige: `reasoning` ≥ 20 chars).
- Nunca revelar la solución de un ejercicio antes de las pistas.

## Diseño

Manual técnico, igual que EDA-Platform, con paleta propia. **IBM Plex Sans
para leer, IBM Plex Mono para datos** (código, complejidad, ids, etiquetas
`.tag`). **Un solo acento** (`--accent`, aquí teal en vez del azul de
EDA-Platform) y sólo para lo que está ACTIVO: el paso actual, el nodo/proceso
que se visita, la sección donde vas. Nunca decorativo, nunca gradientes.

- Jerarquía por **tamaño y peso de fondo**, no por bordes.
- Tres columnas: nav del curso / contenido / riel con el índice de secciones.
- Cada bloque tiene su firma: el **código es siempre una losa oscura**, la
  visualización un panel con rejilla de puntos, el razonamiento de
  complejidad lleva barra de acento a la izquierda.

### Estados en las visualizaciones — vocabulario cerrado, sin cambios

Igual que EDA-Platform (ver `src/visualizations/canvas-types.ts`): siete
estados (`idle/active/marked/answer/shared/copied/muted`), `active` es el
ÚNICO que usa `--accent`. El profesor de este curso también usa color en
sus diapositivas para marcar cosas — traducir con `--marked` (delimitador)
y `--answer` (respuesta canónica), nunca con `--accent`.

**Si una visualización no representa bien algo, el arreglo vive en
`src/visualizations/` o en el contenido — jamás en un interruptor que apague
una familia entera** (ver el incidente documentado en el `CLAUDE.md` de
EDA-Platform § "Listas circulares de hermanos").

## MDX — diagramas a mitad de la explicación

Igual mecanismo que EDA-Platform: `.md` para el caso normal (un diagrama
arriba de todo, vía frontmatter `visualization:`), `.mdx` sólo cuando hace
falta más de un diagrama o uno a mitad de la prosa, importando
`../../../src/components/Visualization.astro` y pasándole el mismo shape de
`visualizationSchema` como prop JS.

## Pendiente

- Implementar las 5 familias de visualización (`src/visualizations/registry.ts`
  las tiene todas en `null`).
- Escribir `content/knowledge-map.json`, `content/units/*.md` y los 13 temas.
- Curar `cpp/practica/` desde `PDs/PD3/consolidado/cpp/` + los labs sueltos.
- Ejecutar C++ en el navegador: el editor es editable pero no corre (igual que EDA).

## Documentación de Astro

- [Rutas y páginas](https://docs.astro.build/en/guides/routing/)
- [Componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Islas de React](https://docs.astro.build/en/guides/framework-components/)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Estilos y Tailwind](https://docs.astro.build/en/guides/styling/)
