---
kind: operation
title: Zig-zag
order: 4
cppSteps:
  - step-1-node.cpp
  - step-2-rotate.cpp
  - step-4-zig-zag.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Caso zig-zag: x, su padre p y su abuelo a están en zigzag — lados
        OPUESTOS (aquí, x hijo derecho de p, p hijo izquierdo de a). Es la
        forma que hay que comparar contra zig-zig: mismos tres niveles,
        orientación distinta (#66). A, B, C, D son subárboles completos,
        dibujados colapsados: sólo importa de quién cuelgan.
      highlight: [x, p, a]
      nodes:
        - { id: a, value: a, parent: null }
        - { id: p, value: p, parent: a }
        - { id: D, value: D, parent: a, collapsed: true }
        - { id: A, value: A, parent: p, collapsed: true }
        - { id: x, value: x, parent: p }
        - { id: B, value: B, parent: x, collapsed: true }
        - { id: C, value: C, parent: x, collapsed: true }
    - note: >-
        Antes de mover nada: en zig-zag no hay "abuelo primero" que valga
        como en zig-zig — los dos giros van en direcciones opuestas, así
        que el único orden razonable es rotar (x, p) primero y (x, a)
        después. Esto es lo que se va a rotar en este paso.
      highlight: [x, p]
      nodes:
        - { id: a, value: a, parent: null }
        - { id: p, value: p, parent: a }
        - { id: D, value: D, parent: a, collapsed: true }
        - { id: A, value: A, parent: p, collapsed: true }
        - { id: x, value: x, parent: p }
        - { id: B, value: B, parent: x, collapsed: true }
        - { id: C, value: C, parent: x, collapsed: true }
    - note: >-
        Left-Rotate(x) en marcha: B, el hijo izquierdo de x, se desprende
        de x — es el subárbol que cambia de padre en esta primera rotación.
        p todavía cuelga de a, sin tocar.
      highlight: [x]
      nodes:
        - { id: a, value: a, parent: null }
        - { id: p, value: p, parent: a }
        - { id: D, value: D, parent: a, collapsed: true }
        - { id: A, value: A, parent: p, collapsed: true }
        - { id: x, value: x, parent: p }
        - { id: C, value: C, parent: x, collapsed: true }
        - { id: B, value: B, parent: null, collapsed: true, state: marked }
    - note: >-
        Primera rotación completa: x subió a la posición de p; p bajó a
        ser hijo izquierdo de x; B (que era hijo izquierdo de x) ahora es
        hijo derecho de p. x sigue colgando de a, del mismo lado de
        siempre — todavía falta la segunda rotación.
      highlight: [x, p]
      nodes:
        - { id: a, value: a, parent: null }
        - { id: x, value: x, parent: a }
        - { id: D, value: D, parent: a, collapsed: true }
        - { id: p, value: p, parent: x }
        - { id: A, value: A, parent: p, collapsed: true }
        - { id: B, value: B, parent: p, collapsed: true }
        - { id: C, value: C, parent: x, collapsed: true }
    - note: >-
        Ahora toca el par (x, a). C, el hijo derecho de x, es el que va a
        cambiar de padre en este segundo giro — de x a a.
      highlight: [x, a]
      nodes:
        - { id: a, value: a, parent: null }
        - { id: x, value: x, parent: a }
        - { id: D, value: D, parent: a, collapsed: true }
        - { id: p, value: p, parent: x }
        - { id: A, value: A, parent: p, collapsed: true }
        - { id: B, value: B, parent: p, collapsed: true }
        - { id: C, value: C, parent: x, collapsed: true }
    - note: >-
        Right-Rotate(x) en marcha: C se desprende de x y va camino a a. p
        (con A y B ya colgando de él) se queda como hijo izquierdo de x sin
        moverse otra vez.
      highlight: [x]
      nodes:
        - { id: x, value: x, parent: null }
        - { id: p, value: p, parent: x }
        - { id: A, value: A, parent: p, collapsed: true }
        - { id: B, value: B, parent: p, collapsed: true }
        - { id: a, value: a, parent: null }
        - { id: D, value: D, parent: a, collapsed: true }
        - { id: C, value: C, parent: null, collapsed: true, state: marked }
    - note: >-
        Resultado final: x en la raíz, con p Y a como sus dos hijos
        DIRECTOS — no en cascada, como en zig-zig. Ésa es la forma que
        distingue los dos casos: comparar contra el resultado final de
        [zig-zig](/structures/splay-tree/operations/zig-zig), donde p y a
        terminan uno colgando del otro en vez de ambos pegados a x.
      highlight: [x]
      nodes:
        - { id: x, value: x, parent: null, state: answer }
        - { id: p, value: p, parent: x }
        - { id: a, value: a, parent: x }
        - { id: A, value: A, parent: p, collapsed: true }
        - { id: B, value: B, parent: p, collapsed: true }
        - { id: C, value: C, parent: a, collapsed: true }
        - { id: D, value: D, parent: a, collapsed: true }
---

## Qué hace

Es el segundo caso de [`splay`](/structures/splay-tree/operations/splay):
x y su padre p están en lados opuestos respecto de su abuelo a (x derecho
de p, p izquierdo de a — o el espejo). Dos rotaciones dejan a x en la raíz.

## Intuición

A diferencia de [zig-zig](/structures/splay-tree/operations/zig-zig), aquí
no hay distinción entre "rotar el abuelo primero" o "rotar el padre
primero": como las dos direcciones son opuestas, rotar `(x, p)` primero y
`(x, a)` después es simplemente el único orden razonable — x se mueve hacia
arriba en zigzag, nunca en línea recta. En términos de la primitiva
[`Rotar`](/structures/splay-tree/operations/rotate) eso se ve de golpe: las
dos llamadas son sobre **x mismo**, `Rotar(x); Rotar(x)` (Sem6 #9) — la
primera lo rota con p, y como después x ocupa el lugar que tenía p, la
segunda ya lo rota con a. Es la única diferencia con zig-zig, donde la
primera llamada es sobre el padre. El resultado visual también es
distinto: en zig-zig, p y a terminan en cascada (uno colgando del otro); en
zig-zag, p y a terminan como los dos hijos **directos** de x. Esa es la
diferencia que hay que ver, no sólo leer.

## Algoritmo

1. Sean `x` hijo de `p`, `p` hijo de `a`, en lados opuestos (caso
   izquierdo-derecho mostrado arriba; derecho-izquierdo es simétrico).
2. Rotar el par `(x, p)`: `Rotate(x)` — x sube a la posición de p.
3. Rotar el par `(x, a)`: `Rotate(x)` — x sube a la posición de a (ahora
   raíz del subárbol).
4. `x` queda como raíz; `p` y `a` quedan como sus dos hijos directos.

## Pseudocódigo

```
Algoritmo: ZigZag(x)
// tabla del profesor (Sem6 #9): Zig-Zag = Rotar(x); Rotar(x)
// lados opuestos: x es derecho de p, y p es izquierdo de a (o el espejo)
Rotar(x)           // rota el par (x, p) — x sube un nivel
Rotar(x)           // rota el par (x, a) — x sube a la raíz
```

## C++

Ver `step-4-zig-zag.cpp` y `full-implementation.cpp` en el editor de
arriba: `zigZag(x)` llama `rotate(x)` dos veces seguidas — a diferencia de
`zigZig`, que llama primero `rotate(p)`.

## Complejidad temporal

$O(1)$, costo real (no amortizado): dos rotaciones $O(1)$ cada una, sin
importar el tamaño de A, B, C o D (#66). Igual que zig-zig, lo amortizado
es propiedad de la secuencia de pasos de
[`splay`](/structures/splay-tree/operations/splay) completo, no de este
paso solo.

## Complejidad espacial

$O(1)$ adicional.

## Ejemplo

Ver [examples.md](/structures/splay-tree/examples).

## Casos límite

- **Espejo (derecho-izquierdo)**: x hijo izquierdo de p, p hijo derecho de
  a — simétrico. El deck sólo dibuja una orientación (#66); la espejada se
  deriva por simetría.
- **A, B, C o D vacíos**: cada rotación sigue siendo $O(1)$.
- **`a` era la raíz del árbol completo**: tras zig-zag, `x` es la nueva
  raíz global.
