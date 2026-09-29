---
kind: operation
title: Linearización del árbol de versiones
order: 5
cppSteps:
  - step-6-version-tree.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  mode: version-tree
  steps:
    - note: >-
        Se entra a la raíz (versión 1): se abre paréntesis (₁. El
        recorrido de Euler visitará cada versión dos veces — al bajar y al
        subir — y cada visita anota un paréntesis.
      highlight: ["1"]
      nodes:
        - { id: "1", value: "1", parent: null }
        - { id: "2", value: "2", parent: "1" }
        - { id: "3", value: "3", parent: "1" }
        - { id: "4", value: "4", parent: "2" }
        - { id: "5", value: "5", parent: "2" }
        - { id: "6", value: "6", parent: "3" }
        - { id: "7", value: "7", parent: "3" }
      caption: "(₁"
    - note: >-
        Se baja por el subárbol izquierdo completo: entra y sale de 2,
        entra y sale de sus dos hijos (4, luego 5, ninguno tiene hijos
        propios) y cierra 2. Cada entrada abre, cada salida cierra —
        siempre en el mismo orden en que se visitó.
      highlight: ["2", "4", "5"]
      nodes:
        - { id: "1", value: "1", parent: null }
        - { id: "2", value: "2", parent: "1" }
        - { id: "3", value: "3", parent: "1" }
        - { id: "4", value: "4", parent: "2" }
        - { id: "5", value: "5", parent: "2" }
        - { id: "6", value: "6", parent: "3" }
        - { id: "7", value: "7", parent: "3" }
      caption: "(₁(₂(₄)₄(₅)₅)₂"
    - note: >-
        Con el subárbol izquierdo cerrado, el recorrido vuelve a 1 y baja
        por el derecho: entra y sale de 3, y de sus dos hijos 6 y 7, en
        el mismo patrón.
      highlight: ["3", "6", "7"]
      nodes:
        - { id: "1", value: "1", parent: null }
        - { id: "2", value: "2", parent: "1" }
        - { id: "3", value: "3", parent: "1" }
        - { id: "4", value: "4", parent: "2" }
        - { id: "5", value: "5", parent: "2" }
        - { id: "6", value: "6", parent: "3" }
        - { id: "7", value: "7", parent: "3" }
      caption: "(₁(₂(₄)₄(₅)₅)₂(₃(₆)₆(₇)₇)₃"
    - note: >-
        Ya se visitaron los dos hijos de 1: se sale de la raíz y se cierra
        )₁. La secuencia final es balanceada (siete aperturas, siete
        cierres) y basta para responder "¿u es ancestro de v?" comparando
        posiciones, sin recorrer el árbol de nuevo.
      highlight: ["1"]
      nodes:
        - { id: "1", value: "1", parent: null }
        - { id: "2", value: "2", parent: "1" }
        - { id: "3", value: "3", parent: "1" }
        - { id: "4", value: "4", parent: "2" }
        - { id: "5", value: "5", parent: "2" }
        - { id: "6", value: "6", parent: "3" }
        - { id: "7", value: "7", parent: "3" }
      caption: "(₁(₂(₄)₄(₅)₅)₂(₃(₆)₆(₇)₇)₃)₁"
---

## Qué hace

Recorre el árbol de versiones con un recorrido de Euler, produciendo una
secuencia balanceada de paréntesis que **linealiza** el árbol: convierte la
pregunta "¿la versión $u$ es ancestro de la versión $v$?" (y, más en
general, comparar la posición relativa de dos versiones) en una pregunta
sobre posiciones en una secuencia — la pieza que
[nodos gordos bidireccionales](/structures/fat-nodes/operations/bidirectional-fat-nodes)
necesita para decidir hacia qué registro (adelante o atrás) cae cada
modificación.

## Intuición

Este es el **único diagrama que el mazo sí dibuja** en toda la sección de
nodos gordos (páginas 38-39): un árbol de versiones de 7 nodos — raíz `1`;
hijos `2` y `3`; `2` con hijos `4` y `5`; `3` con hijos `6` y `7` — un
árbol binario completo de 3 niveles.

