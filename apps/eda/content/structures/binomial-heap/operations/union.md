---
kind: operation
title: Union
order: 3
cppSteps:
  - step-1-node.cpp
  - step-2-structure.cpp
  - step-3-binomial-link.cpp
  - step-4-find-min.cpp
  - step-5-union.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Los dos montículos de entrada, uno al lado del otro — todavía
        completamente separados, nada se ha tocado. H1 = {10 (grado 0), 4
        con hijo 9 (grado 1)}: 3 nodos = 11 en binario, dos bits
        prendidos. H2 = {6 (grado 0), 2 con hijo 7 (grado 1)}: también 3
        nodos, también 11 en binario. Union va a sumar estos dos "11" bit
        a bit, con acarreo, igual que 3 + 3.
      highlight: []
      panels:
        - { id: h1, label: "H1" }
        - { id: h2, label: "H2" }
      nodes:
        - { id: n10, value: 10, parent: null, panel: h1 }
        - { id: n4, value: 4, parent: null, panel: h1 }
        - { id: n9, value: 9, parent: n4, panel: h1 }
        - { id: n6, value: 6, parent: null, panel: h2 }
        - { id: n2, value: 2, parent: null, panel: h2 }
        - { id: n7, value: 7, parent: n2, panel: h2 }
    - note: >-
        Mezcla: las dos listas de raíces se intercalan ordenadas por
        grado, sin enlazar nada todavía — es sólo "alinear los bits" antes
        de sumar. Los dos montículos dejan de ser paneles separados y
        pasan a ser un solo bosque, en orden de grado: 10, 6 (ambas grado
        0), luego 4-con-9, 2-con-7 (ambas grado 1).
      highlight: []
      nodes:
        - { id: n10, value: 10, parent: null }
        - { id: n6, value: 6, parent: null }
        - { id: n4, value: 4, parent: null }
        - { id: n9, value: 9, parent: n4 }
        - { id: n2, value: 2, parent: null }
        - { id: n7, value: 7, parent: n2 }
    - note: >-
        Grado 0: hay 2 árboles (10 y 6) y ninguna tercera raíz de grado 0
        después — se enlazan ya. Se comparan sus llaves para decidir quién
        queda como raíz.
      highlight: ["n10", "n6"]
      nodes:
        - { id: n10, value: 10, parent: null }
        - { id: n6, value: 6, parent: null }
        - { id: n4, value: 4, parent: null }
        - { id: n9, value: 9, parent: n4 }
        - { id: n2, value: 2, parent: null }
        - { id: n7, value: 7, parent: n2 }
    - note: >-
        Binomial-Link(10, 6): 10 >= 6, así que 6 gana y 10 se vuelve su
        hijo. Nace un B1 con raíz 6 — es el "acarreo" que se lleva al
        grado 1, igual que el acarreo de sumar dos unos en binario.
      highlight: ["n6", "n10"]
      nodes:
        - { id: n6, value: 6, parent: null, state: active }
        - { id: n10, value: 10, parent: n6, state: active }
        - { id: n4, value: 4, parent: null }
        - { id: n9, value: 9, parent: n4 }
        - { id: n2, value: 2, parent: null }
        - { id: n7, value: 7, parent: n2 }
    - note: >-
        Grado 1: ahora hay TRES árboles de grado 1 — el acarreo recién
        nacido (6, con su hijo 10; se queda quieto, no es el foco de este
        paso), y los dos B1 originales (4-con-9 y 2-con-7). Regla de la
        tercera raíz — no se enlaza todavía: se avanza para no perder
        ninguno de los tres.
      highlight: ["n6", "n4", "n2"]
      nodes:
        - { id: n6, value: 6, parent: null }
        - { id: n10, value: 10, parent: n6 }
        - { id: n4, value: 4, parent: null }
        - { id: n9, value: 9, parent: n4 }
        - { id: n2, value: 2, parent: null }
        - { id: n7, value: 7, parent: n2 }
    - note: >-
        Se avanza x al siguiente par: ahora comparamos 4 y 2, y ya no hay
        una tercera raíz de grado 1 después de ellos — así que esta vez sí
        se enlazan. El acarreo (6, con su hijo 10) queda aparte, sin tocar,
        como raíz final.
      highlight: ["n4", "n2"]
      nodes:
        - { id: n6, value: 6, parent: null, state: muted }
        - { id: n10, value: 10, parent: n6, state: muted }
        - { id: n4, value: 4, parent: null }
        - { id: n9, value: 9, parent: n4 }
        - { id: n2, value: 2, parent: null }
        - { id: n7, value: 7, parent: n2 }
    - note: >-
        Binomial-Link(4, 2): 4 >= 2, así que 2 gana y 4 se vuelve su hijo
        (4 conserva a 9 como su propio hijo). Nace un B2 con raíz 2 — no
        hay acarreo esta vez porque ya no queda ningún otro árbol de
        grado 1 ni de grado 2 con quien enlazarlo. El B1 (6 con hijo 10)
        sigue ahí, intacto, esperando el final.
      highlight: ["n2", "n4"]
      nodes:
        - { id: n6, value: 6, parent: null, state: muted }
        - { id: n10, value: 10, parent: n6, state: muted }
        - { id: n2, value: 2, parent: null, state: active }
        - { id: n4, value: 4, parent: n2, state: active }
        - { id: n9, value: 9, parent: n4 }
        - { id: n7, value: 7, parent: n2 }
    - note: >-
        Grado 2: sólo 1 árbol (el B2 recién formado con raíz 2) — nada que
        enlazar, se acarrea tal cual hasta el final de la lista. El otro
        acarreo (6 con hijo 10) tampoco se toca: ya es una raíz final.
      highlight: ["n2"]
      nodes:
        - { id: n6, value: 6, parent: null, state: muted }
        - { id: n10, value: 10, parent: n6, state: muted }
        - { id: n2, value: 2, parent: null }
        - { id: n4, value: 4, parent: n2 }
        - { id: n9, value: 9, parent: n4 }
        - { id: n7, value: 7, parent: n2 }
    - note: >-
        Estado final: dos raíces, 6 (B1, hijo 10) y 2 (B2, hijos 4 y 7; 4
        conserva a 9) — igual que 3 + 3 = 6 = 110 en binario: bit de
        grado 0 apagado (se consumió en el acarreo), bit de grado 1
        prendido (el 6) y bit de grado 2 prendido (el 2).
      highlight: []
      nodes:
        - { id: n6, value: 6, parent: null }
        - { id: n10, value: 10, parent: n6 }
        - { id: n2, value: 2, parent: null }
        - { id: n4, value: 4, parent: n2 }
        - { id: n9, value: 9, parent: n4 }
        - { id: n7, value: 7, parent: n2 }
