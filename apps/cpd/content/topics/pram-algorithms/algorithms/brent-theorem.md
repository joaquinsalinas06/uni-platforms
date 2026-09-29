---
kind: algorithm
title: "Teorema de Brent"
order: 5
visualization:
  type: dag
  steps:
    - note: 'Paso 1: el camino crítico $T_\infty = 20$ son 20 pasos secuenciales de dependencia genuina — nadie puede saltárselos, ni con procesadores ilimitados. El resto del trabajo ($W - T_\infty = 980$ unidades) todavía no se ha tocado.'
      highlight: ["t1", "t2", "t3", "t20"]
      nodes:
        - { id: t1, value: "paso 1", parent: null, state: marked }
        - { id: t2, value: "paso 2", parent: t1, state: marked }
        - { id: t3, value: "...", parent: t2, state: marked }
        - { id: t20, value: "paso 20", parent: t3, state: marked }
      links:
        - { from: t1, to: t2, kind: tree }
        - { from: t2, to: t3, kind: tree }
        - { from: t3, to: t20, kind: tree }
    - note: 'Paso 2: con $p = 10$ procesadores, las 980 unidades restantes del trabajo se reparten entre ellos (~98 cada uno) y se suman al piso fijo $T_\infty = 20$: $T_p \approx 1000/10 + 20 = 120$.'
      caption: "$T_p \approx 1000/10 + 20 = 120$"
      nodes:
        - { id: t1, value: "paso 1", parent: null, state: marked }
        - { id: t2, value: "paso 2", parent: t1, state: marked }
        - { id: t3, value: "...", parent: t2, state: marked }
        - { id: t20, value: "paso 20", parent: t3, state: marked }
        - { id: rest, value: "980/10 ≈ 98 c/u", parent: t20, tag: "p=10", state: active }
      links:
        - { from: t1, to: t2, kind: tree }
        - { from: t2, to: t3, kind: tree }
        - { from: t3, to: t20, kind: tree }
        - { from: t20, to: rest, kind: tree }
    - note: 'Paso 3: subir a $p = 100$ procesadores encoge mucho el reparto (~9.8 c/u), pero $T_\infty = 20$ no cambia — $T_p \approx 1000/100 + 20 = 30$, no 12. Multiplicar $p$ por 10 no divide $T_p$ por 10: el camino crítico es un piso que ni un ejército de procesadores puede bajar.'
      caption: "$T_p \approx 1000/100 + 20 = 30$"
      highlight: ["rest"]
      nodes:
        - { id: t1, value: "paso 1", parent: null, state: marked }
        - { id: t2, value: "paso 2", parent: t1, state: marked }
        - { id: t3, value: "...", parent: t2, state: marked }
        - { id: t20, value: "paso 20", parent: t3, state: marked }
        - { id: rest, value: "980/100 ≈ 9.8 c/u", parent: t20, tag: "p=100", state: active }
      links:
        - { from: t1, to: t2, kind: tree }
        - { from: t2, to: t3, kind: tree }
        - { from: t3, to: t20, kind: tree }
        - { from: t20, to: rest, kind: tree }
---

## Qué hace

Da una cota superior constructiva para el tiempo de ejecución $T_p(n,p)$ de
un algoritmo paralelo, a partir únicamente de su trabajo total $W(n)$ y su
span $T_\infty(n)$, para cualquier número de procesadores $p$ disponibles.

## Intuición

Si conoces cuánto trabajo total hace un algoritmo ($W$) y cuál es su cadena
más larga de dependencias ($T_\infty$), no necesitas rediseñarlo para saber cuánto
tarda con $p$ procesadores reales: el teorema de Brent te da directamente
una cota. La idea es que durante los $T_\infty$ pasos del camino crítico ya se
hace al menos una unidad de trabajo por paso, y lo que sobra del trabajo
total se reparte parejo entre los $p$ procesadores.

## Algoritmo

No es un algoritmo en sí, sino una técnica de análisis que se aplica a
cualquier algoritmo PRAM del que se conozcan $W(n)$ y $T_\infty(n)$ — como los
cuatro anteriores ([OR](/topics/pram-algorithms/algorithms/or-reduction),
[AND](/topics/pram-algorithms/algorithms/and-reduction),
[máximo](/topics/pram-algorithms/algorithms/max-reduction),
[suma](/topics/pram-algorithms/algorithms/sum-reduction)).

## Pseudocódigo

```
// no aplica: Brent es un resultado de análisis, no un procedimiento.
// Se usa así, dado W(n) y T∞(n) de un algoritmo y p procesadores:
Tp(n, p) ← ceil(W(n) / p) + T∞(n)
```

## C++

No aplica: es un resultado teórico de análisis, sin código de ejemplo
propio en el material.

## Complejidad

$$T(n,p) = \sum_{i=1}^{T_\infty(n)} \left\lceil \frac{W_i(n)}{p} \right\rceil \le \left\lceil \frac{W(n)}{p} \right\rceil + T_\infty(n)$$

**Reasoning (demostración según Jájá):** sea $W_i(n)$ la cantidad de
operaciones ejecutadas en el paso $i$, $1 \le i \le T_\infty(n)$. Ejecutar $W_i(n)$
operaciones toma como máximo $\lceil W_i(n)/p \rceil$ pasos en paralelo con $p$
procesadores. Sumando sobre todos los pasos del camino crítico se obtiene la
cota de arriba.

**Demostración alternativa (reparto directo):** durante los $T_\infty$ pasos del
camino crítico se hace al menos una unidad de trabajo por paso, dejando
$W - T_\infty$ unidades adicionales que se reparten entre $p$ procesadores:

$$T_p \le T_\infty + \frac{W - T_\infty}{p} = \frac{W}{p} + \left(1 - \frac{1}{p}\right) T_\infty = O\!\left(\frac{W}{p} + T_\infty\right)$$

El costo (máximo) queda $C_p(n,p) = T_p(n,p) \cdot p = O(W(n) + T_\infty(n) \cdot p)$,
y $W(n)$ coincide con $C_p(n)$ cuando $p = O(W(n)/T_\infty(n))$. $W/p$ es el
reparto ideal del trabajo; $T_\infty$ es el límite impuesto por las dependencias,
que ni infinitos procesadores pueden acortar — Brent es un modelo teórico
donde no existe comunicación y la sincronización es implícita.

## Ejemplo

Con $W = 1000$ operaciones y $T_\infty = 20$ pasos paralelos:

- Con $p = 10$ procesadores: $T_p \approx 1000/10 + 20 = 120$.
- Con $p = 100$ procesadores: $T_p \approx 1000/100 + 20 = 30$.

Note que multiplicar $p$ por 10 no divide $T_p$ por 10 (pasaría de 120 a 30,
no a 12): el término $T_\infty = 20$ es un piso que no baja aunque $p$ crezca
arbitrariamente.

## Casos especiales

Si $p \ge W(n)/T_\infty(n)$, agregar más procesadores deja de ayudar de forma
significativa porque el término $T_\infty$ domina la cota — el algoritmo queda
limitado por su camino crítico, no por la falta de procesadores. Con
$p = 1$, la cota se reduce a $T_p \approx W(n)$, el tiempo puramente secuencial
(coincide con la definición de $W$ como trabajo total).
