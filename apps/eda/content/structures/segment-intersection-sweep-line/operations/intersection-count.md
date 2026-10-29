---
kind: operation
title: Conteo de intersecciones aportadas por un segmento vertical
order: 2
cppSteps:
  - step-1-events.cpp
  - step-2-activation.cpp
  - step-3-intersection-count.cpp
  - full-implementation.cpp
visualization:
  type: planar
  steps:
    - note: "x=1: se activa H1 antes de procesar consultas en su extremo izquierdo. El estado guarda su
        altura y=3."
      planar:
        bounds:
          - -1
          - -1
          - 9
          - 7
        segments: &a1
          - id: H1
            label: H1
            from:
              - 1
              - 3
            to:
              - 6
              - 3
          - id: H2
            label: H2
            from:
              - 4
              - 5
            to:
              - 7
              - 5
          - id: V1
            label: V1
            from:
              - 4
              - 0
            to:
              - 4
              - 5
        mode: sweep
        sweepX: 1
    - note: "x=4: primero se activa H2; luego V1 consulta el intervalo y∈[0,5]. Hay dos horizontales
        activas dentro del intervalo: dos cruces."
      planar:
        bounds: &a2
          - -1
          - -1
          - 9
          - 7
        segments: *a1
        mode: sweep
        sweepX: 4
        showHits: false
    - note: "x=4: primero se activa H2; luego V1 consulta el intervalo y∈[0,5]. Hay dos horizontales
        activas dentro del intervalo: dos cruces."
      planar:
        bounds: *a2
        segments: *a1
        mode: sweep
        sweepX: 4
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
