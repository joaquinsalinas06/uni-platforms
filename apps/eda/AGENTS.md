# CS3014 — Plataforma de Estructuras de Datos Avanzadas

## Principio rector

Una única fuente de verdad: **`content/knowledge-map.json`**. Ningún agente
inventa contenido. Cada agente lee el knowledge map + el material fuente
(`raw-materials/weekN/`) y escribe **sólo** dentro del alcance que el mapa le
asigna.

Eso es lo que permite paralelizar sin que los agentes se pisen ni inventen temas.

## Comandos

```sh
pnpm dev      # servidor de desarrollo (o `astro dev --background`)
pnpm build    # falla si algún meta.yaml o frontmatter viola el schema
pnpm check    # coherencia knowledge-map ↔ carpetas ↔ referencias
pnpm test     # tests del layout de visualización
```

Siempre **pnpm**. La config del proyecto sale de los generadores oficiales
(`create astro`, `astro add`); no escribir config a mano. Dev server en segundo
plano: `astro dev --background`, y `astro dev stop|status|logs`.

## Estructura

```
content/
  knowledge-map.json          ← fuente de verdad; SÓLO lo toca el agente de integración
  weeks/week-0X.md
  structures/<id>/
    meta.yaml                 ← interfaz de coordinación entre agentes
    theory.md                 ← 9 secciones fijas
    operations/<op>.md        ← 9 secciones fijas + visualización + cppSteps
    examples.md               ← mínimo / normal / límite
    exercises.md              ← niveles 1–6 con pistas progresivas
    mastery-check.md
cpp/structures/<id>/          ← step-1..N.cpp + full-implementation.cpp
templates/                    ← lo que recibe cada subagente
raw-materials/weekN/          ← PPTs/PDFs sin procesar
src/
  lib/schemas.ts              ← TODOS los schemas Zod. No duplicarlos en otro lado.
  content.config.ts           ← Content Collections
  components/                 ← CodeEditor, VisualizationCanvas, ExerciseBlock…
  visualizations/tree/        ← primera familia sobre VisualizationCanvas
scripts/check-knowledge-map.mjs
```

## Fases

| Fase | Qué | Paraleliza |
| --- | --- | --- |
| 0 | Ingesta de material → actualizar knowledge map | no, incremental por semana |
| 1 | Scaffolding (hecho) | secuencial |
| 2+3+5 | Teoría, C++ y ejercicios por estructura | **sí, 1 agente por estructura** |
| 4 | Visualizaciones | sí, por familia |
| 6 | Integración + QA | secuencial, cierre |

## Cómo se procesa una semana nueva

```
1. Leer raw-materials/weekN/ (md, pdf o pptx).
2. Actualizar content/knowledge-map.json — ACTUALIZAR, nunca reescribir.
   Un concepto indispensable que no aparezca en las PPTs va como
   supportConcept: true; jamás como tema inventado del curso.
3. Resumir al usuario lo entendido y ESPERAR confirmación.
4. Por cada estructura pendiente, lanzar un subagente en paralelo con:
     - el fragmento del material que le toca
     - su meta.yaml
     - templates/
     - la ruta exacta donde debe escribir
5. Agente de integración (secuencial): cross-links, huérfanos,
   status: generated en el mapa, pnpm check && pnpm build.
```

### Reglas para los subagentes en paralelo

- Cada agente escribe **sólo** en `content/structures/<id>/` y `cpp/structures/<id>/`.
- **Nadie** edita `knowledge-map.json` salvo el agente de integración.
- Dos estructuras relacionadas (AVL depende de BST) se generan igual en
  paralelo: cada una **referencia** a la otra por id, no la reexplica.
- Las visualizaciones son props sobre el componente base, nunca un componente
  nuevo desde cero.

## Restricciones (del brief, no negociables)

- No inventar estructuras "típicas" que no estén en el material.
- No gamificación, no dashboards de tarjetas, no gradientes, no animación decorativa.
- El código nunca como bloque estático: siempre editor interactivo y progresivo.
- Nunca complejidad sin su razonamiento (el schema lo exige: `reasoning` ≥ 20 chars).
- Nunca revelar la solución de un ejercicio antes de las pistas.

## Diseño

Manual técnico. **IBM Plex Sans para leer, IBM Plex Mono para datos** (código,
complejidad, ids, contadores, etiquetas `.tag`). **Un solo azul** (`--accent`) y
sólo para lo que está ACTIVO: el paso actual, el nodo que se visita, la sección
donde vas, el nivel de un ejercicio. Nunca decorativo, nunca gradientes.

