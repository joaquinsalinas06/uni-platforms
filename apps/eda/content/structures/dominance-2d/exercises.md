---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      ¿Cuál de estas afirmaciones describe correctamente la reformulación de
      D_1? (a) el punto se convierte en un rayo horizontal y la consulta en
      uno vertical; (b) el punto se convierte en un rayo vertical hacia
      arriba y la consulta en uno horizontal hacia la izquierda; (c) ambos se
      convierten en segmentos acotados.
    hints:
      - "Repasa la sección \"¿Qué problema resuelve?\" de la teoría: ¿hacia dónde apunta cada rayo?"
    solution: >-
      (b). El punto (y_i, z_i) se convierte en un rayo vertical hacia
      z=+∞, y la consulta (b2,b3) en un rayo horizontal hacia y=-∞ (#20).
  - level: 2
    statement: >-
      Traza ConsultaDominancia(S, b2=3, b3=6) sobre los puntos
      (1,5), (2,1), (4,4), (5,2), en el mismo estilo de la tabla de
      "Ejemplos → Normal". ¿Qué puntos se reportan y en qué orden se visitan
      las columnas?
    hints:
      - "Ordena los puntos por y antes de empezar a caminar: la caminata avanza en ese orden."
      - "La caminata se detiene apenas la columna deja de ser < b2=3, sin importar el valor de z ahí."
    solution: >-
      Columnas visitadas en orden: y=1 (z=5 > 6? no, 5≤6, se reporta),
      y=2 (z=1≤6, se reporta). La caminata se detiene al llegar a y=4,
      porque ya no es < b2=3. Resultado: {(1,5), (2,1)}, k=2.
  - level: 3
    statement: >-
      Implementa ConsultaDominancia tal como aparece en el pseudocódigo del
      profesor (#30-31), usando el modelo de columnas acumulativas de
      subdivision-build.md. Verifica tu resultado contra fuerza bruta sobre
      al menos 5 conjuntos de puntos generados al azar.
    hints:
      - "Empieza por ordenar los puntos por y: cada columna corresponde a uno de ellos, en ese orden."
      - "El full-implementation.cpp de este tema ya hace exactamente esta verificación: revísalo si te atoras."
    solution: >-
      Ver cpp/structures/dominance-2d/full-implementation.cpp: construye
      las columnas acumulativas ordenadas por y, camina reportando cada
      punto con z ≤ b3 mientras y ≤ b2, y compara el resultado contra un
      recorrido lineal de fuerza bruta.
  - level: 4
    statement: >-
      Adapta ConsultaDominancia para que, en vez de reportar los puntos
      dominados, sólo cuente cuántos hay (una consulta de "conteo de
      dominancia" en vez de "reporte de dominancia"). ¿Cambia la complejidad?
    hints:
      - "El costo O(lg n + k) viene de reportar k elementos uno por uno: ¿sigue haciendo falta visitar k caras si sólo cuentas?"
      - "Piensa en qué información tendría que guardar cada cara para responder \"cuántos puntos hay a mi izquierda\" sin visitarlos."
    solution: >-
      Si cada cara (o cada columna) guarda de antemano un contador
      acumulado de puntos reportables hasta ahí, contar se puede responder
      en O(lg n) sin recorrer las k caras — pero eso exige precomputar y
      guardar esos contadores durante subdivision-build, algo que el
      profesor no da: es una adaptación, no algo que el material resuelva.
  - level: 5
    statement: >-
      D_2 va a guardar, en cada nodo de otro árbol, una copia de D_1 sobre
      los puntos de su subárbol (#33). Diseña, a alto nivel, por qué una
      estructura "puramente geométrica sin árbol anidado" (como D_1) es más
      fácil de replicar así que un Layered Range Tree completo.
    hints:
      - "Compara qué hay que copiar: ¿un árbol completo con su fractional cascading interno, o una subdivisión plana?"
      - "Piensa en el espacio total si D_1 pesa O(n) por copia y hay O(lg n) copias, una por nivel de otro árbol."
    solution: >-
      Un Layered Range Tree completo tiene su propia estructura anidada
      (árbol + cascada); replicarlo nodo por nodo multiplicaría esa
      complejidad interna en cada copia. D_1, al ser sólo una subdivisión
      plana de O(n) segmentos, se puede instanciar una vez por nodo sin
      arrastrar un árbol dentro de otro árbol — el acoplamiento queda en
      "una subdivisión por nodo", no en "un árbol de árboles por nodo".
  - level: 6
    statement: >-
      Demuestra por qué el número de caras "vacías" visitadas por
      ConsultaDominancia no puede crecer con n, usando el grado acotado de
      la subdivisión (Chazelle, 1986) citado en subdivision-build.md.
    hints:
      - "El profesor no da la prueba de Chazelle: usa como hipótesis que cada cara tiene un número constante de vecinos."
      - "Relaciona \"grado acotado\" con \"cuántas caras vacías puede haber entre dos caras que sí reportan un punto\"."
    solution: >-
      Si cada cara tiene grado acotado por una constante c, entre dos caras
      consecutivas que reportan un punto puede haber a lo más un número
      acotado por c de caras vacías (de lo contrario, alguna cara
      intermedia tendría que tener más de c vecinos para conectar ambos
      lados). Como hay k caras que reportan, el total de caras vacías es
      O(c·k) = O(k), y no depende de n — es exactamente lo que sostiene
      la cota O(lg n + k) del profesor (#31).
---

Ejercicios de reformulación de rayos, trazado de la caminata y
composición con D_2, en el estilo output-sensitive del tema.