---

<!-- derivado del pseudocódigo del Algoritmo 7; no hay diagrama de Union
     en las diapositivas, sólo la idea en prosa (diapositiva 21) y el
     pseudocódigo (diapositiva 23). -->

## Qué hace

Combina dos montículos binomiales en uno solo, conservando el invariante de
"a lo mucho un árbol por orden".

## Intuición

Es sumar en binario: la lista de raíces de cada montículo es una secuencia
de bits (presente/ausente por orden). Mezclar las dos listas por grado y
enlazar pares del mismo grado con [Binomial-Link](/structures/binomial-heap/operations/binomial-link)
es exactamente propagar el acarreo de una suma binaria, bit por bit.

## Algoritmo

1. Mezclar las dos listas de raíces (cada una ya ordenada por grado) en una
   sola lista ordenada por grado — sin enlazar nada todavía.
2. Recorrer la lista mezclada con un puntero `x` y su siguiente `next`:
   - Si `x` y `next` tienen grados distintos, o si hay una **tercera** raíz
     después de `next` con el mismo grado que `x`, avanzar sin enlazar
     (ese enlace se resolverá en la siguiente vuelta).
   - En otro caso, enlazar los dos con Binomial-Link (la de menor llave
     queda como raíz del árbol combinado).

## Pseudocódigo

```
Algoritmo 7: Union(H1, H2)
H ← mezclar las listas de raíces de H1 y H2, ordenadas por grado ;
x ← primera raíz de H ;
mientras x tiene una siguiente raíz y con grado(x) = grado(y) hacer
   si existe una tercera raíz z después de y con grado(z) = grado(x) entonces
       avanzar x a y ;              // se enlazará en la siguiente vuelta
   en otro caso
       Binomial-Link(x, y) ;        // o al revés, según la llave menor

devolver H ;
```

## C++

Ver `cpp/structures/binomial-heap/step-5-union.cpp`: `mergeRootLists` hace
el paso 1 (una mezcla clásica de dos listas ordenadas); `heapUnion` hace el
paso 2 con los cuatro casos del algoritmo (grados distintos, tercera raíz
igual, enlazar `next` bajo `x`, enlazar `x` bajo `next`).

## Complejidad temporal

$O(\lg n)$. Cada montículo de entrada tiene a lo mucho $O(\lg n)$ raíces, así
que mezclar las dos listas cuesta $O(\lg n)$. El recorrido de consolidación
visita cada raíz de la lista mezclada a lo mucho una vez más que enlaza (a
lo mucho $O(\lg n)$ enlaces), y cada Binomial-Link es $O(1)$. Total: $O(\lg n)$.

## Complejidad espacial

$O(1)$ adicional: Union reconecta los nodos existentes de `H1` y `H2`, no
copia ni crea nodos nuevos (aparte de la cabeza del montículo resultado).

## Ejemplo

`H1` con raíces `{10 (B0), 4-con-hijo-9 (B1)}` (3 nodos: en realidad
$11_2$ = 3) y `H2` con raíces `{6 (B0), 2-con-hijo-7 (B1)}` (otros 3
nodos, $11_2$ = 3). `Union` da $3 + 3 = 6 = 110_2$: un $B_1$ (raíz 6, hijo 10)
y un $B_2$ (raíz 2, hijos 4 y 7, y 4 conserva a 9). Ver la visualización
arriba para el paso a paso. (Derivado del pseudocódigo; el mazo no da
valores.)

## Casos límite

- **Tres raíces consecutivas del mismo grado**: es el caso que el
  pseudocódigo trata explícitamente con la comprobación de "una tercera
  raíz z". Pasa, por ejemplo, cuando `H1` ya aporta dos raíces del mismo
  grado (algo que no debería ocurrir en un montículo válido) — en la
  práctica ocurre cuando la mezcla intercala una raíz de `H1` y una de `H2`
  del mismo grado justo antes de que Union tenga que enlazar un acarreo que
  ya traía arrastrado de un paso anterior.
- **Uno de los dos montículos vacío**: la mezcla degenera en simplemente
  devolver la lista de raíces del otro; no hace falta ningún enlace. El
  mazo no lo discute, pero es consistente con tratar la lista de raíces
  vacía como el "0" de la suma binaria.
- **Los dos montículos vacíos**: el resultado es el montículo vacío.
