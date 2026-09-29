---
kind: operation
title: Predecessor
order: 2
cppSteps:
  - step-1-node.cpp
  - step-2-rotations.cpp
  - step-3-insert.cpp
  - step-4-search-predecessor-successor.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Buscamos Predecessor(25) sobre el árbol de theory.md (raíz 20, hijo
        izq 10, hijo der 30 con hijo izq 27 y der 40). Se desciende como en
        Search, guardando en "candidato" el último nodo del que se dobló a
        la derecha (nodo menor que 25 visitado hasta ahora): al comparar 25
        contra la raíz 20, 25 es mayor, así que 20 es candidato y seguimos
        por el hijo derecho.
      highlight: ["n20"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        En 30: 25 es menor, así que 30 NO puede ser el predecesor (sería
        mayor que 25) y no se actualiza el candidato; se sigue por el hijo
        izquierdo.
      highlight: ["n30"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        En 27: 25 es menor, tampoco se actualiza el candidato (27 > 25); el
        hijo izquierdo de 27 es nulo, así que la búsqueda termina aquí. El
        candidato sigue siendo 20: es el predecesor de 25.
      highlight: ["n27"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
---

<!-- Concepto de apoyo: no hay diapositiva que citar. Predecessor es la
     operación que el range tree usa para acotar por la izquierda un rango
     de consulta 1D. -->

## Qué hace

Devuelve la llave inmediatamente menor a una llave (o posición) `x` dada.

## Intuición

Hay dos casos, según si `x` tiene subárbol izquierdo:

- Si el nodo de `x` tiene hijo izquierdo, su predecesor es el máximo de ese
  subárbol (el más a la derecha bajando por la izquierda una vez).
- Si no tiene hijo izquierdo, el predecesor es el ancestro más cercano del
  que `x` cuelga como descendiente por la derecha — es decir, el último
  nodo, bajando desde la raíz, del que nos desviamos hacia la izquierda
  porque `x` era menor.

Ambos casos se resuelven con un único descenso desde la raíz llevando un
"candidato": cada vez que la búsqueda dobla a la derecha (el nodo actual es
menor que `x`), ese nodo pasa a ser el mejor candidato a predecesor visto
hasta ahora.

## Algoritmo

1. `candidato ← nulo`, `nodo ← raíz`.
2. Mientras `nodo` no sea nulo:
   - si `nodo.llave < x`: `candidato ← nodo`, avanzar a `nodo.der`.
   - si no: avanzar a `nodo.izq` (sin actualizar `candidato`).
3. Devolver `candidato`.

## Pseudocódigo

```
Predecessor(raiz, x)
candidato ← nulo
nodo ← raiz
mientras nodo ≠ nulo
    si nodo.llave < x
        candidato ← nodo
        nodo ← nodo.der
    si no
        nodo ← nodo.izq
devolver candidato
```

## C++

Ver `step-4-search-predecessor-successor.cpp` y `full-implementation.cpp`
en el editor de arriba.

## Complejidad temporal

$O(\lg n)$: un único descenso desde la raíz, de longitud a lo más la altura
del árbol, que el invariante de balance mantiene en $O(\lg n)$.

## Complejidad espacial

$O(1)$ adicional (versión iterativa): sólo se guardan `candidato` y `nodo`.

## Ejemplo

Ver la visualización de arriba: `Predecessor(25)` sobre el árbol de 5 nodos
de `theory.md` da `20`.

## Casos límite

- **`x` es menor que toda llave del árbol**: el candidato nunca se
  actualiza y la respuesta es nulo (no hay predecesor).
- **`x` coincide con la llave de un nodo que tiene hijo izquierdo**: el
  descenso desde la raíz sigue funcionando igual (se busca la llave
  inmediatamente menor a `x`, sin asumir que `x` está o no en el árbol).
- **Árbol de un solo nodo**: si ese nodo es menor que `x`, es el
  predecesor; si no, la respuesta es nulo.
