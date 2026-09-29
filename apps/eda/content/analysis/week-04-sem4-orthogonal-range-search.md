# Sem4_Orthogonal_Range_Search.pdf
semana: week-04
páginas totales: 66 (diapositivas lógicas: 20; el PDF es beamer con overlays incrementales)

> Nota de lectura: este deck usa overlays, por lo que 66 páginas PDF corresponden a
> 20 diapositivas numeradas. Las referencias `#A-B` de abajo son **páginas del PDF**,
> que es lo que pide el knowledge map.

## Temas cubiertos

### orthogonal-range-search
- título como lo llama el profesor: "Orthogonal Range Search"
- tipo: concept
- diapositivas: #5-42 (definición del problema en #6-16, caso d=1 en #17-42)
- qué problema resuelve (según el material, no según tú):
  "Dados n puntos en R^d, se nos pedirá realizar consultas sobre cajas; es decir, se nos
  darán d intervalos [l_i, r_i] y obtendremos información de los puntos en
  [l1,r1] × [l2,r2] × ... × [ld,rd]. Al producto cartesiano de los intervalos de consulta
  le llamaremos caja." (#7)
  Objetivo declarado: "Obtener una complejidad de O(log n + k) por consulta, donde k es el
  tamaño de la respuesta. En 2D normalmente es factible dicha complejidad." (#8-9)
