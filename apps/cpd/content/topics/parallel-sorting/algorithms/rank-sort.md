---
kind: algorithm
title: "Ordenamiento por ranking en paralelo"
order: 1
cppSteps: []
visualization:
  type: dag
  steps:
    - note: "Algoritmo 1: se tiene el arreglo A de n elementos y n al cuadrado procesos."
      nodes:
        - { id: A, value: "A", parent: null, state: active }
    - note: "Primer forall: cada proceso (i, j) calcula B[i,j] = A[i] >= A[j]. Son n al cuadrado comparaciones, todas independientes, en un solo paso."
      nodes:
        - { id: A, value: "A", parent: null }
        - { id: B, value: "B n2", parent: A, state: active }
    - note: "Segundo forall: M[i] es la suma de la fila i de B, es decir, cuantos elementos son menores o iguales que A[i]; esa cuenta es su posición en la salida. La suma de n valores en PRAM cuesta log n."
      nodes:
        - { id: A, value: "A", parent: null }
        - { id: B, value: "B n2", parent: A }
        - { id: M, value: "M", parent: B, state: answer }
---

## Qué hace

Calcula para cada elemento su **rango** (cuántos elementos son menores o iguales que él), que es directamente su posición en la secuencia ordenada. La clase lo presenta como "método rápido, poco eficiente".

## Intuición

Si cada elemento se compara con todos los demás a la vez, no hace falta ordenar: contar basta. El precio es el número de procesos y de comparaciones.

## Algoritmo

**Algoritmo 1** ($n$ elementos, $n^2$ procesos):

1. En paralelo para todo $(i,j) \in \{1,\dots,n\}^2$: $B[i,j] \leftarrow (A[i] \ge A[j])$.
2. En paralelo para todo $i$: $M[i] \leftarrow \sum_{j=1}^{n} B[i,j]$.

**Algoritmo 2** ($n$ elementos, $p$ procesos en una malla $\sqrt{p}\times\sqrt{p}$, $n/\sqrt{p}$ elementos por proceso):

1. *Gossip* de la entrada por columna: el proceso $(i,j)$ recibe $a = a_{1,j},\dots,a_{\sqrt{p},j}$.
2. *Broadcast* de la entrada por fila: el proceso $(i,j)$ recibe $a' = a_{i,1},\dots,a_{i,N}$.
3. Ordenar $a$ localmente.
4. Para $k = 1,\dots,p$: $b_k$ = ranking de $a'_k$ en $a$.
5. *Reduce* de $b$ por fila: el proceso $(i,i)$ recibe $b' = \sum_{j=1}^{\sqrt{p}} b_{(i,j)}$.

La salida es el ranking de $d_{(i,j),k}$ almacenado en $b'(i\,n + k)$ en el proceso $(j,j)$.

## Pseudocódigo

```
Algoritmo 1  (n^2 procesos)
    forall (i,j) en {1..n}^2 pardo:   B[i,j] <- (A[i] >= A[j])
    forall i en {1..n} pardo:         M[i]   <- suma_{j=1..n} B[i,j]
```

## Complejidad

**Algoritmo 1:** el primer `forall` es un paso; el segundo es una suma de $n$ valores, $O(\log n)$ en PRAM. Entonces $T_\infty = O(\log n)$ y el trabajo $W = O(n^2 + n\log n)$: las $n^2$ comparaciones dominan. Es mucho más trabajo que el $O(n\log n)$ del mejor secuencial.

**Algoritmo 2:** la comunicación (gossip, broadcast, reduce sobre $\sqrt{p}$ procesos) y el ordenamiento local dan

$$T_p(n,p) = O\!\left(\log\sqrt{p}\left(\alpha + \beta\,\frac{n}{\sqrt{p}}\right) + T_{compr}\,\frac{n\log n}{\sqrt{p}}\right).$$

## Ejemplo

La clase cuantifica con $p = 1024$, $\alpha = 10^{-5}$ s, $\beta = 10^{-8}$ s, $T_{compr} = 10^{-8}$ s y $n/p = 32$, con constantes $k_1,k_2 \in \mathbb{R}$:

$$T_p(n,p) \approx k_1 \cdot 0.000357 + k_2 \cdot 0.0000011\ \text{s}$$

(la diapositiva escribe `0000357`, que se lee como $3.57\times10^{-4}$).

> **Nota de apoyo** (no está en el material): al reevaluar con esos parámetros el segundo término sí sale: $T_{compr}\cdot(n/p)\ln(n/p) = 10^{-8}\cdot 32\cdot\ln 32 \approx 1.1\times10^{-6}$ s. El primer término, en cambio, no se reproduce: $\log_2\!\sqrt{p}\,(\alpha+\beta\,n/\sqrt{p})$ con $n = 32\cdot1024$ da $\approx 1.0\times10^{-4}$ s (con $\log_2$) o $\approx 7\times10^{-5}$ s (con $\ln$), no $3.57\times10^{-4}$. Conviene tomar la cifra de la diapositiva como orden de magnitud: domina la comunicación ($10^{-4}$ frente a $10^{-6}$).

## Casos especiales

- Empates ($A[i] = A[j]$): con $\ge$ ambos elementos suman 1 al rango del otro, de modo que los rangos de valores iguales coinciden y dejan huecos; una implementación necesita un desempate (por índice).  *(Observación de apoyo, el material no la menciona.)*
- $p = n^2$ en el Algoritmo 2 recupera la idea del Algoritmo 1.
