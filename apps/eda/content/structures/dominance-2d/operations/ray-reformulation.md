---
kind: operation
title: "Reformulación como rayos"
order: 1
cppSteps:
  - step-1-ray-reformulation.cpp
  - full-implementation.cpp
visualization:
  {
    "type": "planar",
    "steps": [
      {
        "note": "Ejemplo didáctico derivado: A=(1,5), B=(2,1), C=(4,4), D=(5,2). El eje horizontal es y y el vertical es z; las dos coordenadas se ven simultáneamente.",
        "planar": {
          "bounds": [
            0,
            0,
            7,
            7
          ],
          "xLabel": "y",
          "yLabel": "z",
          "points": [
            {
              "id": "A",
              "x": 1,
              "y": 5,
              "label": "A"
            },
            {
              "id": "B",
              "x": 2,
              "y": 1,
              "label": "B"
            },
            {
              "id": "C",
              "x": 4,
              "y": 4,
              "label": "C"
            },
            {
              "id": "D",
              "x": 5,
              "y": 2,
              "label": "D"
            }
          ]
        }
      },
      {
        "note": "La consulta q=(4,4) domina los puntos a su izquierda y por debajo. Estar a la izquierda solamente no basta: A está demasiado alto.",
        "planar": {
          "bounds": [
            0,
            0,
            7,
            7
          ],
          "xLabel": "y",
          "yLabel": "z",
          "points": [
            {
              "id": "A",
              "x": 1,
              "y": 5,
              "label": "A"
            },
            {
              "id": "B",
              "x": 2,
              "y": 1,
              "label": "B"
            },
            {
              "id": "C",
              "x": 4,
              "y": 4,
              "label": "C"
            },
            {
              "id": "D",
              "x": 5,
              "y": 2,
              "label": "D"
            }
          ],
          "query": {
            "x": 4,
            "y": 4
          }
        }
      },
      {
        "note": "Desde cada punto nace un rayo vertical hacia z positivo. La consulta se convierte en un rayo horizontal hacia y menor.",
        "planar": {
          "bounds": [
            0,
            0,
            7,
            7
          ],
          "xLabel": "y",
          "yLabel": "z",
          "points": [
            {
              "id": "A",
              "x": 1,
              "y": 5,
              "label": "A"
            },
            {
              "id": "B",
              "x": 2,
              "y": 1,
              "label": "B"
            },
            {
              "id": "C",
              "x": 4,
              "y": 4,
              "label": "C"
            },
            {
              "id": "D",
              "x": 5,
              "y": 2,
              "label": "D"
            }
          ],
          "segments": [
            {
              "id": "rA",
              "from": [
                1,
                5
              ],
              "to": [
                1,
                6.5
              ],
              "arrow": true
            },
            {
              "id": "rB",
              "from": [
                2,
                1
              ],
              "to": [
                2,
                6.5
              ],
              "arrow": true
            },
            {
              "id": "rC",
              "from": [
                4,
                4
              ],
              "to": [
                4,
                6.5
              ],
              "arrow": true
            },
            {
              "id": "rD",
              "from": [
                5,
                2
              ],
              "to": [
                5,
                6.5
              ],
              "arrow": true
            }
          ],
          "query": {
            "x": 4,
            "y": 4
          },
          "showRay": false
        }
      },
      {
        "note": "El rayo de q cruza los rayos de B=(2,1) y C=(4,4): ambos cumplen y≤4 y z≤4. C cuenta incluso en el origen de la consulta, porque las desigualdades incluyen igualdad. A queda arriba y D a la derecha.",
        "planar": {
          "bounds": [
            0,
            0,
            7,
            7
          ],
          "xLabel": "y",
          "yLabel": "z",
          "points": [
            {
              "id": "A",
              "x": 1,
              "y": 5,
              "label": "A"
            },
            {
              "id": "B",
              "x": 2,
              "y": 1,
              "label": "B"
            },
            {
              "id": "C",
              "x": 4,
              "y": 4,
              "label": "C"
            },
            {
              "id": "D",
              "x": 5,
              "y": 2,
              "label": "D"
            }
          ],
          "mode": "dominance",
          "query": {
            "x": 4,
            "y": 4
          },
          "showRay": true,
          "showHits": true
        }
      }
    ]
  }
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
