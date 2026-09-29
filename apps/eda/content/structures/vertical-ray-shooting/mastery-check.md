---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué preguntar por el primer segmento que toca un rayo vertical es equivalente a preguntar por la cara de un punto en planar-point-location."
  - "Qué gana la reformulación frente al problema original: un objeto lineal con coordenadas en vez de una región sin forma canónica."
  - "Por qué vertical-ray-shooting no tiene un análisis de complejidad propio, y de dónde hereda el suyo."
canDo:
  - "Trazar a mano el rayo vertical desde un punto de consulta y encontrar el primer segmento que toca, en un mapa dado."
  - "Implementar ray-query por fuerza bruta en O(n) por consulta."
  - "Identificar los casos degenerados (rayo por un extremo, segmento vertical alineado con la consulta, punto sobre un segmento) y decidir cómo tratarlos."
---

Si algo de esta lista no sale, vuelve a [theory.md](/structures/vertical-ray-shooting)
y en particular a la cita del profesor en "¿Qué problema resuelve?" — toda la
equivalencia está ahí.
