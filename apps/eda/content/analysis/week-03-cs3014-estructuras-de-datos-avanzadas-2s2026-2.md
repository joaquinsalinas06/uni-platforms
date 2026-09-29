# CS3014_Estructuras_de_Datos_Avanzadas_2s2026 (2).pdf
semana: week-03
páginas totales: 68 (páginas PDF; 34 diapositivas lógicas — Beamer con overlays)

> Nota de notación: mismo esquema que los demás mazos. Doy **siempre el rango de
> páginas PDF** (lo que usa el knowledge map) y entre paréntesis la diapositiva lógica
> del pie (`N / 34`).
>
> Mapa completo diapositiva → páginas PDF:
> 1→1, 2→2-7, sección "El Concepto de Retroactividad"→8, 4→9-10, 5→11-13, 6→14-17,
> 7→18-20, sección "El Caso Fácil"→21, 9→22-24, 10→25-26, 11→27-28,
> sección "Problemas de Búsqueda Descomponibles"→29, 13→30-31, 14→32-33, 15→34-35,
> 16→36-37, sección "El Método General de Rollback"→38, 18→39-40, 19→41-42, 20→43-44,
> sección "Caso de Estudio: Priority Queue"→45, 22→46-47, 23→48-49, 24→50-51,
> 25→52-53, 26→54-55, 27→56-57, 28→58-59, 29→60-62, 30→63-64, 31→65, 32→66, 33→67,
> 34→68.

Metadatos de portada (página 1): "CS3014 - Estructura de Datos Avanzados /
**Retroactividad** / Semana 3 / Víctor Racsó Galván Oyola / vgalvan@utec.edu.pe /
**28 de agosto de 2026**".

> **Aviso de ordenamiento de la semana 3.** Este mazo (Retroactividad, 28 de agosto) va
> **después** de `Sem_3_Persistencia-1.pdf` (Persistencia, 25 de agosto) dentro de la
> misma semana, y lo referencia explícitamente: la diapositiva 5 contrasta
> retroactividad con persistencia dando ésta por conocida. El knowledge map debería
> reflejar ese orden.

Agenda declarada por el profesor (páginas 2-7, diapositiva 2), construida en 5 overlays:
- El concepto de retroactividad (y en qué se diferencia de la persistencia)
- El caso fácil: operaciones conmutativas e invertibles
- Problemas de búsqueda descomponibles, vía Segment Tree
- El método general de rollback, y su costo
- Caso de estudio: Priority Queue retroactiva

## Temas cubiertos

### retroactivity
- título como lo llama el profesor: "El Concepto de Retroactividad" (la sección);
  "Retroactividad" en la definición
- tipo: concept
- diapositivas: #8-20 (páginas PDF), es decir la diapositiva de sección (página 8) más
  las diapositivas lógicas 4-7
- qué problema resuelve (según el material, no según yo): corregir el pasado de una
  secuencia de operaciones sin rehacer todo. Textual (páginas 9-10, diapositiva 4):
  "Ejecutaste una secuencia larga de operaciones sobre una estructura de datos. Ahora te
  das cuenta de que **olvidaste una operación** en algún punto del pasado — o que una
  operación pasada **estuvo mal** y hay que borrarla." Y el reto: "La solución ingenua
  es rehacer todo desde ese punto. Si han pasado m operaciones desde entonces, eso
  cuesta O(m). ¿Se puede hacer mejor?"
- operaciones cubiertas (el **modelo** de la línea de tiempo, páginas 14-17,
  diapositiva 6, construido en 4 overlays):
  - **Insert(t, op)** — "inserta la operación op en el tiempo t (que puede ser pasado)".
  - **Delete(t)** — "elimina la operación que estaba en el tiempo t".
  - **Query(t, op)** — "responde una consulta como si se hiciera en el tiempo t".
  Éstas son las tres operaciones de la interfaz retroactiva, y son las que todas las
  técnicas posteriores del mazo implementan.
- complejidades que da el profesor: ninguna en esta sección (las cotas vienen con cada
  técnica). Lo que da es la **taxonomía** (páginas 18-20, diapositiva 7):

  | nivel | dónde se permiten las actualizaciones | dónde se permiten las consultas |
  | --- | --- | --- |
  | retroactividad **parcial** | en cualquier tiempo (pasado incluido) | **sólo en el presente** (el tiempo más reciente) |
  | retroactividad **completa (full)** | en cualquier tiempo | **en cualquier tiempo del pasado** |

  Con la observación (página 20): "Igual que con persistencia, 'parcial' suele ser
  significativamente más barato de lograr que 'completa'."

  Y el punto de referencia contra el que se mide todo el mazo: la solución ingenua
  cuesta `O(m)` (página 10).
- estilo de análisis del profesor: **otro — definición de modelo y taxonomía**.
  Por qué: no hay costos derivados aquí; hay una interfaz (Insert/Delete/Query sobre
  tiempos), dos niveles, y una comparación conceptual con la persistencia. El análisis
  empieza en las secciones siguientes.
- prerrequisitos que el profesor asume o menciona explícitamente:
  - **Menciona explícitamente y da por visto: la persistencia.** La diapositiva 5
    (páginas 11-13) la define para contrastarla, apoyándose en el mazo de
    `Sem_3_Persistencia-1.pdf`. Dependencia dura dentro de la misma semana.
  - Asume: notación asintótica, la noción de "secuencia de operaciones sobre una
    estructura".
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - **Dualidad con la persistencia**, declarada explícitamente (página 13,
    diapositiva 5): "Son ideas '**duales**': persistencia **ramifica el futuro**;
    retroactividad **reescribe el pasado** y propaga el efecto hacia el presente."
    Y las definiciones enfrentadas: "Persistencia: Al modificar el pasado, se crea una
    versión nueva; la versión 'presente' original sigue existiendo, intacta, en
    paralelo. / Retroactividad: Al modificar el pasado, el presente se actualiza para
    reflejar ese cambio — como si el cambio siempre hubiera estado ahí. **Solo existe
    una línea de tiempo**."
  - El paralelo parcial/completa espeja el parcial/total de la persistencia, y el
    profesor lo señala ("Igual que con persistencia…").
  - `usedBy`: las cuatro técnicas del resto del mazo (`commutative-invertible`,
    `decomposable-search-problem`, `rollback-method`, `retroactive-priority-queue`).
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - **No hay ningún diagrama en esta sección.** La dualidad persistencia/retroactividad
    (una ramifica en árbol, la otra reescribe una sola línea) es exactamente lo que un
    diagrama de dos paneles resolvería, y el mazo la deja sólo en prosa. Candidata
    fuerte a visualización, reconstruible directamente del texto.
