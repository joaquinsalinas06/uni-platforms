---
kind: exercises
title: Ejercicios
# Notación de toda la página, igual que en #22: w_x = 1 para todos los nodos,
# s(x) = suma de pesos del subárbol de x (= contar nodos), r(x) = lg s(x),
# Φ = Σ r(x). Una prima (r′) significa "después del paso".
items:
  - level: 1
    statement: >-
      El Lema de Acceso dice que el costo amortizado de Splay(x) en un árbol
      con raíz t es a lo más 3(r(t) − r(x)) + 1. De los cuatro objetos que
      definió el profesor —w_x, s(x), r(x) y Φ— ¿cuál es el único que un
      nodo del splay tree tendría que guardar en memoria para que el código
      funcione? Y en la cota, ¿r(t) es el rango de x antes o después del
      Splay?
    hints:
      - >-
        El encabezado de la diapositiva que introduce los tres objetos dice
        literalmente para qué sirven y para qué no.
      - >-
        Al terminar Splay(x), ¿en qué posición del árbol queda x? ¿Y qué
        subárbol cuelga de esa posición?
    solution: >-
      Ninguno. Los cuatro son "definiciones solo para el análisis, no para el
      código" (#22): ningún nodo guarda peso, tamaño ni rango — existen
      únicamente dentro de la demostración. Y r(t) es el rango de x DESPUÉS
      del Splay: como x termina siendo la raíz, su subárbol final es el árbol
      completo, el mismo que tenía t, así que su rango final vale r(t). Por
      eso la cota se lee "proporcional a cuánto SUBE el rango de x" (#23).
  - level: 2
    statement: >-
      Calcula Φ a mano sobre estos dos árboles con las mismas 5 llaves. (a)
      Balanceado: raíz 3, con 1 y 5 como hijos, y 2 colgando de 1 (derecha) y
      4 colgando de 5 (izquierda). (b) Cadena degenerada: 5 arriba, y bajando
      por la izquierda 4, 3, 2, 1. Usa lg 2 = 1, lg 3 ≈ 1.58, lg 4 = 2,
      lg 5 ≈ 2.32. ¿Cuál de los dos tiene más "trabajo diferido guardado", y
      por qué tiene sentido que sea ése?
    hints:
      - >-
        Empieza por s(x) de cada nodo, que con pesos 1 es sólo contar cuántos
        nodos cuelgan de él, incluyéndolo. Las hojas siempre valen 1, y por
        lo tanto aportan rango 0.
      - >-
        En la cadena, los tamaños de abajo hacia arriba son 1, 2, 3, 4, 5 sin
        excepción — no hace falta dibujar nada, es la suma de lg k para k de
        1 a 5.
      - >-
        Φ mide la forma, no el contenido. Un árbol donde muchos nodos tienen
        subárboles grandes acumula más rango que uno donde casi todos son
        hojas.
    solution: >-
      (a) Balanceado: hojas 2 y 4 valen s=1 ⇒ r=0; nodos 1 y 5 valen s=2 ⇒
      r=1 cada uno; raíz 3 vale s=5 ⇒ r≈2.32. Φ ≈ 0+0+1+1+2.32 = 4.32.
      (b) Cadena: Φ = lg 1 + lg 2 + lg 3 + lg 4 + lg 5 = lg(5!) = lg 120 ≈
      6.91. La cadena tiene más potencial (6.91 contra 4.32), y tiene
      sentido: es el árbol en el que un acceso al nodo más hondo cuesta más
      trabajo real, y ese trabajo tiene que estar prepagado en algún lado. El
      potencial ES ese prepago (#22).
  - level: 3
    statement: >-
      Escribe en C++ una función `double phi(const vector<int>& sizes)` que,
      dada la lista de los tamaños s(x) de todos los nodos de un árbol,
      devuelva Φ = Σ lg s(x). Verifica con asserts que para el árbol
      balanceado de 5 nodos del ejercicio 2 (tamaños {1,1,2,2,5}) da ≈ 4.32,
      y que para la cadena de 5 (tamaños {1,2,3,4,5}) da ≈ 6.91. Cuidado con
      una cosa que la librería estándar no te da directamente.
    hints:
      - >-
        `std::log2` es lg; `std::log` es logaritmo natural. Usar el segundo
        por descuido cambia todos los números por un factor constante y los
        asserts fallan.
      - >-
        Comparar doubles con == nunca funciona. Usa `std::fabs(a - b) < 1e-2`
        con la tolerancia que te permita el redondeo a dos decimales del
        enunciado.
      - >-
        s(x) ≥ 1 siempre (todo nodo se cuenta a sí mismo), así que lg s(x) ≥
        0 y Φ nunca es negativo — un buen assert extra sobre el resultado.
    solution: >-
      Una implementación directa. `double phi(const vector<int>& sizes) {
      double total = 0; for (int s : sizes) total += std::log2(s); return
      total; }`. Verificación: `assert(std::fabs(phi({1,1,2,2,5}) - 4.32) <
      1e-2);` y `assert(std::fabs(phi({1,2,3,4,5}) - 6.91) < 1e-2);`. El
      segundo caso es lg(5!) porque los tamaños de una cadena son exactamente
      1..n, y lg 1 + lg 2 + ... + lg n = lg(n!). Nota: no hay archivo en
      cpp/structures/access-lemma/ porque este tema no tiene código de
      estructura — Φ no vive en el splay tree, sólo en el análisis (#22).
  - level: 4
    statement: >-
      En el paso zig-zig, la prueba usa la igualdad r′(x) = r(z). Localiza el
      punto exacto de la derivación donde se sustituye (es una sola
      sustitución) y explica qué se rompería si en vez de la igualdad sólo
      tuviéramos la desigualdad r′(x) ≤ r(z). Después responde por qué es una
      igualdad exacta y no una desigualdad.
    hints:
      - >-
        La derivación arranca en "costo amortizado = 2 + (r′(x)+r′(y)+r′(z))
        − (r(x)+r(y)+r(z))". Fíjate cuál de los seis términos desaparece
        después de la sustitución.
      - >-
        Una sustitución con = va en las dos direcciones; una con ≤ sólo sirve
        si el término está del lado en que la desigualdad ayuda. Pregúntate
        de qué signo entra r(z) en la expresión.
      - >-
        Para la segunda parte: ¿qué nodos cuelgan de z antes del zig-zig? ¿Y
        cuáles cuelgan de x después? Compara los dos conjuntos, elemento por
        elemento.
    solution: >-
      Se sustituye en el término −r(z) de ΔΦ, que se cancela contra el +r′(x)
      de la misma expresión, dejando 2 + r′(y) + r′(z) − r(x) − r(y). Si sólo
      tuviéramos r′(x) ≤ r(z), la cancelación no sirve: r(z) entra con signo
      NEGATIVO, así que acotarlo por arriba con r′(x) acota la expresión por
      ABAJO, no por arriba — y una cota inferior es inútil para probar que el
      costo es pequeño. Es igualdad exacta porque el conjunto de nodos bajo x
      después del zig-zig es exactamente el que estaba bajo z antes: el
      zig-zig sólo reacomoda quién cuelga de quién dentro de ese mismo
      conjunto, no entra ni sale ningún nodo, así que la suma de pesos es
      idéntica y por lo tanto también el rango (#27).
  - level: 5
    statement: >-
      El profesor prueba zig-zig completo y dice de zig-zag sólo que "se
      demuestra con el mismo esquema... no vamos a repetir el álgebra
      completa" (#31). Hazla tú. En zig-zag, z es la raíz del subárbol, y es
      su hijo izquierdo y x es el hijo DERECHO de y; después del paso, x
      queda arriba con y y z como sus dos hijos. Elige a, b y c para
      instanciar el lema de los logaritmos, justifica geométricamente que a +
      b ≤ c, y llega hasta la cota final. ¿Por qué tu elección de a y b NO
      puede ser la misma que en zig-zig?
    hints:
      - >-
        Empieza igual que en zig-zig: sigue valiendo r′(x) = r(z) y siguen
        cambiando de rango sólo x, y, z. El costo real también es 2.
      - >-
        El lema necesita dos conjuntos DISJUNTOS que quepan dentro de un
        tercero. Mira la forma de DESPUÉS: ¿cuáles son los dos subárboles que
        cuelgan directamente de x, y son evidentemente disjuntos?
      - >-
        Con a = s′(y) y b = s′(z) el lema da r′(y) + r′(z) ≤ 2r′(x) − 2.
        Métela en la expresión del costo amortizado después de usar r(y) ≥
        r(x).
      - >-
        Tu resultado va a salir ≤ 2(r′(x) − r(x)), no 3. Eso no es un error:
        como r′(x) ≥ r(x), 2(r′(x) − r(x)) ≤ 3(r′(x) − r(x)), así que la cota
        del profesor sigue siendo válida (sólo es menos ajustada).
    solution: >-
      Costo amortizado = 2 + (r′(x)+r′(y)+r′(z)) − (r(x)+r(y)+r(z)). Con
      r′(x) = r(z) queda 2 + r′(y) + r′(z) − r(x) − r(y), y con r(y) ≥ r(x)
      (antes, x colgaba de y) queda ≤ 2 + r′(y) + r′(z) − 2r(x). Ahora se
      instancia el lema con a = s′(y), b = s′(z), c = s′(x): después del
      zig-zag, y y z son los DOS hijos de x, así que sus subárboles son
      disjuntos y ambos caben dentro del de x (de hecho a + b + w_x = c).
      El lema da lg a + lg b ≤ 2 lg c − 2, es decir r′(y) + r′(z) ≤ 2r′(x) −
      2. Sustituyendo: ≤ 2 + 2r′(x) − 2 − 2r(x) = 2(r′(x) − r(x)) ≤ 3(r′(x) −
      r(x)). No puede usarse la elección de zig-zig (a = s′(z), b = s(x))
      porque ahí los dos disjuntos eran "el subárbol de z después" y "el de x
      antes", una configuración que sólo se da cuando x y z quedan en cascada
      del mismo lado; en zig-zag x y z quedan como padre e hijo directo, y el
      par disjunto natural son los dos hijos de x después.
  - level: 6
    statement: >-
      Dos preguntas sobre los límites del lema. (a) Demuestra que el término
      +1 es indispensable, exhibiendo un caso donde 3(r(t) − r(x)) vale 0
      pero el costo amortizado no puede ser 0; y explica de cuál de los tres
      pasos de la prueba sale ese +1 y por qué sobrevive a la suma
      telescópica en lugar de multiplicarse por el número de pasos. (b) El
      algoritmo move-to-root sube x un nivel a la vez (rota (x,p), luego
      (x,a), etc.) en lugar de rotar el abuelo primero. Identifica cuál de
      las afirmaciones de la prueba deja de valer para ese algoritmo, y por
      qué eso no es un detalle técnico sino la razón de fondo por la que
      move-to-root no consigue O(lg n) amortizado.
    hints:
      - >-
        Para (a): ¿cuándo vale exactamente r(t) = r(x)? Hay un único caso, y
        es el más trivial de todos.
      - >-
        Para (a), segunda parte: de los tres pasos (zig, zig-zig, zig-zag)
        sólo uno tiene un término aditivo sin descontar en su cota. Y
        pregúntate cuántas veces puede ocurrir ese paso dentro de un mismo
        Splay, y por qué.
      - >-
        Para (b): la prueba del zig-zig usa r′(x) = r(z), donde z era el
        ABUELO. Dibuja qué queda después de aplicar dos rotaciones de tipo
        move-to-root y pregúntate quién ocupa ahora la posición que tenía el
        abuelo.
      - >-
        Para (b), lo de fondo: la clave es qué le pasa a los nodos que
        quedaron colgando en el camino. El lema de los logaritmos cobra el −2
        sólo cuando dos subárboles disjuntos se reparten el de x; si uno de
        los dos queda casi tan grande como todo el subárbol, el descuento se
        evapora.
    solution: >-
      (a) Si x ya es la raíz, entonces t = x, r(t) − r(x) = 0 y 3(r(t) −
      r(x)) = 0. Pero ninguna implementación puede atender ese acceso en
      costo 0: hay que al menos mirar el nodo, así que el costo amortizado es
      ≥ 1 y la cota sin el +1 sería FALSA. El +1 viene del zig (#32): es el
      único de los tres pasos cuya cota es 3(r′(x) − r(x)) + 1 y no
      3(r′(x) − r(x)) a secas, porque su costo real (1 rotación) no queda
      absorbido por ΔΦ. Sobrevive a la telescópica sin multiplicarse porque
      el zig ocurre a lo más UNA vez en todo el Splay: sólo aplica cuando x
      es hijo directo de la raíz, y después de ejecutarlo x ya ES la raíz, así
      que no puede repetirse. (b) Deja de valer r′(x) = r(z) en la forma que
      la prueba necesita. Con move-to-root, tras rotar (x,p) y después (x,a),
      x sí termina donde estaba el abuelo, pero la forma intermedia es
      distinta: el subárbol que compartían p y a NO queda repartido entre los
      dos, sino que uno de ellos se queda con casi todo y queda casi tan
      profundo como estaba. En términos del lema de los logaritmos: la
      instanciación a = s′(z), b = s(x), c = s′(x) deja de tener dos
      conjuntos disjuntos comparables — uno de los dos es casi todo c — y el
      máximo del lema (que se alcanza cuando a = b = c/2, ver
      /structures/logarithm-lemma) ya no se acerca, así que el descuento de
      −2 por paso se pierde. Sin ese −2 en cada paso, la suma de los pasos ya
      no telescopa a 3(r(t) − r(x)) + 1, y en efecto existen secuencias donde
      move-to-root cuesta Ω(n) por operación en promedio. Esto no está en el
      mazo: el profesor sólo prueba el caso zig-zig, sin discutir qué falla
      en la alternativa.
---

Toda la página usa las definiciones de #22 con pesos `w_x = 1`: `s(x)` es
contar los nodos del subárbol de x (x incluido), `r(x) = lg s(x)` y
`Φ = Σ r(x)`. Una prima (`r′`) significa "después del paso". Los ejercicios
suben de "reconocer las definiciones" a "reproducir la parte de la prueba que
el profesor omitió"; el nivel 6 es el que de verdad pone a prueba si se
entendió por qué la prueba está armada así y no de otra forma.
