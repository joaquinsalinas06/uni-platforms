---
kind: operation
title: "Consulta online vía persistencia"
order: 4
cppSteps:
  - step-1-events.cpp
  - step-2-activation.cpp
  - step-3-intersection-count.cpp
  - step-4-crossing-order.cpp
  - step-5-persistent-query.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  mode: path-copying
  steps:
    - note: >-
        Evento en x=1: se activa A (y=5). No hay versión previa —
        insertarlo en una BBST de cruces vacía crea la primera versión,
        t1, con un único nodo.
      caption: "x=1: activa A → versión t1"
      versions:
        - { id: t1, label: "t1 (x=1)" }
      nodes:
        - { id: t1-a, value: "A (y=5)", parent: null, version: t1, state: copied }
      highlight: ["t1-a"]
    - note: >-
        Evento en x=2: se activa B (y=3). A la x actual, B queda por
        debajo de A (3<5): el camino de inserción es sólo la raíz, así que
        path-copying copia A en A' y cuelga a B como su nuevo hijo
        izquierdo. La versión t1 no se toca — sigue siendo consultable por
        su propia raíz.
      caption: "x=2: activa B → versión t2 = {A, B}"
      versions:
        - { id: t1, label: "t1 (x=1)" }
        - { id: t2, label: "t2 (x=2)" }
      nodes:
        - { id: t1-a, value: "A (y=5)", parent: null, version: t1, state: idle }
        - { id: t2-a, value: "A (y=5)'", parent: null, version: t2, state: copied }
        - { id: t2-b, value: "B (y=3)", parent: t2-a, side: left, version: t2, state: copied }
      links:
        - { from: t2-a, to: t2-b, kind: tree }
      highlight: ["t2-a", "t2-b"]
    - note: >-
        Evento en x=4: se activa C (y=7). C queda por encima de A (7>5):
        se inserta como hijo derecho. El camino copiado es sólo la raíz
        otra vez — A'' —; B, sin cambios, se comparte con t2 en vez de
        duplicarse: t2 sigue siendo la raíz t2-a con su propio hijo B, y
        t3 apunta a ese mismo B por un enlace `shared`.
      caption: "x=4: activa C → versión t3 = {A, B, C}, comparte B con t2"
      versions:
        - { id: t1, label: "t1 (x=1)" }
        - { id: t2, label: "t2 (x=2)" }
        - { id: t3, label: "t3 (x=4)" }
      nodes:
        - { id: t1-a, value: "A (y=5)", parent: null, version: t1, state: idle }
        - { id: t2-a, value: "A (y=5)'", parent: null, version: t2, state: idle }
        - { id: t2-b, value: "B (y=3)", parent: t2-a, side: left, version: t2, state: shared }
        - { id: t3-a, value: "A (y=5)''", parent: null, version: t3, state: copied }
        - { id: t3-c, value: "C (y=7)", parent: t3-a, side: right, version: t3, state: copied }
      links:
        - { from: t2-a, to: t2-b, kind: tree }
        - { from: t3-a, to: t2-b, kind: shared }
        - { from: t3-a, to: t3-c, kind: tree }
      highlight: ["t3-a", "t3-c"]
    - note: >-
        El barrido real ya está en x=4 (versión t3), pero la consulta
        online pide el estado en xi=2: caminar la versión t2 responde sin
        rehacer nada del barrido. Se busca `Successor(4)`: el segmento
        inmediatamente por encima de y=4 en ese instante pasado.
      caption: "xi=2 → caminar t2 (barrido real ya en t3)"
      versions:
        - { id: t1, label: "t1 (x=1)" }
        - { id: t2, label: "t2 (x=2)" }
        - { id: t3, label: "t3 (x=4)" }
      nodes:
        - { id: t1-a, value: "A (y=5)", parent: null, version: t1, state: idle }
        - { id: t2-a, value: "A (y=5)'", parent: null, version: t2, state: idle }
        - { id: t2-b, value: "B (y=3)", parent: t2-a, side: left, version: t2, state: shared }
        - { id: t3-a, value: "A (y=5)''", parent: null, version: t3, state: idle }
        - { id: t3-c, value: "C (y=7)", parent: t3-a, side: right, version: t3, state: idle }
        - { id: q, value: "Successor(4)", parent: null, version: t2, state: marked }
      links:
        - { from: t2-a, to: t2-b, kind: tree }
        - { from: t3-a, to: t2-b, kind: shared }
        - { from: t3-a, to: t3-c, kind: tree }
      highlight: ["t2-a", "t2-b", "q"]
    - note: >-
        En A (y=5), raíz de t2: 4<5, así que A queda como candidato a
        sucesor y la búsqueda desciende por la izquierda, hacia B.
      caption: "en A (y=5): 4<5 → candidato=A"
      versions:
        - { id: t1, label: "t1 (x=1)" }
        - { id: t2, label: "t2 (x=2)" }
        - { id: t3, label: "t3 (x=4)" }
      nodes:
        - { id: t1-a, value: "A (y=5)", parent: null, version: t1, state: idle }
        - { id: t2-a, value: "A (y=5)'", parent: null, version: t2, state: active }
        - { id: t2-b, value: "B (y=3)", parent: t2-a, side: left, version: t2, state: idle }
        - { id: t3-a, value: "A (y=5)''", parent: null, version: t3, state: idle }
        - { id: t3-c, value: "C (y=7)", parent: t3-a, side: right, version: t3, state: idle }
        - { id: q, value: "Successor(4)", parent: null, version: t2, state: marked }
      links:
        - { from: t2-a, to: t2-b, kind: tree }
        - { from: t3-a, to: t2-b, kind: shared }
        - { from: t3-a, to: t3-c, kind: tree }
      highlight: ["t2-a", "q"]
    - note: >-
        En B (y=3): 4>3 y B no tiene hijo derecho — no hay dónde seguir
        bajando. El candidato sigue siendo A, el último nodo donde la
        búsqueda dobló a la izquierda.
      caption: "en B (y=3): 4>3, sin hijo derecho"
      versions:
        - { id: t1, label: "t1 (x=1)" }
        - { id: t2, label: "t2 (x=2)" }
        - { id: t3, label: "t3 (x=4)" }
      nodes:
        - { id: t1-a, value: "A (y=5)", parent: null, version: t1, state: idle }
        - { id: t2-a, value: "A (y=5)'", parent: null, version: t2, state: marked }
        - { id: t2-b, value: "B (y=3)", parent: t2-a, side: left, version: t2, state: active }
        - { id: t3-a, value: "A (y=5)''", parent: null, version: t3, state: idle }
        - { id: t3-c, value: "C (y=7)", parent: t3-a, side: right, version: t3, state: idle }
        - { id: q, value: "Successor(4)", parent: null, version: t2, state: marked }
      links:
        - { from: t2-a, to: t2-b, kind: tree }
        - { from: t3-a, to: t2-b, kind: shared }
        - { from: t3-a, to: t3-c, kind: tree }
      highlight: ["t2-b", "q"]
    - note: >-
        `Successor(4)` en la versión t2 (xi=2) es A (y=5): el segmento
        inmediatamente superior en ese instante pasado. La versión t3 —el
        barrido real, ya en x=4— no se tocó en ningún momento de esta
        consulta: t2 y t3 conviven, cada una consultable por su propia
        raíz.
      caption: "Successor(4) en t2 = A (y=5)"
      versions:
        - { id: t1, label: "t1 (x=1)" }
        - { id: t2, label: "t2 (x=2)" }
        - { id: t3, label: "t3 (x=4)" }
      nodes:
        - { id: t1-a, value: "A (y=5)", parent: null, version: t1, state: idle }
        - { id: t2-a, value: "A (y=5)'", parent: null, version: t2, state: answer }
        - { id: t2-b, value: "B (y=3)", parent: t2-a, side: left, version: t2, state: muted }
        - { id: t3-a, value: "A (y=5)''", parent: null, version: t3, state: idle }
        - { id: t3-c, value: "C (y=7)", parent: t3-a, side: right, version: t3, state: idle }
        - { id: q, value: "Successor(4)", parent: null, version: t2, state: answer }
      links:
        - { from: t2-a, to: t2-b, kind: tree }
        - { from: t3-a, to: t2-b, kind: shared }
        - { from: t3-a, to: t3-c, kind: tree }
      highlight: ["t2-a", "q"]
