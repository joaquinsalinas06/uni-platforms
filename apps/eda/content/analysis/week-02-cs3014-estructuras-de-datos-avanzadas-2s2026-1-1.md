# CS3014_Estructuras_de_Datos_Avanzadas_2s2026 (1)-1.pdf
semana: week-02
páginas totales: 46 (páginas PDF; 27 diapositivas lógicas — Beamer con overlays)

> Nota de notación: mismo esquema que semana 1. Doy **siempre el rango de páginas PDF**
> (lo que usa el knowledge map) y entre paréntesis la diapositiva lógica del pie (`N / 27`).
>
> Mapa completo diapositiva → páginas PDF:
> 1→1, 2→2-3, sección "Montículo de Fibonacci"→4, 4→5-6, 5→7-9, 6→10-11, 7→12-13,
> 8→14-15, 9→16-18, 10→19-20, 11→21, 12→22, 13→23, 14→24-25, 15→26-28, 16→29,
> 17→30-31, 18→32-33, 19→34-35, 20→36-37, 21→38, 22→39-40, 23→41-42, 24→43,
> 25→44, 26→45, 27→46.

Metadatos de portada (página 1): "CS3014 - Estructura de Datos Avanzados /
Montículos - II / Semana 2 / Víctor Racsó Galván Oyola / vgalvan@utec.edu.pe /
18 de agosto de 2026".

Agenda declarada por el profesor (páginas 2-3, diapositiva 2):
- Montículo de Fibonacci

(Una sola viñeta. El mazo entero es un único tema, más el método del potencial como
herramienta transversal.)

## Temas cubiertos

### fibonacci-heap
- título como lo llama el profesor: "Montículo de Fibonacci"
- tipo: structure
- diapositivas: #4-43 (páginas PDF), es decir de la diapositiva de sección (página 4)
  hasta la diapositiva lógica 24 (página 43)
- qué problema resuelve (según el material, no según yo): ser la cola de prioridad con
  `Insert`, `Union` y `Decrease-Key` en `Θ(1)` amortizado, pagando todo el trabajo
  recién en `Extract-Min`. El profesor lo formula como propiedad, no como problema
  externo: "¿Por qué es tan rápido insert, union y decrease-key? Porque no reorganizan
  nada de inmediato: solo agregan el nuevo nodo/árbol a la lista de raíces en O(1), o
  cortan un nodo y lo agregan como raíz en O(1). Todo el 'desorden' se limpia recién en
  Extract-Min" (página 6, diapositiva 4). En el resumen (página 43, diapositiva 24):
  "El montículo de Fibonacci es **perezoso**".
  El material de semana 1 (tabla comparativa) ya había anunciado la motivación: mejora
  a binario y binomial en insert, union y decrease-key.
