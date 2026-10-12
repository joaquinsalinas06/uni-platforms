---
kind: examples
title: Ejemplos
---

Derivados de la definición de hijo preferido (#10) con el código de [tango-search](/structures/tango-tree/operations/tango-search); ninguno aparece en las diapositivas.

## Mínimo

Una sola llave: $P$ es un solo nodo, no hay hijos preferidos ni cruces. Cada acceso cuesta una búsqueda en un árbol auxiliar de tamaño 1.

## Normal

Árbol perfecto sobre $1..7$ (raíz 4) y secuencia $1, 5, 3$:

| Acceso | Camino | Cambios de hijo preferido | Caminos preferidos después |
|---|---|---|---|
| 1 | 4 → 2 → 1 | 0 (primera vez en cada nodo) | $\{4,2,1\}$ |
| 5 | 4 → 6 → 5 | 1 (en 4: de 2 a 6) | $\{4,6,5\}$, $\{2,1\}$ |
| 3 | 4 → 2 → 3 | 2 (en 4: de 6 a 2; en 2: de 1 a 3) | $\{4,2,3\}$, $\{6,5\}$, $\{1\}$ |

Total: 3 cambios, igual que $\text{Wilber-1}(1, 5, 3) = 3$ sobre el mismo árbol.

## Límite

Bit-reversal sobre 7 llaves ($1, 5, 3, 7, 2, 6, 4$): 7 cambios de hijo preferido, igual a $\text{Wilber-1} = 7$: cada acceso salta de camino en casi todos los nodos. Con $n$ más grande el total crece como $n \lg n$; y como
[Wilber-1](/structures/wilber-1-bound) ya es cota inferior, **ningún** BST lo hace mejor: Tango Trees pierde sólo el factor $\lg\lg n$ de cada cruce.