- pseudocódigo presente: ninguno. Sólo la firma de las tres operaciones del modelo,
  transcrita arriba.
- ejemplos concretos que usa el profesor (valores, árboles, secuencias): ninguno en esta
  sección. El único "ejemplo" es la narrativa del escenario (olvidaste una operación).
- casos límite que menciona:
  - El contraste parcial vs. completa es en sí el caso límite del modelo: en la parcial,
    `Query` sólo vale en el presente.
  - **No menciona**: qué pasa si se inserta en un tiempo que ya está ocupado, ni cómo se
    representan los tiempos (enteros, reales, orden denso). Ver Huecos — el ejemplo
    trabajado usa `t = 2,5`, o sea tiempos fraccionarios, sin haberlo establecido.

### commutative-invertible-retroactivity
- título como lo llama el profesor: "El Caso Fácil" (la sección); "Actualizaciones
  conmutativas e invertibles"
- tipo: algorithm (técnica)
- diapositivas: #21-28 (páginas PDF), es decir la diapositiva de sección (página 21)
  más las diapositivas lógicas 9-11
- qué problema resuelve (según el material, no según yo): lograr retroactividad parcial
  casi gratis cuando las operaciones conmutan y son invertibles. Textual (página 24,
  diapositiva 9): "Si ambas propiedades se cumplen, la retroactividad parcial es **casi
  trivial**."
- operaciones cubiertas:
  - **Insert(t, op) retroactivo** — páginas 25-26 (diapositiva 10).
    "Como op conmuta con todo lo demás, no importa en qué posición de la línea de tiempo
    se aplique realmente: `Insert(t, op) ≡ Insert(ahora, op)`. Se aplica directamente
    sobre la estructura actual."
  - **Delete(t) retroactivo** — páginas 25-26 (diapositiva 10).
    "Si la operación que había en t era op, basta aplicar su inversa ahora:
    `Delete(t) ≡ Insert(ahora, op⁻¹)`."
- complejidades que da el profesor: no da una cota genérica; da las cotas de los **dos
  ejemplos** (páginas 27-28, diapositiva 11):

  | ejemplo | op retroactiva | costo |
  | --- | --- | --- |
  | Tabla hash con inserciones | retroactividad parcial | `O(1)` **amortizado**, "igual que la operación original" |
  | Arreglo con `A[i] += Δ` | retroactividad parcial | `O(1)`, "igual que la operación original" |

  La tesis es cualitativa: el overhead retroactivo es **cero** — la operación retroactiva
  cuesta lo mismo que la original.
- estilo de análisis del profesor: **otro — argumento algebraico (reducción por
  propiedades)**.
  Por qué lo clasifico así: no hay recurrencia, ni potencial, ni conteo. El argumento es
  una **equivalencia**: por conmutatividad, la posición temporal es irrelevante, luego
  `Insert(t, op) ≡ Insert(ahora, op)`; por invertibilidad, borrar es aplicar la inversa.
  El costo se hereda de la operación original sin análisis adicional. Es razonamiento
  por propiedades algebraicas de las operaciones, no análisis de costo.
- prerrequisitos que el profesor asume o menciona explícitamente:
  - **Conmutatividad** e **invertibilidad**: el profesor **sí las define**, y es de las
    pocas cosas que define bien (páginas 22-24, diapositiva 9):
    "Conmutativas: `op_x` seguida de `op_y` tiene el mismo efecto que `op_y` seguida de
    `op_x`: el orden no importa."
    "Invertibles: Existe una operación `op_x⁻¹` tal que aplicar `op_x` y luego `op_x⁻¹`
    deja la estructura exactamente como estaba."
  - Asume (no explica): **tabla hash** y su `O(1)` amortizado.
  - Asume: notación asintótica.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `buildsOn: retroactivity` (el modelo de la línea de tiempo).
  - El profesor marca su **límite** al abrir la sección siguiente (páginas 30-31,
    diapositiva 13): "La mayoría de las estructuras interesantes (pilas, colas, árboles
    de búsqueda, priority queues…) tienen operaciones que **sí dependen del orden**. El
    truco anterior no aplica directamente. **Necesitamos algo más general.**"
    O sea, esta técnica es el piso y las siguientes la superan.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - **Ninguno.** Toda la sección es prosa y dos equivalencias.
- pseudocódigo presente: no hay bloques "Algoritmo N". Las dos equivalencias funcionan
  como el algoritmo:

```
Insert(t, op)  ≡  Insert(ahora, op)          // por conmutatividad
Delete(t)      ≡  Insert(ahora, op⁻¹)        // por invertibilidad, si en t estaba op
```
(páginas 25-26, diapositiva 10)

- ejemplos concretos que usa el profesor (valores, árboles, secuencias):
  - **Tabla hash con inserciones** (páginas 27-28): "Insertar una llave nueva conmuta
    con insertar otra llave distinta; eliminarla es la operación inversa."
  - **Arreglo con `A[i] += Δ`** (páginas 27-28): "Sumar Δ a la posición i conmuta
    consigo misma en cualquier posición, y su inversa es sumar −Δ."
  - Ambos son ejemplos **de clase de operación**, no instancias con valores. No hay una
    traza con números.
