---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué B_k se define como dos copias de B_{k-1} enlazadas por su raíz, y no de otra forma."
  - "Por qué el número de nodos a profundidad i en B_k es exactamente C(k,i), y de dónde sale ese nombre."
  - "Qué gana un montículo binomial al usar árboles binomiales como bloque de construcción, frente a un único binary-heap."
  - "Por qué enlazar dos árboles binomiales de distinto orden no produce un árbol binomial."
canDo:
  - "Construir B_k para cualquier k pequeño (0 a 4) a mano, indicando qué se enlaza con qué en cada paso."
  - "Verificar sobre un B_k concreto las cuatro propiedades: 2^k nodos, altura k, grado de raíz k, C(k,i) nodos por profundidad."
  - "Implementar build(k) por enlace recursivo en C++ sin mirar la solución."
  - "Reconocer si una figura de árbol dada es o no un árbol binomial válido, y de qué orden."
---

Si algo de la lista no sale, vuelve a `theory.md` (sección "Análisis de
complejidad") y a los ejercicios de nivel 2 y 6 antes de repetir la prueba.
