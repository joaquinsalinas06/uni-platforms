---
kind: operation
title: Insert-retroactive
order: 3
cppSteps:
  - step-1-timeline.cpp
  - step-2-bridge.cpp
  - step-3-compute-m.cpp
  - step-4-insert-retroactive.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  steps:
    - note: >-
        El ejemplo trabajado del profesor (páginas 60-62): ins(5) en t=1,
        ins(2) en t=2, del-min en t=3 (elimina el mínimo, 2), ins(8) en
        t=4, del-min en t=5 (elimina el mínimo, 5). Estado antes de tocar
        nada.
      caption: "Q_ahora = {8}"
      highlight: ["t5"]
      nodes:
        - { id: t1, value: "ins(5)", parent: null }
        - { id: t2, value: "ins(2)", parent: t1 }
        - { id: t3, value: "del-min -> quita 2", parent: t2 }
        - { id: t4, value: "ins(8)", parent: t3 }
        - { id: t5, value: "del-min -> quita 5", parent: t4 }
    - note: >-
        Se pide Insert(2.5, 'insert(3)'): insertar 3 en el tiempo 2.5,
        entre t=2 y t=3. Compute-M busca el puente más cercano antes de
        2.5 — en esta línea de tiempo es el inicio (no hay puente
        interior, ver Compute-M) — y calcula M = máx({3} ∪ {2, 5}) = 5,
        porque lo eliminado desde t=2.5 es {2, 5}.
      caption: "M = máx({3} ∪ {2, 5}) = 5"
      highlight: ["t2", "t3"]
      nodes:
        - { id: t1, value: "ins(5)", parent: null }
        - { id: t2, value: "ins(2)", parent: t1 }
        - { id: "t2.5", value: "ins(3)", parent: t2, state: active }
        - { id: t3, value: "del-min -> quita 2", parent: "t2.5" }
        - { id: t4, value: "ins(8)", parent: t3 }
        - { id: t5, value: "del-min -> quita 5", parent: t4 }
    - note: >-
        Como M=5 ≠ k=3, el efecto neto es un único intercambio: 5 entra a
        Q_ahora (sobrevive) y 3 toma su lugar entre los eliminados. Toda
        la cascada aparente (revisar si cada del-min posterior cambia de
        víctima) se resuelve sin recorrerla.
      caption: "Q_ahora = {8, 5}"
      highlight: ["t3", "t5"]
      nodes:
        - { id: t1, value: "ins(5)", parent: null }
        - { id: t2, value: "ins(2)", parent: t1 }
        - { id: "t2.5", value: "ins(3)", parent: t2 }
        - { id: t3, value: "del-min -> quita 2", parent: "t2.5" }
        - { id: t4, value: "ins(8)", parent: t3 }
        - { id: t5, value: "del-min -> quita 3", parent: t4 }
---

## Qué hace

Inserta una operación `insert(k)` en el tiempo `t` de la línea de tiempo
retroactiva y actualiza `Q_ahora` con el efecto neto correcto — sin
recorrer las operaciones posteriores.

## Intuición

Es la operación con desarrollo propio del profesor (páginas 50-53): a
pesar de que insertar `k` en el pasado *podría* desplazar en cadena todos
los `del-min` posteriores, el efecto real sobre el presente se reduce a
**un único intercambio**. `k` termina en `Q_ahora`, o reemplaza a
exactamente un elemento entre los ya eliminados — nunca más que eso. Ese
elemento es `M`, calculado con
[Compute-M](/structures/retroactive-priority-queue/operations/compute-m)
usando el [puente](/structures/retroactive-priority-queue/operations/bridge)
más cercano.

## Algoritmo

Fórmula del efecto neto (páginas 52-53):

$$M = \max\big(\, \{k\} \cup \{\, k' : k' \text{ fue eliminado en tiempo} \ge t \,\} \,\big)$$

Se inserta `M` en `Q_ahora`:

- Si $M = k$: `k` era "demasiado grande" para haber sido eliminado por
  ningún `del-min` en el camino — se agrega directo a `Q_ahora`.
- Si $M \ne k$: `M` es el mayor de los eliminados desde `t`; "sobrevive"
  hasta el presente y entra a `Q_ahora`, mientras `k` toma su lugar entre
  los eliminados.

En ambos casos el cambio en `Q_ahora` es agregar exactamente `M` — la
inserción de la operación en la línea de tiempo no exige recalcular nada
más. El costo de la operación completa es entonces el costo de calcular
`M`, que
[Compute-M](/structures/retroactive-priority-queue/operations/compute-m)
resuelve con el puente en vez del recorrido ingenuo $O(r)$.

## Pseudocódigo

El profesor no da un bloque "Algoritmo N" para esta sección (todo el tema
son fórmulas, no pseudocódigo — ver `theory.md`). Lo siguiente traduce
directo la fórmula de arriba:

```
Insert-Retroactivo(t, k, línea_de_tiempo, Q_ahora):
    M ← Compute-M(t, k, Q_ahora)          # usa el puente más cercano
    insertar 'insert(k)' en línea_de_tiempo en el tiempo t
    Q_ahora ← Q_ahora ∪ {M}
    devolver Q_ahora
```

## C++

Ver `step-4-insert-retroactive.cpp` y `full-implementation.cpp` en el
editor de arriba.

## Complejidad temporal

$O(\lg n)$ amortizado — la única cota con nombre propio del tema (páginas
63-64), citada como resultado externo (Demaine, Iacono, Langerman, 2007):
"con la estructura de puentes mantenida sobre un árbol balanceado, Insert
y Delete retroactivos parciales sobre una priority queue cuestan $O(\lg n)$
amortizado". El profesor no demuestra esa cota en el mazo — sólo el
argumento estructural de que el efecto se reduce a calcular `M` una vez
(ver `meta.yaml` para el detalle completo del hueco).

## Complejidad espacial

No la da el profesor.

## Ejemplo

El ejemplo trabajado del profesor (páginas 60-62), completo: sobre
`ins(5), ins(2), del-min, ins(8), del-min` ($Q_{ahora} = \{8\}$), se inserta
`Insert(2.5, 'insert(3)')`. $M = \max(\{3\} \cup \{2, 5\}) = 5$. Como $M \ne 3$, el 5
entra a `Q_ahora` (que pasa a ser $\{8, 5\}$) y el 3 pasa a formar parte del
conjunto de eliminados. Justificación del profesor: "si 3 se hubiera
insertado antes del primer del-min, ese del-min habría eliminado 2 igual
(es el menor), pero el segundo del-min ahora elimina 3 en vez de 5 — y 5
sobrevive." Ver [Ejemplos](/structures/retroactive-priority-queue/examples)
para el detalle paso a paso.

## Casos límite

- **`M = k`**: no hay ningún elemento eliminado desde `t` mayor que `k` —
  `k` entra directo a `Q_ahora` sin desplazar a nadie.
- **Nada eliminado desde `t`**: el conjunto de candidatos de
  [Compute-M](/structures/retroactive-priority-queue/operations/compute-m)
  es vacío, $M = k$ trivialmente (mismo caso que el anterior).
- **`t` antes de toda operación**: se inserta al inicio de la línea de
  tiempo; el puente más cercano es el inicio mismo, y `M` se calcula sobre
  todo lo eliminado en toda la historia.

> **Nota de apoyo** (no está en las diapositivas): el mazo sólo desarrolla
> la inserción retroactiva de un `insert(k)`. Insertar retroactivamente un
> `del-min` (¿en qué tiempo, y qué elimina exactamente?) no aparece en
> ningún lado del material — ni la fórmula ni el ejemplo lo cubren.
