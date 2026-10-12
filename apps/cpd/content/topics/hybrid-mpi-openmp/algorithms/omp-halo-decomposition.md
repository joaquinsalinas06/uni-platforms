---
kind: algorithm
title: "Halos y descomposición de dominio"
order: 1
cppSteps: []
visualization:
  type: memory-layout
  steps:
    - note: "Un proceso con un subdominio de M×N celdas (aquí, una fila de 8 celdas interiores): sus celdas de halo (naranja) son copias locales de datos que pertenecen a los vecinos y que hay que renovar en cada iteración. Cada celda mide 4 bytes (un float)."
      blocks:
        - { id: hl, label: "halo", bytes: 4, offset: 0, state: marked }
        - { id: c0, label: "c0", bytes: 4, offset: 4, state: active }
        - { id: c1, label: "c1", bytes: 4, offset: 8, state: active }
        - { id: c2, label: "c2", bytes: 4, offset: 12, state: active }
        - { id: c3, label: "c3", bytes: 4, offset: 16, state: active }
        - { id: c4, label: "c4", bytes: 4, offset: 20, state: active }
        - { id: c5, label: "c5", bytes: 4, offset: 24, state: active }
        - { id: c6, label: "c6", bytes: 4, offset: 28, state: active }
        - { id: c7, label: "c7", bytes: 4, offset: 32, state: active }
        - { id: hr, label: "halo", bytes: 4, offset: 36, state: marked }
    - note: "MPI puro con 2 procesos sobre el mismo dominio: cada proceso guarda su propio halo en ambos extremos. Son 4 celdas de halo en total para los mismos 8 interiores (4 por proceso)."
      blocks:
        - { id: a_hl, label: "halo", bytes: 4, offset: 0, state: marked }
        - { id: a0, label: "P0", bytes: 16, offset: 4, state: active }
        - { id: a_hr, label: "halo", bytes: 4, offset: 20, state: marked }
        - { id: b_hl, label: "halo", bytes: 4, offset: 24, state: marked }
        - { id: b0, label: "P1", bytes: 16, offset: 28, state: active }
        - { id: b_hr, label: "halo", bytes: 4, offset: 44, state: marked }
    - note: "Híbrido: un solo proceso con 2 hilos sobre el mismo dominio. Los hilos comparten memoria y no necesitan halo entre sí: sólo el del proceso (2 celdas). Menos memoria y menos comunicación."
      blocks:
        - { id: h_hl, label: "halo", bytes: 4, offset: 0, state: marked }
        - { id: t0, label: "hilo 0", bytes: 16, offset: 4, state: active }
        - { id: t1, label: "hilo 1", bytes: 16, offset: 20, state: active }
        - { id: h_hr, label: "halo", bytes: 4, offset: 36, state: marked }
---

## Qué hace

Las **regiones de halo** son copias locales de información remota (de los subdominios vecinos) que cada proceso necesita para procesar sus datos. Deben **copiarse con frecuencia** (en cada iteración de un método tipo stencil). Usar OpenMP **reduce el tamaño de las copias de halo** que hay que almacenar, y con
ellas la memoria y la comunicación.

(*Los diagramas de bloques de este subtema son una ilustración 1D propia de la idea; las diapositivas la presentan con mallas 2D y 3D.*)

## Intuición

Cada parcela de un campo está rodeada de una franja con la copia de lo que hay en las parcelas vecinas; esa franja es **memoria extra** y **tráfico de mensajes**. Si en vez de dividir el campo en 16 parcelas con 16 franjas lo dividís en 4 parcelas grandes (cada una con varios
hilos) hay sólo 4 franjas.

## Algoritmo

### Descomposición 2D: cómputo vs. halo

Malla 2D dividida entre procesos. De **1 a 4 procesos**, cada uno tiene **un cuarto de las celdas** que computar y **la mitad de las celdas de halo** que comunicar.

- $P$ procesos, cada uno con $M \times N$ celdas → $2M + 2N$ celdas de halo.
- $4P$ procesos, cada uno con $\frac{M}{2} \times \frac{N}{2}$ celdas → $M + N$ celdas de halo.

