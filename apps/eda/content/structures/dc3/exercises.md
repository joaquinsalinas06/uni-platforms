---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: >-
    ¿Qué clases de posiciones forman la muestra C que se ordena recursivamente en DC3?
  hints:
  - Divide cada posición entre tres y mira el resto.
  solution: >-
    Las posiciones con residuo 1 y 2, es decir $C = B_1 \cup B_2$, unos $2n/3$ elementos.
  label: reconocer
- level: 2
  statement: >-
    En mississippi, ¿qué tripletas de la muestra repiten nombre?
  hints:
  - Mira los comienzos 1 y 4, y también 2 y 5.
  solution: >-
    iss (posiciones 1 y 4) y ssi (posiciones 2 y 5).
  label: trazar
- level: 3
  statement: >-
    Para comparar un sufijo de residuo 0 con uno de residuo 1 en la mezcla, ¿cuántas letras bastan antes de consultar rangos?
  hints:
  - Quita una letra al de residuo 0 y mira en qué residuo cae.
  solution: >-
    Una. La cola cae en residuo 1 y su rango existe en la muestra, junto con el de la otra cola en residuo 2.
  label: comparar
- level: 4
  statement: >-
    Para comparar un sufijo de residuo 0 con uno de residuo 2, ¿cuántas letras hacen falta?
  hints:
  - Suma el mismo desplazamiento a ambos residuos.
  solution: >-
    Dos. Quitando dos letras, la cola de residuo 0 cae en residuo 2 y la otra en residuo 1, ambos en la muestra.
  label: comparar
- level: 5
  statement: >-
    ¿Por qué el orden de los sufijos de residuo 0 se obtiene con un radix de dos claves y no con tripletas?
  hints:
  - Piensa qué rangos ya se conocen cuando ordenas B0.
  solution: >-
    Cuando se ordena B0, los rangos de la muestra ya están calculados. El par (S[i], rnk[i+1]) basta, y no hace falta volver a leer tripletas.
  label: justificar
- level: 6
  statement: >-
    ¿Por qué reducir el problema a dos tercios da tiempo lineal?
  hints:
  - Escribe el costo total de los niveles como una suma.
  solution: >-
    Cada nivel cuesta $O(n)$ en su tamaño, y los tamaños decrecen geométricamente. La suma $n + 2n/3 + 4n/9 + \cdots$ es como mucho $3n$.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
