---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Qué significa OPT(S) y por qué el profesor la usa como referencia del óptimo offline, no como algo que un algoritmo pueda calcular en la práctica."
  - "Qué significa que un algoritmo sea O(1)-competitivo, en términos de la desigualdad costo(S) ≤ k · OPT(S)."
  - "Por qué esto es una conjetura abierta y no un resultado sin publicar: qué falta probar en ambas direcciones."
  - "Qué se sabe parcialmente (O(log log n)-competitivo para BST, #58) y por qué eso no resuelve la pregunta O(1)."
canDo:
  - "Distinguir, para una secuencia dada, el costo del mejor árbol estático del costo de OPT(S), y explicar por qué el segundo nunca es mayor."
  - "Explicar por qué la búsqueda exhaustiva de OPT(S) no escala (número de Catalán), sin ver el programa."
  - "Ubicar dónde entra el splay tree en esta pregunta, sin necesitar reexplicar cómo funciona el splay tree."
---

Si algo de la lista no sale, volver primero a la definición de OPT(S) en
theory.md (sección "Análisis de complejidad") y al ejemplo Normal de
examples.md — de ahí sale la intuición de por qué "óptimo offline" y "óptimo
estático" no son lo mismo, que es la confusión más común de este tema.
