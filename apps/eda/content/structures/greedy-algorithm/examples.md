---
kind: examples
title: Ejemplos
---

Todos los casos están *derivados* ejecutando la regla de la escalera sobre el código de [full-implementation.cpp](/structures/greedy-algorithm/operations/greedy-row); ninguno aparece en las diapositivas.

## Mínimo

Un solo acceso, $x = 1$ sobre una llave. Fila 1: $\{1\}$. $|P| = 1$, ningún punto extra: Greedy no tiene nada que corregir cuando no hay pasado.

## Normal

Secuencia $3, 1, 4, 2$ sobre $\{1, 2, 3, 4\}$ (la de la clase):

| Fila $t$ | Acceso | Escalera derecha | Escalera izquierda | Fila |
|---|---|---|---|---|
| 1 | 3 | — | — | $\{3\}$ |
| 2 | 1 | $3$ ($\mathrm{ult}=1$) | — | $\{1, 3\}$ |
| 3 | 4 | — | $3$ ($\mathrm{ult}=2$) | $\{3, 4\}$ |
| 4 | 2 | $3$ ($\mathrm{ult}=3$) | $1$ ($\mathrm{ult}=2$) | $\{1, 2, 3\}$ |

$|P| = 1 + 2 + 2 + 3 = 8$: **los mismos puntos** que el árbol estático de [geometric-view](/structures/geometric-view). Para esta secuencia Greedy coincide con un BST fijo.

## Límite

Secuencia bit-reversal sobre 8 llaves: $1, 5, 3, 7, 2, 6, 4, 8$ (las posiciones $0\ldots7$ con los bits invertidos, desplazadas en 1). Greedy produce $|P| = 21$ puntos, 13 de ellos extra:
casi $n \lg n = 24$ — y esta secuencia es la que [wilber-1-bound](/structures/wilber-1-bound) demuestra que **no se puede hacer mejor que $\Theta(n \lg n)$** en general.
Contraste con el acceso secuencial $1, 2, 3, 4$: Greedy usa 7 puntos (frente a 10 de la cadena estática), es decir, lineal.