- casos límite que menciona:
  - La restricción "insertar una llave **nueva**" y "otra llave **distinta**" en el
    ejemplo de la tabla hash: el profesor es cuidadoso ahí, porque insertar la misma
    llave dos veces no conmutaría igual. Lo dice de pasada, sin desarrollarlo.
  - La sección siguiente enuncia el caso límite global: las estructuras cuyas
    operaciones dependen del orden (pilas, colas, BSTs, priority queues).
  - **No menciona**: qué pasa si la operación es conmutativa pero no invertible, o al
    revés. El profesor exige ambas y no explora las combinaciones parciales.

### decomposable-search-problem
- título como lo llama el profesor: "Problemas de Búsqueda Descomponibles" (la sección);
  "Problema de búsqueda descomponible"
- tipo: concept (con una técnica asociada: el Segment Tree sobre el tiempo)
- diapositivas: #29-37 (páginas PDF), es decir la diapositiva de sección (página 29)
  más las diapositivas lógicas 13-16
- qué problema resuelve (según el material, no según yo): dar retroactividad **completa**
  a cualquier problema de búsqueda descomponible, con overhead `O(lg m)`. Es la
  respuesta al "necesitamos algo más general" de la diapositiva 13.
- operaciones cubiertas:
  - **Definición de descomponibilidad** — páginas 32-33 (diapositiva 14).
  - **Construcción del Segment Tree sobre el eje del tiempo** — páginas 34-35
    (diapositiva 15).
  - **Update (insertar/eliminar una operación en el tiempo t)** — páginas 34-35:
    "Insertar/eliminar una operación en el tiempo t actualiza `O(lg m)` nodos del
    Segment Tree (donde m es el número de operaciones) — ¡el mismo Update que ya
    conocemos!"
  - **Query en cualquier tiempo** — páginas 36-37 (diapositiva 16), vía el resultado
    global.
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | `f` (la función de combinación) | — | — | `O(1)` **por hipótesis** de la definición | — |
  | Update (insertar/eliminar op en tiempo t) | — | — | `O(lg m)` nodos actualizados, con m = número de operaciones | no lo da |
  | overhead de la retroactividad completa | — | — | **`O(lg m)` multiplicativo por operación** | no lo da |
  | consulta retroactiva, si la original costaba `O(q)` | — | — | `O(q · lg m)` | no lo da |

  El resultado, textual (páginas 36-37, diapositiva 16): "Cualquier problema de búsqueda
  descomponible admite **retroactividad completa** con un overhead multiplicativo de
  `O(lg m)` por operación, usando un Segment Tree sobre el tiempo." Y: "Si la estructura
  original respondía en `O(q)`, la versión retroactiva responde en `O(q lg m)`."

  Ojo con los dos parámetros distintos: **`m`** = número de operaciones (eje del
  tiempo); **`n`** = tamaño de los datos. El mazo los usa consistentemente pero nunca
  los presenta juntos.
- estilo de análisis del profesor: **otro — reducción estructural a una estructura
  conocida**.
  Por qué lo clasifico así: el argumento completo es "construyo un Segment Tree sobre el
  tiempo; su Update toca `O(lg m)` nodos; luego el overhead es `O(lg m)`". No hay
  recurrencia planteada ni amortización: se **hereda** la cota del Segment Tree, que se
  da por conocida ("¡el mismo Update que ya conocemos!"). Es análisis por reducción.
- prerrequisitos que el profesor asume o menciona explícitamente:
  - **Segment Tree**: asumido por completo y anunciado como repaso —
    la diapositiva 15 se titula literalmente "**La conexión con la clase pasada:
    Segment Tree**". Ver Huecos #1: la clase pasada (Persistencia) tampoco lo enseña.
  - Asume: altura `O(lg m)` de un árbol de segmentos sobre m hojas; la operación
    `Update` de un segment tree.
  - Asume (no explica): partición de un conjunto, `A ∪ B`, y el operador `∨` (o lógico),
    que usa en la lista de ejemplos de `f`.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `buildsOn: segment-tree` — declarado como "la clase pasada", pero **el referente no
    existe en `raw-materials/` semanas 1-3**. Ver Huecos #1.
  - `buildsOn: retroactivity` — implementa el nivel "completa" del modelo.
  - Conexión con el otro mazo de la semana: `Sem_3_Persistencia-1.pdf` páginas 57-61
    usa el **mismo** Segment Tree como ejemplo de path copying, con su `Update`
    transcrito. Los dos mazos se apoyan en la misma pieza no enseñada.
  - El profesor marca su **límite** en la sección del caso de estudio (páginas 46-47,
    diapositiva 22): el `O(lg n · lg m)` que daría este método genérico es peor que la
    solución especializada, "**Delete-Min no es un problema descomponible simple**".
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - **Ninguno.** Ésta es una carencia seria: "un Segment Tree **sobre el eje del
    tiempo**, cada hoja un instante entre dos operaciones consecutivas, cada nodo
    interno resume con `f` su rango de tiempo" es una idea intrínsecamente visual y el
    mazo no la dibuja. El diagrama del mazo de Persistencia (página 57, el segment tree
    de rangos `[1,4]`…`[4,4]` con el camino en naranja) es la base natural para
    construirla, pero ahí los índices son posiciones de un arreglo, no instantes.
- pseudocódigo presente: **ninguno**. Sólo la definición formal:

```
Problema de búsqueda descomponible (páginas 32-33):
Un problema de búsqueda sobre un conjunto S es descomponible si, para cualquier
partición S = A ∪ B:

    Query(x, A ∪ B) = f( Query(x, A), Query(x, B) )

para alguna función f calculable en O(1).
```

Y la construcción en prosa (páginas 34-35), que funciona como algoritmo de alto nivel:

