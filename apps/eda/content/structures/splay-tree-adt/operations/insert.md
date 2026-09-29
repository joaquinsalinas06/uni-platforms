---
kind: operation
title: Insertar
order: 3
cppSteps:
  - step-1-base.cpp
  - step-2-split.cpp
  - step-3-join.cpp
  - step-4-insert.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Insertar(35) en este árbol de 7 nodos. 35 no está — si estuviera,
        Buscar devolvería verdadero y la operación terminaría ahí mismo,
        sin insertar nada (#18). Árbol en reposo.
      caption: "Insertar(35)"
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n5, value: 5, parent: n10, side: left }
        - { id: n15, value: 15, parent: n10, side: right }
        - { id: n40, value: 40, parent: n20, side: right }
        - { id: n30, value: 30, parent: n40, side: left }
        - { id: n50, value: 50, parent: n40, side: right }
    - note: >-
        Buscar(35) desciende 20 → 40 → 30 y se queda sin árbol: 30.der es
        NULO. 35 no está. Éste es el ÚNICO recorrido del árbol de toda la
        operación — no se reexplica el descenso, es
        [`Buscar`](/structures/splay-tree/operations/search) tal cual, sólo
        que fallando.
      caption: "Buscar(35) = falso — último visitado: 30"
      highlight: [n30]
      nodes:
        - { id: n20, value: 20, parent: null, state: muted }
        - { id: n10, value: 10, parent: n20, side: left, state: muted }
        - { id: n5, value: 5, parent: n10, side: left, state: muted }
        - { id: n15, value: 15, parent: n10, side: right, state: muted }
        - { id: n40, value: 40, parent: n20, side: right, state: muted }
        - { id: n30, value: 30, parent: n40, side: left, state: active }
        - { id: n50, value: 50, parent: n40, side: right, state: muted }
    - note: >-
        Buscar splaya el último nodo visitado (#14): 30 sube a la raíz.
        "Buscar(k) ya dejó al predecesor o sucesor de k en la raíz" (#18) —
        acá quedó el predecesor, 30. Ésta es la única llamada a Splay de
        toda la operación (#20).
      caption: "Splay(30) — 1 llamada, la de Buscar"
      highlight: [n30]
      nodes:
        - { id: n30, value: 30, parent: null, tag: r, state: active }
        - { id: n20, value: 20, parent: n30, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n5, value: 5, parent: n10, side: left }
        - { id: n15, value: 15, parent: n10, side: right }
        - { id: n40, value: 40, parent: n30, side: right }
        - { id: n50, value: 50, parent: n40, side: right }
    - note: >-
        Con 30 en la raíz, la precondición de
        [`Separar`](/structures/splay-tree-adt/operations/split) ya se
        cumple gratis: todo el subárbol izquierdo (20, 10, 5, 15) vale a lo
        más 35, y todo el derecho (40, 50) vale más. La frontera está
        exactamente en la raíz — ámbar porque eso es lo que es, un
        delimitador.
      caption: "la raíz ya es la frontera entre ≤ 35 y > 35"
      highlight: [n30]
      nodes:
        - { id: n30, value: 30, parent: null, tag: r, state: marked }
        - { id: n20, value: 20, parent: n30, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n5, value: 5, parent: n10, side: left }
        - { id: n15, value: 15, parent: n10, side: right }
        - { id: n40, value: 40, parent: n30, side: right }
        - { id: n50, value: 50, parent: n40, side: right }
    - note: >-
        Separar(35): la única comparación, 30 ≤ 35 ⇒ corre la primera rama.
        I ← r (la raíz se queda del lado izquierdo) y D ← r.der, el 40 con
        todo lo que cuelga de él.
      caption: "r.valor ≤ k  ⇒  I ← r,  D ← r.der"
      highlight: [n30, n40]
      nodes:
        - { id: n30, value: 30, parent: null, tag: I, state: active }
        - { id: n20, value: 20, parent: n30, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n5, value: 5, parent: n10, side: left }
        - { id: n15, value: 15, parent: n10, side: right }
        - { id: n40, value: 40, parent: n30, side: right, tag: D, state: marked }
        - { id: n50, value: 50, parent: n40, side: right }
    - note: >-
        r.der ← NULO. El árbol queda partido en dos, y Separar no gastó ni
        una llamada a Splay para hacerlo (#16, #20). I tiene 5, 10, 15, 20,
        30; D tiene 40, 50.
      caption: "r.der ← NULO  — 0 llamadas a Splay gastadas acá"
      highlight: [n30, n40]
      nodes:
        - { id: n30, value: 30, parent: null, tag: I, state: answer }
        - { id: n20, value: 20, parent: n30, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n5, value: 5, parent: n10, side: left }
        - { id: n15, value: 15, parent: n10, side: right }
        - { id: n40, value: 40, parent: null, tag: D, state: answer }
        - { id: n50, value: 50, parent: n40, side: right }
    - note: >-
        x ← nuevo nodo con valor 35. Es el único nodo que se crea en toda la
        operación (contorno grueso: es nuevo en esta versión del árbol). I y
        D siguen ahí, intactos, esperando.
      caption: "x ← nuevo nodo con valor k"
      highlight: [n35]
      nodes:
        - { id: n35, value: 35, parent: null, tag: x, state: copied }
        - { id: n30, value: 30, parent: null, tag: I }
        - { id: n20, value: 20, parent: n30, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n5, value: 5, parent: n10, side: left }
        - { id: n15, value: 15, parent: n10, side: right }
        - { id: n40, value: 40, parent: null, tag: D }
        - { id: n50, value: 50, parent: n40, side: right }
    - note: >-
        x.izq ← I, x.der ← D, raiz ← x. Tres asignaciones de puntero y se
        acabó. El resultado es un BST válido por construcción: todo I es a
        lo más 35 y todo D es mayor. "Ningún recorrido adicional del árbol"
        (#18) — el único que hubo fue el de Buscar, al principio.
      caption: "x.izq ← I,  x.der ← D,  raiz ← x"
      highlight: [n35]
      nodes:
        - { id: n35, value: 35, parent: null, state: answer }
        - { id: n30, value: 30, parent: n35, side: left }
        - { id: n20, value: 20, parent: n30, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n5, value: 5, parent: n10, side: left }
        - { id: n15, value: 15, parent: n10, side: right }
        - { id: n40, value: 40, parent: n35, side: right }
        - { id: n50, value: 50, parent: n40, side: right }
---

## Qué hace

Añade la llave `k` al splay tree, dejándola en la raíz. Si `k` ya estaba, no
hace nada (#18). El árbol resultante sigue siendo un BST válido y no tiene
ningún nodo duplicado.

## Intuición

El título del profesor es "Insertar, en pocas líneas" (#18), y la razón es
que no queda casi nada por hacer:

`Buscar(k)` ya bajó por el árbol y, al fallar, dejó al predecesor o sucesor
de `k` en la raíz (#14). Eso significa que la raíz ya parte el universo de
llaves en "a lo más `k`" y "mayor que `k`", justo por donde `k` va a caer.
`Separar` cobra esa partición con un puntero. Y entonces `k` no se inserta
*dentro* de nada: se cuelga **encima** de los dos pedazos, como raíz nueva.

"Buscar(k) ya dejó al predecesor o sucesor de k en la raíz — Separar lo parte
en dos, y x se cuelga encima. **Ningún** recorrido adicional del árbol"
(#18).

Compárese con la inserción de un
[BST balanceado](/structures/balanced-bst): ahí hay que bajar hasta el hueco
correcto, enganchar la hoja, y después subir rebalanceando. Acá el nodo nuevo
nace en la raíz y no hay invariante de forma que restaurar.

## Algoritmo

1. `Buscar(k)`. Si devuelve verdadero, `k` ya estaba: terminar sin insertar.
2. Si devuelve falso, la raíz es el predecesor o sucesor de `k` — la
   precondición de `Separar` ya está satisfecha.
3. `(I, D) ← Separar(k)`.
4. `x ← nuevo nodo con valor k`.
5. `x.izq ← I`, `x.der ← D`, `raiz ← x`.

## Pseudocódigo

```
Algoritmo: Insertar(k)
si Buscar(k) entonces
    devolver                         // k ya estaba en el árbol
en otro caso
    (I, D) ← Separar(k)
    x ← nuevo nodo con valor k
    x.izq ← I,  x.der ← D,  raiz ← x
```

## C++

Ver `step-4-insert.cpp` y `full-implementation.cpp` en el editor de arriba.
`insert(root, k)` es el pseudocódigo línea por línea; lo único que añade es
fijar los punteros al padre de `I` y `D` hacia `x`, porque el pseudocódigo no
modela ese campo y
[`splay`](/structures/splay-tree/operations/splay) lo necesita para subir.

## Complejidad temporal

$O(\log n)$ **amortizado**: **una** llamada a Splay, la de su propio
`Buscar` (#20).

El desglose importa porque explica por qué es sólo una. `Buscar(k)`
desciende (costo real: la profundidad a la que muere el descenso, hasta
$O(n)$) y splaya el último visitado — ahí está la llamada. Después de eso,
todo es $O(1)$: `Separar` es
[$O(1)$ adicional](/structures/splay-tree-adt/operations/split) (#16), crear
`x` es $O(1)$, y colgar `I` y `D` son dos punteros.

Es decir: **insertar cuesta lo mismo que buscar**. La cota que el
[Lema de Acceso](/structures/access-lemma) pruebe sobre Splay se aplica tal
cual, con la constante 2 del #20 como techo.

## Complejidad espacial

$O(1)$ adicional además del nodo nuevo: un `Node` por llave insertada, que es
el mínimo posible. `Separar` no copia nada y `x` se engancha sobre los mismos
nodos que ya existían.

## Ejemplo

Ver [examples.md](/structures/splay-tree-adt/examples).

## Casos límite

- **Árbol vacío**: `Buscar(k)` no visita ningún nodo, así que no hay nada que
  splayar y la llamada a Splay **no ocurre** (0 llamadas, no 1). `Separar`
  devuelve `(NULO, NULO)` por su primera línea, y `x` queda como único nodo.
- **`k` ya estaba**: `Buscar` devuelve verdadero y la operación termina — pero
  el Splay ya ocurrió y `k` quedó en la raíz. El árbol cambió de forma aunque
  no cambió de contenido; es el comportamiento normal de un splay tree, no un
  efecto secundario indeseado.
- **`k` es la llave mínima o máxima del árbol**: tras `Buscar`, la raíz es el
  sucesor (o predecesor) y `Separar` devuelve uno de los dos lados vacío. `x`
  queda con un solo hijo. Correcto.
- **Inserciones en orden creciente** (`1, 2, 3, …, n`): cada `Buscar` falla
  contra el máximo actual, que siempre está en la raíz, así que cada
  inserción cuesta $O(1)$ real. El árbol queda como una cadena hacia la
  izquierda — degenerado, pero construido en $O(n)$ total. Se puede verificar
  en `full-implementation.cpp`, que hace exactamente esas 200 inserciones.
