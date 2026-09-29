---
kind: operation
title: Consulta
order: 2
cppSteps:
  - step-1-node.cpp
  - step-2-build.cpp
  - step-3-query.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  steps:
    - note: >-
        Mismo BST de `build.md` (raíz x=4, hijo izquierdo x=3 con su propio
        hijo izquierdo x=1, hijo derecho x=6), ya con su $D_1$ satélite
        construida en cada nodo. Consulta ilustrativa
        $[1, 4] \times (-\infty, 6] \times (-\infty, 10]$: rango cerrado
        $[1,4]$ en x, dominancia $(b_2, b_3) = (6, 10)$ en (y, z). Todavía
        sin visitar ningún nodo.
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4 }
        - { id: n6, value: 6, parent: r4 }
        - { id: n1, value: 1, parent: n3 }
    - note: >-
        Se visita la raíz x=4: 4 ∈ [1,4], está dentro del rango — pero su
        subárbol completo {1,3,4,6} NO cabe entero en [1,4] (incluye x=6,
        fuera). No puede tratarse como nodo canónico de lote: la raíz se
        revisará individualmente más adelante, y hay que recorrer ambos
        hijos por separado.
      highlight: [r4]
      nodes:
        - { id: r4, value: 4, parent: null, state: active }
        - { id: n3, value: 3, parent: r4 }
        - { id: n6, value: 6, parent: r4 }
        - { id: n1, value: 1, parent: n3 }
    - note: >-
        Hijo derecho x=6: 6 > 4 (fuera de $[1,4]$), y como es un BST, todo
        su subárbol (aquí sólo él mismo) también queda fuera. Se descarta
        de una vez, sin disparar ninguna consulta de dominancia sobre su
        $D_1$ satélite — poda completa.
      highlight: [n6]
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4 }
        - { id: n6, value: 6, parent: r4, state: muted }
        - { id: n1, value: 1, parent: n3 }
    - note: >-
        Hijo izquierdo x=3: su subárbol completo {1,3} SÍ cabe entero en
        $[1,4]$ — este es un nodo canónico de verdad, del tipo que $D_2$
        existe para aprovechar. Se cuelga su $D_1$ satélite, ya construida
        en `build.md` sobre {1,3}, sin necesidad de visitar x=1 por
        separado: su punto ya está incluido dentro de esa $D_1$.
      highlight: [n3]
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4, state: active }
        - { id: n6, value: 6, parent: r4, state: muted }
        - { id: n1, value: 1, parent: n3 }
        - { id: d1-n3, value: "D₁({1,3})", parent: null, panel: sat }
      panels:
        - { id: sat, label: "D₁ satélite de x=3 (nodo canónico)", anchor: n3 }
    - note: >-
        Se dispara la consulta de dominancia sobre esa $D_1$ satélite con
        $(b_2, b_3) = (6, 10)$ — la operación `dominance-query` de
        [/structures/dominance-2d](/structures/dominance-2d), no se
        reexplica aquí. Es la única consulta de dominancia de todo este
        subárbol: una, no dos.
      highlight: [n3, d1-n3]
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4, state: active }
        - { id: n6, value: 6, parent: r4, state: muted }
        - { id: n1, value: 1, parent: n3 }
        - { id: d1-n3, value: "D₁({1,3}) ⊳ query(6,10)", parent: null, panel: sat, state: active }
      panels:
        - { id: sat, label: "D₁ satélite de x=3 (nodo canónico)", anchor: n3 }
    - note: >-
        Resultado final. La $D_1$ de x=3 devuelve sus dos puntos, (1,5) y
        (3,2): ambos cumplen y ≤ 6, así que x=1 aparece en la respuesta
        aunque nunca se visitó por sí solo — esa es la ganancia de colgar
        $D_1$ del árbol. La raíz se revisa por fin de forma individual (no
        vía su $D_1$ satélite completa, que incluiría también x=1 y x=6):
        su propio punto es (4,8), y 8 > 6 no cumple $b_2$ — queda fuera. x=6
        sigue descartado desde el paso 3. Respuesta: {(1,5), (3,2)}.
      highlight: [d1-n3, n3, n1, r4]
      nodes:
        - { id: r4, value: "4 — punto (4,8), y=8 > b2=6", parent: null, state: muted }
        - { id: n3, value: "3 — (3,2), incluido", parent: r4, state: answer }
        - { id: n6, value: 6, parent: r4, state: muted }
        - { id: n1, value: "1 — (1,5), incluido vía D₁ de x=3", parent: n3, state: answer }
        - { id: d1-n3, value: "D₁({1,3}) → {(1,5), (3,2)}", parent: null, panel: sat, state: answer }
      panels:
        - { id: sat, label: "D₁ satélite de x=3 (nodo canónico)", anchor: n3 }
