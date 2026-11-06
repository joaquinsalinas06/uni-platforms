---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué codifica el patrón de un bloque?
  hints:
  - Compara las diferencias entre entradas consecutivas, no las alturas absolutas.
  solution: >-
    Los b − 1 pasos de +1 o −1 entre entradas consecutivas del bloque.
  label: reconocer
- level: 2
  statement: Si los extremos de una consulta caen en bloques consecutivos, ¿cuántas celdas micro se leen y cuántas macro?
  hints:
  - Comprueba si hay un bloque entre s y t.
  solution: >-
    Dos celdas micro, una por extremo, y ninguna macro, porque no hay bloques enteros entre ellos.
  label: trazar
- level: 3
  statement: Normaliza [10, 11, 10, 9] y escribe su patrón.
  hints:
  - Resta el valor inicial a cada entrada.
  - El patrón son los signos de las diferencias consecutivas.
  solution: >-
    [0, 1, 0, −1]. El patrón es +, −, −.
  label: resolver
- level: 4
  statement: Con b = 4, ¿cuántos patrones distintos hay y cuántas celdas tiene la tabla de un patrón?
  hints:
  - Hay b − 1 pasos, cada uno con dos valores posibles.
  - Una tabla guarda pares (l, r) con l ≤ r.
  solution: >-
    2^(b−1) = 8 patrones. Cada tabla tiene b(b+1)/2 = 10 celdas útiles.
  label: comparar
- level: 5
  statement: ¿Por qué no se pueden comparar alturas normalizadas de bloques distintos?
  hints:
  - Piensa qué valor se restó a cada bloque.
  solution: >-
    Cada bloque se normaliza restando su propia base. Las bases pueden ser distintas, así que los valores normalizados no son comparables. La normalización sirve para hallar el índice local; los candidatos se comparan después con sus alturas originales.
  label: justificar
- level: 6
  statement: Demuestra que la parte micro ocupa o(n) cuando b = ⌊lg n / 2⌋.
  hints:
  - Acota 2^(b−1) por √n.
  - Compara √n · b² con n.
  solution: >-
    2^(b−1) ≤ 2^(lg n / 2) = √n. Cada tabla tiene ≤ b² celdas. Entonces el total es ≤ √n · (lg n)² / 4, que es o(n) porque (lg n)² / √n tiende a 0.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
