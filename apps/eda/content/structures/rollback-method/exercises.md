---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor dice que el método de rollback se usa "cuando nada de lo
      anterior aplica". ¿Cuáles son las dos propiedades cuya ausencia
      obliga a usar este método en vez de la retroactividad conmutativa e
      invertible?
    hints:
      - "Revisa qué exige /structures/commutative-invertible-retroactivity."
      - "Son dos propiedades algebraicas sobre las operaciones, no sobre los datos."
    solution: >-
      Conmutatividad e invertibilidad combinadas. Si las operaciones no
      conmutan (el orden en que se aplican sí importa), no se puede usar el
      atajo "Insert(t, op) ≡ Insert(ahora, op)"; el método de rollback sólo
      exige invertibilidad, y paga el precio de la falta de conmutatividad
      rehaciendo todo en orden.
  - level: 2
    statement: >-
      Dado el log `[(t=1, +2), (t=2, +3), (t=3, −1)]` (contador final = 4),
      traza paso a paso `Insert(t=1.5, +10)`: qué se deshace, qué se aplica,
      qué se rehace, y cuál es el valor de `r`.
    hints:
      - "Ordena el log por tiempo e identifica cuántas operaciones quedan después de t=1.5."
      - "Deshacer va en orden inverso (de la más reciente a la más vieja); rehacer va en el orden original."
    solution: >-
      Operaciones posteriores a t=1.5: (t=2,+3) y (t=3,−1) → r=2. Deshacer:
      4−(−1)=5, luego 5−3=2 (estado justo después de (t=1,+2)). Aplicar:
      2+10=12. Rehacer en orden: 12+3=15, luego 15−1=14. Costo: O(2) ×
      (costo de una operación).
  - level: 3
    statement: >-
      Implementa (en pseudocódigo o C++) la función `insert_retroactivo(log,
      t, op)` que sigue exactamente los cuatro pasos del profesor: deshacer
      lo posterior a t, aplicar, rehacer. Debe funcionar sobre cualquier log
      de operaciones invertibles sobre un entero (suma).
    hints:
      - "Revisa cpp/structures/rollback-method/step-3-rollback-replay.cpp: no dupliques su lógica, adáptala."
      - "Necesitas guardar, para cada operación, tanto ella como su inversa (o poder derivarla)."
    solution: >-
      Ver full-implementation.cpp: se localiza el punto de inserción por
      tiempo, se deshacen (aplicando la inversa, en orden inverso) las
      operaciones posteriores, se inserta la nueva en el log, y se rehacen
      (aplicando la operación original, en orden) las que se habían
      deshecho.
  - level: 4
    statement: >-
      Adapta el método de rollback para que funcione también con
      `Delete(t)`: eliminar la operación que estaba en el tiempo t. ¿Qué
      cambia respecto a Insert(t, op) y qué se mantiene igual?
    hints:
      - "Delete(t) también necesita deshacer y rehacer lo posterior a t — sólo cambia el paso 3 del método."
      - "El requisito de invertibilidad de la operación que se elimina sigue siendo necesario para poder deshacerla en el paso 2."
    solution: >-
      Se mantiene igual el esquema de 4 pasos completo; lo único que cambia
      es el paso 3 ("aplicar el cambio"): en vez de insertar op en t, se
      omite la operación que estaba ahí (no se vuelve a aplicar al rehacer).
      El costo sigue siendo O(r) × (costo de una operación), con el mismo r
      = operaciones posteriores a t.
  - level: 5
    statement: >-
      Diseña (sin implementar) una estrategia que reduzca el costo cuando
      se sabe de antemano que la mayoría de las inserciones retroactivas
      ocurrirán cerca del presente, pero ocasionalmente habrá alguna cerca
      del principio de la historia. ¿Qué estructura del material de esta
      semana atacarías primero?
    hints:
      - "El método de rollback no distingue casos: es O(r) siempre. La pregunta es qué otra técnica de la semana sí lo hace mejor para casos específicos."
      - "Revisa qué problema resuelve /structures/decomposable-search-problem y qué logra /structures/retroactive-priority-queue."
    solution: >-
      Si el problema de búsqueda es descomponible, el Segment Tree sobre el
      tiempo da O(lg m) por operación sin importar dónde caiga t —
      exactamente el caso que rompe la dependencia en r del rollback. Si la
      estructura es una priority queue específicamente, retroactive-priority-queue
      da O(lg n) amortizado, mejor aún. El rollback queda como último
      recurso cuando ninguna de las dos aplica.
  - level: 6
    statement: >-
      Demuestra por qué la cota O(r) del método de rollback es, en general,
      ajustada (no se puede mejorar con este esquema) usando el argumento
      del profesor sobre las dos posiciones extremas de t.
    hints:
      - "Compara el costo cuando t está justo antes de la última operación contra cuando t está antes de la primera."
      - "El argumento no es una prueba formal de Ω(r); es un esbozo de necesidad. Basta con mostrar que el propio esquema de 4 pasos no tiene forma de evitar tocar las r operaciones posteriores."
    solution: >-
      Si t está justo antes de la última operación, r=1 y el costo es
      mínimo; si t está antes de la primera, r=m (todo el log) y el costo
      es máximo — el mismo esquema de 4 pasos, sin ningún atajo posible
      dentro del método, procesa cada una de las r operaciones posteriores
      exactamente una vez al deshacer y una vez al rehacer, así que el
      costo no puede bajar de O(r) sin cambiar de técnica (lo que hacen las
      secciones siguientes explotando propiedades específicas del
      problema).
---

El profesor no trae ejercicios propios para esta sección; los siguientes
están derivados del pseudocódigo y del análisis dados (páginas 38-44).
