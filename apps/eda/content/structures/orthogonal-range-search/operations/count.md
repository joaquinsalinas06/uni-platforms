---
kind: operation
title: Conteo
order: 2
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
        Mismos puntos {3,4,7,9,13,15,18,27}, caja [5,16]. Conteo pide un
        número exacto, pero sigue sin tocar cada elemento.
      caption: "caja [5, 16]"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
    - note: >-
        Dos búsquedas binarias ubican las fronteras: sucesor(5)=7 en el
        índice 2, predecesor(16)=15 en el índice 5.
      caption: "fronteras: índices 2 y 5"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, marked, idle, idle, marked, idle, idle]
    - note: >-
        El conteo es aritmética de índices, `5 - 2 + 1 = 4`, sin recorrer
        nada entre las fronteras.
      caption: "conteo = 4"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, answer, answer, answer, answer, idle, idle]
---

<!-- Derivado del pseudocódigo del profesor; no hay pseudocódigo propio en el
     deck. Enunciado textual (#15, respuesta en #37); algoritmo derivado
     sobre la línea de base d=1 (arreglo ordenado, #19-20). -->

## Qué hace

Responde "¿cuántos puntos hay dentro de la caja?" con un número, sin listar
cuáles son.

## Intuición

Pide más información que existencia (un número exacto, no sólo sí/no), pero
sigue sin necesitar tocar cada punto de la respuesta uno por uno: alcanza
con saber **dónde empieza y dónde termina** el rango dentro del orden.

## Algoritmo

Sobre la línea de base `d = 1` (arreglo ordenado):

1. Ubicar con búsqueda binaria el índice del sucesor de `l1` (primer índice
   `i` con `A[i] ≥ l1`).
2. Ubicar con búsqueda binaria el índice del predecesor de `r1` (último
   índice `j` con `A[j] ≤ r1`).
3. Si $j < i$, la caja no contiene puntos: el conteo es 0.
4. En otro caso, el conteo es $j - i + 1$: aritmética de índices, no
   requiere visitar cada elemento entre ellos.

## Pseudocódigo

```
Contar(A ordenado, l, r)
i ← Sucesor(A, l)
j ← Predecesor(A, r)
si i no existe o j no existe o j < i: devolver 0
devolver j - i + 1
```

## C++

Ver `step-3-queries.cpp` y `full-implementation.cpp` en el editor de arriba.
La implementación de este tema es la línea de base por **fuerza bruta**
(cuenta revisando los n puntos uno por uno), no el arreglo ordenado.

## Complejidad temporal

$O(\log n)$ sobre el arreglo ordenado: dos búsquedas binarias de frontera más
una resta; el costo no depende de $k$ (ver
[theory.md](/structures/orthogonal-range-search#análisis-de-complejidad)).
La versión por fuerza bruta en C++ es $O(n)$: incrementa un contador al
revisar cada punto, sin aprovechar ningún orden.

## Complejidad espacial

`O(1)` adicional.

## Ejemplo

Puntos `{3, 4, 7, 9, 13, 15, 18, 27}`, caja $[5, 16]$: sucesor de 5 es 7
(índice 2), predecesor de 16 es 15 (índice 5); conteo = $5 - 2 + 1 = 4$. Ver
detalle en [examples.md](/structures/orthogonal-range-search#normal).

## Casos límite

Caja sin puntos dentro: $j < i$, conteo 0, sin necesidad de recorrer nada
entre las fronteras. Caja que cubre todo el conjunto: conteo $= n$, mismo
$O(\log n)$ — a diferencia de enumeración, aquí no importa que la respuesta
sea grande, el costo de contar no cambia.
