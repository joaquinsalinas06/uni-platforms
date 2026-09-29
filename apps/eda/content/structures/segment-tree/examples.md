---
kind: examples
title: Ejemplos
---

<!-- Concepto de apoyo: ejemplos construidos para ilustrar build/update/query,
     no tomados de ninguna diapositiva (no las hay). -->

## Mínimo

Un solo elemento, `A = [5]`. El árbol es una única hoja `[1,1]` con
`valor = 5`. `Build` no recursa; `Update` escribe directo en la hoja;
`Query(1,1)` devuelve `5` sin bajar.

## Normal

`A = [1, 2, 3, 4]`, combinar = suma. El árbol de 4 hojas de `theory.md`:
raíz `[1,4]=10`, `[1,2]=3`, `[3,4]=7`, hojas `1,2,3,4`.

- `Update(4, 10)`: sigue el camino `[1,4] → [3,4] → [4,4]`, deja
  `A = [1,2,3,10]` y el árbol con `[4,4]=10`, `[3,4]=13`, `[1,4]=16`.
- `Query(2,4)` sobre el árbol ya actualizado: `[1,2]` parcial (sólo posición
  2), `[3,4]` completo (`13`). Resultado: `2 + 13 = 15` (= `2+3+10`).

## Límite

`n` no potencia de 2, por ejemplo `A = [7, 2, 9]` ($n=3$): la partición
`m=(l+r)/2` da un árbol desbalanceado en forma (`[1,3]` con hijos `[1,2]` y
`[3,3]`), pero la altura sigue siendo $\lceil \lg 3 \rceil = 2$, y
`Update`/`Query` siguen costando $O(\lg n)$. No hace falta ninguna estructura
adicional para arreglar
esto — a diferencia del montículo binario con Union, el segment tree no tiene
un caso patológico que motive pasar a otra estructura; su límite real es que
sólo sirve para funciones asociativas (no, por ejemplo, para "mediana" sin
extenderlo).