---

## Qué hace

Convierte el caso general offline (#40-47) — que necesita conocer todos los
puntos de consulta por adelantado para procesarlos junto con el barrido —
en uno **online**: cada consulta se resuelve de inmediato, sin haber
barrido todavía hasta ese punto, aplicando persistencia sobre la
[balanced-bst](/structures/balanced-bst) de
[crossing-order](/structures/segment-intersection-sweep-line/operations/crossing-order).

## Intuición

En el caso offline, responder una consulta en $x_i$ exige haber procesado
el barrido hasta ahí. Si en cambio cada evento del barrido produce una
**versión nueva** de la BBST de cruces — vía
[path-copying](/structures/path-copying), sin destruir las versiones
anteriores — entonces consultar "¿qué pasaba en $x_i$?" es simplemente
consultar la versión de la BBST que existía en ese instante, sin importar
si el barrido ya llegó ahí en la vida real o no.

## Algoritmo

El material da únicamente la fórmula (#50), sin desarrollarla:

```
Query(t_{x_i}, Successor(y_i))
```

$t_{x_i}$ se entiende como la versión persistente de la BBST justo después
de procesar los eventos de barrido hasta $x_i$, y `Successor(y_i)` como la
consulta de sucesor de `y_i` en esa versión — pero el material no define
ninguna de las dos piezas con precisión.

> **Hueco declarado** (no se inventa la semántica): el análisis de la
> fuente marca `Query(t_{x_i}, Successor(y_i))` (#50) como **sin definir**.
> No se dice qué devuelve `Query`, cómo se indexan las versiones $t_{x_i}$
> cuando $x_i$ no coincide con ningún evento del barrido, ni sobre qué
> estructura exacta corre `Successor`. Requiere confirmación del usuario;
> aquí sólo se declara la ausencia, no se completa.

Lo que sí está establecido (#49): "es posible usar persistencia sobre el
BBST" para lograr que las consultas sean online, apoyándose en
[path-copying](/structures/path-copying) — cada actualización de la BBST
(activar o desactivar un segmento) copia sólo el camino modificado y
produce una nueva versión, sin tocar las anteriores.

## Pseudocódigo

```
// Por cada evento de barrido en x: aplicar Activar/Desactivar con
// path-copying y guardar la raíz de la versión resultante.
raiz[x] = PathCopyingUpdate(raiz_anterior, evento)

// Consulta online (semántica exacta de Query/Successor: sin definir, #50)
// Query(t_{x_i}, Successor(y_i))
```

## C++

Ver `step-5-persistent-query.cpp`: guarda, para cada evento de barrido, la
raíz de la versión de la estructura de cruces en ese instante (siguiendo la
idea de [path-copying](/structures/path-copying)), y verifica que consultar
una versión pasada da lo mismo que habría dado el barrido detenido en ese
instante — sin implementar `Successor` sobre esa versión, porque su
semántica exacta no está definida en el material (ver hueco arriba).

## Complejidad temporal

$O(\log n)$ por consulta (#51) — heredado del costo de consultar una versión
persistente de la BBST, el mismo argumento que
[path-copying](/structures/path-copying) usa para `query-old-version`. El
profesor no separa el costo de construir las versiones del costo de
consultarlas.

## Complejidad espacial

No aplica un análisis propio: el material no da espacio para esta variante
(ver, en cambio, el espacio $O(\lg n)$ por actualización que sí da
[path-copying](/structures/path-copying) para `segment-tree-update`, la
misma idea aplicada a la BBST aquí).

## Ejemplo

Ver [examples.md](/structures/segment-intersection-sweep-line/examples),
caso "Límite": consulta a una versión pasada de la BBST de cruces.

## Casos límite

- **Consulta en un $x_i$ que no coincide con ningún evento del barrido**: el
  material no dice si se toma la versión del mayor evento ≤ $x_i$ u otra
  convención — parte del hueco declarado arriba.
- **Consulta antes del primer evento**: no hay versión previa; el material
  no cubre este caso.
- **La retroactividad parcial (#53-55) es un mecanismo distinto**, aplicable
  sólo a segmentos completamente horizontales, con la misma cota $O(\log n)$
  por consulta pero sin persistencia de por medio — el deck la menciona sin
  mecanismo (ver [retroactivity](/structures/retroactivity)); no se
  desarrolla aquí porque el material no la conecta explícitamente con el
  barrido.
