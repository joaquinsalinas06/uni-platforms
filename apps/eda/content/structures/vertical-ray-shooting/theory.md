---
kind: theory
title: "Vertical ray shooting"
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        El mapa de #8 (el mismo de examples.md, #23): un único segmento
        techo `R` cruza las tres columnas verticales de consulta —
        x=4, x=8 y x=19 — siempre a la misma altura, y=8. Las tres consultas
        son (4,12), (8,4) y (19,4): cada una dispara su rayo hacia arriba
        por su columna.
      caption: "R cruza x=4, x=8 y x=19 en y=8"
      mode: layers
      arrays:
        - id: col-x4
          label: "x=4 (y_i=12)"
          row: 0
          cells: [8]
          states: [idle]
        - id: col-x8
          label: "x=8 (y_i=4)"
          row: 1
          cells: [8]
          states: [idle]
        - id: col-x19
          label: "x=19 (y_i=4)"
          row: 2
          cells: [8]
          states: [idle]
    - note: >-
        Columna x=8: R cruza en y=8, que sí cumple y ≥ y_i=4 — es candidato
        a ser el primer segmento que toca el rayo desde (8,4).
      caption: "x=8: 8 ≥ 4 — candidato"
      mode: layers
      arrays:
        - id: col-x4
          label: "x=4 (y_i=12)"
          row: 0
          cells: [8]
          states: [idle]
        - id: col-x8
          label: "x=8 (y_i=4)"
          row: 1
          cells: [8]
          states: [marked]
        - id: col-x19
          label: "x=19 (y_i=4)"
          row: 2
          cells: [8]
          states: [idle]
    - note: >-
        Columna x=19: el mismo R cruza también en y=8, que igualmente
        cumple y ≥ y_i=4 — también es candidato desde (19,4), aunque la
        columna es otra.
      caption: "x=19: 8 ≥ 4 — también candidato"
      mode: layers
      arrays:
        - id: col-x4
          label: "x=4 (y_i=12)"
          row: 0
          cells: [8]
          states: [idle]
        - id: col-x8
          label: "x=8 (y_i=4)"
          row: 1
          cells: [8]
          states: [marked]
        - id: col-x19
          label: "x=19 (y_i=4)"
          row: 2
          cells: [8]
          states: [marked]
    - note: >-
        (8,4) y (19,4) tocan el mismo segmento R como primera respuesta,
        aunque disparan el rayo por columnas distintas: por eso caen en la
        misma cara, sin que haga falta razonar sobre la forma de esa cara.
      caption: "mismo segmento en columnas distintas ⇒ misma cara"
      mode: layers
      arrays:
        - id: col-x4
          label: "x=4 (y_i=12)"
          row: 0
          cells: [8]
          states: [idle]
        - id: col-x8
          label: "x=8 (y_i=4)"
          row: 1
          cells: [8]
          states: [answer]
        - id: col-x19
          label: "x=19 (y_i=4)"
          row: 2
          cells: [8]
          states: [answer]
    - note: >-
        Columna x=4: el mismo R cruza en y=8, pero aquí y_i=12 > 8 — el
        rayo hacia arriba desde (4,12) deja a R por debajo suyo, así que R
        no cumple y ≥ y_i y se descarta como respuesta para este punto.
      caption: "x=4: 8 < 12 — R queda debajo, se descarta"
      mode: layers
      arrays:
        - id: col-x4
          label: "x=4 (y_i=12)"
          row: 0
          cells: [8]
          states: [muted]
        - id: col-x8
          label: "x=8 (y_i=4)"
          row: 1
          cells: [8]
          states: [answer]
        - id: col-x19
          label: "x=19 (y_i=4)"
          row: 2
          cells: [8]
          states: [answer]
    - note: >-
        La respuesta de (4,12) es entonces otro segmento — el que
        delimita la cara de arriba en esa columna, fuera de este
        fragmento del mapa — necesariamente distinto de R. Mismo
        segmento respuesta ⇒ misma cara; segmento distinto ⇒ cara
        distinta: exactamente la reformulación de PPL que abre este tema.
      caption: "distinto segmento respuesta ⇒ distinta cara"
      mode: layers
      arrays:
        - id: col-x4
          label: "x=4 (y_i=12)"
          row: 0
          cells: [8]
          states: [muted]
        - id: col-x8
          label: "x=8 (y_i=4)"
          row: 1
          cells: [8]
          states: [answer]
        - id: col-x19
          label: "x=19 (y_i=4)"
          row: 2
          cells: [8]
          states: [answer]
---

## ¿Qué problema resuelve?

