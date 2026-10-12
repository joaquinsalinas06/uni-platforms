---
kind: examples
title: Ejemplos
---

Todos derivados de la definición con el árbol de referencia balanceado de la teoría (raíz en el punto medio); no aparecen en las diapositivas.

## Mínimo

Una sola llave: $P$ tiene un nodo, no hay subárbol izquierdo ni derecho y $\text{Wilber-1} = 0$.

## Normal

Llaves $\{1, 2, 3, 4\}$, árbol de referencia: raíz 2, hijo izquierdo 1, hijo derecho 3 (con 4 como hijo derecho de 3). Secuencia $3, 1, 4, 2$.

| Nodo $y$ | Accesos en su subárbol (sin $y$) | Lados | Alternancias |
|---|---|---|---|
| 2 | 3, 1, 4 | R L R | 2 |
| 3 | 4 | R | 0 |
| 1, 4 | — | — | 0 |

$\text{Wilber-1} = 2$, así que $\mathrm{OPT} \ge |I| + \frac{2}{2} = 5$ (el óptimo real es $8$): cota válida y floja, como todas en secuencias tan chicas.

## Límite

Bit-reversal sobre el árbol perfecto de 7 llaves: la raíz alterna en cada paso ($L R L R L R$, 5 alternancias), los nodos $1$ y $5$ una cada uno, y el total es $7$. Con $n = 63$ el total ya es $227$, creciendo como $n \lg n$.
Es el caso donde Wilber-1 *demuestra* $\Omega(n \lg n)$.
