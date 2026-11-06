---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Por qué se puede hacer búsqueda binaria en las longitudes?
  hints:
  - Quitar el último bit preserva la existencia.
  solution: Los prefijos existentes forman un intervalo inicial.
  label: reconocer
- level: 2
  statement: Consulta 1010 en el ejemplo. ¿Qué ocurre al llegar a longitud 4?
  hints:
  - Existe una hoja exacta.
  - La pregunta es por vecinos estrictos.
  solution: Sus vecinos son 1001 y 1100.
  label: trazar
- level: 3
  statement: Para 1000, ¿qué extremo se usa al faltar la rama izquierda?
  hints:
  - El subárbol disponible queda a la derecha.
  solution: Su mínimo, 1001, da el sucesor.
  label: resolver
- level: 4
  statement: Si el prefijo de longitud 3 no existe, ¿qué ocurre con el de 4?
  hints:
  - Toda palabra de longitud 4 tiene un padre de longitud 3.
  solution: Tampoco existe. Reduce la longitud buscada.
  label: comparar
- level: 5
  statement: ¿Por qué insertar puede costar más que buscar?
  hints:
  - Distingue consultar longitudes de crear nodos.
  solution: La búsqueda usa O(lg w) consultas, pero una inserción puede añadir Θ(w) prefijos a sus
    diccionarios.
  label: justificar
- level: 6
  statement: ¿Por qué la consulta no se declara O(lg w) de peor caso con hashing ordinario?
  hints:
  - Separa el número de consultas de su costo individual.
  solution: Las consultas de diccionario son esperadas O(1) en ese modelo.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
