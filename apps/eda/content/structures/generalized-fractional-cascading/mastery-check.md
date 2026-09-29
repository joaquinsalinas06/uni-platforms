---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué la condición de grado acotado (no la forma de cadena) es lo único que fractional cascading necesita del grafo para seguir costando O(1) por paso."
  - "Por qué D4/D3 tiene grado acotado por 5 (padre, dos hijos, dos enlaces a la gemela invertida) y no algún otro número."
  - "De dónde sale cada término de O(lg n) + O(1)·O(lg n) + O(k) = O(lg n + k), sin saltarse ninguno."
  - "Por qué el espacio O(n lg³ n) viene de un argumento de multiplicidad y no de contar pasos, a diferencia del tiempo."
  - "Qué se rompe exactamente si un vértice del grafo tiene grado no acotado, con un ejemplo numérico concreto."
  - "Cómo este resultado generaliza a d dimensiones, y por qué d=3 da lg n en vez de lg² n."
canDo:
  - "Dado un grafo de listas nuevo (no D4/D3), decidir si fractional cascading aplica contando el grado de cada vértice."
  - "Trazar una consulta sobre un camino de un grafo con grado acotado, identificando dónde ocurre la única búsqueda real y dónde los pasos O(1)."
  - "Construir un contraejemplo de grado no acotado y mostrar, con números, por qué el tamaño deja de ser constante por vértice."
  - "Ubicar D1-D4 y su cascading generalizado dentro de la tabla comparativa completa del curso (BSTs anidados / cascading parcial / cascading completo)."
---

Si algo de esta lista no sale de corrido, vuelve primero a la condición de
[Applicability](/structures/generalized-fractional-cascading/operations/applicability)
— todo lo demás en este tema depende de verificar esa condición sobre un
grafo concreto, no de un algoritmo nuevo que aprender.
