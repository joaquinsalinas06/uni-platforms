---
kind: algorithm
title: "Máximo de n números (CRCW)"
order: 3
visualization:
  type: dag
  steps:
    - note: 'Fase 1: $n^2 = 9$ procesadores comparan cada par (i,j) en paralelo — aquí se muestra sólo la fila i=2 (A[2]=8): B[2,1], B[2,2], B[2,3] se llenan en un único paso, $T_\infty = \Theta(1)$, sin ninguna dependencia entre comparaciones.'
      nodes:
        - { id: a1, value: 3, parent: null }
        - { id: a2, value: 8, parent: null }
        - { id: a3, value: 5, parent: null }
        - { id: b21, value: 1, parent: a2, tag: "B[2,1]", state: active }
        - { id: b22, value: 1, parent: a2, tag: "B[2,2]", state: active }
        - { id: b23, value: 1, parent: a2, tag: "B[2,3]", state: active }
      links:
        - { from: a1, to: b21, kind: shared }
        - { from: a2, to: b21, kind: shared }
        - { from: a2, to: b22, kind: shared }
        - { from: a2, to: b23, kind: shared }
        - { from: a3, to: b23, kind: shared }
    - note: "Fase 2: n=3 procesadores corren un Global AND, uno por fila. Aquí la fila i=2 combina B[2,1..3] con el mismo patrón que Global AND (sin árbol, todos los operandos apuntan directo al resultado en un solo paso): M[2]=AND(1,1,1)=1, confirmando que A[2]=8 es el máximo."
      highlight: ["m2"]
      nodes:
        - { id: b21, value: 1, parent: null, tag: "B[2,1]", state: muted }
        - { id: b22, value: 1, parent: null, tag: "B[2,2]", state: muted }
        - { id: b23, value: 1, parent: null, tag: "B[2,3]", state: muted }
        - { id: m2, value: 1, parent: b21, tag: "M[2]", state: answer }
      links:
        - { from: b21, to: m2, kind: shared }
        - { from: b22, to: m2, kind: shared }
        - { from: b23, to: m2, kind: shared }
---

## Qué hace

Dado un arreglo `A` de $n$ números, calcula un arreglo booleano `M` donde
`M[i] = 1` si y sólo si `A[i]` es el máximo de todo el arreglo.

## Intuición

Un elemento es el máximo exactamente cuando es mayor o igual que *todos* los
demás. Esa es una conjunción (AND) sobre todas las comparaciones de ese
elemento contra el resto. La idea es calcular todas las comparaciones por
pares de una sola vez (con $n^2$ procesadores) y luego, para cada elemento,
resolver el AND de su fila con el [Global AND](/topics/pram-algorithms/algorithms/and-reduction)
ya visto.

## Algoritmo

1. Con $n^2$ procesadores (uno por par $(i,j)$), cada uno calcula
   `B[i,j] ← A[i] ≥ A[j]` en paralelo.
2. Con $n$ procesadores (uno por fila $i$), cada uno calcula `M[i]` como el
   AND de toda la fila `B[i, 1..n]` usando el algoritmo de Global AND.

## Pseudocódigo

```
Algorithm: Cálculo del máximo de n números
Input: array A[1, ..., n]
Output: array M[1, ..., n], M[i] = 1 iff A[i] = max_j A[j]

forall (i, j) ∈ {1, ..., n}² pardo
    B[i, j] ← A[i] ≥ A[j]

forall i ∈ {1, ..., n} pardo
    M[i] ← AND de B[i, j] para j = 1 hasta n
```

## C++

No aplica: no hay código de ejemplo propio en el material para este
subtema.

## Complejidad

- Fase 1 (comparaciones): $W(n) = \Theta(n^2)$, $T_\infty = \Theta(1)$ (con $n^2$
  procesadores, todas las comparaciones son independientes).
- Fase 2 (AND por fila): hereda el análisis de
  [Global AND](/topics/pram-algorithms/algorithms/and-reduction):
  $T_\infty = \Theta(1)$, $W(n) = \Theta(n)$ por fila, $\Theta(n^2)$ en total para las $n$ filas.

**Reasoning:** el costo dominante es la fase de comparaciones por pares,
que necesita $n^2$ operaciones porque cada elemento se compara contra todos
los demás (incluido él mismo); ambas fases son $\Theta(1)$ en span porque cada
una se resuelve con un modelo CRCW/AND que no depende de $n$ en
profundidad, sólo en la cantidad de procesadores disponibles.

## Ejemplo

Para `A = [3, 8, 5]`: la fila `i=2` (correspondiente a `A[2]=8`) da
`B[2,1]=1, B[2,2]=1, B[2,3]=1` porque 8 es mayor o igual a los tres
elementos (incluido él mismo), por lo que `M[2] = AND(1,1,1) = 1`: el
elemento en la posición 2 es el máximo. Las filas 1 y 3 tienen al menos un
0 en su comparación contra el elemento mayor, por lo que su AND da 0.

## Casos especiales

Si hay empates (varios elementos iguales al máximo), `M` marca todos esos
índices con 1 simultáneamente — el algoritmo encuentra *todas* las
posiciones del máximo, no una sola. Con $n = 1$, la única comparación es
`A[1] ≥ A[1]`, siempre verdadera, y `M[1] = 1` trivialmente.