- Jerarquía por **tamaño y peso de fondo**, no por bordes: h1 hasta 52px, h2 24px
  con número de sección en mono azul (contador CSS — **los títulos del markdown
  van sin numerar**), cuerpo 17px, metadatos 11px.
- Tres columnas: nav del curso / contenido / riel con el índice de secciones
  (resalta en azul dónde vas) y metadatos. La prosa se limita a 72ch; el código,
  las tablas y las visualizaciones usan todo el ancho.
- Cada bloque tiene su firma: el **código es siempre una losa oscura** en los dos
  temas, la visualización un panel con rejilla de puntos, el razonamiento de
  complejidad y las pistas llevan barra azul a la izquierda.
- Movimiento nativo, sin librerías: view transitions de Astro,
  `animation-timeline: view()` (`.reveal`, `.draw`), entrada escalonada
  (`.stagger`), interpolación de nodos en las visualizaciones, y la visualización
  **se reproduce sola** la primera vez que entra en pantalla.

### Estados en las visualizaciones — tres colores, cada uno un estado

`--accent` marca **únicamente lo ACTIVO**: el nodo que la operación toca en el
paso actual. El profesor usa amarillo y rojo en sus diapositivas (delimitador
/ respuesta) — nosotros traducimos esos dos con sus propios colores
(`--marked` / `--answer`), nunca con `--accent`, y ninguno de los dos compite
con el azul por esa lectura. El resto de estados sigue distinguiéndose sólo
por **relleno, contorno, opacidad y trazo**, sin tono. El vocabulario es
cerrado — siete estados, definidos en `src/visualizations/canvas-types.ts`
y verificados por `canvas-types.test.ts`:

| estado | relleno | contorno | opacidad | significa |
| --- | --- | --- | --- | --- |
| `idle` | `--paper` | `--rule` fino | 1 | estructura en reposo |
| `active` | `--accent` | `--accent` | 1 | **lo que se toca en este paso — único uso del azul** |
| `marked` | `--marked` (ámbar) | `--marked-ink` + doble contorno | 1 | delimitador / frontera (el amarillo del profesor) |
| `answer` | `--answer` (carmesí) | `--answer` | 1 | respuesta canónica (el rojo del profesor) |
| `shared` | `--sunken` | `--rule` discontinuo | 0.75 | compartido con la versión anterior, no se tocó |
| `copied` | `--paper` | `--ink` grueso | 1 | nodo nuevo de esta versión |
| `muted` | `--fill` | `--rule` discontinuo | 0.45 | descartado / podado |

`--marked`/`--marked-ink` y `--answer`/`--answer-ink` están definidos en
`src/styles/global.css` para claro y oscuro, verificados AA contra su propio
`-ink` (no contra `--ink`: son colores de acento, su texto es siempre oscuro
o siempre claro, no el texto normal del tema).

Aristas: `tree` sólida; `shared` discontinua y curvada (cruza entre versiones);
`pointer` sólida con punta de flecha. Una arista sólo se pinta de azul cuando
une algo activo.

**Ámbar = delimitador. Carmesí = respuesta. Discontinuo = no es tuyo o ya no
cuenta. Opacidad baja = descartado. Azul = ahora — y nada más compite con él.**

Es fiel al material, no una concesión: el profesor ya dibuja los puentes del
fractional cascading con línea punteada, no con color. Como el estado se
codifica en el trazo, cada nodo lleva un `<title>` con su estado en palabras
("hoja 4 — delimitador") para quien usa lector de pantalla.

### Listas circulares de hermanos (`child`/`sibling` con anillo `left`/`right`)

Fibonacci heap y montículo binomial no guardan un puntero por hijo: el padre
apunta a UN hijo cualquiera (`child`) y el resto se alcanza por un anillo
doblemente enlazado (`left`/`right`) entre hermanos. Esto se dibuja con
`edge: false` en cada hijo (se posiciona bajo el padre pero no se traza esa
arista) más un `links: [...]` explícito con `kind: pointer` para el puntero
real — ver `src/lib/schemas.ts` § `vizNode.edge` / `vizLink`.

