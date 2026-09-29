# Handoff — plataforma y visualizaciones

Este documento es para el agente que trabaja **la plataforma**. El contenido del
curso (teoría, C++, ejercicios) lo genera otro agente en el worktree principal.
Trabajamos en paralelo sobre el mismo repo, así que lo primero es el reparto.

## Reparto de territorio — no negociable

| Zona | Dueño | Puedes |
| --- | --- | --- |
| `src/**` (componentes, layouts, estilos, visualizaciones, páginas) | **tú** | escribir |
| `astro.config.mjs`, `package.json`, `tailwind`, config en general | **tú** | escribir |
| `content/knowledge-map.json` | agente de contenido | **sólo leer** |
| `content/structures/**`, `cpp/**` | agente de contenido | **sólo leer** |
| `content/analysis/**` | agente de contenido | **sólo leer** — es tu documentación de referencia |
| `src/lib/schemas.ts`, `src/content.config.ts` | compartido | **sólo con aviso** (ver abajo) |
| `templates/**`, `AGENTS.md` | agente de contenido | **sólo leer** |

`schemas.ts` y `content.config.ts` son la frontera entre los dos: si necesitas un
campo nuevo en el frontmatter (por ejemplo para una visualización de tipo
`persistent`), **anótalo en la sección "Cambios de contrato solicitados" al final
de este archivo** en vez de cambiarlo por tu cuenta. El contenido ya escrito
tendría que regenerarse si cambias un campo obligatorio.

## Arrancar

El worktree ya existe y está en marcha:

```sh
cd /Users/joaquins/uni/26-2/eda/EDA-Platform-design   # rama `design`
pnpm install && pnpm dev
```

`pnpm build`, `pnpm check` y `pnpm test` deben pasar antes de cada commit.

**Sincronización con el contenido**: el agente de contenido trabaja en `master` y va
generando temas continuamente. Haz `git merge master` cada tanto para tener contenido
real con el que probar tus visualizaciones — no te quedes trabajando contra un árbol
de ejemplo. Al final, `master` fusiona `design`.

**Aviso de conflicto**: este archivo (`HANDOFF-DESIGN.md`) lo edito yo en `master` para
añadir peticiones a la sección "Cambios de contrato solicitados". Si tú también lo
editas en `design`, habrá conflicto. Sugerencia: tú no lo toques; si necesitas
responderme algo, deja un `HANDOFF-DESIGN-REPLY.md` aparte.

## Qué hay ya construido (no lo rehagas)

- **Diseño "Manual técnico"** ya definido y aplicado: IBM Plex Sans para leer, IBM
  Plex Mono para datos, un solo azul (`--accent`) reservado a lo **activo**, jerarquía
  por tamaño y peso de fondo en vez de bordes. Los tokens están en
  `src/styles/global.css`. La descripción completa está en `AGENTS.md` § Diseño.
  **Respeta esa dirección**: nada de gradientes, nada de decorativo, el color sólo
  marca estado.
- `VisualizationCanvas.tsx` — la base compartida de todas las familias. Ver abajo.
- `CodeEditor.tsx`, `ExerciseBlock.tsx`, `ComplexityTable.astro`, `SectionRail.astro`,
  `PrerequisiteBanner.astro`, `MasteryChecklist.astro`, `KnowledgeMapNav.astro`.
- Layout de tres columnas, modo claro/oscuro, view transitions, animaciones
  scroll-driven nativas (`.reveal`, `.draw`, `.stagger`).
- `remark-math`, `rehype-katex` y `katex` **ya están instalados pero SIN configurar**
  (tarea 1).

## Las tareas, en orden

### 1. Renderizar matemáticas — urgente, bloquea contenido que ya está aterrizando

El curso entero es análisis amortizado. Ahora mismo las fórmulas salen como texto
plano o metidas en bloques de código.

**Qué hacer**: configurar `remark-math` + `rehype-katex` en `astro.config.mjs`
(`markdown: { remarkPlugins, rehypePlugins }`), importar el CSS de KaTeX, y ajustar
los estilos para que las fórmulas no desentonen con el resto (KaTeX trae su propia
tipografía; decide si la dejas o la alineas a Plex).

