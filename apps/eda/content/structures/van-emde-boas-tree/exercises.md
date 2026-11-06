---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Dónde vive el mínimo global 2 en el estado de clase?
  hints:
  - Distingue el campo min de los clústeres.
  solution: En V.min, fuera de los clústeres. Ningún clúster lo contiene.
  label: reconocer
- level: 2
  statement: Traza Sucesor(7) en el estado de clase. ¿Qué clúster se recorre y qué devuelve el resumen?
  hints:
  - 7 = ⟨1,3⟩ y el máximo del clúster 1 es 3.
  - Compara el sufijo 3 con ese máximo antes de decidir la rama.
  solution: El sufijo 3 no es menor que el máximo 3, así que se consulta el resumen. El siguiente clúster ocupado es el 3 y su mínimo local 2 recompone 4·3+2 = 14.
  label: trazar
- level: 3
  statement: Para Sucesor(5), ¿qué comparación evita consultar el resumen?
  hints:
  - Compara el sufijo de 5 con el máximo del clúster 1.
  solution: Con sufijo 1 y máximo 3, la condición 1 menor que 3 se cumple. Basta recurrir dentro del clúster 1 y el resumen no se consulta.
  label: resolver
- level: 4
  statement: Borra el mínimo 2 del estado de clase. ¿Qué pasa con el resumen y con el mínimo?
  hints:
  - Busca el primer clúster ocupado con el resumen.
  - Comprueba si el clúster queda vacío tras sacar su elemento.
  solution: >-
    El nuevo mínimo es 3, que estaba en el clúster 0. Ese clúster queda vacío, así que su índice 0 sale del resumen: {0,1,3} pasa a {1,3}.
  label: comparar
- level: 5
  statement: Si el universo tiene $u = 2^{32}$, ¿cuántos niveles de división hay hasta el caso base $u = 2$?
  hints:
  - Escribe los bits 32, 16, 8, 4, 2, 1 hasta llegar a un bit.
  solution: Cinco divisiones de palabra hasta el caso base de 2 valores. Con $w = \lg u$, la altura crece como $\lg w$, es decir, $O(\lg\lg u)$.
  label: justificar
- level: 6
  statement: ¿Por qué insertar en un clúster vacío sólo deja una llamada costosa?
  hints:
  - Identifica qué campo del clúster vacío se puede inicializar directamente.
  - Piensa en qué pasa con el resumen en ese caso.
  solution: Al estar vacío, el clúster fija min y max en constante. La única recursión costosa es insertar el índice del clúster en el resumen.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
