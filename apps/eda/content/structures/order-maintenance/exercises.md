---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Cómo comparas dos elementos del mismo grupo?
  hints:
  - La etiqueta del grupo coincide.
  solution: Usa las etiquetas locales.
  label: reconocer
- level: 2
  statement: Entre 7 y 8, ¿puedes asignar otra etiqueta entera?
  hints:
  - Dibuja los enteros estrictamente intermedios.
  solution: No. Hay que crear espacio o cambiar de representación.
  label: trazar
- level: 3
  statement: ¿Quién precede entre X=(5,1) y Y=(2,9)?
  hints:
  - Compara primero el grupo.
  solution: Y precede a X porque 2<5.
  label: resolver
- level: 4
  statement: Reetiqueta A:4, X:5 y B:8 para insertar Z entre A y X.
  hints:
  - Conserva el orden de las llaves antiguas y deja huecos.
  solution: Una opción es A:4, Z:6, X:8, B:12.
  label: comparar
- level: 5
  statement: ¿Cuánto añade en amortizado una división que cuesta O(lg N) y se repite cada Ω(lg N)
    cambios del grupo?
  hints:
  - Divide costo por frecuencia.
  solution: O(1) por cambio del grupo, además del trabajo local.
  label: justificar
- level: 6
  statement: ¿Qué separa la indirección?
  hints:
  - Distingue un cambio de elemento de un cambio del índice de grupos.
  solution: La reparación local ocurre dentro de un grupo. El índice cambia cuando se altera la partición
    en grupos.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
