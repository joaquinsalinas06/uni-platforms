---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  label: reconocer
  statement: >-
    ¿Por qué todo nodo interno tiene exactamente un hijo pesado con la definición de clase, y qué cambia con la definición $2\,\mathrm{tam}[v] > \mathrm{tam}[u]$?
  hints:
  - >-
    Con la definición de clase, el hijo pesado es un máximo (con desempate).
  - >-
    ¿Puede algún hijo tener más de la mitad si hay tres hijos de igual tamaño?
  solution: >-
    Con la definición de clase siempre hay un hijo de tamaño máximo y el desempate elige uno: exactamente uno. Con $2\,\mathrm{tam}[v] > \mathrm{tam}[u]$ puede no haber ninguno (por ejemplo tres hijos iguales), pero sigue valiendo que las livianas cumplen $\mathrm{tam}[v] \le \mathrm{tam}[u]/2$, y la cota de $\lfloor\lg n\rfloor$ livianas se mantiene.
- level: 2
  label: trazar
  statement: >-
    En el árbol de 11 nodos de clase, descompón el camino $8 \leadsto 11$ y el camino $10 \leadsto 9$ en rangos del arreglo.
  hints:
  - >-
    Arreglo: 1, 2, 5, 8, 9, 6, 10, 3, 7, 11, 4 en las posiciones 0 a 10.
  - >-
    Se mueve el extremo cuya cadena tiene el tope más profundo.
  solution: >-
    $8 \leadsto 11$: se mueve 11 (tope 3, prof. 1): rango $[7, 9]$, luego misma cadena con 8: $[0, 3]$. $10 \leadsto 9$: se mueve 9: $[4,4]$, $v \leftarrow 5$; se mueve 10: $[5, 6]$, $u \leftarrow 2$; misma cadena: $[1, 2]$.
- level: 3
  label: resolver
  statement: >-
    En el mismo árbol, ¿qué intervalo del arreglo es el subárbol de 3? ¿Y el de 5?
  hints:
  - >-
    Subárbol = $[\mathrm{pos}[v], \mathrm{sal}[v])$.
  solution: >-
    Subárbol de 3 = $\{3, 7, 11\}$ = $[7, 10)$. Subárbol de 5 = $\{5, 8, 9\}$ = $[2, 5)$.
- level: 4
  label: adaptar
  statement: >-
    Adapta la consulta de camino para valores en **aristas** (no en nodos). ¿Qué posición hay que excluir y por qué?
  hints:
  - >-
    Guarda el peso de la arista $(\mathrm{padre}(v), v)$ en $\mathrm{pos}[v]$.
  - >-
    En la última cadena, el nodo menos profundo es el LCA.
  solution: >-
    Cada arista se guarda en la posición de su hijo. Los saltos entre cadenas consultan $[\mathrm{pos}[\mathrm{tope}[x]], \mathrm{pos}[x]]$, que incluye la arista del tope hacia su padre, que sí está en el camino. En la última cadena, con $u$ el menos profundo (el LCA), se consulta $[\mathrm{pos}[u] + 1, \mathrm{pos}[v]]$: la posición del LCA guarda la arista a su padre, que no está en el camino.
- level: 5
  label: diseñar
  statement: >-
    Se piden dos operaciones: sumar $x$ a todos los nodos del camino $u \leadsto v$ y consultar la suma del subárbol de $w$. Diseña la solución y da su costo.
  hints:
  - >-
    Ambas usan el mismo arreglo linealizado.
  - >-
    Un segment tree con propagación perezosa soporta suma en rango y suma de rango.
  solution: >-
    Un segment tree con propagación perezosa sobre el arreglo pesado primero. Sumar en un camino: se descompone en $O(\lg n)$ rangos y se aplica la suma perezosa en cada uno, $O(\lg^2 n)$. Suma de un subárbol: el rango $[\mathrm{pos}[w], \mathrm{sal}[w])$, $O(\lg n)$.
- level: 6
  label: demostrar
  statement: >-
    Demuestra que un camino de cualquier nodo a la raíz cruza a lo más $\lfloor\lg n\rfloor + 1$ cadenas pesadas.
  hints:
  - >-
    Si $(u,v)$ es liviana, $\mathrm{tam}[v] \le \mathrm{tam}[u]/2$.
  - >-
    Cada cambio de cadena al subir es una arista liviana.
  solution: >-
    Al subir, cada cambio de cadena atraviesa una arista liviana $(u,v)$, con $\mathrm{tam}[u] \ge 2\,\mathrm{tam}[v]$. Empezando con tamaño $\ge 1$ y sin superar $n$, tras $k$ livianas el tamaño es $\ge 2^k$, así que $k \le \lfloor\lg n\rfloor$. Las cadenas cruzadas son $k + 1 \le \lfloor \lg n\rfloor + 1$.
---

Antes de abrir una pista, escribe el arreglo pesado primero y la cabeza de cada cadena.
