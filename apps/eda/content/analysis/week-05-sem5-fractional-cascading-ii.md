# Sem5_Fractional_Cascading_II.pdf
semana: week-05
páginas totales: 76 (diapositivas lógicas: 34; beamer con overlays incrementales)

> Nota de lectura: 76 páginas PDF = 34 diapositivas numeradas. Las referencias `#A-B` son
> **páginas del PDF**.

## Temas cubiertos

### dominancia-2d
- título como lo llama el profesor: "El problema de dominancia" / "consulta de dominancia en 2D"
- tipo: structure (el profesor la llama `D_1` y la trata como estructura con construcción y consulta)
- diapositivas: #16-31 (definición #17-19; reformulación como rayos #20-23; construcción #24-25;
  consulta #26-29; pseudocódigo #30-31)
- qué problema resuelve (según el material, no según tú):
  "Dados n puntos (y_i, z_i) y una consulta (b2, b3), reportar todos los puntos con y_i ≤ b2 y
  z_i ≤ b3. Queremos O(lg n) tiempo, O(n) espacio." (#17)
  Por qué aparece: "Dentro de cada nodo del árbol en x, el problema que de verdad hay que resolver
  es: dado un conjunto de puntos (y,z), reportar los que cumplen y ≤ b2 y z ≤ b3 simultáneamente.
  Esto es una consulta de dominancia en 2D — un problema geométrico con nombre propio, y una
  solución propia." (#14)
  Por qué no basta un Layered Range Tree normal: "Porque en un momento vamos a necesitar muchas
  copias de esta estructura, una por nodo de otro árbol — y necesitamos que el espacio total siga
  siendo O(n) por copia, con una forma de combinarlas más adelante. Una estructura puramente
  geométrica (sin árbol anidado) es más fácil de acoplar después." (#19)
