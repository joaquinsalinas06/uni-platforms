---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Un compañero dice: "el conjunto de puntos de una ejecución de BST tiene exactamente un punto por acceso,
      porque hay un acceso por fila". Corrige la frase con la regla de la clase (#14): ¿cuántos puntos tiene como
      mínimo cada fila, qué representa cada uno y qué se mide con el total?
    hints:
      - "Piensa en qué hace un BST real al buscar una llave: ¿toca sólo el nodo buscado?"
      - "La regla de la clase habla de 'un punto por cada nodo ...' — completa la frase."
    solution: >-
      Cada fila tiene al menos un punto (el nodo buscado) y normalmente varios: un punto por cada nodo tocado en
      el camino desde la raíz. El total de puntos, no el número de accesos, es el costo de la ejecución — está
      dentro de un factor constante del costo real porque nunca se toca un nodo más de O(1) veces por búsqueda.
  - level: 2
    statement: >-
      Árbol con raíz 2 e hijos 1 (izquierdo) y 3 (derecho). Accesos $1, 3, 2$ en ese orden, sin rotaciones. Escribe
      los nodos tocados en cada acceso, el conjunto $P$ de puntos $(x, i)$ y su tamaño.
    hints:
      - "El acceso a 1 baja por la raíz 2 y luego a 1."
      - "El acceso a 2 es a la raíz: no baja por ningún hijo."
    solution: >-
      Acceso 1 (llave 1): {2, 1}. Acceso 2 (llave 3): {2, 3}. Acceso 3 (llave 2): {2}. P = {(2,1), (1,1), (2,2),
      (3,2), (2,3)}, con |P| = 5. Tres de los puntos son accesos pedidos — (1,1), (3,2), (2,3) — y dos son nodos
      tocados de paso: las dos veces que se pasó por la raíz 2 al buscar un hijo.
  - level: 3
    statement: >-
      Implementa en C++ una función que reciba un BST **estático** (arreglos `padre[]` con `padre[raiz] = 0`) y la
      secuencia de accesos, y devuelva el conjunto de puntos $(x, i)$, uno por nodo tocado. Pruébala con el árbol
      de la clase (raíz 3, hijo izquierdo 1, hijo derecho 4, y 2 hijo derecho de 1) y la secuencia 3, 1, 4, 2.
    hints:
      - "Para el acceso $i$ a la llave $x$, sube por `padre` desde $x$ hasta la raíz: ésos son los nodos tocados."
      - "Cada nodo del camino produce el punto $(nodo, i)$. Ordénalos o no: es un conjunto."
    solution: |-
      ```cpp
      vector<pair<int,int>> puntos(const vector<int>& padre, const vector<int>& acc) {
        vector<pair<int,int>> P;
        for (int i = 0; i < (int)acc.size(); i++)
          for (int v = acc[i]; v != 0; v = padre[v]) P.push_back({v, i + 1});
        return P;
      }
      // padre[1]=3, padre[2]=1, padre[3]=0 (raíz), padre[4]=3.
      // Con la secuencia 3, 1, 4, 2 devuelve los 8 puntos de la tabla del ejemplo normal.
      ```
  - level: 4
    statement: >-
      Mismo árbol del nivel 2 (raíz 2, hijos 1 y 3) y los mismos accesos $1, 3, 2$, pero ahora el algoritmo
      **mueve a la raíz** cada nodo accedido mediante rotaciones. Dibuja el árbol después de cada acceso, escribe
      el camino tocado en cada uno y cuenta los puntos. ¿Mejora respecto del árbol estático?
    hints:
      - "Mover a la raíz sólo toca los nodos del camino desde la raíz hasta el accedido, así que los puntos de un acceso son ese camino en el árbol de ESE momento."
      - "Después del acceso a 1, el árbol queda con 1 en la raíz, 2 como su hijo derecho y 3 como hijo derecho de 2."
    solution: >-
      Acceso a 1: camino {2, 1}. Tras mover 1 a la raíz: 1 → (derecho) 2 → (derecho) 3. Acceso a 3: camino {1, 2, 3};
      tras mover 3 a la raíz: raíz 3, hijo izquierdo 1, y 2 como hijo derecho de 1. Acceso a 2: camino {3, 1, 2}.
      Puntos: 2 + 3 + 3 = 8, frente a 5 del árbol estático: en esta secuencia NO mejora. Mover a la raíz es una
      estrategia, no una garantía; por eso hace falta una teoría para compararlas (arborally-satisfied-set).
  - level: 5
    statement: >-
      Diseña una secuencia de $m$ accesos y un BST para el que el conjunto de puntos tenga exactamente $m$ puntos
      (el mínimo posible). Justifica por qué ninguna ejecución puede tener menos, y explica por qué esa secuencia es
      "trivial".
    hints:
      - "Cada acceso toca al menos un nodo. ¿Qué pasa si el nodo buscado es siempre el mismo y está en la raíz?"
      - "Los accesos repetidos a la misma llave son el caso más barato que conoces del conjunto de trabajo."
    solution: >-
      Cualquier árbol con la llave 2 en la raíz y la secuencia 2, 2, 2, ..., 2 (m veces): cada acceso toca sólo la
      raíz, así que P = {(2,1), ..., (2,m)} y |P| = m. Ninguna ejecución tiene menos porque cada fila contiene al
      menos el punto del nodo buscado (|P| >= m). La secuencia es trivial porque todos los puntos están en la misma
      columna: un algoritmo no necesita reorganizar nada.
  - level: 6
    statement: >-
      Demuestra que el costo real de ejecutar un BST sobre una secuencia está entre $|P|$ y $c \cdot |P|$ para una
      constante $c$, usando la afirmación de la clase ("nunca hace falta tocar un nodo más de O(1) veces por
      búsqueda"). Indica explícitamente qué supuesto sobre el costo de cada toque usas.
    hints:
      - "Separa las dos desigualdades: una cota inferior (cada punto cuesta algo) y una superior (cada punto cuesta a lo sumo una constante)."
      - "El supuesto del modelo es que mover un puntero y rotar cuestan O(1)."
    solution: >-
      Supuesto del modelo BST: mover un puntero y rotar cuestan cada uno O(1) (ver bst-computational-model).
      Inferior: cada punto (x, i) es un nodo tocado en la búsqueda i, y tocarlo requiere al menos un movimiento de
      puntero, así que el costo es >= |P|. Superior: en la búsqueda i cada nodo se toca a lo sumo k veces (k
      constante, por la afirmación de la clase) y cada toque cuesta O(1), así que la búsqueda i cuesta
      <= k * c0 * (puntos de la fila i). Sumando sobre las m filas, el costo total es <= k * c0 * |P|. Por tanto
      el costo real es Theta(|P|), con c = k * c0.
---

Seis ejercicios, de reconocer a demostrar. Los de código usan la regla de [geometric-view](/structures/geometric-view): un punto por nodo tocado.
