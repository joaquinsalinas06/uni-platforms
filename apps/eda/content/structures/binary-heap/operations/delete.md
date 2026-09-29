---
kind: operation
title: Delete
order: 8
cppSteps:
  - step-1-array-indices.cpp
  - step-2-max-heapify.cpp
  - step-5-find-extract-min.cpp
  - step-6-decrease-key.cpp
  - step-7-delete.cpp
  - full-implementation.cpp
---

<!-- Derivado; no aparece en las diapositivas (sólo Θ(lg n) en la tabla
     comparativa, Sem_1_Heaps_I-1.pdf#35-42). -->

## Qué hace

Retira un elemento en una posición arbitraria `i` del montículo (no
necesariamente la raíz), preservando el invariante de montículo máximo.

## Intuición

Igual que Extract-Min, no se puede dejar un hueco en medio del arreglo: se
sustituye la posición `i` por el último elemento, y como ese elemento puede
violar el invariante hacia arriba o hacia abajo, se intenta subirlo y
después hundirlo — el mismo par de pasos que Decrease-Key, con una llave
arbitraria en vez de una garantizada más grande.

## Algoritmo

1. `A[i] ← A[n]`; achicar el montículo (`n ← n - 1`).
2. Si `i ≤ n` (no se borró justo el último elemento): intentar subir desde
   `i`, y luego `Max-Heapify(A, i, n)`.

## Pseudocódigo

```
Delete(A, n, i)
A[i] ← A[n] ;
n ← n - 1 ;
si i ≤ n entonces
     mientras i > 1 y A[i/2] < A[i] hacer
          intercambiar A[i/2] y A[i] ;
          i ← i/2 ;
     Max-Heapify(A, i, n)
```

## C++

Ver `step-7-delete.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

$\Theta(\lg n)$, tal como aparece en la tabla comparativa. Se deriva igual que
Decrease-Key: sustituir es $O(1)$, y subir o bajar recorre a lo más un
camino raíz-hoja de $\lfloor \lg n \rfloor$ aristas.

## Complejidad espacial

$O(1)$ adicional.

## Ejemplo

Derivado: sobre `A = [14, 8, 10, 4, 2, 9, 3]`, `Delete(A, 7, 2)` (borra la
posición 2, valor 8) la sustituye por el último elemento (`3`):
`[14, 3, 10, 4, 2, 9]`; `3` no sube (su padre 14 es mayor), y
Max-Heapify(A,2,6) lo compara contra sus hijos `4` y `2`: el mayor es `4`,
se intercambia. Resultado: `[14, 4, 10, 3, 2, 9]`.

## Casos límite

- **Borrar el último elemento (`i = n`)**: tras `n ← n-1`, la condición
  `i ≤ n` es falsa; no hay nada que restaurar.
- **Borrar la raíz (`i = 1`)**: degenera exactamente en Extract-Min.
- **Montículo de un solo elemento**: se borra y queda vacío, sin ninguna
  llamada a Max-Heapify.
- **Índice fuera de rango**: la implementación de referencia lanza una
  excepción.
