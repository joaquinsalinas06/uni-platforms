---
kind: operation
title: "Mantenimiento del orden de cruces (caso general)"
order: 3
cppSteps:
  - step-1-events.cpp
  - step-2-activation.cpp
  - step-3-intersection-count.cpp
  - step-4-crossing-order.cpp
  - full-implementation.cpp
visualization:
  type: tree
  mode: tree
  steps:
    - note: >-
        Caso "Límite" de examples.md: S1 va de (0,0) a (4,4) y S2 de (0,4) a
        (4,0). En x=0, S1 cruza más abajo (y=0) que S2 (y=4): ese orden es
        el que guarda la BBST de cruces.
      caption: "x=0: orden [S1, S2]"
      nodes:
        - id: s1
          value: "S1 (y=0)"
          parent: null
          state: active
        - id: s2
          value: "S2 (y=4)"
          parent: s1
          side: right
          state: idle
    - note: >-
        El barrido avanza. En algún x intermedio (x=2) ambos segmentos
        valen y=2: es el punto donde se cruzan — exactamente el tipo de
        intersección que el caso simple excluye por regla (#29), porque no
        es horizontal-vertical.
      caption: "x=2: S1 y S2 se cruzan (y=2 ambos)"
      nodes:
        - id: s1
          value: "S1 (y=2)"
          parent: null
          state: marked
        - id: s2
          value: "S2 (y=2)"
          parent: s1
          side: right
          state: marked
    - note: >-
        Pasado el cruce, sus alturas se invirtieron: S2 ahora cruza más
        abajo que S1. La BBST reordena la comparación (su comparador
        depende de x, no es un valor fijo) y el nuevo orden queda [S2, S1].
      caption: "x=4: orden [S2, S1]"
      nodes:
        - id: s2
          value: "S2 (y=0)"
          parent: null
          state: active
        - id: s1
          value: "S1 (y=4)"
          parent: s2
          side: right
          state: idle
---

## Qué hace

En el caso general — segmentos arbitrarios, no sólo horizontales/verticales
— mantiene, para cada posición x del barrido, el orden vertical en el que la
recta de barrido cruza a los segmentos activos.

## Intuición

"Si los segmentos pueden ser arbitrarios, no es posible usar la idea
anterior así como está" (#41): ya no basta con activo/inactivo, porque dos
segmentos oblicuos pueden cambiar su orden relativo en y a medida que x
avanza (uno "adelanta" al otro). Hace falta una estructura que sepa
reordenarse dinámicamente conforme cambia x —
[balanced-bst](/structures/balanced-bst) — con el detalle de que su
comparador no es fijo: compara dos segmentos por su altura y **en la x
actual del barrido**, no por un valor estático.

## Algoritmo

Cita textual (#43): "consideraremos una estructura de tipo BBST que nos
permita ordenar los puntos [de] cruce con la recta vertical del sweep line".
El material no da pseudocódigo (#40-51 es prosa); el de abajo transcribe
directamente esa descripción:

1. Al activar un segmento (evento de su extremo izquierdo), insertarlo en la
   BBST, comparado contra los demás por su altura y en la x actual.
2. Al desactivar (extremo derecho), eliminarlo de la BBST.
3. En cada punto de consulta, el orden de cruces vigente es el recorrido
   in-order de la BBST en ese instante.

El comparador dependiente de x es la sutileza técnica que el material da
por sentada en #43 sin explicarla — se enlaza a
[balanced-bst](/structures/balanced-bst) para la estructura, no para esa
sutileza, que el deck no cubre.

## Pseudocódigo

```
// Insertar/eliminar en la BBST de cruces, comparando por altura en x actual
Activar(bbst, segmento, x_actual):
    bbst.Insert(segmento, comparador_en(x_actual))

Desactivar(bbst, segmento):
    bbst.Delete(segmento)
```

## C++

Ver `step-4-crossing-order.cpp`: se usa `std::set` con un comparador que
evalúa la altura y de cada segmento en la x actual del barrido — el mismo
rol que cumpliría la
[balanced-bst](/structures/balanced-bst) del material.

## Complejidad temporal

$O(\log n)$ por inserción/eliminación — heredado directamente de
[balanced-bst](/structures/balanced-bst): el profesor no analiza esta
operación aparte, sólo declara que la BBST es la estructura elegida (#43).
Sumada sobre n eventos y q consultas, el total del caso general offline es
$O((n+q) \log n)$ (#47).

## Complejidad espacial

No aplica un análisis propio: el material no da espacio para esta variante.

## Ejemplo

Ver [examples.md](/structures/segment-intersection-sweep-line/examples),
caso "Límite": dos segmentos oblicuos que cambian de orden a medida que el
barrido avanza.

## Casos límite

- **Dos segmentos que se cruzan entre sí** (no horizontal-vertical): son
  exactamente el caso que el material excluye del caso simple (#29) y que
  motiva el caso general — su orden en la BBST se invierte al cruzar.
- **Mapa planar sin intersecciones entre aristas** (#45): "al ser un mapa
  planar, no hay intersecciones. Esto simplifica bastante la idea" — el
  orden de cruces nunca se invierte porque las aristas del mapa comparten
  extremos, no se cruzan entre sí (la recta de barrido sí las cruza, que es
  distinto).
- **El paso "segmento → cara" que necesitaría vertical-ray-shooting no está
  en el material**: la BBST da el orden de cruces, pero de ahí a etiquetar
  la cara sobre la que cae un punto de consulta el deck no explica el
  vínculo — hueco declarado en `theory.md`.
