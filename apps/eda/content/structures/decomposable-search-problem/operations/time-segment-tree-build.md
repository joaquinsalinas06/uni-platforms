---
kind: operation
title: Time-segment-tree-build
order: 2
cppSteps:
  - step-2-time-node.cpp
  - step-3-time-segment-tree-build.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        El segment tree sobre el eje del tiempo, vacío: m=4 franjas de
        tiempo t=1..4 (mismo árbol de 4 hojas de /structures/segment-tree,
        reinterpretado — cada hoja ya no es A[i], es un instante de la línea
        de tiempo). f=suma, así que cada hoja empieza en el neutro (0): no
        hay ninguna operación retroactiva insertada todavía.
      highlight: []
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34 }
        - { id: n44, value: "[4,4]", parent: n34 }
    - note: >-
        Insert(t=2, op) con efecto +5: es un Update de segment tree en la
        posición 2 (el mismo Update que ya conocemos — no hay nada nuevo que
        analizar aquí). El camino raíz→hoja es [1,4] → [1,2] → [2,2]:
        O(lg m)=2 nodos intermedios, ni uno más. [3,4] y sus hijos no se
        tocan — la operación insertada "vive" desde t=2 en adelante, no
        afecta ninguna franja anterior.
      highlight: ["n14", "n12", "n22"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34 }
        - { id: n44, value: "[4,4]", parent: n34 }
    - note: >-
        Query(t=1): pregunta "¿qué pasó hasta el instante 1?", que es el
        rango [1,1]. El nodo [1,1] cae completamente dentro del rango
        pedido: se devuelve su valor (0) sin bajar al subárbol de [2,2] en
        absoluto. La operación insertada en t=2 queda FUERA del intervalo de
        vida de esta consulta — por eso no la afecta.
      highlight: ["n11"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34 }
        - { id: n44, value: "[4,4]", parent: n34 }
    - note: >-
        Query(t=3): pregunta por el rango [1,3], que NO coincide con ningún
        nodo del árbol de un solo golpe. Se reparte en exactamente dos nodos
        canónicos, completamente dentro del rango pedido: [1,2] (valor 5,
        incluye la operación de t=2) y [3,3] (valor 0). Resultado: 5+0=5. La
        misma operación insertada en t=2 ahora SÍ está dentro del intervalo
        de vida de esta consulta (t=2 ≤ t=3) — se ve sin volver a tocar la
        hoja [2,2] directamente, gracias al resumen ya guardado en [1,2].
      highlight: ["n12", "n33"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34 }
        - { id: n44, value: "[4,4]", parent: n34 }
    - note: >-
        Segunda operación retroactiva: Insert(t=4, op) con efecto +8. Igual
        que antes, es un Update en la posición 4: el camino raíz→hoja es
        [1,4] → [3,4] → [4,4], otros O(lg m)=2 nodos intermedios. Nótese que
        este camino NO comparte ningún nodo intermedio con el de t=2 salvo
        la raíz — cada Update sólo toca el camino de SU propia hoja.
      highlight: ["n14", "n34", "n44"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34 }
        - { id: n44, value: "[4,4]", parent: n34 }
    - note: >-
        Query(t=4): pide el rango completo [1,4], que coincide exactamente
        con la raíz. Un solo nodo canónico, cero descomposición: se lee
        directamente valor([1,4]) = 5+8 = 13, la suma de las dos operaciones
        insertadas hasta ahora. Es el caso más simple de Query: cuando el
        rango pedido es toda la línea de tiempo, no hace falta bajar del
        todo.
      highlight: ["n14"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34 }
        - { id: n44, value: "[4,4]", parent: n34 }
    - note: >-
        Delete(t=2) retroactivo: mismo camino [1,4] → [1,2] → [2,2] que
        Insert(t=2, +5), pero escribiendo el neutro (0) en la hoja en vez
        de +5. El recálculo hacia arriba deja [1,2] en 0 y la raíz en
        0+8=8 — el efecto de la operación borrada desaparece de todo
        resumen que lo incluía, sin tocar ningún nodo del lado de t=4.
      highlight: ["n14", "n12", "n22"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null, state: active }
        - { id: n12, value: "[1,2]", parent: n14, state: active }
        - { id: n34, value: "[3,4]", parent: n14, state: shared }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12, state: active }
        - { id: n33, value: "[3,3]", parent: n34, state: shared }
        - { id: n44, value: "[4,4]", parent: n34, state: shared }