Mientras la cantidad de procesos crece en $O(P)$, la región de halo por proceso **disminuye más lentamente**, en $O(\sqrt{P})$.

| Procesos | Celdas por proceso | Celdas de halo por proceso | Halo / cómputo |
|---|---|---|---|
| $P$ | $MN$ | $2M + 2N$ | $\frac{2(M+N)}{MN}$ |
| $4P$ | $MN/4$ | $M + N$ | $\frac{4(M+N)}{MN}$ (el doble) |

### Descomposición 3D: porcentaje de halo

Para un cubo de datos por proceso con **1 celda de halo** por cara (cubo $n^3$ → cubo $(n+2)^3$):

$$\text{halo}(n) = \frac{(n+2)^3 - n^3}{(n+2)^3} = 1 - \left(\frac{n}{n+2}\right)^3$$

| $n$ | celdas totales $(n+2)^3$ | halo | % halo |
|---|---|---|---|
| 10 | 1 728 | 728 | **42 %** |
| 20 | 10 648 | 2 648 | **25 %** |
| 40 | 74 088 | 10 088 | **14 %** |

Un cubo pequeño por proceso (muchos procesos) gasta casi la mitad de su memoria en halo; el híbrido permite tener **procesos más grandes** (el $n$ de una fila más abajo) porque los hilos comparten el cubo.

### Ejemplo real: PIC (Particle in Cell)

La descomposición de dominio de un modelo PIC para simulación de plasmas (código Smilei, Derouillat et al. 2017) reparte el dominio en subdominios de forma **irregular** para equilibrar la carga: la forma de los dominios MPI evoluciona con la distribución de carga computacional. Es el caso donde se necesita
**balance de carga dinámico**, una de las razones por las que el híbrido ayuda.

## Pseudocódigo

```
mientras no converge:
  intercambiar halos con los vecinos (MPI_Sendrecv / Isend+Irecv)       // sólo entre procesos
  #pragma omp parallel for                                                // dentro del proceso
  para cada celda interior: u_nuevo ← stencil(u, vecinos, halo)
  intercambiar u_nuevo ↔ u
```

## C++

No hay archivo propio en este subtema; la estructura del programa híbrido está en [mpi-omp-launch](/topics/hybrid-mpi-openmp/algorithms/mpi-omp-launch) (`omp30_hibrido_mpi_omp.cpp`), y el intercambio de halos con `MPI_Sendrecv`/`Isend`/`Irecv` es el de [mpi-blocking-nonblocking](/topics/mpi-blocking-nonblocking).

## Complejidad

Con $N^2$ celdas y $P$ procesos en una malla 2D con subdominios cuadrados: cómputo por proceso $N^2/P$; halo por proceso $4N/\sqrt{P}$. La relación comunicación/cómputo es

$$\frac{4N/\sqrt{P}}{N^2/P} = \frac{4\sqrt{P}}{N}$$

y **crece con $\sqrt{P}$**: escalar con más procesos MPI puros sube la fracción de tiempo en comunicar. Si cada proceso usa $T$ hilos, el número de subdominios baja a $P/T$ y la relación a $4\sqrt{P/T}/N$ (menor).
(*Nota de apoyo*: la expresión con $T$ hilos es la consecuencia directa de la fórmula de la diapositiva; la clase enuncia sólo el comportamiento $O(\sqrt{P})$.)

## Ejemplo

Los tres porcentajes de halo 3D (42 %, 25 %, 14 %) son los ejemplos numéricos de la clase. Los puntos $n = 80$ y $n = 160$ de la fórmula dan 7.1 % y 3.7 %.

## Casos especiales

- **$P = 1$**: no hay halo entre procesos (sólo condiciones de contorno).
- **Subdominio de una sola celda de espesor**: el halo es mayor que el interior (>100 %); el híbrido evita llegar a ese régimen.
- **Dominios irregulares** (PIC): el perímetro ya no es $4N/\sqrt{P}$; el balance de carga domina.
