---
kind: algorithm
title: "Ecuación de onda 1D con perturbación (tsunami) en MPI"
order: 2
cppSteps: ["pd5_onda_mpi.cpp"]
visualization:
  type: timeline
  steps:
    - note: "Un paso de tiempo con 4 procesos. Primero los procesos de rango par envían su borde derecho y reciben el del vecino de la derecha; los impares reciben primero. Así ningún par de Send bloqueantes se espera mutuamente."
      lanes:
        - { id: l0, label: "P0" }
        - { id: l1, label: "P1" }
        - { id: l2, label: "P2" }
        - { id: l3, label: "P3" }
      events:
        - { lane: l0, tStart: 0, tEnd: 1, label: "send der", state: active }
        - { lane: l1, tStart: 0, tEnd: 1, label: "recv izq", state: active }
        - { lane: l2, tStart: 0, tEnd: 1, label: "send der", state: active }
        - { lane: l3, tStart: 0, tEnd: 1, label: "recv izq", state: active }
      messages:
        - { fromLane: l0, toLane: l1, tStart: 0, tEnd: 1 }
        - { fromLane: l2, toLane: l3, tStart: 0, tEnd: 1 }
    - note: "Después, el sentido contrario: los procesos pares envían su borde izquierdo a la izquierda y los impares reciben desde la derecha. Con los cuatro mensajes todos tienen los dos halos listos."
      lanes:
        - { id: l0, label: "P0" }
        - { id: l1, label: "P1" }
        - { id: l2, label: "P2" }
        - { id: l3, label: "P3" }
      events:
        - { lane: l1, tStart: 1, tEnd: 2, label: "send der", state: active }
        - { lane: l2, tStart: 1, tEnd: 2, label: "recv izq", state: active }
        - { lane: l0, tStart: 1, tEnd: 2, label: "recv der", state: active }
        - { lane: l3, tStart: 1, tEnd: 2, label: "send izq", state: active }
      messages:
        - { fromLane: l1, toLane: l2, tStart: 1, tEnd: 2 }
        - { fromLane: l3, toLane: l2, tStart: 1, tEnd: 2 }
    - note: "Con los halos listos cada proceso actualiza sus propios puntos sin comunicación. Luego rota los punteros old, values y newval y pasa al siguiente paso de tiempo."
      lanes:
        - { id: l0, label: "P0" }
        - { id: l1, label: "P1" }
        - { id: l2, label: "P2" }
        - { id: l3, label: "P3" }
      events:
        - { lane: l0, tStart: 2, tEnd: 5, label: "calcula", state: answer }
        - { lane: l1, tStart: 2, tEnd: 5, label: "calcula", state: answer }
        - { lane: l2, tStart: 2, tEnd: 5, label: "calcula", state: answer }
        - { lane: l3, tStart: 2, tEnd: 5, label: "calcula", state: answer }
---

## Qué hace

Simula la propagación de una **onda en una dimensión** (la cuerda oscilante de la clase) y, en la PD5 2026-I, un **tsunami**: se agrega a la ecuación un término de forzamiento $0.01\,\sin(K\,(i/180))$ donde $i$ es el índice de la coordenada $x$ y $K$ mide la amplitud de la ola más alta.

## Intuición

La onda en el instante siguiente depende de **dos instantes** (el presente y el pasado) y de los **dos vecinos espaciales**. Como el tiempo es secuencial, se paraleliza el espacio: cada proceso lleva un tramo de la cuerda y en cada paso pide solo el punto vecino a cada lado.

## Algoritmo

Discretizando $\frac{\partial^2 u}{\partial t^2} = c^2\frac{\partial^2 u}{\partial x^2}$ (diapositiva 36):

$$u(x,t+1) = 2u(x,t) - u(x,t-1) + \big(u(x+1,t) - 2u(x,t) + u(x-1,t)\big)\frac{c^2\,\delta t^2}{\delta x^2}$$

Con el término del tsunami, el código del profesor (`pd5-onda_sec.cpp`, con $\tau = c\,\delta t/\delta x$):

```cpp
newval[i] = 2.0*values[i] - oldval[i]
          + tau*tau * (values[i-1] - 2.0*values[i] + values[i+1])
          + 0.01 * sin(K * (i / 180.0));
```

