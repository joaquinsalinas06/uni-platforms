---
kind: algorithm
title: "Suma de n números por reducción en árbol binario"
order: 4
visualization:
  type: dag
  steps:
    - note: "Paso 1: se copian los n=8 elementos a B (una operación por elemento, en paralelo). Este paso no reduce nada todavía, sólo prepara los datos de entrada."
      nodes:
        - { id: a1, value: 2, parent: null }
        - { id: a2, value: 5, parent: null }
        - { id: a3, value: 1, parent: null }
        - { id: a4, value: 4, parent: null }
        - { id: a5, value: 3, parent: null }
        - { id: a6, value: 7, parent: null }
        - { id: a7, value: 6, parent: null }
        - { id: a8, value: 0, parent: null }
        - { id: b1, value: 2, parent: a1, tag: "B[1]" }
        - { id: b2, value: 5, parent: a2, tag: "B[2]" }
        - { id: b3, value: 1, parent: a3, tag: "B[3]" }
        - { id: b4, value: 4, parent: a4, tag: "B[4]" }
        - { id: b5, value: 3, parent: a5, tag: "B[5]" }
        - { id: b6, value: 7, parent: a6, tag: "B[6]" }
        - { id: b7, value: 6, parent: a7, tag: "B[7]" }
        - { id: b8, value: 0, parent: a8, tag: "B[8]" }
      links:
        - { from: a1, to: b1, kind: tree }
        - { from: a2, to: b2, kind: tree }
        - { from: a3, to: b3, kind: tree }
        - { from: a4, to: b4, kind: tree }
        - { from: a5, to: b5, kind: tree }
        - { from: a6, to: b6, kind: tree }
        - { from: a7, to: b7, kind: tree }
        - { from: a8, to: b8, kind: tree }
    - note: "Nivel h=1: los primeros n/2=4 procesadores combinan pares consecutivos B[2i-1]+B[2i]. Los 8 valores de B ya leídos en este nivel quedan atrás (muted); las 4 sumas nuevas (c1..c4) son el nuevo frente de trabajo."
      nodes:
        - { id: b1, value: 2, parent: null, tag: "B[1]", state: muted }
        - { id: b2, value: 5, parent: null, tag: "B[2]", state: muted }
        - { id: b3, value: 1, parent: null, tag: "B[3]", state: muted }
        - { id: b4, value: 4, parent: null, tag: "B[4]", state: muted }
        - { id: b5, value: 3, parent: null, tag: "B[5]", state: muted }
        - { id: b6, value: 7, parent: null, tag: "B[6]", state: muted }
        - { id: b7, value: 6, parent: null, tag: "B[7]", state: muted }
        - { id: b8, value: 0, parent: null, tag: "B[8]", state: muted }
        - { id: c1, value: 7, parent: b1, state: active }
        - { id: c2, value: 5, parent: b3, state: active }
        - { id: c3, value: 10, parent: b5, state: active }
        - { id: c4, value: 6, parent: b7, state: active }
      links:
        - { from: b1, to: c1, kind: tree }
        - { from: b2, to: c1, kind: tree }
        - { from: b3, to: c2, kind: tree }
        - { from: b4, to: c2, kind: tree }
        - { from: b5, to: c3, kind: tree }
        - { from: b6, to: c3, kind: tree }
        - { from: b7, to: c4, kind: tree }
        - { from: b8, to: c4, kind: tree }
    - note: "Nivel h=2: quedan n/4=2 procesadores activos, que combinan los pares de sumas del nivel anterior (c1+c2, c3+c4). Sólo falta un nivel más para llegar al resultado."
      nodes:
        - { id: b1, value: 2, parent: null, tag: "B[1]", state: muted }
        - { id: b2, value: 5, parent: null, tag: "B[2]", state: muted }
        - { id: b3, value: 1, parent: null, tag: "B[3]", state: muted }
        - { id: b4, value: 4, parent: null, tag: "B[4]", state: muted }
        - { id: b5, value: 3, parent: null, tag: "B[5]", state: muted }
        - { id: b6, value: 7, parent: null, tag: "B[6]", state: muted }
        - { id: b7, value: 6, parent: null, tag: "B[7]", state: muted }
        - { id: b8, value: 0, parent: null, tag: "B[8]", state: muted }
        - { id: c1, value: 7, parent: b1, state: muted }
        - { id: c2, value: 5, parent: b3, state: muted }
        - { id: c3, value: 10, parent: b5, state: muted }
        - { id: c4, value: 6, parent: b7, state: muted }
        - { id: d1, value: 12, parent: c1, state: active }
        - { id: d2, value: 16, parent: c3, state: active }
      links:
        - { from: b1, to: c1, kind: tree }
        - { from: b2, to: c1, kind: tree }
        - { from: b3, to: c2, kind: tree }
        - { from: b4, to: c2, kind: tree }
        - { from: b5, to: c3, kind: tree }
        - { from: b6, to: c3, kind: tree }
        - { from: b7, to: c4, kind: tree }
        - { from: b8, to: c4, kind: tree }
        - { from: c1, to: d1, kind: tree }
        - { from: c2, to: d1, kind: tree }
        - { from: c3, to: d2, kind: tree }
        - { from: c4, to: d2, kind: tree }
    - note: 'Nivel h=3 (el último, $\log_2(8) = 3$): el único procesador restante combina d1+d2 en el resultado final S=B[1]=28. El span total $T_\infty = O(\log n)$ fueron estos 3 niveles secuenciales; el trabajo total $W = O(n)$ es la suma decreciente 4+2+1=7 sumas.'
      highlight: ["s"]
      nodes:
        - { id: b1, value: 2, parent: null, tag: "B[1]", state: muted }
        - { id: b2, value: 5, parent: null, tag: "B[2]", state: muted }
        - { id: b3, value: 1, parent: null, tag: "B[3]", state: muted }
        - { id: b4, value: 4, parent: null, tag: "B[4]", state: muted }
        - { id: b5, value: 3, parent: null, tag: "B[5]", state: muted }
        - { id: b6, value: 7, parent: null, tag: "B[6]", state: muted }
        - { id: b7, value: 6, parent: null, tag: "B[7]", state: muted }
        - { id: b8, value: 0, parent: null, tag: "B[8]", state: muted }
        - { id: c1, value: 7, parent: b1, state: muted }
        - { id: c2, value: 5, parent: b3, state: muted }
        - { id: c3, value: 10, parent: b5, state: muted }
        - { id: c4, value: 6, parent: b7, state: muted }
        - { id: d1, value: 12, parent: c1, state: muted }
        - { id: d2, value: 16, parent: c3, state: muted }
        - { id: s, value: 28, parent: d1, tag: "S=B[1]", state: answer }
      links:
        - { from: b1, to: c1, kind: tree }
        - { from: b2, to: c1, kind: tree }
        - { from: b3, to: c2, kind: tree }
        - { from: b4, to: c2, kind: tree }
        - { from: b5, to: c3, kind: tree }
        - { from: b6, to: c3, kind: tree }
        - { from: b7, to: c4, kind: tree }
        - { from: b8, to: c4, kind: tree }
        - { from: c1, to: d1, kind: tree }
        - { from: c2, to: d1, kind: tree }
        - { from: c3, to: d2, kind: tree }
        - { from: c4, to: d2, kind: tree }
        - { from: d1, to: s, kind: tree }
        - { from: d2, to: s, kind: tree }
    - note: 'Paso 3 del pseudocódigo: S ← B[1] = 28. Éste es el resultado que Brent usa junto con $T_\infty = O(\log n)$ y $W = O(n)$ para acotar $T_p(n,p)$ con cualquier número real de procesadores.'
      caption: "S ← B[1] = 28"
      highlight: ["s"]
      nodes:
        - { id: b1, value: 2, parent: null, tag: "B[1]", state: muted }
        - { id: b2, value: 5, parent: null, tag: "B[2]", state: muted }
        - { id: b3, value: 1, parent: null, tag: "B[3]", state: muted }
        - { id: b4, value: 4, parent: null, tag: "B[4]", state: muted }
        - { id: b5, value: 3, parent: null, tag: "B[5]", state: muted }
        - { id: b6, value: 7, parent: null, tag: "B[6]", state: muted }
        - { id: b7, value: 6, parent: null, tag: "B[7]", state: muted }
        - { id: b8, value: 0, parent: null, tag: "B[8]", state: muted }
        - { id: c1, value: 7, parent: b1, state: muted }
        - { id: c2, value: 5, parent: b3, state: muted }
        - { id: c3, value: 10, parent: b5, state: muted }
        - { id: c4, value: 6, parent: b7, state: muted }
        - { id: d1, value: 12, parent: c1, state: muted }
        - { id: d2, value: 16, parent: c3, state: muted }
        - { id: s, value: 28, parent: d1, tag: "S=B[1]", state: answer }
      links:
        - { from: b1, to: c1, kind: tree }
        - { from: b2, to: c1, kind: tree }
        - { from: b3, to: c2, kind: tree }
        - { from: b4, to: c2, kind: tree }
        - { from: b5, to: c3, kind: tree }
        - { from: b6, to: c3, kind: tree }
        - { from: b7, to: c4, kind: tree }
        - { from: b8, to: c4, kind: tree }
        - { from: c1, to: d1, kind: tree }
        - { from: c2, to: d1, kind: tree }
        - { from: c3, to: d2, kind: tree }
        - { from: c4, to: d2, kind: tree }
        - { from: d1, to: s, kind: tree }
        - { from: d2, to: s, kind: tree }
