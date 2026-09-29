---
kind: examples
title: Ejemplos
---

<!-- El profesor no da valores numéricos: "no hay un solo valor concreto en
     las 76 páginas" del deck. Los tres ejemplos siguientes están derivados
     ejecutando a mano la reformulación de rayos y ConsultaDominancia. -->

## Mínimo

*(derivado del pseudocódigo; no aparece en las diapositivas)*: un solo punto
`(3,3)` y consulta `(b2,b3) = (5,5)`. La búsqueda binaria de `b3=5` en la
columna izquierda no encuentra nada a su izquierda (no hay puntos antes de
`y=3`); la caminata cruza la única columna (`y=3`, rayo en `z=3 ≤ 5`) y se
detiene al llegar a `b2=5`. Resultado: `{(3,3)}`, `k=1`. Es el caso más
pequeño donde ya se ve la caminata completa: búsqueda binaria + un paso.

## Normal

*(derivado del pseudocódigo)*: puntos `(1,5), (2,1), (4,4), (5,2)`, consulta
`(b2,b3) = (4,4)`. Trazado paso a paso (igual que en
[dominance-query](/structures/dominance-2d/operations/dominance-query)):

| columna (`y`) | rayo (`z`) | `z ≤ b3=4`? | `y ≤ b2=4`? | ¿se reporta? |
| --- | --- | --- | --- | --- |
| 1 | 5 | no | sí | no |
| 2 | 1 | sí | sí | **sí** |
| 4 | 4 | sí | sí | **sí** |
| 5 | 2 | sí | no (detiene la caminata) | no |

Resultado: `{(2,1), (4,4)}`, `k=2`. La caminata se detiene exactamente al
llegar a `y=5`, sin necesidad de evaluar ese rayo — es la posición horizontal
la que corta el recorrido, no el valor de `z`.

## Límite

*(derivado del pseudocódigo)*: los mismos cuatro puntos, pero con la
consulta `(b2,b3) = (0,0)` — ningún punto tiene `y_i ≤ 0` ni `z_i ≤ 0`. La
búsqueda binaria inicial sigue costando $O(\lg n)$, pero la caminata se
detiene de inmediato porque ya la primera columna (`y=1`) no es `< b2=0`:
`k=0`, y el costo es puro $O(\lg n)$ sin ningún paso de caminata. Es el caso
patológico opuesto al de "todos dominados": aquí el término $O(k)$ se anula
por completo y sólo queda la búsqueda binaria, que es justamente la cota que
[d2-bound-x](/structures/d2-bound-x) necesita heredar al acotar `y` con una
estructura externa antes de llegar aquí.
