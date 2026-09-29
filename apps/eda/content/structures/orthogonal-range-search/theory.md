---
kind: theory
title: "Búsqueda ortogonal por rangos"
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        Puntos ordenados {3,4,7,9,13,15,18,27}, caja de consulta [5,16]. Las
        tres preguntas — existencia, conteo, enumeración — parten de esta
        misma caja sobre el mismo arreglo.
      caption: "caja [5, 16]"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
    - note: >-
        Búsqueda binaria del sucesor de 5 (primer valor ≥ 5): cae en el
        índice 2, valor 7. Es la frontera izquierda de la caja.
      caption: "sucesor(5) = 7"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, marked, idle, idle, idle, idle, idle]
    - note: >-
        Búsqueda binaria del predecesor de 16 (último valor ≤ 16): cae en
        el índice 5, valor 15. Es la frontera derecha. Ubicar ambas
        fronteras cuesta O(log n) y es lo único que existencia, conteo y
        enumeración necesitan resolver por separado — de aquí en más leen
        la misma información de formas distintas.
      caption: "fronteras: índices 2 y 5"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, marked, idle, idle, marked, idle, idle]
    - note: >-
        Existencia sólo mira la frontera izquierda: 7 ≤ 16, así que hay al
        menos un punto adentro. No necesita la frontera derecha ni tocar
        nada más — es la pregunta que pide menos información.
      caption: "existencia: 7 ≤ 16 → verdadero"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, answer, idle, idle, marked, idle, idle]
    - note: >-
        Conteo usa las dos fronteras pero sólo como aritmética de índices,
        5 - 2 + 1 = 4: nunca visita los puntos que quedan entre ellas, sólo
        sus posiciones.
      caption: "conteo: 5 - 2 + 1 = 4"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, answer, answer, answer, answer, idle, idle]
    - note: >-
        Enumeración parte de las mismas fronteras, pero además tiene que
        recorrer y reportar cada uno de los k puntos entre ellas — {7, 9,
        13, 15} — porque no hay forma de listarlos sin tocarlos uno por
        uno. Ese recorrido es exactamente el término +k que las otras dos
        preguntas no pagan.
      caption: "enumeración: {7, 9, 13, 15}"
      mode: layers
      arrays:
        - id: pts
          row: 0
          cells: [3, 4, 7, 9, 13, 15, 18, 27]
          states: [idle, idle, answer, answer, answer, answer, idle, idle]
---

## ¿Qué problema resuelve?

Se tienen $n$ puntos en $\mathbb{R}^d$. El profesor plantea el problema así: "Dados n
puntos en $\mathbb{R}^d$, se nos pedirá realizar consultas sobre cajas; es decir, se
nos darán d intervalos $[l_1,r_1]$, $[l_2,r_2]$, ..., $[l_d,r_d]$ y obtendremos
información de los puntos en $[l_1,r_1] \times [l_2,r_2] \times ... \times [l_d,r_d]$." A ese
producto cartesiano de intervalos se le llama **caja**.

El objetivo declarado es responder cada consulta en $O(\log n + k)$, donde
$k$ es el tamaño de la respuesta — factible normalmente en 2D.

El profesor distingue dos escenarios antes de entrar al problema en sí:
**estático** (los puntos son fijos y pueden preprocesarse) y **dinámico**
(se pueden agregar y/o eliminar puntos). Todo lo que sigue en el material
— y todo lo que cubre este tema — trata el caso **estático**.

## Intuición

La misma caja admite tres preguntas de granularidad distinta, y esa
distinción es el contenido central de este tema:

- **Existencia** — "¿Existe algún punto dentro de la caja?"
- **Conteo** — "¿Cuántos puntos hay dentro de la caja?"
- **Enumeración** — "¿Cuáles son todos los puntos dentro de la caja?"

Pensar la caja como una ventana sobre el conjunto de puntos ayuda: existencia
sólo necesita saber si la ventana está vacía o no; conteo necesita un
número; enumeración necesita literalmente asomarse y listar cada punto que
cae dentro. Cada pregunta pide más información que la anterior, y esa
diferencia de información es exactamente lo que separa sus costos.

## Estructura interna

Este tema no define una estructura de datos propia — es el planteamiento
del problema que resuelve [range-tree](/structures/range-tree). Lo que sí
formaliza el material, como línea de base concreta, es el caso $d = 1$
sobre un **arreglo ordenado**:

- Ordenar los n puntos por su única coordenada: $O(n \log n)$ de
  preprocesamiento.
