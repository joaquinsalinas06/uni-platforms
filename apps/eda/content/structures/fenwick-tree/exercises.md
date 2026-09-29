---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Para i = 12 (binario 1100), calcula lowbit(i) y di qué rango cubre
      tree[12].
    hints:
      - "lowbit(i) = i & (-i): aísla el bit 1 más bajo."
      - "El rango que cubre tree[i] es (i - lowbit(i), i]."
    solution: >-
      lowbit(12) = 4 (1100 & 0100 = 0100). tree[12] cubre (8, 12].
  - level: 2
    statement: >-
      Sobre un arreglo de n=8, traza Update(i=5, delta=+3): qué posiciones
      de tree toca, en qué orden.
    hints:
      - "Sube con i += lowbit(i) hasta pasar n."
      - "lowbit(5)=1, así que el primer salto es pequeño."
    solution: >-
      5 (lowbit=1) → 6 (lowbit=2) → 8 (lowbit=8) → 16 (>8, termina).
      Toca tree[5], tree[6], tree[8].
  - level: 3
    statement: >-
      Implementa Update y Prefix-query sobre un arreglo, e inicializa tree
      con n llamadas a Update en vez de un Build separado (Fenwick no lo
      necesita).
    hints:
      - "tree se inicializa en 0 y cada Update(i, A[i]) lo deja consistente."
      - "No hay recursión: ambas operaciones son un ciclo con lowbit."
    solution: >-
      Ver cpp/structures/fenwick-tree/full-implementation.cpp: update y
      prefix_query iterativos, con inicialización vía n updates.
  - level: 4
    statement: >-
      Adapta Prefix-query para responder suma de rango(l, r). ¿Por qué esta
      adaptación SÍ funciona para suma pero NO funcionaría si la operación
      fuera mínimo?
    hints:
      - "suma(l,r) = PrefixQuery(r) - PrefixQuery(l-1)."
      - "Esa resta necesita que la operación tenga inversa: sumar y luego restar deshace exactamente el efecto de lo que sobra."
    solution: >-
      suma(l,r) = PrefixQuery(r) - PrefixQuery(l-1) porque la suma es
      invertible: restar el prefijo sobrante lo cancela exactamente. Con
      mínimo no hay forma de "quitar" el mínimo de un prefijo más chico del
      mínimo de uno más grande — no existe la operación inversa, así que la
      misma adaptación no tiene sentido.
  - level: 5
    statement: >-
      El profesor ofrece Segment tree o Fenwick tree para el caso simple del
      barrido (segmentos horizontales/verticales, sin intersecciones de la
      misma orientación, #38). Diseña el argumento de por qué el Fenwick
      tree alcanza ahí y qué tendría que cambiar en el problema para que
      dejara de alcanzar.
    hints:
      - "La operación que necesita el barrido en el caso simple es contar posiciones activas: una suma de indicadores 0/1 (#37)."
      - "Fenwick sólo pierde frente a segment tree cuando la operación de combinación deja de ser invertible."
    solution: >-
      El caso simple sólo necesita sumar indicadores (contar activos en un
      rango), y suma es invertible: Fenwick alcanza con menos memoria y
      menos código que un segment tree. Dejaría de alcanzar si el problema
      pidiera, por ejemplo, la altura máxima activa en el rango en vez del
      conteo — mínimo/máximo no son invertibles, y ahí sólo el segment tree
      (con combine = min o max) sirve.
  - level: 6
    statement: >-
      Demuestra por qué ninguna adaptación de Update/Prefix-query puede dar
      O(lg n) para "máximo de un prefijo" con el mismo arreglo tree de
      Fenwick, usando lo que ya sabes de por qué la resta de prefijos
      funciona para suma.
    hints:
      - "El argumento de la suma depende de que sumar y restar sean operaciones inversas exactas: A + B - B = A."
      - "Para que tree[j] siga sirviendo tras un Update, hace falta poder deshacer el efecto del valor viejo en cada rango que lo incluye."
    solution: >-
      Prefix-query para suma funciona porque combinar rangos y luego restar
      el sobrante es exacto (A+B-B=A): cada tree[j] puede "olvidar" un
      valor viejo restándolo. Para máximo no existe esa operación inversa:
      si tree[j] = max(rango) y se actualiza un elemento que no era el
      máximo, no hay forma de recalcular tree[j] sin volver a mirar todo el
      rango que cubre — se pierde la garantía de O(lg n) por Update, que es
      precisamente la restricción "sólo funciones invertibles" de la tabla
      en theory.md.
---

Los niveles 5 y 6 son la pregunta central de este tema: por qué el profesor
nombra Fenwick al lado del segment tree, y dónde deja de servir. Si no
salen, vuelve a la tabla de comparación en `theory.md`.
