---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿El SA guarda sufijos completos?
  hints:
  - Distingue una referencia al texto del texto copiado.
  solution: Guarda sus posiciones iniciales en orden lexicográfico.
  label: reconocer
- level: 2
  statement: ¿Cuándo se distinguen los sufijos que empiezan en 1 y 3 de banana$?
  hints:
  - Sus dos primeros caracteres son an.
  - Compara anan con ana$.
  solution: En la ronda de longitud 4; ana$ queda antes que anan.
  label: trazar
- level: 3
  statement: ¿Qué posiciones devuelve buscar na en banana?
  hints:
  - Identifica los sufijos na y nana.
  solution: 4 y 2 en orden del arreglo de sufijos.
  label: resolver
- level: 4
  statement: ¿En qué rango termina de forma exclusiva el intervalo de ana?
  hints:
  - En el SA [6,5,3,1,0,4,2], ubica el primer sufijo posterior.
  solution: Rango 4. El intervalo es [2,4).
  label: comparar
- level: 5
  statement: ¿Por qué se usa ordenamiento estable al procesar pares de rangos?
  hints:
  - Primero se ordena por el segundo campo.
  solution: Al ordenar por el primero, los empates conservan el orden del segundo. Así se obtiene
    orden lexicográfico de pares.
  label: justificar
- level: 6
  statement: ¿Qué mejora counting sort en la duplicación?
  hints:
  - Distingue rondas de trabajo por ronda.
  solution: El número de rondas se mantiene logarítmico. Cada ronda pasa de O(n lg n) a O(n).
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
