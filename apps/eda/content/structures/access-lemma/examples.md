---
kind: examples
title: Ejemplos
---

<!--
El mazo (#22-33) no trae NI UNA traza numérica del potencial: Φ, s(x) y r(x)
se definen simbólicamente (#22) y la prueba entera es algebraica. Los tres
ejemplos de abajo están *derivados* aplicando a mano las definiciones de #22
y el pseudocódigo de splay.md/zig.md/zig-zig.md sobre árboles concretos —
ninguno aparece en las diapositivas. Misma honestidad que
content/structures/splay-tree/examples.md.
-->

Todos los números de esta página están **derivados**: el profesor da las
definiciones y la prueba, nunca un árbol con valores. Convenciones fijas en
los tres ejemplos, tal como en #22: $w_x = 1$ para todos los nodos (así
$s(x)$ es simplemente contar nodos del subárbol de x, x incluido),
$r(x) = \lg s(x)$ y $\Phi = \sum_x r(x)$. Redondeo a dos decimales;
$\lg 3 \approx 1.58$, $\lg 5 \approx 2.32$, $\lg 6 \approx 2.58$,
$\lg 7 \approx 2.81$.

## Mínimo

*(derivado; no aparece en las diapositivas)*

**El caso donde del lema no queda más que el $+1$: x ya es la raíz.**

```
    2          Splay(2), con x = t = el nodo 2
   / \
  1   3
```

$s(1) = s(3) = 1$, $s(2) = 3$. Entonces $r(1) = r(3) = 0$, $r(2) = \lg 3 \approx 1.58$,
y $\Phi \approx 1.58$.

`Splay(2)` no hace nada: x ya es la raíz, no hay padre con quien rotar. Cero
rotaciones, $\Delta\Phi = 0$, costo amortizado 0 rotaciones.

¿Y qué dice el lema? Aquí $t = x$, así que $r(t) - r(x) = 0$ y la cota queda

$$3\big(r(t) - r(x)\big) + 1 = 3 \cdot 0 + 1 = 1.$$

Es decir: **todo el contenido del lema en este caso es el $+1$**. Sin ese
término la cota sería 0, y ninguna implementación real puede atender un
acceso en costo 0 — hay que al menos mirar el nodo. Éste es el caso
degenerado que obliga al término aditivo a existir, y es la razón por la que
el zig del final (#32) es el único de los tres pasos que arrastra un $+1$
que no se cancela.

Variante instructiva del mismo caso: `Splay(1)`. Ahí $r(x) = r(1) = 0$,
$r(t) = \lg 3 \approx 1.58$, y la cota es $3(1.58) + 1 \approx 5.75$ — el costo
amortizado real de ese único zig es
$1 + (r'(1) - r(1)) + (r'(2) - r(2)) = 1 + 1.58 + (1 - 1.58) = 2$, muy por
debajo. El lema es cota superior, no igualdad.

## Normal

*(derivado; no aparece en las diapositivas)*

**Φ sobre un árbol balanceado, y un Splay que lo desbalancea.**

```
        4
      /   \
     2     6
    / \   / \
   1   3 5   7
```

Paso 1 — calcular $\Phi$ a mano, nodo por nodo:

| nodo | subárbol | $s(x)$ | $r(x) = \lg s(x)$ |
| --- | --- | --- | --- |
| 1, 3, 5, 7 | sólo él | 1 | 0 |
| 2 | {1,2,3} | 3 | 1.58 |
| 6 | {5,6,7} | 3 | 1.58 |
| 4 | todo | 7 | 2.81 |

$$\Phi_0 = 4 \cdot 0 + 2 \cdot 1.58 + 2.81 \approx 5.98$$

Paso 2 — `Splay(1)`. El nodo 1 es hijo izquierdo de 2, que es hijo izquierdo
de 4: los tres en línea del mismo lado ⇒ un único
[zig-zig](/structures/splay-tree/operations/zig-zig), con $z = 4$, $y = 2$,
$x = 1$. Los subárboles del esquema son $A = B = \varnothing$ (el nodo 1 es
hoja), $C = \{3\}$, $D = \{5,6,7\}$. Costo real: **2 rotaciones**.

```
1
 \
  2
   \
    4
   / \
  3   6
     / \
    5   7
```

Paso 3 — $\Phi$ después:

| nodo | $s(x)$ | $r(x)$ |
| --- | --- | --- |
| 3, 5, 7 | 1 | 0 |
| 6 | 3 | 1.58 |
| 4 | 5 | 2.32 |
| 2 | 6 | 2.58 |
| 1 | 7 | 2.81 |

$$\Phi_1 \approx 9.30, \qquad \Delta\Phi = 9.30 - 5.98 = +3.32$$

Paso 4 — la cuenta del [método del potencial](/structures/potential-method):

$$\hat{c} = c + \Delta\Phi = 2 + 3.32 = 5.32$$

Paso 5 — verificar el lema. Antes del Splay, $r(t) = r(4) = \lg 7 \approx 2.81$
y $r(x) = r(1) = \lg 1 = 0$, así que la cota es

$$3\big(r(t) - r(x)\big) + 1 = 3(2.81) + 1 \approx 9.42 \;\ge\; 5.32 \quad\checkmark$$

Y la cota **del paso** (#31), que es la que la prueba establece para el
zig-zig aislado: $3(r'(x) - r(x)) = 3(2.81 - 0) \approx 8.42 \ge 5.32$ ✓.

Lo interesante de este ejemplo es el signo: $\Delta\Phi$ salió **positivo**. El
Splay desbalanceó un árbol que estaba balanceado, y por eso el costo
amortizado (5.32) es mayor que el real (2). En el vocabulario del método del
potencial, esta operación *ahorró*: dejó el árbol en una forma con más
trabajo diferido guardado, que alguna operación futura va a poder gastar.
El ejemplo límite es justamente esa operación futura.

## Límite

*(derivado; no aparece en las diapositivas)*

**La cadena degenerada: costo real $\Theta(n)$, costo amortizado que casi
desaparece.**

Siete llaves en cadena, todas hijas izquierdas — la peor forma posible, la
misma que el [splay tree](/structures/splay-tree) hereda cuando se insertan
llaves en orden:

```
7
|
6
|
5
|
4
|
3
|
2
|
1
```

Los tamaños son $1, 2, 3, 4, 5, 6, 7$ de abajo hacia arriba, así que

$$\Phi_0 = \lg 1 + \lg 2 + \cdots + \lg 7 = \lg(7!) = \lg 5040 \approx 12.30$$

Más del **doble** que el árbol balanceado del ejemplo normal (5.98) con
exactamente las mismas siete llaves. Ésa es la lectura de $\Phi$ como "cuánto
trabajo diferido hay guardado en la forma del árbol" (#22): la cadena tiene
mucho ahorro acumulado, y `Splay(1)` viene a gastarlo.

`Splay(1)` sobre esta cadena son **tres zig-zig seguidos**, sin zig final:

| paso | qué rota | $c$ | $\Phi$ después | $\Delta\Phi$ | $\hat{c} = c + \Delta\Phi$ |
| --- | --- | --- | --- | --- | --- |
| — | estado inicial | — | 12.30 | — | — |
| 1 | zig-zig (1, 2, 3) | 2 | 12.30 | 0 | 2 |
| 2 | zig-zig (1, 4, 5) | 2 | 10.71 | −1.58 | 0.42 |
| 3 | zig-zig (1, 6, 7) | 2 | 8.39 | −2.32 | −0.32 |

$$\sum c = 6, \qquad \sum \hat{c} \approx 2.09$$

El costo **real** es 6 rotaciones sobre 7 nodos: lineal en $n$, el peor caso
que el [splay tree](/structures/splay-tree) admite para un acceso individual.
El costo **amortizado** es 2.09 — y el tercer paso incluso sale *negativo*,
porque la caída del potencial supera al costo real de las dos rotaciones. La
cadena estaba pagando por adelantado desde el principio.

Verificación del lema: $r(t) = r(7) = \lg 7 \approx 2.81$, $r(x) = r(1) = 0$,

$$3\big(r(t) - r(x)\big) + 1 \approx 9.42 \;\ge\; 2.09 \quad\checkmark$$

Y la confirmación de que el gasto fue real: repetir `Splay(1)`
inmediatamente después cuesta **0 rotaciones** (el nodo 1 ya es la raíz) y
$\hat{c}$ queda acotado por el $+1$ del caso mínimo. El ahorro que la cadena
guardaba se gastó una sola vez y no vuelve.

Qué viene a arreglar esto: nada, y ése es el punto. A diferencia de un
[BST balanceado](/structures/balanced-bst), el splay tree **no** evita la
cadena degenerada — la tolera, porque el Lema de Acceso garantiza que el
costo de deshacerla ya estaba prepagado. Lo que sí queda abierto es si esta
garantía amortizada alcanza para ser óptimo contra el mejor árbol posible:
ver [optimalidad estática](/structures/static-optimality) para la parte que
sí se resuelve con pesos distintos de 1, y
[optimalidad dinámica](/structures/dynamic-optimality) para la que sigue sin
respuesta.
