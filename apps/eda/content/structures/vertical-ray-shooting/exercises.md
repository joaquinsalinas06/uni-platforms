---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor dice que se puede "caracterizar la cara de cada punto
      según el primer segmento que 'choque'" un rayo vertical. ¿Qué problema
      original reformula esta idea, y qué pregunta hacía ese problema antes
      de la reformulación?
    hints:
      - "Es el tema que aparece como prerequisito de vertical-ray-shooting en el mapa."
      - "Antes preguntaba por una región del mapa planar, no por un objeto lineal."
    solution: >-
      Reformula planar-point-location (PPL). Antes preguntaba "¿en qué cara
      del mapa cae el punto de consulta?"; vertical ray shooting la convierte
      en "¿cuál es el primer segmento que toca un rayo vertical desde ese
      punto?".
  - level: 2
    statement: >-
      Dado el segmento horizontal S = ((2,5), (10,5)) y el punto de consulta
      (6,2), traza el rayo vertical hacia arriba desde (6,2) y di a qué
      altura cruza S.
    hints:
      - "El rayo sube por la recta x = 6."
      - "¿El segmento S cubre x = 6 en su rango horizontal [2,10]?"
    solution: >-
      Sí: x=6 está entre 2 y 10, así que el rayo cruza S a altura y=5 —
      es el caso mínimo trazado en examples.md.
  - level: 3
    statement: >-
      Implementa ray-query por fuerza bruta en C++: recibe un punto (x,y) y
      un vector de segmentos, y devuelve el índice del primer segmento que
      toca el rayo vertical hacia arriba (o -1 si ninguno lo hace).
    hints:
      - "Filtra primero los segmentos cuyo rango en x cubre x_i."
      - "De esos, calcula la altura de cruce y quédate con la mínima que sea >= y_i."
      - "Revisa full-implementation.cpp si te quedas atascado."
    solution: >-
      Ver cpp/structures/vertical-ray-shooting/full-implementation.cpp —
      recorre todos los segmentos, calcula la altura de cruce de los que
      cubren x_i, y se queda con el mínimo por encima de y_i.
  - level: 4
    statement: >-
      Adapta tu solución del nivel 3 para que resuelva ray shooting hacia
      abajo en vez de hacia arriba, sin duplicar la lógica de filtrado.
    hints:
      - "Sólo cambia el criterio de comparación, no la fase de filtrado por rango en x."
      - "Hacia arriba busca el menor y >= y_i; hacia abajo busca el mayor y <= y_i."
    solution: >-
      Se mantiene el mismo filtro por rango en x y el mismo cálculo de
      altura de cruce; sólo se invierte la comparación (maximizar en vez de
      minimizar, y la condición y <= y_i en vez de y >= y_i).
  - level: 5
    statement: >-
      Diseña una estructura para resolver muchas consultas de ray-query
      sobre el mismo conjunto fijo de segmentos, más rápido que O(n) por
      consulta. ¿A qué problema del curso reduces esto, y qué complejidad
      por consulta obtienes?
    hints:
      - "El profesor mismo da la pista: 'la respuesta se reducirá al menor y >= y_i de los segmentos que se intersectan con la recta x=x_i'."
      - "Ese es exactamente el problema que resuelve segment-intersection-sweep-line con una recta vertical que barre."
    solution: >-
      Se reduce a segment-intersection-sweep-line: se barre una recta
      vertical de izquierda a derecha manteniendo, en una estructura
      persistente, el orden de los segmentos activos; cada consulta se
      responde con un Successor(y_i) sobre el estado de la recta en x=x_i,
      en O(log n) por consulta.
  - level: 6
    statement: >-
      Justifica por qué "el primer segmento que toca el rayo" es una
      caracterización válida de la cara: dos puntos en la misma cara del
      mapa siempre producen el mismo primer segmento al disparar el rayo
      hacia arriba. Además, describe un caso degenerado que rompe la
      definición ingenua de "altura de cruce" y di cómo lo resolverías.
    hints:
      - "Piensa en qué tendría que pasar para que dos puntos de la misma cara vean segmentos distintos: el rayo tendría que cruzar la frontera de la cara sin tocar un segmento."
      - "Un segmento vertical que coincide exactamente con la recta x=x_i del punto de consulta no tiene una única 'altura de cruce'."
    solution: >-
      Como la cara es una región conexa acotada por segmentos, cualquier
      camino vertical entre dos puntos de la misma cara que se mantenga
      dentro de ella nunca cruza un segmento antes de salir de la cara; por
      construcción, el primer segmento que un rayo hacia arriba encuentra es
      siempre el que forma el techo de esa cara, igual para todo punto bajo
      ese mismo techo. El caso degenerado es un segmento vertical exactamente
      sobre x=x_i: no cruza en un único punto sino que coincide en todo un
      intervalo de y, así que no tiene una "altura de cruce" bien definida;
      se resuelve tratándolo aparte (por ejemplo, verificando primero si
      y_i cae dentro de su rango [y1,y2] antes de aplicar la comparación por
      altura de los demás segmentos).
---

Ejercicios sobre la reformulación de PPL a vertical ray shooting: la
equivalencia (niveles 1, 6), trazar la reducción a mano (nivel 2),
implementar la fuerza bruta y su variante (niveles 3, 4), y diseñar la
versión eficiente vía sweep line (nivel 5).
