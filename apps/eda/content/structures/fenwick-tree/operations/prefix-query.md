---
kind: operation
title: Prefix query
order: 2
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
        `tree[]` para n=8 sobre A = [1,1,1,1,1,1,1,1] (`tree[i] =
        lowbit(i)`). Vamos a ejecutar `PrefixQuery(i=7)`: sumar los rangos
        que cubren `[1,7]` sin traslape, bajando con `i -= lowbit(i)`.
      mode: layers
      arrays:
        - { id: idx, label: i, row: 0, cells: [1, 2, 3, 4, 5, 6, 7, 8] }
        - { id: tree, label: "tree[i]", row: 1, cells: [1, 2, 1, 4, 1, 2, 1, 8] }
        - { id: sum, label: suma, row: 2, cells: [0] }
    - note: >-
        Arranca en `i=7`. `lowbit(7) = 1` (`7 = 0111` en binario): `tree[7]`
        cubre el rango `(6,7]`.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, idle, idle, idle, active, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 1, 4, 1, 2, 1, 8]
          states: [idle, idle, idle, idle, idle, idle, active, idle]
        - { id: sum, label: suma, row: 2, cells: [0] }
    - note: "`suma ← suma + tree[7]`: de 0 a 0 + 1 = 1."
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, idle, idle, idle, active, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 1, 4, 1, 2, 1, 8]
          states: [idle, idle, idle, idle, idle, idle, answer, idle]
        - { id: sum, label: suma, row: 2, cells: [1], states: [answer] }
    - note: >-
        `lowbit(7) = 1`: el próximo índice es `i = 7 - 1 = 6`. El rango
        `(6,7]` ya quedó sumado; falta cubrir `[1,6]`.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, idle, idle, active, muted, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 1, 4, 1, 2, 1, 8]
          states: [idle, idle, idle, idle, idle, idle, shared, idle]
        - { id: sum, label: suma, row: 2, cells: [1], states: [shared] }
      bridges:
        - { from: idx, fromIndex: 6, to: idx, toIndex: 5, active: true }
    - note: >-
        `lowbit(6) = 2` (`6 = 0110` en binario): `tree[6]` cubre el rango
        `(4,6]`.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, idle, idle, active, muted, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 1, 4, 1, 2, 1, 8]
          states: [idle, idle, idle, idle, idle, active, shared, idle]
        - { id: sum, label: suma, row: 2, cells: [1], states: [shared] }
    - note: "`suma ← suma + tree[6]`: de 1 a 1 + 2 = 3."
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, idle, idle, active, muted, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 1, 4, 1, 2, 1, 8]
          states: [idle, idle, idle, idle, idle, answer, shared, idle]
        - { id: sum, label: suma, row: 2, cells: [3], states: [answer] }
    - note: >-
        `lowbit(6) = 2`: el próximo índice es `i = 6 - 2 = 4`. El rango
        `(4,6]` ya quedó sumado; falta cubrir `[1,4]`.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, active, idle, muted, muted, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 1, 4, 1, 2, 1, 8]
          states: [idle, idle, idle, idle, idle, shared, shared, idle]
        - { id: sum, label: suma, row: 2, cells: [3], states: [shared] }
      bridges:
        - { from: idx, fromIndex: 5, to: idx, toIndex: 3, active: true }
    - note: >-
        `lowbit(4) = 4` (`4 = 0100` en binario): `tree[4]` cubre el rango
        `(0,4]`, el que falta.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, active, idle, muted, muted, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 1, 4, 1, 2, 1, 8]
          states: [idle, idle, idle, active, idle, shared, shared, idle]
        - { id: sum, label: suma, row: 2, cells: [3], states: [shared] }
    - note: "`suma ← suma + tree[4]`: de 3 a 3 + 4 = 7."
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, active, idle, muted, muted, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 1, 4, 1, 2, 1, 8]
          states: [idle, idle, idle, answer, idle, shared, shared, idle]
        - { id: sum, label: suma, row: 2, cells: [7], states: [answer] }
    - note: >-
        `lowbit(4) = 4`: el próximo índice sería `i = 4 - 4 = 0`, y el ciclo
        termina (`i > 0` ya no se cumple). `PrefixQuery(7)` sumó `tree[7] +
        tree[6] + tree[4] = 1 + 2 + 4 = 7`, exactamente `A[1..7]`.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, muted, idle, muted, muted, idle]
        - id: tree
          label: "tree[i]"
          row: 1
          cells: [1, 2, 1, 4, 1, 2, 1, 8]
          states: [idle, idle, idle, answer, idle, answer, answer, idle]
        - { id: sum, label: suma, row: 2, cells: [7], states: [answer] }
---

<!-- Concepto de apoyo: no hay diapositiva que citar (sourceSlides vacío). -->

## Qué hace

Devuelve la suma `A[1] + ... + A[i]` combinando los rangos ya precomputados
en `tree`, sin sumar elemento por elemento.

## Intuición

`[1, i]` se puede cubrir sin traslape con una cantidad logarítmica de rangos
`tree[j]`: el primero es el rango que termina en `i` (`tree[i]` mismo), el
siguiente es el rango que termina justo antes de donde empezó ese, y así
sucesivamente — se llega a cada uno bajando con `i -= lowbit(i)`.

## Algoritmo

1. `suma ← 0`.
2. Mientras `i > 0`: sumar `tree[i]` a `suma`.
3. Retroceder `i ← i - (i & -i)`.
4. Repetir hasta que `i` llegue a 0; devolver `suma`.

## Pseudocódigo

```
PrefixQuery(tree, i)
suma ← 0
mientras i > 0
    suma ← suma + tree[i]
    i ← i - (i & -i)
devolver suma
```

## C++

Ver `step-3-prefix-query.cpp` y `full-implementation.cpp` en el editor de
arriba.

## Complejidad temporal

$O(\lg n)$: cada paso apaga un bit de `i`; con $\lceil \lg n \rceil$ bits en total, el ciclo
termina en a lo más esa cantidad de iteraciones (ver theory.md).

## Complejidad espacial

$O(1)$ adicional: no hay recursión, sólo un ciclo.

## Ejemplo

Para `n = 8` con los rangos de theory.md, `PrefixQuery(i=6)` suma `tree[6]`
(rango `(4,6]`) y `tree[4]` (rango `(0,4]`): `6 → 4 → 0` (termina). Juntos,
`(0,4] ∪ (4,6] = (0,6]`, exactamente el prefijo pedido, sin traslape.

## Casos límite

- **i = 0**: el ciclo no entra ninguna vez; devuelve `0` (suma vacía).
- **i = n**: recorre el camino más largo posible dentro de `[1,n]`, pero
  sigue siendo $O(\lg n)$.
- **Rango completo vía resta**: `suma(l, r) = PrefixQuery(r) -
  PrefixQuery(l-1)` — no es una operación nueva, es esta misma combinada
  dos veces; por eso Fenwick sólo sirve para operaciones invertibles (ver
  la comparación en theory.md).
