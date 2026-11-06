---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: '¿Qué es un bit de ramificación de un conjunto de llaves y cuántos puede haber en un nodo con k llaves?'
  hints:
  - Piensa en el trie binario de las llaves y en los nodos donde dos ramas se separan.
  solution: 'Es un exponente donde el trie de las llaves bifurca. Con k llaves hay a lo más k - 1 de ellos.'
  label: reconocer
- level: 2
  statement: 'Con bits de ramificación 3 y 1, ¿cuál es el sketch de la llave 1111 y el de la llave 1100?'
  hints:
  - Lee primero el bit de peso 2 a la 1 y después el de peso 2 a la 3.
  - El bit de menor exponente va en el peso más bajo del sketch.
  solution: 'Sketch de 1111 es 11. Sketch de 1100 es 10.'
  label: trazar
- level: 3
  statement: 'En el nodo con llaves 0000, 0010, 1100 y 1111, ¿cuál es el sucesor de la consulta 1011?'
  hints:
  - Encuentra el prefijo común más largo de 1011 con las llaves, y el bit siguiente.
  - Cuando el bit siguiente de la consulta es 0, el bloque queda por encima de la consulta.
  solution: 'Es 1100. El prefijo común es 1, el bit siguiente es 0, así que e = 1100 y el sucesor es el mínimo del bloque.'
  label: resolver
- level: 4
  statement: 'Con la consulta 0100 y las llaves 0000, 0010, 1100 y 1111, ¿por qué su sketch con bits 3 y 1 no basta para decidir el predecesor?'
  hints:
  - Compara la consulta completa con 0010 bit a bit, empezando por el bit 2.
  solution: 'Su sketch es 00, que empata con 0000. El bit 2 de 0100 vale 1, mientras que 0000 y 0010 tienen 0. Por eso 0100 es mayor que 0010 y el predecesor es 0010, no 0000.'
  label: comparar
- level: 5
  statement: '¿Qué se pierde si un nodo recorre sus separadores uno por uno para elegir el hijo?'
  hints:
  - Multiplica el costo por nivel por la altura del árbol.
  solution: 'La altura sigue siendo O(log_w n), pero cada nivel cuesta hasta el grado k = w elevado a 1/5. El costo por nivel deja de ser constante y la cota O(log_w n) ya no vale.'
  label: justificar
- level: 6
  statement: 'Justifica la igualdad h = 5 log_w n para la altura de un árbol de grado w elevado a 1/5.'
  hints:
  - Escribe el logaritmo base w elevado a 1/5 como cociente de logaritmos base 2.
  - El denominador es un quinto de lg w.
  solution: 'h = lg n / lg(w elevado a 1/5) = lg n / ((1/5) lg w) = 5 lg n / lg w = 5 log_w n.'
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
