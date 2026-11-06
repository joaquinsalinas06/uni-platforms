---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué se mantiene contiguo?
  hints:
  - Observa qué produce cada corte.
  solution: Cada fragmento de la descomposición recursiva.
  label: reconocer
- level: 2
  statement: Traza buscar 5 en el ejemplo.
  hints:
  - Decide derecha desde 4 e izquierda desde 6.
  solution: Visita 4, 6 y 5.
  label: trazar
- level: 3
  statement: En el arreglo [4,2,1,3,6,5,7], ¿qué posiciones visita buscar 3?
  hints:
  - Primero traza el BST, después consulta posiciones físicas.
  solution: Visita llaves 4,2,3 en posiciones 0,1,3.
  label: resolver
- level: 4
  statement: Con B=2, ¿cuántos bloques toca el fragmento en posiciones [1,2]?
  hints:
  - Las fronteras de bloque están antes de 0, 2, 4…
  solution: Dos. Aunque el fragmento mide B, comienza desalineado.
  label: comparar
- level: 5
  statement: ¿Qué cantidad de niveles explica la mejora de una búsqueda?
  hints:
  - Fija el tamaño de bloque para analizar.
  - Busca fragmentos máximos que quepan.
  solution: Cada fragmento atravesado aporta del orden de lg B niveles en el análisis del árbol completo.
    Se divide la altura total por esa cantidad.
  label: justificar
- level: 6
  statement: ¿Por qué un fragmento de B celdas puede costar dos lecturas?
  hints:
  - Prueba un comienzo cerca del fin de bloque.
  solution: El intervalo puede cruzar un límite físico, pero a lo sumo uno.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
