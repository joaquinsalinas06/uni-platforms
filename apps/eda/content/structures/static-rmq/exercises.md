---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: "¿Se puede usar la misma cobertura solapada de dos ventanas para calcular una suma?"
  hints:
  - Piensa qué posiciones aparecen en las dos ventanas.
  solution: "No. Las posiciones de la intersección se sumarían dos veces. Para mínimo no pasa, porque $\\min(x,x)=x$."
  label: reconocer
- level: 2
  statement: "Traza RMQ(0,4) sobre A = [5,3,8,1,9,4,7,2]. Indica el nivel y las dos ventanas."
  hints:
  - La longitud es 5. Calcula primero $k = \\lfloor \\lg 5 \\rfloor$.
  - Las ventanas de longitud $2^k$ deben caber dentro de [0,4].
  solution: "k = 2. Ventanas [0,3] y [1,4]. Ambas devuelven el índice 3, así que RMQ(0,4) = 3."
  label: trazar
- level: 3
  statement: "En A = [5,3,8,1,9,4,7,2], calcula M[2][4] y justifica la comparación."
  hints:
  - Divide [4,7] en [4,5] y [6,7].
  - Los mínimos de esas mitades se guardan en M[1][4] y M[1][6]; compara los valores de esos índices.
  solution: "M[1][4]=5 (A=9 contra A=4) y M[1][6]=7 (A=7 contra A=2). Se compara A[5]=4 con A[7]=2 y gana 7. M[2][4]=7."
  label: resolver
- level: 4
  statement: "Consulta [4,7] sobre A. ¿Las dos ventanas se solapan parcialmente o son la misma?"
  hints:
  - La longitud es 4, es decir, $2^2$.
  - Cuando la longitud es una potencia de dos, $j - 2^k + 1$ coincide con $i$.
  solution: "Son la misma ventana: M[2][4] y M[2][4]. Se puede devolver directamente 7 sin repetir la comparación."
  label: comparar
- level: 5
  statement: "Con el arreglo B = [5,3,8,1,9,1,7,2], ¿qué índice devuelve RMQ(1,6) y qué regla de empate hay que fijar al construir la tabla?"
  hints:
  - Hay dos mínimos con valor 1 en la ventana [3,6].
  - La regla debe aplicarse en la construcción y en la consulta.
  solution: "Devuelve 3. Ante empate de valor gana el índice menor; si se aplica en todas las celdas, M[2][3]=3 y la consulta es consistente."
  label: justificar
- level: 6
  statement: "Demuestra que la tabla tiene $O(n\\lg n)$ celdas, indicando cuántos niveles hay y cuántas entradas por nivel."
  hints:
  - Cuenta cuántos valores de $k$ satisfacen $2^k \\le n$.
  - En el nivel $k$, ¿cuántos inicios $i$ satisfacen $i + 2^k - 1 \\le n - 1$?
  solution: "Hay $\\lfloor \\lg n\\rfloor + 1$ niveles. El nivel $k$ tiene $n - 2^k + 1 \\le n$ entradas. Total: $(\\lfloor \\lg n\\rfloor + 1)\\cdot n = O(n\\lg n)$."
  label: demostrar
---

Antes de abrir una pista, dibuja el arreglo y escribe qué ventana o qué nivel estás calculando. Las pistas van en orden: la segunda sólo aparece si la primera no basta.
