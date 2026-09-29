---
kind: operation
title: Insert
order: 4
cppSteps:
  - step-1-node.cpp
  - step-2-structure.cpp
  - step-3-binomial-link.cpp
  - step-4-find-min.cpp
  - step-5-union.cpp
  - step-6-insert.cpp
  - full-implementation.cpp
---

## Qué hace

Agrega una llave nueva al montículo.

## Intuición

No hace falta un algoritmo aparte: un nodo nuevo, solo, es un $B_0$ válido.
Insertarlo es unir ese $B_0$ al montículo existente con
[Union](/structures/binomial-heap/operations/union) — la misma "suma
binaria con acarreo" de siempre, sólo que uno de los dos sumandos siempre
vale 1.

## Algoritmo

Crear un montículo de un solo nodo (el nuevo $B_0$) y llamar
`Union(H, {x})`.

## Pseudocódigo

```
Insert(H, x)
H' ← montículo binomial con el único nodo x (un B0) ;
devolver Union(H, H') ;
```

(El profesor no da pseudocódigo propio para Insert — página 50, diapositiva
23— más allá de decir "Insert(H, x) es apenas un caso particular:
Union(H, {x}), con x como un $B_0$ nuevo". La versión de arriba es esa misma
frase en formato de algoritmo.)

## C++

Ver `cpp/structures/binomial-heap/step-6-insert.cpp`: `insert` crea un
`Node` suelto y llama `heapUnion`.

## Complejidad temporal

Peor caso $O(\lg n)$, heredado de Union. Pero el análisis agregado del
profesor (diapositivas 24-25, "Bono: Insert es $O(1)$ amortizado") muestra
algo más fino: es la misma cuenta que decir cuántas veces cambia cada bit
en $n$ incrementos consecutivos de un contador binario de $b$ bits — el bit
$i$ cambia a lo mucho $\lceil n / 2^i \rceil$ veces, y sumando sobre todos
los bits,

$$\sum_{i=0}^{b-1} \left\lceil \frac{n}{2^i} \right\rceil < 2n$$

Repartido entre las $n$ operaciones, el costo **amortizado** de cada Insert
es $O(1)$, aunque un Insert individual pueda costar $O(\lg n)$ si dispara
una cadena larga de acarreos.

## Complejidad espacial

$O(1)$ adicional por el nodo nuevo; el resto es la reconexión de Union.

## Ejemplo

Insertar sucesivamente 5, 2, 9 en un montículo vacío: cada inserción es una
Union con un $B_0$. Insertar 5 deja un único $B_0$. Insertar 2 fuerza un
acarreo: los dos $B_0$ (5 y 2) se combinan en un $B_1$ con raíz 2 e hijo 5
(porque $2 \le 5$). Insertar 9 no encuentra ningún $B_0$ con quien fundirse
(el montículo ya sólo tiene el $B_1$), así que 9 se queda como raíz suelta:
el montículo final tiene dos árboles, un $B_0$ (9) y un $B_1$ (raíz 2, hijo
5) — tres nodos, $11_2$. (Derivado a mano; el mazo no trae esta traza.)

## Casos límite

- Insertar en un montículo vacío: `Union(∅, {x})` devuelve simplemente `{x}`
  como único $B_0$ — no hay ningún acarreo que propagar.
- Insertar cuando el montículo ya tiene una cadena larga de árboles
  consecutivos del mismo... en realidad nunca hay dos del mismo orden a la
  vez (es el invariante), pero insertar puede disparar una cadena larga de
  acarreos si el montículo tenía $B_0, B_1, \ldots, B_{k-1}$ todos presentes:
  el nuevo $B_0$ los funde a todos en un solo $B_k$, igual que sumar 1 a
  $0111\ldots1_2$. Es el peor caso que sí llega a costar $O(\lg n)$.