- operaciones cubiertas:
  - **Insert** — páginas 7-9 (diapositiva 5). Pseudocódigo. Análisis amortizado en
    páginas 34-35 (diapositiva 19).
  - **Union** — páginas 7-9 (diapositiva 5). Pseudocódigo. Análisis amortizado en
    páginas 34-35 (diapositiva 19).
  - **Cut** — páginas 12-13 (diapositiva 7). Pseudocódigo.
  - **Cascading-Cut** — páginas 12-13 (diapositiva 7). Pseudocódigo. Ejemplo visual en
    páginas 16-18 (diapositiva 9).
  - **Decrease-Key** — páginas 10-11 (diapositiva 6, la idea y la regla de marcas) y
    páginas 14-15 (diapositiva 8, el algoritmo). Pseudocódigo. Análisis amortizado en
    páginas 36-38 (diapositivas 20-21).
  - **Extract-Min** — páginas 19-20 (diapositiva 10, los dos pasos) y página 21
    (diapositiva 11, el algoritmo). Pseudocódigo. Análisis amortizado en páginas 39-42
    (diapositivas 22-23).
  - **Consolidate** — página 22 (diapositiva 12). Pseudocódigo. Complejidad en
    página 23 (diapositiva 13).
  - **Find-Min** — **no aparece como operación con pseudocódigo ni análisis** en este
    mazo. Sólo existe implícitamente como el puntero `min(H)` que Insert y Union
    mantienen, y en la tabla comparativa de semana 1 (`Θ(1)`).
  - **Delete** — **no aparece** en este mazo. Sólo en la tabla de semana 1 (`O(lg n)`).
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | Insert | — | — | `O(1)` real; **`O(1)` amortizado** (páginas 34-35: `ĉ = O(1) + 1 = O(1)`) | no lo da |
  | Union | — | — | `O(1)` real; **`O(1)` amortizado** (páginas 34-35: `ΔΦ = 0`, `ĉ = O(1)`) | no lo da |
  | Cut | — | — | `O(1)` (página 15: "cada corte real es O(1)") | no lo da |
  | Cascading-Cut | — | — | no lo da por separado; se absorbe en el análisis de Decrease-Key | no lo da |
  | Decrease-Key | — | — | `O(c)` real con c cortes (página 37); **`O(1)` amortizado** (página 38: `ĉᵢ = O(c) + (4 − c) = O(1)`) | no lo da |
  | Consolidate | — | — | `O(D(n) + t)` real (página 23) | no lo da |
  | Extract-Min | — | — | `O(D(n) + t(H))` real (páginas 39-40); **`O(D(n)) = O(lg n)` amortizado** (páginas 41-42) | no lo da |

  Cotas estructurales que da:
  - `D(n) = O(lg n)` — el grado máximo, demostrado vía Fibonacci (páginas 24-31).
  - "El número mínimo de nodos en un árbol cuya raíz tiene grado k es `F_{k+2}`"
    (páginas 24-25, diapositiva 14) — enunciado como **Teorema**.
  - `F_{k+2} = Θ(φ^k)` con `φ = (1+√5)/2` (páginas 30-31, diapositiva 17).
  - Tras consolidar quedan a lo mucho `D(n) + 1` árboles (páginas 39-40).

  **El profesor nunca distingue mejor/promedio/peor ni menciona espacio.** Escribe
  costo real y costo amortizado. Las celdas "no lo da" son literales. El mazo tampoco
  reproduce la tabla comparativa de semana 1.
