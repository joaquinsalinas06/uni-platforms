---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Cuál es el predecesor estricto de 2 en {2,5,9,13}?
  hints:
  - Busca sólo llaves menores que 2.
  solution: No existe.
  label: reconocer
- level: 2
  statement: Divide 10 en dos partes de dos bits.
  hints:
  - 10 se escribe 1010.
  solution: Prefijo 10 y sufijo 10. El grupo es 8–11 y el desplazamiento es 2.
  label: trazar
- level: 3
  statement: Para q=5 en {2,5,9}, da predecesor estricto y no estricto.
  hints:
  - Sólo una convención permite la igualdad.
  solution: Estricto 2; no estricto 5.
  label: resolver
- level: 4
  statement: Si 14 se divide en grupos de cuatro, ¿qué clúster y desplazamiento se obtienen?
  hints:
  - Usa cociente y resto de 14 entre 4.
  solution: Clúster 3, desplazamiento 2.
  label: comparar
- level: 5
  statement: ¿Qué puede dejar de ser válido al pasar de word RAM a pointer machine?
  hints:
  - Identifica una operación que usa la representación binaria completa.
  solution: Extraer y procesar bits empaquetados como una sola palabra ya no está garantizado en constante.
  label: justificar
- level: 6
  statement: ¿Por qué una cota en cell probe no cuenta comparaciones de CPU?
  hints:
  - Identifica qué operación cobra el modelo.
  solution: Sólo se cobran accesos a celdas; el cálculo entre accesos se considera gratuito.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
