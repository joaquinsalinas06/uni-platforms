---
kind: operation
title: Zig
order: 2
cppSteps:
  - step-1-node.cpp
  - step-2-rotate.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Caso zig: x es hijo directo de la raíz p — no hay abuelo, sólo dos
        niveles. Aquí, x es hijo izquierdo de p. A, B, C son subárboles
        completos, dibujados colapsados: sólo importa de quién cuelgan, no
        su contenido.
      highlight: [x, p]
      nodes:
        - { id: p, value: p, parent: null }
        - { id: x, value: x, parent: p }
        - { id: C, value: C, parent: p, collapsed: true }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: B, value: B, parent: x, collapsed: true }
    - note: >-
        x es hijo izquierdo de p, así que la operación es Right-Rotate(x) —
        una sola rotación, sin decidir entre varios casos como en zig-zig o
        zig-zag. Los punteros que van a cambiar son tres: `p.izquierdo`,
        `x.derecho` y el puntero a la raíz del subárbol.
      highlight: [x, p]
      nodes:
        - { id: p, value: p, parent: null }
        - { id: x, value: x, parent: p }
        - { id: C, value: C, parent: p, collapsed: true }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: B, value: B, parent: x, collapsed: true }
    - note: >-
        Primer puntero: B, el hijo derecho de x, se desprende de x — es el
        único subárbol que cambia de padre en esta rotación. Todavía no
        tiene nuevo padre asignado.
      highlight: [x]
      nodes:
        - { id: p, value: p, parent: null }
        - { id: x, value: x, parent: p }
        - { id: C, value: C, parent: p, collapsed: true }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: B, value: B, parent: null, collapsed: true, state: marked }
    - note: >-
        Segundo puntero: `p.izquierdo ← B`. B pasa a colgar de p, del lado
        izquierdo — el mismo lado del que colgaba x. p todavía está en su
        posición original; x y p siguen sin haberse movido entre sí.
      highlight: [p]
      nodes:
        - { id: p, value: p, parent: null }
        - { id: x, value: x, parent: p }
        - { id: C, value: C, parent: p, collapsed: true }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: B, value: B, parent: p, collapsed: true, state: marked }
    - note: >-
        Tercer puntero: `x.derecho ← p`. p se desprende de su posición
        original y pasa a colgar de x — es el giro en sí, el momento donde
        x y p intercambian quién es padre de quién.
      highlight: [x, p]
      nodes:
        - { id: x, value: x, parent: null, state: marked }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: p, value: p, parent: x }
        - { id: B, value: B, parent: p, collapsed: true }
        - { id: C, value: C, parent: p, collapsed: true }
    - note: >-
        Rotación completa: x ocupa la posición de p (raíz de este
        subárbol), p es su hijo derecho, y B (que era hijo derecho de x)
        ahora cuelga del hijo izquierdo de p. A no se tocó en ningún
        momento — sigue colgando de x, como al principio.
      highlight: [x]
      nodes:
        - { id: x, value: x, parent: null, state: answer }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: p, value: p, parent: x }
        - { id: B, value: B, parent: p, collapsed: true }
        - { id: C, value: C, parent: p, collapsed: true }
---

## Qué hace

Es el caso base de [`splay`](/structures/splay-tree/operations/splay): x es
hijo directo de la raíz. Una única rotación deja a x en la raíz.

## Intuición

Es exactamente
[`rotate`](/structures/bst-computational-model/operations/rotate) del
modelo BST, aplicado una vez entre x y su padre p — no hay nada adicional
que decidir porque no hay abuelo. Es el único de los tres casos de Splay que
no involucra tres niveles.

## Algoritmo

1. Sea `x` hijo de la raíz `p` (#64).
2. Si `x` es hijo izquierdo de `p`: Right-Rotate(x). Si `x` es hijo derecho:
   Left-Rotate(x).
3. `x` queda como raíz; `p` queda como su hijo (del lado opuesto al que
   tenía `x`).

Diagrama del profesor (#64), con subárboles completos `A`, `B`, `C`:

```
antes:            después:
     p                  x
    / \                / \
   x   C     ⟹        A   p
  / \                    / \
 A   B                  B   C
```

## Pseudocódigo

La tabla del profesor lo resume en una llamada: `Zig = Rotar(x)` (Sem6 #9).
[`Rotar`](/structures/splay-tree/operations/rotate) ya decide sola el lado
según de dónde cuelga x, así que no hay dos variantes que escribir:

```
Algoritmo: Zig(x)
// p = padre(x) es la raíz
Rotar(x)                         // right o left según el lado de x
// x es ahora la raíz
```

## C++

Ver `step-2-rotate.cpp` y `full-implementation.cpp` en el editor de arriba:
`zig(x)` reutiliza `rotateRight`/`rotateLeft`, la misma rutina de
[`rotate`](/structures/bst-computational-model/operations/rotate).

## Complejidad temporal

$O(1)$, costo real (no amortizado): una sola rotación, y `rotate` es $O(1)$ en
el modelo BST sin importar el tamaño de A, B o C (#64).

## Complejidad espacial

$O(1)$ adicional.

## Ejemplo

Ver [examples.md](/structures/splay-tree/examples).

## Casos límite

- **`x` ya es la raíz**: Zig no aplica; [`splay`](/structures/splay-tree/operations/splay)
  termina antes de llegar aquí.
- **Subárboles A, B o C vacíos**: la rotación sigue siendo $O(1)$, sólo que
  alguno de los punteros queda en `null`.
- **`p` era la raíz del árbol completo**: tras Zig, `x` es la nueva raíz —
  quien mantenga un puntero a la raíz del árbol debe actualizarlo.
