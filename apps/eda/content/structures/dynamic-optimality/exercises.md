---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor dice que "por el momento es un problema abierto" (#56) si
      existe un BST O(1)-competitivo. ¿Por qué esto NO es lo mismo que decir
      "se probó que no existe" ni "se probó que sí existe"? ¿Qué tercera
      posibilidad describe correctamente el estado de esta pregunta?
    hints:
      - "Un problema abierto tiene (al menos) dos direcciones posibles de prueba: exhibir un algoritmo, o probar que ninguno puede existir."
      - "Que nadie haya encontrado un ejemplo no es lo mismo que haber demostrado que no puede existir uno."
    solution: >-
      "Abierto" significa que ninguna de las dos direcciones se ha probado:
      nadie ha exhibido un algoritmo O(1)-competitivo para BST, pero tampoco
      se ha demostrado que ningún algoritmo pueda serlo. La tercera
      posibilidad correcta es "se desconoce cuál de las dos es cierta" — no
      "es falso" ni "es cierto pero no publicado".
  - level: 2
    statement: >-
      Para llaves {1, 2, 3, 4} y secuencia S = (1,1,1,1,4,4,4,4) (ver
      examples.md, caso Normal), el programa acompañante da costo estático =
      12 y OPT(S) = 9. Explica en una frase, sin ver el código, por qué el
      estático NO puede bajar de 12 para esta secuencia, y por qué OPT sí
      puede llegar a 9.
    hints:
      - "El estático fija UN árbol para toda la secuencia: no puede tener 1 y 4 cerca de la raíz a la vez."
      - "OPT puede pagar unas pocas rotaciones justo en la frontera entre el bloque de 1 y el bloque de 4, y quedarse barato en ambos bloques."
    solution: >-
      El estático no puede bajar de 12 porque fija un único árbol para toda
      S: como 1 y 4 no pueden estar ambos cerca de la raíz en el mismo
      árbol, al menos uno de los dos bloques de 4 accesos paga profundidad
      alta. OPT(S) sí baja a 9 porque puede reestructurar el árbol una vez
      en la frontera entre el bloque de 1 y el de 4 (pagando el costo de
      unas pocas rotaciones), y así mantener ambos bloques baratos por
      separado — algo que un árbol fijo no puede hacer.
  - level: 3
    statement: >-
      El programa acompañante (full-implementation.cpp) calcula OPT(S) para
      n ≤ 4 por búsqueda exhaustiva sobre todos los BST posibles. ¿Por qué
      esta técnica no se puede extender a n = 20 en la práctica? Da la razón
      combinatoria concreta (qué crece y qué tan rápido).
    hints:
      - "El número de BST distintos sobre n llaves es el n-ésimo número de Catalán."
      - "Catalán(n) crece exponencialmente: Catalán(20) ya tiene más de 6 mil millones de árboles."
    solution: >-
      El número de BST distintos sobre n llaves es el número de Catalán
      C(n) = C(2n, n) / (n+1), que crece exponencialmente (~4^n / n^1.5).
      Para n = 20, C(20) supera los 6 mil millones de árboles — enumerar
      cada uno (y para cada uno, el costo de S) es intratable mucho antes de
      llegar ahí. Por eso el programa se acota explícitamente a n ≤ 4: no es
      una limitación del programa, es que el espacio de búsqueda es
      inherentemente exponencial y calcular OPT(S) por fuerza bruta no
      escala — parte de por qué la pregunta de este tema sigue abierta.
  - level: 4
    statement: >-
      La definición del profesor es específicamente "O(1)-competitivo"
      (#53). Adapta la definición para un algoritmo "c-competitivo" con c
      creciente en n (por ejemplo c = O(log log n), el resultado parcial que
      sí se conoce, #58). ¿Qué cambia exactamente en la desigualdad?
    hints:
      - "O(1)-competitivo pide una constante k fija que no depende de n ni de S."
      - "Cambiar la cota a una función de n, no una constante, es lo único que cambia en la desigualdad."
    solution: >-
      O(1)-competitivo: existe una constante k (no depende de n) tal que,
      para toda S, costo(S) ≤ k · OPT(S). c-competitivo con c = O(log log n)
      relaja exactamente eso: existe una constante k' tal que, para toda S
      sobre n llaves, costo(S) ≤ k' · log(log(n)) · OPT(S). La diferencia es
      que el factor multiplicativo ya no es fijo — puede crecer (lentamente)
      con n. El resultado conocido (#58) logra esta versión relajada, no la
      O(1) que sigue abierta.
  - level: 5
    statement: >-
      Diseña (en prosa, sin implementarlo) el esquema de un argumento que
      alguien tendría que dar para EXHIBIR que un algoritmo online es
      O(1)-competitivo para BST — no lo resuelvas, sólo enumera qué piezas
      tendría que tener esa prueba, dado cómo se definió OPT(S) aquí.
    hints:
      - "Hace falta acotar el costo del algoritmo online por arriba, y el de OPT(S) por abajo, para la misma S arbitraria."
      - "La prueba tendría que funcionar para TODA secuencia S, no sólo para casos particulares como los de examples.md."
    solution: >-
      El esquema necesita, como mínimo: (1) fijar el algoritmo online
      concreto (ej. splay tree) y una cota superior a su costo total sobre
      una S arbitraria; (2) una cota inferior a OPT(S) para esa misma S,
      independiente de qué algoritmo se esté evaluando; (3) mostrar que la
      razón entre (1) y (2) está acotada por una constante k que no depende
      de n ni de S — para TODA S, no sólo para ejemplos particulares. Sin
      la pieza (2) (una cota inferior general a OPT(S), no calculada caso
      por caso como en el programa de fuerza bruta) el argumento no cierra
      para secuencias arbitrarias — que es, en esencia, por qué esto sigue
      sin probarse.
  - level: 6
    statement: >-
      Demuestra que, para toda secuencia S, OPT(S) es a lo más el costo del
      mejor árbol ESTÁTICO posible para S (el que no rota entre accesos).
      Usa sólo la definición de OPT(S) dada en theory.md.
    hints:
      - "OPT(S) se define como el mínimo sobre TODAS las estrategias que respetan el modelo de costo, incluyendo rotaciones."
      - "Un árbol estático es un caso particular de estrategia: una que nunca rota. Un mínimo sobre un conjunto más grande nunca es mayor que un mínimo sobre un subconjunto."
    solution: >-
      Por definición, OPT(S) es el costo mínimo sobre TODAS las estrategias
      posibles en el modelo computacional BST para atender S, incluyendo
      cualquier secuencia de rotaciones entre accesos. El conjunto de
      "árboles estáticos" (nunca rotar) es un subconjunto de ese conjunto de
      estrategias — es la estrategia particular que fija un árbol y no lo
      toca. Como OPT(S) minimiza sobre un conjunto que incluye a ese
      subconjunto, el mínimo sobre el conjunto completo no puede ser mayor
      que el mínimo restringido al subconjunto estático: OPT(S) ≤ costo del
      mejor árbol estático para S. La desigualdad puede ser estricta (como en
      examples.md, caso Normal, donde OPT baja de 12 a 9 explotando
      rotaciones en la frontera entre bloques) precisamente porque OPT tiene
      más opciones disponibles.
---

Los niveles 1-2 trabajan la definición y la comparación OPT vs. estático con
las secuencias de examples.md; 3-4 exploran los límites de calcular OPT en la
práctica y de relajar la conjetura; 5-6 piden razonar sobre la estructura del
argumento sin resolver la conjetura misma — nadie lo ha hecho.
