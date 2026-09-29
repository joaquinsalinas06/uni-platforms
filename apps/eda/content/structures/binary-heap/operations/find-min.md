---
kind: operation
title: Find-Min
order: 4
cppSteps:
  - step-1-array-indices.cpp
  - step-2-max-heapify.cpp
  - step-5-find-extract-min.cpp
  - full-implementation.cpp
---

<!-- Derivado; no aparece en las diapositivas (sólo Θ(1) en la tabla
     comparativa, Sem_1_Heaps_I-1.pdf#35-42). Nombre "de mínimo" por la
     convención de esa tabla, aplicado aquí a un montículo MÁXIMO — ver la
     nota de apoyo sobre la simetría max<->min en theory.md. -->

## Qué hace

Devuelve el extremo del montículo sin retirarlo. En este montículo
**máximo**, el extremo que la tabla del profesor llama "min" es en realidad
la raíz, es decir, el elemento **más grande**.

## Intuición

El invariante de montículo máximo garantiza que ningún elemento es mayor
que su padre, así que por transitividad la raíz es mayor o igual que todos
los demás — no hace falta recorrer nada.

## Algoritmo

1. Si el montículo está vacío, es un error.
2. Devolver `A[1]`.

## Pseudocódigo

```
Find-Min(A, n)
si n = 0 entonces error "montículo vacío" ;
devolver A[1]
```

## C++

Ver `step-5-find-extract-min.cpp` y `full-implementation.cpp` en el editor
de arriba.

## Complejidad temporal

$\Theta(1)$, tal como aparece en la tabla comparativa: leer una posición fija
del arreglo no depende de `n`.

## Complejidad espacial

$O(1)$.

## Ejemplo

Derivado: sobre `A = [14, 8, 10, 4, 2, 9, 3]` (resultado del ejemplo de
Max-Heapify), `Find-Min` devuelve `14`.

## Casos límite

- **Montículo vacío**: no hay `A[1]` que leer; la implementación de
  referencia lanza una excepción en vez de leer memoria inválida.
- **Un solo elemento**: `A[1]` es ese elemento, sigue siendo $O(1)$.
