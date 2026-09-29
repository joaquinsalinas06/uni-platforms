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
  type: tree
  mode: tree
  steps:
    - note: >-
        `locate` no tiene estructura propia ni algoritmo directo del
        profesor: es un problema que se resuelve encadenando reducciones.
        Este diagrama no dibuja el mapa planar (ninguna familia de
        visualización sabe hacerlo con esta subdivisión arbitraria) — sólo
        la cadena de "esto se reduce a esto otro" que arma theory.md.
      caption: "paso 1 de 3: PPL (localizar un punto en el mapa)"
      nodes:
        - id: ppl
          value: "PPL: locate(x,y)"
          parent: null
          state: active
    - note: >-
        El profesor reduce PPL a lanzar un rayo vertical hacia arriba desde
        el punto: el primer segmento que golpea acota la cara (#18-23). Esa
        reformulación es exactamente
        [vertical-ray-shooting](/structures/vertical-ray-shooting).
      caption: "paso 2 de 3: se reduce a vertical-ray-shooting"
      nodes:
        - id: ppl
          value: "PPL: locate(x,y)"
          parent: null
          state: muted
        - id: vrs
          value: "vertical-ray-shooting"
          parent: ppl
          state: active
    - note: >-
        El rayo vertical se ve, a su vez, como el caso especial de
        intersección de segmentos con barrido (#24-38): activar/desactivar
        segmentos horizontales y consultar sobre un BBST persistente —
        `Query(t_{x_i}, Successor(y_i))` (#50) — deja la consulta en
        O(log n).
      caption: "paso 3 de 3: se reduce a BBST persistente (barrido)"
      nodes:
        - id: ppl
          value: "PPL: locate(x,y)"
          parent: null
          state: muted
        - id: vrs
          value: "vertical-ray-shooting"
          parent: ppl
          state: muted
        - id: bbst
          value: "BBST persistente"
          parent: vrs
          state: answer
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
- **Punto sobre una arista o un vértice**: el mazo no lo menciona (hueco
  abierto); la implementación de fuerza bruta de este tema lo trata con la
  ambigüedad propia del conteo de cruces (un punto exactamente sobre el
  borde puede caer a cualquier lado según redondeo).
