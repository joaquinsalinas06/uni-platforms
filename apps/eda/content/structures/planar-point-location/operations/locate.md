---
kind: operation
title: Consulta de localización
order: 1
cppSteps:
  - step-1-point-and-face.cpp
  - step-2-point-in-polygon.cpp
  - step-3-locate-brute-force.cpp
  - full-implementation.cpp
visualization:
  type: planar
  steps:
    - note: "Mapa de las diapositivas #9/#23, reconstruido siguiendo sus aristas. Las letras A–D son
        etiquetas didácticas. Se usan las coordenadas escritas; el dibujo original no está a
        escala."
      planar:
        bounds:
          - -3
          - -3
          - 30
          - 24
        polygons: &a1
          - id: A
            label: A
            labelAt:
              - 4
              - 11
            vertices:
              - - 0
                - 0
              - - 0
                - 4
              - - 2
                - 15
              - - 10
                - 15
              - - 14
                - 8
              - - 8
                - 10
            state: idle
          - id: B
            label: B
            labelAt:
              - 10
              - 4
            vertices:
              - - 0
                - 0
              - - 8
                - 10
              - - 14
                - 8
              - - 16
                - 13
              - - 20
                - 15
              - - 14
                - 2
              - - 8
                - 0
            state: idle
          - id: C
            label: C
            labelAt:
              - 18
              - 17
            vertices:
              - - 10
                - 15
              - - 16
                - 21
              - - 23
                - 15
              - - 21
                - 1
              - - 14
                - 2
              - - 20
                - 15
              - - 16
                - 13
              - - 14
                - 8
            state: idle
          - id: D
            label: D
            labelAt:
              - 25
              - 6
            vertices:
              - - 23
                - 15
              - - 27
                - 5
              - - 21
                - 1
            state: idle
        query:
          x: 8
          y: 4
        showRay: false
        showHits: false
    - note: Desde Q=(8,4), el rayo horizontal cruza una vez la frontera de B. Impar significa dentro de B.
        Contar cruces es un test por cara, no el algoritmo eficiente de barrido.
      planar:
        bounds:
          - -3
          - -3
          - 30
          - 24
        polygons: *a1
        query:
          x: 8
          y: 4
        mode: parity
    - note: Q=(4,12) pertenece a A. La prueba usa la misma regla, pero evalúa otro contorno. Compartir una
        coordenada no determina la cara.
      planar:
        bounds:
          - -3
          - -3
          - 30
          - 24
        polygons: *a1
        query:
          x: 4
          y: 12
        mode: parity
    - note: Q=(19,4) está en C, no en B. Puedes mover la consulta en Explorar para ver cómo cambia la
        cara.
      planar:
        bounds:
          - -3
          - -3
          - 30
          - 24
        polygons: *a1
        query:
          x: 19
          y: 4
        mode: parity
    - note: "Q=(28,18) queda fuera de todas las caras acotadas: pertenece a la cara infinita. Paridad par
        para una cara significa fuera de esa cara."
      planar:
        bounds:
          - -3
          - -3
          - 30
          - 24
        polygons: *a1
        query:
          x: 28
          y: 18
        mode: parity
---

## Qué hace

Dado un punto $(x_i, y_i)$ y un mapa planar (una subdivisión del plano en
caras), devuelve la cara donde cae ese punto — incluyendo la posibilidad de
que caiga en la **cara infinita**, el complemento de todas las caras
descritas (#7, #9, #64).

## Intuición

El profesor no da una intuición de "cómo" resolverlo de frente — el tema es
justamente la reducción. La intuición que sí da (#18-23) es: lanzar un rayo
vertical hacia arriba desde el punto de consulta hasta el primer segmento
que golpea identifica la arista justo por encima del punto, lo cual acota
la cara. Ese mecanismo se llama **vertical ray shooting** y se desarrolla en
[vertical-ray-shooting](/structures/vertical-ray-shooting); aquí sólo se usa
como referencia de qué resuelve `locate` una vez reducido.

## Algoritmo

El mazo no da un algoritmo propio para esta operación — es una cadena de
reducciones (ver
[Análisis de complejidad](/structures/planar-point-location#análisis-de-complejidad)
en theory.md): `locate` se resuelve lanzando un rayo vertical
([vertical-ray-shooting](/structures/vertical-ray-shooting)), que a su vez
se resuelve con un BBST persistente sobre la recta de barrido:
`Query(t_{x_i}, Successor(y_i))` (#50).

## Pseudocódigo

```
Query(t_{x_i}, Successor(y_i))
```

(#50). Es la única expresión que da el mazo para esta operación — una
fórmula, no un algoritmo desarrollado: no dice qué devuelve `Query`, sobre
qué estructura corre `Successor`, ni cómo se indexa $t_{x_i}$ cuando x_i no
coincide con ningún evento del barrido. Queda como hueco del material (ver
theory.md).

## C++

El mazo no trae ni pseudocódigo ni código para `locate` (ni para el barrido
que lo resuelve). Lo que sigue es una implementación de **fuerza bruta**,
derivada para este tema *(no aparece en las diapositivas)*: prueba cada cara
del mapa con un test de punto-en-polígono por conteo de cruces, en lugar de
resolver por reducción. Sirve de línea base y de oráculo para verificar,
más adelante, las técnicas eficientes que reducen esta consulta (rayo
vertical, barrido, BBST persistente). Ver `step-1-point-and-face.cpp` …
`full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

La fuerza bruta de este tema (`cpp/`) es $O(F \cdot V)$ — F caras, V vértices por
cara en el peor caso — porque prueba cada cara con un test de punto en
polígono que recorre todas sus aristas; **no es la cota del profesor**, es
la línea base que la reducción viene a mejorar.

La cota que sí da el profesor es la que llega **después** de reducir: $O(\log
n)$ vía persistencia sobre el BBST del barrido (#51); ver el desglose
completo, con las variantes offline y de mapas ortogonales, en
[Análisis de complejidad](/structures/planar-point-location#análisis-de-complejidad)
de theory.md y en `meta.yaml`.

## Complejidad espacial

No la da el profesor para esta operación en sí (sólo se menciona espacio
para los resultados de literatura de `edge-update`, #63). La fuerza bruta de
este tema usa $O(F \cdot V)$ para guardar el mapa (F caras, V vértices por cara).

## Ejemplo

Ver [examples.md](/structures/planar-point-location#ejemplos): el mapa del
mazo (#8-9) con los puntos de consulta **(4,12), (8,4) y (19,4)** (#9).

## Casos límite

- **Punto en la cara infinita**: no cae dentro de ninguna cara acotada —
  el problema reto lo declara explícitamente como parte de la respuesta
  posible (#64).
- **Caras disjuntas**: el mapa puede tener regiones separadas entre sí,
  además de la cara infinita (#64).
- **Punto sobre una arista o un vértice**: la implementación didáctica
  devuelve `frontera` antes de probar interiores. El material no fija una
  cara única para estos casos; no se inventa esa asignación.
