---
kind: operation
title: Search
order: 1
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
        Search(30) sobre el árbol de theory.md (raíz 20, hijo izq 10, hijo
        der 30 con hijo der 40 — 30 no tiene hijo izquierdo). Empezamos en
        la raíz: comparamos 30 contra 20. Como 30 > 20, la llave buscada
        está en el subárbol derecho — descendemos a 30.
      highlight: ["n20"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        En el nodo 30: comparamos 30 contra 30. Son iguales — encontramos
        la llave. Search(30) termina en 2 pasos y devuelve el nodo 30.
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20, state: answer }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        Ahora Search(25), de nuevo desde la raíz: comparamos 25 contra 20.
        25 > 20, descendemos a la derecha, a 30.
      highlight: ["n20"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        En el nodo 30: comparamos 25 contra 30. 25 < 30, así que la
        búsqueda debe continuar por el hijo izquierdo de 30.
      highlight: ["n30"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        Pero ese hijo izquierdo es nulo (30 sólo tiene hijo derecho, 40).
        La búsqueda termina sin encontrar 25: la llave no está en el árbol.
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20, state: muted }
        - { id: n40, value: 40, parent: n30 }
---

<!-- Concepto de apoyo: no hay diapositiva que citar. Search es la operación
     base que el range tree reutiliza (con llaves en las hojas) y sobre la
     que se apoyan Predecessor y Successor. -->

## Qué hace

Determina si una llave `x` está en el árbol, devolviendo el nodo que la
contiene (o nulo si no existe).

## Intuición

El invariante de BST — todo lo del subárbol izquierdo es menor, todo lo del
subárbol derecho es mayor — permite descartar la mitad del árbol restante
en cada comparación: sólo hace falta seguir un único camino desde la raíz.

## Algoritmo

1. Si el árbol está vacío, `x` no está: devolver nulo.
2. Comparar `x` contra la llave de la raíz.
3. Si son iguales, devolver la raíz.
4. Si `x` es menor, recursar en el hijo izquierdo; si es mayor, en el
   derecho.

## Pseudocódigo

```
Search(nodo, x)
si nodo = nulo
    devolver nulo
si x = nodo.llave
    devolver nodo
si x < nodo.llave
    devolver Search(nodo.izq, x)
si no
    devolver Search(nodo.der, x)
```

## C++

Ver `step-4-search-predecessor-successor.cpp` y `full-implementation.cpp`
en el editor de arriba.

## Complejidad temporal

$O(\lg n)$: el invariante de balance garantiza que la altura del árbol es
$O(\lg n)$, y `Search` sigue un único camino raíz-hoja, con $O(1)$ de trabajo
(una comparación) por nivel.

## Complejidad espacial

$O(\lg n)$ de la pila de recursión (o $O(1)$ adicional en la versión iterativa,
que basta para `Search`: no necesita volver a tocar nodos al subir).

## Ejemplo

Sobre el árbol de 5 nodos de `theory.md` (raíz `20`, hijos `10` y `30`,
`30` con hijo derecho `40`): `Search(30)` compara `30` contra la raíz `20`
(mayor, va a la derecha), llega a `30` y lo encuentra en 2 pasos.
`Search(25)`: `20` (mayor, derecha) → `30` (menor, izquierda) → nulo (no
está).

## Casos límite

- **Árbol vacío**: devuelve nulo de inmediato.
- **`x` es la raíz**: un solo paso.
- **`x` no está en el árbol**: el camino termina en un puntero nulo, en a lo
  más $O(\lg n)$ pasos por el invariante de balance — nunca degrada a $O(n)$
  como sí puede pasar en un BST sin balancear con llaves insertadas en
  orden.
