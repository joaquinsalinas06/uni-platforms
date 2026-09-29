---
kind: operation
title: Find-Min
order: 2
cppSteps:
  - step-1-node.cpp
  - step-2-structure.cpp
  - step-3-binomial-link.cpp
  - step-4-find-min.cpp
  - full-implementation.cpp
---

## Qué hace

Devuelve (sin quitar) el nodo con la menor llave de todo el montículo.

## Intuición

En cada árbol $B_k$ del montículo, la propiedad de min-heap garantiza que
ningún nodo interno es menor que su raíz. Entonces el mínimo global tiene
que estar en alguna raíz: basta recorrer la lista de raíces una vez y
quedarse con la menor.

## Algoritmo

Recorrer la lista de raíces de principio a fin, llevando el mínimo visto
hasta ahora.

## Pseudocódigo

```
Find-Min(H)
min ← ∞ ;
para cada raíz x de H hacer
    si llave(x) < min entonces
        min ← llave(x) ;
devolver min ;
```

(El profesor no da pseudocódigo formal para esta operación —páginas 43-44,
diapositiva 20—, sólo la consecuencia del conteo de árboles; la versión de
arriba es la traducción directa de esa descripción.)

## C++

Ver `cpp/structures/binomial-heap/step-4-find-min.cpp`: `findMin` recorre
`h.head` siguiendo `sibling` y se queda con la menor `key`.

## Complejidad temporal

$O(\lg n)$: un montículo binomial con $n$ nodos tiene a lo mucho
$\lfloor \lg n \rfloor + 1$ raíces (tantas como bits en la representación
binaria de $n$), y Find-Min las recorre todas una vez.

## Complejidad espacial

$O(1)$: sólo una variable para el mínimo visto hasta ahora.

## Ejemplo

Con las raíces `{3, 10, 1, 25}` (grados 0, 1, 2, 3 respectivamente, como en
un montículo de 15 nodos), Find-Min recorre las cuatro y devuelve 1.
(Derivado del pseudocódigo; el mazo no da valores concretos.)

## Casos límite

- Montículo vacío (`H.head == nullptr`): no hay raíces que recorrer;
  Find-Min debe devolver "no hay mínimo" (en la implementación, `nullptr`).
  El mazo no discute este caso.
