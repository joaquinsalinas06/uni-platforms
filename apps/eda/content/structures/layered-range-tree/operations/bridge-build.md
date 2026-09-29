---
kind: operation
title: Construcción de los puentes durante el merge
order: 2
cppSteps:
  - step-1-arrays.cpp
  - step-2-bridges.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        Antes de mezclar: el arreglo del hijo izquierdo [3, 8] y el del
        hijo derecho [5, 9], ya construidos (postorden). Todavía no existe
        el arreglo del padre ni ningún puente.
      mode: layers
      arrays:
        - { id: L, label: L, row: 1, slot: left, cells: [3, 8] }
        - { id: R, label: R, row: 1, slot: right, cells: [5, 9] }
    - note: >-
        Merge: el frente izquierdo (3) es menor que el derecho (5), así que
        3 entra en la posición 0 del padre. Ese elemento vino de L0 — su
        puente hacia el hijo izquierdo es "gratis": es la misma posición
        que el propio merge acaba de leer.
      mode: layers
      arrays:
        - { id: L, label: L, row: 1, slot: left, cells: [3, 8] }
        - { id: R, label: R, row: 1, slot: right, cells: [5, 9] }
        - { id: P, label: P, row: 0, cells: [3] }
      bridges:
        - { from: P, fromIndex: 0, to: L, toIndex: 0, active: true }
    - note: >-
        Ahora el frente izquierdo es 8 y el derecho 5: 5 es menor y entra
        en la posición 1 del padre, con puente hacia R0.
      mode: layers
      arrays:
        - { id: L, label: L, row: 1, slot: left, cells: [3, 8] }
        - { id: R, label: R, row: 1, slot: right, cells: [5, 9] }
        - { id: P, label: P, row: 0, cells: [3, 5] }
      bridges:
        - { from: P, fromIndex: 0, to: L, toIndex: 0, active: false }
        - { from: P, fromIndex: 1, to: R, toIndex: 0, active: true }
    - note: >-
        Frente izquierdo 8, derecho 9: 8 entra en la posición 2 del padre,
        con puente hacia L1.
      mode: layers
      arrays:
        - { id: L, label: L, row: 1, slot: left, cells: [3, 8] }
        - { id: R, label: R, row: 1, slot: right, cells: [5, 9] }
        - { id: P, label: P, row: 0, cells: [3, 5, 8] }
      bridges:
        - { from: P, fromIndex: 0, to: L, toIndex: 0, active: false }
        - { from: P, fromIndex: 1, to: R, toIndex: 0, active: false }
        - { from: P, fromIndex: 2, to: L, toIndex: 1, active: true }
    - note: >-
        El hijo izquierdo se agotó: el único elemento que queda, 9, entra
        en la posición 3 del padre, con puente hacia R1. El arreglo
        mezclado del padre queda [3, 5, 8, 9].
      mode: layers
      arrays:
        - { id: L, label: L, row: 1, slot: left, cells: [3, 8] }
        - { id: R, label: R, row: 1, slot: right, cells: [5, 9] }
        - { id: P, label: P, row: 0, cells: [3, 5, 8, 9] }
      bridges:
        - { from: P, fromIndex: 0, to: L, toIndex: 0, active: false }
        - { from: P, fromIndex: 1, to: R, toIndex: 0, active: false }
        - { from: P, fromIndex: 2, to: L, toIndex: 1, active: false }
        - { from: P, fromIndex: 3, to: R, toIndex: 1, active: true }
    - note: >-
        Los dos detalles que casi siempre se rompen en la implementación:
        (1) pIzq y pDer sólo avanzan, nunca retroceden — es la misma
        invariante que hace a Merge Sort O(n) y no O(n lg n); calcular cada
        puente con una búsqueda binaria independiente sería correcto pero
        más lento, no lo que el merge ya regala gratis; (2) al terminar se
        guarda un centinela — puenteIzq[4] = 2 y puenteDer[4] = 2, una
        posición extra que apunta al final de cada hijo — para que
        preguntar por una posición del padre que cae después del último
        elemento nunca lea fuera de rango.
      mode: layers
      arrays:
        - { id: L, label: L, row: 1, slot: left, cells: [3, 8] }
        - { id: R, label: R, row: 1, slot: right, cells: [5, 9] }
        - { id: P, label: P, row: 0, cells: [3, 5, 8, 9] }
      bridges:
        - { from: P, fromIndex: 0, to: L, toIndex: 0, active: false }
        - { from: P, fromIndex: 1, to: R, toIndex: 0, active: false }
        - { from: P, fromIndex: 2, to: L, toIndex: 1, active: false }
        - { from: P, fromIndex: 3, to: R, toIndex: 1, active: false }
      caption: "puenteIzq = [0,1,1,2,2]  puenteDer = [0,0,1,1,2]  (última posición = centinela)"
---

## Qué hace

Mientras se mezclan los arreglos de los dos hijos para formar el del padre
(ver [Reemplazo del BST secundario por un arreglo ordenado](/structures/layered-range-tree/operations/sorted-array-replacement)),
calcula para cada posición del arreglo del padre un **puente** hacia su
posición equivalente en el arreglo de cada hijo — sin ningún trabajo extra
más allá del propio merge.

