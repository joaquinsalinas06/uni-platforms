---
kind: operation
title: "Ray Query"
order: 1
cppSteps:
  - step-1-segment.cpp
  - step-2-brute-force.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        Sólo importan los segmentos que cruzan x = x_i. Ordenados por su
        altura de cruce: B en y=2 y A en y=8. El punto de consulta tiene
        y_i=4 y el rayo va hacia arriba. *(derivado del diagrama del
        profesor en theory.md; no aparece con estos números en las
        diapositivas)*.
      caption: "y_i = 4 — rayo hacia arriba"
      mode: layers
      arrays:
        - id: alturas
          label: "cruces en x=x_i"
          row: 0
          cells: [2, 8]
    - note: >-
        B cruza en y=2, por debajo de y_i=4: no puede ser el primero que
        toca un rayo que sube — se descarta.
      caption: "2 < y_i: descartado"
      mode: layers
      arrays:
        - id: alturas
          row: 0
          cells: [2, 8]
          states: [muted, idle]
    - note: >-
        A cruza en y=8, que sí es ≥ y_i=4: es el candidato — el sucesor de
        y_i entre las alturas de cruce.
      caption: "8 ≥ y_i: candidato (sucesor de y_i)"
      mode: layers
      arrays:
        - id: alturas
          row: 0
          cells: [2, 8]
          states: [muted, marked]
    - note: >-
        A es el menor cruce que aún cumple y ≥ y_i: el primer segmento que
        el rayo toca subiendo desde P. Esa es la respuesta de ray-query.
      caption: "respuesta: segmento A (y=8)"
      mode: layers
      arrays:
        - id: alturas
          row: 0
          cells: [2, 8]
          states: [muted, answer]
---

## Qué hace

Dado un punto de consulta $(x_i, y_i)$ y un conjunto de segmentos (el mapa
planar), encuentra el primer segmento que un rayo vertical desde ese punto
toca en la dirección elegida — hacia arriba (eje Y positivo) o hacia abajo
(eje Y negativo); "ambas válidas" (#19). Ese segmento identifica la cara del
mapa donde cae el punto (ver [theory.md](/structures/vertical-ray-shooting)).

## Intuición

De todos los segmentos, sólo importan los que cruzan la recta vertical
$x = x_i$ — cualquier otro segmento no puede tocar el rayo. Entre esos, el
rayo hacia arriba toca primero al que tiene la menor altura de cruce que
todavía está por encima de $y_i$ (el rayo hacia abajo, análogamente, busca
la mayor altura por debajo de $y_i$).

## Algoritmo

El profesor lo da como reducción, no como pseudocódigo: "si consideramos las
rectas verticales $x = x_i$ para los puntos de consulta, la respuesta se
reducirá al menor $y \ge y_i$ de los segmentos que se intersectan con la recta"
(#22). En términos operativos:

1. De todos los segmentos, quedarse con los que cruzan $x = x_i$.
2. De esos, calcular la altura `y` a la que cada uno cruza esa vertical.
3. Tomar el segmento cuyo `y` de cruce es el mínimo que aún cumple $y \ge y_i$
   (rayo hacia arriba).

## Pseudocódigo

**Ninguno** — el profesor no da pseudocódigo para esta operación (#18-23);
sólo la reformulación en prosa citada arriba.

## C++

Ver `step-1-segment.cpp`, `step-2-brute-force.cpp` y
`full-implementation.cpp` en el editor de arriba.

*(Derivado del pseudocódigo/enunciado; no aparece en las diapositivas)*: la
implementación por fuerza bruta de la reducción del profesor — recorrer
todos los segmentos, quedarse con los que cruzan $x = x_i$, calcular la
altura de cruce y tomar el mínimo por encima de $y_i$.

## Complejidad temporal

$O(n)$ por consulta, revisando los `n` segmentos uno por uno — ésta es la
versión de fuerza bruta que hace explícita la reducción, no la que construye
el curso. La versión que el profesor efectivamente desarrolla reduce esto a
$O(\log n)$ por consulta apoyándose en
[segment-intersection-sweep-line](/structures/segment-intersection-sweep-line)
(#51); ver el razonamiento en
[theory.md](/structures/vertical-ray-shooting#análisis-de-complejidad).

## Complejidad espacial

$O(n)$ para guardar los `n` segmentos del mapa; el profesor no distingue un
espacio propio para esta operación más allá de eso.

## Ejemplo

Ver [examples.md](/structures/vertical-ray-shooting/examples) — los tres
puntos de consulta (4,12), (8,4) y (19,4) sobre el mapa del profesor (#23).

## Casos límite

Casos que el profesor sí menciona (#19, #58):
- Dirección del rayo: hacia arriba o hacia abajo son ambas consultas
  válidas — el algoritmo es simétrico, sólo cambia el sentido de la
  comparación ($y \ge y_i$ vs. $y \le y_i$).
- Ray shooting con dirección arbitraria (no vertical) queda explícitamente
  como problema abierto para el curso: "¿Cómo resolvemos eficientemente un
  ray shooting con una dirección arbitraria? Este problema es de interés
  para un caso en 3 dimensiones (ray tracing)" (#58) — no se resuelve aquí.

> **Nota de apoyo** (no está en las diapositivas): casos degenerados que el
> profesor no menciona pero que una implementación tiene que decidir:
> - El rayo pasa exactamente por un extremo de un segmento (el cruce es un
>   vértice, no un punto interior del segmento): se cuenta como cruce válido,
>   igual que si atravesara el interior.
> - Un segmento vertical (mismo `x` en ambos extremos) que coincide con
>   $x = x_i$: no tiene una única altura de cruce (coincide en un intervalo
>   completo de `y`), así que se trata como caso especial y se descarta de la
>   comparación normal por altura de cruce.
> - El punto de consulta está exactamente sobre un segmento ($y_i$ es igual
>   a la altura de cruce de algún segmento): se decide por convención si
>   cuenta como "sobre la frontera" o como perteneciente a la cara de arriba;
>   el curso no lo resuelve, `full-implementation.cpp` lo trata como cruce
>   válido con $y \ge y_i$ (frontera inclusiva).
