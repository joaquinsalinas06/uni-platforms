---
kind: operation
title: Predecessor / Successor
order: 2
cppSteps:
  - step-1-point.cpp
  - step-2-build-1d.cpp
  - step-3-predecessor-successor.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  steps:
    - note: >-
        Buscamos x=5 sobre el árbol de build-1d — ninguna comparación hecha
        todavía.
      highlight: []
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i }
        - { id: n7i, value: 7, parent: n4 }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        En la raíz (valor 9): 5 ≤ 9 es verdadero → bajamos por la
        izquierda.
      highlight: [r9]
      nodes:
        - { id: r9, value: 9, parent: null, state: active }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i }
        - { id: n7i, value: 7, parent: n4 }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        En el nodo 4: 5 ≤ 4 es falso → bajamos por la derecha.
      highlight: [n4]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9, state: active }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i }
        - { id: n7i, value: 7, parent: n4 }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        En el nodo 7: 5 ≤ 7 es verdadero → bajamos por la izquierda, hacia
        la hoja 7.
      highlight: [n7i]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i }
        - { id: n7i, value: 7, parent: n4, state: active }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Llegamos a la hoja 7. Como 7 > 5, esta hoja no es ≤ x: no puede ser
        el Predecessor, así que el descenso termina en el Successor(5).
      highlight: [l7]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i }
        - { id: n7i, value: 7, parent: n4 }
        - { id: l7, value: 7, parent: n7i, state: active }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Successor(5) = hoja 7 (la hoja donde termina el descenso, que queda
        ≥ x). Predecessor(5) = la hoja anterior en el recorrido in-order de
        7, que es la hoja 4. Este mismo par (4, 7) es el que
        range-query-1d usa como frontera izquierda de la consulta [5,16].
      highlight: [l4, l7]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: answer }
        - { id: n7i, value: 7, parent: n4 }
        - { id: l7, value: 7, parent: n7i, state: answer }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i }
        - { id: l27, value: 27, parent: n18i }
      caption: "Predecessor(5) = 4, Successor(5) = 7"
---

<!-- El profesor sólo nombra Predecessor(l1) y Successor(r1) como sub-paso
     de la consulta (#31), sin definirlos aparte para un árbol con llaves
     en las hojas. Adapta la idea de balanced-bst; no la reexplica. -->

## Qué hace

`Predecessor(x)` devuelve la hoja con la mayor llave $\le x$; `Successor(x)`
devuelve la hoja con la menor llave $\ge x$. Son el primer paso de
[range-query-1d](/structures/range-tree/operations/range-query-1d): acotan
el rango `[l1, r1]` a las dos hojas frontera de la consulta.

## Intuición

En [balanced-bst](/structures/balanced-bst/operations/predecessor) el
predecesor se calcula descendiendo desde la raíz y quedándose con el último
nodo del que el camino se desvió a la derecha, porque las llaves viven en
cualquier nodo. Aquí las llaves sólo viven en las **hojas**, así que el
candidato no es un nodo interno con llave propia: es la última **hoja**
alcanzable siguiendo el camino de descenso normal (comparar `x` contra el
máximo del subárbol izquierdo en cada interno, bajar izquierda o derecha),
y luego, si hace falta, mirar un paso al vecino inmediato en el recorrido
in-order de las hojas.

## Algoritmo

*(Derivado; el mazo no da pseudocódigo para esto — sólo el nombre en #31.)*

1. Descender desde la raíz: en cada interno, si `x ≤ valor(nodo)` ir a la
   izquierda, si no a la derecha — igual que la búsqueda de
   [build-1d](/structures/range-tree/operations/build-1d), hasta llegar a
   una hoja `h`.
2. Si `h.llave ≤ x`: `h` ya es el Predecessor(x); el Successor(x) es la
   hoja siguiente en el recorrido in-order (o ninguna, si `h` es la última).
3. Si `h.llave > x`: `h` ya es el Successor(x); el Predecessor(x) es la
   hoja anterior en el recorrido in-order (o ninguna, si `h` es la primera).

## Pseudocódigo

```
PredecessorSuccessor(raiz, x)                 // derivado
nodo ← raiz
mientras nodo no es hoja
    si x ≤ nodo.max_izq
        nodo ← nodo.izq
    si no
        nodo ← nodo.der
// nodo es ahora una hoja
si nodo.llave ≤ x
    devolver (Predecessor = nodo, Successor = hoja_siguiente(nodo))
si no
    devolver (Predecessor = hoja_anterior(nodo), Successor = nodo)
```

## C++

Ver `step-3-predecessor-successor.cpp` y `full-implementation.cpp` en el
editor de arriba.

## Complejidad temporal

$O(\log n)$: un único descenso desde la raíz hasta una hoja, acotado por la
altura del árbol balanceado (Sem4_Orthogonal_Range_Search.pdf#31), más un
paso $O(1)$ al vecino in-order.

## Complejidad espacial

$O(1)$ adicional: sólo se guarda el nodo actual del descenso.

## Ejemplo

*(Derivado; ilustra el algoritmo sobre el árbol de
[build-1d](/structures/range-tree/operations/build-1d).)* Sobre las hojas
`{3, 4, 7, 9, 13, 15, 18, 27}`, buscar `x=5`: en la raíz (9), $5 \le 9$ → va
a la izquierda (nodo 4); en el nodo 4, $5 \le 4$ es falso → va a la derecha
(nodo 7); en el nodo 7, $5 \le 7$ → va a la izquierda y llega a la hoja `7`.
Como $7 > 5$, esa hoja es el Successor(5); el Predecessor(5) es la hoja
anterior en el recorrido in-order, `4`. Este mismo par (`4`, `7`) es el que
usa [range-query-1d](/structures/range-tree/operations/range-query-1d) como
frontera izquierda de la consulta `[5,16]`.

## Casos límite

- **`x` menor que toda hoja**: Predecessor no existe (nulo); Successor es
  la primera hoja.
- **`x` mayor que toda hoja**: Successor no existe (nulo); Predecessor es
  la última hoja.
- **`x` coincide exactamente con una llave**: esa hoja es simultáneamente
  el resultado que usa `range-query-1d` como delimitador — el diagrama #35
  la excluye de la respuesta (ver los casos límite de esa operación).