```
Construimos un Segment Tree sobre el eje del tiempo:
  - cada hoja es un instante entre dos operaciones consecutivas;
  - cada nodo interno resume, con f, el efecto acumulado de todo su rango de tiempo.
Insertar/eliminar una operación en el tiempo t actualiza O(lg m) nodos del Segment Tree
(donde m es el número de operaciones).
```

- ejemplos concretos que usa el profesor (valores, árboles, secuencias):
  - Los cuatro problemas descomponibles con su `f` (páginas 32-33, diapositiva 14):
    "Mínimo, máximo, suma, existencia de un elemento — todos son descomponibles:
    `f = mín, máx, +, ∨`, respectivamente."
  - **No hay** ninguna instancia con valores, ni un árbol de tiempo dibujado, ni una
    traza de Update.
- casos límite que menciona:
  - La exigencia de que **`f` sea calculable en `O(1)`** — es la hipótesis que sostiene
    toda la cota, y el profesor la pone en la definición.
  - El contraejemplo, enunciado más adelante: **`Delete-Min` no es descomponible
    (simple)** (página 47, diapositiva 22). Es el caso límite más importante del mazo,
    porque motiva toda la sección final.
  - **No menciona**: qué pasa si la partición no es disjunta, ni si `f` debe ser
    asociativa/conmutativa (lo es en los cuatro ejemplos, pero no lo exige en la
    definición).

### rollback-method
- título como lo llama el profesor: "El Método General de Rollback" (la sección);
  "El método de rollback"
- tipo: algorithm (técnica)
- diapositivas: #38-44 (páginas PDF), es decir la diapositiva de sección (página 38)
  más las diapositivas lógicas 18-20
- qué problema resuelve (según el material, no según yo): dar retroactividad cuando
  ninguna de las técnicas anteriores aplica. Textual (páginas 39-40, diapositiva 18):
  "**Cuando nada de lo anterior aplica.** Guardamos la secuencia completa de operaciones
  (un log). Para `Insert(t, op)` o `Delete(t)`: deshacemos (rollback) todas las
  operaciones posteriores a t, aplicamos el cambio, y las rehacemos en orden."
- operaciones cubiertas:
  - **Insert(t, op)** y **Delete(t)** vía rollback + replay — páginas 39-40
    (diapositiva 18).
  - El **requisito** sobre las operaciones — página 40: "Que cada operación (y su
    inversa) sea `O(1)` u `O(lg n)` — cualquier estructura eficiente y reversible sirve."
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | Insert(t, ·) / Delete(t) | `r` pequeño si t está cerca del presente (página 42) | — | `O(r) × (costo de una operación individual)`, con `r` = número de operaciones después de t (páginas 41-42) | log completo de operaciones (implícito; no lo cuantifica) |
  | **cota inferior** | — | — | **`Ω(r)` es necesario en general** (páginas 43-44, diapositiva 20) | — |

  Comentario del profesor sobre el rango (página 42): "Si t está muy cerca del presente,
  r es pequeño y el método es barato; si t está muy atrás, `r ≈ m` y es tan caro como
  rehacerlo todo."

  Éste es el **único lugar de las tres semanas donde el profesor da una cota inferior**.
- estilo de análisis del profesor: **otro — conteo directo del trabajo rehecho, más un
  argumento de cota inferior (adversario informal)**.
  Por qué lo clasifico así: el costo superior es multiplicación directa (`r` operaciones
  deshechas + rehechas × costo unitario), sin recurrencia ni amortización. Y la cota
  inferior es un argumento de **necesidad informal** (páginas 43-44, diapositiva 20):
  "existen estructuras (y secuencias de operaciones) donde modificar el tiempo t
  necesariamente cambia el resultado de consultas que dependen de las r operaciones
  posteriores, así que **alguna estructura debe reflejar ese cambio en `Ω(r)` de sus
  partes**." Es un esbozo de adversario, no una prueba formal (el profesor no exhibe la
  familia de instancias).
- prerrequisitos que el profesor asume o menciona explícitamente:
  - **Menciona explícitamente**: que cada operación tenga una **inversa** eficiente —
    conecta con la sección "El Caso Fácil", donde la invertibilidad se definió.
  - Asume: la noción de "log de operaciones" / undo-redo, usada sin definir.
  - Asume: notación `Ω` para cotas inferiores (primera aparición de `Ω` con contenido
    en las tres semanas).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `buildsOn: retroactivity`; reusa la noción de **invertibilidad** de la sección
    "El Caso Fácil".
  - El profesor lo posiciona como **el piso genérico contra el que se miden las
    técnicas especializadas** (página 44, diapositiva 20): "Por eso las técnicas
    especializadas (como la de la siguiente sección) son valiosas: **rompen esta
    barrera** aprovechando propiedades específicas del problema."
  - El caso de estudio de la priority queue lo cita dos veces como referencia a superar
    (páginas 46-47 y 54-55).
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - **Ninguno.** El rollback (deshacer r operaciones, insertar, rehacer r operaciones)
    es una animación obvia sobre una línea de tiempo, y el mazo no la trae.
- pseudocódigo presente: no hay bloques "Algoritmo N". El método en prosa
  (páginas 39-40) es lo más cercano:

```
Método de rollback (para Insert(t, op) o Delete(t)):
1. Guardamos la secuencia completa de operaciones (un log).
2. Deshacemos (rollback) todas las operaciones posteriores a t.
3. Aplicamos el cambio.
4. Las rehacemos en orden.

Requiere: que cada operación (y su inversa) sea O(1) u O(lg n)
          — cualquier estructura eficiente y reversible sirve.

Costo: O(r) × (costo de una operación individual),
       donde r = número de operaciones después de t.
```

- ejemplos concretos que usa el profesor (valores, árboles, secuencias): **ninguno**.
  Ni una estructura concreta, ni una secuencia, ni la familia de instancias que
  realizaría la cota inferior `Ω(r)`.
