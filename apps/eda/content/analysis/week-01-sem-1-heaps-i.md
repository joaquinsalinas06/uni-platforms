# Sem_1_Heaps_I-1.pdf
semana: week-01
páginas totales: 63 (páginas PDF; 30 diapositivas lógicas — es un Beamer con overlays)

> Nota de notación: este mazo repite cada diapositiva lógica en varias páginas PDF
> por los overlays. Abajo doy **siempre el rango de páginas PDF** (que es lo que
> usa el knowledge map, tipo `Sem_1_Heaps_I-1.pdf#12-30`) y entre paréntesis el
> número de diapositiva lógica que imprime el pie de página (`N / 30`).
>
> Mapa completo diapositiva → páginas PDF:
> 1→1, 2→2-4, sección "Montículo Binario"→5, 4→6-7, 5→8, 6→9, 7→10, 8→11-15,
> 9→16-17, 10→18-19, 11→20-21, 12→22-24, 13→25-26, 14→27,
> sección "Montículo Binomial"→28, 16→29-30, 17→31-32, 18→33-34, 19→35-42,
> 20→43-44, 21→45-46, 22→47-48, 23→49-50, 24→51-52, 25→53, 26→54-55, 27→56-58,
> 28→59-61, 29→62, 30→63.

Metadatos de portada (página 1): "CS3014 - Estructura de Datos Avanzados / Montículos /
Semana 1 / Víctor Racsó Galván Oyola / vgalvan@utec.edu.pe / 12 de agosto de 2026".

Agenda declarada por el profesor (páginas 2-4, diapositiva 2):
- Montículo Binario
- Montículo Binomial

## Temas cubiertos

### binary-heap
- título como lo llama el profesor: "Montículo Binario" (también "binary heap, o montículo máximo")
- tipo: structure
- diapositivas: #5-27 (páginas PDF), es decir diapositivas lógicas 4-14
- qué problema resuelve (según el material, no según yo): el material **no** enuncia
  un problema motivador explícito para el montículo binario. Lo presenta directamente
  como definición ("un arreglo que representa un árbol binario casi completo...").
  El único juicio de utilidad aparece en el resumen (páginas 59-61, diapositiva 28):
  "El montículo binario es simple y Θ(n) para construir, pero Θ(n) para Union."
  En la tabla comparativa (páginas 35-42, diapositiva 19) aparece implícitamente como
  una cola de prioridad (insert / find-min / extract-min / union / decrease-key / delete).
- operaciones cubiertas:
  - **Max-Heapify** — páginas 9-19 (diapositivas 6-10). Pseudocódigo en página 10
    (diapositiva 7); ejemplo trabajado en páginas 11-15 (diapositiva 8); análisis en
    páginas 16-19 (diapositivas 9-10).
  - **Build-Max-Heap** — páginas 20-27 (diapositivas 11-14). Pseudocódigo en páginas
    20-21 (diapositiva 11); análisis ajustado en páginas 22-27 (diapositivas 12-14).
  - **Indexación padre/izq/der** — página 7 (diapositiva 4). No es una "operación"
    con nombre pero el profesor la define formalmente como parte de la estructura.
  - Las operaciones de cola de prioridad (**insert, find-min, extract-min, union,
    decrease-key, delete**) aparecen **solo como filas de la tabla comparativa**
    (páginas 35-42, diapositiva 19) para el montículo binario: el profesor **no da
    pseudocódigo ni análisis propio** de ninguna de ellas para el binario.
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | Max-Heapify | no lo da | no lo da | `O(lg n)` (página 19, dia. 10: "T(n) = O(lg n)") | no lo da |
  | Build-Max-Heap | no lo da | no lo da | `Θ(n)` (página 27, dia. 14) — y explícitamente refuta la cota ingenua `O(n lg n)` | no lo da |
  | insert | — | — | `Θ(lg n)` (tabla, páginas 35-42) | no lo da |
  | find-min | — | — | `Θ(1)` (tabla) | no lo da |
  | extract-min | — | — | `Θ(lg n)` (tabla) | no lo da |
  | union | — | — | `Θ(n)` (tabla) | no lo da |
  | decrease-key | — | — | `Θ(lg n)` (tabla) | no lo da |
  | delete | — | — | `Θ(lg n)` (tabla) | no lo da |

  Hecho estructural que también da: altura `h = ⌊lg n⌋`, justificada con
  `2^h ≤ n < 2^(h+1)` (páginas 18-19, diapositiva 10).
  Lema de conteo: "la cantidad de nodos a altura h es a lo mucho ⌈n / 2^(h+1)⌉"
  (páginas 22-24, diapositiva 12).

  **El profesor nunca distingue mejor/promedio/peor ni menciona espacio** en este mazo.
  Escribe una sola cota por operación. Las celdas "no lo da" son literales.
