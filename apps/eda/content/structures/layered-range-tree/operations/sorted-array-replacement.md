---
kind: operation
title: Reemplazo del BST secundario por un arreglo ordenado
order: 1
cppSteps:
  - step-1-arrays.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        Paso 1 (Hojas base en X, con su coordenada Y): Tenemos 4 puntos en el plano 2D:
        A=(1,4), B=(2,9), C=(3,1) y D=(4,7). El árbol primario divide el eje X
        (hojas ordenadas por X: 1, 2, 3, 4). Cada hoja guarda un arreglo de tamaño 1
        con la coordenada Y de su punto: A guarda Y=[4], B guarda Y=[9], C guarda Y=[1],
        D guarda Y=[7].
      mode: layers
      caption: "Hojas en X: A=(1,4) [Y=4] | B=(2,9) [Y=9] | C=(3,1) [Y=1] | D=(4,7) [Y=7]"
      bridges: []
      arrays:
        - { id: A, label: "A(1,4) [Y=4]", row: 2, slot: left, cells: [4], states: [idle] }
        - { id: B, label: "B(2,9) [Y=9]", row: 2, slot: left, cells: [9], states: [idle] }
        - { id: C, label: "C(3,1) [Y=1]", row: 2, slot: right, cells: [1], states: [idle] }
        - { id: D, label: "D(4,7) [Y=7]", row: 2, slot: right, cells: [7], states: [idle] }
    - note: >-
        Paso 2 (Nivel intermedio: mezcla de coordenadas Y): Cada nodo interno en X
        cubre un subrango horizontal y junta las Y de sus puntos mezclando los arreglos
        de sus hijos: (A,B) para X∈[1,2] mezcla [4] y [9] para formar [4,9]; (C,D) para
        X∈[3,4] mezcla [1] y [7] para formar [1,7]. Las hojas permanecen visibles en la base.
      mode: layers
      caption: "Nivel 1: (A,B) X∈[1,2] -> Y=[4,9]  |  (C,D) X∈[3,4] -> Y=[1,7]"
      bridges: []
      arrays:
        - { id: nAB, label: "(A,B) X∈[1,2] [Y: 4,9]", row: 1, slot: left, cells: [4, 9], states: [active, active] }
        - { id: nCD, label: "(C,D) X∈[3,4] [Y: 1,7]", row: 1, slot: right, cells: [1, 7], states: [active, active] }
        - { id: A, label: "A(1,4) [Y=4]", row: 2, slot: left, cells: [4], states: [muted] }
        - { id: B, label: "B(2,9) [Y=9]", row: 2, slot: left, cells: [9], states: [muted] }
        - { id: C, label: "C(3,1) [Y=1]", row: 2, slot: right, cells: [1], states: [muted] }
        - { id: D, label: "D(4,7) [Y=7]", row: 2, slot: right, cells: [7], states: [muted] }
    - note: >-
        Paso 3 (Raíz: todas las coordenadas Y mezcladas): En la raíz, que cubre todo el
        eje horizontal X∈[1,4], se mezclan los arreglos de sus dos hijos: merge([4,9], [1,7]) =
        [1,4,7,9]. Este arreglo contiene las Y de TODOS los puntos ordenadas ascendentemente.
      mode: layers
      caption: "Nivel 0 (raíz): X∈[1,4] -> Y=[1,4,7,9] (unión ordenada de todas las Y)"
      bridges: []
      arrays:
        - { id: root, label: "raíz X∈[1,4] [Y: 1,4,7,9]", row: 0, cells: [1, 4, 7, 9], states: [active, active, active, active] }
        - { id: nAB, label: "(A,B) X∈[1,2] [Y: 4,9]", row: 1, slot: left, cells: [4, 9], states: [idle, idle] }
        - { id: nCD, label: "(C,D) X∈[3,4] [Y: 1,7]", row: 1, slot: right, cells: [1, 7], states: [idle, idle] }
        - { id: A, label: "A(1,4) [Y=4]", row: 2, slot: left, cells: [4], states: [muted] }
        - { id: B, label: "B(2,9) [Y=9]", row: 2, slot: left, cells: [9], states: [muted] }
        - { id: C, label: "C(3,1) [Y=1]", row: 2, slot: right, cells: [1], states: [muted] }
        - { id: D, label: "D(4,7) [Y=7]", row: 2, slot: right, cells: [7], states: [muted] }
    - note: >-
        Paso 4 (Estructura 2D completa con arreglos): El árbol primario en X ya tiene en
        cada nodo su arreglo ordenado de coordenadas Y. Hemos sustituido los costosos BSTs
        secundarios por arreglos contiguos. En la siguiente operación (bridge-build), tenderemos
        los puentes hacia hijo izquierdo y derecho para permitir búsquedas en Y en O(1).
      mode: layers
      caption: "Árbol 2D listo: primario divide en X, cada nodo almacena sus coordenadas Y ordenadas"
      bridges: []
      arrays:
        - { id: root, label: "raíz X∈[1,4] [Y: 1,4,7,9]", row: 0, cells: [1, 4, 7, 9], states: [answer, answer, answer, answer] }
        - { id: nAB, label: "(A,B) X∈[1,2] [Y: 4,9]", row: 1, slot: left, cells: [4, 9], states: [idle, idle] }
        - { id: nCD, label: "(C,D) X∈[3,4] [Y: 1,7]", row: 1, slot: right, cells: [1, 7], states: [idle, idle] }
        - { id: A, label: "A(1,4) [Y=4]", row: 2, slot: left, cells: [4], states: [idle] }
        - { id: B, label: "B(2,9) [Y=9]", row: 2, slot: left, cells: [9], states: [idle] }
        - { id: C, label: "C(3,1) [Y=1]", row: 2, slot: right, cells: [1], states: [idle] }
        - { id: D, label: "D(4,7) [Y=7]", row: 2, slot: right, cells: [7], states: [idle] }
