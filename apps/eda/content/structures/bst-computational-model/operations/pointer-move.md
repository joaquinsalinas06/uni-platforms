---
kind: operation
title: Pointer-move
order: 1
cppSteps:
  - step-1-node.cpp
  - step-2-instrumented-move.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Posición inicial: el puntero de recorrido está en la raíz (n4). Aún
        no se movió, así que el contador de pointer-moves está en 0.
      highlight: [n4]
      nodes:
        - { id: n4, value: 4, parent: null, state: active }
        - { id: n2, value: 2, parent: n4, side: left }
        - { id: n6, value: 6, parent: n4, side: right }
        - { id: n1, value: 1, parent: n2, side: left }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n5, value: 5, parent: n6, side: left }
        - { id: n7, value: 7, parent: n6, side: right }
      caption: "pointer-moves: 0"
    - note: >-
        Pointer-Move(n4, derecha): el puntero sigue el enlace al hijo
        derecho y queda en n6. Un movimiento, un incremento del contador.
      highlight: [n6]
      nodes:
        - { id: n4, value: 4, parent: null }
        - { id: n2, value: 2, parent: n4, side: left }
        - { id: n6, value: 6, parent: n4, side: right, state: active }
        - { id: n1, value: 1, parent: n2, side: left }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n5, value: 5, parent: n6, side: left }
        - { id: n7, value: 7, parent: n6, side: right }
      caption: "pointer-moves: 1"
    - note: >-
        Pointer-Move(n6, izquierda): baja al hijo izquierdo, n5. Sigue
        siendo el mismo paso atómico que antes, sólo cambió la dirección.
      highlight: [n5]
      nodes:
        - { id: n4, value: 4, parent: null }
        - { id: n2, value: 2, parent: n4, side: left }
        - { id: n6, value: 6, parent: n4, side: right }
        - { id: n1, value: 1, parent: n2, side: left }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n5, value: 5, parent: n6, side: left, state: active }
        - { id: n7, value: 7, parent: n6, side: right }
      caption: "pointer-moves: 2"
    - note: >-
        Pointer-Move(n5, padre): el modelo también cuenta subir como un
        pointer-move de costo unitario, no sólo bajar. El puntero vuelve a
        n6 y el contador sigue subiendo igual que en el paso anterior.
      highlight: [n6]
      nodes:
        - { id: n4, value: 4, parent: null }
        - { id: n2, value: 2, parent: n4, side: left }
        - { id: n6, value: 6, parent: n4, side: right, state: active }
        - { id: n1, value: 1, parent: n2, side: left }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n5, value: 5, parent: n6, side: left }
        - { id: n7, value: 7, parent: n6, side: right }
      caption: "pointer-moves: 3"
    - note: >-
        Pointer-Move(n6, derecha): baja ahora al otro hijo, n7. Cada
        llamada es independiente de las anteriores — el modelo no recuerda
        de dónde vino, sólo dónde está el puntero ahora.
      highlight: [n7]
      nodes:
        - { id: n4, value: 4, parent: null }
        - { id: n2, value: 2, parent: n4, side: left }
        - { id: n6, value: 6, parent: n4, side: right }
        - { id: n1, value: 1, parent: n2, side: left }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n5, value: 5, parent: n6, side: left }
        - { id: n7, value: 7, parent: n6, side: right, state: active }
      caption: "pointer-moves: 4"
    - note: >-
        Pointer-Move(n7, padre): último paso, vuelve a n6. Cinco llamadas a
        pointer-move, cinco unidades de costo — el contador final es
        exactamente el número de aristas recorridas, sin importar si fueron
        bajadas o subidas.
      highlight: [n6]
      nodes:
        - { id: n4, value: 4, parent: null }
        - { id: n2, value: 2, parent: n4, side: left }
        - { id: n6, value: 6, parent: n4, side: right, state: active }
        - { id: n1, value: 1, parent: n2, side: left }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n5, value: 5, parent: n6, side: left }
        - { id: n7, value: 7, parent: n6, side: right }
      caption: "pointer-moves: 5"
---

## Qué hace

Mueve la posición actual del recorrido a través de un único puntero: al
padre del nodo actual, o a uno de sus dos hijos.

## Intuición

Es el paso atómico del modelo: nunca se "salta" a un nodo arbitrario. Toda
otra operación del modelo (`search`, y los reacomodos de punteros que hace
`rotate`) se explica como una secuencia de estos pasos.

## Algoritmo

1. Dado el nodo actual `v` y una dirección (`parent`, `left`, `right`).
2. Seguir el puntero correspondiente de `v`.
3. La nueva posición actual es el nodo al que apunta ese puntero (o `null`
   si no existe).

## Pseudocódigo

```
Algoritmo: Pointer-Move(v, dirección)
si dirección = padre entonces
     devolver v.padre
si dirección = izquierda entonces
     devolver v.izquierdo
si dirección = derecha entonces
     devolver v.derecho
```

## C++

Ver `step-2-instrumented-move.cpp` y `full-implementation.cpp` en el editor
de arriba: cada llamada a `moverA(...)` incrementa un contador global de
pointer-moves, que es lo que el C++ de `search` reporta al final.

## Complejidad temporal

$O(1)$. El profesor lo postula como costo unitario del modelo (#19), no lo
deriva: seguir un puntero es un paso constante sin importar cuántos nodos
haya en el árbol.

## Complejidad espacial

$O(1)$ adicional: sólo se actualiza el puntero a la posición actual.

## Ejemplo

Ver la visualización de arriba y
[examples.md](/structures/bst-computational-model/examples).

## Casos límite

- **Mover al padre desde la raíz**: el puntero es `null`; el modelo asume
  que quien recorre el árbol no pide ese movimiento (no está definido qué
  hacer con él, porque no hace falta para `search`).
- **Mover a un hijo que no existe** (nodo con 0 o 1 hijos): el puntero es
  `null`; en `search` esto sólo ocurre si `x` no está en el árbol, caso que
  el modelo excluye explícitamente (#24).