Versión paralela (`pd5_onda_mpi.cpp`):

1. Se reparte el dominio en bloques iguales de $n = \text{tpoints}/p$ puntos con dos celdas de halo.
2. En cada paso, intercambio de halo con `MPI_Send`/`MPI_Recv` con orden par/impar.
3. Actualización local de los $n$ puntos propios y rotación de punteros `old <- values <- newval`.
4. Al final, `MPI_Gather` en el proceso 0.

## Pseudocódigo

```
para s = 1 .. nsteps:
    si rank es par:  send der; recv der; send izq; recv izq
    si rank es impar: recv izq; send izq; recv der; send der
    para cada punto propio j (indice global gi):
        si gi == 1:        new[j] <- frontera izquierda
        si gi == tpoints:  new[j] <- frontera derecha
        si no:             new[j] <- 2*v[j] - old[j] + tau^2*(v[j-1]-2*v[j]+v[j+1]) + 0.01*sin(K*gi/180)
    old <- v;  v <- new
```

## C++

El código completo y ejecutable está arriba en el editor (`pd5_onda_mpi.cpp`); compilar con `mpicxx -O2 -std=c++17` y ejecutar `mpirun -np 4 ./pd5_onda_mpi K tpoints nsteps [salida.csv]`. Por defecto verifica el resultado contra la versión secuencial y reporta la diferencia máxima.

## Complejidad

$T_p \approx n_t\left[\,c_0\,N/p + 2(\alpha+\beta)\,\right]$: el cómputo por paso se divide entre $p$ y la comunicación es un valor por lado, independiente de $N$ y $p$. *(Derivado: el material no da esta fórmula para la onda; sale de contar los términos de la estructura del algoritmo, como en la clase para la ecuación de difusión.)*

Mediciones propias en un Apple M5 (4 núcleos de rendimiento + 6 de eficiencia), mejor de 3-5 corridas, `mpirun --oversubscribe`:

| Caso | $p=1$ | $p=2$ | $p=4$ | $p=8$ |
|---|---|---|---|---|
| Tamaño del enunciado ($1024$ pts, 800 pasos), $T_p$ (ms) | 2.17 | 3.20 | 2.96 | 4.95 |
| Fuerte ($2^{20}$ pts, 800 pasos), $T_p$ (s) | 2.667 | 1.174 | 1.089 | 0.854 |
| Débil ($131072$ pts por proceso), $T_p$ (s) | 0.282 | 0.295 | 0.329 | 0.892 |

Con el tamaño del enunciado el problema es tan pequeño (el cómputo total ronda 2 ms) que la latencia de los mensajes domina y **más procesos empeoran el tiempo**. Con $2^{20}$ puntos sí hay ganancia, pero queda lejos de lo lineal en $p \ge 4$ porque la máquina solo tiene 4 núcleos de rendimiento. En escalabilidad débil el tiempo ideal es constante: se mantiene casi plano hasta $p = 4$ y se dispara en $p = 8$ por la misma razón de hardware.

## Ejemplo

Con $K = 10, 15, 20, 25$, $1024$ puntos y 800 pasos, el valor máximo de $|u|$ al final fue $24.08$, $15.81$, $11.44$ y $9.12$ respectivamente; el análisis de si superan las 20 unidades está en la [resolución de la PD5](/evaluaciones/pd5/2026-i).

## Casos especiales

- `tpoints` debe ser múltiplo de $p$ (el programa lo valida).
- $p = 1$: no hay mensajes; el resultado debe coincidir **exactamente** con el secuencial (la diferencia medida fue 0).
- **Divergencia con el código entregado**: en `pd5-onda_sec.cpp` el término es `std::sin(K * i / 180)`; con `K` e `i` enteros, `K * i / 180` es una **división entera** (el seno recibe valores escalonados), distinta de $K\,(i/180)$ del enunciado. Además, en `update()` las fronteras quedan en `0.0` y las líneas con las condiciones del enunciado están comentadas. `pd5_onda_mpi.cpp` usa la división en doble precisión y las fronteras del enunciado ($0.1\sin(j)$ a la izquierda y $0.1\cos(j)$ a la derecha).