---

## Qué hace

Suma $n = 2^k$ números almacenados en un vector `A`, combinándolos de a
pares en un árbol binario de reducción en vez de acumularlos uno por uno.

## Intuición

En vez de sumar secuencialmente elemento por elemento ($n-1$ sumas en
cadena), se combinan pares de elementos en paralelo, luego pares de esos
resultados, y así sucesivamente hasta llegar a un único total. Cada nivel
del árbol reduce a la mitad la cantidad de valores pendientes, así que en
$\log n$ niveles se llega al resultado — mucho menos que los $n$ pasos
secuenciales.

## Algoritmo

1. Copiar los $n$ elementos de `A` a `B` (un procesador por elemento).
2. Por cada nivel $h = 1$ hasta $\log(n)$: combinar pares
   `B[i] ← B[2i-1] + B[2i]`, con $n/2^h$ procesadores activos en ese nivel.
3. El resultado final queda en `B[1]`.

Este algoritmo corre bajo un modelo PRAM **CREW**: varios procesadores leen
posiciones distintas de `B` en el mismo paso, pero cada uno escribe en una
posición distinta también.

## Pseudocódigo

```
Algorithm: Suma de n números en paralelo
Input: vector A con n = 2^k elementos
Output: suma S de elementos de A

for i = 1 to n pardo
    B[i] ← A[i]                         // paso 1

for h = 1 to log(n) do
    for i = 1 to n/2^h pardo
        B[i] ← B[2i-1] + B[2i]          // paso 2

S ← B[1]                                // paso 3
```