**Dónde ver qué tipo de matemáticas hay que soportar** — esto no es teórico, son las
fórmulas reales del curso:
- `content/analysis/week-01-sem-1-heaps-i.md` líneas ~66-78 — sumatorias con techos
  y pisos: `T(n) ≤ Σ_{h=0}^{⌊lg n⌋} ⌈n/2^(h+1)⌉ · O(h)`, series geométricas.
- `content/analysis/week-02-...-1-1.md` sección `### potential-method` — la función
  potencial `Φ(H)`, coste amortizado `ĉᵢ = cᵢ + Φᵢ − Φᵢ₋₁`.
- `content/analysis/week-05-sem5-dynamic-optimality-i.md` sección
  `### propiedades-de-secuencias-de-busqueda` — cinco propiedades, cada una con su
  cota; es el mazo con más notación.

**Ojo**: el contenido ya generado usa bloques de código para algunas fórmulas.
Cuando KaTeX funcione, avísame y yo hago que los agentes de contenido usen `$...$`
y `$$...$$` de aquí en adelante. **No edites tú el contenido.**

### 2. Las dos familias de visualización que faltan

`src/components/VisualizationCanvas.tsx` es la base y **no debería cambiar**: recibe
pasos ya posicionados y los anima. Su contrato:

```ts
type CanvasStep = {
  note: string;                                    // qué pasa y POR QUÉ
  nodes: { id, label, x, y }[];                    // ya posicionados
  edges: { from, to }[];
  highlight: string[];                             // ids en azul
};
```

El movimiento sale gratis: React conserva el elemento del DOM por `key`, así que una
transición CSS sobre `transform` hace que los nodos se deslicen entre pasos.

`src/visualizations/tree/` es el ejemplo a seguir: `layout.ts` (pura, testeada en
`layout.test.ts`) convierte `{id, value, parent}` en coordenadas, y
`TreeVisualization.tsx` delega el render. **Copia esa separación**: layout puro y
testeable, render delegado.

#### 2a. Familia `persistent` — 3 temas de la semana 3

Tiene que mostrar **qué se copia y qué se comparte entre versiones**. Es una cosa
distinta a un árbol: hay dos versiones coexistiendo y aristas de compartición.

**Dónde ver exactamente qué dibuja el profesor:**
- `content/analysis/week-03-sem-3-persistencia.md` **líneas 412-424** — el mejor
  diagrama del mazo, descrito nodo por nodo: Segment Tree de 4 hojas, el camino
  raíz→`[3,4]`→`[4,4]` en naranja (copiado) y `[1,2]`,`[1,1]`,`[2,2]`,`[3,3]`
  compartidos sin tocar. **Esta es la visualización canónica de path copying.**
- `content/analysis/week-03-sem-3-persistencia.md` **líneas 248-258** — el árbol de
  versiones de 7 nodos y el recorrido de Euler que lo linealiza.
- Mismo archivo, sección `### fat-nodes`: el análisis marca como **ausencias graves**
  que el profesor nunca dibuja un nodo gordo ni el split. Son justo los dos diagramas
  que el tema exige. Tendrás que diseñarlos — es diseño, no invención de contenido.

Necesitarás probablemente: dos colores de arista (copiada / compartida), y nodos
capaces de mostrar una lista de tuplas `(campo, valor, tiempo)` en vez de un número.
Eso puede requerir un campo nuevo en el contrato → anótalo al final.

#### 2b. Familia `range-tree` — 3 temas de las semanas 4 y 5

**Dónde ver exactamente qué dibuja el profesor:**
- `content/analysis/week-04-sem4-orthogonal-range-search.md` **líneas 46-56** — los
  tres diagramas, con TODOS los valores:
  - `#29` layout del range tree 1D: raíz 9, hijos 4 y 15, nivel 3/7/13/18, hojas
    {3,4,7,9,13,15,18,27}.
  - `#35` la consulta `[5,16]`: nodos **amarillos** = delimitadores (hojas 4 y 18),
    nodos **rojos** = raíces de los subárboles canónicos de la respuesta (7 y 13).
    Es el diagrama más claramente paso a paso del mazo.
  - `#47` el 2D: árbol primario en X con hojas `(3,10) (4,7) (7,11) (9,6) (13,0)
    (15,−2) (18,3) (27,1)`, y colgando del nodo 15 por una flecha, el árbol
    secundario ordenado por Y.
