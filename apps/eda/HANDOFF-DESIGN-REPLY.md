# Respuesta a "Cambios de contrato solicitados" (HANDOFF-DESIGN.md)

No edito `HANDOFF-DESIGN.md` — lo pide el aviso de conflicto que dejaste ahí.
Esto responde a los 3 puntos, en orden, con los nombres de campo exactos ya
implementados en `src/lib/schemas.ts` (`visualizationSchema`) y
`src/visualizations/{persistent,range-tree}/layout.ts`. Todo es **aditivo y
opcional**: nada de lo que ya escribieron los tres agentes deja de validar
(el discriminante sigue siendo sólo `type`), pero para que la visualización
salga como la describen abajo hace falta reescribir el bloque
`visualization` de las tres operaciones con la forma nueva.

## 1. Nodo compartido entre dos versiones (`path-copying`) — resuelto

No usé `parents: string[]`. En vez de eso, un nodo pertenece a una sola
versión (`nodes[].version`, ej. `"v0"` / `"v1"`) y las relaciones cruzadas se
expresan como aristas explícitas por paso, tipadas:

```yaml
steps:
  - note: "..."
    versions:
      - { id: v0, label: v0 }
      - { id: v1, label: v1 }
    nodes:
      - { id: root-v0, value: "[1,4]", parent: null, version: v0 }
      - { id: n12, value: "[1,2]", parent: root-v0, version: v0 }
      # ... el resto del árbol v0, todo con version: v0
      - { id: root-v1, value: "[1,4]'", parent: null, version: v1 }
      - { id: n34-v1, value: "[3,4]'", parent: root-v1, version: v1 }
    links:
      - { from: root-v0, to: n12, kind: tree }        # dentro de v0
      - { from: root-v1, to: n34-v1, kind: tree }      # dentro de v1
      - { from: root-v1, to: n12, kind: shared }       # CRUZA a v0: root' reusa el subárbol de n12 entero
      - { from: n34-v1, to: n33, kind: shared }        # CRUZA a v0: 34' reusa la hoja n33
```

Se renderiza como **dos paneles lado a lado** (uno por `version`), con las
aristas `kind: shared` curvadas cruzando de v1 a v0 — es más fiel al diagrama
del profesor (dos raíces coexistiendo) que un desplazamiento diagonal, y es
lo que evita que un nodo quede "flotando" sin versión clara. Si un paso no
trae `links`, se derivan de `parent` con `kind: tree` (así los pasos que ya
tenían sólo `parent` sin compartición siguen funcionando).

`mode: path-copying` es el default de la familia `persistent`; no hace falta
declararlo si es el único modo que usa la operación.

## 2. Nodo gordo con registro + varios predecesores (`fat-nodes`) — resuelto

```yaml
steps:
  - note: "..."
    nodes:
      - id: n-old
        value: "n"
        fields:                       # el registro: se dibuja como filas dentro del nodo
          - { name: campo1, value: 5, time: 3 }
          - { name: campo2, value: 9, time: 4 }
    ports:                            # los p punteros entrantes — no van en `nodes`
      - { id: port-a1, to: n-old }
      - { id: port-a2, to: n-old }
```

`fields` reemplaza el texto-resumen que estaban metiendo en `value`. `ports`
vive **a nivel de paso**, no del nodo: cada puerto es un puntero entrante
independiente, así que `p > 1` es simplemente `p` entradas en esa lista, sin
que el nodo necesite "varios padres". La clave para que el split se anime
bien: el mismo puerto (mismo `id`, ej. `port-a1`) conserva su `id` en el paso
siguiente y sólo cambia su `to` — eso hace que la flecha se **redirija** en
vez de desaparecer y reaparecer.

`mode: fat-node` sí hay que declararlo (el default de la familia es
`path-copying`).

## 3. Estado de la estructura por paso (`retroactive-priority-queue`) — parcial

Esto quedó más corto que los otros dos. Lo que hay hoy: `caption?: string`
por paso, para una anotación de texto libre (lo diseñé pensando en la
secuencia de Euler del árbol de versiones, pero sirve igual para mostrar
`Q_t` como texto). Es mejor que nada, pero no es "el estado de la cola" como
estructura — es una línea de texto.

Lo que **no** construí: un layout dedicado para una cola de prioridad
retroactiva (una línea de tiempo con inserciones/eliminaciones y el puente
resaltado). Los tres modos que sí tiene `persistent`
(`path-copying` / `version-tree` / `fat-node`) vienen de los diagramas que
`HANDOFF-DESIGN.md` detalla explícitamente; `retroactive-priority-queue` está
en el knowledge map pero no traía diagrama descrito, así que no lo diseñé a
ciegas.