- estilo de análisis del profesor: **recurrence-based** para Max-Heapify, y
  **suma sobre niveles (agregado, no amortizado)** para Build-Max-Heap.
  Por qué lo clasifico así: para Max-Heapify no plantea `T(n) = T(2n/3) + O(1)`
  con teorema maestro; razona por **altura del camino**: "O(1) de trabajo por nivel,
  y a lo mucho O(lg n) niveles: T(n) = O(lg n)" (página 19). Es un argumento de
  recurrencia resuelta por conteo de niveles, no un método maestro.
  Para Build-Max-Heap suma explícitamente el costo real nivel por nivel
  `T(n) ≤ Σ_{h=0}^{⌊lg n⌋} ⌈n/2^(h+1)⌉ · O(h) = O(n · Σ_{h=0}^{∞} h/2^h)`
  y cierra usando que la serie `Σ h/2^h` converge a 2 (páginas 25-26, diapositiva 13).
  Eso es análisis agregado por sumatoria, **no** método del potencial ni amortizado
  (el amortizado aparece recién en el montículo binomial, y el potencial recién en semana 2).
- prerrequisitos que el profesor asume o menciona explícitamente:
  - Asume (no explica): notación asintótica `O`, `Θ`, `Ω`; logaritmo `lg`.
  - Asume (no explica): árbol binario, altura, hoja, subárbol, nodo, arreglo 1-indexado.
  - Asume (no explica): series geométricas y su derivada término a término — en
    página 26 (diapositiva 13) dice literalmente "es una serie geométrica derivada
    término a término" sin desarrollarlo.
  - Menciona explícitamente: "árbol binario casi completo" (página 6), pero **no lo
    define** — lo usa como término conocido.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - El profesor contrapone binario vs. binomial vs. Fibonacci en la tabla de páginas
    35-42 (diapositiva 19). Dice que el binomial "arregla Union (O(lg n))"
    (páginas 59-61, diapositiva 28) — o sea, el binomial se motiva por la debilidad
    del binario. Esa es la única relación declarada.
  - En página 58 (diapositiva 27) dice que en un montículo binomial subir por llaves
    cuesta O(lg n) "igual que en un montículo binario" — comparación, no dependencia.
  - Anuncia la continuación: "En la próxima clase veremos — Montículo de Fibonacci e
    implementación de heaps" (páginas 59-61, diapositiva 28).
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - **Sí, dos, ambos de alta prioridad.**
  - Página 8 (diapositiva 5), "Un montículo máximo de ejemplo": árbol dibujado
    **junto con la tabla índice→valor**. Visualización pedida: la correspondencia
    árbol ↔ arreglo, resaltando índice `i` ↔ `2i` ↔ `2i+1`.
  - Páginas 11-15 (diapositiva 8), "Max-Heapify — ejemplo trabajado": el mazo
    construye el ejemplo en **5 overlays sucesivos** (árbol, luego Paso 1, luego
    Paso 2, luego Resultado). Es literalmente un guión de animación paso a paso
    del hundimiento. Visualización pedida: Max-Heapify, con intercambios resaltados.
  - Páginas 31-32 (diapositiva 17), "Árboles Binomiales B₀, B₁, B₂, B₃": los cuatro
    árboles dibujados lado a lado. Verificado visualmente: B₀ = 1 nodo; B₁ = raíz con
    1 hijo; B₂ = raíz con 2 hijos (uno de los cuales tiene 1 hijo, 4 nodos);
    B₃ = raíz con 3 hijos, 8 nodos. Visualización pedida: la construcción recursiva
    Bₖ ← dos Bₖ₋₁.
  - **No hay** diagrama de Union, de Binomial-Link, ni de Extract-Min. Esas operaciones
    están sólo en pseudocódigo y prosa.
