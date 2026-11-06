---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Puede ser terminal un nodo interno?
  hints:
  - Piensa en he dentro de hers.
  solution: Sí. Una palabra puede ser prefijo de otra.
  label: reconocer
- level: 2
  statement: ¿Cuántos nodos nuevos aparecen al insertar hers después de he?
  hints:
  - Identifica la parte compartida.
  solution: 'Dos: her y hers.'
  label: trazar
- level: 3
  statement: Busca her tras insertar hers. ¿El camino basta?
  hints:
  - Comprueba la marca en el último nodo.
  solution: No hay coincidencia exacta si her no fue marcado terminal.
  label: resolver
- level: 4
  statement: Inserta his cuando he ya existe. ¿Qué nodos nuevos aparecen?
  hints:
  - Ambos empiezan con h.
  solution: hi e his. La rama he se conserva.
  label: comparar
- level: 5
  statement: ¿Qué supuesto hace falta para que consultar m letras cueste O(m)?
  hints:
  - Cuenta lo que haces para elegir un hijo.
  solution: Elegir el hijo por carácter debe costar constante en el modelo usado.
  label: justificar
- level: 6
  statement: ¿Por qué la búsqueda depende de la longitud de la consulta?
  hints:
  - Cuenta aristas seguidas por carácter.
  solution: Se sigue a lo sumo una arista por carácter, con costo constante por decisión en el modelo
    asumido.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
