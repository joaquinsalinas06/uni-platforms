---
kind: operation
title: Update
order: 3
cppSteps:
  - step-4-update.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Insert(t=2, op) con efecto +5, sobre el árbol de tiempo vacío
        (m=4, todas las hojas en 0). Arranca en la raíz n14=[1,4]: t=2 cae en
        la mitad izquierda [1,2], así que el camino baja hacia n12. n34 y su
        subárbol no se tocan en ningún momento de este Insert.
      highlight: ["n14"]
      nodes:
        - { id: n14, value: 0, parent: null, state: active }
        - { id: n12, value: 0, parent: n14, state: idle }
        - { id: n34, value: 0, parent: n14, state: shared }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 0, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: shared }
        - { id: n44, value: 0, parent: n34, state: shared }
    - note: >-
        En n12=[1,2]: t=2 es la posición derecha de este rango, sigue
        bajando hacia la hoja n22=[2,2].
      highlight: ["n12"]
      nodes:
        - { id: n14, value: 0, parent: null, state: idle }
        - { id: n12, value: 0, parent: n14, state: active }
        - { id: n34, value: 0, parent: n14, state: shared }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 0, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: shared }
        - { id: n44, value: 0, parent: n34, state: shared }
    - note: >-
        Llega a la hoja n22=[2,2]: se escribe el nuevo valor, 0+5=5 — el
        efecto de la operación insertada en t=2.
      highlight: ["n22"]
      nodes:
        - { id: n14, value: 0, parent: null, state: idle }
        - { id: n12, value: 0, parent: n14, state: idle }
        - { id: n34, value: 0, parent: n14, state: shared }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 5, parent: n12, state: active }
        - { id: n33, value: 0, parent: n34, state: shared }
        - { id: n44, value: 0, parent: n34, state: shared }
    - note: >-
        De vuelta hacia la raíz: n12 recalcula combinando sus hijos ya
        actualizados: valor(n12) = combinar(n11=0, n22=5) = 5.
      highlight: ["n12"]
      nodes:
        - { id: n14, value: 0, parent: null, state: idle }
        - { id: n12, value: 5, parent: n14, state: active }
        - { id: n34, value: 0, parent: n14, state: shared }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 5, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: shared }
        - { id: n44, value: 0, parent: n34, state: shared }
    - note: >-
        La raíz recalcula: valor(n14) = combinar(n12=5, n34=0) = 5.
        Insert(t=2,+5) completo: sólo 3 nodos tocados (n14, n12, n22) — O(lg
        m) = 2, ni uno más.
      highlight: ["n14"]
      caption: "Insert(t=2, +5) completo"
      nodes:
        - { id: n14, value: 5, parent: null, state: active }
        - { id: n12, value: 5, parent: n14, state: idle }
        - { id: n34, value: 0, parent: n14, state: shared }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 5, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: shared }
        - { id: n44, value: 0, parent: n34, state: shared }
    - note: >-
        Delete(t=2): mismo camino raíz→hoja (n14 → n12 → n22) que el Insert
        de arriba, pero ahora se escribe el neutro (0) en la hoja n22 en vez
        de +5.
      highlight: ["n22"]
      nodes:
        - { id: n14, value: 5, parent: null, state: idle }
        - { id: n12, value: 5, parent: n14, state: idle }
        - { id: n34, value: 0, parent: n14, state: shared }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 0, parent: n12, state: active }
        - { id: n33, value: 0, parent: n34, state: shared }
        - { id: n44, value: 0, parent: n34, state: shared }
    - note: >-
        n12 recalcula de nuevo: valor(n12) = combinar(n11=0, n22=0) = 0 — el
        efecto de t=2 desaparece de este resumen.
      highlight: ["n12"]
      nodes:
        - { id: n14, value: 5, parent: null, state: idle }
        - { id: n12, value: 0, parent: n14, state: active }
        - { id: n34, value: 0, parent: n14, state: shared }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 0, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: shared }
        - { id: n44, value: 0, parent: n34, state: shared }
    - note: >-
        La raíz recalcula por última vez: valor(n14) = combinar(n12=0,
        n34=0) = 0. Delete(t=2) completo: el árbol queda como si Insert
        nunca hubiera pasado, sin haber tocado n34 ni sus hijos en ningún
        momento de las dos operaciones.
      highlight: ["n14"]
      caption: "Delete(t=2) completo — árbol de vuelta a 0"
      nodes:
        - { id: n14, value: 0, parent: null, state: active }
        - { id: n12, value: 0, parent: n14, state: idle }
        - { id: n34, value: 0, parent: n14, state: shared }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 0, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: shared }
        - { id: n44, value: 0, parent: n34, state: shared }