- operaciones cubiertas:
  - **Reformulación como rayos** (#20-23): "Cada punto (y_i, z_i) se convierte en un rayo vertical
    que sale de (y_i, z_i) hacia arriba (hacia z = +∞). La consulta (b2, b3) se convierte en un
    rayo horizontal que sale de (b2, b3) hacia la izquierda." (#20) — "Un punto cumple
    y_i ≤ b2 ∧ z_i ≤ b3 si y solo si su rayo vertical es atravesado por el rayo horizontal de la
    consulta." (#21)
  - **Construcción de la subdivisión del plano** (#24-25)
  - **ConsultaDominancia(S, b2, b3)** (#26-31): búsqueda binaria + caminata por caras
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | consulta de dominancia (objetivo declarado) | — | — | O(lg n + k) (#17) | O(n) (#17) |
  | paso 1: búsqueda binaria en la columna izquierda | — | — | O(lg n) (#27, #30) | — |
  | paso 2: caminar a la cara vecina | — | — | O(1) por cara (#28, #30) | — |
  | total | — | — | O(lg n + k) (#31) | O(n) segmentos (#25) |

  Justificación literal del total (#31): "Costo total: O(lg n) de la búsqueda inicial, más O(1)
  por cada cara visitada. Como se visita exactamente una cara por punto reportado (más un puñado
  de caras 'vacías'), el total es O(lg n + k)."
- estilo de análisis del profesor: otro — **conteo directo por pasos, output-sensitive**. No hay
  recurrencia, ni amortización, ni potencial. El profesor descompone el costo en "una búsqueda
  real + O(1) por paso × número de pasos" y acota el número de pasos por k (#31). Es el mismo
  patrón que usa en todo el deck (ver #54: `O(lg n) + O(1)·O(lg n) + O(k)`).
- prerrequisitos que el profesor asume o menciona explícitamente:
  búsqueda binaria (#27); fractional cascading en listas y su idea de "promover la mitad" (#24,
  referida explícitamente como "la misma idea de 'promover la mitad' que ya vimos en fractional
  cascading"); Layered Range Tree (#18); subdivisión planar y **grado acotado** de una cara
  (#24, "un número constante de vecinos"); el resultado geométrico de **Chazelle (1986)** (#25).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: la idea de "promover la mitad" de fractional cascading (#24); Chazelle (1986) para
    la subdivisión de grado acotado (#25).
  - usedBy: **D_2** la guarda en cada nodo ("Cada nodo guarda, para los puntos de su subárbol,
    una copia de la estructura de dominancia (D_1) que acabamos de construir.", #33).
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  - #22-23 "Visualizando los rayos": plano con eje horizontal `y` y eje vertical `z`. Seis rayos
    verticales (líneas turquesa con punta de flecha hacia arriba, cada una naciendo de un punto
    relleno a distinta altura). Desde la derecha, una **flecha roja punteada horizontal** que
    entra hacia la izquierda desde un punto negro, etiquetada **"consulta (b2, b3)"**.
    Pie (#23): "El rayo de la consulta atraviesa los rayos de los puntos con y ≤ b2 (a su
    izquierda) y z ≤ b3 (por debajo de su altura): exactamente los puntos dominados."
    Operación: **la consulta de dominancia**. Excelente candidato a visualización paso a paso
    (el rayo de consulta avanzando hacia la izquierda y marcando cada rayo que cruza).
  - **No hay diagrama de la subdivisión del plano** (#24-25) ni de las caras por las que se camina,
    aunque es el mecanismo de la consulta. Hueco visual notorio.
- pseudocódigo presente: transcríbelo íntegro en bloques de código

  El deck contiene **un único bloque de pseudocódigo**, repetido idénticamente en dos overlays
  (#30 como "Algoritmo 1" y #31 como "Algoritmo 2" — mismo cuerpo, el segundo sólo agrega el
  párrafo de costo debajo). Transcripción literal:

  ```
  Algoritmo 1: ConsultaDominancia(S, b2, b3)
  cara ← búsqueda binaria de b3 en la columna izquierda de S   // O(lg n)
  resultado ← lista vacía
  mientras la posición horizontal de cara es < b2 hacer
      si el borde de cara es un rayo de un punto entonces
          agregar ese punto a resultado
       cara ← cara vecina hacia la derecha                      // O(1)
  devolver resultado
  ```

  ```
  Algoritmo 2: ConsultaDominancia(S, b2, b3)
  cara ← búsqueda binaria de b3 en la columna izquierda de S   // O(lg n)
  resultado ← lista vacía
  mientras la posición horizontal de cara es < b2 hacer
      si el borde de cara es un rayo de un punto entonces
          agregar ese punto a resultado
       cara ← cara vecina hacia la derecha                      // O(1)
  devolver resultado
  ```

  (La numeración "Algoritmo 1 / Algoritmo 2" es un artefacto del contador de beamer al repetir
  el bloque en dos overlays; es el **mismo** algoritmo, no dos.)
- ejemplos concretos que usa el profesor (valores, puntos, secuencias):
  **Ninguno numérico.** El diagrama #22-23 es cualitativo (puntos sin coordenadas). Todo el deck
  trabaja con símbolos (b2, b3, a2, a3, y, z). **No hay un solo valor concreto en las 76 páginas.**
- casos límite que menciona:
  - "más un puñado de caras 'vacías'" (#31): la caminata visita algunas caras que no reportan
    punto; el profesor lo menciona explícitamente para que no rompa la cota O(lg n + k).
  - El objetivo de espacio O(n) obliga a que "no todos los segmentos llegan hasta el final:
    algunos se extienden y otros se cortan" (#24).
  - Grado acotado de cada cara como condición indispensable (#24).

### d2-acotar-x
- título como lo llama el profesor: "Paso 1: acotar x — Estructura D_2: [x1,x2] × (−∞,b2] × (−∞,b3)"
- tipo: structure
- diapositivas: #32-34
- qué problema resuelve (según el material, no según tú):
  Consultas de la forma [x1, x2] × (−∞, b2] × (−∞, b3): rango cerrado en x, dominancia en (y, z).
- operaciones cubiertas:
  - **Construcción**: "Un BST estándar sobre x. Cada nodo guarda, para los puntos de su subárbol,
    una copia de la estructura de dominancia (D_1) que acabamos de construir." (#33)
  - **Consulta**: "La consulta usa la descomposición canónica de siempre: los O(lg n) nodos
    canónicos de [x1, x2], disparando una consulta de dominancia en cada uno." (#34)
- complejidades que da el profesor:
  **No da complejidad propia para D_2.** El profesor dice explícitamente "Nada nuevo todavía — lo
  interesante empieza al agregar la segunda dimensión acotada." (#34). La cota se infiere del
  cierre general (#53-54) y de la tabla comparativa (#59-63).
- estilo de análisis del profesor: otro — **composición estructural** (descomposición canónica ×
  costo de la subestructura). Se clasifica así porque #34 sólo dice "O(lg n) nodos canónicos,
  disparando una consulta de dominancia en cada uno", sin plantear recurrencia ni amortizar.
- prerrequisitos que el profesor asume o menciona explícitamente:
  BST estándar (#33); **descomposición canónica** y "nodos canónicos" (#34, término usado sin
  redefinir — viene del deck de Fractional Cascading I); la estructura D_1 (#33).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: D_1 (dominancia 2D), una copia por nodo (#33); BST sobre x (#33).
  - usedBy: **D_3** guarda en el nodo de separación una D_2 normal y una D_2 invertida (#37-39).
- ¿tiene diagramas que pidan visualización paso a paso? **ninguno** en esta sección.
- pseudocódigo presente: **ninguno** en esta sección.
- ejemplos concretos que usa el profesor: ninguno.
- casos límite que menciona:
  Advertencia explícita de #35-36 (el "¡Piénsalo!"): si se acotara y de la forma obvia con otra
  descomposición canónica, "O(lg n) nodos canónicos en x, cada uno con O(lg n) nodos canónicos en
  y: O(lg² n) consultas. Perdimos el O(lg n) que queríamos. Necesitamos evitar la descomposición
  canónica en y por completo." (#36) — este es el caso límite que motiva D_3.

### d3-nodo-de-separacion
- título como lo llama el profesor: "Paso 2: acotar y — el nodo de separación" /
  "Estructura D_3: [x1,x2] × [a2,b2] × (−∞,b3)" / "El nodo de separación (split node)"
- tipo: structure
- diapositivas: #35-45 (motivación #35-36; estructura #37-39; por qué alcanza #40-43;
  visualización #44-45)
- qué problema resuelve (según el material, no según tú):
  Acotar y **por ambos lados** sin pagar un factor O(lg n) extra por descomposición canónica
  (#36). Consultas [x1, x2] × [a2, b2] × (−∞, b3).
- operaciones cubiertas:
  - **Construcción**: "Un árbol de rango sobre y (no sobre x). Cada nodo v de este árbol guarda
    dos estructuras satélite, sobre los puntos de sus dos hijos:
      - en derecha(v): una estructura D_2 normal (acotada por arriba, y ≤ b2);
      - en izquierda(v): una estructura D_2 invertida, D_2′ (acotada por abajo, y ≥ a2)." (#37-39)
  - **Localización del nodo de separación**: "Al buscar a2 y b2 en el árbol de y, sus caminos
    coinciden hasta un nodo v_split donde se separan —exactamente como en un árbol de rangos 1D
    clásico." (#40)
  - **Consulta (dos disparos, un solo nodo)** (#41-43):
    - "Todo derecha(v_split) ya cumple y ≥ a2 automáticamente: solo falta pedir y ≤ b2 ⇒ una
      consulta a su D_2." (#41)
    - "Todo izquierda(v_split) ya cumple y ≤ b2 automáticamente: solo falta pedir y ≥ a2 ⇒ una
      consulta a su D_2′ (invertida)." (#42)
    - "Dos consultas, en un único nodo — no O(lg n) nodos canónicos." (#43)
- complejidades que da el profesor:
  **No da cota numérica propia de D_3.** Lo que da es el argumento cualitativo: dos consultas en
  vez de O(lg n) (#43). En #47 aclara que, sin cascading, el anidamiento D_3-dentro-de-D_4 todavía
  cuesta "O(lg n) · O(lg n) + k = O(lg² n + k)".
- estilo de análisis del profesor: otro — **argumento estructural de conteo de consultas**
  (cuántas subconsultas se disparan). Se clasifica así porque #36 y #43 razonan exactamente sobre
  el *número* de consultas disparadas (O(lg²) vs 2), no sobre recurrencias ni amortización.
- prerrequisitos que el profesor asume o menciona explícitamente:
  árbol de rango 1D clásico y su **nodo de separación / split node** (#40, "exactamente como en un
  árbol de rangos 1D clásico"); descomposición canónica (#36); D_2 (#37).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: D_2 normal y D_2′ invertida como satélites (#38-39); árbol de rango sobre y (#37).
  - usedBy: **D_4** repite exactamente la misma construcción un nivel más arriba (#46).
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  - #44-45 "Visualizando el nodo de separación": diagrama de árbol con `v_split` en el centro
    arriba; a su izquierda la etiqueta "busca a2" y a su derecha "busca b2" (los dos caminos de
    búsqueda que confluyen). Debajo, dos ramas: **"izq."** y **"der."**; bajo la izquierda la
    caja **"D_2′ invertida (y ≥ a2)"** y bajo la derecha **"D_2 normal (y ≤ b2)"**.
    Pie (#45): "Los caminos de a2 y b2 se separan en v_split; de ahí en adelante ya no hace falta
    seguir bajando."
    Operación: **localización del nodo de separación y disparo de las dos consultas satélite**.
    Muy buen candidato a visualización paso a paso (los dos caminos descendiendo juntos y
    bifurcándose).
- pseudocódigo presente: **ninguno** en esta sección.
- ejemplos concretos que usa el profesor: ninguno numérico.
- casos límite que menciona:
  - El caso que se evita (#36): la descomposición canónica en y daría O(lg² n) consultas.
  - Implícito pero no discutido: qué pasa si v_split es una hoja, o si a2 y b2 caen del mismo
    lado — el profesor no lo trata.

### d4-acotar-z
- título como lo llama el profesor: "Paso 3: acotar z — la misma idea, un nivel más" /
  "Estructura D_4: [x1,x2] × [a2,b2] × [a3,b3]"
- tipo: structure
- diapositivas: #46-47
- qué problema resuelve (según el material, no según tú):
  La caja 3D completa [x1,x2] × [a2,b2] × [a3,b3] — la pregunta única de toda la clase (#2).
- operaciones cubiertas:
  - **Construcción**: "Exactamente la misma construcción que D_3, pero sobre z en vez de y: un
    árbol de rango sobre z, cuyo nodo de separación guarda una estructura D_3 normal a un lado y
    una D_3 invertida al otro." (#46)
- complejidades que da el profesor:

  | estado | consulta | espacio |
  | --- | --- | --- |
  | sin cascading todavía (#47) | O(lg² n + k) | — |
  | con cascading completo (#54, #62) | O(lg n + k) | O(n lg³ n) (#57, #62) |

  #47 literal: "Tal como está, cada nivel (D_3 dentro de D_4) todavía hace su propia búsqueda
  binaria real: O(lg n) · O(lg n) + k = O(lg² n + k). Falta la pieza final."
- estilo de análisis del profesor: otro — **composición multiplicativa por niveles**
  ("O(lg n) · O(lg n) + k", #47). Ni recurrencia ni amortización.
- prerrequisitos que el profesor asume o menciona explícitamente:
  D_3 (#46); árbol de rango (#46); la noción de estructura "invertida" (#46).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  buildsOn: D_3 normal y D_3 invertida (#46). Y toda la pila: "D_4 sobre D_3 sobre D_2 sobre D_1"
  (#53).
- ¿tiene diagramas que pidan visualización paso a paso? **ninguno propio** (reutiliza mentalmente
  el diagrama de #44-45).
- pseudocódigo presente: **ninguno**.
- ejemplos concretos que usa el profesor: ninguno.
- casos límite que menciona: el estado intermedio "sin cascading todavía" (#47) — es el caso que
  la última sección arregla.

### fractional-cascading-generalizado
- título como lo llama el profesor: "Fractional Cascading generalizado" / "El grafo de cascading
  generalizado"
- tipo: algorithm (técnica)
- diapositivas: #48-55 (problema #49-50; grafo #51-52; composición #53-55)
- qué problema resuelve (según el material, no según tú):
  "Tenemos D_1, D_2, D_3, D_4 correctamente anidadas entre sí, pero cada nivel todavía re-busca
  desde cero en el nivel de abajo. Ya vimos cómo evitar exactamente eso con fractional cascading —
  solo que ahora las 'listas' no son simples arreglos, sino estructuras enteras con más de un
  vecino." (#49) → "Necesitamos generalizar fractional cascading de 'una cadena de listas' a 'un
  grafo de estructuras'." (#50)
- operaciones cubiertas:
  - **Condición de aplicabilidad** (#51): "Fractional cascading funciona en cualquier grafo donde
    cada vértice guarda un conjunto de elementos, las aristas están etiquetadas con boletos hacia
    elementos vecinos, y cada vértice tiene **grado acotado** (un número constante de vecinos).
    Bajo esas condiciones, la navegación completa cuesta O(k + lg n): una búsqueda real al entrar,
    y O(1) por cada paso."
  - **Verificación del grado acotado en esta construcción** (#52): "cada nodo del árbol en
    D_4/D_3 tiene grado acotado por **5**: su padre, sus dos hijos, y dos enlaces auxiliares hacia
    la estructura invertida gemela del mismo nodo. Eso basta para aplicar la misma idea."
  - **Composición final** (#53): "Con el grafo de cascading generalizado conectando D_4 sobre D_3
    sobre D_2 sobre D_1, una sola búsqueda binaria real al entrar por x alcanza para todos los
    niveles: cada paso hacia abajo (incluyendo los saltos entre estructura normal e invertida) es
    O(1)."
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | navegación en el grafo de cascading | — | — | O(k + lg n) (#51) | — |
  | consulta 3D completa | — | — | O(lg n + k) (#54) | O(n lg³ n) (#57) |

  Descomposición literal del costo (#54):
  ```
  O(lg n)              + O(1) · O(lg n) + O(k) = O(lg n + k)
  └ una búsqueda real    └ pasos de descenso    └ reporte
  ```
  Espacio (#57): "Cada punto aparece, en promedio, O(lg³ n) veces entre las distintas copias de
  D_1, D_2 y D_3 anidadas dentro de D_4. El espacio total es O(n lg³ n) — más que los O(n) de 2D,
  pero polinomial en lg n, no en n."

  **Tabla comparativa del profesor (#59-63):**

  | Técnica | Consulta | Espacio |
  | --- | --- | --- |
  | BSTs anidados (sin cascading) | O(lg³ n + k) | O(n) |
  | Cascading solo en la base 2D | O(lg² n + k) | O(n lg n) |
  | Cascading completo (D_1–D_4) | O(lg n + k) | O(n lg³ n) |

  Pie (#63): "Cada nivel adicional de cascading bien aplicado quita un factor de lg n del tiempo
  de consulta, al costo de un factor de lg n extra en espacio."

  **Generalización a d dimensiones (#64-66):**
  - Chazelle & Guibas (1986), con cascading completo, d ≥ 3: consulta **O(lg^{d−2} n + k)**,
    espacio **O(n lg^{d−1} n)** (#64)
  - Willard (1985); Gabow, Bentley & Tarjan (1984), layered range tree con cascading sólo en el
    nivel más interno: consulta **O(lg^{d−1} n + k)**, espacio **O(n lg^{d−1} n)** (#65)
  - "Para d = 3: lg^{d−2} n = lg n (lo que acabamos de construir) contra lg^{d−1} n = lg² n
    (la versión más simple)." (#66)
- estilo de análisis del profesor: otro — **conteo directo de pasos con grado acotado**. La
  descomposición de #54 (`una búsqueda real + O(1) por paso × O(lg n) pasos + reporte`) es un
  conteo explícito, no una recurrencia. El espacio (#57) sale de un argumento de **multiplicidad**
  ("cada punto aparece, en promedio, O(lg³ n) veces"), igual que el O(n log n) del range tree 2D
  de la semana 4. Cero amortización, cero potencial.
- prerrequisitos que el profesor asume o menciona explícitamente:
  **fractional cascading sobre listas** (#49, "Ya vimos cómo evitar exactamente eso" — es el deck
  de Fractional Cascading I); Layered Range Tree (#8); "boletos" / puentes hacia elementos vecinos
  (#51, vocabulario del deck anterior); grado acotado (#51); búsqueda binaria (#54).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: fractional cascading sobre cadenas de listas (#49-50); Layered Range Tree 2D (#8);
    D_1, D_2, D_3, D_4 (#53).
  - usedBy: nada dentro del curso; es el cierre de la cadena.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  - **No hay diagrama del grafo de cascading generalizado.** Es el hueco visual más grande del
    deck: se afirma grado 5 (#52) pero no se dibuja. #54 tiene una fórmula anotada con llaves
    (`una búsqueda real` / `pasos de descenso` / `reporte`), que es tipografía, no diagrama.
  - El único diagrama de esta mitad del deck es #44-45 (nodo de separación).
- pseudocódigo presente: **ninguno** en esta sección. El único pseudocódigo del deck es
  `ConsultaDominancia` (#30-31), transcrito arriba.
- ejemplos concretos que usa el profesor: ninguno numérico.
- casos límite que menciona:
  - **La trampa explícita** (#12-13): "cuelgo, de cada nodo del árbol en x, un arreglo-y cascadeado
    y un arreglo-z cascadeado, independientes. Cascadear te da la posición de y1 y la de z1 por
    separado en O(1) al bajar — pero no te dice cuántos puntos cumplen ambas condiciones a la vez."
    → "Contar la intersección de dos condiciones independientes no es gratis: perderías la relación
    entre 'quién cumple y' y 'quién cumple z'." Este es el **error a evitar** que el profesor pone
    como cierre #68.
  - El trade-off espacio/tiempo declarado (#58): "Trade-off típico de estructuras geométricas
    avanzadas: se paga espacio extra (logarítmico) por tiempo de consulta óptimo."
  - Las tres variantes de la tabla (#59-63) son los tres casos límite de "cuánto cascading se aplica".
  - Cotas ingenuas de arranque (#11): "Ingenuo (3 BSTs anidados): O(lg³ n + k). Cascading solo en
    la base: O(lg² n + k) (un factor lg n por cada nivel que no está cascadeado)."

## Conceptos de apoyo candidatos

Cosas necesarias para entender lo anterior que las diapositivas NO explican:

- **Fractional cascading sobre listas (la versión básica)** — #49 dice "Ya vimos cómo evitar
  exactamente eso con fractional cascading". Está en el otro deck de semana 5
  (`CS3014_Estructuras_de_Datos_Avanzadas_2s2026+%286%29.pdf`, que es en realidad *Fractional
  Cascading I*). **No es un concepto de apoyo externo: es material del curso en otro archivo.**
  Enlazarlos en el knowledge map.
- **Layered Range Tree** — #8 y #18 lo dan por conocido. También es del deck de FC I.
- **"Boletos" (tickets) en las aristas del grafo de cascading** — #51 usa el término sin definirlo
  en este deck; viene del vocabulario de FC I ("puentes").
- **Descomposición canónica / nodos canónicos de un rango** — #34, #36. Se usa como conocido.
- **Nodo de separación (split node) en un árbol de rango 1D** — #40 dice "exactamente como en un
  árbol de rangos 1D clásico", pero el deck de semana 4 (Orthogonal Range Search) describe el
  mecanismo vía `LCA(Predecessor(l1), Successor(r1))` sin llamarlo split node. La equivalencia
  nunca se enuncia.
- **La subdivisión planar de grado acotado de Chazelle (1986)** — el profesor lo dice
  explícitamente: "Este es el resultado geométrico no trivial de Chazelle (1986)... **No lo
  derivaremos en detalle aquí** — lo que sí necesitamos entender bien es cómo se consulta." (#25).
  Es un concepto de apoyo *declarado como fuera de alcance por el propio profesor*.
- **Qué es una "cara" de una subdivisión planar y qué significa su "posición horizontal"** — el
  pseudocódigo de #30 compara "la posición horizontal de cara" con b2, sin definir esa noción.
- **Estructura "invertida" / "gemela invertida"** — D_2′ y D_3′ (#39, #46, #52). Se usan mucho y
  nunca se explica cómo se construye una versión invertida ni si es literalmente la misma
  estructura con el orden reflejado.
- **BST / árbol de rango balanceado** — asumido en #33, #37, #46.
- **Cota output-sensitive y el papel de `k`** — usado desde #2 sin discusión.

## Huecos y ambigüedades

1. **Un solo bloque de pseudocódigo en 76 páginas, y es de la sub-estructura más chica.**
   `ConsultaDominancia` (#30-31) es el único código del deck. D_2, D_3, D_4 y el cascading
   generalizado se describen **exclusivamente en prosa**. Para implementar esto en la plataforma
   hay que escribir casi todo desde cero. **Confirmar con el usuario** cuánto de esto realmente se
   espera implementar (es material muy pesado: la construcción de la subdivisión de Chazelle está
   declarada fuera de alcance por el propio profesor en #25).
2. **La construcción de la subdivisión (#24-25) está explícitamente sin derivar.** El profesor lo
   dice: "No lo derivaremos en detalle aquí". Eso significa que **D_1 no es implementable** con
   sólo este material. Hueco reconocido por el autor, no un error — pero bloqueante para código.
3. **Cero ejemplos numéricos en todo el deck.** Ni un punto, ni una coordenada, ni una traza. Es el
   deck más abstracto de las semanas 4-5. La plataforma tendrá que inventar ejemplos, lo que roza
   la regla de no inventar: habría que marcarlos claramente como ejemplos añadidos, no del profesor.
4. **Ningún diagrama del grafo de cascading generalizado.** Se afirma "grado acotado por 5: su
   padre, sus dos hijos, y dos enlaces auxiliares hacia la estructura invertida gemela" (#52) sin
   dibujarlo. Es la afirmación técnica central de la sección y es la más difícil de visualizar de
   memoria.
5. **"Algoritmo 1" y "Algoritmo 2" son el mismo algoritmo** (#30 y #31), duplicado por el overlay
   de beamer. Si se transcribe mecánicamente al knowledge map van a aparecer dos algoritmos donde
   hay uno. Marcado arriba, pero conviene que el usuario lo sepa.
6. **El espacio de D_2 y D_3 por separado nunca se da.** Sólo el total O(n lg³ n) (#57) y la tabla
   (#62). Si la plataforma quiere una ficha por estructura (D_1, D_2, D_3, D_4), tres de las
   cuatro no tienen complejidades propias en el material. **Requiere decisión del usuario**: ¿se
   modelan como cuatro estructuras o como una sola con cuatro etapas?
7. **Inconsistencia de notación en los rangos de D_2 y D_3.** #33 y #37 escriben
   `(−∞, b3)` con paréntesis (abierto) mientras que `(−∞, b2]` lleva corchete (cerrado), y #17
   define la dominancia con `z_i ≤ b3` (cerrado). Probablemente un descuido tipográfico, pero es
   exactamente el tipo de off-by-one que importa al implementar. **Confirmar con el usuario.**
8. **"Cada punto aparece, en promedio, O(lg³ n) veces" (#57)** — "en promedio" es raro aquí: el
   argumento de multiplicidad del range tree es de peor caso, no promedio. Puede ser una
   imprecisión del profesor.
9. **`lg` vs `log`.** Este deck usa `lg` consistentemente; el de Orthogonal Range Search (semana 4)
   usa `log`. Unificar en la plataforma o dejar ambos, pero decidirlo.
10. **La numeración D_1..D_4 no coincide con las dimensiones.** D_1 resuelve un problema 2D
    (dominancia en (y,z)), D_2 agrega x, D_3 agrega y acotado, D_4 agrega z acotado. El subíndice
    cuenta *niveles de la construcción*, no dimensiones. El profesor nunca lo aclara y es una
    fuente segura de confusión para el estudiante.
11. **La pregunta retórica de #10 ("¿qué complejidad esperarías?") y su respuesta en #11** son
    material de ejercicio, no de teoría. Buenos candidatos a `exercises.md`.
12. **Referencias del deck (#75)**: Chazelle & Guibas (1986) *Fractional cascading: I. A data
    structuring technique*, Algorithmica 1(1-4); Chazelle (1986) *Filtering search*, SIAM J.
    Comput. 15(3); Demaine, Erik (2021) *6.851: Advanced Data Structures (Spring'21)*;
    de Berg, Cheong, van Kreveld & Overmars (2008) *Computational Geometry: Algorithms and
    Applications*, 3rd ed., Springer. Y créditos (#76): "basadas en las clases de Luciano A.
    Romero Calla para este curso (a su vez basadas en las clases de Erik Demaine, MIT 6.851)...
    Lista de créditos: Luciano A. Romero Calla, Erik Demaine, Keith Schwarz."

## Cobertura

- Leí **todas** las 76 páginas del PDF. No se saltó ninguna.
- Método: extracción de texto completa con `pdftotext -layout` (todas las páginas, con marcadores
  de página), más lectura visual directa de la página con figura TikZ que la extracción no captura:
  **#23** (la visualización de los rayos; #22 es la misma figura sin el pie de texto). Los
  diagramas de #44-45 (nodo de separación) sí se extrajeron con sus etiquetas legibles y se
  transcribieron arriba. El pseudocódigo de #30-31 se extrajo íntegro y literal.
- Páginas sin contenido útil propio: #1 (portada), #2-6 (objetivos incrementales), #7, #16, #32,
  #48, #56 (separadores de sección), #67-73 (cierre y logros incrementales), #74 ("Gracias").
  #75 (referencias) y #76 (agradecimientos) sí tienen contenido, recogido arriba.
- Páginas ilegibles: ninguna.
- Nota: por ser beamer con overlays, muchas páginas consecutivas repiten lo anterior más una
  viñeta nueva; los rangos `#A-B` cubren el bloque completo de overlays de cada tema.
