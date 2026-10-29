---
kind: examples
title: Ejemplos
---

<!-- El material (#32-34) no trae ejemplos numéricos propios. Los tres casos
     de abajo son derivados del pseudocódigo/descripción del profesor. -->

## Mínimo

*(Ejemplo derivado.)* Un punto A=(4,2,3), con coordenadas (x,y,z).
La consulta [3,5]×(−∞,4]×(−∞,4] lo reporta: x=4 pertenece al intervalo,
y=2≤4 y z=3≤4. Si x quedara fuera, D₁ no recibiría este punto.

## Normal

*(Ejemplo derivado, el mismo del gráfico de teoría.)*
A=(1,5,5), B=(3,2,1), C=(4,8,4), D=(6,1,2).
Consulta [2,5]×(−∞,6]×(−∞,6]:

| punto | x∈[2,5] | y≤6 | z≤6 | resultado |
| --- | --- | --- | --- | --- |
| A | no | sí | sí | fuera |
| B | sí | sí | sí | **reportado** |
| C | sí | no | sí | fuera |
| D | no | sí | sí | fuera |

El árbol filtra x; las estructuras D₁ asociadas a los subárboles canónicos
filtran (y,z). La figura de teoría proyecta estas dos últimas coordenadas.

## Límite

*(Ejemplo derivado.)* Si todos tienen x=5, una consulta cuyo intervalo
contenga 5 delega el filtrado restante a dominancia en (y,z); si no contiene
5, no reporta ninguno. Los empates deben conservar todos los puntos, no
convertirse en una cadena desbalanceada ni eliminar duplicados por x.