- casos límite que menciona:
  - **`t` cerca del presente** (`r` pequeño, método barato) vs. **`t` muy atrás**
    (`r ≈ m`, tan caro como rehacerlo todo) — página 42. Es el análisis de casos
    extremos explícito.
  - La **cota inferior `Ω(r)`** como caso peor inevitable en general (páginas 43-44).
  - **No menciona**: el costo en espacio del log, ni qué pasa si una operación no es
    invertible (el método simplemente no aplica, pero no lo dice).

### retroactive-priority-queue
- título como lo llama el profesor: "Caso de Estudio: Priority Queue" (la sección);
  "Priority Queue retroactiva" en la agenda
- tipo: structure
- diapositivas: #45-64 (páginas PDF), es decir la diapositiva de sección (página 45)
  más las diapositivas lógicas 22-30
- qué problema resuelve (según el material, no según yo): volver **retroactiva parcial**
  una cola de prioridad, en `O(lg n)` amortizado, rompiendo la barrera `O(r)` del
  rollback. Textual (páginas 46-47, diapositiva 22): "Priority Queue (montículo):
  Soporta `Insert(k)` y `Delete-Min`, cada una en `O(lg n)`. Queremos volverla
  **retroactiva parcial**: poder insertar o eliminar operaciones en el pasado de la
  línea de tiempo, y consultar el estado actual."
  Y la meta explícita (página 47): "Lograrlo en `O(lg n)` amortizado por operación
  retroactiva — mucho mejor que el rollback genérico, y mejor incluso que el
  `O(lg n · lg m)` que daría el Segment Tree genérico (Delete-Min no es un problema
  descomponible simple)."
- operaciones cubiertas:
  - **Insert(t, 'insert(k)') retroactivo** — páginas 52-53 (diapositiva 25), la fórmula
    del efecto neto. Es la operación desarrollada.
  - **El concepto de bridge (puente)** — páginas 56-57 (diapositiva 27).
  - **Cálculo de M vía el puente más cercano** — páginas 58-59 (diapositiva 28).
  - **Delete retroactivo** — mencionado sólo en el enunciado del resultado final
    (páginas 63-64, diapositiva 30): "`Insert` y `Delete` retroactivos parciales sobre
    una priority queue cuestan `O(lg n)` amortizado". **Sin desarrollo propio.**
  - **Query**: por ser retroactividad *parcial*, sólo en el presente (`Q_ahora`). No
    tiene tratamiento propio.
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | Insert(k) / Delete-Min de la PQ base | — | — | `O(lg n)` (página 46) | no lo da |
  | cálculo ingenuo de M | — | — | `O(r)` — "de vuelta al O(r) del rollback genérico" (páginas 54-55) | — |
  | **Insert retroactivo parcial** | — | — | **`O(lg n)` amortizado** (páginas 63-64) | no lo da |
  | **Delete retroactivo parcial** | — | — | **`O(lg n)` amortizado** (páginas 63-64) | no lo da |
  | alternativa: rollback genérico | — | — | `O(r)` | — |
  | alternativa: Segment Tree genérico | — | — | `O(lg n · lg m)` — y además no aplica bien | — |

  Atribución del resultado (páginas 63-64, diapositiva 30): "**El resultado (Demaine,
  Iacono, Langerman, 2007)**: Con la estructura de puentes mantenida sobre un árbol
  balanceado, Insert y Delete retroactivos parciales sobre una priority queue cuestan
  `O(lg n)` amortizado — el mismo orden que las operaciones originales."
- estilo de análisis del profesor: **otro — argumento estructural sobre el problema
  (caracterización del efecto neto), con la cota final citada como resultado externo**.
  Por qué lo clasifico así: el corazón del análisis no es una recurrencia ni un
  potencial, sino un **teorema estructural sobre qué hace realmente una inserción
  retroactiva** (páginas 50-51, diapositiva 24): "A pesar de la cascada aparente,
  insertar k en el tiempo t tiene, en el presente, un efecto neto muy simple: **o bien k
  termina en `Q_ahora`, o bien reemplaza (en el conjunto de elementos eliminados) a
  exactamente un elemento — ¡nunca más que eso!**" A partir de ahí el costo se reduce al
  de calcular `M`, y eso se acota con los puentes + un BST balanceado con información
  agregada. La cota `O(lg n)` amortizada final **no se demuestra**: se cita
  (Demaine–Iacono–Langerman 2007). El profesor lo dice sin disimulo.
  El cierre pedagógico (página 64) confirma el estilo: "Un ejemplo de cómo **entender la
  estructura del problema** (aquí, que el efecto de una inserción retroactiva se reduce
  a un único intercambio) permite superar por mucho la cota genérica `O(r)` del rollback."
  **No es amortized ni potential-method** pese a que la cota se enuncia como amortizada:
  el mazo no hace el análisis amortizado, sólo reporta el resultado.
