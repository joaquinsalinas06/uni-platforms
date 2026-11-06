---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Por qué hay que reservar un bloque de salida al mezclar?
  hints:
  - Piensa cuándo se escribe al disco.
  solution: >-
    Los registros emitidos se acumulan en un bloque hasta llenarlo. Sólo al llenarse se escribe, así que sin ese bloque no hay dónde acumular la salida.
  label: reconocer
- level: 2
  statement: >-
    Con $R=27$ corridas y fan-in $F=3$, traza el número de corridas después de cada pasada hasta llegar a 1.
  hints:
  - Divide por tres en cada pasada.
  solution: >-
    $27 \to 9 \to 3 \to 1$. Son tres pasadas de mezcla.
  label: trazar
- level: 3
  statement: >-
    Mezcla $[1,4]$ y $[2,3]$ con bloques de dos registros. ¿En qué momento escribes el primer bloque de salida?
  hints:
  - Compara sólo los frentes pendientes.
  solution: >-
    Emites 1 de la primera corrida y 2 de la segunda. Con 1 y 2 el bloque de salida queda lleno, y se escribe $[1,2]$. Después emites 3 y 4.
  label: resolver
- level: 4
  statement: >-
    Con memoria para tres bloques y ocho corridas, ¿cuántas pasadas de mezcla hacen falta? Justifica el fan-in.
  hints:
  - Reserva primero el bloque de salida.
  - Sigue las cantidades de corridas pasada a pasada.
  solution: >-
    Con tres bloques, uno es de salida y quedan dos entradas: $F=2$. Entonces $8\to4\to2\to1$, es decir, tres pasadas de mezcla.
  label: comparar
- level: 5
  statement: >-
    ¿Por qué basta comparar sólo los frentes de las corridas para emitir el mínimo pendiente?
  hints:
  - Piensa qué hay detrás de cada frente.
  solution: >-
    Cada corrida está ordenada, así que todo elemento de una corrida es mayor o igual que su frente. Por tanto el mínimo global pendiente es el menor de los frentes.
  label: justificar
- level: 6
  statement: >-
    Demuestra que la cota $\Theta\left(\frac{N}{B}\log_{M/B}\frac{N}{B}\right)$ es igual a $\Theta\left(\frac{N}{B}\left(1+\log_{M/B}\frac{N}{M}\right)\right)$.
  hints:
  - Escribe $1$ como $\log_{M/B}(M/B)$.
  - Usa la suma de logaritmos con la misma base.
  solution: >-
    $1+\log_{M/B}\frac{N}{M} = \log_{M/B}\frac{M}{B} + \log_{M/B}\frac{N}{M} = \log_{M/B}\left(\frac{M}{B}\cdot\frac{N}{M}\right) = \log_{M/B}\frac{N}{B}$.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
