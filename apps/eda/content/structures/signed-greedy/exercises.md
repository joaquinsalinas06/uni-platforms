---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      ¿Por qué Greedy es un algoritmo de BST válido y Signed-Greedy no, aunque ambos se calculen con la misma regla? ¿Qué le falta a Signed-Greedy?
    hints:
      - "Fíjate en qué tipos de rectángulos satisface cada uno."
      - "Un BST necesita satisfacer todos los rectángulos."
    solution: >-
      Greedy produce un conjunto que es arboralmente satisfecho para los rectángulos positivos y negativos a la vez, que es lo que caracteriza a una ejecución válida de BST. Greedy+ sólo satisface los positivos y Greedy− sólo los negativos; ninguno
      toma en cuenta la interacción entre ambos tipos, así que su conjunto no es una ejecución válida: sólo da una cota inferior.
  - level: 2
    statement: >-
      Calcula $\text{Greedy}^+$, $\text{Greedy}^-$ y Signed-Greedy para la secuencia $2, 1, 3$ sobre $\{1,2,3\}$.
    hints:
      - "Greedy+ mira sólo hacia la izquierda; Greedy− sólo hacia la derecha."
      - "Lleva ultimo[] fila por fila."
    solution: >-
      Greedy+: fila 1 {2}; fila 2 acceso 1 (izquierda de 1: nada) {1}; fila 3 acceso 3: izquierda: llave 2 (ult = 1) entra, llave 1 (ult = 2 > 1) entra: {3,2,1}. Total 1 + 1 + 3 = 5. Greedy−: fila 1 {2}; fila 2 acceso 1: derecha: llave 2 (ult = 1) entra {1,2}; fila 3 acceso 3: derecha nada: {3}. Total 1 + 2 + 1 = 4. Signed-Greedy = 5 = OPT.
  - level: 3
    statement: >-
      Implementa `greedy_signado` y úsalo para imprimir los tres valores del ejercicio 2.
    hints:
      - "La única diferencia con greedy-row es que se recorre una sola escalera."
      - "Cuenta puntos, no hace falta guardarlos."
    solution: |-
      ```cpp
      int greedy_signado(int n, const vector<int>& acc, int signo) {
        vector<int> ultimo(n + 2, 0);
        int puntos = 0;
        for (int t = 1; t <= (int)acc.size(); t++) {
          int x = acc[t - 1];
          vector<int> fila = {x};
          int mejor = 0;
          for (int y = x + signo; y >= 1 && y <= n; y += signo)
            if (ultimo[y] > mejor) { fila.push_back(y); mejor = ultimo[y]; }
          for (int y : fila) { ultimo[y] = t; puntos++; }
        }
        return puntos;
      }
      // greedy_signado(3, {2,1,3}, -1) = 5, greedy_signado(3, {2,1,3}, +1) = 4.
      ```
  - level: 4
    statement: >-
      Para las secuencias $3, 1, 4, 2$ y $2, 4, 1, 3$ compara Signed-Greedy con Greedy y con $\mathrm{OPT} = 8$. ¿Es válido $\text{Signed-Greedy} \le \mathrm{OPT}$ en ambas?
    hints:
      - "Ambas secuencias dan Greedy = 8."
      - "Usa el código del ejercicio 3."
    solution: >-
      Para 3,1,4,2: Greedy+ = 7, Greedy− = 7, Signed-Greedy = 7 <= 8. Para 2,4,1,3: Greedy+ = 7, Greedy− = 7, Signed-Greedy = 7 <= 8. En las dos, Signed-Greedy queda uno por debajo de Greedy y de OPT: consistente con que es una cota inferior.
  - level: 5
    statement: >-
      Busca una secuencia sobre 4 llaves para la que $\text{Greedy}^+ \ne \text{Greedy}^-$ por mucho, y explica la asimetría.
    hints:
      - "Prueba una secuencia monótona."
      - "Una secuencia creciente hace que las llaves ya tocadas queden a la izquierda del acceso actual."
    solution: >-
      La secuencia 1, 2, 3, 4: Greedy+ = 7 (cada acceso ve a la izquierda la llave anterior) y Greedy− = 4 (a la derecha de cada acceso no hay ninguna llave tocada). La asimetría viene de que todas las llaves tocadas previas quedan del mismo lado: sólo los rectángulos
      positivos están "vacíos". La decreciente 4, 3, 2, 1 la invierte.
  - level: 6
    statement: >-
      Demuestra, usando la cadena de desigualdades de la teoría, que $\text{Signed-Greedy} \le 2\,\mathrm{OPT}^{\pm}$ **si** se sabe que $\text{Greedy}^{\pm} \le \mathrm{OPT}^{\pm}$ en cada signo (el teorema de que Greedy± es O(OPT±)).
    hints:
      - "Signed-Greedy es el máximo de Greedy+ y Greedy−."
      - "OPT± es la unión de OPT+ y OPT−, así que OPT± ≥ OPT+ y OPT± ≥ OPT−."
    solution: >-
      Signed-Greedy = max{Greedy+, Greedy−}. Si Greedy+ <= OPT+ y Greedy− <= OPT−, entonces el máximo es <= max{OPT+, OPT−}. Como OPT± (la menor unión de un conjunto satisfecho positivo y uno satisfecho negativo) contiene cada uno de ellos,
      OPT± >= max{OPT+, OPT−}. Por tanto Signed-Greedy <= OPT± (con constante 1 bajo esa hipótesis); con la constante O(1) de la clase, Signed-Greedy = O(OPT±). El enunciado con 2 es una cota floja, válida a fortiori.
---

Los ejercicios 2–5 se verifican con `greedy_signado` de [theory.mdx](/structures/signed-greedy).
