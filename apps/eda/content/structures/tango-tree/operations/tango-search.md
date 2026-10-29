---
kind: operation
title: "Buscar en un Tango Tree (tango-search)"
order: 1
cppSteps:
  - step-1-referencia.cpp
  - step-2-preferidos.cpp
  - full-implementation.cpp
visualization: {
  "type": "tree",
  "steps": [
    {
      "note": "Antes de buscar 3, las flechas pref son 4→6, 6→5 y 2→1. Hay cuatro caminos: {4,6,5}, {2,1}, {3} y {7}. Esta vista muestra P y sus preferencias, no la forma interna de los BBST auxiliares.",
      "nodes": [
        {"id": "n4", "value": 4, "tag": "pref: 6"},
        {"id": "n2", "value": 2, "parent": "n4", "side": "left", "edge": false, "tag": "pref: 1"},
        {"id": "n6", "value": 6, "parent": "n4", "side": "right", "edge": false, "tag": "pref: 5"},
        {"id": "n1", "value": 1, "parent": "n2", "side": "left", "edge": false},
        {"id": "n3", "value": 3, "parent": "n2", "side": "right", "edge": false},
        {"id": "n5", "value": 5, "parent": "n6", "side": "left", "edge": false},
        {"id": "n7", "value": 7, "parent": "n6", "side": "right", "edge": false}
      ],
      "links": [
        {"from": "n4", "to": "n2", "kind": "tree"},
        {"from": "n4", "to": "n6", "kind": "pointer", "label": "pref"},
        {"from": "n2", "to": "n1", "kind": "pointer", "label": "pref"},
        {"from": "n2", "to": "n3", "kind": "tree"},
        {"from": "n6", "to": "n5", "kind": "pointer", "label": "pref"},
        {"from": "n6", "to": "n7", "kind": "tree"}
      ],
      "highlight": []
    },
    {
      "note": "Buscar 3 empieza en el auxiliar del camino {4,6,5}. La búsqueda sale por el hijo izquierdo de 4 (llave 2), que no es el preferido: primer cambio. En P se está inspeccionando el nodo 4.",
      "nodes": [
        {"id": "n4", "value": 4, "tag": "pref: 6", "state": "active"},
        {"id": "n2", "value": 2, "parent": "n4", "side": "left", "edge": false, "tag": "pref: 1"},
        {"id": "n6", "value": 6, "parent": "n4", "side": "right", "edge": false, "tag": "pref: 5"},
        {"id": "n1", "value": 1, "parent": "n2", "side": "left", "edge": false},
        {"id": "n3", "value": 3, "parent": "n2", "side": "right", "edge": false},
        {"id": "n5", "value": 5, "parent": "n6", "side": "left", "edge": false},
        {"id": "n7", "value": 7, "parent": "n6", "side": "right", "edge": false}
      ],
      "links": [
        {"from": "n4", "to": "n2", "kind": "tree"},
        {"from": "n4", "to": "n6", "kind": "pointer", "label": "pref"},
        {"from": "n2", "to": "n1", "kind": "pointer", "label": "pref"},
        {"from": "n2", "to": "n3", "kind": "tree"},
        {"from": "n6", "to": "n5", "kind": "pointer", "label": "pref"},
        {"from": "n6", "to": "n7", "kind": "tree"}
      ],
      "highlight": [
        "n4"
      ]
    },
    {
      "note": "En el auxiliar del camino {2,1}, 3>2 exige salir hacia 3. El preferido de 2 era 1: segundo cambio. Se alcanza 3; se visitaron tres auxiliares en total, contando el inicial.",
      "nodes": [
        {"id": "n4", "value": 4, "tag": "pref: 6"},
        {"id": "n2", "value": 2, "parent": "n4", "side": "left", "edge": false, "tag": "pref: 1", "state": "active"},
        {"id": "n6", "value": 6, "parent": "n4", "side": "right", "edge": false, "tag": "pref: 5"},
        {"id": "n1", "value": 1, "parent": "n2", "side": "left", "edge": false},
        {"id": "n3", "value": 3, "parent": "n2", "side": "right", "edge": false, "state": "active"},
        {"id": "n5", "value": 5, "parent": "n6", "side": "left", "edge": false},
        {"id": "n7", "value": 7, "parent": "n6", "side": "right", "edge": false}
      ],
      "links": [
        {"from": "n4", "to": "n2", "kind": "tree"},
        {"from": "n4", "to": "n6", "kind": "pointer", "label": "pref"},
        {"from": "n2", "to": "n1", "kind": "pointer", "label": "pref"},
        {"from": "n2", "to": "n3", "kind": "tree"},
        {"from": "n6", "to": "n5", "kind": "pointer", "label": "pref"},
        {"from": "n6", "to": "n7", "kind": "tree"}
      ],
      "highlight": [
        "n2",
        "n3"
      ]
    },
    {
      "note": "Acceso a 3: cambia 4→6 por 4→2 y cambia 2→1 por 2→3. Son dos alternancias adicionales. Las flechas forman {4,2,3}, {6,5}, {1} y {7}; el árbol de referencia no rotó. Total de cambios para 1,5,3: 0+1+2=3.",
      "nodes": [
        {"id": "n4", "value": 4, "tag": "pref: 2", "state": "active"},
        {"id": "n2", "value": 2, "parent": "n4", "side": "left", "edge": false, "tag": "pref: 3", "state": "active"},
        {"id": "n6", "value": 6, "parent": "n4", "side": "right", "edge": false, "tag": "pref: 5"},
        {"id": "n1", "value": 1, "parent": "n2", "side": "left", "edge": false},
        {"id": "n3", "value": 3, "parent": "n2", "side": "right", "edge": false, "state": "active"},
        {"id": "n5", "value": 5, "parent": "n6", "side": "left", "edge": false},
        {"id": "n7", "value": 7, "parent": "n6", "side": "right", "edge": false}
      ],
      "links": [
        {"from": "n4", "to": "n2", "kind": "pointer", "label": "pref"},
        {"from": "n4", "to": "n6", "kind": "tree"},
        {"from": "n2", "to": "n1", "kind": "tree"},
        {"from": "n2", "to": "n3", "kind": "pointer", "label": "pref"},
        {"from": "n6", "to": "n5", "kind": "pointer", "label": "pref"},
        {"from": "n6", "to": "n7", "kind": "tree"}
      ],
      "highlight": [
        "n4",
        "n2",
        "n3"
      ]
    }
  ]
}
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

