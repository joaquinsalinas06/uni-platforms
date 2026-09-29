---
kind: examples
title: Ejemplos
---

<!--
El mazo no trae un solo valor numérico en sus 76 páginas ("ejemplos
concretos que usa el profesor: ninguno", análisis de d4-acotar-z). Los tres
casos de abajo se derivan ejecutando a mano la descripción de #46, marcados
como tales.
-->

## Mínimo

*(derivado de la descripción del profesor; no aparece en las diapositivas)*

Dos puntos con distinto z, por ejemplo $z=2$ y $z=7$. El árbol de rango sobre z
tiene un solo nodo interno: su hijo derecho es el punto $z=7$ (satélite $D_3$
normal sobre $\{z=7\}$) y su hijo izquierdo es $z=2$ (satélite $D_3$ invertida sobre
$\{z=2\}$). Es el caso más chico donde ya hay algo que separar.

## Normal

*(derivado del pseudocódigo parametrizado; no aparece en las diapositivas)*

Ocho puntos con $z \in \{1,3,4,6,8,10,13,15\}$. El árbol de rango balanceado sobre
z tiene la raíz en la mediana ($z=6$ u $z=8$, según el criterio de partición). El
nodo raíz guarda: a la derecha, una $D_3$ normal sobre los puntos con $z \ge 8$; a
la izquierda, una $D_3$ invertida sobre los puntos con $z \le 6$. Cada uno de esos
dos subárboles repite la misma construcción recursivamente — exactamente
como $D_3$ lo hace sobre y, un nivel abajo.

## Límite

*(derivado; no aparece en las diapositivas)*

n puntos, todos con el mismo z. El árbol de rango sobre z no tiene ningún
nodo donde los caminos de búsqueda de $a_3$ y $b_3$ diverjan antes de la raíz —
degenera al peor caso de un árbol de rango 1D con claves repetidas. El
material no dice cómo $D_3$ (ni $D_1$ ni $D_2$) resuelve empates de coordenada; $D_4$
hereda el mismo hueco, no uno propio.
