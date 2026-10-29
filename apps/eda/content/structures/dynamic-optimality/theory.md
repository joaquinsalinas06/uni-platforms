---
kind: theory
title: Optimalidad dinámica
visualization:
  type: tree
  steps:
    - note: "Ejemplo didáctico: secuencia S=(1,1,1,1,4,4,4,4), con el mismo árbol
        inicial para todas las estrategias. El dibujo compara mantenerlo fijo
        con reestructurarlo; no calcula OPT(S)."
      nodes:
        - id: n1
          value: 1
          parent: n2
          side: left
        - id: n2
          value: 2
          parent: null
        - id: n3
          value: 3
          parent: n2
          side: right
        - id: n4
          value: 4
          parent: n3
          side: right
    - note: "En el árbol fijo, buscar 1 visita 2→1: dos nodos y un movimiento por
        arista. Buscar 4 visita 2→3→4: tres nodos y dos movimientos. Repetir una
        llave no abarata ese recorrido si la forma permanece fija."
      highlight:
        - n2
        - n1
      nodes:
        - id: n1
          value: 1
          parent: n2
          side: left
        - id: n2
          value: 2
          parent: null
        - id: n3
          value: 3
          parent: n2
          side: right
        - id: n4
          value: 4
          parent: n3
          side: right
    - note: "Una estrategia adaptativa puede subir 1 al acceder a él: una rotación
        derecha con 2 lo deja como raíz. Las siguientes consultas a 1 ya no
        descienden por aristas. Esa rotación también se cobra; no es trabajo
        gratis."
      highlight:
        - n1
        - n2
      nodes:
        - id: n1
          value: 1
          parent: null
        - id: n2
          value: 2
          parent: n1
          side: right
        - id: n3
          value: 3
          parent: n2
          side: right
        - id: n4
          value: 4
          parent: n3
          side: right
    - note: "Al acceder a 4, el camino actual es 1→2→3→4. Para exhibir el costo de la
        reestructuración lo subimos un nivel por giro. Primera rotación
        izquierda: 4 intercambia su posición con 3. Faltan dos niveles."
      highlight:
        - n4
        - n3
      nodes:
        - id: n1
          value: 1
          parent: null
        - id: n2
          value: 2
          parent: n1
          side: right
        - id: n3
          value: 3
          parent: n4
          side: left
        - id: n4
          value: 4
          parent: n2
          side: right
    - note: "Segunda rotación izquierda: 4 sube sobre 2. El nodo 3 queda como hijo
        derecho de 2. Se conserva el orden 1<2<3<4; aún falta subir sobre 1."
      highlight:
        - n4
        - n2
      nodes:
        - id: n1
          value: 1
          parent: null
        - id: n2
          value: 2
          parent: n4
          side: left
        - id: n3
          value: 3
          parent: n2
          side: right
        - id: n4
          value: 4
          parent: n1
          side: right
    - note: "Tercera rotación izquierda: 4 sube sobre 1 y queda como raíz. Han sido
        tres rotaciones para recorrer tres niveles, no una. Los siguientes
        accesos a 4 ya encuentran la llave en la raíz."
      highlight:
        - n4
        - n1
      nodes:
        - id: n1
          value: 1
          parent: n4
          side: left
        - id: n2
          value: 2
          parent: n1
          side: right
        - id: n3
          value: 3
          parent: n2
          side: right
        - id: n4
          value: 4
          parent: null
    - note: El balance final debe incluir búsquedas, movimientos y todas las
        rotaciones. Esta estrategia sólo ilustra cómo adaptar la forma al
        patrón; no prueba que sea óptima ni competitiva. OPT(S) es el mínimo
        entre todas las estrategias permitidas que parten del mismo estado y
        conocen S.
      highlight:
        - n4
      nodes:
        - id: n1
          value: 1
          parent: n4
          side: left
        - id: n2
          value: 2
          parent: n1
          side: right
        - id: n3
          value: 3
          parent: n2
          side: right
        - id: n4
          value: 4
          parent: null
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
