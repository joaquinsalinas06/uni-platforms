---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      D₂ (la estructura de esta página) recibe una consulta [x1, x2] × (−∞,
      b2] × (−∞, b3). ¿Cuáles de las tres restricciones acota D₂ con un
      intervalo cerrado, cuáles con dominancia, y qué estructura resuelve
      cada parte?
    hints:
      - "Mira qué guarda el BST de D₂ y qué guarda cada nodo satélite."
      - "El nombre de la estructura ya dice qué variable acota."
    solution: >-
      D₂ acota sólo x con un intervalo cerrado [x1, x2], usando el BST sobre
      x. Las otras dos, y y z, siguen acotadas por dominancia (−∞, b2] y
      (−∞, b3), resueltas por la D₁ satélite de cada nodo canónico.
  - level: 2
    statement: >-
      Con el BST de build.md (raíz x=4, hijo izquierdo x=3 con hijo
      izquierdo x=1, hijo derecho x=6) sobre los puntos {(1,5), (3,2),
      (4,8), (6,1)}, traza qué nodos canónicos produce la descomposición de
      [3, 6] y qué D₁ satélite se consulta en cada uno.
    hints:
      - "Es la misma descomposición canónica de range tree sobre el BST de x."
      - "Cada nodo canónico dispara exactamente una consulta de dominancia, no una por cada punto."
    solution: >-
      La descomposición canónica de [3, 6] sobre ese BST produce los nodos
      x=3 (cubre su subárbol {(1,5),(3,2)} salvo que se filtre luego por
      pertenecer a [3,6]), x=4 y x=6 según la partición exacta del BST; en
      cada uno se dispara una consulta de dominancia sobre su D₁ satélite
      con (b2, b3).
  - level: 3
    statement: >-
      Implementa D₂: una clase que construya un BST sobre x y, en cada
      nodo, una instancia de D₁ (dominancia 2D) sobre los puntos de su
      subárbol.
    hints:
      - "El nodo del BST necesita dos campos nuevos además de izquierda/derecha: el valor de x y la D1 satélite."
      - "Construye primero el BST completo, y luego llena cada D1 satélite con los puntos del subárbol correspondiente."
    solution: >-
      Ver cpp/structures/d2-bound-x/full-implementation.cpp — clase D2 con
      un BST sobre x y, en cada nodo, un vector de puntos indexado por y
      (la D1 satélite simplificada).
  - level: 4
    statement: >-
      Adapta tu D₂ para responder [x1, x2] × (−∞, b2] × (−∞, b3): recorre
      los nodos canónicos de [x1, x2] y dispara la consulta de dominancia
      en cada uno.
    hints:
      - "Reutiliza la descomposición canónica de range tree; no la reimplementes desde cero para D2."
      - "El resultado final es la unión de lo que devuelve cada consulta de dominancia, sin duplicados si los conjuntos de puntos por nodo son disjuntos."
    solution: >-
      Ver la función query() en
      cpp/structures/d2-bound-x/full-implementation.cpp: primero halla los
      nodos canónicos de [x1, x2] y después, en cada uno, llama a la
      consulta de dominancia de su D1 satélite.
  - level: 5
    statement: >-
      Diseña, sin implementarlo, qué pasaría si en vez de guardar D₁ en
      cada nodo guardaras otro BST sobre y dentro de cada nodo canónico de
      x (acotando y con la misma técnica de descomposición canónica).
      ¿Qué costo obtienes y por qué el profesor lo rechaza?
    hints:
      - "Cuenta cuántos nodos canónicos en y produce cada uno de los O(lg n) nodos canónicos en x."
      - "El profesor lo advierte explícitamente en el '¡Piénsalo!' de la sección (#35-36)."
    solution: >-
      Cada uno de los O(lg n) nodos canónicos de x tendría, dentro,
      O(lg n) nodos canónicos de y: O(lg² n) consultas en total, perdiendo
      el O(lg n) buscado. Por eso el profesor introduce d3-separation-node,
      que evita la descomposición canónica en y por completo con un único
      nodo de separación.
  - level: 6
    statement: >-
      Demuestra por qué D₂ no necesita una recurrencia propia para su
      análisis de complejidad, a diferencia de estructuras como Fibonacci
      heap o BST balanceados.
    hints:
      - "Compara el estilo de análisis: composición estructural vs recurrencia."
      - "¿D2 modifica su propia estructura en cada operación, o sólo delega en dos piezas ya analizadas?"
    solution: >-
      D₂ no tiene dinámica propia que amortizar ni una recursión sobre su
      propio tamaño: su costo es la composición de dos piezas ya conocidas
      (descomposición canónica de un BST, y una consulta de dominancia de
      D₁), cada una analizada por separado en su propia estructura. Por
      eso el profesor la resuelve por composición ("O(lg n) nodos
      canónicos, disparando una consulta de dominancia en cada uno") y no
      plantea una recurrencia nueva para D₂.
---

Los tres primeros ejercicios se quedan en D₂ sola; los últimos dos ya piden
anticipar por qué hace falta D₃.