- pseudocódigo presente: transcrito íntegro, tal como aparece (el profesor numera los
  bloques "Algoritmo N" y los números saltan por los overlays de Beamer; conservo la
  numeración del último overlay de cada diapositiva).

```
Algoritmo 1: Max-Heapify(A, i, n)
l ← 2i, r ← 2i + 1 ;
m ← i ;
si l ≤ n y A[l] > A[m] entonces
     m ← l
si r ≤ n y A[r] > A[m] entonces
     m ← r
si m ≠ i entonces
     intercambiar A[i] y A[m] ;
     Max-Heapify(A, m, n)
```
(página 10, diapositiva 7)

```
Algoritmo 3: Build-Max-Heap(A, n)
para i ← ⌊n/2⌋ a 1 hacer
   Max-Heapify(A, i, n) ;
```
(páginas 20-21, diapositiva 11; en la página 20 el mismo bloque aparece numerado
"Algoritmo 2")

- ejemplos concretos que usa el profesor (valores, árboles, secuencias):
  - Página 8 (diapositiva 5): montículo máximo de 10 elementos.
    `índice: 1..10`, `valor: 23, 20, 18, 17, 15, 14, 9, 12, 10, 8`.
    Árbol: raíz 23; hijos 20 y 18; nivel 3: 17, 15, 14, 9; nivel 4: 12, 10, 8.
  - Páginas 11-15 (diapositiva 8): `A = [4, 14, 10, 8, 2, 9, 3]`, llamada
    `Max-Heapify(A, 1, 7)`. Paso 1: el mayor hijo de la raíz es 14, se intercambia
    con 4. Paso 2: en la posición donde quedó el 4, su mayor hijo es 8, se intercambia
    de nuevo. Resultado: `A = [14, 8, 10, 4, 2, 9, 3]`.
- casos límite que menciona:
  - Hojas: "Toda posición i > ⌊n/2⌋ es una hoja (no tiene hijos), así que ya es
    trivialmente un montículo máximo de un solo nodo" (página 21, diapositiva 11).
    Es el único caso límite explícito del montículo binario.
  - Guardas `l ≤ n` y `r ≤ n` en Max-Heapify: manejan el hijo inexistente, pero el
    profesor **no las comenta en prosa**; están sólo en el pseudocódigo.
  - **No menciona**: heap vacío, heap de un elemento, llaves repetidas, overflow del
    arreglo, ni min-heap (todo el mazo es max-heap salvo la tabla comparativa, que
    habla de `find-min`/`extract-min` — ver Huecos).

### binomial-tree
- título como lo llama el profesor: "Árboles Binomiales"
- tipo: concept
- diapositivas: #29-32 (páginas PDF), diapositivas lógicas 16-17
- qué problema resuelve (según el material): es el bloque de construcción del montículo
  binomial. El profesor lo introduce sin motivación aparte de "definición recursiva";
  la utilidad se revela en la diapositiva siguiente (la analogía binaria).
- operaciones cubiertas: ninguna. Es una definición con propiedades. Lo listo aparte
  porque el material le dedica dos diapositivas propias y porque el montículo binomial
  no se entiende sin él.
- complejidades que da el profesor: ninguna. Da **propiedades de conteo** (páginas
  29-30, diapositiva 16):

  | propiedad de Bₖ | valor |
  | --- | --- |
  | número de nodos | `2^k` |
  | altura | `k` |
  | grado de la raíz | `k` |
  | nodos a profundidad i | exactamente `C(k, i)` ("de ahí el nombre binomial") |
