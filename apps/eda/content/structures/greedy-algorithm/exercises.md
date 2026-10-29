---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Enuncia con tus palabras qué hace Greedy (#34) y qué afirma la conjetura central (#37). ¿Qué consecuencia tendría que fuera cierta? ¿Está demostrada?
    hints:
      - "Greedy procesa el conjunto 'una fila a la vez'. ¿Qué agrega en cada fila?"
      - "La conjetura compara el tamaño del conjunto de Greedy con OPT."
    solution: >-
      Greedy procesa el conjunto de puntos fila por fila y, en cada fila, agrega los puntos mínimos necesarios para que el conjunto acumulado hasta ahí quede
      arboralmente satisfecho. La conjetura: Greedy = O(OPT), o incluso Greedy = OPT + O(m). Si fuera cierta, Greedy sería un algoritmo O(1)-competitivo —la optimalidad
      dinámica quedaría resuelta—, y vía split trees también se podría simular online. No está demostrada ni refutada.
  - level: 2
    statement: >-
      Traza Greedy sobre la secuencia $2, 1, 3$ en las llaves $\{1,2,3\}$ fila por fila: por cada fila, qué pares revisas, cuáles violan la condición, qué punto agregas y por qué.
      ¿Cuántos puntos usa en total y cuántos son extra?
    hints:
      - "Fila 1 tiene un solo punto: no hay pares."
      - "En la fila 2, el par (2,1)-(1,2) define un rectángulo sin tercer punto. ¿Qué punto de la fila 2 lo arregla?"
      - "En la fila 3, hacia la izquierda desde la llave 3, ¿qué llaves entran en la escalera?"
    solution: >-
      Fila 1: se agrega (2,1); no hay pares. Fila 2: se agrega (1,2); el par (2,1)-(1,2) viola (rectángulo [1,2]x[1,2] sin tercero); se agrega (2,2), que cae en el borde
      del rectángulo, y los pares nuevos comparten línea con alguno de los dos. Fila 3: se agrega (3,3); el par (2,2)-(3,3) viola; se agrega (2,3). Ahora (1,2)-(3,3) tiene
      a (2,2) y (2,3) dentro. En total 5 puntos, de los cuales 3 son accesos pedidos y 2 son extra: (2,2) y (2,3).
  - level: 3
    statement: >-
      Implementa `greedy(n, acc)` en C++ que devuelva los puntos del conjunto. Pruébala con $3, 1, 4, 2$ (debe dar 8 puntos) y con $1, 2, 3, 4$ (debe dar 7) y con $2,1,1$ (debe dar 4, no 5).
    hints:
      - "Mantén un arreglo ultimo[y] con la última fila en que se tocó cada llave (0 = nunca)."
      - "Para cada fila, inicia el mayor ultimo visto en ultimo[x] y recorre desde x hacia cada lado; una llave entra si su ultimo lo supera."
      - "Actualiza ultimo[] sólo después de leer ambas escaleras."
    solution: |-
      ```cpp
      vector<Punto> greedy(int n, const vector<int>& acc) {
        vector<int> ultimo(n + 2, 0);
        vector<Punto> P;
        for (int t = 1; t <= (int)acc.size(); t++) {
          int x = acc[t - 1];
          vector<int> fila = {x};
          for (int paso : {+1, -1}) {
            int mejor = ultimo[x];
            for (int y = x + paso; y >= 1 && y <= n; y += paso)
              if (ultimo[y] > mejor) { fila.push_back(y); mejor = ultimo[y]; }
          }
          for (int y : fila) { P.push_back({y, t}); ultimo[y] = t; }
        }
        return P;
      }
      ```
  - level: 4
    statement: >-
      Adapta `greedy` para que, además del conjunto, devuelva el número de puntos **extra** (no pedidos) por fila. Ejecútala sobre el acceso secuencial $1, 2, \dots, n$ y
      predice (y comprueba) el número de puntos extra por fila.
    hints:
      - "Cuenta fila.size() - 1 por cada fila."
      - "En el acceso secuencial, al llegar a la llave t, la única llave más reciente es t - 1."
    solution: >-
      Basta guardar fila.size() - 1 en un vector. Para 1, 2, ..., n: la fila 1 tiene 0 extra; cada fila t >= 2 tiene exactamente 1 extra (la llave t-1, tocada en la fila anterior), así que
      el total es n + (n - 1) = 2n - 1 puntos (7 para n = 4), lineal; la cadena estática gasta n(n+1)/2.
  - level: 5
    statement: >-
      Diseña una secuencia de $n$ accesos sobre $n$ llaves para la que Greedy use **muchos más** puntos extra por fila que en el acceso secuencial, y explica con la regla de la
      escalera por qué. ¿Qué propiedad de la secuencia hace que la escalera sea larga?
    hints:
      - "La escalera es larga si hay muchas llaves cuyos últimos toques crecen al acercarse a x."
      - "Piensa en una secuencia que alterna entre extremos y va cerrando hacia el centro, o en bit-reversal."
    solution: >-
      Bit-reversal para n = 8: 1, 5, 3, 7, 2, 6, 4, 8 da 21 puntos (13 extra, casi dos por fila), frente a 15 de una secuencia secuencial extendida. La escalera crece cuando los toques
      recientes están repartidos a ambos lados de x con la forma de una escalera creciente hacia x: así cada acceso "ve" a varias llaves. Esa propiedad —alternar entre mitades izquierda y derecha
      de cada subárbol— es la que hace que la cota de Wilber-1 sea Theta(n lg n) para esta secuencia.
  - level: 6
    statement: >-
      Demuestra que, después de procesar cada fila, el conjunto que construye la regla de la escalera es arboralmente satisfecho **respecto del par formado por el punto de acceso $(x_t, t)$ y un punto anterior**
      $(y, s)$ con $s < t$ y la llave $y$ **a la derecha** de $x_t$ (los pares entre filas anteriores ya lo cumplían; la izquierda es simétrica).
    hints:
      - "Sea $(y, s)$ con $s < t$. Si $s = ult(y)$, ¿entra $y$ a la fila t o hay una llave z con ult(z) > ult(y) entre x_t e y?"
      - "Si no entra, la llave z que lo impide tiene un punto (z, ult(z)) dentro del rectángulo [x_t, y] x [s, t]."
      - "Si $s < ult(y)$, ¿qué otro punto de la columna y está dentro?"
    solution: >-
      Caso 1: s < ult(y). Entonces (y, ult(y)) está en el rectángulo [x_t, y] x [s, t] (misma columna que (y,s), tiempo entre s y t) y es un tercer punto: el par cumple. Caso 2: s = ult(y), y la
      llave y entra a la fila t. Entonces (y, t) pertenece a la fila y está en el borde superior del rectángulo: tercer punto. Caso 3: s = ult(y) y no entra: existe una llave z entre x_t e y con ult(z)
      >= ult(y) = s (si fuera menor entraría); el punto (z, ult(z)) cae dentro del rectángulo (x_t < z < y y s <= ult(z) < t): tercer punto. En los tres casos hay tercero, así que el par cumple. Para y a la izquierda la prueba
      es simétrica. (Los pares de puntos extra de la fila t con puntos anteriores se demuestran con el mismo argumento.)
---

Los ejercicios 2–4 se pueden verificar con [full-implementation.cpp](/structures/greedy-algorithm/operations/greedy-row), que imprime $|P|$ y el resultado del comprobador.
