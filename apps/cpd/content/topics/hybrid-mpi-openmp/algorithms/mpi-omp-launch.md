---
kind: algorithm
title: "Combinar procesos e hilos: ejecución en máquinas y clusters"
order: 2
cppSteps: ["omp30_hibrido_mpi_omp.cpp"]
visualization:
  type: network-topology
  steps:
    - note: "Máquina de ejemplo: 2 nodos de 8 núcleos. Opción 1: un proceso MPI por nodo con 8 hilos OpenMP cada uno (P0 y P1, cada uno en su nodo). 2 procesos en total."
      processes:
        - { id: p0, label: "P0 x8", state: active }
        - { id: p1, label: "P1 x8", state: active }
      dataFlow:
        - { from: p0, to: p1, label: "mensajes" }
    - note: "Opción 2: 2 procesos MPI por nodo con 4 hilos cada uno (por ejemplo, uno por socket). P0 y P1 viven en el nodo 0; P2 y P3 en el nodo 1. 4 procesos en total."
      processes:
        - { id: p0, label: "P0 x4", state: active }
        - { id: p1, label: "P1 x4", state: active }
        - { id: p2, label: "P2 x4", state: active }
        - { id: p3, label: "P3 x4", state: active }
      dataFlow:
        - { from: p0, to: p1 }
        - { from: p1, to: p2 }
        - { from: p2, to: p3 }
    - note: "Opción 3: 4 procesos MPI por nodo con 2 hilos cada uno. 8 procesos en total, más cerca del MPI puro (8 procesos x 1 hilo por nodo)."
      processes:
        - { id: p0, label: "P0 x2", state: active }
        - { id: p1, label: "P1 x2", state: active }
        - { id: p2, label: "P2 x2", state: active }
        - { id: p3, label: "P3 x2", state: active }
        - { id: p4, label: "P4 x2", state: active }
        - { id: p5, label: "P5 x2", state: active }
        - { id: p6, label: "P6 x2", state: active }
        - { id: p7, label: "P7 x2", state: active }
      dataFlow:
        - { from: p0, to: p1 }
        - { from: p1, to: p2 }
        - { from: p2, to: p3 }
        - { from: p3, to: p4 }
        - { from: p4, to: p5 }
        - { from: p5, to: p6 }
        - { from: p6, to: p7 }
---

## Qué hace

Dado un cluster, decide **cuántos procesos MPI** lanzar y **cuántos hilos OpenMP** abrir en cada uno, de manera que (procesos por nodo) × (hilos por proceso) = núcleos del nodo (o de lo que se quiera ocupar).

## Intuición

Los núcleos de un nodo son una cantidad fija: la pregunta es cómo **partirlos**. Pocos procesos con muchos hilos se parece a un SMP; muchos procesos con pocos hilos se parece a MPI puro. El mejor reparto **depende del hardware** y se encuentra probando.

## Algoritmo

### Combinaciones en una máquina de nodos con 8 núcleos

Una máquina de **268 nodos con 8 núcleos** por nodo admite: 1 proceso MPI y 8 hilos, 2 y 4, o 4 y 2 (el diagrama). Con **2 nodos, 1 proceso MPI por nodo y 4 hilos**, el programa imprime:

```
0 running on compute-2-25.local thread= 0 of 4
0 running on compute-2-25.local thread= 1 of 4
0 running on compute-2-25.local thread= 2 of 4
0 running on compute-2-25.local thread= 3 of 4
1 running on compute-3-14.local thread= 0 of 4
...
1 running on compute-3-14.local thread= 3 of 4
```

(el primer número es el rank MPI; cada rank está en un nodo distinto).

### Programa mínimo (compilar y ejecutar)

```bash
mpicc -fopenmp peekaboo_mpi_omp.c
mpirun -np 2 ./a.out
```

El archivo del editor (`omp30_hibrido_mpi_omp.cpp`) hace lo mismo con `mpic++`. En macOS con Homebrew, `mpic++` usa clang sin OpenMP: hay que apuntarlo a GCC con `OMPI_CXX=g++-16 mpic++ -fopenmp ...` (*nota de apoyo*, probado aquí: con `mpirun -np 2` se imprimen 8 líneas).

### En un cluster con Slurm: Khipu

