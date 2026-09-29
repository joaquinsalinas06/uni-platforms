# Implementaciones de C++ que el usuario ya escribió

Fuente: `/Users/joaquins/uni/26-2/eda/heaps/` y `/Users/joaquins/uni/26-2/eda/persistencia:temporal/`
(fuera del repo de la plataforma).

Estas son implementaciones **reales del curso**, escritas por el usuario. Cuando un
subagente genere `cpp/structures/<id>/`, debe partir de estas y no reinventar la rueda:
el estilo, los nombres y las decisiones de diseño ya están fijados aquí.

## Heaps binarios

| archivo | qué es | notas |
| --- | --- | --- |
| `heaps/heaps.cpp` | `MaxHeap` sobre `vector<int>` **1-indexado** (`vals[0]` centinela) | `push` con sift-up, `heapify` con sift-down. La versión didáctica. |
| `heaps/poss.cpp` | `MinHeap`, misma forma, `long long` | Mismo esqueleto, comparador invertido. |
| `heaps/heaps-1.cpp` | `BinaryHeap` **0-indexado** sobre `int*` crudo | Construcción bottom-up en el constructor (`for i = parent(size-1) … max_heapify(i)`). Tiene `print()` y `#define debug`. Es la variante que muestra build-heap en O(n). |
| `heaps/army.cpp`, `heaps/D_ejercito_supremo.cpp` | `MaxHeap` + problema de competencia | Reusan el mismo esqueleto de `heaps.cpp`. |
| `heaps/B_dijkstra.cpp` | `MinHeap` de `HeapEntry{distance, vertex}` → Dijkstra | El heap como cola de prioridad aplicada. Útil para la sección "usedBy". |

Hay dos convenciones de indexación conviviendo (1-indexado en `heaps.cpp`, 0-indexado en
`heaps-1.cpp`). **Hay que elegir una para la plataforma** — ver preguntas abajo.

## Pairing heap

| archivo | qué es | notas |
| --- | --- | --- |
| `persistencia:temporal/pairing_heap_aichac.cpp` | `PairingHeap` con `Node{key, id, child, sibling, prev}` y punteros | 159 líneas. Desempate por `id` cuando las claves empatan. `merge` enlaza al perdedor como primer hijo del ganador. Es la versión legible. |
| `heaps/pairing_heap.cpp` | El mismo pairing heap pero con **arrays planos** (`ky`, `ch`, `nx`, `pv`) y lectura rápida por `fread` | 124 líneas. Versión optimizada para competencia; ilegible como material didáctico, pero sirve para una sección "cómo se ve esto cuando importa el rendimiento". |

## Range tree 2D con fractional cascading

| archivo | qué es |
| --- | --- |
| `persistencia:temporal/range_tree_aichac.cpp` | `RangeTree2D` — segment tree sobre `x` + listas de `y` ordenadas + `leftPositions`/`rightPositions` (punteros de cascading). 173 líneas, **comentado en español y muy legible**. |
| `persistencia:temporal/CS3014___Proyecto_2_2s2026.md` | Enunciado del Proyecto 2: "Efecto cascada". Pide range tree 2D con consulta `O(log n)` en vez de `O(log² n)`. n, q ≤ 3·10⁵. Entrega 18 de septiembre 2026. |
| `persistencia:temporal/reporte.md` | El reporte del usuario: diseño, correctitud y análisis de complejidad. **Explica el centinela de los arreglos de cascading y por qué la construcción usa dos punteros en vez de `lower_bound` por elemento.** |

`reporte.md` es, de hecho, contenido de teoría ya escrito: cuando toque generar
`range-tree-2d`, hay que partir de ahí, no de cero.

## Qué hay que decidir antes de generar `cpp/structures/`

1. **Indexación de los heaps**: ¿1-indexado (`heaps.cpp`, aritmética `i/2`, `2i`, `2i+1`
   limpia) o 0-indexado (`heaps-1.cpp`, lo que usa el profesor en las diapositivas)?
   Depende de lo que digan las PPTs — lo confirman los agentes de ingesta.
2. **Max-heap o min-heap como caso base** del material. El usuario tiene ambos.
3. **Pairing heap**: ¿se enseña la versión con punteros (legible) y se menciona la de
   arrays planos como optimización, o sólo una?
