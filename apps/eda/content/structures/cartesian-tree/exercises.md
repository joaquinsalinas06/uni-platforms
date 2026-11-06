---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué orden recupera el inorden?
  hints:
  - Distingue posición de valor.
  solution: Recupera el orden por índice del arreglo.
  label: reconocer
- level: 2
  statement: Traza la llegada de 4 en el ejemplo.
  hints:
  - Compara primero con 9 y luego con 6.
  solution: Retira 9 y 6; 4 se enlaza a la derecha de 2 y 6 pasa a la izquierda de 4.
  label: trazar
- level: 3
  statement: Con [3,2,1], ¿quién es la raíz final?
  hints:
  - Cada nuevo valor es menor que todo lo anterior.
  solution: 1. Su hijo izquierdo es 2, que conserva a 3 como hijo izquierdo.
  label: resolver
- level: 4
  statement: En [7,8,2,6,9,4], calcula RMQ(1,4) usando el árbol.
  hints:
  - Los extremos están a ambos lados de 2.
  solution: El LCA es el índice 2, de valor 2.
  label: comparar
- level: 5
  statement: ¿Qué se rompe si al retirar 7 de la pila descartas también a 8?
  hints:
  - Comprueba el inorden del árbol final.
  solution: Se pierde una posición del arreglo. Retirar un índice de la espina no elimina su subárbol.
  label: justificar
- level: 6
  statement: ¿Cómo puede una inserción hacer muchos retiros sin volver cuadrática la construcción?
  hints:
  - Carga cada retiro al índice que sale.
  solution: Cada índice sólo puede salir una vez. La suma de retiros es lineal.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