---

## Qué hace

Responde consultas $[x_1, x_2] \times (-\infty, b_2] \times (-\infty, b_3)$: rango cerrado en x,
dominancia en (y, z).

## Intuición

Se compone en dos capas: primero se localizan los $O(\lg n)$ nodos canónicos de
$[x_1, x_2]$ en el BST sobre x —igual que en
[/structures/range-tree](/structures/range-tree)—, y luego, en cada uno de
esos nodos, se dispara **una** consulta de dominancia sobre la $D_1$ satélite de
ese nodo.

## Algoritmo

"La consulta usa la descomposición canónica de siempre: los $O(\lg n)$ nodos
canónicos de $[x_1, x_2]$, disparando una consulta de dominancia en cada uno."
(#34)

1. Descomponer $[x_1, x_2]$ en sus nodos canónicos sobre el BST de x — misma
   descomposición canónica de [/structures/range-tree](/structures/range-tree)
   (no se reexplica aquí).
2. Para cada nodo canónico v: consultar la $D_1$ satélite de v con $(b_2, b_3)$ —
   la operación `dominance-query` de
   [/structures/dominance-2d](/structures/dominance-2d).
3. Reportar la unión de los resultados de todas las consultas de dominancia.

## Pseudocódigo

**Ausencia:** el material no trae pseudocódigo propio para esta consulta
(ninguna diapositiva de #32-34 lo incluye).

## C++

Ver `step-3-query.cpp` y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

**Ausencia:** el profesor no da una cota propia aquí — "Nada nuevo todavía —
lo interesante empieza al agregar la segunda dimensión acotada." (#34). Sí
deja el **caso límite que motiva la siguiente estructura**: si se acotara y
con la misma técnica (otra descomposición canónica dentro de cada nodo
canónico de x), el costo sería $O(\lg n)$ nodos canónicos en x, cada uno con
$O(\lg n)$ nodos canónicos en y — **$O(\lg^2 n)$** consultas, perdiendo el $O(\lg n)$
buscado (#35-36). Esa es la razón de ser de
[/structures/d3-separation-node](/structures/d3-separation-node): evitar la
descomposición canónica en y por completo.

## Complejidad espacial

**Ausencia:** el material no la da en esta sección.

## Ejemplo

*(derivado del pseudocódigo; no aparece en las diapositivas)* Sobre el BST
del ejemplo de `build.md` (raíz x=4, hijos x=3 y x=6, nieto x=1), una
consulta $[2, 5] \times (-\infty, 6] \times (-\infty, 10]$ descompone $[2,5]$ en el nodo
canónico x=3 (que ya cae dentro del rango junto con su subárbol relevante) y
en la raíz x=4 según corresponda a la partición del BST; en cada nodo
canónico se dispara `dominance-query(6, 10)` sobre su $D_1$ satélite y se unen
los resultados.

## Casos límite

- **$[x_1, x_2]$ no contiene ningún punto**: la descomposición canónica no
  produce nodos, o produce nodos cuyas $D_1$ satélite devuelven vacío — cero
  resultados.
- **$x_1 = x_2$**: se reduce a localizar un único valor de x en el BST; sigue
  usando la $D_1$ satélite de ese nodo (o su equivalente hoja).
- **$b_2$ o $b_3$ en $-\infty$ efectivo (sin acotar)**: cada $D_1$ satélite reporta todo
  su subárbol — el material no discute este límite explícitamente, pero se
  sigue de la definición de dominancia de $D_1$.
