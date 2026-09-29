# CS3014_Estructuras_de_Datos_Avanzadas_2s2026+%286%29.pdf
semana: week-05
páginas totales: 47 (diapositivas lógicas: 22; beamer con overlays incrementales)

> ⚠️ **EL NOMBRE DEL ARCHIVO ENGAÑA.** Este PDF **no** es un sílabo ni un documento
> administrativo del curso. Es la presentación **"Fractional Cascading I", Semana 5,
> 8 de septiembre de 2026** (portada, #1). Es el deck que **precede** a
> `Sem5_Fractional_Cascading_II.pdf` (9 de septiembre de 2026) y el que este último
> referencia cuando dice "ya vimos cómo evitar exactamente eso con fractional cascading".
> El nombre `..._2s2026+%286%29.pdf` es un `(6)` URL-encodeado de una descarga del navegador.
> **Sugerencia fuerte: renombrarlo a `Sem5_Fractional_Cascading_I.pdf`.**

> Nota de lectura: 47 páginas PDF = 22 diapositivas numeradas. Las referencias `#A-B` son
> **páginas del PDF**.

## Temas cubiertos

### repaso-range-tree-2d
- título como lo llama el profesor: "Repaso: Range Tree 2D"
- tipo: concept (repaso de la semana 4)
- diapositivas: #7-11
- qué problema resuelve (según el material, no según tú):
  Recordar la estructura de la semana 4 y **exponer su desperdicio**, que es lo que motiva toda
  la clase. "Un BST primario en x; cada nodo guarda, además, una estructura secundaria (otro BST)
  con los y de su subárbol. La consulta [x1,x2] × [y1,y2] halla los O(lg n) nodos canónicos de x,
  y busca [y1,y2] en cada una de sus estructuras secundarias." (#8)
- operaciones cubiertas:
  - Consulta 2D sobre range tree ingenuo (#8)
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | consulta 2D (range tree ingenuo) | — | — | O(lg² n) + O(k) para reportar (#9) | — |

  Literal (#9): "O(lg n) nodos canónicos × O(lg n) por búsqueda secundaria = O(lg² n) por consulta
  (más O(k) para reportar)."
- estilo de análisis del profesor: otro — **composición multiplicativa** (nodos canónicos ×
  costo por nodo). No hay recurrencia ni amortización.
- prerrequisitos que el profesor asume o menciona explícitamente:
  Range Tree 2D de la semana 4 ("De la clase pasada", #8); **nodos canónicos** (#8, término usado
  como conocido — en el deck de semana 4 el mecanismo se describe vía LCA/Predecessor/Successor
  pero nunca se le llama así); BST (#8); búsqueda binaria.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: Range Tree 2D (semana 4, `Sem4_Orthogonal_Range_Search.pdf`).
  - usedBy: es el punto de partida del Layered Range Tree (#27 en adelante).
- ¿tiene diagramas que pidan visualización paso a paso? **ninguno** en esta sección.
- pseudocódigo presente: **ninguno**.
- ejemplos concretos que usa el profesor: ninguno en esta sección.
- casos límite que menciona:
  **La observación clave** (#10): "En los O(lg n) nodos canónicos, estamos buscando el mismo valor
  y1 (y el mismo y2), una y otra vez, en O(lg n) estructuras distintas pero **relacionadas**."
  → (#11) "¿Te suena de algo 'buscar el mismo valor en varias listas a la vez'? Es exactamente el
  problema que vamos a resolver ahora — de forma completamente general primero, y luego
  aplicándolo a este árbol."

### fractional-cascading
- título como lo llama el profesor: "Fractional Cascading"
- tipo: algorithm (técnica general)
- diapositivas: #12-26 (problema general #13-15; construcción #16-17; visualización #18-19;
  consulta #20-24; justificación de "la mitad" #25-26)
- qué problema resuelve (según el material, no según tú):
  "Dadas k listas ordenadas L1, ..., Lk (cada una de tamaño ≤ n), buscar un mismo valor x en
  todas." (#13)
  Objetivo (#15): "Lo obvio: O(k lg n). Queremos hacerlo mejor: **O(k + lg n)** — una sola
  búsqueda binaria cara, y O(1) por cada lista adicional."
- operaciones cubiertas:
  - **Construcción (de abajo hacia arriba)** (#16-17): ver pseudocódigo/fórmula abajo
  - **Consulta: buscar x en todas las listas** (#20-24), tres pasos:
    1. "Una única búsqueda binaria de x en L′1: O(lg n)." (#21)
    2. "Desde esa posición, seguir el puente más cercano hacia L′2: cae a lo más ±1 posición de
       donde x realmente iría — ajustar con O(1) comparaciones." (#22)
    3. "Repetir el paso anterior para bajar a L′3, ..., Lk: O(1) cada uno." (#23)
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | búsqueda ingenua (binaria en cada lista) | — | — | O(k lg n) (#15) | — |
  | búsqueda con fractional cascading | — | — | O(k + lg n) (#24) | — |
  | paso 1 (búsqueda binaria real en L′1) | — | — | O(lg n) (#21) | — |
  | paso de puente entre listas | — | — | O(1) (#22-23) | — |
  | tamaño de L′1 promoviendo la mitad | — | — | — | **O(n)** en total, "sin importar k" (#26) |
  | tamaño de L′1 promoviendo todos | — | — | — | **Θ(kn)** (#26) |

  Conclusión literal (#24): "Total: O(lg n) (una búsqueda real) + O(k) (bajar puentes) =
  O(k + lg n)."
- estilo de análisis del profesor: otro — **conteo directo de pasos + serie geométrica para el
  espacio**. El tiempo se cuenta paso a paso (#24); el espacio se justifica con una recurrencia
  de tamaño resuelta como serie geométrica: "|L′i| ≤ |Li| + ½|L′{i+1}|, una serie geométrica que
  suma |L′1| = O(n) en total, sin importar k" (#26). Es lo más cercano a un análisis
  recurrence-based en las semanas 4-5, pero es sobre **tamaños**, no sobre tiempo, y el profesor
  no plantea T(n) ni aplica el teorema maestro. Sin amortización, sin potencial.
- prerrequisitos que el profesor asume o menciona explícitamente:
  búsqueda binaria (#14-15, #21); listas ordenadas; series geométricas (#26, usadas sin nombrarlas
  formalmente).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: búsqueda binaria.
  - usedBy: **Layered Range Tree** (#27 en adelante, "aplicándola al árbol"); y en el deck
    siguiente (`Sem5_Fractional_Cascading_II.pdf`) se generaliza de "cadena de listas" a "grafo de
    estructuras".
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  - #18-19 "Visualizando la construcción": tres filas de celdas etiquetadas a la izquierda
    `L′1`, `L′2`, `L3`, con líneas punteadas (los puentes) bajando entre ellas:
    ```
    L′1    2    5*   8    12*   15
    L′2    3    5    9*   12    18*
    L3     4    9    13   18    22
    ```
    Pie (#19): "Los elementos con ∗ fueron promovidos desde la lista de abajo, y guardan un puente
    (línea punteada) a su posición original. L3 no cambia (es la última)."
    Operación: **construcción (promoción + puentes)**. Excelente candidato a visualización paso a
    paso: construir de abajo hacia arriba, promoviendo los elementos pares y dibujando los puentes.
  - Una visualización de la **consulta** (bajar por los puentes desde L′1 hasta Lk) sería natural
    sobre este mismo ejemplo, pero el deck **no la trae**.
- pseudocódigo presente: transcríbelo íntegro en bloques de código

  El deck **no tiene bloques de pseudocódigo formales**. Lo más cercano es la fórmula de
  construcción de #16-17, que sí es una definición constructiva y se transcribe literal:

  ```
  Construcción (de abajo hacia arriba)
  Sea L′k = Lk. Para i de k−1 a 1:

      L′i = Li ∪ {cada elemento par de L′i+1}.

  Cada elemento promovido (tomado de L′i+1) guarda un puente: un puntero a su posición exacta
  en L′i+1.
  ```

  Y la consulta, que está como lista numerada en prosa (#21-24), no como código:

  ```
  Buscar x en todas las listas
   1. Una única búsqueda binaria de x en L′1: O(lg n).
   2. Desde esa posición, seguir el puente más cercano hacia L′2: cae a lo más ±1 posición
      de donde x realmente iría — ajustar con O(1) comparaciones.
   3. Repetir el paso anterior para bajar a L′3, ..., Lk: O(1) cada uno.
  ```

  La cota de tamaño de #26, también literal:

  ```
  Si |L′i| = |Li| + |L′i+1| (todos), el tamaño de L′1 terminaría siendo Θ(kn).
  Promoviendo solo la mitad: |L′i| ≤ |Li| + ½|L′i+1|,
  una serie geométrica que suma |L′1| = O(n) en total, sin importar k.
  ```
- ejemplos concretos que usa el profesor (valores, puntos, secuencias):
  - **El ejemplo de tres listas de #18-19** (el único ejemplo numérico de fractional cascading en
    todo el curso, y por lo tanto muy valioso para la plataforma):
    - `L3 = [4, 9, 13, 18, 22]` (última lista, no cambia)
    - `L′2 = [3, 5, 9*, 12, 18*]` (los marcados con ∗ vienen de L3)
    - `L′1 = [2, 5*, 8, 12*, 15]` (los marcados con ∗ vienen de L′2)
    - Las listas originales se infieren: `L2` aporta 3, 5, 12 y `L1` aporta 2, 8, 15.
  - El ejemplo de puentes padre-hijos de #32-33 (ver siguiente sección).
- casos límite que menciona:
  - **¿Por qué exactamente la mitad?** (#25-26) — el caso límite central. Promover **todos**
    hace que el tamaño se dispare a Θ(kn), "de vuelta al costo original".
  - El puente "cae a lo más ±1 posición de donde x realmente iría — ajustar con O(1)
    comparaciones" (#22): un off-by-one explícito y declarado.
  - `L′k = Lk`: la última lista no se modifica (#16, #19).

### layered-range-tree
- título como lo llama el profesor: "Layered Range Trees" / "Layered Range Tree"
- tipo: structure
- diapositivas: #27-42 (idea #28-29; construcción con puentes #30-33; consulta #34-36;
  tabla antes/después #37-40; generalización #41-42)
- qué problema resuelve (según el material, no según tú):
  Eliminar el factor lg n de la consulta del Range Tree 2D aplicando fractional cascading a las
  estructuras secundarias. "Un Layered Range Tree aplica exactamente esa idea a las estructuras
  secundarias del árbol (que ya están relacionadas por mezcla padre-hijos): O(lg n) por consulta
  2D, el mismo espacio de antes." (#44)
- operaciones cubiertas:
  - **Reemplazo del BST secundario por un arreglo ordenado** (#29): "Guardamos, en cada nodo, un
    arreglo con los y de su subárbol (no un árbol) — y lo construimos mezclando los arreglos de
    sus dos hijos, como en Merge Sort."
  - **Construcción de los puentes durante el merge** (#30-31): "Cada elemento del arreglo del padre
    sabe, en O(1), en qué posición cae dentro del arreglo de cada uno de sus dos hijos — son
    exactamente los índices **pL** y **pR** que ya usa el propio proceso de Merge para decidir de
    dónde tomó cada elemento."
  - **Consulta 2D** (#34-36):
    - "Al buscar los nodos canónicos de [x1,x2], descendemos por el árbol primario de todos modos
      (para eso sirve la búsqueda de 1D). En el nodo raíz, hacemos una búsqueda binaria real de y1
      en su arreglo: O(lg n)." (#34)
    - "En cada paso hacia un hijo, usamos el puntero ya calculado para saltar, en O(1), a la
      posición de y1 en el arreglo de ese hijo — sin ninguna búsqueda binaria nueva." (#35)
- complejidades que da el profesor:

  **Tabla literal del profesor, "Range Tree 2D: antes y después" (#37-40):**

  | | Ingenuo | Layered |
  | --- | --- | --- |
  | Consulta (contar / reportar) | O(lg² n) | O(lg n) |
  | Espacio | O(n lg n) | O(n lg n) |

  Pie (#40): "Mismo espacio, un factor de lg n menos en el tiempo de consulta — fractional
  cascading no cuesta nada extra de memoria significativo aquí, solo un puntero por elemento."

  Desglose de la consulta (#36): "O(lg n) nodos canónicos × O(1) cada uno (tras la primera
  búsqueda) = O(lg n) en total — un factor de lg n menos que la versión ingenua."

  **Generalización a d dimensiones (#41-42):**
  - "Sin cascading: O(lg^{d−1} n) (la última dimensión usa un arreglo + búsqueda binaria, ya sin
    BST completo)."
  - "Con cascading en las dimensiones intermedias, para d > 2: **O(lg^{d−2} n)**."
  - Pie (#42): "Cada cascading adicional que se pueda encadenar elimina, literalmente, un factor de
    lg n del tiempo de consulta — al costo de un puntero extra por elemento, no de una estructura
    nueva."
- estilo de análisis del profesor: otro — **conteo directo de pasos** ("O(lg n) nodos canónicos ×
  O(1) cada uno", #36). Sin recurrencia, sin amortización, sin potencial. El espacio se afirma
  igual al del range tree ingenuo, sin re-derivarlo.
- prerrequisitos que el profesor asume o menciona explícitamente:
  Range Tree 2D (#8); fractional cascading en listas (#12-26); **Merge Sort** y su proceso de
  mezcla con los índices pL y pR (#29-30); nodos canónicos (#34); búsqueda binaria (#34).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: Range Tree 2D (#8, semana 4) + fractional cascading (#12-26). Y la observación de
    #28 que lo hace posible: "En el árbol de rango, las estructuras secundarias no son listas
    independientes: la de un nodo padre contiene exactamente la unión de las de sus dos hijos.
    Eso es incluso mejor que el caso general."
  - usedBy: en `Sem5_Fractional_Cascading_II.pdf` el Layered Range Tree 2D es el punto de partida
    (#8 de ese deck) y el caso base que se intenta extender a 3D.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  - #32-33 "Visualizando los puentes padre-hijos":
    ```
    padre        3    5    8    9

    hijo izq.    3    8            hijo der.   5    9
    ```
    con flechas desde cada celda del padre a su posición en ambos arreglos hijos.
    Pie (#33): "Cada elemento del arreglo del padre apunta a su posición exacta en ambos arreglos
    hijos — se calcula gratis durante la mezcla, sin ningún trabajo extra."
    Operación: **construcción de los puentes durante el merge**. Muy buen candidato a
    visualización paso a paso (ejecutar el merge y ver nacer los punteros).
  - El deck **no** tiene diagrama de la consulta (descender por el árbol saltando por los punteros).
    Es el hueco visual más relevante: la consulta es lo que justifica toda la estructura.
- pseudocódigo presente: **ninguno**. Ni de la construcción ni de la consulta. Todo en prosa.
- ejemplos concretos que usa el profesor (valores, puntos, secuencias):
  - **El ejemplo de puentes padre-hijos de #32-33**: padre `[3, 5, 8, 9]`, hijo izquierdo
    `[3, 8]`, hijo derecho `[5, 9]`. Es el único ejemplo numérico del Layered Range Tree.
  - (Y el ejemplo de listas de #18-19, de la sección anterior.)
- casos límite que menciona:
  - **No hace falta promover la mitad aquí** (#31): "aquí cada elemento del padre viene de un hijo,
    así que todos llevan puente — es incluso más simple que el caso general." Es la diferencia
    explícita entre el caso general y la aplicación al árbol.
  - "la de un nodo padre contiene exactamente la unión de las de sus dos hijos" (#28) — la
    precondición estructural que hace innecesaria la promoción parcial.
  - "la última dimensión usa un arreglo + búsqueda binaria, ya sin BST completo" (#41) — caso
    límite del anidamiento.

## Conceptos de apoyo candidatos

Cosas necesarias para entender lo anterior que las diapositivas NO explican:

- **Nodos canónicos / descomposición canónica de un rango** — usado en #8, #34, #36 como
  vocabulario conocido. En el deck de semana 4 el *mecanismo* se explica (vía
  `LCA(Predecessor(l1), Successor(r1))`, #33 de ese deck) pero **nunca se le da este nombre**.
  Es el eslabón terminológico faltante entre semana 4 y semana 5.
- **Merge Sort y sus índices pL / pR** — #29-30 los da por conocidos ("como en Merge Sort", "los
  índices pL y pR que ya usa el propio proceso de Merge"). Sin conocer el merge de dos arreglos
  ordenados, la construcción de puentes no se entiende.
- **Series geométricas** — #26 resuelve `|L′i| ≤ |Li| + ½|L′{i+1}|` como serie geométrica sin
  mostrar la suma.
- **BST / BBST** — asumido en #8.
- **Por qué "elemento par" y no "uno de cada dos empezando en el primero"** — #16 dice "cada
  elemento par de L′{i+1}"; si es índice par o posición par (1-indexado vs 0-indexado) cambia qué
  elementos se promueven. No se define.
- **Notación O(·) y `k` como número de listas vs `k` como tamaño de la respuesta** — ver huecos.

## Huecos y ambigüedades

1. **EL NOMBRE DEL ARCHIVO.** Es el hueco más grave y el más fácil de arreglar. El archivo
   `CS3014_Estructuras_de_Datos_Avanzadas_2s2026+%286%29.pdf` **es** *Fractional Cascading I,
   semana 5, 8 de septiembre de 2026*. Cualquier automatismo que asuma "archivo con nombre
   genérico = sílabo" va a romper. **Recomendación: renombrar a `Sem5_Fractional_Cascading_I.pdf`.**
   **Requiere confirmación del usuario antes de renombrar** (no toqué el archivo).
2. **COLISIÓN DE `k`.** En este deck `k` es el **número de listas** (`L1, ..., Lk`, #13) y la cota
   objetivo es `O(k + lg n)` (#15). En los decks de semana 4 y en `Fractional_Cascading_II`, `k`
   es el **tamaño de la respuesta** de una consulta output-sensitive (`O(lg n + k)`). Son dos `k`
   distintos con cotas de aspecto idéntico. **Es la ambigüedad más peligrosa del material de
   semanas 4-5** y el profesor nunca la señala. La plataforma debería renombrar una de las dos.
3. **Cero pseudocódigo formal.** La construcción (#16-17) es una fórmula y la consulta (#21-24)
   una lista en prosa. Para el Layered Range Tree no hay ni eso. Toda implementación en la
   plataforma es derivación propia. **Confirmar alcance con el usuario.**
4. **No hay visualización de la consulta**, ni en el caso general (bajar por puentes) ni en el
   Layered Range Tree (descender el árbol saltando punteros). Sólo se visualiza la **construcción**
   (#18-19, #32-33). Es exactamente al revés de lo que la plataforma más necesitaría.
5. **"cada elemento par de L′{i+1}" (#16) es ambiguo.** ¿Elemento en posición par? ¿Índice par?
   ¿1-indexado? Verificando contra el ejemplo de #18-19: `L′2 = [3, 5, 9*, 12, 18*]`; de ahí se
   promueven a `L′1` los valores 5 y 12, que están en las posiciones 2 y 4 (1-indexado) — es decir
   **posiciones pares, 1-indexado**. Pero el deck no lo dice; hay que inferirlo del dibujo.
   Vale documentarlo explícitamente.
6. **El ejemplo de #18-19 no muestra `L1` y `L2` originales.** Sólo las listas ya aumentadas.
   Para una visualización paso a paso habría que reconstruirlas (`L1 = [2, 8, 15]`,
   `L2 = [3, 5, 12]`, `L3 = [4, 9, 13, 18, 22]`) — inferencia razonable pero **no está escrita en
   el material**; marcar como derivada.
7. **La generalización de #41-42 y la de `Fractional_Cascading_II` #64-65 dicen cosas
   compatibles pero con distinto encuadre.** Aquí: "Sin cascading: O(lg^{d−1} n)... Con cascading
   en las dimensiones intermedias, para d > 2: O(lg^{d−2} n)". Allá (#64-65 de FC II): cascading
   completo O(lg^{d−2} n + k) espacio O(n lg^{d−1} n), vs sólo en la base O(lg^{d−1} n + k). Son la
   misma afirmación, pero este deck **omite el `+k`** y **omite el espacio**. Unificar en el
   knowledge map.
8. **El espacio del Layered Range Tree se afirma sin derivar.** #39 pone O(n lg n) en ambas
   columnas; #40 justifica el "no cuesta nada extra" con "solo un puntero por elemento" — que en
   realidad son **dos** punteros por elemento (uno a cada hijo, como muestra #33). Imprecisión
   menor del profesor.
9. **La consulta del Layered Range Tree sólo menciona `y1`, nunca `y2`.** #34-35 hablan de buscar
   y bajar la posición de `y1`. Pero la consulta es un rango `[y1, y2]` y hace falta también el
   extremo `y2` (o el conteo hasta él). El profesor lo omite. Para contar/reportar hace falta o
   bien cascadear ambos extremos o bien caminar desde y1. **Hueco real; confirmar con el usuario.**
10. **Este deck no tiene "Agradecimientos" distinto:** #47 repite los mismos créditos que FC II
    ("basadas en las clases de Luciano A. Romero Calla... Erik Demaine, MIT 6.851... Lista de
    créditos: Luciano A. Romero Calla, Erik Demaine, Keith Schwarz"). Referencias (#46): Demaine,
    Erik (2021) *6.851: Advanced Data Structures (Spring'21)*; de Berg, Cheong, van Kreveld &
    Overmars (2008) *Computational Geometry: Algorithms and Applications*, 3rd ed., Springer.
11. **Orden de la semana 5.** Por fechas de portada: Fractional Cascading I (8 sep) →
    Fractional Cascading II (9 sep) → Dynamic Optimality I (11 sep). Los nombres de archivo no lo
    reflejan. Confirmar con el usuario el orden de presentación deseado.

## Cobertura

- Leí **todas** las 47 páginas del PDF. No se saltó ninguna.
- Método: extracción de texto completa con `pdftotext -layout` (todas las páginas, con marcadores
  de página). Los dos diagramas del deck (#18-19 listas con puentes, #32-33 puentes padre-hijos)
  se extrajeron con sus valores numéricos legibles y están transcritos arriba, por lo que no hizo
  falta lectura visual adicional; las líneas punteadas de los puentes no se extraen, pero los pies
  de figura (#19, #33) las describen explícitamente y están citados.
- Páginas sin contenido útil propio: #1 (portada — pero es la que revela la identidad real del
  archivo), #2-6 (agenda incremental), #7, #12, #27 (separadores de sección), #43-44 (resumen),
  #45 ("Gracias"). #46 (referencias) y #47 (agradecimientos) sí tienen contenido, recogido arriba.
- Páginas ilegibles: ninguna.
- Nota: por ser beamer con overlays, muchas páginas consecutivas repiten lo anterior más una
  viñeta nueva; los rangos `#A-B` cubren el bloque completo de overlays de cada tema.
