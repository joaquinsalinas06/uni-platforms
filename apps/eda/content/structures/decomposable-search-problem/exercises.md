---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor lista cuatro problemas descomponibles: mínimo, máximo,
      suma y "existe un elemento con propiedad P". Para cada uno, ¿cuál es
      su función f de combinación?
    hints:
      - "Revisa la tabla de la sección Estructura interna: f = mín, máx, +, ∨."
    solution: >-
      Mínimo → f = mín; Máximo → f = máx; Suma → f = +; Existencia →
      f = ∨ (el resultado sobre A∪B es "sí" si existe en A o existe en B).
  - level: 2
    statement: >-
      Sobre el árbol de 4 hojas de examples.md (f = suma, m = 4, inicialmente
      todo en 0), traza qué nodos se actualizan y con qué valores al hacer
      Insert(t=4, op) con efecto +3, y luego calcula Query(t=4).
    hints:
      - "El camino de Update va de la raíz [1,4] al hijo derecho [3,4] y de ahí a la hoja [4,4] — nunca toca [1,2]."
      - "Query(t=4) pide el rango [1,4] completo: coincide con la raíz, no hace falta descomponerlo en más nodos."
    solution: >-
      Update: se escribe 3 en [4,4]; se recalcula [3,4] = 0 + 3 = 3; se
      recalcula [1,4] = 0 + 3 = 3. [1,2] y [1,1], [2,2], [3,3] no se tocan.
      Query(t=4) pide [1,4], que es exactamente el rango de la raíz: la
      respuesta es valor(raíz) = 3, sin descomponer en más nodos.
  - level: 3
    statement: >-
      Implementa InsertRetroactive(t, delta) sobre un segment tree de suma
      con m posiciones fijas, reutilizando el Update de segment tree que ya
      conoces (no lo reescribas desde cero: adapta la firma).
    hints:
      - "Es literalmente Update(raíz, 1, m, t, valor_actual[t] + delta) si permites acumular, o Update(raíz, 1, m, t, delta) si cada slot guarda un único operando activo."
      - "Guarda en una estructura auxiliar (arreglo o mapa) el valor actualmente activo en cada t, para poder invertirlo en Delete."
    solution: >-
      InsertRetroactive(t, delta): activo[t] += delta; Update(raíz, 1, m, t,
      activo[t]). Es el mismo Update de segment tree; lo único nuevo es
      llevar activo[] aparte para poder invertir la operación en Delete sin
      tener que recordar qué valor había antes en la hoja.
  - level: 4
    statement: >-
      Adapta el mismo segment tree sobre el tiempo, pero ahora con f = máx
      en vez de f = suma, para responder "¿cuál fue el valor máximo
      insertado hasta el tiempo t?" de forma retroactiva. ¿Qué cambia y qué
      no cambia respecto al caso de suma?
    hints:
      - "El Update y el Query estructurales (qué nodos se tocan, qué rango se descompone) no cambian: sólo cambia la función combinar y el elemento neutro."
      - "El neutro de máx no es 0: piensa qué valor no puede alterar nunca un máximo (p. ej. -∞, o un centinela si los valores son enteros acotados)."
    solution: >-
      No cambia el árbol, ni qué nodos toca Update (O(lg m)), ni cómo Query
      descompone el rango en nodos canónicos (O(lg m)). Sólo cambian dos
      cosas: combinar(a,b) = máx(a,b) en vez de a+b, y el elemento neutro
      pasa de 0 a -∞ (o el mínimo representable), porque es el valor que no
      afecta ningún máx. Delete(t) ahora no puede simplemente "restar": hay
      que volver a poner el neutro (-∞) en esa hoja, perdiendo el valor que
      tenía — consistente con que máx no es invertible como sí lo es +.
  - level: 5
    statement: >-
      Diseña, sin escribir código, cómo darías retroactividad completa a
      "¿cuántos elementos distintos hay insertados hasta el tiempo t?"
      (cardinalidad de un conjunto bajo inserciones/eliminaciones
      retroactivas). ¿Es descomponible con f en O(1)? Justifica antes de
      construir el árbol.
    hints:
      - "Prueba primero con un contraejemplo numérico: A = {1,2}, B = {2,3}. ¿|A∪B| se puede obtener de |A| y |B| solos, sin más información?"
      - "Compara con el contraejemplo de Delete-Min: el problema es que la combinación depende de qué hay dentro de A y B, no sólo de un resumen agregado."
    solution: >-
      No es descomponible en general: |A∪B| = |A| + |B| - |A∩B|, y |A∩B| no
      se puede calcular a partir únicamente de |A| y |B| (con A={1,2},
      B={2,3}: |A|=2, |B|=2, pero |A∪B|=3, no 4). f tendría que conocer los
      elementos, no sólo el conteo, así que no hay f en O(1) sobre los
      resúmenes "cardinalidad". El segment tree sobre el tiempo de este tema
      no aplica directamente aquí, igual que no aplica a Delete-Min.
  - level: 6
    statement: >-
      Demuestra por qué el overhead de este método es multiplicativo y no
      aditivo: si la estructura original responde una consulta en O(q),
      explica con el argumento del profesor por qué la versión retroactiva
      da O(q · lg m) y no O(q + lg m).
    hints:
      - "Cuenta cuántas veces se invoca el costo O(q) de la estructura original durante una sola Query retroactiva."
      - "El Query de segment tree visita O(lg m) nodos canónicos; en cada uno hay que combinar/reconstruir usando la estructura original."
    solution: >-
      Query retroactiva desciende por O(lg m) nodos canónicos del segment
      tree sobre el tiempo (el mismo argumento de /structures/segment-tree#query).
      En cada uno de esos O(lg m) nodos se paga el costo O(q) de la
      estructura original para combinar o reconstruir su resultado local —
      no una sola vez, sino una vez POR NODO visitado. Por eso el total es
      O(lg m) invocaciones × O(q) cada una = O(q · lg m), multiplicativo: el
      costo original no se paga aparte del recorrido del árbol, se paga
      dentro de cada paso del recorrido.
---

Si algún nivel no sale, vuelve a la sección "Estructura interna" de
theory.md — la condición de descomponibilidad y el invariante del segment
tree sobre el tiempo son la base de los seis niveles.
