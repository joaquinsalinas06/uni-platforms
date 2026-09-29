---
kind: examples
title: Ejemplos
---

## Mínimo

$k = 2$ listas: `L2 = [3, 5, 12]` (no cambia, es la última), `L1 = [2, 8,
15]`. Promoviendo la mitad de `L2` (por ejemplo `3` y `12`) hacia `L1`:
`L'1 = [2, 3*, 8, 12*, 15]`. Buscar `x = 12`: búsqueda binaria en `L'1` lo
encuentra directo (posición 4, marcado); el puente de `12*` apunta a su
posición exacta en `L2`. Con sólo dos listas el ahorro frente a la búsqueda
ingenua ($O(2 \lg n)$ vs $O(1 + \lg n)$) ya es visible, aunque pequeño.

*(derivado del pseudocódigo; no aparece en las diapositivas: el mazo no trae
un ejemplo propio de dos listas)*.

## Normal

El ejemplo del profesor (#18-19), con `k = 3` listas:

```
L3     4    9    13   18   22        (no cambia)
L'2    3    5    9*   12   18*       (9, 18 promovidos desde L3)
L'1    2    5*   8    12*  15        (5, 12 promovidos desde L'2)
```

Buscar `x = 9` en las tres: búsqueda binaria en `L'1` (`O(lg n)`) ubica `9`
entre `8` y `12*`; el puente de `12*` baja a `L'2` cerca de la posición real
de `9` (posición 3, ajuste O(1)); el puente de ese `9` en `L'2` baja a `L3`
donde `9` está en la posición 2 (ajuste O(1)). Tres pasos, ninguno una
búsqueda binaria completa salvo el primero.

## Límite

Promover **todos** los elementos de cada lista en vez de la mitad (#25-26):
$L'_i = L_i \cup L'_{i+1}$ completo. Con las mismas tres listas, `L'1` terminaría
conteniendo prácticamente `L1 ∪ L2 ∪ L3` — el tamaño se dispara a $\Theta(kn)$ en
vez de $O(n)$. La consulta seguiría siendo $O(1)$ por puente, pero la
estructura ya no cabe en espacio lineal: es el caso patológico que la regla
"promover la mitad" existe para evitar. La estructura que "viene a
arreglarlo" es la propia regla de la mitad — no hay una estructura distinta
en el material que resuelva este límite, es una restricción de diseño de
fractional cascading mismo.
