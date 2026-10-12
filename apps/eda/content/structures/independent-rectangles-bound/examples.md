---
kind: examples
title: Ejemplos
---

Los tres casos son *derivados* de las definiciones (las diapositivas dan figuras, no cuentas); el valor de $\mathrm{OPT}$ de cada uno se verificó por enumeración de superconjuntos satisfechos.

## Mínimo

$I = \{(1,1), (4,2)\}$: un solo rectángulo $ab$, así que $\mathrm{MIS} = 1$. La cota da $\mathrm{OPT} \ge 2 + \frac{1}{2} = 2.5$, es decir $\mathrm{OPT} \ge 3$. Y $\mathrm{OPT} = 3$ (agregar $(1,2)$ o $(4,1)$): **la cota es ajustada**.

## Normal

$I = \{(1,1), (2,2), (3,3)\}$ (tres accesos en diagonal). Rectángulos: $ab$, $bc$ y $ac$.

- $ab$ y $bc$ **comparten una esquina** (el punto $b$): son independientes (tercer ejemplo de la clase).
- $ac$ contiene a $b$ **estrictamente adentro**: no es independiente de $ab$ ni de $bc$.

Entonces $\mathrm{MIS} = 2$ (por ejemplo $\{ab, bc\}$) y $\mathrm{OPT} \ge 3 + \frac{1}{2} \cdot 2 = 4$. El óptimo real es $5$ (se necesitan 2 puntos extra): la cota es válida pero **no ajustada**, y deja una brecha de 1.

## Límite

La cota es **tan buena como el MIS que se encuentre**. Para $I$ con todos los puntos sobre una misma fila o columna no hay ningún rectángulo, $\mathrm{MIS} = 0$ y la cota se reduce a $\mathrm{OPT} \ge |I|$ (trivial). En el otro extremo, secuencias como bit-reversal tienen un MIS de tamaño $\Theta(n \lg n)$,
que es lo que usa [wilber-1-bound](/structures/wilber-1-bound) para demostrar $\mathrm{OPT} = \Theta(n \lg n)$.
