---
kind: examples
title: Ejemplos
---

## Mínimo

Una sola llave y un solo acceso: $n = 1$, $m = 1$, secuencia $(1)$. El BST tiene un único nodo; el acceso lo toca
y nada más. El conjunto de puntos es $P = \{(1, 1)\}$, así que $|P| = 1 = m$.

Es el caso donde la cota trivial $|P| \ge m$ se cumple con igualdad: no hay camino que recorrer, así que no
se toca nada de paso. *(Derivado de la regla de #14; no aparece en las diapositivas.)*

## Normal

Es el ejemplo de la clase (#16–#18): claves $\{1,2,3,4\}$, árbol estático con raíz 3, hijo izquierdo 1 (con hijo
derecho 2) e hijo derecho 4, accesos $3, 1, 4, 2$.

| Tiempo $i$ | Acceso $x_i$ | Nodos tocados | Puntos de la fila |
|---|---|---|---|
| 1 | 3 | $\{3\}$ | $(3,1)$ |
| 2 | 1 | $\{3, 1\}$ | $(3,2), (1,2)$ |
| 3 | 4 | $\{3, 4\}$ | $(3,3), (4,3)$ |
| 4 | 2 | $\{3, 1, 2\}$ | $(3,4), (1,4), (2,4)$ |

$|P| = 1 + 2 + 2 + 3 = 8$ puntos. De ellos, 4 son los accesos pedidos y 4 son nodos tocados de paso.

## Límite

El peor caso para un árbol **estático**: las llaves $\{1,2,3,4\}$ en una cadena derecha (raíz 1, hijo 2, hijo 3,
hijo 4) y accesos $1, 2, 3, 4$ en orden. El acceso $i$ recorre $1, \dots, i$, así que toca $i$ nodos:

$$|P| = 1 + 2 + 3 + 4 = 10 \quad\text{y, en general,}\quad |P| = \sum_{i=1}^{n} i = \frac{n(n+1)}{2} = \Theta(n^2).$$

La secuencia es trivial (acceso secuencial) y aun así este árbol paga cuadrático. Un algoritmo que **reorganiza**
el árbol sí puede hacerlo mejor: el algoritmo [Greedy](/structures/greedy-algorithm) ejecuta esa misma secuencia con
$7$ puntos (derivado: ver su página de ejemplos). *(La cuenta de la cadena y el valor 7 son derivados; no aparecen en
las diapositivas.)*
