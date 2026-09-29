---
kind: operation
title: Composition
order: 3
cppSteps:
  - step-3-path-cascade-query.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        El camino que la consulta recorre en el grafo D₄-like:
        v0 (raíz, entrada) → v2 (hijo) → v0 (raíz, revisitada) → v3 (gemela
        invertida). Cada fila es la lista propia de ese vértice en ese paso
        del camino — cuatro catálogos, no dos. Buscamos x = 22. Nada se ha
        tocado todavía.
      mode: layers
      arrays:
        - { id: v3, label: "v3 — gemela invertida", row: 3, cells: [1, 6, 14, 21, 33] }
        - id: v0b
          label: "v0 — raíz (revisitada)"
          row: 2
          cells: [2, 8, 15, 23, 31]
        - { id: v2, label: "v2 — hijo", row: 1, cells: [4, 9, 13, 18, 22] }
        - id: v0a
          label: "v0 — raíz (entrada)"
          row: 0
          cells: [2, 8, 15, 23, 31]
      caption: "buscar x = 22 sobre el camino [v0, v2, v0, v3]"
    - note: >-
        Única búsqueda binaria real de toda la consulta, en el vértice de
        entrada v0: cae en la posición del 23 (índice 3), la primera
        posición ≥ 22. Cuesta O(lg n) y no se repite en ningún otro vértice
        del camino.
      mode: layers
      arrays:
        - { id: v3, label: "v3 — gemela invertida", row: 3, cells: [1, 6, 14, 21, 33] }
        - id: v0b
          label: "v0 — raíz (revisitada)"
          row: 2
          cells: [2, 8, 15, 23, 31]
        - { id: v2, label: "v2 — hijo", row: 1, cells: [4, 9, 13, 18, 22] }
        - id: v0a
          label: "v0 — raíz (entrada)"
          row: 0
          cells: [2, 8, 15, 23, 31]
          states: [idle, idle, idle, active, idle]
      caption: "búsqueda real en v0 — O(lg n)"
    - note: >-
        Primer paso del camino, v0 → v2: se baja el puente que la búsqueda
        en v0 dejó apuntando (índice 3) en vez de rebuscar, y ajusta en O(1)
        a la posición del 22 en v2 — que es exactamente x. Encontrado.
      mode: layers
      arrays:
        - { id: v3, label: "v3 — gemela invertida", row: 3, cells: [1, 6, 14, 21, 33] }
        - id: v0b
          label: "v0 — raíz (revisitada)"
          row: 2
          cells: [2, 8, 15, 23, 31]
        - id: v2
          label: "v2 — hijo"
          row: 1
          cells: [4, 9, 13, 18, 22]
          states: [idle, idle, idle, idle, answer]
        - id: v0a
          label: "v0 — raíz (entrada)"
          row: 0
          cells: [2, 8, 15, 23, 31]
          states: [idle, idle, idle, active, idle]
      bridges:
        - { from: v0a, fromIndex: 3, to: v2, toIndex: 4, active: true }
      caption: "v0 → v2 — O(1), 22 encontrado en el hijo"
    - note: >-
        Segundo paso, v2 → v0 (revisitada): el camino vuelve al mismo
        vértice de entrada, pero su lista ya se contó como "compartida" — no
        se rebusca, sólo se ajusta el puente en O(1) hasta la posición del
        23 (índice 3), igual que en la primera visita.
      mode: layers
      arrays:
        - { id: v3, label: "v3 — gemela invertida", row: 3, cells: [1, 6, 14, 21, 33] }
        - id: v0b
          label: "v0 — raíz (revisitada)"
          row: 2
          cells: [2, 8, 15, 23, 31]
          states: [shared, shared, shared, active, shared]
        - id: v2
          label: "v2 — hijo"
          row: 1
          cells: [4, 9, 13, 18, 22]
          states: [idle, idle, idle, idle, answer]
        - id: v0a
          label: "v0 — raíz (entrada)"
          row: 0
          cells: [2, 8, 15, 23, 31]
          states: [idle, idle, idle, active, idle]
      bridges:
        - { from: v0a, fromIndex: 3, to: v2, toIndex: 4, active: false }
        - { from: v2, fromIndex: 4, to: v0b, toIndex: 3, active: true }
      caption: "v2 → v0 (revisitada) — O(1), la misma lista de antes"
    - note: >-
        Tercer y último paso, v0 → v3 (gemela invertida): el salto entre
        estructura normal e invertida cuesta lo mismo que cualquier otro,
        O(1) — aterriza en la posición del 33 (índice 4). Camino completo.
      mode: layers
      arrays:
        - id: v3
          label: "v3 — gemela invertida"
          row: 3
          cells: [1, 6, 14, 21, 33]
          states: [idle, idle, idle, idle, active]
        - id: v0b
          label: "v0 — raíz (revisitada)"
          row: 2
          cells: [2, 8, 15, 23, 31]
          states: [shared, shared, shared, active, shared]
        - id: v2
          label: "v2 — hijo"
          row: 1
          cells: [4, 9, 13, 18, 22]
          states: [idle, idle, idle, idle, answer]
        - id: v0a
          label: "v0 — raíz (entrada)"
          row: 0
          cells: [2, 8, 15, 23, 31]
          states: [idle, idle, idle, active, idle]
      bridges:
        - { from: v0a, fromIndex: 3, to: v2, toIndex: 4, active: false }
        - { from: v2, fromIndex: 4, to: v0b, toIndex: 3, active: false }
        - { from: v0b, fromIndex: 3, to: v3, toIndex: 4, active: true }
      caption: "v0 → v3 (gemela invertida) — O(1), aun cruzando de estructura"
    - note: >-
        Costo total del camino de 4 vértices: una búsqueda real (O(lg n)) más
        tres pasos de descenso a O(1) cada uno, más el reporte —
        O(lg n) + O(1)·O(lg n) + O(k) = O(lg n + k), con k = 3. El mismo
        camino recorrido con búsqueda binaria independiente en cada vértice
        habría costado 4 búsquedas completas en vez de 1.
      mode: layers
      arrays:
        - id: v3
          label: "v3 — gemela invertida"
          row: 3
          cells: [1, 6, 14, 21, 33]
          states: [idle, idle, idle, idle, answer]
        - id: v0b
          label: "v0 — raíz (revisitada)"
          row: 2
          cells: [2, 8, 15, 23, 31]
          states: [shared, shared, shared, answer, shared]
        - id: v2
          label: "v2 — hijo"
          row: 1
          cells: [4, 9, 13, 18, 22]
          states: [idle, idle, idle, idle, answer]
        - id: v0a
          label: "v0 — raíz (entrada)"
          row: 0
          cells: [2, 8, 15, 23, 31]
          states: [idle, idle, idle, answer, idle]
      bridges:
        - { from: v0a, fromIndex: 3, to: v2, toIndex: 4, active: true }
        - { from: v2, fromIndex: 4, to: v0b, toIndex: 3, active: true }
        - { from: v0b, fromIndex: 3, to: v3, toIndex: 4, active: true }
      caption: "O(lg n) + O(1)·O(lg n) + O(k) = O(lg n + k)"
