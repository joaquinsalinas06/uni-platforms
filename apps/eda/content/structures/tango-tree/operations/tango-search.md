---
kind: operation
title: "Buscar en un Tango Tree (tango-search)"
order: 1
cppSteps:
  - step-1-referencia.cpp
  - step-2-preferidos.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: "Estado: tras acceder a 1 y a 5, los hijos preferidos son 4→6, 6→5 y 2→1: hay tres caminos, {4, 6, 5}, {2, 1} y las hojas sueltas {3} y {7}. Cada camino vive en su propio árbol auxiliar."
      nodes:
        - { id: n4, value: 4, state: marked }
        - { id: n2, value: 2, parent: n4, side: left, state: shared }
        - { id: n6, value: 6, parent: n4, side: right, state: marked }
        - { id: n1, value: 1, parent: n2, side: left, state: shared }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n5, value: 5, parent: n6, side: left, state: marked }
        - { id: n7, value: 7, parent: n6, side: right }
    - note: "Búsqueda de 3. Se empieza en el árbol auxiliar del camino de la raíz {4, 6, 5}: 3 < 4, así que hay que bajar por el hijo izquierdo de 4 (la llave 2), que NO es su hijo preferido. Hay que salir del camino: un cruce."
      highlight: ['n4']
      nodes:
        - { id: n4, value: 4, state: active }
        - { id: n2, value: 2, parent: n4, side: left }
        - { id: n6, value: 6, parent: n4, side: right, state: marked }
        - { id: n1, value: 1, parent: n2, side: left, state: shared }
        - { id: n3, value: 3, parent: n2, side: right }
        - { id: n5, value: 5, parent: n6, side: left, state: marked }
        - { id: n7, value: 7, parent: n6, side: right }
    - note: "Salto al árbol auxiliar del camino {2, 1} (por el puntero de una hoja del auxiliar actual). 3 > 2: se baja al hijo derecho de 2, que tampoco es su preferido (era 1): otro cruce. Se llega a 3."
      highlight: ['n2', 'n3']
      nodes:
        - { id: n4, value: 4, state: shared }
        - { id: n2, value: 2, parent: n4, side: left, state: active }
        - { id: n6, value: 6, parent: n4, side: right, state: shared }
        - { id: n1, value: 1, parent: n2, side: left, state: shared }
        - { id: n3, value: 3, parent: n2, side: right, state: active }
        - { id: n5, value: 5, parent: n6, side: left, state: shared }
        - { id: n7, value: 7, parent: n6, side: right }
    - note: "Actualización: ahora 4→2 y 2→3 son los hijos preferidos. El camino de la raíz pasa a ser {4, 2, 3}; {6, 5} queda como camino propio y {1} suelto. Se hicieron 2 cruces: 2 alternancias de Wilber-1 más el 1 del acceso mismo."
      highlight: ['n4', 'n2', 'n3']
      nodes:
        - { id: n4, value: 4, state: marked }
        - { id: n2, value: 2, parent: n4, side: left, state: marked }
        - { id: n6, value: 6, parent: n4, side: right, state: shared }
        - { id: n1, value: 1, parent: n2, side: left }
        - { id: n3, value: 3, parent: n2, side: right, state: marked }
        - { id: n5, value: 5, parent: n6, side: left, state: shared }
        - { id: n7, value: 7, parent: n6, side: right }
---

## Qué hace

Busca una llave $x$ en un Tango Tree: baja por los árboles auxiliares desde el camino de la raíz, **cruzando** a otro camino cada vez que el hijo por el que hay que bajar no es el preferido, y al terminar actualiza los hijos preferidos y los caminos.

## Intuición

Un Tango Tree es un árbol de árboles. Moverse dentro de un camino cuesta lo que cuesta un BBST de tamaño $O(\lg n)$, es decir $O(\lg\lg n)$. Cada vez que te sales del camino pagas un salto y rehaces las flechas: ese salto es el que Wilber-1 ya contabilizaba como alternancia.

## Algoritmo

1. Empezar en la raíz del árbol auxiliar del camino de la raíz de $P$.
2. Buscar $x$ en el árbol auxiliar actual (BBST de tamaño $O(\lg n)$). Si $x$ está en el camino, terminar la búsqueda.
3. Si no, la búsqueda sale del camino por algún nodo $y$: **cruzar** al árbol auxiliar del camino hijo (por el puntero de una hoja del auxiliar actual) y volver al paso 2. Cada cruce cambia el hijo preferido de $y$ por el hijo por el que se bajó.
4. Actualizar los caminos involucrados con split/join sobre los árboles auxiliares, cortando "por profundidad" mediante un rango de valores (mínimo y máximo del subárbol en el punto de corte).

> **Nota de apoyo** (no está en las diapositivas): las diapositivas no desarrollan el pseudocódigo del paso 4; sólo dan la idea de que el corte por profundidad equivale a un corte por valores. El código de abajo cuenta los cruces (cambios de hijo preferido) pero **no** implementa los BBSTs auxiliares.

## Pseudocódigo

```
ACCEDER(x):
  y ← raíz de P
  mientras y ≠ x:
    hijo ← (x < y) ? izq[y] : der[y]
    si pref[y] está definido y pref[y] ≠ hijo:
      cruces ← cruces + 1                   // cambio de hijo preferido = alternancia de Wilber-1
    pref[y] ← hijo
    y ← hijo
  devolver cruces
```

## C++

El editor trae el árbol de referencia, la actualización de los hijos preferidos y un programa que compara los cambios de hijo preferido con `Wilber-1`: **coinciden** (es la relación #14–#17). *(Código derivado; no aparece en las diapositivas.)*

## Complejidad temporal

Cada cruce cuesta $O(\lg\lg n)$ y hay $1 + (\text{alternancias del acceso})$ cruces: $O\big(\lg\lg n \cdot (1 + \text{alt})\big)$ por acceso, y $O(\lg\lg n \cdot (m + \text{Wilber-1}))$ en total. Eso es $O(\lg\lg n)$-competitivo.

## Complejidad espacial

$O(n)$: un nodo por llave más la información de a qué árbol auxiliar pertenece. *(Derivado: cada llave aparece en un solo auxiliar.)*

## Ejemplo

La animación de arriba: secuencia $1, 5, 3$ sobre las llaves $1..7$. Cambios de hijo preferido: el acceso a 5 cambia la preferencia de 4 (de 2 a 6); el acceso a 3 cambia la de 4 (de 6 a 2) y la de 2 (de 1 a 3). Con el código: `cambios = 3`, igual que Wilber-1.

## Casos límite

- **Acceso repetido** a la misma llave: no hay cambios; la búsqueda se queda en un solo camino.
- **Acceso secuencial** $1, 2, \dots, n$: exactamente una alternancia por nodo interno de $P$ (primero se baja por la izquierda y luego por la derecha): $\Theta(n)$ cambios en total, es decir, $O(1)$ amortizado por acceso.
- **Bit-reversal:** cambia de camino en casi cada nodo: el peor caso, $\Theta(n \lg n)$ cambios.
