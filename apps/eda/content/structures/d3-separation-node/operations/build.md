---
kind: operation
title: Construcción
order: 1
cppSteps:
  - step-1-node.cpp
  - step-2-build.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  steps:
    - note: >-
        Primero el árbol de rango estándar sobre y, del mismo ejemplo de
        [locate-separation-node](/structures/d3-separation-node/operations/locate-separation-node):
        raíz 6, hijos 3 y 9, nietos 1/4 y 8/11. Construido por mediana
        recursiva, igual que en [range-tree](/structures/range-tree).
        Todavía sin ninguna satélite colgada.
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6 }
        - { id: n9, value: 9, parent: r6 }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3 }
        - { id: n8, value: 8, parent: n9 }
        - { id: n11, value: 11, parent: n9 }
    - note: >-
        En la raíz (y=6) se cuelgan sus dos satélites: una D₂ normal sobre
        los puntos de derecha(raíz) = {8,9,11} (acotada por arriba,
        $y \le b_2$) y una D₂' invertida sobre los puntos de
        izquierda(raíz) = {1,3,4} (acotada por abajo, $y \ge a_2$). Ninguna
        reutiliza a la otra: cada una se construye desde cero sobre su
        propio subárbol.
      highlight: [r6]
      nodes:
        - { id: r6, value: 6, parent: null, state: active }
        - { id: n3, value: 3, parent: r6 }
        - { id: n9, value: 9, parent: r6 }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3 }
        - { id: n8, value: 8, parent: n9 }
        - { id: n11, value: 11, parent: n9 }
        - { id: dr-root, value: "D₂({8,9,11})", parent: null, panel: sat-r }
        - { id: dl-root, value: "D₂'({1,3,4})", parent: null, panel: sat-l }
      panels:
        - { id: sat-r, label: "D₂ normal de y=6", anchor: r6 }
        - { id: sat-l, label: "D₂' invertida de y=6", anchor: r6 }
    - note: >-
        Un nivel abajo, en y=3, se repite el patrón con SUS propios hijos:
        D₂ normal sobre derecha(3) = {4} y D₂' invertida sobre
        izquierda(3) = {1}. No hereda nada de la satélite de la raíz.
      highlight: [n3]
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6, state: active }
        - { id: n9, value: 9, parent: r6 }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3 }
        - { id: n8, value: 8, parent: n9 }
        - { id: n11, value: 11, parent: n9 }
        - { id: dr-n3, value: "D₂({4})", parent: null, panel: sat-r }
        - { id: dl-n3, value: "D₂'({1})", parent: null, panel: sat-l }
      panels:
        - { id: sat-r, label: "D₂ normal de y=3", anchor: n3 }
        - { id: sat-l, label: "D₂' invertida de y=3", anchor: n3 }
    - note: >-
        Y en y=9, el mismo patrón: D₂ normal sobre derecha(9) = {11} y D₂'
        invertida sobre izquierda(9) = {8}. Es el mismo par de satélites en
        todo nodo interno, sin excepción.
      highlight: [n9]
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6 }
        - { id: n9, value: 9, parent: r6, state: active }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3 }
        - { id: n8, value: 8, parent: n9 }
        - { id: n11, value: 11, parent: n9 }
        - { id: dr-n9, value: "D₂({11})", parent: null, panel: sat-r }
        - { id: dl-n9, value: "D₂'({8})", parent: null, panel: sat-l }
      panels:
        - { id: sat-r, label: "D₂ normal de y=9", anchor: n9 }
        - { id: sat-l, label: "D₂' invertida de y=9", anchor: n9 }
    - note: >-
        Las cuatro hojas (1, 4, 8, 11) no tienen hijos, así que ninguna de
        las dos satélites se construye para ellas — quedan sin marcar,
        distinto de los tres nodos internos que sí pagaron su par de D₂.
        Con esto, `build` terminó: un árbol de rango sobre y donde cada
        nodo interno guarda dos D₂ completas.
      caption: "3 nodos internos × 2 satélites cada uno = 6 estructuras D₂/D₂' construidas; las 4 hojas, ninguna"
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6 }
        - { id: n9, value: 9, parent: r6 }
        - { id: n1, value: 1, parent: n3, state: idle }
        - { id: n4, value: 4, parent: n3, state: idle }
        - { id: n8, value: 8, parent: n9, state: idle }
        - { id: n11, value: 11, parent: n9, state: idle }
---

## Qué hace

Arma la estructura $D_3$ completa: un árbol de rango sobre `y` en el que cada
nodo interno guarda, sobre los puntos de sus dos hijos, dos estructuras
satélite.

## Intuición

Construir un BST balanceado ordenado por `y` es la parte fácil (es la misma
idea que ya usa [range-tree](/structures/range-tree)). Lo que hace a $D_3$
distinto es qué se cuelga de cada nodo: no una copia genérica de $D_2$ para todo
el subárbol, sino **dos** copias específicas, una por cada hijo, elegidas
para que en el nodo de separación de cualquier consulta futura ya sobre una
de las dos direcciones ("normal" a la derecha, "invertida" a la izquierda —
ver [Estructura interna](/structures/d3-separation-node)).

## Algoritmo

Textual del profesor (#37-39): "Un árbol de rango sobre y (no sobre x). Cada
nodo v de este árbol guarda dos estructuras satélite, sobre los puntos de sus
dos hijos: en derecha(v), una estructura $D_2$ normal (acotada por arriba,
$y \le b_2$); en izquierda(v), una estructura $D_2$ invertida, $D_2'$ (acotada por
abajo, $y \ge a_2$)."

1. Ordenar los puntos por y y construir el árbol de rango balanceado
   (mediana como raíz, recursión en las dos mitades — igual que
   [range-tree](/structures/range-tree)).
2. En cada nodo `v` con hijos, construir:
   - una [D₂](/structures/d2-bound-x) normal sobre los puntos del subárbol
     derecho de `v`;
   - una $D_2'$ invertida sobre los puntos del subárbol izquierdo de `v`.

## Pseudocódigo

El mazo no da pseudocódigo para esta sección; es descripción en prosa
(#37-39). No se inventa uno formal más allá de la construcción recursiva
estándar de un árbol de rango, ya cubierta por
[range-tree](/structures/range-tree).

## C++

Ver `step-1-node.cpp` (el nodo y sus dos satélites) y `step-2-build.cpp` (la
construcción recursiva) en el editor de arriba.

## Complejidad temporal

El profesor no la da para esta operación (ver [Análisis de complejidad](/structures/d3-separation-node#análisis-de-complejidad)
en la teoría). No se inventa una cota propia.

## Complejidad espacial

Tampoco la da el mazo.

## Ejemplo

Ver [Ejemplos](/structures/d3-separation-node/examples).

## Casos límite

- Árbol con un solo punto: no hay hijos, así que ninguno de los dos satélites
  se construye (ambos vacíos). No lo discute el profesor; es la lectura
  directa de la construcción recursiva.
- Todos los puntos con el mismo `y`: el mazo no lo trata; el desempate de
  cuál va a la izquierda o derecha de la mediana queda igual que en
  [range-tree](/structures/range-tree).
