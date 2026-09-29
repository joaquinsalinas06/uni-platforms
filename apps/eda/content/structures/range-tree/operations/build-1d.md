---
kind: operation
title: Construcción 1D
order: 1
cppSteps:
  - step-1-point.cpp
  - step-2-build-1d.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  steps:
    - note: >-
        Derivado del algoritmo; el mazo sólo muestra el árbol ya construido
        (diapositiva #29). Punto de partida: los n=8 puntos ya ordenados por
        su llave, que serán las hojas: 3, 4, 7, 9, 13, 15, 18, 27.
      highlight: []
      nodes:
        - { id: l3, value: 3, parent: null }
        - { id: l4, value: 4, parent: null }
        - { id: l7, value: 7, parent: null }
        - { id: l9, value: 9, parent: null }
        - { id: l13, value: 13, parent: null }
        - { id: l15, value: 15, parent: null }
        - { id: l18, value: 18, parent: null }
        - { id: l27, value: 27, parent: null }
    - note: >-
        Se emparejan hojas consecutivas y se crea un padre por par, que
        guarda el máximo del subárbol izquierdo: (3,4)→3, (7,9)→7,
        (13,15)→13, (18,27)→18. Esto ya corresponde al nivel de internos
        más bajo del diagrama #29.
      highlight: [n3i, n7i, n13i, n18i]
      nodes:
        - { id: n3i, value: 3, parent: null }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i }
        - { id: n7i, value: 7, parent: null }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n13i, value: 13, parent: null }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: null }
        - { id: l18, value: 18, parent: n18i }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Se repite un nivel arriba: (n3i,n7i)→4 (máximo del subárbol
        izquierdo, que son las hojas 3,4,7,9), (n13i,n18i)→15 (máximo de
        13,15,18,27). Coincide con el segundo nivel del diagrama #29.
      highlight: [n4, n15]
      nodes:
        - { id: n4, value: 4, parent: null }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i }
        - { id: n7i, value: 7, parent: n4 }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: null }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Último emparejamiento: (n4,n15)→9 (máximo del subárbol izquierdo,
        las hojas 3,4,7,9). Árbol completo, idéntico al de la diapositiva
        #29: raíz 9, hijos 4 y 15, siguiente nivel 3, 7, 13, 18, hojas
        3, 4, 7, 9, 13, 15, 18, 27.
      highlight: [r9]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i }
        - { id: n7i, value: 7, parent: n4 }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i }
        - { id: l27, value: 27, parent: n18i }
---

## Qué hace

Convierte un conjunto de n puntos (o llaves, en 1D) en un
[range tree](/structures/range-tree): un [BST balanceado](/structures/balanced-bst)
con las llaves en las hojas y cada interno guardando sólo el máximo de su
subárbol izquierdo.

## Intuición

Como el orden de las hojas ya está fijo (el orden de la llave), no hace
falta insertar una por una y balancear sobre la marcha: basta con ordenar
los puntos una vez y construir el árbol de abajo hacia arriba, emparejando
subárboles hermanos y anotando en el padre el máximo de la mitad izquierda.
Cada interno es puro delimitador — nunca un punto real — así que la forma
final es la de un árbol binario casi completo, sin necesidad de rotaciones.

## Algoritmo

*(Derivado del pseudocódigo; el mazo no trae ninguno — sólo el resultado
en la diapositiva #29.)*

1. Ordenar los n puntos por su llave: $O(n \log n)$
   (Sem4_Orthogonal_Range_Search.pdf#55).
2. Colocarlos como hojas, en ese orden.
3. Mientras haya más de un nodo en el nivel actual: emparejar nodos
   consecutivos y crear un padre por par que guarde el **máximo del
   subárbol izquierdo** (Sem4_Orthogonal_Range_Search.pdf#26). Si un nivel
   tiene un número impar de nodos, el último sube sin pareja.
4. El único nodo que queda es la raíz.

## Pseudocódigo

```
BuildRangeTree1D(puntos[1..n])          // derivado; el mazo no trae pseudocódigo
ordenar puntos por llave
nivel ← [hoja(p) para cada p en puntos]
mientras |nivel| > 1
    siguiente ← []
    para cada par (izq, der) consecutivo en nivel
        nodo.max_izq ← máximo del subárbol de izq
        nodo.izq ← izq; nodo.der ← der
        siguiente.agregar(nodo)
    si |nivel| es impar
        siguiente.agregar(último nodo sin pareja)
    nivel ← siguiente
devolver nivel[0]   // raíz
```

## C++

Ver `step-2-build-1d.cpp` y `full-implementation.cpp` en el editor de
arriba.

## Complejidad temporal

$O(n \log n)$: domina el ordenamiento inicial; el ensamblado bottom-up visita
cada uno de los $O(n)$ nodos una sola vez
(Sem4_Orthogonal_Range_Search.pdf#28,55).

## Complejidad espacial

$O(n)$: un árbol binario casi completo con n hojas tiene a lo más $2n-1$ nodos
en total (Sem4_Orthogonal_Range_Search.pdf#28).

## Ejemplo

Ver la visualización de arriba: construcción completa sobre
`{3, 4, 7, 9, 13, 15, 18, 27}`, terminando en el árbol de la diapositiva #29.

## Casos límite

- **Un solo punto**: el árbol es una única hoja, sin internos.
- **n par en todos los niveles** (como el ejemplo, n=8=2³): el árbol queda
  perfectamente balanceado, cada nivel se empareja exacto.
- **n con potencia de 2 no exacta**: algún nivel intermedio tiene un nodo
  impar que sube sin pareja — el árbol sigue siendo $O(\log n)$ de altura,
  sólo deja de ser perfecto.
