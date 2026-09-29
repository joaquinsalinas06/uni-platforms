---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor da la condición de aplicabilidad como tres requisitos
      sobre un grafo. Lístalos, y di cuál de los tres es el que D4/D3 tiene
      que verificar explícitamente (no se da gratis).
    hints:
      - "Revisa la sección Estructura interna de theory.md: conjuntos en los vértices, boletos en las aristas, grado acotado."
      - "Los dos primeros son casi automáticos en cualquier construcción de fractional cascading; el tercero es el que hay que contar vecino por vecino."
    solution: >-
      Los tres requisitos (#51): (1) cada vértice guarda un conjunto de
      elementos; (2) las aristas están etiquetadas con boletos hacia
      elementos vecinos; (3) cada vértice tiene grado acotado. Los dos
      primeros los cumple cualquier estructura de fractional cascading por
      construcción; el tercero es el que Bounded-degree-check verifica
      explícitamente sobre D4/D3, contando que cada nodo tiene a lo más 5
      vecinos.
  - level: 2
    statement: >-
      Sobre el grafo D4-like de examples.md (raíz con hijo-A, hijo-B,
      gemela-A, gemela-B), traza el camino de vértices que recorre una
      consulta que entra por la raíz, baja a hijo-B, vuelve a la raíz, y
      salta a gemela-A. ¿Cuántos pasos O(1) hay después de la búsqueda real?
    hints:
      - "La búsqueda real ocurre sólo una vez, al entrar por el primer vértice del camino."
      - "Cuenta las aristas recorridas, no los vértices distintos: raíz→hijo-B, hijo-B→raíz, raíz→gemela-A."
    solution: >-
      El camino es [raíz, hijo-B, raíz, gemela-A]: 4 vértices, 3 aristas
      recorridas. Hay una única búsqueda binaria real al entrar en raíz
      (O(lg n)), y luego 3 pasos O(1): raíz→hijo-B, hijo-B→raíz (vuelve a
      visitar la raíz, pero sigue siendo un paso O(1) porque depende de la
      arista, no de si el vértice ya se visitó), y raíz→gemela-A (el salto
      a la estructura invertida, también O(1) según #53).
  - level: 3
    statement: >-
      Implementa bounded_degree_check(graph, max_degree) que recorra un
      grafo de vértices con lista de vecinos y devuelva false apenas
      encuentre un vértice que exceda max_degree, imprimiendo el grado de
      cada vértice visitado antes de detenerse.
    hints:
      - "No hace falta recorrer todo el grafo si ya encontraste una violación: puedes cortar temprano, pero igual imprime lo que llevas visto."
      - "Reutiliza la firma de step-2-bounded-degree-check.cpp; el cambio es sólo dónde cortas el bucle."
    solution: >-
      La función recorre `for (const auto& v : g)`, imprime `v.id` y
      `v.neighbors.size()`, y hace `if (v.neighbors.size() > max_degree)
      return false;` dentro del mismo bucle en vez de acumular un booleano
      hasta el final — corta apenas encuentra la primera violación, tal
      como pide el enunciado. Es la misma lógica de
      `bounded_degree_check` en full-implementation.cpp, sólo que ese
      recorre todo el grafo para reportar TODOS los vértices en vez de
      cortar en el primero.
  - level: 4
    statement: >-
      Adapta cascade_query_path para un camino donde el vértice de entrada
      no es el primero de una lista fija, sino que se elige en tiempo de
      consulta según qué región 3D se está preguntando. ¿Qué cambia y qué
      no cambia respecto a la versión de full-implementation.cpp?
    hints:
      - "El costo O(lg n) de la búsqueda real no depende de qué vértice se elija como entrada, sólo de dónde ocurre — sigue habiendo exactamente una."
      - "build_along_path ya recibe el camino como parámetro; el cambio real es sólo QUIÉN calcula ese camino antes de llamarla, no la función misma."
    solution: >-
      No cambia nada en cascade_query_path ni en build_along_path: ambas ya
      reciben el camino como parámetro (`path`), sin asumir que empieza en
      un vértice fijo. Lo único que cambia es agregar, antes de la llamada,
      una función que decida qué camino corresponde a la región 3D
      consultada (por ejemplo, qué rama de D3 seguir según el rango de y) —
      esa decisión no afecta el costo O(lg n + k): sigue habiendo una única
      búsqueda real (en el vértice que resulte elegido) y O(1) por paso.
  - level: 5
    statement: >-
      Diseña, sin escribir código, un grafo de listas de 3 vértices donde
      fractional cascading generalizado NO aplica, aunque cada vértice
      tenga grado acotado. ¿Es posible? Justifica con la condición completa
      de Applicability, no sólo con el grado.
    hints:
      - "El grado acotado es UNA de las tres condiciones (#51), no la única: revisa las otras dos en el ejercicio de nivel 1."
      - "Piensa en un grafo donde las aristas no tengan boletos hacia elementos vecinos, o donde los vértices no guarden conjuntos ordenados."
    solution: >-
      Sí es posible: basta con violar una de las otras dos condiciones
      manteniendo el grado acotado. Por ejemplo, un grafo de 3 vértices,
      cada uno con grado 2 (acotado), pero donde las aristas no llevan
      boletos precomputados hacia elementos vecinos — cada arista sólo dice
      "estos dos vértices están conectados", sin ninguna estructura que
      permita el ajuste O(1). Grado acotado por sí solo no basta: sin
      boletos en las aristas, cada paso volvería a costar una búsqueda
      completa (O(lg n) por paso, no O(1)), y la cota O(lg n + k) no se
      sostendría aunque el grafo tenga la forma correcta.
  - level: 6
    statement: >-
      Demuestra, con el argumento del profesor, por qué "grado acotado"
      significa específicamente "constante independiente de n" y no
      "constante independiente de k". Usa el contraejemplo de grado no
      acotado de examples.md para mostrar qué se rompe si esa distinción se
      ignora.
    hints:
      - "k es el número de pasos de UNA consulta (el tamaño del camino recorrido); el grado es una propiedad de CADA vértice del grafo completo, independiente de qué consulta se haga."
      - "En el contraejemplo, el grado del vértice hub crece con n (el tamaño de las listas / el número total de vecinos posibles), no con k."
    solution: >-
      k mide cuántos pasos recorre una consulta particular (el largo del
      camino), y SIEMPRE aparece como término aditivo O(k) en el costo
      final — no hay condición sobre k, puede ser cualquier valor y el
      costo sigue siendo O(lg n + k). El grado, en cambio, es una propiedad
      del GRAFO (cuántos vecinos tiene cada vértice, sin importar qué
      camino se consulte), y si ese número crece con n (como en el
      contraejemplo, donde un vértice hub pasa de 5 a 400 vecinos sobre
      listas de tamaño n=2000), el costo de CADA paso deja de ser O(1) y
      pasa a ser O(grado) — que ya no es constante. Confundir "acotado por
      una constante" con "acotado por k" oculta el problema real: un
      camino corto (k pequeño) sobre un grafo de grado no acotado sigue
      rompiendo la cota, porque el costo por paso, no el número de pasos,
      es lo que se dispara.
---

Estos ejercicios se apoyan en el grafo D4-like de `examples.md` y en el
código de `full-implementation.cpp`; si un nivel no sale, vuelve primero a
la condición completa de `Applicability` en `theory.md` — casi todo el resto
del tema es verificar esa condición o razonar sobre qué pasa si falla.
