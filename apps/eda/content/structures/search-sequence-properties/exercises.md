---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor da cinco propiedades, cada una con su cota "amortizada".
      ¿Cuál de las cinco es la única que aplica sólo a una secuencia fija
      específica ({1, 2, ..., n}), en vez de a una familia de secuencias
      definida por un parámetro (k_i, p_k, t_i o t_ij)?
    hints:
      - "Cuatro de las cinco definen su cota en función de un parámetro que varía con la secuencia (k_i, p_k, t_i, t_ij)."
      - "Una de ellas no tiene parámetro: sólo dice qué pasa si la secuencia es exactamente {1,...,n}."
    solution: >-
      La propiedad de acceso secuencial. Las otras cuatro (puntero
      dinámico, cota de entropía, conjunto de trabajo, unificada) acotan el
      costo en función de un parámetro que depende de la secuencia
      concreta (k_i, p_k, t_i, t_ij); acceso secuencial sólo dice qué pasa
      cuando la secuencia es exactamente {1, 2, ..., n}, sin parámetro.
  - level: 2
    statement: >-
      Traza la propiedad del conjunto de trabajo sobre la secuencia
      {1, 3, 7, 3, 2, 3} (la del gráfico #43) para las posiciones i=2, i=4
      e i=6, donde x_i = 3 en las tres. Calcula t_i para cada una (cuántos
      valores diferentes se buscaron desde la última vez que se buscó 3).
    hints:
      - "t_i cuenta valores DIFERENTES buscados entre la última ocurrencia de x_i y la posición i, no la distancia en posiciones."
      - "En i=2 no hay ocurrencia previa de 3 en la secuencia: es la primera vez que aparece."
    solution: >-
      En i=2 (primera aparición de 3) no aplica un t_i previo dentro de la
      secuencia dada. En i=4, la última vez que se buscó 3 fue en i=2; entre
      medio sólo se buscó 7 (i=3), así que t_4 = 1. En i=6, la última vez
      que se buscó 3 fue en i=4; entre medio sólo se buscó 2 (i=5), así que
      t_6 = 1. Ambas búsquedas repetidas de 3 cuestan O(log 1) = O(1)
      amortizado, mucho más barato que si se tratara como una búsqueda
      cualquiera en el peor caso general O(log n).
  - level: 3
    statement: >-
      Implementa en C++ una función `int k_i(const std::vector<int>& seq, int i)`
      que, dado un vector de una secuencia de búsqueda (1-indexada
      lógicamente, pero recibida como vector 0-indexado) y una posición
      `i >= 1`, devuelva `k_i = |x_i - x_{i-1}|` según la propiedad del
      puntero dinámico. Verifica con `assert` que para la secuencia
      {1, 3, 2, 5, 4, 6} da k_2=2, k_3=1, k_4=3, k_5=1, k_6=2.
    hints:
      - "seq[0] es x_1 en la notación del profesor: la posición i de la fórmula corresponde al índice i-1 del vector."
      - "k_i sólo está definido para i >= 2 (necesita un elemento anterior); no lo llames con i=1."
    solution: >-
      `int k_i(const std::vector<int>& seq, int i) { return
      std::abs(seq[i - 1] - seq[i - 2]); }` (con `i` en notación 1-indexada
      del profesor, `seq[i-1]` es `x_i` y `seq[i-2]` es `x_{i-1}`). Para
      {1,3,2,5,4,6}: k_2 = |3-1| = 2, k_3 = |2-3| = 1, k_4 = |5-2| = 3,
      k_5 = |4-5| = 1, k_6 = |6-4| = 2 — coincide con el gráfico #36.
  - level: 4
    statement: >-
      El Lema 1 dice que la propiedad del puntero dinámico implica la de
      acceso secuencial. Adapta el argumento para mostrar por qué eso es
      cierto: parte de que la secuencia es {1, 2, ..., n} y calcula k_i
      para cualquier i >= 2, luego aplica la cota O(log k_i) de puntero
      dinámico y compárala con la cota O(1) de acceso secuencial.
    hints:
      - "Si x_i = i para toda i, ¿cuánto vale x_i - x_{i-1} exactamente?"
      - "O(log k_i) con un valor constante de k_i colapsa a una constante, sin importar n."
    solution: >-
      Si x_i = i para toda i, entonces x_i - x_{i-1} = i - (i-1) = 1 para
      todo i >= 2, así que k_i = 1 siempre. La cota de puntero dinámico da
      O(log k_i) = O(log 1) = O(1) por búsqueda, que es exactamente la cota
      que enuncia la propiedad de acceso secuencial. Por eso toda secuencia
      que cumple acceso secuencial (implícitamente, k_i = 1 constante) es un
      caso particular de la propiedad del puntero dinámico, y el Lema 1 se
      sostiene: la propiedad más general (puntero dinámico) implica la más
      específica (acceso secuencial) cuando se instancia con k_i = 1.
  - level: 5
    statement: >-
      El comentario del profesor dice que puntero dinámico y conjunto de
      trabajo son "ortogonales": ninguna implica a la otra. Diseña una
      secuencia de longitud 6 sobre las llaves {1,...,7} que cumpla la
      propiedad del conjunto de trabajo de forma ajustada (algún t_i muy
      chico, por repetición) pero que sea mala para puntero dinámico (algún
      k_i grande, por un salto lejano entre búsquedas consecutivas).
    hints:
      - "Repite un mismo valor varias veces (bueno para conjunto de trabajo) pero sepáralo con un valor MUY lejano en la recta numérica (malo para puntero dinámico)."
      - "La secuencia del gráfico #43, {1, 3, 7, 3, 2, 3}, ya casi cumple esto: revisa qué salto k_i es el más grande y por qué."
    solution: >-
      La secuencia {1, 3, 7, 3, 2, 3} del propio mazo ya sirve como
      ejemplo: en i=3, k_3 = |7 - 3| = 4, un salto grande (malo para
      puntero dinámico, cuya cota O(log k_i) empeora con saltos grandes),
      mientras que en i=4 y i=6, t_4 = t_6 = 1 (bueno para conjunto de
      trabajo, porque 3 se repite con poca distancia de trabajo entre
      medio). Cualquier secuencia con la forma {a, b, LEJOS, b, c, b}, donde
      LEJOS está numéricamente alejado de b pero b se repite seguido,
      cumple el mismo patrón: buena para conjunto de trabajo en las
      repeticiones de b, mala para puntero dinámico en el salto hacia y
      desde LEJOS.
  - level: 6
    statement: >-
      Demuestra el Lema 2 ("la propiedad del conjunto de trabajo implica la
      de cota de entropía") en el caso particular donde la secuencia
      consiste en repetir un único valor k una fracción p_k de las m
      búsquedas totales, intercalado con valores que nunca se repiten en el
      resto. Muestra que la cota O(log t_i) de conjunto de trabajo para las
      repeticiones de k es consistente con la cota O(Σ_k p_k log(1/p_k)) de
      entropía para ese mismo k.
    hints:
      - "Si k se repite cada 1/p_k búsquedas en promedio (porque aparece una fracción p_k de las veces) y el resto de valores no se repite, ¿cuánto vale t_i típicamente cuando se vuelve a buscar k?"
      - "Sustituye t_i ~ 1/p_k en O(log t_i) y compara el término resultante con el término p_k log(1/p_k) de la suma de entropía."
    solution: >-
      Si k aparece una fracción p_k de las m búsquedas y el resto de
      valores no se repite, entre dos apariciones consecutivas de k caben
      en promedio 1/p_k búsquedas, de las cuales (por no repetirse el
      resto) hay aproximadamente 1/p_k valores diferentes: t_i ~ 1/p_k para
      las búsquedas de k. La cota de conjunto de trabajo da entonces
      O(log t_i) = O(log(1/p_k)) por cada búsqueda de k. Como k ocurre en
      una fracción p_k de las m búsquedas, su contribución al costo total
      promedio (amortizado por búsqueda) es p_k · O(log(1/p_k)) — que es
      exactamente el término k-ésimo de la suma de entropía
      Σ_k p_k log(1/p_k). Sumando sobre todos los valores que se comportan
      así se recupera la cota completa de entropía, consistente con que la
      propiedad de conjunto de trabajo (más fina, por posición) implica la
      de entropía (más gruesa, por frecuencia global).
---

Los tres primeros niveles usan directamente las secuencias y fórmulas del
mazo (#30-38); los tres últimos piden generalizar los dos lemas de
implicación (#40-41) más allá de los ejemplos dados.
