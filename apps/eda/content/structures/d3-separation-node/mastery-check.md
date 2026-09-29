---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué acotar y con la descomposición canónica de siempre cuesta O(lg² n), y qué evita ese costo en D₃.
  - Qué es el nodo de separación y por qué las dos satélites (D₂ normal a la derecha, D₂′ invertida a la izquierda) alcanzan para resolver la consulta.
  - "Qué gana y qué pierde D₃ frente a D₂: D₃ acota y por ambos lados con 2 consultas en vez de un factor O(lg n) extra, pero no da una cota numérica propia — hereda la de D₂/D₁."
canDo:
  - Localizar a mano el nodo de separación de un árbol de rango dado un par (a2,b2).
  - Implementar localizarNodoDeSeparacion y la consulta de dos disparos de memoria.
  - Verificar (no sólo afirmar) que un nodo de separación encontrado es el más profundo donde ambos caminos coinciden.
---

Si algo de esta lista no sale, vuelve a
[Localización del nodo de separación](/structures/d3-separation-node/operations/locate-separation-node)
y traza el ejemplo normal de `examples.md` a mano antes de tocar el C++.
