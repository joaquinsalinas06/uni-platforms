---
kind: operation
title: Consulta de rango 1D
order: 3
cppSteps:
  - step-1-point.cpp
  - step-2-build-1d.cpp
  - step-3-predecessor-successor.cpp
  - step-4-range-query-1d.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  steps:
    - note: >-
        Reproduce la diapositiva #35: consulta [l1,r1] = [5,16] sobre el
        árbol de build-1d. Primer paso: calcular los delimitadores con
        predecessor-successor. Predecessor(5)=hoja 4, Successor(16)=hoja 18
        — ambos FUERA del rango: son los delimitadores (amarillo en el
        diagrama del profesor, aquí `state: marked`).
      highlight: [l4, l18]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4 }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        P = LCA(hoja 4, hoja 18) = la raíz (9): los caminos hacia las dos
        hojas delimitadoras ya se separan en el primer paso (izquierda hacia
        4, derecha hacia 18). Desde aquí se recorren los dos caminos por
        separado.
      highlight: [r9]
      nodes:
        - { id: r9, value: 9, parent: null, state: active }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4 }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Camino izquierdo (hacia la hoja 4): en el nodo 4 el camino dobla a
        la izquierda (hacia el 3, donde está la hoja 4); el hermano derecho
        no visitado, nodo 7, queda ENTERO dentro de [5,16] (cubre las hojas
        7 y 9) — se agrega como subárbol canónico de la respuesta (rojo en
        el diagrama del profesor, aquí `state: answer`).
      highlight: [n4, n7i]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9, state: active }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: answer }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        En el nodo 3, el camino dobla a la derecha (hacia la hoja 4): el
        hermano izquierdo, hoja 3, queda fuera de [5,16] y no se agrega.
        Se llega a la hoja 4 — el delimitador izquierdo, que sigue excluido.
      highlight: [n3i, l4]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4, state: active }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: answer }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15 }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Camino derecho (hacia la hoja 18), simétrico: en el nodo 15 el
        camino dobla a la derecha (hacia el 18); el hermano izquierdo no
        visitado, nodo 13, queda ENTERO dentro de [5,16] (cubre las hojas
        13 y 15) — segundo subárbol canónico de la respuesta.
      highlight: [n15, n13i]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: answer }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9, state: active }
        - { id: n13i, value: 13, parent: n15, state: answer }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        En el nodo 18, el camino dobla a la izquierda (hacia la hoja 18): el
        hermano derecho, hoja 27, queda fuera de [5,16] y no se agrega. Se
        llega a la hoja 18 — el delimitador derecho, excluido. Respuesta
        final: subárboles canónicos {7, 13} = hojas {7, 9, 13, 15}, exactamente
        los puntos de [5,16].
      highlight: [n18i, l18]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: answer }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15, state: answer }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15, state: active }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
---

## Qué hace

Dado `[l1, r1]`, encuentra la unión mínima de subárboles completos —los
**subárboles canónicos**— cuyas hojas son exactamente los puntos en
`[l1, r1]`. Es la base de la que se construyen
[existencia/conteo](/structures/range-tree/operations/existence-count) y
[enumeración](/structures/range-tree/operations/enumeration): ninguna de
esas operaciones vuelve a tocar el árbol completo, sólo estos subárboles.

## Intuición

