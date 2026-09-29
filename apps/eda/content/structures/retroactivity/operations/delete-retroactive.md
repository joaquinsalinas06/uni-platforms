---
kind: operation
title: Delete-retroactive
order: 2
cppSteps:
  - step-1-timeline.cpp
  - step-2-insert-retroactive.cpp
  - step-3-delete-retroactive.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  steps:
    - note: >-
        Línea de tiempo real (ejemplo "Límite" de examples.md), ya con
        add(100) insertado en t = 1.5. Σ acumulada = 118.
      caption: "Σ = 118"
      nodes:
        - { id: t1, value: "add(5)", parent: null }
        - { id: t15, value: "add(100)", parent: t1 }
        - { id: t2, value: "add(3)", parent: t15 }
        - { id: t3, value: "add(10)", parent: t2 }
    - note: >-
        Se identifica t1, la entrada más antigua de la línea de tiempo —
        es la que se va a borrar.
      highlight: ["t1"]
      nodes:
        - { id: t1, value: "add(5)", parent: null, state: marked }
        - { id: t15, value: "add(100)", parent: t1 }
        - { id: t2, value: "add(3)", parent: t15 }
        - { id: t3, value: "add(10)", parent: t2 }
    - note: >-
        Se retira t1; t15 pasa a ser el inicio de la línea de tiempo. Al ser
        la operación más vieja, esto obliga a rehacer las tres que quedan.
      highlight: ["t15", "t2", "t3"]
      nodes:
        - { id: t15, value: "add(100)", parent: null, state: active }
        - { id: t2, value: "add(3)", parent: t15, state: active }
        - { id: t3, value: "add(10)", parent: t2, state: active }
    - note: >-
        Caso patológico O(m): borrar cerca del principio forzó a rehacer
        casi toda la línea de tiempo restante para llegar al nuevo Σ.
      caption: "Σ = 113"
      highlight: ["t15", "t2", "t3"]
      nodes:
        - { id: t15, value: "add(100)", parent: null, state: active }
        - { id: t2, value: "add(3)", parent: t15, state: active }
        - { id: t3, value: "add(10)", parent: t2, state: active }
---

## Qué hace

Elimina la operación que estaba en el tiempo `t` de la línea de tiempo. Es
el caso simétrico a [Insert-retroactive](/structures/retroactivity/operations/insert-retroactive):
en vez de "olvidé una operación", el escenario es "una operación pasada
estuvo mal y hay que borrarla".

## Intuición

Igual que insertar, borrar en `t` no dejó una versión anterior viva: la
operación desaparece de la única línea de tiempo que existe, y todo lo que
ocurrió después de `t` queda, en principio, desactualizado — porque pudo
haber dependido de un estado que incluía esa operación.

## Algoritmo

> **Derivado** (no está en las diapositivas: el mazo da la firma de
> `Delete(t)` pero ningún pseudocódigo). La versión ingenua:

1. Ubicar y retirar la entrada en el tiempo `t` de la línea de tiempo.
2. Recalcular el estado presente rehaciendo, en orden, todas las
   operaciones que quedan desde `t` en adelante — costo $O(m)$.

## Pseudocódigo

```
Delete-Retroactive(línea_de_tiempo, t)
retirar la entrada (t, op) de línea_de_tiempo
para cada (tʼ, opʼ) en línea_de_tiempo con tʼ ≥ t, en orden creciente:
    reaplicar opʼ sobre el estado acumulado
// costo ingenuo: O(m), m = |línea_de_tiempo|
```

## C++

Ver `step-3-delete-retroactive.cpp` y `full-implementation.cpp` en el
editor de arriba, sobre la misma línea de tiempo de operaciones `add(x)`
usada en [Insert-retroactive](/structures/retroactivity/operations/insert-retroactive).

## Complejidad temporal

$O(m)$ en la versión ingenua, por la misma razón que Insert-retroactive:
hay que rehacer todo lo que ocurre después de `t`. El material no trata
(ver Casos límite) qué pasa cuando la operación borrada era, en la
estructura subyacente, una pieza de otra operación (por ejemplo, borrar un
`Insert` sobre el que ya se hizo un `Delete-Min` en una cola de
prioridad) — eso es justo lo que el caso de estudio de la
[priority queue retroactiva](/structures/retroactive-priority-queue) sí
desarrolla, para esa estructura en particular.

## Complejidad espacial

$O(1)$ adicional (se retira una entrada de una línea de tiempo de tamaño
$O(m)$).

## Ejemplo

Ver el caso "límite" de [examples.md](/structures/retroactivity/examples):
borrar la operación más antigua de la línea de tiempo fuerza a rehacer
todas las que quedan — el caso patológico de $O(m)$ que motiva a
[commutative-invertible-retroactivity](/structures/commutative-invertible-retroactivity),
[decomposable-search-problem](/structures/decomposable-search-problem) y el
[rollback-method](/structures/rollback-method).

## Casos límite

- **Borrar en el tiempo más reciente**: no hay nada que rehacer después,
  costo mínimo.
- **Borrar el tiempo más antiguo**: fuerza a rehacer toda la línea de
  tiempo restante, el caso $O(m)$ completo.
- **Borrar un `t` que no tiene ninguna operación asociada**: el material no
  lo cubre; el mazo sólo dice "elimina la operación que estaba en el tiempo
  t", asumiendo que existe.
