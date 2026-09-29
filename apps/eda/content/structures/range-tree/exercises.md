---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      En el range tree 1D con hojas {3, 4, 7, 9, 13, 15, 18, 27}
      (diapositiva #29), ¿qué guarda el nodo interno cuyos descendientes
      son las hojas 13 y 15? ¿Por qué ese valor y no otro?
    hints:
      - "Los internos no son puntos del conjunto: son delimitadores."
      - "El profesor dice explícitamente qué guarda cada interno (#26)."
    solution: >-
      Guarda 13: el máximo del subárbol izquierdo de ese nodo (que sólo
      contiene la hoja 13). Ningún interno guarda un punto real; sólo el
      valor que permite decidir hacia qué lado seguir buscando.
  - level: 2
    statement: >-
      Traza la consulta [5,16] sobre ese mismo árbol: ¿cuáles son las dos
      hojas delimitadoras, cuál es el nodo P, y cuáles son los subárboles
      canónicos de la respuesta?
    hints:
      - "Los delimitadores son Predecessor(5) y Successor(16); ninguno de
        los dos pertenece a la respuesta."
      - "P = LCA de esas dos hojas delimitadoras."
    solution: >-
      Delimitadores: hoja 4 (Predecessor(5)) y hoja 18 (Successor(16)). P
      es la raíz (9). Subárboles canónicos de la respuesta: el interno 7
      (hojas 7, 9) y el interno 13 (hojas 13, 15) — respuesta total {7, 9,
      13, 15}, exactamente la diapositiva #35.
  - level: 3
    statement: >-
      Implementa Existe(raiz, l1, r1) usando la descomposición canónica de
      range-query-1d en vez de recorrer todas las hojas. ¿Qué complejidad
      logras y por qué ya no es necesario bajar a ninguna hoja?
    hints:
      - "range-query-1d ya devuelve subárboles completos, no hojas
        sueltas."
      - "Basta con que la lista de subárboles no esté vacía."
    solution: >-
      Devolver `RangeQuery1D(raiz, l1, r1) ≠ ∅`. Es O(log n): el costo lo
      paga por completo la búsqueda de los subárboles canónicos; no hace
      falta descender a las hojas porque la sola existencia de un subárbol
      en la lista ya certifica que hay al menos un punto en rango.
  - level: 4
    statement: >-
      El árbol secundario del nodo 15 en el range tree 2D (diapositiva #47)
      tiene raíz 0, hijos −2 y 1. Si se agregara un noveno punto (20, −5) al
      subárbol de ese nodo, ¿cómo cambiaría ese árbol secundario, y qué
      operación de este tema describe la reconstrucción?
    hints:
      - "El árbol secundario de un nodo se arma mezclando por Y los
        secundarios de sus dos hijos (#54)."
      - "Agregar un punto rompe el tamaño par (4→5) del subárbol; el
        árbol primario en X ya no queda perfectamente balanceado ahí."
    solution: >-
      build-2d reconstruiría el secundario del nodo 15 mezclando por Y los
      cinco puntos (ahora con Y = −5 en la posición más baja): la nueva hoja
      con Y=−5 pasaría a ser el mínimo del árbol secundario. El profesor no
      da inserción para el range tree (es una estructura estática): en la
      práctica esto exige reconstruir el subárbol afectado, no actualizarlo
      incrementalmente.
  - level: 5
    statement: >-
      Diseña, a alto nivel, cómo extenderías el range tree 2D a 3
      dimensiones para resolver Rectangle Sum con pesos (el ejercicio del
      profesor en #60-61: puntos (x,y) con peso, consultas l≤x<r, d≤y<u).
      ¿Qué cambia respecto a existence-count, y qué no cambia?
    hints:
      - "El profesor dice: 'agregar punteros hacia range trees ordenados
        por la dimensión (k+1)' (#52) — pero Rectangle Sum no necesita una
        tercera dimensión geométrica."
      - "Lo que cambia es qué guarda cada nodo, no la forma del árbol."
    solution: >-
      No hace falta una tercera dimensión: basta con que cada nodo, en vez
      de (o además de) un contador de hojas, guarde la suma de los pesos de
      su subárbol. range-query-2d encuentra los mismos subárboles canónicos
      en X y Y; existence-count se convierte en "sumar pesos" en vez de
      "sumar contadores" — mismo mecanismo O(log² n), sólo cambia el dato
      agregado en cada nodo, no la estructura ni el algoritmo de búsqueda.
  - level: 6
    statement: >-
      Demuestra que, para cualquier consulta [l1,r1] sobre un range tree 1D
      con n hojas, la descomposición canónica produce a lo más O(log n)
      subárboles disjuntos cuya unión es exactamente los puntos en
      [l1,r1].
    hints:
      - "Usa el argumento del profesor: los caminos P→Predecessor(l1) y
        P→Successor(r1) tienen longitud O(log n) por el invariante de
        balance del BST subyacente (#33-34)."
      - "En cada nodo de esos caminos se agrega a lo más un subárbol; nunca
        dos, y nunca uno que se solape con otro ya agregado."
    solution: >-
      Cada camino desde P hasta una hoja delimitadora tiene longitud igual
      a la altura del árbol menos la profundidad de P, que es O(log n)
      porque el árbol es un BST balanceado (balanced-bst). En cada nodo
      interno de ese camino se agrega, a lo más, el subárbol hermano no
      visitado — uno por nodo del camino, nunca más. Los subárboles
      agregados son disjuntos porque cada uno cuelga de un nodo distinto
      del camino y ninguno es ancestro de otro (todos son hermanos de
      nodos en el camino, nunca el camino mismo). Su unión cubre
      exactamente [l1,r1]: todo punto en el rango cae en el subárbol de
      alguno de los dos caminos (porque P es el ancestro común de todas las
      hojas del rango) y en cada paso del camino el subárbol hermano
      agregado contiene precisamente los puntos que quedan del lado
      correcto del delimitador; los propios delimitadores (Predecessor(l1)
      y Successor(r1)) quedan fuera por construcción. Con dos caminos de
      O(log n) y a lo más un subárbol por nodo, el total es O(log n)
      subárboles.
---

Los niveles 1-2 se resuelven trazando el árbol de las diapositivas #29 y
#35 a mano; los niveles 3-6 exigen escribir o razonar sobre el algoritmo de
la descomposición canónica, no sólo citarlo.