La descomposición canónica evita visitar hoja por hoja. La idea (diapositiva
#35, con `[5,16]`): calcular primero las dos hojas frontera —
[Predecessor(l1) y Successor(r1)](/structures/range-tree/operations/predecessor-successor) —
que quedan **fuera** del rango por construcción. `P`, el ancestro común más
bajo de esas dos hojas, es donde el camino se separa en dos: uno hacia cada
frontera. Al bajar por cada camino, cada vez que el camino se desvía hacia
un lado, el subárbol hermano del otro lado queda **enteramente** dentro del
rango (porque está acotado por el mismo `P` del lado correcto) — y se
agrega de una sola vez, sin mirar sus hojas.

> **Nota de apoyo** (no está en las diapositivas): en el diagrama de abajo, un
> nodo con `state: answer` representa su **subárbol entero** aunque se dibuje
> igual que cualquier otro nodo — la familia de visualización `range-tree` no
> soporta dibujar un subárbol como triángulo colapsado (eso sólo existe en la
> familia `tree`). Fíjate en el relleno (losa llena), no en la forma: cuando
> ves `answer` en el nodo 7 o en el nodo 13, léelo como "todas las hojas
> debajo de este nodo entraron a la respuesta de una sola vez", no como una
> clave suelta.

## Algoritmo

*(Derivado; el mazo describe el mecanismo en #33-34 pero no da
pseudocódigo — "ninguno" en todo el deck.)*

1. `d_l ← Predecessor(l1)`, `d_r ← Successor(r1)` (hojas, ambas fuera de
   `[l1, r1]` si el rango no es todo el universo de llaves).
2. `P ← LCA(d_l, d_r)`.
3. Si `P` es hoja: comprobar si `P` está en `[l1, r1]` y devolverla o no.
4. Si no, caminar desde `P` hacia `d_l`: en cada nodo del camino (excepto
   `P`), si el paso dobla a la **izquierda**, agregar el **subárbol
   derecho** no visitado a la respuesta.
5. Simétrico hacia `d_r`: en cada nodo del camino (excepto `P`), si el paso
   dobla a la **derecha**, agregar el **subárbol izquierdo** no visitado.
6. `d_l` y `d_r` nunca se agregan: están fuera del rango por construcción.

## Pseudocódigo

```
RangeQuery1D(raiz, l1, r1)                       // derivado
d_l ← Predecessor(l1); d_r ← Successor(r1)
P ← LCA(d_l, d_r)
respuesta ← []
si P es hoja
    si l1 ≤ P.llave ≤ r1: respuesta.agregar(P)
si no
    v ← hijo_hacia(P, d_l)
    mientras v no es hoja
        si el camino hacia d_l dobla a la izquierda en v
            respuesta.agregar(hijo_derecho(v))    // subárbol canónico
            v ← hijo_izquierdo(v)
        si no
            v ← hijo_derecho(v)
    v ← hijo_hacia(P, d_r)
    mientras v no es hoja
        si el camino hacia d_r dobla a la derecha en v
            respuesta.agregar(hijo_izquierdo(v))   // subárbol canónico
            v ← hijo_derecho(v)
        si no
            v ← hijo_izquierdo(v)
devolver respuesta   // lista de O(log n) subárboles canónicos disjuntos
```

## C++

Ver `step-4-range-query-1d.cpp` y `full-implementation.cpp` en el editor
de arriba.

## Complejidad temporal

$O(\log n)$ para producir la lista de subárboles (dos caminos de altura
$O(\log n)$, sumando $O(\log n)$ subárboles canónicos en total,
Sem4_Orthogonal_Range_Search.pdf#20,33-34); usarla para existencia, conteo
o enumeración agrega $O(1)$, $O(1)$ u $O(k)$ respectivamente por
[existence-count](/structures/range-tree/operations/existence-count) y
[enumeration](/structures/range-tree/operations/enumeration).

## Complejidad espacial

$O(\log n)$ para la lista de subárboles canónicos devuelta (no se copian
hojas, sólo referencias a las raíces de esos subárboles).

## Ejemplo

Ver la visualización de arriba: `[5,16]` sobre el árbol de build-1d da los
subárboles canónicos `{7, 13}` (hojas 7, 9, 13, 15), con delimitadores 4 y
18 excluidos — exactamente la diapositiva #35.

## Casos límite

- **`l1` o `r1` coincide con una hoja exacta**: esa hoja debe **incluirse**
  en la respuesta (el rango es cerrado, `[l1,r1]`); el cálculo de
  Predecessor/Successor debe tratarla como el límite dentro del rango, no
  como delimitador excluido — es justo el "off-by-one clásico" que señala
  el análisis de la fuente.
- **Rango vacío de resultados** (`l1 > r1`, o ningún punto cae dentro):
  `P` puede terminar siendo una hoja fuera de rango o el camino no agrega
  ningún subárbol; la respuesta es la lista vacía.
- **Rango que cubre todo el árbol**: `P` es la raíz y ambos caminos
  degeneran de inmediato (Predecessor/Successor no existen), la raíz misma
  es el único subárbol canónico.
