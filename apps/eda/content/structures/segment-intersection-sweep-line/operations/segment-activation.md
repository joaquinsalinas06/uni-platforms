---
kind: operation
title: "Activación / desactivación de segmentos horizontales"
order: 1
cppSteps:
  - step-1-events.cpp
  - step-2-activation.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        La recta de barrido arranca en x=0, antes de cualquier evento. H1
        [x=1..6, y=3] y H2 [x=4..7, y=5] todavía no existen para el
        barrido — ningún segmento horizontal está activo.
      caption: "x=0: activos = {}"
      mode: layers
      arrays:
        - id: ypos
          label: "activos"
          row: 0
          cells: [3, 5]
          states: [idle, idle]
    - note: >-
        El barrido llega a x=1: se activa H1 **antes** de procesar ese
        punto (#34) — la regla de borde que hace que un segmento vertical
        justo en x=1 sí cuente la intersección.
      caption: "x=1: activa H1 (y=3)"
      mode: layers
      arrays:
        - id: ypos
          row: 0
          cells: [3, 5]
          states: [active, idle]
    - note: >-
        El barrido llega a x=4: se activa H2 (y=5) antes de procesar el
        punto — ahora ambos segmentos horizontales están activos, y es
        justo la x en la que llega V1.
      caption: "x=4: activa H2 (y=5)"
      mode: layers
      arrays:
        - id: ypos
          row: 0
          cells: [3, 5]
          states: [active, active]
    - note: >-
        Con H1 y H2 activos, se procesa V1 [x=4, y=0..5]:
        `RSQ(0, 5)` marca ambas posiciones — son exactamente los cruces
        que aporta V1 en este instante (ver
        [intersection-count](/structures/segment-intersection-sweep-line/operations/intersection-count)).
      caption: "V1 consulta RSQ(0, 5) sobre los activos"
      mode: layers
      arrays:
        - id: ypos
          row: 0
          cells: [3, 5]
          states: [marked, marked]
    - note: >-
        Las dos posiciones activas caen dentro de `[0, 5]`: V1 cruza a H1 y
        a H2, dos intersecciones nuevas. El barrido sigue de largo — V1 no
        se activa ni desactiva, sólo consulta.
      caption: "intersecciones acumuladas: 2"
      mode: layers
      arrays:
        - id: ypos
          row: 0
          cells: [3, 5]
          states: [answer, answer]
    - note: >-
        El barrido llega a x=6: se desactiva H1, **después** de procesar
        ese punto (#34) — su rango [1,6] ya terminó y deja de aportar
        cruces a cualquier vertical futuro.
      caption: "x=6: desactiva H1"
      mode: layers
      arrays:
        - id: ypos
          row: 0
          cells: [3, 5]
          states: [muted, active]
    - note: >-
        x=7: se desactiva H2. El barrido termina sin segmentos activos —
        el total de intersecciones que aportó todo el recorrido fue 2,
        todas atribuidas a V1 en x=4.
      caption: "x=7: desactiva H2 — activos: {} — total: 2"
      mode: layers
      arrays:
        - id: ypos
          row: 0
          cells: [3, 5]
          states: [muted, muted]
---

## Qué hace

Marca un segmento horizontal como "presente" en el barrido durante el rango
de x en el que existe, y lo retira apenas ese rango termina.

## Intuición

La recta de barrido sólo necesita saber, en cada instante x, qué segmentos
horizontales tiene enfrente. Un segmento horizontal `[x1, x2]` a altura y
sólo importa mientras el barrido está entre x1 y x2 — antes o después, no
aporta nada. Activar/desactivar es la manera de mantener esa ventana viva
sin recorrer todos los segmentos en cada paso.

## Algoritmo

Textual del profesor (#34): "un segmento horizontal (con x1 ≤ x2) se activa
antes de procesar el punto x1 y se desactiva después de procesar el punto
x2". El orden de los eventos en x importa en el borde: activar **antes** de
procesar x1, desactivar **después** de procesar x2 — un segmento vertical
exactamente en x1 o x2 sí debe contar la intersección.

1. Ordenar todos los extremos de segmentos horizontales (activación en x1,
   desactivación en x2) junto con los segmentos verticales, por x.
2. Al llegar a un evento de activación: marcar la posición y del segmento
   horizontal como activa en la estructura elegida.
3. Al llegar a un evento de desactivación: desmarcarla.

El material no da pseudocódigo formal para este paso (#34-38 es prosa); el
de abajo es una transcripción directa de esa prosa.

## Pseudocódigo

```
// Evento de activación en x1: marcar y como activa
Activar(estructura, y):
    estructura.Update(y, +1)

// Evento de desactivación en x2: desmarcar y
Desactivar(estructura, y):
    estructura.Update(y, -1)
```

## C++

Ver `step-2-activation.cpp`: activación/desactivación como `+1`/`-1` sobre un
Fenwick tree indexado por y, que es una de las dos estructuras que el
profesor nombra en #38 (la otra es el Segment tree —
[segment-tree](/structures/segment-tree) y
[fenwick-tree](/structures/fenwick-tree) son andamio, no se reexplican
aquí).

## Complejidad temporal

$O(\log n)$ por activación o desactivación individual — heredado de la
actualización puntual del Fenwick tree
([fenwick-tree](/structures/fenwick-tree)); el profesor no separa esta
operación del total $O(n \log n)$ del caso simple (#38), que es la cifra que
reporta `meta.yaml`.

## Complejidad espacial

No aplica un análisis propio: el material no da espacio para esta variante.

## Ejemplo

Ver [examples.md](/structures/segment-intersection-sweep-line/examples),
caso "Normal": traza activación/desactivación de dos segmentos horizontales
sobre el mismo barrido que cuenta las intersecciones.

## Casos límite

- **Segmento horizontal de longitud 0** (x1 = x2): se activa y desactiva en
  el mismo evento x — el material no lo menciona explícitamente, pero se
  sigue de la regla de #34 sin ambigüedad.
- **Dos segmentos horizontales que comparten x1 o x2**: el orden "activa
  antes de procesar x1, desactiva después de procesar x2" (#34) resuelve el
  empate sin necesitar una regla adicional.
- **Segmentos horizontales de la misma orientación que se solapan en y**:
  el caso simple exige "no hay intersecciones de segmentos con la misma
  orientación" (#29); el material no dice qué pasa si dos horizontales se
  solapan — caso límite abierto que el usuario debe resolver si aparece en
  la práctica.
