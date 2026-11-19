---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  label: reconocer
  statement: >-
    ¿Por qué el procedimiento Centroide(r) nunca tiene dos hijos candidatos a la vez para bajar?
  hints:
  - >-
    Un candidato tiene más de $n/2$ nodos.
  solution: >-
    Dos hijos con más de $n/2$ nodos cada uno sumarían más de $n$ nodos dentro de una componente de $n$: imposible. Hay a lo más un candidato.
- level: 2
  label: trazar
  statement: >-
    Encuentra el centroide del árbol de clase llamando a Centroide desde la hoja 11.
  hints:
  - >-
    Con raíz 11, el único hijo de 11 es 7, de tamaño 10.
  - >-
    Sigue bajando mientras el hijo tenga más de 5,5.
  solution: >-
    Con raíz 11: $11 \to 7$ (tam 10), $7 \to 3$ (tam 9), $3 \to 1$ (tam 8), $1 \to 2$ (tam 6 > 5,5); desde 2 los hijos 5 y 6 tienen 3 y 2: el centroide es 2, igual que llamando desde 1.
- level: 3
  label: resolver
  statement: >-
    En el árbol de clase, calcula $d(8, 11)$ con la propiedad clave.
  hints:
  - >-
    $\mathrm{LCA}_c(8, 11)$ es 2.
  solution: >-
    El LCA de centroides de 8 (bajo 5) y 11 (bajo 3) es 2. $d(8, 2) = 2$ y $d(2, 11) = 4$ (2–1–3–7–11): $d(8,11) = 6$.
- level: 4
  label: adaptar
  statement: >-
    Adapta Contar(c) para contar los pares a distancia **a lo más** $k$.
  hints:
  - >-
    Cambia la consulta de un valor por una suma de prefijo.
  solution: >-
    Se mantiene un arreglo de conteos por profundidad con sumas de prefijo (por ejemplo un Fenwick tree): para cada $d \in D$ se suma $\sum_{j \le k - d} \mathrm{cnt}[j]$ antes de insertar $D$. El costo sube a $O(n \lg^2 n)$ con Fenwick.
- level: 5
  label: diseñar
  statement: >-
    En Ciel the Commander, ¿qué responde el programa si el árbol es un camino de $2^{26}$ nodos? Justifica.
  hints:
  - >-
    La profundidad del árbol de centroides de un camino de $n$ nodos es $\lfloor\lg n\rfloor$.
  solution: >-
    La profundidad sería $\lfloor \lg 2^{26}\rfloor = 26$: harían falta 27 letras (niveles 0 a 26), una más que A–Z. Con $n < 2^{26}$ siempre alcanzan.
- level: 6
  label: demostrar
  statement: >-
    Demuestra que el árbol de centroides tiene profundidad a lo más $\lfloor\lg n\rfloor$.
  hints:
  - >-
    Inducción: una componente de nivel $d$ mide a lo más $n/2^d$.
  solution: >-
    La componente de nivel 0 mide $n$. Una de nivel $d+1$ es una componente que queda al quitar el centroide de una de nivel $d$, así que mide a lo más la mitad: por inducción, $\le n/2^{d}$ en el nivel $d$. Como mide al menos 1, $2^d \le n$ y $d \le \lfloor \lg n\rfloor$.
---

Antes de abrir una pista, escribe los tamaños de la componente desde el nodo en que se llama.
