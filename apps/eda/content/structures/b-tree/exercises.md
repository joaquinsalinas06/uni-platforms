---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué dispara la partición de una hoja?
  hints:
  - Compara el número de llaves tras insertar con la capacidad.
  solution: Exceder la capacidad B, aunque las llaves sigan en orden.
  label: reconocer
- level: 2
  statement: En [10,15,17,20], sube 15. ¿Qué queda en cada hoja?
  hints:
  - La mediana se mueve al padre.
  solution: Izquierda [10], derecha [17,20].
  label: trazar
- level: 3
  statement: Busca 45 después de promover 50 en el ejemplo de clase. ¿Qué intervalos descartas?
  hints:
  - Compara primero con 30 y 50.
  - Distingue dirigir la consulta de encontrarla.
  solution: 45 cae en el intervalo (30,50). La hoja contiene 40 y la consulta falla.
  label: resolver
- level: 4
  statement: ¿Cuándo aumenta la altura?
  hints:
  - Distingue un padre existente de una raíz.
  solution: Cuando se parte la raíz y se crea otra encima.
  label: comparar
- level: 5
  statement: En el ejemplo de raíz nueva, ¿dónde se conecta la hoja [65]?
  hints:
  - Mira el nodo interno [60,70].
  solution: En el hijo del medio, porque 60<65<70. Tras promover 40 permanece bajo el subárbol derecho.
  label: justificar
- level: 6
  statement: Justifica por qué la cascada no hace cuadrático el costo.
  hints:
  - Cuenta nodos reparados por nivel.
  solution: Sólo se propaga a un padre por nivel y cada reparación mueve O(1) bloques.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
