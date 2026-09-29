---
kind: operation
title: Search
order: 6
cppSteps:
  - step-1-node.cpp
  - step-2-rotate.cpp
  - step-3-zig-zig.cpp
  - step-4-zig-zag.cpp
  - step-5-splay.cpp
  - step-6-search.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Buscar 27 en este árbol de 5 nodos. Es el descenso plano de
        [`Buscar`](/structures/bst-computational-model/operations/search)
        del modelo BST — todavía no hay ningún Splay, sólo comparar y bajar.
        Se arranca en la raíz.
      highlight: ["n20"]
      nodes:
        - { id: n20, value: 20, parent: null, state: active }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n30, value: 30, parent: n20, side: right }
        - { id: n25, value: 25, parent: n30, side: left }
        - { id: n27, value: 27, parent: n25, side: right }
    - note: >-
        27 > 20: el valor buscado es mayor que la raíz, así que se descarta
        todo el subárbol izquierdo (10) y se desciende al hijo derecho, 30.
      highlight: ["n20", "n30"]
      nodes:
        - { id: n20, value: 20, parent: null, state: marked }
        - { id: n10, value: 10, parent: n20, side: left, state: muted }
        - { id: n30, value: 30, parent: n20, side: right, state: active }
        - { id: n25, value: 25, parent: n30, side: left }
        - { id: n27, value: 27, parent: n25, side: right }
    - note: >-
        27 < 30: ahora el valor buscado es menor que el nodo actual, así que
        se descarta el subárbol derecho de 30 (vacío en este ejemplo) y se
        desciende al hijo izquierdo, 25.
      highlight: ["n30", "n25"]
      nodes:
        - { id: n20, value: 20, parent: null, state: muted }
        - { id: n10, value: 10, parent: n20, side: left, state: muted }
        - { id: n30, value: 30, parent: n20, side: right, state: marked }
        - { id: n25, value: 25, parent: n30, side: left, state: active }
        - { id: n27, value: 27, parent: n25, side: right }
    - note: >-
        27 > 25: se descarta el subárbol izquierdo de 25 (vacío) y se
        desciende al hijo derecho, 27.
      highlight: ["n25", "n27"]
      nodes:
        - { id: n20, value: 20, parent: null, state: muted }
        - { id: n10, value: 10, parent: n20, side: left, state: muted }
        - { id: n30, value: 30, parent: n20, side: right, state: muted }
        - { id: n25, value: 25, parent: n30, side: left, state: marked }
        - { id: n27, value: 27, parent: n25, side: right, state: active }
    - note: >-
        27 = 27: encontrado, a profundidad 3. Aquí termina el descenso de
        `Buscar` — el trabajo de `Search` no termina todavía.
      highlight: ["n27"]
      nodes:
        - { id: n20, value: 20, parent: null, state: muted }
        - { id: n10, value: 10, parent: n20, side: left, state: muted }
        - { id: n30, value: 30, parent: n20, side: right, state: muted }
        - { id: n25, value: 25, parent: n30, side: left, state: muted }
        - { id: n27, value: 27, parent: n25, side: right, state: answer }
    - note: >-
        Buscar(27) llama Splay(27) y devuelve **verdadero**: el nodo
        encontrado sube por rotaciones hasta la raíz — ver
        [`splay`](/structures/splay-tree/operations/splay) para el
        detalle paso a paso de esa parte (zig/zig-zig/zig-zag no se
        repiten aquí, es la misma operación referenciada, no reexplicada).
      highlight: ["n27"]
      nodes:
        - { id: n27, value: 27, parent: null, state: answer }
        - { id: n25, value: 25, parent: n27, side: left }
        - { id: n20, value: 20, parent: n25, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n30, value: 30, parent: n27, side: right }
    - note: >-
        Segundo tramo — la búsqueda **fallida**, sobre el árbol que quedó.
        Buscar(26), y 26 no está en el árbol. El descenso arranca igual:
        `v ← raiz`, `ultimo ← NULO` (Sem6 #13).
      caption: "v = 27, ultimo = NULO"
      highlight: ["n27"]
      nodes:
        - { id: n27, value: 27, parent: null, state: active }
        - { id: n25, value: 25, parent: n27, side: left }
        - { id: n20, value: 20, parent: n25, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n30, value: 30, parent: n27, side: right }
    - note: >-
        `ultimo ← 27`; 26 < 27, así que se descarta el subárbol derecho (30)
        y se baja al hijo izquierdo, 25. El `ultimo` se actualiza **antes**
        de comparar: por eso al final siempre guarda el último nodo que se
        llegó a visitar, no el que se iba a visitar.
      caption: "v = 25, ultimo = 27"
      highlight: ["n27", "n25"]
      nodes:
        - { id: n27, value: 27, parent: null, state: marked }
        - { id: n25, value: 25, parent: n27, side: left, state: active }
        - { id: n20, value: 20, parent: n25, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n30, value: 30, parent: n27, side: right, state: muted }
    - note: >-
        `ultimo ← 25`; 26 > 25, así que habría que bajar al hijo derecho de
        25 — y no hay: `v ← NULO`, el bucle termina. 26 no está. `ultimo`
        quedó en 25, que es el **predecesor** de 26 en este árbol (el
        sucesor sería 27; cuál de los dos toca depende del último giro del
        descenso).
      caption: "v = NULO, ultimo = 25 — 26 no está"
      highlight: ["n25"]
      nodes:
        - { id: n27, value: 27, parent: null, state: muted }
        - { id: n25, value: 25, parent: n27, side: left, state: marked }
        - { id: n20, value: 20, parent: n25, side: left, state: muted }
        - { id: n10, value: 10, parent: n20, side: left, state: muted }
        - { id: n30, value: 30, parent: n27, side: right, state: muted }
    - note: >-
        `Splay(ultimo)` y `devolver falso`. Una búsqueda fallida **también**
        reorganiza el árbol: 25 es hijo de la raíz, así que un solo
        [zig](/structures/splay-tree/operations/zig) lo deja arriba. El
        árbol termina con el predecesor (o sucesor) de la llave buscada en
        la raíz — ésa es la garantía que
        [splay-tree-adt](/structures/splay-tree-adt) usa como precondición
        de Separar.
      caption: "devolver falso — pero el árbol quedó splayado igual"
      highlight: ["n25"]
      nodes:
        - { id: n25, value: 25, parent: null, state: answer }
        - { id: n20, value: 20, parent: n25, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n27, value: 27, parent: n25, side: right }
        - { id: n30, value: 30, parent: n27, side: right }
---

## Qué hace

Es [`Buscar(x)`](/structures/bst-computational-model/operations/search) del
modelo BST, seguida siempre de
[`Splay(x)`](/structures/splay-tree/operations/splay): "siempre mueve el
valor de búsqueda x_i a la raíz del árbol mediante la función Splay" (#60).
Es lo que hace del splay tree un BST **autoajustable**: cada consulta
reorganiza el árbol — también cuando la llave **no** está.

Devuelve verdadero o falso (Sem6 #13). El profesor la llama "el ingrediente
base": es, literalmente, la operación de "acceso" que analiza el
[Lema de Acceso](/structures/access-lemma) (Sem6 #14), y el único recorrido
del árbol que [splay-tree-adt](/structures/splay-tree-adt) necesita para
construir Separar, Unir, Insertar y Eliminar.

## Intuición

Descender por el árbol como en cualquier BST, y entonces splayar. La
búsqueda en sí no tiene nada especial — el mecanismo de descenso es
exactamente el de
[`bst-computational-model`](/structures/bst-computational-model/operations/search);
lo que hace diferente al splay tree es lo que pasa **después**.

Y ese "después" existe incluso si la llave no aparece: el descenso guarda el
**último nodo visitado** antes de caerse a `NULO`, y splaya ése. Ese último
nodo es necesariamente el predecesor o el sucesor de `k` — los dos vecinos
inmediatos de donde `k` habría estado. De ahí sale la garantía que hace
posible todo lo demás: al terminar `Buscar(k)`, la raíz es `k` si estaba, y
si no, el vecino más cercano por uno de los dos lados.

## Algoritmo

1. `v ← raiz`, `ultimo ← NULO`.
2. Mientras `v ≠ NULO`: `ultimo ← v`; si `k = v.valor` → `Splay(v)` y
   devolver **verdadero**; si `k < v.valor` → `v ← v.izq`; si no →
   `v ← v.der`.
3. Si se salió del bucle sin encontrar `k` y `ultimo ≠ NULO` →
   `Splay(ultimo)`.
4. Devolver **falso**.

## Pseudocódigo

El del profesor, literal (Sem6 #13):

```
Algoritmo: Buscar(k)
v ← raiz,  ultimo ← NULO
mientras v ≠ NULO hacer
     ultimo ← v
     si k = v.valor entonces
          Splay(v)
          devolver verdadero
     en otro caso
          si k < v.valor entonces
               v ← v.izq
          en otro caso
               v ← v.der
si ultimo ≠ NULO entonces
     Splay(ultimo)
devolver falso
```

"Si `k` no está, Buscar splaya el **último** nodo visitado — el predecesor o
sucesor de `k`. Ésta es, literalmente, la operación de «acceso» que vamos a
analizar con el Lema de Acceso" (Sem6 #14).

## C++

Ver `step-6-search.cpp` y `full-implementation.cpp` en el editor de
arriba: `search(root, k)` devuelve `bool` y sigue el pseudocódigo línea por
línea, incluida la rama fallida (splay de `ultimo`). El puntero al nodo que
quedó en la raíz se lee después en `root`, sin recorrer nada más.

## Complejidad temporal

$O(\log n)$ **amortizado** (#68: "Cada operación toma $O(\log n)$ (amortizado)").
El costo real de una llamada es descenso + Splay: el descenso cuesta
exactamente la profundidad de x (hasta $O(n)$ real, igual que en
[`bst-computational-model`](/structures/bst-computational-model/operations/search)),
y Splay cuesta lo mismo que esa profundidad (cada paso sube uno o dos
niveles). El profesor da la cota sólo para el promedio sobre una secuencia
de búsquedas, no para una búsqueda aislada, que en el peor caso real sigue
siendo $O(n)$.

## Complejidad espacial

$O(1)$ adicional.

## Ejemplo

Ver [examples.md](/structures/splay-tree/examples).

## Casos límite

- **`x` es la raíz**: descenso de costo 0, y
  [`Splay`](/structures/splay-tree/operations/splay) es un no-op (x ya es
  raíz).
- **`k` no está en el árbol**: está definido (Sem6 #13). El descenso termina
  cuando `v` cae a `NULO`; entonces se hace `Splay(ultimo)` — el último nodo
  visitado, que es el predecesor o el sucesor de `k` — y se devuelve
  **falso**. El costo es el mismo que el de una búsqueda exitosa a esa misma
  profundidad: una búsqueda fallida no es más barata ni deja el árbol sin
  tocar. Es justo esa garantía ("la raíz queda siendo el vecino inmediato de
  `k`") la que [splay-tree-adt](/structures/splay-tree-adt) toma como
  precondición de Separar.
- **Árbol vacío**: `v` ya es `NULO` en la primera vuelta, `ultimo` queda en
  `NULO`, no se splaya nada y se devuelve falso — el `si ultimo ≠ NULO` del
  pseudocódigo existe exactamente para este caso.
- **Árbol degenerado en cadena, x es la hoja más profunda**: costo real de
  esta única búsqueda es $O(n)$ — la cota amortizada de $O(\log n)$ sólo se
  cumple promediada sobre la secuencia completa.