---

<!-- El profesor es explícito en que esta operación NO es nueva: "¡el mismo
     Update que ya conocemos!" (página 34-35). Esta página no reexplica el
     mecanismo de segment-tree#update; sólo lo que cambia al reinterpretarlo
     sobre el eje del tiempo (Insert/Delete retroactivos como su punto de
     entrada). -->

## Qué hace

Implementa `Insert(t, op)` y `Delete(t)` retroactivos de la interfaz de
[retroactividad](/structures/retroactivity#estructura-interna): insertar o
eliminar una operación en el tiempo `t`, posiblemente pasado.

## Intuición

`Insert(t, op)` ocupa la hoja que representa el instante `t` con el efecto de
`op`; `Delete(t)` la deja en el elemento neutro de `f`. En ambos casos, eso
es exactamente lo que hace un
[Update de segment tree](/structures/segment-tree/operations/update):
escribir un valor nuevo en una hoja y recalcular el camino raíz-hoja hacia
arriba. No hay ninguna diferencia mecánica con el Update ya conocido — sólo
cambia qué significa la posición que se actualiza (un instante de tiempo, no
una celda de un arreglo).

## Algoritmo

Reduce directamente al [Update de segment tree](/structures/segment-tree/operations/update),
sin ningún paso adicional:

1. `Insert(t, op)`: llamar `Update(raíz, 1, m, t, efecto(op))` sobre el
   segment tree de tiempo — mismo algoritmo, sin modificación.
2. `Delete(t)`: llamar `Update(raíz, 1, m, t, neutro)` — vaciar la hoja `t`
   al elemento neutro de `f` (`0` para suma, `-∞` para máx, etc.).

## Pseudocódigo

```
Insertar/eliminar una operación en el tiempo t actualiza O(lg m) nodos del Segment Tree
(donde m es el número de operaciones) — ¡el mismo Update que ya conocemos!
```

(páginas 34-35). El pseudocódigo estructural completo — el camino raíz-hoja,
la comparación `i ≤ m` para decidir el lado, el recálculo al volver — es el
de [Update de segment tree](/structures/segment-tree/operations/update#pseudocódigo);
no se repite aquí para no duplicarlo.

## C++

Ver `step-4-update.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

$O(\lg m)$. Textual (página 34-35): "Insertar/eliminar una operación en el
tiempo t actualiza `O(lg m)` nodos del Segment Tree (donde m es el número de
operaciones)". El argumento se hereda sin repetirse: el camino raíz-hoja de
un segment tree de `m` hojas tiene altura $\lceil \lg m \rceil$, y cada nodo del camino
se recalcula en $O(1)$.

## Complejidad espacial

No la da el profesor. Heredada del
[Update de segment tree](/structures/segment-tree/operations/update):
$O(\lg m)$ de pila de recursión (o $O(1)$ adicional en la variante iterativa).

## Ejemplo

Ver la visualización de
[Time-segment-tree-build](/structures/decomposable-search-problem/operations/time-segment-tree-build) —
`Insert(t=2, op)` con efecto `+5` toca el camino `[1,4] → [1,2] → [2,2]`, y
`Delete(t=2)` toca el mismo camino de vuelta, escribiendo el neutro `0` en
`[2,2]`.

## Casos límite

- **Insertar en un tiempo `t` ya ocupado**: el mazo no lo menciona (hueco
  del material — ver la nota de apoyo en `time-segment-tree-build.md`). La
  implementación de este tema lo trata como sobrescribir la franja `t`.
- **`Delete(t)` sobre un tiempo `t` vacío**: no cambia nada — escribir el
  neutro donde ya había el neutro es un Update válido, sólo redundante.
- **`m = 1`**: `Insert`/`Delete` escriben directamente en la única hoja, sin
  ningún nodo intermedio que recalcular ($\lceil \lg 1 \rceil = 0$).