Cada cambio cuesta $O(\lg\lg n)$ y se visitan $1 + (\text{alternancias del acceso})$ árboles auxiliares: $O\big(\lg\lg n \cdot (1 + \text{alt})\big)$ por acceso, y $O(\lg\lg n \cdot (m + \text{Wilber-1}))$ en total. Eso es $O(\lg\lg n)$-competitivo.

## Complejidad espacial

$O(n)$: un nodo por llave más la información de a qué árbol auxiliar pertenece. *(Derivado: cada llave aparece en un solo auxiliar.)*

## Ejemplo

La animación de arriba: secuencia $1, 5, 3$ sobre las llaves $1..7$. Cambios de hijo preferido: el acceso a 5 cambia la preferencia de 4 (de 2 a 6); el acceso a 3 cambia la de 4 (de 6 a 2) y la de 2 (de 1 a 3). Con el código: `cambios = 3`, igual que Wilber-1.

## Casos límite

- **Acceso repetido** a la misma llave: no hay cambios; la búsqueda se queda en un solo camino.
- **Acceso secuencial** $1, 2, \dots, n$: exactamente una alternancia por nodo interno de $P$ (primero se baja por la izquierda y luego por la derecha): $\Theta(n)$ cambios en total, es decir, $O(1)$ amortizado por acceso.
- **Bit-reversal:** cambia de camino en casi cada nodo: el peor caso, $\Theta(n \lg n)$ cambios.
