---
kind: operation
title: Delete
order: 7
cppSteps:
  - step-1-node.cpp
  - step-2-structure.cpp
  - step-3-binomial-link.cpp
  - step-4-find-min.cpp
  - step-5-union.cpp
  - step-6-insert.cpp
  - step-7-extract-min.cpp
  - step-8-decrease-key.cpp
  - step-9-delete.cpp
  - full-implementation.cpp
---

## Qué hace

Quita un nodo cualquiera `x` del montículo (no necesariamente el mínimo).

## Intuición

No hace falta ningún algoritmo nuevo: basta forzar a `x` a convertirse en
el mínimo del montículo y luego sacarlo con la operación que ya sabe
hacer eso. Bajar su llave a `-∞` con
[Decrease-Key](/structures/binomial-heap/operations/decrease-key) lo hace
subir hasta la raíz de su árbol y garantiza que sea el menor de todo el
montículo; de ahí,
[Extract-Min](/structures/binomial-heap/operations/extract-min) lo saca.

## Algoritmo

`Decrease-Key(H, x, -∞)` seguido de `Extract-Min(H)`.

## Pseudocódigo

```
Algoritmo 15: Delete(H, x)
Decrease-Key(H, x, −∞) ;
Extract-Min(H) ;
```

## C++

Ver `cpp/structures/binomial-heap/step-9-delete.cpp`: `deleteKey` llama
`decreaseKey(x, INT_MIN)` y después `extractMin(h)`, liberando el nodo
extraído.

## Complejidad temporal

$O(\lg n)$. Es la suma de dos operaciones que ya cuestan $O(\lg n)$ cada una
(Decrease-Key y Extract-Min): $O(\lg n) + O(\lg n) = O(\lg n)$.

## Complejidad espacial

$O(1)$ adicional, más allá de lo que ya usan Decrease-Key y Extract-Min.

## Ejemplo

Sobre el $B_1$ (raíz 1, hijo 5) que quedó al final del ejemplo de
[Decrease-Key](/structures/binomial-heap/operations/decrease-key), borrar
el nodo con llave 5: `Decrease-Key(x, -∞)` lo sube (intercambia con la
raíz 1, que pasa a tener `-∞`), y ese nodo con `-∞` ahora es el mínimo del
montículo; `Extract-Min` lo saca, dejando un único $B_0$ con llave 1.
(Derivado a mano; el mazo no trae esta traza.)

## Casos límite

- Borrar la única raíz de un montículo de un solo nodo: Decrease-Key no
  hace ningún intercambio (no tiene padre) y Extract-Min deja el montículo
  vacío.
- Borrar un nodo que ya tiene llave `-∞` (por ejemplo, tras un Delete
  anterior que no llegó a completarse): el pseudocódigo no distingue este
  caso; el mazo tampoco lo discute.
- `x` es la raíz mínima actual: Decrease-Key no cambia nada estructural
  (ya estaba en la raíz), y Extract-Min procede igual que siempre.
