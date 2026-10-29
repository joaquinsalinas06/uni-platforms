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

*(Ejemplo derivado.)* Separa dos tamaños: m vértices en el grafo y n
elementos por lista. Una familia con grado d≤5 mantiene el mismo límite
local al aumentar m. En cambio, si un hub se conecta con todos los demás,
su grado es d=m−1: para m=10 tiene 9 vecinos; para m=100, 99; para m=1000,
999. No existe una constante que acote esa familia.

Comparar d=5 con d=400 en una instancia sólo compara constantes: 400
vecinos fijos todavía sería un grado acotado. Lo que invalida la hipótesis
del teorema es que el grado **crezca con el tamaño del grafo**. La figura de
[aplicabilidad](/structures/generalized-fractional-cascading/operations/applicability)
muestra esa diferencia con una estrella y puntos suspensivos.
