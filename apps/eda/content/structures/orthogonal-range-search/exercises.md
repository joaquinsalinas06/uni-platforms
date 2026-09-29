---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      De las tres operaciones — existencia, conteo, enumeración — ¿cuál es
      la única que el profesor describe como "output-sensitive"? Responde
      sólo el nombre de la operación.
    hints:
      - "Piensa en cuál de las tres necesita tocar cada elemento de la respuesta, uno por uno."
    solution: >-
      Enumeración: es la única cuyo costo incluye un término "+ k" que
      depende del tamaño de la respuesta.
  - level: 2
    statement: >-
      Sobre el arreglo ordenado `{3, 4, 7, 9, 13, 15, 18, 27}`, traza a
      mano la caja `[10, 20]`: da el resultado de existencia, conteo y
      enumeración, y di qué índices de frontera usaste.
    hints:
      - "Busca primero el sucesor de 10 y el predecesor de 20 dentro del arreglo."
      - "El sucesor de 10 es 13 (índice 4); el predecesor de 20 es 18 (índice 6)."
    solution: >-
      Existencia: verdadero (13 ≤ 20). Conteo: 6 - 4 + 1 = 3. Enumeración:
      {13, 15, 18}.
  - level: 3
    statement: >-
      Implementa `count(puntos, caja)` para el caso 2D por fuerza bruta:
      recibe un vector de puntos (x, y) y una caja [xl, xr] × [yl, yr], y
      devuelve cuántos puntos caen dentro. No uses ningún orden precomputado.
    hints:
      - "Recorre el vector una sola vez y usa un contador."
      - "Un punto está dentro si ambas coordenadas caen en su intervalo correspondiente, de forma independiente."
    solution: >-
      Se recorre cada punto y se incrementa un contador cuando
      xl ≤ x ≤ xr y yl ≤ y ≤ yu se cumplen simultáneamente — exactamente
      `in_box` de `step-2-in-box.cpp` aplicada dentro de un ciclo, sin
      ordenar nada primero: O(n) por consulta.
  - level: 4
    statement: >-
      Adapta el algoritmo de conteo de este tema (arreglo ordenado, d = 1)
      para que en vez de contar cuántos puntos hay en [l, r], cuente
      cuántos puntos hay estrictamente fuera de ese rango, en O(log n).
    hints:
      - "El total de puntos es n; no necesitas otro recorrido."
      - "Fuera del rango = n menos los que sí están dentro del rango."
    solution: >-
      Se calcula el conteo dentro del rango con el mismo algoritmo de
      frontera (sucesor de l, predecesor de r, resta de índices) y se
      resta de n: fuera = n - dentro, sin ningún recorrido adicional,
      manteniendo O(log n).
  - level: 5
    statement: >-
      Diseña (sin implementar) una variante de "conteo" para d = 2 que siga
      sin depender de k, usando únicamente lo que este tema ya estableció
      para d = 1: dado un conjunto de puntos, describe qué información de
      frontera necesitarías por cada dimensión y por qué el costo total
      seguiría sin depender de k.
    hints:
      - "Piensa en la caja como dos rangos independientes: uno en x y otro en y."
      - "El profesor advierte que un arreglo no se anida bien entre dimensiones (#22) — tu diseño no tiene que resolver eso, sólo identificar qué frontera haría falta en cada eje."
    solution: >-
      Harían falta las fronteras (predecesor/sucesor) de cada uno de los
      dos rangos, más alguna forma de combinar "está dentro del rango en x"
      con "está dentro del rango en y" sin recorrer los puntos uno por uno
      — es precisamente el problema que un arreglo no resuelve bien
      anidado (#22) y que [range-tree](/structures/range-tree) sí resuelve
      con un árbol secundario por dimensión.
  - level: 6
    statement: >-
      Demuestra por qué ninguna estructura puede responder "enumeración" en
      tiempo O(log n) puro (sin el término + k), sin importar qué tan
      buena sea la estructura de índice usada.
    hints:
      - "Piensa en el caso límite: una caja que contiene los n puntos."
      - "Reportar un resultado de tamaño k requiere al menos escribir k valores de salida."
    solution: >-
      Cualquier algoritmo que enumere los k puntos de la respuesta debe, como
      mínimo, escribir esos k valores en la salida — eso ya es Ω(k) de
      trabajo, sin importar cuán rápido se encuentre la frontera del rango.
      Por eso el término "+ k" es una cota inferior inherente al tamaño de
      la respuesta, no una limitación de una estructura en particular: se ve
      en el caso límite de este tema (caja [3, 27], k = n) y se conserva
      igual en [range-tree](/structures/range-tree).
---

Todos parten del arreglo ordenado d = 1 de este tema: `{3, 4, 7, 9, 13, 15,
18, 27}`, salvo donde se indique lo contrario.
