---
kind: operation
title: Existencia
order: 1
cppSteps:
  - step-1-point.cpp
  - step-2-in-box.cpp
  - step-3-queries.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        Puntos ordenados {3,4,7,9,13,15,18,27} (#29,#35). Caja de consulta
        [5,16]: sólo hace falta saber si cae algún punto adentro.
      caption: "caja [5, 16]"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
    - note: >-
        Búsqueda binaria del sucesor de 5: el primer valor ≥ 5 es 7 —
        frontera izquierda de la caja.
      caption: "sucesor(5) = 7"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, marked, idle, idle, idle, idle, idle]
    - note: >-
        7 ≤ 16 (el límite derecho de la caja): existe al menos un punto
        adentro. La respuesta es un booleano, no hace falta contar ni
        listar.
      caption: "7 ≤ 16 → existe: verdadero"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, answer, idle, idle, idle, idle, idle]
---

<!-- Derivado del pseudocódigo del profesor; no hay pseudocódigo propio en el
     deck (#5-42 no trae ningún bloque de código). El enunciado de la
     operación es textual (#14, respuesta en #37); el algoritmo de abajo es
     la lectura directa de esa respuesta sobre la línea de base d=1
     (arreglo ordenado, #19-20). -->

## Qué hace

Responde "¿existe algún punto dentro de la caja $[l_1,r_1] \times ... \times [l_d,r_d]$?"
con un booleano, sin decir cuántos hay ni cuáles son.

## Intuición

Es la pregunta más barata de las tres porque es la que menos información
pide: sólo hace falta saber si la ventana de la caja está vacía o no. No
hace falta contar ni listar nada.

## Algoritmo

Sobre la línea de base `d = 1` (arreglo ordenado, ver
[theory.md](/structures/orthogonal-range-search#estructura-interna)):

1. Ubicar con búsqueda binaria el predecesor de `l1` (o, equivalentemente,
   el sucesor de `l1` dentro del arreglo).
2. Si ese sucesor existe y su valor es $\le r_1$, existe al menos un punto en
   el rango.

## Pseudocódigo

```
Existe(A ordenado, l, r)
i ← Sucesor(A, l)      // primer índice con A[i] ≥ l, por búsqueda binaria
si i no existe: devolver falso
devolver A[i] ≤ r
```

## C++

Ver `step-3-queries.cpp` y `full-implementation.cpp` en el editor de arriba.
La implementación de este tema es la línea de base por **fuerza bruta**
(revisa los n puntos), no el arreglo ordenado — ver la nota al inicio de
`full-implementation.cpp`.

## Complejidad temporal

$O(\log n)$ sobre el arreglo ordenado: una sola búsqueda binaria de frontera,
sin depender de cuántos puntos caigan dentro (ver
[theory.md](/structures/orthogonal-range-search#análisis-de-complejidad)).
La versión por fuerza bruta implementada en C++ es $O(n)$: revisa cada punto
una vez, sin aprovechar ningún orden.

## Complejidad espacial

`O(1)` adicional sobre la estructura ya construida (arreglo o, en fuerza
bruta, el propio vector de puntos).

## Ejemplo

Puntos `{3, 4, 7, 9, 13, 15, 18, 27}` (#29, #35), caja $[5, 16]$: el
predecesor de 16 es 15, que está dentro de $[5,16]$, así que la respuesta es
verdadera. Ver detalle en
[examples.md](/structures/orthogonal-range-search#normal).

## Casos límite

Caja vacía respecto al conjunto (ningún punto cae dentro): la búsqueda
binaria encuentra un sucesor de `l` cuyo valor excede `r`, o no encuentra
sucesor — en ambos casos la respuesta es falsa sin costo adicional. Caja que
cubre todo el rango de valores: la respuesta es verdadera con el mismo
$O(\log n)$, sin importar que $k = n$.
