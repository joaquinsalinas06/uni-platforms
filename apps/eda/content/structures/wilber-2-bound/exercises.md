---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      ¿Qué significa que un punto anterior sea *visible* desde $p$, y qué se cuenta de los puntos visibles?
    hints:
      - "Piensa en el rectángulo entre p y ese punto."
      - "Se ordenan por tiempo decreciente y se mira cómo cambia el lado."
    solution: >-
      Un punto anterior es visible desde p si el rectángulo que forma con p no contiene ningún otro punto de la entrada. De los visibles, ordenados por tiempo decreciente, se cuentan las alternancias
      de signo de su posición relativa a p (izquierda o derecha). La suma sobre todos los p es la cota Wilber-2.
  - level: 2
    statement: >-
      Calcula Wilber-2 para la secuencia $2, 4, 1, 3$.
    hints:
      - "Revisa punto por punto; el punto (3, 4) es el único con 3 visibles previos."
      - "Dibuja los cuatro puntos: (2,1), (4,2), (1,3), (3,4)."
    solution: >-
      Puntos (2,1), (4,2), (1,3), (3,4). Para (3,4): visibles en tiempo decreciente: (1,3) a la izquierda (−), (4,2) a la derecha (+; su rectángulo con (3,4) es [3,4]x[2,4], sin otro punto), (2,1) a la izquierda
      (−; rectángulo [2,3]x[1,4], sin otro punto). Signos − + −: 2 alternancias. Para (1,3): visibles (4,2) (+) y (2,1) (+): ninguna alternancia. Los demás tienen a lo sumo un visible. Wilber-2 = 2.
  - level: 3
    statement: >-
      Ejecuta mentalmente el código `wilber2` sobre $3, 1, 4, 2$ y explica qué hace la variable `signo_ant`.
    hints:
      - "signo_ant guarda el signo del último visible considerado."
      - "Se cuenta una alternancia cuando el signo nuevo difiere del anterior."
    solution: >-
      Para t = 4 (k = 2) recorre s = 3, 2, 1: k2 = 4 (+, visible), k2 = 1 (−, visible, alterna), k2 = 3 (+, visible, alterna). total = 2. signo_ant recuerda el signo del último visible, de modo que se cuenta una
      alternancia exactamente cuando cambia. Para t = 2, 3 hay a lo sumo un visible o ninguna alternancia.
  - level: 4
    statement: >-
      Adapta `wilber2` para que devuelva el vector de alternancias por acceso (en vez del total) y úsalo para encontrar qué acceso aporta más en $3, 1, 4, 2$.
    hints:
      - "Guarda el contador local de cada t en un vector."
      - "Antes de sumar, imprime t y su contador."
    solution: >-
      Basta inicializar vector<int> por_t(m + 1, 0) y hacer por_t[t]++ en lugar de total++. Resultado para 3, 1, 4, 2: por_t = {0, 0, 0, 2}: sólo el acceso del tiempo 4 aporta, con 2 alternancias.
  - level: 5
    statement: >-
      Diseña una secuencia de $2k$ accesos para la que Wilber-2 sea al menos $k$ y explica por qué las alternancias se producen.
    hints:
      - "Cada acceso debe 'ver' a sus vecinos temporales de ambos lados alternadamente."
      - "Prueba con una secuencia que alterne entre extremos: 1, n, 2, n-1, ..."
    solution: >-
      Una secuencia que alterna entre los extremos y converge hacia el centro, por ejemplo 1, 8, 2, 7, 3, 6, 4, 5: cada nuevo acceso, mirando hacia atrás, ve primero el de su lado y luego el lado opuesto, y los visibles
      se alternan. (Verificable con el código; el valor concreto depende de la secuencia.) La razón: los accesos previos quedan repartidos a ambos lados del nuevo y ninguno tapa a otro.
  - level: 6
    statement: >-
      Demuestra que Wilber-2 de una secuencia que accede siempre a la **misma** llave es 0, y que el de una secuencia estrictamente creciente $1, 2, \dots, n$ también es 0.
    hints:
      - "En la primera, los puntos están en la misma columna: sin rectángulo."
      - "En la segunda, para cada p sólo el inmediato anterior es visible."
    solution: >-
      Misma llave: todos los puntos anteriores tienen la misma coordenada de llave que p y no forman rectángulo no degenerado; el código los descarta (k2 == k), así que no hay visibles ni alternancias. Creciente: para p = (t, t), el punto
      (t−1, t−1) es visible; cualquier (s, s) con s < t − 1 tiene al punto (t−1, t−1) dentro del rectángulo con p, así que no es visible. Con un solo visible no hay alternancias: Wilber-2 = 0.
---

El nivel 5 invita a experimentar con el código de [theory.mdx](/structures/wilber-2-bound).