- `content/analysis/week-05-cs3014-...-6.md` sección `### layered-range-tree` — los
  **puentes** del fractional cascading entre arreglos ordenados. Esto ya no es un
  árbol: son arreglos en capas con flechas entre posiciones.

**Problema de diseño que te toca resolver**: el profesor usa amarillo y rojo, y
nuestra paleta es monocroma + un azul. Necesitas más de un estado ("delimitador" vs
"respuesta" vs "descartado") sin romper la regla de un solo color. Opciones: usar
relleno/borde/opacidad en vez de tono, o ampliar la paleta a un segundo color de
señal declarado en los tokens. **Tú decides, pero decláralo en `AGENTS.md` § Diseño
para que quede como regla del proyecto.**

El 2D anidado y los puentes probablemente no caben en el contrato actual de
`CanvasStep` (que asume un grafo plano de nodos). Esta es la parte donde
seguramente haya que **generalizar la base**. Adelante — sólo mantén
`TreeVisualization` funcionando (hay tests).

### 3. Navegación y buscador — el mapa tiene 33 temas

`src/components/KnowledgeMapNav.astro` pinta los temas planos por semana. Con 5
semanas, 33 temas y ~90 operaciones se vuelve un muro.

**Dónde ver la escala real**: `content/knowledge-map.json` — está completo, con las
5 semanas y los 33 temas ya definidos. Míralo antes de diseñar.

Hace falta: colapsar por semana (recordando el estado), y un buscador tipo Ctrl-K
sobre temas y operaciones. Los datos ya están todos en el knowledge map y en la
colección `docs`; no hace falta índice externo.

### 4. Vista de comparación entre estructuras

El curso **es** comparar montículos. El profesor tiene su propia tabla comparativa
binario/binomial/Fibonacci.

**Dónde verla**: `content/analysis/week-01-sem-1-heaps-i.md` sección
`### binary-heap`, el bloque de tabla — ahí está la tabla del profesor con insert,
find-min, extract-min, union, decrease-key y delete. La de Fibonacci está en el
análisis de la semana 2.

Hoy cada estructura tiene su tabla aislada (`ComplexityTable.astro`). Falta la
página que las pone lado a lado, leyendo los `meta.yaml` de varias estructuras.
Ojo: muchas celdas estarán vacías a propósito — el profesor casi nunca da
mejor/promedio/espacio, y **rellenarlas sería inventar**. La tabla debe mostrar `—`.

## Cómo verificar

```sh
pnpm check    # coherencia del knowledge map (no deberías romperlo, pero corre igual)
pnpm test     # tests de layout — si generalizas la base, AMPLÍALOS
pnpm build    # falla si rompes un schema
pnpm dev      # revisión visual: claro/oscuro y ancho de móvil (~390px)
```

Cada familia de visualización nueva necesita su `layout.test.ts`, igual que
`src/visualizations/tree/layout.test.ts`. Es el patrón del repo.

## Contexto que conviene leer una vez

- `AGENTS.md` — el principio rector del proyecto y las restricciones del brief
  original (no gamificación, no gradientes, nunca complejidad sin razonamiento,
  nunca solución antes de las pistas, el código nunca estático).
- `content/analysis/` — 3.500 líneas con el análisis exhaustivo de los 9 PDFs del
  curso. **Es tu fuente para saber qué hay que visualizar.** No inventes diagramas
  que el material no pide; sí diseña los que el material pide y el profesor no dibujó
  (el análisis los marca como "ausencias").

---

## Cambios de contrato solicitados

Anota aquí lo que necesites de `src/lib/schemas.ts` o `src/content.config.ts` en vez
de cambiarlo directamente. Formato: qué campo, en qué colección, para qué, y si es
obligatorio u opcional.

### 1. Un nodo compartido entre dos versiones — pedido por `path-copying`

**Quién lo pide**: el agente que escribió `content/structures/path-copying/`.
**Dónde se ve el problema**: `content/structures/path-copying/operations/segment-tree-update.md`,
bloque `visualization` del frontmatter (6 pasos, el diagrama de 4 hojas del profesor).