- estilo de análisis del profesor: **potential-method**, sin ambigüedad, y es el mazo
  donde el método se introduce formalmente.
  Por qué lo clasifico así: la diapositiva 18 (páginas 32-33) se titula literalmente
  "El método del potencial", define `ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)`, enuncia la condición
  ("Si Φ nunca cae por debajo de su valor inicial, la suma de costos amortizados acota
  por arriba la suma de costos reales"), y fija el potencial concreto
  `Φ(H) = t(H) + 2·m(H)`. Después aplica la receta operación por operación, calculando
  `ΔΦ` explícitamente para Insert (`+1`), Union (`0`), Decrease-Key (`≤ 4 − c`) y
  Extract-Min (`≤ (D(n)+1) − t(H)`). Es el método del potencial de manual, hecho
  completo.
  Segundo estilo presente, subordinado: la cota de grado `D(n) = O(lg n)` se prueba
  con un argumento **combinatorio/inductivo por recurrencia** (páginas 24-31): plantea
  `s_k ≥ 2 + Σ_{i=0}^{k-2} s_i`, reconoce la recurrencia de Fibonacci, y concluye por
  crecimiento exponencial de `φ^k`. Eso es recurrence-based, y alimenta al análisis
  amortizado principal.
  Nota de coherencia con semana 1: el binomial se analizó con **agregado**; aquí se
  pasa a **potencial**. El profesor lo señala ("el análisis amortizado (más adelante)",
  página 15) y lo repite en semana 3 ("Recordando de clases anteriores").
- prerrequisitos que el profesor asume o menciona explícitamente:
  - **Menciona explícitamente y reutiliza**: `Binomial-Link(y, x)` dentro de
    `Consolidate` (página 22). El pseudocódigo lo **llama por nombre sin redefinirlo**:
    está definido en el mazo de semana 1 (páginas 47-48 de `Sem_1_Heaps_I-1.pdf`).
    Dependencia dura semana 2 → semana 1.
  - **Menciona explícitamente**: "igual que un montículo binomial" al describir
    Consolidate (página 20). O sea, asume que el alumno recuerda el binomial.
  - Asume (no explica): **listas circulares doblemente enlazadas** — toda la estructura
    ("lista circular de raíces", "Concatenar las listas de raíces en una sola lista
    circular", "empalmar dos listas circulares") depende de que concatenar sea O(1),
    y eso nunca se justifica.
  - Asume (no explica): **números de Fibonacci** `F_k`, con `F₀ = 0, F₁ = 1` (los fija
    en la página 30 pero no explica la sucesión), y la **razón áurea** `φ = (1+√5)/2`.
  - Asume (no explica): **demostración por inducción** ("Se puede probar por inducción
    que `s_k ≥ F_{k+2}`", página 30 — dice que se puede probar, no la prueba).
  - Asume (no explica): notación asintótica, `lg`.
  - El campo `marca(x)` se introduce en el pseudocódigo de Insert (página 7) **antes**
    de que se explique para qué sirve (página 11, diapositiva 6). Orden de exposición
    a corregir en la plataforma.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `buildsOn: binomial-heap` — explícito por dos vías: (a) `Consolidate` llama a
    `Binomial-Link`, definido en el mazo binomial; (b) "repitiendo hasta que todos los
    grados en la lista de raíces sean distintos — **igual que un montículo binomial**"
    (página 20).
  - Contraste con árboles binomiales: "una colección de árboles con raíz (**no
    necesariamente binomiales**)" (página 5). El profesor marca la diferencia
    deliberadamente.
  - Continuidad con semana 1: la tabla comparativa de `Sem_1_Heaps_I-1.pdf`
    (páginas 35-42) ya daba las complejidades amortizadas de esta estructura y
    anticipaba "El montículo de Fibonacci gana su ventaja siendo perezoso: pospone el
    trabajo de reorganizar la estructura hasta Extract-Min" — frase que este mazo
    desarrolla.
  - `usedBy`: el mazo **no** conecta el montículo de Fibonacci con ninguna aplicación
    (ni Dijkstra ni Prim ni nada). No hay usedBy declarado.
  - Semana 3 (Persistencia, `Sem_3_Persistencia-1.pdf` página 27, diapositiva 13) dice
    "Recordando de clases anteriores" al repasar el método del potencial: esta semana
    es la fuente de ese concepto.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - **Sí, uno solo, y es pobre para lo que el tema exige.**
  - Páginas 16-18 (diapositiva 9), "Corte en cascada — ejemplo": verificado
    visualmente. Cadena vertical `G → P → C`, con **P sombreado en gris** (es el nodo
    marcado), una flecha `⟹`, y a la derecha los tres nodos `G`, `P`, `C` sueltos y
    sin sombrear (los tres en la lista de raíces, sin marca). Se construye en 3
    overlays: primero sólo la cadena, luego la transición con la explicación, luego la
    moraleja amortizada. Visualización pedida: **Cascading-Cut**, mostrando el estado
    de la bandera `marca` antes y después.
  - **Ausencias notables**: no hay ningún diagrama de la **lista circular de raíces con
    el puntero `min`** (la estructura misma nunca se dibuja), ni de **Consolidate**
    (que es el algoritmo más intrincado del mazo: el arreglo `A[0..D(n)]`, el bucle de
    enlaces por grado), ni de **Extract-Min** completo, ni de los árboles que realizan
    la cota `s_k = F_{k+2}`. Son las cuatro visualizaciones que más falta hacen y el
    material no las trae. Reconstruibles desde el pseudocódigo (derivación, no
    invención), pero conviene que el usuario lo autorice.
- pseudocódigo presente: transcrito íntegro, tal como aparece (conservo la numeración
  "Algoritmo N" del último overlay de cada diapositiva; los números saltan por Beamer).

```
Algoritmo 5: Insert(H, x)
grado(x) ← 0; padre(x) ← nulo; marca(x) ← falso ;
Agregar x como un árbol de un solo nodo a la lista de raíces de H ;
si min(H) = nulo o llave(x) < llave(min(H)) entonces
    min(H) ← x ;
```
(páginas 7-9, diapositiva 5)

```
Algoritmo 6: Union(H1, H2)
Concatenar las listas de raíces de H1 y H2 en una sola lista circular ;
min(H) ← mín(min(H1), min(H2)) ;
devolver H ;
```
(páginas 7-9, diapositiva 5)

```
Algoritmo 9: Cut(H, x, p)
Quitar x de la lista de hijos de p; grado(p) ← grado(p) − 1 ;
Agregar x a la lista de raíces de H; padre(x) ← nulo; marca(x) ← falso ;
```
(páginas 12-13, diapositiva 7)

```
Algoritmo 10: Cascading-Cut(H, y)
z ← padre(y) ;
si z ≠ nulo entonces
    si marca(y) = falso entonces
        marca(y) ← verdadero ;
    en otro caso
        Cut(H, y, z) ;
        Cascading-Cut(H, z) ;
```
(páginas 12-13, diapositiva 7)

```
Algoritmo 12: Decrease-Key(H, x, k)
llave(x) ← k ;
p ← padre(x) ;
si p ≠ nulo y llave(x) < llave(p) entonces
    Cut(H, x, p) ;
    Cascading-Cut(H, p) ;
si llave(x) < llave(min(H)) entonces
     min(H) ← x ;
```
(páginas 14-15, diapositiva 8)

```
Algoritmo 13: Extract-Min(H)
z ← min(H) ;
si z ≠ nulo entonces
    Agregar cada hijo de z a la lista de raíces, quitándole el padre ;
    Quitar z de la lista de raíces ;
    si z era la única raíz entonces
        min(H) ← nulo ;
    en otro caso
        min(H) ← alguna raíz restante ;
        Consolidate(H) ;

devolver z ;
```
(página 21, diapositiva 11)

```
Algoritmo 14: Consolidate(H)
Crear arreglo A[0..D(n)], todo en nulo ;
para cada raíz w de la lista original de raíces hacer
   x ← w ; d ← grado(x) ;
   mientras A[d] ≠ nulo hacer
       y ← A[d] ;
       si llave(x) > llave(y) entonces
            intercambiar x y y
       Binomial-Link(y, x) ;
       A[d] ← nulo; d ← d + 1 ;
     A[d] ← x ;
Reconstruir la lista de raíces a partir de A; actualizar min(H) ;
```
(página 22, diapositiva 12)

Además, los dos pasos de Extract-Min en prosa (páginas 19-20, diapositiva 10), que
funcionan como algoritmo de alto nivel:

```
Paso 1: remover
Se quita la raíz mínima; todos sus hijos pasan a la lista de raíces (sin marca,
pues las raíces nunca están marcadas).

Paso 2: consolidar
Se recorre la lista de raíces enlazando pares de árboles del mismo grado (la raíz
con llave mayor se vuelve hijo de la otra), repitiendo hasta que todos los grados
en la lista de raíces sean distintos — igual que un montículo binomial.
```

- ejemplos concretos que usa el profesor (valores, árboles, secuencias):
  - **Ninguno con valores numéricos.** Igual que en el binomial de semana 1: todo el
    mazo se explica sin un solo heap concreto.
  - El único ejemplo es **simbólico**: la cadena `G → P → C` del corte en cascada
    (páginas 16-18), donde `P` está marcado. No hay llaves, sólo etiquetas
    (presumiblemente Grandparent / Parent / Child; el mazo no lo dice).
  - Los ejemplos cuantitativos son fórmulas, no instancias: `ΔΦ ≤ c + (−2(c−1) + 2) = 4 − c`,
    `ĉᵢ = O(c) + (4 − c) = O(1)`, `s_k ≥ 2 + Σ_{i=0}^{k-2} s_i`.
- casos límite que menciona:
  - **"Las raíces nunca están marcadas"** (página 20) — invariante explícita y crítica.
  - Cascading-Cut para en la raíz: la guarda `z ≠ nulo`. El profesor lo codifica pero
    no lo comenta en prosa.
  - Extract-Min con **z como única raíz**: tratado explícitamente en el pseudocódigo
    (`si z era la única raíz entonces min(H) ← nulo`). Es el único caso límite que el
    mazo maneja de forma visible.
  - Extract-Min con **heap vacío**: la guarda `si z ≠ nulo` lo cubre; `devolver z`
    devolvería nulo. No se comenta.
  - En Decrease-Key, `p = nulo` (x ya es raíz): cubierto por la guarda. No se comenta.
  - "Cada nodo puede perder a lo mucho un hijo sin ser cortado de su propio padre"
    (página 11) — la regla que define el caso límite del marcado. Se repite como
    "Regla (recordatorio)" en la página 24.
  - **No menciona**: llaves duplicadas; qué pasa si `k > llave(x)` en Decrease-Key
    (el pseudocódigo la asignaría igual, rompiendo la invariante en silencio); cómo se
    calcula o acota `D(n)` en la práctica para dimensionar el arreglo `A`.

### potential-method
- título como lo llama el profesor: "El método del potencial"
- tipo: concept
- diapositivas: #32-33 (páginas PDF), diapositiva lógica 18. Se **aplica** en las
  páginas 34-42 (diapositivas 19-23).
- qué problema resuelve (según el material, no según yo): formalizar el "pago diferido"
  del montículo de Fibonacci. El profesor lo dice en el resumen (página 43,
  diapositiva 24): "El método del potencial (Φ = t + 2m) es lo que **formaliza ese
  'pago diferido'**: por eso Decrease-Key es O(1) amortizado sin importar cuántos
  cortes en cascada ocurran, y Extract-Min es O(lg n) amortizado gracias a la cota de
  grado que acabamos de probar."
  Lo separo como `concept` porque el profesor le da diapositiva propia, lo enuncia en
  general (no sólo para Fibonacci) y lo **reutiliza en semana 3** para el análisis de
  nodos gordos.
- operaciones cubiertas: no aplica (es una técnica de análisis). Sus "pasos" son:
  definir Φ (página 33), calcular `cᵢ`, calcular `ΔΦ`, sumar.
- complejidades que da el profesor: no aplica. Da la **definición**:
  `ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)`, y la **condición de validez**: "Si Φ nunca cae por
  debajo de su valor inicial, la suma de costos amortizados acota por arriba la suma
  de costos reales" (página 32).
  Y el **potencial concreto** para Fibonacci: `Φ(H) = t(H) + 2·m(H)`, donde
  `t(H)` = número de árboles en la lista de raíces, `m(H)` = número de nodos marcados
  (página 33).
- estilo de análisis del profesor: **potential-method** (es el tema mismo).
  Por qué: define la función de potencial, el costo amortizado como costo real más
  diferencia de potencial, y la condición sobre el valor inicial de Φ. No es análisis
  agregado (que es lo que hizo en semana 1 con el contador binario) ni método contable.
- prerrequisitos que el profesor asume o menciona explícitamente:
  - Asume que el alumno ya vio análisis **amortizado agregado** (semana 1, Insert del
    binomial), aunque no lo dice.
  - Asume: sumas telescópicas — la razón por la que `Σ ĉᵢ ≥ Σ cᵢ` cuando `Φ` no baja
    del inicial es un telescopaje, y el profesor lo enuncia como resultado sin derivarlo.
  - Asume: notación `Dᵢ` para "el estado de la estructura tras la operación i", que
    introduce sin explicar.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `usedBy: fibonacci-heap` — es su aplicación en este mazo (páginas 34-42).
  - `usedBy` (semana 3, persistencia): `Sem_3_Persistencia-1.pdf` páginas 27-28
    (diapositiva 13) lo repasa con la frase **"Recordando de clases anteriores"** y
    repite la fórmula idéntica, para luego definir
    `Φ = Σ_{nodos v} (entradas usadas en el registro de v)` y analizar los nodos
    gordos. Dependencia cruzada explícita semana 3 → semana 2.
  - Contraste con semana 1: el análisis agregado del contador binario (Insert del
    montículo binomial) **no** usa potencial. Vale registrarlo para no atribuirle a
    `binomial-heap` un estilo que el profesor no usó ahí.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - **No.** El método del potencial se presenta puramente en fórmulas. La única ayuda
    visual asociada es la moraleja del corte en cascada (página 18): "Amortizado: cada
    corte le 'cobra' a la operación que marcó el nodo, no a la que lo corta — por eso
    Decrease-Key es Θ(1) amortizado." Esa frase **sí** pide una visualización (un
    "banco de fichas" sobre los nodos marcados), pero el mazo no la trae.
- pseudocódigo presente: ninguno. Sólo fórmulas:

```
ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)

Φ(H) = t(H) + 2·m(H)
   t(H) = número de árboles en la lista de raíces
   m(H) = número de nodos marcados
```

- ejemplos concretos que usa el profesor (valores, árboles, secuencias): las cuatro
  aplicaciones, que son el ejemplo:
  - **Insert** (páginas 34-35): `cᵢ = O(1)`, `Δt = +1`, `Δm = 0` ⇒ `ΔΦ = +1`,
    `ĉ = O(1) + 1 = O(1)`.
  - **Union** (páginas 34-35): `cᵢ = O(1)`, `ΔΦ = 0`, `ĉ = O(1)`.
  - **Decrease-Key** (páginas 36-38): con c cortes totales (el de x más c−1 en cascada),
    `cᵢ = O(c)`; `Δt = +c`; los primeros c−1 cortes desmarcan un nodo ya marcado
    (`−2` cada uno) y el último puede quedar recién marcado (`+2`), así que
    `ΔΦ ≤ c + (−2(c−1) + 2) = 4 − c`; por lo tanto `ĉᵢ = O(c) + (4 − c) = O(1)`.
    El profesor subraya: "¡El término c se cancela! No importa cuántos cortes en
    cascada ocurran."
  - **Extract-Min** (páginas 39-42): `cᵢ = O(D(n) + t(H))`;
    `ΔΦ ≤ (D(n) + 1) − t(H)`; `ĉᵢ = O(D(n) + t(H)) + (D(n) + 1 − t(H)) = O(D(n))`;
    y con `D(n) = O(lg n)`, queda `O(lg n)` amortizado.
- casos límite que menciona:
  - La condición de validez: "**Si Φ nunca cae por debajo de su valor inicial**".
    Es el único caso límite del método y el profesor lo enuncia, aunque no verifica
    que `Φ(H) = t + 2m ≥ 0` se cumpla (es obvio, pero no lo dice).
  - En Decrease-Key, el caso `c = 1` (un solo corte, sin cascada) está cubierto por la
    fórmula pero no se comenta.

## Conceptos de apoyo candidatos

Cosas necesarias para entender lo anterior que las diapositivas NO explican.
Ninguna es un tema del curso; son andamios.

1. **Lista circular doblemente enlazada.** Es la representación sobre la que descansa
   todo el `O(1)` de Insert, Union y Cut ("concatenar dos listas circulares",
   "agregar a la lista de raíces", "quitar x de la lista de hijos de p"). El mazo la
   nombra cinco veces y nunca la explica ni dibuja. Máxima prioridad — sin esto, los
   `O(1)` son mágicos.
2. **Layout del nodo de Fibonacci**: `llave`, `grado`, `padre`, `hijo`, `marca`, y los
   punteros `izquierda`/`derecha` de la lista circular. El pseudocódigo manipula estos
   campos directamente (`grado(x) ← 0; padre(x) ← nulo; marca(x) ← falso`) pero el mazo
   nunca muestra la estructura. Indispensable para implementar en C++.
3. **Números de Fibonacci y la razón áurea.** `F₀ = 0, F₁ = 1` se fijan al pasar
   (página 30); `φ = (1+√5)/2` aparece en una sola línea; `F_{k+2} = Θ(φ^k)` se afirma
   sin prueba. Todo el argumento de `D(n) = O(lg n)` depende de esto.
4. **Demostración por inducción.** "Se puede probar por inducción que `s_k ≥ F_{k+2}`"
   (página 30) — el profesor delega la prueba. Si la plataforma quiere cerrar el
   argumento, hace falta el esquema inductivo.
5. **Análisis amortizado (la noción general).** El profesor salta directo al método del
   potencial. Falta la idea de "promedio sobre una secuencia de operaciones del peor
   caso, no promedio sobre entradas aleatorias" — distinción que confunde a todo el
   mundo y que el mazo da por sabida.
6. **Sumas telescópicas.** Es el mecanismo por el que la condición sobre `Φ` inicial
   implica que los amortizados acotan a los reales. Enunciado como resultado, no
   derivado.
7. **`Binomial-Link` como dependencia externa.** No es concepto de apoyo sino
   **contenido del curso de la semana 1**: `Consolidate` lo llama por nombre. Lo anoto
   aquí sólo para que el knowledge map no lo trate como huérfano: debe resolverse como
   referencia cruzada a `binomial-heap`, no como concepto nuevo.
8. **`D(n)` como parámetro de implementación.** El pseudocódigo de Consolidate crea
   `A[0..D(n)]` pero nunca dice con qué valor concreto se dimensiona el arreglo en la
   práctica (`⌊log_φ n⌋` sería lo habitual). Hueco de implementación.

## Huecos y ambigüedades

1. **`Binomial-Link` se usa sin estar en este mazo.** `Consolidate` (página 22) llama
   `Binomial-Link(y, x)`. Su definición está en `Sem_1_Heaps_I-1.pdf` páginas 47-48.
   Para el knowledge map es una dependencia dura week-02 → week-01, y para la
   plataforma significa que la página de `fibonacci-heap` **debe** enlazar a la de
   `binomial-heap` en lugar de reexplicar el enlace. Además hay un detalle sutil: en
   Consolidate, el profesor primero intercambia x e y para que `x` sea el de llave menor
   y luego llama `Binomial-Link(y, x)`; la firma de semana 1 es `Binomial-Link(y, z)`
   con `llave(y) ≥ llave(z)`. Los órdenes calzan, pero conviene verificarlo al implementar.
2. **Un error aparente en la demostración de la cota de grado.** En la página 28
   (diapositiva 15) el profesor escribe dos veces "al menos `i − 2`":
   primero "yᵢ tenía grado **al menos i − 2** en ese momento" (tras decir que x ya tenía
   i−1 hijos), y luego "Por la regla de las marcas, yᵢ puede haber perdido a lo mucho un
   hijo desde entonces. Su grado actual es, entonces, **al menos i − 2**."
   El razonamiento estándar es: al enlazarse, `grado(yᵢ) = grado(x) = i − 1`; tras
   perder a lo mucho un hijo, `grado(yᵢ) ≥ i − 2`. O sea, el **primer** "i − 2" debería
   ser "i − 1". Con el texto tal cual, la segunda frase no resta nada y el argumento
   queda circular. **El usuario debería confirmar** si es errata de las diapositivas o
   una convención de indexado distinta. Afecta directamente al `reasoning` de la cota
   `D(n) = O(lg n)`.
3. **`Find-Min` y `Delete` no existen en este mazo.** La tabla de semana 1 les asigna
   `Θ(1)` y `O(lg n)` respectivamente para Fibonacci, pero semana 2 no da pseudocódigo
   ni análisis de ninguna de las dos. Si el knowledge map lista operaciones de
   `fibonacci-heap`, hay que decidir: ¿se incluyen con la complejidad de la tabla de
   semana 1 y sin pseudocódigo, o se omiten? Yo las incluiría marcadas como
   "sólo tabla, sin desarrollo".
4. **Cero ejemplos numéricos.** Igual que el binomial en semana 1, no hay un solo heap
   con llaves concretas. No hay material fuente para `examples.md`
   (mínimo / normal / límite) de `fibonacci-heap`. Construirlos desde el pseudocódigo
   es derivación, no invención, pero requiere autorización explícita del usuario.
5. **`Θ(1)` vs `O(1)` inconsistente.** La tabla de semana 1 dice `Θ(1)` para insert,
   find-min, union y decrease-key de Fibonacci; el resumen de semana 2 (página 43) dice
   "Θ(1) amortizado"; pero todo el análisis intermedio (páginas 34-38) concluye `O(1)`.
   Igual que en semana 1, hay que fijar una convención.
6. **El campo `marca` aparece antes de explicarse.** Insert lo inicializa en la
   página 7; la regla de marcas se explica en la página 11. En la plataforma conviene
   invertir el orden (regla → algoritmos).
7. **El mazo nunca dibuja la estructura.** No hay una sola figura de un montículo de
   Fibonacci completo (lista circular de raíces + puntero min + árboles colgando). El
   único diagrama es la cadena `G → P → C`. Para una plataforma de visualización, eso
   es la carencia más grave de la semana.
8. **`Consolidate` es el algoritmo más difícil del mazo y no tiene ni ejemplo ni
   diagrama.** El bucle `mientras A[d] ≠ nulo` con el intercambio de x e y y el avance
   de `d` es genuinamente difícil de seguir sin traza. Candidato número uno a
   visualización paso a paso.
9. **No hay aplicación ni motivación externa.** El mazo nunca dice para qué sirve un
   montículo de Fibonacci (Dijkstra, Prim, etc.). Si el usuario quiere una sección de
   motivación, **no hay material** y habría que marcarlo como supportConcept.
10. **La diapositiva 3 no existe** como página con pie numerado: la página 4 es la
    diapositiva de sección "Montículo de Fibonacci" (sólo el título, sin pie). Por eso
    el mapa salta 2→4. No es un error.

## Cobertura

- Leí **las 46 páginas PDF**, rango 1-46, completo y sin saltos.
- Método: extracción de texto con `pdftotext -layout` página por página (con mapeo
  página→diapositiva verificado uno a uno vía el pie `N / 27`), más lectura visual
  directa de la página con contenido gráfico que el texto no captura.
- Página leída visualmente (imagen): **17** (corte en cascada) — confirmado que `P`
  aparece **sombreado en gris** en el lado izquierdo (nodo marcado) y que los tres
  nodos del lado derecho quedan sin sombreado (sin marca), detalle que la extracción
  de texto pierde por completo y que es justamente el punto pedagógico de la figura.
- Páginas sin contenido útil:
  - Página 1: portada.
  - Páginas 2-3: agenda (una sola viñeta, construida en overlay).
  - Página 4: diapositiva de sección "Montículo de Fibonacci" (sólo título, sin pie).
  - Página 44 (diapositiva 25): Referencias — Cormen et al. (2009) *Introduction to
    Algorithms*, 3.ª ed., MIT Press; Cormen et al. (2022), 4.ª ed., MIT Press.
  - Página 45 (diapositiva 26): agradecimientos y créditos (Luciano A. Romero Calla,
    Erik Demaine, Keith Schwarz, con el enlace a Stanford CS166).
  - Página 46 (diapositiva 27): "Gracias".
- **Ninguna página resultó ilegible.** Las páginas con fórmulas (29, 33, 37, 40, 41)
  salen de `pdftotext` con el layout de LaTeX desarmado (límites de sumatoria y
  fracciones en líneas sueltas); las reconstruí a mano y quedan transcritas arriba en
  su forma correcta. En particular `Φ(H) = t(H) + 2 m(H)`, `ΔΦ ≤ c + (−2(c−1) + 2) = 4 − c`,
  `sₖ ≥ 2 + Σ_{i=2}^{k} s_{i−2} = 2 + Σ_{i=0}^{k−2} sᵢ` y `φ = (1+√5)/2`.
- A diferencia de semana 1, este mazo **sí** trae sección de Referencias (página 44).