## C++

No aplica: no hay código de ejemplo propio en el material para este
subtema.

## Complejidad

- $W(n) = W_1(n) + W_2(n) + W_3(n) = n + \sum_{j=1}^{\log n} n/2^j + 1 = O(n)$
- $T_\infty(n) = O(\log n + 2) = O(\log n)$
- Costo: $C_p(n) = O(n + p \log n)$

**Reasoning:** el paso 1 hace $n$ copias (una por elemento); el paso 2 suma
sobre $\log n$ niveles, y la suma geométrica $\sum n/2^j$ converge a $O(n)$
en vez de $O(n \log n)$, porque cada nivel tiene la mitad de trabajo que el
anterior; el paso 3 es constante. El span es $O(\log n)$ porque hay
exactamente $\log n$ niveles secuenciales de dependencia (cada nivel necesita
los resultados del anterior). Como $C_p(n) = \Theta(W(n)) = \Theta(n)$, este algoritmo
es **WT-óptimo** (costo óptimo en el sentido de work-time): aplicando
[Brent](/topics/pram-algorithms/algorithms/brent-theorem) con estos valores
de $W$ y $T_\infty$ se obtiene $T_p(n,p) = O(n/p + \log n)$.

## Ejemplo

Para $n = 8$ ($k = 3$): paso 1 hace 8 copias; paso 2 combina 4 pares en el
nivel $h=1$, 2 pares en $h=2$, 1 par en $h=3$ ($4+2+1 = 7$ sumas, es decir
$n-1$); paso 3 lee el resultado final. El span es $\log_2(8) = 3$ niveles.

## Casos especiales

Con $p = 1$, el algoritmo se ejecuta secuencialmente nivel por nivel y su
tiempo total se aproxima al de sumar los $n-1$ pares de la reducción, sin
ganancia sobre la suma directa. Con $p = n/2$ (un procesador por cada par
del primer nivel), se alcanza el mínimo $T_\infty = O(\log n)$ sin desperdiciar
procesadores, ya que cada nivel siguiente usa la mitad de los procesadores
del anterior.
