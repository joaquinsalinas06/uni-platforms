---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  label: reconocer
  statement: >-
    ¿Por qué el suffix tree de una cadena de largo $n$ tiene exactamente $n+1$ hojas y a lo más $n$ nodos internos?
  hints:
  - >-
    El centinela impide que un sufijo sea prefijo de otro.
  - >-
    En un árbol donde todo interno tiene al menos dos hijos, compara internos y hojas.
  solution: >-
    Hay $n+1$ sufijos de $S\mathdollar$ y, gracias al centinela, cada uno termina en su propia hoja. Cada interno no raíz tiene al menos dos hijos, y un árbol así con $L$ hojas tiene a lo más $L-1$ internos: $\le n$. En total $\le 2n+1$ nodos.
- level: 2
  label: trazar
  statement: >-
    Dibuja el suffix tree de $\mathtt{abab}\mathdollar$ y busca el patrón $\mathtt{ba}$: indica la arista en que termina y las ocurrencias.
  hints:
  - >-
    Los internos son ab y b.
  - >-
    Desde b, la arista que sigue con a es $\mathtt{ab}\mathdollar$.
  solution: >-
    Raíz con hijos ab (interno, con hijos $\mathtt{ab}\mathdollar$ hoja 0 y $\mathdollar$ hoja 2), b (interno, con hijos $\mathtt{ab}\mathdollar$ hoja 1 y $\mathdollar$ hoja 3) y $\mathdollar$ (hoja 4). Buscar ba: se toma la arista b, se llega al interno b y se entra una letra en la arista $\mathtt{ab}\mathdollar$, que lleva a la hoja 1. Una ocurrencia, en la posición 1.
- level: 3
  label: resolver
  statement: >-
    En el suffix tree de $\mathtt{banana}\mathdollar$, ¿cuántas veces aparece $\mathtt{na}$ y dónde? ¿Y $\mathtt{ban}$?
  hints:
  - >-
    na termina exactamente en un nodo interno.
  - >-
    ban termina dentro de una arista que lleva a una hoja.
  solution: >-
    na termina en el interno na, cuyo subárbol tiene las hojas 4 y 2: dos ocurrencias, en 2 y 4. ban termina dentro de la arista $\mathtt{banana}\mathdollar$, que lleva a la hoja 0: una ocurrencia, en 0.
- level: 4
  label: adaptar
  statement: >-
    Explica cómo contar las ocurrencias de cada patrón de una lista en $O(\lvert P\rvert)$ por patrón tras un preprocesamiento lineal del árbol.
  hints:
  - >-
    Las ocurrencias son las hojas del subárbol donde termina el patrón.
  - >-
    Guarda en cada nodo el número de hojas de su subárbol.
  solution: >-
    Con un recorrido en postorden se guarda en cada nodo cuántas hojas tiene su subárbol, $O(n)$. Para un patrón se baja desde la raíz en $O(\lvert P\rvert)$; si termina en un nodo o dentro de la arista que llega a un nodo $v$, la respuesta es el contador de $v$ (si no se puede bajar, 0). Es el problema Counting Patterns de la práctica de clase.
- level: 5
  label: diseñar
  statement: >-
    Diseña un procedimiento para hallar la subcadena común más larga de $S$ y $T$ con un suffix tree, y aplícalo a $S = \mathtt{abab}$, $T = \mathtt{bab}$.
  hints:
  - >-
    Construye el árbol de $S\#T\mathdollar$ y marca cada hoja según el lado del separador en que empieza.
  - >-
    Busca el interno más profundo con hojas de ambos lados.
  solution: >-
    Se construye el árbol de $S\#T\mathdollar$ en $O(n)$ y, en postorden, se marca en cada nodo si su subárbol tiene hojas que empiezan en $S$ y en $T$. La respuesta es la etiqueta del interno más profundo con ambas marcas. Para abab y bab: bab aparece en ambas (en S desde la posición 1) y es la más larga, de longitud 3.
- level: 6
  label: demostrar
  statement: >-
    Demuestra que si un nodo interno tiene etiqueta $x\alpha$ (con $x$ un carácter), entonces existe un nodo (interno o raíz) con etiqueta $\alpha$.
  hints:
  - >-
    Un interno tiene al menos dos hijos con primeras letras distintas.
  - >-
    Si $x\alpha c$ aparece en $S$, también aparece $\alpha c$.
  solution: >-
    Como $x\alpha$ es interno, tiene dos hijos cuyas aristas empiezan con letras distintas $c_1 \ne c_2$: $x\alpha c_1$ y $x\alpha c_2$ aparecen en $S\mathdollar$. Entonces $\alpha c_1$ y $\alpha c_2$ también aparecen (son sufijos de esas apariciones). El camino de $\alpha$ en el árbol se bifurca después de $\alpha$, así que termina en un nodo; si $\alpha$ es vacía, ese nodo es la raíz.
---

Antes de abrir una pista, dibuja el árbol y escribe en cada hoja su posición de inicio.
