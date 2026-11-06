---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué codifica un patrón micro?
  hints:
  - Compara las diferencias, no las alturas absolutas.
  solution: Los b−1 pasos de +1 o −1 entre entradas consecutivas.
  label: reconocer
- level: 2
  statement: ¿Cuántas respuestas se combinan si los extremos están en bloques consecutivos?
  hints:
  - Comprueba si hay un bloque interior.
  solution: Sólo dos respuestas micro, una por extremo.
  label: trazar
- level: 3
  statement: Normaliza [10,11,10,9].
  hints:
  - Resta el valor inicial a cada entrada.
  solution: '[0,1,0,−1], patrón +,−,−.'
  label: resolver
- level: 4
  statement: Para [3,9] en [3,4,3,4 | 3,2,1,2 | 3,4,5,4], ¿qué candidato gana?
  hints:
  - Evalúa izquierda, medio y derecha por separado.
  solution: Gana el bloque interior. El mínimo es 1 en índice 6.
  label: comparar
- level: 5
  statement: ¿Por qué no comparas alturas normalizadas de bloques distintos?
  hints:
  - Piensa qué valor se restó a cada bloque.
  solution: Las bases pueden ser distintas. La normalización sirve para hallar el índice local; se
    comparan después las alturas originales.
  label: justificar
- level: 6
  statement: ¿Por qué se usa aproximadamente la mitad de lg n para b?
  hints:
  - Evalúa 2^b y n/b por separado.
  solution: Así hay O(√n) patrones y O(n/lg n) bloques. La parte micro es sublineal y la macro, lineal.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
