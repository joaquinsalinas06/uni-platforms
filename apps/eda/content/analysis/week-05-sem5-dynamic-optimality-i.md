# Sem5_Dynamic_Optimality_I.pdf
semana: week-05
páginas totales: 79 (diapositivas lógicas: 21; beamer con overlays incrementales)

> Nota de lectura: 79 páginas PDF = 21 diapositivas numeradas. Las referencias `#A-B` son
> **páginas del PDF**.

## Temas cubiertos

### modelo-computacional-bst
- título como lo llama el profesor: "Modelo computacional BST"
- tipo: concept
- diapositivas: #13-28 (definición #14-20, figura #21, operación soportada #22-28)
- qué problema resuelve (según el material, no según tú):
  Dar un marco formal para poder preguntar "¿existe un BST tan bueno como todos los demás?"
  y "¿es O(log n) el mejor tiempo posible para un BST?" (#9-10). El profesor lo introduce
  exactamente así: "No sabemos, sigue siendo un problema abierto. Para analizar un poco mejor
  esto definiremos el modelo computacional BST." (#12)
  Definición: "Es un modelo computacional basado en la máquina de punteros pero con la
  restricción estructural de ser un BST." (#14)
  Modelo: "Todos los datos son almacenados en un BST en el cual cada nodo tiene un puntero
  hacia su padre, hijo izquierdo e hijo derecho." (#16)
- operaciones cubiertas:
  - **Moverse a través de un puntero** — "ir al padre o alguno de sus hijos en O(1)" (#19)
  - **Rotar un nodo x con su padre** — "también en O(1)" (#20), figura en #21
  - **Buscar(x)** — "Empezando desde el nodo raíz, se debe visitar el nodo con valor x." (#23)
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | mover por un puntero | — | — | O(1) (#19) | — |
  | rotar un nodo con su padre | — | — | O(1) (#20) | — |
  | Buscar(x) | — | — | O(log n) es "el mejor tiempo posible" en el peor caso (#26) | — |

- estilo de análisis del profesor: otro — **definición de modelo de costo**. Aquí el profesor
  no analiza, *establece* el modelo: qué operaciones existen y cuánto cuesta cada una, para que
  después las propiedades (amortizadas) tengan sentido. Se clasifica así porque #19-20 son
  postulados de costo unitario, no derivaciones.
- prerrequisitos que el profesor asume o menciona explícitamente:
  BST (#6-7, "estructuras que nos permiten realizar la mayoría de operaciones en O(log n)");
  **máquina de punteros** (#14, nombrada sin definirse); rotación en un BST (#20-21).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: máquina de punteros (#14), BST (#14).
  - usedBy: es el marco donde se enuncian las propiedades de secuencias (#29 en adelante),
    la dynamic optimality (#51 en adelante) y donde vive el Splay Tree (#59 en adelante).
    El profesor contrasta explícitamente modelo BST vs máquina de punteros en #47-48 y #56-57.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  - #21 "Figura: Rotación en un BST": dos árboles conectados por una flecha doble etiquetada
    **"Right Rotation"** (izquierda→derecha) y **"Left Rotation"** (derecha→izquierda).
    Izquierda: raíz `p`, hijos `n` y `C`; `n` tiene hijos `A` y `B`.
    Derecha: raíz `n`, hijos `A` y `p`; `p` tiene hijos `B` y `C`.
    Operación: **rotación**. Es el diagrama clásico que pide animación paso a paso.
- pseudocódigo presente: **ninguno** en esta sección.
- ejemplos concretos que usa el profesor (valores, puntos, secuencias):
  - Convención simplificadora: "Por simplicidad, asumiremos que las llaves son enteros entre
    el 1 y el n y la secuencia de búsqueda es {x1, x2, ..., xm}." (#28)
- casos límite que menciona:
  - "Asumiremos solo búsquedas en las que x sí se encuentra en el árbol." (#24) — **restricción
    explícita**: no hay búsquedas fallidas en el modelo.
  - "En el peor caso, ciertamente O(log n) es el mejor tiempo posible." (#26) pero "el trabajo
    de las búsquedas depende de la secuencia de elementos que se buscan" (#27) — el punto
    entero del deck: el peor caso no es la métrica interesante.
  - El modelo sólo soporta **Buscar**; no hay inserción ni eliminación (#22-23).

### propiedades-de-secuencias-de-busqueda
- título como lo llama el profesor: "Propiedades de análisis de secuencias de búsqueda"
- tipo: concept
- diapositivas: #29-43 (acceso secuencial y puntero dinámico #29-34; visualizaciones #35-36;
  conjunto de trabajo y lemas #37-42; visualización #43)
- qué problema resuelve (según el material, no según tú):
  Medir la calidad de un BST **en función de la secuencia de búsquedas**, no del peor caso.
  Nace de la observación #27: "el trabajo de las búsquedas depende de la secuencia de elementos
  que se buscan."
- operaciones cubiertas (aquí son **propiedades**, no operaciones; se listan con su página):
  - **Propiedad de acceso secuencial** (#30): "Si la secuencia de búsqueda es {1, 2, ..., n},
    entonces resolver todas las consultas toma O(1) por búsqueda (amortizado)."
  - **Propiedad del puntero dinámico** (#32): "Si elementos consecutivos cumplen con
    |x_i − x_{i−1}| = k_i, entonces resolver las consultas toma O(log k_i) por búsqueda
    (amortizado)."
  - **Cota de entropía / Optimalidad estática** (#34): "Si un valor k aparece en una fracción
    p_k de la secuencia, entonces resolver todas las consultas toma O(Σ_k p_k log(1/p_k)) por
    búsqueda (amortizado)."
  - **Propiedad del conjunto de trabajo** (#38): "Si t_i valores diferentes fueron buscadas
    entre la última ocurrencia de x_i y la posición i, entonces resolver todas las consultas
    toma O(log t_i) por búsqueda (amortizado)."
  - **Lemas de implicación** (#40-41):
    - "La propiedad del puntero dinámico implica la propiedad de acceso secuencial."
    - "La propiedad del conjunto de trabajo implica la propiedad de cota de entropía."
    - Y el comentario (#42): "Se podría decir que la propiedad del puntero dinámico y la del
      conjunto de trabajo son 'ortogonales' entre sí."
  - **Propiedad unificada** (#45): "Si t_ij valores diferentes han sido buscados entre
    x_i, ..., x_j, entonces resolver la consulta para x_j toma
    O(log min_{i<j} {|x_i − x_j| + t_{i,j} + 2}) (amortizado)."
    - "Es posible obtener esta complejidad usando máquina de punteros." (#47)
    - "Aún no se sabe si es posible obtener la complejidad con un modelo BST." (#48)
- complejidades que da el profesor:

  | propiedad | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | acceso secuencial | — | — | O(1) por búsqueda, **amortizado** (#30) | — |
  | puntero dinámico | — | — | O(log k_i) por búsqueda, **amortizado** (#32) | — |
  | cota de entropía / optimalidad estática | — | — | O(Σ_k p_k log(1/p_k)) por búsqueda, **amortizado** (#34) | — |
  | conjunto de trabajo | — | — | O(log t_i) por búsqueda, **amortizado** (#38) | — |
  | propiedad unificada | — | — | O(log min_{i<j}{|x_i − x_j| + t_{i,j} + 2}), **amortizado** (#45) | — |

- estilo de análisis del profesor: **amortized**. Cada una de las cinco propiedades lleva la
  palabra "(amortizado)" literalmente entre paréntesis (#30, #32, #34, #38, #45), y todas son
  cotas *por búsqueda promediadas sobre la secuencia completa*, que es exactamente la definición
  de análisis amortizado. **No** usa el método del potencial: no define Φ en ninguna diapositiva,
  ni acredita/debita operaciones. Enuncia las cotas y no las demuestra.
- prerrequisitos que el profesor asume o menciona explícitamente:
  análisis amortizado (usado en las 5 propiedades, nunca definido); entropía de Shannon
  (la fórmula Σ p log(1/p) de #34 aparece sin nombrarla como entropía ni explicarla);
  el modelo computacional BST (#13-28); máquina de punteros (#47).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: modelo computacional BST (#13-28).
  - usedBy: **Splay Tree** — el profesor lista en #68-72 cuáles de estas propiedades cumple el
    splay tree, y en #74 pregunta si cumple la unificada.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  Tres **gráficos de dispersión** (eje horizontal `i` = posición en la secuencia, eje vertical
  `x_i` = valor buscado), que visualizan patrones de acceso:
  - #35 "Visualización de acceso secuencial": puntos en (1,1) (2,2) (3,3) (4,4) (5,5) (6,6) —
    la diagonal perfecta.
  - #36 "Visualización de puntero dinámico": puntos en (1,1) (2,3) (3,2) (4,5) (5,4) (6,6) —
    saltos pequeños alrededor de la diagonal.
  - #43 "Visualización de conjunto de trabajo": puntos en (1,1) (2,3) (3,7) (4,3) (5,2) (6,3) —
    eje vertical hasta 7; el valor 3 se repite en i=2, 4 y 6 (poca "distancia de trabajo").
  Operación visualizada: **el patrón de la secuencia de búsqueda**, no una operación de la
  estructura. Son buenos candidatos a visualización interactiva (el usuario arma la secuencia y
  ve qué propiedad aplica), pero **no** son diagramas de ejecución de un algoritmo.
- pseudocódigo presente: **ninguno**.
- ejemplos concretos que usa el profesor (valores, puntos, secuencias):
  - Secuencia {1, 2, ..., n} para acceso secuencial (#30).
  - Las tres secuencias de los gráficos: **1,2,3,4,5,6** (#35); **1,3,2,5,4,6** (#36);
    **1,3,7,3,2,3** (#43). Son los únicos datos concretos del deck y son directamente usables
    como ejemplos en la plataforma.
  - Notación: llaves enteras en [1, n], secuencia {x1, ..., xm} (#28).
- casos límite que menciona:
  - El "+2" dentro del logaritmo de la propiedad unificada (#45) — evita log(0) y log(1)=0
    cuando x_i = x_j y t_{i,j} = 0. El profesor **no** explica por qué está ahí.
  - Puntero dinámico y conjunto de trabajo son "ortogonales" (#42): ninguna implica a la otra.
  - La propiedad unificada es alcanzable con máquina de punteros pero **abierta** para BST (#47-48).

### dynamic-optimality
- título como lo llama el profesor: "Dynamic optimality/O(1)-competitivo"
- tipo: concept
- diapositivas: #51-58 (y el planteo inicial en #6-12)
- qué problema resuelve (según el material, no según tú):
  "¿Es posible tener un rendimiento online cercano al óptimo offline?" (#52), formalizado como
  `Complejidad total(x) = O(OPT(x))` (#53), es decir: "¿Es posible tener un algoritmo de BST
  dinámico que pueda igualar al rendimiento óptimo si se supiera el futuro?" (#54)
- operaciones cubiertas:
  - No hay operaciones: es una **pregunta abierta** sobre el modelo. Lo que el profesor
    "cubre" son las respuestas conocidas (#56-58).
- complejidades que da el profesor:

  | afirmación | estado |
  | --- | --- |
  | O(1)-competitivo para BST | "Por el momento es un problema abierto para BST." (#56) |
  | O(1)-competitivo para máquina de punteros | "El caso para algoritmos sobre máquinas de punteros también es un problema abierto." (#57) |
  | O(log log n)-competitivo para BST | "Es posible obtener un algoritmo O(log log n)-competitivo para BST." (#58) |

  El profesor **no nombra** qué estructura logra el O(log log n) (en la literatura es Tango
  Trees, pero el deck no lo dice — no inventar).
- estilo de análisis del profesor: otro — **análisis competitivo** (ratio contra el óptimo
  offline OPT(x)). Se clasifica así porque #53 define literalmente la métrica como
  `Complejidad total(x) = O(OPT(x))` y #58 habla de "O(log log n)-competitivo": el costo se
  mide *relativo a un adversario que conoce el futuro*, no en absoluto ni por recurrencia.
- prerrequisitos que el profesor asume o menciona explícitamente:
  distinción online/offline (#52); noción de OPT (#53, nunca definida formalmente: no se dice
  cómo se calcula OPT(x) ni si es computable); el modelo computacional BST (#13-28);
  análisis competitivo (término usado en #51 y #58, no definido).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: modelo computacional BST (#13-28); las propiedades de secuencias (#29-50) como
    cotas intermedias.
  - usedBy: **Splay Tree** — la pregunta final del deck (#75) es si el splay tree es
    O(1)-competitivo.
- ¿tiene diagramas que pidan visualización paso a paso? **ninguno.**
- pseudocódigo presente: **ninguno**.
- ejemplos concretos que usa el profesor: ninguno numérico. Sólo la fórmula
  `Complejidad total(x) = O(OPT(x))` (#53).
- casos límite que menciona:
  - Abierto para BST **y** abierto para máquina de punteros (#56-57) — dos problemas distintos.
  - El "título" del deck es "Dynamic Optimality **I**", así que hay una continuación pendiente.

### splay-tree
- título como lo llama el profesor: "Splay Tree" / "Splay Trees"
- tipo: structure
- diapositivas: #59-75 (definición #59-63; casos de rotación #64-66; propiedades #67-75)
- qué problema resuelve (según el material, no según tú):
  "Es un BST amortizado que siempre mueve el valor de búsqueda x_i a la raíz del árbol mediante
  la función Splay." (#60). Es la estructura concreta que el profesor presenta como candidata
  (no probada) a dynamic optimality.
- operaciones cubiertas:
  - **Splay(x)** (#61-63): "Se encarga de mover el valor x buscado a la raíz pero balanceando
    algunos nodos sobre la marcha. Usa rotaciones por casos específicos para tener una
    complejidad amortizada de O(log n) por búsqueda."
  - **Zig (rotación simple)** — #64
  - **Zig-Zig (misma dirección)** — #65
  - **Zig-Zag (direcciones opuestas)** — #66
  - **Búsqueda** — implícita: "siempre mueve el valor de búsqueda x_i a la raíz" (#60);
    "Cada operación toma O(log n) (amortizado)" (#68)
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | Splay / búsqueda | — | — | O(log n) **amortizado** (#63, #68) | — |
  | cualquier operación | — | — | O(log n) **amortizado** (#68) | — |

  El profesor **no** da espacio, ni peor caso no amortizado (una operación individual puede ser
  O(n); el deck no lo menciona), ni mejor caso.

  Propiedades que el splay tree **sí** cumple (#69-72):
  - propiedad de puntero dinámico (#69)
  - propiedad de acceso secuencial (#70)
  - propiedad del conjunto de trabajo (#71)
  - propiedad de cota de entropía (#72)

  Preguntas abiertas sobre el splay tree (#74-75):
  - "¿Cumple con la propiedad unificada?" (#74) — **queda sin responder**
  - "No se sabe si es O(1)-competitivo, es un problema abierto." (#75)
- estilo de análisis del profesor: **amortized**. La palabra aparece en la definición misma
  ("Es un BST **amortizado**", #60), en la cota de Splay ("complejidad **amortizada** de
  O(log n) por búsqueda", #63) y en la propiedad ("Cada operación toma O(log n) (**amortizado**)",
  #68). **No** usa el método del potencial: no define Φ, no hay función de rango, no hay
  demostración del Access Lemma. Enuncia las cotas sin derivarlas.
- prerrequisitos que el profesor asume o menciona explícitamente:
  rotación en un BST (#20-21); modelo computacional BST (#13-28); las cinco propiedades de
  secuencias (#29-50); análisis amortizado (usado, no definido).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: modelo computacional BST y su operación de rotación (#20-21); las propiedades de
    secuencias son el lenguaje en que se describe su calidad (#69-72).
  - usedBy: el material no dice que el splay tree sea usado por otra estructura del curso.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  **Sí — los tres casos de Splay, uno por diapositiva.** Son el mejor candidato a visualización
  paso a paso de todo el deck. Transcritos de los diagramas:
  - #64 **Zig (rotación simple)**
    - Antes: raíz `p`, hijos `x` y `C`; `x` tiene hijos `A` y `B`.
    - Después (`⟹`): raíz `x`, hijos `A` y `p`; `p` tiene hijos `B` y `C`.
  - #65 **Zig-Zig (misma dirección)**
    - Antes: raíz `a`, hijos `p` y `D`; `p` tiene hijos `x` y `C`; `x` tiene hijos `A` y `B`.
    - Después (`⟹`): raíz `x`, hijos `A` y `p`; `p` tiene hijos `B` y `a`; `a` tiene hijos `C` y `D`.
  - #66 **Zig-Zag (direcciones opuestas)**
    - Antes: raíz `a`, hijos `p` y `D`; `p` tiene hijos `A` y `x`; `x` tiene hijos `B` y `C`.
    - Después (`⟹`): raíz `x`, hijos `p` y `a`; `p` tiene hijos `A` y `B`; `a` tiene hijos `C` y `D`.
  - Además #21 (rotación genérica) es el prerrequisito visual de los tres.
- pseudocódigo presente: **ninguno**. Los tres casos de Splay se dan **sólo como diagramas**
  (#64-66), sin una línea de pseudocódigo ni de código en todo el deck.
- ejemplos concretos que usa el profesor (valores, puntos, secuencias):
  Ninguno numérico para el splay tree. Los diagramas #64-66 usan nodos simbólicos
  (`x`, `p`, `a`) y subárboles (`A`, `B`, `C`, `D`), no valores. **No hay una sola traza de
  Splay sobre un árbol con números.**
- casos límite que menciona:
  - Los tres casos de la función Splay (zig / zig-zig / zig-zag) **son** el análisis por casos
    límite de la operación (#64-66). Zig es el caso en que `x` es hijo de la raíz.
  - No menciona el peor caso individual de una operación (que no es O(log n)), ni qué pasa con
    inserción/eliminación (el modelo sólo tiene Buscar, #22-23).

## Conceptos de apoyo candidatos

Cosas necesarias para entender lo anterior que las diapositivas NO explican:

- **Análisis amortizado** — la palabra aparece en 7 diapositivas distintas (#30, #32, #34, #38,
  #45, #60, #63, #68) y nunca se define. Es *el* concepto de apoyo más importante de este deck.
  Tampoco se explica el método del potencial ni el método del contador, que es como se demuestran
  todas esas cotas en la literatura.
- **Máquina de punteros (pointer machine)** — #14, #47, #57. El modelo BST se define *sobre* ella
  y nunca se dice qué es.
- **OPT(x) — el óptimo offline** — #53. No se define cómo se mide, si es computable, ni qué
  significa "saber el futuro" operacionalmente.
- **Análisis competitivo / c-competitivo** — #51, #58. Se usa el vocabulario sin definirlo.
- **Entropía (Σ p_k log(1/p_k))** — #34. La fórmula aparece cruda; no se dice que es entropía de
  Shannon ni por qué es la cota natural de la optimalidad estática.
- **BST estático óptimo** — implícito en "Optimalidad estática" (#33-34); nunca se explica qué es
  un BST estático óptimo ni cómo se construye.
- **Rotación en un BST** — #20-21 lo muestran en figura pero no explican por qué preserva el
  orden in-order ni cómo se implementa con los tres punteros.
- **Función Splay completa** — el deck da los tres casos (#64-66) pero **no** el bucle que los
  aplica repetidamente hasta que x llega a la raíz, ni el criterio para elegir caso. Para
  implementar Splay hace falta esa pieza y no está.
- **Tango Trees** (o cualquiera que sea la estructura O(log log n)-competitiva de #58) — el
  profesor afirma que existe sin nombrarla. Marcar como concepto de apoyo, **no** como tema del
  curso.

## Huecos y ambigüedades

1. **Ningún pseudocódigo, ningún código, ninguna traza numérica del Splay.** El deck es
   íntegramente conceptual. El resumen (#77-78) dice "Aprendimos Dynamic Optimality" y
   "Aprendimos propiedades del Splay Tree" — y efectivamente sólo se aprenden *propiedades*, no
   la implementación. Para la plataforma habrá que escribir Splay desde cero a partir de los tres
   diagramas de #64-66. **Confirmar con el usuario** si eso es aceptable o si hay material extra.
2. **Falta el bucle de Splay.** Los tres casos están, pero no se dice que se aplican repetidamente
   hasta que x sea la raíz, ni cómo se decide cuál aplicar, ni qué hace un splay cuando x ya es
   la raíz. Es el hueco más bloqueante para implementar.
3. **Zig-Zag no queda simétrico en el diagrama.** En #65 (zig-zig) y #66 (zig-zag) el profesor
   sólo dibuja **una** de las dos orientaciones de cada caso (x como hijo izquierdo). La
   orientación espejada (x como hijo derecho) no está. Habrá que derivarla — o marcarla como
   ejercicio.
4. **La propiedad unificada queda colgada.** #74 pregunta "¿Cumple con la propiedad unificada?"
   y la diapositiva siguiente (#75) **no responde esa pregunta**: responde otra ("No se sabe si
   es O(1)-competitivo"). Puede ser intencional (pregunta abierta también) o un salto en las
   diapositivas. **Requiere confirmación del usuario.**
5. **El "+2" de la propiedad unificada (#45) no se explica.** Ni el `min_{i<j}`. La fórmula
   `O(log min_{i<j} {|x_i − x_j| + t_{i,j} + 2})` es la más densa del deck y llega sin desarrollo.
6. **Typo del profesor en #38**: "Si t_i valores diferentes fueron **buscadas**... entonces
   **entonces** resolver todas las consultas..." — concordancia y palabra duplicada. Cosmético,
   pero conviene no reproducirlo literal en la plataforma.
7. **La cota de entropía (#34) se enuncia como "O(Σ_k p_k log(1/p_k)) por búsqueda"**, lo cual
   ya es un promedio; decir "por búsqueda (amortizado)" encima es redundante y puede confundir.
   Vale aclararlo.
8. **La estructura O(log log n)-competitiva (#58) no tiene nombre.** No se puede referenciar en
   el knowledge map como tema del curso. Si el usuario quiere que aparezca (Tango Trees), tiene
   que decirlo explícitamente: el material no lo dice.
9. **Ausencia total de inserción y eliminación.** El modelo declara sólo Buscar (#22-23), pero
   #68 dice "Cada **operación** toma O(log n) (amortizado)" — ¿qué operaciones? Si el modelo sólo
   tiene Buscar, la frase es imprecisa. La plataforma tendrá que decidir si el splay tree que
   implementa soporta insert/erase (que la literatura sí define) o sólo search.
10. **"Dynamic Optimality I"** implica un "II" que no está en el material entregado. Confirmar
    con el usuario si viene después.

## Cobertura

- Leí **todas** las 79 páginas del PDF. No se saltó ninguna.
- Método: extracción de texto completa con `pdftotext -layout` (todas las páginas, con marcadores
  de página), más lectura visual directa de las páginas cuyo contenido es TikZ y no se extrae
  bien: **#21 (rotación), #35, #36, #43 (los tres gráficos de dispersión)**. Los diagramas de
  #64-66 (zig / zig-zig / zig-zag) sí se extrajeron con su estructura de árbol legible y se
  transcribieron arriba.
- Páginas sin contenido útil propio: #1 (portada), #2-4 (agenda incremental), #5 (separador de
  sección), #76-78 (resumen incremental), #79 ("Gracias").
- Páginas ilegibles: ninguna.
- Nota: por ser beamer con overlays, muchas páginas consecutivas repiten lo anterior más una
  viñeta nueva; los rangos `#A-B` cubren el bloque completo de overlays de cada tema.