- prerrequisitos que el profesor asume o menciona explícitamente:
  - **Menciona explícitamente**: priority queue / montículo con `Insert` y `Delete-Min`
    en `O(lg n)` (página 46). Conecta directo con las semanas 1-2 del curso.
  - **Menciona explícitamente**: "una estructura balanceada (**BST**) indexada por
    tiempo, con **información agregada** (máximo de lo no presente en `Q_ahora`) en cada
    subárbol" (página 59). El BST balanceado y la idea de agregado por subárbol se
    asumen conocidos.
  - Asume: el método de rollback y el Segment Tree sobre el tiempo (secciones previas
    del mismo mazo), para las comparaciones.
  - Asume: notación de conjuntos (`∪`, `∈`, `∉`, `⊆`, `máx`).
  - **No explica** cómo se mantienen los puentes dinámicamente — dice "con la estructura
    de puentes mantenida sobre un árbol balanceado" y ahí termina. Es el hueco técnico
    central.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `buildsOn`: la **priority queue / montículo** de las semanas 1-2 (el profesor la
    llama "(montículo)" explícitamente en la página 46). Relación directa con
    `binary-heap`, `binomial-heap`, `fibonacci-heap`.
  - `buildsOn: retroactivity` (nivel parcial).
  - `buildsOn`: BST balanceado con agregados (asumido, no enseñado).
  - Se compara explícitamente con `rollback-method` (`O(r)`) y con
    `decomposable-search-problem` (`O(lg n · lg m)`), superando ambos.
  - `usedBy`: ninguno declarado.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - **Páginas 60-62 (diapositiva 29): la tabla-línea-de-tiempo del ejemplo trabajado.**
    Verificada visualmente. Es una tabla de 3 filas × 5 columnas (tiempo / operación /
    efecto), construida en 3 overlays (primero la tabla, luego el estado y la inserción
    retroactiva, luego el cálculo). Es la única figura del mazo y es **casi** una
    visualización paso a paso: le falta mostrar el estado *después* de la inserción
    retroactiva. Visualización pedida: **Insert retroactivo sobre la línea de tiempo**,
    con la fila "efecto" recalculándose.
  - **Ausencias graves**: no hay diagrama del **bridge** (la definición `Q_t' ⊆ Q_ahora`
    es visual por naturaleza: una línea de tiempo con marcas donde nada de lo vivo se
    eliminó después), ni del **BST indexado por tiempo con agregados**, ni de la
    **cascada** de Delete-Mins que la diapositiva 23 describe en prosa. Las tres son
    reconstruibles del texto (derivación, no invención), pero conviene autorización.
- pseudocódigo presente: **ninguno**. Es el único tema con desarrollo largo en las tres
  semanas que no trae un solo bloque "Algoritmo N". Lo que hay son fórmulas:

```
Efecto neto de Insert(t, 'insert(k)') retroactivo (páginas 52-53):

    M = máx( {k} ∪ { k' : k' fue eliminado en tiempo ≥ t } )

Se inserta M en Q_ahora.
  - Si M = k:  k era "demasiado grande" para haber sido eliminado por ningún
               Delete-Min en el camino — simplemente se agrega a Q_ahora.
  - Si M ≠ k:  M es el mayor de los eliminados desde t; "sobrevive" hasta ahora y
               entra a Q_ahora, mientras k toma su lugar entre los eliminados.
```

```
Bridge (puente) — definición (páginas 56-57):

Un tiempo t' es un puente si  Q_t' ⊆ Q_ahora
  (todo elemento presente en la priority queue en el instante t' sigue presente en
   el presente; nada de lo que había en t' fue eliminado después).

Por qué ayuda: si t' es un puente, ningún elemento presente en t' puede aparecer en
el conjunto "eliminado desde t" para ningún t ≥ t' — son, por definición, sobrevivientes.
```

```
La fórmula final, usando el puente más cercano (páginas 58-59)
Sea t' el puente más cercano ANTES de t:

    máx{ k' : k' eliminado en tiempo ≥ t }

    máx{ k' ∉ Q_ahora : k' insertado en tiempo ≥ t' }.
```
**Transcrito tal cual: las dos expresiones aparecen apiladas sin ningún símbolo
relacional entre ellas.** Verificado leyendo la página 59 como imagen — no es una
pérdida de la extracción de texto, la diapositiva realmente no tiene el `=`. Ver
Huecos #3.

- ejemplos concretos que usa el profesor (valores, árboles, secuencias):
  - **El ejemplo trabajado** (páginas 60-62, diapositiva 29), el mejor ejemplo concreto
    de las tres semanas. Verificado visualmente:

    | tiempo | 1 | 2 | 3 | 4 | 5 |
    | --- | --- | --- | --- | --- | --- |
    | operación | ins(5) | ins(2) | del-min | ins(8) | del-min |
    | efecto | {5} | {5, 2} | elimina 2 | {5, 8} | elimina 5 |

    Estado: `Q_ahora = {8}`; los eliminados desde `t = 2`: `{2, 5}`.
    Inserción retroactiva: `Insert(2,5, 'insert(3)')` — es decir **tiempo 2,5**
    (coma decimal española), "entre los tiempos 2 y 3".
    Cálculo: `M = máx({3} ∪ {2, 5}) = 5`. Como `M ≠ 3`: se inserta 5 en `Q_ahora`
    (que pasa a ser `{8, 5}`), y 3 pasa a formar parte del conjunto de eliminados.
    Justificación del profesor: "si 3 se hubiera insertado antes del primer Delete-Min,
    ese Delete-Min habría eliminado 2 igual (es el menor), pero el segundo Delete-Min
    ahora elimina 3 en vez de 5 — y 5 sobrevive."
  - La pregunta socrática (páginas 48-49, diapositiva 23), útil para `exercises.md`:
    "Si insertas k en el pasado y k es menor que lo que se eliminó en el siguiente
    Delete-Min, ese elemento 'sobrevive' un turno más… ¿y entonces qué pasa con el
    siguiente Delete-Min?"
- casos límite que menciona:
  - **Los dos casos de la fórmula** (`M = k` y `M ≠ k`) — páginas 52-53. Es el caso
    límite mejor tratado de las tres semanas: el profesor explica ambos ramos.
  - **El cálculo ingenuo de M** (páginas 54-55): "requeriría revisar, en el peor caso,
    las r operaciones posteriores a t — de vuelta al `O(r)` del rollback genérico." Es
    el caso peor que motiva los puentes.
  - La dificultad de fondo (páginas 48-49, diapositiva 23): "`Delete-Min` 'recuerda'
    implícitamente todo lo insertado antes… Insertar una llave nueva en el pasado puede
    cambiar qué elemento eliminó cada Delete-Min posterior — **en cascada, uno tras
    otro**."
  - **No menciona**: qué pasa si no existe ningún puente antes de t (¿se toma el inicio
    de la línea de tiempo?); llaves duplicadas (y el ejemplo usa `máx` sobre conjuntos,
    donde los duplicados importan); `Delete-Min` sobre una cola vacía; ni cómo se
    inserta retroactivamente un `Delete-Min` (¡el mazo sólo trata la inserción
    retroactiva de un `insert(k)`!). Ver Huecos #4.

