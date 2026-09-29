---
kind: operation
title: Insert
order: 4
cppSteps:
  - step-1-node.cpp
  - step-2-rotations.cpp
  - step-3-insert.cpp
  - step-4-search-predecessor-successor.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Antes de rotar: `p` es la raíz y `n` su hijo izquierdo. `A` y `B`
        cuelgan de `n` (izquierda y derecha) y `C` cuelga de `p` como hijo
        derecho. Los triángulos A, B y C son subárboles completos, no nodos
        sueltos: la rotación los reubica enteros sin mirar qué hay dentro.
      highlight: ["p", "n"]
      nodes:
        - { id: p, value: p, parent: null }
        - { id: n, value: n, parent: p, side: left }
        - { id: A, value: A, parent: n, side: left, collapsed: true }
        - { id: B, value: B, parent: n, side: right, collapsed: true }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
    - note: >-
        El invariante se rompe en `p` porque su subárbol izquierdo (raíz
        `n`) pesa más que `C`. Al rotar a la derecha, `n` va a subir a la
        posición de `p`; miramos entonces a `B`, el hijo derecho de `n`, que
        es el único subárbol que va a cambiar de padre.
      highlight: ["n", "B"]
      nodes:
        - { id: p, value: p, parent: null }
        - { id: n, value: n, parent: p, side: left }
        - { id: A, value: A, parent: n, side: left, collapsed: true }
        - { id: B, value: B, parent: n, side: right, collapsed: true }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
    - note: >-
        Después de rotar: `n` es la nueva raíz y `p` pasa a ser su hijo
        derecho. `A` sigue siendo el hijo izquierdo de `n` (no se movió);
        `B` — el subárbol que identificamos en el paso anterior — ahora
        cuelga de `p` como su hijo izquierdo; `C` sigue como hijo derecho de
        `p`, sin tocar.
      highlight: ["n", "p"]
      nodes:
        - { id: n, value: n, parent: null }
        - { id: A, value: A, parent: n, side: left, collapsed: true }
        - { id: p, value: p, parent: n, side: right }
        - { id: B, value: B, parent: p, side: left, collapsed: true }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
    - note: >-
        El recorrido in-order `A, n, B, p, C` es idéntico antes y después de
        la rotación: sólo cambió la forma del árbol (quién es padre de
        quién), nunca el orden de las llaves que contiene. Por eso la
        rotación siempre produce un BST válido.
      highlight: ["A", "n", "B", "p", "C"]
      nodes:
        - { id: n, value: n, parent: null }
        - { id: A, value: A, parent: n, side: left, collapsed: true }
        - { id: p, value: p, parent: n, side: right }
        - { id: B, value: B, parent: p, side: left, collapsed: true }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
    - note: >-
        Ahora el mismo patrón con valores concretos. Insertamos 10 en el
        árbol de partida {raíz 30, hijo izq 20}.
        Descendemos como en un BST común: 10 < 30, vamos a la izquierda.
      highlight: ["n30"]
      nodes:
        - { id: n30, value: 30, parent: null }
        - { id: n20, value: 20, parent: n30, side: left }
    - note: >-
        10 < 20, seguimos a la izquierda; el hijo izquierdo de 20 es nulo,
        así que 10 se inserta ahí como nueva hoja.
      highlight: ["n20"]
      nodes:
        - { id: n30, value: 30, parent: null }
        - { id: n20, value: 20, parent: n30, side: left }
    - note: >-
        10 insertado. Al subir recalculando alturas, el nodo 30 queda con
        subárbol izquierdo de altura 2 (20-10) y subárbol derecho de altura
        0 (vacío): el invariante de balance se rompe en 30 (caso
        izquierda-izquierda, la cadena 30-20-10 crece toda hacia la
        izquierda).
      highlight: ["n30", "n20", "n10"]
      nodes:
        - { id: n30, value: 30, parent: null }
        - { id: n20, value: 20, parent: n30, side: left }
        - { id: n10, value: 10, parent: n20, side: left }
    - note: >-
        Se corrige con una rotación derecha sobre 30: 20 sube a raíz del
        subárbol, 30 pasa a ser su hijo derecho. El recorrido in-order
        (10, 20, 30) no cambia — sigue siendo un BST válido — y ahora
        ambos subárboles de 20 tienen altura 1: el invariante queda
        restaurado sin tocar ningún otro nodo del árbol.
      highlight: ["n20"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20, side: left }
        - { id: n30, value: 30, parent: n20 }
---

