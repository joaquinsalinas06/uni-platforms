---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor cierra la sesión diciendo que "con pesos uniformes, esto da
      O(lg n) amortizado; con pesos proporcionales a la frecuencia, da la cota
      de entropía — un solo lema prueba ambas propiedades" (#37). Sin hacer
      cuentas: ¿qué es exactamente lo único que cambia entre las dos
      demostraciones? Nombra la pieza que cambia y dos piezas que NO cambian.
    hints:
      - "Las dos consecuencias parten de la misma desigualdad, la del Lema de Acceso. Pregúntate qué entra como dato en esa desigualdad y qué está fijo."
      - "Repasa qué son w_x, s(x) y r(x) — cuál de los tres lo elige el analista y cuáles dos se calculan a partir de esa elección."
    solution: >-
      Lo único que cambia es la elección de los pesos w_x (1 para todos, o
      proporcionales a p_x). No cambia el Lema de Acceso —es la misma
      desigualdad 3(r(t) − r(x)) + 1, demostrada una sola vez— ni cambia el
      código del splay tree, que es idéntico en ambos casos y no sabe qué
      pesos eligió el analista. Las definiciones de s(x) y r(x) tampoco
      cambian: siguen siendo "suma de pesos del subárbol" y "lg s(x)"; lo que
      cambia son sus valores, porque los sumandos son otros.
  - level: 2
    statement: >-
      Cuatro llaves con distribución de accesos p = (1/2, 1/4, 1/8, 1/8).
      Calcula la entropía H = Σ_x p_x lg(1/p_x), compárala con lg n, y da la
      cota amortizada por acceso en los dos casos (pesos uniformes y pesos por
      frecuencia), usando la forma 3·lg(W/w_x) + 1 promediada que se deriva en
      theory.mdx.
    hints:
      - "Todas las probabilidades son potencias de 2, así que cada lg(1/p_x) es un entero: lg(1/(1/2)) = 1, lg(1/(1/4)) = 2, lg(1/(1/8)) = 3."
      - "La cota con pesos uniformes es 3·lg n + 1 para toda llave; la de entropía es 3·H + 1 promediada sobre la secuencia."
      - "Con n = 4, lg n = 2 exactamente — no hace falta calculadora para comparar."
    solution: >-
      H = (1/2)(1) + (1/4)(2) + (1/8)(3) + (1/8)(3) = 0.5 + 0.5 + 0.375 +
      0.375 = 1.75 bits. Comparación con lg 4 = 2 bits: H = 1.75 < 2, la
      distribución sesgada tiene menos entropía que la uniforme. Cotas
      amortizadas por acceso: con pesos uniformes, 3·2 + 1 = 7; con pesos por
      frecuencia, 3·1.75 + 1 = 6.25. La segunda es mejor, y lo sería para
      cualquier distribución que no sea la uniforme: H ≤ lg n siempre, con
      igualdad exactamente en el caso uniforme (donde las dos cotas dan lo
      mismo, 7).
  - level: 3
    statement: >-
      Sobre el árbol de siete llaves de theory.mdx (raíz 4; hijos 2 y 6; hojas
      1, 3, 5, 7) y la distribución p = (1/32, 1/32, 1/4, 1/32, 1/2, 1/8,
      1/32) para las llaves 1..7, calcula a mano s(2), r(2) y la cota
      amortizada que el Lema de Acceso da para un acceso a la llave 2. Después
      compárala con la cota que sale de un acceso a la llave 5, y explica por
      qué la llave 5 sale MÁS BARATA aunque esté más abajo en el árbol
      (profundidad 3 contra profundidad 2).
    hints:
      - "s(x) suma los pesos de todo el subárbol de x, incluyendo el propio x. El subárbol de 2 contiene a 1, 2 y 3."
      - "El peso total es W = 1 porque las p_x suman 1, así que r(raíz) = lg 1 = 0 y la cota se reduce a 3·(0 − r(x)) + 1 = −3·r(x) + 1."
      - "La cota del Lema de Acceso no menciona la profundidad de x en ningún lado: sólo su rango. Pregúntate qué mide realmente el rango."
    solution: >-
      s(2) = w_1 + w_2 + w_3 = 1/32 + 1/32 + 1/4 = 10/32 = 5/16 = 0.3125, así
      que r(2) = lg(0.3125) ≈ −1.678 y la cota es 3(0 − (−1.678)) + 1 ≈ 6.03
      amortizado. Para la llave 5: s(5) = w_5 = 1/2 (es hoja), r(5) = −1, y la
      cota es 3(0 − (−1)) + 1 = 4. La llave 5 sale más barata (4 contra 6.03)
      pese a estar a profundidad 3 contra la profundidad 2 de la llave 2. La
      razón es que en la cota del Lema de Acceso la profundidad no aparece por
      ningún lado: lo único que entra es el rango, y el rango mide cuánta masa
      de accesos concentra el nodo. La llave 5 arrastra ella sola la mitad del
      peso total; la llave 2, con su subárbol entero, apenas junta 5/16. Ésa
      es la idea completa de la optimalidad estática — lo que abarata una
      llave es su frecuencia, no su posición actual en el árbol, que de todas
      formas el splay va a cambiar.
  - level: 4
    statement: >-
      El Lema de Acceso pide pesos positivos arbitrarios, no probabilidades —
      no exige que sumen 1. Supón que en vez de p_x usas c_x, el número de
      veces que la llave x aparece en la secuencia (enteros, con Σ_x c_x = m
      búsquedas en total). Adapta la derivación: ¿qué cota por acceso sale
      ahora, y por qué termina siendo la misma que con p_x?
    hints:
      - "Escribe la cota en su forma 3·lg(W/w_x) + 1, donde W es el peso total. ¿Cuánto vale W si los pesos son los conteos c_x?"
      - "Relaciona c_x con p_x: si la llave x aparece c_x veces en m búsquedas, ¿qué fracción de la secuencia es?"
      - "Un cociente de pesos no cambia si multiplicas todos los pesos por la misma constante."
    solution: >-
      Con w_x = c_x el peso total es W = Σ_x c_x = m, así que la cota por
      acceso a x es 3·lg(m/c_x) + 1. Pero c_x/m = p_x por definición de
      frecuencia relativa, luego m/c_x = 1/p_x y la cota es 3·lg(1/p_x) + 1 —
      exactamente la misma que con las probabilidades. La razón general es que
      en la cota los pesos sólo aparecen como el cociente W/w_x, que es
      invariante si se multiplican todos los pesos por una constante positiva:
      los pesos están definidos salvo escala. Por eso "w_x ∝ p_x" en #36 dice
      "proporcional" y no "igual" — la constante de proporcionalidad se
      cancela sola.
  - level: 5
    statement: >-
      Diseña dos secuencias de búsqueda sobre las mismas n llaves que tengan
      EXACTAMENTE la misma distribución de frecuencias p (y por lo tanto la
      misma cota de entropía), pero que intuitivamente sean muy distintas de
      atender. Explica qué te dice ese par sobre lo que la cota de entropía
      puede prometer y lo que no.
    hints:
      - "La distribución de frecuencias sólo cuenta cuántas veces aparece cada llave. ¿Qué información de la secuencia se pierde al contar?"
      - "Toma cualquier secuencia y permútala: la distribución no se mueve ni un poco."
      - "Piensa en un caso donde el orden sí importa mucho — por ejemplo, todas las repeticiones juntas contra todas las repeticiones dispersas."
    solution: >-
      Basta permutar. Por ejemplo, con dos llaves a y b y 100 búsquedas de
      cada una: S1 = (a repetida 100 veces, luego b repetida 100 veces) y S2 =
      (a, b, a, b, ... alternando 100 veces). Ambas tienen p_a = p_b = 1/2 y
      la misma entropía (1 bit), así que la cota de entropía les da
      exactamente la misma promesa. Pero S1 tiene una localidad enorme (una
      vez que a está en la raíz, 99 accesos consecutivos son baratos) y S2
      alterna constantemente. La conclusión: la cota de entropía sólo ve el
      HISTOGRAMA de la secuencia, no su orden. Es una promesa sobre qué tan
      concentrada está la masa de accesos, no sobre patrones temporales — por
      eso no captura propiedades como acceso secuencial o conjunto de trabajo
      (ver /structures/search-sequence-properties), que sí dependen del orden.
  - level: 6
    statement: >-
      Demuestra que la optimalidad estática NO implica la optimalidad
      dinámica, exhibiendo una familia de secuencias donde la cota de entropía
      es asintóticamente peor que lo que el material ya garantiza por otra
      vía. Pista de partida: usa la propiedad de acceso secuencial de
      /structures/search-sequence-properties. Después explica por qué esto no
      contradice nada de lo probado en #35-36.
    hints:
      - "Busca una secuencia cuya distribución de frecuencias sea uniforme (entropía máxima) pero cuyo orden sea trivialmente fácil."
      - "La propiedad de acceso secuencial habla de la secuencia {1, 2, ..., n} en orden y promete O(1) amortizado por búsqueda."
      - "Compara lo que promete la cota de entropía para esa secuencia con lo que promete la propiedad de acceso secuencial para la MISMA secuencia."
      - "Recuerda que una cota superior puede ser cierta y a la vez floja: que valga no significa que sea lo mejor que se puede decir."
    solution: >-
      Toma S = {1, 2, ..., n} repetida k veces. Cada llave aparece exactamente
      k veces, así que p_x = 1/n para todas: la distribución es uniforme y su
      entropía es máxima, H = lg n. La cota de entropía promete entonces
      O(lg n) amortizado por búsqueda — lo mismo que la cota uniforme, o sea
      ninguna ganancia. Pero la propiedad de acceso secuencial (Sem5 #30)
      afirma que esa misma secuencia se puede atender en O(1) amortizado por
      búsqueda. Hay un factor lg n de distancia entre lo que la cota de
      entropía puede prometer y lo que realmente cuesta atender esa secuencia.
      Esto no contradice #35-36: la cota de entropía es una cota SUPERIOR
      válida (el costo real es ≤ O(lg n), y O(1) ≤ O(lg n)), sólo que floja
      para esta familia. La razón estructural es la del nivel 5: la entropía
      depende únicamente del histograma de frecuencias y es ciega al orden,
      mientras que la facilidad de esta secuencia vive enteramente en el
      orden. Por eso batir al mejor árbol ESTÁTICO (que también es ciego al
      orden, porque no rota) no dice nada sobre batir a OPT(S), que sí puede
      reestructurar entre accesos y explotar el orden: ese sigue siendo el
      problema abierto de /structures/dynamic-optimality.
---

Los niveles 1-2 fijan qué cambia entre las dos consecuencias y ponen números
a la comparación H contra lg n; el 3 aplica el Lema de Acceso a mano sobre un
árbol y una distribución concretos; el 4 explora que los pesos están
definidos salvo escala; y los niveles 5-6 trabajan el límite del resultado —
qué información de la secuencia la cota de entropía simplemente no mira, y
por qué eso deja la optimalidad dinámica intacta como pregunta abierta.