---

## Qué hace

Sustituye, en cada nodo del árbol primario (en X) de un
[range tree](/structures/range-tree) 2D, el árbol secundario balanceado que
guardaba las Y del subárbol por un **arreglo ordenado** con esas mismas Y.

## Intuición

El profesor lo resume así: "Guardamos, en cada nodo, un arreglo con los y de
su subárbol (no un árbol) — y lo construimos mezclando los arreglos de sus
dos hijos, como en Merge Sort." Un árbol secundario sólo hacía falta para
poder insertar y buscar de forma dinámica; como el range tree ya es
estático, no hay ninguna razón para pagar el costo de un BST cuando un
arreglo ordenado responde exactamente las mismas búsquedas por rango y,
además, es la estructura que fractional cascading necesita para tender
puentes entre niveles.

## Algoritmo

De abajo hacia arriba (postorden): una hoja guarda un arreglo de un solo
elemento (su propia Y). Un nodo interno mezcla los arreglos ya construidos
de sus dos hijos con el mismo procedimiento de **Merge Sort** (dos punteros
que avanzan sobre cada arreglo hijo tomando en cada paso el menor de los dos
frentes). El resultado es el arreglo ordenado de todo el subárbol.

## Pseudocódigo

El material no trae pseudocódigo para esta operación (es prosa, #29); se
deriva directo del merge de Merge Sort:

```
construir_arreglo(nodo):
    si nodo es hoja:
        arreglo[nodo] = [Y(nodo)]
        retornar
    construir_arreglo(hijoIzq(nodo))
    construir_arreglo(hijoDer(nodo))
    arreglo[nodo] = mezclar(arreglo[hijoIzq(nodo)], arreglo[hijoDer(nodo)])
```

## C++

Ver `step-1-arrays.cpp` (nodo del árbol primario con su arreglo ordenado,
construido con `std::merge`) y `full-implementation.cpp`.

## Complejidad temporal

Ver `sorted-array-replacement` en la tabla de complejidad: $O(n \lg n)$,
mismo argumento de multiplicidad que `build-2d` de range-tree — cada punto
vive en $O(\lg n)$ niveles y cada nivel se llena con un merge de costo
$O(\text{tamaño del nivel})$.

## Complejidad espacial

$O(n \lg n)$: el profesor lo afirma igual al del range tree 2D ingenuo
(#37-40) — sustituir el árbol por un arreglo no cambia cuántas veces vive
cada punto, sólo la estructura que lo guarda en cada nivel.

## Ejemplo

Ver [Ejemplos](/structures/layered-range-tree/examples).

## Casos límite

- **Hoja**: el arreglo es de un solo elemento; no hay merge que hacer.
- **Y repetidas entre hijo izquierdo y derecho**: `std::merge` las conserva
  ambas (es estable y no elimina duplicados), igual que el árbol secundario
  original las hubiera guardado como entradas distintas.
- **Un solo hijo con todos los elementos** (árbol primario muy desbalanceado
  en X): el merge sigue siendo correcto, sólo que el "otro lado" del merge
  está vacío y el arreglo del padre es una copia del de ese hijo.
