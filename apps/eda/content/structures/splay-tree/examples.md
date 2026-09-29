---
kind: examples
title: Ejemplos
---

<!--
El material no trae ninguna traza numérica de Splay: la semana 5 da los tres
casos como diagramas simbólicos (#64-66) y la semana 6 da el pseudocódigo
completo (Sem6 #10) y la tabla en términos de Rotar (Sem6 #9) — todo sin
valores concretos. Los tres ejemplos de abajo están *derivados* ejecutando a
mano ese pseudocódigo del profesor sobre árboles concretos; los árboles no
aparecen en las diapositivas, el algoritmo sí.
-->

## Mínimo

*(traza derivada del pseudocódigo del profesor (Sem6 #10); el árbol concreto no aparece en las diapositivas)*

Árbol de 7 nodos, ya balanceado:

```
        4
      /   \
     2     6
    / \   / \
   1   3 5   7
```

`Buscar(6)`: 6 es hijo directo de la raíz 4 → un único
[`zig`](/structures/splay-tree/operations/zig), sin abuelo involucrado.

```
Rotate(6) [6 es hijo derecho de 4 → left rotation]:

        6
      /   \
     4     7
    / \
   2   5
  / \
 1   3
```

Una sola rotación, costo real $O(1)$. Es el caso más simple de Splay: x ya
estaba a un nivel de la raíz.

## Normal

*(traza derivada del pseudocódigo del profesor (Sem6 #10); el árbol concreto no aparece en las diapositivas)*

A partir del árbol resultante de arriba, `Buscar(1)`. El camino es
6 → 4 → 2 → 1 (profundidad 3): 1 es hijo izquierdo de 2, y 2 es hijo
izquierdo de 4 → primera iteración es
[`zig-zig`](/structures/splay-tree/operations/zig-zig).

```
Paso 1 — ZigZig(1): se rota (2, 4) primero, no (1, 2):

Rotate(2) sobre 4:            luego Rotate(1) sobre 2:
        6                             6
      /   \                        /   \
     2     7                      1     7
    / \                            \
   1   4                            2
      / \                            \
     3   5                            4
                                      / \
                                     3   5
```

Tras esta iteración, x = 1 quedó como hijo de la raíz 6 (no raíz todavía).
Segunda iteración: `p = 6` es la raíz → [`zig`](/structures/splay-tree/operations/zig).

```
Paso 2 — Zig(1): rotación simple, 1 sobre 6.

        1
          \
           6
          / \
         2   7
          \
           4
          / \
         3   5
```

Tres rotaciones en total (2 de zig-zig + 1 de zig) para subir un nodo de
profundidad 3. Costo real de esta llamada a Splay: $O(1)$ por rotación × 3 —
consistente con "profundidad inicial de x" del análisis, no con la cota
amortizada (que sólo aplica promediada sobre una secuencia).

## Límite

*(traza derivada del pseudocódigo del profesor (Sem6 #10); el árbol concreto no aparece en las diapositivas)*

El caso patológico: una cadena degenerada de 7 nodos (insertados en orden
creciente sin nunca hacer splay), donde cada nodo es hijo derecho del
anterior:

```
1
 \
  2
   \
    3
     \
      4
       \
        5
         \
          6
           \
            7
```

`Buscar(7)`: el nodo más profundo, a distancia 6 de la raíz. Cada par
consecutivo del camino (7,6,5), (5... etc.) está alineado del mismo lado
(derecho-derecho) → **puros pasos zig-zig** hasta que 7 llega a la raíz:
tres iteraciones de zig-zig (6 rotaciones) más ninguna de zig (la
profundidad es par respecto del último par). Costo real de esta única
llamada: $O(n)$ — es el "$\Theta(n)$ en el peor caso individual" que el
profesor señala al pie del pseudocódigo de
[`Splay`](/structures/splay-tree/operations/splay) (Sem6 #10), distinto de
la cota amortizada $O(\log n)$.
Después de este único Splay, sin embargo, el árbol queda considerablemente
más plano que la cadena original — es la propiedad (no demostrada aquí) que
hace que la *siguiente* búsqueda en esa zona ya no cueste $O(n)$.
