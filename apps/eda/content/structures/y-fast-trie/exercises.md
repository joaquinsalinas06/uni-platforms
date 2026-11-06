---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué se guarda en X-fast?
  hints:
  - Distingue un grupo de todas sus llaves.
  solution: Los representantes de los grupos.
  label: reconocer
- level: 2
  statement: Traza el predecesor de 17 en los grupos del primer ejemplo.
  hints:
  - Busca el primer máximo ≥17.
  - Compara con el menor del grupo elegido.
  solution: El índice elige G2 y no hay candidato local. El máximo de G1 es 15.
  label: trazar
- level: 3
  statement: Con grupos [1,4,7], [10,13,15], [18,20,23], ¿cuál es el predecesor de 9?
  hints:
  - El índice elige por máximo.
  - Comprueba el mínimo del grupo.
  solution: Elige el segundo grupo, que no tiene candidato menor que 9. Devuelve 7 del grupo anterior.
  label: resolver
- level: 4
  statement: Al dividir [10,11,12,13,15] en dos grupos como en la traza, ¿qué cambia arriba?
  hints:
  - Mira los máximos de ambas mitades.
  solution: Se conserva 15 y se añade 11.
  label: comparar
- level: 5
  statement: ¿Por qué una reconstrucción O(w) no se cobra a todas las actualizaciones?
  hints:
  - Tras dividir queda holgura.
  solution: Se reparte entre Ω(w) cambios del grupo, que suman cargo amortizado constante por reconstrucción.
  label: justificar
- level: 6
  statement: ¿De dónde sale el espacio lineal?
  hints:
  - Multiplica número de representantes por prefijos por representante.
  solution: O(n/w)·O(w)=O(n), además del almacenamiento lineal de las llaves.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
