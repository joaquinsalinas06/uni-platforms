---
kind: operation
title: Eliminar
order: 4
cppSteps:
  - step-1-base.cpp
  - step-2-split.cpp
  - step-3-join.cpp
  - step-4-insert.cpp
  - step-5-delete.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Eliminar(40) en este árbol de 7 nodos. 40 sí está — si no estuviera,
        Buscar devolvería falso y la operación terminaría ahí (#19). Árbol
        en reposo, contador de llamadas a Splay en 0.
      caption: "Eliminar(40) — llamadas a Splay: 0"
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n40, value: 40, parent: n20, side: right }
        - { id: n30, value: 30, parent: n40, side: left }
        - { id: n60, value: 60, parent: n40, side: right }
        - { id: n50, value: 50, parent: n60, side: left }
        - { id: n70, value: 70, parent: n60, side: right }
    - note: >-
        Buscar(40) desciende 20 → 40 y lo encuentra a profundidad 1. Éste es
        el único recorrido de la operación: el resto son punteros. El
        descenso no se reexplica — es
        [`Buscar`](/structures/splay-tree/operations/search) tal cual.
      caption: "Buscar(40) = verdadero"
      highlight: [n40]
      nodes:
        - { id: n20, value: 20, parent: null, state: muted }
        - { id: n10, value: 10, parent: n20, side: left, state: muted }
        - { id: n40, value: 40, parent: n20, side: right, state: active }
        - { id: n30, value: 30, parent: n40, side: left }
        - { id: n60, value: 60, parent: n40, side: right }
        - { id: n50, value: 50, parent: n60, side: left }
        - { id: n70, value: 70, parent: n60, side: right }
    - note: >-
        LLAMADA 1 a Splay, la de Buscar. "Buscar(k) deja a k EN LA RAÍZ"
        (#19) — y eso no es un efecto lateral que haya que tolerar, es
        exactamente lo que la operación necesita: ahora k tiene a todo lo
        menor colgando de un lado y a todo lo mayor del otro.
      caption: "Splay(40) — llamadas a Splay: 1"
      highlight: [n40]
      nodes:
        - { id: n40, value: 40, parent: null, tag: r, state: active }
        - { id: n20, value: 20, parent: n40, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n30, value: 30, parent: n20, side: right }
        - { id: n60, value: 60, parent: n40, side: right }
        - { id: n50, value: 50, parent: n60, side: left }
        - { id: n70, value: 70, parent: n60, side: right }
    - note: >-
        El regalo: "sus dos hijos ya cumplen la precondición de Unir (todo
        el subárbol izquierdo es menor que todo el derecho)" (#19).
        Verificarlo costaría un recorrido de los dos subárboles; no hace
        falta verificarlo, es el invariante del BST aplicado a la raíz. A =
        {10, 20, 30}, B = {50, 60, 70} — las dos fronteras en ámbar.
      caption: "A = r.izq, B = r.der — la precondición de Unir, gratis"
      highlight: [n20, n60]
      nodes:
        - { id: n40, value: 40, parent: null, tag: r, state: marked }
        - { id: n20, value: 20, parent: n40, side: left, tag: A, state: marked }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n30, value: 30, parent: n20, side: right }
        - { id: n60, value: 60, parent: n40, side: right, tag: B, state: marked }
        - { id: n50, value: 50, parent: n60, side: left }
        - { id: n70, value: 70, parent: n60, side: right }
    - note: >-
        Se desprenden los dos hijos y r queda descartado: 40 es el nodo que
        se elimina, y ya no pertenece a ningún árbol. A y B quedan como dos
        splay trees independientes, listos para
        [`Unir`](/structures/splay-tree-adt/operations/join).
      caption: "raiz ← Unir(r.izq, r.der) — r se descarta"
      highlight: [n40]
      nodes:
        - { id: n40, value: 40, parent: null, tag: r, state: muted }
        - { id: n20, value: 20, parent: null, tag: A }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n30, value: 30, parent: n20, side: right }
        - { id: n60, value: 60, parent: null, tag: B }
        - { id: n50, value: 50, parent: n60, side: left }
        - { id: n70, value: 70, parent: n60, side: right }
    - note: >-
        Empieza Unir(A, B). v ← A: se arranca en la raíz de A para buscar su
        máximo bajando por la espina derecha. 40 ya no aparece en el dibujo:
        está eliminado.
      caption: "v ← A"
      highlight: [n20]
      nodes:
        - { id: n20, value: 20, parent: null, tag: v, state: active }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n30, value: 30, parent: n20, side: right }
        - { id: n60, value: 60, parent: null, tag: B }
        - { id: n50, value: 50, parent: n60, side: left }
        - { id: n70, value: 70, parent: n60, side: right }
    - note: >-
        v.der = 30 ≠ NULO ⇒ v ← v.der. El 10 queda descartado de esta
        búsqueda: el máximo nunca está a la izquierda.
      caption: "v ← v.der"
      highlight: [n30]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20, side: left, state: muted }
        - { id: n30, value: 30, parent: n20, side: right, tag: v, state: active }
        - { id: n60, value: 60, parent: null, tag: B }
        - { id: n50, value: 50, parent: n60, side: left }
        - { id: n70, value: 70, parent: n60, side: right }
    - note: >-
        v.der = NULO ⇒ m = 30, el máximo de A. Es la llave inmediatamente
        anterior a la que se eliminó, y va a ser la nueva raíz del árbol
        entero. Delimitador: separa A de B.
      caption: "m = 30 — el máximo de A"
      highlight: [n30]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n30, value: 30, parent: n20, side: right, tag: m, state: marked }
        - { id: n60, value: 60, parent: null, tag: B }
        - { id: n50, value: 50, parent: n60, side: left }
        - { id: n70, value: 70, parent: n60, side: right }
    - note: >-
        LLAMADA 2 a Splay, la de Unir — y la última. 30 sube a la raíz de A
        (un solo zig: era hijo de la raíz). Como era el máximo de A, llega
        arriba SIN hijo derecho: ahí está el hueco donde va a entrar B.
        Éste es el conteo exacto del #20: Eliminar = Buscar + Unir = 2.
      caption: "Splay(m) — llamadas a Splay: 2"
      highlight: [n30]
      nodes:
        - { id: n30, value: 30, parent: null, tag: m, state: active }
        - { id: n20, value: 20, parent: n30, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n60, value: 60, parent: null, tag: B, state: marked }
        - { id: n50, value: 50, parent: n60, side: left }
        - { id: n70, value: 70, parent: n60, side: right }
    - note: >-
        v.der ← B y listo. Un solo árbol, sin el 40, con inorden 10, 20, 30,
        50, 60, 70 — el original menos la llave eliminada, en orden. Dos
        llamadas a Splay en total, ningún caso especial para "el nodo tiene
        dos hijos", ningún rebalanceo.
      caption: "resultado — 2 llamadas a Splay, el máximo de las cinco operaciones"
      highlight: [n30]
      nodes:
        - { id: n30, value: 30, parent: null, state: answer }
        - { id: n20, value: 20, parent: n30, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n60, value: 60, parent: n30, side: right }
        - { id: n50, value: 50, parent: n60, side: left }
        - { id: n70, value: 70, parent: n60, side: right }
