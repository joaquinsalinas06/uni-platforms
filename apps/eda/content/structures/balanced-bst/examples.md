---
kind: examples
title: Ejemplos
---

<!-- Concepto de apoyo: ejemplos construidos para ilustrar search/insert/
     predecessor/successor, no tomados de ninguna diapositiva (no las hay). -->

## Mínimo

Árbol vacío: `Insert(30)` lo vuelve la raíz sin ninguna rotación.
`Search(30)` lo encuentra en un paso; `Search(10)` recorre nulo de
inmediato. `Predecessor(30)` y `Successor(30)` son ambos nulos: es el único
nodo.

## Normal

Árbol de 5 nodos de `theory.md` (raíz `20`, hijo izq `10`, hijo der `30`
con hijo izq `27` y der `40`):

- `Search(27)`: `20` (mayor, derecha) → `30` (menor, izquierda) → `27`
  (encontrado). 3 pasos.
- `Predecessor(25) = 20` y `Successor(25) = 27` — ver el detalle paso a
  paso en `operations/predecessor.md` y `operations/successor.md`.

## Límite

Insertar `10`, `20`, `30`, `40` **en ese orden** en un árbol inicialmente
vacío: sin balanceo, esta secuencia produce una lista enlazada pura
(cada nodo cuelga como hijo derecho del anterior), degradando `Search` a
$O(n)$. Con el invariante de balance, la tercera inserción (`30`) ya rompe
el invariante en la raíz (`10`) y una rotación izquierda lo restaura antes
de seguir; la estructura nunca llega a ser una lista. Es exactamente el
caso adversario que motiva balancear un BST — el mismo que se verifica de
forma automatizada en `full-implementation.cpp` (insertar 1..n en orden y
comprobar que la altura resultante se queda cerca de $\log_2(n)$, no de n).
