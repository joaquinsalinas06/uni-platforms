---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué bits quedan en el sketch?
  hints:
  - Ubica las bifurcaciones del trie de las llaves almacenadas.
  solution: Las posiciones que distinguen ramas entre las llaves del nodo.
  label: reconocer
- level: 2
  statement: ¿Cuál es el predecesor de 0100 en el ejemplo?
  hints:
  - Compara las palabras completas.
  solution: '0010.'
  label: trazar
- level: 3
  statement: Extrae los bits 3 y 1 de 1010.
  hints:
  - Numera bits desde el menos significativo.
  solution: Ambos bits son 1. Su sketch es 11.
  label: resolver
- level: 4
  statement: Compara 0100 y 0010 completos. ¿Qué bit decide que el sketch omitió?
  hints:
  - Empieza por el bit 3 y avanza hacia la derecha.
  solution: El bit 2 es el primer distinto. 0100 es mayor.
  label: comparar
- level: 5
  statement: ¿Qué se pierde si un nodo revisa sus separadores uno por uno?
  hints:
  - Multiplica costo por nivel por altura.
  solution: Aunque la altura sea O(log_w n), cada nivel cuesta hasta el grado del nodo. El argumento
    de costo constante por nodo ya no vale.
  label: justificar
- level: 6
  statement: Justifica el denominador lg w al calcular la altura.
  hints:
  - Escribe el grado como w elevado a una constante.
  solution: Dividir lg n por lg(w^c)=c·lg w da altura O(log_w n).
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
