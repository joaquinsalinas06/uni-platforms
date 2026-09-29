---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué D₂ acota x con un BST estándar en vez de reinventar D₁.
  - "Qué gana y qué pierde frente a D₁: gana un intervalo cerrado en x, no gana nada nuevo en (y, z)."
  - Por qué acotar y con la misma técnica (descomposición canónica anidada) da O(lg² n) y motiva d3-separation-node.
canDo:
  - Implementar la construcción de D₂ (BST sobre x + D1 satélite por nodo) de memoria.
  - Trazar la descomposición canónica de una consulta [x1, x2] sobre el BST de x sin equivocarme.
  - Explicar en una frase la composición "descomposición canónica × consulta de dominancia" que usa esta operación.
---

Si algo de la lista no sale, vuelve primero a
[/structures/range-tree](/structures/range-tree) (descomposición canónica) y
a [/structures/dominance-2d](/structures/dominance-2d) (la consulta que D₂
delega) — D₂ no tiene mecánica propia más allá de componer esas dos.