---

## Qué hace

Quita la llave `k` del splay tree. Si `k` no está, no hace nada (#19). El
árbol resultante contiene exactamente las mismas llaves menos `k`, y sigue
siendo un BST válido.

## Intuición

En un [BST balanceado](/structures/balanced-bst), borrar es la operación
incómoda: un nodo con dos hijos no se puede simplemente desenganchar, hay que
buscar su sucesor, moverlo a su lugar, y después rebalancear subiendo. Son
dos o tres recorridos y un caso especial.

Acá no hay caso especial, y la razón es de una línea: **`Buscar(k)` deja a
`k` en la raíz**. Un nodo raíz con dos hijos no es un problema, es
precisamente la entrada de
[`Unir`](/structures/splay-tree-adt/operations/join): "sus dos hijos ya
cumplen la precondición de Unir (todo el subárbol izquierdo es menor que todo
el derecho) — Unir hace el resto" (#19).

Se desengancha `k`, se le pasan sus dos hijos a `Unir`, y `Unir` los pega.
Eso es todo.

Es la única de las cinco operaciones con **dos** llamadas a Splay (#20) —
una de `Buscar`, una de `Unir` — y por eso es la que define la constante 2
de "a lo más el doble de lo que cuesta un Splay".

## Algoritmo

1. `Buscar(k)`. Si devuelve falso, `k` no está: terminar.
2. Si devuelve verdadero, `k` quedó en la raíz. `r ← raiz`.
3. La precondición de `Unir` se cumple automáticamente: todo `r.izq` es menor
   que todo `r.der`, porque ambos eran subárboles de un mismo nodo de un BST.
4. `raiz ← Unir(r.izq, r.der)`. `r` queda descartado.

## Pseudocódigo

```
Algoritmo: Eliminar(k)
si ¬Buscar(k) entonces
    devolver                         // k no está en el árbol
r ← raiz
raiz ← Unir(r.izq, r.der)
```

## C++

Ver `step-5-delete.cpp` y `full-implementation.cpp` en el editor de arriba.
`remove(root, k)` sigue el pseudocódigo y añade dos cosas que éste no
modela: poner en `nullptr` los punteros al padre de los dos hijos antes de
pasárselos a `join` (si no,
[`splay`](/structures/splay-tree/operations/splay) subiría más allá de la
raíz de `A`), y liberar con `delete` el nodo desenganchado.

## Complejidad temporal

$O(\log n)$ **amortizado**: **dos** llamadas a Splay, "Eliminar = Buscar +
Unir: 2 llamadas" (#20).

Dónde está cada una:

- La de `Buscar(k)`: descenso hasta `k` (costo real: su profundidad, hasta
  $O(n)$) y Splay para subirlo.
- La de `Unir(A, B)`: descenso por la espina derecha de `A` hasta su máximo,
  y Splay para subirlo.

Nada más. Desenganchar los dos hijos y colgar `B` del hueco son $O(1)$, y no
hay ninguna verificación de la precondición de `Unir` porque no hace falta
(paso 3 del algoritmo). Por eso el #20 puede cerrar con "cada operación
cuesta, amortizado, a lo más el **doble** de lo que cuesta un Splay": la cota
la fija esta operación, y lo que el
[Lema de Acceso](/structures/access-lemma) pruebe sobre un Splay se hereda
acá multiplicado por 2.

## Complejidad espacial

$O(1)$ adicional: dos variables locales (`A`, `B`) y ningún nodo nuevo. Se
libera un nodo, el de `k`.

## Ejemplo

Ver [examples.md](/structures/splay-tree-adt/examples).

## Casos límite

- **Árbol vacío**: `Buscar` no visita ningún nodo, no splaya, devuelve falso,
  y la operación termina. **0 llamadas a Splay**, no 2.
- **`k` no está**: `Buscar` splaya el predecesor o sucesor y devuelve falso.
  **1 llamada**, no 2 — el árbol cambió de forma pero no de contenido.
- **`k` es una hoja**: tras `Buscar`, `k` es la raíz y al menos uno de sus
  dos subárboles está vacío. `Unir` corta en su primera o segunda línea y
  devuelve el otro **sin gastar su llamada a Splay**: la operación entera
  cuesta 1, no 2.
- **`k` es el único nodo**: `Unir(NULO, NULO) = NULO`, el árbol queda vacío.
  Verificado en `full-implementation.cpp`.
- **Un nodo con dos hijos**: es el caso que en un
  [BST balanceado](/structures/balanced-bst) obliga a buscar el sucesor
  aparte. Acá es el caso **normal**, el que el algoritmo asume: `Unir` lo
  resuelve sin ninguna rama extra.
