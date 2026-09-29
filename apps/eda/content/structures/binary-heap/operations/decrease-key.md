---
kind: operation
title: Decrease-Key
order: 7
cppSteps:
  - step-1-array-indices.cpp
  - step-2-max-heapify.cpp
  - step-5-find-extract-min.cpp
  - step-6-decrease-key.cpp
  - full-implementation.cpp
---

<!-- Derivado; no aparece en las diapositivas (sólo Θ(lg n) en la tabla
     comparativa, Sem_1_Heaps_I-1.pdf#35-42). Nombre "de mínimo" por la
     convención de esa tabla — ver la nota de apoyo sobre la simetría
     max<->min en theory.md: en este montículo MÁXIMO, "decrease-key" es en
     realidad volver una llave más urgente (más grande) y subirla. -->

## Qué hace

Cambia la llave de un elemento ya insertado (dada su posición) y restaura
el invariante de montículo máximo.

## Intuición

Si la nueva llave es mayor que la anterior, el elemento puede ahora ser
mayor que su padre: hay que subirlo (como en Insert). Si es menor, puede
ahora ser menor que alguno de sus hijos: hay que hundirlo (como en
Max-Heapify). Nunca hacen falta ambas direcciones a la vez, porque cambiar
una sola llave sólo puede romper el invariante hacia un lado.

## Algoritmo

1. `A[i] ← new_key`.
2. Intentar subir desde `i` (mientras `A[parent(i)] < A[i]`, intercambiar y subir).
3. Si no subió, llamar `Max-Heapify(A, i, n)` para intentar hundirlo.

## Pseudocódigo

```
Decrease-Key(A, n, i, new_key)
A[i] ← new_key ;
mientras i > 1 y A[i/2] < A[i] hacer
     intercambiar A[i/2] y A[i] ;
     i ← i/2 ;
Max-Heapify(A, i, n)
```

## C++

Ver `step-6-decrease-key.cpp` y `full-implementation.cpp` en el editor de
arriba.

## Complejidad temporal

$\Theta(\lg n)$, tal como aparece en la tabla comparativa. Se deriva del mismo
argumento de altura que Insert y Max-Heapify: subir o bajar recorre a lo
más un camino raíz-hoja de $\lfloor \lg n \rfloor$ aristas.

## Complejidad espacial

$O(1)$ adicional (versión iterativa).

## Ejemplo

Derivado: sobre `A = [14, 8, 10, 4, 2, 9, 3]`, `Decrease-Key(A, 7, 7, 100)`
(vuelve la última posición más urgente, valor 100) sube: `100` contra su
padre `A[3]=10`, sube; contra `A[1]=14`, sube — termina en la raíz.

## Casos límite

- **La nueva llave es igual a la anterior**: ni sube ni baja (comparaciones
  estrictas), el invariante seguía válido.
- **`i = 1` (la raíz)**: subir no aplica (`i > 1` falso de entrada); sólo
  puede hundirse si la nueva llave es menor.
- **Índice fuera de rango**: la implementación de referencia lanza una
  excepción en vez de acceder a memoria inválida.
