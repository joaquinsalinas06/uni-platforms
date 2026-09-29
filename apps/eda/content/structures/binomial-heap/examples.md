---
kind: examples
title: Ejemplos
---

<!-- El mazo no trae ejemplos numéricos para el montículo binomial (única
     carencia grande que reporta el análisis de la fuente). Los tres
     ejemplos de abajo están derivados ejecutando a mano el pseudocódigo
     del profesor; no aparecen en las diapositivas. -->

## Mínimo

El caso más pequeño donde Union hace algo distinto de "simplemente pegar
las dos listas": dos montículos de un solo nodo cada uno, `{7}` y `{3}`.

`Union({7}, {3})`: ambos son $B_0$ (mismo grado), así que se enlazan con
[Binomial-Link](/structures/binomial-heap/operations/binomial-link). Como
`key(7) ≥ key(3)`, 7 se vuelve hijo de 3. Resultado: un único $B_1$ con raíz
3 e hijo 7 — dos nodos, $10_2$. Sin este acarreo (si las llaves tuvieran
grados distintos, por ejemplo un $B_0$ y un $B_1$), Union simplemente los
dejaría como dos raíces separadas, sin ningún enlace.

## Normal

Construir un montículo insertando 5, 2, 9, 1, 8 en ese orden (traza
completa, cada Insert es una Union con un $B_0$ nuevo):

| insertar | montículo resultante (raíces, con hijos entre paréntesis) | por qué |
| --- | --- | --- |
| 5 | `{5}` | primer nodo, un $B_0$ suelto |
| 2 | `{2(hijo 5)}` | 5 y 2 son ambos $B_0$: acarreo, nace un $B_1$ (raíz 2, porque $2 \le 5$) |
| 9 | `{9, 2(hijo 5)}` | 9 es $B_0$, el montículo ya tiene un $B_1$: sin acarreo, 9 queda suelto |
| 1 | `{1(hijos 2 y 9; 2 conserva a 5)}` | 9 y 1 son $B_0$, se funden en $B_1$ (raíz 1, hijo 9); ese $B_1$ nuevo choca con el $B_1$ existente (raíz 2, hijo 5): segundo acarreo, se funden en un $B_2$ (raíz 1, hijos 2 y 9) |
| 8 | `{8, 1(hijos 2(hijo 5) y 9)}` | 8 es $B_0$, el montículo ya tiene un $B_2$ y ningún $B_0$ ni $B_1$: sin acarreo |

Al final: 5 nodos = $101_2$, un $B_0$ (8) y un $B_2$ (raíz 1). `Find-Min`
recorre las dos raíces y devuelve 1 en $O(\lg n)$ — aquí, dos
comparaciones.

## Límite

El caso patológico de Insert: un montículo que ya tiene $B_0, B_1, B_2$ (7
nodos, $111_2$) y se inserta un nuevo $B_0$. El acarreo se propaga por los
tres órdenes existentes, fundiéndolos todos en un único $B_3$ de 8 nodos
($1000_2$) — el equivalente binomial de sumar 1 a $0111_2$ y que el acarreo
recorra los cuatro bits. Es exactamente el caso que hace que un Insert
individual cueste $O(\lg n)$ en el peor caso, aunque el análisis agregado
(ver [theory.md](/structures/binomial-heap)) muestre que amortizado sigue
costando $O(1)$.

Esto es lo que el montículo binomial viene a arreglar frente al
[montículo binario](/structures/binary-heap): ahí, unir dos montículos de
$n_1$ y $n_2$ elementos cuesta $\Theta(n_1 + n_2)$ sin importar la forma de
los datos; aquí, incluso en el peor caso de Insert, el costo se queda en
$O(\lg n)$.
