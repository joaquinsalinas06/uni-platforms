---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  label: reconocer
  statement: >-
    ¿Qué representa $k$ durante la búsqueda KMP, con respecto al patrón y al texto?
  hints:
  - Mira a la vez el prefijo de $P$ y las letras ya leídas de $T$.
  solution: >-
    La longitud del prefijo de $P$ que coincide con el sufijo del texto leído hasta $i$.
- level: 2
  label: trazar
  statement: >-
    Traza la letra $\mathtt{c}$ de $P = \mathtt{ababaca}$ al calcular $\pi[5]$. ¿Cuántas comparaciones hace y cuál es el valor final?
  hints:
  - Empieza con $k = \pi[4] = 3$.
  - Cada fallo baja $k$ a $\pi[k-1]$.
  solution: >-
    k pasa de 3 a π[2] = 1 y luego a π[0] = 0. Son 3 comparaciones de c contra P[3], P[1] y P[0], todas fallidas. π[5] = 0.
- level: 3
  label: resolver
  statement: >-
    Calcula la función prefijo completa de $P = \mathtt{aabaab}$.
  hints:
  - Compara cada candidato con el borde del paso anterior.
  - Al fallar en la tercera letra, el borde vuelve a la longitud 0.
  solution: >-
    π = [0, 1, 0, 1, 2, 3].
- level: 4
  label: comparar
  statement: >-
    Con $P = \mathtt{aaab}$ y $T = \mathtt{aaaaaaaaab}$, ¿cuántas comparaciones de caracteres hace KMP? Compara con la fuerza bruta sobre el mismo texto.
  hints:
  - Cuenta por tramos, las tres primeras aes, después cada a del resto con un fallo y una coincidencia.
  - La fuerza bruta hace 4 comparaciones por intento y tiene 7 intentos.
  solution: >-
    KMP hace 16 comparaciones (3 + 2 × 6 + 1). La fuerza bruta hace 28.
- level: 5
  label: justificar
  statement: >-
    Cuando falla una comparación, ¿qué avance se conserva? Separa la posición del texto de la longitud reconocida.
  hints:
  - Qué pasa con $i$ y qué pasa con $k$.
  - El borde de $P[0..k-1]$ dice cuánto del patrón sigue siendo válido.
  solution: >-
    El puntero del texto i no retrocede. Baja k a π[k-1], que es el borde más largo todavía compatible con las letras leídas, y se vuelve a comparar el mismo carácter.
- level: 6
  label: demostrar
  statement: >-
    ¿Cómo puede un carácter causar varios retrocesos y la búsqueda seguir siendo lineal?
  hints:
  - Suma cuánto puede subir $k$ durante todo el recorrido.
  - Un retroceso siempre baja $k$ y $k$ nunca es negativo.
  solution: >-
    Cada subida de k es a lo más una por letra del texto, así que hay a lo más n subidas. Cada bajada baja k al menos 1 y k no es negativo, de modo que las bajadas no superan a las subidas. Comparaciones ≤ 2n, y con π queda O(n + m).
---

Antes de abrir una pista, dibuja la tabla de $\pi$ o la traza de $k$ sobre el texto. Las respuestas aparecen tras desbloquear la solución.
