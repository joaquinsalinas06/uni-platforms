---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Qué hace Greedy fila por fila y por qué se parece a ejecutar un BST real, un acceso a la vez."
  - "La conjetura central de Greedy y por qué, de ser cierta, resolvería la optimalidad dinámica."
  - "Qué significa que la simulación online tenga desaceleración O(1) y qué papel juegan los split trees y el treap."
  - "Por qué una escalera de toques cada vez más recientes es lo mínimo que hay que agregar en cada fila."
canDo:
  - "Trazar Greedy sobre una secuencia corta, fila por fila, mostrando los pares que violan y el punto que los arregla."
  - "Contar |P|, los puntos extra y verificar que el resultado es arboralmente satisfecho."
  - "Implementar greedy() de memoria."
---

Si falla el trazado, repasa la animación de [greedy-row](/structures/greedy-algorithm/operations/greedy-row): el error típico es actualizar `ultimo` antes de leer la segunda escalera.
Si falla la conjetura o la simulación online, vuelve a la sección de complejidad de [theory.mdx](/structures/greedy-algorithm).
