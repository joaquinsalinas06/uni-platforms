---
kind: theory
title: Segment tree
visualization:
  type: tree
  steps:
    - note: >-
        La raíz representa el rango completo [1,4] del arreglo — todavía no
        se ha partido en nada.
      highlight: ["n14"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null, state: active }
    - note: >-
        Cada nodo se parte en dos mitades del mismo tamaño: m = (1+4)/2 = 2
        da los hijos [1,2] y [3,4]. Partir siempre a la mitad — nunca en
        cualquier punto — es lo que garantiza altura ⌈lg n⌉.
      highlight: ["n12", "n34"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14, state: active }
        - { id: n34, value: "[3,4]", parent: n14, state: active }
    - note: >-
        [1,2] se parte igual: m = 1, da las hojas [1,1] y [2,2]. Un rango de
        un solo elemento ya no se parte más — es una hoja.
      highlight: ["n11", "n22"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14, state: active }
        - { id: n34, value: "[3,4]", parent: n14 }
        - { id: n11, value: "[1,1]", parent: n12, state: active }
        - { id: n22, value: "[2,2]", parent: n12, state: active }
    - note: >-
        Lo mismo para [3,4]: m = 3, hojas [3,3] y [4,4]. Con las cuatro hojas
        completas, la forma queda fija: 2n-1 = 7 nodos (4 hojas + 3 internos)
        y altura ⌈lg 4⌉ = 2, sin importar los valores que guarde cada uno.
      highlight: ["n33", "n44"]
      nodes:
        - { id: n14, value: "[1,4]", parent: null }
        - { id: n12, value: "[1,2]", parent: n14 }
        - { id: n34, value: "[3,4]", parent: n14, state: active }
        - { id: n11, value: "[1,1]", parent: n12 }
        - { id: n22, value: "[2,2]", parent: n12 }
        - { id: n33, value: "[3,3]", parent: n34, state: active }
        - { id: n44, value: "[4,4]", parent: n34, state: active }
    - note: >-
        Cada hoja guarda directo el valor de su posición — valor(hoja_i) =
        A[i] — con A = [1,2,3,4]. Los nodos internos [1,2], [3,4] y [1,4]
        todavía no tienen valor: dependen de sus hijos.
      highlight: ["n11", "n22", "n33", "n44"]
      nodes:
        - { id: n14, value: "?", parent: null, state: muted }
        - { id: n12, value: "?", parent: n14, state: muted }
        - { id: n34, value: "?", parent: n14, state: muted }
        - { id: n11, value: "1", parent: n12 }
        - { id: n22, value: "2", parent: n12 }
        - { id: n33, value: "3", parent: n34 }
        - { id: n44, value: "4", parent: n34 }
    - note: >-
        El invariante combina de abajo hacia arriba — valor(nodo) =
        combinar(valor(hijo_izq), valor(hijo_der)) — con combinar = suma:
        valor([1,2]) = 1+2 = 3, valor([3,4]) = 3+4 = 7, valor([1,4]) = 3+7 =
        10. La raíz ya tiene la respuesta de todo el arreglo sin recorrerlo.
      highlight: ["n14", "n12", "n34"]
      nodes:
        - { id: n14, value: "10", parent: null, state: active }
        - { id: n12, value: "3", parent: n14 }
        - { id: n34, value: "7", parent: n14 }
        - { id: n11, value: "1", parent: n12 }
        - { id: n22, value: "2", parent: n12 }
        - { id: n33, value: "3", parent: n34 }
        - { id: n44, value: "4", parent: n34 }
---

> **Concepto de apoyo, no material del curso.** El profesor nunca explica el
> segment tree en ninguna diapositiva (`sourceSlides` está vacío en el
> knowledge map) — lo usa como pieza ya conocida en las semanas 3, 4 y 5. Esta
> página es el andamio mínimo para entender esos tres usos, no un tutorial
> general de segment trees. Todo lo que sigue es derivación estándar, no una
> cita del profesor.

## ¿Qué problema resuelve?

Mantener un arreglo `A[1..n]` bajo dos operaciones que compiten entre sí:
cambiar un valor (`update`) y combinar un rango de valores con una función
asociativa como suma, mínimo o máximo (`query`). Un arreglo plano hace una de
las dos en $O(1)$ y la otra en $O(n)$; el segment tree hace ambas en $O(\lg n)$.

Esto es exactamente lo que el curso necesita en tres sitios que **no**
enseñan el segment tree, sólo lo usan:

