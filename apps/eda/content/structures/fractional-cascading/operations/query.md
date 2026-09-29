---
kind: operation
title: Consulta
order: 2
cppSteps:
  - step-1-node.cpp
  - step-2-augmented-list.cpp
  - step-3-build.cpp
  - step-4-query.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        Estado de partida: las tres listas aumentadas construidas por
        `build`, cada elemento promovido (marcado) con su puente hacia el
        nivel siguiente. Buscamos x = 9 en las tres a la vez.
      mode: layers
      arrays:
        - { id: L3, label: L3, row: 2, cells: [4, 9, 13, 18, 22] }
        - id: Lp2
          label: "L'2"
          row: 1
          cells: [3, 5, 9, 12, 18]
          states: [idle, idle, marked, idle, marked]
        - id: Lp1
          label: "L'1"
          row: 0
          cells: [2, 5, 8, 12, 15]
          states: [idle, marked, idle, marked, idle]
      bridges:
        - { from: Lp2, fromIndex: 2, to: L3, toIndex: 1, active: false }
        - { from: Lp2, fromIndex: 4, to: L3, toIndex: 3, active: false }
        - { from: Lp1, fromIndex: 1, to: Lp2, toIndex: 1, active: false }
        - { from: Lp1, fromIndex: 3, to: Lp2, toIndex: 3, active: false }
      caption: "buscar x = 9"
    - note: >-
        Única búsqueda binaria real de todo el algoritmo: en L'1, 9 cae
        entre 8 y 12* (posición 3, marcada como respuesta). Cuesta O(lg n)
        y no se repite en ninguna otra lista.
      mode: layers
      arrays:
        - { id: L3, label: L3, row: 2, cells: [4, 9, 13, 18, 22] }
        - id: Lp2
          label: "L'2"
          row: 1
          cells: [3, 5, 9, 12, 18]
          states: [idle, idle, marked, idle, marked]
        - id: Lp1
          label: "L'1"
          row: 0
          cells: [2, 5, 8, 12, 15]
          states: [idle, marked, idle, answer, idle]
      bridges:
        - { from: Lp2, fromIndex: 2, to: L3, toIndex: 1, active: false }
        - { from: Lp2, fromIndex: 4, to: L3, toIndex: 3, active: false }
        - { from: Lp1, fromIndex: 1, to: Lp2, toIndex: 1, active: false }
        - { from: Lp1, fromIndex: 3, to: Lp2, toIndex: 3, active: false }
    - note: >-
        Se baja el puente más cercano (el de 12*, en la posición 3 de
        L'1) hacia L'2: aterriza en la posición 3, a lo más ±1 de donde
        9 realmente va. Ajustar esa posición cuesta O(1), no una nueva
        búsqueda binaria.
      mode: layers
      arrays:
        - { id: L3, label: L3, row: 2, cells: [4, 9, 13, 18, 22] }
        - id: Lp2
          label: "L'2"
          row: 1
          cells: [3, 5, 9, 12, 18]
          states: [idle, idle, marked, idle, marked]
        - id: Lp1
          label: "L'1"
          row: 0
          cells: [2, 5, 8, 12, 15]
          states: [idle, marked, idle, answer, idle]
      bridges:
        - { from: Lp2, fromIndex: 2, to: L3, toIndex: 1, active: false }
        - { from: Lp2, fromIndex: 4, to: L3, toIndex: 3, active: false }
        - { from: Lp1, fromIndex: 1, to: Lp2, toIndex: 1, active: false }
        - { from: Lp1, fromIndex: 3, to: Lp2, toIndex: 3, active: true }
    - note: >-
        Ajuste O(1) en L'2: 9 está exactamente en la posición 2 (marcada
        como respuesta), y además es un elemento promovido — trae su
        propio puente hacia L3, listo para el siguiente descenso.
      mode: layers
      arrays:
        - { id: L3, label: L3, row: 2, cells: [4, 9, 13, 18, 22] }
        - id: Lp2
          label: "L'2"
          row: 1
          cells: [3, 5, 9, 12, 18]
          states: [idle, idle, answer, idle, marked]
        - id: Lp1
          label: "L'1"
          row: 0
          cells: [2, 5, 8, 12, 15]
          states: [idle, marked, idle, answer, idle]
      bridges:
        - { from: Lp2, fromIndex: 2, to: L3, toIndex: 1, active: true }
        - { from: Lp2, fromIndex: 4, to: L3, toIndex: 3, active: false }
        - { from: Lp1, fromIndex: 1, to: Lp2, toIndex: 1, active: false }
        - { from: Lp1, fromIndex: 3, to: Lp2, toIndex: 3, active: false }
    - note: >-
        Se baja el puente de 9 (posición 2 de L'2) hacia L3: aterriza
        exactamente en la posición 1, donde 9 sí está. Ajuste O(1), sin
        ninguna búsqueda binaria — van dos niveles bajados y sólo una
        búsqueda real se pagó, en L'1.
      mode: layers
      arrays:
        - id: L3
          label: L3
          row: 2
          cells: [4, 9, 13, 18, 22]
          states: [idle, answer, idle, idle, idle]
        - id: Lp2
          label: "L'2"
          row: 1
          cells: [3, 5, 9, 12, 18]
          states: [idle, idle, answer, idle, marked]
        - id: Lp1
          label: "L'1"
          row: 0
          cells: [2, 5, 8, 12, 15]
          states: [idle, marked, idle, answer, idle]
      bridges:
        - { from: Lp2, fromIndex: 2, to: L3, toIndex: 1, active: true }
        - { from: Lp2, fromIndex: 4, to: L3, toIndex: 3, active: false }
        - { from: Lp1, fromIndex: 1, to: Lp2, toIndex: 1, active: false }
        - { from: Lp1, fromIndex: 3, to: Lp2, toIndex: 3, active: false }
      caption: "O(lg n) + O(1)·(k−1) = O(k + lg n)"
---

<!-- El material da la consulta como lista numerada en prosa (#21-24), no
     como pseudocódigo formal; se transcribe literal y se traduce a pasos. -->

## Qué hace

Busca el mismo valor $x$ en todas las listas aumentadas $L'_1, \ldots, L'_k$,
usando los puentes dejados por [`build`](/structures/fractional-cascading/operations/build)
para no repetir la búsqueda binaria en cada una.

## Intuición

Sólo hace falta ubicar a $x$ una vez, con precisión, en $L'_1$. A partir de
ahí, cada lista siguiente ya tiene "medio camino hecho": el puente más
cercano cae a lo más $\pm 1$ posición de donde $x$ realmente iría en esa lista,
así que ajustar la posición exacta es $O(1)$ en vez de otra búsqueda binaria
completa.

## Algoritmo

1. Una única búsqueda binaria de $x$ en $L'_1$: $O(\lg n)$.
2. Desde esa posición, seguir el puente más cercano hacia $L'_2$: cae a lo
   más $\pm 1$ posición de donde $x$ realmente iría — ajustar con $O(1)$
   comparaciones.
3. Repetir el paso anterior para bajar a $L'_3, \ldots, L_k$: $O(1)$ cada uno.

## Pseudocódigo

```
Buscar x en todas las listas
 1. Una única búsqueda binaria de x en L'1: O(lg n).
 2. Desde esa posición, seguir el puente más cercano hacia L'2: cae a lo
    más ±1 posición de donde x realmente iría — ajustar con O(1)
    comparaciones.
 3. Repetir el paso anterior para bajar a L'3, ..., Lk: O(1) cada uno.
```

## C++

Ver `step-4-query.cpp` y `full-implementation.cpp` en el editor de arriba.
`full-implementation.cpp` contrasta este resultado contra la búsqueda
binaria ingenua (independiente en cada lista), verificando que ambas dan el
mismo resultado y contando las comparaciones de cada una.

## Complejidad temporal

$O(k + \lg n)$: $O(\lg n)$ de la única búsqueda binaria real en $L'_1$, más
$O(1)$ por cada una de las $k - 1$ listas restantes al bajar puentes. Total
literal del profesor (#24): "$O(\lg n)$ (una búsqueda real) + $O(k)$ (bajar
puentes) = $O(k + \lg n)$".

> **Nota de apoyo** (no está en las diapositivas): aquí $k$ es el número de
> listas, no el tamaño de la respuesta como en el resto del curso — ver la
> nota en [theory.md](/structures/fractional-cascading#analisis-de-complejidad).

## Complejidad espacial

$O(1)$ adicional: la consulta sólo recorre punteros ya construidos, no
reserva estructuras nuevas.

## Ejemplo

Sobre el ejemplo de `build` (`L'1 = [2, 5*, 8, 12*, 15]`, `L'2 = [3, 5, 9*,
12, 18*]`, `L3 = [4, 9, 13, 18, 22]`), buscar `x = 9`:

1. Búsqueda binaria en `L'1`: `9` cae entre `8` y `12*` (posición 4).
2. Seguir el puente más cercano (el de `12*`) hacia `L'2`: aterriza cerca de
   la posición de `9` en `L'2` (que sí está, en la posición 3) — ajuste O(1).
3. Bajar el puente de `9` (viene de L3) hacia `L3`: `9` está en la posición 2
   de `L3` — ajuste O(1).

*(derivado del pseudocódigo; no aparece en las diapositivas: el mazo no trae
un trazo numérico de la consulta, sólo de la construcción)*.

## Casos límite

- **$x$ no está en ninguna lista**: la búsqueda binaria en $L'_1$ y los
  ajustes en cada lista siguen costando lo mismo — sólo cambia si el
  resultado final reporta "no encontrado" en cada $L_i$.
- **$k = 1$**: la consulta se reduce a la única búsqueda binaria en $L'_1$,
  sin puentes que bajar — $O(\lg n)$, coherente con la fórmula general.
- **$x$ menor que todos los elementos de $L'_1$**: el puente sigue existiendo
  (apunta al primer elemento promovido), el ajuste $O(1)$ sigue aplicando.
