---
kind: theory
title: "Optimalidad dinámica"
visualization:
  type: tree
  steps:
    - note: >-
        Árbol estático de partida sobre las llaves {1,2,3,4}, fijo antes de
        ver la secuencia S = (1,1,1,1,4,4,4,4) *(derivado; ver
        examples.md)*. Un algoritmo que no se reestructura paga esta forma
        para toda la secuencia.
      nodes:
        - { id: n2, value: 2 }
        - { id: n1, value: 1, parent: n2, side: left }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n4, value: 4, parent: n3, side: right }
    - note: >-
        Bloque de accesos a 1: con este árbol fijo, cada acceso baja
        raíz→1, profundidad 2. Costo real por acceso — el que paga
        cualquier estrategia que no anticipe el bloque.
      highlight: ["n1"]
      nodes:
        - { id: n2, value: 2, state: idle }
        - { id: n1, value: 1, parent: n2, side: left, state: active }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n4, value: 4, parent: n3, side: right }
    - note: >-
        OPT(S) ve la secuencia completa de antemano y ya eligió 1 como raíz
        desde el inicio: profundidad 1 en todo el primer bloque. Marcado
        `answer` porque es la respuesta canónica del óptimo offline, no algo
        que un algoritmo online pueda saber sin ver el futuro.
      highlight: ["n1"]
      nodes:
        - { id: n1, value: 1, state: answer }
        - { id: n2, value: 2, parent: n1, side: right }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n4, value: 4, parent: n3, side: right }
    - note: >-
        En la frontera entre bloques, OPT rota una vez para subir 4 —
        anticipando el segundo bloque. Un algoritmo online real sólo podría
        notar el cambio de patrón *después* de verlo, no en la frontera
        exacta: esa es la brecha que "O(1)-competitivo" preguntaría si se
        puede cerrar.
      highlight: ["n4"]
      nodes:
        - { id: n4, value: 4, state: answer }
        - { id: n1, value: 1, parent: n4, side: left }
        - { id: n2, value: 2, parent: n1, side: right }
        - { id: n3, value: 3, parent: n2, side: right }
    - note: >-
        Bloque de accesos a 4: profundidad 1 por acceso, igual de barato que
        el primer bloque. El costo total de OPT sobre S queda muy por debajo
        del estático — la pregunta abierta es si algún algoritmo *online*
        logra acercarse a este total sin ver S por adelantado.
      highlight: ["n4"]
      nodes:
        - { id: n4, value: 4, state: active }
        - { id: n1, value: 1, parent: n4, side: left }
        - { id: n2, value: 2, parent: n1, side: right }
        - { id: n3, value: 3, parent: n2, side: right }
---

## ¿Qué problema resuelve?

