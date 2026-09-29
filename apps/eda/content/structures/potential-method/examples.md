---
kind: examples
title: Ejemplos
---

<!--
Las cuatro aplicaciones son las que trae el mazo (páginas 34-42), en
términos de c, D(n) y t(H) — el profesor nunca instancia un montículo de
Fibonacci con llaves concretas, así que no hay números de nodo por nodo que
trazar; se traza la fórmula. El desarrollo completo de estas cuatro
operaciones (pseudocódigo, invariantes) vive en fibonacci-heap: aquí sólo se
usan como ilustración del mecanismo Φ → ΔΦ → ĉ.
-->

## Mínimo

**Insert** y **Union** (páginas 34-35): el caso donde `ΔΦ` casi no hace
trabajo.

- Insert agrega un árbol de un solo nodo a la lista de raíces: $c_i = O(1)$,
  $\Delta t = +1$, $\Delta m = 0 \implies \Delta\Phi = +1$. Costo amortizado:
  $\hat{c}_i = O(1) + 1 = O(1)$.
- Union concatena dos listas circulares de raíces: $c_i = O(1)$, no cambia ni
  el número de árboles ni el de nodos marcados $\implies \Delta\Phi = 0$. Costo amortizado:
  $\hat{c}_i = O(1) + 0 = O(1)$.

En ambos casos el costo amortizado coincide con el costo real porque $\Delta\Phi$ es
pequeño — no hay nada que "prepagar" todavía.

## Normal

**Decrease-Key** (páginas 36-38): el caso donde $\Delta\Phi$ sí hace el trabajo
central del método — cancelar un término que crece sin cota.

Con `c` cortes totales (el corte de `x` respecto a su padre, más $c - 1$
cortes en cascada hacia arriba):

$$c_i = O(c), \qquad \Delta t = +c$$

Cortar es `O(1)` cada uno, `c` cortes en total; cada nodo cortado pasa a la
lista de raíces, así que `t(H)` sube en `c`.

De los `c` nodos que quedan marcados o desmarcados:
- los primeros `c − 1` cortes desmarcan un nodo que **ya estaba marcado**
  (perdía la marca al cortarse): `−2` cada uno.
- el último corte puede dejar **recién marcado** al padre del último nodo
  cortado (si no era raíz): `+2`.

$$\Delta\Phi \leq c + \big(-2(c-1) + 2\big) = c - 2c + 2 + 2 = 4 - c$$

Sumando:

$$\hat{c}_i = O(c) + (4 - c) = O(1)$$

El profesor lo subraya así: "¡El término `c` se cancela! No importa cuántos
cortes en cascada ocurran." Éste es el ejemplo que justifica todo el
mecanismo: sin $\Phi$, `Decrease-Key` parecería costar $O(c)$ en el peor caso de
una operación individual; con $\Phi$, el costo amortizado es $O(1)$ sin importar
qué tan largo sea el corte en cascada.

Caso límite dentro de este mismo ejemplo: $c = 1$ (sin cascada, un solo
corte). La fórmula lo cubre sin distinguirlo — $\Delta\Phi \le 1 + (4 - 1) =
3$, $\hat{c}_i = O(1) + 3 = O(1)$ — pero el mazo no lo comenta explícitamente.

## Límite

**Extract-Min** (páginas 39-42): el caso donde el costo amortizado **no**
queda en $O(1)$ — es el que efectivamente domina el costo de una secuencia de
operaciones y el que motiva la cota de grado $D(n) = O(\lg n)$ que el mazo
demuestra justo antes.

$$c_i = O(D(n) + t(H)), \qquad \Delta\Phi \leq (D(n) + 1) - t(H)$$

Consolidar recorre hasta $D(n)+1$ posiciones del arreglo y las $t(H)$
raíces originales; tras consolidar quedan a lo más $D(n)+1$ árboles, así
que se pierden (en el potencial) los $t(H)$ árboles que había antes.

Sumando:

$$\hat{c}_i = O(D(n) + t(H)) + \big(D(n) + 1 - t(H)\big) = O(D(n))$$

y con la cota de grado $D(n) = O(\lg n)$ (que depende de los números de
Fibonacci, fuera del alcance de este tema), el costo amortizado de
Extract-Min queda en **$O(\lg n)$** — el único de los cuatro que no se reduce
a $O(1)$. Es el caso que "viene a arreglar" la elección de $\Phi = t + 2m$: el
término $t(H)$ en $\Phi$ es justamente lo que permite que el costo real de
recorrer todas las raíces ($O(t(H))$) se cancele en $\Delta\Phi$, dejando sólo
$O(D(n))$.
