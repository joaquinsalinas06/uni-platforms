---
kind: examples
title: Ejemplos
---

## Mínimo

*(derivado; no aparece en las diapositivas)*

Puntos `{3, 4, 7, 9, 13, 15, 18, 27}`, caja $[1, 2]$: no hay predecesor de 1
ni ningún valor menor o igual a 2 en el conjunto.

- Existencia: falso — el sucesor de 1 es 3, y $3 > 2$.
- Conteo: 0.
- Enumeración: `{}` (lista vacía).

Es el caso donde las tres preguntas cuestan lo mismo: $O(\log n)$ de
búsqueda de frontera, sin ningún trabajo extra de recorrido, porque $k = 0$.

## Normal

Puntos `{3, 4, 7, 9, 13, 15, 18, 27}`, caja $[5, 16]$ — el propio ejemplo
del profesor (#29, #35, diagrama "Ejemplo de búsqueda con $[l_1,r_1] = [5,16]$").

- Sucesor de 5: 7 (índice 2). Predecesor de 16: 15 (índice 5).
- Existencia: verdadero — el sucesor de 5 (que es 7) es $\le 16$.
- Conteo: $5 - 2 + 1 = 4$.
- Enumeración: `{7, 9, 13, 15}`.

Aquí se ve la diferencia de costo con claridad: existencia y conteo se
resuelven con las dos búsquedas de frontera únicamente ($O(\log n)$);
enumeración además recorre y reporta esos 4 valores ($O(\log n + 4)$).

## Límite

*(derivado; no aparece en las diapositivas)*

Mismo conjunto, caja $[3, 27]$ (todo el rango de valores): $k = n = 8$.

- Existencia y conteo siguen costando $O(\log n)$ — no les importa que la
  respuesta sea el conjunto entero.
- Enumeración cuesta $O(\log n + n)$, es decir, prácticamente lo mismo que
  recorrer todo el conjunto por fuerza bruta.

Este es el caso patológico de la tabla de complejidad de enumeración: nada
"arregla" este costo, porque es inherente al tamaño de la respuesta — un
$k$ grande siempre exige $O(k)$ de trabajo para reportarlo, sin importar qué
tan buena sea la estructura usada para encontrar la frontera. Lo que
[range-tree](/structures/range-tree) mejora es el término $O(\log n)$ (o
$O(\log^d n)$ en $d$ dimensiones) que lo acompaña, nunca el $+\, k$.
