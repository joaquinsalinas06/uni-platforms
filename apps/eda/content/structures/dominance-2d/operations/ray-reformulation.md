---
kind: operation
title: "Reformulación como rayos"
order: 1
cppSteps:
  - step-1-ray-reformulation.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        Cuatro puntos ordenados por su coordenada y: (1,5), (2,1), (4,4),
        (5,2). Cada celda es un punto — su etiqueta es sólo su y; la z de
        cada uno se explica aquí, no en la celda: y=1→z=5, y=2→z=1, y=4→z=4,
        y=5→z=2. Todavía se piensan como puntos sueltos, no como rayos.
      caption: "puntos (y_i, z_i), antes de la reformulación"
      arrays:
        - id: puntos
          label: "puntos por y"
          row: 0
          cells: [1, 2, 4, 5]
    - note: >-
        Cada punto se convierte en un rayo vertical que sale de (y_i, z_i)
        hacia z=+∞: la celda ya no es "dónde está el punto", sino "desde
        dónde arranca su rayo hacia arriba". La consulta (b2,b3)=(4,4) se
        convierte, simétricamente, en un rayo horizontal que entra desde la
        derecha a la altura z=4 y avanza hacia y menor.
      caption: "cada celda es ahora un rayo vertical hacia +∞"
      arrays:
        - id: puntos
          label: "rayos verticales (y)"
          row: 0
          cells: [1, 2, 4, 5]
        - id: consulta
          label: "consulta"
          row: 1
          cells: ["(4,4)"]
          states: [marked]
    - note: >-
        El rayo horizontal de la consulta atraviesa el rayo vertical de un
        punto exactamente cuando ese punto cumple y_i ≤ b2 ∧ z_i ≤ b3: y=2
        (z=1≤4) y y=4 (z=4≤4, empate incluido por la convención ≤) quedan
        dominados; y=1 (z=5>4) y y=5 (y>4) no.
      caption: "dominados: y=2, y=4 — no dominados: y=1, y=5"
      arrays:
        - id: puntos
          label: "rayos verticales (y)"
          row: 0
          cells: [1, 2, 4, 5]
          states: [muted, answer, answer, muted]
        - id: consulta
          label: "consulta"
          row: 1
          cells: ["(4,4)"]
          states: [marked]
---

## Qué hace

Convierte cada punto $(y_i, z_i)$ del conjunto en un **rayo vertical** que
sale de $(y_i, z_i)$ hacia $z = +\infty$, y convierte la consulta $(b_2, b_3)$ en un
**rayo horizontal** que sale de $(b_2, b_3)$ hacia la izquierda ($y \to -\infty$). No
es una estructura de datos por sí sola: es el cambio de pregunta sobre el que
se construyen [subdivision-build](/structures/dominance-2d/operations/subdivision-build)
y [dominance-query](/structures/dominance-2d/operations/dominance-query).

## Intuición

Igual que [vertical-ray-shooting](/structures/vertical-ray-shooting) volvió
tratable la localización de puntos disparando un rayo desde el punto de
consulta hacia un segmento, aquí se invierte el papel: cada dato (un punto)
dispara su propio rayo, y es la consulta la que se convierte en el objeto que
"barre". Preguntar "¿el punto está dominado?" (una comparación de dos
desigualdades sobre coordenadas) se vuelve "¿el rayo horizontal de la
consulta atraviesa el rayo vertical de este punto?" (una intersección
geométrica).

## Algoritmo

1. Punto $(y_i, z_i)$ → rayo vertical $\{(y_i, z) : z \ge z_i\}$.
2. Consulta $(b_2, b_3)$ → rayo horizontal $\{(y, b_3) : y \le b_2\}$.
3. El punto `i` es dominado ($y_i \le b_2 \land z_i \le b_3$) exactamente cuando su
   rayo vertical y el rayo horizontal de la consulta se cruzan (#21).

## Pseudocódigo

El profesor no da pseudocódigo para este paso — es una reformulación
conceptual, no un procedimiento. La transcripción del único pseudocódigo del
tema (`ConsultaDominancia`) está en
[dominance-query](/structures/dominance-2d/operations/dominance-query).

## C++

Ver `step-1-ray-reformulation.cpp` y `full-implementation.cpp` en el editor
de arriba.

## Complejidad temporal

El profesor no da un costo propio para la reformulación: es una
equivalencia, no un cómputo. El costo real vive en
[dominance-query](/structures/dominance-2d/operations/dominance-query).

## Complejidad espacial

Un rayo por punto: $O(n)$ rayos antes de construir la subdivisión (que luego
los recorta y extiende — ver
[subdivision-build](/structures/dominance-2d/operations/subdivision-build)).

## Ejemplo

*(derivado del pseudocódigo; no aparece en las diapositivas, que sólo traen
el diagrama cualitativo #22-23 sin coordenadas)*: los puntos
`(1,5), (2,1), (4,4), (5,2)` se convierten en cuatro rayos verticales que
nacen en esas coordenadas y suben. La consulta $(b_2,b_3) = (4,4)$ es un rayo
horizontal a la altura `z=4` que entra desde `y=4` hacia la izquierda: cruza
los rayos de `(2,1)` y `(4,4)` (ambos con `y ≤ 4` y `z ≤ 4`), pero no el de
`(1,5)` (su rayo empieza en `z=5`, por encima de la altura `4`) ni el de
`(5,2)` (su rayo está a la derecha de `b2=4`).

## Casos límite

- **`b2` o `b3` menor que todo el conjunto**: ningún rayo es atravesado,
  $k = 0$.
- **Empate $y_i = b_2$ o $z_i = b_3$**: el material usa `≤` en ambas
  coordenadas (#17), así que el punto exactamente sobre el borde del rayo de
  consulta cuenta como dominado.
- **Dos puntos con la misma `y_i`**: sus rayos verticales coinciden en `x`;
  la subdivisión los distingue por su posición en `z` dentro de la misma
  columna (ver casos límite de
  [subdivision-build](/structures/dominance-2d/operations/subdivision-build)).