---

<!-- No hay diapositiva que dibuje esto (huecos del análisis: "carencia
     seria", "no hay ningún diagrama"). Este bloque es una reconstrucción
     directa de la prosa de las páginas 34-35, sobre el mismo árbol de 4
     hojas que /structures/segment-tree ya deja construido para este tema. -->

## Qué hace

Construye el [segment tree](/structures/segment-tree) que va a soportar
retroactividad completa, pero sobre el eje del **tiempo**: cada hoja es un
instante de la línea de tiempo de operaciones (hay `m`), no una posición de
un arreglo de datos.

## Intuición

Es literalmente el mismo segment tree que ya conoces — mismo invariante,
mismo Update, mismo Query — sólo que la pregunta que responde cada nodo
interno cambió de "¿cuál es la suma/mín/máx de este RANGO DE POSICIONES?" a
"¿cuál es la suma/mín/máx de las operaciones activas en este RANGO DE
TIEMPO?". El profesor lo introduce así, literalmente: "La conexión con la
clase pasada: Segment Tree" — el giro es de eje, no de mecanismo.

## Algoritmo

Construcción en prosa (páginas 34-35), que hace de algoritmo de alto nivel:

1. Ordenar las operaciones de la línea de tiempo; cada una ocupa un instante
   entre dos operaciones consecutivas — hay `m` de ellas.
2. Cada hoja del árbol representa uno de esos `m` instantes, con el efecto
   de la operación que ocupa esa franja (o el neutro de `f`, si está vacía).
3. Cada nodo interno resume, con la `f` de
   [Decomposability](/structures/decomposable-search-problem/operations/decomposability),
   el efecto acumulado de todo su rango de tiempo — exactamente el
   [Build](/structures/segment-tree/operations/build) de un segment tree
   cualquiera.

> **Nota de apoyo** (no está en las diapositivas): el mazo no dice cómo se
> numeran o representan los `m` instantes, ni qué pasa si `Insert(t, op)`
> necesita "abrir espacio" entre dos operaciones ya existentes. La
> implementación en C++ de este tema fija `m` franjas enteras y fijas
> (`0..m-1`) para poder ejecutar algo concreto — no es una decisión del
> profesor, es la convención más simple consistente con lo que sí dice.

## Pseudocódigo

```
Construimos un Segment Tree sobre el eje del tiempo:
  - cada hoja es un instante entre dos operaciones consecutivas;
  - cada nodo interno resume, con f, el efecto acumulado de todo su rango de tiempo.
Insertar/eliminar una operación en el tiempo t actualiza O(lg m) nodos del Segment Tree
(donde m es el número de operaciones).
```

## C++

Ver `step-2-time-node.cpp`, `step-3-time-segment-tree-build.cpp` y
`full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

El profesor no da esta cota en esta sección — la anuncia como heredada, "la
misma que ya conocemos". Se hereda directamente de
[Build de segment tree](/structures/segment-tree/operations/build): $O(m)$,
porque el árbol tiene $2m-1$ nodos (`m` hojas, `m-1` internos) y cada uno se
construye en $O(1)$ combinando a sus dos hijos ya construidos.

## Complejidad espacial

No la da el profesor para este tema. Heredada del segment tree: $O(m)$ nodos
en total.

## Ejemplo

Ver la visualización de arriba: el árbol de 4 hojas para `m=4` franjas de
tiempo, con `f = suma`, vacío al inicio (todas las hojas en `0`, el neutro
de `+`).

## Casos límite

- **`m = 1`** (una sola operación en toda la línea de tiempo): el árbol es
  una única hoja; construirlo es $O(1)$ y no hay ningún nodo interno que
  combinar.
- **`m` no es potencia de 2**: igual que en
  [segment-tree](/structures/segment-tree/operations/build#casos-límite), el
  árbol queda desbalanceado en forma pero no en altura ($\lceil \lg m \rceil$).
- **Ninguna operación insertada todavía (`m` franjas, todas vacías)**: cada
  hoja arranca en el elemento neutro de `f` (`0` para suma, `-∞` para máx,
  `+∞` para mín, `falso` para ∨) — es el estado inicial de la visualización
  de arriba.
