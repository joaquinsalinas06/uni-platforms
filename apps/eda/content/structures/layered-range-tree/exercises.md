---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      ¿Cuál de estas dos afirmaciones describe correctamente por qué el
      Layered Range Tree no necesita decidir "qué mitad promover" como en
      el caso general de fractional cascading? (a) porque las Y siempre
      están ordenadas; (b) porque el arreglo de un nodo padre es
      exactamente la unión de los arreglos de sus dos hijos.
    hints:
      - Repasa la nota de #28 sobre la relación padre-hijo en el range tree.
      - '"Promover la mitad" resuelve un problema de tamaño (Θ(kn)); pregúntate si ese problema existe aquí.'
    solution: >-
      (b). Como el arreglo del padre ES la unión de los de sus dos hijos,
      todo elemento del padre viene de alguno de los dos — no hace falta
      elegir cuáles promover, todos llevan puente (#31).
  - level: 2
    statement: >-
      Dado el padre [2, 6, 7, 10] formado al mezclar el hijo izquierdo
      [2, 7] y el hijo derecho [6, 10], traza a mano puenteIzq y
      puenteDer (con su centinela) para cada posición del padre.
    hints:
      - Usa dos punteros que sólo avanzan hacia adelante, uno por hijo, igual que en bridge-build.
      - "El centinela es una posición extra al final: puenteIzq[4] = tamaño(hijo izquierdo)."
    solution: >-
      puenteIzq = [0, 1, 1, 2, 2], puenteDer = [0, 0, 1, 1, 2]. Verifícalo
      posición por posición: para el valor 6 (posición 1 del padre), el
      puntero del hijo izquierdo se detiene en 1 (7 es el primer elemento
      del hijo izquierdo que no es menor que 6) y el del derecho en 0
      (6 mismo).
  - level: 3
    statement: >-
      Implementa la función que calcula puenteIzq y puenteDer con dos
      punteros a partir de dos arreglos ya ordenados y su merge, sin usar
      lower_bound ni ninguna búsqueda binaria.
    hints:
      - "Los dos punteros nunca retroceden: recórrelos en el mismo bucle que recorre el arreglo del padre."
      - No olvides la posición extra del centinela al final de cada arreglo de puentes.
    solution: >-
      Ver `step-2-bridges.cpp`: un solo bucle sobre el arreglo del padre,
      con dos `while` internos (uno por hijo) que avanzan el puntero
      mientras el valor del hijo sea menor que el valor actual del padre.
  - level: 4
    statement: >-
      Adapta la consulta de rango 2D para que, en vez de contar puntos,
      reporte sus coordenadas Y dentro del rango, sin perder la ventaja de
      O(1) por nodo canónico (fuera de listar la salida misma).
    hints:
      - "En cada nodo canónico ya tienes pa y pb trasladados por los puentes: ¿qué representa el segmento arreglo[pa..pb)?"
      - Reportar cuesta O(1) por elemento de salida, adicional al O(lg n) de encontrar los nodos canónicos — igual que enumeration en range-tree.
    solution: >-
      En cada nodo canónico, en vez de sumar pb - pa, recorre
      arreglo[pa..pb) y añade cada valor (o el punto completo, si el
      arreglo guarda punteros al punto original) a la salida. El costo
      total queda O(lg n + k), con k el tamaño de la respuesta — el mismo
      patrón que enumeration en range-tree, ahora con O(1) por nodo
      canónico en vez de O(lg n).
  - level: 5
    statement: >-
      Diseña, sin implementarlo, cómo extenderías el Layered Range Tree a
      3 dimensiones aplicando cascading sólo en la dimensión intermedia
      (X → Y), dejando la última dimensión (Z) como arreglo con búsqueda
      binaria simple. ¿Qué complejidad de consulta resulta?
    hints:
      - "Revisa la generalización del profesor en #41-42: sin cascading es O(lg^(d-1) n); con cascading en las intermedias, para d>2, es O(lg^(d-2) n)."
      - Piensa en qué estructura cuelga de cada posición del arreglo de Y — un árbol o un arreglo de Z, y si ESE anidamiento admite cascading.
    solution: >-
      Con d=3, sin cascading la consulta sería O(lg² n) (la última
      dimensión ya es arreglo + búsqueda binaria); aplicando cascading en
      la dimensión intermedia (Y, entre X y Z) baja a O(lg^(3-2) n) =
      O(lg n) (#42), al costo de un puntero extra por elemento en esa
      dimensión — ninguna estructura nueva, sólo el mismo mecanismo de
      puentes repetido un nivel más.
  - level: 6
    statement: >-
      Demuestra por qué el puente puenteIzq[i] calculado durante el merge
      (con dos punteros) es exactamente el mismo valor que se obtendría
      buscando arreglo[i] con lower_bound en el arreglo del hijo izquierdo
      — es decir, por qué el atajo de O(1) no pierde precisión frente a la
      búsqueda binaria que reemplaza.
    hints:
      - "Usa la invariante de orden: el arreglo del padre está ordenado, y el puntero pIzq nunca retrocede."
      - Piensa en qué elementos del hijo izquierdo ya quedaron "atrás" del puntero cuando se procesa la posición i del padre.
    solution: >-
      Al llegar a la posición i del padre, el puntero pIzq se detuvo
      exactamente en el primer índice j tal que hijoIzq[j] ≥ arreglo[i]
      (por construcción del bucle: avanza mientras hijoIzq[pIzq] <
      arreglo[i]). Esa es, por definición, la salida de
      lower_bound(hijoIzq, arreglo[i]). Como el arreglo del padre es
      ordenado y el puntero nunca retrocede, ese mismo argumento vale para
      cada i sucesivo sin tener que reiniciar la búsqueda — de ahí que
      recorrer todo el arreglo del padre una sola vez baste para calcular
      todos los puentes correctos, en vez de una búsqueda binaria (O(lg n))
      por cada uno.
---

Ejercicios sobre las tres operaciones del Layered Range Tree: el reemplazo
por arreglo, la construcción de puentes durante el merge y la consulta 2D
que los usa.
