---
kind: operation
title: "ConsultaDominancia"
order: 3
cppSteps:
  - step-1-ray-reformulation.cpp
  - step-2-subdivision-build.cpp
  - step-3-dominance-query.cpp
  - full-implementation.cpp
visualization:
  {
    "type": "planar",
    "steps": [
      {
        "note": "Consulta q=(4,4) sobre el ejemplo de rayos. Se busca reportar puntos, no contar todo lo que esté a la izquierda.",
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
        "note": "A=(1,5) no se reporta: su rayo empieza por encima de la altura de q. D=(5,2) tampoco: queda a la derecha del origen de la consulta.",
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
      },
      {
        "note": "Respuesta geométrica: B=(2,1) y C=(4,4), k=2. La representación permite comprobar el resultado; el pseudocódigo de abajo usa una subdivisión auxiliar para encontrarlo sin examinar todos los puntos.",
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
      },
      {
        "note": "Consulta q=(0,0): no cruza ningún rayo y k=0. Explorar permite buscar también el caso en que todos queden dominados.",
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
            "x": 0,
            "y": 0
          },
          "showRay": true,
          "showHits": true
        }
      }
    ]
  }
---

## Qué hace

`ConsultaDominancia(S, b2, b3)` reporta todos los puntos de `S` con
$y_i \le b_2$ y $z_i \le b_3$, caminando por la subdivisión de
[subdivision-build](/structures/dominance-2d/operations/subdivision-build)
en vez de comparar cada punto uno por uno.

## Intuición

El rayo horizontal de la consulta (ver
[ray-reformulation](/structures/dominance-2d/operations/ray-reformulation))
entra por la derecha, a la altura `b3`, y avanza hacia la izquierda. En vez
de simular ese avance por todo el plano, la estructura hace lo contrario:
localiza primero, con una búsqueda binaria, en qué **cara** de la columna
izquierda cae la altura `b3` — y desde ahí camina cara por cara hacia la
derecha, hasta llegar a la posición `b2`. Cada cara que se cruza corresponde
o bien al rayo de un punto real (se reporta) o bien a una cara "vacía" que
sólo existe por el grado acotado de la subdivisión.

## Algoritmo

1. Búsqueda binaria de `b3` en la columna izquierda de `S` → $O(\lg n)$.
2. Caminar hacia la derecha, cara por cara, mientras la posición horizontal
   de la cara actual sea menor que `b2`:
   - si el borde de la cara actual es el rayo de un punto, agregar ese punto
     al resultado;
   - avanzar a la cara vecina hacia la derecha ($O(1)$, por el grado
     acotado).
3. Devolver el resultado cuando la caminata alcanza `b2`.

## Pseudocódigo

Transcripción literal (el deck repite este bloque idéntico en dos overlays,
#30 como "Algoritmo 1" y #31 como "Algoritmo 2" — mismo cuerpo, el segundo
sólo agrega el párrafo de costo debajo; es el mismo algoritmo, no dos):

```
Algoritmo: ConsultaDominancia(S, b2, b3)
cara ← búsqueda binaria de b3 en la columna izquierda de S   // O(lg n)
resultado ← lista vacía
mientras la posición horizontal de cara es < b2 hacer
    si el borde de cara es un rayo de un punto entonces
        agregar ese punto a resultado
     cara ← cara vecina hacia la derecha                      // O(1)
devolver resultado
```

## C++

Ver `step-3-dominance-query.cpp` y `full-implementation.cpp` en el editor de
arriba.

## Complejidad temporal

$O(\lg n + k)$. Conteo directo por pasos, output-sensitive: $O(\lg n)$ de la
búsqueda binaria inicial, más $O(1)$ por cada cara visitada. Se visita
exactamente una cara por punto reportado (más un puñado de caras "vacías"),
así que el total es $O(\lg n + k)$ (#31) — el mismo patrón de descomposición
que el profesor usa en todo el deck (#54): $O(\lg n) + O(1) \cdot O(\lg n) + O(k)$.

## Complejidad espacial

No requiere espacio adicional más allá de la subdivisión ya construida
($O(n)$, ver
[subdivision-build](/structures/dominance-2d/operations/subdivision-build))
y la lista de resultado, de tamaño `k`.

## Ejemplo

*(Ejemplo geométrico derivado; estos valores no aparecen en las diapositivas.)*
Con A=(1,5), B=(2,1), C=(4,4), D=(5,2) y q=(4,4), la prueba de
las dos desigualdades devuelve B y C. La figura muestra esa equivalencia.
No dibuja las caras auxiliares de la estructura eficiente ni identifica cada
punto descartado con una cara visitada: hacerlo convertiría el ejemplo en un
barrido lineal y no justificaría el costo sensible al tamaño de la respuesta.

## Casos límite

- **$k=0$** (ningún punto dominado): la caminata todavía hace el $O(\lg n)$
  de la búsqueda binaria y luego sólo cruza caras "vacías" hasta `b2`.
- **$k=n$** (todos los puntos dominados, `b2` y `b3` mayores que todo el
  conjunto): la caminata visita una cara por cada uno de los `n` puntos —
  el costo se acerca a $O(\lg n + n)$, consistente con la cota.
- **"Un puñado de caras vacías"** (#31): el profesor menciona
  explícitamente que la caminata puede visitar algunas caras que no
  reportan punto, y que eso no rompe la cota $O(\lg n + k)$ porque su número
  está acotado por el grado de la subdivisión, no por `n`.