---

## Qué hace

Junta [Applicability](/structures/generalized-fractional-cascading/operations/applicability)
y [Bounded-degree-check](/structures/generalized-fractional-cascading/operations/bounded-degree-check)
en el resultado final: con el grafo de cascading generalizado conectando
[D₄ sobre D₃ sobre D₂ sobre D₁](/structures/d4-bound-z), una sola búsqueda
binaria real al entrar por $x$ alcanza para navegar **todos** los niveles.

## Intuición

Una vez que se sabe que el grafo cumple grado acotado (D₄/D₃ lo cumple con
grado ≤ 5), la navegación completa es exactamente la misma idea de
[fractional cascading](/structures/fractional-cascading) sobre una cadena,
aplicada arista por arista del camino que la consulta recorre en el grafo:
una única búsqueda real donde se entra, y de ahí en adelante, cada paso —
incluyendo los saltos entre estructura normal y su gemela invertida — es
O(1) porque el puente ya deja la posición a ajustar, no a rebuscar.

## Algoritmo

1. Fijar el camino del grafo que la consulta 3D necesita recorrer (por
   ejemplo, entrar por D₄, bajar a D₃, seguir el enlace a la estructura
   invertida si hace falta).
2. Hacer **una única** búsqueda binaria real en el vértice de entrada:
   $O(\lg n)$.
