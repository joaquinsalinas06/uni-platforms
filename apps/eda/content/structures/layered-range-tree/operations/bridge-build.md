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
        Punto de partida: los arreglos de los dos hijos ya están listos (postorden):
        L = [3, 8] en el carril izquierdo y R = [5, 9] en el carril derecho.
        Iniciamos el merge con dos punteros: pL = 0 (apunta a 3) y pR = 0 (apunta a 5).
        ¿Por qué puentes hacia 2 lados? Porque durante una consulta 2D, si el
        recorrido en X baja a L usará puenteIzq; si baja a R usará puenteDer.
        Ambos se calculan durante el mismo merge.
      mode: layers
      caption: "Inicio: pL = 0 (valor 3) | pR = 0 (valor 5) — P vacío"
      bridges: []
      arrays:
        - { id: L, label: "L [3, 8]", row: 1, slot: left, cells: [3, 8], states: [active, idle] }
        - { id: R, label: "R [5, 9]", row: 1, slot: right, cells: [5, 9], states: [active, idle] }
    - note: >-
        Paso 1 del merge: L[0]=3 < R[0]=5. El menor es 3, que entra en P[0].
        Sus DOS puentes se anotan de inmediato: (1) puenteIzq[0] = pL (0) hacia L[0]=3
        (de donde vino); (2) puenteDer[0] = pR (0) hacia R[0]=5 (el primer elemento
        >= 3 en R). Avanza pL a 1.
      mode: layers
      caption: "P[0]=3 -> puenteIzq[0]=0 (L[0]=3), puenteDer[0]=0 (R[0]=5) | pL avanza a 1"
      arrays:
        - { id: P, label: "P", row: 0, cells: [3], states: [active] }
        - { id: L, label: "L [3, 8]", row: 1, slot: left, cells: [3, 8], states: [answer, idle] }
        - { id: R, label: "R [5, 9]", row: 1, slot: right, cells: [5, 9], states: [answer, idle] }
      bridges:
        - { from: P, fromIndex: 0, to: L, toIndex: 0, active: true, label: "izq" }
        - { from: P, fromIndex: 0, to: R, toIndex: 0, active: true, label: "der" }
    - note: >-
        Paso 2 del merge: ahora el frente es L[1]=8 y R[0]=5. El menor es 5, que entra
        en P[1]. Sus DOS puentes: (1) puenteDer[1] = pR (0) hacia R[0]=5 (de donde vino);
        (2) puenteIzq[1] = pL (1) hacia L[1]=8 (el primer elemento >= 5 en L).
        Avanza pR a 1.
      mode: layers
      caption: "P[1]=5 -> puenteIzq[1]=1 (L[1]=8), puenteDer[1]=0 (R[0]=5) | pR avanza a 1"
      arrays:
        - { id: P, label: "P", row: 0, cells: [3, 5], states: [idle, active] }
        - { id: L, label: "L [3, 8]", row: 1, slot: left, cells: [3, 8], states: [idle, answer] }
        - { id: R, label: "R [5, 9]", row: 1, slot: right, cells: [5, 9], states: [answer, idle] }
      bridges:
        - { from: P, fromIndex: 0, to: L, toIndex: 0, active: false }
        - { from: P, fromIndex: 0, to: R, toIndex: 0, active: false }
        - { from: P, fromIndex: 1, to: L, toIndex: 1, active: true, label: "izq" }
        - { from: P, fromIndex: 1, to: R, toIndex: 0, active: true, label: "der" }
    - note: >-
        Paso 3 del merge: comparamos L[1]=8 y R[1]=9. El menor es 8, que entra en P[2].
        Sus DOS puentes: (1) puenteIzq[2] = pL (1) hacia L[1]=8 (de donde vino);
        (2) puenteDer[2] = pR (1) hacia R[1]=9 (primer elemento >= 8 en R).
        L queda completamente agotado (pL avanza a 2).
      mode: layers
      caption: "P[2]=8 -> puenteIzq[2]=1 (L[1]=8), puenteDer[2]=1 (R[1]=9) | L agotado"
      arrays:
        - { id: P, label: "P", row: 0, cells: [3, 5, 8], states: [idle, idle, active] }
        - { id: L, label: "L [3, 8]", row: 1, slot: left, cells: [3, 8], states: [idle, answer] }
        - { id: R, label: "R [5, 9]", row: 1, slot: right, cells: [5, 9], states: [idle, answer] }
      bridges:
        - { from: P, fromIndex: 0, to: L, toIndex: 0, active: false }
        - { from: P, fromIndex: 0, to: R, toIndex: 0, active: false }
        - { from: P, fromIndex: 1, to: L, toIndex: 1, active: false }
        - { from: P, fromIndex: 1, to: R, toIndex: 0, active: false }
        - { from: P, fromIndex: 2, to: L, toIndex: 1, active: true, label: "izq" }
        - { from: P, fromIndex: 2, to: R, toIndex: 1, active: true, label: "der" }
    - note: >-
        Paso 4 del merge: L está agotado; sólo queda 9 en R[1], que entra en P[3].
        Sus DOS puentes: (1) puenteDer[3] = pR (1) hacia R[1]=9; (2) en L ya no quedan
        elementos >= 9, así que puenteIzq[3] = 2 apunta al centinela 'fin' de L.
        R queda agotado (pR avanza a 2).
      mode: layers
      caption: "P[3]=9 -> puenteIzq[3]=2 (fin en L), puenteDer[3]=1 (R[1]=9) | R agotado"
      arrays:
        - { id: P, label: "P [3, 5, 8, 9]", row: 0, cells: [3, 5, 8, 9], states: [idle, idle, idle, active] }
        - { id: L, label: "L [3, 8]", row: 1, slot: left, cells: [3, 8], states: [idle, idle] }
        - { id: R, label: "R [5, 9]", row: 1, slot: right, cells: [5, 9], states: [idle, answer] }
      bridges:
        - { from: P, fromIndex: 0, to: L, toIndex: 0, active: false }
        - { from: P, fromIndex: 0, to: R, toIndex: 0, active: false }
        - { from: P, fromIndex: 1, to: L, toIndex: 1, active: false }
        - { from: P, fromIndex: 1, to: R, toIndex: 0, active: false }
        - { from: P, fromIndex: 2, to: L, toIndex: 1, active: false }
        - { from: P, fromIndex: 2, to: R, toIndex: 1, active: false }
        - { from: P, fromIndex: 3, to: L, toIndex: 2, active: true, label: "izq" }
        - { from: P, fromIndex: 3, to: R, toIndex: 1, active: true, label: "der" }
    - note: >-
        Centinelas y resultado final: Al final de P se añade una posición centinela
        (índice 4 = fin) con puenteIzq[4] = 2 y puenteDer[4] = 2, para que cualquier
        búsqueda que caiga después del último elemento tenga a dónde apuntar sin leer
        fuera de rango. Los punteros pL y pR sólo avanzaron hacia adelante: los puentes
        a ambos hijos se construyeron en O(|L| + |R|), exactamente el mismo costo del merge.
      mode: layers
      caption: "puenteIzq = [0,1,1,2,2]  |  puenteDer = [0,0,1,1,2]  (índice 4 = centinela fin)"
      arrays:
        - { id: P, label: "P [3, 5, 8, 9]", row: 0, cells: [3, 5, 8, 9] }
        - { id: L, label: "L [3, 8]", row: 1, slot: left, cells: [3, 8] }
        - { id: R, label: "R [5, 9]", row: 1, slot: right, cells: [5, 9] }
      bridges:
        - { from: P, fromIndex: 0, to: L, toIndex: 0, active: false }
        - { from: P, fromIndex: 0, to: R, toIndex: 0, active: false }
        - { from: P, fromIndex: 1, to: L, toIndex: 1, active: false }
        - { from: P, fromIndex: 1, to: R, toIndex: 0, active: false }
        - { from: P, fromIndex: 2, to: L, toIndex: 1, active: false }
        - { from: P, fromIndex: 2, to: R, toIndex: 1, active: false }
        - { from: P, fromIndex: 3, to: L, toIndex: 2, active: false }
        - { from: P, fromIndex: 3, to: R, toIndex: 1, active: false }
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

### ¿Por qué puentes hacia DOS lados (izq y der)?

En una consulta 2D $[x_1, x_2] \times [y_1, y_2]$, el árbol primario en $X$ descompone el rango horizontal. Cuando la consulta llega a cualquier nodo padre $P$, el camino de búsqueda puede requerir descender hacia su **hijo izquierdo** (subárbol con $X$ menores), hacia su **hijo derecho** (subárbol con $X$ mayores), o hacia **ambos** (si el rango $[x_1, x_2]$ se bifurca):

- Si la consulta desciende al **hijo izquierdo**: salta por `puenteIzq[i]` en $O(1)$ directo a la posición donde empieza el rango vertical en $L$.
- Si la consulta desciende al **hijo derecho**: salta por `puenteDer[i]` en $O(1)$ directo a la posición donde empieza el rango vertical en $R$.

Como el nodo $P$ no puede predecir hacia qué lado irá cada consulta que el usuario haga en el futuro, **cada posición de $P$ necesita vías rápidas hacia ambos lados**. Sin puentes hacia ambos lados, descender a un hijo exigiría repetir una búsqueda binaria completa en $O(\lg n)$. Con puentes a ambos lados, **todo descenso toma $O(1)$**.

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
