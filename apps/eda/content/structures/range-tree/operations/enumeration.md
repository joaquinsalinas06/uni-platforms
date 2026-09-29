---
kind: operation
title: Enumeración
order: 5
cppSteps:
  - step-1-point.cpp
  - step-2-build-1d.cpp
  - step-3-predecessor-successor.cpp
  - step-4-range-query-1d.cpp
  - step-6-enumeration.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  steps:
    - note: >-
        Partimos, igual que existence-count, del resultado de
        range-query-1d para [5,16]: subárboles canónicos {7, 13}. Ninguna
        hoja se ha recorrido todavía.
      highlight: [n7i, n13i]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: answer }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15, state: answer }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Entramos al primer subárbol canónico, 7, para recorrer sus hojas.
      highlight: [n7i]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: active }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15, state: answer }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Se agregan sus hojas a la salida, en cualquier orden de recorrido:
        7 y 9. Salida parcial: {7, 9}.
      highlight: [l7, l9]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: answer }
        - { id: l7, value: 7, parent: n7i, state: answer }
        - { id: l9, value: 9, parent: n7i, state: answer }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15, state: answer }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
      caption: "salida parcial: {7, 9}"
    - note: >-
        Entramos al segundo subárbol canónico, 13.
      highlight: [n13i]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: answer }
        - { id: l7, value: 7, parent: n7i, state: answer }
        - { id: l9, value: 9, parent: n7i, state: answer }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15, state: active }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Se agregan 13 y 15. Salida parcial: {7, 9, 13, 15}.
      highlight: [l13, l15]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: answer }
        - { id: l7, value: 7, parent: n7i, state: answer }
        - { id: l9, value: 9, parent: n7i, state: answer }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15, state: answer }
        - { id: l13, value: 13, parent: n13i, state: answer }
        - { id: l15, value: 15, parent: n13i, state: answer }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
      caption: "salida parcial: {7, 9, 13, 15}"
    - note: >-
        Salida final: {7, 9, 13, 15} — exactamente las hojas de los
        subárboles canónicos, sin visitar ninguna otra hoja del árbol. Si
        sólo se pidieran k=1 resultados, la enumeración se detendría apenas
        se agregara la hoja 7, sin recorrer el resto del subárbol 7 ni
        tocar el subárbol 13.
      highlight: [l7, l9, l13, l15]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: answer }
        - { id: l7, value: 7, parent: n7i, state: answer }
        - { id: l9, value: 9, parent: n7i, state: answer }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15, state: answer }
        - { id: l13, value: 13, parent: n13i, state: answer }
        - { id: l15, value: 15, parent: n13i, state: answer }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
      caption: "salida final: {7, 9, 13, 15}"
---

## Qué hace

Lista todos los puntos dentro de `[l1, r1]`, o los primeros `k` que se
pidan (Sem4_Orthogonal_Range_Search.pdf#16,38).

## Intuición

Igual que [existence-count](/structures/range-tree/operations/existence-count),
parte de los subárboles canónicos de
[range-query-1d](/structures/range-tree/operations/range-query-1d): "iterar
sobre los O(log n) subárboles" (#38) y recorrer las hojas de cada uno. Como
los subárboles son disjuntos y su unión es exactamente la respuesta, no
hay que filtrar ni deduplicar nada al recorrerlos.

## Algoritmo

*(Derivado; el profesor sólo da la idea de iterar los subárboles en #38.)*

1. `subarboles ← RangeQuery1D(raiz, l1, r1)`.
2. Para cada subárbol canónico, recorrer sus hojas (in-order o cualquier
   recorrido) y agregarlas a la salida.
3. Detenerse en cuanto se acumulen `k` resultados, si la consulta pide sólo
   `k` puntos.

## Pseudocódigo

```
Enumerar(raiz, l1, r1)                            // derivado
salida ← []
para cada s en RangeQuery1D(raiz, l1, r1)
    para cada hoja h en subárbol(s)   // recorrido normal del subárbol
        salida.agregar(h)
devolver salida
```

## C++

Ver `step-6-enumeration.cpp` y `full-implementation.cpp` en el editor de
arriba.

## Complejidad temporal

$O(\log n + k)$: $O(\log n)$ para hallar los subárboles canónicos
([range-query-1d](/structures/range-tree/operations/range-query-1d)), más
recorrer sus hojas — la suma de tamaños de subárboles disjuntos que caen en
la respuesta es exactamente `k` (Sem4_Orthogonal_Range_Search.pdf#38).

## Complejidad espacial

$O(k)$ para la salida (además del $O(\log n)$ de la lista de subárboles).

## Ejemplo

*(Derivado sobre el ejemplo de
[range-query-1d](/structures/range-tree/operations/range-query-1d).)*
Para `[5,16]`: recorrer el subárbol 7 da las hojas `7, 9`; recorrer el
subárbol 13 da `13, 15`. Salida: `{7, 9, 13, 15}`.

## Casos límite

- **`k` pedido menor que el total de puntos en rango**: se puede detener a
  mitad de un subárbol canónico, sin necesidad de recorrerlo completo.
- **Ningún punto en rango**: `RangeQuery1D` no devuelve subárboles, la
  salida es la lista vacía.
- **Todo el árbol en rango**: enumerar equivale a recorrer todas las hojas,
  $O(n)$ — coherente con `k = n` en la fórmula $O(\log n + k)$.