- **Persistencia (path copying)**: el segment tree es el ejemplo que usa el
  profesor para mostrar path copying, porque su `update` sólo toca un camino
  raíz-hoja — el mínimo posible para hacerlo persistente por copia.
- **Retroactividad (problemas de búsqueda descomponibles)**: se construye un
  segment tree **sobre el eje del tiempo** (cada hoja es un instante, no un
  valor de datos) para dar retroactividad completa con overhead $O(\lg m)$.
- **Barrido de segmentos (localización de puntos)**: se nombra, junto al
  Fenwick tree, como solución del caso simple (segmentos horizontales y
  verticales sin intersecciones de la misma orientación) en $O(n \lg n)$.

## Intuición

Un árbol binario donde cada nodo representa un rango `[l, r]` del arreglo: la
raíz representa todo `[1, n]`, cada nodo interno se parte en dos mitades
(hijo izquierdo `[l, m]`, hijo derecho `[m+1, r]`) y las hojas son los rangos
de un solo elemento `[i, i]`. Cada nodo guarda el resultado combinado de su
rango, así que la raíz siempre tiene la respuesta para todo el arreglo sin
tener que recorrerlo.

## Estructura interna

Cada nodo guarda:

- el rango `[l, r]` que representa (implícito por la posición del nodo, no
  necesita almacenarse si se pasa por parámetro),
- `valor`: el resultado de combinar `A[l..r]` con la función elegida (suma,
  mínimo, máximo — cualquier función asociativa),
- dos hijos (o ninguno, si es hoja).

Invariante: `valor(nodo) = combinar(valor(hijo_izq), valor(hijo_der))` para
todo nodo interno, y `valor(hoja_i) = A[i]`. Está formulado así — combinación
local de dos hijos, no recálculo global — porque es lo único que `update`
necesita rehacer en cada nodo del camino: $O(1)$ por nodo, no $O(n)$.

Para 4 hojas, el árbol que reutiliza `path-copying` y `decomposable-search-problem`:

```
            [1,4]
           /      \
       [1,2]      [3,4]
       /   \        /  \
   [1,1] [2,2]  [3,3] [4,4]
```

## Operaciones

- [Build](/structures/segment-tree/operations/build) — construye el árbol
  desde un arreglo inicial.
- [Update](/structures/segment-tree/operations/update) — cambia el valor de
  una posición y recalcula su camino hasta la raíz. Es la operación que
  `path-copying` reusa tal cual para hacerse persistente.
- [Query](/structures/segment-tree/operations/query) — combina un rango
  `[l, r]` arbitrario descomponiéndolo en nodos del árbol.

## Análisis de complejidad

No hay un estilo del profesor que seguir aquí (no hay diapositivas). El
razonamiento es el estándar de la literatura, por conteo estructural:

- **Build**: el árbol tiene exactamente $2n-1$ nodos ($n$ hojas, $n-1$ internos
  para un arreglo de tamaño $n$); construirlo visita cada nodo una vez, $O(1)$
  de trabajo por nodo → $O(n)$ total.
- **Update**: sólo el camino raíz-hoja de la posición modificada cambia — a lo
  más $\lceil \lg n \rceil$ nodos, uno por nivel — y cada uno se recalcula en
  $O(1)$ desde sus hijos → $O(\lg n)$.
- **Query**: un rango arbitrario se descompone en a lo más $O(\lg n)$ nodos
  "canónicos" (completamente dentro del rango); el argumento estándar es que
  en cada nivel de la recursión a lo más dos llamadas siguen siendo "parciales"
  (una por cada extremo del rango), el resto termina en $O(1)$ → $O(\lg n)$
  niveles × $O(1)$ por nivel.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`. Aquí, a diferencia de las estructuras
que sí vienen del profesor, se omite `source` en cada entrada porque no hay
diapositiva que citar — el `reasoning` deja explícito que es derivación
estándar.

## Ejemplos

Ver [Ejemplos](/structures/segment-tree/examples).

## Comparación con estructuras relacionadas

| | Update | Query de rango |
| --- | --- | --- |
| Arreglo plano | $O(1)$ | $O(n)$ |
| Segment tree | $O(\lg n)$ | $O(\lg n)$ |
| Fenwick tree (usado en semana 4 como alternativa para el caso de suma/conteo) | $O(\lg n)$ | $O(\lg n)$ |

El Fenwick tree hace lo mismo con menos memoria pero sólo para funciones
invertibles (suma); el segment tree soporta cualquier función asociativa
(incluye mínimo y máximo), que es lo que necesita retroactividad para una
función de combinación general.

## Prueba de dominio

Ver [Prueba de dominio](/structures/segment-tree/mastery-check).
