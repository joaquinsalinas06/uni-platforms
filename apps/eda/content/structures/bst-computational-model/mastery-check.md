---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué pointer-move y rotate son O(1) en este modelo, y qué hace falta en la estructura de nodo para que eso sea cierto.
  - Por qué el costo de Buscar(x) es exactamente la profundidad de x, y no una función fija de n.
  - Qué significa que "la misma secuencia de búsquedas cuesta distinto según la forma del árbol" y por qué eso es el punto de partida de search-sequence-properties, dynamic-optimality y el Splay Tree.
  - Qué relación hay entre este modelo y la máquina de punteros, y qué agrega la restricción de ser un BST.
canDo:
  - Trazar Buscar(x) sobre un árbol dado contando pointer-moves paso a paso.
  - Trazar una rotación (Right o Left) identificando qué subárbol cambia de padre y cuáles no.
  - Construir dos árboles con el mismo conjunto de llaves donde la misma secuencia de búsquedas tenga costo total distinto.
---

Si algo de esta lista no sale, vuelve a [rotate](/structures/bst-computational-model/operations/rotate)
y traza la figura #21 a mano antes de seguir con
[search-sequence-properties](/structures/search-sequence-properties): todo lo
que sigue asume que este modelo quedó exacto.
