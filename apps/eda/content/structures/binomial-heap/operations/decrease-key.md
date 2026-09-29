---
kind: operation
title: Decrease-Key
order: 6
cppSteps:
  - step-1-node.cpp
  - step-2-structure.cpp
  - step-3-binomial-link.cpp
  - step-4-find-min.cpp
  - step-5-union.cpp
  - step-6-insert.cpp
  - step-7-extract-min.cpp
  - step-8-decrease-key.cpp
  - full-implementation.cpp
---

## Qué hace

Baja la llave de un nodo `x` a un nuevo valor `k` (con `k` menor o igual
que la llave actual de `x`), y restaura la propiedad de min-heap si hace
falta.

## Intuición

Bajar una llave puede violar la propiedad de min-heap: `x` podría quedar
con una llave menor que la de su padre. La corrección es local: mientras
`x` sea menor que su padre, intercambiar las llaves (no los nodos) y subir
un nivel. En algún momento `x` deja de ser menor que su nuevo "padre" o
llega a la raíz, y ahí se detiene.

## Algoritmo

Asignar la nueva llave a `x`. Mientras `x` tenga un padre `z` y
`llave(x) < llave(z)`, intercambiar las dos llaves y avanzar `x` hacia `z`.

## Pseudocódigo

```
Algoritmo 14: Decrease-Key(H, x, k)
llave(x) ← k ;
y ← x; z ← padre(y) ;
mientras z ≠ nulo y llave(y) < llave(z) hacer
    intercambiar llave(y) y llave(z) ;
    y ← z; z ← padre(y) ;
```

## C++

Ver `cpp/structures/binomial-heap/step-8-decrease-key.cpp`: `decreaseKey`
asigna la nueva llave y sube por los punteros `parent` intercambiando con
`std::swap`.

## Complejidad temporal

$O(\lg n)$. Un nodo dentro de un árbol $B_k$ está a profundidad a lo mucho
$k = O(\lg n)$ de su raíz (la altura de $B_k$ es $k$), así que el ciclo de
intercambios sube, en el peor caso, un nivel por vez hasta la raíz:
$O(\lg n)$ intercambios.

## Complejidad espacial

$O(1)$: sólo se intercambian llaves entre nodos ya existentes, sin
estructuras auxiliares.

## Ejemplo

Sobre el $B_1$ (raíz 5, hijo 9) del ejemplo de
[Extract-Min](/structures/binomial-heap/operations/extract-min),
`Decrease-Key(x=9, k=1)` deja a 9 con llave 1; como `1 < 5` (la llave de su
padre), se intercambian: el nodo que era la raíz ahora tiene llave 1 y el
que era el hijo tiene llave 5. El árbol sigue siendo el mismo $B_1$
físicamente, sólo cambiaron las llaves que guarda cada posición.
(Derivado a mano; el mazo no trae esta traza.)

## Casos límite

- `x` ya es una raíz (`padre(x) = nulo`): la guarda `z ≠ nulo` detiene el
  ciclo de inmediato; sólo se asigna la nueva llave. El mazo no lo comenta,
  pero está cubierto por la guarda del pseudocódigo.
- La nueva llave `k` es mayor que la llave actual de `x`: el pseudocódigo
  la asignaría igual, y como `llave(y) < llave(z)` sería falso de entrada,
  no habría ningún intercambio — la propiedad de min-heap se rompería en
  silencio, porque ahora `x` podría ser mayor que alguno de sus propios
  hijos. El mazo no discute este caso; Decrease-Key asume, sin
  verificarlo, que la nueva llave es menor o igual que la anterior.
