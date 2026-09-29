---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      De las siguientes cuatro figuras, ¿cuáles podrían ser un árbol
      binomial `B_k`? (a) un nodo con 3 hijos, todos hoja. (b) un nodo con
      hijos de grados 2, 1 y 0. (c) una cadena de 4 nodos, cada uno con un
      solo hijo. (d) un nodo con un solo hijo, que a su vez tiene dos hijos.
    hints:
      - "Mira el grado de cada hijo de la raíz: en B_k deben ser k-1, k-2, ..., 1, 0."
    solution: >-
      Sólo (b) es un árbol binomial: es B_3, con hijos de la raíz de grado
      2, 1 y 0 (raíces de B_2, B_1 y B_0). (a) tiene tres hijos todos de
      grado 0, lo que no corresponde a ningún B_k. (c) y (d) no tienen la
      forma recursiva B_{k-1} + B_{k-1}.
  - level: 2
    statement: >-
      Traza la construcción de B_3 a partir de dos copias de B_2, indicando
      qué nodo se convierte en hijo de cuál y cuántos nodos, qué altura y
      qué grado de raíz resulta.
    hints:
      - "La raíz de uno de los dos B_2 pasa a ser el hijo más a la izquierda de la raíz del otro."
      - "Usa las fórmulas 2^k, k y k para verificar tu resultado antes de darlo por bueno."
    solution: >-
      Se toman dos B_2 (cada uno con 4 nodos, altura 2, raíz de grado 2). La
      raíz de uno se cuelga como hijo izquierdo de la raíz del otro. El
      árbol resultante, B_3, tiene 2·4=8 nodos, altura 1+2=3, y la raíz
      queda con grado 3 (sus dos hijos originales más el nuevo).
  - level: 3
    statement: >-
      Implementa en C++ una función `build(k)` que construya B_k por enlace
      recursivo (representación hijo-izquierdo/hermano-derecho) a partir de
      dos B_{k-1}, con caso base B_0 = un solo nodo.
    hints:
      - "build(0) crea un nodo sin hijos ni hermanos."
      - "build(k) llama build(k-1) dos veces y engancha la raíz de una copia como primer hijo de la otra, empujando los hermanos existentes."
    solution: >-
      Ver cpp/structures/binomial-tree/full-implementation.cpp — build(k)
      llama build(k-1) dos veces, hace que la raíz de la segunda copia
      apunte con next_sibling al primer hijo actual de la primera y luego
      la asigna como new first_child.
  - level: 4
    statement: >-
      Adapta build(k) para que, además de construir B_k, devuelva un mapa de
      profundidad → cantidad de nodos en esa profundidad, sin usar la
      fórmula C(k,i) directamente (sólo recorriendo el árbol).
    hints:
      - "Un recorrido DFS o BFS que lleve la profundidad acumulada basta; no hace falta tocar build."
      - "Compara al final tu conteo por recorrido contra C(k,i) para verificar ambas cosas a la vez."
    solution: >-
      Se recorre el árbol (BFS es más directo) llevando la profundidad de
      cada nodo visitado y se incrementa un contador por profundidad. El
      resultado, para cualquier k, debe coincidir exactamente con C(k,i)
      para cada i de 0 a k.
  - level: 5
    statement: >-
      Diseña (sin implementar) un algoritmo que, dado un árbol arbitrario
      con la representación hijo-izquierdo/hermano-derecho, decida si es un
      árbol binomial válido de algún orden k, en tiempo proporcional al
      número de nodos.
    hints:
      - "El grado de la raíz determina el candidato a k; a partir de ahí la forma es rígida, no hay que probar varios k."
      - "Verifica recursivamente que el hijo i-ésimo de la raíz (de derecha a izquierda) sea, él mismo, un árbol binomial de orden i."
    solution: >-
      Se cuenta el grado d de la raíz: es el único k candidato. Se ordenan
      los hijos por grado y se verifica que sean, de izquierda a derecha,
      árboles binomiales válidos de orden d-1, d-2, ..., 1, 0 (aplicando el
      mismo chequeo recursivamente). Si en algún punto el grado o la
      recursión no calzan, se rechaza. Costo O(n) porque cada nodo se visita
      una vez.
  - level: 6
    statement: >-
      Demuestra por inducción sobre k que el número de nodos a profundidad i
      en B_k es exactamente C(k,i), usando la construcción B_k = B_{k-1} + B_{k-1}.
    hints:
      - "Separa los nodos de B_k según de cuál de las dos copias de B_{k-1} vienen, y en qué profundidad están dentro de esa copia."
      - "La raíz que pasa a ser hijo baja su profundidad relativa en 1 frente a la copia que la absorbe; usa la identidad de Pascal C(k,i) = C(k-1,i-1) + C(k-1,i)."
    solution: >-
      Caso base k=0: B_0 tiene 1 nodo a profundidad 0 y C(0,0)=1. Paso
      inductivo: en B_k = B_{k-1} + B_{k-1}, la copia que se queda como raíz
      aporta, a profundidad i, los C(k-1,i) nodos que tenía a profundidad i
      en su propio B_{k-1}. La copia que pasa a ser subárbol (colgada un
      nivel más abajo) aporta, a profundidad i de B_k, los nodos que tenía a
      profundidad i-1, es decir C(k-1,i-1). Sumando: C(k-1,i-1) + C(k-1,i) =
      C(k,i) por la identidad de Pascal, que es exactamente la recurrencia
      que define al coeficiente binomial.
---

Si algún nivel no sale, vuelve a la sección "Análisis de complejidad" de
[theory.md](/structures/binomial-tree) antes de pedir la siguiente pista.
