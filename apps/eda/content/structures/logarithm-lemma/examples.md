---
kind: examples
title: Ejemplos
---

<!--
El material (#29-30) enuncia el lema, lo demuestra por AM-GM y lo aplica al
zig-zig, pero NUNCA lo instancia con números: no hay una sola cuenta
aritmética concreta en las diapositivas. Los tres ejemplos de abajo están
derivados a mano del enunciado; ninguno aparece en el mazo. Los logaritmos
están redondeados a tres decimales.
-->

Recordatorio del enunciado (#29): si $a, b > 0$ y $a + b \le c$, entonces
$\lg a + \lg b \le 2 \lg c - 2$.

## Mínimo

*(derivado del enunciado; no aparece en las diapositivas)*

Los números positivos más pequeños posibles: $a = b = 1$, $c = 2$.

| cantidad | valor |
| --- | --- |
| lado izquierdo | $\lg 1 + \lg 1 = 0 + 0 = 0$ |
| lado derecho | $2 \lg 2 - 2 = 2 - 2 = 0$ |
| holgura | $0$ |

Se cumple **con igualdad**, y no por casualidad: $a = b = c/2$ es exactamente
el caso de igualdad que señala el profesor (#29). Es el ejemplo más pequeño
que ya muestra que la constante $-2$ no se puede mejorar — con un $-3$ en su
lugar, el lema sería falso aquí mismo.

La instancia mínima **dentro de la aplicación** es el zig-zig sobre tres
nodos pelados (A, B, C, D vacíos):

```
antes:        después:

    z             x
   /               \
  y                 y
 /                   \
x                     z
```

- $a = s'(z) = 1$ (sólo z, que quedó de hoja)
- $b = s(x) = 1$ (sólo x, que antes era hoja)
- $c = s'(x) = 3$ (x, y, z: el árbol entero)

Hipótesis: $1 + 1 = 2 \le 3$ ✓ (sobra el nodo $y$, como siempre en la
aplicación). Conclusión: $0 + 0 = 0 \le 2 \lg 3 - 2 = 1.170$. Se cumple con
holgura $1.170$.

## Normal

*(derivado del enunciado; no aparece en las diapositivas)*

El caso típico: un contenedor fijo $c = 8$ y los cuatro repartos enteros
posibles de $a + b = 8$. La cota es siempre la misma,
$2 \lg 8 - 2 = 6 - 2 = 4$:

| $a$ | $b$ | $\lg a$ | $\lg b$ | $\lg a + \lg b$ | cota | holgura |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 7 | 0.000 | 2.807 | **2.807** | 4 | 1.193 |
| 2 | 6 | 1.000 | 2.585 | **3.585** | 4 | 0.415 |
| 3 | 5 | 1.585 | 2.322 | **3.907** | 4 | 0.093 |
| 4 | 4 | 2.000 | 2.000 | **4.000** | 4 | **0.000** |

Dos lecturas de la tabla:

1. La suma **crece** conforme el reparto se empareja, y alcanza su máximo en
   $a = b = 4 = c/2$. Es la afirmación del profesor (#29) verificada renglón
   por renglón.
2. Lo caro no es que uno de los dos sea grande — es que los dos lo sean *a la
   vez*. El renglón $1{+}7$ tiene el bloque más grande de toda la tabla y aun
   así es el que menos suma: $\lg 1 = 0$ arrastra el total hacia abajo.

Es exactamente lo que el análisis del zig-zig necesita: el peor caso del
paso es cuando el subárbol de $z$ (después) y el de $x$ (antes) se reparten el
contenedor por mitades.

## Límite

*(derivado del enunciado; no aparece en las diapositivas)*

**Límite 1 — la hipótesis estricta, $a + b < c$.** Tomando $a = 2$, $b = 3$,
$c = 100$: $2 + 3 = 5 < 100$ ✓, y

$$\lg 2 + \lg 3 = 1.000 + 1.585 = 2.585 \quad \le \quad 2 \lg 100 - 2 = 13.288 - 2 = 11.288$$

Holgura $8.703$: enorme. El lema sigue siendo cierto, pero deja de decir algo
útil. Sólo aporta información cuando $a + b$ está *cerca* de $c$ — que es
justamente el caso de la aplicación, donde $a + b = c - 1$.

**Límite 2 — quitar la hipótesis rompe el lema.** Es el caso patológico que
muestra que $a + b \le c$ no es decorativa. Con $a = b = c = 8$ (que viola la
hipótesis, porque $8 + 8 = 16 > 8$):

$$\lg 8 + \lg 8 = 3 + 3 = 6 \quad \not\le \quad 2 \lg 8 - 2 = 4$$

Falla por 2. Moraleja: lo que hace funcionar al lema no es ninguna propiedad
mágica del logaritmo, es la restricción de que $a$ y $b$ **quepan juntos**
dentro de $c$. Por eso la parte laboriosa de aplicarlo (#30) no es el álgebra
sino verificar que los dos subárboles son disjuntos y están contenidos.

**Límite 3 — el otro extremo, $a \to 0$.** El lema exige $a > 0$ estricto. Con
$a = 0.001$, $b = 7.999$, $c = 8$: $\lg a = -9.966$, así que la suma vale
$-6.966$, muy por debajo de $4$. Conforme $a$ baja hacia $0$, el lado izquierdo se
va a $-\infty$ y la cota se cumple cada vez con más holgura — nunca se rompe por
ese lado. En la aplicación esto no puede pasar: $a$ y $b$ son tamaños de
subárbol, siempre $\ge 1$.

> **Nota de apoyo** (no está en las diapositivas): dentro del zig-zig, la
> igualdad exacta $a = b = c/2$ nunca se alcanza, porque siempre sobra el nodo
> $y$ y entonces $a + b = c - 1$. El caso más apretado posible ahí es
> $a = b = (c-1)/2$, que da $2\lg(c-1) - 2$ en vez de $2 \lg c - 2$: la diferencia,
> $2(\lg c - \lg(c-1))$, tiende a $0$ conforme el árbol crece. Es decir, la cota
> del lema es asintóticamente ajustada en la aplicación, no sólo válida.
