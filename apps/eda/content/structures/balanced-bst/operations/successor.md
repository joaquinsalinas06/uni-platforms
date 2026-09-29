---
kind: operation
title: Successor
order: 3
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
        Buscamos Successor(25) sobre el árbol de theory.md (raíz 20, hijo
        izq 10, hijo der 30 con hijo izq 27 y der 40). Empezamos en la
        raíz: comparamos 25 contra 20.
      highlight: ["n20"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        20 no es mayor que 25 (25 > 20), así que 20 no puede ser el
        sucesor: el candidato no se actualiza. Avanzamos al hijo derecho,
        30.
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        En 30: comparamos 25 contra 30.
      highlight: ["n30"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        30 > 25, así que 30 sí es un candidato válido a sucesor (es mayor
        que 25): candidato ← 30. Avanzamos al hijo izquierdo, buscando uno
        menor que 30 que siga siendo mayor que 25.
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20, state: marked }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        En 27: comparamos 25 contra 27. 27 > 25, así que 27 también es
        candidato — reemplaza a 30 (27 es menor que 30 y sigue siendo
        mayor que 25): candidato ← 27. Avanzamos al hijo izquierdo de 27.
      highlight: ["n27"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20, state: muted }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        El hijo izquierdo de 27 es nulo: la búsqueda termina aquí. El
        candidato sigue siendo 27 — es el sucesor de 25.
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20, state: muted }
        - { id: n27, value: 27, parent: n30, state: answer }
        - { id: n40, value: 40, parent: n30 }
---

<!-- Concepto de apoyo: no hay diapositiva que citar. Successor es la
     operación que el barrido de segmentos usa para mantener y consultar
     el orden de los puntos de cruce con la recta de barrido
     (Query(t, Successor(y)), ver content/analysis/week-04-sem4-planar-point-location.md). -->

## Qué hace

Devuelve la llave inmediatamente mayor a una llave (o posición) `x` dada.
Es la simétrica exacta de Predecessor.

## Intuición

Igual que Predecessor pero invertido: si el nodo de `x` tiene hijo derecho,
el sucesor es el mínimo de ese subárbol (el más a la izquierda bajando por
la derecha una vez); si no, es el ancestro más cercano del que `x` cuelga
como descendiente por la izquierda — el último nodo del que nos desviamos
hacia la derecha porque `x` era mayor.

## Algoritmo

1. `candidato ← nulo`, `nodo ← raíz`.
2. Mientras `nodo` no sea nulo:
   - si `nodo.llave > x`: `candidato ← nodo`, avanzar a `nodo.izq`.
   - si no: avanzar a `nodo.der` (sin actualizar `candidato`).
3. Devolver `candidato`.

## Pseudocódigo

```
Successor(raiz, x)
candidato ← nulo
nodo ← raiz
mientras nodo ≠ nulo
    si nodo.llave > x
        candidato ← nodo
        nodo ← nodo.izq
    si no
        nodo ← nodo.der
devolver candidato
```

## C++

Ver `step-4-search-predecessor-successor.cpp` y `full-implementation.cpp`
en el editor de arriba.

## Complejidad temporal

$O(\lg n)$: mismo argumento que Predecessor — un único descenso de longitud
acotada por la altura del árbol, $O(\lg n)$ por el invariante de balance.

## Complejidad espacial

$O(1)$ adicional (versión iterativa).

## Ejemplo

Sobre el árbol de 5 nodos de `theory.md` (raíz `20`, hijo izq `10`, hijo
der `30` con hijo izq `27` y der `40`): `Successor(25)` compara `25` contra
`20` (menor, candidato ← 20, sigue a la derecha... espera: `25 > 20`, así
que en realidad avanza a la derecha sin marcar candidato); en `30`, `25 <
30`, candidato ← 30, avanza a la izquierda; en `27`, `25 < 27`, candidato ←
27, avanza a la izquierda; hijo izquierdo de `27` es nulo, termina.
`Successor(25) = 27`.

## Casos límite

- **`x` es mayor que toda llave del árbol**: el candidato nunca se
  actualiza y la respuesta es nulo (no hay sucesor) — el caso que el
  barrido de segmentos debe manejar cuando la consulta cae después del
  último cruce activo.
- **Árbol de un solo nodo**: si ese nodo es mayor que `x`, es el sucesor;
  si no, la respuesta es nulo.
- **Comparar con Predecessor**: son exactamente el mismo algoritmo con `<`
  y `>` (y `izq`/`der`) intercambiados; no hay ninguna asimetría adicional.
