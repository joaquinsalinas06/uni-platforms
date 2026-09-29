---
kind: operation
title: Unir
order: 2
cppSteps:
  - step-1-base.cpp
  - step-2-split.cpp
  - step-3-join.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        La PRECONDICIÓN, dibujada: "todo valor en A es menor que todo valor
        en B" (#17). A tiene 5, 10, 15, 20, 25, 30, 40; B tiene 60, 70, 80.
        Dos splay trees separados, en reposo. No se verifica nada: si la
        precondición no se cumple, Unir produce basura.
      caption: "Precondición: todo A < todo B"
      nodes:
        - { id: a10, value: 10, parent: null, tag: A }
        - { id: a5, value: 5, parent: a10, side: left }
        - { id: a20, value: 20, parent: a10, side: right }
        - { id: a15, value: 15, parent: a20, side: left }
        - { id: a30, value: 30, parent: a20, side: right }
        - { id: a25, value: 25, parent: a30, side: left }
        - { id: a40, value: 40, parent: a30, side: right }
        - { id: b70, value: 70, parent: null, tag: B }
        - { id: b60, value: 60, parent: b70, side: left }
        - { id: b80, value: 80, parent: b70, side: right }
    - note: >-
        v ← A. Se arranca en la raíz de A. El objetivo es encontrar m, el
        máximo de A — y en un BST el máximo es el final de la espina
        derecha, así que basta con seguir bajando por v.der.
      caption: "v ← A"
      highlight: [a10]
      nodes:
        - { id: a10, value: 10, parent: null, tag: v, state: active }
        - { id: a5, value: 5, parent: a10, side: left }
        - { id: a20, value: 20, parent: a10, side: right }
        - { id: a15, value: 15, parent: a20, side: left }
        - { id: a30, value: 30, parent: a20, side: right }
        - { id: a25, value: 25, parent: a30, side: left }
        - { id: a40, value: 40, parent: a30, side: right }
        - { id: b70, value: 70, parent: null, tag: B }
        - { id: b60, value: 60, parent: b70, side: left }
        - { id: b80, value: 80, parent: b70, side: right }
    - note: >-
        v.der = 20 ≠ NULO ⇒ v ← v.der. Primer descenso. Todo el subárbol
        izquierdo de 10 (el 5) queda descartado para siempre en esta
        búsqueda: el máximo nunca puede estar a la izquierda.
      caption: "v ← v.der  (1 de 3)"
      highlight: [a20]
      nodes:
        - { id: a10, value: 10, parent: null }
        - { id: a5, value: 5, parent: a10, side: left, state: muted }
        - { id: a20, value: 20, parent: a10, side: right, tag: v, state: active }
        - { id: a15, value: 15, parent: a20, side: left }
        - { id: a30, value: 30, parent: a20, side: right }
        - { id: a25, value: 25, parent: a30, side: left }
        - { id: a40, value: 40, parent: a30, side: right }
        - { id: b70, value: 70, parent: null, tag: B }
        - { id: b60, value: 60, parent: b70, side: left }
        - { id: b80, value: 80, parent: b70, side: right }
    - note: >-
        v.der = 30 ≠ NULO ⇒ v ← v.der otra vez. El 15 se descarta por la
        misma razón. Este descenso es el único recorrido que Unir hace por
        su cuenta, y cuesta la profundidad del máximo de A.
      caption: "v ← v.der  (2 de 3)"
      highlight: [a30]
      nodes:
        - { id: a10, value: 10, parent: null }
        - { id: a5, value: 5, parent: a10, side: left, state: muted }
        - { id: a20, value: 20, parent: a10, side: right }
        - { id: a15, value: 15, parent: a20, side: left, state: muted }
        - { id: a30, value: 30, parent: a20, side: right, tag: v, state: active }
        - { id: a25, value: 25, parent: a30, side: left }
        - { id: a40, value: 40, parent: a30, side: right }
        - { id: b70, value: 70, parent: null, tag: B }
        - { id: b60, value: 60, parent: b70, side: left }
        - { id: b80, value: 80, parent: b70, side: right }
    - note: >-
        v.der = 40 ≠ NULO ⇒ tercer y último descenso. Ya se descartaron
        también el 25 y todo lo que colgaba a su izquierda.
      caption: "v ← v.der  (3 de 3)"
      highlight: [a40]
      nodes:
        - { id: a10, value: 10, parent: null }
        - { id: a5, value: 5, parent: a10, side: left, state: muted }
        - { id: a20, value: 20, parent: a10, side: right }
        - { id: a15, value: 15, parent: a20, side: left, state: muted }
        - { id: a30, value: 30, parent: a20, side: right }
        - { id: a25, value: 25, parent: a30, side: left, state: muted }
        - { id: a40, value: 40, parent: a30, side: right, tag: v, state: active }
        - { id: b70, value: 70, parent: null, tag: B }
        - { id: b60, value: 60, parent: b70, side: left }
        - { id: b80, value: 80, parent: b70, side: right }
    - note: >-
        v.der = NULO ⇒ el bucle termina. v = 40 es m, el máximo de A. Se
        marca como delimitador y no como nodo activo porque su papel a
        partir de acá es ser la FRONTERA entre A y B: es la llave más
        grande de A, y por la precondición, menor que cualquier llave de B.
      caption: "v.der = NULO  ⇒  m = 40, el máximo de A"
      highlight: [a40]
      nodes:
        - { id: a10, value: 10, parent: null }
        - { id: a5, value: 5, parent: a10, side: left }
        - { id: a20, value: 20, parent: a10, side: right }
        - { id: a15, value: 15, parent: a20, side: left }
        - { id: a30, value: 30, parent: a20, side: right }
        - { id: a25, value: 25, parent: a30, side: left }
        - { id: a40, value: 40, parent: a30, side: right, tag: m, state: marked }
        - { id: b70, value: 70, parent: null, tag: B }
        - { id: b60, value: 60, parent: b70, side: left }
        - { id: b80, value: 80, parent: b70, side: right }
    - note: >-
        Splay(m) — la ÚNICA llamada a Splay de toda la operación (#20). 40
        sube hasta la raíz de A con rotaciones (zig-zig y zig; el detalle
        está en [`splay`](/structures/splay-tree/operations/splay), no se
        reexplica acá). A se reorganiza entero; B no se toca.
      caption: "Splay(m)  — 1 llamada, la única de Unir"
      highlight: [a40]
      nodes:
        - { id: a40, value: 40, parent: null, tag: v, state: active }
        - { id: a10, value: 10, parent: a40, side: left }
        - { id: a5, value: 5, parent: a10, side: left }
        - { id: a30, value: 30, parent: a10, side: right }
        - { id: a20, value: 20, parent: a30, side: left }
        - { id: a15, value: 15, parent: a20, side: left }
        - { id: a25, value: 25, parent: a20, side: right }
        - { id: b70, value: 70, parent: null, tag: B }
        - { id: b60, value: 60, parent: b70, side: left }
        - { id: b80, value: 80, parent: b70, side: right }
    - note: >-
        EL PASO CLAVE. m está ahora en la raíz de A y NO tiene hijo derecho
        — y eso no es casualidad: m era el máximo de A, así que nunca tuvo
        hijo derecho, y ninguna rotación de Splay se lo pudo inventar. Ese
        hueco a la derecha de la raíz es exactamente del tamaño y de la
        posición que hace falta: todo lo que vaya ahí tiene que ser mayor
        que m, y B lo es por la precondición.
      caption: "m es raíz de A y m.der = NULO — el hueco donde entra B"
      highlight: [a40, b70]
      nodes:
        - { id: a40, value: 40, parent: null, tag: m, state: marked }
        - { id: a10, value: 10, parent: a40, side: left }
        - { id: a5, value: 5, parent: a10, side: left }
        - { id: a30, value: 30, parent: a10, side: right }
        - { id: a20, value: 20, parent: a30, side: left }
        - { id: a15, value: 15, parent: a20, side: left }
        - { id: a25, value: 25, parent: a20, side: right }
        - { id: b70, value: 70, parent: null, tag: B, state: marked }
        - { id: b60, value: 60, parent: b70, side: left }
        - { id: b80, value: 80, parent: b70, side: right }
    - note: >-
        v.der ← B. Una sola asignación de puntero: B entero pasa a colgar
        del hueco derecho de m. No se recorre B, no se compara nada dentro
        de B, no se copia ningún nodo.
      caption: "v.der ← B  — un puntero"
      highlight: [a40, b70]
      nodes:
        - { id: a40, value: 40, parent: null, tag: v, state: active }
        - { id: a10, value: 10, parent: a40, side: left }
        - { id: a5, value: 5, parent: a10, side: left }
        - { id: a30, value: 30, parent: a10, side: right }
        - { id: a20, value: 20, parent: a30, side: left }
        - { id: a15, value: 15, parent: a20, side: left }
        - { id: a25, value: 25, parent: a20, side: right }
        - { id: b70, value: 70, parent: a40, side: right, tag: B, state: marked }
        - { id: b60, value: 60, parent: b70, side: left }
        - { id: b80, value: 80, parent: b70, side: right }
    - note: >-
        Resultado: un solo splay tree con la raíz en m. El recorrido inorden
        es 5, 10, 15, 20, 25, 30, 40, 60, 70, 80 — exactamente el inorden de
        A seguido del de B, que es la definición de "unir" bien hecha. Sigue
        siendo un BST válido: todo lo que cuelga a la izquierda de 40 es
        menor, todo lo de la derecha es mayor.
      caption: "devolver v  — inorden(A) seguido de inorden(B)"
      highlight: [a40]
      nodes:
        - { id: a40, value: 40, parent: null, state: answer }
        - { id: a10, value: 10, parent: a40, side: left }
        - { id: a5, value: 5, parent: a10, side: left }
        - { id: a30, value: 30, parent: a10, side: right }
        - { id: a20, value: 20, parent: a30, side: left }
        - { id: a15, value: 15, parent: a20, side: left }
        - { id: a25, value: 25, parent: a20, side: right }
        - { id: b70, value: 70, parent: a40, side: right }
        - { id: b60, value: 60, parent: b70, side: left }
        - { id: b80, value: 80, parent: b70, side: right }
---

## Qué hace

Pega dos splay trees `A` y `B` en uno solo, con la **precondición** de que
"todo valor en A es menor que todo valor en B" (#17). El resultado tiene
todas las llaves de ambos y su recorrido inorden es el inorden de `A`
seguido del de `B`.

Es la operación inversa de
[`Separar`](/structures/splay-tree-adt/operations/split), y la precondición
es exactamente lo que `Separar` garantiza en su salida.

## Intuición

Para pegar dos árboles ordenados hace falta un nodo que sirva de bisagra:
alguien que sea mayor que todo `A` salvo él mismo, y menor que todo `B`. El
**máximo de A** es el único candidato posible, y encontrarlo es trivial en un
BST — es el final de la espina derecha.

Lo bonito es qué pasa cuando se lo splaya. `m` era el máximo de `A`, así que
no tenía hijo derecho; Splay lo lleva a la raíz de `A` con rotaciones, y
ninguna rotación puede darle un hijo derecho que no tenía. **`m` llega a la
raíz con el hueco derecho vacío** — y ese hueco es exactamente donde tiene
que ir `B`.

No es que Splay se use para "acomodar" el árbol. Se usa porque deja el hueco
justo donde hace falta, y de paso paga el costo amortizado que el
[access-lemma](/structures/access-lemma) va a acotar.

## Algoritmo

1. Si `A = NULO`, devolver `B`. Si `B = NULO`, devolver `A`. (Nada que
   pegar.)
2. `v ← A`; bajar por `v.der` mientras no sea `NULO`. Al salir, `v = m`, el
   máximo de `A`.
3. `Splay(v)` — dentro de `A`. Ahora `m` es la raíz de `A` y, por haber sido
   el máximo, `m.der = NULO`.
4. `v.der ← B`.
5. Devolver `v`.

## Pseudocódigo

```
Algoritmo: Unir(A, B)
// Precondición: todo valor en A es menor que todo valor en B; m = máximo de A
si A = NULO entonces
    devolver B
si B = NULO entonces
    devolver A
v ← A
mientras v.der ≠ NULO hacer
    v ← v.der
Splay(v)                        // v = m, ahora raíz de A
v.der ← B
devolver v
```

## C++

Ver `step-3-join.cpp` y `full-implementation.cpp` en el editor de arriba.
`join(A, B)` recibe las dos raíces por valor y devuelve la nueva: la llamada
`splay(A, v)` opera sobre la variable local `A`, es decir **dentro** del
árbol izquierdo, no sobre la raíz global. La implementación además fija
`B->parent = v`, que el pseudocódigo no menciona porque no modela punteros
al padre.

## Complejidad temporal

$O(\log n)$ **amortizado** (#20). El desglose del costo real:

- El descenso por la espina derecha de `A` hasta `m`: cuesta la profundidad
  de `m`, que en un `A` degenerado en cadena hacia la derecha es $O(n)$.
- `Splay(m)`: **una** llamada, la única de la operación (#20). Su costo real
  es proporcional a esa misma profundidad.
- `v.der ← B`: $O(1)$.

El profesor no suma esos términos por separado: los agrupa en "cada
operación cuesta, amortizado, a lo más el doble de lo que cuesta un Splay"
(#20). El descenso y el Splay recorren el mismo camino, así que están dentro
de la misma cota, no encima de ella — cualquier cota que el
[Lema de Acceso](/structures/access-lemma) pruebe sobre Splay vale acá.

## Complejidad espacial

$O(1)$ adicional: una variable `v` y ningún nodo nuevo. Los dos árboles de
entrada se reutilizan enteros.

## Ejemplo

Ver [examples.md](/structures/splay-tree-adt/examples).

## Casos límite

- **`A = NULO`**: devolver `B` sin tocar nada — y **sin gastar la llamada a
  Splay**. Es la primera línea del pseudocódigo (#17).
- **`B = NULO`**: devolver `A`, también sin Splay. Ambos casos importan para
  el conteo del #20: un `Eliminar` de una hoja gasta 1 llamada, no 2.
- **`A` tiene un solo nodo**: el bucle no se ejecuta (`v.der` ya es `NULO`),
  `Splay(v)` es un no-op porque `v` ya es la raíz — pero cuenta como llamada
  igual — y `B` se cuelga directo.
- **`A` degenerado en cadena hacia la derecha**: el descenso hasta `m` cuesta
  $O(n)$ real. Es el peor caso real de la operación, y el mismo que tiene
  cualquier búsqueda del nodo más profundo en
  [splay-tree](/structures/splay-tree).
- **La precondición no se cumple** (alguna llave de `B` es menor que alguna
  de `A`): `Unir` no lo detecta y produce un árbol que ya no es un BST. La
  precondición no se verifica porque verificarla costaría el recorrido que
  todo este tema se esfuerza en evitar (#12).
