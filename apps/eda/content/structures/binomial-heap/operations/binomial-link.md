---
kind: operation
title: Binomial-Link
order: 1
cppSteps:
  - step-1-node.cpp
  - step-2-structure.cpp
  - step-3-binomial-link.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Dos raíces sueltas del mismo grado k=0 (dos B0), cada una llegando
        de su propio montículo: y=7 y z=3. En general cada raíz podría
        traer ya subárboles colgando de vueltas anteriores de Union — por
        eso el algoritmo sólo asume "mismo grado", no "sin hijos".
      highlight: []
      nodes:
        - { id: y, value: 7, tag: y, parent: null }
        - { id: z, value: 3, tag: z, parent: null }
    - note: >-
        Comparación: la precondición de Binomial-Link es key(y) >= key(z).
        Se comparan las dos llaves de raíz para decidir cuál conserva la
        propiedad de min-heap si se queda arriba.
      highlight: ["y", "z"]
      nodes:
        - { id: y, value: 7, tag: y, parent: null }
        - { id: z, value: 3, tag: z, parent: null }
    - note: >-
        Decisión: como key(y)=7 >= key(z)=3, z (la llave menor) gana y se
        queda como raíz del árbol combinado; y (la llave mayor) es quien va
        a moverse.
      highlight: ["z"]
      nodes:
        - { id: y, value: 7, tag: y, parent: null }
        - { id: z, value: 3, tag: z, parent: null, state: active }
    - note: >-
        Reconexión, primer puntero: siguiente-hermano(y) ← hijo(z). Como z
        no tenía hijos antes (era un B0), ese puntero queda apuntando a
        "nada" — pero el orden del algoritmo importa: este puntero se fija
        ANTES de que hijo(z) se sobreescriba, para no perder la lista de
        hijos previa de z si hubiera tenido alguno. y todavía no es hijo de
        z (su padre sigue siendo null en este instante).
      highlight: ["y", "z"]
      nodes:
        - { id: y, value: 7, tag: y, parent: null, state: active }
        - { id: z, value: 3, tag: z, parent: null, state: active }
    - note: >-
        Reconexión, segundo puntero: hijo(z) ← y y padre(y) ← z. Recién
        ahora y pasa a ser, formalmente, el hijo más a la izquierda de z;
        grado(z) sube en 1 (de 0 a 1).
      highlight: ["y", "z"]
      nodes:
        - { id: z, value: 3, tag: z, parent: null, state: active }
        - { id: y, value: 7, tag: y, parent: z, state: active }
    - note: >-
        Estado final: un B1 con raíz 3 y un único hijo, 7. y es el nodo
        recién reconectado (por eso sigue activo); el árbol ya cumple
        min-heap: key(z)=3 <= key(y)=7.
      highlight: []
      nodes:
        - { id: z, value: 3, tag: z, parent: null }
        - { id: y, value: 7, tag: y, parent: z, state: active }
---

<!-- derivado del pseudocódigo del Algoritmo 5; no aparece en las diapositivas
     con valores numéricos concretos. -->

## Qué hace

Une dos árboles binomiales $B_{k-1}$ del mismo grado en un solo árbol
$B_k$, conservando la propiedad de min-heap.

## Intuición

Entre las dos raíces, la de menor llave "gana" y se queda como raíz; la de
mayor llave se convierte en su nuevo hijo más a la izquierda. Es la
operación atómica de la que dependen [Union](/structures/binomial-heap/operations/union),
[Insert](/structures/binomial-heap/operations/insert) y
[Extract-Min](/structures/binomial-heap/operations/extract-min): ellas no
la reexplican, sólo la llaman.

## Algoritmo

Precondición: `y`, `z` son raíces del mismo grado `k`, y `key(y) ≥ key(z)`.
Se reconecta `y` como hijo de `z`: `y` pasa a apuntar a `z` como padre, y a
lo que hoy es el primer hijo de `z` como su siguiente hermano; `z` gana a
`y` como su nuevo primer hijo y su grado sube en uno.

## Pseudocódigo

```
Algoritmo 5: Binomial-Link(y, z)
// y, z son raíces del mismo orden k; asumimos llave(y) ≥ llave(z)
padre(y) ← z ;
siguiente-hermano(y) ← hijo(z) ;
hijo(z) ← y ;
grado(z) ← grado(z) + 1 ;
```

## C++

Ver `cpp/structures/binomial-heap/step-3-binomial-link.cpp`: la función
`binomialLink(Node* y, Node* z)`, cuatro reasignaciones de puntero, ninguna
copia de nodos.

## Complejidad temporal

$O(1)$ en el peor caso: sólo se mueven cuatro punteros y se incrementa un
contador. No hay recorrido de ninguna lista ni recursión — es lo que le
permite a Union costar $O(\lg n)$ y no más.

## Complejidad espacial

$O(1)$: no se reserva memoria nueva, sólo se reconectan nodos existentes.

## Ejemplo

Dos $B_0$: uno con llave 7, otro con llave 3. Como `key(7) ≥ key(3)`,
`Binomial-Link(y=7, z=3)` deja a 7 como hijo de 3: resulta un $B_1$ con raíz
3 y un único hijo, 7. (Derivado a mano del pseudocódigo; el mazo no da
valores.)

## Casos límite

- Si las llaves fueran iguales, la precondición `key(y) ≥ key(z)` sigue
  cumpliéndose y el resultado es el mismo: cualquiera de las dos puede
  hacer de raíz.
- El algoritmo no verifica que `y` y `z` tengan el mismo grado: es
  responsabilidad de quien lo llama (Union, Insert, Extract-Min) garantizar
  la precondición. Llamarlo con grados distintos rompe silenciosamente la
  propiedad de "a lo mucho un árbol por orden".
