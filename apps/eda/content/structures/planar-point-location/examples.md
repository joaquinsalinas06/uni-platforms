---
kind: examples
title: Ejemplos
---

<!--
El mapa y los puntos de consulta son los del profesor (#8-9, #23), sin
marca. hasVisualization: false → diagramas ASCII en vez de bloques
`visualization`. El deck no da coordenadas de "cara" (qué vértices delimitan
cada región) ni pseudocódigo del barrido, así que el trazo paso a paso de
la fuerza bruta (test de punto en polígono) está *(derivado; no aparece en
las diapositivas)*, marcado como tal en cada caso.
-->

## Mínimo

El mapa planar del profesor (#8), con sus vértices:

```
(0,0) (0,4) (2,15) (8,0) (8,10) (10,15) (14,2) (14,8) (16,13) (16,21)
(19,4) (20,15) (21,1) (23,15) (27,5)
```

y el punto de consulta **(8,4)** (#9) — el caso donde el punto cae dentro de
una cara claramente acotada, sin ambigüedad de borde:

```
   y
 15 ┤        *2,15         *10,15      *16,13        *23,15
    │                                          *16,21
    │
    │
  8 ┤              *8,10
    │
  4 ┤  *0,4                         X(8,4)          *19,4
    │
  0 ┤*0,0      *8,0            *14,2       *21,1
    └────────────────────────────────────────────────→ x
      0    5    10    15    20    25    30
```

*(derivado del test de punto en polígono; no aparece en las diapositivas)*:
para responder `locate(8,4)` por fuerza bruta se recorre cada cara del mapa
y se cuenta, desde el punto hacia la derecha, cuántas veces cruza su
frontera — un número impar de cruces significa "dentro". La cara que
contiene (0,0)-(8,0)-(8,10)-(0,4) da un cruce impar para (8,4): cae dentro
de ella.

## Normal

Los tres puntos de consulta que usa el profesor a la vez (#9): **(4,12),
(8,4) y (19,4)**, marcados con X sobre el mismo mapa:

```
   y
 21 ┤                                                  *16,21
 15 ┤        *2,15         *10,15      *16,13        *23,15
    │  X(4,12)
  8 ┤              *8,10
  4 ┤  *0,4                         X(8,4)          X(19,4) *19,4
  0 ┤*0,0      *8,0            *14,2       *21,1
    └────────────────────────────────────────────────→ x
      0    5    10    15    20    25    30
```

Éste es el caso típico: tres consultas independientes sobre el mismo mapa
estático, cada una resuelta con la misma prueba, cara por cara. Es también
el mapa que reaparece en
[vertical-ray-shooting](/structures/vertical-ray-shooting) (#23), con un
rayo vertical desde cada uno de estos tres puntos en vez de la prueba de
polígono completa — la reducción que este tema deja planteada.

## Límite

El caso patológico que la clasificación del profesor señala pero no traza
con un punto concreto: un punto que **no cae en ninguna cara acotada**, es
decir, en la **cara infinita** — el complemento de todas las caras descritas
(#64):

```
   y
 15 ┤        *2,15         *10,15      *16,13        *23,15
    │
    │                                                        X(40,40)
  4 ┤  *0,4                         *8,4              *19,4
  0 ┤*0,0      *8,0            *14,2       *21,1
    └────────────────────────────────────────────────→ x
      0    5    10   15    20    25    30    35    40
```

*(derivado; no aparece en las diapositivas)*: `locate(40,40)` no cruza un
número impar de aristas para ninguna cara del mapa — la fuerza bruta agota
todas las caras sin encontrar una que contenga al punto, y por descarte
devuelve la cara infinita. Es el caso que motiva declarar explícitamente
esa región en el problema reto (#64): sin ella, la consulta no tendría
respuesta válida para puntos fuera del mapa dibujado.
