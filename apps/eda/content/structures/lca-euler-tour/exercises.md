---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Por qué B aparece tres veces en la traza de clase, si sólo tiene dos hijos?
  hints:
  - Anota la entrada a B y cada regreso a B desde un hijo.
  solution: B aparece al entrar y una vez por cada hijo al que regresa, así que son 3 apariciones en E[1], E[3] y E[5].
  label: reconocer
- level: 2
  statement: Resuelve LCA(E,C) con la traza de clase.
  hints:
  - Las primeras apariciones son 4 para E y 7 para C.
  - Mira la profundidad mínima de D sobre el intervalo [4,7].
  solution: El tramo D[4..7] es 2,1,0,1; el mínimo 0 está en t = 6 y la letra es A. LCA(E,C) = A.
  label: trazar
- level: 3
  statement: ¿Cuántas entradas de Euler produce cualquier árbol con cinco nodos?
  hints:
  - Cuenta la entrada inicial y luego cada arista dos veces.
  solution: Nueve entradas, porque 2n - 1 = 9 con n = 5.
  label: resolver
- level: 4
  statement: Consulta LCA(B,E) sobre la traza de clase y explica por qué el mínimo aparece dos veces.
  hints:
  - Busca las primeras apariciones 1 y 4.
  - Compara las posiciones del mínimo dentro de [1,4].
  solution: El tramo D[1..4] es 1,2,1,2. El mínimo 1 está en t = 1 y t = 3, ambas con la letra B. Por eso LCA(B,E) = B.
  label: comparar
- level: 5
  statement: Explica por qué una traza que sólo guarda las primeras visitas puede dar una respuesta incorrecta.
  hints:
  - Mira el tramo entre D y E en la traza sin retornos.
  - Pregúntate si el ancestro B aparece en ese tramo.
  solution: Sin retornos, el tramo entre D y E sólo contiene D y E. B deja de estar en el intervalo, y la consulta no puede devolverlo.
  label: justificar
- level: 6
  statement: Demuestra que dos entradas consecutivas de la traza tienen profundidades que difieren exactamente en uno.
  hints:
  - Cada paso de la traza recorre una arista.
  - Una arista une un padre con un hijo.
  solution: Cada paso baja de un padre a un hijo, con profundidad más uno, o sube de un hijo a su padre, con profundidad menos uno. Así |D[t] - D[t-1]| = 1.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
