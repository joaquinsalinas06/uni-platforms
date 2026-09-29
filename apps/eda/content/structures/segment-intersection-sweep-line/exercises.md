---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Según el material (#34), un segmento horizontal con x1 ≤ x2 se activa
      en un momento preciso respecto a x1 y se desactiva en un momento
      preciso respecto a x2. ¿Cuáles son esos dos momentos exactos?
    hints:
      - "Piensa en qué pasa si un segmento vertical cae exactamente en x1 o en x2: ¿debe contar la intersección?"
    solution: >-
      Se activa "antes de procesar el punto x1" y se desactiva "después de
      procesar el punto x2" (#34) — así un segmento vertical en x1 o x2 sí
      cuenta la intersección en ambos extremos.
  - level: 2
    statement: >-
      Traza el barrido del caso "Normal" de examples.md (H1 [1..6, y=3],
      H2 [4..7, y=5], V1 en x=4, y=[0..5]) y di cuántas intersecciones
      aporta V1 y por qué.
    hints:
      - "Lista, en orden de x, todos los eventos: activaciones, desactivaciones y el punto de V1."
      - "En x=4, ¿qué segmentos horizontales ya están activos?"
    solution: >-
      En x=4 están activos H1 (activado en x=1) y H2 (activado antes de
      procesar x=4). `RSQ(0,5)` sobre las posiciones activas da 2: V1 cruza
      a ambos.
  - level: 3
    statement: >-
      Implementa el caso simple completo (segmentos horizontales y
      verticales, sin intersecciones de la misma orientación) usando un
      Fenwick tree para el estado de activos, y verifica el resultado
      contra fuerza bruta.
    hints:
      - "El profesor da la estructura en #38 ('Segment tree o Fenwick tree'); no hace falta inventar otra."
      - "Fuerza bruta: probar todos los pares H×V y contar cuántos se cruzan en rango."
    solution: >-
      Ver `full-implementation.cpp`: cada segmento vertical hace una
      consulta RSQ sobre el Fenwick tree de posiciones activas, y el
      resultado se compara contra probar todos los pares H×V directamente.
  - level: 4
    statement: >-
      El caso simple exige "no hay intersecciones de segmentos con la misma
      orientación" (#29). Adapta la estructura para que además reporte
      cuándo dos segmentos horizontales se solapan en el mismo rango de x
      (violando esa condición), en vez de ignorarlo silenciosamente.
    hints:
      - "El Fenwick tree ya guarda +1/-1 por posición y activa; ¿qué significaría que la misma y se active dos veces sin desactivarse entre medio?"
      - "No necesitas una estructura nueva: basta con contar activaciones simultáneas en la misma y."
    solution: >-
      Se lleva un contador por posición y (no sólo activo/inactivo): si al
      activar una posición ya estaba activa, hay dos horizontales
      solapados en esa y — se reporta la violación en vez de sumarla como
      si fueran independientes, porque el caso simple no define qué hacer
      con ese conteo.
  - level: 5
    statement: >-
      Diseña, sin implementar, cómo extenderías el caso general offline
      (#40-47) a una consulta online usando persistencia (#49-51), sin usar
      la fórmula `Query(t_{x_i}, Successor(y_i))` — que el material deja sin
      definir (#50) — sino describiendo tu propio criterio explícito para
      qué versión consultar cuando x_i no coincide con ningún evento.
    hints:
      - "Cada evento de barrido produce una versión persistente vía path-copying; ¿qué versiones existen entre dos eventos consecutivos?"
      - "Piensa en 'la versión vigente en x_i' como la última versión creada antes o en x_i."
    solution: >-
      Se mantiene un arreglo ordenado de (x del evento, versión resultante).
      Para consultar en x_i, se busca por búsqueda binaria la mayor x de
      evento ≤ x_i y se usa esa versión — un criterio explícito que el
      material no da (hueco declarado en `persistent-online-query.md`), pero
      consistente con que la BBST no cambia entre eventos consecutivos.
  - level: 6
    statement: >-
      El profesor atribuye el costo del caso simple a la estructura elegida:
      "Usando un Segment tree o un Fenwick tree se puede resolver este caso
      especial en O(n log n)" (#38). Demuestra por qué ese total es
      exactamente O(n log n) y no, por ejemplo, O(n² ) ni O(n log² n),
      contando el número de eventos y el costo de cada uno.
    hints:
      - "¿Cuántos eventos totales hay? (activaciones + desactivaciones + puntos de consulta vertical)"
      - "¿Cuánto cuesta cada evento individual sobre un Fenwick tree con n posiciones?"
    solution: >-
      Hay O(n) eventos en total (cada segmento aporta a lo más 2: una
      activación/desactivación o una consulta), y cada evento cuesta O(log n)
      sobre el Fenwick tree (una actualización puntual o una consulta de
      rango, ambas O(log n) — ver fenwick-tree). El producto de O(n) eventos
      por O(log n) cada uno da exactamente O(n log n): la cota se hereda
      linealmente de la estructura, sin ningún término adicional que la
      empeore a O(n²) ni la mejore a O(n log log n).
---

Ejercicios sobre el barrido del caso simple y del caso general, siguiendo el
estilo de reducción + herencia de cota del profesor: nunca se pide derivar
una cota desde cero, siempre a partir de la estructura ya elegida.