El [modelo computacional BST](/structures/bst-computational-model) da un
marco formal para costar cualquier BST dinámico, y las
[propiedades de las secuencias de búsqueda](/structures/search-sequence-properties)
dan cotas intermedias que un BST *debería* cumplir automáticamente si fuera
bueno. Pero ninguna de las dos responde la pregunta que el profesor plantea
desde el inicio del mazo (#6-12): dado que no sabemos construir un BST que
sea óptimo para *toda* secuencia de búsquedas, ¿existe al menos un algoritmo
online (que decide cada rotación sin conocer el futuro) que se acerque al
rendimiento del mejor árbol posible para esa secuencia?

Esta es esa pregunta, formalizada. **No tiene respuesta conocida.** El
profesor lo dice explícitamente: para BST "por el momento es un problema
abierto" (#56), y lo mismo para máquina de punteros (#57). Lo único que "se
cubre" en este tema son los resultados parciales que sí se conocen (#56-58),
no una solución.

## Intuición

Pensar en un adversario que ve la secuencia completa de búsquedas $S$ antes
de construir el árbol y elegir todas las rotaciones que quiera en cada paso:
ese adversario logra el costo mínimo posible, $OPT(S)$, porque no tiene que
decidir nada a ciegas. Un algoritmo real (un BST autoajustable) sólo ve las
búsquedas una por una, en orden, y decide sus rotaciones sin saber qué viene
después.

La pregunta de fondo es si esa desventaja de información —no conocer el
futuro— cuesta *mucho* o cuesta *poco*: si existe un algoritmo online cuyo
costo total sobre cualquier $S$ esté siempre a lo más una constante veces
$OPT(S)$, la desventaja de no ver el futuro no importa asintóticamente.

## Estructura interna

No aplica: es una pregunta sobre el modelo BST (ya definido en
[bst-computational-model](/structures/bst-computational-model)), no una
estructura de datos con su propio invariante.

## Operaciones

`operations: []` en el knowledge map. No hay operaciones que definir: la
optimalidad dinámica es una propiedad que se le pregunta a un algoritmo de
BST dinámico, no un algoritmo en sí misma.

## Análisis de complejidad

Estilo del profesor: **análisis competitivo** — el costo de un algoritmo
online se mide como razón contra el costo del óptimo offline para la misma
entrada, no en términos absolutos ni por recurrencia.

Sea $S$ una secuencia de búsquedas y $OPT(S)$ el costo mínimo posible para
atenderla con *algún* BST sobre el modelo computacional BST — incluyendo
todas las rotaciones que se quieran, elegidas viendo $S$ por completo de
antemano. El profesor define (#53):

$$\text{Complejidad total}(S) = O(OPT(S))$$

Un algoritmo online (que sólo ve las búsquedas en orden, una por una) es
**$O(1)$-competitivo** si existe una constante $k$ tal que, para *toda*
secuencia $S$, su costo total al atender $S$ es a lo más $k \cdot OPT(S)$. Es la
pregunta que el profesor formula literalmente como "¿es posible tener un
algoritmo de BST dinámico que pueda igualar al rendimiento óptimo si se
supiera el futuro?" (#54).

Lo que se sabe (#56-58):

- **¿Existe un BST $O(1)$-competitivo?** Abierto. "Por el momento es un
  problema abierto para BST" (#56).
- **¿Existe un algoritmo $O(1)$-competitivo sobre máquina de punteros** (sin
  la restricción de ser un BST)**?** También abierto — y es una pregunta
  *distinta* de la anterior, porque máquina de punteros es un modelo más
  permisivo (#57).
- **¿Se sabe algo parcial?** Sí: "es posible obtener un algoritmo
  $O(\log \log n)$-competitivo para BST" (#58). El profesor no nombra qué
  estructura logra esa cota — no inventar cuál es.

> **Nota de apoyo** (no está en las diapositivas): $OPT(S)$ tampoco se define
> operacionalmente en el mazo — no se dice cómo calcularlo ni si es
> computable en tiempo razonable. El material lo usa como una cantidad de
> referencia, no como algo que un algoritmo pueda obtener en la práctica.
> Esa es justamente la razón por la que "ser O(1)-competitivo" es una
> pregunta difícil: hay que acercarse a un valor que ni siquiera se sabe
> calcular eficientemente.

Por qué esto es una pregunta abierta y no un resultado sin probar todavía:
nadie ha exhibido un algoritmo $O(1)$-competitivo para BST, pero tampoco se ha
probado que sea imposible. Ambas direcciones siguen sin resolverse.

## Tabla de complejidad

No aplica: `complexity: {}` en meta.yaml. No hay un costo propio que
tabular — lo que hay son los tres renglones de la tabla del análisis de
complejidad de arriba (abierto / abierto / O(log log n)), que no son cotas
de una operación sino el estado de una conjetura.

## Ejemplos

Ver [examples.md](/structures/dynamic-optimality#ejemplos): no hay ejemplos
numéricos en el mazo (el profesor no instancia secuencias concretas para
este tema), así que se ilustra la definición de $OPT(S)$ con secuencias
pequeñas derivadas a mano.

## Comparación con estructuras relacionadas

| | [propiedades de secuencias](/structures/search-sequence-properties) | optimalidad dinámica |
| --- | --- | --- |
| qué es | cotas intermedias que un BST bueno cumpliría (propiedades necesarias) | la pregunta de si existe un BST que alcance el óptimo (condición suficiente, sin resolver) |
| estado | resultados probados sobre el modelo BST | conjetura abierta |
| candidato del curso | — | [Splay Tree](/structures/splay-tree): la pregunta final del mazo (#75) es si el splay tree es O(1)-competitivo — no se desarrolla aquí, se enlaza como destino |

## Prueba de dominio

Ver [mastery-check.md](/structures/dynamic-optimality#prueba-de-dominio).
