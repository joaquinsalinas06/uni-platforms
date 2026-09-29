---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué el método de rollback aplica siempre que las operaciones sean invertibles, sin exigir conmutatividad."
  - "Qué gana y qué pierde frente a /structures/commutative-invertible-retroactivity: generalidad total vs. costo O(1)."
  - "Por qué el costo es O(r) por conteo directo (deshacer + rehacer) y no por recurrencia ni potencial."
  - "Qué dice la cota inferior Ω(r) y por qué es sólo un esbozo de adversario, no una prueba formal."
  - "Por qué t cerca del presente es barato y t cerca del principio de la historia es tan caro como rehacer todo."
canDo:
  - "Trazar Insert(t, op) y Delete(t) a mano sobre un log dado: identificar r, deshacer, aplicar, rehacer."
  - "Calcular el costo O(r) × (costo de una operación) para una inserción retroactiva concreta."
  - "Reconocer cuándo el método de rollback es la única opción disponible (ni conmutativo+invertible, ni descomponible)."
---

Si algo de la lista no sale, vuelve a
[rollback-replay](/structures/rollback-method/operations/rollback-replay)
para el mecanismo y a
[amortized-cost](/structures/rollback-method/operations/amortized-cost) para
el análisis de costo completo.
