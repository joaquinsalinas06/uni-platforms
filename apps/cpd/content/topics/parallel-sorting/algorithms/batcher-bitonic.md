---
kind: algorithm
title: "Mergesort de Batcher y ordenamiento bitónico"
order: 3
cppSteps: ["pd5_bitonico.cpp"]
visualization:
  type: dag
  steps:
    - note: "BitonicSort de 8 elementos: se ordenan en paralelo las dos mitades, una en orden ascendente (up 4) y otra descendente (dn 4). Así la concatenación forma una secuencia bitónica (sube y luego baja)."
      nodes:
        - { id: bs8, value: "BS 8", parent: null, state: active }
        - { id: bs4a, value: "up 4", parent: bs8, state: active }
        - { id: bs4b, value: "dn 4", parent: bs8, state: active }
    - note: "BitonicMerge: compara e intercambia A[i] con A[i+n/2] para todo i a la vez (n/2 comparaciones independientes). Resultan dos secuencias bitónicas, y todos los elementos de una son menores que los de la otra."
      nodes:
        - { id: bs8, value: "BS 8", parent: null }
        - { id: bs4a, value: "up 4", parent: bs8 }
        - { id: bs4b, value: "dn 4", parent: bs8 }
        - { id: bm8, value: "BM 8", parent: bs8, state: answer }
    - note: "Cada mitad se vuelve a fusionar recursivamente con BitonicMerge hasta quedar de a dos elementos. El span cumple T(n) = T(n/2) + O(log n), que da O(log al cuadrado n)."
      nodes:
        - { id: bs8, value: "BS 8", parent: null }
        - { id: bm8, value: "BM 8", parent: bs8 }
        - { id: bm4a, value: "BM 4", parent: bm8, state: answer }
        - { id: bm4b, value: "BM 4", parent: bm8, state: answer }
---

## Qué hace

Ambos ordenan con una **red fija de comparar-intercambiar**: la secuencia de comparaciones no depende de los datos. El *odd-even mergesort* de Batcher fusiona dos secuencias ordenadas; el **ordenamiento bitónico** convierte una secuencia en bitónica y la fusiona. Ambos tienen span $O(\log^2 n)$ y se pueden ejecutar en un modelo CREW.

## Intuición

Una **secuencia bitónica** son dos tramos: uno creciente y otro decreciente,
$a_0 < a_1 < \dots < a_i > a_{i+1} > \dots > a_{n-1}$. Si se compara-intercambia $a_i$ con $a_{i+n/2}$ para todo $i$, salen **dos secuencias bitónicas** donde cada elemento de una es menor que los de la otra. Repitiendo en cada mitad, se llega a pares de dos elementos, ya ordenados. Y como un par de números es trivialmente bitónico, se parte de la lista desordenada, se unen pares en secuencias bitónicas de 4, luego de 8, y así hasta $n$.

## Algoritmo

**Bitónico** (diapositivas 32-33):

```
BitonicSort(A, l, n, dir):
    si n > 1:
        m <- n/2
        BitonicSort(A, l,   m, ASC)  ||  BitonicSort(A, l+m, m, DESC)
        BitonicMerge(A, l, n, dir)

BitonicMerge(A, l, n, dir):
    si n > 1:
        m <- n/2
        para i <- 0 .. m-1 pardo:  CompareExchange(A[l+i], A[l+i+m], dir)
        BitonicMerge(A, l, m, dir)  ||  BitonicMerge(A, l+m, m, dir)
```

**Odd-even mergesort de Batcher** (diapositivas 27-29): `OddEvenMergeSort` ordena en paralelo las mitades izquierda y derecha y las fusiona con `OddEvenMerge`. Para fusionar dos secuencias ordenadas $A$ y $B$ de tamaño $n$: se fusionan recursivamente los elementos de **posición impar** ($a_1,a_3,\dots$ y $b_1,b_3,\dots$) y por separado los de **posición par**, obteniendo $d_1,\dots,d_n$ y $e_1,\dots,e_n$; el resultado es $c_1 = d_1$, $c_{2n} = e_n$ y, para $i = 1,\dots,n-1$:
$c_{2i} = \min(d_{i+1}, e_i)$, $c_{2i+1} = \max(d_{i+1}, e_i)$.

## Pseudocódigo

```
OddEvenMerge(A, B, n):                 // A, B ordenadas, tamaño n; resultado C de 2n
    si n == 1:  C <- CompareExchange(A[1], B[1])
    si no:
        D <- OddEvenMerge(A_impares, B_impares, n/2)  ||  E <- OddEvenMerge(A_pares, B_pares, n/2)
        C[1] <- D[1];  C[2n] <- E[n]
        para i <- 1 .. n-1 pardo:  C[2i] <- min(D[i+1], E[i]);  C[2i+1] <- max(D[i+1], E[i])
```

## C++

El código de arriba (`pd5_bitonico.cpp`) es la versión iterativa de la red para OpenMP: las fases $k = 2,4,\dots,n$ arman secuencias bitónicas de tamaño $k$ y, en cada fase, los pasos $j = k/2,\dots,1$ hacen `CompareExchange(A[i], A[i^j])`. Los $n/2$ intercambios de un paso son independientes, así que cada paso es un `#pragma omp parallel for`. Hay $\frac{\log n(\log n+1)}{2}$ pasos. Se compila con `g++ -O2 -fopenmp` y comprueba el resultado contra `std::sort`.

## Complejidad

$$T_\infty(n) = T_\infty(n/2) + O(\log n) = O(\log^2 n)$$

La tabla de la clase da, para el odd-even mergesort, span $O(\log^2 n)$ y trabajo $O(n\log n)$ (la fusión por two-way-merge baja el span a $O(\log n\log\log n)$, Jájá cap. 4.3.1), y para el bitónico, span $O(\log^2 n)$. Con $p$ procesadores, por Brent: $O\!\left(\frac{n\log n}{p} + \log^2 p\right)$.

> **Nota de apoyo** (no está en el material): la implementación concreta de la red bitónica ejecuta $\frac{\log n(\log n+1)}{2}$ pasos de $n/2$ comparaciones, es decir, $O(n\log^2 n)$ comparaciones en total, más que las $O(n\log n)$ del mejor secuencial. Es el precio de un span bajo y se ve en la medición del ejemplo.

## Ejemplo

Mediciones propias, $2^{22}$ enteros, Apple M5 (4 núcleos de rendimiento y 6 de eficiencia), mejor de 3 corridas, resultado verificado contra `std::sort` en todas:

| Hilos | $T$ (s) | Speedup vs. 1 hilo | Eficiencia |
|---|---|---|---|
| 1 | 1.061 | 1.00 | 1.00 |
| 2 | 0.557 | 1.90 | 0.95 |
| 4 | 0.297 | 3.58 | 0.89 |
| 8 | 0.186 | 5.70 | 0.71 |

`std::sort` secuencial: 0.186 s. Escala bien hasta 4 hilos (la máquina tiene 4 núcleos de rendimiento) y el bitónico necesita 8 hilos para igualar al ordenamiento secuencial, porque hace unas 5.7 veces más comparaciones.

## Casos especiales

- $n$ debe ser potencia de 2 (la red de la clase y el código asumen $n = 2^k$).
- Con $n = 1$ ya está ordenado; con $n = 2$ el algoritmo se reduce a un solo `CompareExchange`.
- Para $p < n$, cada proceso ordena localmente $n/p$ elementos y la red opera sobre bloques con mezclas; el análisis de escalabilidad en malla e hipercubo está en [la teoría](/topics/parallel-sorting).
