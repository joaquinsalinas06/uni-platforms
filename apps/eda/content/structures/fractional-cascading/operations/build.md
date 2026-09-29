---
kind: operation
title: Construcción
order: 1
cppSteps:
  - step-1-node.cpp
  - step-2-augmented-list.cpp
  - step-3-build.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        L3 es la última lista: no se modifica. Todo lo que sigue promueve
        elementos hacia ella, nunca al revés.
      mode: layers
      arrays:
        - { id: L3, label: L3, row: 2, cells: [4, 9, 13, 18, 22] }
    - note: >-
        Antes de tocar nada: éstos son los elementos propios de L2 (3, 5,
        12), sin ningún aporte todavía de L3. L'2 se construye mezclando
        esta lista con la fracción que se promueva de L3.
      mode: layers
      arrays:
        - { id: L3, label: L3, row: 2, cells: [4, 9, 13, 18, 22] }
        - { id: L2raw, label: L2, row: 1, cells: [3, 5, 12] }
    - note: >-
        La fracción que se promueve es la mitad: de cada dos elementos de
        L3, uno pasa hacia arriba (9 y 18, marcados). No hace falta
        promover más — con la mitad alcanza para que la consulta baje sin
        repetir la búsqueda binaria, y promover menos rompería esa
        garantía. Promover todos, en cambio, dispararía el tamaño total a
        Θ(kn) (ver el caso límite al final de esta página).
      mode: layers
      arrays:
        - id: L3
          label: L3
          row: 2
          cells: [4, 9, 13, 18, 22]
          states: [idle, marked, idle, marked, idle]
    - note: >-
        Se construye L'2 = L2 ∪ {mitad de L3}. Los elementos promovidos
        (9 y 18, marcados) guardan un puente: un puntero a su posición
        exacta en L3. El resto de L'2 (3, 5, 12) son propios de L2, sin
        puente.
      mode: layers
      arrays:
        - { id: L3, label: L3, row: 2, cells: [4, 9, 13, 18, 22] }
        - id: Lp2
          label: "L'2"
          row: 1
          cells: [3, 5, 9, 12, 18]
          states: [idle, idle, marked, idle, marked]
      bridges:
        - { from: Lp2, fromIndex: 2, to: L3, toIndex: 1, active: true }
        - { from: Lp2, fromIndex: 4, to: L3, toIndex: 3, active: true }
    - note: >-
        Un nivel más arriba, mismo patrón: éstos son los elementos propios
        de L1 (2, 8, 15), antes de recibir nada de L'2.
      mode: layers
      arrays:
        - { id: L3, label: L3, row: 2, cells: [4, 9, 13, 18, 22] }
        - id: Lp2
          label: "L'2"
          row: 1
          cells: [3, 5, 9, 12, 18]
          states: [idle, idle, marked, idle, marked]
        - { id: L1raw, label: L1, row: 0, cells: [2, 8, 15] }
    - note: >-
        Otra vez se promueve exactamente la mitad, ahora de L'2: 5 y 12
        (marcados) suben hacia L'1. Que L'2 ya tuviera sus propios puentes
        hacia L3 no cambia nada aquí — cada nivel promueve la mitad del
        que tiene justo debajo, sin mirar más allá.
      mode: layers
      arrays:
        - { id: L3, label: L3, row: 2, cells: [4, 9, 13, 18, 22] }
        - id: Lp2
          label: "L'2"
          row: 1
          cells: [3, 5, 9, 12, 18]
          states: [idle, marked, idle, marked, idle]
      bridges:
        - { from: Lp2, fromIndex: 2, to: L3, toIndex: 1, active: false }
        - { from: Lp2, fromIndex: 4, to: L3, toIndex: 3, active: false }
    - note: >-
        Se construye L'1 = L1 ∪ {mitad de L'2}. Los promovidos (5 y 12,
        tomados de L'2) guardan puente hacia su posición en L'2. Nótese que
        L'2 ya tenía sus propios puentes hacia L3: el puente no se
        "reexplica" en cada nivel, sólo baja un paso a la vez. Tamaño
        final: 5 + 5 + 5 = 15 elementos para k = 3 niveles de 5 — lineal,
        no geométrico, precisamente por promover sólo la mitad en cada
        paso.
      mode: layers
      arrays:
        - { id: L3, label: L3, row: 2, cells: [4, 9, 13, 18, 22] }
        - id: Lp2
          label: "L'2"
          row: 1
          cells: [3, 5, 9, 12, 18]
          states: [idle, idle, marked, idle, marked]
        - id: Lp1
          label: "L'1"
          row: 0
          cells: [2, 5, 8, 12, 15]
          states: [idle, marked, idle, marked, idle]
      bridges:
        - { from: Lp2, fromIndex: 2, to: L3, toIndex: 1, active: false }
        - { from: Lp2, fromIndex: 4, to: L3, toIndex: 3, active: false }
        - { from: Lp1, fromIndex: 1, to: Lp2, toIndex: 1, active: true }
        - { from: Lp1, fromIndex: 3, to: Lp2, toIndex: 3, active: true }
---

<!-- Derivado del pseudocódigo del profesor (#16-17); no hay bloque de
     pseudocódigo formal en el mazo, sólo la definición constructiva, que se
     transcribe literal. -->

## Qué hace

Construye, de abajo hacia arriba, la familia de listas aumentadas $L'_1, \ldots,
L'_k$ a partir de las listas originales $L_1, \ldots, L_k$, dejando un puntero
("puente") en cada elemento promovido hacia su posición exacta en la lista
siguiente.

## Intuición

No hace falta copiar la lista completa de un nivel al anterior para poder
"heredar" su posición: basta una fracción. Promover la mitad mantiene el
tamaño acotado (ver el argumento de la serie geométrica en
[theory.md](/structures/fractional-cascading#analisis-de-complejidad)) y aun
así deja suficientes puentes para que la consulta no repita la búsqueda
binaria en cada lista.

## Algoritmo

1. $L'_k \leftarrow L_k$ (la última lista no cambia).
2. Para $i$ de $k-1$ a $1$:
   - $L'_i \leftarrow L_i \cup \{\text{cada elemento par de } L'_{i+1}\}$ (mezclados en orden).
   - Cada elemento tomado de $L'_{i+1}$ guarda un puente: un puntero a su
     posición exacta en $L'_{i+1}$.

## Pseudocódigo

```
Construcción (de abajo hacia arriba)
Sea L'k = Lk. Para i de k−1 a 1:

    L'i = Li ∪ {cada elemento par de L'i+1}.

Cada elemento promovido (tomado de L'i+1) guarda un puente: un puntero
a su posición exacta en L'i+1.
```

## C++

Ver `step-2-augmented-list.cpp`, `step-3-build.cpp` y
`full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

El material no da una cota de tiempo propia para `build` — sólo la cota de
**tamaño** de $L'_1$ (ver más abajo). Fusionar dos listas ordenadas de tamaño
$m$ y $m'$ cuesta $O(m + m')$; sumado sobre los $k$ niveles esto es lineal en
el tamaño total construido.

## Complejidad espacial

$O(n)$ en total para todas las $L'_i$, promoviendo sólo la mitad de cada
lista — argumento de serie geométrica:

$$|L'_i| \le |L_i| + \tfrac{1}{2}|L'_{i+1}|$$

Promover **todos** los elementos en vez de la mitad dispara el tamaño a $\Theta(kn)$, de
vuelta al costo que fractional cascading busca evitar.

## Ejemplo

El único ejemplo numérico del material (#18-19), con `k = 3` listas:

```
L3     4    9    13   18   22        (no cambia)
L'2    3    5    9*   12   18*       (9 y 18 promovidos desde L3)
L'1    2    5*   8    12*  15        (5 y 12 promovidos desde L'2)
```

Los elementos marcados con `*` fueron promovidos desde la lista de abajo y
guardan un puente (línea punteada en el material) a su posición original.

## Casos límite

- **$k = 1$** (una sola lista): no hay nada que promover, $L'_1 = L_1$ y la
  consulta se reduce a una búsqueda binaria simple.
- **Promover todos en vez de la mitad**: caso límite explícito del profesor
  (#25-26) — el tamaño de $L'_1$ se dispararía a $\Theta(kn)$, perdiendo la
  ganancia de espacio que hace viable la técnica.
- **$L'_k = L_k$**: la última lista es un caso base fijo, nunca recibe
  promociones.
