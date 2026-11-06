---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Por qué B aparece más de una vez?
  hints:
  - Anota el extremo de cada movimiento.
  solution: Se registra al entrar y al retornar desde cada hijo.
  label: reconocer
- level: 2
  statement: Resuelve LCA(E,C) en el ejemplo.
  hints:
  - Usa sus primeras posiciones, 4 y 7.
  solution: La profundidad mínima es 0 en A.
  label: trazar
- level: 3
  statement: ¿Cuántas entradas de Euler produce un árbol con cinco nodos?
  hints:
  - Cuenta movimientos de ida y vuelta.
  solution: 'Nueve: una entrada inicial y ocho movimientos.'
  label: resolver
- level: 4
  statement: Consulta LCA(B,E) sobre la traza de clase.
  hints:
  - Busca las primeras posiciones 1 y 4.
  solution: La profundidad mínima del intervalo es 1 y corresponde a B.
  label: comparar
- level: 5
  statement: ¿Por qué una lista con sólo las primeras visitas puede fallar?
  hints:
  - Mira el tramo entre D y E.
  solution: Omitir retornos borra la aparición intermedia de B, que es el ancestro correcto.
  label: justificar
- level: 6
  statement: ¿Qué garantiza la propiedad ±1?
  hints:
  - Cada transición del recorrido cruza una arista.
  solution: Bajar aumenta una unidad de profundidad y subir la reduce en una unidad.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
