---
kind: examples
title: Ejemplos
---

Derivados de la definición (los valores de $\mathrm{OPT}$ se verificaron por enumeración); no aparecen en las diapositivas.

## Mínimo

Un solo acceso: no hay puntos anteriores, $\text{Wilber-2} = 0$ y la cota es $\mathrm{OPT} \ge |I| + 0 = 1$, que es exacta.

## Normal

Secuencia $3, 1, 4, 2$: sólo el último punto tiene alternancias, y son 2 (signos $+ - +$). La cota $\mathrm{OPT} \ge 4 + \frac{2}{2} = 5$. El óptimo real es $\mathrm{OPT} = 8$ (lo que usan tanto Greedy como el árbol de la clase): la cota es válida pero **muy floja** en una secuencia tan corta.

## Límite

Secuencia bit-reversal de 8 llaves ($1,5,3,7,2,6,4,8$): $\text{Wilber-2} = 6$, frente a $|I| = 8$ y a los 21 puntos de Greedy. Para secuencias tan chicas la cota no dice mucho; lo que importa es su **crecimiento**: [wilber-1-bound](/structures/wilber-1-bound) muestra que en bit-reversal las alternancias crecen como $\Theta(n \lg n)$.
Para el acceso secuencial $1, 2, 3, 4$ vale $0$: ningún punto "ve" dos lados.
