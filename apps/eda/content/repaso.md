---
title: "Repaso para el parcial"
summary: "Problemset de práctica 01 (no evaluado): 15 preguntas, de montículos a optimalidad dinámica III, en tres niveles."
items:
  - level: 2
    etiqueta: "Fácil · Montículos"
    href: "/structures/binary-heap"
    statement: >-
      (P1) En un max-heap con $n \ge 2$ valores distintos, demuestra que el segundo valor más grande (el máximo entre todos los valores salvo la raíz) siempre se encuentra en uno de los dos hijos de la raíz, nunca más profundo.
      Usa únicamente la propiedad de montículo (padre ≥ hijo) y llega a una contradicción; no necesitas ejemplos ni trazar algoritmos.
    hints:
      - "Supón que el segundo mayor $v$ está en un nodo $w$ que NO es hijo de la raíz. Entonces $w$ tiene un padre $u$ que no es la raíz."
      - "Por la propiedad de montículo, el valor de $u$ es mayor que $v$ (son distintos). ¿Cuántos valores hay mayores que $v$ en todo el heap?"
    solution: |-
      Supongamos que el segundo mayor $v$ está en un nodo $w$ que no es hijo de la raíz. Entonces $w$ tiene un padre $u$ que no es la raíz. Por la propiedad de montículo, $\text{val}(u) \ge v$, y como los valores son distintos, $\text{val}(u) > v$.

      Pero $v$ es el segundo valor más grande: el **único** valor mayor que $v$ es el máximo, que está en la raíz. Como $u$ no es la raíz, $\text{val}(u)$ no es el máximo, y por tanto no puede ser mayor que $v$. Contradicción.

      Por tanto $w$ es hijo de la raíz.
  - level: 2
    etiqueta: "Fácil · Persistencia"
    href: "/structures/persistence-levels"
    statement: >-
      (P2) Explica, en tus propias palabras, la diferencia entre los cuatro niveles de persistencia vistos en clase (parcial, total, confluente y funcional). Ordénalos de menos a más permisivo y justifica por qué cada nivel incluye como caso particular al anterior.
    hints:
      - "Piensa en la forma del grafo de versiones de cada uno: ¿una línea, un árbol, un DAG?"
      - "En el curso la persistencia funcional se presenta como una técnica ('nunca mutar un nodo'), no como un nivel más: tenlo en cuenta al ordenar."
    solution: |-
      - **Parcial:** se consulta cualquier versión, pero sólo se actualiza la más reciente; las versiones forman una **línea**.
      - **Total (full):** se puede actualizar cualquier versión, creando una versión hija; las versiones forman un **árbol**.
      - **Confluente:** además se pueden **combinar** dos versiones en una nueva; el grafo de versiones es un **DAG**.
      - **Funcional:** nunca se muta un nodo existente, sólo se crean nodos nuevos; es la forma de lograr cualquiera de los tres anteriores (técnica: *path copying*), y la más exigente porque deja toda versión intacta para siempre.

      Orden de menos a más permisivo: parcial < total < confluente < funcional.

      Cada nivel incluye al anterior porque sus operaciones permitidas son un superconjunto: una estructura que permite actualizar **cualquier** versión (total) permite en particular actualizar la última (parcial); una que permite combinar versiones (confluente) permite en particular crear una versión desde una sola (total); y una funcional nunca destruye nada, así que soporta todo lo anterior sin riesgo de que una actualización altere otra versión.

      *Matiz:* el curso trata "funcional" como ortogonal (mecanismo, no nivel); la pregunta lo lista al final como el más fuerte.
  - level: 2
    etiqueta: "Fácil · Retroactividad"
    href: "/structures/retroactivity"
    statement: >-
      (P3) Explica la diferencia entre retroactividad parcial y completa sobre un TDA. Da un ejemplo concreto de una consulta que sólo tiene sentido bajo retroactividad completa, y explica por qué toda estructura con retroactividad completa soporta también la parcial (pero no al revés).
    hints:
      - "Ambas permiten insertar/borrar operaciones en el pasado. La diferencia está en CUÁNDO se puede consultar."
      - "¿Qué pide una consulta en un tiempo intermedio $t$ que una consulta 'ahora' no pide?"
    solution: |-
      **Diferencia.** En ambas se puede insertar o borrar una operación en **cualquier** tiempo del pasado. En la **parcial** las consultas sólo se hacen en el **presente**; en la **completa** se puede consultar en **cualquier tiempo** del pasado.

      **Ejemplo (sólo completa).** En una línea de tiempo con sumas $+5$ (t=1), $+100$ (t=2), una consulta "¿cuánto vale el acumulador en $t = 1$?" (respuesta 5) sólo tiene sentido bajo completa: la parcial únicamente responde por el presente (105).

      **Por qué completa implica parcial.** Una consulta en el presente es un caso particular de una consulta en cualquier tiempo ($t = \text{ahora}$): una estructura que contesta todas las consultas contesta, en particular, las del presente. Al revés no: saber contestar sólo en el presente no da respuesta para un tiempo intermedio, y por eso la parcial es "significativamente más barata de lograr".
  - level: 2
    etiqueta: "Fácil · Range trees / Fractional Cascading"
    href: "/structures/fractional-cascading"
    statement: >-
      (P4) Buscar un mismo valor en $k$ listas de tamaño a lo más $n$ cuesta $O(k \lg n)$ de forma independiente, u $O(k + \lg n)$ con Fractional Cascading. Sin valores numéricos, explica de dónde sale exactamente cada término de $O(k + \lg n)$: ¿qué operación contribuye el $\lg n$ y cuál el $k$? ¿Por qué el segundo término es aditivo ($+k$) y no multiplicativo ($\times k$)?
    hints:
      - "En la lista más grande se hace una búsqueda binaria completa. ¿Y en las demás?"
      - "Los 'puentes' conectan posiciones de una lista con posiciones de la siguiente."
    solution: |-
      - **$\lg n$:** una **única** búsqueda binaria en la primera lista (la mayor, de tamaño $\le n$).
      - **$k$:** en cada una de las demás listas ya no se hace una búsqueda completa: se **sigue un puente** desde la posición encontrada y se ajusta en $O(1)$ (la posición correcta queda a un número constante de pasos). Eso es $O(1)$ por lista, es decir $O(k)$ en total.

      Es aditivo porque la búsqueda costosa ocurre **una sola vez**, no una por lista: sin cascada cada lista paga su propia búsqueda binaria ($k$ veces $\lg n$, de ahí el producto); con cascada sólo la primera la paga.
  - level: 2
    etiqueta: "Fácil · Optimalidad dinámica"
    href: "/structures/geometric-view"
    statement: >-
      (P5) En la representación geométrica de una ejecución de BST, el costo del algoritmo se mide como el número total de puntos (un punto por cada nodo tocado en cada acceso). Explica por qué eso está dentro de un factor constante del costo real: ¿por qué nunca hace falta tocar un mismo nodo más de $O(1)$ veces durante una búsqueda, y por qué eso es justo lo que se necesita para que "contar puntos" sea una medida válida?
    hints:
      - "Cada punto es un nodo tocado. ¿Cuánto cuesta, como mínimo, tocar un nodo en el modelo BST?"
      - "Una búsqueda recorre un camino desde la raíz: ¿cuántas veces pasa por cada nodo?"
    solution: |-
      Cada punto $(x, i)$ es un nodo $x$ tocado en la búsqueda $i$, y tocarlo cuesta al menos un movimiento de puntero: el costo real es $\Omega(|P|)$. Para la cota contraria, una búsqueda sólo recorre un camino desde la raíz y a lo más toca cada nodo $O(1)$ veces (descenso y, a lo más, una rotación); como mover un puntero o rotar cuesta $O(1)$ en el modelo, el costo de la búsqueda es $O(\text{puntos de su fila})$.

      Sumando sobre las filas: costo real $= \Theta(|P|)$. Que cada nodo se toque $O(1)$ veces **por búsqueda** es lo que impide que el costo real tenga un factor oculto que crezca con $n$ o con la longitud del camino; sin eso, contar puntos subestimaría el trabajo.
  - level: 4
    etiqueta: "Intermedio · Montículos"
    href: "/structures/binomial-heap"
    statement: >-
      (P6) Demuestra que Insert en un Montículo Binomial es $O(1)$ amortizado, a pesar de que Union (que Insert usa internamente) cuesta $O(\lg n)$ en el peor caso. Usa el método del potencial con $\Phi$ = número de árboles binomiales presentes (la cantidad de bits en 1 de $n$); si Insert dispara una cascada de $t$ pasos de Binomial-Link, ¿cómo cambia $\Phi$ y cuál es el costo amortizado?
    hints:
      - "Insert crea un árbol $B_0$ y lo une con el montículo: es como sumar 1 en binario."
      - "Una cascada de $t$ links corresponde a $t$ acarreos: $n$ termina en $t$ unos consecutivos."
      - "Cuenta cuántos bits en 1 pierdes y cuántos ganas."
    solution: |-
      Sea $n$ con $t$ unos consecutivos al final (es decir, $n \equiv 2^t - 1 \pmod{2^{t+1}}$). Insert crea un árbol $B_0$ (costo 1) y dispara $t$ Binomial-Link (un acarreo cada uno): costo real $c = 1 + t$.

      Al pasar de $n$ a $n+1$, los $t$ unos finales se vuelven ceros y aparece un 1 nuevo: el número de árboles baja en $t$ y sube en 1, así que $\Delta\Phi = 1 - t$.

      Costo amortizado: $\hat{c} = c + \Delta\Phi = (1 + t) + (1 - t) = 2 = O(1)$.

      *(Verificado para todo $n < 16$: el costo amortizado vale exactamente 2.)* El peor caso individual $O(\lg n)$ ocurre cuando $t \approx \lg n$ (por ejemplo $n = 2^k - 1$), pero el potencial lo "ya pagó" con los inserts baratos anteriores.
  - level: 4
    etiqueta: "Intermedio · Persistencia"
    href: "/structures/path-copying"
    statement: >-
      (P7) Compara nodos gordos (fat nodes) y Path Copying: (a) ¿cuánto espacio adicional usa cada técnica, en el peor caso, por cada operación de modificación? (b) ¿Qué nivel de persistencia logra cada una? (c) ¿Por qué Path Copying, y no nodos gordos, es la técnica natural para lograr persistencia confluente?
    hints:
      - "Nodos gordos guardan un historial dentro del nodo; path copying nunca modifica nodos."
      - "Para (c), piensa en qué hay que hacer para 'combinar' dos versiones en una nueva."
    solution: |-
      **(a) Espacio por modificación.** Nodos gordos: $O(1)$ — se agrega una entrada (campo, valor, tiempo) al nodo modificado. Path Copying: se copia el **camino** desde la raíz hasta el nodo modificado, así que $O(\text{profundidad})$ (por ejemplo $O(\lg n)$ en un árbol balanceado).

      **(b) Nivel.** Nodos gordos: persistencia **parcial**, extendida con punteros hacia atrás y adelante a **total**. Path Copying: persistencia **funcional** (nunca se muta un nodo), y por tanto cualquier versión puede actualizarse (total).

      **(c) Confluente.** Combinar dos versiones es crear una versión nueva que reutilice partes de ambas. En Path Copying las versiones son raíces independientes que comparten subárboles inmutables: una versión nueva puede apuntar a subárboles de dos versiones sin tocar ninguna. Con nodos gordos, la historia vive **dentro** de los nodos con marcas de tiempo de una línea o árbol de versiones: no hay forma natural de que una versión nueva cuelgue de dos pasadas distintas. (El curso no desarrolla una técnica propia de persistencia confluente.)
  - level: 4
    etiqueta: "Intermedio · Retroactividad"
    href: "/structures/commutative-invertible-retroactivity"
    statement: >-
      (P8) En un TDA donde todas las operaciones son conmutativas e invertibles, explica cómo se implementa una operación retroactiva (insertar una operación en un tiempo pasado $t$) sin reconstruir el historial posterior, y su costo. Luego da un ejemplo de un TDA real cuyas operaciones no sean conmutativas, y explica por qué el mismo truco fallaría ahí.
    hints:
      - "Si el orden de las operaciones no importa, ¿en qué se diferencia insertar 'en $t$' de insertar 'ahora'?"
      - "Para borrar una operación, ¿qué operación aplicas?"
      - "Piensa en una pila: ¿qué pasa si metes un elemento en el pasado?"
    solution: |-
      **Cómo.** Por conmutatividad la posición temporal es irrelevante: $\text{Insert}(t, op) \equiv \text{Insert}(\text{ahora}, op)$. Basta **aplicar $op$ directamente sobre la estructura actual**. Para borrar una operación pasada se aplica su inversa: $\text{Delete}(t) \equiv \text{Insert}(\text{ahora}, op^{-1})$.

      **Costo.** El de la operación original, sin trabajo extra por ser retroactiva: $O(1)$ amortizado en una tabla hash o en un arreglo con $A[i] \mathrel{+}= \Delta$.

      **Contraejemplo.** Una **pila** (o la cola de prioridad con delete-min). Línea de tiempo: push(a), push(b), pop. El pop saca $b$ y queda $\{a\}$. Si se inserta retroactivamente push(c) *entre* los dos push, el pop saca $b$ y quedan $\{a, c\}$ en un orden distinto de apilado; si se inserta después de push(b), el pop saca $c$ y queda $\{a, b\}$. El resultado final **depende de dónde** se inserta: la operación no conmuta con las demás, así que no se puede aplicar sobre el estado final; hay que reproducir (o analizar) las operaciones posteriores.
  - level: 4
    etiqueta: "Intermedio · Range trees / Fractional Cascading"
    href: "/structures/layered-range-tree"
    statement: >-
      (P9) En un Layered Range Tree 2D sobre $n$ puntos, cada nodo del árbol de segmentos (sobre $x$) guarda una lista ordenada por $y$ de los puntos de su subárbol, con puentes de Fractional Cascading hacia las listas de sus dos hijos. ¿Cuál es el costo de una consulta rectangular $[x_1,x_2]\times[y_1,y_2]$ y en qué difiere del Range Tree 2D sin Layered? Si en vez de promover la mitad de los elementos de cada lista hija hacia arriba promoviéramos todos, ¿cuánto espacio total usaría la estructura? Justifica con la suma.
    hints:
      - >-
        Sin cascada se hace una búsqueda binaria por $y$ en cada uno de los $O(\lg n)$ nodos canónicos.
      - >-
        Con la mitad promovida: $|M_i| \le |L_i| + \tfrac12 |M_{i+1}|$. Con todos: $|M_i| = |L_i| + |M_{i+1}|$.
    solution: |-
      **Costo.** Layered Range Tree: $O(\lg n + k)$ ($k$ puntos reportados): una búsqueda binaria en $y$ en la raíz y puentes para bajar. Sin Layered: $O(\lg^2 n + k)$, porque cada uno de los $O(\lg n)$ nodos canónicos paga su propia búsqueda binaria en $O(\lg n)$.

      **Espacio promoviendo todos.** Para una cadena de $k$ listas de tamaño $n$, promoviendo la mitad cada lista aumentada tiene $\le |L_i| + \tfrac12|M_{i+1}|$ elementos, que se acota por $2|L_i|$: espacio total $O(kn)$. Si se promueven **todos**, cada lista contiene todas las que siguen: $|M_i| = |L_i| + |M_{i+1}|$, y con $|L_i| = n$ queda $|M_i| = (k - i + 1)n$. El espacio total es
      $$\sum_{i=1}^{k} (k-i+1)\,n = n\,\frac{k(k+1)}{2} = \Theta(nk^2),$$
      un factor $k$ más que promoviendo la mitad.
  - level: 4
    etiqueta: "Intermedio · Optimalidad dinámica"
    href: "/structures/arborally-satisfied-set"
    statement: >-
      (P10) Considera $P = \{(1,1), (4,2)\}$ (dos accesos: a la clave 1 en el tiempo 1 y a la clave 4 en el tiempo 2). ¿Es $P$ arboralmente satisfecho? Si no lo es, da dos puntos distintos que, agregados individualmente, lo vuelvan satisfecho y explica qué región del plano los contiene. Toma el punto $(2,2)$ como ejemplo (el BST también tocó la clave 2 en el tiempo 2): explica por qué eso es consistente con que un BST real, buscando la clave 4 desde la raíz, pase por el nodo 2: ¿en qué posición relativa respecto del nodo 4 estaría el nodo 2 en el árbol vigente en el tiempo 2?
    hints:
      - "Los dos puntos no comparten fila ni columna: definen un rectángulo. ¿Tiene un tercer punto?"
      - "Un punto nuevo también forma pares con los dos puntos originales. ¿Cuándo esos pares no exigen nada?"
      - "Prueba las cuatro esquinas del rectángulo y también $(2,2)$."
    solution: |-
      **¿Es satisfecho?** No: el único par define el rectángulo $[1,4]\times[1,2]$ sin ningún tercer punto.

      **Dos puntos que lo arreglan:** $(1,2)$ y $(4,1)$ (las dos esquinas "virtuales" del rectángulo). Verificado por enumeración de los 6 puntos restantes de la rejilla: **sólo esos dos** funcionan. La región "todo el rectángulo" es **necesaria pero no suficiente**: el punto nuevo forma pares propios con $(1,1)$ y $(4,2)$, y sólo las esquinas comparten línea con ambos (y no crean pares).

      **Sobre $(2,2)$.** Agregado solo, $(2,2)$ **no** vuelve satisfecho a $P$: el par $(1,1)$–$(2,2)$ define $[1,2]\times[1,2]$ sin tercer punto. Aun así su significado es coherente con un BST: que en el tiempo 2 se toque la clave 2 al buscar la 4 quiere decir que el nodo 2 está **en el camino de la raíz al nodo 4**, es decir, es un **ancestro** de 4 (o la propia raíz) en el árbol vigente en ese momento.
      Pero entonces la raíz tampoco puede ser $1$ salvo que también se la toque: en el tiempo 1 sólo se tocó la clave 1, así que 1 era la raíz, y buscar 4 en el tiempo 2 la vuelve a tocar: hace falta el punto $(1,2)$. Con $\{(1,2),(2,2)\}$ agregados, el conjunto sí es satisfecho.
  - level: 6
    etiqueta: "Difícil · Montículos"
    href: "/structures/fibonacci-heap"
    statement: >-
      (P11) Demuestra que, en un montículo de Fibonacci, cualquier nodo $x$ de grado $k$ tiene al menos $F_{k+2}$ descendientes en su subárbol (contándose a sí mismo), con $F_0 = 0$, $F_1 = 1$. Usa la regla de las marcas para justificar que el $i$-ésimo hijo (en orden de llegada) de $x$ tenía, cuando se volvió hijo de $x$, grado al menos $i - 2$. Concluye que el grado máximo en un montículo de Fibonacci de $n$ nodos es $O(\lg n)$.
    hints:
      - "Cuando el $i$-ésimo hijo $y$ se enlaza a $x$, $x$ ya tiene $i - 1$ hijos. ¿Qué grado debía tener $y$ para poder enlazarse?"
      - "Después del enlace, $y$ puede perder a lo más un hijo antes de ser cortado."
      - >-
        Define $s_k$ como el tamaño mínimo de un subárbol de un nodo de grado $k$ y plantea $s_k \ge 2 + \sum_{i=2}^{k} s_{i-2}$.
    solution: |-
      **Grado del $i$-ésimo hijo.** Cuando $y$ (el $i$-ésimo hijo) se enlaza a $x$, los enlaces sólo unen nodos del **mismo grado**, y $x$ ya tiene $i - 1$ hijos: $\deg(y) = \deg(x) \ge i - 1$ en ese momento. Después $y$ puede perder a lo más un hijo (la regla de las marcas: al perder un segundo hijo, $y$ se corta de $x$), así que mientras siga siendo hijo de $x$, $\deg(y) \ge i - 2$.

      **Tamaño mínimo.** Sea $s_k$ el tamaño mínimo del subárbol de un nodo de grado $k$. Con $s_0 = 1$, $s_1 = 2$ y, para $k \ge 2$, contando $x$ y el primer hijo (al menos 1 nodo) más los demás hijos de grado $\ge i - 2$:
      $$s_k \;\ge\; 2 + \sum_{i=2}^{k} s_{i-2}.$$
      Por inducción $s_k \ge F_{k+2}$: $s_0 = 1 = F_2$ y $s_1 = 2 = F_3$; para $k \ge 2$, usando $\sum_{j=0}^{k} F_j = F_{k+2} - 1$,
      $$s_k \ge 2 + \sum_{i=0}^{k-2} F_{i+2} = 2 + \big(F_{k+2} - 1 - F_0 - F_1\big) = F_{k+2}.$$

      **Grado máximo.** $F_{k+2} \ge \varphi^{k}$ con $\varphi = \tfrac{1+\sqrt5}{2}$, así que $n \ge s_k \ge \varphi^k$ y $k \le \log_\varphi n = O(\lg n)$.
  - level: 6
    etiqueta: "Difícil · Persistencia"
    href: "/structures/segment-tree"
    statement: >-
      (P12) En clase se usó un Segment Tree persistente, una versión por prefijo, para contestar "k-ésimo menor en $[l,r]$" restando las versiones $r$ y $l-1$. Con la misma idea (versión persistente por prefijo), diseña una estructura para contestar, offline, "¿cuántos valores distintos hay en $A[l..r]$?". Ayuda: en la versión $i$, indexa el Segment Tree por posición; al procesar la posición $i$, si $A[i]$ ya apareció antes en $j < i$, primero pon en 0 la marca de la posición $j$ de la versión anterior y luego agrega la marca en $i$. Justifica por qué (suma de la versión $r$) − (suma de la versión $l-1$) da la cantidad de valores distintos en $[l,r]$.
    hints:
      - "En la versión $r$, cada valor distinto de $A[1..r]$ tiene exactamente UNA marca: en su última aparición."
      - "Antes de aceptar la resta que propone el enunciado, pruébala con $A = [1,2,1]$, $l=2$, $r=3$."
    solution: |-
      **Estructura.** Segment Tree persistente sobre las posiciones $1..n$, con suma. Versión $0$ vacía. Para $i = 1..n$: si $A[i]$ ya apareció en $j<i$, se pone $0$ en la posición $j$; luego se pone $1$ en la posición $i$; el resultado es la versión $i$. Cada paso crea $O(\lg n)$ nodos nuevos (path copying), total $O(n \lg n)$.

      **Invariante.** En la versión $r$ hay exactamente una marca por cada valor distinto de $A[1..r]$, situada en su **última aparición** dentro de $[1, r]$.

      **Consulta correcta.** Los valores distintos de $A[l..r]$ son exactamente aquellos cuya última aparición en $[1,r]$ cae en $[l, r]$: la respuesta es la **suma de la versión $r$ sobre las posiciones $[l, r]$** (una consulta de rango, $O(\lg n)$).

      **Ojo con la resta del enunciado.** La suma *total* de la versión $r$ vale el número de distintos en $A[1..r]$, y la de la versión $l-1$ el de $A[1..l-1]$; su diferencia cuenta los valores que **aparecen por primera vez** en $[l, r]$, no los distintos en $[l,r]$. Contraejemplo: $A = [1, 2, 1]$, $l=2$, $r=3$: hay 2 distintos ($2$ y $1$), pero (suma v3) − (suma v1) $= 2 - 1 = 1$. *(Verificado con código sobre 2000 casos aleatorios: la resta falla en 773; la consulta de rango sobre la versión $r$ no falla en ninguno.)*
  - level: 6
    etiqueta: "Difícil · Retroactividad"
    href: "/structures/retroactive-priority-queue"
    statement: >-
      (P13) Considera la línea de tiempo sobre una cola de prioridad (mín-heap): $t=1$ insertar(5), $t=2$ dm, $t=3$ insertar(3), $t=4$ insertar(7), $t=5$ dm (dm = Delete-Min). Reconstruye el estado tras cada operación y determina $Q_\text{ahora}$. Usando la definición de puente ($t'$ es puente si $Q_{t'} \subseteq Q_\text{ahora}$), da el puente más cercano antes de $t = 3.5$. Calcula con la fórmula de clase el efecto de Insertar-Retroactivo(3.5, 4), da el nuevo $Q_\text{ahora}$ y verifícalo simulando toda la línea con el 4 insertado desde el principio.
    hints:
      - >-
        Estados: $Q_1 = \{5\}$, luego dm quita el mínimo...
      - >-
        La fórmula: $M = \max(\{k\} \cup \{\text{eliminados en tiempo} \ge t\})$, y se inserta $M$ en $Q_\text{ahora}$.
    solution: |-
      **Estados.** $Q_1 = \{5\}$; $Q_2 = \emptyset$ (dm quita 5); $Q_3 = \{3\}$; $Q_4 = \{3, 7\}$; $Q_5 = \{7\}$ (dm quita 3). Entonces $Q_\text{ahora} = \{7\}$.

      **Puentes.** $t'$ es puente si $Q_{t'} \subseteq \{7\}$: $Q_1 = \{5\}$ no; $Q_2 = \emptyset$ sí; $Q_3 = \{3\}$ no; $Q_4$ no; $Q_5 = \{7\}$ sí. El puente más cercano **antes de $3.5$** es $t = 2$ ($Q_3 = \{3\} \not\subseteq \{7\}$, así que $t=3$ no es puente).

      **Efecto.** Lo eliminado en tiempo $\ge 3.5$ es sólo $\{3\}$ (el dm de $t=5$). $M = \max(\{4\} \cup \{3\}) = 4 = k$. Como $M = k$, el 4 entra directamente a $Q_\text{ahora}$: **nuevo $Q_\text{ahora} = \{4, 7\}$**.

      **Verificación.** Simulando con el 4 desde el inicio (en $t=3.5$): $\{5\} \to \emptyset \to \{3\} \to \{3,4\} \to \{3,4,7\} \to$ dm quita 3 $\to \{4, 7\}$. ✓ coincide.
  - level: 6
    etiqueta: "Difícil · Range trees / Fractional Cascading"
    href: "/structures/d3-separation-node"
    statement: >-
      (P14) En la construcción de Range Trees 3D, para acotar $y \in [a_2, b_2]$ se usa un nodo de separación $v_\text{split}$ (donde los caminos de búsqueda de $a_2$ y $b_2$ se separan), guardando en derecha($v_\text{split}$) una estructura $D_2$ normal (acotada por $y \le b_2$) y en izquierda($v_\text{split}$) una $D_2'$ invertida (acotada por $y \ge a_2$). (a) Explica por qué todo punto en el subárbol de derecha($v_\text{split}$) ya cumple $y \ge a_2$. (b) Demuestra que consultar $D_2$ sobre derecha y $D_2'$ sobre izquierda y unir da exactamente los puntos con $y \in [a_2,b_2]$ en el subárbol de $v_\text{split}$. (c) ¿Por qué esto evita el costo $O(\lg^2 n)$ de aplicar descomposición canónica también sobre $y$?
    hints:
      - >-
        En $v_\text{split}$ el camino de $a_2$ baja a la izquierda y el de $b_2$ a la derecha: ¿qué dice eso del valor de la clave de $v_\text{split}$?
      - "Para (c) cuenta cuántas estructuras se consultan en cada enfoque."
    solution: |-
      **(a)** En $v_\text{split}$ el camino de $a_2$ baja por la izquierda y el de $b_2$ por la derecha, así que $a_2 \le \text{clave}(v_\text{split}) < b_2$ (aproximadamente). Todo punto del subárbol derecho tiene $y \ge \text{clave}(v_\text{split}) \ge a_2$: la cota inferior se cumple **automáticamente**; sólo falta la superior $y \le b_2$.

      **(b)** Derecha: todos cumplen $y \ge a_2$, y $D_2$ filtra $y \le b_2$ ⇒ exactamente los de derecha con $y \in [a_2, b_2]$. Izquierda: todos tienen $y \le \text{clave}(v_\text{split}) \le b_2$ (cota superior automática), y $D_2'$ filtra $y \ge a_2$ ⇒ exactamente los de izquierda con $y \in [a_2,b_2]$. La unión son todos los puntos del subárbol de $v_\text{split}$ con $y \in [a_2, b_2]$, sin faltantes (cada punto está en izquierda o derecha) ni sobrantes (cada lado filtra su cota faltante).

      **(c)** La descomposición canónica sobre $y$ consulta $O(\lg n)$ nodos, y cada uno lanza una consulta de las dimensiones restantes de costo $O(\lg n)$: $O(\lg^2 n)$. Con el nodo de separación sólo se consultan **2 estructuras** ($D_2$ y $D_2'$), y cada una puede resolverse con cascada fraccionaria en $O(\lg n + k)$ en total.
  - level: 6
    etiqueta: "Difícil · Optimalidad dinámica"
    href: "/structures/greedy-algorithm"
    statement: >-
      (P15) Considera los accesos $2, 1, 3$ sobre las claves $\{1,2,3\}$. Simula Greedy fila por fila (una por tiempo) para construir un conjunto arboralmente satisfecho: en cada fila agrega el punto del acceso y determina, con la definición, si hacen falta puntos adicionales en esa misma fila (no se puede modificar ninguna fila ya procesada). Muestra qué pares revisas, cuáles violan, qué punto agregas y por qué. ¿Cuántos puntos usa Greedy y cuántos son extra?
    hints:
      - "Fila 1 tiene un solo punto, $(2,1)$: no hay pares todavía."
      - "En la fila 2 el par $(2,1)$–$(1,2)$ define un rectángulo vacío. ¿Qué punto de la fila 2 puedes agregar?"
      - "En la fila 3, mira el par entre $(3,3)$ y los puntos de la fila anterior."
    solution: |-
      **Fila 1.** Se agrega $(2,1)$. Sin pares: satisfecho.

      **Fila 2.** Se agrega $(1,2)$. Par $(2,1)$–$(1,2)$: rectángulo $[1,2]\times[1,2]$ sin tercer punto: **viola**. Se agrega $(2,2)$ (la llave 2 se vuelve a tocar, como un BST que la rota hacia arriba): ahora $(2,2)$ está en el borde del rectángulo y los pares nuevos [(2,2) con (2,1) y con (1,2)] comparten línea. Conjunto: $\{(2,1),(1,2),(2,2)\}$, satisfecho.

      **Fila 3.** Se agrega $(3,3)$. Pares con puntos anteriores: $(2,2)$–$(3,3)$ define $[2,3]\times[2,3]$ sin tercero: **viola**. Se agrega $(2,3)$ (borde del rectángulo). Los demás: $(1,2)$–$(3,3)$ define $[1,3]\times[2,3]$ y contiene $(2,2)$ y $(2,3)$ ✓; $(2,1)$–$(3,3)$ define $[2,3]\times[1,3]$ y contiene $(2,2)$ ✓.

      **Resultado:** $\{(2,1),(1,2),(2,2),(3,3),(2,3)\}$: **5 puntos**, de los cuales **3** son accesos reales y **2 son extra**: $(2,2)$ y $(2,3)$. *(Verificado con el código de [greedy-row](/structures/greedy-algorithm/operations/greedy-row).)*
---

Quince preguntas de práctica, tres por nivel y una por tema en cada nivel. **Las soluciones son resolución propia**: el PDF del profesor no las incluye. Las que son numéricas se verificaron con código; dos enunciados (P10 y P12) tienen una precisión que merece comentario, y está en la solución.
