---
kind: examples
title: Ejemplos
---

<!-- Concepto de apoyo: ejemplos construidos para ilustrar update/prefix-query,
     no tomados de ninguna diapositiva (no las hay). -->

## Normal

`A = [1,2,3,4,5,6,7,8]` (n=8), `tree` inicial construido con 8 `Update`
sucesivos. `Update(i=3, delta=+5)` toca `tree[3] → tree[4] → tree[8]`.
`PrefixQuery(6)` suma `tree[6] + tree[4]` (rangos `(4,6]` y `(0,4]`) —
ambos ejemplos completos en `operations/update.md` y
`operations/prefix-query.md`.

## Límite

`i = n = 8`: `Update(8, delta)` sólo toca `tree[8]` (`8 + lowbit(8) = 16 >
8`, termina de inmediato); `PrefixQuery(8)` recorre el camino más largo
posible (`8 → 0`, tocando sólo `tree[8]` porque `lowbit(8)=8` cubre todo el
rango de un salto). El caso patológico que sí motiva otra estructura no es
un tamaño de entrada, sino un cambio de operación: pedir mínimo o máximo en
vez de suma no tiene forma de expresarse con este arreglo (no es
invertible) — ahí la respuesta es el [segment tree](/structures/segment-tree).
