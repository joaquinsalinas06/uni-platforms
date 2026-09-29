---
kind: examples
title: Ejemplos
---

## Mínimo

Un solo punto: el range tree 1D es una única hoja, sin internos y sin
árbol secundario que construir de verdad en 2D (el "secundario" de esa hoja
es ella misma). Toda consulta que lo contenga en su rango lo devuelve como
único subárbol canónico (`P` mismo es la hoja); toda consulta que lo
excluya devuelve la lista vacía. *(Derivado; caso trivial no ilustrado en
las diapositivas.)*

## Normal

El ejemplo del profesor, íntegro: hojas `{3, 4, 7, 9, 13, 15, 18, 27}`
(diapositiva #29), consulta `[5,16]` (diapositiva #35) →
subárboles canónicos `{7, 13}` = hojas `{7, 9, 13, 15}`. Ver el paso a
paso completo en
[build-1d](/structures/range-tree/operations/build-1d) y
[range-query-1d](/structures/range-tree/operations/range-query-1d). En 2D,
el mismo conjunto de X pero con puntos `(3,10) (4,7) (7,11) (9,6) (13,0)
(15,−2) (18,3) (27,1)` (diapositiva #47), con el árbol secundario del nodo
15 mostrado en
[build-2d](/structures/range-tree/operations/build-2d).

## Límite

El peor caso de la tabla de complejidad no es un valor patológico de los
datos (a diferencia de un BST sin balancear): como el árbol subyacente es
[balanced-bst](/structures/balanced-bst), la altura siempre es O(log n) sin
importar el orden de inserción. El caso que sí produce el costo máximo es
estructural: una consulta `[l1, r1]` que cubra **todo** el rango de
llaves. Ahí `Predecessor(l1)` y `Successor(r1)` no existen, `P` es la raíz,
y el único subárbol canónico es la raíz misma — el conteo sigue siendo
$O(\log n)$ (o $O(1)$, leyendo el contador de la raíz), pero
[enumeration](/structures/range-tree/operations/enumeration) cuesta
$O(n)$, el máximo de su fórmula $O(\log n + k)$ con `k = n`. Lo que "arregla"
este límite no es otra estructura (el profesor no propone una): es que
`existence-count` nunca paga ese costo, sólo `enumeration` cuando de verdad
se piden los n puntos. *(Derivado; el mazo no da un ejemplo numérico para
este caso.)*
