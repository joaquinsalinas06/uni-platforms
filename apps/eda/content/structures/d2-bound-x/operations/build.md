---
kind: operation
title: Construcción
order: 1
cppSteps:
  - step-1-node.cpp
  - step-2-build.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  steps:
    - note: >-
        Primero el BST estándar sobre x, del ejemplo de arriba: raíz x=4,
        hijo izquierdo x=3 (con su propio hijo izquierdo x=1) e hijo derecho
        x=6. Todavía sin ninguna estructura satélite colgada.
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4 }
        - { id: n6, value: 6, parent: r4 }
        - { id: n1, value: 1, parent: n3 }
    - note: >-
        En la raíz (x=4) se cuelga una copia de D₁ sobre TODOS los puntos de
        su subárbol — los 4 puntos. Esa D₁ es una estructura de dominancia
        completa, no un valor suelto: por eso se dibuja como panel aparte,
        no como una caja más del árbol.
      highlight: [r4]
      nodes:
        - { id: r4, value: 4, parent: null, state: active }
        - { id: n3, value: 3, parent: r4 }
        - { id: n6, value: 6, parent: r4 }
        - { id: n1, value: 1, parent: n3 }
        - { id: d1-root, value: "D₁({1,3,4,6})", parent: null, panel: sat }
      panels:
        - { id: sat, label: "D₁ satélite de x=4", anchor: r4 }
    - note: >-
        En el nodo x=3 se cuelga una D₁ distinta, sólo sobre los puntos de
        SU subárbol ({1,3}) — no reutiliza la de la raíz. Cada nodo del BST
        paga su propia copia de D₁, y eso es lo que permite que la consulta
        dispare exactamente una consulta de dominancia por nodo canónico.
      highlight: [n3]
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4, state: active }
        - { id: n6, value: 6, parent: r4 }
        - { id: n1, value: 1, parent: n3 }
        - { id: d1-n3, value: "D₁({1,3})", parent: null, panel: sat }
      panels:
        - { id: sat, label: "D₁ satélite de x=3", anchor: n3 }
    - note: >-
        Y en el nodo hoja x=6, la D₁ satélite sólo tiene el punto {6}: el
        patrón es el mismo en toda la altura del árbol, hoja incluida. Al
        terminar, D₂ es el BST sobre x más una D₁ por nodo — la composición
        completa que build produce.
      highlight: [n6]
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4 }
        - { id: n6, value: 6, parent: r4, state: active }
        - { id: n1, value: 1, parent: n3 }
        - { id: d1-n6, value: "D₁({6})", parent: null, panel: sat }
      panels:
        - { id: sat, label: "D₁ satélite de x=6", anchor: n6 }
---

## Qué hace

Construye $D_2$: un BST estándar sobre x donde cada nodo guarda, para los
puntos de su subárbol, una copia de la estructura de dominancia $D_1$.

## Intuición

Es la construcción de un [/structures/range-tree](/structures/range-tree) 1D
sobre x, sólo que la estructura satélite de cada nodo no es un array ordenado
ni otro BST: es una instancia completa de
[/structures/dominance-2d](/structures/dominance-2d) sobre los puntos de ese
subárbol.

## Algoritmo

"Un BST estándar sobre x. Cada nodo guarda, para los puntos de su subárbol,
una copia de la estructura de dominancia ($D_1$) que acabamos de construir."
(#33)

1. Construir el BST balanceado sobre las coordenadas x de los puntos —
   igual que [/structures/range-tree](/structures/range-tree) (no se
   reexplica aquí).
2. En cada nodo v, construir $D_1$ sobre el conjunto de puntos del subárbol de
   v.

## Pseudocódigo

**Ausencia:** el material no trae pseudocódigo propio para $D_2$ (ninguna
diapositiva de #32-34 lo incluye). Sólo el pseudocódigo `ConsultaDominancia`
de $D_1$ (#30-31), que no le pertenece a esta operación.

## C++

Ver `step-2-build.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

**Ausencia:** el profesor no da una cota propia para la construcción de $D_2$
en esta sección — "Nada nuevo todavía" (#34). Se compone recién con $D_3$/$D_4$ y
el cierre general (#53-63); adelantarla aquí sería inventar.

## Complejidad espacial

**Ausencia:** mismo motivo que arriba — el material no la da en esta
sección.

## Ejemplo

*(derivado del pseudocódigo; no aparece en las diapositivas)* Puntos
`{(1,5), (3,2), (4,8), (6,1)}`. El BST sobre x tiene, por ejemplo, raíz x=4
con hijo izquierdo x=3 (y su propio hijo izquierdo x=1) y derecho x=6. La
raíz guarda $D_1$ sobre los 4 puntos; el nodo x=3 guarda $D_1$ sobre
`{(1,5),(3,2)}`; el nodo x=6 guarda $D_1$ sobre `{(6,1)}`.

## Casos límite

- **Un solo punto**: el BST es una sola hoja, cuya $D_1$ satélite tiene un único
  punto.
- **Puntos con la misma x**: el material no lo trata; se resuelve igual que
  en cualquier BST estándar (desempate por orden de inserción o por otra
  coordenada), sin que eso afecte a $D_2$.
