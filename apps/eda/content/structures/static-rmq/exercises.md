---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Se puede usar la misma cobertura solapada para sumar?
  hints:
  - Piensa qué se cuenta dos veces.
  solution: No. Sumar los mínimos no aplica, y sumar ambas ventanas duplicaría los elementos de la
    intersección.
  label: reconocer
- level: 2
  statement: Traza RMQ(0,4) del arreglo de clase.
  hints:
  - Usa ventanas de longitud 4.
  solution: Ventanas [0,3] y [1,4]. Ambas devuelven el índice 3.
  label: trazar
- level: 3
  statement: En el arreglo de clase, calcula M[2,4].
  hints:
  - Compara los mínimos de [4,5] y [6,7].
  solution: 'Índice 7: el valor 2 gana contra el valor 4 del índice 5.'
  label: resolver
- level: 4
  statement: Consulta [4,7]. ¿Las ventanas se solapan parcialmente o son iguales?
  hints:
  - La longitud es una potencia de dos.
  solution: Son idénticas. Ambas ocupan [4,7].
  label: comparar
- level: 5
  statement: ¿Cómo devolver el primer mínimo si hay empate?
  hints:
  - Aplica la convención en todas las comparaciones.
  solution: Compara por valor y después por índice menor, tanto al construir como al consultar.
  label: justificar
- level: 6
  statement: ¿Por qué se precomputan n lg n ventanas y no n²?
  hints:
  - Cuenta cuántas longitudes se permiten.
  solution: Sólo se guardan longitudes potencia de dos, con a lo sumo n comienzos por longitud.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
