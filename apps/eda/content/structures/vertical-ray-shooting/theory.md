---
kind: theory
title: Vertical ray shooting
visualization:
  type: planar
  steps:
    - note: "El mapa original (#9/#23), reconstruido por sus aristas. Q=(8,4) lanza un rayo hacia arriba:
        el primer impacto es la arista que bordea la cara B por encima del punto."
      planar:
        bounds:
          - -3
          - -3
          - 30
          - 24
        segments: &a15
          - id: e1
            from:
              - 0
              - 0
            to: &a1
              - 0
              - 4
          - id: e2
            from: *a1
            to: &a2
              - 2
              - 15
          - id: e3
            from: *a2
            to:
              - 10
              - 15
          - id: e4
            from: &a4
              - 14
              - 8
            to: &a9
              - 10
              - 15
          - id: e5
            from: &a3
              - 8
              - 10
            to:
              - 14
              - 8
          - id: e6
            from: &a8
              - 0
              - 0
            to: *a3
          - id: e7
            from: &a5
              - 16
              - 13
            to: *a4
          - id: e8
            from: &a6
              - 20
              - 15
            to: *a5
          - id: e9
            from: &a11
              - 14
              - 2
            to: *a6
          - id: e10
            from:
              - 14
              - 2
            to: &a7
              - 8
              - 0
          - id: e11
            from: *a7
            to: *a8
          - id: e12
            from: *a9
            to: &a10
              - 16
              - 21
          - id: e13
            from: *a10
            to:
              - 23
              - 15
          - id: e14
            from: &a14
              - 21
              - 1
            to: &a12
              - 23
              - 15
          - id: e15
            from:
              - 21
              - 1
            to: *a11
          - id: e16
            from: *a12
            to: &a13
              - 27
              - 5
          - id: e17
            from: *a13
            to: *a14
        query:
          x: 8
          y: 4
        mode: ray
    - note: "Q=(4,12) toca otra arista: el techo de la cara A. Una misma cara puede tener varias aristas
        superiores; distinto segmento no implica distinta cara."
      planar:
        bounds:
          - -3
          - -3
          - 30
          - 24
        segments: *a15
        query:
          x: 4
          y: 12
        mode: ray
    - note: Q=(19,4) está en la cara C. Tras encontrar el segmento se consulta qué cara queda debajo de
        él; el identificador de segmento por sí solo no es la etiqueta de cara.
      planar:
        bounds:
          - -3
          - -3
          - 30
          - 24
        segments: *a15
        query:
          x: 19
          y: 4
        mode: ray
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

El rayo conserva x y avanza hacia y mayor. Solo importan los segmentos que
cruzan esa columna por encima del punto; se elige el menor y de cruce.

Encontrar la arista superior reduce una consulta sobre regiones a una
búsqueda ordenada. Después se consulta qué cara queda debajo de esa arista.
**Distintas aristas pueden bordear la misma cara**. En un vértice compartido,
la coincidencia geométrica requiere tratar el empate y la incidencia.

En [Ray Query](/structures/vertical-ray-shooting/operations/ray-query) puedes
mover Q y observar tanto el primer impacto como la ausencia de respuesta.
El tema siguiente muestra [el barrido](/structures/segment-intersection-sweep-line)
que mantiene los segmentos ordenados; la semana 5 reutiliza rayos en
[dominancia 2D](/structures/dominance-2d), con otra pregunta: reportar puntos.

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
