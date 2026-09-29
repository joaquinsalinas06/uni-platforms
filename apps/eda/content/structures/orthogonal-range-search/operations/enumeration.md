---
kind: operation
title: Enumeración
order: 3
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
        Mismos puntos {3,4,7,9,13,15,18,27}, caja [5,16]. Enumeración es la
        única de las tres preguntas que exige tocar cada punto de la
        respuesta.
      caption: "caja [5, 16]"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
    - note: >-
        Mismas fronteras que en conteo: sucesor(5)=7 (índice 2),
        predecesor(16)=15 (índice 5).
      caption: "fronteras: índices 2 y 5"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, marked, idle, idle, marked, idle, idle]
    - note: >-
        Recorrer A[2..5] y reportar cada valor: el término `+k` de la
        complejidad es exactamente este recorrido.
      caption: "enumeración = {7, 9, 13, 15}"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, answer, answer, answer, answer, idle, idle]
---

<!-- Derivado del pseudocódigo del profesor; no hay pseudocódigo propio en el
     deck. Enunciado textual (#16, respuesta en #38); algoritmo derivado
     sobre la línea de base d=1 (arreglo ordenado, #19-20). -->

## Qué hace

Responde "¿cuáles son todos los puntos dentro de la caja?" (o "dame k
puntos dentro de la caja") devolviendo la lista completa de puntos, no sólo
si existen o cuántos son.

## Intuición

Es la única de las tres preguntas que exige **tocar** cada elemento de la
respuesta: no basta con saber dónde empieza y termina el rango, hay que
recorrerlo y reportar cada punto uno por uno. Esa diferencia frente a
existencia/conteo es la que introduce el término $+\, k$.

## Algoritmo

Sobre la línea de base `d = 1` (arreglo ordenado):

1. Ubicar con búsqueda binaria el índice `i` del sucesor de `l1` y el índice
   `j` del predecesor de `r1` — el mismo paso de frontera que en
   [conteo](/structures/orthogonal-range-search/operations/count).
2. Recorrer `A[i], A[i+1], ..., A[j]` y reportar cada valor.

## Pseudocódigo

```
Enumerar(A ordenado, l, r)
i ← Sucesor(A, l)
j ← Predecesor(A, r)
resultado ← []
para k desde i hasta j: resultado.agregar(A[k])
devolver resultado
```

## C++

Ver `step-3-queries.cpp` y `full-implementation.cpp` en el editor de arriba.
La implementación de este tema es la línea de base por **fuerza bruta**
(revisa los n puntos y reporta los que caen dentro), no el arreglo ordenado.

## Complejidad temporal

$O(\log n + k)$ sobre el arreglo ordenado: $O(\log n)$ de las dos búsquedas de
frontera más $O(k)$ de recorrer y reportar cada uno de los $k$ puntos de la
respuesta — el único de los tres costos que depende del tamaño de la
respuesta (output-sensitive; ver
[theory.md](/structures/orthogonal-range-search#análisis-de-complejidad)).
La versión por fuerza bruta en C++ es $O(n)$: revisa cada uno de los n
puntos sin importar cuántos caigan dentro, así que ni siquiera ella es
output-sensitive — sólo lo es la versión con arreglo ordenado (y, más
adelante, [range-tree](/structures/range-tree)).

## Complejidad espacial

$O(k)$ para la lista de resultados devuelta (aparte del arreglo o vector de
entrada, que ya existía).

## Ejemplo

Puntos `{3, 4, 7, 9, 13, 15, 18, 27}`, caja $[5, 16]$: frontera en índices 2
y 5 (igual que en conteo), resultado `{7, 9, 13, 15}`. Ver detalle en
[examples.md](/structures/orthogonal-range-search#normal).

## Casos límite

Caja sin puntos dentro: el recorrido entre fronteras es vacío, $k = 0$,
costo $O(\log n)$ puro — coincide con existencia/conteo en ese caso. Caja que
cubre todo el conjunto ($k = n$): el costo se acerca a $O(\log n + n)$, es
decir, prácticamente al costo de recorrer todo el arreglo — el término $+\, k$
deja de ser una ventaja frente a la fuerza bruta cuando la respuesta es casi
todo el conjunto; eso es inherente al tamaño de la respuesta, no una
limitación de la estructura.
