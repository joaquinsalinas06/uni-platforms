---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Qué es el hijo preferido y qué es un camino preferido, y por qué los caminos particionan P."
  - "Por qué un cambio de hijo preferido es exactamente una alternancia de Wilber-1."
  - "Por qué cada camino se guarda en un BBST de tamaño O(lg n) y qué se gana (lg lg n por operación)."
  - "Cómo se cortan los caminos 'por profundidad' usando un rango de valores, y por qué eso mantiene O(lg lg n)."
  - "Por qué Tango Trees es O(lg lg n)-competitivo y no O(1)."
canDo:
  - "Simular los hijos preferidos de un árbol perfecto pequeño sobre una secuencia corta, anotando los cambios."
  - "Dibujar el árbol de árboles de un ejemplo."
---

Si falla la simulación, repasa el ejemplo normal de [examples.md](/structures/tango-tree/examples): el primer descenso por un nodo no cuenta como cambio, sólo los descensos por un lado distinto al preferido.
