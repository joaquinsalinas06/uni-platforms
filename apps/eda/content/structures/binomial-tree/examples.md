---
kind: examples
title: Ejemplos
---

## Mínimo

$B_0$: un único nodo, sin hijos. Caso base de la recursión — no hay enlace
que hacer. Verifica trivialmente las cuatro propiedades: $2^0 = 1$ nodo,
altura $0$, grado de la raíz $0$, y a profundidad $0$ hay $\binom{0}{0} = 1$ nodo.

## Normal

> Ejemplo derivado de la definición; no aparece en las diapositivas con
> valores explícitos — el mazo sólo dibuja las formas de `B_0` a `B_3`
> (diapositiva 17) sin trazar el enlace paso a paso.

Construcción de $B_2$ a partir de dos copias de $B_1$:

1. Se parte de dos árboles `B_1` idénticos, cada uno con su raíz `r` y un
   único hijo `h` (`B_0`).
2. Se enlazan: la raíz de uno de los dos `B_1` (llamémosla `r₂`) se cuelga
   como el hijo **más a la izquierda** de la raíz del otro (`r₁`).
3. El resultado, `B_2`, tiene raíz `r₁` con dos hijos: `r₂` (que a su vez
   tiene su propio hijo `h₂`, heredado de cuando era raíz de un `B_1`) y `h₁`
   (el hijo original de `r₁`, que es un `B_0`).

Verificación de las propiedades sobre este `B_2`:

| propiedad | valor esperado ($k=2$) | conteo directo |
| --- | --- | --- |
| nodos | $2^2 = 4$ | `r₁, r₂, h₂, h₁` → 4 |
| altura | $2$ | `r₁ → r₂ → h₂` → 2 aristas |
| grado de la raíz | $2$ | `r₁` tiene hijos `r₂` y `h₁` |
| nodos a profundidad 0 | $\binom{2}{0} = 1$ | sólo `r₁` |
| nodos a profundidad 1 | $\binom{2}{1} = 2$ | `r₂` y `h₁` |
| nodos a profundidad 2 | $\binom{2}{2} = 1$ | sólo `h₂` |

## Límite

> Ejemplo derivado de la definición; no aparece en las diapositivas.

El caso patológico no es un árbol binomial "malo" (la forma de $B_k$ está
completamente determinada por $k$, no hay variación que degenere), sino el
límite de la propia definición recursiva: **enlazar dos árboles de distinto
orden no produce un árbol binomial**. Si se cuelga un `B_1` como hijo de la
raíz de un `B_2`, el resultado ya no tiene una de las cuatro propiedades
(por ejemplo, dejaría de tener exactamente $\binom{k}{i}$ nodos por profundidad
para ningún $k$ único). Esta restricción — sólo se enlazan árboles del
**mismo orden** — es exactamente la que impone
[binomial-heap](/structures/binomial-heap) sobre su operación
`binomial-link`.