Khipu (UTEC) tiene un nodo líder, 3 nodos CPU (96 núcleos en total, 390 GB) y 4 nodos GPU (256 núcleos en total, 3 192 GB): 392 núcleos en 8 nodos. Un nodo de ejemplo: Intel Xeon Gold 6130 (16 núcleos por socket, 32 por nodo), 126 GB DDR4, red Infiniband FDR. Script de la clase para **4 procesos MPI y 8 hilos OMP por proceso**:

```bash
#!/bin/bash
#SBATCH --job-name=hibrido_mpi_openmp
#SBATCH --output=hibrido_mpi_openmp.out
#SBATCH --ntasks=4
#SBATCH --cpus-per-task=8
#SBATCH --partition=docencia

module load mpich/4.0
export OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK
mpirun ./hibrido
module unload mpich/4.0
```

`--ntasks` = procesos MPI; `--cpus-per-task` = hilos por proceso; **`OMP_NUM_THREADS` se toma de `SLURM_CPUS_PER_TASK`** para que los hilos coincidan con lo que Slurm reservó. No hace falta pasar `-n` a `mpirun`: toma el valor de la configuración de Slurm.

### En un supercomputador: Perlmutter (NERSC)

Sistema heterogéneo sobre una plataforma Cray: 3 072 CPUs (pico 15.4 PFLOPs) y 1 792 GPUs (pico 69.5 PFLOPs). Un AMD EPYC 7713 tiene **64 núcleos físicos y 128 hilos**. Dos configuraciones de la clase:

| Configuración | Mapeo |
|---|---|
| Sólo MPI (`check-mpi.gnu.pm`) | **Un proceso MPI por núcleo físico** |
| Híbrida (`check-hybrid.gnu.pm`) | **Un proceso MPI por socket y 1 hilo OpenMP por núcleo físico**, con `OMP_PROC_BIND=spread` y `OMP_PLACES=threads` |

`OMP_PLACES` y `OMP_PROC_BIND` controlan **dónde** corren los hilos (qué núcleos); importan por los efectos NUMA mencionados como desventaja.

> **Nota de apoyo** (no está en la slide): un programa que llama a MPI **desde dentro** de una región paralela debe inicializarse con `MPI_Init_thread` pidiendo el nivel de soporte adecuado (`MPI_THREAD_FUNNELED` si sólo el hilo master llama a MPI, `MPI_THREAD_MULTIPLE` si cualquier hilo puede). La slide usa `MPI_Init`, suficiente cuando MPI se llama sólo fuera de las regiones paralelas, como en el ejemplo.

## Pseudocódigo

```
núcleos_por_nodo = c ; elegir (procesos_por_nodo = q, hilos_por_proceso = t) con q · t = c
Slurm:  --ntasks = q · nodos ;  --cpus-per-task = t
        export OMP_NUM_THREADS = t ; mpirun ./programa
```

## C++

El editor trae el programa híbrido mínimo. Probalo con `-np 2` y `-np 4` y verificá que el número de líneas es `np × 4`.

## Complejidad

El número total de hilos de ejecución es $q \cdot t \cdot \text{nodos}$. Si se mantiene constante, pasar de $(q, t) = (8, 1)$ a $(1, 8)$ reduce el número de **procesos con halo** de 8 a 1 por nodo (menos mensajes y memoria, ver [omp-halo-decomposition](/topics/hybrid-mpi-openmp/algorithms/omp-halo-decomposition)), pero aumenta el costo de creación/sincronización de hilos $O(t)$ por región paralela y la exposición a efectos NUMA.

## Ejemplo

El caso de 2 nodos × 1 proceso × 4 hilos (arriba) y el script de Khipu (4 procesos × 8 hilos = 32 núcleos, los de un nodo de 32 núcleos) son los ejemplos de la clase.

## Casos especiales

- **`OMP_NUM_THREADS` sin definir**: OpenMP usa por defecto todos los núcleos visibles, y varios procesos MPI por nodo se **sobresuscriben**.
- **Hyper-threading**: 64 núcleos físicos pero 128 hilos; usar los 128 no siempre es más rápido.
- **Más hilos que núcleos asignados**: los hilos compiten entre sí (contención) y el rendimiento cae.
