---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Para el arreglo A = [1, 2, 3, 4], dibuja el segment tree de 4 hojas
      (combinar = suma) e identifica qué rango representa cada nodo interno.
    hints:
      - "La raíz siempre representa el rango completo [1, n]."
      - "Cada nodo interno se parte en dos mitades iguales (o casi): [l, m] y [m+1, r]."
    solution: >-
      Raíz [1,4], hijo izquierdo [1,2], hijo derecho [3,4], hojas [1,1],
      [2,2], [3,3], [4,4] — el mismo árbol de theory.md.
  - level: 2
    statement: >-
      Sobre ese mismo árbol, traza paso a paso Update(pos=4, val=10): qué
      nodos visita, en qué orden, y qué valores quedan al final.
    hints:
      - "Update baja por un único camino: en cada nodo, decide si la posición cae en la mitad izquierda o derecha."
      - "Al volver de la recursión (no al bajar) es cuando se recalcula cada nodo combinando sus dos hijos."
    solution: >-
      Camino [1,4] → [3,4] → [4,4]. Se escribe 10 en la hoja [4,4]; al
      volver, [3,4] = 3+10 = 13 y [1,4] = 3+13 = 16. [1,2], [1,1], [2,2],
      [3,3] no se tocan.
  - level: 3
    statement: >-
      Implementa Build, Update y Query para suma sobre un arreglo de
      tamaño arbitrario (no necesariamente potencia de 2), usando un arreglo
      de tamaño 4n para representar el árbol.
    hints:
      - "El nodo i tiene hijos 2i y 2i+1 si usas indexación tipo montículo."
      - "Query necesita los tres casos: sin traslape, contenido completo, traslape parcial — no te saltes ninguno."
    solution: >-
      Ver cpp/structures/segment-tree/full-implementation.cpp: build, update
      y query recursivos, con el arreglo de tamaño 4n como respaldo del
      árbol implícito.
  - level: 4
    statement: >-
      Adapta tu implementación para que combinar sea mínimo en vez de suma.
      ¿Qué dos cosas del código tienes que cambiar, y qué NO tienes que
      cambiar?
    hints:
      - "El elemento neutro de Query cambia (0 para suma, +infinito para mínimo)."
      - "La forma del árbol, Build, Update y la estructura de Query (los tres casos) no cambian: sólo la función combinar y el neutro."
    solution: >-
      Cambia combinar(a,b) = min(a,b) y el valor neutro de "sin traslape" en
      Query de 0 a +infinito. Build y Update quedan idénticos: la
      generalidad de "cualquier función asociativa" es justamente lo que
      permite este cambio sin tocar el resto.
  - level: 5
    statement: >-
      El mazo de persistencia usa este mismo Update para volver el segment
      tree persistente por path copying: en vez de mutar el nodo, se crea
      una copia y se recursa sobre ella. Diseña esa versión: ¿qué cambia en
      la firma de Update, y por qué sólo se copian O(lg n) nodos por
      versión y no todo el árbol?
    hints:
      - "Update persistente devuelve un nuevo puntero a la raíz de esa versión, en vez de modificar el nodo in-place."
      - "Los hijos que Update no visita (los que quedan fuera del camino a la hoja) se reutilizan sin copiar — son los mismos punteros que la versión anterior."
    solution: >-
      Update(nodo, l, r, pos, val) pasa a: nuevo ← copia de nodo; si l=r,
      nuevo.valor ← val; si no, nuevo.izq o nuevo.der (el que contiene a
      pos) se reemplaza por la llamada recursiva sobre el hijo original, y
      el otro hijo se copia el puntero tal cual, sin recursar. Sólo el
      camino raíz-hoja (O(lg n) nodos) se copia porque es el único con
      hijos "sustituidos"; todo lo demás son punteros compartidos con la
      versión vieja — es exactamente el diagrama de la semana 3
      (raíz→[3,4]→[4,4] en naranja, el resto compartido).
  - level: 6
    statement: >-
      El otro mazo de la semana 3 construye un segment tree sobre el EJE
      DEL TIEMPO (cada hoja es un instante t, no un dato) para dar
      retroactividad completa a cualquier problema de búsqueda
      descomponible, con overhead O(lg m). Demuestra por qué ese overhead es
      exactamente O(lg m) y no más, usando lo que ya sabes de Update y
      Query.
    hints:
      - "m es el número de operaciones (posiciones en el eje del tiempo), no el tamaño de los datos n — no los confundas."
      - "Insertar/eliminar una operación en el tiempo t es literalmente un Update de ese segment tree: ya sabes que Update cuesta O(lg m)."
      - "Si la estructura original responde una query en O(q), y evaluar la respuesta combinada del segment tree recorre O(lg m) nodos, ¿cuánto cuesta combinar esos O(lg m) resultados parciales de costo O(q) cada uno?"
    solution: >-
      Insertar/eliminar una operación en el tiempo t es un Update sobre el
      segment tree del tiempo: O(lg m) nodos tocados, cada uno O(1) —igual
      que cualquier Update de segment tree. Una consulta retroactiva en el
      tiempo t recorre el camino de O(lg m) nodos relevantes y combina sus
      resultados parciales; si cada combinación cuesta O(q) (el costo de la
      operación original), el total es O(q · lg m): el mismo argumento de
      "O(lg m) nodos por Update/Query" de esta estructura, multiplicado por
      el costo q de la operación que se está haciendo retroactiva.
---

Los niveles 5 y 6 son los dos usos reales que el curso le da a esta
estructura: persistencia por path copying y retroactividad sobre el eje del
tiempo. Si no salen, vuelve primero a Update en `operations/update.md`.
