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
        Postorden, de abajo hacia arriba: cada hoja del árbol primario en X
        (A,B,C,D, con Y = 4,9,1,7) guarda un arreglo de un solo elemento —
        su propia Y. Nada que mezclar todavía.
      mode: layers
      arrays:
        - { id: A, label: "A [4]", row: 2, cells: [4] }
        - { id: B, label: "B [9]", row: 2, cells: [9] }
        - { id: C, label: "C [1]", row: 2, cells: [1] }
        - { id: D, label: "D [7]", row: 2, cells: [7] }
    - note: >-
        Cada nodo interno mezcla los arreglos ya listos de sus dos hijos,
        como el merge de Merge Sort: (A,B) = merge([4],[9]) = [4,9];
        (C,D) = merge([1],[7]) = [1,7]. Ningún BST secundario de por
        medio, sólo un arreglo ordenado por nodo.
      mode: layers
      arrays:
        - { id: nAB, label: "(A,B) [4,9]", row: 1, slot: left, cells: [4, 9] }
        - { id: nCD, label: "(C,D) [1,7]", row: 1, slot: right, cells: [1, 7] }
    - note: >-
        En la raíz se mezclan (A,B) y (C,D) una última vez:
        merge([4,9],[1,7]) = [1,4,7,9]. Este arreglo final es el que
        bridge-build usa para tender los puentes hacia cada hijo.
      mode: layers
      arrays:
        - { id: nAB, label: "(A,B) [4,9]", row: 1, slot: left, cells: [4, 9] }
        - { id: nCD, label: "(C,D) [1,7]", row: 1, slot: right, cells: [1, 7] }
        - { id: root, label: "raíz [1,4,7,9]", row: 0, cells: [1, 4, 7, 9] }
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
