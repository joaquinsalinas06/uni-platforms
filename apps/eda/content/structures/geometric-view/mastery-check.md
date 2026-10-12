---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué la ejecución de un BST se puede representar como un conjunto de puntos (llave, tiempo), y qué significan los dos ejes."
  - "La diferencia entre un punto de acceso y un punto de un nodo tocado de paso, y por qué todo acceso aporta al menos un punto."
  - "Por qué el número de puntos está dentro de un factor constante del costo real de ejecutar el BST."
  - "Qué se gana al olvidar la estructura de árbol: qué problema pasa a ser geométrico."
canDo:
  - "Dibujar el conjunto de puntos de una secuencia de accesos sobre un BST estático dado."
  - "Contar |P| y distinguir cuántos puntos son accesos pedidos y cuántos son nodos de paso."
  - "Mostrar con un ejemplo que un algoritmo que rota no siempre gasta menos puntos que un árbol estático."
---

Si algo de la lista no sale, vuelve al ejemplo de la clase de [theory.mdx](/structures/geometric-view): los
cuatro pasos del árbol y los tres pasos del plano son la misma ejecución vista de dos formas. Si falla la
equivalencia de costos, el supuesto que hay que recordar está en [bst-computational-model](/structures/bst-computational-model):
mover un puntero y rotar cuestan O(1).
