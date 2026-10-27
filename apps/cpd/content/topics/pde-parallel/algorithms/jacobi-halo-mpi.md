---
kind: algorithm
title: "Jacobi con halos en MPI (Laplace 1D)"
order: 1
cppSteps: []
visualization:
  type: network-topology
  steps:
    - note: "Scatter: el proceso 0 reparte el vector inicial en bloques iguales. Cada proceso guarda su bloque con dos celdas extra, una a cada lado, para los valores del vecino (halo)."
      processes:
        - { id: p0, label: "P0", state: active }
        - { id: p1, label: "P1", state: active }
        - { id: p2, label: "P2", state: active }
        - { id: p3, label: "P3", state: active }
      dataFlow:
        - { from: p0, to: p1, label: "scatter" }
        - { from: p0, to: p2 }
        - { from: p0, to: p3 }
    - note: "En cada iteración, cada proceso envía su primer punto al vecino izquierdo y su ultimo punto al derecho, y recibe los suyos. Son dos mensajes de un valor por vecino."
      processes:
        - { id: p0, label: "P0", state: active }
        - { id: p1, label: "P1", state: active }
        - { id: p2, label: "P2", state: active }
        - { id: p3, label: "P3", state: active }
      dataFlow:
        - { from: p0, to: p1, label: "halo" }
        - { from: p1, to: p0, label: "halo" }
        - { from: p1, to: p2, label: "halo" }
        - { from: p2, to: p1, label: "halo" }
        - { from: p2, to: p3, label: "halo" }
        - { from: p3, to: p2, label: "halo" }
    - note: "Allreduce con el máximo: todos los procesos conocen el error global y deciden juntos si seguir iterando."
      processes:
        - { id: p0, label: "P0", state: marked }
        - { id: p1, label: "P1", state: marked }
        - { id: p2, label: "P2", state: marked }
        - { id: p3, label: "P3", state: marked }
      dataFlow:
        - { from: p1, to: p0, label: "max" }
        - { from: p2, to: p0 }
        - { from: p3, to: p0 }
---

## Qué hace

Resuelve $u_{xx} = 0$ en una dimensión con el método de **Jacobi**: cada punto interior se reemplaza por el promedio de sus dos vecinos del paso anterior, hasta que el error máximo baje de una tolerancia. La versión MPI reparte el vector entre procesos y comunica solo las fronteras.

## Intuición

Cada proceso es dueño de un segmento. Para actualizar el punto del borde de su segmento necesita el vecino, que vive en otro proceso. Por eso cada proceso guarda **copias** del punto vecino a cada lado (las celdas de halo) y las refresca al inicio de cada iteración.

## Algoritmo

1. `MPI_Scatter` del vector inicial: cada proceso recibe `local_N` puntos y los guarda en `local_u[1..local_N]`; `local_u[0]` y `local_u[local_N+1]` son el halo.
2. Mientras `global_error > tol` y `iter < max_iter`:
   1. Copiar `local_old = local_u`.
   2. Si `rank > 0`: enviar `local_old[1]` al vecino izquierdo y recibir en `local_old[0]`.
   3. Si `rank < size-1`: enviar `local_old[local_N]` al derecho y recibir en `local_old[local_N+1]`.
   4. Actualizar cada punto: `local_u[i] = 0.5 * (local_old[i-1] + local_old[i+1])`, saltando el primer punto global (proceso 0) y el último (proceso `size-1`), que son fronteras fijas.
   5. `MPI_Allreduce(&local_error, &global_error, 1, MPI_DOUBLE, MPI_MAX, ...)`.
3. `MPI_Gather` del resultado en el proceso 0.

## Pseudocódigo

```
Scatter(u) -> local_u[1..n_loc]
mientras global_error > tol y iter < max_iter:
    local_old <- local_u
    intercambiar halo con vecino izquierdo (si rank > 0)
    intercambiar halo con vecino derecho   (si rank < size-1)
    para i = 1 .. n_loc (salvo fronteras globales):
        local_u[i] <- 0.5 * (local_old[i-1] + local_old[i+1])
        local_error <- max(local_error, |local_u[i] - local_old[i]|)
    global_error <- Allreduce(local_error, MAX)
    iter <- iter + 1
Gather(local_u) -> u
```

## C++

Este subtema no tiene archivo propio en `cpp/topics/`; el fragmento de la clase está incrustado arriba, en la sección de ejemplos de [la teoría](/topics/pde-parallel). El código completo con halos P2P de este patrón está en [la ecuación de onda](/topics/pde-parallel/algorithms/wave-equation-mpi).

## Complejidad

Por iteración, cada proceso hace $O(N/p)$ operaciones y envía/recibe 2 valores (más una reducción de $O(\log p)$): $T_p = k\left[\,m\,N/p + 2(\alpha+\beta) + O(\log p)\,\right]$. El profesor no desarrolla esta fórmula; se obtiene de contar los términos de la estructura del algoritmo. El cómputo se reparte entre $p$, la latencia por vecino no.

## Ejemplo

Con $p = 4$ y $N = 16$: cada proceso tiene 4 puntos y 2 celdas de halo. P0 solo intercambia con P1; P1 y P2 con ambos lados; P3 solo con P2. En total hay 6 mensajes de un valor por iteración (3 pares de vecinos).

## Casos especiales

- $p = 1$: no hay halo ni comunicación; es la versión secuencial.
- Procesos 0 y `size-1`: tienen un solo vecino; sus fronteras globales son valores fijos y no se actualizan.

> **Nota de apoyo** (no está en el material): en el fragmento de la diapositiva 18, la variable `local_error` se inicializa en `0.0` pero no se actualiza dentro del bucle que se muestra, de modo que el `Allreduce` reduciría siempre cero; en la versión secuencial (diapositiva 17) el error sí se calcula con `max(error, abs(u[i]-u_old[i]))`. Es probable que el cálculo esté omitido por espacio en la diapositiva. Además, con `MPI_Send` bloqueante, si **todos** los procesos envían antes de recibir, el programa puede interbloquearse con mensajes grandes; para mensajes de un solo valor suele funcionar por el protocolo *eager*, pero lo seguro es ordenar por paridad del rango o usar `MPI_Sendrecv`, como en [`pd5_onda_mpi.cpp`](/topics/pde-parallel/algorithms/wave-equation-mpi).