## Conceptos de apoyo candidatos

Cosas necesarias para entender lo anterior que las diapositivas NO explican.
Ninguna es un tema del curso; son andamios.

1. **Segment Tree.** Mismo problema que en el mazo de Persistencia, y aquí es peor
   porque el profesor lo anuncia como repaso ("La conexión con la clase pasada") sin que
   exista tal clase en el material. Se necesita: descomposición en rangos, altura
   `O(lg m)`, `Update`, y la noción de "resumen agregado por nodo". Máxima prioridad
   (ver Huecos #1).
2. **BST balanceado con información agregada por subárbol.** La solución final de la
   priority queue retroactiva descansa entera en "una estructura balanceada (BST)
   indexada por tiempo, con información agregada (máximo de lo no presente en `Q_ahora`)
   en cada subárbol" (página 59). El mazo no explica ni el balanceo ni cómo se mantiene
   el agregado bajo actualizaciones.
3. **Cómo se mantienen los puentes dinámicamente.** El concepto de puente se define
   bien, pero "la estructura de puentes mantenida sobre un árbol balanceado" (página 63)
   es una caja negra. Es el hueco técnico más grande del mazo: sin esto, la cota
   `O(lg n)` amortizada es un acto de fe.
4. **Tabla hash y su `O(1)` amortizado.** Usada como ejemplo del caso conmutativo e
   invertible, sin definirse.
5. **Log de operaciones / patrón undo-redo.** Base del método de rollback, asumido.
6. **Notación `Ω` y qué es una cota inferior.** Primera aparición con contenido en las
   tres semanas (páginas 43-44). El profesor la usa sin explicar qué significa probar
   una cota inferior ni qué es un argumento de adversario.
7. **Representación del tiempo (orden denso).** El ejemplo trabajado inserta en `t = 2,5`
   entre los tiempos 2 y 3, o sea el modelo necesita poder **insertar un tiempo nuevo
   entre otros dos**. Eso es exactamente la *order-maintenance data structure* que el
   mazo hermano de Persistencia menciona (página 41 de `Sem_3_Persistencia-1.pdf`), pero
   este mazo **no hace la conexión**. Vale la pena señalarla.
8. **Priority queue / montículo.** No es andamio externo: es **contenido de las semanas
   1-2**. Lo anoto para que el knowledge map lo resuelva como referencia cruzada, no
   como concepto nuevo.
9. **Notación `Q_t`, `Q_ahora`.** El profesor la usa desde la página 50 sin
   introducirla; se entiende por contexto ("el estado de la priority queue en el tiempo
   t"), pero nunca la declara.

## Huecos y ambigüedades

1. **El Segment Tree se anuncia como "la clase pasada" y no existe en el material.**
   La diapositiva 15 (páginas 34-35) se titula "**La conexión con la clase pasada:
   Segment Tree**" y dice "¡el mismo `Update` que ya conocemos!". Pero la clase pasada
   respecto a este mazo (28 de agosto) es `Sem_3_Persistencia-1.pdf` (25 de agosto), que
   **también** usa el Segment Tree como pieza conocida sin enseñarlo; y las semanas 1-2
   son íntegramente montículos. **Falta un mazo, o el profesor lo dio fuera de este
   material.** Es la ambigüedad número uno de las tres semanas y bloquea la generación
   de contenido de semana 3: el usuario debe decidir si `segment-tree` es una estructura
   del curso con carpeta propia o un `supportConcept: true`. Aparece en los **dos** mazos
   de la semana 3.
2. **El caso de estudio no tiene nada de pseudocódigo.** `retroactive-priority-queue` es
   el tema más largo del mazo (20 páginas) y no trae un solo bloque "Algoritmo N".
   Para `operations/*.md`, que exige pseudocódigo y `cppSteps`, **no hay material
   fuente**: habría que derivarlo de las fórmulas y la prosa. Es derivación defendible
   (la fórmula de `M` y la definición de puente están completas), pero requiere
   autorización explícita del usuario, y la parte de "mantener los puentes" **no es
   derivable** del material (ver Hueco #5).
3. **Falta el símbolo relacional en la fórmula del puente (página 59).** El profesor
   apila `máx{k' : k' eliminado en tiempo ≥ t}` y
   `máx{k' ∉ Q_ahora : k' insertado en tiempo ≥ t'}` **sin ningún `=` ni `≤` entre
   ellas**. Verificado leyendo la página como imagen: no es un artefacto de la
   extracción de texto, la diapositiva está así. Por el contexto ("La búsqueda se reduce
   a mirar solo lo insertado después del puente") la intención es claramente una
   **igualdad**, pero es una errata que el usuario debería confirmar antes de que se
   escriba en la plataforma como identidad.
4. **El mazo sólo trata la inserción retroactiva de `insert(k)`.** Nunca explica cómo se
   inserta retroactivamente un `Delete-Min`, ni cómo se hace `Delete(t)` cuando en `t`
   había un `insert` o un `del-min`. El resultado final (página 63) afirma que
   "`Insert` y `Delete` retroactivos parciales… cuestan `O(lg n)` amortizado", pero
   **sólo uno de los cuatro casos está desarrollado**. Es el hueco de contenido más
   grande del caso de estudio.
5. **La cota `O(lg n)` amortizada se cita, no se demuestra.** Se atribuye a
   Demaine–Iacono–Langerman (2007) y ahí queda. El `reasoning` disponible cubre *por qué
   el efecto neto es un solo intercambio* y *por qué los puentes acotan la búsqueda*,
   pero **no** por qué mantener los puentes cuesta `O(lg n)` amortizado. Hay que ser
   honesto en la plataforma y no inflar el argumento.
6. **Ambigüedad tipográfica en el ejemplo trabajado: `2,5` es un tiempo, `{2, 5}` es un
   conjunto.** En la misma diapositiva (páginas 60-62) aparecen `Insert(2,5, 'insert(3)')`
   (tiempo **2,5** con coma decimal española) y "los eliminados desde t = 2: `{2, 5}`"
   (el conjunto de las llaves 2 y 5). Verificado visualmente. Es una coincidencia
   desafortunada que confunde al leer. En la plataforma conviene escribir `t = 2.5`.
7. **El ejemplo trabajado dice "eliminados desde t = 2" pero la inserción es en t = 2,5.**
   El conjunto `{2, 5}` corresponde a los eliminados en tiempos 3 y 5, que son ≥ 2,5;
   así que el resultado es correcto, pero el enunciado del estado (`t = 2`) y el de la
   operación (`t = 2,5`) usan tiempos distintos sin aclararlo. Menor, pero confunde.
8. **Los puentes nunca se ejemplifican.** El ejemplo trabajado (páginas 60-62) calcula
   `M` **directamente**, sin usar puentes — o sea, ilustra la fórmula del efecto neto
   pero no la técnica que la hace eficiente. No hay ni un puente identificado en ninguna
   línea de tiempo concreta. Para `examples.md` de los puentes no hay material.
9. **No se demuestra el "resultado sorprendente".** La afirmación central (páginas 50-51:
   "o bien k termina en `Q_ahora`, o bien reemplaza a exactamente un elemento — ¡nunca
   más que eso!") se enuncia y se justifica con la intuición del ejemplo, pero no se
   prueba. Es el teorema del que cuelga todo el caso de estudio.
10. **La cota inferior `Ω(r)` es un esbozo.** Páginas 43-44: "existen estructuras (y
    secuencias de operaciones) donde…" — el profesor no exhibe la familia de instancias.
    No da para una demostración en la plataforma; sí para una sección de "por qué es
    difícil".
11. **Dos parámetros, `n` y `m`, nunca presentados juntos.** `m` = número de operaciones
    en la línea de tiempo; `n` = tamaño de los datos; `r` = operaciones posteriores a t.
    El mazo los usa correctamente pero jamás los define en un solo lugar, y la
    comparación clave (`O(lg n)` vs `O(lg n · lg m)` vs `O(r)`) exige tenerlos claros.
12. **Cero ejemplos en tres de las cuatro técnicas.** `commutative-invertible`,
    `decomposable-search-problem` y `rollback-method` no tienen ninguna traza concreta.
    Sólo el caso de estudio trae el ejemplo de la tabla.
13. **Las diapositivas 3, 8, 12, 17 y 21 no existen** como páginas con pie numerado:
    las páginas 8, 21, 29, 38 y 45 son diapositivas de sección (sólo título, sin pie).
    Por eso el mapa salta 2→4, 7→9, 11→13, 16→18 y 20→22. No es un error.
14. **Orden inusual del cierre**: en este mazo "Gracias" (página 66, diapositiva 32)
    viene **antes** de Referencias (página 67) y Agradecimientos (página 68). En los
    demás mazos "Gracias" va al final. Irrelevante para el contenido, pero lo anoto por
    si el pipeline asume que la última página es la despedida.

## Cobertura

- Leí **las 68 páginas PDF**, rango 1-68, completo y sin saltos.
- Método: extracción de texto con `pdftotext -layout` página por página (con mapeo
  página→diapositiva verificado uno a uno vía el pie `N / 34`), más lectura visual
  directa de las páginas cuyo contenido el texto no captura fielmente.
- Páginas leídas visualmente (imagen):
  - **59** (la fórmula final del puente) — confirmado que las dos expresiones `máx{…}`
    aparecen **apiladas sin símbolo relacional entre ellas**. Era imprescindible
    verificarlo: parecía una pérdida de la extracción de texto y resultó ser una errata
    real de la diapositiva (Huecos #3).
  - **62** (el ejemplo trabajado completo) — confirmada la tabla de 5 columnas con sus
    valores, y confirmado que dice `Insert(2,5, 'insert(3)')` con **coma decimal**
    (tiempo 2,5), frente al conjunto `{2, 5}` de la misma diapositiva (Huecos #6).
- Páginas sin contenido útil:
  - Página 1: portada.
  - Páginas 2-7: agenda (cinco viñetas, construidas en overlay).
  - Páginas 8, 21, 29, 38 y 45: diapositivas de sección (sólo título, sin pie numerado).
  - Página 66 (diapositiva 32): "Gracias".
  - Página 67 (diapositiva 33): Referencias — **Demaine, E. D., Iacono, J., &
    Langerman, S. (2007), *Retroactive data structures*, ACM Transactions on Algorithms,
    3(2)**; Cormen et al. (2022), *Introduction to Algorithms*, 4.ª ed., MIT Press;
    Demaine, Erik (2021), *6.851: Advanced Data Structures (Spring'21)*,
    https://courses.csail.mit.edu/6.851/spring21/.
  - Página 68 (diapositiva 34): agradecimientos y créditos (Luciano A. Romero Calla —
    "a su vez basadas en las clases de Erik Demaine, MIT 6.851" —, Erik Demaine,
    Keith Schwarz).
  - Página 65 (diapositiva 31) **sí** tiene contenido: es el resumen de la sesión, con
    cinco viñetas que consolidan las cinco partes del mazo; lo usé para validar mis
    clasificaciones y la separación en temas.
- **Ninguna página resultó ilegible.** Las páginas con fórmulas (33, 52, 53, 58, 59)
  salen de `pdftotext` con el layout de LaTeX desarmado (los `∉` se parten como
  `∈ / `, las llaves de conjunto quedan en líneas sueltas); las reconstruí a mano y
  quedan transcritas arriba en su forma correcta, y verifiqué visualmente las dos más
  críticas (59 y 62).
