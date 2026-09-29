---
kind: operation
title: Query
order: 4
cppSteps:
  - step-5-query.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Query(t=3) pide el rango [1,3] sobre el árbol de tiempo ya construido
        (mismo estado final de Time-segment-tree-build: n22=5 por
        Insert(t=2), n44=8 por Insert(t=4)). La raíz n14=[1,4] se traslapa
        parcialmente con [1,3]: hay que bajar por sus dos hijos.
      highlight: ["n14"]
      nodes:
        - { id: n14, value: 13, parent: null, state: active }
        - { id: n12, value: 5, parent: n14, state: idle }
        - { id: n34, value: 8, parent: n14, state: idle }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 5, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: idle }
        - { id: n44, value: 8, parent: n34, state: idle }
    - note: >-
        n12 = [1,2] cae completamente dentro de [1,3]: es un nodo canónico —
        se usa su valor ya combinado (5) directo, sin bajar a n11 ni n22.
      highlight: ["n12"]
      nodes:
        - { id: n14, value: 13, parent: null, state: idle }
        - { id: n12, value: 5, parent: n14, state: answer }
        - { id: n34, value: 8, parent: n14, state: idle }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 5, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: idle }
        - { id: n44, value: 8, parent: n34, state: idle }
    - note: >-
        n34 = [3,4] se traslapa parcialmente con [1,3] (sólo la posición 3
        cae dentro del rango pedido): hay que bajar por sus dos hijos.
      highlight: ["n34"]
      nodes:
        - { id: n14, value: 13, parent: null, state: idle }
        - { id: n12, value: 5, parent: n14, state: answer }
        - { id: n34, value: 8, parent: n14, state: active }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 5, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: idle }
        - { id: n44, value: 8, parent: n34, state: idle }
    - note: >-
        n33 = [3,3] cae dentro de [1,3]: canónico, aporta su valor (0)
        directo. n44 = [4,4] cae fuera de [1,3]: no aporta nada.
      highlight: ["n33", "n44"]
      nodes:
        - { id: n14, value: 13, parent: null, state: idle }
        - { id: n12, value: 5, parent: n14, state: answer }
        - { id: n34, value: 8, parent: n14, state: idle }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 5, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: answer }
        - { id: n44, value: 8, parent: n34, state: muted }
    - note: >-
        Total: combinar(5, 0) = 5. Sólo dos nodos canónicos (n12, n33) —
        O(lg m) = 2 niveles con nodo parcial, ninguna hoja recorrida
        directamente salvo las de esos dos canónicos.
      highlight: ["n12", "n33"]
      caption: "Query(1,3) = 5"
      nodes:
        - { id: n14, value: 13, parent: null, state: idle }
        - { id: n12, value: 5, parent: n14, state: answer }
        - { id: n34, value: 8, parent: n14, state: idle }
        - { id: n11, value: 0, parent: n12, state: idle }
        - { id: n22, value: 5, parent: n12, state: idle }
        - { id: n33, value: 0, parent: n34, state: answer }
        - { id: n44, value: 8, parent: n34, state: muted }
---

<!-- Es el resultado final del tema: retroactividad COMPLETA, vía el mismo
     Query de segment tree ya conocido, aplicado al rango [inicio, t] del
     eje del tiempo. -->

## Qué hace

Responde `Query(t, op)` de la interfaz de
[retroactividad](/structures/retroactivity#estructura-interna) para
**cualquier** tiempo `t` del pasado — no sólo el presente. Es lo que hace
que este tema dé retroactividad **completa** y no sólo parcial.

## Intuición

Preguntar "¿cuál es el resultado como si estuviéramos en el tiempo `t`?" es
preguntar por el efecto acumulado de todas las operaciones activas desde el
inicio de la línea de tiempo hasta `t` — es decir, el rango $[1, t]$ del
segment tree de tiempo. Eso es exactamente un
[Query de rango de segment tree](/structures/segment-tree/operations/query):
se descompone `[1, t]` en `O(lg m)` nodos canónicos y se combinan con `f`,
sin recorrer las `t` hojas una por una.

## Algoritmo

Reduce directamente al [Query de segment tree](/structures/segment-tree/operations/query),
con el rango fijo en $[1, t]$:

1. Llamar `Query(raíz, 1, m, 1, t)` sobre el segment tree de tiempo.
2. Ese Query se descompone, como cualquier Query de rango, en a lo más
   $O(\lg m)$ nodos completamente cubiertos por $[1, t]$, combinados con `f`.
3. El resultado es la respuesta de la estructura de búsqueda original **como
   si `t` fuera el presente**.

## Pseudocódigo

```
Cualquier problema de búsqueda descomponible admite retroactividad completa
con un overhead multiplicativo de O(lg m) por operación, usando un Segment
Tree sobre el tiempo. Si la estructura original respondía en O(q), la
versión retroactiva responde en O(q · lg m).
```

(páginas 36-37). El pseudocódigo estructural del recorrido — el caso "fuera
de rango", el caso "completamente dentro", el caso "parcial" que recursa a
ambos hijos — es el de
[Query de segment tree](/structures/segment-tree/operations/query#pseudocódigo);
no se repite aquí.

## C++

Ver `step-5-query.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

$O(q \cdot \lg m)$, donde `q` es el costo de la estructura original y `m` el
número de operaciones. Textual (página 36-37): "Si la estructura original
respondía en `O(q)`, la versión retroactiva responde en `O(q · lg m)`". El
Query de rango visita $O(\lg m)$ nodos canónicos (el argumento heredado de
[Query de segment tree](/structures/segment-tree/operations/query)); en cada
uno se paga el costo $O(q)$ de la estructura original para reconstruir o
combinar su resultado local, de ahí el factor multiplicativo.

## Complejidad espacial

No la da el profesor. Heredada del
[Query de segment tree](/structures/segment-tree/operations/query):
$O(\lg m)$ de pila de recursión.

## Ejemplo

Ver la visualización de
[Time-segment-tree-build](/structures/decomposable-search-problem/operations/time-segment-tree-build) —
`Query(t=1)` devuelve `valor([1,1]) = 0` sin bajar al subárbol de `[2,2]`
(la operación de `t=2` queda fuera de su intervalo de vida); `Query(t=3)` se
descompone en los canónicos `[1,2]` y `[3,3]`, dando `5+0=5` (la misma
operación sí queda dentro de su intervalo de vida para esta consulta).

## Casos límite

- **`t` = el instante más reciente**: equivale a `Query(raíz)` completo, sin
  descomposición — coincide con el rango total $[1, m]$, que es la raíz.
- **`t` menor que el primer instante insertado**: el rango $[1, t]$ cae
  fuera de toda operación insertada; devuelve el neutro de `f` en $O(1)$.
- **`t = m` (la posición más reciente) tras un `Delete` reciente**: refleja
  el estado sin la operación borrada de inmediato — no hace falta rehacer
  nada más, porque `Delete` (ver [Update](/structures/decomposable-search-problem/operations/update))
  ya dejó el segment tree consistente antes de que llegue esta consulta.
