---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Tras ejecutar `Buscar(45)` sobre un splay tree, la raíz quedó siendo el
      nodo 40. Tras ejecutar `Buscar(55)` sobre el mismo árbol de partida, la
      raíz quedó siendo el nodo 60. En cada caso, ¿qué rama del `si` de
      `Separar` corre, y cuál de los dos subárboles de la raíz es el que se
      desprende? ¿En cuál de los dos casos la raíz termina dentro de `I`?
    hints:
      - "La condición del pseudocódigo es una sola: `r.valor ≤ k`. Evalúala con los números que te dan (40 contra 45, y 60 contra 55) antes de pensar en nada más."
      - "La rama que corre decide dos cosas a la vez: de qué lado queda r, y qué puntero de r se pone en NULO. Son siempre el puntero y el lado opuestos."
    solution: >-
      Caso `Buscar(45)`, r = 40: como 40 ≤ 45, corre la PRIMERA rama —
      `I ← r`, `D ← r.der`, `r.der ← NULO`. Se desprende el subárbol
      DERECHO, y la raíz 40 termina dentro de `I`. Caso `Buscar(55)`,
      r = 60: como 60 > 55, corre la SEGUNDA rama — `D ← r`, `I ← r.izq`,
      `r.izq ← NULO`. Se desprende el subárbol IZQUIERDO, y la raíz 60
      termina dentro de `D`. La raíz queda en `I` sólo en el primer caso.
  - level: 2
    statement: >-
      Traza `Eliminar(50)` a mano sobre el árbol `30(10(·,20), 50(40, 70))`.
      Da el árbol después de cada paso del pseudocódigo (#19) y el número
      total de llamadas a Splay. Cuidado con el paso de `Unir`: hay que
      decir cuál es `m` y cómo queda `A` después de splayarlo.
    hints:
      - "Primero `Buscar(50)`. 50 es hijo derecho de la raíz 30, así que Splay(50) es un único zig. Escribe el árbol resultante antes de seguir."
      - "Con 50 en la raíz, `A = r.izq` y `B = r.der`. En `Unir(A, B)`, m es el máximo de A: bájate por la espina derecha de A hasta que `v.der` sea nulo."
      - "Tras `Splay(m)` dentro de A, m queda en la raíz de A y su hijo derecho es nulo — ahí va B. No te olvides de contar esa llamada."
    solution: >-
      Paso 1, `Buscar(50)`: encontrado, 50 es hijo derecho de la raíz ⇒ un
      zig. **Llamada 1**. Árbol resultante `50(30(10(·,20), 40), 70)`.
      Paso 2, `r ← raiz` = 50, `A = 30(10(·,20), 40)`, `B = 70`. La
      precondición de Unir se cumple sola (todo A menor que 70).
      Paso 3, `Unir(A, B)`: se baja por la espina derecha de A — v = 30,
      `v.der` = 40 ≠ nulo ⇒ v = 40, `v.der` = nulo ⇒ **m = 40**.
      `Splay(40)` dentro de A (40 es hijo derecho de la raíz 30 ⇒ un zig):
      **llamada 2**. A queda `40(30(10(·,20), ·), ·)`.
      Paso 4, `v.der ← B` ⇒ resultado `40(30(10(·,20),·), 70)`.
      **Total: 2 llamadas a Splay**, el "doble" del #20. Inorden final
      10, 20, 30, 40, 70 — el original sin el 50.
  - level: 3
    statement: >-
      Implementa `join(Node* A, Node* B)` en C++ sobre la base de
      `step-1-base.cpp` (nodo con punteros a padre/izq/der, `rotate` y
      `splay`), siguiendo el pseudocódigo del #17. Verifica con `assert`
      tres cosas sobre un caso concreto — por ejemplo `A` con las llaves
      {5, 10, 15, 20} y `B` con {40, 50, 60} — que el inorden del resultado
      es la concatenación del inorden de `A` con el de `B`; que la raíz del
      resultado es el máximo de `A`; y que `join` gasta exactamente **una**
      llamada a Splay (instrumenta un contador global como el `splayCalls`
      de `step-1-base.cpp`). Añade dos `assert` más para `A = nullptr` y
      `B = nullptr`, comprobando que en esos casos gasta **cero**.
    hints:
      - "El bucle del pseudocódigo es literal: `while (v->right != nullptr) v = v->right;`. No hace falta recursión ni comparar valores — el máximo de un BST es el final de la espina derecha."
      - "`splay(A, v)` toma la raíz por referencia: pásale la variable local `A`, no la raíz global. Después de esa llamada, `A == v`."
      - "El pseudocódigo no modela el puntero al padre; tu implementación sí tiene que hacer `B->parent = v` después de `v->right = B`, o el próximo splay dentro de B se romperá."
      - "Para el assert del inorden, escribe un helper que vuelque el recorrido a un `std::vector<int>` y compara vectores. Para el conteo, resetea el contador a 0 justo antes de cada llamada a join."
    solution: >-
      `Node* join(Node* A, Node* B) { if (A == nullptr) return B; if (B ==
      nullptr) return A; Node* v = A; while (v->right != nullptr) v =
      v->right; splay(A, v); v->right = B; B->parent = v; return v; }` —
      exactamente `step-3-join.cpp`. Los asserts del caso concreto:
      `assert(inorder(U) == esperado)` con `esperado` = {5,10,15,20,40,50,60},
      `assert(U->value == 20)` (el máximo de A quedó en la raíz), y
      `assert(splayCalls == 1)` con el contador reseteado antes de la
      llamada. Los dos casos vacíos devuelven en las dos primeras líneas,
      antes de llegar a `splay`, así que `splayCalls` sigue en 0 — eso es
      lo que hace que `Eliminar` de una hoja cueste 1 y no 2. Está
      verificado en las secciones 2, 4 y 5 de `full-implementation.cpp`.
  - level: 4
    statement: >-
      El TDA del profesor tiene cinco operaciones. Adáptalo para soportar
      una sexta, `EliminarRango(a, b)`, que quita del árbol todas las llaves
      `x` con `a ≤ x ≤ b`, sin recorrer el árbol más de lo que ya recorren
      las operaciones existentes. Escribe el pseudocódigo en el mismo estilo
      del #15-19 y cuenta cuántas llamadas a Splay gasta. ¿Sigue valiendo la
      cota del #20 para esta operación nueva?
    hints:
      - "No inventes un recorrido nuevo. Sólo tienes Buscar, Separar y Unir — y Separar es lo que parte el árbol en dos por una llave."
      - "Con DOS cortes bien elegidos, el árbol queda en tres pedazos, y uno de ellos es exactamente el rango que quieres tirar. Piensa por qué llaves cortar."
      - "El primer corte tiene que dejar a la izquierda todo lo que es menor que a. Ojo: Separar corta por `≤ k`, no por `< k`, así que hay que elegir con cuidado la llave del primer corte."
      - "Cada Separar necesita su propio Buscar antes (es su precondición). Cuenta una llamada por cada Buscar y una por el Unir final."
    solution: >-
      Pseudocódigo. `Buscar(a−1)` y `(I, R) ← Separar(a−1)` — I tiene todo
      lo menor que `a`, R el resto. Después, sobre R como raíz,
      `Buscar(b)` y `(M, D) ← Separar(b)` — M tiene exactamente el rango
      `[a, b]` y D todo lo mayor que `b`. Se descarta M y
      `raiz ← Unir(I, D)`, cuya precondición se cumple porque todo I es
      menor que `a` y todo D es mayor que `b`. Conteo: 2 llamadas de los dos
      Buscar, 0 de los dos Separar, 1 del Unir = **3 llamadas a Splay**,
      contra el máximo de 2 de las operaciones originales. La cota del #20
      tal como está escrita ("a lo más el doble de un Splay") NO cubre esta
      operación — habría que decir "a lo más el triple". Lo que sí se
      hereda sin cambios es la forma del argumento: como el número de
      llamadas sigue siendo una constante independiente de n, cualquier
      cota sobre Splay se traslada a EliminarRango con una constante fija.
      Nota: si las llaves no son enteras, `a−1` no sirve; el pseudocódigo
      del profesor corta por `≤ k` y el rango abierto/cerrado hay que
      manejarlo con cuidado.
  - level: 5
    statement: >-
      Diseña una implementación alternativa de `Unir(A, B)` que NO llame a
      Splay: en vez de splayar el máximo de A, desengancha `m` de donde
      está, lo pone como nueva raíz con `A` a la izquierda y `B` a la
      derecha. Escribe el pseudocódigo, argumenta que el resultado sigue
      siendo un BST válido, y después explica qué se pierde. ¿Por qué el
      profesor elige la versión con Splay si ésta también es correcta?
    hints:
      - "Empieza por convencerte de que la versión sin Splay es CORRECTA: m es el máximo de A, así que colgar A−{m} a su izquierda y B a su derecha respeta el orden del BST. Escribe el pseudocódigo antes de buscar el problema."
      - "Piensa qué le pasa a la PROFUNDIDAD de los nodos del camino que acabas de recorrer (la espina derecha de A) bajo cada versión. Bajo una de las dos, ese camino queda igual de profundo que antes."
      - "Ahora imagina repetir la operación muchas veces sobre un A que es una cadena hacia la derecha. ¿Cuánto cuesta el descenso hasta m la segunda vez? ¿Y la décima?"
      - "El argumento del #20 no es sobre el costo de una llamada: es sobre poder HEREDAR una cota ya probada. ¿De qué sirve una operación barata si su cota hay que demostrarla otra vez desde cero?"
    solution: >-
      Pseudocódigo sin Splay. `si A = NULO devolver B; si B = NULO devolver
      A; v ← A; mientras v.der ≠ NULO hacer (u ← v; v ← v.der); u.der ← v.izq;
      v.izq ← A; v.der ← B; devolver v`. Es correcto: v = m es el máximo de
      A, así que todo lo que queda en A tras desengancharlo es menor que m
      (va a la izquierda) y todo B es mayor (va a la derecha) — el
      invariante del BST se respeta. Lo que se pierde es doble. **(1)** La
      espina derecha de A queda tan profunda como estaba: el descenso hasta
      el máximo cuesta lo mismo la próxima vez, y la siguiente, así que una
      secuencia de m operaciones `Unir` sobre un A degenerado cuesta
      Θ(n·m) real, mientras que con Splay la primera llamada aplana el
      camino y las siguientes salen baratas. **(2)** Más importante: se
      rompe el argumento del #20. La tesis del profesor no es "Unir es
      barato", es "cada operación cuesta a lo más el doble de un Splay, así
      que todo lo que probemos sobre Splay se hereda automáticamente a las
      cinco". Una operación que no pasa por Splay no hereda nada: habría
      que demostrarle su propia cota amortizada aparte, que es exactamente
      el trabajo que el diseño busca evitar. Elegir Splay no es elegir el
      código más corto, es elegir el que necesita una sola demostración —
      la del [Lema de Acceso](/structures/access-lemma).
  - level: 6
    statement: >-
      Toda la corrección de `Unir` descansa en un hecho que el material da
      por sentado sin enunciarlo — el comentario del #17 sólo dice que tras
      `Splay(v)`, `v` es `m` y es la raíz de `A`, nada sobre su hijo
      derecho. El hecho es que tras `Splay(m)`, con `m` el máximo de `A`,
      el nodo `m` queda en la raíz de `A` **y sin hijo derecho** (si no,
      `v.der ← B` pisaría un subárbol entero). Demuéstralo. Es decir,
      demuestra que si un nodo no tiene hijo derecho antes de `Splay`,
      tampoco lo tiene después. Úsalo para probar que `Unir` devuelve
      siempre un BST válido cuando su precondición se cumple.
    hints:
      - "No razones sobre Splay entero de una vez. Splay es una secuencia de zig / zig-zig / zig-zag, y cada uno es una o dos llamadas a `rotate`. Si el hecho vale para una rotación, vale para la secuencia por inducción."
      - "Mira qué le hace `rotate(x)` al hijo derecho de x, cuando x sube. Hay dos casos según de qué lado de su padre cuelga x — trátalos por separado."
      - "El caso peligroso es el de x colgando a la izquierda de su padre p: ahí x se queda con p como nuevo hijo derecho. ¿Puede ocurrir ese caso si x es el máximo del árbol?"
      - "Si x es el máximo, ¿puede x ser hijo izquierdo de alguien? ¿Qué diría eso del valor de su padre?"
    solution: >-
      **Lema**. Sea `m` el máximo de `A` y `p` su padre en algún momento del
      Splay. Como `m` es el máximo, `m` no puede ser hijo izquierdo de `p`
      — si lo fuera, `p.valor > m.valor` y `m` no sería el máximo. Luego
      `m` es siempre hijo DERECHO de su padre, en todo momento del Splay.
      Ahora se mira `rotate(m)` en ese caso: la rotación hace
      `p.der ← m.izq` y `m.izq ← p`. Es decir, la rotación toca `m.izq`, no
      `m.der` — el hijo derecho de `m` no se modifica. Como `m.der` era
      `NULO` antes de la rotación (m es el máximo, no tiene nada mayor
      colgando), sigue siendo `NULO` después. **Inducción**: cada paso de
      Splay sobre `m` (zig, zig-zig o zig-zag) es una o dos llamadas a
      `rotate`, y en zig-zig la primera es sobre `p` — que tampoco toca
      `m.der`, porque `m` cuelga de `p` y una rotación de `p` con su abuelo
      reengancha `p` entero, hijos incluidos. Ninguna llamada de la
      secuencia asigna `m.der`, así que al terminar el Splay `m` está en la
      raíz con `m.der = NULO`. **Corolario (corrección de Unir)**: asignar
      `m.der ← B` no pisa ningún subárbol (el hueco estaba vacío), y el
      resultado es un BST porque todo lo que cuelga a la izquierda de `m`
      es lo que quedaba de `A` (menor que `m`, que es su máximo) y todo `B`
      es mayor que `m` por la precondición del #17. Nota: el zig-zag nunca
      ocurre sobre `m`, precisamente porque `m` es siempre hijo derecho —
      el Splay del máximo son puros zig-zig y a lo sumo un zig final.
---

Los niveles 1-2 son de lectura del pseudocódigo del profesor (#15, #19) y de
conteo de llamadas a Splay (#20) sobre árboles concretos; ninguno de esos
árboles viene del mazo, se derivan. El nivel 4 extiende el TDA con una
operación que el profesor no da, marcada como extensión. Los niveles 5 y 6
son el corazón del tema: el 5 pregunta por qué el diseño pasa por Splay
aunque haya alternativas correctas, y el 6 demuestra el único hecho del que
depende la corrección de `Unir` y que el material enuncia sin probar.
