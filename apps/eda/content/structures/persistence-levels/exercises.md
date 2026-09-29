---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor da cuatro nombres: parcial, total (full), confluente y
      funcional. ¿Cuál de los cuatro NO es un nivel de persistencia, sino
      otra cosa? ¿Qué es entonces?
    hints:
      - "Tres de los cuatro se definen por la forma del grafo de versiones (línea, árbol, DAG). El cuarto no encaja en esa lista."
      - "El mazo lo aclara explícitamente en la página 19."
    solution: >-
      Funcional no es un nivel de persistencia: es una técnica de
      implementación. La estructura nunca modifica un nodo existente, sólo
      crea nodos nuevos, y con esa técnica se puede lograr cualquiera de los
      otros tres niveles (parcial, total o confluente), típicamente a costo
      de un poco más de espacio.
  - level: 2
    statement: >-
      Traza el grafo de versiones que resulta de esta secuencia sobre una
      estructura con persistencia TOTAL: crear v0; set sobre v0 produce v1;
      set sobre v0 (otra vez) produce v2; set sobre v1 produce v3. Dibuja el
      grafo (quién es padre de quién) y di qué forma tiene.
    hints:
      - "Total permite escribir sobre cualquier versión, no sólo la última — v0 puede tener más de un hijo."
      - "v3 es hija de v1, no de v0: sigue la cadena de 'sobre cuál se aplicó cada set'."
    solution: >-
      v0 es padre de v1 y de v2 (dos escrituras distintas sobre v0); v1 es
      padre de v3. El grafo es un árbol: v0 con dos hijos (v1, v2), y v1 con
      un hijo (v3). Esto NO sería posible en persistencia parcial, porque ahí
      sólo se puede escribir sobre la versión más reciente — una vez creada
      v1, parcial no permitiría volver a escribir sobre v0 para producir v2.
  - level: 3
    statement: >-
      Implementa en C++ una función que, dado un vector de pares
      `(version_padre, version_creada)` que describe cómo se construyó cada
      versión, determine si la secuencia es consistente con persistencia
      PARCIAL (cada padre debe ser exactamente "la versión más reciente en
      el momento de la escritura", es decir, el padre de la versión i debe
      ser i−1) o si en cambio necesita TOTAL (algún padre no es la versión
      inmediatamente anterior).
    hints:
      - "En parcial, la versión i siempre tiene como padre a la versión i−1: recórrela y compara."
      - "Basta con un solo par (padre, hijo) donde padre != hijo - 1 para que la secuencia ya no sea parcial."
    solution: >-
      `bool es_parcial(const std::vector<std::pair<int,int>>& historial) {
      for (auto& [padre, hijo] : historial) if (padre != hijo - 1) return
      false; return true; }` — si todas las escrituras respetan que el padre
      es exactamente la versión anterior, la secuencia cabe en parcial; en
      cuanto una escritura tiene un padre distinto (una rama), hace falta
      total.
  - level: 4
    statement: >-
      Un editor de texto guarda cada cambio como una nueva versión y permite
      "deshacer" (volver a una versión anterior) y seguir editando desde ahí,
      generando una rama nueva que coexiste con la rama que se abandonó. No
      se pide nunca juntar dos ramas en un solo documento. ¿Qué nivel de
      persistencia necesita este editor, y por qué NO alcanza con el nivel
      inmediatamente más simple?
    hints:
      - "'Volver a una versión anterior y seguir editando desde ahí' crea una segunda escritura sobre una versión que ya tenía un hijo: ¿eso lo permite parcial?"
      - "Compara con la definición textual de parcial: 'sólo se puede actualizar la versión más reciente'."
    solution: >-
      Necesita persistencia TOTAL. Parcial no alcanza porque parcial sólo
      permite escribir sobre la versión más reciente; en cuanto el editor
      "deshace" y edita desde una versión vieja que ya tiene una rama hija
      posterior, está escribiendo sobre una versión que ya no es la más
      reciente — eso es exactamente lo que total permite (y lo que hace que
      el grafo de versiones sea un árbol, no una línea) y parcial prohíbe.
      Confluente sería más de lo necesario: nunca se pide fusionar dos ramas.
  - level: 5
    statement: >-
      Diseña (en prosa, sin código) un escenario de control de versiones
      donde el nivel de persistencia mínimo necesario sea CONFLUENTE, y
      explica en una frase por qué ni parcial ni total alcanzan. No repitas
      el ejemplo de merge de examples.md — usa un dominio distinto.
    hints:
      - "Confluente es el único nivel donde una versión puede tener DOS padres. Busca un dominio donde eso sea natural: ¿qué operación junta dos historiales en uno?"
      - "Piensa en algo como 'fusionar dos carritos de compra de la misma cuenta abiertos en dos dispositivos distintos'."
    solution: >-
      Ejemplo válido: dos usuarios editan copias independientes del mismo
      documento colaborativo (cada copia es una rama propia, válida bajo
      total) y luego se pide combinar ambas ediciones en un documento final
      que contenga los cambios de los dos. Ni parcial ni total alcanzan
      porque ambos exigen que cada versión tenga a lo más un padre; la
      versión combinada necesita dos padres (una arista desde cada rama), y
      eso convierte el grafo de versiones en un DAG — la definición misma de
      confluente.
  - level: 6
    statement: >-
      Demuestra que persistencia total es estrictamente más general que
      persistencia parcial: es decir, (a) toda secuencia de operaciones
      válida bajo persistencia parcial también es válida bajo persistencia
      total, y (b) existe al menos una secuencia válida bajo total que NO es
      válida bajo parcial. Usa las definiciones del profesor, no ejemplos
      numéricos sueltos.
    hints:
      - "Para (a): la restricción de parcial ('sólo la versión más reciente') es un caso particular de la de total ('cualquier versión') — cualquier secuencia que cumpla la restricción más fuerte cumple la más débil."
      - "Para (b): basta un contraejemplo, como el del ejercicio de nivel 2 (dos escrituras distintas sobre v0)."
    solution: >-
      (a) La definición de parcial dice que cada escritura debe aplicarse
      sobre la versión más reciente; la de total dice que cada escritura
      puede aplicarse sobre cualquier versión. "La versión más reciente" es
      un caso particular de "cualquier versión", así que toda secuencia
      donde cada escritura respeta la restricción de parcial respeta
      trivialmente la restricción de total (es un subconjunto de las
      escrituras permitidas). (b) La secuencia del ejercicio de nivel 2 —
      dos escrituras distintas sobre v0, produciendo v1 y v2 como hijos
      independientes de v0 — es válida bajo total (escribe sobre cualquier
      versión) pero no bajo parcial (la segunda escritura, sobre v0, ya no es
      la versión más reciente una vez que existe v1). Por (a) y (b), total
      contiene estrictamente a parcial: todo lo que resuelve parcial lo
      resuelve total, pero no al revés.
---

Los niveles 4 y 5 son de decisión: dado un problema, identificar qué nivel de
persistencia hace falta y por qué el nivel inmediatamente más simple no
alcanza — es el tipo de pregunta que se espera en la evaluación.
