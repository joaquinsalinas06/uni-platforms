---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      ¿Cuál de estas afirmaciones sobre nodos gordos es correcta?
      (a) El registro de modificaciones de un nodo crece sin límite a
      medida que se escribe sobre él.
      (b) Leer un campo en una versión pasada recorre el registro de la
      entrada más antigua a la más reciente.
      (c) El registro tiene tamaño acotado por 2p, con p el número máximo
      de punteros entrantes al nodo.
    hints:
      - "Revisa qué hace O(1) a la lectura según la página 24: '¿por qué el registro tiene tamaño acotado?'."
      - "El orden de recorrido está en el texto del profesor: 'de más reciente a más antigua'."
    solution: >-
      (c) es correcta: el registro tiene tamaño acotado por 2p (páginas
      25-26), y ese límite es justamente lo que dispara node-split cuando
      se llena. (a) es falsa: si creciera sin límite, leer dejaría de ser
      O(1). (b) es falsa: el profesor especifica el orden contrario, "de
      más reciente a más antigua" (página 24).
  - level: 2
    statement: >-
      Traza a mano las lecturas de un nodo n con p = 2 (registro máximo
      de 4 entradas). n nace en t=0 con valor=5. Se escribe valor=6 en
      t=2, valor=7 en t=5 y valor=8 en t=9. ¿Qué devuelve
      leerCampo(n, valor, t) para t = 0, 1, 2, 4, 5, 8 y 9?
    hints:
      - "Para cada t, busca la entrada más reciente del registro con tiempo <= t; si ninguna aplica, usa el valor original."
      - "t=1 y t=4 caen ENTRE dos escrituras: ¿cuál de las dos entradas tiene el tiempo más reciente que sigue siendo <= t?"
    solution: >-
      t=0: 5 (valor original, ninguna entrada tiene tiempo <= 0).
      t=1: 5 (la entrada de t=2 no aplica todavía; sigue siendo el
      original). t=2: 6 (la entrada exacta). t=4: 6 (la más reciente con
      tiempo <= 4 sigue siendo la de t=2). t=5: 7. t=8: 7 (la de t=9
      todavía no aplica). t=9: 8.
  - level: 3
    statement: >-
      Implementa escribirCampo(nodo, campo, valor, t) en C++ siguiendo la
      firma de step-3-write-field.cpp: SOLO el caso con espacio (asume
      node->log.size() < MAX_LOG como precondición, sin manejar el split
      todavía).
    hints:
      - "Es literalmente agregar una tupla (campo, valor, t) al final de node->log — no hay lógica adicional en este caso."
      - "Si el campo es Next (un puntero), recuerda actualizar el bookkeeping de incoming: quitar el registro del destino viejo y agregarlo al nuevo (untrackIncoming / trackIncoming)."
      - "Compara tu solución contra writeFieldNoSplit en step-3-write-field.cpp antes de mirarla completa."
    solution: >-
      FatNode* writeFieldNoSplit(FatNode* node, Field field, int intVal,
      FatNode* ptrVal, long t) { if (field == Field::Next) {
      untrackIncoming(readNext(node, t), node, Field::Next);
      trackIncoming(ptrVal, node, Field::Next); }
      node->log.push_back({field, t, intVal, ptrVal}); return node; } —
      exactamente lo que hace la rama "con espacio" de writeField en
      full-implementation.cpp.
  - level: 4
    statement: >-
      Adapta la técnica de nodos gordos al ejercicio del propio mazo
      (páginas 34-35): un BST con persistencia parcial. La pista del
      profesor es que en un BST cada nodo tiene a lo más p=1 padre
      apuntándolo (más, quizás, un puntero externo a la raíz de cada
      versión). ¿Qué cambia y qué se simplifica respecto al caso general
      con p arbitrario?
    hints:
      - "Con p=1, node-split solo tiene UN predecesor que redirigir — ¿qué término del análisis de potencial se vuelve trivial?"
      - "Piensa en qué campos tiene un nodo de BST (llave, izquierdo, derecho) frente a los dos campos genéricos (value, next) de esta implementación: ¿cuántos registros por nodo hacen falta?"
      - "El puntero externo a la raíz de cada versión también necesita su propio 'registro' — trátalo como un campo más, con su propio historial."
    solution: >-
      Con p=1, cada nodeSplit redirige exactamente un predecesor (el
      padre en el BST, o el puntero externo a la raíz si el nodo dividido
      es la raíz de esa versión): el término O(p) del costo real se
      vuelve O(1) directo, y ΔΦ_redirect <= +p se vuelve <= +1 — el caso
      más simple posible de aplicar el teorema, tal como dice la pista
      del profesor. Cada nodo de BST necesita tres campos con su propio
      registro acotado: llave, izquierdo y derecho (en vez de los dos
      genéricos value/next de esta implementación), y el puntero externo
      a la raíz de cada versión se modela igual que cualquier otro campo
      con su historial (ver "Casos límite" de node-split.md).
  - level: 5
    statement: >-
      Diseña, a partir de la sola cota que da el profesor ("O(1)
      amortizado por operación", páginas 44-45, sin desarrollar la
      mecánica), qué decisión tendría que tomar node-split en la versión
      BIDIRECCIONAL cuando uno de los p predecesores de un nodo n también
      necesita decidir en cuál de sus dos registros (adelante/atrás) cae
      la redirección.
    hints:
      - "Recuerda que en la versión bidireccional cada nodo compara su posición con la del predecesor usando la linearización del árbol de versiones (paréntesis (i / )i)."
      - "Si el predecesor fue creado ANTES (en el árbol de versiones) que el momento del split, ¿en cuál de sus dos registros cabría naturalmente la redirección?"
      - "El mazo no resuelve esto (es una de las ausencias declaradas): tu diseño debe apoyarse solo en lo que las otras cuatro operaciones ya establecen, no en una fuente externa."
    solution: >-
      Una propuesta razonable, consistente con lo que el mazo SÍ da: si
      el tiempo del split queda "adelante" del predecesor en el árbol de
      versiones (según la comparación O(1) de la estructura de
      mantenimiento de orden), la redirección se agrega a logAdelante del
      predecesor, igual que en el caso unidireccional; si queda "atrás"
      (el predecesor es, en el árbol de versiones, una rama creada
      después del punto donde se hizo el split), se agrega a logAtrás.
      Esto es una EXTENSIÓN razonada, no algo que el mazo confirme: la
      fuente explícitamente no da la mecánica del "split más delicado",
      así que cualquier solución aquí debe presentarse como diseño
      propio, no como hecho del curso.
  - level: 6
    statement: >-
      Demuestra, usando el método del potencial con
      Phi = suma sobre nodos de las entradas usadas en su registro, que
      el costo amortizado de node-split es O(1), incluyendo el caso
      límite de p en su máximo permitido por hipótesis.
    hints:
      - "El costo real de un split con p predecesores es O(1) (nodo nuevo) + O(p) (p redirecciones, cada una O(1))."
      - "El registro del nodo viejo pasa de 2p entradas usadas a 0: ¿cuánto vale ese término de DeltaPhi?"
      - "Cada redirección agrega A LO MÁS una entrada al registro de su predecesor: acota ese término por separado antes de sumarlo."
    solution: >-
      Costo real: c_i = O(1) + O(p) = O(p) (creación del nodo nuevo más p
      redirecciones, cada una O(1)). Cambio de potencial: el registro del
      nodo viejo pasa de sus 2p entradas usadas a 0, así que
      DeltaPhi_split = -2p; cada una de las p redirecciones agrega a lo
      más 1 entrada nueva al registro de su predecesor, así que
      DeltaPhi_redirect <= +p. El cambio total de potencial es
      DeltaPhi <= -2p + p = -p. El costo amortizado:
      c_i^ = c_i + DeltaPhi = O(p) + (-p) = O(p) - p. Como p = O(1) por
      hipótesis del teorema (una constante fija, no una cantidad que
      crece con n), O(p) - p es también O(1): el término -p cancela
      exactamente la parte que crecía con p en el costo real, dejando
      una constante — válido para cualquier p entre 1 y su máximo
      permitido, incluyendo el caso límite de p en su cota superior.
---

Seis niveles: 1 reconocer el invariante del registro acotado, 2 trazar
lecturas en versiones intermedias, 3 implementar write-field (caso con
espacio), 4 adaptar la técnica al ejercicio del BST con p=1 que da el
propio mazo, 5 diseñar la parte del split bidireccional que el mazo
declara pero no desarrolla, 6 demostrar con el método del potencial la
cota O(1) amortizada de node-split.
