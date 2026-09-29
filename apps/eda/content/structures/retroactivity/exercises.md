---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor dice que persistencia y retroactividad son ideas "duales".
      De las siguientes dos afirmaciones sobre modificar el pasado, ¿cuál
      corresponde a retroactividad y cuál a persistencia? (a) "se crea una
      versión nueva; la versión presente original sigue existiendo, intacta,
      en paralelo"; (b) "el presente se actualiza para reflejar el cambio,
      como si siempre hubiera estado ahí".
    hints:
      - "Cuenta cuántas líneas de tiempo quedan vivas después del cambio en cada caso."
      - "Una de las dos crea una rama nueva; la otra no crea ninguna rama."
    solution: >-
      (a) es persistencia: el "presente original" sigue existiendo en
      paralelo, o sea hay más de una versión viva. (b) es retroactividad:
      "el presente se actualiza" implica que sólo existe una línea de
      tiempo, y ese cambio la reescribe.
  - level: 2
    statement: >-
      Sobre la línea de tiempo add(5)@1, add(3)@2, add(10)@3 (Query(ahora) =
      18), traza el efecto de Insert-retroactive(1.5, add(100)) seguido de
      Delete-retroactive(2). Da el valor de Query(ahora) después de cada
      operación.
    hints:
      - "Inserta primero: la línea de tiempo pasa a tener 4 entradas ordenadas por tiempo."
      - "Delete-retroactive(2) elimina la entrada en t=2, que es add(3)."
    solution: >-
      Después de Insert-retroactive(1.5, add(100)): línea de tiempo
      add(5)@1, add(100)@1.5, add(3)@2, add(10)@3 — Query(ahora) = 118.
      Después de Delete-retroactive(2): se retira add(3)@2 — línea de
      tiempo add(5)@1, add(100)@1.5, add(10)@3 — Query(ahora) = 115.
  - level: 3
    statement: >-
      Implementa la versión ingenua de Query(t) para una línea de tiempo de
      operaciones add(x): dado un vector de pares (tiempo, delta) y un
      tiempo de consulta t, calcula la suma de los deltas cuyo tiempo es
      menor o igual a t. No uses ninguna estructura auxiliar más allá de un
      recorrido lineal.
    hints:
      - "La línea de tiempo no necesita estar ordenada de antemano si vas a recorrerla completa de todas formas."
      - "El costo de este recorrido es exactamente el O(m) del que habla el profesor."
    solution: >-
      Recorrer el vector completo, acumulando delta en un total cada vez que
      el tiempo de la entrada es <= t, y devolver el total al final —
      exactamente el pseudocódigo derivado de Query en operations/query.md,
      con costo O(m).
  - level: 4
    statement: >-
      El modelo se definió sobre "una operación op" genérica en un tiempo t.
      Adapta la interfaz Insert-retroactive/Delete-retroactive/Query a una
      estructura distinta al contador: una pila (stack) donde las
      operaciones son push(x) y pop(). ¿Qué debería significar
      Delete-retroactive(t) cuando la operación en t es un pop()?
    hints:
      - "Piensa en qué cambia del 'estado presente' si ese pop() nunca hubiera ocurrido."
      - "El material de esta sección no cubre este caso para ninguna estructura concreta — es exactamente el tipo de hueco que retroactive-priority-queue sí resuelve, pero para colas de prioridad."
    solution: >-
      Borrar un pop() significa que el elemento que ese pop() sacó debería
      seguir en la pila en todos los tiempos posteriores a t — lo cual puede
      cambiar qué elemento sacan los pop() posteriores también. Igual que
      con la priority queue retroactiva, esto no es tan simple como "quitar
      una línea de la línea de tiempo": puede requerir recalcular pop()
      subsecuentes. El curso no desarrolla este caso para pilas; sí lo hace,
      para colas de prioridad, en retroactive-priority-queue.
  - level: 5
    statement: >-
      Diseña, en prosa, la interfaz retroactiva parcial (no completa) para
      el contador de add(x): especifica exactamente qué formas de
      Insert/Delete/Query se permiten y cuáles se prohíben, y explica en una
      frase por qué la variante parcial es más barata de soportar que la
      completa.
    hints:
      - "La tabla de theory.md dice dónde se permite cada tipo de operación bajo cada nivel."
      - "Piensa en qué tiempos tendría que poder reconstruir la estructura bajo cada variante."
    solution: >-
      Parcial: Insert(t, op) y Delete(t) se permiten en cualquier tiempo
      (incluido el pasado), pero Query(t, op) sólo se permite con t = ahora
      (el tiempo más reciente de la línea de tiempo). Es más barata porque
      sólo hay que poder responder consultas sobre el estado más reciente —
      nunca hay que poder reconstruir un estado intermedio arbitrario del
      pasado, que es justamente lo que exige la variante completa.
  - level: 6
    statement: >-
      Demuestra que, bajo la versión ingenua de las tres operaciones (tal
      como están en operations/insert-retroactive.md,
      delete-retroactive.md y query.md), el estado que devuelve Query(t) es
      siempre exactamente el que resultaría de haber ejecutado, desde el
      principio, sólo las operaciones cuyo tiempo es <= t, en orden de
      tiempo creciente — sin importar en qué orden se hayan hecho las
      llamadas a Insert-retroactive y Delete-retroactive que construyeron la
      línea de tiempo.
    hints:
      - "La línea de tiempo final sólo depende del conjunto de entradas (tiempo, operación) que sobrevivió, no del orden en que Insert/Delete se llamaron para llegar ahí."
      - "Query recorre la línea de tiempo ordenada por tiempo, así que basta mostrar que esa línea de tiempo final es la misma sin importar el historial de llamadas."
    solution: >-
      Cada Insert-retroactive(t, op) agrega la entrada (t, op) a un conjunto,
      y cada Delete-retroactive(t) la retira de ese mismo conjunto — ninguna
      de las dos depende de qué otras entradas hay ni de en qué orden se
      insertaron. Por lo tanto, después de cualquier secuencia de llamadas a
      Insert-retroactive/Delete-retroactive, el conjunto de entradas vivas
      en la línea de tiempo es exactamente el que resulta de aplicar esas
      inserciones y borrados como operaciones de conjunto (unión y
      diferencia), que son conmutativas entre llamadas con tiempos
      distintos. Query(t) sólo depende de ese conjunto final (filtrado por
      tiempo <= t) y del orden de tiempo de sus elementos — no del historial
      de llamadas que lo produjo. Luego Query(t) siempre devuelve el mismo
      resultado que ejecutar, desde cero, sólo las operaciones con tiempo <=
      t en orden creciente de tiempo. ∎
---

Ejercicios sobre el modelo y la taxonomía de retroactividad: la interfaz
Insert-retroactive/Delete-retroactive/Query y la distinción parcial/completa,
sin entrar todavía en ninguna técnica eficiente.
