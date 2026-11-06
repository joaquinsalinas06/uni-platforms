---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: "En el trie de $\\{$he, she, his, hers$\\}$, ¿cuántas hojas hay?"
  hints:
  - Una hoja es un nodo sin hijos. Mira las cuatro palabras, no los prefijos.
  solution: "Tres: she, his y hers. La hoja he no existe porque he tiene hijo r; her es interno."
  label: reconocer
- level: 2
  statement: "¿Cuántas aristas recorre la búsqueda de hers, y cuántas la de hera antes de fallar?"
  hints:
  - Cuenta una arista por cada letra que se consume.
  solution: "hers recorre 4 aristas y termina en un nodo marcado. hera recorre 3 aristas y falla en la cuarta letra."
  label: trazar
- level: 3
  statement: Describe en prosa, sin código, el procedimiento que decide si una cadena pertenece al conjunto y no sólo es prefijo.
  hints:
  - Piensa qué pasa al terminar de leer la cadena, no sólo al encontrar un nodo.
  solution: >-
    Recorrer la cadena letra por letra desde la raíz. Si en algún paso falta el hijo de la letra, la cadena no está ni es prefijo. Si el recorrido termina, la cadena pertenece al conjunto solamente cuando el último nodo está marcado como terminal.
  label: resolver
- level: 4
  statement: "Con he ya insertada, ¿qué nodos nuevos aparecen al insertar his? ¿Cuántos nodos nuevos crea la inserción?"
  hints:
  - Las letras h y la e de he ya existen. Lo que falta es lo que sale de h hacia i.
  solution: >-
    Se crean hi y his, es decir, 2 nodos. La h se reutiliza y no se crea nada bajo he.
  label: comparar
- level: 5
  statement: ¿Qué supuesto de modelo hace falta para que insertar una cadena S cueste O(|S|)?
  hints:
  - Cuenta lo que haces en cada letra para elegir o crear el hijo correspondiente.
  solution: >-
    Que consultar o crear un hijo con una etiqueta tome tiempo constante, por ejemplo con un arreglo indexado por el alfabeto o una tabla hash. Si el hijo se busca en una lista de hasta |Sigma| entradas, el costo por letra es O(|Sigma|).
  label: justificar
- level: 6
  statement: "Demuestra que un trie para $\\{S_1, \\ldots, S_k\\}$ tiene a lo más $1 + \\sum_i |S_i|$ nodos."
  hints:
  - Asocia cada nodo no raíz a una cadena y a una longitud. ¿Qué prefijo es?
  - Cada cadena S_i tiene |S_i| prefijos no vacíos.
  solution: >-
    Cada nodo distinto de la raíz es un prefijo no vacío de alguna S_i. Cada S_i tiene exactamente |S_i| prefijos no vacíos, así que hay a lo más sum |S_i| nodos no raíz. Sumando la raíz, el total es a lo más 1 + sum |S_i|.
  label: demostrar
---

Antes de abrir una pista, dibuja el trie en el estado inicial y escribe qué unidad de trabajo vas a contar: aristas, letras o nodos nuevos.
