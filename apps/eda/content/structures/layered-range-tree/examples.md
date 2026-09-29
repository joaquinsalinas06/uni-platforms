---
kind: examples
title: Ejemplos
---

## Mínimo

El ejemplo de puentes del profesor (#32-33), en su forma más pequeña ya
interesante: un padre con arreglo `[3, 5, 8, 9]`, hijo izquierdo `[3, 8]`,
hijo derecho `[5, 9]`. Con puentes ya construidos (incluido el centinela
final): `puenteIzq = [0, 1, 1, 2, 2]`, `puenteDer = [0, 0, 1, 1, 2]`
(posición `i` del padre → posición
equivalente en cada hijo; ver la traza completa en el bloque de
visualización de
[bridge-build](/structures/layered-range-tree/operations/bridge-build)).
Es el caso mínimo donde ya se puede verificar a mano que cada puente cae en
la posición correcta sin ninguna búsqueda binaria.

## Normal

*(derivado del pseudocódigo; no aparece en las diapositivas)*

Cuatro puntos: `A=(1,4)`, `B=(2,9)`, `C=(3,1)`, `D=(4,7)`. El árbol primario
en X tiene como hojas, de izquierda a derecha, `A, B, C, D`. Los arreglos
ordenados por Y (reemplazando cada BST secundario):

- hoja `A`: `[4]` — hoja `B`: `[9]` — hoja `C`: `[1]` — hoja `D`: `[7]`
- nodo `(A,B)`: mezcla `[4]` y `[9]` → `[4, 9]`, con
  `puenteIzq = [0, 1, 1]` (hacia hoja `A`) y `puenteDer = [0, 0, 1]`
  (hacia hoja `B`; último valor de cada arreglo es el centinela)
- nodo `(C,D)`: mezcla `[1]` y `[7]` → `[1, 7]`, con
  `puenteIzq = [0, 1, 1]` (hacia hoja `C`) y `puenteDer = [0, 0, 1]`
  (hacia hoja `D`)
- raíz: mezcla `[4, 9]` y `[1, 7]` → `[1, 4, 7, 9]`, con
  `puenteIzq = [0, 0, 1, 1, 2]` (hacia `(A,B) = [4, 9]`) y
  `puenteDer = [0, 1, 1, 2, 2]` (hacia `(C,D) = [1, 7]`)

Consulta `[x1,x2] × [y1,y2] = [2,4] × [3,8]`: los nodos canónicos en X para
`[2,4]` son la hoja `B` y el nodo `(C,D)`. En la raíz, `y1=3` da `pa=1`
(primer elemento `≥ 3` en `[1,4,7,9]` es `4`, posición 1) y `y2+1=9` da
`pb=3` (primer elemento `≥ 9` es `9`, posición 3).

Bajando hacia `(C,D)` por `puenteDer`: `pa' = puenteDer[1] = 1`,
`pb' = puenteDer[3] = 2` sobre `(C,D) = [1, 7]` → aporta `2 - 1 = 1` punto
(`D=(4,7)`, ya que `7 ∈ [3,8]`; `C=(3,1)` queda fuera del nodo canónico
igual, `1 ∉ [3,8]`).

Bajando hacia `(A,B)` por `puenteIzq`: `pa'' = puenteIzq[1] = 0`,
`pb'' = puenteIzq[3] = 1` sobre `(A,B) = [4, 9]`. Como la hoja `B` (no
`(A,B)` completo) es el nodo canónico, un segundo paso baja por el puente
de `(A,B)` hacia su hijo derecho (`puenteDer = [0, 0, 1]` de ese nodo):
`pa''' = 0`, `pb''' = 0` sobre la hoja `B = [9]` → aporta `0 - 0 = 0`
puntos (`B=(2,9)` queda fuera porque `9 ∉ [3,8]`).

Total: `1 + 0 = 1` punto — sólo `D=(4,7)` — sin ninguna búsqueda binaria
más allá de la única hecha en la raíz.

## Límite

*(derivado del pseudocódigo; no aparece en las diapositivas)*

Un rango de Y que no contiene ningún punto (`y1=100, y2=200` con todos los
valores reales menores a 100): en la raíz, `pa = pb` desde el primer paso
(ambas búsquedas binarias caen en la misma posición, el final del arreglo).
Ese `pa = pb` se propaga sin cambiar por cada puente descendido — los
puentes preservan la igualdad porque ambos extremos provienen de la misma
posición — así que todo nodo canónico aporta `pb - pa = 0` sin necesidad de
ningún caso especial. Es el mismo caso límite que motiva la propia
[consulta 2D](/structures/layered-range-tree/operations/range-query-2d) del
range tree ingenuo, resuelto aquí sin ninguna búsqueda binaria adicional.