**Un par de punteros opuestos entre los MISMOS dos nodos es UNA arista, no
dos.** Cuando `A.right = B` y `B.left = A` (el caso normal: dos hermanos
adyacentes), usa `{ from: A, to: B, kind: pointer, label: "R,L",
bidirectional: true }` — una sola línea con flecha en ambos extremos, nunca
dos líneas superpuestas en direcciones opuestas. `bidirectional` sólo es
seguro cuando **ambos lados del par están completos**: o los dos aportan la
misma etiqueta completa (`"R,L"` + `"R,L"`, un anillo de 2 sin tocar), o cada
lado aporta exactamente una letra y son complementarias (`"R"` + `"L"`). Si
un lado tiene `"R,L"` y el otro sólo `"L"` (un nodo cuyo propio `right` y
`left` todavía coinciden, mientras el otro nodo YA movió uno de los suyos a
un tercer nodo) **no fusiones** — son hechos distintos a mitad de una cirugía
de punteros (ver `cut.mdx`/`insert.mdx`/`union.mdx` línea por línea para el
patrón). Fusionar ahí inventa una mutualidad que el struct no tiene en ese
instante exacto.

Entre dos hermanos (misma fila del layout) el canvas siempre curva la arista
`pointer` hacia ABAJO, nunca hacia arriba — así el arco de "vuelta" de un
anillo de 3+ nodos (último hermano → primero) no atraviesa la fila del padre
ni su propio puntero `child`. No hace falta declarar `curve` a mano para
esto.

**Si un diagrama de anillo no se ve claro, arréglalo — nunca lo apagues.**
Ya pasó una vez (semana 6→7, PR de un colaborador): en vez de corregir la
geometría de las aristas `pointer` de Fibonacci heap, alguien apagó el
render de la familia `tree` completa para 5 estructuras enteras
(`Visualization.astro`, una lista `disabledForWeekOneOrTwo`) — silenciando
también binary-heap, binomial-heap, binomial-tree y potential-method, que ni
siquiera tenían el problema. Si una familia de visualización no representa
bien algo, el arreglo vive en `src/visualizations/` o en el `links`/`nodes`
del contenido — jamás en un interruptor que apague contenido ya escrito y
validado. Ver también CONTENT-AGENT-RULES.md § "Si la forma de `nodes` no te
alcanza".

## MDX — diagramas a mitad de la explicación

`content/structures/<id>/**/*.md` y `**/*.mdx` conviven en la misma colección
`docs`; el `id` se calcula igual (sin extensión), así que nada del resto del
pipeline distingue entre uno y otro.

- Un tema (teoría u operación) que no necesita diagramas intercalados sigue
  en `.md` — es el caso normal, no cambies nada.
- Un tema que sí necesita que un diagrama aparezca a mitad del texto (no sólo
  arriba de todo) se escribe en `.mdx`. En la cabecera del archivo, después
  del frontmatter, importa el componente y úsalo donde corresponda:

  ```mdx
  ---
  kind: theory
  title: "..."
  ---
  import Visualization from '../../../src/components/Visualization.astro';

  ## Intuición
  ... prosa ...

  <Visualization viz={{ type: 'tree', steps: [...] }} />

  ## Por qué funciona
  ... más prosa, después del diagrama ...
  ```

  El objeto `viz` que le pasas a `<Visualization/>` es exactamente el mismo
  shape de `visualizationSchema` (`src/lib/schemas.ts`) que ya usas en el
  frontmatter — sólo que aquí es una prop de React/Astro, no YAML, así que
  usa comillas dobles y comas de JS, no YAML.
- El frontmatter `visualization` (YAML, como siempre) sigue existiendo y
  sigue funcionando igual en `.md` y `.mdx` — la página lo sigue pintando
  arriba del contenido. Úsalo cuando un solo diagrama al principio basta.
  Sólo pasa a `.mdx` con imports inline cuando de verdad necesitas más de un
  diagrama, o uno a mitad de la explicación.
- `theory` ahora también acepta `visualization` en el frontmatter (antes sólo
  `operation` lo tenía) — los 19 temas con `operations: []` en el knowledge
  map ya pueden tener diagrama.

## Pendiente

- Borrar `demo-bst` y `week-00` cuando entre la primera estructura real.
- Familia de visualización `graph` (`persistent` y `range-tree` ya están
  implementadas — ver `src/visualizations/{persistent,range-tree}/`).
- Ejecutar C++ en el navegador: hoy el editor es editable pero no corre.

## Documentación de Astro

- [Rutas y páginas](https://docs.astro.build/en/guides/routing/)
- [Componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Islas de React](https://docs.astro.build/en/guides/framework-components/)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Estilos y Tailwind](https://docs.astro.build/en/guides/styling/)
