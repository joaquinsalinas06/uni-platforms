---
kind: mastery
title: Prueba de dominio
canExplain:
  - "La definición de satisfacción arboral y por qué sólo se exige para pares que no comparten fila ni columna."
  - "El enunciado del teorema central y por qué convierte un problema de árboles en un problema geométrico."
  - "Por qué el BST óptimo corresponde al menor superconjunto arboralmente satisfecho de la entrada."
  - "Los tres casos de la prueba BST ⇒ satisfecho y qué punto se usa como tercero en cada uno."
  - "Cómo se arma el BST a partir de un conjunto satisfecho (treap ordenado por próximo tiempo de toque)."
canDo:
  - "Decidir si un conjunto pequeño es arboralmente satisfecho y, si no, exhibir el par que lo viola."
  - "Arreglar un conjunto agregando puntos y verificar que los puntos nuevos no crean pares nuevos violados."
  - "Escribir de memoria un comprobador de satisfacción arboral."
---

Si algo de la lista no sale, repasa primero los dos arreglos del ejemplo límite de [examples.md](/structures/arborally-satisfied-set/examples):
muestran por qué agregar un punto dentro del rectángulo es necesario pero no suficiente. Si lo que falla es la equivalencia con BSTs,
vuelve a la [vista geométrica](/structures/geometric-view): un punto por cada nodo tocado.