- operaciones cubiertas:
  - Existencia — "¿Existe algún punto dentro de la caja?" (#14; respuesta en #37)
  - Conteo — "¿Cuántos puntos hay dentro de la caja?" (#15; respuesta en #37)
  - Enumeración — "¿Cuáles son todos los puntos dentro de la caja? / ¿Puedes darme k puntos
    que estén dentro de la caja?" (#16; respuesta en #38)
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | preprocesamiento (d=1, arreglo ordenado) | — | — | O(n log n) (#20) | — |
  | consulta (d=1, arreglo ordenado) | — | — | O(log n + k) (#20) | — |

  El profesor no da mejor/promedio; sólo enuncia cotas O(·) de peor caso.
- estilo de análisis del profesor: otro — **conteo estructural directo** (no recurrencias,
  no amortizado, no potencial). En #33-34 cuenta cuántos subárboles caen en la respuesta
  ("tendremos O(log n) subárboles que contengan nuestra respuesta") y en #37 suma
  "O(log n) valores"; el costo sale de contar nodos del camino, no de resolver T(n).
- prerrequisitos que el profesor asume o menciona explícitamente:
  búsqueda binaria (#19); árboles binarios de búsqueda balanceados (#24); Predecessor y
  Successor (#31); LCA — "Sea P = LCA(Predecessor(l1), Successor(r1))" (#33).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  buildsOn: BBST (árbol binario de búsqueda balanceado con puntos en las hojas, #24).
  usedBy: `range-tree` — esta sección **es** la construcción del range tree 1D; el profesor
  recién le pone nombre en #40 ("Esta estructura se llama Range tree").
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  - #29 "Figura: Range tree de una dimensión": árbol con raíz 9, hijos 4 y 15; nivel
    siguiente 3, 7, 13, 18; hojas 3, 4, 7, 9, 13, 15, 18, 27. Los internos guardan el
    máximo del subárbol izquierdo. Pide visualización de la **construcción / layout**.
  - #35 "Figura: Ejemplo de búsqueda con [l1,r1] = [5,16]": mismo árbol; nodos
    **amarillos** = delimitadores (hojas 4 y 18), nodos **rojos** = raíces de los subárboles
    de la respuesta (los internos 7 y 13). Pide visualización paso a paso de la **consulta
    por rango**: descenso, identificación de delimitadores, marcado de subárboles canónicos.
- pseudocódigo presente: **ninguno**. El deck no contiene ningún bloque de pseudocódigo ni
  de código. Los dos "problemas para implementar" (#42, #60-61) son enunciados, no código.
- ejemplos concretos que usa el profesor (valores, puntos, secuencias):
  - Árbol 1D con hojas {3, 4, 7, 9, 13, 15, 18, 27} y nodos internos 9 / 4, 15 / 3, 7, 13, 18 (#29, #35).
  - Consulta de rango [l1, r1] = [5, 16] sobre ese árbol (#35).
  - Range tree 2D construido sobre los puntos (13,0), (15,−2), (18,3), (27,1), con el árbol
    secundario ordenado por llave Y (#47).
  - Ejercicio "Static Range Sum": "Dada una secuencia a de tamaño n y q consultas (l, r),
    para cada consulta debemos calcular la suma de los elementos de a en el rango de
    posiciones [l, r)." (#42)
  - Ejercicio "Rectangle Sum": "Dados n puntos (x,y) con pesos asociados y q consultas
    (l, d, r, u), para cada consulta debemos determinar la suma de todos los puntos con
    l ≤ x < r y d ≤ y < u." (#60-61)
- casos límite que menciona:
  - Distingue escenario **estático** ("los puntos son fijos, así que podrían preprocesarse")
    de **dinámico** ("se puede agregar y/o eliminar puntos") (#11-12). Todo el resto del deck
    trata el caso estático.
  - Observación #22: "Si usamos arreglos, va a ser complicado aumentar dimensiones de manera
    'anidada'" — motiva abandonar el arreglo ordenado.
  - Rangos semiabiertos en los ejercicios: `[l, r)` (#42) y `l ≤ x < r`, `d ≤ y < u` (#61),
    a diferencia de los `[l_i, r_i]` cerrados de la definición (#7).

### range-tree
- título como lo llama el profesor: "Range tree" / "Range Tree"
- tipo: structure
- diapositivas: #23-41 (construcción 1D y nombre), #43-59 (2D y d dimensiones), #62-65 (resumen)
- qué problema resuelve (según el material, no según tú):
  Responder consultas ortogonales de caja (existencia / conteo / enumeración) sobre puntos
  estáticos, con la posibilidad de anidarse para subir de dimensión. El profesor la introduce
  como la respuesta a "Si usamos arreglos, va a ser complicado aumentar dimensiones de manera
  'anidada'" (#22).
- operaciones cubiertas:
  - **Construcción 1D**: "Podemos usar árboles binarios de búsqueda balanceados que almacenen
    a los puntos en las hojas. Cada nodo que no sea hoja debe almacenar información que
    permita realizar la búsqueda de un valor en las hojas. Es posible solo almacenar el máximo
    del subárbol izquierdo para minimizar la memoria usada." (#24-26)
  - **Predecessor(l1) / Successor(r1)** como sub-paso de la consulta (#31)
  - **Consulta por rango 1D** (selección de los O(log n) subárboles canónicos) (#31-35)
  - **Existencia / Conteo** (cada nodo almacena la cantidad de hojas en su subárbol) (#37)
  - **Enumeración** (iterar sobre los O(log n) subárboles) (#38)
  - **Construcción 2D** (puntero de cada nodo a un range tree por llave Y) (#46-47)
  - **Consulta 2D** (#50)
  - **Extensión a d dimensiones** (anidamiento dimensión k → k+1) (#52)
  - **Construcción de los árboles secundarios**: "Cada range tree correspondiente a subárboles
    puede ser construido en O(n) usando la información de sus dos hijos." (#54)
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | tamaño del árbol (1D) | — | — | O(n) nodos (#28) | O(n) (#28) |
  | consulta 1D | — | — | O(log n + k) (#20, #34) | — |
  | existencia / conteo (1D) | — | — | O(log n) (#37) | — |
  | consulta 2D | — | — | O(log² n + k) (#50) | O(n log n) (#49) |
  | preprocesamiento (d ≥ 2) | — | — | O(n log^{d−1} n) (#55) | — |
  | preprocesamiento (d = 1) | — | — | O(n log n) (#55, por ordenar según X) | — |
  | espacio (d dimensiones) | — | — | — | O(n log^{d−1} n) (#56) |
  | consulta (d dimensiones) | — | — | O(log^d n + k) (#57) | — |

  Cierre: "¿Es posible mejorarlo? Sí, se puede mejorar por un factor de O(log n) las consultas
  para d ≥ 2." (#58-59) — sin decir cómo; eso es la semana 5 (fractional cascading).
- estilo de análisis del profesor: otro — **conteo estructural / argumento de multiplicidad**.
  El espacio O(n log n) en 2D lo justifica contando en cuántos subárboles vive cada hoja
  ("cada hoja debería estar incluida en O(log n) subárboles", #49), y la consulta 2D la obtiene
  multiplicando "una consulta de O(log n) en O(log n) árboles" (#50). No plantea recurrencias,
  no usa amortización ni función potencial.
- prerrequisitos que el profesor asume o menciona explícitamente:
  BBST (#24), búsqueda binaria (#19), Predecessor / Successor (#31), LCA (#33),
  ordenamiento de los puntos por una componente (#55).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: BBST con puntos en las hojas (#24). El range tree d-dimensional buildsOn el
    range tree (d−1)-dimensional: "en cada uno de los árboles de una componente en la
    dimensión k podemos agregar punteros hacia range trees ordenados por la dimensión (k+1)" (#52).
  - usedBy: el propio deck anuncia la mejora de O(log n) para d ≥ 2 (#59); en el deck de
    semana 5 (`CS3014_..._%286%29.pdf`, Fractional Cascading I) esto se retoma como
    Layered Range Tree.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  - #29 — layout del range tree 1D (ver arriba). Operación: **construcción**.
  - #35 — consulta [5,16] con delimitadores amarillos y subárboles-respuesta rojos.
    Operación: **consulta por rango 1D**. Es el diagrama más claramente "paso a paso" del deck.
  - #47 — "Figura: Range tree de 2 dimensiones": el árbol primario en X (raíz 9; 4 y 15;
    3, 7, 13, 18; hojas etiquetadas con pares (3,10) (4,7) (7,11) (9,6) (13,0) (15,−2)
    (18,3) (27,1)) y, colgando del nodo 15 mediante una flecha, un segundo árbol cuya raíz
    es 0, hijos −2 y 1, y hojas (15,−2) (13,0) (27,1) (18,3) ordenadas por Y.
    Operación: **construcción del árbol secundario / anidamiento 2D**.
- pseudocódigo presente: **ninguno** en todo el deck.
- ejemplos concretos que usa el profesor (valores, puntos, secuencias):
  ver el bloque anterior (mismos ejemplos: hojas {3,4,7,9,13,15,18,27}; consulta [5,16];
  puntos 2D (3,10) (4,7) (7,11) (9,6) (13,0) (15,−2) (18,3) (27,1); árbol Y sobre
  (13,0) (15,−2) (18,3) (27,1)).
- casos límite que menciona:
  - d = 1 se analiza aparte del caso d ≥ 2 porque el preprocesamiento no baja de O(n log n)
    "por ordenar los puntos según su componente X" (#55).
  - Estático vs dinámico (#11-12): el range tree presentado es la versión **estática**;
    el profesor nunca da inserción ni eliminación.
  - Minimización de memoria por nodo: guardar sólo el máximo del subárbol izquierdo (#26).

## Conceptos de apoyo candidatos

Cosas necesarias para entender lo anterior que las diapositivas NO explican:

- **BBST (árbol binario de búsqueda balanceado)**: se invoca en #24 y en #49 ("al ser un árbol
  binario de búsqueda balanceado") como pieza dada. No se explica ningún esquema de balanceo
  (AVL, rojo-negro, treap). Todo el argumento de O(log n) depende de él.
- **LCA (lowest common ancestor)**: usado en #33 sin definición ni algoritmo.
- **Predecessor / Successor sobre un árbol con datos en las hojas**: nombrados en #31, no
  definidos en este deck.
- **Descomposición canónica por rango**: el profesor describe el mecanismo (#33) pero no le
  da el nombre ni prueba por qué son exactamente O(log n) subárboles disjuntos que cubren
  el rango. Es la pieza indispensable que la semana 5 sí nombra ("nodos canónicos").
- **Notación O(·) y qué significa exactamente `k`** (tamaño de la respuesta) en una cota
  output-sensitive: se usa desde #8 sin discusión.
- **Ordenamiento O(n log n)**: mencionado como costo (#55) sin algoritmo.

## Huecos y ambigüedades

1. **Cero pseudocódigo y cero código.** El deck anuncia dos veces "Intentemos implementar"
   (#42 Static Range Sum en 1D, #60 Rectangle Sum en 2D) y el resumen afirma "Implementamos
   un Range Tree en 1D y 2D" (#65), pero **la implementación no está en el PDF**. Se hizo en
   clase o en otro archivo. Si la plataforma necesita el código del profesor, el usuario debe
   aportarlo; de lo contrario habrá que escribirlo desde cero siguiendo sólo la descripción.
2. **La consulta 2D no se detalla.** #50 da la complejidad O(log² n + k) y la intuición
   ("una consulta de O(log n) en O(log n) árboles"), pero nunca se muestra el procedimiento
   concreto (qué se busca en el árbol primario, qué se busca en cada secundario, cómo se
   combinan los resultados). El diagrama #47 muestra la estructura, no la consulta.
3. **Espacio en 2D: ¿O(n log n) u O(n log^{d−1} n)?** #49 dice O(n log n) para 2D y #56 dice
   O(n log^{d−1} n) en general, que para d=2 da O(n log n). Coherente, pero el profesor nunca
   lo dice explícitamente y la fórmula general falla para d=1 (daría O(n), cuando el
   preprocesamiento es O(n log n)). Vale confirmar con el usuario cómo se quiere presentar d=1.
4. **Predecessor(l1) y Successor(r1) con datos en las hojas.** En un árbol con puntos sólo en
   las hojas, "Predecessor(l1)" debería devolver una hoja; en el ejemplo #35 los delimitadores
   amarillos son las hojas 4 y 18 para el rango [5,16], lo que es consistente. Pero #33 habla
   del "camino de P a Predecessor(l1)" sin aclarar si el nodo delimitador se incluye o se
   excluye de la respuesta. En el diagrama **se excluye** (las hojas 4 y 18 no están en rojo).
   Vale marcarlo explícitamente porque es un off-by-one clásico.
5. **"Es posible mejorarlo... por un factor de O(log n) para d ≥ 2" (#58-59)** queda como
   promesa sin resolver. El cierre natural es el deck de semana 5 (Fractional Cascading I),
   que en el repo está con el nombre `CS3014_Estructuras_de_Datos_Avanzadas_2s2026+%286%29.pdf`.
   Conviene enlazarlos en el knowledge map.
6. **Mezcla de convenciones de intervalo**: la definición usa intervalos cerrados `[l_i, r_i]`
   (#7) pero ambos ejercicios usan semiabiertos (#42, #61). Hay que decidir cuál se usa en las
   implementaciones de la plataforma.
7. **El "máximo del subárbol izquierdo" (#26) vs. las etiquetas del diagrama (#29)**: en #29
   la raíz es 9 y las hojas del subárbol izquierdo son 3, 4, 7, 9 — coherente con "máximo del
   subárbol izquierdo". Consistente, pero el profesor nunca conecta explícitamente el texto
   con el diagrama.

## Cobertura

- Leí **todas** las 66 páginas del PDF. No se saltó ninguna.
- Método: extracción de texto completa con `pdftotext -layout` (todas las páginas, con
  marcadores de página), más lectura visual directa de las páginas con figuras TikZ que la
  extracción de texto no captura: **#29, #35, #47**.
- Páginas sin contenido útil propio: #1 (portada), #2-4 (agenda incremental), #5 y #43
  (separadores de sección), #62-65 (resumen incremental), #66 ("Gracias").
- Páginas ilegibles: ninguna.
- Nota: por ser beamer con overlays, muchas páginas consecutivas repiten el contenido anterior
  más una viñeta nueva; las referencias `#A-B` de arriba cubren el bloque completo de overlays
  de cada tema.
