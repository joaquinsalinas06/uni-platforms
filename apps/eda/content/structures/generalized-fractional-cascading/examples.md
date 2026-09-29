---
kind: examples
title: Ejemplos
---

## Mínimo

El caso más pequeño donde la condición de
[Applicability](/structures/generalized-fractional-cascading/operations/applicability)
todavía dice algo interesante: un grafo de un solo vértice, sin vecinos.
Grado 0, muy por debajo de cualquier cota — cumple trivialmente. La
"navegación" se reduce a una única búsqueda binaria, $O(\lg n)$, sin ningún
paso de descenso que aprovechar ($k = 0$).

## Normal

*(Derivado de la construcción D₄/D₃ del profesor; no hay diagrama en las
diapositivas — #52 lo afirma en prosa, sin dibujarlo.)*

Un fragmento del grafo D₄-like: un nodo raíz con dos hijos y dos enlaces a
su gemela invertida — grado 4 (podría ser 5 con un padre propio):

```
                  (raiz)                     grado(raiz) = 4
                 /  |  |  \
          hijo-A  |  |  hijo-B
                 gemela-A  gemela-B
                (invertida) (invertida)
```

Cada uno de `hijo-A`, `hijo-B`, `gemela-A`, `gemela-B` tiene grado 1 en este
fragmento (su único vecino es la raíz). [Bounded-degree-check](/structures/generalized-fractional-cascading/operations/bounded-degree-check)
recorre los 5 vértices y confirma que ninguno excede grado 5.

Consulta sobre el camino `[raíz, hijo-B, raíz, gemela-A]` (un camino real
puede rebotar entre estructura normal e invertida, #53): una única búsqueda
binaria real en `raíz`, y de ahí en adelante, tres pasos $O(1)$ — el mismo
patrón que una cadena de 4 listas de
[fractional cascading](/structures/fractional-cascading), sólo que las 4
listas no son fijas de antemano: dependen del camino que la consulta 3D
necesite en cada caso.

## Límite

El contraejemplo de **grado no acotado**, con números concretos (derivado;
no aparece en las diapositivas — el mazo declara la condición pero no
dibuja el caso donde falla):

Con $n = 2000$ elementos por lista y grado acotado $d = 5$ (la construcción
$D_4$/$D_3$ real), un vértice mantiene del orden de $d \cdot n/2 = 5.000$ puentes
hacia sus vecinos. Si ese mismo vértice tuviera grado no acotado — por
ejemplo, $d = 400$ (un nodo "hub" conectado a cientos de vecinos en vez de
a un puñado fijo) — pasaría a mantener del orden de $400 \cdot n/2 = 400.000$
puentes: **80 veces más**, en un solo vértice. La condición de
[Applicability](/structures/generalized-fractional-cascading/operations/applicability)
no se rompe "un poco": el tamaño de la estructura en ese vértice deja de ser
una constante independiente de $n$ y pasa a crecer con el grado, que es
exactamente lo que la condición de grado acotado prohíbe. Sin esa condición,
la cota $O(\lg n + k)$ de
[Composition](/structures/generalized-fractional-cascading/operations/composition)
deja de sostenerse: cada paso de descenso dejaría de ser $O(1)$ para pasar a
ser $O(\text{grado del vértice})$.
