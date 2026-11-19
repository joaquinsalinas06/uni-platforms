---
title: "Preparación del examen final"
summary: "Lista de ejercicios (32, no evaluada) y simulacro de examen final (6 problemas), resueltos paso a paso: optimalidad dinámica, jerarquía de memoria, enteros, árboles estáticos, strings y grafos dinámicos."
items:
  # ───────────────────────── Lista · Optimalidad dinámica ─────────────────────────
  - level: 2
    etiqueta: "Lista · Optimalidad dinámica · 1 Greedy"
    href: "/structures/greedy-algorithm"
    statement: >-
      (L1) En la fila $t$, Greedy agrega el punto $(x_t, t)$ y, para cada llave $y \ne x_t$ que ya haya aparecido, el punto $(y, t)$ si el rectángulo de esquinas $(x_t, t)$ y $(y, t')$, con $t'$ la última fila en que apareció $y$, no contiene ningún otro punto (el borde cuenta). El costo es el número total de puntos.
      (a) Ejecuta Greedy sobre los accesos $3, 1, 4, 2, 5, 3$ (llaves 1 a 5): da los puntos de cada fila y el costo. (b) ¿Por qué el conjunto resultante es arboralmente satisfecho?
    hints:
      - >-
        Lleva una tabla $\mathrm{ult}(y)$ con la última fila de cada llave. En la fila $t$ sólo hay que mirar las llaves con $\mathrm{ult}$ definido.
      - >-
        Un rectángulo hacia una llave lejana casi siempre contiene el punto de una llave intermedia: sólo sobreviven las llaves de la "escalera" vista desde $x_t$.
    solution: |-
      **(a)** Fila por fila (entre paréntesis, la última fila de cada llave antes de procesar la fila):

      - $t=1$, acceso 3: no hay llaves previas. Fila $\{3\}$.
      - $t=2$, acceso 1: el rectángulo $(1,2)$–$(3,1)$ está vacío, se agrega $(3,2)$. Fila $\{1, 3\}$.
      - $t=3$, acceso 4: hacia $(3,2)$ el rectángulo está vacío, se agrega $(3,3)$; hacia $(1,2)$ el rectángulo $[1,4]\times[2,3]$ contiene $(3,2)$, no se agrega. Fila $\{3, 4\}$.
      - $t=4$, acceso 2: hacia $(1,2)$ vacío, se agrega; hacia $(3,3)$ vacío, se agrega; hacia $(4,3)$ contiene $(3,3)$, no. Fila $\{1, 2, 3\}$.
      - $t=5$, acceso 5: hacia $(4,3)$ vacío, se agrega; hacia $(3,4)$ vacío, se agrega; hacia $(2,4)$ y $(1,4)$ contienen $(3,4)$, no. Fila $\{3, 4, 5\}$.
      - $t=6$, acceso 3: todo rectángulo hacia otra llave contiene un punto de la fila 5 o de la 4 en su borde: no se agrega nada. Fila $\{3\}$.

      Costo: $1 + 2 + 2 + 3 + 3 + 1 = 12$ puntos (6 accesos y 6 toques añadidos).

      **(b)** Por inducción sobre las filas. Antes de la fila $t$ el conjunto es satisfecho. Los únicos rectángulos nuevos tienen una esquina en la fila $t$. Si la otra esquina es $(y, t')$ con $t'$ la última fila de $y$ y el rectángulo con $(x_t,t)$ estaba vacío, Greedy agregó $(y,t)$, que está en su borde. Si no estaba vacío, ya contenía otro punto. Un rectángulo entre $(y,t)$ y un punto anterior contiene a $(y,\mathrm{ult}(y))$ o a un punto de la escalera. Por eso cada rectángulo con dos esquinas no alineadas tiene un tercer punto: el conjunto es arboralmente satisfecho. (Se comprobó con un script que verifica todos los pares de puntos.)
  - level: 2
    etiqueta: "Lista · Optimalidad dinámica · 2 Greedy secuencial"
    href: "/structures/greedy-algorithm"
    statement: >-
      (L2) Ejecuta Greedy (con la definición del ejercicio anterior) sobre los accesos $1, 2, 3, \dots, 8$. (a) Da los puntos de cada fila y el costo total. (b) Generaliza el costo a $n$ accesos secuenciales y compáralo con $\lg n$ por acceso de un BST balanceado estático.
    hints:
      - >-
        En la fila $t$ la llave $t$ es nueva. ¿Cuál de las anteriores tiene su rectángulo vacío?
      - >-
        La llave $t-1$ está en la fila anterior y bloquea a todas las demás.
    solution: |-
      **(a)** Fila 1: $\{1\}$. En la fila $t \ge 2$ se accede a $t$; la llave $t-1$ apareció en la fila $t-1$ y su rectángulo con $(t,t)$ es vacío, así que se agrega $(t-1,t)$. Cualquier llave $y < t-1$ tiene su última aparición en una fila $\le t-1$ y el rectángulo hasta ella contiene $(t-1, t-1)$. Filas: $\{1\}, \{1,2\}, \{2,3\}, \{3,4\}, \dots, \{7,8\}$.

      Costo: $1 + 7 \cdot 2 = 15$ puntos.

      **(b)** Con $n$ accesos secuenciales el costo es $2n - 1 = O(n)$, es decir $O(1)$ por acceso. Un BST balanceado estático paga $\Theta(\lg n)$ por acceso (casi todas las llaves están a profundidad $\approx \lg n$), $\Theta(n \lg n)$ en total. Greedy cumple la propiedad de acceso secuencial, como el splay tree.
  - level: 2
    etiqueta: "Lista · Optimalidad dinámica · 3 Wilber-1"
    href: "/structures/wilber-1-bound"
    statement: >-
      (L3) Sea $P$ el BST perfecto de llaves $1,\dots,7$ (raíz 4, hijos 2 y 6, hojas 1, 3, 5, 7). Para un nodo $y$ de $P$, mira la sucesión de accesos que caen en el subárbol de $y$, ignorando los accesos a $y$ mismo: cada acceso es una L (subárbol izquierdo) o una R (derecho). $W_1(y)$ es el número de veces que la sucesión alterna entre L y R, y $W_1 = \sum_y W_1(y)$.
      (a) Calcula $W_1(y)$ para cada $y$ y $W_1$ con los accesos $X = 1, 5, 3, 7, 2, 6, 4$. (b) Calcula $W_1$ para $X = 1, 2, \dots, 7$. (c) Para $n = 2^k - 1$ la permutación bit-reversal da $W_1 = \Theta(n \lg n)$. Usando $\mathrm{OPT} \ge W_1/2 - n$, ¿qué concluyes sobre el costo de cualquier BST en esa secuencia?
    hints:
      - >-
        Las hojas no tienen subárbol izquierdo ni derecho: aportan 0. Sólo hay que mirar 4, 2 y 6.
      - >-
        Para el nodo 2 sólo cuentan los accesos a 1 y a 3; para el 6, a 5 y a 7.
    solution: |-
      **(a)** Con $X = 1,5,3,7,2,6,4$:

      - Nodo 4: los accesos 1, 5, 3, 7, 2, 6 dan L R L R L R (el 4 se ignora): 5 alternancias.
      - Nodo 2: accesos 1, 3 dan L R: 1 alternancia.
      - Nodo 6: accesos 5, 7 dan L R: 1 alternancia.
      - Hojas: 0.

      $W_1 = 5 + 1 + 1 = 7$.

      **(b)** Con $X = 1,\dots,7$: nodo 4 ve L L L R R R (1 alternancia), nodo 2 ve L R (1), nodo 6 ve L R (1). $W_1 = 3$.

      **(c)** Si $W_1 = \Theta(n \lg n)$, entonces $\mathrm{OPT} \ge W_1/2 - n = \Theta(n \lg n)$: **cualquier** BST, incluso uno que conozca la secuencia de antemano, paga $\Omega(\lg n)$ por acceso. En esa secuencia un BST balanceado estático ya es óptimo salvo constante.
  - level: 3
    etiqueta: "Lista · Optimalidad dinámica · 4 Tango Trees"
    href: "/structures/tango-tree"
    statement: >-
      (L4) El árbol de referencia es un BST perfecto con $n = 2^{20} - 1$ llaves. (a) ¿Cuántos niveles tiene y cuántos nodos tiene, a lo más, un árbol auxiliar (un camino preferido)? (b) ¿Cuántas comparaciones aproximadas cuesta buscar en un árbol auxiliar? (c) Si una secuencia de accesos produce $k$ cambios de hijo preferido, ¿cuál es el costo de Tango frente a $\mathrm{OPT} \ge k/2 - n$ y cuál es el factor de competitividad aproximado para este $n$? Compáralo con $\lg n$.
    hints:
      - >-
        Un camino preferido baja de un nodo hacia una hoja: tiene a lo más tantos nodos como niveles.
      - >-
        Un árbol auxiliar es un BST balanceado de a lo más 20 nodos.
    solution: |-
      **(a)** Un BST perfecto con $2^{20}-1$ llaves tiene **20 niveles** (profundidades 0 a 19). Un camino preferido es descendente, así que tiene a lo más **20 nodos**.

      **(b)** Buscar en un BST balanceado de 20 nodos cuesta $\approx \lg 20 \approx 4.3$ comparaciones, es decir $O(\lg \lg n)$.

      **(c)** Cada cambio de hijo preferido es un cruce entre árboles auxiliares y cuesta $O(\lg\lg n)$ (búsqueda más cortes y uniones en árboles de $O(\lg n)$ nodos). Con $m$ accesos el costo es $O((k + m)\lg\lg n)$. Como $\mathrm{OPT} \ge k/2 - n$ y $\mathrm{OPT} \ge m$, el cociente es $O(\lg \lg n)$: aquí $\lg\lg n = \lg 20 \approx 4.3$, frente a $\lg n = 20$ de la cota trivial de un BST balanceado.
  - level: 1
    etiqueta: "Lista · Optimalidad dinámica · 5 Verdadero o falso"
    href: "/structures/dynamic-optimality"
    statement: >-
      (L5) Verdadero o falso (conjetura de optimalidad dinámica). Justifica en una línea cada una. (a) Se ha demostrado que los splay trees son $O(1)$-competitivos. (b) Los Tango Trees son $O(\lg \lg n)$-competitivos. (c) Greedy es $O(1)$-competitivo (demostrado). (d) Un BST balanceado estático es $O(\lg n)$-competitivo. (e) Existen secuencias de $m \ge n$ accesos en las que todo BST paga $\Omega(m \lg n)$.
    hints:
      - >-
        Separa lo demostrado de lo conjeturado: la conjetura de optimalidad dinámica sigue abierta.
      - >-
        Para (d): cualquier BST paga al menos 1 por acceso. Para (e): piensa en la bit-reversal y Wilber-1.
    solution: |-
      - **(a) Falso.** Es justamente la conjetura de optimalidad dinámica; lo demostrado es $O(\lg n)$-competitivo (por su costo amortizado $O(\lg n)$).
      - **(b) Verdadero.** Es el resultado de Tango: costo $O((\mathrm{OPT} + n)\lg\lg n)$ apoyado en Wilber-1.
      - **(c) Falso.** Que Greedy sea $O(1)$-competitivo también es una conjetura, no un teorema.
      - **(d) Verdadero.** Paga $O(\lg n)$ por acceso y cualquier BST paga al menos 1 por acceso, así que el cociente es $O(\lg n)$.
      - **(e) Verdadero.** La permutación bit-reversal (repetida) tiene $W_1 = \Theta(m \lg n)$, y Wilber-1 es cota inferior para todo BST.
  # ───────────────────────── Lista · Jerarquía de memoria ─────────────────────────
  - level: 2
    etiqueta: "Lista · Jerarquía de memoria · 6 Modelo de memoria externa"
    href: "/structures/external-memory-model"
    statement: >-
      (L6) Se tienen $N = 2^{32}$ claves y bloques de $B = 2^8$ claves. (a) ¿Cuántas transferencias cuesta recorrer todas las claves? (b) Un BST balanceado cuyos nodos están en bloques distintos, ¿cuántas transferencias cuesta una búsqueda? (c) ¿Y en un B-Tree con $B$ claves por nodo? Da el orden y el valor aproximado.
    hints:
      - >-
        Un recorrido lee cada bloque una vez.
      - >-
        En el BST cada nodo visitado es una transferencia; en el B-Tree cada nivel lo es.
    solution: |-
      **(a)** $N/B = 2^{32}/2^8 = 2^{24} \approx 1.7 \cdot 10^7$ transferencias, es decir $\Theta(N/B)$.

      **(b)** La búsqueda visita $\approx \lg N = 32$ nodos, uno por bloque: $\Theta(\lg N) = 32$ transferencias.

      **(c)** El B-Tree tiene altura $\Theta(\log_B N) = \lg N / \lg B = 32/8 = 4$: unas **4** transferencias. Mejora el BST en un factor $\lg B = 8$.
  - level: 2
    etiqueta: "Lista · Jerarquía de memoria · 7 Layout vEB"
    href: "/structures/cache-oblivious-veb-layout"
    statement: >-
      (L7) Un BST perfecto con llaves $1,\dots,15$ se guarda en memoria con bloques de $B = 3$ nodos. Escribe el arreglo del layout vEB (la parte superior de altura 2 seguida de las 4 partes inferiores) y el del layout por niveles (BFS). Para buscar la llave 5, ¿cuántos bloques se leen con cada uno?
    hints:
      - >-
        La parte superior son 8, 4 y 12. Cada parte inferior es un árbol de 3 nodos: raíz y sus dos hijos.
      - >-
        La búsqueda de 5 visita 8, 4, 6, 5. Marca en qué bloque cae cada uno.
    solution: |-
      El árbol tiene raíz 8; nivel 1: 4, 12; nivel 2: 2, 6, 10, 14; hojas: 1, 3, 5, 7, 9, 11, 13, 15.

      **Layout vEB:** parte superior (8, 4, 12) y después las cuatro partes inferiores, cada una en el mismo layout (raíz y luego hijos):

      `8 4 12 | 2 1 3 | 6 5 7 | 10 9 11 | 14 13 15`

      Con $B = 3$ cada pieza es exactamente un bloque. La búsqueda de 5 recorre 8, 4 (bloque 0) y 6, 5 (bloque 2): **2 bloques**.

      **Layout BFS:** `8 4 12 | 2 6 10 | 14 1 3 | 5 7 9 | 11 13 15`

      La búsqueda de 5 recorre 8, 4 (bloque 0), 6 (bloque 1) y 5 (bloque 3): **3 bloques**. En BFS los niveles profundos quedan lejos entre sí, y cada nivel por debajo de $\lg B$ cuesta un bloque nuevo.
  - level: 2
    etiqueta: "Lista · Jerarquía de memoria · 8 Mergesort externo"
    href: "/structures/external-merge-sort"
    statement: >-
      (L8) Se ordenan $N = 2^{28}$ claves con memoria $M = 2^{20}$ y bloques $B = 2^8$. (a) Se forman runs ordenados del tamaño de la memoria: ¿cuántos runs hay y cuántas transferencias cuesta formarlos (leer y escribir todo)? (b) Se mezclan con un merge de $k$ vías, $k \approx M/B$: ¿cuántas pasadas hacen falta y cuántas transferencias en total? (c) ¿Y si se mezclara de 2 en 2? Compara.
    hints:
      - >-
        Una pasada completa (leer y escribir todo) cuesta $2N/B$.
      - >-
        Con $k$ vías, el número de pasadas de mezcla es $\lceil \log_k (\text{runs}) \rceil$.
    solution: |-
      **(a)** Runs: $N/M = 2^{28}/2^{20} = 2^8 = 256$. Formarlos lee y escribe todo una vez: $2N/B = 2 \cdot 2^{20} = 2^{21} \approx 2.1 \cdot 10^6$ transferencias.

      **(b)** $k \approx M/B = 2^{12} = 4096 \ge 256$: basta **una** pasada de mezcla, que cuesta otras $2N/B = 2^{21}$. Total: $2^{22} \approx 4.2 \cdot 10^6$ transferencias, es decir $\Theta\!\left(\frac{N}{B}\log_{M/B}\frac{N}{B}\right)$ con un logaritmo que aquí vale casi 1.

      **(c)** Con 2 vías hacen falta $\lg 256 = 8$ pasadas de mezcla: total $2N/B \cdot (1 + 8) = 9 \cdot 2^{21} \approx 1.9 \cdot 10^7$. Es $4.5$ veces más que con $k = M/B$ vías.
  - level: 2
    etiqueta: "Lista · Jerarquía de memoria · 9 BFS, vEB y B-Tree"
    href: "/structures/cache-oblivious-veb-layout"
    statement: >-
      (L9) Un BST perfecto con $N = 2^{20} - 1$ llaves se guarda con bloques de $B = 2^4$ nodos. (a) ¿Cuántas transferencias aproximadas cuesta una búsqueda con el layout por niveles (BFS)? (b) ¿Y con el layout vEB? Da el orden y el valor aproximado. (c) ¿Por qué el layout vEB logra eso sin que el algoritmo conozca $B$?
    hints:
      - >-
        En BFS los primeros $\lg B$ niveles caben juntos; de ahí para abajo cada nivel está en otro bloque.
      - >-
        En vEB mira la escala de la recursión en que las piezas tienen entre $\sqrt B$ y $B$ nodos.
    solution: |-
      **(a)** Los primeros $\approx \lg B = 4$ niveles comparten bloques; cada uno de los $\lg N - \lg B$ niveles restantes es una transferencia: $\approx 20 - 4 = 16$, es decir $\Theta(\lg N - \lg B)$.

      **(b)** $O(\log_B N)$: $\log_B N = 20/4 = 5$ piezas, y la cota de clase es $\le 4\log_B N = 20$ transferencias (cada pieza ocupa a lo más 2 bloques y hay a lo más $2\log_B N$ piezas en el camino).

      **(c)** El layout se define recursivamente partiendo la altura a la mitad, sin mencionar $B$. Para el análisis basta que **exista** una escala de la recursión donde las piezas tienen altura entre $\tfrac12\lg B$ y $\lg B$: cada pieza cabe en $\le 2$ bloques y el camino cruza $\le 2\log_B N$ piezas. Esa escala existe para todo $B$, así que la cota vale simultáneamente para todos los niveles de la jerarquía.
  - level: 2
    etiqueta: "Lista · Jerarquía de memoria · 10 B-Tree frente a BST"
    href: "/structures/b-tree"
    statement: >-
      (L10) Se guardan $N = 10^9$ llaves en un B-Tree con $B = 1000$ llaves por nodo (un nodo = un bloque). (a) ¿Cuántas transferencias cuesta una búsqueda, y cuántas un BST balanceado con un nodo por bloque? (b) Se piden las $K = 10^5$ llaves consecutivas desde una dada: ¿cuántas transferencias aproximadas hacen falta? Da la forma $O(\cdot)$ y el valor.
    hints:
      - >-
        $\log_{1000} 10^9 = 3$.
      - >-
        Después de bajar a la primera llave, las siguientes están en hojas consecutivas con $B$ llaves cada una.
    solution: |-
      **(a)** B-Tree: altura $\log_B N = \log_{1000} 10^9 = 3$ transferencias. BST: $\lg 10^9 \approx 30$ transferencias, diez veces más.

      **(b)** $O(\log_B N + K/B)$: 3 transferencias para llegar a la primera llave y $K/B = 10^5/10^3 = 100$ hojas consecutivas, unas **103** transferencias. Un BST pagaría del orden de $K$ transferencias, una por nodo visitado.
  # ───────────────────────── Lista · Estructuras para enteros ─────────────────────────
  - level: 2
    etiqueta: "Lista · Estructuras para enteros · 11 vEB: Sucesor"
    href: "/structures/van-emde-boas-tree"
    statement: >-
      (L11) Sea $u = 16$ y $S = \{0, 3, 5, 8, 12, 15\}$ en un árbol de van Emde Boas. (a) Escribe el contenido de cada cluster y del resumen. (b) Ejecuta Sucesor(6) indicando qué llamadas se hacen. (c) ¿Por qué solo se hace una llamada recursiva costosa?
    hints:
      - >-
        Con $u = 16$, $\sqrt u = 4$: la llave $x$ es $\langle \lfloor x/4\rfloor, x \bmod 4\rangle$. Recuerda que el mínimo no se guarda en ningún cluster.
      - >-
        $6 = \langle 1, 2\rangle$. Compara 2 con el máximo del cluster 1.
    solution: |-
      **(a)** $V.\min = 0$ (fuera de los clusters), $V.\max = 15$. El resto, por cluster (sufijos locales):

      - cluster 0: $\{3\}$ (la llave 3)
      - cluster 1: $\{1\}$ (la llave 5)
      - cluster 2: $\{0\}$ (la llave 8)
      - cluster 3: $\{0, 3\}$ (las llaves 12 y 15)
      - resumen: $\{0, 1, 2, 3\}$

      **(b)** Sucesor(6): $6 \ge V.\min$ y $6 < V.\max$, no hay atajo. $6 = \langle 1, 2\rangle$. El máximo del cluster 1 es 1 y $2 < 1$ es falso: el sucesor no está en el cluster 1. Se llama **Sucesor(1) en el resumen**, que devuelve el cluster 2. La respuesta es $\langle 2, \text{cluster}[2].\min\rangle = \langle 2, 0\rangle = 8$ (el mínimo se lee en $O(1)$).

      **(c)** Gracias al máximo de cada cluster se decide en $O(1)$ cuál de las dos ramas basta: o se recurre en el cluster, o en el resumen (y después se lee un mínimo en $O(1)$). Nunca ambas: $T(u) = T(\sqrt u) + O(1) = O(\lg \lg u)$.
  - level: 2
    etiqueta: "Lista · Estructuras para enteros · 12 vEB: Predecesor"
    href: "/structures/van-emde-boas-tree"
    statement: >-
      (L12) Con el mismo árbol del ejercicio anterior ($u = 16$, $S = \{0, 3, 5, 8, 12, 15\}$) ejecuta Predecesor(10), Predecesor(4), Predecesor(2) y Predecesor(0). En cada caso indica si la respuesta se encuentra dentro del cluster o hay que consultar el resumen.
    hints:
      - >-
        Simétrico al sucesor: compara el sufijo con el **mínimo** del cluster.
      - >-
        Si el resumen no tiene cluster anterior, la respuesta puede ser $V.\min$, que no vive en ningún cluster.
    solution: |-
      - **Predecesor(10)**, $10 = \langle 2, 2\rangle$: el mínimo del cluster 2 es 0 y $2 > 0$: **dentro del cluster**. El predecesor local de 2 es 0: respuesta $\langle 2,0\rangle = 8$.
      - **Predecesor(4)**, $4 = \langle 1, 0\rangle$: el mínimo del cluster 1 es 1 y $0 > 1$ es falso: **resumen**. Predecesor(1) en el resumen da el cluster 0, cuyo máximo es 3: respuesta $\langle 0,3\rangle = 3$.
      - **Predecesor(2)**, $2 = \langle 0, 2\rangle$: el mínimo del cluster 0 es 3, $2 > 3$ falso: **resumen**. No hay cluster anterior a 0, así que la respuesta es $V.\min = 0$ (y $0 < 2$).
      - **Predecesor(0)**: $0 \le V.\min$, así que no hay predecesor (nulo), sin consultar ni cluster ni resumen.
  - level: 2
    etiqueta: "Lista · Estructuras para enteros · 13 X-fast tries"
    href: "/structures/x-fast-trie"
    statement: >-
      (L13) Las llaves son de $w = 4$ bits y $S = \{1, 5, 6, 12\}$. (a) Escribe, por nivel, los prefijos que guarda la tabla hash y cuántas entradas tiene en total (incluida la raíz). (b) Ejecuta Sucesor(8): indica los prefijos que se consultan en la búsqueda binaria sobre los niveles y cómo se usa el puntero a descendiente. (c) Ejecuta Sucesor(7) y Predecesor(7).
    hints:
      - >-
        En binario: $1 = 0001$, $5 = 0101$, $6 = 0110$, $12 = 1100$.
      - >-
        La búsqueda binaria encuentra el prefijo más largo de la consulta que está en la tabla. Si a ese nodo le falta un hijo, su puntero a descendiente apunta al mínimo del subárbol derecho o al máximo del izquierdo.
    solution: |-
      **(a)** Prefijos por nivel:

      - nivel 0: $\varepsilon$ (raíz)
      - nivel 1: 0, 1
      - nivel 2: 00, 01, 11
      - nivel 3: 000, 010, 011, 110
      - nivel 4: 0001, 0101, 0110, 1100

      Total: $1 + 2 + 3 + 4 + 4 = 14$ entradas.

      **(b)** $8 = 1000$. Búsqueda binaria sobre los niveles $0..4$: se prueba el nivel 2, prefijo `10`: no está. Se prueba el nivel 1, prefijo `1`: está. El prefijo más largo es `1`. El siguiente bit de 8 es 0, y el nodo `1` no tiene hijo `10`: le falta el hijo izquierdo, así que su puntero a descendiente apunta al **mínimo de su subárbol derecho**, la hoja 1100. Sucesor(8) = 12.

      **(c)** $7 = 0111$. Nivel 2, `01`: está; nivel 3, `011`: está; nivel 4, `0111`: no está. Prefijo más largo: `011`. El siguiente bit es 1 y falta el hijo derecho: el puntero a descendiente apunta al **máximo del subárbol izquierdo**, la hoja 0110 = 6. Eso es Predecesor(7) = 6. El sucesor es el siguiente en la lista enlazada de hojas: Sucesor(7) = 12.
  - level: 3
    etiqueta: "Lista · Estructuras para enteros · 14 Y-fast tries"
    href: "/structures/y-fast-trie"
    statement: >-
      (L14) Un Y-fast trie guarda $n = 2^{16}$ llaves de $w = 32$ bits en grupos de entre $w/2$ y $2w$ llaves. (a) ¿Entre qué valores está el número de grupos? (b) ¿Cuántas entradas de hash tiene, a lo más, el X-fast trie de representantes, y cuántas tendría un X-fast trie con todas las llaves? (c) Da el costo aproximado de Sucesor.
    hints:
      - >-
        Muchos grupos si son chicos ($w/2$ llaves), pocos si son grandes ($2w$).
      - >-
        Un X-fast trie guarda $w + 1$ prefijos por llave, a lo más.
    solution: |-
      **(a)** Entre $n/(2w) = 2^{16}/64 = 1024$ y $n/(w/2) = 2^{16}/16 = 4096$ grupos.

      **(b)** Con a lo más 4096 representantes, el X-fast trie tiene a lo más $4096 \cdot (w+1) = 4096 \cdot 33 \approx 1.35 \cdot 10^5$ entradas ($\approx 2^{17}$). Con todas las llaves serían hasta $2^{16} \cdot 33 \approx 2.2 \cdot 10^6$: el espacio baja de $O(nw)$ a $O(n)$.

      **(c)** Sucesor: búsqueda binaria en el X-fast trie, $\lg w = 5$ consultas de hash, más una búsqueda en el BST balanceado de un grupo de a lo más $2w = 64$ llaves, $\lg 64 = 6$ pasos. En total $\approx 11$ pasos, $O(\lg w)$.
  - level: 2
    etiqueta: "Lista · Estructuras para enteros · 15 Fusion trees"
    href: "/structures/fusion-tree"
    statement: >-
      (L15) Las llaves de 6 bits son $9, 13, 26, 42$. (a) Escribe sus representaciones binarias y dibuja el trie. (b) ¿Qué bits distinguen a las llaves (los de ramificación)? (c) Calcula el sketch perfecto de cada llave con esos bits y verifica que conserva el orden.
    hints:
      - >-
        $9 = 001001$, $13 = 001101$, $26 = 011010$, $42 = 101010$.
      - >-
        Entre llaves consecutivas, el bit de ramificación es el más significativo en que difieren.
    solution: |-
      **(a)** $9 = 001001$, $13 = 001101$, $26 = 011010$, $42 = 101010$ (bits numerados de 5, el más significativo, a 0). En el trie la raíz ramifica por el bit 5 (42 a la derecha), el nodo $0$ ramifica por el bit 4 (26 a la derecha) y el nodo $001$ ramifica por el bit 2 (13 a la derecha, 9 a la izquierda). Entre esos puntos el trie es un camino sin bifurcaciones.

      **(b)** Bits de ramificación: $9 \oplus 13 = 000100$ (bit 2), $13 \oplus 26 = 010111$ (bit 4), $26 \oplus 42 = 110000$ (bit 5). Los bits son $\{2, 4, 5\}$.

      **(c)** Sketch = bits 5, 4, 2 en ese orden: $9 \to 000$, $13 \to 001$, $26 \to 010$, $42 \to 100$. Los sketches $0 < 1 < 2 < 4$ están en el mismo orden que las llaves: se conserva el orden.
  # ───────────────────────── Lista · Static Trees ─────────────────────────
  - level: 2
    etiqueta: "Lista · Static Trees · 16 Árbol cartesiano"
    href: "/structures/cartesian-tree"
    statement: >-
      (L16) Construye el árbol cartesiano (con el mínimo en la raíz) de $A = [4, 2, 7, 1, 5, 3, 6]$ (posiciones 1 a 7). Usa el árbol para responder $\mathrm{RMQ}(3, 5)$ y $\mathrm{RMQ}(5, 7)$: indica el nodo que es el LCA y el valor del mínimo.
    hints:
      - >-
        La raíz es la posición del mínimo global; el subarreglo de su izquierda forma el subárbol izquierdo y el de su derecha el derecho.
      - >-
        $\mathrm{RMQ}(i,j)$ es el LCA de los nodos de las posiciones $i$ y $j$.
    solution: |-
      **Construcción.** El mínimo de $A[1..7]$ es 1 en la posición 4: raíz.

      - Izquierda $A[1..3] = [4,2,7]$: mínimo 2 (pos. 2), con hijos 4 (pos. 1) a la izquierda y 7 (pos. 3) a la derecha.
      - Derecha $A[5..7] = [5,3,6]$: mínimo 3 (pos. 6), con hijos 5 (pos. 5) a la izquierda y 6 (pos. 7) a la derecha.

      El recorrido en orden del árbol devuelve las posiciones $1..7$, y todo padre es menor que sus hijos.

      **$\mathrm{RMQ}(3,5)$:** las posiciones 3 (valor 7) y 5 (valor 5) están a lados opuestos de la raíz: el LCA es la **posición 4**, valor **1**.

      **$\mathrm{RMQ}(5,7)$:** las posiciones 5 y 7 son hijos de la posición 6: el LCA es la **posición 6**, valor **3**.
  - level: 2
    etiqueta: "Lista · Static Trees · 17 Sparse Table"
    href: "/structures/static-rmq"
    statement: >-
      (L17) Sea $A = [5, 2, 4, 7, 6, 3, 1, 8]$ (posiciones 1 a 8). (a) Escribe la tabla $M[j][i]$ con el mínimo de las $2^j$ posiciones que empiezan en $i$, para todo $j$ válido. (b) Responde $\mathrm{RMQ}(2, 7)$ y $\mathrm{RMQ}(3, 5)$ combinando dos entradas de la tabla. (c) ¿Por qué funciona con mín pero no con la suma? ¿Cuánto cuestan la construcción y la consulta?
    hints:
      - >-
        $M[j][i] = \min(M[j-1][i],\ M[j-1][i + 2^{j-1}])$.
      - >-
        Para $[l, r]$ toma $k = \lfloor \lg (r-l+1) \rfloor$ y combina $M[k][l]$ con $M[k][r - 2^k + 1]$.
    solution: |-
      **(a)** (índice $i$ desde 1)

      - $j = 0$: $5, 2, 4, 7, 6, 3, 1, 8$
      - $j = 1$: $2, 2, 4, 6, 3, 1, 1$ ($i = 1..7$)
      - $j = 2$: $2, 2, 3, 1, 1$ ($i = 1..5$)
      - $j = 3$: $1$ ($i = 1$)

      **(b)** $\mathrm{RMQ}(2,7)$: longitud 6, $k = 2$: $\min(M[2][2], M[2][4]) = \min(2, 1) = 1$.
      $\mathrm{RMQ}(3,5)$: longitud 3, $k = 1$: $\min(M[1][3], M[1][4]) = \min(4, 6) = 4$.

      **(c)** Los dos bloques de longitud $2^k$ se **solapan**. El mínimo es idempotente ($\min(x,x) = x$), así que contar dos veces una posición no cambia la respuesta; la suma contaría dos veces las posiciones del solape. Construcción $O(n \lg n)$ (hay $\lfloor \lg n \rfloor + 1$ filas de $\le n$ entradas, cada una en $O(1)$) y consulta $O(1)$.
  - level: 2
    etiqueta: "Lista · Static Trees · 18 LCA con Euler"
    href: "/structures/lca-euler-tour"
    statement: >-
      (L18) El árbol tiene raíz 1, hijos 2, 3 de 1; 4, 5 hijos de 2; 6 hijo de 3; 7 hijo de 5 (los hijos se visitan en orden creciente). (a) Escribe el recorrido de Euler (el nodo se escribe al entrar y cada vez que se regresa a él), el arreglo de profundidades y la primera aparición de cada nodo. (b) Calcula $\mathrm{LCA}(4, 7)$, $\mathrm{LCA}(7, 6)$ y $\mathrm{LCA}(7, 5)$ con una consulta de mínimo sobre las profundidades. (c) ¿Cuál es el tamaño del arreglo? ¿Qué propiedad de las profundidades se explota para lograr $O(n)$ de preprocesamiento y $O(1)$ por consulta?
    hints:
      - >-
        Cada arista se recorre dos veces (bajada y subida) y se escribe un nodo por movimiento, más el inicial.
      - >-
        El LCA es el nodo de profundidad mínima entre las primeras apariciones de $u$ y $v$.
    solution: |-
      **(a)** Con posiciones desde 0:

      - $E = 1, 2, 4, 2, 5, 7, 5, 2, 1, 3, 6, 3, 1$
      - $D = 0, 1, 2, 1, 2, 3, 2, 1, 0, 1, 2, 1, 0$
      - primera aparición: $1 \to 0$, $2 \to 1$, $4 \to 2$, $5 \to 4$, $7 \to 5$, $3 \to 9$, $6 \to 10$

      **(b)**

      - $\mathrm{LCA}(4,7)$: intervalo $[2, 5]$, $D = 2,1,2,3$; mínimo 1 en la posición 3, $E[3] = 2$. Respuesta **2**.
      - $\mathrm{LCA}(7,6)$: intervalo $[5, 10]$, $D = 3,2,1,0,1,2$; mínimo 0 en la posición 8, $E[8] = 1$. Respuesta **1**.
      - $\mathrm{LCA}(7,5)$: intervalo $[4, 5]$, $D = 2, 3$; mínimo en la posición 4, $E[4] = 5$. Respuesta **5** (5 es ancestro de 7).

      **(c)** $2n - 1 = 13$ entradas. Profundidades consecutivas difieren en exactamente $\pm 1$: es un RMQ $\pm 1$, que se resuelve con bloques de $\tfrac12 \lg n$, tablas precalculadas para todos los patrones de $\pm1$ (cuatro rusos) y una sparse table sobre los mínimos de bloque: $O(n)$ y $O(1)$.
  - level: 3
    etiqueta: "Lista · Static Trees · 19 Heavy-Light"
    href: "/structures/heavy-light-decomposition"
    statement: >-
      (L19) El árbol de 13 nodos tiene raíz 1 y padres $p(2) = p(3) = 1$, $p(4) = p(5) = 2$, $p(6) = p(7) = 3$, $p(8) = p(9) = 4$, $p(10) = 5$, $p(11) = p(12) = 6$, $p(13) = 7$. El hijo pesado es el de mayor subárbol (en caso de empate, el de menor etiqueta). (a) Calcula los tamaños de subárbol y los caminos pesados. (b) ¿Cuántas aristas livianas hay en la ruta de 12 a la raíz y de 9 a la raíz? (c) Demuestra que cualquier ruta a la raíz tiene a lo más $\lfloor \lg n \rfloor$ aristas livianas.
    hints:
      - >-
        Calcula los tamaños de abajo hacia arriba: las hojas valen 1.
      - >-
        Si $(u,v)$ es liviana y $w$ es el hijo pesado de $u$, entonces $\mathrm{tam}[v] \le \mathrm{tam}[w]$.
    solution: |-
      **(a)** Tamaños: $\mathrm{tam}[1] = 13$; $\mathrm{tam}[2] = \mathrm{tam}[3] = 6$; $\mathrm{tam}[4] = 3$, $\mathrm{tam}[5] = 2$, $\mathrm{tam}[6] = 3$, $\mathrm{tam}[7] = 2$; las hojas 8, 9, 10, 11, 12, 13 valen 1.

      Hijos pesados (empate a la menor etiqueta): $1 \to 2$ (6 contra 6), $2 \to 4$, $3 \to 6$, $4 \to 8$, $5 \to 10$, $6 \to 11$, $7 \to 13$. Caminos pesados:

      - $1 - 2 - 4 - 8$
      - $3 - 6 - 11$
      - $5 - 10$
      - $7 - 13$
      - $9$ y $12$ (solos)

      **(b)** De 12 a la raíz: $12 \to 6$ (liviana), $6 \to 3$ (pesada), $3 \to 1$ (liviana): **2** livianas. De 9 a la raíz: $9 \to 4$ (liviana), luego $4 \to 2 \to 1$ pesadas: **1** liviana.

      **(c)** Si $(u, v)$ es liviana y $w$ es el hijo pesado de $u$, entonces $\mathrm{tam}[v] \le \mathrm{tam}[w]$ y $\mathrm{tam}[v] + \mathrm{tam}[w] \le \mathrm{tam}[u] - 1$, así que $2\,\mathrm{tam}[v] \le \mathrm{tam}[u] - 1 < \mathrm{tam}[u]$. Cada arista liviana que se sube **duplica** al menos el tamaño del subárbol. Partiendo de un tamaño $\ge 1$ y sin pasar de $n$, se pueden subir a lo más $\lfloor \lg n \rfloor$ aristas livianas. (Aquí $\lfloor \lg 13 \rfloor = 3$, y la ruta de 12 usa 2.)
  - level: 3
    etiqueta: "Lista · Static Trees · 20 Heavy-Light: consulta de ruta"
    href: "/structures/heavy-light-decomposition"
    statement: >-
      (L20) Con el árbol del ejercicio anterior, numera los nodos $1, \dots, 13$ según el orden de un DFS que visita primero el hijo pesado (y después los livianos en orden creciente de etiqueta). (a) Escribe el orden. (b) Descompón la ruta de 12 a 9 en intervalos de posiciones contiguas, subiendo por las cabezas de camino. (c) ¿Cuántos intervalos puede haber, a lo más, y cuál es el costo de una consulta de máximo en la ruta con un árbol de segmentos?
    hints:
      - >-
        Cada camino pesado queda contiguo en el orden: su cabeza primero.
      - >-
        En cada paso sube el extremo cuya cabeza de camino es más profunda, y anota el intervalo de la cabeza a ese nodo.
    solution: |-
      **(a)** Orden DFS (pesado primero): $1, 2, 4, 8, 9, 5, 10, 3, 6, 11, 12, 7, 13$. Posiciones: $\mathrm{pos}[1]=1$, $\mathrm{pos}[2]=2$, $\mathrm{pos}[4]=3$, $\mathrm{pos}[8]=4$, $\mathrm{pos}[9]=5$, $\mathrm{pos}[5]=6$, $\mathrm{pos}[10]=7$, $\mathrm{pos}[3]=8$, $\mathrm{pos}[6]=9$, $\mathrm{pos}[11]=10$, $\mathrm{pos}[12]=11$, $\mathrm{pos}[7]=12$, $\mathrm{pos}[13]=13$.

      **(b)** Ruta $12 \leadsto 9$:

      1. Las cabezas de 12 y de 9 son ellos mismos, ambas a profundidad 3. Con empate el algoritmo de clase sube el segundo extremo: intervalo $[5,5]$ (el nodo 9) y $v \leftarrow 4$.
      2. Cabezas: 12 (prof. 3) y la de 4, que es 1 (prof. 0). Sube 12: $[11, 11]$, $u \leftarrow 6$.
      3. Cabezas: 3 (prof. 1) y 1. Sube 6: $[8, 9]$ (nodos 3, 6), $u \leftarrow 1$.
      4. Misma cadena (1 y 4): $[1, 3]$ (nodos 1, 2, 4).

      Intervalos: $[5,5], [11,11], [8,9], [1,3]$, que cubren $9, 12, 3, 6, 1, 2, 4$: la ruta completa.

      **(c)** Cada extremo cruza a lo más $\lfloor \lg n\rfloor$ aristas livianas, así que hay a lo más $2(\lfloor \lg n \rfloor + 1)$ intervalos. Cada uno cuesta $O(\lg n)$ en el árbol de segmentos: la consulta cuesta $O(\lg^2 n)$.
  - level: 3
    etiqueta: "Lista · Static Trees · 21 Level Ancestor"
    statement: >-
      (L21) El árbol de 12 nodos tiene raíz 1 y padres $p(2) = p(9) = 1$, $p(3) = p(6) = 2$, $p(4) = p(12) = 3$, $p(5) = 4$, $p(7) = 6$, $p(8) = 7$, $p(10) = 9$, $p(11) = 10$. (a) Calcula la descomposición en caminos largos (el hijo de mayor altura; empate: menor etiqueta) y la escalera de cada camino (el camino extendido hacia arriba por su longitud, sin pasar de la raíz). (b) Responde $\mathrm{LA}(8, 3)$, $\mathrm{LA}(12, 2)$ y $\mathrm{LA}(5, 3)$ (el ancestro a $k$ niveles) indicando el salto $2^j$ y el uso de la escalera.
    hints:
      - >-
        Altura $h(v)$ = número de nodos del camino descendente más largo desde $v$. Las hojas tienen $h = 1$.
      - >-
        Con $j = \lfloor \lg k \rfloor$ salta $2^j$ niveles y completa los $k - 2^j$ restantes en la escalera del camino del nodo al que llegaste.
    solution: |-
      **(a)** Alturas: $h(5) = h(8) = h(11) = h(12) = 1$; $h(4) = h(7) = h(10) = 2$; $h(3) = h(6) = h(9) = 3$; $h(2) = 4$; $h(1) = 5$. Hijo largo: $1 \to 2$, $2 \to 3$ (empate con 6), $3 \to 4$, $4 \to 5$, $6 \to 7$, $7 \to 8$, $9 \to 10$, $10 \to 11$.

      - Camino $1,2,3,4,5$ (5 nodos): escalera $1,2,3,4,5$ (ya empieza en la raíz).
      - Camino $6,7,8$ (3 nodos): escalera $1,2,6,7,8$ (sólo hay 2 ancestros).
      - Camino $9,10,11$ (3 nodos): escalera $1,9,10,11$.
      - Camino $12$ (1 nodo): escalera $3,12$.

      **(b)**

      - $\mathrm{LA}(8,3)$: $j = 1$, salto de 2 niveles: $8 \to 7 \to 6$. Faltan $3 - 2 = 1$: en la escalera $1,2,6,7,8$ un lugar por encima de 6 está **2**.
      - $\mathrm{LA}(12,2)$: $j = 1$, salto de 2: $12 \to 3 \to 2$. Faltan 0: la respuesta es **2** (en la escalera del camino $1..5$).
      - $\mathrm{LA}(5,3)$: $j = 1$, salto de 2: $5 \to 4 \to 3$. Falta 1: en la escalera $1,2,3,4,5$, uno por encima de 3 es **2**.

      Se comprobó con un script que coincide con subir $k$ padres uno a uno.
  # ───────────────────────── Lista · Strings ─────────────────────────
  - level: 2
    etiqueta: "Lista · Strings · 22 KMP: tabla de fallo"
    href: "/structures/knuth-morris-pratt"
    statement: >-
      (L22) Calcula la tabla de fallo $\pi$ de $\mathtt{abaabaab}$. ¿Cuál es el período más corto de la cadena? Explica cómo se obtiene a partir de $\pi$.
    hints:
      - >-
        $\pi[i]$ es la longitud del borde propio más largo de $P[0..i]$.
      - >-
        Si el borde más largo de toda la cadena mide $b$, la cadena se repite con período $n - b$.
    solution: |-
      Con posiciones $0..7$ y $P = \mathtt{a\,b\,a\,a\,b\,a\,a\,b}$:

      $\pi = [0, 0, 1, 1, 2, 3, 4, 5]$.

      El borde más largo de toda la cadena mide $\pi[7] = 5$ ($\mathtt{abaab}$ es prefijo y sufijo). El período más corto es $n - \pi[n-1] = 8 - 5 = 3$: la cadena es $\mathtt{aba}$ repetida ($\mathtt{aba\,aba\,ab}$). Un borde de longitud $b$ significa que $P[i] = P[i + (n-b)]$ para todo $i$ válido, y el borde más largo da el período más corto.
  - level: 2
    etiqueta: "Lista · Strings · 23 KMP: búsqueda"
    href: "/structures/knuth-morris-pratt"
    statement: >-
      (L23) Sea $P = \mathtt{aabaa}$ y $T = \mathtt{aabaabaaaabaa}$. (a) Calcula $\pi$ de $P$. (b) Recorre $T$ indicando, después de leer cada carácter, cuántos caracteres de $P$ coinciden (el estado), incluyendo los retrocesos por $\pi$. (c) ¿En qué posiciones de $T$ empiezan las ocurrencias de $P$? ¿Qué se hace al completar una coincidencia? (d) ¿Por qué el recorrido es $O(\lvert T\rvert + \lvert P\rvert)$?
    hints:
      - >-
        $\pi(\mathtt{aabaa}) = [0,1,0,1,2]$.
      - >-
        Al llegar al estado 5 se reporta la ocurrencia y se continúa desde $\pi[4] = 2$.
    solution: |-
      **(a)** $\pi = [0, 1, 0, 1, 2]$.

      **(b)** Estado tras cada carácter ($T$ con posiciones desde 0):

      - $i=0$ a: 1; $i=1$ a: 2; $i=2$ b: 3; $i=3$ a: 4; $i=4$ a: **5**, ocurrencia; se continúa desde $\pi[4] = 2$.
      - $i=5$ b: 3; $i=6$ a: 4; $i=7$ a: **5**, ocurrencia; se continúa desde 2.
      - $i=8$ a: con estado 2 se esperaba b; retroceso $2 \to \pi[1] = 1$, y $P[1] = \mathtt a$ coincide: 2.
      - $i=9$ a: de nuevo se esperaba b; retroceso $2 \to 1$, coincide: 2.
      - $i=10$ b: 3; $i=11$ a: 4; $i=12$ a: **5**, ocurrencia.

      **(c)** Las ocurrencias empiezan en las posiciones **0, 3 y 8** (las dos primeras se solapan). Al completar una coincidencia se reporta $i - \lvert P\rvert + 1$ y el estado pasa a $\pi[\lvert P\rvert-1]$, para no perder ocurrencias solapadas.

      **(d)** El estado sube a lo más 1 por carácter leído (como mucho $\lvert T\rvert$ subidas) y cada retroceso lo baja al menos 1, sin bajar de 0: hay a lo más $\lvert T\rvert$ retrocesos. Con la tabla $\pi$ en $O(\lvert P\rvert)$ por el mismo argumento, el total es $O(\lvert T\rvert + \lvert P\rvert)$.
  - level: 2
    etiqueta: "Lista · Strings · 24 Aho–Corasick"
    href: "/structures/aho-corasick"
    statement: >-
      (L24) Para el diccionario $\{\mathtt{aab}, \mathtt{ab}, \mathtt{bab}\}$ dibuja el trie, calcula fail y dic de cada nodo y recorre $T = \mathtt{aabab}$ indicando, en cada posición, el nodo actual y los patrones que terminan allí.
    hints:
      - >-
        Los nodos son $\varepsilon$, a, aa, aab, ab, b, ba, bab. Calcula fail por niveles (BFS).
      - >-
        dic de un nodo es el primer nodo terminal que aparece al seguir fail desde él (sin contarlo).
    solution: |-
      **Trie.** Raíz con hijos a y b; a tiene hijos aa y ab; aa tiene hijo aab; b tiene hijo ba; ba tiene hijo bab. Terminales: aab, ab, bab.

      **fail y dic:**

      - a: fail $\varepsilon$, dic nulo
      - b: fail $\varepsilon$, dic nulo
      - aa: fail a, dic nulo
      - ab (terminal): fail b, dic nulo
      - ba: fail a, dic nulo
      - aab (terminal): fail ab, dic **ab**
      - bab (terminal): fail ab, dic **ab**

      **Recorrido de $T = \mathtt{aabab}$:**

      - $i=0$ (a): nodo a; nada termina.
      - $i=1$ (a): nodo aa; nada.
      - $i=2$ (b): nodo aab; terminan **aab** y, por dic, **ab**.
      - $i=3$ (a): aab no tiene hijo a; fail ab, luego b, que sí tiene hijo a: nodo ba; nada.
      - $i=4$ (b): nodo bab; terminan **bab** y, por dic, **ab**.
  - level: 2
    etiqueta: "Lista · Strings · 25 Suffix Array"
    href: "/structures/suffix-array"
    statement: >-
      (L25) Para $S = \mathtt{abcab}\mathdollar$ calcula el arreglo de sufijos SA, el arreglo LCP (entre sufijos consecutivos del orden) y usa $\sum (n - SA[i]) - \sum \mathrm{LCP}[i]$ para dar el número de subcadenas distintas de $S$ (contando las que incluyen el centinela).
    hints:
      - >-
        Hay 6 sufijos, el centinela es el menor carácter.
      - >-
        $\sum (n - SA[i])$ es simplemente $1 + 2 + \dots + n$.
    solution: |-
      $n = 6$. Sufijos ordenados:

      - $SA[0] = 5$: $\mathdollar$
      - $SA[1] = 3$: $\mathtt{ab}\mathdollar$
      - $SA[2] = 0$: $\mathtt{abcab}\mathdollar$
      - $SA[3] = 4$: $\mathtt{b}\mathdollar$
      - $SA[4] = 1$: $\mathtt{bcab}\mathdollar$
      - $SA[5] = 2$: $\mathtt{cab}\mathdollar$

      $SA = [5, 3, 0, 4, 1, 2]$ y $\mathrm{LCP} = [0, 0, 2, 0, 1, 0]$ (con $\mathrm{LCP}[k] = \operatorname{lcp}(SA[k-1], SA[k])$).

      Subcadenas distintas: $\sum(n - SA[i]) = 21$ y $\sum \mathrm{LCP} = 3$, así que hay $21 - 3 = 18$. Las 6 que contienen el centinela son los sufijos; sin él quedarían 12.
  - level: 2
    etiqueta: "Lista · Strings · 26 Suffix Array: búsqueda"
    href: "/structures/suffix-array"
    statement: >-
      (L26) Con el SA de $S = \mathtt{abcab}\mathdollar$ del ejercicio anterior, encuentra todas las ocurrencias de los patrones $\mathtt{ab}$, $\mathtt{b}$, $\mathtt{ca}$ y $\mathtt{abd}$: indica el intervalo de SA que cumple y las posiciones. ¿Cuál es el costo de buscar un patrón $P$ con búsqueda binaria sobre SA?
    hints:
      - >-
        Los sufijos que empiezan por $P$ son contiguos en el SA.
      - >-
        Dos búsquedas binarias: la primera frontera (primer sufijo $\ge P$) y la segunda (primer sufijo que ya no empieza por $P$).
    solution: |-
      - $\mathtt{ab}$: rangos $[1, 2]$ del SA, posiciones $SA[1] = 3$ y $SA[2] = 0$.
      - $\mathtt{b}$: rangos $[3, 4]$, posiciones 4 y 1.
      - $\mathtt{ca}$: rango $[5, 5]$, posición 2.
      - $\mathtt{abd}$: intervalo vacío; las dos fronteras caen en el rango 3 ($\mathtt{abcab}\mathdollar < \mathtt{abd}$ y $\mathtt{b}\mathdollar > \mathtt{abd}$). No ocurre.

      Costo: cada paso de la búsqueda binaria compara $P$ con un sufijo en $O(\lvert P\rvert)$, y hay $O(\lg n)$ pasos: $O(\lvert P\rvert \lg n)$ para el intervalo, más $O(\mathrm{occ})$ para listar las posiciones.
  - level: 2
    etiqueta: "Lista · Strings · 27 Suffix Tree"
    href: "/structures/suffix-tree"
    statement: >-
      (L27) Sea $S = \mathtt{banana}\mathdollar$. (a) Dibuja el suffix tree (aristas con etiquetas de subcadenas, hojas con la posición de inicio, que empieza en 0). (b) ¿Cuántas hojas y cuántos nodos internos (sin contar la raíz) tiene? Suma las longitudes de las etiquetas de todas las aristas: ¿qué cuenta ese número? (c) Usa el árbol para decir cuántas veces ocurren $\mathtt{ana}$ y $\mathtt{nan}$ en $S$ y en qué posiciones.
    hints:
      - >-
        Los nodos internos son las subcadenas que se repiten con continuaciones distintas.
      - >-
        Las ocurrencias de un patrón son las hojas del subárbol donde termina su camino.
    solution: |-
      **(a)** Desde la raíz salen cuatro aristas:

      - $\mathdollar$ → hoja 6
      - $\mathtt{banana}\mathdollar$ → hoja 0
      - $\mathtt{a}$ → nodo interno $\mathtt{a}$, con aristas $\mathdollar$ → hoja 5 y $\mathtt{na}$ → nodo interno $\mathtt{ana}$; éste tiene $\mathdollar$ → hoja 3 y $\mathtt{na}\mathdollar$ → hoja 1
      - $\mathtt{na}$ → nodo interno $\mathtt{na}$, con aristas $\mathdollar$ → hoja 4 y $\mathtt{na}\mathdollar$ → hoja 2

      **(b)** 7 hojas (una por sufijo de $S\mathdollar$) y 3 nodos internos sin contar la raíz ($\mathtt{a}$, $\mathtt{ana}$, $\mathtt{na}$). Longitudes: $1 + 7 + 1 + 2 + 1 + 1 + 3 + 2 + 1 + 3 = 22$. Cada punto de una arista es una subcadena distinta: 22 es el **número de subcadenas distintas** de $S\mathdollar$; restando las 7 que contienen el centinela quedan 15 de $\mathtt{banana}$.

      **(c)** $\mathtt{ana}$ termina exactamente en el nodo $\mathtt{ana}$, con hojas 3 y 1: **2 ocurrencias**, en las posiciones 1 y 3. $\mathtt{nan}$ baja por $\mathtt{na}$ y entra una letra en la arista $\mathtt{na}\mathdollar$, que lleva a la hoja 2: **1 ocurrencia**, en la posición 2.
  # ───────────────────────── Lista · Dynamic Graphs ─────────────────────────
  - level: 2
    etiqueta: "Lista · Dynamic Graphs · 28 Access"
    href: "/structures/link-cut-tree"
    statement: >-
      (L28) El árbol tiene raíz 1, hijos 2 y 3 de 1, 4 hijo de 2, 5 hijo de 3. Inicialmente los hijos preferidos son $1 \to 2$, $2 \to 4$, $3 \to 5$. Ejecuta Access(5), Access(4), Access(5) y, para cada uno, indica los cambios de hijo preferido. Después explica por qué un Access cambia el hijo preferido por una arista liviana a lo más $\lfloor \lg n \rfloor$ veces.
    hints:
      - >-
        Access(v) hace preferida toda la ruta raíz–$v$ y deja a $v$ sin hijo preferido.
      - >-
        Sólo cambian los nodos de la ruta cuyo hijo preferido no apuntaba hacia $v$.
    solution: |-
      - **Access(5)**: ruta $1 \to 3 \to 5$. El nodo 1 cambia de $2$ a $3$; $3 \to 5$ ya era preferida; 5 es hoja. **1 cambio** ($1: 2 \to 3$). Caminos preferidos: $\{1,3,5\}$, $\{2,4\}$.
      - **Access(4)**: ruta $1 \to 2 \to 4$. El nodo 1 cambia de $3$ a $2$; $2 \to 4$ sigue. **1 cambio**. Caminos: $\{1,2,4\}$, $\{3,5\}$.
      - **Access(5)**: de nuevo el nodo 1 cambia de 2 a 3. **1 cambio**. Caminos: $\{1,3,5\}$, $\{2,4\}$.

      **Cota.** Un cambio por una arista liviana $(u,v)$ hace preferida una arista liviana de la ruta raíz–$v$. Como $\mathrm{tam}[v] \le \mathrm{tam}[u]/2$ en toda arista liviana, cada una que se sube al menos duplica el tamaño, y éste no pasa de $n$: la ruta tiene a lo más $\lfloor \lg n \rfloor$ aristas livianas, y por eso a lo más $\lfloor \lg n\rfloor$ de los cambios de un Access son livianos. (Aquí $n = 5$, $\lfloor \lg 5\rfloor = 2$.)
  - level: 3
    etiqueta: "Lista · Dynamic Graphs · 29 Access: livianas y pesadas"
    href: "/structures/link-cut-tree"
    statement: >-
      (L29) El árbol tiene raíz 1, hijos 2, 3 de 1, hijos 4, 5 de 2 y 6 hijo de 3. Inicialmente ningún nodo tiene hijo preferido. (a) Calcula los tamaños de subárbol y las aristas pesadas (empate: menor etiqueta). (b) Ejecuta Access(4), Access(5), Access(6) y Access(4). Para cada uno da los cambios de hijo preferido (un nodo que pasa de no tener hijo preferido a tener uno también cuenta) y di cuáles de ellos hacen preferida una arista liviana. (c) Verifica que cada Access cumple la cota de $\lfloor \lg n \rfloor$ livianas.
    hints:
      - >-
        Tamaños: 1 vale 6, 2 vale 3, 3 vale 2.
      - >-
        Una arista liviana es la que no va al hijo pesado.
    solution: |-
      **(a)** $\mathrm{tam}[1] = 6$, $\mathrm{tam}[2] = 3$, $\mathrm{tam}[3] = 2$, $\mathrm{tam}[4] = \mathrm{tam}[5] = \mathrm{tam}[6] = 1$. Pesadas: $(1,2)$, $(2,4)$ (empate con 5), $(3,6)$. Livianas: $(1,3)$, $(2,5)$.

      **(b)**

      - **Access(4)**: $1$: nada $\to 2$; $2$: nada $\to 4$. 2 cambios, ambos pesados.
      - **Access(5)**: $2$: $4 \to 5$. 1 cambio, **liviano** ($(2,5)$).
      - **Access(6)**: $1$: $2 \to 3$ (**liviano**); $3$: nada $\to 6$ (pesado). 2 cambios, 1 liviano.
      - **Access(4)**: $1$: $3 \to 2$ (pesado); $2$: $5 \to 4$ (pesado). 2 cambios, 0 livianos.

      **(c)** $\lfloor \lg 6 \rfloor = 2$ y los Access hacen preferidas 0, 1, 1 y 0 aristas livianas: todos cumplen.
  - level: 2
    etiqueta: "Lista · Dynamic Graphs · 30 Cortar"
    href: "/structures/link-cut-tree"
    statement: >-
      (L30) Un árbol es la cadena $1-2-3-4-5$ enraizada en 1 (cada nodo es hijo del anterior) y al inicio ningún nodo tiene hijo preferido. Ejecuta Access(5), Access(2) y Cortar(3) (separar 3 de su padre). Después de cada operación escribe los caminos preferidos y, al final, los árboles resultantes y cómo queda conectado el camino que contiene a 4 y 5.
    hints:
      - >-
        Access(2) deja a 2 sin hijo preferido: el camino se parte entre 2 y 3.
      - >-
        Cortar(3) empieza con Access(3) y luego separa el hijo izquierdo del splay de 3 (sus ancestros).
    solution: |-
      - **Access(5)**: toda la cadena queda preferida: un camino $\{1,2,3,4,5\}$.
      - **Access(2)**: la ruta raíz–2 ya es preferida, pero 2 pierde su hijo preferido. Caminos $\{1,2\}$ y $\{3,4,5\}$; el árbol auxiliar de $\{3,4,5\}$ cuelga de 2 por path-parent.
      - **Cortar(3)**: primero Access(3): $2 \to 3$ vuelve a ser preferida y 3 pierde su hijo preferido 4. Caminos $\{1,2,3\}$ y $\{4,5\}$, con $\{4,5\}$ colgado de 3 por path-parent. En el splay de 3 (raíz tras Access) el hijo izquierdo contiene a $\{1,2\}$; se separa ($\mathrm{padre}[a] \leftarrow$ nulo, $\mathrm{izq}[3] \leftarrow$ nulo).

      **Resultado:** dos árboles, $1 - 2$ (raíz 1) y $3 - 4 - 5$ (raíz 3). Caminos preferidos $\{1,2\}$, $\{3\}$ y $\{4,5\}$; el camino $\{4,5\}$ sigue conectado al árbol de 3 por su path-parent, que apunta a 3 (el padre de 4 en el árbol representado).
  - level: 2
    etiqueta: "Lista · Dynamic Graphs · 31 Enlazar, Cortar, Raíz"
    href: "/structures/link-cut-tree"
    statement: >-
      (L31) Se tienen 6 nodos aislados. Enlazar(v, w) (con $v$ raíz de su árbol) cuelga $v$ como hijo de $w$; Cortar(v) separa $v$ de su padre; Raíz(v) devuelve la raíz del árbol de $v$. (a) Ejecuta Enlazar(2, 1), Enlazar(3, 2), Enlazar(5, 4) y responde Raíz(3) y si 3 y 5 están conectados. (b) Ejecuta Enlazar(4, 3) y responde Raíz(5). Después Cortar(2) y responde Raíz(5) y si 5 y 1 están conectados. Da los árboles finales. (c) Explica cómo se implementa Raíz(v) con Access y el splay tree del camino.
    hints:
      - >-
        Dos nodos están conectados si y sólo si tienen la misma raíz.
      - >-
        Tras Access(v), el splay de $v$ contiene exactamente la ruta raíz–$v$, ordenada por profundidad.
    solution: |-
      **(a)** Árboles: $1 - 2 - 3$ (raíz 1), $4 - 5$ (raíz 4), $6$. Raíz(3) = **1**. Raíz(5) = 4 $\ne$ 1: 3 y 5 **no** están conectados.

      **(b)** Enlazar(4, 3) cuelga 4 (raíz de su árbol) bajo 3: un árbol $1-2-3-4-5$. Raíz(5) = **1**. Cortar(2) separa 2 de 1: árboles $\{1\}$, $2 - 3 - 4 - 5$ (raíz 2) y $\{6\}$. Raíz(5) = **2**, y como Raíz(1) = 1, 5 y 1 **no** están conectados.

      **(c)** Raíz(v): Access(v); ahora el splay de $v$ tiene la ruta raíz–$v$ ordenada por profundidad, así que la raíz del árbol representado es el nodo **más a la izquierda** del splay. Se baja por hijos izquierdos hasta él y se le hace Splay (para que el costo quede amortizado). $O(\lg n)$ amortizado.
  - level: 6
    etiqueta: "Lista · Dynamic Graphs · 32 Costo amortizado de los cambios"
    href: "/structures/link-cut-tree"
    statement: >-
      (L32) Demuestra que en una secuencia de $m$ operaciones Access sobre un árbol de $n$ nodos el número total de cambios de hijo preferido es $O(n + m \lg n)$. Pista: clasifica los cambios según la arista que se vuelve preferida (pesada o liviana). ¿Cuántas aristas livianas se vuelven preferidas en cada Access? Una arista pesada solo puede volverse preferida si antes dejó de serlo: ¿cuándo deja de serlo?
    hints:
      - >-
        Las aristas livianas que se vuelven preferidas en un Access están todas en la ruta raíz–$v$.
      - >-
        Una arista pesada $(u, w)$ deja de ser preferida sólo si otro hijo de $u$ (por una arista liviana) se vuelve preferido, o si el Access termina en $u$.
    solution: |-
      Usamos Heavy-Light como herramienta de análisis: $(u, v)$ es pesada si $\mathrm{tam}(v) > \mathrm{tam}(u)/2$ y liviana si no. Cada cambio de hijo preferido hace preferida una arista, pesada o liviana.

      **Cambios livianos.** En un Access(v) todas las aristas que se vuelven preferidas están en la ruta raíz–$v$, que tiene a lo más $\lg n$ aristas livianas. Total: $\le m \lg n$.

      **Cambios pesados.** Para que una arista pesada $(u, w)$ se vuelva preferida tiene que no serlo antes. Una arista pesada deja de ser preferida sólo (i) cuando su hermana liviana se vuelve preferida, lo que pasa a lo más $\lg n$ veces por Access (es un cambio liviano), o (ii) cuando el Access termina en $u$, que deja a $u$ sin hijo preferido: una vez por Access. Al inicio hay a lo más $n$ aristas pesadas no preferidas. Entonces
      $$\#\text{cambios pesados} \le n + m(\lg n + 1).$$

      **Total:** $m \lg n + n + m(\lg n + 1) = O(n + m \lg n)$, es decir $O(\lg n)$ amortizado de cambios por Access.
  # ───────────────────────── Simulacro · P1 Optimalidad dinámica ─────────────────────────
  - level: 2
    etiqueta: "Simulacro · P1 Optimalidad dinámica · (a) Conocimientos"
    href: "/structures/tango-tree"
    statement: >-
      (S1a) Un Tango Tree usa un árbol de referencia $P$ perfecto de llaves $1,\dots,15$ (raíz 8 a profundidad 0; hijos 4 y 12; nietos 2, 6, 10, 14; las hojas impares a profundidad 3). El hijo preferido de un nodo es el hijo por el que pasó el acceso más reciente dentro de su subárbol (accesar al propio nodo no lo cambia); inicialmente todo nodo interno prefiere a su hijo izquierdo. Cada camino preferido vive en un árbol auxiliar ordenado por llave.
      Tango-Buscar(x) parte del árbol auxiliar $A$ de la raíz y baja hacia $x$; cuando entra a un nodo marcado $v$ (raíz de otro árbol auxiliar $B$) toma $d \leftarrow v.\mathrm{minProf} - 1$, hace Cortar(A, d) (separa de $A$ las claves de profundidad $> d$, desde la menor $l$ hasta la mayor $r$ de ellas) y Unir(A, B), y sigue desde la raíz de $A$.
      Los accesos son 3 y después 11. Escribe los caminos preferidos tras ambos accesos. Luego ejecuta Tango-Buscar(6): para cada cruce indica el nodo $v$ al que se entra, $d$, las claves que quita Cortar (con $l$ y $r$), los caminos resultantes y cuántos cruces tuvo la búsqueda.
    hints:
      - >-
        Al inicio los caminos son $\{8,4,2,1\}$, $\{12,10,9\}$, $\{6,5\}$, $\{14,13\}$ y las hojas sueltas $3, 7, 11, 15$.
      - >-
        En Tango-Buscar(6) el primer cruce entra al camino de 4 (profundidad mínima 1) y el segundo al de 6 (profundidad mínima 2).
    solution: |-
      **Estado inicial** (todos prefieren al hijo izquierdo): $\{8,4,2,1\}$, $\{12,10,9\}$, $\{6,5\}$, $\{14,13\}$, $\{3\}$, $\{7\}$, $\{11\}$, $\{15\}$.

      **Acceso 3** (ruta $8 \to 4 \to 2 \to 3$): sólo cambia el 2 (de 1 a 3). Caminos: $\{8,4,2,3\}$, $\{1\}$, $\{12,10,9\}$, $\{6,5\}$, $\{14,13\}$, $\{7\}$, $\{11\}$, $\{15\}$.

      **Acceso 11** (ruta $8 \to 12 \to 10 \to 11$): cambian el 8 (de 4 a 12) y el 10 (de 9 a 11). Caminos: $\{8,12,10,11\}$, $\{4,2,3\}$, $\{1\}$, $\{9\}$, $\{6,5\}$, $\{14,13\}$, $\{7\}$, $\{15\}$.

      **Tango-Buscar(6).** $A$ = árbol auxiliar de $\{8,10,11,12\}$.

      1. Como $6 < 8$, la búsqueda sale de $A$ por la izquierda y entra al nodo marcado que es la raíz del auxiliar $B$ del camino $\{4,2,3\}$, con $\mathrm{minProf} = 1$ (la de 4): $d = 0$. Cortar(A, 0) quita las claves de profundidad $> 0$: $10, 11, 12$, con $l = 10$ y $r = 12$; forman su propio camino $\{12,10,11\}$. Unir deja $A = \{8,4,2,3\}$.
      2. Desde la raíz de $A$, 6 está entre 4 y 8: entra al nodo marcado que es la raíz del auxiliar del camino $\{6,5\}$, con $\mathrm{minProf} = 2$ (la de 6): $d = 1$. Cortar(A, 1) quita las claves de profundidad $> 1$: $2, 3$, con $l = 2$ y $r = 3$; forman $\{2,3\}$. Unir deja $A = \{8,4,6,5\}$.
      3. Se encuentra 6 en $A$.

      **2 cruces.** Caminos finales: $\{8,4,6,5\}$, $\{2,3\}$, $\{12,10,11\}$, $\{1\}$, $\{9\}$, $\{14,13\}$, $\{7\}$, $\{15\}$. Coinciden con los cambios de hijo preferido del acceso a 6: el 8 pasa de 12 a 4 y el 4 de 2 a 6.
  - level: 6
    etiqueta: "Simulacro · P1 Optimalidad dinámica · (b) Análisis"
    href: "/structures/tango-tree"
    statement: >-
      (S1b) Supón que $P$ tiene profundidad $d$ (no necesariamente $\Theta(\lg n)$), de modo que cada árbol auxiliar tiene a lo más $d + 1$ nodos y Cortar y Unir hacen un número constante de splits y concatenaciones. Demuestra que una búsqueda con $k$ cruces cuesta $O((k+1)(1 + \lg d))$ y que $m$ accesos cuestan $O((W + m + n)(1 + \lg d))$, con $W$ el valor de Wilber-1 para $P$ y $n$ por los cambios de hijo preferido iniciales. Evalúa el factor $1 + \lg d$ cuando $d = \Theta(\lg n)$ y cuando $P$ es un camino de $n$ nodos, y explica qué significa cada uno sobre la competitividad.
    hints:
      - >-
        Una búsqueda recorre $k + 1$ árboles auxiliares; en cada uno baja, corta y une en árboles de $\le d+1$ nodos.
      - >-
        Cada cruce es un cambio de hijo preferido. El primer cambio de cada nodo puede no ser una alternancia de Wilber-1; los demás sí.
    solution: |-
      **Una búsqueda.** Con $k$ cruces la búsqueda visita $k + 1$ árboles auxiliares. En cada uno baja por un BST balanceado de $\le d + 1$ nodos, $O(1 + \lg d)$, y en cada cruce hace un número constante de splits y concatenaciones sobre árboles de $O(d)$ nodos, $O(1 + \lg d)$ cada uno. Total $O((k+1)(1+\lg d))$.

      **$m$ accesos.** El costo total es $O\big((\sum_i k_i + m)(1+\lg d)\big)$. Cada cruce es un cambio de hijo preferido de un nodo $y$. Si no es el primer cambio de $y$, el acceso anterior en el subárbol de $y$ fue por el otro lado: es una alternancia de $W_1(y)$. Los primeros cambios son a lo más uno por nodo, $\le n$. Así $\sum_i k_i \le W + n$ y el total es $O((W + m + n)(1 + \lg d))$.

      **El factor.** Con $d = \Theta(\lg n)$ (P balanceado) el factor es $\Theta(\lg \lg n)$; como $\mathrm{OPT} = \Omega(W + m) - O(n)$, Tango es $O(\lg\lg n)$-competitivo. Si $P$ es un camino, $d = n - 1$ y el factor es $\Theta(\lg n)$: no se gana nada frente a un BST balanceado (y además Wilber-1 sobre un camino suele ser una cota débil).
  - level: 5
    etiqueta: "Simulacro · P1 Optimalidad dinámica · (c) Diseño"
    href: "/structures/wilber-1-bound"
    statement: >-
      (S1c) Para la secuencia de accesos $3, 11, 6, 14$ sobre $P$ (con la regla inicial: todo nodo prefiere a su hijo izquierdo): (i) calcula Wilber-1 (el aporte de cada nodo con aporte no nulo y el total); (ii) para cada acceso indica los nodos que cambian de hijo preferido (de cuál a cuál) y el número total de cambios, que es el número total de cruces de Tango-Buscar; (iii) explica la diferencia entre ambos valores.
    hints:
      - >-
        Para Wilber-1 mira 8, 4 y 12: los demás ven a lo más un acceso en su subárbol.
      - >-
        Un cambio sin alternancia ocurre cuando el primer acceso dentro del subárbol de un nodo va a la derecha.
    solution: |-
      **(i) Wilber-1.**

      - Nodo 8: accesos 3, 11, 6, 14 dan L R L R: **3**.
      - Nodo 4: accesos 3, 6 dan L R: **1**.
      - Nodo 12: accesos 11, 14 dan L R: **1**.
      - Los demás: 0 (nodo 2 ve sólo R, nodo 10 sólo R).

      $W = 5$.

      **(ii) Cambios de hijo preferido.**

      - Acceso 3: el 2 pasa de 1 a 3. **1**.
      - Acceso 11: el 8 de 4 a 12 y el 10 de 9 a 11. **2**.
      - Acceso 6: el 8 de 12 a 4 y el 4 de 2 a 6. **2**.
      - Acceso 14: el 8 de 4 a 12 y el 12 de 10 a 14. **2**.

      Total: **7** cambios = 7 cruces de Tango-Buscar.

      **(iii)** Wilber-1 sólo cuenta alternancias entre accesos reales. Los cambios del nodo 2 (acceso 3) y del nodo 10 (acceso 11) se deben al estado **inicial** artificial (preferir la izquierda): son el primer acceso en su subárbol y van a la derecha, lo que no es una alternancia. Por eso $7 = W + 2$, dentro de la cota $\text{cambios} \le W + n$ de la parte (b).
  - level: 4
    etiqueta: "Simulacro · P1 Optimalidad dinámica · (d) Profundidad"
    href: "/structures/wilber-1-bound"
    statement: >-
      (S1d) Chris propone usar como árbol de referencia el camino $P_2$ en que cada nodo $i$ es hijo derecho de $i - 1$ ($1 \to 2 \to 3 \to 4 \to 5$) en vez del árbol $P_1$ de raíz 3, hijos 1 y 5, con 2 hijo derecho de 1 y 4 hijo izquierdo de 5. Para los accesos $2, 4, 5, 1, 3$ calcula Wilber-1 con $P_1$ y con $P_2$. ¿Son ambos valores cotas inferiores válidas de OPT? ¿Cuál es más útil y por qué? ¿Qué implica para elegir $P$ en un Tango Tree?
    hints:
      - >-
        En $P_2$ ningún nodo tiene hijo izquierdo: ¿puede haber alternancias?
      - >-
        Wilber-1 es cota inferior para **cualquier** árbol de referencia fijo.
    solution: |-
      **$P_1$.** Nodo 3: accesos 2, 4, 5, 1 (el 3 se ignora) dan L R R L: **2**. Nodo 1: sólo el 2 (R): 0. Nodo 5: sólo el 4 (L): 0. $W_1(P_1) = 2$.

      **$P_2$.** Todo subárbol sólo tiene lado derecho: la sucesión de cada nodo es R R … R, sin alternancias. $W_1(P_2) = 0$.

      Ambas son cotas inferiores válidas ($\mathrm{OPT} \ge W/2 - n$ vale para cualquier $P$ fijo), pero la de $P_2$ es trivial. La de $P_1$ es más útil porque es más grande: una cota inferior vale más cuanto más se acerca a OPT. Para Tango esto implica elegir $P$ **balanceado**: da profundidad $d = \Theta(\lg n)$ (factor $\lg\lg n$) y alternancias que sí capturan el costo; un camino da factor $\lg n$ y una cota inútil.
  # ───────────────────────── Simulacro · P2 Jerarquía de memoria ─────────────────────────
  - level: 2
    etiqueta: "Simulacro · P2 Jerarquía de memoria · (a) Conocimientos"
    href: "/structures/packed-memory-array"
    statement: >-
      (S2a) Un PMA guarda $N$ claves en un arreglo con huecos, dividido en trozos de $c = \Theta(\lg N)$ celdas; sobre los trozos hay un árbol binario completo de altura $h$ (hojas a profundidad $h$) y un intervalo a profundidad $d$ debe cumplir $\tfrac12 - \tfrac14\cdot\tfrac dh \le \text{densidad} \le \tfrac34 + \tfrac14 \cdot \tfrac dh$. Insertar: se inserta en el trozo de su predecesor (o en el primero) y se reescribe ese trozo empaquetado a la izquierda; si el trozo (contando el nuevo) cumple su umbral, se termina; si no, se sube hasta el primer ancestro que, contando el nuevo, cumple el suyo y se reparten sus elementos de forma pareja (el $j$-ésimo va a la celda $\lfloor j \cdot c'/k \rfloor$ del intervalo, con $c'$ celdas y $k$ elementos).
      Un PMA de 16 celdas con trozos de 4 ($h = 2$) tiene el arreglo `10 20 30 40 _ _ _ _ 60 70 _ _ 80 _ 90 _`. Inserta 35, 36, 37, 38, 39 en ese orden; tras cada una indica el intervalo redistribuido (o "ninguno") y el arreglo.
    hints:
      - >-
        Umbrales superiores: hoja ($d = 2$) 1; $d = 1$ (8 celdas) $7/8$; raíz ($d = 0$) $3/4$.
      - >-
        Para 38 el intervalo de 8 celdas quedaría con 8/8: hay que subir a la raíz.
    solution: |-
      Umbrales superiores: trozo $1$, intervalo de 8 celdas $7/8$, raíz $3/4$.

      - **35**: predecesor 30, trozo 0 (celdas 0–3) quedaría con $5/4 > 1$. Intervalo de celdas 0–7: $5/8 \le 7/8$. Se reparten 10, 20, 30, 35, 40 en 8 celdas, en $\lfloor 8j/5 \rfloor = 0,1,3,4,6$. Redistribuido: **celdas 0–7**. Arreglo `10 20 _ 30 35 _ 40 _ 60 70 _ _ 80 _ 90 _`.
      - **36**: predecesor 35, trozo 1 (celdas 4–7): $3/4 \le 1$. **Ninguno**; el trozo se reescribe empaquetado: `10 20 _ 30 35 36 40 _ 60 70 _ _ 80 _ 90 _`.
      - **37**: trozo 1: $4/4 \le 1$. **Ninguno**: `10 20 _ 30 35 36 37 40 60 70 _ _ 80 _ 90 _`.
      - **38**: trozo 1 quedaría con $5/4$; celdas 0–7 con $8/8 > 7/8$; raíz con $12/16 = 3/4$: cumple. Se reparten 12 elementos en 16 celdas, en $\lfloor 16j/12 \rfloor = 0,1,2,4,5,6,8,9,10,12,13,14$. Redistribuido: **todo el arreglo (celdas 0–15)**. Arreglo `10 20 30 _ 35 36 37 _ 38 40 60 _ 70 80 90 _`.
      - **39**: predecesor 38, trozo 2 (celdas 8–11): $4/4 \le 1$. **Ninguno**: `10 20 30 _ 35 36 37 _ 38 39 40 60 70 80 90 _`.
  - level: 6
    etiqueta: "Simulacro · P2 Jerarquía de memoria · (b) Análisis"
    href: "/structures/packed-memory-array"
    statement: >-
      (S2b) Demuestra que, justo después de redistribuir un intervalo de $s$ celdas a profundidad $d$, cada uno de sus hijos queda con densidad igual a la del intervalo y por tanto a una distancia de al menos $\tfrac{1}{4h}$ de su umbral superior; concluye que hacen falta $\Omega(s/h)$ inserciones dentro de ese intervalo antes de volver a redistribuirlo, y que el costo amortizado de una inserción es $O(\lg^2 N)$ movimientos (con $h = \Theta(\lg N)$).
    hints:
      - >-
        El reparto parejo pone la mitad (redondeada) de los elementos en cada mitad del intervalo.
      - >-
        El umbral superior de un hijo es $\tau_{d+1} = \tau_d + \tfrac{1}{4h}$.
    solution: |-
      **Densidad de los hijos.** El reparto parejo pone el $j$-ésimo elemento en la celda $\lfloor js/k\rfloor$: cada mitad de $s/2$ celdas recibe $k/2$ elementos (salvo redondeo), así que su densidad es la del intervalo, $\rho = k/s \le \tau_d$ (se redistribuyó porque cumplía su umbral). El umbral de un hijo es $\tau_{d+1} = \tau_d + \tfrac{1}{4h}$, así que cada hijo queda a distancia $\ge \tfrac{1}{4h}$ de su umbral.

      **Inserciones antes de volver.** Para que el intervalo se redistribuya otra vez, una inserción tiene que subir hasta él, es decir, algún hijo tiene que superar su umbral. Eso exige subir su densidad en $\tfrac{1}{4h}$ sobre $s/2$ celdas: al menos $\tfrac{s}{8h} = \Omega(s/h)$ inserciones dentro del intervalo.

      **Amortización.** Redistribuir cuesta $O(s)$ movimientos; repartido entre esas $\Omega(s/h)$ inserciones da $O(h)$ por inserción y por nivel. Cada inserción cae dentro de $h + 1$ intervalos (uno por nivel), así que paga $O(h)$ en cada uno: $O(h^2) = O(\lg^2 N)$ movimientos amortizados, más los $O(\lg N)$ de reescribir su trozo.
  - level: 5
    etiqueta: "Simulacro · P2 Jerarquía de memoria · (c) Diseño"
    href: "/structures/packed-memory-array"
    statement: >-
      (S2c) Se mantiene una lista ordenada de $N = 2^{20}$ claves, con inserciones y consultas que recorren $k = 2^{15}$ claves consecutivas, con bloques de $B = 2^{10}$ claves. Compara un arreglo compacto y un PMA: para cada uno da las transferencias de un recorrido de $k$ claves y de una inserción (peor caso para el arreglo, amortizada para el PMA, con $\lg N = 20$ y suponiendo que redistribuir $s$ celdas cuesta $O(s/B + 1)$ transferencias), y decide cuál usarías según la proporción de inserciones.
    hints:
      - >-
        En el arreglo compacto insertar al principio desplaza las $N$ claves.
      - >-
        En el PMA la densidad es al menos $1/4$: $k$ claves ocupan a lo más $4k$ celdas.
    solution: |-
      **Arreglo compacto.** Recorrido: $k/B + 1 = 32 + 1 \approx 33$ transferencias. Inserción en el peor caso: desplazar todo, $N/B = 2^{10} = 1024$ transferencias.

      **PMA.** Recorrido: las $k$ claves ocupan a lo más $4k$ celdas (densidad $\ge 1/4$), $\le 4k/B + 1 \approx 129$ transferencias, $O(k/B)$. Inserción amortizada: por la parte (b), cada nivel le cobra $O(h)$ celdas movidas en redistribuciones de $s$ celdas, que cuestan $O(s/B + 1)$; sumando sobre los niveles queda $O(\lg^2 N / B + 1) = O(400/1024 + 1)$, del orden de **1–2 transferencias** (más reescribir su trozo de $\Theta(\lg N)$ celdas, $O(1)$ transferencias).

      **Decisión** (estimación derivada con estas cifras): con una fracción $p$ de inserciones, el arreglo cuesta $\approx 1024p + 33(1-p)$ por operación y el PMA $\approx 2p + 129(1-p)$. Se igualan en $p \approx 0.09$. Con menos de un 9 % de inserciones conviene el arreglo compacto (recorridos 4 veces más baratos); con más, el PMA, porque cada inserción del arreglo cuesta 500 veces más.
  - level: 4
    etiqueta: "Simulacro · P2 Jerarquía de memoria · (d) Profundidad"
    href: "/structures/packed-memory-array"
    statement: >-
      (S2d) Un PMA de $N$ celdas, con trozos de $c$ celdas ($N = c\cdot 2^h$, $c$ múltiplo de 4), usa el mismo umbral superior $3/4$ en todos los niveles (se redistribuye el primer ancestro, contando el nuevo elemento, con densidad $\le 3/4$). Construye una secuencia de operaciones de inserción y eliminación en la que cada par (eliminar, insertar) cuesta $\Theta(N)$ movimientos. Explica por qué los umbrales de la clase (más estrictos arriba) evitan este problema.
    hints:
      - >-
        Un reparto parejo de $3N/4$ elementos pone exactamente 3 en cada grupo de 4 celdas: todo intervalo queda en $3/4$ justo.
      - >-
        Si todo intervalo está exactamente en el umbral, una inserción no cabe en ninguno salvo que alguien tenga holgura.
    solution: |-
      **Construcción.** Llena el PMA con $3N/4$ elementos repartidos de forma pareja: $\lfloor 4j/3 \rfloor$ pone 3 elementos en cada grupo de 4 celdas, así que **todo** intervalo (trozo o ancestro, todos múltiplos de 4) tiene densidad exactamente $3/4$.

      Repetir: (1) **eliminar** un elemento de la mitad derecha (la raíz queda con $3N/4 - 1$); (2) **insertar** un elemento en la mitad izquierda. El trozo, y cada ancestro dentro de la mitad izquierda, quedarían por encima de $3/4$; sólo la raíz, con $3N/4$ elementos, cumple: se redistribuye **todo el arreglo**, $\Theta(N)$ movimientos. El reparto parejo deja otra vez todos los intervalos en exactamente $3/4$, así que el par siguiente vuelve a costar $\Theta(N)$.

      **Por qué los umbrales de clase lo evitan.** Con $\tau_d = \tfrac34 + \tfrac14\cdot\tfrac dh$, tras redistribuir a profundidad $d$ los hijos quedan $\tfrac{1}{4h}$ por debajo de **su** umbral. Esa holgura garantiza $\Omega(s/h)$ inserciones antes de volver a subir al mismo intervalo, y da el $O(\lg^2 N)$ amortizado de la parte (b). Con umbral uniforme la holgura es cero.
  # ───────────────────────── Simulacro · P3 Enteros ─────────────────────────
  - level: 2
    etiqueta: "Simulacro · P3 Enteros · (a) Conocimientos"
    href: "/structures/fusion-tree"
    statement: >-
      (S3a) En un Fusion Tree, un nodo guarda llaves de $w$ bits. Los exponentes $c_0 < c_1 < \cdots$ son los bits donde ramifica el trie de las llaves (el bit más significativo en que difieren llaves consecutivas) y el sketch de $x$ es $\mathrm{sk}(x) = \sum_j x_{c_j} 2^j$. Las llaves de 8 bits del nodo son `00101101`, `00110010`, `01001000`, `01001111`, `10010100`, `11100011`.
      Predecesor-Nodo(q): $i \leftarrow (\#\{\mathrm{sk} \le \mathrm{sk}(q)\}) - 1$; $y \leftarrow$ la de $x_i, x_{i+1}$ que minimiza $q \oplus y$; si $y = q$ se devuelve; $j \leftarrow \mathrm{msb}(q \oplus y)$, $\beta \leftarrow$ el bit $j$ de $q$; si $\beta = 1$, $e \leftarrow$ ($q$ con los bits $\le j$ cambiados por $0\,1\cdots1$, es decir prefijo de $q$, luego 0 y unos) y se devuelve $\#\{\mathrm{sk} \le \mathrm{sk}(e)\} - 1$; si $\beta = 0$, $e \leftarrow$ (prefijo de $q$, luego 1 y ceros) y se devuelve $\#\{\mathrm{sk} < \mathrm{sk}(e)\} - 1$.
      Halla los exponentes y el sketch de cada llave. Luego ejecuta Predecesor-Nodo para $q = $ `01100000` y para $q = $ `11000000`, indicando $i, y, j, \beta, e$ y $\mathrm{sk}(e)$.
    hints:
      - >-
        Los XOR de llaves consecutivas tienen su bit más alto en 4, 6, 2, 7 y 6 (bits numerados desde 0 a la derecha).
      - >-
        Exponentes $\{2, 4, 6, 7\}$: el sketch toma los bits 7, 6, 4, 2 (de más a menos significativo).
    solution: |-
      **Exponentes.** XOR de consecutivas: `00011111` (msb 4), `01111010` (6), `00000111` (2), `11011011` (7), `01110111` (6). Exponentes $c_0..c_3 = 2, 4, 6, 7$.

      **Sketches** (bits 7, 6, 4, 2): $x_0 \to 0001$, $x_1 \to 0010$, $x_2 \to 0100$, $x_3 \to 0101$, $x_4 \to 1011$, $x_5 \to 1100$. Crecen igual que las llaves.

      **q = `01100000`.** $\mathrm{sk}(q) = 0100$; hay 3 sketches $\le 0100$, $i = 2$. Entre $x_2 = $ `01001000` y $x_3 = $ `01001111`, $q \oplus x_2 = $ `00101000` es menor: $y = x_2$. $j = \mathrm{msb}(00101000) = 5$, $\beta = 1$. $e = $ `010` + `0` + `1111` = `01011111`, $\mathrm{sk}(e) = 0111$. Sketches $\le 0111$: 4, respuesta índice 3: **`01001111`** ($= 79$, el predecesor real de 96).

      **q = `11000000`.** $\mathrm{sk}(q) = 1100$; los 6 sketches son $\le$, $i = 5$, sólo hay $x_5 = $ `11100011`: $y = x_5$. $q \oplus y = $ `00100011`, $j = 5$, $\beta = 0$. $e = $ `11` + `1` + `00000` = `11100000`, $\mathrm{sk}(e) = 1100$. Sketches $< 1100$: 5, respuesta índice 4: **`10010100`** ($= 148$, el predecesor real de 192).
  - level: 6
    etiqueta: "Simulacro · P3 Enteros · (b) Análisis"
    href: "/structures/fusion-tree"
    statement: >-
      (S3b) Un nodo de un Fusion Tree guarda $k = w^{1/5}$ llaves y responde un predecesor entre ellas en $O(1)$ con operaciones sobre palabras de $w$ bits. Demuestra que el predecesor en un árbol de $n$ llaves cuesta $O(\log_w n)$. Con $n = 2^{60}$ y $w = 2^{15}$ calcula $k$, la profundidad del árbol y compáralas con un BST balanceado ($\lg n$) y con una vEB ($\lg w$); comenta el factor constante que aparece.
    hints:
      - >-
        El árbol tiene grado $k + 1$: su altura es $\log_{k+1} n$.
      - >-
        $\lg k = \tfrac15 \lg w$.
    solution: |-
      **Cota.** Cada nodo tiene $k$ llaves y $k + 1$ hijos, así que la altura es $\log_{k+1} n \le \frac{\lg n}{\lg k} = \frac{\lg n}{\frac15\lg w} = 5\log_w n$. En cada nodo el predecesor local cuesta $O(1)$ y decide a qué hijo bajar: total $O(\log_w n)$.

      **Números.** $k = (2^{15})^{1/5} = 2^3 = 8$ llaves por nodo. Profundidad $\approx \log_8 2^{60} = 60/3 = 20$ (con grado 9, $\approx 19$). BST balanceado: $\lg n = 60$. vEB: $\lg w = 15$.

      **El factor constante.** $\log_w n = 60/15 = 4$, pero la profundidad real es $5 \log_w n = 20$: el exponente $1/5$ multiplica por 5. Con estos valores el Fusion Tree (20 niveles, cada uno con varias operaciones de palabra: sketch, multiplicación, comparación paralela, msb) es peor que vEB (15) aunque mucho mejor que un BST (60). Fusion conviene cuando $w$ es muy grande frente a $\lg n$, porque entonces $\log_w n$ cae por debajo de $\lg w$.
  - level: 5
    etiqueta: "Simulacro · P3 Enteros · (c) Diseño"
    href: "/structures/fusion-tree"
    statement: >-
      (S3c) Los sketches de las llaves del contexto son $0001, 0010, 0100, 0101, 1011, 1100$ ($r = 4$ bits). El nodo los guarda en una sola palabra, cada uno en un bloque de $r + 1 = 5$ bits con un centinela 1 al frente. Para $q = $ `01100000`, con $\mathrm{sk}(q) = 0100$: escribe la palabra del nodo $W$ (30 bits), la palabra con $\mathrm{sk}(q) + 1$ replicado en los 6 bloques, el resultado de la resta y los centinelas que sobreviven; muestra cómo una multiplicación por $0\cdots01\,0\cdots01\cdots$ (un 1 al final de cada bloque) los suma, y deduce cuántas llaves tienen $\mathrm{sk} \le \mathrm{sk}(q)$. Explica por qué no hay préstamos entre bloques.
    hints:
      - >-
        El centinela de un bloque sobrevive a la resta si y sólo si $\mathrm{sk}(x_i) \ge \mathrm{sk}(q) + 1$, es decir, $\mathrm{sk}(x_i) > \mathrm{sk}(q)$.
      - >-
        Después de aislar los centinelas y desplazarlos al final de su bloque, multiplicar por la constante acumula la suma en el bloque más alto.
    solution: |-
      - $W$ = `10001 10010 10100 10101 11011 11100`
      - $\mathrm{sk}(q)+1 = 0101$ replicado: `00101 00101 00101 00101 00101 00101`
      - $W - $ réplica = `01100 01101 01111 10000 10110 10111`
      - Máscara de centinelas (`10000` en cada bloque): sobreviven los de los bloques 4, 5 y 6, es decir los sketches $0101, 1011, 1100$, los $> \mathrm{sk}(q)$.

      **Suma por multiplicación.** Se aíslan los centinelas ($\wedge$ `10000…`), se desplazan 4 bits para dejarlos al final de cada bloque y se multiplica por `00001 00001 00001 00001 00001 00001`: cada producto parcial desplaza la palabra un bloque, y en el bloque más alto se acumula la suma de todos los centinelas. El bloque alto vale $3$ (cabe en 5 bits porque la suma es $\le 6$).

      **Conteo.** Sobreviven 3 centinelas, así que $6 - 3 = 3$ llaves tienen $\mathrm{sk} \le \mathrm{sk}(q)$, e $i = 2$ como en la parte (a).

      **Sin préstamos.** Cada bloque de $W$ vale $1\,s_i \ge 16$ y lo que se le resta, $\mathrm{sk}(q) + 1 \le 16$: el resultado de cada bloque es $\ge 0$ y nunca pide prestado al bloque de al lado. El centinela es exactamente quien absorbe la resta.
  - level: 4
    etiqueta: "Simulacro · P3 Enteros · (d) Profundidad"
    href: "/structures/fusion-tree"
    statement: >-
      (S3d) Chris propone saltarse la corrección con el prefijo común más largo: devolver siempre la llave $x_i$ con $i = (\#\{\mathrm{sk} \le \mathrm{sk}(q)\}) - 1$. Para las llaves del contexto, ¿qué devuelve para $q = $ `01100000` y para $q = $ `11000000`? ¿Cuál es el predecesor real de cada una? Explica por qué el sketch es correcto para las llaves y no para consultas arbitrarias, y qué información adicional usa la corrección.
    hints:
      - >-
        Ya calculaste $i$ en la parte (a) para ambas consultas.
      - >-
        El sketch sólo mira los bits de ramificación de las llaves; $q$ puede salirse del trie en un bit que no es de ramificación.
    solution: |-
      - $q = $ `01100000` ($= 96$): $i = 2$, Chris devuelve $x_2 = $ `01001000` ($= 72$). El predecesor real es `01001111` ($= 79$). **Incorrecto.**
      - $q = $ `11000000` ($= 192$): $i = 5$, Chris devuelve $x_5 = $ `11100011` ($= 227$), que ni siquiera es $\le q$. El real es `10010100` ($= 148$). **Incorrecto.**

      **Por qué.** Entre llaves, el orden lo decide el primer bit en que difieren, y ese bit es de ramificación: el sketch lo conserva. Una consulta $q$ puede separarse del trie en un bit $j$ que **no** es de ramificación (aquí $j = 5$); el sketch ignora ese bit y ubica a $q$ junto a llaves con las que sólo comparte bits de ramificación.

      **La corrección** usa el prefijo común más largo de $q$ con su vecino ($j = \mathrm{msb}(q \oplus y)$) y el bit $\beta$ de $q$ en esa posición: construye $e$ = prefijo común + $\beta$ + relleno, que **sí** cae en el subárbol correcto del trie, y vuelve a consultar el sketch con $e$.
  # ───────────────────────── Simulacro · P4 Static Trees ─────────────────────────
  - level: 2
    etiqueta: "Simulacro · P4 Static Trees · (a) Conocimientos"
    statement: >-
      (S4a) $\mathrm{LA}(v,k)$ es el ancestro $k$ niveles arriba de $v$. El árbol tiene raíz 1 e hijos (en este orden) 1: [2], 2: [3, 10], 3: [4], 4: [5, 11], 5: [6], 6: [7, 12], 7: [8], 8: [9, 13], 10: [14], 12: [15], 14: [16]. Sea $h(v)$ el número de nodos del camino descendente más largo desde $v$; el hijo largo es el de mayor $h$ (empate: menor etiqueta) y el árbol se descompone en caminos largos. El ladder de un camino de $\ell$ nodos es ese camino prolongado hacia arriba con hasta $\ell$ ancestros de su tope. Con $\mathrm{up}[i][v]$ el ancestro $2^i$ niveles arriba, LA-Saltos-Ladder(v, k): si $k = 0$ devuelve $v$; $i \leftarrow \lfloor \lg k\rfloor$, $u \leftarrow \mathrm{up}[i][v]$, $r \leftarrow k - 2^i$, y devuelve el nodo $r$ posiciones por encima de $u$ en el ladder de $u$.
      Escribe los caminos largos y sus ladders, los punteros $\mathrm{up}[i][9]$ y $\mathrm{up}[i][16]$ ($i = 0..3$) y ejecuta LA-Saltos-Ladder para $(9,5)$, $(15,6)$ y $(16,3)$ indicando $i$, $u$ y $r$.
    hints:
      - >-
        $h(1) = 9$: el camino largo principal es $1,2,3,4,5,6,7,8,9$.
      - >-
        Los demás caminos cuelgan de él: $\{10,14,16\}$, $\{12,15\}$, $\{11\}$, $\{13\}$.
    solution: |-
      **Alturas.** $h(9) = h(13) = h(11) = h(15) = h(16) = 1$, $h(8) = h(12) = h(14) = 2$, $h(7) = h(10) = 3$, $h(6) = 4$, $h(5) = 5$, $h(4) = 6$, $h(3) = 7$, $h(2) = 8$, $h(1) = 9$.

      **Caminos largos y ladders:**

      - $1,2,3,4,5,6,7,8,9$ (9 nodos): ladder igual (empieza en la raíz).
      - $10, 14, 16$ (3 nodos): ladder $1, 2, 10, 14, 16$ (sólo hay 2 ancestros).
      - $12, 15$ (2 nodos): ladder $5, 6, 12, 15$.
      - $11$: ladder $4, 11$.
      - $13$: ladder $8, 13$.

      **Jump pointers.** $\mathrm{up}[\cdot][9] = 8, 7, 5, 1$ (saltos de 1, 2, 4, 8). $\mathrm{up}[\cdot][16] = 14, 10, 1$, y $\mathrm{up}[3][16]$ no existe (16 está a profundidad 4).

      **Consultas.**

      - $(9, 5)$: $i = 2$, $u = \mathrm{up}[2][9] = 5$, $r = 1$. En el ladder principal, uno por encima de 5 es **4**.
      - $(15, 6)$: $i = 2$, $u = 15 \to 12 \to 6 \to 5 \to 4$, $u = 4$, $r = 2$. En el ladder de 4 (el principal), dos por encima: **2**.
      - $(16, 3)$: $i = 1$, $u = \mathrm{up}[1][16] = 10$, $r = 1$. En el ladder $1,2,10,14,16$, uno por encima de 10: **2**.
  - level: 6
    etiqueta: "Simulacro · P4 Static Trees · (b) Análisis"
    statement: >-
      (S4b) Demuestra que LA-Saltos-Ladder devuelve el ancestro correcto en $O(1)$: con $i = \lfloor \lg k\rfloor$, un salto de $2^i$ niveles lleva a un nodo $u$ con $h(u) \ge 2^i + 1$, cuyo camino largo tiene al menos $2^i + 1$ nodos, de modo que su ladder sube al menos $2^i$ más y alcanza los $k - 2^i < 2^i$ niveles restantes. Da el espacio y el tiempo de preprocesamiento de los jump pointers y de los ladders.
    hints:
      - >-
        $v$ es descendiente de $u$ a distancia $2^i$: eso acota $h(u)$ por abajo.
      - >-
        El camino largo que pasa por $u$ baja desde $u$ por hijos largos: tiene al menos $h(u)$ nodos desde $u$.
    solution: |-
      **Corrección.** $u = \mathrm{up}[i][v]$ es el ancestro $2^i$ niveles arriba de $v$, así que el camino $u \leadsto v$ tiene $2^i + 1$ nodos y $h(u) \ge 2^i + 1$. El camino largo que contiene a $u$ continúa hacia abajo desde $u$ siempre por el hijo de mayor altura, así que tiene al menos $h(u) \ge 2^i + 1$ nodos; su longitud $\ell$ cumple $\ell \ge 2^i + 1$. El ladder prolonga el camino $\ell$ ancestros por encima de su tope (o hasta la raíz), así que desde $u$ se puede subir en el ladder al menos $\ell - 1 \ge 2^i$ niveles, o llegar a la raíz. Como $r = k - 2^i < 2^i$ (porque $k < 2^{i+1}$), el ancestro pedido está en el ladder, a $r$ posiciones de $u$: el resultado es $\mathrm{LA}(v,k)$ (si $k$ no excede la profundidad de $v$).

      **Tiempo.** Un $\lfloor \lg k\rfloor$ (msb), una lectura de $\mathrm{up}$, un índice en un arreglo: $O(1)$.

      **Preprocesamiento.** Jump pointers: $\lfloor \lg n\rfloor + 1$ por nodo, $\mathrm{up}[i][v] = \mathrm{up}[i-1][\mathrm{up}[i-1][v]]$: espacio y tiempo $O(n \lg n)$. Ladders: cada uno mide a lo más el doble de su camino y los caminos parten los $n$ nodos: espacio y tiempo $O(n)$. Total $O(n \lg n)$.
  - level: 5
    etiqueta: "Simulacro · P4 Static Trees · (c) Diseño"
    statement: >-
      (S4c) Se quiere calcular $\mathrm{LCA}(u, v)$ usando sólo consultas LA: con $d_u$ y $d_v$ las profundidades (raíz a profundidad 0), se hace una búsqueda binaria sobre la profundidad $\delta \in [0, \min(d_u, d_v)]$ del mayor $\delta$ para el que los ancestros de $u$ y de $v$ a profundidad $\delta$ coinciden. Describe el procedimiento y su costo, y aplícalo al árbol del contexto para $\mathrm{LCA}(9, 16)$, indicando cada $\delta$ probado y los dos ancestros comparados.
    hints:
      - >-
        El ancestro de $u$ a profundidad $\delta$ es $\mathrm{LA}(u, d_u - \delta)$.
      - >-
        "Coinciden a profundidad $\delta$" es monótono: si coinciden en $\delta$, coinciden en toda profundidad menor.
    solution: |-
      **Procedimiento.** $lo \leftarrow 0$ (a profundidad 0 ambos ancestros son la raíz), $hi \leftarrow \min(d_u, d_v)$. Mientras $lo < hi$: $\delta \leftarrow \lceil (lo+hi)/2\rceil$; si $\mathrm{LA}(u, d_u - \delta) = \mathrm{LA}(v, d_v - \delta)$ entonces $lo \leftarrow \delta$, si no $hi \leftarrow \delta - 1$. Se devuelve $\mathrm{LA}(u, d_u - lo)$. Es correcto porque la propiedad es monótona: los ancestros comunes forman el camino raíz–LCA. Costo: $O(\lg n)$ iteraciones de $O(1)$ cada una (LA en $O(1)$): $O(\lg n)$.

      **LCA(9, 16).** $d_9 = 8$, $d_{16} = 4$; $\delta \in [0, 4]$.

      1. $\delta = 2$: $\mathrm{LA}(9, 6) = 3$ y $\mathrm{LA}(16, 2) = 10$. Distintos: $hi = 1$.
      2. $\delta = 1$: $\mathrm{LA}(9, 7) = 2$ y $\mathrm{LA}(16, 3) = 2$. Iguales: $lo = 1$.

      $lo = hi = 1$: **LCA(9, 16) = 2**.
  - level: 4
    etiqueta: "Simulacro · P4 Static Trees · (d) Profundidad"
    statement: >-
      (S4d) Chris propone responder $\mathrm{LA}(v,k)$ sólo con la descomposición en caminos largos, sin ladders ni jump pointers: se sube por el camino de $v$ y, al llegar a su tope, se salta a su padre, repitiendo hasta cubrir $k$ niveles. Demuestra que una consulta visita a lo más $O(\sqrt n)$ caminos (¿cómo crecen las longitudes de los caminos visitados?) y explica qué aportan los ladders y los jump pointers para bajar el costo.
    hints:
      - >-
        Si se sale del camino $C$ por su tope $t$ al padre $p$, el camino de $p$ desde $p$ hacia abajo es al menos tan largo como el de $t$, más $p$.
      - >-
        $1 + 2 + \dots + j \le n$ implica $j = O(\sqrt n)$.
    solution: |-
      **Crecimiento.** Sea $C_1, C_2, \dots$ la sucesión de caminos visitados y $\ell_j$ el número de nodos de $C_j$ desde el nodo en que se entra hasta abajo. Al salir de $C_j$ por su tope $t$ hacia $p = \mathrm{padre}(t)$, el hijo largo de $p$ tiene altura $\ge h(t) \ge \ell_j$, así que el camino de $p$ tiene, desde $p$, al menos $\ell_j + 1$ nodos: $\ell_{j+1} > \ell_j$. Las longitudes son estrictamente crecientes y los caminos son disjuntos: si se visitan $j$ caminos, $1 + 2 + \dots + j \le n$, es decir $j = O(\sqrt n)$. El tiempo es $O(\sqrt n)$ (cada camino se cruza en $O(1)$ con un arreglo por camino).

      **Qué aportan.** Un ladder **duplica** el alcance de un camino: tras subir por el ladder de un camino de longitud $\ell$ se llega a un nodo de altura $\ge 2\ell$, así que con ladders solos la consulta cuesta $O(\lg n)$. Los jump pointers hacen el primer salto de $2^{\lfloor \lg k\rfloor}$ niveles en $O(1)$ y dejan al nodo en un camino suficientemente largo para que **un solo** ladder termine el trabajo: $O(1)$.
  # ───────────────────────── Simulacro · P5 Strings ─────────────────────────
  - level: 2
    etiqueta: "Simulacro · P5 Strings · (a) Conocimientos"
    href: "/structures/aho-corasick"
    statement: >-
      (S5a) Aho–Corasick sobre $\Sigma = \{a, b, c\}$ con los patrones $\{\mathtt{ab}, \mathtt{bca}, \mathtt{abca}, \mathtt{cb}\}$: el autómata tiene el trie de los patrones, $\mathrm{fail}(v)$ (el nodo del sufijo propio más largo de la cadena de $v$ que es prefijo de algún patrón), la transición $\delta$ y $\mathrm{dic}(v)$ (el primer nodo terminal en la cadena $\mathrm{fail}(v), \mathrm{fail}(\mathrm{fail}(v)), \dots$). Se construye por BFS: para un hijo $u$ de $v$ con etiqueta $c$, $\mathrm{fail}(u) \leftarrow \delta(\mathrm{fail}(v), c)$; si $v$ no tiene hijo $c$, $\delta(v, c) \leftarrow \delta(\mathrm{fail}(v), c)$.
      Construye el trie y da, para cada nodo, fail y dic. Luego ejecuta la búsqueda sobre $T = \mathtt{abcabcbab}$: en cada posición $i$ da el estado y los patrones que terminan en $i$.
    hints:
      - >-
        Nodos: a, b, c, ab, bc, cb, abc, bca, abca. Terminales: ab, bca, abca, cb.
      - >-
        $\mathrm{fail}(\mathtt{abca}) = \mathtt{bca}$, que es terminal: $\mathrm{dic}(\mathtt{abca}) = \mathtt{bca}$.
    solution: |-
      **fail y dic** (raíz $\varepsilon$):

      - a, b, c: fail $\varepsilon$, dic nulo
      - ab (terminal): fail b, dic nulo
      - bc: fail c, dic nulo
      - cb (terminal): fail b, dic nulo
      - abc: fail bc, dic nulo
      - bca (terminal): fail a, dic nulo
      - abca (terminal): fail bca, dic **bca**

      **Búsqueda en $T = \mathtt{abcabcbab}$** (posiciones desde 0):

      - $i=0$ a: estado a; nada.
      - $i=1$ b: ab; termina **ab**.
      - $i=2$ c: abc; nada.
      - $i=3$ a: abca; terminan **abca** y, por dic, **bca**.
      - $i=4$ b: $\delta(\mathtt{abca}, b) = \delta(\mathtt{bca}, b) = \delta(\mathtt a, b) =$ ab; termina **ab**.
      - $i=5$ c: abc; nada.
      - $i=6$ b: $\delta(\mathtt{abc}, b) = \delta(\mathtt{bc}, b) = \delta(\mathtt c, b) =$ cb; termina **cb**.
      - $i=7$ a: $\delta(\mathtt{cb}, a) = \delta(\mathtt b, a) = \delta(\varepsilon, a) =$ a; nada.
      - $i=8$ b: ab; termina **ab**.
  - level: 6
    etiqueta: "Simulacro · P5 Strings · (b) Análisis"
    href: "/structures/aho-corasick"
    statement: >-
      (S5b) Demuestra que Construir-AC calcula correctamente $\mathrm{fail}(u)$ (el nodo del trie que corresponde al sufijo propio más largo de la cadena de $u$ que es un prefijo de algún patrón) y $\delta$, y que su costo es $O(\lvert\Sigma\rvert \cdot \sum_i \lvert P_i\rvert)$ ($O(\sum_i \lvert P_i\rvert)$ si sólo se calculan los fail). Sugerencia: induce sobre la profundidad de los nodos.
    hints:
      - >-
        Invariante: cuando se desencola $v$, todos los nodos de profundidad menor ya tienen fail y $\delta$ correctos, con $\delta(x, c)$ = el nodo del sufijo más largo de $\mathrm{str}(x)c$ que está en el trie.
      - >-
        Todo sufijo propio de $\mathrm{str}(v)c$ que está en el trie es de la forma $s\,c$ con $s$ sufijo de $\mathrm{str}(v)$ en el trie.
    solution: |-
      **Invariante.** Para cada nodo $x$ ya procesado y cada $c$: $\delta(x, c)$ es el nodo del sufijo más largo de $\mathrm{str}(x)\,c$ que es un nodo del trie (prefijo de algún patrón). BFS procesa por profundidad creciente.

      **Base.** Profundidad 0 (raíz): $\delta(\varepsilon, c)$ es el hijo $c$ si existe, si no la raíz: correcto. Los hijos de la raíz tienen fail $= \varepsilon$, que es correcto porque su único sufijo propio es la cadena vacía.

      **Paso.** Sea $u$ hijo de $v$ por $c$. Un sufijo propio de $\mathrm{str}(u) = \mathrm{str}(v)\,c$ que es nodo del trie es $s\,c$ con $s$ sufijo propio de $\mathrm{str}(v)$, y $s$ es nodo del trie (prefijo de un prefijo). El más largo de tales $s$ cuya extensión por $c$ existe se obtiene recorriendo la cadena de fail desde $\mathrm{fail}(v)$, y eso es exactamente lo que resume $\delta(\mathrm{fail}(v), c)$: $\mathrm{fail}(v)$ tiene profundidad menor que $v$, así que ya fue procesado y su $\delta$ es correcto por hipótesis. Por eso $\mathrm{fail}(u) = \delta(\mathrm{fail}(v), c)$ es correcto. Si $v$ no tiene hijo $c$, el sufijo más largo de $\mathrm{str}(v)\,c$ en el trie es propio y por el mismo argumento es $\delta(\mathrm{fail}(v), c)$.

      **Costo.** El trie tiene a lo más $1 + \sum_i \lvert P_i\rvert$ nodos y cada uno se desencola una vez y hace $\lvert\Sigma\rvert$ asignaciones $O(1)$: $O(\lvert\Sigma\rvert \sum_i \lvert P_i\rvert)$. Si sólo se calculan los fail (con el bucle clásico que sigue la cadena de fail), por cada patrón la profundidad del fail sube a lo más 1 por carácter y cada paso de la cadena la baja: $O(\lvert P_i\rvert)$ por patrón, $O(\sum_i \lvert P_i\rvert)$ en total.
  - level: 5
    etiqueta: "Simulacro · P5 Strings · (c) Diseño"
    href: "/structures/aho-corasick"
    statement: >-
      (S5c) Se quiere indicar, para cada posición de un texto, el patrón más largo que termina allí (para filtrar un diccionario). Diseña el procedimiento con el autómata del contexto (qué se lee en cada estado) y su costo en función de $\lvert T\rvert$, y aplícalo a $T = \mathtt{bcabcab}$.
    hints:
      - >-
        En la posición $i$ el estado $v$ es el sufijo más largo del texto leído que es prefijo de un patrón.
      - >-
        Si $v$ no es terminal, el patrón más largo que termina en $i$ es $\mathrm{dic}(v)$.
    solution: |-
      **Procedimiento.** En cada posición se avanza $v \leftarrow \delta(v, T[i])$ y se responde: $v$ si es terminal; si no, $\mathrm{dic}(v)$ (o "ninguno" si es nulo). Es correcto porque los patrones que terminan en $i$ son exactamente los terminales de la cadena $v, \mathrm{fail}(v), \dots$, ordenados de más largo a más corto; el primero es el pedido. Costo $O(1)$ por posición: $O(\lvert T\rvert)$, sin recorrer la cadena dic.

      **$T = \mathtt{bcabcab}$:**

      - $i=0$ b: estado b, ninguno.
      - $i=1$ c: bc, ninguno.
      - $i=2$ a: bca (terminal): **bca**.
      - $i=3$ b: ab: **ab**.
      - $i=4$ c: abc, dic nulo: ninguno.
      - $i=5$ a: abca (terminal): **abca** (también termina bca, pero es más corto).
      - $i=6$ b: ab: **ab**.
  - level: 4
    etiqueta: "Simulacro · P5 Strings · (d) Profundidad"
    href: "/structures/aho-corasick"
    statement: >-
      (S5d) Chris propone no calcular fail: cuando el nodo actual no tiene el hijo $c$, reiniciar en la raíz y procesar de nuevo el mismo carácter $c$. Con el único patrón $\mathtt{aab}$ y el texto $T = \mathtt{aaab}$, ¿qué ocurre con la variante? ¿Cuál es el resultado correcto? ¿Qué información de fail se pierde?
    hints:
      - >-
        Simula: tras leer "aa" el nodo es aa; llega otra a.
      - >-
        $\mathtt{aab}$ aparece en $T$ empezando en la posición 1.
    solution: |-
      **Variante.** $i=0$ a: nodo a. $i=1$ a: nodo aa. $i=2$ a: aa no tiene hijo a; reinicia en la raíz y procesa a: nodo a. $i=3$ b: a no tiene hijo b; reinicia y procesa b: la raíz no tiene hijo b, queda en la raíz. **No reporta nada.**

      **Correcto.** $\mathtt{aab}$ ocurre en $T$ desde la posición 1 (termina en la 3): una ocurrencia.

      **Qué se pierde.** Al fallar en el estado aa con la letra a, lo leído $\mathtt{aaa}$ tiene como sufijo $\mathtt{aa}$, que sigue siendo prefijo del patrón. $\mathrm{fail}(\mathtt{aa}) = \mathtt a$ conserva ese progreso ($\delta(\mathtt{aa}, a) = \mathtt{aa}$). Reiniciar descarta todo lo leído salvo el carácter actual, es decir, olvida que un sufijo del texto leído ya es prefijo de un patrón. Es el mismo error que KMP evita con $\pi$.
  # ───────────────────────── Simulacro · P6 Dynamic Graphs ─────────────────────────
  - level: 2
    etiqueta: "Simulacro · P6 Dynamic Graphs · (a) Conocimientos"
    href: "/structures/heavy-light-decomposition"
    visualization:
      type: tree
      steps:
        - note: >-
            El árbol ponderado del enunciado, enraizado en 1: cada arista lleva su peso w.
          nodes:
            - { id: "1", value: "1", parent: null }
            - { id: "2", value: "2", parent: "1", edgeLabel: "4" }
            - { id: "3", value: "3", parent: "1", edgeLabel: "8" }
            - { id: "4", value: "4", parent: "2", edgeLabel: "6" }
            - { id: "5", value: "5", parent: "2", edgeLabel: "3" }
            - { id: "6", value: "6", parent: "3", edgeLabel: "7" }
            - { id: "7", value: "7", parent: "6", edgeLabel: "5" }
    statement: >-
      (S6a) En la Heavy-Light Decomposition, $s(v)$ es el tamaño del subárbol de $v$ y el hijo pesado es el de mayor subárbol (empate: menor índice); los vértices se numeran con un DFS que visita primero al hijo pesado y se usa un segment tree sobre ese orden. El árbol ponderado, enraizado en 1, tiene aristas $(u, v, w)$: $(1,2,4)$, $(1,3,8)$, $(2,4,6)$, $(2,5,3)$, $(3,6,7)$, $(6,7,5)$. Indica los tamaños, las aristas pesadas y ligeras, las cadenas y la posición de cada vértice. Determina el máximo peso de arista en los caminos de 4 a 7 y de 4 a 5.
    hints:
      - >-
        $s(2) = s(3) = 3$: el empate en la raíz se rompe a favor de 2.
      - >-
        El peso de la arista $(\mathrm{padre}(v), v)$ se guarda en la posición de $v$.
    solution: |-
      **Tamaños.** $s(1) = 7$, $s(2) = 3$, $s(3) = 3$, $s(6) = 2$, $s(4) = s(5) = s(7) = 1$.

      **Pesadas:** $(1,2)$ (empate 3–3, menor índice), $(2,4)$ (empate 1–1), $(3,6)$, $(6,7)$. **Ligeras:** $(1,3)$, $(2,5)$.

      **Cadenas:** $[1, 2, 4]$, $[5]$, $[3, 6, 7]$.

      **Posiciones** (DFS pesado primero): $1 \to 1$, $2 \to 2$, $4 \to 3$, $5 \to 4$, $3 \to 5$, $6 \to 6$, $7 \to 7$. En la posición de $v$ se guarda el peso de la arista a su padre: pos 2: 4, pos 3: 6, pos 4: 3, pos 5: 8, pos 6: 7, pos 7: 5 (la raíz, neutro).

      **Máximo 4–7.** Cabezas: 1 (de 4) y 3 (de 7); 3 es más profunda: se consulta $[5, 7]$ (aristas $1\text{-}3, 3\text{-}6, 6\text{-}7$: 8, 7, 5) y se sube a 1. Misma cadena con 4: se consulta $[2, 3]$ (aristas $1\text{-}2, 2\text{-}4$: 4, 6), excluyendo la posición del LCA 1. Máximo **8**.

      **Máximo 4–5.** Cabeza de 5 es 5 (más profunda): $[4,4]$ (arista $2\text{-}5$: 3), sube a 2. Misma cadena que 4: $[3,3]$ (arista $2\text{-}4$: 6). Máximo **6**.
  - level: 6
    etiqueta: "Simulacro · P6 Dynamic Graphs · (b) Análisis"
    href: "/structures/heavy-light-decomposition"
    statement: >-
      (S6b) Demuestra que, para cualquier vértice $v$, si $u$ es un hijo ligero de $v$, entonces $s(u) < s(v)/2$. Úsalo para demostrar que cualquier camino entre dos vértices se descompone en $O(\log n)$ intervalos de cadenas. Si cada consulta de máximo sobre un intervalo se resuelve con un segment tree en $O(\log n)$, demuestra que una consulta de máximo en un camino cuesta $O(\log^2 n)$ y una actualización del peso de una arista cuesta $O(\log n)$.
    hints:
      - >-
        El hijo pesado $h$ cumple $s(h) \ge s(u)$, y $s(v) \ge 1 + s(h) + s(u)$.
      - >-
        Un camino $u \leadsto v$ es $u \leadsto \mathrm{LCA}$ más $\mathrm{LCA} \leadsto v$.
    solution: |-
      **Hijo ligero.** Sea $h$ el hijo pesado de $v$: $s(h) \ge s(u)$. Como $v$, $h$ y $u$ cuentan en $s(v)$, $s(v) \ge 1 + s(h) + s(u) \ge 1 + 2s(u) > 2s(u)$.

      **Intervalos.** Al subir desde un nodo hacia la raíz, cada arista ligera al menos duplica el tamaño del subárbol, que no pasa de $n$: hay a lo más $\lg n$ aristas ligeras, así que el ascenso cruza a lo más $\lg n + 1$ cadenas, y cada cadena aporta un intervalo contiguo $[\mathrm{pos}(\mathrm{tope}), \mathrm{pos}(x)]$. Un camino $u \leadsto v$ es la unión de los ascensos de $u$ y de $v$ hasta el LCA: a lo más $2(\lg n + 1) = O(\log n)$ intervalos.

      **Consulta.** $O(\log n)$ intervalos, cada uno con un máximo en el segment tree en $O(\log n)$: $O(\log^2 n)$.

      **Actualización.** El peso de la arista $(\mathrm{padre}(v), v)$ vive en una sola posición, $\mathrm{pos}(v)$: es una actualización puntual del segment tree, $O(\log n)$.
  - level: 5
    etiqueta: "Simulacro · P6 Dynamic Graphs · (c) Diseño"
    href: "/structures/heavy-light-decomposition"
    statement: >-
      (S6c) Se mantiene el árbol con pesos en sus aristas mediante HLD y un segment tree, con Actualizar(u, v, w) (cambia el peso de la arista a $w$) y Maximo(u, v) (máximo peso en el camino). Inicialmente el árbol es el de (a). Procesa en orden: Actualizar(3, 6, 10), Maximo(4, 7), Actualizar(2, 5, 9), Maximo(4, 5). Indica el resultado de cada consulta y cómo se representa cada operación sobre el segment tree.
    hints:
      - >-
        La arista $(3,6)$ vive en la posición de 6 y la $(2,5)$ en la de 5.
      - >-
        Reutiliza los intervalos de la parte (a): no cambian, porque la forma del árbol no cambia.
    solution: |-
      - **Actualizar(3, 6, 10):** el hijo es 6, se hace una actualización puntual en $\mathrm{pos}(6) = 6$: el valor pasa de 7 a 10.
      - **Maximo(4, 7):** intervalos $[5,7]$ (8, 10, 5) y $[2,3]$ (4, 6): máximo **10**.
      - **Actualizar(2, 5, 9):** actualización puntual en $\mathrm{pos}(5) = 4$: de 3 a 9.
      - **Maximo(4, 5):** intervalos $[4,4]$ (9) y $[3,3]$ (6): máximo **9**.

      Cada Actualizar es un cambio de hoja más la recomputación de sus $O(\log n)$ ancestros en el segment tree; cada Maximo son $O(\log n)$ consultas de rango combinadas con $\max$.
  - level: 4
    etiqueta: "Simulacro · P6 Dynamic Graphs · (d) Profundidad"
    href: "/structures/heavy-light-decomposition"
    statement: >-
      (S6d) Chris propone resolver Maximo(u, v) recorriendo explícitamente todas las aristas del camino entre $u$ y $v$, sin HLD. ¿Cuál es su complejidad en el peor caso? Construye una familia de árboles y una secuencia de consultas para la cual cada operación cueste $\Theta(n)$. Compara con HLD y segment tree.
    hints:
      - >-
        El peor caso es un camino largo entre los dos nodos.
      - >-
        En una cadena de $n$ nodos, ¿cuánto mide el camino de un extremo al otro?
    solution: |-
      **Peor caso.** Recorrer el camino cuesta su longitud, hasta $n - 1$ aristas: $\Theta(n)$ por consulta (la actualización sí es $O(1)$).

      **Familia.** La cadena $1 - 2 - \cdots - n$ (o una "escoba": una cadena de $n/2$ nodos con $n/2$ hojas en un extremo). Las consultas Maximo$(1, n)$ repetidas $q$ veces recorren $n - 1$ aristas cada una: $\Theta(qn)$.

      **Comparación.** Con HLD + segment tree cada consulta cuesta $O(\log^2 n)$ y cada actualización $O(\log n)$, tras $O(n)$ de preprocesamiento: para $q$ consultas $O(n + q \log^2 n)$ frente a $\Theta(qn)$. (En la cadena, de hecho, HLD da una sola cadena y la consulta es un único rango, $O(\log n)$.) La propuesta de Chris sólo conviene si casi todo son actualizaciones o los caminos son cortos.
---

Esta página reúne los dos documentos de preparación que el profesor entregó en la semana 15: la **lista de ejercicios para el examen final** (32 ejercicios, no evaluada) y el **simulacro de examen final** del 13 de noviembre (6 problemas de 10 puntos, cada uno con partes de conocimientos, análisis, diseño y profundidad).

Los PDF no traen soluciones. Las de esta página son **resolución propia**: cada respuesta numérica (Greedy, Wilber-1, cruces de Tango, PMA, sketches, vEB, X-fast, tablas de KMP y Aho–Corasick, SA y LCP, Heavy-Light, caminos largos y ladders, cambios de hijo preferido) se verificó con un script. Se usan siempre las convenciones del enunciado; cuando difieren de las de una lámina, manda el enunciado.

> **Nota de apoyo** (no está en las diapositivas): *Level Ancestor* (caminos largos, ladders y jump pointers) aparece en la lista y en el simulacro, pero no en ninguna lámina del curso. Esas soluciones usan sólo las definiciones que da el propio enunciado.

Pistas progresivas antes de cada solución: intenta el ejercicio primero.
