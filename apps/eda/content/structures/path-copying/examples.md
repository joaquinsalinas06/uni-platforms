---
kind: examples
title: Ejemplos
---

## Mínimo

*(Derivado del pseudocódigo; no aparece en las diapositivas con valores
concretos.)* El stack persistente sobre un solo `Push`: `S = nulo`
(pila vacía, versión `v0`). `Push(v0, 7)` crea un nodo `7` con
`siguiente ← nulo` y lo devuelve como `v1`. Es el caso mínimo interesante de
path copying en general: sólo un nodo, sin ningún camino que recorrer más
allá de él mismo — el caso degenerado que el profesor usa para introducir
la técnica antes de pasar al segment tree.

## Normal

El ejemplo del profesor (página 57), único con valores concretos en todo el
mazo: un segment tree de 4 hojas — raíz `[1,4]`, hijos `[1,2]` y `[3,4]`,
hojas `[1,1]`, `[2,2]`, `[3,3]`, `[4,4]` (versión `v1`). Al ejecutar
`Update(v1, pos=4, val)`:

1. En la raíz `[1,4]`, `m=2` y `pos=4 > m`: se desciende por `[3,4]`.
2. En `[3,4]`, `m=3` y `pos=4 > m`: se desciende por `[4,4]`.
3. En `[4,4]`, `l=r=4`: caso base, se copia el nodo con el valor nuevo.
4. Al volver de la recursión, se copian `[3,4]'` (con hijo izquierdo
   compartido `[3,3]` y derecho nuevo `[4,4]'`) y luego la raíz `[1,4]'`
   (con hijo izquierdo compartido `[1,2]` — junto con sus hojas `[1,1]` y
   `[2,2]` — y derecho `[3,4]'`).

Se copian exactamente tres nodos (raíz, `[3,4]`, `[4,4]`); `[1,2]`, `[1,1]`,
`[2,2]`, `[3,3]` se comparten con `v1` sin tocarlos. Ver el paso a paso
completo en la visualización de
[Update](/structures/path-copying/operations/segment-tree-update).

## Límite

El caso patológico de path copying es actualizar **la posición más profunda
posible en la estructura más alta posible**: en un segment tree con `n`
hojas, cualquier `Update` copia un nodo por nivel, y la altura es siempre
$O(\lg n)$ sin importar cuál hoja se actualice — no hay una posición "peor"
que otra, a diferencia de un árbol no balanceado. El peor caso real de la
técnica está en el trie: insertar una cadena de largo `L` copia $O(L)$
nodos, y si `L` no está acotado por $\lg n$ (una cadena mucho más larga que
$\lg(\text{cantidad de cadenas})$), ese camino puede ser arbitrariamente más largo
que el de un segment tree sobre el mismo número de elementos. Lo que "viene
a arreglar" ese costo no es otra estructura — el material no lo plantea
así — sino la observación de la tabla comparativa: el costo de path copying
es siempre exactamente el largo del camino que cambia, así que acotarlo
depende de acotar la altura de la estructura subyacente, no de la técnica
misma.
