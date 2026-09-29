---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      ¿Cuál de estas afirmaciones sobre el nodo de separación de D₃ es
      correcta? (a) Es siempre la raíz del árbol de rango sobre y.
      (b) Es el nodo más profundo donde los caminos de búsqueda de a2 y
      b2 todavía coinciden. (c) Es el nodo donde termina el camino de
      búsqueda de a2 solamente.
    hints:
      - "Repasa la cita del profesor: 'sus caminos coinciden hasta un nodo v_split donde se separan' (#40)."
      - "El ejemplo mínimo de examples.md muestra un caso donde SÍ es la raíz, pero eso no es siempre así — revisa el ejemplo normal."
    solution: >-
      (b) es correcta: v_split es el nodo más profundo compartido por
      ambos caminos, definido por dónde se bifurcan (#40, #45). (a) es
      falsa en general: el ejemplo normal de examples.md muestra un caso
      donde la separación ocurre más abajo. (c) es falsa: v_split
      depende de AMBOS caminos, no de uno solo.
  - level: 2
    statement: >-
      Con el árbol del ejemplo normal (raíz 6, hijos 3 y 9, nietos 1/4 y
      8/11) traza a mano la localización del nodo de separación para
      [a2,b2] = [2,9]. ¿En qué nodo se separan los caminos, y qué
      contiene derecha(v_split) e izquierda(v_split)?
    hints:
      - "En la raíz (6): compara a2=2 y b2=9 contra 6. ¿Van al mismo lado o a lados distintos?"
      - "Si van al mismo lado en la raíz, sigue bajando juntos por ese lado antes de mirar el siguiente nodo."
    solution: >-
      En la raíz (6): a2=2 ≤ 6 → izquierda; b2=9 > 6 → derecha. Ya se
      separan en la raíz: v_split = 6. derecha(v_split) = {8,9,11},
      izquierda(v_split) = {1,3,4}.
  - level: 3
    statement: >-
      Implementa localizarNodoDeSeparacion(raiz, a2, b2) en C++ siguiendo
      el pseudocódigo de locate-separation-node.md, usando el struct Node
      de step-1-node.cpp.
    hints:
      - "El bucle termina en cuanto a2 y b2 dejan de ir al mismo lado de la clave del nodo actual."
      - "Cuidado con el caso b2 <= clave(v): ese punto ya pertenece al lado izquierdo, no al derecho."
    solution: >-
      Ver step-3-locate-separation-node.cpp: desciende comparando a2 y b2
      contra la clave de cada nodo, y se detiene devolviendo el nodo
      actual en cuanto uno cae a la izquierda y el otro a la derecha (o
      coincide con la clave).
  - level: 4
    statement: >-
      Adapta la consulta de dos disparos para que, además de [x1,x2] y
      [a2,b2], acepte un tercer parámetro opcional b3 que filtre también
      z ≤ b3 sobre los puntos que sobreviven de cada satélite (sin
      construir una estructura D₃ nueva, sólo agregando el filtro extra
      al final de query.md).
    hints:
      - "No hace falta tocar build ni locate: sólo agregar un filtro más sobre el resultado ya combinado de las dos satélites."
      - "Esto es exactamente el paso que D4-bound-z formaliza como una estructura propia en vez de un filtro ad-hoc — compáralo."
    solution: >-
      Agregar, después de unir los resultados de las dos consultas
      satélite, un filtro lineal `resultado.filter(p => p.z <= b3)`. Es
      correcto pero no es lo que hace D₄: D₄ repite la misma construcción
      de D₃ un nivel más arriba (sobre z) para evitar pagar ese filtro
      lineal como O(n) — ver /structures/d4-bound-z.
  - level: 5
    statement: >-
      Diseña una prueba (sin implementarla) que verifique que, para un
      árbol de rango sobre y con n puntos, el nodo de separación
      encontrado para cualquier par (a2,b2) es efectivamente el nodo más
      profundo donde los dos caminos de búsqueda coinciden — no sólo un
      nodo donde ambas búsquedas "pasan por ahí en algún momento".
    hints:
      - "Piensa en calcular los dos caminos completos (raíz→a2 y raíz→b2) por separado, y comparar contra lo que devuelve localizarNodoDeSeparacion."
      - "La propiedad a verificar es sobre PROFUNDIDAD: el último nodo compartido antes de la primera divergencia, no cualquier ancestro común."
    solution: >-
      Recorrer independientemente el camino raíz→a2 y raíz→b2 guardando
      la secuencia de nodos visitados; encontrar el último índice donde
      ambas secuencias coinciden nodo a nodo; comparar ese nodo contra el
      resultado de localizarNodoDeSeparacion — deben ser el mismo. Esto
      es exactamente lo que hace el assert de full-implementation.cpp.
  - level: 6
    statement: >-
      Demuestra por qué el número de consultas satélite disparadas por
      D₃ es siempre exactamente 2, sin importar cuántos niveles tenga el
      árbol de rango sobre y — a diferencia de la descomposición canónica
      en y, que dispara O(lg n).
    hints:
      - "La clave es que las dos satélites viven EN v_split, no en los nodos de los caminos por debajo de él."
      - "Compara con range-query-1d de range-tree: ahí SÍ hay que agregar un subárbol canónico por cada paso de los dos caminos que bajan desde el LCA — ¿por qué D3 no necesita eso?"
    solution: >-
      En range-query-1d clásico, cada nodo de los dos caminos que bajan
      desde el LCA puede aportar un subárbol canónico completo (de ahí
      el O(lg n)), porque el árbol NO tiene satélites precomputadas por
      nodo: hay que recolectar explícitamente cada subárbol que cuelga
      del camino. D₃ evita eso precomputando, en build, las dos satélites
      (D₂ normal y D₂′ invertida) sobre TODO derecha(v) e izquierda(v)
      de cada nodo v — no sólo del nodo de separación. Por eso, una vez
      localizado v_split, ya no hace falta recolectar subárbol por
      subárbol de los caminos: las dos satélites de v_split ya cubren,
      de una sola vez, exactamente los puntos que antes se cubrían con
      O(lg n) subárboles canónicos. El costo de precomputar esas
      satélites en cada nodo (pagado en build, no en query) es lo que
      compra bajar de O(lg n) a 2 consultas por query.
---

Los tres primeros niveles se resuelven directamente con lo que ya está en
`theory.md` y en `operations/`. Los niveles 4-6 exigen razonar sobre por qué
la construcción de D₃ ahorra consultas, no sólo repetir el mecanismo.
