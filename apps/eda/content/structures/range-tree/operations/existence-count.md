---
kind: operation
title: Existencia / Conteo
order: 4
cppSteps:
  - step-1-point.cpp
  - step-2-build-1d.cpp
  - step-3-predecessor-successor.cpp
  - step-4-range-query-1d.cpp
  - step-5-existence-count.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  steps:
    - note: >-
        Partimos del resultado de range-query-1d para [5,16]: subárboles
        canónicos {7, 13} (hojas 7, 9, 13, 15), con los delimitadores 4 y
        18 fuera del rango. Existencia y conteo no vuelven a tocar el
        árbol completo — sólo usan esta lista de O(log n) subárboles.
      highlight: [n7i, n13i]
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
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Subárbol canónico 7: su contador ya guardado vale 2 (número de
        hojas de su propio subárbol, 7 y 9) — se lee en O(1), sin bajar a
        ninguna hoja.
      highlight: [n7i]
      nodes:
        - { id: r9, value: 9, parent: null }
        - { id: n4, value: 4, parent: r9 }
        - { id: n3i, value: 3, parent: n4 }
        - { id: l3, value: 3, parent: n3i }
        - { id: l4, value: 4, parent: n3i, state: marked }
        - { id: n7i, value: 7, parent: n4, state: active }
        - { id: l7, value: 7, parent: n7i }
        - { id: l9, value: 9, parent: n7i }
        - { id: n15, value: 15, parent: r9 }
        - { id: n13i, value: 13, parent: n15, state: answer }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Subárbol canónico 13: contador = 2 (hojas 13 y 15).
      highlight: [n13i]
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
        - { id: n13i, value: 13, parent: n15, state: active }
        - { id: l13, value: 13, parent: n13i }
        - { id: l15, value: 15, parent: n13i }
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
    - note: >-
        Sumar los contadores de los O(log n) subárboles da el conteo
        total: 2 + 2 = 4.
      highlight: [n7i, n13i]
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
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
      caption: "conteo([5,16]) = 2 + 2 = 4"
    - note: >-
        Para existencia basta con que la lista de subárboles canónicos no
        esté vacía — no hace falta ni sumar los contadores: existe([5,16])
        = verdadero.
      highlight: [n7i, n13i]
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
        - { id: n18i, value: 18, parent: n15 }
        - { id: l18, value: 18, parent: n18i, state: marked }
        - { id: l27, value: 27, parent: n18i }
      caption: "existe([5,16]) = verdadero"
    - note: >-
        Contraste: si el rango no tuviera ningún punto dentro (por ejemplo
        [100,200], fuera de toda hoja), range-query-1d no devolvería
        ningún subárbol canónico — conteo = 0, existe = falso, sin marcar
        ningún nodo.
      highlight: []
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
      caption: "conteo([100,200]) = 0, existe([100,200]) = falso"
---

## Qué hace

Responde "¿existe algún punto en `[l1, r1]`?" y "¿cuántos puntos hay en
`[l1, r1]`?" (Sem4_Orthogonal_Range_Search.pdf#14-15,37) sin enumerar los
puntos uno por uno.

## Intuición

Cada nodo del árbol guarda la cantidad de hojas de su subárbol
(Sem4_Orthogonal_Range_Search.pdf#37). [range-query-1d](/structures/range-tree/operations/range-query-1d)
ya entrega los subárboles canónicos como unidades completas y disjuntas:
sumar sus contadores da el conteo total sin bajar a ninguna hoja; y basta
con que la suma sea mayor que cero (o que la lista de subárboles no esté
vacía) para responder existencia.

## Algoritmo

*(Derivado; el profesor sólo da la idea de anotar contadores en #37, sin
pseudocódigo.)*

1. `subarboles ← RangeQuery1D(raiz, l1, r1)` (ver
   [range-query-1d](/structures/range-tree/operations/range-query-1d)).
2. **Existencia**: devolver $\text{subarboles} \ne \emptyset$.
3. **Conteo**: devolver $\sum \text{contador}(s)$ para cada `s` en `subarboles`.

## Pseudocódigo

```
Existe(raiz, l1, r1)                              // derivado
devolver RangeQuery1D(raiz, l1, r1) ≠ ∅

Contar(raiz, l1, r1)                              // derivado
total ← 0
para cada s en RangeQuery1D(raiz, l1, r1)
    total ← total + s.contador
devolver total
```

## C++

Ver `step-5-existence-count.cpp` y `full-implementation.cpp` en el editor
de arriba.

## Complejidad temporal

$O(\log n)$: la lista de subárboles canónicos ya cuesta $O(\log n)$
([range-query-1d](/structures/range-tree/operations/range-query-1d)), y
sumar o comparar sus $O(\log n)$ contadores es $O(1)$ por subárbol
(Sem4_Orthogonal_Range_Search.pdf#37) — nunca se toca una hoja.

## Complejidad espacial

$O(1)$ adicional más allá de la lista de subárboles de la consulta.

## Ejemplo

*(Derivado sobre el ejemplo de
[range-query-1d](/structures/range-tree/operations/range-query-1d).)*
Para `[5,16]`: subárboles canónicos `{7, 13}`, cada uno con contador 2
(cubren 2 hojas) → conteo total = 4 (las hojas 7, 9, 13, 15); existencia =
verdadero.

## Casos límite

- **Ningún subárbol canónico** (rango sin puntos): conteo = 0, existencia
  = falso.
- **Un solo punto en el rango**: la descomposición puede terminar en una
  única hoja con contador 1 (caso base de
  [range-query-1d](/structures/range-tree/operations/range-query-1d) donde
  `P` es hoja).
- **Todo el árbol**: un único subárbol canónico (la raíz) con contador n.
