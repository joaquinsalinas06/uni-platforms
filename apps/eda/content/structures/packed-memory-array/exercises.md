---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué intervalo se redistribuye?
  hints:
  - Empieza por la hoja y examina los ancestros.
  solution: El primero cuya densidad admite la nueva llave.
  label: reconocer
- level: 2
  statement: ¿Admite una mitad de 8 celdas sus 8 llaves con umbral 7/8?
  hints:
  - Calcula 8/8.
  solution: No, se debe examinar el siguiente ancestro.
  label: trazar
- level: 3
  statement: Una hoja de 4 ya contiene 4 llaves. ¿Alcanza con moverlas para agregar otra?
  hints:
  - Calcula la ocupación después de agregar.
  solution: No. Cinco llaves en cuatro celdas exceden la capacidad; busca un ancestro.
  label: resolver
- level: 4
  statement: La raíz tiene capacidad 16 y umbral 3/4. ¿Qué pasa con 13 llaves?
  hints:
  - Compara 13/16 con 12/16.
  solution: La raíz supera el umbral. Redistribuir sin cambiar capacidad conserva la densidad.
  label: comparar
- level: 5
  statement: Si el hijo tiene m celdas y la holgura de densidad es 1/(4h), ¿cuántos cambios la agotan?
  hints:
  - Cada inserción agrega densidad 1/m.
  solution: Del orden de m/(4h), lo que permite cobrar O(h) a cada cambio por una reescritura O(m).
  label: justificar
- level: 6
  statement: ¿Por qué no se carga O(N) a todas las inserciones?
  hints:
  - Tras redistribuir, cuenta las nuevas inserciones necesarias para llenar el margen.
  solution: Las inserciones intermedias pagan juntas la siguiente redistribución del mismo nivel.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