<!-- Concepto de apoyo: no hay diapositiva que citar. Esta es la operación
     donde vive la rotación que el modelo computacional BST de la semana 5
     (content/analysis/week-05-sem5-dynamic-optimality-i.md, sección
     modelo-computacional-bst) declara como primitiva de costo $O(1)$, sin
     desarrollarla — ese desarrollo (dynamic optimality, splay trees) es
     tema de otro agente; aquí sólo se define la rotación en sí. -->

## Qué hace

Inserta una llave nueva en el árbol y restaura el invariante de balance si
la inserción lo rompió.

## Intuición

La primera parte es un `Insert` de BST común: bajar comparando hasta
encontrar dónde debería ir la llave (un hueco nulo) y colgarla ahí como
hoja. Eso solo puede desbalancear el camino que se acaba de recorrer — el
resto del árbol no cambió — así que basta con subir por ese mismo camino
y, en el primer nodo donde el invariante se rompa, aplicar una **rotación**
que lo restaure localmente en $O(1)$.

**Rotación** (la pieza reutilizable): reestructura tres nodos sin romper el
orden in-order. Con `p` padre de `n`, hijos `A`, `B` de `n` y `C` de `p`:

```
Right Rotation (p, n, C)  --->  (n, A, p con hijos B, C)
Left Rotation es la operación inversa.
```

`n` sube a la posición de `p`; `p` pasa a ser el hijo de `n` del lado
contrario al que rotó; el hijo de `n` "sobrante" (`B` en una rotación
derecha) pasa a ser hijo de `p`. El recorrido in-order `A, n, B, p, C` es
idéntico antes y después: la rotación nunca cambia qué llaves hay ni su
orden, sólo la forma del árbol.

## Algoritmo

1. Descender desde la raíz comparando `x` contra cada nodo (como en
   `Search`) hasta llegar a un hijo nulo; insertar ahí una hoja nueva con
   llave `x`.
2. Subir por el mismo camino hacia la raíz. En cada nodo del camino:
   recalcular su altura a partir de sus hijos.
3. Si el invariante de balance se rompe en un nodo (la diferencia de
   alturas de sus dos subárboles excede la constante permitida), aplicar
   la rotación (simple o doble, según el caso) que lo restaura.
4. Repetir el paso 3 subiendo hasta la raíz — restaurar un nodo puede, en
   general, requerir revisar los ancestros, aunque en los esquemas de
   balanceo usuales una sola rotación por nivel basta.

## Pseudocódigo

```
Insert(nodo, x)
si nodo = nulo
    devolver Hoja(llave = x)
si x < nodo.llave
    nodo.izq ← Insert(nodo.izq, x)
si no
    nodo.der ← Insert(nodo.der, x)
nodo.altura ← 1 + max(altura(nodo.izq), altura(nodo.der))
devolver Rebalancear(nodo)

Rebalancear(nodo)
fb ← altura(nodo.izq) - altura(nodo.der)
si fb > 1   // subárbol izquierdo demasiado alto
    devolver RotarDerecha(nodo)
si fb < -1  // subárbol derecho demasiado alto
    devolver RotarIzquierda(nodo)
devolver nodo   // ya balanceado
```

## C++

Ver `step-2-rotations.cpp`, `step-3-insert.cpp` y `full-implementation.cpp`
en el editor de arriba.

## Complejidad temporal

$O(\lg n)$: el descenso para ubicar la hoja nueva y el ascenso para rebalancear
siguen el mismo único camino, de longitud acotada por la altura del árbol
($O(\lg n)$ por el invariante); cada nodo del camino hace $O(1)$ de trabajo
(recalcular altura y, a lo más, una rotación de $O(1)$).

## Complejidad espacial

$O(\lg n)$ de la pila de recursión (o $O(1)$ adicional en la versión iterativa
con punteros al padre).

## Ejemplo

Ver la visualización de arriba: insertar `10` en el árbol de 2 nodos
`{30 (raíz), 20 (hijo izq)}` rompe el invariante en `30` (cadena
30-20-10 hacia la izquierda) y una rotación derecha sobre `30` lo restaura,
dejando `20` como nueva raíz con hijos `10` y `30`.

## Casos límite

- **Árbol vacío**: la nueva llave se vuelve la raíz, sin rotaciones.
- **Llaves insertadas en orden estrictamente creciente o decreciente**: es
  el caso adversario que un BST sin balancear no soporta (degenera en
  lista, $O(n)$ por operación); un BST balanceado lo corrige con rotaciones
  en cada nivel, manteniendo la altura en $O(\lg n)$.
- **Llave duplicada**: no está definida aquí; se asume, como en un BST
  común, que las llaves son únicas (o que el llamador decide si duplicar,
  ignorar o rechazar).