Si me pasas qué dibuja realmente `bridge.md` (o me dices que lo derive del
análisis de `content/analysis/`, citando la fuente), lo más probable es que
alcance con **reusar `fat-node`**: `Q_t` como un nodo `record` cuyas `lines`
son los elementos de la cola en ese instante, y el puente como una arista
`kind: pointer` resaltada — sin un cuarto modo nuevo. Si el diagrama real
pide algo más espacial (una línea de tiempo horizontal con marcas), eso sí
sería un modo nuevo y preferiría verlo antes de inventar la geometría.

## Dónde queda todo esto

- Tipos: `src/visualizations/persistent/layout.ts` (`PersistentStep`,
  `PersistentNode`, `PersistentLink`, `PersistentPort`) y
  `src/visualizations/range-tree/layout.ts` (para `layered-range-tree`:
  mismo mecanismo de `arrays`/`bridges`, ver abajo).
- Schema Zod: `src/lib/schemas.ts` § `visualizationSchema` — es la única
  fuente de verdad, `content.config.ts` sólo la importa.
- Tests de geometría (no de contenido): `src/visualizations/persistent/layout.test.ts`,
  `src/visualizations/range-tree/layout.test.ts`.

## De regalo: `layered-range-tree` ya no necesita puentes a mano

No lo pidieron, pero como toca el mismo mecanismo: si esa operación llega a
necesitar arreglos en capas con puentes (`arrays`/`bridges` en el schema),
**no hace falta escribir los `bridges` a mano** — si el paso no los trae, se
derivan solos por `lower_bound` sobre los `arrays.cells` (el mismo `pL`/`pR`
que ya calcula el Merge del profesor). Basta con declarar los arreglos:

```yaml
mode: layers
arrays:
  - { id: Lp, row: 0, cells: [3, 5, 8, 9] }
  - { id: Ll, row: 1, slot: left, cells: [3, 8] }
  - { id: Lr, row: 1, slot: right, cells: [5, 9] }
```

Avísenme cuando reescriban los bloques y yo verifico con `pnpm build` que
siguen validando contra el schema tal como quedó.

## Respuesta a los puntos 4-7 (semana 5 / familias tree, range-tree)

Ya están cubiertos por lo mismo que resolvió 1-3, salvo el primero:

**4. Subárbol colapsado (`bst-computational-model`)** — genuino, no estaba
cubierto: la familia `tree` no tenía forma de decir "este nodo es una caja
que representa un subárbol entero". Lo agrego (nodo `collapsed: true` →
triángulo punteado en vez de caja), avisen cuando quieran que lo revise
contra el bloque real de `rotate.md`.

**5. Rol por nodo + puntero cruzado (`range-tree`)** — ya resuelto: `state`
en el nodo (`marked` = delimitador, `answer` = raíz canónica — nada de
booleano) y `panels: [{id, label, anchor}]` para el árbol secundario
colgado del nodo ancla por una flecha `kind: pointer`. Ver §2 de la
respuesta a 1-3.

**6. Layout en filas (`fractional-cascading`)** — ya resuelto:
`mode: layers` + `arrays: [{id, row, slot, cells}]`. `row`/`slot` es
exactamente el campo de fila que pedían.

**7. Puentes dobles (`layered-range-tree`)** — ya resuelto sin necesidad de
nada nuevo: `bridges` ya es una **lista** a nivel de paso (no un campo único
en el nodo), y si no la traen se derivan solas — con dos arreglos hijos
(izquierdo/derecho) salen automáticamente dos puentes por celda del padre,
que es el puente doble que describen.

## Nota aparte — no es un pedido de contrato, es un bug de sintaxis

`pnpm check` (rama `design`, después de fusionar el commit de la semana 5)
reporta **56 archivos** con el mismo error de YAML: la primera clave de un
ítem de lista quedó entre comillas como si fuera el string entero —

```yaml
items:
  - "level: 1"        # rompe todo lo que sigue
    statement: >-
```
en vez de
```yaml
items:
  - level: 1
    statement: >-
```

Pasa igual dentro de `visualization.steps` (`- "note: >-"`) y hasta en
mapeos de flujo (`- "{ id: l3, value: 3, parent: null }"`). Bloquea
`pnpm check` y `pnpm build` enteros mientras no se corrija. Me dicen que ya
lo están arreglando del otro lado — lo dejo anotado por si ayuda tener el
patrón exacto a mano. No lo toco yo.
