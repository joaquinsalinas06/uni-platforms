---
kind: algorithm
title: "AND global (Global AND)"
order: 2
visualization:
  type: dag
  steps:
    - note: "Análogo a Global OR pero con la condición invertida: cada procesador escribe Result=0 si encuentra un x[i] falso. Igual que en OR, no hay estructura de árbol — todos apuntan directo al resultado en un solo paso."
      highlight: ["r"]
      nodes:
        - { id: x1, value: 1, parent: null }
        - { id: x2, value: 1, parent: null }
        - { id: x3, value: 0, parent: null }
        - { id: x4, value: 1, parent: null }
        - { id: r, value: 0, parent: null, state: active }
      links:
        - { from: x1, to: r, kind: shared }
        - { from: x2, to: r, kind: shared }
        - { from: x3, to: r, kind: shared }
        - { from: x4, to: r, kind: shared }
---

## Qué hace

Determina si todos los $n$ elementos booleanos de un arreglo son
verdaderos: $R = a_0 \land a_1 \land \ldots \land a_{n-1}$.

## Intuición

Es el espejo de [Global OR](/topics/pram-algorithms/algorithms/or-reduction):
en vez de que cada procesador anuncie cuando encuentra un valor verdadero,
cada uno anuncia cuando encuentra uno *falso*, apagando el resultado
compartido. Si nadie encuentra un falso, el resultado queda en verdadero.

## Algoritmo

Con $n$ procesadores (uno por elemento) y memoria compartida CRCW modelo
*común*, cada procesador evalúa su propio elemento y escribe `Result ← 0`
sólo si su valor es falso.

## Pseudocódigo

```
Algorithm: Parallel Global AND
Input: array x[1, ..., n]
Output: Result
Result ← 1
for i = 1, ..., n pardo
    if not x[i] then
        Result ← 0
```

## C++

No aplica: no hay código de ejemplo propio en el material para este
subtema.

## Complejidad

- $T_\infty(n) = \Theta(1)$, $W(n) = \Theta(n)$.

**Reasoning:** el análisis de complejidad es simétrico al de Global OR —
cada uno de los $n$ procesadores evalúa su elemento en el mismo paso
concurrente, y sólo escribe cuando su condición se cumple (aquí, "es
falso"). El resultado se decide en un único paso, de ahí $T_\infty = \Theta(1)$, con
$W(n) = \Theta(n)$ por las $n$ evaluaciones hechas.

## Ejemplo

Igual que en Global OR, el speedup es $S_n = \Theta(n)/\Theta(1) = \Theta(n)$ (lineal) con
eficiencia $E_n = \Theta(1)$. Este resultado es el que usa directamente
[máximo de n números](/topics/pram-algorithms/algorithms/max-reduction),
que reduce su problema a un Global AND sobre una matriz de comparaciones.

## Casos especiales

Con $p = 1$, se reduce al `for` secuencial de evaluar cada elemento
($T_1(n) = \Theta(n)$). Con $n = 0$ (arreglo vacío), `Result` queda en su valor
inicial 1, consistente con que el AND de un conjunto vacío es verdadero.