```
                1
              /   \
             2      3
           /  \    /  \
          4    5  6    7
```

La idea del recorrido de Euler: caminar el árbol como si se le diera la
vuelta por fuera, tocando cada arista dos veces — una al bajar (entrar a
un hijo) y otra al subir (volver al padre). Cada vez que se entra a una
versión $i$ se anota un paréntesis que abre, $(_i$ ("se hace el cambio
i"); cada vez que se sale, uno que cierra, $)_i$ ("se deshace el cambio
i"). El resultado es una secuencia de paréntesis balanceada, y la
convención estándar aplica: **los ancestros de un nodo son exactamente los
paréntesis abiertos y todavía no cerrados** en el momento de visitarlo.

## Algoritmo

1. Al entrar a la versión $i$ (recorrido en profundidad, preorden):
   emitir $(_i$.
2. Visitar recursivamente, en orden, a cada hijo de $i$.
3. Al terminar con todos los hijos (o de inmediato si $i$ no tiene
   ninguno): emitir $)_i$.

## Pseudocódigo

Sin pseudocódigo formal en el mazo; transcripción directa de la
convención dada en las páginas 38-39:

```
función recorridoEuler(v):
    emitir "(" + v
    para cada hijo c de v (en orden):
        recorridoEuler(c)
    emitir ")" + v
```

Sobre el árbol de 7 nodos, la traza completa (el mazo la da truncada con
puntos suspensivos, `(₁ (₂ (₄ )₄ (₅ )₅ )₂ (₃ ···`; aquí completa):

```
(₁ (₂ (₄ )₄ (₅ )₅ )₂ (₃ (₆ )₆ (₇ )₇ )₃ )₁
```

## C++

Ver `step-6-version-tree.cpp` (`VersionTree` y `eulerTour`) y
`full-implementation.cpp` (con el árbol de 7 nodos y el assert sobre la
secuencia completa) en el editor de arriba.

## Complejidad temporal

El profesor no analiza el costo del recorrido en sí (recorrer un árbol de
$n$ versiones es, implícitamente, $O(n)$ total — un paso por nodo, dos
emisiones cada uno). Lo que sí da, como caja negra con su interfaz, es la
**estructura de mantenimiento de orden** que usa esta linearización:
"soporta comparar dos tiempos e insertar un tiempo nuevo entre otros dos,
ambos en $O(1)$" (página 41) — sin implementarla ni explicarla. Es la
pieza que permite, una vez linealizado el árbol, decidir en $O(1)$ si una
versión es ancestro de otra o insertar una versión nueva entre dos
existentes sin renumerar nada.

## Complejidad espacial

No lo da el mazo explícitamente para esta operación; la secuencia de
paréntesis tiene $2n$ símbolos para un árbol de $n$ versiones (dos por
nodo), consistente con el tamaño de la traza de 7 nodos (14 símbolos).

## Ejemplo

El árbol de 7 nodos de las páginas 38-39, con la traza completa derivada
arriba. Es el único ejemplo del mazo con datos concretos en toda la
sección de nodos gordos — el resto de los ejemplos de este tema están
derivados y marcados como tal.

## Casos límite

- **Nodo hoja (sin hijos)**: se abre y se cierra de inmediato, sin ningún
  paréntesis intermedio — los casos de `4`, `5`, `6` y `7` en el árbol de
  ejemplo.
- **La raíz**: es el primer paréntesis que abre y el último que cierra en
  toda la secuencia — todos los demás quedan estrictamente adentro.
- **Insertar una versión nueva entre dos existentes**: es exactamente la
  operación que la estructura de mantenimiento de orden soporta en $O(1)$
  (página 41), pero el mazo no explica cómo — se asume como caja negra
  ("Asume (no explica): estructura de mantenimiento de orden").
- **Leer "ancestros = paréntesis abiertos no cerrados"**: es una lectura
  estándar de la convención de paréntesis que el mazo asume conocida, sin
  demostrarla ni ejemplificarla más allá del árbol de 7 nodos.