[Planar point location](/structures/planar-point-location) pregunta "¿en qué
cara del mapa cae este punto de consulta?" — una pregunta sobre regiones,
difícil de atacar directamente porque una cara no tiene una forma canónica
sobre la cual construir una estructura de datos. El profesor la vuelve
tratable con una reformulación: "podemos caracterizar la cara de cada punto
según el primer segmento que 'choque' si trazamos un rayo desde el mismo
verticalmente hacia arriba (eje Y positivo) o abajo (eje Y negativo). Este
nuevo problema se llama vertical ray shooting" (#19-20).

Esa es la idea entera del tema: en vez de preguntar por una cara (una
región, sin estructura evidente), se pregunta por un segmento (un objeto
lineal, con coordenadas). PPL **se reduce** a vertical ray shooting — resolver
el segundo resuelve el primero, porque cada cara queda identificada por el
primer segmento que la delimita por arriba.

## Intuición

Un mapa planar es un conjunto de caras separadas por segmentos. Si desde un
punto de consulta se dispara un rayo vertical hacia arriba, ese rayo tiene
que cruzar la frontera de la cara donde está el punto antes de cruzar
cualquier otra — y esa frontera, en la dirección del rayo, es exactamente un
segmento del mapa. Ese primer segmento **es** la cara: dos puntos en la misma
cara siempre dan con el mismo primer segmento al disparar el rayo, y puntos
en caras distintas dan con segmentos distintos (o el mismo segmento visto
desde lados opuestos, lo cual también identifica la cara sin ambigüedad).

Ver el diagrama paso a paso en
[ray-query](/structures/vertical-ray-shooting/operations/ray-query): el rayo
descarta los segmentos que cruzan por debajo de $y_i$ y se queda con el
sucesor — el primer segmento a su paso.

La pregunta "¿qué cara?" se volvió la pregunta "¿qué segmento cruza primero
la vertical de mi punto, por encima de él?" — la misma información, pero
ahora expresada sobre objetos (segmentos) en vez de regiones.

## Estructura interna

Vertical ray shooting no guarda un nodo ni un invariante propio: es una
**reformulación** del problema de PPL, no una estructura de datos nueva.
Quien sí necesita estructura es la operación (ver abajo) y, sobre todo, la
reducción posterior a [segment-intersection-sweep-line](/structures/segment-intersection-sweep-line),
que es quien aporta la maquinaria real (segment tree, BBST, persistencia).

## Operaciones

- [ray-query](/structures/vertical-ray-shooting/operations/ray-query) — dado
  un punto de consulta, encontrar el primer segmento que un rayo vertical
  hacia arriba (o hacia abajo) toca.

## Análisis de complejidad

El estilo del profesor aquí es **reducción**, no cómputo directo: el valor
del tema no es una cota propia, sino la equivalencia que permite atacar el
problema. El profesor da la forma concreta de resolver la consulta: "si
consideramos las rectas verticales $x = x_i$ para los puntos de consulta, la
respuesta se reducirá al menor $y \ge y_i$ de los segmentos que se intersectan
con la recta" (#22). Es decir, ray-query se convierte en: de todos los
segmentos que cruzan la vertical $x = x_i$, tomar el de menor `y` que aún esté
por encima de $y_i$ (o el de mayor `y` por debajo, si el rayo va hacia
abajo).

Esa reformulación ("menor $y \ge y_i$ entre los segmentos que cruzan $x = x_i$") es
justo la forma de una consulta de sucesor sobre un conjunto de valores que
cambia mientras la recta vertical barre de izquierda a derecha — que es
exactamente el problema que resuelve
[segment-intersection-sweep-line](/structures/segment-intersection-sweep-line)
(#24 en adelante). Vertical ray shooting no tiene, por tanto, un análisis de
costo propio: hereda el de esa reducción, $O(\log n)$ por consulta con
persistencia sobre un BBST (#51).

## Tabla de complejidad

La única entrada de la tabla (`ray-query`) es heredada, no calculada aquí —
ver [meta.yaml](/structures/vertical-ray-shooting) y el razonamiento arriba.
El profesor sí menciona, como resultado citado y sin construirlo en el
curso, que el ray shooting estático general tiene una solución de
Agarwal (1992) en $O((n/\sqrt{s}) \cdot \text{polylog } n)$ con espacio
$O(s^{1+\varepsilon})$, $s \in [1,n]$
(#63) — un resultado de referencia, no la técnica que el curso construye.

## Ejemplos

Ver [examples.md](/structures/vertical-ray-shooting/examples).

## Comparación con estructuras relacionadas

| | planar-point-location | vertical-ray-shooting |
| --- | --- | --- |
| pregunta | ¿en qué cara cae el punto? | ¿qué segmento toca primero el rayo vertical desde el punto? |
| objeto de la pregunta | una región (sin forma canónica) | un segmento (coordenadas, orden) |
| cómo se resuelve | se reduce a vertical-ray-shooting | se reduce a [segment-intersection-sweep-line](/structures/segment-intersection-sweep-line) |

## Prueba de dominio

Ver [mastery-check.md](/structures/vertical-ray-shooting/mastery-check).
