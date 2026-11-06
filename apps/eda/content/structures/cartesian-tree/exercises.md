---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  label: reconocer
  statement: ¿Qué dos propiedades cumple el árbol cartesiano?
  hints:
  - Una es sobre el valor de padres e hijos, la otra sobre el recorrido inorden.
  solution: Heap (cada padre es menor o igual que sus hijos) e inorden (devuelve 0, 1, ..., n-1).
- level: 2
  label: trazar
  statement: Construye el árbol cartesiano de [4, 1, 3, 2] y dibuja la pila en cada paso.
  hints:
  - Al llegar 1, desapila 4 antes de hacer cualquier otra cosa.
  - Al llegar 2, sólo desapila 3; el tope 1 es menor que 2.
  solution: Raíz 1; hijo izquierdo 4; hijo derecho 2, cuyo hijo izquierdo es 3. La pila final es 1, 2.
- level: 3
  label: resolver
  statement: Con [3, 2, 1], ¿quién es la raíz final?
  hints:
  - Cada nuevo valor es menor que todo lo anterior, así que desapila todo.
  solution: La raíz es 1 (posición 2). Su hijo izquierdo es 2 (posición 1), cuyo hijo izquierdo es 3 (posición 0).
- level: 4
  label: comparar
  statement: En [7, 8, 2, 6, 9, 4], calcula RMQ(1,4) usando el árbol.
  hints:
  - Los extremos son 8 (posición 1) y 9 (posición 4). Están a lados distintos de la raíz.
  solution: El LCA es la raíz, posición 2, de valor 2. Ese es el mínimo de [8, 2, 6, 9].
- level: 5
  label: justificar
  statement: ¿Qué se rompe si al desapilar 7 también quitas su hijo 8 del árbol?
  hints:
  - Comprueba el inorden del árbol final.
  solution: Se pierde la posición 1 del inorden, y el árbol deja de representar el arreglo. Desapilar saca un candidato de la pila, pero no borra el subárbol.
- level: 6
  label: demostrar
  statement: ¿Cómo puede una inserción desapilar muchos nodos sin que la construcción sea cuadrática?
  hints:
  - Cuenta cuántas veces puede salir cada posición de la pila.
  solution: Cada posición se apila una vez y se desapila a lo sumo una vez. La suma de desapilados es a lo sumo n, y el costo total es O(n).
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
