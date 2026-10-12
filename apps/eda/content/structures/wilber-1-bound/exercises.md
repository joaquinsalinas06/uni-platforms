---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      ¿Qué hace falta fijar para calcular Wilber-1, qué accesos se ignoran en cada nodo $y$ y por qué la cota no depende sólo de la secuencia?
    hints:
      - "Mira la definición: 'fijamos un árbol de referencia'."
      - "Se cuentan las alternancias entre subárbol izquierdo y derecho; los accesos a y o fuera de su subárbol no cuentan."
    solution: >-
      Hace falta un árbol de referencia P con las llaves de la entrada. En cada nodo y se ignoran los accesos a y mismo y los accesos que caen fuera de su subárbol. La cota depende de P porque
      las alternancias se cuentan nodo por nodo de ese árbol: cambiar P cambia los subárboles y por tanto el conteo.
  - level: 2
    statement: >-
      Árbol de referencia: raíz 2 con hijos 1 y 3. Calcula Wilber-1 de la secuencia $1, 3, 1, 3, 2$.
    hints:
      - "Sólo el nodo 2 tiene accesos a ambos lados."
      - "Ignora el acceso a 2 mismo."
    solution: >-
      En la raíz 2, los accesos 1, 3, 1, 3 caen L R L R: 3 alternancias; el acceso a 2 se ignora. Los nodos 1 y 3 no tienen subárboles con accesos. Wilber-1 = 3.
  - level: 3
    statement: >-
      Implementa `wilber1(lo, hi, seq)` (árbol balanceado) y pruébalo con $3, 1, 4, 2$ sobre $1..4$ (debe dar 2).
    hints:
      - "Recursión: la raíz es mid = (lo + hi) / 2; a cada hijo se le pasa sólo el subconjunto de accesos de su rango."
      - "El primer acceso de un lado no cuenta como alternancia: usa una variable lado_ant que parte en 0."
    solution: |-
      ```cpp
      int wilber1(int lo, int hi, const vector<int>& seq) {
        if (lo > hi) return 0;
        int mid = (lo + hi) / 2, alt = 0, lado_ant = 0;
        vector<int> sub;
        for (int x : seq) if (lo <= x && x <= hi) {
          sub.push_back(x);
          if (x == mid) continue;
          int lado = x < mid ? -1 : +1;
          if (lado_ant != 0 && lado != lado_ant) alt++;
          lado_ant = lado;
        }
        return alt + wilber1(lo, mid - 1, sub) + wilber1(mid + 1, hi, sub);
      }
      // wilber1(1, 4, {3,1,4,2}) == 2
      ```
  - level: 4
    statement: >-
      Modifica `wilber1` para imprimir, por cada nodo $y$ de la secuencia bit-reversal sobre las llaves $0..6$, su número de alternancias. Comprueba que el de la raíz es 5 y el de los nodos 1 y 5 es 1.
    hints:
      - "Imprime mid y alt después de contar y antes de recursar a los hijos."
      - "La secuencia es 0, 4, 2, 6, 1, 5, 3."
    solution: >-
      Basta agregar cout << "nodo " << mid << ": " << alt << "\n"; justo después del bucle, antes de las llamadas recursivas. Salida (en orden de visita): nodo 3: 5, nodo 1: 1, nodo 0: 0, nodo 2: 0, nodo 5: 1, nodo 4: 0, nodo 6: 0. Total 7.
  - level: 5
    statement: >-
      Con el árbol perfecto sobre $\{1,\dots,7\}$ (raíz 4), diseña (a) una secuencia con Wilber-1 igual a 0 y (b) una con Wilber-1 al menos 6. Explica en qué cambia la estructura de la secuencia.
    hints:
      - "Wilber-1 = 0 requiere que en cada nodo todos los accesos (sin contar al propio nodo) caigan del mismo lado."
      - "Para (b) piensa en alternar entre las mitades en cada nivel, como bit-reversal."
    solution: >-
      (a) La secuencia constante 1, 1, 1, 1: en cada nodo todos los accesos caen de un solo lado, así que no hay alternancias. (Una creciente 1..7 NO sirve: en la raíz hay L L L y luego R R R, una alternancia.)
      (b) La bit-reversal 1, 5, 3, 7, 2, 6, 4 da Wilber-1 = 7 >= 6. En (b) las mitades se alternan en cada paso en la raíz (5 alternancias) y vuelven a alternar dentro de los subárboles.
  - level: 6
    statement: >-
      Demuestra que, en la secuencia bit-reversal de $2^k$ llaves, accesos consecutivos caen siempre en mitades distintas del árbol (bit más alto distinto), y de ahí deduce que en la raíz hay una alternancia en cada paso.
    hints:
      - "El i-ésimo acceso es rev(i): los bits de i en orden inverso."
      - "El bit más alto de rev(i) es el bit menos significativo de i."
      - "¿Qué pasa con el bit menos significativo de dos números consecutivos?"
    solution: >-
      El i-ésimo acceso es rev(i). El bit más alto de rev(i) es el bit menos significativo de i. Dos enteros consecutivos i e i + 1 tienen bit menos significativo distinto (uno es par y el otro impar), así que
      rev(i) y rev(i + 1) tienen bit más alto distinto: caen en mitades distintas (izquierda o derecha de la raíz). Por tanto, sin contar el acceso a la propia raíz, cada acceso consecutivo en el subárbol de la
      raíz cambia de lado: hay una alternancia en cada paso.
---

El nivel 5 se puede comprobar con el código de [theory.mdx](/structures/wilber-1-bound).
