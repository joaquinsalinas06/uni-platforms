---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      ¿Cuáles son las tres únicas operaciones que define el modelo
      computacional del BST? ¿Cuáles de ellas cuestan O(1)?
    hints:
      - "Repasa la sección \"Operaciones\" de la teoría: hay exactamente tres."
      - "Dos de las tres son postulados de costo unitario; la tercera se define en términos de ellas."
    solution: >-
      pointer-move y rotate son O(1) (postulados, #19 y #20). search no es
      O(1): su costo es la profundidad de x, O(log n) en el mejor de los
      casos posibles y O(n) en el peor.
  - level: 2
    statement: >-
      Dado el árbol con raíz 4, hijo izquierdo 2 (con hijos 1 y 3) e hijo
      derecho 6 (con hijos 5 y 7), traza Buscar(5) paso a paso listando cada
      pointer-move.
    hints:
      - "Empieza en la raíz y compara 5 contra 4: ¿a qué lado bajas?"
      - "Son exactamente 2 pointer-moves antes de llegar a 5."
    solution: >-
      4 (5 > 4, pointer-move derecha) → 6 (5 < 6, pointer-move izquierda) →
      5. Costo: 2 pointer-moves.
  - level: 3
    statement: >-
      Implementa una función que cuente cuántos pointer-moves hace
      Buscar(x) en un BST dado, usando únicamente los punteros a padre,
      izquierdo y derecho (sin usar índices de arreglo).
    hints:
      - "Revisa step-4-instrumented-search.cpp: la función ya existe, replícala sin mirarla primero."
      - "El contador se incrementa una vez por cada llamada a pointer-move, no una vez por nivel calculado con una fórmula."
    solution: >-
      Ver full-implementation.cpp: search(x) incrementa moveCount en cada
      llamada a moverA(...) hasta encontrar el nodo con valor x.
  - level: 4
    statement: >-
      El modelo asume que toda búsqueda encuentra su valor (#24). Adapta
      Buscar(x) para que además funcione cuando x no está en el árbol, y
      explica qué costo tendría esa búsqueda fallida bajo las mismas reglas
      de pointer-move.
    hints:
      - "¿Qué condición de parada usarías si nunca llegas a un nodo con valor x?"
      - "El costo sigue siendo pointer-moves contados; sólo cambia cuándo te detienes."
    solution: >-
      Detenerse cuando el siguiente pointer-move sería a null. El costo es
      la profundidad del punto donde la búsqueda "debería" haber estado x,
      que sigue acotada por la altura del árbol — la misma cota O(log n) /
      O(n) según la forma, el modelo no distingue búsquedas fallidas.
  - level: 5
    statement: >-
      Diseña una secuencia de rotaciones (usando sólo Rotate, sin Insert ni
      Delete) que transforme la cadena degenerada 1→2→3→4→5→6→7 (cada uno
      hijo derecho del anterior) en el árbol balanceado con raíz 4. ¿Cuántas
      rotaciones como mínimo hacen falta?
    hints:
      - "Rotar el nodo del medio candidato (4) con su padre lo acerca a la raíz en un paso."
      - "Cada rotación sube exactamente un nodo un nivel; cuenta cuántos niveles hay que subir a 4, 2 y 6 respectivamente."
    solution: >-
      3 rotaciones: Rotate(4) tres veces (subiendo 4 desde profundidad 3
      hasta la raíz) reorganiza el resto en la forma balanceada, porque cada
      Right Rotation al subir 4 deja colgando correctamente el subárbol que
      queda entre él y su antiguo padre.
  - level: 6
    statement: >-
      Demuestra por qué "O(log n) es el mejor tiempo posible en el peor
      caso" (#26) para Buscar bajo este modelo: da el argumento de conteo
      que lo justifica (sin usar el vocabulario de teoría de la información
      que aparece recién en search-sequence-properties).
    hints:
      - "Un árbol con n nodos tiene una altura mínima posible: ¿cuál, en función de n?"
      - "Piensa en cuántos nodos puede haber a profundidad ≤ d en cualquier BST binario."
    solution: >-
      Un árbol binario con n nodos tiene a lo más 2^(d+1) − 1 nodos hasta
      profundidad d, así que la altura mínima posible es ⌈log2(n+1)⌉ − 1 =
      Ω(log n). Como el costo de Buscar(x) es la profundidad de x, ningún
      BST con n nodos puede garantizar menos que Ω(log n) en su peor caso: el
      argumento es puramente de conteo de nodos por nivel, no depende de la
      secuencia de búsquedas.
---

Los niveles 1-3 se resuelven con la definición del modelo tal cual la da el
profesor; los niveles 4-6 piden extender o justificar más allá de lo que las
diapositivas dicen explícitamente — están marcados como tal en su solución.