## Intuición

"Cada elemento del arreglo del padre sabe, en $O(1)$, en qué posición cae
dentro del arreglo de cada uno de sus dos hijos — son exactamente los
índices pL y pR que ya usa el propio proceso de Merge para decidir de dónde
tomó cada elemento." El merge, para decidir qué elemento copiar a
continuación, ya mantiene dos punteros (uno por arreglo hijo) que sólo
avanzan hacia adelante. Anotar, en cada posición del padre, el valor que
esos dos punteros tenían **en ese instante** es el puente completo: no hace
falta buscarlo después con una búsqueda binaria, ya se sabía durante la
construcción.

A diferencia del caso general de fractional cascading — donde sólo se
promueve la mitad de cada lista para no disparar el tamaño —, aquí "cada
elemento del padre viene de un hijo, así que todos llevan puente: es incluso
más simple que el caso general" (#31), precisamente porque el arreglo del
padre **es** la unión completa de los de sus dos hijos (#28).

## Algoritmo

Se recorre el arreglo ya mezclado del padre de izquierda a derecha con dos
punteros adicionales, `pIzq` y `pDer`, inicializados en 0. Para cada
posición `i` del padre:

1. Mientras `arregloIzq[pIzq] < arregloPadre[i]`, avanzar `pIzq`.
2. Mientras `arregloDer[pDer] < arregloPadre[i]`, avanzar `pDer`.
3. Guardar `puenteIzq[i] = pIzq` y `puenteDer[i] = pDer`.

> **Nota de apoyo** (no está en las diapositivas, pero es donde más se
> equivoca la implementación): los punteros `pIzq`/`pDer` **nunca
> retroceden** porque tanto el arreglo del padre como los de los hijos están
> ordenados — es la misma razón por la que el propio merge cuesta $O(n)$ y no
> $O(n \lg n)$. Calcular cada puente con una búsqueda binaria independiente
> (`lower_bound` por elemento) sería correcto pero **no** es lo que hace
> gratis el merge: perdería el tiempo lineal y volvería a meter un factor
> $\lg n$. Al terminar, se guarda además un **centinela**: una posición extra
> `puenteIzq[tamaño] = tamaño(hijoIzq)` (y análogo para el derecho), para
> que una búsqueda que cae después del último elemento tenga a dónde
> apuntar sin leer fuera de rango.

## Pseudocódigo

```
construir_puentes(padre, hijoIzq, hijoDer):
    pIzq = 0
    pDer = 0
    para i desde 0 hasta tamaño(padre) - 1:
        mientras pIzq < tamaño(hijoIzq) y arregloIzq[pIzq] < arregloPadre[i]:
            pIzq = pIzq + 1
        mientras pDer < tamaño(hijoDer) y arregloDer[pDer] < arregloPadre[i]:
            pDer = pDer + 1
        puenteIzq[i] = pIzq
        puenteDer[i] = pDer
    puenteIzq[tamaño(padre)] = tamaño(hijoIzq)   # centinela
    puenteDer[tamaño(padre)] = tamaño(hijoDer)   # centinela
```

## C++

Ver `step-2-bridges.cpp` (construcción de `puenteIzq`/`puenteDer` con dos
punteros, sobre el resultado de `step-1-arrays.cpp`) y
`full-implementation.cpp`.

## Complejidad temporal

Ver `bridge-build` en la tabla de complejidad: $O(n \lg n)$ agregado sobre
todo el árbol. Los dos punteros avanzan a lo más `tamaño del hijo` pasos
cada uno por nodo, el mismo costo que el merge que ya se estaba haciendo —
no agregan ningún factor extra.

## Complejidad espacial

Dos enteros de puente por posición del arreglo (uno por hijo), más el
centinela: el mismo orden $O(n \lg n)$ total que los arreglos mismos. El
profesor lo redondea a "un puntero por elemento" (#40), aunque en realidad
son dos — uno hacia cada hijo, como muestra el propio ejemplo de #32-33.

## Ejemplo

El único ejemplo numérico del material (#32-33): padre `[3, 5, 8, 9]`, hijo
izquierdo `[3, 8]`, hijo derecho `[5, 9]`. Trazado paso a paso en el bloque
de visualización de arriba: cada posición del padre queda con un puente
hacia la posición donde ese mismo valor cayó en el arreglo del hijo del que
vino.

## Casos límite

- **Hijo vacío o de un solo elemento**: los punteros de ese lado nunca
  avanzan más allá de su tamaño; el centinela cubre el caso "el valor no
  tiene equivalente en este hijo" sin condicionales especiales.
- **Valores repetidos entre ambos hijos**: el puente apunta a la primera
  posición que cumple la condición (`< arregloPadre[i]`, no `<=`), igual que
  un `lower_bound`; ambas copias del valor repetido reciben su propio puente
  correcto porque cada una se procesa en su propia iteración `i`.
- **Todo el arreglo del padre viene de un solo hijo** (el otro está vacío):
  los puentes hacia el hijo vacío son todos el centinela (posición 0).