3. Para cada paso siguiente del camino ($O(k)$ pasos en total), bajar el
   puente correspondiente y ajustar en $O(1)$ — el mismo mecanismo de
   [fractional cascading#query](/structures/fractional-cascading/operations/query),
   aplicado a la arista concreta que toca en ese paso del grafo.
4. El costo total es la suma de estos pasos: $O(\lg n)$ (la búsqueda real) +
   $O(1) \cdot O(\lg n)$ (los pasos de descenso) + $O(k)$ (reportar) =
   $O(\lg n + k)$.

## Pseudocódigo

```
Con el grafo de cascading generalizado conectando D4 sobre D3 sobre D2
sobre D1, una sola busqueda binaria real al entrar por x alcanza para
todos los niveles: cada paso hacia abajo (incluyendo los saltos entre
estructura normal e invertida) es O(1).

O(lg n)              + O(1) . O(lg n) + O(k) = O(lg n + k)
`- una busqueda real   `- pasos de descenso    `- reporte
```

## C++

Ver `step-3-path-cascade-query.cpp` y `full-implementation.cpp` en el
editor de arriba. `full-implementation.cpp` contrasta esta consulta
—recorriendo un camino de 4 vértices del grafo D₄-like, incluyendo un salto
a la gemela invertida— contra búsqueda binaria independiente en cada
vértice del camino, contando comparaciones de ambas.

## Complejidad temporal

$O(\lg n + k)$, donde $k$ es el número de pasos del camino recorrido. Textual
(#54): $O(\lg n) + O(1) \cdot O(\lg n) + O(k) = O(\lg n + k)$. Es el mismo argumento
de conteo directo de
[fractional cascading#query](/structures/fractional-cascading/operations/query#complejidad-temporal),
aplicado a un camino de un grafo en vez de a una cadena fija: el grado
acotado es lo que garantiza que cada paso siga costando $O(1)$, sin importar
cuál arista se recorra.

## Complejidad espacial

$O(n \lg^3 n)$ para la consulta 3D completa (#57): "cada punto aparece, en
promedio, $O(\lg^3 n)$ veces entre las distintas copias de $D_1$, $D_2$ y $D_3$
anidadas dentro de $D_4$" — un argumento de multiplicidad, no de conteo de
pasos, igual que el $O(n \lg n)$ del range tree 2D de la semana 4.

## Ejemplo

`full-implementation.cpp` recorre el camino `[raíz, hijo, raíz, gemela
invertida]` sobre el grafo D₄-like de 5 vértices y muestra, comparación por
comparación, que el cascading a lo largo del camino usa menos comparaciones
en total que buscar independientemente en cada uno de los 4 vértices del
camino — el mismo patrón de ahorro de
[fractional cascading](/structures/fractional-cascading), ahora sobre un
grafo.

## Casos límite

- **Camino de un solo vértice ($k = 1$)**: la navegación se reduce a la
  única búsqueda binaria real, sin ningún paso de descenso — $O(\lg n)$,
  coherente con la fórmula general.
- **El camino repite un vértice** (por ejemplo, entra y vuelve a la raíz
  antes de saltar a la gemela invertida, como en el ejemplo de C++): no
  rompe nada — cada paso del camino sigue costando $O(1)$ porque depende de
  la arista que se recorre, no de si el vértice ya se visitó antes.
- **d dimensiones (generalización, #64-66)**: para $d \ge 3$, el cascading
  completo (Chazelle & Guibas 1986) da $O(\lg^{d-2} n + k)$ con espacio
  $O(n \lg^{d-1} n)$; la alternativa de cascading sólo en el nivel más
  interno (Willard 1985; Gabow, Bentley & Tarjan 1984) da $O(\lg^{d-1} n + k)$
  con el mismo espacio. Para $d = 3$ (este caso): $\lg^{d-2} n = \lg n$ contra
  $\lg^{d-1} n = \lg^2 n$ — la diferencia exacta que separa $D_1$-$D_4$ completo de
  la versión más simple.
