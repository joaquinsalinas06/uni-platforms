---
kind: examples
title: Ejemplos
---

## Mínimo

Un solo segmento horizontal `S = ((2,5), (10,5))` y un punto de consulta
`(6, 2)`, por debajo de `S`. El rayo vertical hacia arriba desde `(6,2)` sube
por `x = 6` (entre `2` y `10`, dentro del rango del segmento) y toca `S` a
altura `y = 5`. Como sólo hay un segmento en el conjunto, no hace falta
comparar mínimos: el primer (y único) segmento que toca el rayo es `S`. Éste
es el caso donde la reducción "menor y ≥ y_i" es trivial porque no hay nada
que minimizar. *(derivado del enunciado del profesor; no aparece en las
diapositivas con estos números)*.

## Normal

Los tres puntos de consulta que usa el profesor sobre el mapa de #8: `(4,12)`,
`(8,4)` y `(19,4)` (#23), cada uno con su rayo vertical hacia arriba:

```
                y
             16 |
                |
             12 |  (4,12)
                |    .
                |    ↑
              8 |    |         segmento techo del mapa
                |    |________________________________
              4 |    |   (8,4)         (19,4)
                |    |     .              .
                |    |     ↑              ↑
              0 +----+-----+--------------+----------- x
                0    4     8              19
```

- Desde `(4,12)`: el rayo sube y el primer segmento que toca es el que
  delimita la cara de arriba en esa columna — el punto queda caracterizado
  por ese segmento, sin necesidad de saber el nombre o la forma de la cara.
- Desde `(8,4)` y `(19,4)`: ambos rayos suben por columnas distintas
  (`x = 8` y `x = 19`); cada uno toca el segmento que resulta ser el "menor
  $y \ge y_i$" de los segmentos que cruzan esa vertical (#22). Aunque las dos
  columnas son distintas, si el primer segmento que tocan resulta ser el
  mismo, ambos puntos quedan caracterizados como parte de la misma cara —
  así es como la reducción responde PPL sin razonar sobre regiones.

## Límite

El caso patológico es el que el propio profesor deja abierto: un rayo que no
es vertical, en una dirección arbitraria (#58). La reducción de esta sección
sólo cubre rayos verticales (hacia arriba o hacia abajo); "¿Cómo resolvemos
eficientemente un ray shooting con una dirección arbitraria? Este problema es
de interés para un caso en 3 dimensiones (ray tracing)" (#58) queda
explícitamente sin resolver en el curso — no hay una estructura posterior en
el material que lo "venga a arreglar". Dentro de los rayos verticales, el
caso límite es un segmento vertical exactamente sobre `x = x_i`, que rompe la
noción de "una única altura de cruce" — ver los casos límite en
[ray-query.md](/structures/vertical-ray-shooting/operations/ray-query#casos-límite).