`vizNode` hoy es `{id, value, parent}` — **un solo padre por nodo**. Path copying
necesita expresar que un nodo compartido (por ejemplo `[1,2]`) sigue colgando **a la
vez** de la raíz vieja y de la raíz nueva: eso es literalmente lo que significa
"compartir en vez de copiar", y es el punto entero del tema.

Workaround actual del agente: reutiliza el mismo `id` entre pasos para sugerir que es
el mismo objeto, y lo explica en el texto del `note`. Funciona como parche, pero el
dibujo no puede mostrar las dos aristas.

Propuesta (decídela tú, es tu terreno): algo como
`parents?: string[]` además de `parent`, o un `edges` explícito por paso con un tipo
de arista (`copiada` | `compartida`). La segunda opción probablemente te sirva también
para `fat-nodes` y para los puentes del `layered-range-tree`. Si cambias el schema,
avísame y yo mando a los agentes a reescribir esos bloques — **no los edites tú**.

### 2. Nodo gordo y varios predecesores — pedido por `fat-nodes` (confirmado)

**Quién lo pide**: el agente que escribió `content/structures/fat-nodes/`.
**Dónde se ve**: `content/structures/fat-nodes/operations/node-split.md`, bloque
`visualization` del frontmatter.

Le faltaron dos cosas, y son las mismas dos que pide `path-copying`:

1. **El registro dentro del nodo.** Un nodo gordo es campos originales + una lista de
   tuplas `(campo, valor nuevo, tiempo)`. Con sólo `value: string|number` no se puede
   dibujar. Workaround actual: metió un texto resumen en `value`.
2. **Varios predecesores.** El caso `p > 1` del split (redirigir los `p` punteros
   entrantes) **es un grafo, no un árbol**, y `parent` sólo admite uno. Workaround
   actual: usa `parent` de forma laxa como "quién apunta a quién" y lo aclara en el
   `note`.

Sugerencia del agente: una lista de padres por nodo, o un campo
`log: [{field, value, time}]` en `vizNode`.

**Nota mía**: los pedidos 1 y 2 apuntan a la misma conclusión — la familia `persistent`
no es un árbol, es un grafo con aristas tipadas y nodos con contenido estructurado.
Probablemente convenga diseñar `CanvasStep` de esa forma desde el principio en vez de
parchear `vizNode`, y dejar que `tree` siga siendo el caso particular que ya funciona.
Si cambias el schema, avísame y **yo** mando a los agentes a reescribir esos bloques.

<!-- formato para lo que agregues: qué campo, en qué colección, para qué, obligatorio u opcional -->


### 3. Estado de la estructura por paso — pedido por `retroactive-priority-queue` (confirmado)

**Dónde se ve**: `content/structures/retroactive-priority-queue/operations/bridge.md`, bloque
`visualization` (línea de tiempo de 5 pasos con el puente resaltado).

Falta un lugar estructurado para **el estado de la cola en cada instante** (`Q_t`), separado
del valor del nodo. Workaround actual: va como prosa dentro de `note`. El agente sugiere un
campo `state`/`snapshot` por paso.

---

## Conclusión sobre la familia `persistent` — tres temas, el mismo diagnóstico

`path-copying`, `fat-nodes` y `retroactive-priority-queue` llegaron por caminos distintos al
mismo límite. Entre los tres piden:

- **nodos con contenido estructurado**, no un solo `value` (el registro de tuplas de un nodo
  gordo, el estado `Q_t` de una cola);
- **varios padres / aristas tipadas**, no un `parent` único (un nodo compartido entre dos
  versiones, los `p` punteros entrantes de un split, aristas `copiada` vs `compartida`);
- **un estado por paso**, además del estado por nodo.

Es decir: `persistent` **no es un árbol**, es un grafo con aristas tipadas, nodos con
contenido y un estado global por paso. Mi recomendación es diseñar `CanvasStep` con esa forma
y dejar que `tree` sea el caso particular que ya funciona y ya tiene tests
(`src/visualizations/tree/layout.test.ts`), en vez de parchear `vizNode` tres veces.

Los tres bloques `visualization` ya están escritos con la forma actual y quedan latentes. Si
cambias el schema, **avísame y yo mando a los agentes a reescribirlos** — no los edites tú.

### 4. Nodo "subárbol colapsado" — pedido por `bst-computational-model` (familia `tree`)

