---
kind: operation
title: "Construcción de la subdivisión"
order: 2
cppSteps:
  - step-1-ray-reformulation.cpp
  - step-2-subdivision-build.cpp
  - full-implementation.cpp
visualization:
  {
    "type": "planar",
    "steps": [
      {
        "note": "Entrada geométrica: cada punto inicia un rayo vertical. Ésta es la entrada de la construcción, no una lista de caras ni una reconstrucción del resultado de Chazelle.",
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
          ]
        }
      },
      {
        "note": "La consulta q=(4,4) permite comprobar qué rayos debe encontrar la futura subdivisión: B y C. El material garantiza una estructura auxiliar con grado acotado y espacio lineal; no proporciona aquí su algoritmo de construcción.",
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

Construye, sobre los `n` rayos verticales de
[ray-reformulation](/structures/dominance-2d/operations/ray-reformulation),
una **subdivisión planar de grado acotado**: un número constante de vecinos
por cara, con $O(n)$ caras en total, sobre la que
[dominance-query](/structures/dominance-2d/operations/dominance-query) puede
caminar en $O(1)$ por paso.

## Intuición

Con `n` rayos, dejar que cada uno se extienda completo hasta el final del
plano podría producir muchas más de $O(n)$ intersecciones relevantes entre
caras vecinas. La solución (Chazelle, 1986) es la misma idea de "promover la
mitad" que ya aparece en fractional cascading sobre listas: no todos los
segmentos llegan hasta el final — algunos se extienden hacia columnas
lejanas para mantener el grado acotado de las caras que atraviesan, y otros
se cortan porque ya no hacen falta más allá de cierto punto. El resultado es
una subdivisión con espacio total $O(n)$, aunque cada cara individual sólo
"ve" un número constante de vecinas.

## Algoritmo

El profesor no da pseudocódigo para este paso (ver "pseudocódigo" abajo):
describe el resultado (grado acotado, $O(n)$ espacio, citando a Chazelle
1986) sin dar los pasos de construcción. Lo que sí es explícito:

1. Ordenar los `n` puntos por su coordenada `y` — cada rayo ocupa una
   columna vertical distinta (o comparte columna si hay empates en `y`).
2. Entre columnas consecutivas, aplicar la idea de "promover la mitad": una
   fracción de los rayos que ya empezaron a la izquierda se extiende
   (virtualmente) hacia la columna siguiente, para que la caminata de
   `dominance-query` nunca tenga que mirar más de $O(1)$ caras vecinas por
   paso.
3. El resultado es una subdivisión con grado acotado por cara (#24) y
   espacio total $O(n)$ segmentos, porque no todos los segmentos llegan
   hasta el final (#24).

## Pseudocódigo

> **Nota de apoyo** (no está en las diapositivas): el profesor no da
> pseudocódigo de construcción para $D_1$ — sólo cita la existencia del
> resultado geométrico (Chazelle, 1986) que garantiza grado acotado y
> espacio $O(n)$. El único pseudocódigo del tema es `ConsultaDominancia`,
> transcrito en
> [dominance-query](/structures/dominance-2d/operations/dominance-query).

## C++

Ver `step-2-subdivision-build.cpp` y `full-implementation.cpp` en el editor
de arriba. La construcción ahí es una realización didáctica simple y
correcta (columnas acumulativas ordenadas por `y`, cada una con sus rayos
activos ordenados por `z`) — no reproduce la subdivisión de grado acotado de
Chazelle, que el profesor cita pero no construye en el curso. Esa representación acumulativa puede ocupar espacio cuadrático y no hereda
la garantía lineal de la subdivisión citada.

## Complejidad temporal

El profesor no da un costo de construcción para este paso.

## Complejidad espacial

$O(n)$ segmentos (#25): "no todos los segmentos llegan hasta el final:
algunos se extienden y otros se cortan" (#24) es precisamente lo que permite
que el total, sumado sobre las `n` columnas, siga siendo lineal.

## Ejemplo

La figura usa cuatro puntos derivados para mostrar la entrada y el resultado
que deberá producir una consulta. El mazo no incluye el trazado de las caras
auxiliares: no se asigna una cara por punto o por columna, porque esa regla
no es la construcción que garantiza el resultado citado.

## Casos límite

- **Grado acotado como condición indispensable** (#24): sin él, la caminata
  de `dominance-query` no podría garantizar $O(1)$ por cara.
- **Todos los puntos con la misma `y`**: una sola columna con todos los
  rayos, ordenados por `z` dentro de ella — la subdivisión colapsa a un caso
  degenerado de una columna.
- **Un solo punto ($n=1$)**: la subdivisión es una única columna con un solo
  rayo; caso trivial pero válido.
