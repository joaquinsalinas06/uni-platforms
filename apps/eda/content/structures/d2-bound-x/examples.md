---
kind: examples
title: Ejemplos
---

<!-- El material (#32-34) no trae ejemplos numéricos propios. Los tres casos
     de abajo son derivados del pseudocódigo/descripción del profesor. -->

## Mínimo

*(derivado; no aparece en las diapositivas)* Un solo punto `(4, 8)`. El BST
sobre x es una sola hoja, cuya $D_1$ satélite contiene ese único punto.
Cualquier consulta $[x_1, x_2] \times (-\infty, b_2] \times (-\infty, b_3)$ con $x_1 \le 4 \le x_2$ se
reduce a una sola consulta de dominancia sobre esa $D_1$, con $b_2 \ge 8$ y
$b_3 \ge 4$ para que el punto aparezca.

## Normal

*(derivado; no aparece en las diapositivas)* Puntos
`{(1,5), (3,2), (4,8), (6,1)}`. El BST sobre x tiene raíz x=4, hijo izquierdo
x=3 (con hijo izquierdo x=1) e hijo derecho x=6. Cada nodo guarda su $D_1$
satélite (ver `operations/build.md`). Una consulta
$[2, 5] \times (-\infty, 6] \times (-\infty, 10]$ descompone $[2,5]$ canónicamente en el BST de
x y dispara una consulta de dominancia `(6, 10)` en cada nodo canónico
resultante.

## Límite

*(derivado; no aparece en las diapositivas)* Todos los puntos tienen la misma
x (por ejemplo `{(5,1), (5,2), (5,3)}`): el BST sobre x degenera a un único
nodo relevante (o una cadena, según cómo se rompan los empates), y toda la
carga de la consulta cae sobre una sola $D_1$ satélite — $D_2$ no aporta nada en
este caso, el trabajo real lo hace $D_1$. El profesor no discute este caso en
la sección; se sigue directamente de que $D_2$ es un BST estándar sobre x.
