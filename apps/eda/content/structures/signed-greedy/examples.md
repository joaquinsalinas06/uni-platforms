---
kind: examples
title: Ejemplos
---

Todos derivados ejecutando $\text{Greedy}^+$ y $\text{Greedy}^-$ (código de la teoría); el valor de OPT salió por enumeración. No aparecen en las diapositivas.

## Mínimo

Un acceso: ninguno de los dos Greedys tiene nada que mirar; $\text{Greedy}^+ = \text{Greedy}^- = 1$ y Signed-Greedy $= 1 = \mathrm{OPT}$.

## Normal

Secuencia $3, 1, 4, 2$ sobre $\{1,2,3,4\}$: $\text{Greedy}^+ = 7$, $\text{Greedy}^- = 7$, Signed-Greedy $= 7$. Greedy completo usa 8 y $\mathrm{OPT} = 8$. Signed-Greedy queda **uno por debajo**: es la brecha de no satisfacer positivos y negativos a la vez.

## Límite

Acceso secuencial $1, 2, 3, 4$: $\text{Greedy}^+ = 7$, $\text{Greedy}^- = 4$ (nada a la derecha), Signed-Greedy $= 7 = \mathrm{OPT}$: aquí la cota es **exacta**, y coincide con Greedy.
Para bit-reversal sobre 8 llaves ($1,5,3,7,2,6,4,8$): $\text{Greedy}^+ = 20$, $\text{Greedy}^- = 14$ y Greedy $= 21$: Signed-Greedy es el 95 % de Greedy.
