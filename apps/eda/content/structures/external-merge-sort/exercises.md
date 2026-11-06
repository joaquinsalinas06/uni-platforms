---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Por qué hay que reservar un bloque de salida?
  hints:
  - Piensa cuándo se escribe al disco.
  solution: Agrupa registros emitidos antes de escribir una transferencia.
  label: reconocer
- level: 2
  statement: Con 27 corridas y fan-in 3, traza el número de corridas.
  hints:
  - Divide por tres en cada pasada.
  solution: 27 → 9 → 3 → 1.
  label: trazar
- level: 3
  statement: Mezcla [1,4] y [2,3] con B=2. ¿Cuándo escribes el primer bloque?
  hints:
  - Compara sólo las primeras llaves pendientes.
  solution: Emites 1 y 2 y escribes [1,2]. Después emites 3 y 4.
  label: resolver
- level: 4
  statement: Con memoria para tres bloques y ocho corridas, ¿cuántas pasadas de mezcla hay?
  hints:
  - Reserva salida primero.
  - Sigue las cantidades de corridas.
  solution: 'Fan-in dos: 8→4→2→1. Hay tres pasadas de mezcla, más la generación si se cuenta el proceso
    completo.'
  label: comparar
- level: 5
  statement: ¿Por qué basta elegir el menor frente?
  hints:
  - Ubica los elementos que están detrás del frente.
  solution: Cada corrida está ordenada, así que ningún elemento de una corrida es menor que su frente.
    El menor de todos los frentes es el menor pendiente global.
  label: justificar
- level: 6
  statement: ¿Qué cambia si una corrida se queda sin registros?
  hints:
  - Ya no puede aportar un mínimo.
  solution: Sale de los frentes activos. Las demás corridas conservan su orden.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
