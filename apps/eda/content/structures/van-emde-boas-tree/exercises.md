---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Dónde vive el mínimo global 2?
  hints:
  - Distingue el campo min del contenido de los clústeres.
  solution: En min, fuera de los clústeres.
  label: reconocer
- level: 2
  statement: Traza el sucesor de 7.
  hints:
  - El máximo del clúster 1 es 7.
  - El clúster 2 está vacío en el estado inicial.
  solution: El resumen devuelve el clúster 3; su mínimo recompone 14.
  label: trazar
- level: 3
  statement: Para sucesor de 5, ¿qué comparación evita consultar el resumen?
  hints:
  - Compara low(5)=1 con el máximo del clúster 1.
  solution: El máximo 3 supera 1, así que basta recurrir dentro de ese clúster.
  label: resolver
- level: 4
  statement: Borra el mínimo 2 del estado de clase. ¿Qué pasa con el resumen?
  hints:
  - Busca el primer clúster ocupado.
  - Comprueba si queda vacío.
  solution: 3 sube a mínimo. El clúster 0 se vacía y el resumen pasa de {0,1,3} a {1,3}.
  label: comparar
- level: 5
  statement: ¿Cuántas divisiones aproximadas de palabra hay si w=32?
  hints:
  - Escribe 32,16,8,… hasta el caso base.
  solution: Aproximadamente cinco divisiones hasta uno. Esto crece como lg w, es decir, lg lg u.
  label: justificar
- level: 6
  statement: ¿Por qué insertar en un clúster vacío no desencadena dos llamadas caras?
  hints:
  - Identifica qué campo se puede inicializar directamente.
  solution: Se fijan min y max del clúster en constante. Sólo la inserción del índice en el resumen
    puede recurrir.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
