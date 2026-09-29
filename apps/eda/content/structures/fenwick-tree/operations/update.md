---
kind: operation
title: Update
order: 1
cppSteps:
  - step-1-lowbit.cpp
  - step-2-update.cpp
  - step-3-prefix-query.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        Estado inicial de `tree[]` para n=8, construido sobre A =
        [1,1,1,1,1,1,1,1] (así `tree[i] = lowbit(i)`, fácil de leer).
        Vamos a ejecutar `Update(i=3, delta=+5)`: sumar 5 a cada `tree[j]`
        cuyo rango incluye la posición 3.
      mode: layers
      arrays:
        - { id: idx, label: i, row: 0, cells: [1, 2, 3, 4, 5, 6, 7, 8] }
        - { id: tree, label: "tree[i]", row: 1, cells: [1, 2, 1, 4, 1, 2, 1, 8] }
    - note: >-
        Arranca en `i=3`. `tree[3]` cubre el rango `(2,3]`, que sí incluye
        la posición 3: hay que actualizarlo.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, active, idle, idle, idle, idle, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 1, 4, 1, 2, 1, 8]
          states: [idle, idle, active, idle, idle, idle, idle, idle]
    - note: "`tree[3] ← tree[3] + 5`: de 1 a 6."
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, active, idle, idle, idle, idle, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 6, 4, 1, 2, 1, 8]
          states: [idle, idle, answer, idle, idle, idle, idle, idle]
    - note: >-
        `lowbit(3) = 1` (`3 = 011` en binario, el bit más bajo aísla un
        `1`): el próximo índice es `i = 3 + 1 = 4`.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, muted, active, idle, idle, idle, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 6, 4, 1, 2, 1, 8]
          states: [idle, idle, shared, idle, idle, idle, idle, idle]
      bridges:
        - { from: idx, fromIndex: 2, to: idx, toIndex: 3, active: true }
    - note: >-
        `tree[4]` cubre `(0,4]`, que también incluye la posición 3: hay que
        actualizarlo.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, muted, active, idle, idle, idle, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 6, 4, 1, 2, 1, 8]
          states: [idle, idle, shared, active, idle, idle, idle, idle]
    - note: "`tree[4] ← tree[4] + 5`: de 4 a 9."
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, muted, active, idle, idle, idle, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 6, 9, 1, 2, 1, 8]
          states: [idle, idle, shared, answer, idle, idle, idle, idle]
    - note: >-
        `lowbit(4) = 4` (`4 = 100` en binario): el próximo índice es
        `i = 4 + 4 = 8`.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, muted, muted, idle, idle, idle, active]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 6, 9, 1, 2, 1, 8]
          states: [idle, idle, shared, shared, idle, idle, idle, idle]
      bridges:
        - { from: idx, fromIndex: 3, to: idx, toIndex: 7, active: true }
    - note: >-
        `tree[8]` cubre `(0,8]`, el arreglo entero — también incluye la
        posición 3: hay que actualizarlo.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, muted, muted, idle, idle, idle, active]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 6, 9, 1, 2, 1, 8]
          states: [idle, idle, shared, shared, idle, idle, idle, active]
    - note: "`tree[8] ← tree[8] + 5`: de 8 a 13."
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, muted, muted, idle, idle, idle, active]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 6, 9, 1, 2, 1, 13]
          states: [idle, idle, shared, shared, idle, idle, idle, answer]
    - note: >-
        `lowbit(8) = 8`, así que el próximo índice sería `8 + 8 = 16`, y
        `16 > n = 8`: el ciclo termina. `Update(i=3, delta=+5)` tocó
        exactamente `tree[3]`, `tree[4]` y `tree[8]` — los tres rangos que
        incluyen la posición 3.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, muted, muted, idle, idle, idle, muted]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 6, 9, 1, 2, 1, 13]
          states: [idle, idle, answer, answer, idle, idle, idle, answer]
---

<!-- Concepto de apoyo: no hay diapositiva que citar (sourceSlides vacío). -->

## Qué hace

Suma un valor `delta` a la posición `i` del arreglo, y propaga el cambio a
todos los rangos que incluyen a `i`.

## Intuición

Un rango `tree[j]` incluye a la posición `i` si y sólo si `j` es uno de los
índices que se alcanza subiendo desde `i` con `j += lowbit(j)`. No hace
falta saber cuáles son de antemano: el propio lowbit los genera uno a uno.

## Algoritmo

1. Mientras `i ≤ n`: sumar `delta` a `tree[i]`.
2. Avanzar `i ← i + (i & -i)`.
3. Repetir hasta que `i` supere `n`.

## Pseudocódigo

```
Update(tree, n, i, delta)
mientras i ≤ n
    tree[i] ← tree[i] + delta
    i ← i + (i & -i)
```

## C++

Ver `step-2-update.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

$O(\lg n)$: cada paso apaga y sube al menos un bit de `i`; con $\lceil \lg n \rceil$ bits en
total, el ciclo termina en a lo más esa cantidad de iteraciones (ver
theory.md).

## Complejidad espacial

$O(1)$ adicional: no hay recursión, sólo un ciclo.

## Ejemplo

Para `n = 8`, `Update(i=3, delta=+5)` toca `tree[3]` (rango `(2,3]`),
`tree[4]` (rango `(0,4]`) y `tree[8]` (rango `(0,8]`): `3 → 4 → 8 → 16`
(`16 > 8`, termina). `tree[5], tree[6], tree[7]` no cambian porque sus
rangos no incluyen la posición 3.

## Casos límite

- **i = n**: sólo toca `tree[n]` y termina de inmediato (`n + lowbit(n) >
  n` siempre).
- **Actualizar con `delta = 0`**: el algoritmo no lo detecta como especial;
  recorre el mismo camino sin cambiar ningún valor.
- **i fuera de `[1, n]`**: no está definido aquí; se asume `1 ≤ i ≤ n` como
  precondición.
