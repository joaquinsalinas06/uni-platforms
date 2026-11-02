---
kind: operation
title: Consulta 2D
order: 3
cppSteps:
  - step-1-arrays.cpp
  - step-2-bridges.cpp
  - step-3-query.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  steps:
    - note: >-
        Puntos en 2D: A(1,4), B(2,9), C(3,1), D(4,7). El árbol primario organiza
        los puntos por su coordenada horizontal X (hojas A, B, C, D con X = 1, 2, 3, 4).
        Consulta rectangular: [x1,x2] × [y1,y2] = [2,4] × [3,8]. Primero filtramos
        en X para identificar los subárboles que cubren el rango horizontal [2,4].
      mode: tree
      nodes:
        - { id: root, value: "X:[1,4]", parent: null }
        - { id: nAB, value: "X:[1,2]", parent: root }
        - { id: nCD, value: "X:[3,4]", parent: root }
        - { id: A, value: "A(1,4)", parent: nAB }
        - { id: B, value: "B(2,9)", parent: nAB }
        - { id: C, value: "C(3,1)", parent: nCD }
        - { id: D, value: "D(4,7)", parent: nCD }
    - note: >-
        Descomposición canónica en X: El rango [2,4] se cubre con exactamente
        dos nodos canónicos: la hoja B(2,9) [cubre X=2] y el nodo interno (C,D)
        completo [cubre X∈[3,4]]. El nodo A(1,4) queda fuera (X=1 < 2). La raíz y (A,B)
        solo se visitan de paso.
      mode: tree
      nodes:
        - { id: root, value: "X:[1,4]", parent: null, state: active }
        - { id: nAB, value: "X:[1,2]", parent: root, state: active }
        - { id: nCD, value: "X:[3,4]", parent: root, state: answer, collapsed: true }
        - { id: A, value: "A(1,4)", parent: nAB, state: muted }
        - { id: B, value: "B(2,9)", parent: nAB, state: answer }
    - note: >-
        Única búsqueda binaria en Y (en la raíz): Ahora filtramos el eje vertical
        Y ∈ [3,8]. En la raíz, sobre su arreglo de Y=[1,4,7,9], localizamos:
        pa = primer elemento ≥ y1=3 (índice 1, valor 4) y pb = primer elemento > y2=8
        (índice 3, valor 9). Esta búsqueda cuesta O(lg n) y NUNCA se repite al bajar.
      mode: layers
      arrays:
        - id: root
          label: "raíz X∈[1,4] — arreglo de Y"
          row: 0
          cells: [1, 4, 7, 9]
          states: [idle, answer, idle, answer]
      caption: "Búsqueda binaria en Y: pa = 1 (valor 4), pb = 3 (valor 9) para Y∈[3,8]"
    - note: >-
        Bajando al nodo canónico (C,D) en O(1): Para filtrar Y en (C,D) no hacemos
        búsqueda binaria; saltamos por puenteDer de la raíz. pa=1 y pb=3 se traducen en
        O(1) a pa'=1 y pb'=2 sobre el arreglo (C,D) de Y=[1,7]. pb' − pa' = 2 − 1 = 1 punto:
        es exactamente D=(4,7), porque su Y=7 ∈ [3,8]. ¡Primer punto reportado!
      mode: layers
      arrays:
        - { id: root, label: "raíz X∈[1,4] [Y: 1,4,7,9]", row: 0, cells: [1, 4, 7, 9] }
        - id: nCD
          label: "(C,D) X∈[3,4] [Y: 1,7]"
          row: 1
          slot: right
          cells: [1, 7]
          states: [idle, answer]
      bridges:
        - { from: root, fromIndex: 1, to: nCD, toIndex: 1, active: true, label: "der" }
        - { from: root, fromIndex: 3, to: nCD, toIndex: 2, active: true, label: "der" }
      caption: "Salto O(1) hacia (C,D): pa'=1, pb'=2 -> 1 punto reportado: D(4,7)"
    - note: >-
        Bajando hacia la rama izquierda (A,B) en O(1): Usamos puenteIzq de la raíz para
        trasladar pa=1, pb=3 a pa''=0, pb''=1 sobre el arreglo de Y de (A,B)=[4,9]. Como
        (A,B) no es nodo canónico completo (solo su hoja B lo es), debemos hacer un
        último salto hacia B.
      mode: layers
      arrays:
        - { id: root, label: "raíz X∈[1,4] [Y: 1,4,7,9]", row: 0, cells: [1, 4, 7, 9] }
        - id: nAB
          label: "(A,B) X∈[1,2] [Y: 4,9]"
          row: 1
          slot: left
          cells: [4, 9]
      bridges:
        - { from: root, fromIndex: 1, to: nAB, toIndex: 0, active: true, label: "izq" }
        - { from: root, fromIndex: 3, to: nAB, toIndex: 1, active: true, label: "izq" }
      caption: "Salto O(1) hacia (A,B): pa''=0, pb''=1"
    - note: >-
        Salto final a la hoja B(2,9) en O(1): Usamos el puente derecho de (A,B) hacia su
        hoja B. pa''=0, pb''=1 se traducen a pa'''=0, pb'''=0 sobre B=[9]. pb''' − pa''' = 0:
        el punto B=(2,9) queda excluido porque su Y=9 no está en [3,8]. Total de la consulta:
        exactamente 1 punto — D(4,7). Todo el descenso en Y costó O(1) por nodo.
      mode: layers
      arrays:
        - { id: nAB, label: "(A,B) X∈[1,2] [Y: 4,9]", row: 0, cells: [4, 9] }
        - { id: B, label: "hoja B(2,9) [Y=9]", row: 1, slot: right, cells: [9], states: [muted] }
      bridges:
        - { from: nAB, fromIndex: 0, to: B, toIndex: 0, active: true, label: "der" }
        - { from: nAB, fromIndex: 1, to: B, toIndex: 0, active: true, label: "der" }
      caption: "Resultado: 1 (de D) + 0 (de B) = 1 punto reportado: D(4,7) en O(lg n) total"
