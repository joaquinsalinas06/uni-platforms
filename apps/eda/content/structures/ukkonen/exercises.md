---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  label: reconocer
  statement: >-
    ¿Qué significa que una fase termine con una regla 3, y por qué no hace falta revisar los sufijos más cortos?
  hints:
  - >-
    La regla 3 dice que el sufijo, con la letra nueva, ya existe en el árbol.
  - >-
    Si $x\alpha c$ aparece en el texto, ¿aparece también $\alpha c$?
  solution: >-
    La regla 3 ocurre cuando el sufijo pendiente más largo ya continúa con $c$: no hay nada que insertar. Todos los sufijos más cortos son sufijos de éste, así que también continúan con $c$ y también están. Por eso la fase termina; quedan como pendientes (resto) para fases futuras.
- level: 2
  label: trazar
  statement: >-
    Para $S = \mathtt{abcabxabcd}$ da resto y el punto activo al final de las fases 3, 4, 7 y 8.
  hints:
  - >-
    En las fases 3 y 4 las letras a, b ya están al inicio de la arista abc….
  - >-
    En la fase 8 la longitud activa iguala el largo de la arista ab.
  solution: >-
    Fase 3: resto 1, (raíz, a, 1). Fase 4: resto 2, (raíz, a, 2). Fase 7: resto 2, (raíz, a, 2), al final de la arista ab. Fase 8: skip/count baja al nodo ab y la c existe: resto 3, (ab, c, 1).
- level: 3
  label: resolver
  statement: >-
    En la fase 9 de la traza ($c = \mathtt d$) se crean tres internos. Indica en qué orden, qué suffix link se sigue entre uno y otro y qué enlaces nuevos se crean.
  hints:
  - >-
    Se empieza en (ab, c, 1).
  - >-
    Cada interno nuevo se enlaza con el siguiente que se cree.
  solution: >-
    Primero nace abc (desde ab, tras abc sigue a, no d) con la hoja 6. Se sigue el link ab → b: nace bc con la hoja 7 y el link abc → bc. Se sigue el link b → raíz: con longitud activa 1 en la arista c nace c con la hoja 8 y el link bc → c. Por último la hoja 9 desde la raíz; el link de c va a la raíz.
- level: 4
  label: adaptar
  statement: >-
    ¿Qué cambia si se olvida el truco de las aristas abiertas? Da el costo resultante en el peor caso.
  hints:
  - >-
    Sin aristas abiertas, la regla 1 actualiza cada hoja en cada fase.
  - >-
    ¿Cuántas hojas hay en la fase $i$?
  solution: >-
    Cada fase tendría que alargar explícitamente todas las hojas existentes: en la fase $i$ hay hasta $i$ hojas, y el total es $\sum_i i = \Theta(n^2)$. Con aristas abiertas (fin = final actual) la regla 1 no cuesta nada.
- level: 5
  label: diseñar
  statement: >-
    Se recibe un texto carácter por carácter y, tras cada uno, se quiere saber si un patrón $P$ aparece en lo leído. Explica por qué Ukkonen es adecuado y cuánto cuesta cada consulta.
  hints:
  - >-
    Tras cada fase el árbol (implícito) representa todas las subcadenas del prefijo leído.
  - >-
    Una búsqueda baja por el árbol comparando letras.
  solution: >-
    Ukkonen es en línea: tras la fase $i$ el árbol implícito contiene todas las subcadenas de $\mathrm{Pref}(S, i)$ (aunque algunos sufijos no tengan hoja propia, sus caminos existen). Buscar $P$ bajando desde la raíz cuesta $O(\lvert P\rvert)$, y mantener el árbol cuesta $O(1)$ amortizado por carácter.
- level: 6
  label: demostrar
  statement: >-
    Demuestra que el número total de reglas 2 y 3 en toda la construcción es $O(n)$.
  hints:
  - >-
    Las hojas nunca desaparecen.
  - >-
    ¿Cuántas reglas 3 puede haber en una fase?
  solution: >-
    Cada regla 2 crea una hoja y las hojas nunca se borran ni se fusionan; al final hay $n+1$ hojas, así que hay a lo más $n + 1$ reglas 2. Una regla 3 termina la fase, así que hay a lo más una por fase: $\le n + 1$. En total $O(n)$.
---

Antes de abrir una pista, escribe resto y el punto activo de la fase anterior.
