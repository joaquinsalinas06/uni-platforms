---
kind: operation
title: Rotate
order: 2
cppSteps:
  - step-1-node.cpp
  - step-3-instrumented-rotate.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Configuración antes de rotar. p es el padre, n es el hijo que se va a
        levantar. A, B y C son subárboles completos (no nodos sueltos): A y B
        cuelgan de n, C cuelga de p. El recorrido inorden de este árbol es
        A, n, B, p, C — ésa es la propiedad que la rotación tiene que
        preservar.
      highlight: [p, n]
      nodes:
        - { id: p, value: p, parent: null }
        - { id: n, value: n, parent: p }
        - { id: C, value: C, parent: p, collapsed: true }
        - { id: A, value: A, parent: n, collapsed: true }
        - { id: B, value: B, parent: n, collapsed: true }
    - note: >-
        Right Rotation(n): n sube a la posición de p, p baja a ser hijo
        derecho de n. El subárbol B, que era el hijo derecho de n, pasa a ser
        el hijo izquierdo de p — es el único subárbol que cambia de padre; A
        y C se quedan donde estaban. Costo: $O(1)$, un número constante de
        reasignaciones de punteros (#20), sin importar cuántos nodos tengan
        A, B o C.
      highlight: [n, p]
      nodes:
        - { id: n, value: n, parent: null }
        - { id: A, value: A, parent: n, collapsed: true }
        - { id: p, value: p, parent: n }
        - { id: B, value: B, parent: p, collapsed: true }
        - { id: C, value: C, parent: p, collapsed: true }
    - note: >-
        El recorrido inorden del árbol resultante es A, n, B, p, C — idéntico
        al de antes de rotar. Eso es lo que hace que rotar sea una operación
        válida sobre un BST: reorganiza la forma (y por lo tanto la
        profundidad de cada nodo, lo único que le importa al costo de
        `search`) sin alterar el orden de las llaves. Left Rotation(p) sobre
        este árbol deshace el paso anterior y recupera la configuración
        inicial.
      highlight: [n, p]
      nodes:
        - { id: n, value: n, parent: null }
        - { id: A, value: A, parent: n, collapsed: true }
        - { id: p, value: p, parent: n }
        - { id: B, value: B, parent: p, collapsed: true }
        - { id: C, value: C, parent: p, collapsed: true }
---

## Qué hace

Reorganiza un nodo `x` (llamado `n` en el diagrama del profesor) y su padre
`p`, intercambiando cuál de los dos queda arriba, sin romper el invariante de
orden del BST.

## Intuición

Es un "giro" local: el hijo sube, el padre baja a ser hijo del que subió, y
sólo un subárbol (el que estaba "entre" ambos) cambia de padre. Los otros dos
subárboles no se tocan. El mecanismo con los tres punteros exactos
(padre/izquierdo/derecho de cada nodo involucrado) está desarrollado en
[`/structures/balanced-bst`](/structures/balanced-bst), que es quien lo usa
para restaurar un invariante de balance; **este modelo no exige balancear
nada** — sólo postula que ese giro, aplicado a cualquier nodo con su padre,
cuesta $O(1)$.

## Algoritmo

1. Sea `n` el nodo a rotar y `p` su padre.
2. Si `n` es hijo izquierdo de `p` (Right Rotation): el hijo derecho de `n`
   (`B`) pasa a ser el hijo izquierdo de `p`; `p` pasa a ser el hijo derecho
   de `n`; `n` toma el lugar que tenía `p` respecto del abuelo (o se vuelve
   raíz).
3. Si `n` es hijo derecho de `p` (Left Rotation): caso simétrico.
4. Actualizar los punteros al padre de `n`, `p` y el subárbol que cambió de
   lado (`B`).

## Pseudocódigo

```
Algoritmo: Rotate(n)
p ← n.padre
si n = p.izquierdo entonces        // Right Rotation
     B ← n.derecho
     p.izquierdo ← B
     si B ≠ null entonces B.padre ← p
     n.derecho ← p
sino                                // Left Rotation
     B ← n.izquierdo
     p.derecho ← B
     si B ≠ null entonces B.padre ← p
     n.izquierdo ← p
n.padre ← p.padre
enlazar n en el lugar de p respecto del abuelo (o marcar n como raíz)
p.padre ← n
```

## C++

Ver `step-3-instrumented-rotate.cpp` y `full-implementation.cpp` en el
editor de arriba: `rotateRight`/`rotateLeft` reasignan exactamente los
punteros del pseudocódigo e incrementan un contador global de rotaciones.

## Complejidad temporal

$O(1)$. Postulado por el profesor (#20), no derivado: la reasignación de
punteros de arriba toca un número constante de nodos (`n`, `p`, `B` y el
padre de `p`), sin importar cuántos nodos tengan los subárboles A, B o C.

## Complejidad espacial

$O(1)$ adicional.

## Ejemplo

Ver la visualización de arriba y
[examples.md](/structures/bst-computational-model/examples).

## Casos límite

- **`n` es la raíz**: no tiene padre, así que no hay rotación posible;
  cualquier implementación debe rechazar este caso antes de llamarlo.
- **`B` es `null`** (el subárbol que cambia de lado está vacío): la
  reasignación sigue siendo $O(1)$, sólo que uno de los punteros queda en
  `null` en vez de apuntar a un subárbol.
- **Rotar y luego rotar de vuelta**: Left Rotation(p) después de
  Right Rotation(n) recupera exactamente la forma original — es la
  propiedad que hace de `rotate` una operación reversible de costo $O(1)$ en
  cada dirección.
