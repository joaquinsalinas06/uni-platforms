---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor nunca le da nombre de "estructura de datos" a Planar
      Point Location. ¿Por qué es más preciso llamarlo un problema? ¿Qué
      es lo que sí tiene nombre de estructura en la cadena de reducciones
      que lo resuelve?
    hints:
      - >-
        Piensa en qué recibe como entrada y qué devuelve, contra qué guarda
        y qué invariante mantiene una estructura de datos típica del curso.
      - >-
        La cadena de reducciones (#18 en adelante) sí nombra estructuras
        concretas en cada paso.
    solution: >-
      PPL sólo especifica una pregunta (dado un punto, ¿en qué cara cae?)
      sobre una entrada dada (el mapa planar) — no fija cómo se guarda esa
      entrada ni qué operaciones internas mantiene. No hay invariante que
      preservar ni estado propio: es un planteamiento. Las estructuras
      concretas aparecen recién en la reducción: BBST, segment tree /
      Fenwick tree, persistencia sobre el BBST y retroactividad parcial.
  - level: 2
    statement: >-
      Sobre el mapa del profesor (#9) con vértices (0,0) (0,4) (2,15)
      (8,0) (8,10) (10,15) (14,2) (14,8) (16,13) (16,21) (19,4) (20,15)
      (21,1) (23,15) (27,5), traza a mano por qué (19,4) cae en una cara
      distinta de (8,4), usando el conteo de cruces hacia la derecha.
    hints:
      - >-
        Dibuja una línea horizontal desde el punto hacia +∞ en x y cuenta
        cuántas veces cruza el contorno de cada cara candidata.
      - >-
        Un número impar de cruces significa "dentro" de esa cara; un
        número par significa "fuera".
    solution: >-
      Desde (8,4), la horizontal hacia la derecha cruza un número impar de
      aristas de la cara delimitada por (0,0)-(8,0)-(8,10)-(0,4): cae
      dentro. Desde (19,4), la horizontal hacia la derecha cruza las
      aristas de una cara distinta, la que rodea a (14,2)-(21,1)-(19,4)
      aproximadamente: el conteo impar cae sobre otro contorno, así que la
      etiqueta de cara es distinta aunque ambos puntos compartan la misma
      coordenada y=4.
  - level: 3
    statement: >-
      Implementa `locate` por fuerza bruta con el test de punto en
      polígono por conteo de cruces, sobre un mapa de al menos dos caras
      disjuntas más la cara infinita.
    hints:
      - >-
        Cada cara es un polígono simple (lista ordenada de vértices);
        prueba cada cara en orden hasta encontrar una que contenga al
        punto.
      - >-
        Si ninguna cara contiene al punto, la respuesta es la cara
        infinita (#64) — no un error.
    solution: >-
      Ver `cpp/structures/planar-point-location/full-implementation.cpp`:
      `pointInPolygon` cuenta cruces de un rayo horizontal contra cada
      arista de la cara, y `locateBruteForce` prueba las caras en orden,
      devolviendo la etiqueta de la primera que contiene al punto o
      "región infinita" si ninguna lo hace.
  - level: 4
    statement: >-
      El profesor dice que, para el caso especial ortogonal, "usando un
      Segment tree o un Fenwick tree se puede resolver este caso especial
      en O(n log n)" (#38). Adapta tu fuerza bruta del nivel 3 al caso en
      que todas las aristas del mapa son horizontales o verticales:
      ¿qué cambia en el test de punto en polígono cuando el polígono es
      ortogonal?
    hints:
      - >-
        Con aristas ortogonales, cada arista es o bien horizontal (no
        cruza nunca un rayo horizontal, salvo casos límite de borde) o
        vertical (cruza el rayo horizontal en una sola coordenada y).
      - >-
        Esto no cambia la complejidad de tu fuerza bruta — sigue siendo
        O(F·V) — pero es la simplificación que hace posible, más adelante,
        reducir el conteo a un RSQ sobre segment tree o Fenwick tree (no
        lo implementes: ver /structures/segment-tree y
        /structures/fenwick-tree).
    solution: >-
      Con aristas ortogonales, el conteo de cruces sólo necesita comparar
      la coordenada y del punto contra el rango vertical de cada arista
      vertical con x mayor a la del punto — las aristas horizontales
      quedan excluidas del conteo salvo el caso límite de coincidir
      exactamente con y del punto. Esta simplificación (contar cruces
      contra segmentos verticales únicamente) es la que el profesor
      convierte en un RSQ sobre un eje: de ahí que un segment tree o
      Fenwick tree resuelvan el caso especial en O(n log n) — ver
      /structures/segment-tree y /structures/fenwick-tree.
  - level: 5
    statement: >-
      Diseña, sin implementarlo, el esquema completo para responder
      `locate` en línea (online) con la cota O(log n) del profesor (#51):
      ¿qué se precomputa, qué se guarda por versión, y qué hace `Query` en
      tiempo de consulta?
    hints:
      - >-
        La recta de barrido (sweep line) recorre el mapa de izquierda a
        derecha; en cada evento (un vértice) el conjunto de aristas
        activas cambia — eso es lo que un BBST ordena.
      - >-
        Persistir el BBST significa que cada versión t_{x_i} recuerda el
        estado del barrido justo en x = x_i, sin tener que rehacerlo para
        cada consulta.
    solution: >-
      Se precomputa, offline, un barrido de izquierda a derecha sobre
      todo el mapa: en cada evento (vértice) se inserta o elimina una
      arista del BBST que ordena las aristas activas por su cruce con la
      recta de barrido, y esa versión del BBST se guarda con persistencia
      (una versión t_x por cada valor de x donde el conjunto activo
      cambia). En tiempo de consulta, `Query(t_{x_i}, Successor(y_i))`
      busca la versión del BBST asociada a x_i y encuentra, dentro de ella,
      el sucesor de y_i entre las aristas activas — el segmento
      inmediatamente por encima del punto. El profesor no llena el detalle
      de qué hace `Query` exactamente con ese sucesor para devolver una
      cara (hueco del material), pero el costo es el de un `Successor` en
      un BBST persistente: O(log n).
  - level: 6
    statement: >-
      El profesor afirma que la retroactividad parcial para mapas
      ortogonales mantiene la consulta en O(log n), "lo cual es óptimo
      para este escenario" (#55). Argumenta por qué O(log n) es una cota
      inferior razonable para `locate`, sin usar el argumento de
      retroactividad — es decir, ¿por qué no se puede esperar mejor que
      logarítmico en general?
    hints:
      - >-
        Compara con el problema de una dimensión más simple que PPL
        generaliza: localizar un punto en una partición ordenada de una
        recta (piensa en RSQ / búsqueda de sucesor).
      - >-
        Un modelo de comparación (decidir "izquierda o derecha" de una
        arista a la vez) tiene un árbol de decisión de altura mínima
        log n sobre n elementos comparables.
    solution: >-
      Si se reduce PPL a comparar el punto contra una secuencia ordenada
      de eventos (como hace la reducción del profesor vía sweep line y
      BBST), cualquier algoritmo basado en comparaciones necesita, en el
      peor caso, un árbol de decisión de altura al menos log n para
      distinguir entre n aristas activas posibles — el mismo argumento
      que acota `Successor` en un BBST. El profesor no da esta prueba (no
      es su estilo de reducción), pero es consistente con que cite
      O(log n) como óptimo para el escenario ortogonal retroactivo: no
      hay manera, dentro de ese modelo de comparación, de hacerlo mejor.
---

Los seis niveles siguen la cadena de reducciones del profesor: primero se
reconoce que PPL es un problema sin estructura propia (nivel 1), después se
traza la fuerza bruta a mano (nivel 2) y se implementa (nivel 3), luego se
adapta al caso ortogonal que sí tiene una reducción desarrollada (nivel 4),
y finalmente se diseña y argumenta sobre la solución online completa
(niveles 5-6) — sin repetir las pruebas de las estructuras a las que PPL se
reduce.
