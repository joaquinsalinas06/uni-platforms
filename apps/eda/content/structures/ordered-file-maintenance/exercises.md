---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Por qué guardar máximos?
  hints:
  - Usa la primera región cuyo extremo superior alcanza q.
  solution: Permiten descartar todos los tramos anteriores de una vez.
  label: reconocer
- level: 2
  statement: ¿Cambia el máximo al insertar 18 entre 16 y 20?
  hints:
  - Inspecciona el último registro.
  solution: Permanece en 20.
  label: trazar
- level: 3
  statement: Después de mover 20 al tramo de [25,35], ¿a qué tramo debe ir buscar 20?
  hints:
  - Recalcula el máximo del tramo que perdió 20.
  solution: El tramo anterior termina en 19 y se descarta. Buscar 20 pasa al siguiente tramo.
  label: resolver
- level: 4
  statement: Un tramo de 16 celdas empieza en la posición 1 con B=4. ¿Cuántos bloques cubre?
  hints:
  - La última posición es 16.
  - Cuenta bloques 0 a 4.
  solution: Cinco bloques, porque el comienzo está desalineado.
  label: comparar
- level: 5
  statement: ¿Qué condición permite amortizar una reparación superior?
  hints:
  - Cuenta cambios locales entre dos reparaciones.
  solution: Los grupos recuperan holgura al dividir o fusionar. El costo superior se reparte entre
    los cambios locales que agotaron esa holgura.
  label: justificar
- level: 6
  statement: Si se reescriben 16 celdas alineadas con B=4, ¿cuántos bloques se escriben?
  hints:
  - Cuenta celdas por bloque.
  solution: Cuatro bloques.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
