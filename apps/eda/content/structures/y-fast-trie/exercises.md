---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué guarda el X-fast de un Y-fast trie?
  hints:
  - Piensa en grupos, no en llaves individuales.
  - Cuántos representantes hay si cada grupo tiene al menos $w/2$ llaves?
  solution: Un representante por grupo. Como cada grupo tiene al menos $w/2$ llaves, hay a lo más $2n/w$ representantes.
  label: reconocer
- level: 2
  statement: En los grupos G0 = {1, 3, 4, 6} y G1 = {9, 10, 12, 14, 15}, con representantes 1 y 9, ¿cuál es el sucesor de 13?
  hints:
  - El mayor representante menor o igual que 13 es 9.
  - Busca en G1 la menor llave mayor que 13.
  solution: 14. El índice elige G1 y dentro de G1 la menor llave mayor que 13 es 14.
  label: trazar
- level: 3
  statement: Con los mismos grupos, ¿cuál es el predecesor de 2?
  hints:
  - El representante más grande menor o igual que 2 es 1.
  - Busca en G0 la mayor llave menor que 2.
  solution: 1. El índice elige G0 y la mayor llave de G0 menor que 2 es 1.
  label: resolver
- level: 4
  statement: Con los mismos grupos, ¿cuál es el predecesor de 9? Explica por qué hay que cruzar de grupo.
  hints:
  - El representante 9 coincide con la consulta, pero el predecesor es estricto.
  - Mira si G1 tiene alguna llave menor que 9.
  solution: 6. El índice elige G1, pero G1 no tiene llaves menores que 9. Hay que cruzar a G0 y tomar su máximo, que es 6.
  label: adaptar
- level: 5
  statement: Si el umbral de partición fuera 4w en lugar de 2w, ¿cuántas inserciones, como mínimo, hacen falta para que un grupo recién partido vuelva a necesitar partición?
  hints:
  - Un grupo que se parte en dos mitades queda cerca del centro de su rango permitido.
  - Compara la distancia del tamaño de cada mitad al nuevo umbral.
  solution: Al partir un grupo de 4w+1 en mitades de tamaño 2w y 2w+1, la mitad más grande llega a 4w+1 tras al menos 2w inserciones. El cobro por reorganización sería O(w) repartido entre al menos 2w operaciones, así que el costo amortizado sigue siendo O(1) por operación. Es un ejercicio de apoyo, no sale de las láminas.
  label: diseñar
- level: 6
  statement: Demuestra que el costo amortizado de insertar y eliminar en el Y-fast trie es O(lg w), suponiendo que cada reorganización cuesta O(w) y ocurre a lo más una vez por cada w/4 operaciones sobre el mismo grupo.
  hints:
  - Separa el costo ordinario de la búsqueda del costo de la reorganización.
  - Reparte el costo de cada reorganización entre las operaciones que la preceden.
  solution: Cada operación paga O(lg w) por la búsqueda en el X-fast y en el BST. Cada reorganización cuesta O(w) y se reparte entre al menos w/4 operaciones del grupo, así que a cada una se le carga O(w)/(w/4) = O(1). El total es O(lg w) + O(1) = O(lg w).
  label: demostrar
---
