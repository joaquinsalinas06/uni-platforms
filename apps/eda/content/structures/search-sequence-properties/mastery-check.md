---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué el peor caso O(log n) del modelo computacional BST no es la métrica interesante, y qué pregunta abre eso sobre la secuencia de búsquedas."
  - "Qué dice cada una de las cinco propiedades (acceso secuencial, puntero dinámico, cota de entropía, conjunto de trabajo, unificada) y de qué parámetro depende su cota."
  - "Por qué la propiedad del puntero dinámico implica la de acceso secuencial (Lema 1), y por qué puntero dinámico y conjunto de trabajo son 'ortogonales' entre sí."
  - "Por qué la propiedad unificada es alcanzable con máquina de punteros pero sigue abierta para un modelo BST, y qué relación tiene eso con dynamic-optimality."
canDo:
  - "Calcular k_i, p_k y t_i a mano sobre una secuencia concreta, sin ver el mazo."
  - "Reconocer, dada una secuencia nueva, cuál (o cuáles) de las cinco propiedades cumple y con qué cota."
  - "Trazar el argumento del Lema 2 (conjunto de trabajo implica cota de entropía) en un caso particular."
---

Si algo de la lista no sale sin ver el mazo, repetir primero el nivel 6 de
`exercises.md` (el argumento del Lema 2) — es el que conecta las cinco
propiedades entre sí en vez de tratarlas como cinco fórmulas sueltas.
