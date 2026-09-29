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
        Mismo ejemplo de "Normal" en Ejemplos: cuatro puntos A(1,4) B(2,9)
        C(3,1) D(4,7), árbol primario en X con hojas A,B,C,D. Consulta
        [x1,x2]×[y1,y2] = [2,4]×[3,8]: primero se descompone [2,4] en X,
        exactamente como en range-query-1d de range-tree.
      mode: tree
      nodes:
        - { id: root, value: "[1,4]", parent: null }
        - { id: nAB, value: "[1,2]", parent: root }
        - { id: nCD, value: "[3,4]", parent: root }
        - { id: A, value: 1, parent: nAB }
        - { id: B, value: 2, parent: nAB }
        - { id: C, value: 3, parent: nCD }
        - { id: D, value: 4, parent: nCD }
    - note: >-
        Los nodos canónicos de [2,4] son la hoja B y el nodo (C,D) completo
        (marcado colapsado: se trata como una sola unidad, no se vuelve a
        entrar en C y D por separado). La raíz y (A,B) sólo se visitan de
        paso, no son canónicos.
      mode: tree
      nodes:
        - { id: root, value: "[1,4]", parent: null, state: active }
        - { id: nAB, value: "[1,2]", parent: root, state: active }
        - { id: nCD, value: "[3,4]", parent: root, state: answer, collapsed: true }
        - { id: A, value: 1, parent: nAB, state: muted }
        - { id: B, value: 2, parent: nAB, state: answer }
    - note: >-
        En la raíz, y sólo en la raíz, se hace la única búsqueda binaria
        real: sobre su arreglo de Y ya mezclado [1,4,7,9], localizar
        pa = primer elemento ≥ y1=3 (posición 1, valor 4) y
        pb = primer elemento > y2=8 (posición 3, valor 9). Cuesta O(lg n)
        y no se repite en ningún nodo canónico.
      mode: layers
      arrays:
        - id: root
          label: "raíz [1,4]"
          row: 0
          cells: [1, 4, 7, 9]
          states: [idle, answer, idle, answer]
      caption: "pa = 1, pb = 3"
    - note: >-
        Para llegar al nodo canónico (C,D), se baja por puenteDer de la
        raíz (el mismo que construyó bridge-build): pa=1 y pb=3 se
        traducen en O(1) a pa'=1 y pb'=2 sobre el arreglo de (C,D)=[1,7].
        pb'-pa' = 1 punto: D=(4,7), porque 7 ∈ [3,8].
      mode: layers
      arrays:
        - { id: root, label: "raíz [1,4]", row: 0, cells: [1, 4, 7, 9] }
        - id: nCD
          label: "(C,D) [1,7]"
          row: 1
          slot: right
          cells: [1, 7]
          states: [answer, answer]
      bridges:
        - { from: root, fromIndex: 1, to: nCD, toIndex: 1, active: true }
        - { from: root, fromIndex: 3, to: nCD, toIndex: 2, active: true }
      caption: "aporta pb' − pa' = 1 punto"
    - note: >-
        Hacia (A,B), el mismo puente de la raíz (puenteIzq) traduce
        pa=1, pb=3 a pa''=0, pb''=1 sobre (A,B)=[4,9] en O(1). Pero (A,B)
        no es un nodo canónico completo — sólo la hoja B lo es — así que
        hace falta un segundo descenso.
      mode: layers
      arrays:
        - { id: root, label: "raíz [1,4]", row: 0, cells: [1, 4, 7, 9] }
        - id: nAB
          label: "(A,B) [4,9]"
          row: 1
          slot: left
          cells: [4, 9]
      bridges:
        - { from: root, fromIndex: 1, to: nAB, toIndex: 0, active: true }
        - { from: root, fromIndex: 3, to: nAB, toIndex: 1, active: true }
    - note: >-
        Segundo salto de puente, ahora el propio de (A,B) hacia su hijo
        derecho B: pa''=0, pb''=1 se traducen a pa'''=0, pb'''=0 sobre
        B=[9]. pb'''-pa'''=0: B=(2,9) no aporta, porque 9 ∉ [3,8]. Sigue
        siendo O(1) — el descenso completo en Y nunca volvió a buscar
        binario.
      mode: layers
      arrays:
        - { id: nAB, label: "(A,B) [4,9]", row: 0, cells: [4, 9] }
        - { id: B, label: "B [9]", row: 1, slot: right, cells: [9], states: [muted] }
      bridges:
        - { from: nAB, fromIndex: 0, to: B, toIndex: 0, active: true }
        - { from: nAB, fromIndex: 1, to: B, toIndex: 0, active: true }
      caption: "1 (de D) + 0 (de B) = 1 punto en total, con una sola búsqueda binaria"
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
