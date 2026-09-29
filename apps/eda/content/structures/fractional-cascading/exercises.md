---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor da dos cotas para el mismo problema: "O(k lg n)" para la
      búsqueda ingenua y "O(k + lg n)" con fractional cascading. ¿Cuál de las
      dos operaciones del knowledge map (build o query) tiene esta cota, y
      qué representa exactamente "k" en ella?
    hints:
      - "Repasa la sección Operaciones de theory.md: una construye, la otra busca."
      - "La cota compara costos de búsqueda, no de construcción."
    solution: >-
      Es la cota de query: O(k + lg n). En este mazo, k es el número de
      listas L1, ..., Lk en las que se busca el mismo valor x — no el tamaño
      de la respuesta, que es como se usa k en el resto del curso.
  - level: 2
    statement: >-
      Con L3 = [4, 9, 13, 18, 22], L'2 = [3, 5, 9*, 12, 18*] y
      L'1 = [2, 5*, 8, 12*, 15] (el ejemplo de #18-19), traza la consulta de
      x = 18: indica en qué posición de L'1 cae la búsqueda binaria, qué
      puente se sigue hacia L'2, y qué puente se sigue hacia L3.
    hints:
      - "Primero ubica dónde caería 18 en L'1 aunque no esté ahí exactamente."
      - "El puente que se sigue es el del elemento promovido más cercano, no uno exacto para 18."
    solution: >-
      En L'1, 18 caería después de 15 (no hay elemento mayor). El puente más
      cercano hacia L'2 es el de 12* (el último promovido), que aterriza
      cerca del final de L'2; desde ahí, el ajuste O(1) encuentra 18* en
      L'2, cuyo puente baja directo a la posición de 18 en L3.
  - level: 3
    statement: >-
      Implementa build para k = 2 listas ordenadas (arreglos de enteros):
      dada L1 y L2 (L2 es la última, no cambia), construye L'1 = L1 ∪
      {mitad de L2}, guardando para cada elemento promovido el índice de su
      posición original en L2.
    hints:
      - "Fusiona L1 y los elementos pares (posición 0, 2, 4, ...) de L2 manteniendo el orden."
      - "El 'puente' es sólo un entero: el índice en L2, guardado junto al valor promovido."
    solution: >-
      Recorrer L2 promoviendo los elementos de índice par (0-indexado);
      fusionar esos valores con L1 en un solo arreglo ordenado, guardando en
      cada elemento promovido el índice de origen en L2 como puente. Ver
      step-2-augmented-list.cpp y step-3-build.cpp.
  - level: 4
    statement: >-
      El material generaliza esto a "conteo directo + serie geométrica" para
      el tamaño. Si en vez de promover la mitad de cada lista se promoviera
      un tercio (|L'i| ≤ |Li| + ⅓|L'i+1|), ¿la suma total sigue siendo O(n)?
      Justifica con el mismo argumento de serie geométrica que usa el
      profesor para ½.
    hints:
      - "La condición que importa es que el factor sea menor que 1, no que sea exactamente ½."
      - "Una serie geométrica Σ r^i converge para cualquier |r| < 1, no sólo r = ½."
    solution: >-
      Sí. El argumento del profesor no depende de que el factor sea
      exactamente ½: cualquier fracción constante menor que 1 (⅓, ¼, etc.)
      produce una serie geométrica convergente y el tamaño total sigue
      siendo O(n). Promover TODO (factor 1) es precisamente el caso donde la
      serie deja de converger — eso es lo que dispara el tamaño a Θ(kn).
  - level: 5
    statement: >-
      Diseña una variante de query que, en vez de reportar sólo si x está en
      cada lista, reporte la posición de inserción de x en cada Li (útil
      para un range tree que necesita el rango [lo, hi] en cada nodo). ¿Qué
      parte del algoritmo de query cambia y qué parte se mantiene igual?
    hints:
      - "El costo no cambia: sigues bajando puentes, sólo cambia qué información devuelves en cada paso."
      - "Piensa en qué necesitarías guardar además del valor: ¿el índice exacto en cada lista original, o basta con la posición en L'i?"
    solution: >-
      El algoritmo de descenso (búsqueda binaria en L'1 + bajar puentes) no
      cambia: sigue costando O(k + lg n). Lo que cambia es que en cada paso,
      en vez de sólo comparar igualdad con x, se registra la posición de
      inserción en L'i (y, si Li y L'i difieren, se traduce esa posición a
      la lista original Li, algo que el material no detalla explícitamente).
  - level: 6
    statement: >-
      Demuestra por qué "O(k + lg n)" de fractional cascading y "O(k + lg n)"
      del argumento de tamaño (serie geométrica) no son la misma prueba
      aunque usen el mismo símbolo k. ¿Qué acota cada una y por qué el
      profesor las trata como argumentos separados?
    hints:
      - "Una es sobre el costo de query (tiempo); la otra es sobre |L'1| tras build (espacio)."
      - "La independencia de k en el tamaño de L'1 es justamente lo que hace posible el O(k) — no O(k lg n) — de la consulta."
    solution: >-
      El conteo directo de query acota tiempo: O(lg n) de la única búsqueda
      real más O(1) por cada una de las k-1 listas restantes, sumando O(k).
      La serie geométrica acota espacio: demuestra que |L'1| = O(n) sin
      importar k, es decir, que construir las listas aumentadas no cuesta
      Θ(kn) en memoria. Son argumentos separados porque acotan recursos
      distintos (tiempo de consulta vs. tamaño de la estructura), aunque el
      segundo es precondición práctica para que el primero sea barato de
      construir: sin la cota de tamaño, "build" sería inviable en espacio
      antes de que "query" pudiera aprovechar los puentes.
---

Ejercicios sobre la construcción de las listas aumentadas y la consulta que
baja puentes, con la colisión de notación de "k" como advertencia recurrente.
