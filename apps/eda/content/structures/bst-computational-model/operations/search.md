---
kind: operation
title: Search
order: 3
cppSteps:
  - step-1-node.cpp
  - step-2-instrumented-move.cpp
  - step-4-instrumented-search.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Mismos 7 valores {1..7}, dos formas posibles. Árbol balanceado:
        Buscar(1) baja raíz→4→2→1, tres pointer-moves — la profundidad de
        cualquier nodo aquí es $O(\log n)$.
      highlight: ["b1"]
      nodes:
        - { id: b4, value: 4 }
        - { id: b2, value: 2, parent: b4, side: left }
        - { id: b6, value: 6, parent: b4, side: right }
        - { id: b1, value: 1, parent: b2, side: left, state: active }
        - { id: b3, value: 3, parent: b2, side: right }
        - { id: b5, value: 5, parent: b6, side: left }
        - { id: b7, value: 7, parent: b6, side: right }
    - note: >-
        Mismos 7 valores, árbol degenerado en cadena (cada nodo con un solo
        hijo): Buscar(1) baja los 7 niveles completos, seis pointer-moves.
        Mismo n, mismo modelo, costo $O(n)$ — la cota $O(\log n)$ del peor caso
        es sobre la forma óptima posible, no una garantía automática por
        tamaño.
      highlight: ["c1"]
      nodes:
        - { id: c7, value: 7 }
        - { id: c6, value: 6, parent: c7, side: left }
        - { id: c5, value: 5, parent: c6, side: left }
        - { id: c4, value: 4, parent: c5, side: left }
        - { id: c3, value: 3, parent: c4, side: left }
        - { id: c2, value: 2, parent: c3, side: left }
        - { id: c1, value: 1, parent: c2, side: left, state: active }
---

## Qué hace

Encuentra el nodo con valor `x`, empezando desde la raíz. Es la única
operación de consulta que el modelo soporta.

## Intuición

Es una secuencia de [`pointer-move`](/structures/bst-computational-model/operations/pointer-move):
en cada nodo se compara `x` contra el valor del nodo actual y se decide bajar
a la izquierda, bajar a la derecha, o detenerse porque ya se llegó. El costo
real es exactamente cuántos de esos movimientos hicieron falta, es decir, la
profundidad de `x` en el árbol vigente.

## Algoritmo

1. `v ← raíz`.
2. Mientras `v.valor ≠ x`: si `x < v.valor`, `v ← pointer-move(v, izquierda)`;
   si `x > v.valor`, `v ← pointer-move(v, derecha)`.
3. Devolver `v` (el modelo asume que `x` siempre está en el árbol, #24).

## Pseudocódigo

```
Algoritmo: Buscar(x)
v ← raíz
mientras v.valor ≠ x hacer
     si x < v.valor entonces
          v ← Pointer-Move(v, izquierda)
     sino
          v ← Pointer-Move(v, derecha)
devolver v
```

## C++

Ver `step-4-instrumented-search.cpp` y `full-implementation.cpp` en el
editor de arriba: `search(x)` llama a `moverA(...)` una vez por nivel
descendido, así que el contador de pointer-moves al terminar es exactamente
la profundidad de `x`.

## Complejidad temporal

$O(\log n)$ en el peor caso — pero esa cota es sobre **la forma del árbol**, no
una propiedad fija de `n`. El profesor lo dice en dos pasos: "En el peor
caso, ciertamente $O(\log n)$ es el mejor tiempo posible" (#26), pero de
inmediato aclara que "el trabajo de las búsquedas depende de la secuencia de
elementos que se buscan" (#27). Es decir: existe un BST con n nodos donde
Buscar(x) cuesta $O(n)$ (un árbol degenerado en cadena) y otro con los mismos n
nodos donde cuesta $O(\log n)$ (uno balanceado) — la cota $O(\log n)$ es sólo
alcanzable, no garantizada por el modelo. Cuantificar exactamente de qué
depende ese costo es el tema de
[`search-sequence-properties`](/structures/search-sequence-properties).

## Complejidad espacial

$O(1)$ adicional (el modelo no usa recursión ni estructuras auxiliares para
Buscar).

## Ejemplo

Ver [examples.md](/structures/bst-computational-model/examples).

## Casos límite

- **`x` es la raíz**: costo 0 pointer-moves.
- **Árbol degenerado en cadena** (cada nodo tiene un solo hijo): el peor
  caso real del modelo, $O(n)$ pointer-moves para el nodo más profundo, aunque
  n sea el mismo que en un árbol balanceado.
- **`x` no está en el árbol**: excluido explícitamente por el profesor
  (#24); el modelo no define el costo de una búsqueda fallida.
