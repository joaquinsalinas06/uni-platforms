---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Verifica el lema con números. Para c = 8, calcula lg a + lg b y
      compáralo contra la cota 2 lg c − 2 en los cuatro repartos enteros:
      (a,b) = (1,7), (2,6), (3,5) y (4,4). ¿En cuál de los cuatro se cumple
      con igualdad, y cuánta holgura sobra en los otros tres?
    hints:
      - >-
        La cota 2 lg c − 2 no depende de a ni de b: con c = 8 vale lo mismo
        en los cuatro renglones. Calcúlala una sola vez.
      - >-
        lg 1 = 0, lg 2 = 1, lg 4 = 2, lg 8 = 3. Para lg 3, lg 5, lg 6 y
        lg 7 basta con dos o tres decimales.
      - >-
        Ordena los cuatro resultados de menor a mayor antes de contestar:
        el patrón que aparece es el enunciado "el máximo se alcanza cuando
        a = b = c/2" (#29) visto con números.
    solution: >-
      La cota vale 2·3 − 2 = 4 en los cuatro casos. (1,7) da 0 + 2.807 =
      2.807 (holgura 1.193); (2,6) da 1 + 2.585 = 3.585 (holgura 0.415);
      (3,5) da 1.585 + 2.322 = 3.907 (holgura 0.093); (4,4) da 2 + 2 = 4,
      con holgura 0 — es el único que se cumple con igualdad, y es
      exactamente a = b = c/2.
  - level: 2
    statement: >-
      Traza la demostración completa, paso a paso, para a = 2, b = 6,
      c = 8. Escribe el valor numérico de los dos lados en cada uno de los
      cinco pasos (AM-GM, uso de la hipótesis, encadenar, aplicar lg,
      identidades del logaritmo) y di en cuáles se cumple con igualdad y en
      cuáles es estricta.
    hints:
      - >-
        Los cinco pasos están en la sección de análisis de la teoría. Empieza
        por el producto ab y la media aritmética (a+b)/2, no por los
        logaritmos.
      - >-
        El paso de AM-GM es igualdad si y sólo si a = b; el paso de la
        hipótesis es igualdad si y sólo si a + b = c. Revisa cuál de las dos
        condiciones cumplen estos números.
      - >-
        Al aplicar lg, el lado derecho c²/4 se reescribe como 2 lg c − 2
        usando lg(u/v) = lg u − lg v y lg(u²) = 2 lg u. Ahí es donde aparece
        el −2, que es lg 4.
    solution: >-
      ab = 12. AM-GM: 12 ≤ ((2+6)/2)² = 16 — estricta, porque a ≠ b.
      Hipótesis: 16 ≤ c²/4 = 64/4 = 16 — igualdad, porque a + b = 8 = c.
      Encadenando: 12 ≤ 16. Aplicando lg: lg 12 = 3.585 ≤ lg 16 = 4.
      Identidades: lg 2 + lg 6 = 1 + 2.585 = 3.585 ≤ 2 lg 8 − 2 = 4. La
      única desigualdad estricta es la de AM-GM, y es la que explica la
      holgura de 0.415.
  - level: 3
    statement: >-
      Escribe una función que reciba un entero c y verifique el lema por
      fuerza bruta sobre todos los pares de enteros a, b ≥ 1 con a + b ≤ c,
      devolviendo el par donde la holgura (2 lg c − 2) − (lg a + lg b) es
      mínima. Córrela mentalmente (o en papel) para c = 8 y para c = 9 y
      explica por qué el par ganador es distinto en los dos.
    hints:
      - >-
        Basta un doble bucle sobre a y b; la condición a + b ≤ c descarta la
        mayoría de los pares. No hace falta ninguna estructura de datos.
      - >-
        Minimizar la holgura es lo mismo que maximizar lg a + lg b, y como lg
        es creciente, eso es lo mismo que maximizar el producto a·b. Puedes
        evitar los logaritmos por completo dentro del bucle.
      - >-
        Con c par, a + b = c se puede repartir en dos mitades exactas; con c
        impar no. Piensa qué par de enteros maximiza el producto cuando la
        suma es impar.
    solution: >-
      Para c = 8 el mínimo de holgura lo da (4,4), con holgura 0: el
      producto máximo con a + b ≤ 8 es 16. Para c = 9 el mejor par entero es
      (4,5) (producto 20), que da lg 4 + lg 5 = 2 + 2.322 = 4.322 contra una
      cota de 2 lg 9 − 2 = 4.340: holgura 0.018, pequeña pero no cero. La
      diferencia es que con c impar no existe el reparto a = b = c/2 en
      enteros, así que la igualdad del lema no se puede alcanzar; el par que
      más se acerca es el más parejo posible.
  - level: 4
    statement: >-
      Adapta el lema a otra base. Si en vez de lg (base 2) se usa ln (base
      e), ¿en qué se convierte la constante −2 del enunciado? Escribe la
      versión del lema para ln y para log en base 10, y explica en una frase
      de dónde sale la constante en cada caso.
    hints:
      - >-
        La demostración no usa en ningún momento que la base sea 2: hasta el
        paso ab ≤ c²/4 no hay ningún logaritmo. Lo único que cambia es cómo
        se reescribe el lado derecho.
      - >-
        Reescribe log(c²/4) como 2 log c − log 4 y pregúntate cuánto vale
        log 4 en cada base.
      - >-
        En base 2, log 4 = 2 — de ahí el −2 del enunciado. Calcula ln 4 y
        log₁₀ 4 para las otras dos versiones.
    solution: >-
      La constante es siempre −log 4 = −2 log 2 en la base que se esté
      usando. En base 2 vale −2 (lg 4 = 2), que es el enunciado del profesor.
      En base e queda ln a + ln b ≤ 2 ln c − ln 4 = 2 ln c − 1.386. En base
      10 queda log a + log b ≤ 2 log c − log 4 = 2 log c − 0.602. El −2 no
      tiene nada de especial: es el precio de partir c en dos mitades,
      medido en la unidad de la base elegida (un "bit" por mitad cuando la
      base es 2).
  - level: 5
    statement: >-
      El profesor cierra el zig-zag diciendo que se demuestra "con el mismo
      esquema, misma desigualdad de logaritmos, aplicada a la configuración
      reflejada" (#31), y no desarrolla el álgebra. Dibuja la configuración
      zig-zag (x, su padre y, su abuelo z, con x del lado contrario al que
      está y respecto de z) antes y después del paso, e identifica qué tres
      conjuntos de nodos juegan el papel de a, b y c. Justifica que son
      disjuntos y que ambos caben dentro del contenedor.
    hints:
      - >-
        Mira primero cómo se hace en el zig-zig, en la sección de análisis de
        la teoría y en el diagrama del inicio de esa página: a y b son dos
        subárboles en momentos distintos (uno después, otro antes) y c es el
        subárbol de x después.
      - >-
        En el zig-zag, después del paso, y y z quedan como hijos directos de
        x — no en cascada. Compara con el resultado final de
        /structures/splay-tree/operations/zig-zag.
      - >-
        Para justificar "disjuntos", basta señalar que después del paso cada
        uno de los dos conjuntos cuelga de un lado distinto de x. Para
        "contenidos", basta con que x haya quedado como raíz de los tres
        niveles.
    solution: >-
      Los papeles son los mismos que en el zig-zig: a = s'(z) (subárbol de z
      después), b = s(x) (subárbol de x antes) y c = s'(x) (subárbol de x
      después). Lo que cambia es la geometría: tras el zig-zag, y y z quedan
      como los dos hijos directos de x, así que s'(z) vive enteramente bajo
      uno de esos hijos, mientras que los nodos de s(x) — x y los dos
      subárboles que colgaban de él — quedan repartidos entre la raíz y el
      otro lado. Nunca se solapan, y ambos están dentro del subárbol de x
      después porque x es la raíz de los tres niveles. Con eso la hipótesis
      a + b ≤ c se cumple igual y el lema entrega la misma desigualdad. Este
      ejercicio reconstruye lo que el profesor deja indicado sin desarrollar
      — no es una versión distinta del lema, es el mismo lema sobre otra
      figura.
  - level: 6
    statement: >-
      Demuestra la versión de tres términos: si a, b, d > 0 y a + b + d ≤ c,
      entonces lg a + lg b + lg d ≤ 3 lg c − 3 lg 3. Después explica por qué
      la constante ya no es −2 ni −3, y cuál es el caso de igualdad.
      Finalmente, generaliza a k términos y di qué forma tiene la constante.
    hints:
      - >-
        AM-GM vale para cualquier cantidad de números positivos, no sólo para
        dos: la media geométrica de k números es a lo más su media
        aritmética.
      - >-
        Escribe la media geométrica de tres números como (a·b·d) elevado a
        1/3 y acota la media aritmética (a+b+d)/3 usando la hipótesis, igual
        que en el paso 2 de la demostración de dos términos.
      - >-
        Al final tendrás abd ≤ (c/3)³. Aplica lg a ambos lados y reparte con
        lg(uvw) = lg u + lg v + lg w. La constante saldrá de lg(3³).
    solution: >-
      Por AM-GM para tres números, (abd)^(1/3) ≤ (a+b+d)/3 ≤ c/3, así que
      abd ≤ c³/27. Tomando lg: lg a + lg b + lg d ≤ lg c³ − lg 27 = 3 lg c −
      3 lg 3 ≈ 3 lg c − 4.755. La constante es −k lg k con k = 3: para k = 2
      da −2 lg 2 = −2, que es el lema del profesor. El caso de igualdad es
      a = b = d = c/3 (AM-GM es igualdad si y sólo si los tres son iguales, y
      la hipótesis se usa con igualdad si y sólo si a + b + d = c). En
      general, si a₁ + … + a_k ≤ c entonces la suma de los lg a_i es a lo más
      k lg c − k lg k, con igualdad cuando todos valen c/k: repartir en k
      partes iguales cuesta lg k por parte. El lema del curso es el caso
      k = 2 porque en el zig-zig hay exactamente dos conjuntos disjuntos que
      acotar.
---

Seis ejercicios sobre el lema (#29) y su aplicación al zig-zig (#30). Los
tres primeros se resuelven con aritmética; los tres últimos piden adaptar o
demostrar. Nada aquí requiere programar una estructura de datos: el lema no
es una.
