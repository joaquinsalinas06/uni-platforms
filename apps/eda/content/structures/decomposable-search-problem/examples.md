---
kind: examples
title: Ejemplos
---

## Mínimo

Los cuatro ejemplos de `f` que sí da el profesor (página 32-33), sin ninguna
instancia numérica en el mazo — son ejemplos "de clase de operación", no
trazas:

| problema | `f` |
| --- | --- |
| Mínimo de `S` | `mín` |
| Máximo de `S` | `máx` |
| Suma de `S` | `+` |
| ¿Existe un elemento con propiedad `P` en `S`? | `∨` (o lógico) |

El caso más pequeño donde el árbol hace algo distinto al caso general es
`m = 1`: una sola operación en la línea de tiempo. El segment tree es una
única hoja, `Update` no toca ningún nodo intermedio y `Query` en ese único
instante devuelve directamente el valor de la hoja — no hay overhead
$O(\lg m)$ que pagar porque $\lg 1 = 0$.

## Normal

*(Derivado del pseudocódigo de la construcción; no aparece en las
diapositivas — el mazo no trae ninguna instancia con valores.)* Se usa
`f = +` (suma), el ejemplo más simple de la lista, sobre `m = 4` franjas de
tiempo `t = 1, 2, 3, 4`, inicialmente vacías (`0` en cada hoja — el neutro de
`+`). Es el mismo árbol de 4 hojas de [segment-tree](/structures/segment-tree#estructura-interna),
reinterpretando cada rango como un rango de **tiempo**, no de arreglo:

```
            [1,4]
           /      \
       [1,2]      [3,4]
       /   \        /  \
   [1,1] [2,2]  [3,3] [4,4]
```

1. `Insert(t=2, op)` con efecto `+5`: es un `Update` de segment tree en la
   posición 2. Camino `[1,4] → [1,2] → [2,2]`: se escribe `5` en `[2,2]`, se
   recalcula `[1,2] = 0 + 5 = 5`, se recalcula `[1,4] = 5 + 0 = 5`. Dos
   nodos intermedios tocados ($\lceil \lg 4 \rceil = 2$), como anuncia la cota.
2. `Query(t=1)`: el rango de consulta es `[1,1]` (todo lo que pasó hasta el
   instante 1). El nodo `[1,1]` cae completamente dentro, se devuelve su
   valor sin bajar al subárbol de `[2,2]`: resultado `0`. La operación
   insertada en `t=2` **no afectó** esta consulta — es el instante anterior a
   su inserción.
3. `Query(t=3)`: el rango es `[1,3]`, que se descompone en los nodos
   canónicos `[1,2]` (completamente dentro, valor `5`) y `[3,3]`
   (completamente dentro, valor `0`): resultado `5 + 0 = 5`. Esta consulta
   **sí** ve la operación insertada en `t=2`, porque `2 ≤ 3`.
4. `Delete(t=2)`: otro `Update`, esta vez escribiendo `0` en `[2,2]` (el
   inverso de haber insertado `5`). Recalcula `[1,2] = 0`, `[1,4] = 0`.
   Repetir `Query(t=3)` ahora da `0`: la operación salió de todas las
   consultas que antes la veían, sin tocar `Query(t=1)` (que ya no la veía
   de todas formas).

## Límite

El caso patológico no es de tamaño, es de **aplicabilidad**: `Delete-Min`
sobre una priority queue. El profesor lo señala explícitamente como el
límite de este método (página 47): "`Delete-Min` no es un problema
descomponible simple". La razón: no existe una `f` en $O(1)$ que combine
"el mínimo de `A`" y "el mínimo de `B`" una vez que una de las dos mitades ya
extrajo su mínimo — la respuesta depende de **qué otros elementos quedan**
en cada mitad, no sólo del resultado agregado de cada una. Ver la operación
[Decomposability](/structures/decomposable-search-problem/operations/decomposability#casos-límite)
para el contraejemplo completo. La estructura que sí resuelve retroactividad
para este caso es [retroactive-priority-queue](/structures/retroactive-priority-queue),
con una técnica dedicada — no la reducción genérica de este tema.
