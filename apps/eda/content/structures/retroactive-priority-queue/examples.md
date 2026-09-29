---
kind: examples
title: Ejemplos
---

## Mínimo

*(Derivado; no aparece en las diapositivas)*: una línea de tiempo con una
sola operación, `Insert(1, 'insert(5)')`. $Q_{ahora} = \{5\}$, no hay nada
eliminado en ningún tiempo, así que cualquier inserción retroactiva
posterior tiene $M = k$ siempre (nada que desplazar). El único puente
interior posible es el inicio de la línea de tiempo.

## Normal

El ejemplo trabajado del profesor (páginas 60-62, diapositiva 29) — va
**sin** marca de derivado:

| tiempo | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- |
| operación | ins(5) | ins(2) | del-min | ins(8) | del-min |
| efecto | {5} | {5, 2} | elimina 2 | {5, 8} | elimina 5 |

Estado: $Q_{ahora} = \{8\}$; los eliminados desde $t = 2$: $\{2, 5\}$.

Se inserta retroactivamente `Insert(2,5, 'insert(3)')` — tiempo `2,5`,
"entre los tiempos 2 y 3" (coma decimal española).

Cálculo: $M = \max(\{3\} \cup \{2, 5\}) = 5$. Como $M \ne 3$: se inserta 5 en
`Q_ahora` (que pasa a ser $\{8, 5\}$), y 3 pasa a formar parte del conjunto de
eliminados. Ver el detalle completo en
[Insert-retroactive](/structures/retroactive-priority-queue/operations/insert-retroactive).

## Límite

*(Derivado; no aparece en las diapositivas)*: insertar retroactivamente en
un tiempo `t` **anterior a toda operación existente** (por ejemplo, `t=0`
en el ejemplo de arriba, antes de `ins(5)`). Ahí "lo eliminado desde `t`" es
**toda la línea de tiempo entera** — el caso donde el puente más cercano
antes de `t` es, en el peor caso, el inicio mismo de la línea de tiempo, y
`Compute-M` no tiene ningún puente interior que lo ayude a acotar el
trabajo. Es la estructura que produce el peor caso de la tabla de
complejidad: el cálculo ingenuo de `M`, $O(r)$ con $r = m$ (todas las
operaciones), coincide con lo que costaría el
[método de rollback](/structures/rollback-method) — exactamente lo que el
puente existe para evitar cuando sí hay uno interior más cerca.
