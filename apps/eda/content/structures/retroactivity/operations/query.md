---
kind: operation
title: Query
order: 3
cppSteps:
  - step-1-timeline.cpp
  - step-2-insert-retroactive.cpp
  - step-3-delete-retroactive.cpp
  - step-4-query.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  steps:
    - note: >-
        Línea de tiempo completa (ejemplo de examples.md, ya con add(100)
        insertado en t = 1.5). Cuatro entradas disponibles para consultar.
      nodes:
        - { id: t1, value: "add(5)", parent: null }
        - { id: t15, value: "add(100)", parent: t1 }
        - { id: t2, value: "add(3)", parent: t15 }
        - { id: t3, value: "add(10)", parent: t2 }
    - note: >-
        Query(ahora) recorre toda la línea de tiempo — es el único t válido
        bajo retroactividad parcial.
      caption: "Query(ahora) = 118"
      highlight: ["t1", "t15", "t2", "t3"]
      nodes:
        - { id: t1, value: "add(5)", parent: null, state: active }
        - { id: t15, value: "add(100)", parent: t1, state: active }
        - { id: t2, value: "add(3)", parent: t15, state: active }
        - { id: t3, value: "add(10)", parent: t2, state: active }
    - note: >-
        Query(t=1) sólo cuenta lo que ocurrió hasta t = 1 inclusive: nada
        más. Este t intermedio sólo es válido bajo retroactividad completa.
      caption: "Query(t=1) = 5"
      highlight: ["t1"]
      nodes:
        - { id: t1, value: "add(5)", parent: null, state: active }
        - { id: t15, value: "add(100)", parent: t1, state: muted }
        - { id: t2, value: "add(3)", parent: t15, state: muted }
        - { id: t3, value: "add(10)", parent: t2, state: muted }
    - note: >-
        Query(t=2) suma un poco más de historia (t1, t15, t2) pero todavía
        no incluye t3 — cada t intermedio da una respuesta distinta.
      caption: "Query(t=2) = 108"
      highlight: ["t1", "t15", "t2"]
      nodes:
        - { id: t1, value: "add(5)", parent: null, state: active }
        - { id: t15, value: "add(100)", parent: t1, state: active }
        - { id: t2, value: "add(3)", parent: t15, state: active }
        - { id: t3, value: "add(10)", parent: t2, state: muted }
---

## Qué hace

Responde una consulta como si se hiciera en el tiempo `t` — es decir,
devuelve el estado de la estructura que resultaría de aplicar, en orden,
todas las operaciones de la línea de tiempo con tiempo menor o igual a `t`.

## Intuición

Query es la operación donde la taxonomía parcial/completa se vuelve
visible: en retroactividad **parcial**, `t` sólo puede ser el presente (el
tiempo más reciente de la línea de tiempo); en retroactividad **completa**,
`t` puede ser cualquier punto, pasado incluido. Esa restricción es lo que
hace que la parcial sea "significativamente más barata de lograr" — no hay
que poder reconstruir un estado arbitrario del pasado, sólo el más
reciente.

## Algoritmo

> **Derivado** (no está en las diapositivas: el mazo da la firma
> `Query(t, op)` pero ningún pseudocódigo). La versión ingenua:

1. Recorrer la línea de tiempo en orden creciente de tiempo, acumulando el
   efecto de cada operación con tiempo ≤ `t`.
2. Responder la consulta `op` sobre ese estado acumulado.

## Pseudocódigo

```
Query(línea_de_tiempo, t, op)
estado ← estado_inicial
para cada (tʼ, opʼ) en línea_de_tiempo con tʼ ≤ t, en orden creciente:
    estado ← aplicar(estado, opʼ)
retornar responder(estado, op)
// costo ingenuo: O(m), m = |línea_de_tiempo|
```

## C++

Ver `step-4-query.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

$O(m)$ en la versión ingenua: recorrer la línea de tiempo completa hasta
`t`. Es el mismo punto de referencia que Insert-retroactive y
Delete-retroactive — no es casualidad: en la versión ingenua, las tres
operaciones son variantes del mismo trabajo ("rehacer la línea de tiempo
hasta un punto").

## Complejidad espacial

$O(1)$ adicional sobre la línea de tiempo (sólo se acumula el estado
mientras se recorre).

## Ejemplo

Ver [examples.md](/structures/retroactivity/examples): sobre la misma línea
de tiempo, `Query` en el presente y `Query` en un tiempo intermedio dan
resultados distintos porque incluyen operaciones distintas — eso sólo es
posible bajo retroactividad **completa**; bajo retroactividad **parcial**,
sólo el primero de esos dos `Query` sería válido.

## Casos límite

- **`t` anterior a toda operación en la línea de tiempo**: la consulta se
  responde sobre el estado inicial, sin ninguna operación aplicada.
- **`t` es el presente**: es el único `t` válido bajo retroactividad
  parcial; bajo completa, es un caso más.
- **`t` coincide exactamente con el tiempo de una operación**: el material
  no aclara si esa operación cuenta como "ya aplicada" en la consulta (el
  pseudocódigo derivado arriba asume que sí, con `tʼ ≤ t`).
