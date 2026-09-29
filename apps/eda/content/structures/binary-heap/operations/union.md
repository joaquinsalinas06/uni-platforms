---
kind: operation
title: Union
order: 6
cppSteps:
  - step-1-array-indices.cpp
  - step-2-max-heapify.cpp
  - step-3-build-max-heap.cpp
  - step-8-union.cpp
  - full-implementation.cpp
---

<!-- Derivado; no aparece en las diapositivas (sólo Θ(n) en la tabla
     comparativa, Sem_1_Heaps_I-1.pdf#35-42). Es la operación que el resumen
     del profesor usa para motivar el montículo binomial: "arregla Union
     (O(lg n))" (Sem_1_Heaps_I-1.pdf#28). -->

## Qué hace

Combina dos montículos máximos en uno solo que contiene todos sus elementos.

## Intuición

El montículo binario no tiene punteros que se puedan "enlazar" entre dos
árboles casi completos de tamaños arbitrarios: la única forma de combinarlos
es juntar los dos arreglos en uno y reconstruir el invariante desde cero,
igual que Build-Max-Heap.

## Algoritmo

1. Concatenar los elementos de ambos montículos en un arreglo de tamaño
   `n1 + n2`.
2. Llamar `Build-Max-Heap` sobre el arreglo combinado.

## Pseudocódigo

```
Union(A, n1, B, n2)
C ← A[1..n1] concatenado con B[1..n2] ;
Build-Max-Heap(C, n1 + n2) ;
devolver C
```

## C++

Ver `step-8-union.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

$\Theta(n)$ (con `n = n1 + n2`), tal como aparece en la tabla comparativa. Se
deriva del mismo análisis agregado por niveles de Build-Max-Heap, aplicado
ahora al arreglo concatenado. Es explícitamente la debilidad del montículo
binario frente al binomial: el resumen del profesor dice que este último
"arregla Union ($O(\lg n)$)".

## Complejidad espacial

$O(n1 + n2)$ para el arreglo combinado (a menos que se reutilice uno de los
dos arreglos originales, como hace la implementación de referencia).

## Ejemplo

Derivado: `A = [3, 1, 4]` y `B = [9, 2, 6]` (ya montículos máximos de 3
elementos cada uno) se concatenan en `[3, 1, 4, 9, 2, 6]` y se reconstruyen
con Build-Max-Heap, dando un montículo válido de 6 elementos con raíz `9`.

## Casos límite

- **Un montículo vacío**: `Union` degenera en `Build-Max-Heap` sobre el
  otro arreglo tal cual (que, si ya era válido, no hace ningún intercambio).
- **Ambos vacíos**: el resultado es el montículo vacío.
- **Los dos montículos ya intercalados de forma que no requieren
  intercambios** tras concatenar: sigue costando $\Theta(n)$ porque Build-Max-Heap
  hace las $\lfloor n/2 \rfloor$ llamadas de todas formas, sólo que cada una termina rápido.
