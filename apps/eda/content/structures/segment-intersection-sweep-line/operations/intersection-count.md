---
kind: operation
title: "Conteo de intersecciones aportadas por un segmento vertical"
order: 2
cppSteps:
  - step-1-events.cpp
  - step-2-activation.cpp
  - step-3-intersection-count.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        En x=4 llega V1 [x=4, y=0..5]. La estructura de activos ya tiene a
        H1 (y=3) y H2 (y=5) prendidos — el mismo estado que deja
        segment-activation en ese instante.
      caption: "V1 cubre y ∈ [0, 5]"
      mode: layers
      arrays:
        - id: ypos
          label: "activos"
          row: 0
          cells: [3, 5]
          states: [active, active]
    - note: >-
        RSQ(0, 5) sobre la estructura de activos: ambas posiciones (3 y 5)
        caen dentro del rango — cada una cuenta como una intersección.
      caption: "RSQ(0, 5) → ambas caen dentro"
      mode: layers
      arrays:
        - id: ypos
          row: 0
          cells: [3, 5]
          states: [answer, answer]
    - note: >-
        V1 aporta 2 intersecciones: cruza a H1 y a H2. El profesor atribuye
        este costo al total O(n log n) del caso simple (#38), sin separar
        activación de conteo.
      caption: "V1 aporta 2 intersecciones"
      mode: layers
      arrays:
        - id: ypos
          row: 0
          cells: [3, 5]
          states: [answer, answer]
---

## Qué hace

Cuando el barrido llega a la x de un segmento vertical que cubre `[y1, y2]`,
cuenta cuántos segmentos horizontales están activos en ese momento dentro de
ese rango de y — cada uno es una intersección.

## Intuición

Un segmento vertical en x = k cruza exactamente a los segmentos
horizontales que en ese instante "están enfrente" de él, es decir, los que
siguen activos. Restringir además a `[y1, y2]` filtra sólo los que además
están a la altura correcta. Es una consulta de rango (RSQ) sobre el mismo
estado que
[segment-activation](/structures/segment-intersection-sweep-line/operations/segment-activation)
mantiene.

## Algoritmo

Cita textual (#37): "cuando tengamos un segmento vertical que cubra del y1
al y2 el número de intersecciones que aporta es la cantidad de dichas
posiciones activas en el sweep line" — es decir, una consulta de suma de
rango (RSQ, #32) sobre `[y1, y2]` en la estructura de activos.

1. Al procesar el evento del segmento vertical (en su x), consultar
   `RSQ(y1, y2)` sobre la estructura de posiciones activas.
2. El resultado es el número de intersecciones que aporta ese segmento
   vertical.

## Pseudocódigo

```
ContarIntersecciones(estructura, y1, y2):
    return estructura.RSQ(y1, y2)   // suma de posiciones activas en [y1, y2]
```

## C++

Ver `step-3-intersection-count.cpp`: la consulta de rango sobre el mismo
Fenwick tree que
[segment-activation](/structures/segment-intersection-sweep-line/operations/segment-activation)
actualiza.

## Complejidad temporal

$O(\log n)$ por segmento vertical — el costo de una consulta de rango sobre el
Fenwick tree o Segment tree elegido
([fenwick-tree](/structures/fenwick-tree),
[segment-tree](/structures/segment-tree)). Sumado sobre los n eventos del
barrido, el profesor reporta el total como $O(n \log n)$ (#38), sin separar el
costo de esta operación del de
[segment-activation](/structures/segment-intersection-sweep-line/operations/segment-activation):
ambas comparten la misma cota heredada.

## Complejidad espacial

No aplica un análisis propio para esta operación.

## Ejemplo

Ver [examples.md](/structures/segment-intersection-sweep-line/examples),
caso "Normal": un segmento vertical que cruza dos horizontales activos
distintos.

## Casos límite

- **`y1 = y2`**: el rango de consulta se reduce a una sola posición — la
  consulta sigue siendo válida sin caso especial.
- **Ningún segmento horizontal activo en `[y1, y2]`**: el conteo es 0, el
  segmento vertical no aporta intersecciones.
- **Segmentos verticales que coinciden en la misma x**: el orden entre
  ellos y los eventos de activación/desactivación en esa misma x sigue la
  regla de borde de
  [segment-activation](/structures/segment-intersection-sweep-line/operations/segment-activation)
  (#34): activar antes de procesar, desactivar después.
