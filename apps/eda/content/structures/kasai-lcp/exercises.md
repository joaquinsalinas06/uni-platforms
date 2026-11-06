---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué compara la entrada LCP[r] de la tabla?
  hints:
  - Mira las posiciones r y r−1 en la fila SA.
  solution: Compara los dos sufijos vecinos en el orden lexicográfico, de rango r−1 y r, y cuenta sus letras iniciales comunes.
  label: reconocer
- level: 2
  statement: >-
    Para banana$ con SA = [6,5,3,1,0,4,2], ¿cuál es el rango de la posición 1 del texto (anana$)?
  hints:
  - Busca el valor 1 en la fila SA y mira en qué columna está.
  solution: Rango 3. SA[3] = 1, así que rank[1] = 3.
  label: trazar
- level: 3
  statement: >-
    Para banana$, ¿qué intervalo de LCP responde al prefijo común de los rangos 1 y 3?
  hints:
  - Usa las aristas entre rangos, no las celdas de los extremos.
  - Son los pares (1,2) y (2,3).
  solution: LCP[2..3]. Sus valores 1 y 3 dan mínimo 1, que es la letra a.
  label: resolver
- level: 4
  statement: >-
    ¿Cuántas subcadenas distintas (no vacías) tiene banana? Usa la fórmula con n = 6 y la suma de LCP.
  hints:
  - Empieza con 6·7/2.
  - Resta la suma de todas las entradas de la tabla LCP.
  solution: 21 − (0+1+3+0+0+2) = 21 − 6 = 15.
  label: comparar
- level: 5
  statement: >-
    En el recorrido de Kasai, ¿por qué h puede empezar en un valor mayor que cero al llegar a la posición i+1?
  hints:
  - Distingue quitar un carácter al sufijo de avanzar una posición del texto.
  - Piensa en el vecino anterior de S[i+1..].
  solution: Porque quitar la primera letra común de S[j..] y S[i..] conserva el orden y deja h−1 letras comunes; el vecino anterior de S[i+1..] queda entre ambos y comparte al menos ese prefijo.
  label: justificar
- level: 6
  statement: >-
    ¿Por qué el LCP de dos sufijos cualesquiera de rangos k < l es el mínimo de LCP[k+1..l], y no un valor individual?
  hints:
  - Un prefijo común a los extremos debe aparecer en todos los sufijos intermedios.
  - Piensa en qué par adyacente pierde primero ese prefijo.
  solution: Todos los sufijos entre k y l comparten el prefijo común de los extremos; el primer par adyacente que lo rompe fija el valor, así que el prefijo que sobrevive a todo el tramo es el mínimo de los pares intermedios.
  label: demostrar
---

Antes de abrir una pista, dibuja la tabla con las filas SA, sufijo y LCP alineadas por rango, y escribe qué unidad de trabajo vas a contar.
