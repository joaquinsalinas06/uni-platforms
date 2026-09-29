# Sem4_Planar_Point_Location.pdf
semana: week-04
páginas totales: 69 (diapositivas lógicas: 19; beamer con overlays incrementales)

> Nota de lectura: 69 páginas PDF = 19 diapositivas numeradas. Las referencias `#A-B` son
> **páginas del PDF**, que es lo que guarda el knowledge map.

## Temas cubiertos

### planar-point-location
- título como lo llama el profesor: "Planar Point Location (PPL)" / "Planar-Point Location"
- tipo: concept (es un **problema**, no una estructura; el profesor nunca le da nombre de estructura)
- diapositivas: #5-23 (definición y motivación), #64 (problema reto), #65-68 (resumen)
- qué problema resuelve (según el material, no según tú):
  "Imaginemos que se nos da la representación gráfica de un grafo planar (mapa planar). El
  problema de Planar Point Location (PPL) nos dan puntos (x_i, y_i) y se nos pide determinar
  en qué cara del mapa está ubicado cada uno." (#7)
- operaciones cubiertas:
  - Consulta de localización: dado (x_i, y_i), devolver la cara (#7, #9)
  - En el escenario dinámico: insertar y eliminar aristas (#17) — **sólo enunciado**, sin algoritmo
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | consulta, caso estático 2D (vía persistencia sobre el BBST del sweep line) | — | — | O(log n) (#51) | — |
  | solución completa offline | — | — | O((n+q) log n) total (#47) | — |
  | consulta, con retroactividad parcial y mapas ortogonales | — | — | O(log n), "lo cual es óptimo para este escenario" (#55) | — |

  Resultados citados de la literatura (mapas generales, dinámicos):
  - Baumgarten, Jung y Mehlhorn (1994): consulta e inserción O(log n log log n), eliminación O(log² n) (#60)
  - Arge, Brodal y Georgiadis (2006): consulta O(log n), inserción O(log^{1+ε} n), eliminación O(log^{2+ε} n) (#61)
  - Agarwal (1992), ray shooting estático: consulta O((n/√s) polylog n) y O(s^{1+ε}) de espacio, para cualquier s ∈ [1, n] (#63)
- estilo de análisis del profesor: otro — **análisis por reducción**. No hay recurrencias,
  ni amortización, ni método del potencial. El deck entero es una cadena de reducciones
  (PPL → vertical ray shooting → intersección de segmentos → RSQ / BBST + persistencia) y la
  complejidad se hereda de la estructura a la que se reduce: "Usando un Segment tree o un
  Fenwick tree se puede resolver este caso especial en O(n log n)" (#38).
- prerrequisitos que el profesor asume o menciona explícitamente:
  grafo planar y sus caras (#7); sweep line (#27, definida ahí mismo); RSQ / Range Sum Query
  (#32); Segment tree y Fenwick tree (#38, nombrados sin explicar); BBST (#43);
  persistencia sobre una estructura (#49); retroactividad parcial (#53); `Successor` (#50).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: Segment tree **o** Fenwick tree para el caso ortogonal (#38); BBST para el
    caso general (#43); persistencia sobre ese BBST para responder online (#49-50);
    retroactividad parcial para el caso dinámico restringido (#53-54).
  - usedBy: el material no dice que PPL sea usado por otra estructura del curso.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  - #8 "Figura: Ejemplo de mapa planar": subdivisión planar con vértices etiquetados
    (0,0) (0,4) (2,15) (8,0) (8,10) (10,15) (14,2) (14,8) (16,13) (16,21) (19,4) (20,15)
    (21,1) (23,15) (27,5). Operación: **entrada del problema**.
  - #9 "Figura: Ejemplo de PPL con consultas": el mismo mapa con tres puntos de consulta
    marcados con una X roja: **(4,12), (8,4) y (19,4)**. Operación: **consulta de localización**.
  - #23 "Figura: Ejemplo de vertical ray shooting en 2D (upward)": el mismo mapa, los mismos
    tres puntos de consulta, y desde cada uno una **flecha azul vertical hacia arriba** hasta
    el primer segmento que golpea. Operación: **vertical ray shooting**. Este es el diagrama
    que más pide animación paso a paso (lanzar el rayo, detectar el primer cruce).
  - El deck **no** tiene diagrama del barrido (sweep line) ni de la subdivisión, aunque es el
    mecanismo central de #27 en adelante.
- pseudocódigo presente: **ninguno**. El deck no contiene ningún bloque de pseudocódigo ni de
  código. Lo más cercano es la expresión `Query(t_{x_i}, Successor(y_i))` (#50), que es una
  fórmula, no un algoritmo.
- ejemplos concretos que usa el profesor (valores, puntos, secuencias):
  - Mapa planar con los vértices listados arriba (#8, #9, #23).
  - Puntos de consulta (4,12), (8,4), (19,4) (#9, #23).
  - Consulta simbólica: para (x_i, y_i) la respuesta es `Query(t_{x_i}, Successor(y_i))`,
    "donde t_{x_i} es la versión del BBST asociada al punto x_i" (#50).
  - Ejercicio de clase "Segment Intersections: Manhattan Geometry" (#39).
  - Problema reto "Point Location": "Dada la descripción de un mapa planar con posibles caras
    disjuntas (contando una región infinita que es el complemento de todas las caras descritas),
    determinar la etiqueta de q puntos (x_i, y_i)." (#64)
- casos límite que menciona:
  - **Región infinita**: el problema reto explicita "contando una región infinita que es el
    complemento de todas las caras descritas" (#64).
  - **Caras disjuntas** en el mapa (#64).
  - Estático ("los puntos y aristas no cambian") vs dinámico ("se permite insertar y eliminar
    aristas") (#16-17).
  - Online vs offline: "Consultas online" es el escenario declarado (#14); el approach offline
    se menciona explícitamente como "el cual no es el caso, pero vale la pena tomarlo en cuenta" (#47).
  - **Retroactividad parcial sólo funciona para segmentos completamente horizontales** (#53):
    de ahí la restricción a mapas ortogonales (#54).
  - En un mapa planar "no hay intersecciones. Esto simplifica bastante la idea." (#45)

### vertical-ray-shooting
- título como lo llama el profesor: "vertical ray shooting"
- tipo: concept (reformulación del problema)
- diapositivas: #18-23
- qué problema resuelve (según el material, no según tú):
  Caracterizar la cara de un punto: "podemos caracterizar la cara de cada punto según el primer
  segmento que 'choque' si trazamos un rayo desde el mismo verticalmente hacia arriba (eje Y
  positivo) o abajo (eje Y negativo). Este nuevo problema se llama vertical ray shooting." (#19-20)
  Y cómo hallar ese segmento: "Si consideramos las rectas verticales x = x_i para los puntos de
  consulta, la respuesta se reducirá al menor y ≥ y_i de los segmentos que se intersectan con
  la recta." (#22)
- operaciones cubiertas:
  - Disparar el rayo desde (x_i, y_i) y hallar el primer segmento (#19-22)
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | ray shooting estático (Agarwal 1992, resultado citado) | — | — | O((n/√s) polylog n) (#63) | O(s^{1+ε}), s ∈ [1,n] (#63) |

  Para la versión que el profesor construye, la complejidad la da la reducción al sweep line
  (O(log n) por consulta, #51), no un análisis propio de esta sección.
- estilo de análisis del profesor: otro — **reducción** ("caracterizar la cara según el primer
  segmento que choque" es una equivalencia, no un cálculo de costo).
- prerrequisitos que el profesor asume o menciona explícitamente:
  noción de segmento, de rayo, y de "primer cruce"; la observación de que en un mapa planar
  las caras están delimitadas por segmentos.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  usedBy: PPL se reduce a vertical ray shooting (#19-20); vertical ray shooting a su vez se
  reduce a intersección de segmentos vía sweep line (#24 en adelante).
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  - #23, descrito arriba: rayos verticales hacia arriba desde (4,12), (8,4), (19,4).
    Operación: **ray shooting upward**. Pide animación del rayo subiendo hasta el primer cruce.
- pseudocódigo presente: **ninguno**.
- ejemplos concretos que usa el profesor: los tres puntos de consulta (4,12), (8,4), (19,4)
  sobre el mapa de #8 (#23).
- casos límite que menciona:
  - Dirección del rayo: hacia arriba **o** hacia abajo, ambas válidas (#19).
  - Problema abierto: "¿Cómo resolvemos eficientemente un ray shooting con una dirección
    arbitraria? Este problema es de interés para un caso en 3 dimensiones (ray tracing)." (#58)

### interseccion-de-segmentos-sweep-line
- título como lo llama el profesor: "Reducción a intersección de segmentos" / "sweep line"
- tipo: algorithm
- diapositivas: #24-51 (caso simple #28-38; ejercicio #39; caso general #40-51)
- qué problema resuelve (según el material, no según tú):
  "Dados n segmentos, determinar si algún par de ellos se intersectan en un punto." (#25)
  Y la técnica: "Podemos usar sweep line, una técnica en la que consideraremos una recta
  vertical barriendo de menor a mayor x e interactuando con los objetos que con los que se
  intersecte." (#27)
- operaciones cubiertas:
  - **Activación / desactivación de segmentos horizontales**: "un segmento horizontal (con
    x1 ≤ x2) se activa antes de procesar el punto x1 y se desactiva después de procesar el
    punto x2" (#34)
  - **Conteo de intersecciones aportadas por un segmento vertical**: "cuando tengamos un
    segmento vertical que cubra del y1 al y2 el número de intersecciones que aporta es la
    cantidad de dichas posiciones activas en el sweep line" (#37)
  - **Mantenimiento del orden de cruces (caso general)**: "consideraremos una estructura de
    tipo BBST que nos permita ordenar los puntos y de cruce con la recta vertical del sweep
    line" (#43)
  - **Consulta online vía persistencia**: `Query(t_{x_i}, Successor(y_i))` (#50)
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | caso simple (segmentos H/V, sin intersecciones de la misma orientación) con Segment tree o Fenwick tree | — | — | O(n log n) total (#38) | — |
  | caso general offline, con puntos de consulta en el barrido | — | — | O((n+q) log n) total (#47) | — |
  | caso general online, con persistencia sobre el BBST | — | — | O(log n) por consulta (#51) | — |
  | con retroactividad parcial (mapas ortogonales) | — | — | O(log n) por consulta, "óptimo para este escenario" (#55) | — |

- estilo de análisis del profesor: otro — **reducción + herencia de cota**. El costo se atribuye
  a la estructura elegida ("Usando un Segment tree o un Fenwick tree se puede resolver este caso
  especial en O(n log n)", #38), nunca se plantea una recurrencia ni se amortiza.
- prerrequisitos que el profesor asume o menciona explícitamente:
  RSQ / Range Sum Query (#32); Segment tree (#38); Fenwick tree (#38); BBST (#43);
  persistencia (#49); retroactividad parcial (#53); `Successor` (#50); ordenar eventos por x.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - buildsOn: Segment tree / Fenwick tree (caso simple, #38); BBST + persistencia (caso
    general online, #49-50); retroactividad parcial (#53).
  - usedBy: PPL — es la estructura que responde las consultas de PPL (#49-51).
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación
  **Ninguno específico del sweep line.** Los únicos tres diagramas del deck son #8, #9 y #23
  (mapa, consultas y rayos). El barrido, la activación/desactivación de segmentos y el BBST
  de cruces se describen sólo con texto. Esto es exactamente lo que más pediría una
  visualización paso a paso en la plataforma, y el material no la trae.
- pseudocódigo presente: **ninguno**. Todo el algoritmo está en prosa (#34-38).
- ejemplos concretos que usa el profesor (valores, puntos, secuencias):
  - Ningún ejemplo numérico del barrido. La única concreción es el modelado en prosa:
    segmento horizontal con x1 ≤ x2 que "aporta con 1 punto de intersección" durante [x1, x2] (#34-35).
  - Ejercicio "Segment Intersections: Manhattan Geometry — Hay que implementar la solución al
    problema descrito anteriormente." (#39)
- casos límite que menciona:
  - **Caso simple**: "Los segmentos son verticales u horizontales y no hay intersecciones de
    segmentos con la misma orientación." (#29)
  - **Caso general**: "Si los segmentos pueden ser arbitrarios, no es posible usar la idea
    anterior así como está." (#41)
  - En un mapa planar **no hay intersecciones**, lo que simplifica el caso general (#45).
  - Orden del evento: activa **antes** de procesar x1, desactiva **después** de procesar x2 (#34)
    — un detalle de borde explícito.
  - Retroactividad parcial sólo con segmentos completamente horizontales (#53).

## Conceptos de apoyo candidatos

Cosas necesarias para entender lo anterior que las diapositivas NO explican:

- **Segment tree** — nombrado en #38 como solución del caso simple, nunca explicado en este deck.
- **Fenwick tree (BIT)** — ídem #38.
- **RSQ (Range Sum Query)** — se usa la sigla en #32 asumiendo que ya se conoce.
- **BBST** — #43, pieza central del caso general, sin definición ni esquema de balanceo.
- **Persistencia (estructuras persistentes)** — #49-50. Es *la* pieza que convierte la solución
  offline en online, y el deck sólo dice "es posible usar persistencia sobre el BBST". No define
  persistencia parcial/total, ni path copying, ni el costo de mantener versiones.
- **Retroactividad (parcial vs total)** — #53. Se usa el término y se afirma qué se puede y qué
  no, sin definirlo.
- **Grafo planar, cara, mapa planar, mapa ortogonal** — #7, #54. Vocabulario geométrico asumido.
- **`Successor` sobre el BBST de cruces** — #50, sin definir.
- **Cómo se ordenan los cruces de segmentos no horizontales con la recta de barrido** (el
  comparador del BBST cambia con x). El deck lo da por hecho en #43; es la sutileza técnica
  del sweep line general.

## Huecos y ambigüedades

1. **Cero pseudocódigo, cero código, cero ejemplo numérico del barrido.** El deck describe el
   sweep line sólo en prosa. El resumen afirma "Conseguimos implementar un caso especial de
   intersección de segmentos" (#68), pero la implementación no está en el PDF: se hizo en clase
   o en otro archivo. El usuario debe aportarla si se quiere el código del profesor.
2. **La reducción PPL → intersección de segmentos nunca se cierra del todo.** El título de la
   sección (#24) promete reducir PPL a intersección de segmentos, pero el problema que se plantea
   en #25 es *detectar si dos segmentos se intersectan*, mientras que PPL necesita *el primer
   segmento sobre un punto*. La conexión aparece recién en #50 (`Query(t_{x_i}, Successor(y_i))`),
   sin explicar cómo se etiqueta la cara a partir del segmento hallado. **Hueco importante**:
   falta el paso "segmento → cara". El problema reto (#64) pide devolver "la etiqueta" de la cara,
   así que el paso existe pero no está explicado.
3. **`Query(t_{x_i}, Successor(y_i))` (#50) no está definida.** No se dice qué devuelve `Query`,
   cómo se indexan las versiones `t_{x_i}` cuando x_i no coincide con ningún evento del barrido
   (¿se toma la versión del mayor evento ≤ x_i?), ni qué estructura es exactamente. Es la fórmula
   central de la solución online y queda como caja negra. **Requiere confirmación del usuario.**
4. **Contradicción aparente en #45.** Dice "Al ser un mapa planar, no hay intersecciones. Esto
   simplifica bastante la idea." Pero toda la sección se titula "Reducción a intersección de
   segmentos" y el problema de #25 es *hallar* intersecciones. Se entiende que las aristas del
   mapa no se cruzan entre sí (sólo comparten extremos) mientras que las rectas de barrido sí las
   cruzan — pero el profesor no lo aclara y para un estudiante suena contradictorio.
5. **El caso simple exige "no hay intersecciones de segmentos con la misma orientación" (#29)**
   pero nunca se dice qué pasa si las hay (segmentos horizontales solapados). Caso límite abierto.
6. **La retroactividad parcial (#53-55) se enuncia sin mecanismo.** Se afirma que sólo funciona
   para segmentos completamente horizontales y que la consulta sigue en O(log n) "óptimo para este
   escenario", pero no se dice sobre qué estructura se aplica la retroactividad ni por qué esa
   restricción. Sin el deck de retroactividad (¿semana anterior?) esto no se sostiene solo.
7. **Los resultados citados (#60-63) no se derivan ni se usan.** Son cultura general del área.
   Conviene marcarlos en el knowledge map como *referencias*, no como contenido a implementar.
   En particular `O((n/√s) polylog n)` de Agarwal usa un parámetro de trade-off `s` que el deck
   no explica.
8. **Fecha de la diapositiva.** Este deck dice "1 de septiembre de 2026" y el de Orthogonal Range
   Search dice "2 de septiembre de 2026", así que PPL **precede** a Range Tree en el calendario
   real, aunque el nombre del archivo (`Sem4_Planar_Point_Location`) no lo indique. Vale
   confirmar con el usuario el orden en que se quiere presentar la semana 4.
9. **Typo del profesor**: la cabecera dice "CS3014 - Estructura de Datos Avanzadas" (singular,
   sin la 's') en todo el deck, mientras que el título de la portada dice "Estructura de Datos
   Avanzados". El deck de Orthogonal Range Search usa "Estructuras de Datos Avanzadas". Cosmético.

## Cobertura

- Leí **todas** las 69 páginas del PDF. No se saltó ninguna.
- Método: extracción de texto completa con `pdftotext -layout` (todas las páginas, con marcadores
  de página), más lectura visual directa de las páginas con figuras TikZ que la extracción no
  captura: **#9 y #23** (#8 es la misma figura de #9 sin los puntos de consulta).
- Páginas sin contenido útil propio: #1 (portada), #2-4 (agenda incremental), #5 (separador de
  sección), #65-68 (resumen incremental), #69 ("Gracias").
- Páginas ilegibles: ninguna.
- Nota: por ser beamer con overlays, muchas páginas consecutivas repiten lo anterior más una
  viñeta nueva; los rangos `#A-B` cubren el bloque completo de overlays de cada tema.
