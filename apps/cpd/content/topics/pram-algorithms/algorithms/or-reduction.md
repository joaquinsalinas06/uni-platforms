---
kind: algorithm
title: "OR global (Global OR)"
order: 1
visualization:
  type: dag
  steps:
    - note: "Todos los n procesadores leen su propio x[i] y, si es 1, escriben Result=1 en el mismo paso (CRCW combinado). No hay estructura de árbol: todos los nodos apuntan directo al resultado, por eso T∞=Θ(1)."
      highlight: ["r"]
      nodes:
        - { id: x1, value: 0, parent: null }
        - { id: x2, value: 1, parent: null }
        - { id: x3, value: 0, parent: null }
        - { id: x4, value: 0, parent: null }
        - { id: r, value: 1, parent: null, state: active }
      links:
        - { from: x1, to: r, kind: shared }
        - { from: x2, to: r, kind: shared }
        - { from: x3, to: r, kind: shared }
        - { from: x4, to: r, kind: shared }
---

## Qué hace

Determina si al menos uno de $n$ elementos booleanos de un arreglo es
verdadero: $R = a_0 \lor a_1 \lor \ldots \lor a_{n-1}$.

## Intuición

Con un procesador por elemento, cada uno revisa su propio valor: si el suyo
es verdadero, "grita" el resultado a la misma celda de memoria. No importa
si varios gritan a la vez (todos escriben el mismo valor 1) porque el
modelo CRCW combinado resuelve esa escritura concurrente sin conflicto. Así,
un solo paso alcanza para decidir el OR de todo el arreglo.

## Algoritmo

Con $n$ procesadores (uno por elemento) y memoria compartida CRCW modelo
*común* (todos los que escriben, escriben el mismo dato), cada procesador
evalúa su propio elemento y escribe en `Result` sólo si su valor es 1.

## Pseudocódigo

```
Algorithm: Parallel Global OR
Input: array x[1, ..., n]
Output: Result
Result ← 0
for i = 1, ..., n pardo
    if x[i] then
        Result ← 1
```

## C++

No aplica: no hay código de ejemplo propio en el material para este
subtema.

## Complejidad

- $T_\infty(n) = \Theta(1)$: con $n$ procesadores, todos los elementos se examinan en
  un único paso simultáneo.
- $W(n) = \Theta(n)$: cada uno de los $n$ procesadores hace una evaluación.

**Reasoning:** como los $n$ procesadores trabajan en paralelo sobre
posiciones distintas del arreglo de entrada, y sólo escriben en `Result`
cuando encuentran un 1 (bajo CRCW combinado, sin conflicto por hacerlo
varios a la vez), el algoritmo termina en un único paso sin importar $n$ —
de ahí $T_\infty = \Theta(1)$. El trabajo sigue siendo $\Theta(n)$ porque cada procesador sí
hace su propia evaluación, aunque todo ocurra "al mismo tiempo".

## Ejemplo

El speedup resultante es $S_n = T_1(n)/T_n(n) = \Theta(n)/\Theta(1) = \Theta(n)$ (lineal) y la
eficiencia $E_n = S_n/n = \Theta(1)$: bajo el modelo ideal Common CRCW, Global OR
obtiene speedup lineal con eficiencia constante.

## Casos especiales

Con $p = 1$ (un solo procesador), el algoritmo se reduce al `for` secuencial
de evaluar cada elemento, con $T_1(n) = \Theta(n)$ — el caso base contra el que se
compara el speedup. Si $n = 0$ (arreglo vacío), `Result` queda en su valor
inicial 0, consistente con que el OR de un conjunto vacío es falso.
