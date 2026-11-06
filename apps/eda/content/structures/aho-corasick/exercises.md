---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  label: reconocer
  statement: ¿Por qué fail(sh) = h en el trie de he, she, his, hers?
  hints:
  - Busca el mayor sufijo propio de sh que también sea nodo del trie.
  solution: h es nodo del trie y es sufijo propio de sh. El sufijo de longitud dos no existe como sufijo propio, así que h es el más largo.
- level: 2
  label: trazar
  statement: Traza el texto hiss sobre el trie de he, she, his, hers. ¿Qué se reporta y en qué posición?
  hints:
  - Tras leer h e i, el estado es hi.
  - Después de la segunda s, mira si his puede seguir con s por fallo.
  solution: Se reporta his en la posición 2. La segunda s desde his no tiene hijo, así que va por fallo a s, y desde s la letra s no tiene hijo; el estado queda en s y no se reporta nada más.
- level: 3
  label: resolver
  statement: Calcula dic(she) y dic(hers). ¿Qué se reporta al leer she en un texto?
  hints:
  - dic salta al primer terminal de la cadena de fallos, sin contar al nodo mismo.
  - Mira si fail(hers) es terminal.
  solution: dic(she) = he, porque fail(she) = he es terminal. dic(hers) no existe, porque fail(hers) = s no es terminal y dic(s) tampoco. Al leer she se reportan she y he.
- level: 4
  label: comparar
  statement: Calcula δ(she, r) con la tabla completa y explica por qué pasa por he.
  hints:
  - she no tiene hijo r.
  - Por la regla de la tabla, δ(she, r) = δ(fail(she), r).
  solution: δ(she, r) = δ(he, r) = her, porque she no tiene hijo r y su fallo es he, que sí tiene hijo r.
- level: 5
  label: justificar
  statement: ¿Por qué la tabla completa cuesta O(V|Σ|) y no más? Cuenta las celdas del ejemplo de clase.
  hints:
  - Cuenta cuántas celdas tiene cada nodo, una por letra.
  - Mira cuántos nodos hay en el trie, incluida la raíz.
  solution: Cada nodo tiene una celda por letra del alfabeto. En el ejemplo son 10 nodos por 5 letras, 50 celdas, y cada celda se calcula en O(1) a partir de una celda ya calculada del fallo.
- level: 6
  label: demostrar
  statement: Demuestra que la búsqueda cuesta O(n + z) y no O(n·k) con k patrones.
  hints:
  - Cuenta las consultas a δ, una por letra del texto.
  - Cada paso de la cadena dic produce una coincidencia.
  solution: Hay exactamente n consultas a δ, de costo O(1) cada una. Cada salto de dic reporta una coincidencia distinta, así que la cadena suma z pasos en total. El número de patrones k no aparece en la cuenta.
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