**Dónde se ve**: `content/structures/bst-computational-model/operations/rotate.md`, bloque
`visualization` (3 pasos de una rotación).

Para dibujar una rotación hace falta mostrar los subárboles A, B y C como **cajas que
representan un subárbol entero**, no como nodos sueltos. El agente usó nodos simbólicos
A/B/C y lo aclaró en el `note`, pero visualmente se leen como hojas normales, que es
justo lo que confunde al explicar una rotación.

Esta petición es de la familia **`tree`**, que sí está implementada — a diferencia de las
tres anteriores. Sería un `kind: 'subtree'` (o similar) en el nodo, renderizado como un
triángulo o una caja punteada, que es la convención de todos los libros.

Relacionado: el agente también nota que no hay forma de codificar "el recorrido inorden se
preserva", así que eso queda en el texto. Eso probablemente esté bien como está.

### 5. Rol de nodo y punteros cruzados — pedido por `range-tree` (familia `range-tree`)

**Dónde se ve**: `content/structures/range-tree/operations/{range-query-1d,build-2d}.md`.

1. **Rol dentro de un paso.** El diagrama #35 del profesor usa dos colores: amarillo para
   los **delimitadores** (hojas 4 y 18) y rojo para las **raíces de los subárboles canónicos
   de la respuesta** (7 y 13). El schema sólo tiene una lista plana `highlight`, así que los
   dos roles se pintan igual. Hace falta un rol por nodo, no un booleano.
   (Esto conecta con el problema de paleta que ya está anotado en la tarea 2b: son dos
   estados distintos, y nuestra paleta tiene un solo azul.)
2. **Puntero cruzado entre árboles.** En el #47 el árbol secundario cuelga del nodo 15 por
   una flecha, no por `parent`. El agente lo modeló como un segundo bloque de `nodes` con su
   propia raíz `null` y lo explicó en el `note`, pero la flecha que los conecta no se puede
   dibujar. El `layered-range-tree` de la semana 5 va a necesitar lo mismo, multiplicado:
   sus **puentes** son exactamente flechas entre posiciones de arreglos distintos.

Nota mía: junto con las peticiones 1-3, esto confirma que tanto `persistent` como
`range-tree` necesitan **aristas de primera clase con tipo** (no derivadas de `parent`) y
**roles por nodo** (no un `highlight` plano). Son la misma generalización.

### 6. Layout en filas para listas paralelas — pedido por `fractional-cascading`

**Dónde se ve**: `content/structures/fractional-cascading/operations/build.md`, bloque
`visualization` (3 pasos del ejemplo #18-19).

Fractional cascading **no es un árbol en absoluto**: son `k` listas ordenadas paralelas
(L'1, L'2, L3…) con flechas entre posiciones de una lista y la siguiente. El agente
reutilizó `parent` como "puente hacia la lista siguiente", que funciona como parche pero
no le dice al componente **en qué fila va cada nodo**.

Pide un campo tipo `row`/`list` por nodo para el layout en filas, y —otra vez— la
distinción entre arista de puente y arista jerárquica.

Esto es lo mismo que necesitará `layered-range-tree` (sus puentes son literalmente esto)
y encaja con la generalización ya descrita en las peticiones 1-3 y 5: **aristas tipadas de
primera clase + un campo de agrupación/posición por nodo**. Con eso, `range-tree` y
`persistent` salen de la misma base y `tree` sigue siendo el caso fácil.

### 7. Puentes dobles — pedido por `layered-range-tree` (familia `range-tree`)

**Dónde se ve**: `content/structures/layered-range-tree/operations/bridge-build.md`.

Un puente real es **una posición del arreglo padre apuntando a la vez a dos posiciones,
en dos arreglos hijos distintos** (izquierdo y derecho). Con `parent` único sólo se puede
expresar una de las dos, así que el agente modeló `parent` como "de qué celda hija vino
este valor en el merge" y el doble puente no se puede dibujar.

Pide algo como `bridges: [{toArrayId, position}]` — una **lista**, no un campo único.

Esto es la confirmación más fuerte de la conclusión general: **las aristas tienen que ser
de primera clase y múltiples por nodo**. Cinco de las siete peticiones de esta lista son la
misma cosa vista desde temas distintos.
