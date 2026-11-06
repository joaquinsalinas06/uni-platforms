---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Por qué el fallo de she va a he?
  hints:
  - Busca el mayor sufijo propio que es prefijo en el trie.
  solution: he es un prefijo existente y más largo que sus otros sufijos candidatos.
  label: reconocer
- level: 2
  statement: ¿Qué hace la r de ushers al salir de she?
  hints:
  - La arista r falta en she.
  - Sigue el enlace hacia he antes de consumir r.
  solution: Pasa a he por fallo y luego a her al consumir r.
  label: trazar
- level: 3
  statement: Tras leer she, ¿qué patrones se emiten en ushers?
  hints:
  - Mira el estado y el terminal al que apunta su fallo.
  solution: she y he, ambos terminan en índice 3.
  label: resolver
- level: 4
  statement: ¿Cómo se reconoce hers si acabas de reconocer she?
  hints:
  - La siguiente r no sale de she.
  - Conserva el sufijo he.
  solution: Desde he se consume r y se llega a her; la s completa hers.
  label: comparar
- level: 5
  statement: ¿Cómo se obtienen conteos sin enumerar coincidencias?
  hints:
  - Acumula visitas por estado.
  - Procesa los fallos desde mayor profundidad.
  solution: Suma visitas de cada estado a su fallo en orden BFS inverso. Cada terminal queda con su
    total.
  label: justificar
- level: 6
  statement: ¿Por qué reportar puede costar más que recorrer el texto?
  hints:
  - En una misma posición pueden terminar varios patrones.
  solution: El costo incluye todas las coincidencias emitidas, incluso cuando comparten posición final.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
