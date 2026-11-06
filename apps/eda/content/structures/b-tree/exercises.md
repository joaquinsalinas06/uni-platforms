---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: "Con $B = 3$, una hoja queda con cuatro llaves tras una inserción. ¿Qué pasa?"
  hints:
  - Compara el número de llaves con la capacidad de un bloque.
  solution: Se parte en dos mitades y la mediana sube al padre.
  label: reconocer
- level: 2
  statement: "Tras insertar 55 en la hoja $[40, 50, 55, 60]$ con $B = 3$, ¿qué queda en la hoja izquierda?"
  hints:
  - Identifica la mediana de las cuatro llaves.
  solution: "La hoja izquierda queda con 40; la mediana 50 sube al padre."
  label: trazar
- level: 3
  statement: "En el árbol de la lámina, ¿cuántos bloques lee la búsqueda de 75?"
  hints:
  - Cuenta un bloque por cada nivel que baja la búsqueda.
  - Son la raíz, el nodo 60·80 y una hoja.
  solution: "Tres: 40, luego 60·80, luego la hoja 70·75."
  label: resolver
- level: 4
  statement: ¿Cuándo aumenta la altura de un B-tree?
  hints:
  - Distingue partir un nodo con padre de partir la raíz.
  solution: Sólo cuando se parte la raíz y nace una raíz nueva encima de ella.
  label: comparar
- level: 5
  statement: "Tras partir la raíz $[20, 40, 60, 80]$ con $B = 3$, ¿qué llave sube y qué hijos quedan?"
  hints:
  - La mediana de cuatro llaves es la segunda.
  solution: "Sube 40. Los hijos son [20] y [60, 80]."
  label: justificar
- level: 6
  statement: "Demuestra que con $N$ llaves la altura $h$ cumple $h \\le 1 + \\log_f \\frac{N+1}{2}$."
  hints:
  - Cuenta el número mínimo de nodos en cada nivel.
  - Cada nodo no raíz guarda al menos $f-1$ llaves.
  solution: "El nivel $d$ tiene al menos $2f^{d-1}$ nodos, así que $N \\ge 2f^{h-1}-1$; despejando $f^{h-1} \\le (N+1)/2$."
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
