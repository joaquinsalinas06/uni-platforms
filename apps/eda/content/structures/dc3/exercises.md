---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué residuos entran en la muestra?
  hints:
  - Divide la posición entre tres y mira el resto.
  solution: Los residuos 1 y 2.
  label: reconocer
- level: 2
  statement: Para comparar un sufijo 0 con uno 2, ¿cuántas letras debes retirar antes de mirar rangos
    si hay empate?
  hints:
  - Suma el mismo desplazamiento a ambos residuos.
  solution: 'Dos: llegan a residuos 2 y 1, ambos de la muestra.'
  label: trazar
- level: 3
  statement: ¿Qué ternas repiten nombre en la muestra de mississippi?
  hints:
  - Mira los comienzos 1 y 4, y 2 y 5.
  solution: iss y ssi, respectivamente.
  label: resolver
- level: 4
  statement: Al comparar residuos 0 y 1, ¿cuántas letras puedes quitar antes de consultar rangos?
  hints:
  - Suma uno a ambos residuos.
  solution: Una. Las colas caen en residuos 1 y 2.
  label: comparar
- level: 5
  statement: ¿Qué costo tiene la mezcla una vez que hay rangos de muestra?
  hints:
  - Cada comparación emite una cabeza.
  solution: O(n). Cada comparación usa hasta dos caracteres y rangos de las colas y se hace a lo sumo
    una por sufijo emitido.
  label: justificar
- level: 6
  statement: ¿Por qué reducir el problema a dos tercios da tiempo lineal?
  hints:
  - Escribe el costo total de los niveles.
  solution: Cada nivel cuesta lineal en su tamaño y los tamaños decrecen geométricamente.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