- Una consulta $[l_1, r_1]$ se resuelve ubicando la frontera del rango con
  búsqueda binaria (predecesor de `l1`, sucesor de `r1`, #19) y, según la
  pregunta, comparando, restando índices, o recorriendo el tramo entre esas
  dos posiciones.

La limitación que motiva abandonar el arreglo — y que el profesor señala
explícitamente (#22) — es que "si usamos arreglos, va a ser complicado
aumentar dimensiones de manera 'anidada'": un arreglo ordenado no se anida
bien para pasar de $d$ a $d+1$ dimensiones. Esa limitación es la que
[range-tree](/structures/range-tree) viene a resolver, reemplazando el
arreglo por un árbol binario de búsqueda balanceado (ver
[balanced-bst](/structures/balanced-bst)) que sí se anida.

## Operaciones

- [Existencia](/structures/orthogonal-range-search/operations/existence) — ¿hay algún punto en la caja?
- [Conteo](/structures/orthogonal-range-search/operations/count) — ¿cuántos puntos hay en la caja?
- [Enumeración](/structures/orthogonal-range-search/operations/enumeration) — ¿cuáles son esos puntos?

## Análisis de complejidad

El estilo del profesor aquí es **conteo estructural directo**: no plantea
recurrencias ni amortiza nada, cuenta directamente cuánto trabajo exige cada
pregunta.

Existencia y conteo comparten la misma naturaleza de costo: ambas se
resuelven por completo con la información de **frontera** del rango —
predecesor de `l1` y sucesor de `r1` — que una búsqueda binaria entrega en
$O(\log n)$. Ninguna de las dos necesita tocar los elementos que están
*entre* esas dos fronteras: existencia sólo pregunta si la frontera es no
vacía, y conteo obtiene la cantidad por aritmética de índices (posición del
sucesor menos posición del predecesor). Por eso ninguna depende de $k$.

Enumeración es distinta: además de encontrar la frontera (el mismo
$O(\log n)$ de arriba), tiene que **recorrer y reportar cada uno** de los $k$
puntos que caen dentro — no hay forma de dar esa respuesta sin tocar cada
elemento que la compone. Ese término $+\, k$ es lo que hace a enumeración
**output-sensitive**: su costo crece con el tamaño de la respuesta, no sólo
con $n$. Existencia y conteo, en cambio, cuestan lo mismo sin importar si la
caja contiene 0 o n puntos.

`range-tree` preserva exactamente esta misma distinción cuando generaliza el
arreglo ordenado a un árbol: ahí la frontera se traduce en $O(\log n)$
subárboles canónicos, y existencia/conteo se resuelven agregando información
precomputada en esos subárboles, mientras que enumeración necesita además
recorrerlos uno por uno para reportar sus hojas — de nuevo, $O(\log n)$
contra $O(\log n + k)$. Ese desarrollo, con el argumento de conteo de
subárboles, es contenido de [range-tree](/structures/range-tree) y no se
repite aquí.

## Tabla de complejidad

La tabla (generada desde `meta.yaml`) separa por operación un razonamiento
que en el material aparece como una sola cota agregada, $O(\log n + k)$, para
"la consulta" en general (#20). La descomposición en $O(\log n)$ /
$O(\log n)$ / $O(\log n + k)$ no es una cifra nueva: es la lectura de qué
información exige responder cada pregunta, sobre la misma línea de base de
arreglo ordenado.

## Ejemplos

Ver [examples.md](/structures/orthogonal-range-search#ejemplos).

## Comparación con estructuras relacionadas

| enfoque | preprocesamiento | existencia / conteo | enumeración | anida en $d+1$? |
| --- | --- | --- | --- | --- |
| fuerza bruta sobre los puntos | $O(1)$ | $O(n)$ | $O(n)$ (siempre revisa todo) | trivialmente, pero sin ganancia |
| arreglo ordenado ($d = 1$, este tema) | $O(n \log n)$ | $O(\log n)$ | $O(\log n + k)$ | mal — #22 |
| [range-tree](/structures/range-tree) | $O(n \log^{d-1} n)$ | $O(\log^d n)$ | $O(\log^d n + k)$ | sí, por construcción |

La fuerza bruta nunca es output-sensitive de forma útil: revisa los n puntos
sin importar cuántos caigan en la caja, así que su costo es $O(n)$ incluso
cuando $k = 0$. Es la línea de base contra la que compite toda la semana
(ver la implementación en C++ de este tema).

## Prueba de dominio

Ver [mastery-check.md](/structures/orthogonal-range-search#prueba-de-dominio).
