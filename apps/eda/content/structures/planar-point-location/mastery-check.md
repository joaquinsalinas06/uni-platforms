---
kind: mastery
title: Prueba de dominio
canExplain:
  - >-
    Por qué Planar Point Location es un problema y no una estructura de
    datos con nombre.
  - >-
    Por qué el mazo lo resuelve por reducción (PPL → vertical ray shooting
    → intersección de segmentos → RSQ / BBST + persistencia) y no con una
    estructura propia inventada para PPL.
  - >-
    Qué gana el caso ortogonal (segment tree / Fenwick tree, O(n log n))
    frente al caso general (BBST + persistencia, O(log n) por consulta) y
    por qué esa distinción existe.
  - >-
    Por qué `edge-update` queda sin desarrollar en el material — qué se
    enuncia (#17) y qué sólo se cita de la literatura (#60-61), sin
    confundir una cosa con la otra.
canDo:
  - >-
    Implementar `locate` por fuerza bruta con el test de punto en
    polígono por conteo de cruces, incluyendo la cara infinita como caso
    válido.
  - >-
    Trazar a mano, sobre el mapa del profesor, por qué dos puntos con la
    misma coordenada y pueden caer en caras distintas.
  - >-
    Explicar la fórmula `Query(t_{x_i}, Successor(y_i))` (#50) en sus
    propios términos, señalando explícitamente qué parte queda sin
    definir en el mazo.
---

Si algo de esta lista no sale, vuelve a la cadena de reducciones en
[Análisis de complejidad](/structures/planar-point-location#análisis-de-complejidad)
antes de intentar memorizar la fórmula de `Query` — el punto del tema es
seguir la reducción, no un algoritmo propio de PPL.
