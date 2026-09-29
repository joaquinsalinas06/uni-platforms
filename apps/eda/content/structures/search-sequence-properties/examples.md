---
kind: examples
title: Ejemplos
---

<!--
Los tres ejemplos numéricos son los únicos datos concretos de todo el mazo
(#35, #36, #43) — no hay que derivar nada, son literalmente los puntos de
los tres gráficos de dispersión. El caso límite sí es derivado, marcado
como tal.
-->

## Mínimo

**Acceso secuencial** (#30, #35): la secuencia de búsqueda
$\{1, 2, 3, 4, 5, 6\}$ — literalmente $x_i = i$ para toda i.

Como $x_i - x_{i-1} = 1$ para todo i, la propiedad del puntero dinámico da
$k_i = 1$ en cada paso, así que por el **Lema 1** ("la propiedad del puntero
dinámico implica la propiedad de acceso secuencial") esta secuencia también
cumple acceso secuencial con $O(1)$ amortizado por búsqueda — que es
exactamente lo que enuncia la propiedad directamente, sin necesidad del
lema. Es el caso mínimo porque las dos propiedades coinciden.

## Normal

**Puntero dinámico** (#32, #36): la secuencia $\{1, 3, 2, 5, 4, 6\}$.

Los saltos consecutivos son $k_2=2, k_3=1, k_4=3, k_5=1, k_6=2$ (con
$k_i = |x_i - x_{i-1}|$). Ninguno es 1 en todos los pasos —a diferencia del
caso mínimo— así que esta secuencia **no** cumple la propiedad de acceso
secuencial en general, pero sí cumple la propiedad del puntero dinámico con
$O(\log k_i)$ amortizado por búsqueda en cada paso: nunca peor que
$O(\log 3)$ aquí, mucho más barato que el $O(\log n)$ del peor caso general.

## Límite

**Conjunto de trabajo** (#38, #43): la secuencia $\{1, 3, 7, 3, 2, 3\}$.

Aquí el valor `3` se repite en las posiciones $i=2, 4, 6$. La propiedad del
conjunto de trabajo mide $t_i$ = "valores diferentes buscados desde la
última vez que se buscó $x_i$":

- en $i=4$ ($x_4 = 3$), la última vez que se buscó 3 fue en $i=2$; entre
  medio sólo se buscó `7` ($i=3$), así que $t_4 = 1$ ⇒ costo $O(\log 1) =
  O(1)$ amortizado.
- en $i=6$ ($x_6 = 3$), la última vez que se buscó 3 fue en $i=4$; entre
  medio sólo se buscó `2` ($i=5$), así que $t_6 = 1$ ⇒ también $O(1)$
  amortizado.

Es el caso límite en el sentido de que esta secuencia **no** cumple ni
acceso secuencial (no es $\{1,\dots,n\}$ en orden) ni puntero dinámico de forma
ajustada ($|x_3 - x_2| = |7-3| = 4$, $|x_5 - x_4| = |2-3| = 1$: salta entre
grande y chico) — el comentario del profesor de que puntero dinámico y
conjunto de trabajo son "ortogonales" se ve aquí directamente: esta
secuencia es fácil para conjunto de trabajo precisamente en los puntos
donde no es fácil para puntero dinámico.

*(derivado del pseudocódigo; no aparece en las diapositivas: el cálculo
explícito de $t_4$ y $t_6$ no está en el mazo, sólo los seis puntos del
gráfico #43.)*
