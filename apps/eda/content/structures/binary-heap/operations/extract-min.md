---
kind: operation
title: Extract-Min
order: 5
cppSteps:
  - step-1-array-indices.cpp
  - step-2-max-heapify.cpp
  - step-5-find-extract-min.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Derivado del pseudocódigo. Estado inicial, A = [14, 8, 10, 4, 2, 9,
        3]: la raíz (posición 1) es el elemento que se extrae.
      highlight: [n1]
      nodes:
        - { id: n1, value: 14, parent: null, state: active }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 4, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
    - note: >-
        Se guarda el 14 como valor a devolver y se mueve el último elemento
        (posición 7, valor 3) a la raíz para llenar el hueco sin romper la
        forma de árbol casi completo; el montículo se achica a n=6, así que
        la posición 7 deja de existir.
      highlight: [n1]
      nodes:
        - { id: n1, value: 3, parent: null, state: active }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 4, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
    - note: >-
        Max-Heapify(A, 1, 6): se compara A[1]=3 contra sus dos hijos,
        A[2]=8 y A[3]=10. El mayor de los tres es A[3]=10, así que "largest"
        pasa a ser 3 y hay que intercambiar.
      highlight: [n1, n2, n3]
      nodes:
        - { id: n1, value: 3, parent: null }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 4, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
    - note: >-
        Se intercambian A[1] y A[3]: el 10 sube a la raíz y el 3 baja a la
        posición 3. i pasa a ser 3; la recursión continúa ahí.
      highlight: [n1, n3]
      nodes:
        - { id: n1, value: 10, parent: null }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 3, parent: n1, state: active }
        - { id: n4, value: 4, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
    - note: >-
        En i=3, A[3]=3 sólo tiene hijo izquierdo (posición 6, valor 9): la
        posición 7 ya no existe porque n=6. Se compara contra ese único hijo
        y 9 es mayor, así que "largest" pasa a ser 6.
      highlight: [n3, n6]
      nodes:
        - { id: n1, value: 10, parent: null }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 3, parent: n1 }
        - { id: n4, value: 4, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
    - note: >-
        Se intercambian A[3] y A[6]. Ahora i=6, que es hoja (n=6): "largest"
        queda igual a i, la recursión se detiene y el invariante queda
        restaurado. Estado final: A = [10, 8, 9, 4, 2, 3].
      highlight: [n3, n6]
      nodes:
        - { id: n1, value: 10, parent: null }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 9, parent: n1, state: active }
        - { id: n4, value: 4, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 3, parent: n3 }
---

<!-- Derivado; no aparece en las diapositivas (sólo Θ(lg n) en la tabla
     comparativa, Sem_1_Heaps_I-1.pdf#35-42). Nombre "de mínimo" por la
     convención de esa tabla, aplicado aquí a un montículo MÁXIMO — ver la
     nota de apoyo sobre la simetría max<->min en theory.md. -->

## Qué hace

Retira y devuelve el extremo del montículo (aquí, el máximo), dejando el
resto como un montículo máximo válido.

## Intuición

No se puede simplemente borrar la raíz: eso deja un hueco que rompe la
forma de árbol casi completo. La solución es mover el **último** elemento a
la raíz (eso sí preserva la forma) y dejar que Max-Heapify repare el
invariante hundiéndolo a su lugar.

## Algoritmo

1. Guardar `A[1]` como el valor a devolver.
2. Mover `A[n]` a `A[1]`; achicar el montículo (`n ← n - 1`).
3. Si el montículo no quedó vacío, llamar `Max-Heapify(A, 1, n)`.
4. Devolver el valor guardado.

## Pseudocódigo

```
Extract-Min(A, n)
si n = 0 entonces error "montículo vacío" ;
max ← A[1] ;
A[1] ← A[n] ;
n ← n - 1 ;
si n > 0 entonces Max-Heapify(A, 1, n) ;
devolver max
```

## C++

Ver `step-5-find-extract-min.cpp` y `full-implementation.cpp` en el editor
de arriba.

## Complejidad temporal

$\Theta(\lg n)$, tal como aparece en la tabla comparativa. Se deriva directo de
Max-Heapify: mover el último elemento a la raíz es $O(1)$, y restaurar el
invariante con Max-Heapify cuesta $O(\lg n)$ por el mismo argumento de altura
(un único camino raíz-hoja).

## Complejidad espacial

$O(1)$ adicional, más la pila de Max-Heapify si se usa su versión recursiva.

## Ejemplo

Ver la visualización de arriba. Derivado: sobre `A = [14, 8, 10, 4, 2, 9, 3]`,
`Extract-Min` guarda `14`, mueve el último elemento (`3`) a la raíz:
`[3, 8, 10, 4, 2, 9]`, y llama Max-Heapify(A,1,6): `3` contra hijos `8` y
`10`, el mayor es `10`, se intercambia (`[10, 8, 3, 4, 2, 9]`); en la
posición 3 el único hijo válido es la posición 6 (`9`), porque n=6 y la
posición 7 ya no existe: `3 < 9`, se intercambia una última vez.
Resultado: `[10, 8, 9, 4, 2, 3]`.

## Casos límite

- **Montículo vacío**: no hay raíz que extraer; la implementación de
  referencia lanza una excepción.
- **Un solo elemento**: se retira ese elemento y el montículo queda vacío;
  no hace falta llamar Max-Heapify (guarda explícita `n > 0`).
- **Los dos elementos restantes empatados**: la comparación estricta de
  Max-Heapify no genera un intercambio innecesario.
