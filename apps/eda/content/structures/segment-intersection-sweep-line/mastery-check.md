---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué el caso simple (segmentos H/V) se resuelve con un Segment tree o un Fenwick tree, y qué papel cumple cada uno (activación/desactivación como actualización puntual, conteo de cruces como RSQ)."
  - "Por qué el caso general necesita una BBST en vez de activo/inactivo, y qué hace distinto a su comparador."
  - "Qué gana la consulta online (persistencia) frente al caso general offline, y por qué el material deja `Query(t_{x_i}, Successor(y_i))` sin definir."
  - "Por qué la cota de cada variante se hereda de la estructura elegida, en vez de derivarse con una recurrencia o un argumento amortizado."
canDo:
  - "Implementar de memoria el barrido del caso simple: eventos ordenados por x, activación/desactivación en un Fenwick tree, conteo por RSQ."
  - "Trazar a mano el orden de cruces de dos segmentos oblicuos que se invierten, sin equivocarme en qué x ocurre la inversión."
  - "Verificar el caso simple contra fuerza bruta (todos los pares H×V) sin que el resultado difiera."
---

Si algo de esta lista no sale, vuelve a
[Estructura interna](/structures/segment-intersection-sweep-line#estructura-interna)
para repasar qué estructura resuelve cada caso, y a
[Análisis de complejidad](/structures/segment-intersection-sweep-line#análisis-de-complejidad)
para repasar de dónde se hereda cada cota.