---

## Qué hace

Cuenta o reporta los puntos dentro de un rectángulo `[x1,x2] × [y1,y2]`,
igual que [range-query-2d](/structures/range-tree/operations/range-query-2d)
de range-tree, pero resolviendo la parte en Y de cada nodo canónico con un
puente en $O(1)$ en vez de con una búsqueda binaria nueva.

## Intuición

"Al buscar los nodos canónicos de [x1,x2], descendemos por el árbol primario
de todos modos (para eso sirve la búsqueda de 1D). En el nodo raíz, hacemos
una búsqueda binaria real de y1 en su arreglo: $O(\lg n)$." (#34) A partir de
ahí, "en cada paso hacia un hijo, usamos el puntero ya calculado para
saltar, en $O(1)$, a la posición de y1 en el arreglo de ese hijo — sin ninguna
búsqueda binaria nueva" (#35). La búsqueda binaria sólo ocurre **una vez**,
en la raíz; el resto del descenso es puro seguimiento de puentes.

> **Nota de apoyo** (no está en las diapositivas): el material sólo describe
> cómo bajar `y1` (#34-35), pero un rango `[y1,y2]` necesita también un
> segundo extremo. La solución no requiere un segundo par de arreglos de
> puentes: los mismos `puenteIzq`/`puenteDer` sirven para bajar **cualquier**
> posición del arreglo del padre, sea la de `y1` o la de `y2` — el puente no
> depende de qué búsqueda lo originó, sólo de la posición. Basta con
> localizar en la raíz, con dos búsquedas binarias, la posición de `y1`
> (`pa`, primer elemento `≥ y1`) y la de `y2+1` (`pb`, primer elemento
> `> y2`), y bajar **ambas** por los mismos puentes en cada nodo canónico;
> `pb - pa` en ese nodo es la cantidad de puntos con Y en `[y1,y2]`.

## Algoritmo

1. Descender por el árbol primario para identificar los $O(\lg n)$ nodos
   canónicos que cubren `[x1,x2]`, exactamente como en la
   [consulta 1D](/structures/range-tree/operations/range-query-1d) de
   range-tree.
2. En la **raíz**, una única vez: buscar con búsqueda binaria las
   posiciones `pa` (primer `≥ y1`) y `pb` (primer `> y2`) en su arreglo.
3. Al descender de un nodo a un hijo que forma parte del camino hacia un
   nodo canónico, reemplazar `pa` y `pb` por `puenteIzq[pa]`/`puenteIzq[pb]`
   (o los del lado derecho), sin ninguna búsqueda binaria nueva.
4. En cada nodo canónico ya alcanzado, sumar `pb - pa` (con los `pa`/`pb`
   ya trasladados a ese nodo) al conteo total; o recorrer esa porción del
   arreglo para reportar los puntos.

## Pseudocódigo

```
consulta_2d(x1, x2, y1, y2):
    pa, pb = buscar_binario(arreglo[raiz], y1, y2 + 1)   # única búsqueda binaria
    retornar bajar(raiz, x1, x2, pa, pb)

bajar(nodo, x1, x2, pa, pb):
    si rango(nodo) es disjunto de [x1, x2]:
        retornar 0
    si rango(nodo) está contenido en [x1, x2]:
        retornar pb - pa                     # nodo canónico: O(1)
    # traslada pa, pb a cada hijo con los puentes, sin buscar de nuevo
    izq = bajar(hijoIzq(nodo), x1, x2, puenteIzq[nodo][pa], puenteIzq[nodo][pb])
    der = bajar(hijoDer(nodo), x1, x2, puenteDer[nodo][pa], puenteDer[nodo][pb])
    retornar izq + der
```

## C++

Ver `step-3-query.cpp` (descomposición canónica en X + traslado de `pa`/`pb`
por los puentes) y `full-implementation.cpp`.

## Complejidad temporal

Ver `range-query-2d` en la tabla de complejidad: $O(\lg n)$. Desglose del
profesor (#36): "$O(\lg n)$ nodos canónicos × $O(1)$ cada uno (tras la primera
búsqueda) = $O(\lg n)$ en total — un factor de $\lg n$ menos que la versión
ingenua." Comparar con la tabla "antes y después" (#37-40): $O(\lg^2 n)$ sin
cascading, $O(\lg n)$ con él, mismo espacio.

## Complejidad espacial

No consume espacio adicional propio: reutiliza los arreglos y puentes ya
construidos por
[sorted-array-replacement](/structures/layered-range-tree/operations/sorted-array-replacement)
y [bridge-build](/structures/layered-range-tree/operations/bridge-build).

## Ejemplo

Ver [Ejemplos](/structures/layered-range-tree/examples).

## Casos límite

- **`y1 > y2` o rango vacío en X**: `pa >= pb` en la raíz se propaga sin
  cambios por los puentes; cada nodo canónico aporta `pb - pa = 0`.
- **Consulta que cubre todo el árbol**: un único nodo canónico (la raíz),
  ninguna traducción de puentes: se responde directo con la primera y única
  búsqueda binaria.
- **Consulta con exactamente un punto**: el descenso llega hasta una hoja
  (el nodo canónico más pequeño posible); `pb - pa` vale 0 o 1 según si esa
  única Y cae dentro de `[y1,y2]`.
