---
kind: examples
title: Ejemplos y casos
---

## Mínimo

Con `H` vacío, `Insert(H, 5)` crea una única raíz.

```text
5
↑ min
```

El nodo es raíz porque no tiene padre; también es el mínimo, tiene grado 0
(ningún hijo) y no está marcado. Si se hace `Extract-Min()`, queda
`minNode = nullptr`: es el caso de heap vacío después de extraer el único
nodo.

## Normal

Esta secuencia muestra por qué Insert y Extract-Min tienen comportamientos
tan distintos.

**Paso 1 — Insertar `2, 9, 7, 3, 1`.** Insert siempre agrega raíces; no une
los nodos todavía.

```text
2    9    7    3    1
                    ↑ min
```

**Paso 2 — `Extract-Min()`.** Se elimina `1`. Como `1` no tiene hijos, no
se promueve ningún nodo. Quedan cuatro raíces de grado 0.

```text
2    9    7    3
```

**Paso 3 — Consolidate.** Se comparan grados, no llaves. Primero se enlazan
las parejas de grado 0; en cada pareja, la menor llave queda como padre.

```text
2 + 9               3 + 7

  2                   3
 /                   /
9                   7
```

Ahora las raíces `2` y `3` tienen grado 1. Se enlazan otra vez:

```text
      2
     / \
    9   3
       /
      7
```

El resultado tiene `min = 2`. Los grados son: `grado(2) = 2`,
`grado(3) = 1`, `grado(9) = 0` y `grado(7) = 0`.

## Casos que conviene reconocer

Una **raíz** no tiene padre. Un **hijo** sí tiene padre. El **grado** de un
nodo es su cantidad de hijos. Una **marca** indica que un nodo que no es raíz
ya perdió un hijo antes.

### ¿Qué operaciones crean raíces?

| Operación | ¿Puede crear una raíz? | Qué ocurre |
| --- | --- | --- |
| Insert | Sí | El nodo nuevo siempre entra como raíz. |
| Cut | Sí | El nodo cortado y todo su subárbol pasan a raíces. |
| Cascading-Cut | Sí, mediante Cut | Cada ancestro marcado que se corta se vuelve raíz. |
| Extract-Min | Sí | Los hijos del mínimo se promueven a raíces. |
| Link | No | Convierte una raíz en hijo de otra. |
| Consolidate | No | Une raíces repetidas por grado; normalmente las reduce. |
| Union | No | Sólo junta listas de raíces que ya existían. |

> **Regla para recordar:** Insert y Cut crean raíces. Extract-Min puede
> promover hijos a raíces. Consolidate y Link reducen raíces; Union sólo las
> reúne.

### ¿Qué pasa si…?

<details>
<summary>Insert recibe una llave menor que el mínimo</summary>

Se agrega como raíz y `minNode` pasa a apuntar al nodo nuevo.
</details>

<details>
<summary>Insert recibe una llave mayor que el mínimo</summary>

También se agrega como raíz, pero `minNode` no cambia. Insert nunca crea un hijo.
</details>

<details>
<summary>Union recibe un heap vacío</summary>

Si uno está vacío, el otro se conserva tal cual. Si ambos están vacíos, el resultado sigue vacío. Nunca se ejecuta Consolidate durante Union.
</details>

<details>
<summary>Decrease-Key no rompe la relación con el padre</summary>

El nodo sigue siendo hijo. No hay Cut ni Cascading-Cut.
</details>

<details>
<summary>Decrease-Key deja una llave menor que la del padre</summary>

Se viola el orden de min-heap, así que se hace Cut. El nodo pasa a ser una nueva raíz.
</details>

<details>
<summary>Decrease-Key se aplica a una raíz</summary>

No hay padre con el que pueda romperse el orden. Sólo se actualiza la llave y, si corresponde, `minNode`.
</details>

<details>
<summary>Un nodo no raíz pierde su primer hijo</summary>

Se marca. Todavía no se corta: la marca registra esa primera pérdida.
</details>

<details>
<summary>Un nodo marcado pierde otro hijo</summary>

Se corta y se vuelve raíz. Si su padre ya estaba marcado, la revisión continúa hacia arriba: eso es Cascading-Cut.
</details>

<details>
<summary>La cascada llega a una raíz</summary>

Termina. Las raíces no se marcan porque no tienen padre que pueda perderlas como hijo.
</details>

<details>
<summary>Extract-Min elimina un mínimo sin hijos</summary>

Se quita el mínimo y se ejecuta Consolidate sobre las raíces restantes, salvo que el heap quede vacío.
</details>

<details>
<summary>Extract-Min elimina un mínimo con hijos</summary>

Sus hijos pasan a ser raíces con `parent = nullptr` y `mark = false`; luego participan en Consolidate.
</details>

<details>
<summary>Dos raíces tienen grados distintos</summary>

Consolidate no las une. La llave no importa para decidir si hay Link; primero deben coincidir los grados.
</details>

<details>
<summary>Dos raíces tienen el mismo grado</summary>

Se hace Link. La raíz con menor llave queda como padre y la otra se vuelve su hijo sin marca.
</details>

<details>
<summary>Un Link genera otro grado repetido</summary>

Consolidate vuelve a enlazar mientras encuentre dos raíces con el mismo grado. Puede terminar con varios árboles, siempre que sus raíces tengan grados distintos.
</details>

## Límite

Un corte no fragmenta el subárbol del nodo cortado. Si `8` es hijo de `5` y
`8` tiene hijos `12` y `14`, `Cut(8, 5)` conserva completo el árbol de `8`:

```text
Antes                 Después
  5                     5       8
 /                             / \
8                            12  14
/ \
12 14
```

Por eso Cut puede convertir a `8` en raíz sin convertir también a `12` y `14`
en raíces. Para ver cada decisión con más detalle, consulta
[Insert](/structures/fibonacci-heap/operations/insert),
[Decrease-Key](/structures/fibonacci-heap/operations/decrease-key),
[Cut](/structures/fibonacci-heap/operations/cut),
[Cascading-Cut](/structures/fibonacci-heap/operations/cascading-cut),
[Extract-Min](/structures/fibonacci-heap/operations/extract-min) y
[Consolidate](/structures/fibonacci-heap/operations/consolidate).