- estilo de análisis del profesor: **otro — definición recursiva + conteo combinatorio**.
  Por qué: no analiza costo de nada; enuncia propiedades de la definición recursiva
  ("Bₖ se construye uniendo dos Bₖ₋₁: la raíz de uno se convierte en el hijo más a la
  izquierda de la raíz del otro") y las justifica apelando al coeficiente binomial,
  sin demostración.
- prerrequisitos que el profesor asume o menciona explícitamente:
  - Coeficiente binomial `C(k, i)` — usado sin definir (página 30, diapositiva 16).
  - Grado de un nodo — el profesor sí lo glosa: "grado (número de hijos)".
  - Profundidad de un nodo — usado sin definir.
- relación con otras estructuras del curso: es la base de `binomial-heap`
  (páginas 33-34, diapositiva 18: "Un montículo binomial es una colección de árboles
  binomiales"). Relación `usedBy: binomial-heap`, declarada explícitamente.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - Páginas 31-32 (diapositiva 17): los cuatro árboles B₀..B₃ dibujados. La página 32
    añade la leyenda "Bₖ se forma uniendo dos Bₖ₋₁: por eso la raíz de Bₖ tiene como
    hijos las raíces de B₀, B₁, ..., Bₖ₋₁". Visualización pedida: la **construcción
    incremental** Bₖ₋₁ + Bₖ₋₁ → Bₖ, que es exactamente lo que el mazo insinúa en dos
    overlays pero nunca anima.
- pseudocódigo presente: ninguno.
- ejemplos concretos que usa el profesor: los propios B₀, B₁, B₂, B₃ del diagrama
  (páginas 31-32). Sin valores de llaves.
- casos límite que menciona: `B₀` = un solo nodo (caso base de la recursión),
  página 29 (diapositiva 16).

### binomial-heap
- título como lo llama el profesor: "Montículo Binomial"
- tipo: structure
- diapositivas: #28-58 (páginas PDF), es decir la sección que arranca en la diapositiva
  de sección (página 28) y va por las diapositivas lógicas 16-27
- qué problema resuelve (según el material, no según yo): arreglar `Union`, que en el
  montículo binario cuesta `Θ(n)`. Dicho por el profesor en el resumen (páginas 59-61,
  diapositiva 28): "El montículo binomial **arregla Union** (O(lg n)) organizando
  árboles como los bits de n en binario." Y en la página 34 (diapositiva 18):
  "Union de dos montículos binomiales es análogo a sumar en binario."
- operaciones cubiertas:
  - **Find-Min** — páginas 43-44 (diapositiva 20). Sin pseudocódigo; sólo la
    consecuencia del conteo de árboles.
  - **Binomial-Link** — páginas 47-48 (diapositiva 22). Con pseudocódigo.
  - **Union** — páginas 45-46 (diapositiva 21, la idea en 2 pasos) y páginas 49-50
    (diapositiva 23, el algoritmo). Con pseudocódigo.
  - **Insert** — páginas 49-50 (diapositiva 23, como caso particular de Union) y
    páginas 51-53 (diapositivas 24-25, el análisis amortizado). Sin pseudocódigo propio.
  - **Extract-Min** — páginas 54-55 (diapositiva 26). Con pseudocódigo.
  - **Decrease-Key** — páginas 56-58 (diapositiva 27). Con pseudocódigo.
  - **Delete** — páginas 56-58 (diapositiva 27). Con pseudocódigo (dos líneas).
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | insert | — | — | `O(lg n)` (tabla, páginas 35-42); **además `O(1) amortizado`**, páginas 51-53 | no lo da |
  | find-min | — | — | `O(lg n)` (tabla y página 44: "Find-Min debe recorrer todas las raíces: O(lg n)") | no lo da |
  | extract-min | — | — | `Θ(lg n)` (tabla); `O(lg n)` en el análisis de la página 55 | no lo da |
  | union | — | — | `O(lg n)` (tabla y páginas 45-46) | no lo da |
  | decrease-key | — | — | `Θ(lg n)` (tabla); `O(lg n)` en la página 58 | no lo da |
  | delete | — | — | `Θ(lg n)` (tabla); `O(lg n)` en la página 58 | no lo da |
  | Binomial-Link | — | — | `O(1)` (página 48: "solo se mueven punteros, nunca se copian nodos") | no lo da |

  Hecho estructural: "un montículo binomial con n nodos tiene a lo mucho `⌊lg n⌋ + 1`
  árboles — tantos como bits en la representación binaria de n" (páginas 43-44,
  diapositiva 20).

  Ojo con la inconsistencia `O` vs `Θ`: la tabla dice `Θ(lg n)` para extract-min,
  decrease-key y delete, pero el texto de análisis de esas mismas operaciones dice
  `O(lg n)`. Lo anoto en Huecos.
- estilo de análisis del profesor: **mezcla de recurrence-based/estructural y
  amortized (análisis agregado)**.
  Por qué lo clasifico así:
  - Para Union, Extract-Min, Decrease-Key y Delete el argumento es **estructural**:
    cuenta cuántos árboles/raíces/niveles hay y multiplica por O(1). Ej. página 55:
    "Encontrar el mínimo recorre a lo mucho lg n + 1 raíces: O(lg n). Los hijos de x
    son a lo mucho lg n raíces nuevas, y Union cuesta O(lg n). Total: O(lg n)."
    Ej. página 58: "Un nodo en Bₖ está a profundidad a lo mucho k = O(lg n) de su raíz."
  - Para Insert usa explícitamente **análisis amortizado agregado** con la analogía
    del contador binario, y lo titula "Análisis agregado" (página 52, diapositiva 24):
    "En n incrementos consecutivos de un contador de b bits, el bit i cambia a lo mucho
    ⌈n/2^i⌉ veces. Sumando sobre todos los bits: Σ_{i=0}^{b-1} ⌈n/2^i⌉ < 2n."
    Cierra: "amortizado, cada Insert cuesta O(1), aunque un solo Insert pueda costar
    O(lg n) en el peor caso" (página 53, diapositiva 25).
  - **No usa el método del potencial** en este mazo. El potencial aparece recién en
    semana 2 (Fibonacci). Esto importa para el knowledge map: `binomial-heap` es
    `amortized` (agregado), **no** `potential-method`.
  - El profesor marca esta parte como "Bono" en el título de la diapositiva 24
    ("Bono: Insert es O(1) amortizado"), o sea la presenta como material adicional.
- prerrequisitos que el profesor asume o menciona explícitamente:
  - **Representación binaria de un número y la suma binaria con acarreo** — es la
    metáfora central de todo el tema, usada intensivamente (páginas 33-34, 43-46,
    51-53) y **nunca definida**. Es el prerrequisito más importante del mazo.
  - Listas enlazadas y punteros (`padre`, `hijo`, `siguiente-hermano`, `grado`):
    el pseudocódigo de Binomial-Link los usa sin declarar el layout del nodo.
  - Análisis amortizado: el profesor usa el término y hace análisis agregado, pero
    **no define qué es "amortizado"** en este mazo.
  - `−∞` como llave centinela (en Delete), sin comentario.
  - Concepto de "lista de raíces ordenada por grado" — usado sin definir la
    representación.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `buildsOn: binomial-tree` — explícito, página 33: "Un montículo binomial es una
    colección de árboles binomiales, a lo mucho uno de cada orden Bₖ".
  - Comparado con `binary-heap` en la tabla (páginas 35-42) y motivado por su
    debilidad en Union (páginas 59-61).
  - Comparado con `fibonacci-heap` en la misma tabla, con la nota
    "(Montículo de Fibonacci: complejidades amortizadas.)" y el cierre
    "El montículo de Fibonacci gana su ventaja siendo perezoso: pospone el trabajo de
    reorganizar la estructura hasta Extract-Min" (página 42). El Fibonacci **no se
    desarrolla en este mazo** — sólo se anuncia. Se desarrolla en semana 2.
  - Delete `buildsOn` Decrease-Key + Extract-Min, explícito en el pseudocódigo.
  - Insert `buildsOn` Union, explícito: "Insert(H, x) es apenas un caso particular:
    Union(H, {x}), con x como un B₀ nuevo" (página 50).
  - Extract-Min `buildsOn` Union, explícito en el pseudocódigo.
  - **Dato relevante para semana 2**: `Binomial-Link` reaparece por nombre dentro de
    `Consolidate` del montículo de Fibonacci (semana 2). Aquí es donde se define.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - Sólo el de B₀..B₃ (páginas 31-32), ya listado bajo `binomial-tree`.
  - **Ausencia notable**: no hay ni un diagrama de Union como suma binaria, ni de
    Binomial-Link, ni de Extract-Min. Son exactamente las operaciones que más
    pedirían visualización paso a paso, y el material sólo las describe en prosa +
    pseudocódigo. Candidatas fuertes a visualización derivada del pseudocódigo
    (no inventada: reconstruible línea por línea del algoritmo transcrito).
- pseudocódigo presente: transcrito íntegro.

```
Algoritmo 5: Binomial-Link(y, z)
// y, z son raíces del mismo orden k; asumimos llave(y) ≥ llave(z)
padre(y) ← z ;
siguiente-hermano(y) ← hijo(z) ;
hijo(z) ← y ;
grado(z) ← grado(z) + 1 ;
```
(páginas 47-48, diapositiva 22)

```
Algoritmo 7: Union(H1, H2)
H ← mezclar las listas de raíces de H1 y H2, ordenadas por grado ;
x ← primera raíz de H ;
mientras x tiene una siguiente raíz y con grado(x) = grado(y) hacer
   si existe una tercera raíz z después de y con grado(z) = grado(x) entonces
       avanzar x a y ;              // se enlazará en la siguiente vuelta
   en otro caso
       Binomial-Link(x, y) ;        // o al revés, según la llave menor

devolver H ;
```
(páginas 49-50, diapositiva 23)

```
Algoritmo 9: Extract-Min(H)
Encontrar la raíz x con menor llave, recorriendo la lista de raíces ;
Quitar x de la lista de raíces de H ;
H' ← montículo binomial con los hijos de x como su lista de raíces ;
H ← Union(H, H') ;
devolver x ;
```
(páginas 54-55, diapositiva 26)

```
Algoritmo 14: Decrease-Key(H, x, k)
llave(x) ← k ;
y ← x; z ← padre(y) ;
mientras z ≠ nulo y llave(y) < llave(z) hacer
    intercambiar llave(y) y llave(z) ;
    y ← z; z ← padre(y) ;
```
(páginas 56-58, diapositiva 27)

```
Algoritmo 15: Delete(H, x)
Decrease-Key(H, x, −∞) ;
Extract-Min(H) ;
```
(páginas 56-58, diapositiva 27)

Además, la "idea" de Union en dos pasos numerados (páginas 45-46, diapositiva 21),
que es prosa pero funciona como algoritmo de alto nivel:

```
1. Mezclar las dos listas de raíces (ordenadas por orden) en una sola lista ordenada:
   O(lg n), pues cada una tiene O(lg n) árboles.
2. Recorrer la lista mezclada: si dos árboles consecutivos tienen el mismo orden k,
   enlazarlos en un B_{k+1} — igual que un acarreo al sumar en binario.
```

- ejemplos concretos que usa el profesor (valores, árboles, secuencias):
  - **Ninguno con valores numéricos.** Ésta es la carencia más grande del mazo: todo el
    montículo binomial se explica sin un solo ejemplo trabajado. Los únicos "ejemplos"
    son los árboles genéricos B₀..B₃ (sin llaves) y la analogía con el contador binario
    (sin una secuencia concreta de incrementos).
  - La analogía cuantitativa sí es concreta: "en n incrementos consecutivos de un
    contador de b bits, el bit i cambia a lo mucho ⌈n/2^i⌉ veces" (página 52).
- casos límite que menciona:
  - "a lo mucho un árbol de cada orden Bₖ" — la invariante estructural (página 33).
  - En Union, el caso de **tres** raíces consecutivas del mismo grado: el pseudocódigo
    lo trata explícitamente ("si existe una tercera raíz z después de y con
    grado(z) = grado(x) entonces avanzar x a y"). El profesor no lo comenta en prosa
    pero está codificado — es el caso límite más sutil del mazo.
  - En Extract-Min, el caso de que x no tenga hijos está implícito (H' sería vacío);
    **no se comenta**.
  - En Decrease-Key, la guarda `z ≠ nulo` cubre "x es una raíz"; **no se comenta**.
  - Delete usa `−∞`; el profesor **no discute** qué pasa si ya hay una llave `−∞`.
  - **No menciona**: montículo vacío, Union con un montículo vacío, llaves duplicadas,
    ni qué pasa si la llave nueva de Decrease-Key es mayor que la actual (el
    pseudocódigo la asignaría igual y rompería la invariante silenciosamente).

## Conceptos de apoyo candidatos

Cosas necesarias para entender lo anterior que las diapositivas NO explican.
Ninguna de éstas es un tema del curso; son andamios.

1. **Representación binaria y suma con acarreo.** Es la metáfora que sostiene todo el
   montículo binomial (estructura, Union, y el análisis amortizado de Insert). El mazo
   la usa cuatro veces y nunca la explica. Máxima prioridad.
2. **Árbol binario casi completo.** El profesor lo usa en la definición misma del
   montículo binario (página 6) y para derivar la altura (página 18), pero nunca lo
   define. Sin esto la fórmula `h = ⌊lg n⌋` es un acto de fe.
3. **Correspondencia árbol ↔ arreglo 1-indexado.** El profesor da las fórmulas
   `padre(i) = ⌊i/2⌋`, `izq(i) = 2i`, `der(i) = 2i+1` pero no argumenta por qué son
   correctas. El diagrama de la página 8 lo insinúa; hace falta explicitarlo.
4. **Notación asintótica O / Θ / Ω.** Asumida en toda página. Relevante en particular
   porque el profesor mezcla `O` y `Θ` de forma no siempre intencional (ver Huecos).
5. **Series geométricas y su derivada término a término.** El paso clave del análisis
   Θ(n) de Build-Max-Heap (`Σ h/2^h = 2`) se declara como "un hecho útil" sin derivarlo.
6. **Qué significa "amortizado".** El profesor lo usa en la tabla comparativa (nota al
   pie), en el título de la diapositiva 24 y en la conclusión de la 25, pero nunca da
   la definición. El método del potencial llega recién en semana 2; aquí sólo hay
   análisis agregado, así que hace falta al menos la noción de "promedio sobre una
   secuencia de operaciones, no promedio sobre entradas aleatorias".
7. **Coeficiente binomial `C(k, i)`.** Usado para justificar el nombre "binomial"
   (página 30), sin definición.
8. **Representación de nodo del montículo binomial** (`padre`, `hijo`,
   `siguiente-hermano`, `grado`, lista de raíces enlazada y ordenada por grado). El
   pseudocódigo de Binomial-Link manipula estos campos directamente pero el mazo nunca
   muestra el layout. Indispensable para implementar en C++.
9. **`−∞` como llave centinela.** Usado en Delete sin comentario.

## Huecos y ambigüedades

1. **Max-heap vs. min-heap: contradicción abierta.** Todo el desarrollo del montículo
   binario es **máximo** (Max-Heapify, Build-Max-Heap, "el valor de un nodo es mayor o
   igual que el de sus hijos"). Pero la tabla comparativa (páginas 35-42) lista
   `find-min`, `extract-min` y `decrease-key`, y **todo** el montículo binomial es de
   mínimo (Find-Min, Extract-Min, Decrease-Key, Binomial-Link asume `llave(y) ≥ llave(z)`
   para que z quede arriba). El mazo nunca dice "por simetría" ni "a partir de aquí
   trabajamos con min-heaps". **El usuario debe decidir** si la plataforma presenta el
   binario como max-heap (fiel al material) y el binomial como min-heap (fiel al
   material), aceptando el salto, o si unifica. Recomiendo ser fiel y anotar el salto.
2. **`O` vs `Θ` inconsistente en el montículo binomial.** La tabla dice `Θ(lg n)` para
   extract-min, decrease-key y delete; el texto de análisis de esas mismas operaciones
   (páginas 55 y 58) dice `O(lg n)`. También: insert es `O(lg n)` en la tabla pero
   `Θ(lg n)` para el binario en la misma fila. No sé si es descuido o intención.
   El schema exige `reasoning`, así que hay que fijar una de las dos.
3. **Numeración de "Algoritmo N" rota por los overlays.** El mismo Build-Max-Heap
   aparece como "Algoritmo 2" (página 20) y "Algoritmo 3" (página 21); Decrease-Key
   como 10, 12 y 14. Es un artefacto de Beamer, no un error de contenido, pero hay que
   no propagarlo al knowledge map.
4. **Cero ejemplos numéricos para el montículo binomial.** No hay un solo Union
   trabajado, ni un Extract-Min trabajado, ni un Insert trabajado. Para las secciones
   `examples.md` (mínimo / normal / límite) de `binomial-heap` **no hay material fuente**.
   Habría que construirlos desde el pseudocódigo — lo cual es derivación, no invención,
   pero conviene que el usuario lo autorice explícitamente.
5. **El montículo de Fibonacci aparece en la tabla de la semana 1 pero no se enseña
   aquí.** Sus complejidades (`Θ(1)` insert, `Θ(1)` find-min, `O(lg n)` extract-min,
   `Θ(1)` union, `Θ(1)` decrease-key, `O(lg n)` delete) están en el mazo de semana 1,
   pero la estructura se desarrolla en semana 2. Decisión de mapeo: ¿la tabla de semana
   1 cuenta como referencia de `fibonacci-heap` (semana 2) o como contenido de semana 1?
   Yo la registraría como referencia cruzada de semana 1 → `fibonacci-heap`.
6. **Union del montículo binario dice `Θ(n)` sin ninguna justificación.** Es la
   motivación de todo el resto del mazo y aparece sólo como celda de tabla.
7. **`find-min` del montículo binomial: `O(lg n)`, no `Θ(1)`.** Vale la pena resaltarlo
   porque es contraintuitivo (un montículo que no encuentra su mínimo en O(1)), y el
   profesor lo justifica bien (página 44) pero en una sola línea.
8. **El pseudocódigo de Union tiene un comentario ambiguo**: `Binomial-Link(x, y) ;
   // o al revés, según la llave menor`. El orden real de los argumentos depende de una
   comparación que el pseudocódigo no escribe. Hay que resolverlo al implementar en C++
   (Binomial-Link(y, z) asume `llave(y) ≥ llave(z)`, así que el de llave mayor va primero).
9. **La diapositiva 3 y la 15 no existen** como páginas con pie numerado: las páginas 5
   y 28 son diapositivas de sección (sólo el título "Montículo Binario" y "Montículo
   Binomial", sin pie de página). Por eso el mapa salta 2→4 y 14→16. No es un error.

## Cobertura

- Leí **las 63 páginas PDF**, rango 1-63, completo y sin saltos.
- Método: extracción de texto con `pdftotext -layout` página por página (con mapeo
  página→diapositiva verificado uno a uno vía el pie `N / 30`), más lectura visual
  directa de las páginas con contenido gráfico que el texto no captura.
- Páginas leídas visualmente (imagen): **32** (árboles binomiales B₀..B₃) — confirmado
  el conteo de nodos y la forma de cada Bₖ.
- Páginas sin contenido útil:
  - Página 1: portada.
  - Páginas 2-4: agenda (dos viñetas, construidas en overlay).
  - Páginas 5 y 28: diapositivas de sección (sólo título, sin pie numerado).
  - Página 62 (diapositiva 29): agradecimientos y créditos (Luciano A. Romero Calla,
    Erik Demaine, Keith Schwarz, con el enlace a Stanford CS166).
  - Página 63 (diapositiva 30): "Gracias".
- **Ninguna página resultó ilegible.** Las páginas con fórmulas matemáticas
  (25, 26, 52) salen de `pdftotext` con el layout de LaTeX desarmado (los límites de
  sumatoria caen en líneas separadas); las reconstruí a mano y quedan transcritas
  arriba en su forma correcta.
- **Este mazo no tiene sección de Referencias** (a diferencia de los de semanas 2 y 3).
  Sólo agradecimientos con lista de créditos.
