---
kind: operation
title: Query
order: 3
cppSteps:
  - step-1-node.cpp
  - step-2-build.cpp
  - step-3-update.cpp
  - step-4-query.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Query(raíz, 1, 4, 2, 4): la raíz [1,4] se traslapa parcialmente con
        [2,4], así que hay que bajar por los dos hijos.
      highlight: ["n14"]
      nodes:
        - { id: n14, value: "10", parent: null, state: active }
        - { id: n12, value: "3", parent: n14 }
        - { id: n34, value: "7", parent: n14 }
        - { id: n11, value: "1", parent: n12 }
        - { id: n22, value: "2", parent: n12 }
        - { id: n33, value: "3", parent: n34 }
        - { id: n44, value: "4", parent: n34 }
    - note: >-
        n12 = [1,2] también se traslapa parcial (sólo la posición 2 está en
        [2,4]): sigue bajando a sus dos hojas.
      highlight: ["n12"]
      nodes:
        - { id: n14, value: "10", parent: null }
        - { id: n12, value: "3", parent: n14, state: active }
        - { id: n34, value: "7", parent: n14 }
        - { id: n11, value: "1", parent: n12 }
        - { id: n22, value: "2", parent: n12 }
        - { id: n33, value: "3", parent: n34 }
        - { id: n44, value: "4", parent: n34 }
    - note: >-
        n11 = [1,1] cae fuera de [2,4]: no aporta. n22 = [2,2] cae dentro:
        aporta su valor 2 directo, sin bajar más.
      highlight: ["n11", "n22"]
      nodes:
        - { id: n14, value: "10", parent: null }
        - { id: n12, value: "3", parent: n14 }
        - { id: n34, value: "7", parent: n14 }
        - { id: n11, value: "1", parent: n12, state: muted }
        - { id: n22, value: "2", parent: n12, state: answer }
        - { id: n33, value: "3", parent: n34 }
        - { id: n44, value: "4", parent: n34 }
    - note: >-
        n34 = [3,4] está completamente dentro de [2,4]: se usa su valor ya
        combinado (7) sin bajar a sus hijos.
      highlight: ["n34"]
      nodes:
        - { id: n14, value: "10", parent: null }
        - { id: n12, value: "3", parent: n14 }
        - { id: n34, value: "7", parent: n14, state: answer }
        - { id: n11, value: "1", parent: n12, state: muted }
        - { id: n22, value: "2", parent: n12, state: answer }
        - { id: n33, value: "3", parent: n34 }
        - { id: n44, value: "4", parent: n34 }
    - note: >-
        Total: combinar(2, 7) = 9 — dos llamadas "parciales" por nivel como
        máximo, el resto se resuelve en O(1). O(lg n) en total.
      caption: "Query(1,4,2,4) = 9"
      highlight: ["n22", "n34"]
      nodes:
        - { id: n14, value: "10", parent: null }
        - { id: n12, value: "3", parent: n14 }
        - { id: n34, value: "7", parent: n14, state: answer }
        - { id: n11, value: "1", parent: n12, state: muted }
        - { id: n22, value: "2", parent: n12, state: answer }
        - { id: n33, value: "3", parent: n34 }
        - { id: n44, value: "4", parent: n34 }
---

<!-- Concepto de apoyo: no hay diapositiva que citar. Esta es la operación
     que decomposable-search-problem invoca "en cualquier tiempo" sobre el
     segment tree construido sobre el eje del tiempo. -->

## Qué hace

Combina los valores de un rango arbitrario `[ql, qr]` del arreglo, sin
recorrerlo elemento por elemento.

## Intuición

Un nodo cuyo rango `[l, r]` cae completamente dentro de `[ql, qr]` ya tiene la
respuesta lista (su `valor`): no hace falta bajar más por ahí. Un nodo cuyo
rango no toca `[ql, qr]` en absoluto no aporta nada. Sólo los nodos parcialmente
cubiertos necesitan seguir bajando a sus hijos.

## Algoritmo

1. Si `[l, r]` no se traslapa con `[ql, qr]`: devolver el elemento neutro de
   `combinar` (p. ej. 0 para suma, +∞ para mínimo).
2. Si `[l, r]` está completamente dentro de `[ql, qr]`: devolver `valor(nodo)`.
3. Si no (traslape parcial): `m ← (l+r)/2`; devolver
   `combinar(Query(izq, l, m, ql, qr), Query(der, m+1, r, ql, qr))`.

## Pseudocódigo

```
Query(nodo, l, r, ql, qr)
si r < ql o qr < l
    devolver neutro
si ql ≤ l y r ≤ qr
    devolver nodo.valor
m ← (l + r) / 2
devolver combinar(Query(nodo.izq, l, m, ql, qr),
                  Query(nodo.der, m+1, r, ql, qr))
```

## C++

Ver `step-4-query.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

$O(\lg n)$: en cada nivel de la recursión, a lo más dos llamadas son "parciales"
(las que contienen a `ql` o a `qr` en su rango pero no están completamente
dentro); el resto de las llamadas en ese nivel terminan en $O(1)$ por el caso 1
o el caso 2. Con altura $\lceil \lg n \rceil$ y $O(1)$ de llamadas parciales por
nivel, el total es $O(\lg n)$.

## Complejidad espacial

$O(\lg n)$ de la pila de recursión.

## Ejemplo

Sobre el árbol de `A = [1,2,3,4]` (combinar = suma), `Query(raíz, 1, 4, 2, 4)`
resuelve: la raíz `[1,4]` se traslapa parcialmente, baja a `[1,2]` y `[3,4]`.
`[1,2]` se traslapa parcialmente (sólo la posición 2 cae en `[2,4]`), baja a
`[1,1]` (fuera de rango, devuelve 0) y `[2,2]` (dentro, devuelve 2). `[3,4]`
está completamente dentro de `[2,4]`, devuelve su valor `7` sin bajar más.
Total: `0 + 2 + 7 = 9` (= `2+3+4`, correcto).

## Casos límite

- **Rango de consulta = rango completo `[1, n]`**: la raíz ya está
  completamente dentro, `Query` devuelve `valor(raíz)` en O(1) sin bajar.
- **Rango de consulta de un solo elemento**: equivale a bajar por un único
  camino raíz-hoja, igual que Update, en O(lg n).
- **Rango de consulta vacío o fuera de `[1, n]`**: devuelve el elemento
  neutro en la primera llamada.
