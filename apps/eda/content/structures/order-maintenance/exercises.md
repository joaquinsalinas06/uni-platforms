---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Cómo comparas dos elementos del mismo grupo?
  hints:
  - Si las etiquetas superiores coinciden, la decisión la toman las locales.
  solution: Compara las etiquetas locales. Como están en el mismo grupo, no hace falta mirar el índice superior.
  label: reconocer
- level: 2
  statement: Entre 7 y 8, ¿puedes asignar otra etiqueta entera?
  hints:
  - Dibuja los enteros estrictamente intermedios entre 7 y 8.
  solution: No. No hay enteros estrictamente entre 7 y 8. Hay que crear espacio reetiquetando una región o cambiando de representación.
  label: trazar
- level: 3
  statement: "¿Quién precede entre X = (5, 1) e Y = (2, 9)?"
  hints:
  - Compara primero el grupo, es decir, la primera componente.
  solution: Y precede a X porque $2 < 5$ en la primera componente. La segunda componente no se consulta.
  label: resolver
- level: 4
  statement: Reetiqueta A con 4, X con 5 y B con 8 para insertar Z entre A y X.
  hints:
  - Conserva el orden de los elementos antiguos y deja huecos entre ellos.
  solution: "Una opción es A con 4, Z con 6, X con 8 y B con 12. Se reasignaron tres etiquetas y Z quedó entre A y X."
  label: comparar
- level: 5
  statement: ¿Cuánto añade en amortizado una división que cuesta $O(\lg N)$ y se repite cada $\Omega(\lg N)$ cambios del grupo?
  hints:
  - Divide el costo de la división entre la frecuencia con la que ocurre.
  solution: "$O(\\lg N) / \\Omega(\\lg N) = O(1)$ por cambio del grupo, además del trabajo local."
  label: justificar
- level: 6
  statement: ¿Qué separa la indirección?
  hints:
  - Distingue un cambio de un elemento dentro de su grupo de un cambio en el índice de grupos.
  solution: La reparación local ocurre dentro de un grupo y no toca otras etiquetas superiores. El índice superior sólo cambia cuando un grupo se parte o se fusiona.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar: comparaciones, etiquetas reasignadas o divisiones.
