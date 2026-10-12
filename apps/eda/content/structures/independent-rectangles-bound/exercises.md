---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Enuncia el teorema de los rectángulos independientes y explica por qué la cota **no** es un algoritmo para calcular OPT.
    hints:
      - "El teorema relaciona OPT con |I| y con un tamaño máximo de rectángulos independientes."
      - "Calcular el mayor conjunto de rectángulos independientes es un problema que ya conoces de grafos."
    solution: >-
      OPT >= |I| + (1/2) MIS, donde I es el conjunto de puntos de entrada y MIS el tamaño del mayor conjunto de rectángulos independientes. Calcular MIS es el problema Maximum
      Independent Set, NP-difícil en general; la cota sirve para demostrar que ningún algoritmo de BST puede costar menos que cierto valor, no para producir una ejecución.
  - level: 2
    statement: >-
      Decide si los dos rectángulos son independientes: (a) $[1,2]\times[1,2]$ y $[2,3]\times[2,3]$; (b) $[1,4]\times[1,4]$ y $[2,3]\times[2,3]$.
    hints:
      - "Compara con los tres ejemplos de la clase: separados, cruz y esquina compartida."
      - "En (b), ¿qué esquinas del rectángulo chico caen estrictamente dentro del grande?"
    solution: >-
      (a) Sí: comparten la esquina (2,2) y ninguna esquina de uno está estrictamente dentro del otro. (b) No: las cuatro esquinas del rectángulo chico, (2,2), (3,2), (2,3) y (3,3),
      están estrictamente dentro del grande.
  - level: 3
    statement: >-
      Escribe una función que, dados dos rectángulos $[x_1,x_2]\times[t_1,t_2]$ y $[x_3,x_4]\times[t_3,t_4]$, decida si **alguna esquina de uno está estrictamente dentro del otro**
      (la segunda cláusula de la definición de independencia).
    hints:
      - "Estrictamente dentro significa con desigualdades estrictas en las dos coordenadas."
      - "Hay que mirar las 4 esquinas de cada uno contra el otro: 8 comprobaciones."
    solution: |-
      ```cpp
      struct Rect { int x1, x2, t1, t2; };
      bool dentro(int x, int t, const Rect& r) { return r.x1 < x && x < r.x2 && r.t1 < t && t < r.t2; }
      bool esquina_dentro(const Rect& a, const Rect& b) {
        for (int x : {a.x1, a.x2}) for (int t : {a.t1, a.t2}) if (dentro(x, t, b)) return true;
        for (int x : {b.x1, b.x2}) for (int t : {b.t1, b.t2}) if (dentro(x, t, a)) return true;
        return false;
      }
      // (b) del nivel 2 devuelve true (no independientes); (a) devuelve false.
      ```
  - level: 4
    statement: >-
      Para $I = \{(1,1), (2,3), (3,2)\}$ lista los rectángulos que inducen sus pares, clasifícalos en positivos y negativos y calcula una cota inferior de OPT con el teorema.
      ¿Es ajustada?
    hints:
      - "Positivo = pendiente positiva entre los dos puntos, negativo = pendiente negativa."
      - "Los tres pares sin línea común son: (1,1)-(2,3), (1,1)-(3,2), (2,3)-(3,2)."
      - "Revisa si alguna esquina de un rectángulo cae ESTRICTAMENTE dentro de otro."
    solution: >-
      (1,1)-(2,3): pendiente 2, positivo, rectángulo [1,2]x[1,3]. (1,1)-(3,2): pendiente 1/2, positivo, [1,3]x[1,2]. (2,3)-(3,2): pendiente -1, negativo, [2,3]x[2,3]. Ninguna esquina de ningún
      rectángulo cae estrictamente dentro de otro (todas las coincidencias están en bordes), así que los tres son independientes entre sí: MIS = 3 y OPT >= 3 + 3/2 = 4.5, es decir OPT >= 5. Por
      enumeración, OPT = 5: la cota es ajustada. *(Enumeración derivada; no aparece en las diapositivas.)*
  - level: 5
    statement: >-
      Para la diagonal $I = \{(i, i) : 1 \le i \le n\}$ halla un conjunto de rectángulos independientes de tamaño $n - 1$ y deduce la cota. Compárala con el óptimo real ($2n - 1$) y calcula la razón.
    hints:
      - "Los rectángulos entre puntos consecutivos, (i,i)-(i+1,i+1), comparten esquina con su vecino."
      - "Ninguna esquina de uno cae estrictamente dentro de otro."
    solution: >-
      Los n - 1 rectángulos entre puntos consecutivos comparten una esquina con el siguiente y no contienen esquinas ajenas estrictamente adentro: son independientes, MIS >= n - 1. La cota es
      OPT >= n + (n-1)/2 = (3n-1)/2. Con OPT = 2n - 1 (n = 3 da 5, n = 4 da 7, verificado por enumeración), la razón OPT / cota = (2n-1) / ((3n-1)/2) tiende a 4/3: la cota siempre está dentro de un factor
      4/3 en la diagonal, pero no es exacta (n = 3: 4 contra 5).
  - level: 6
    statement: >-
      En el segundo paso de la prueba, $p$ es el punto de $\mathrm{OPT}^+$ más a la derecha y arriba **del lado izquierdo** del segmento vertical, y $q$ el más a la izquierda y abajo **del lado derecho**,
      no por debajo de $p$. Demuestra que $p$ y $q$ tienen la misma coordenada $y$.
    hints:
      - "Supón que q está estrictamente por encima de p. El rectángulo de p y q es positivo: debe estar satisfecho."
      - "¿Dónde puede caer el tercer punto r de ese rectángulo respecto del segmento vertical? Un lado contradice a p; el otro contradice a q."
    solution: >-
      Supongamos que q está estrictamente por encima de p. Como p está a la izquierda del segmento y q a la derecha, el rectángulo que forman es positivo y, por ser OPT+ satisfecho positivo, contiene un tercer
      punto r (distinto de p y q). Si r cae del lado izquierdo del segmento, está dentro del rectángulo, así que es más a la derecha y arriba que p (o igual en alguna coordenada y estrictamente en otra),
      contra la elección de p como el más a la derecha y arriba. Si r cae del lado derecho, está más a la izquierda y abajo que q, contra la elección de q. Ambos casos contradicen: no puede haber
      tal r, luego el rectángulo no estaría satisfecho. Por tanto q no está por encima de p; como q no está por debajo de p por definición, p y q tienen la misma coordenada y.
---

Los ejercicios 4 y 5 se pueden verificar con una enumeración de superconjuntos satisfechos (los valores de OPT citados salen de una).
