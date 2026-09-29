---
kind: operation
title: Insert
order: 3
cppSteps:
  - step-1-array-indices.cpp
  - step-2-max-heapify.cpp
  - step-3-build-max-heap.cpp
  - step-4-insert.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Derivado del pseudocódigo; no aparece en las diapositivas. Sobre
        A = [14, 8, 10, 4, 2, 9, 3] (el resultado de Max-Heapify del ejemplo
        del profesor), Insert(A, 7, 20) agrega 20 al final del arreglo, en la
        posición 8 — la única que mantiene la forma de árbol casi completo —,
        como hijo de la posición 4.
      highlight: [n8]
      nodes:
        - { id: n1, value: 14, parent: null }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 4, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
        - { id: n8, value: 20, parent: n4, state: active }
    - note: >-
        Se compara el nuevo elemento contra su padre: A[4]=4 < A[8]=20, así
        que hay que intercambiarlos para que la llave más grande suba.
      highlight: [n8, n4]
      nodes:
        - { id: n1, value: 14, parent: null }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 4, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
        - { id: n8, value: 20, parent: n4, state: active }
    - note: >-
        Se intercambian A[4] y A[8]: el 20 sube a la posición 4 y el 4 baja a
        la hoja. i pasa a ser 4; la subida continúa desde ahí.
      highlight: [n4, n8]
      nodes:
        - { id: n1, value: 14, parent: null }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 20, parent: n2, state: active }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
        - { id: n8, value: 4, parent: n4 }
    - note: >-
        Se repite la comparación un nivel más arriba: A[2]=8 < A[4]=20, sigue
        subiendo.
      highlight: [n4, n2]
      nodes:
        - { id: n1, value: 14, parent: null }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 20, parent: n2, state: active }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
        - { id: n8, value: 4, parent: n4 }
    - note: >-
        Se intercambian A[2] y A[4]: el 20 sube a la posición 2, el 8 baja.
        i pasa a ser 2 — falta un último nivel para llegar a la raíz.
      highlight: [n2, n4]
      nodes:
        - { id: n1, value: 14, parent: null }
        - { id: n2, value: 20, parent: n1, state: active }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 8, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
        - { id: n8, value: 4, parent: n4 }
    - note: >-
        Última comparación, A[1]=14 < A[2]=20: se intercambian una vez más y
        20 llega a la raíz. Como i=1, la condición i>1 falla y la subida
        termina — 20 era el nuevo máximo del montículo.
      highlight: [n1]
      nodes:
        - { id: n1, value: 20, parent: null, state: active }
        - { id: n2, value: 14, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 8, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
        - { id: n8, value: 4, parent: n4 }
---

<!-- Derivado del pseudocódigo del profesor; no aparece en las diapositivas.
     La tabla comparativa (Sem_1_Heaps_I-1.pdf#35-42) sólo da su complejidad,
     Θ(lg n), sin pseudocódigo ni ejemplo propio para el binario. -->

## Qué hace

Agrega un elemento nuevo al montículo, preservando el invariante de
montículo máximo.

## Intuición

Es "subir" un elemento: se coloca al final del arreglo (la única posición
que mantiene la forma de árbol casi completo) y, mientras sea mayor que su
padre, se intercambia con él — subiendo hacia la raíz.

## Algoritmo

1. Agregar la llave al final del arreglo (`A[n+1] ← key`, `n ← n+1`).
2. `i ← n`.
3. Mientras `i > 1` y `A[parent(i)] < A[i]`: intercambiar `A[parent(i)]` y
   `A[i]`; `i ← parent(i)`.

## Pseudocódigo

```
Insert(A, n, key)
n ← n + 1 ;
A[n] ← key ;
i ← n ;
mientras i > 1 y A[i/2] < A[i] hacer
     intercambiar A[i/2] y A[i] ;
     i ← i/2
```

## C++

Ver `step-4-insert.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

$\Theta(\lg n)$, tal como aparece en la tabla comparativa del profesor. El
razonamiento se deriva por el mismo argumento de altura que Max-Heapify: el
elemento nuevo sube por un único camino hoja-raíz, que tiene a lo más
$\lfloor \lg n \rfloor$ aristas.

## Complejidad espacial

$O(1)$ adicional (versión iterativa).

## Ejemplo

Derivado: sobre `A = [14, 8, 10, 4, 2, 9, 3]` (el resultado de Max-Heapify
del ejemplo del profesor), `Insert(A, 7, 20)` agrega 20 en la posición 8,
lo compara contra su padre `A[4]=4`, sube; luego contra `A[2]=8`, sube;
luego contra `A[1]=14`, sube — 20 termina en la raíz porque es el nuevo
máximo.

## Casos límite

- **Montículo vacío**: `i = n = 1` tras agregar; la condición `i > 1` es
  falsa de entrada, no hay comparaciones que hacer.
- **Nuevo elemento es el menor de todos**: la condición `A[parent(i)] < A[i]`
  falla en el primer paso, el elemento se queda en la hoja donde se agregó.
- **Duplicados**: la comparación es estricta (`<`), un empate con el padre
  detiene la subida — sigue siendo válido para el invariante (`≥`).
