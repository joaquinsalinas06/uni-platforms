---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Cuál es la banda de densidad de un nodo a profundidad $d = 1$ cuando $h = 3$?
  hints:
  - Sustituye en $\frac{1}{2} - \frac{1}{4}\cdot\frac{d}{h}$ y en $\frac{3}{4} + \frac{1}{4}\cdot\frac{d}{h}$.
  solution: "$[5/12,\\ 5/6]$. Inferior $1/2 - (1/4)(1/3) = 5/12$; superior $3/4 + (1/4)(1/3) = 5/6$."
  label: reconocer
- level: 2
  statement: En el arreglo de la teoría, ¿por qué la inserción de 26 no sube al padre?
  hints:
  - Calcula la densidad del trozo 1 después de insertar.
  solution: El trozo 1 queda en 4/4 = 1, dentro de la banda de hoja, que llega hasta 1.
  label: trazar
- level: 3
  statement: Un nodo de 8 celdas tiene 7 llaves y llega una llave nueva que cae dentro de él. Con $d = 1$ y $h = 2$, ¿basta con su umbral?
  hints:
  - Calcula 8/8 y compara con 7/8.
  solution: No. 8/8 = 1 > 7/8. Hay que subir al primer ancestro que cumpla.
  label: resolver
- level: 4
  statement: Un nodo en la raíz y otro a profundidad $d = 1$, ambos con densidad 5/8 y con $h = 2$. ¿Cuál tiene más holgura antes de repartirse al insertar?
  hints:
  - La raíz tiene umbral superior 3/4; el nivel medio, 7/8.
  solution: El de profundidad 1. Su holgura es 7/8 − 5/8 = 1/4, frente a 3/4 − 5/8 = 1/8 en la raíz.
  label: comparar
- level: 5
  statement: Si el hijo tiene $m$ celdas y la holgura de densidad es $\frac{1}{4h}$, ¿cuántas inserciones la agotan?
  hints:
  - Cada inserción agrega $1/m$ de densidad al hijo.
  solution: Más de $\frac{m}{4h}$ inserciones, porque cada una agrega $1/m$ y la holgura es $\frac{1}{4h}$.
  label: justificar
- level: 6
  statement: ¿Por qué la cota amortizada de insertar es $O(\lg^2 N)$ y no $O(N)$?
  hints:
  - Cuenta cuántos cobros recibe una misma actualización y cuánto cuesta cada uno.
  solution: Cada actualización paga como mucho $h = O(\lg N)$ cobros, uno por ancestro, y cada cobro es $\frac{2m}{m/(4h)} = 8h = O(\lg N)$.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
