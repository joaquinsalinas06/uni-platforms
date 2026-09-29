---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué el range tree guarda las llaves sólo en las hojas, y por qué eso
    (y no cualquier BST balanceado) es lo que hace funcionar la
    descomposición canónica.
  - Qué es un subárbol canónico y por qué una consulta de rango produce a
    lo más O(log n) de ellos.
  - Por qué anidar dimensiones cuesta un factor O(log n) extra en espacio y
    en consulta por cada dimensión adicional (el argumento de multiplicidad,
    no una recurrencia).
  - Qué gana y qué pierde el range tree frente al arreglo ordenado de d=1
    (misma consulta, pero sí se anida).
canDo:
  - Construir de memoria el range tree 1D sobre un conjunto de llaves dado,
    incluyendo qué valor guarda cada interno.
  - Trazar Predecessor/Successor y la descomposición canónica de una
    consulta [l1,r1] arbitraria, marcando delimitadores y subárboles
    canónicos.
  - Implementar existencia, conteo y enumeración a partir de la lista de
    subárboles canónicos, sin volver a tocar el árbol completo.
  - Explicar cómo se anida el árbol secundario en 2D y extenderlo, a alto
    nivel, a d dimensiones.
---

Si algo de esta lista no sale de memoria, vuelve primero a la diapositiva
#29 (construcción) y #35 (consulta): son las dos que hay que poder
reconstruir a mano antes de tocar el código.
