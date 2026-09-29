---
kind: examples
title: Ejemplos
---

*(Ninguno de los tres ejemplos aparece numéricamente en las diapositivas; el
profesor no da un conjunto de puntos concreto para $D_3$ — derivados aplicando
la construcción y el algoritmo descritos en la teoría.)*

## Mínimo

*(derivado; no aparece en las diapositivas)*

Tres puntos con y = {2, 5, 8}. El árbol de rango sobre y tiene la mediana
(5) como raíz, con 2 a la izquierda y 8 a la derecha. Para una consulta
$[a_2,b_2] = [3,7]$: $a_2=3$ va a la izquierda de la raíz (5), $b_2=7$ va a la
derecha — se separan **en la raíz**. $v_{\text{split}}$ es la raíz; `derecha(v_split)`
= {8} (con su $D_2$ normal), `izquierda(v_split)` = {2} (con su $D_2'$ invertida).
Un solo nodo, cero descensos adicionales.

## Normal

*(derivado; no aparece en las diapositivas)*

Siete puntos con y = {1, 3, 4, 6, 8, 9, 11}, árbol balanceado con raíz 6
(hijos 3 y 9; nietos 1/4 y 8/11). Consulta $[a_2,b_2] = [4,8]$:

- En la raíz (6): $a_2=4 \le 6$ → izquierda; $b_2=8 > 6$ → derecha. Se separan
  **en la raíz**: $v_{\text{split}} = 6$.
- `derecha(v_split)` = subárbol de 9 = {8, 9, 11}. Todo ese subárbol ya
  cumple $y \ge 4$ (porque son $> 6 > 4$); la consulta $D_2$ normal sólo filtra
  $y \le 8$ → sobrevive {8}.
- `izquierda(v_split)` = subárbol de 3 = {1, 3, 4}. Todo ya cumple $y \le 8$
  (porque son $\le 6 < 8$); la consulta $D_2'$ invertida sólo filtra $y \ge 4$ →
  sobrevive {4}.
- Resultado: {4, 8}, en dos consultas, sin bajar más allá de la raíz.

## Límite

*(derivado; no aparece en las diapositivas)*

El caso que $D_3$ existe para evitar es el que describe #36: si en vez del nodo
de separación se usara la descomposición canónica de siempre para acotar
y, harían falta $O(\lg n)$ nodos canónicos en y, cada uno dentro de los
$O(\lg n)$ nodos canónicos que ya usa [D₂](/structures/d2-bound-x) para
acotar x — $O(\lg^2 n)$ consultas en total, exactamente el factor que $D_3$
recupera. Con los mismos siete puntos de arriba, la descomposición canónica
en y para $[4,8]$ necesitaría los subárboles {4}, {6,8} y similares por
separado en vez de las dos satélites de un único nodo.
