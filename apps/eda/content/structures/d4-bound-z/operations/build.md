---
kind: operation
title: Build
order: 1
cppSteps:
  - step-1-node.cpp
  - step-2-range-tree-generic.cpp
  - step-3-build-satellite.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  steps:
    - note: >-
        Un árbol de rango sobre z (no sobre y como D₃, no sobre x como D₂):
        raíz y sus dos hijos. Todavía sin ninguna D₃ colgada — es la misma
        forma que D₃ tenía sobre y, una dimensión más arriba.
      nodes:
        - { id: rz, value: "z_raíz", parent: null }
        - { id: zl, value: "izquierda(raíz)", parent: rz }
        - { id: zr, value: "derecha(raíz)", parent: rz }
    - note: >-
        En derecha(raíz) se cuelga una D₃ normal, acotada por arriba
        (z ≤ b3): todo punto en derecha(raíz) va a necesitar sólo esa cota
        superior, nunca la inferior, así que le alcanza con D₃ normal.
      highlight: [zr]
      nodes:
        - { id: rz, value: "z_raíz", parent: null }
        - { id: zl, value: "izquierda(raíz)", parent: rz }
        - { id: zr, value: "derecha(raíz)", parent: rz, state: active }
        - { id: d3-normal, value: "D₃ normal (z ≤ b3)", parent: null, panel: sat }
      panels:
        - { id: sat, label: "satélite de derecha(raíz)", anchor: zr }
    - note: >-
        En izquierda(raíz) se cuelga la gemela invertida, D₃′, acotada por
        abajo (z ≥ a3): el mismo mecanismo de D₃ (normal a la derecha,
        invertida a la izquierda), sólo que la dimensión del árbol cambió de
        y a z y la estructura satélite cambió de D₂/D₂′ a D₃/D₃′.
      highlight: [zl]
      nodes:
        - { id: rz, value: "z_raíz", parent: null }
        - { id: zl, value: "izquierda(raíz)", parent: rz, state: active }
        - { id: zr, value: "derecha(raíz)", parent: rz }
        - { id: d3-inv, value: "D₃′ invertida (z ≥ a3)", parent: null, panel: sat }
      panels:
        - { id: sat, label: "satélite de izquierda(raíz)", anchor: zl }
    - note: >-
        El mismo patrón (D₃ normal a la derecha, D₃′ invertida a la
        izquierda) se repite en CADA nodo interno del árbol de rango sobre
        z, no sólo en la raíz — exactamente como D₃ lo repetía en cada nodo
        de su árbol sobre y.
      caption: "D₄ = árbol de rango sobre z + (D₃ normal, D₃′ invertida) por nodo"
      nodes:
        - { id: rz, value: "z_raíz", parent: null }
        - { id: zl, value: "izquierda(raíz)", parent: rz }
        - { id: zr, value: "derecha(raíz)", parent: rz }
---

## Qué hace

Construye $D_4$: un árbol de rango sobre z donde cada nodo guarda, para los
puntos de sus dos hijos, una copia de $D_3$ (normal a la derecha, invertida a
la izquierda) (#46).

## Intuición

Es literalmente el `build` de [D3-separation-node](/structures/d3-separation-node),
aplicado sobre z en vez de y. Donde $D_3$ construye un árbol de rango sobre y y
cuelga $D_2$/$D_2'$ de cada nodo, $D_4$ construye un árbol de rango sobre z y cuelga
$D_3$/$D_3'$. El mismo procedimiento, una dimensión arriba.

## Algoritmo

1. Ordenar los puntos por z.
2. Construir un árbol de rango balanceado sobre esa coordenada (idéntico al
   de $D_3$ sobre y).
3. En cada nodo v: construir sobre los puntos de derecha(v) una $D_3$ normal
   ($z \le b_3$), y sobre los de izquierda(v) una $D_3$ invertida ($z \ge a_3$).

El material no da un pseudocódigo separado para esto — la descripción en
prosa (#46) es la única fuente, y es la misma que la de $D_3$ con y → z.

## Pseudocódigo

> **Nota de apoyo**: el profesor no da pseudocódigo para $D_4$ (ni para $D_3$).
> Lo de abajo es una transcripción directa de la prosa de #46, marcada como
> derivada, parametrizada en la dimensión para dejar visible que es el mismo
> procedimiento que $D_3$:

```
Construir(puntos, dim):        // dim = y para D_3, dim = z para D_4
    árbol ← ÁrbolDeRangoBalanceado(puntos, clave = dim)
    para cada nodo v de árbol:
        v.satelite_derecha ← Construir_D_{dim-1}(derecha(v), normal)
        v.satelite_izquierda ← Construir_D_{dim-1}(izquierda(v), invertida)
    devolver árbol
```

## C++

Ver el editor arriba. `cpp/structures/d4-bound-z/` construye el árbol de
rango genérico parametrizado en la dimensión y lo aplica dos veces (sobre y
y sobre z) para dejar explícito que $D_3$ y $D_4$ comparten el mismo código de
construcción — no se reimplementa $D_3$.

## Complejidad temporal

El profesor no da una cota propia de esta construcción (ver theory.md,
Análisis de complejidad). Lo único cuantitativo en esta sección es el costo
de *usar* $D_4$ ya construida, no el de construirla.

## Complejidad espacial

Tampoco se da por separado para `build`; la única cifra de espacio del mazo
(#57, #62) es $O(n \lg^3 n)$ para la pila completa $D_1$–$D_4$ con cascading, no para
$D_4$ sola ni para su sola construcción.

## Ejemplo

Ver [Ejemplos](/structures/d4-bound-z/examples) — caso derivado, el mazo no
trae valores concretos.

## Casos límite

- Un único punto: el árbol de rango sobre z es una hoja; los satélites $D_3$
  normal/invertida se construyen sobre conjuntos vacíos o de un punto.
- Todos los puntos con el mismo z: el árbol de rango degenera según el
  mismo criterio de desempate que ya usa $D_3$ sobre y — el material no lo
  trata explícitamente para ninguna de las dos.
- El profesor no discute estos casos para $D_4$ ni para $D_3$ ("implícito pero no
  discutido", según el análisis de la sección anterior); se listan aquí
  porque el schema los pide, no porque el mazo los desarrolle.
