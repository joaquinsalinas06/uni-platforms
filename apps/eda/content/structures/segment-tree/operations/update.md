---
kind: operation
title: Update
order: 2
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
        Actualizar la posición 4 arranca en la raíz [1,4]. Su hijo derecho
        [3,4] cubre la posición 4, así que la recursión sigue por ahí; el
        hijo izquierdo [1,2] no se toca.
      highlight: ["n14"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34 }
        - { id: n44, value: "[4,4]", parent: n34 }
    - note: >-
        En [3,4], la posición 4 cae en el hijo derecho [4,4]; el hijo
        izquierdo [3,3] no se toca.
      highlight: ["n34"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34 }
        - { id: n44, value: "[4,4]", parent: n34 }
    - note: >-
        [4,4] es la hoja buscada: se escribe el nuevo valor directamente.
      highlight: ["n44"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34 }
        - { id: n44, value: "[4,4]", parent: n34 }
    - note: >-
        De regreso, se recalculan [3,4] y [1,4] combinando sus hijos. El
        camino completo raíz → [3,4] → [4,4] es el único que cambió; [1,2],
        [1,1], [2,2], [3,3] quedan intactos. Este es exactamente el camino
        que path-copying copia en vez de mutar, para hacer el árbol
        persistente (ver la estructura análisis/week-03-sem-3-persistencia,
        sección path-copying, página 57).
      highlight: ["n14", "n34", "n44"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34 }
        - { id: n44, value: "[4,4]", parent: n34 }
---

<!-- Concepto de apoyo: no hay diapositiva que citar. Esta operación es la
     razón principal por la que segment-tree existe en la plataforma — es el
     Update que reusa path-copying para volverse persistente (ver
     content/analysis/week-03-sem-3-persistencia.md, líneas 412-424) y el
     mismo Update que decomposable-search-problem aplica sobre el eje del
     tiempo. -->

## Qué hace

Cambia el valor de una posición `i` del arreglo y recalcula todos los nodos
cuyo rango depende de esa posición.

## Intuición

Sólo el camino raíz-hoja de la posición `i` puede haber cambiado: cada nodo
fuera de ese camino representa un rango que no incluye `i`, así que su valor
sigue siendo válido. Se baja recursivamente hasta la hoja `i`, se escribe el
valor nuevo, y al subir se recalcula cada nodo del camino combinando sus dos
hijos (uno de los cuales no cambió).

## Algoritmo

1. Si el nodo es la hoja `i`: escribir el valor nuevo y devolver.
2. Si no: decidir si `i` cae en la mitad izquierda o derecha (`m = (l+r)/2`)
   y recursar sólo por ese lado.
3. Al volver de la recursión: `valor(nodo) ← combinar(valor(hijo_izq), valor(hijo_der))`.

## Pseudocódigo

```
Update(nodo, l, r, i, val)
si l = r
    nodo.valor ← val
    devolver
m ← (l + r) / 2
si i ≤ m
    Update(nodo.izq, l, m, i, val)
si no
    Update(nodo.der, m+1, r, i, val)
nodo.valor ← combinar(nodo.izq.valor, nodo.der.valor)
```

Comparar con el `Update(nodo, l, r, pos, val)` persistente de path-copying:
la única diferencia es que ahí, en vez de mutar `nodo`, se crea `nuevo ← copia
de nodo` y se recursa sobre la copia — el mismo algoritmo, un camino distinto
en memoria.

## C++

Ver `step-3-update.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

$O(\lg n)$: la recursión sigue un único camino desde la raíz hasta una hoja, de
altura $\lceil \lg n \rceil$, y hace $O(1)$ de trabajo (una comparación y, al
volver, una combinación) en cada nodo del camino.

## Complejidad espacial

$O(\lg n)$ de la pila de recursión (o $O(1)$ adicional en la versión
iterativa); en la variante persistente de path-copying, $O(\lg n)$ nodos
nuevos por versión — es justamente esa cota la que hace atractivo path copying frente a
copiar el árbol entero.

## Ejemplo

Sobre el árbol de 4 hojas de `theory.md` (`A = [1,2,3,4]`, combinar = suma),
`Update(raíz, 1, 4, 4, 10)` sigue el camino `[1,4] → [3,4] → [4,4]`: escribe
`10` en la hoja `[4,4]`, recalcula `[3,4] = 3 + 10 = 13`, recalcula
`[1,4] = 3 + 13 = 16`. Los nodos `[1,2]`, `[1,1]`, `[2,2]`, `[3,3]` no se
tocan — es el mismo camino resaltado en la visualización de arriba.

## Casos límite

- **Árbol de una sola hoja ($n = 1$)**: `Update` escribe directo, sin
  recursión.
- **Actualizar con el mismo valor que ya tenía**: el algoritmo no lo detecta
  como caso especial; recalcula igual todo el camino (correcto pero no
  óptimo).
- **i fuera de rango `[1, n]`**: no está definido aquí; se asume precondición
  `1 ≤ i ≤ n`, como en cualquier acceso a arreglo.
