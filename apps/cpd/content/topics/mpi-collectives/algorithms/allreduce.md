---
kind: algorithm
title: "MPI_Allreduce"
order: 6
visualization:
  type: network-topology
  steps:
    - note: "Antes de la llamada, cada proceso tiene su propio valor local (2, 8, 9)."
      processes:
        - { id: p0, label: "P0: 2" }
        - { id: p1, label: "P1: 8" }
        - { id: p2, label: "P2: 9" }
      dataFlow: []
    - note: "MPI_Allreduce combina los datos de todos con un operador y entrega el resultado a TODOS los procesos, no sólo a un root."
      processes:
        - { id: p0, label: "P0: 19", state: answer }
        - { id: p1, label: "P1: 19", state: answer }
        - { id: p2, label: "P2: 19", state: answer }
      dataFlow:
        - { from: p0, to: p1 }
        - { from: p0, to: p2 }
        - { from: p1, to: p0 }
        - { from: p1, to: p2 }
        - { from: p2, to: p0 }
        - { from: p2, to: p1 }
    - note: "Con 4 procesos (p0..p3, valores 2,8,9,1), MPI_Allreduce también puede combinarse en árbol (reduce-en-árbol + bcast-en-árbol) en vez de la malla completa de arriba. Nivel 1 (de log2(4)=2): p2 combina con p0 (2+9=11), y p3 combina con p1 (8+1=9)."
      processes:
        - { id: p0, label: "P0: 11", state: active }
        - { id: p1, label: "P1: 9", state: active }
        - { id: p2, label: "P2", state: muted }
        - { id: p3, label: "P3", state: muted }
      dataFlow:
        - { from: p2, to: p0, label: "+9" }
        - { from: p3, to: p1, label: "+1" }
    - note: "Nivel 2: p1 combina su parcial (9) con p0, dejando el total (20) en p0; el mismo patrón en árbol, invertido, redistribuye ese total de vuelta a p1, p2 y p3 en otros log2(4)=2 niveles, hasta que los 4 procesos terminan con el mismo resultado — sin la malla de 6 mensajes de arriba."
      processes:
        - { id: p0, label: "P0: 20", state: answer }
        - { id: p1, label: "P1: 20", state: answer }
        - { id: p2, label: "P2: 20", state: answer }
        - { id: p3, label: "P3: 20", state: answer }
      dataFlow:
        - { from: p1, to: p0, label: "+9" }
        - { from: p0, to: p1, label: "20" }
        - { from: p0, to: p2, label: "20" }
        - { from: p1, to: p3, label: "20" }
---

## Qué hace

`MPI_Allreduce` recopila los datos de todos los procesos del grupo y los
combina con un operador, igual que
[`MPI_Reduce`](/topics/mpi-collectives/algorithms/reduce), pero deja el resultado
disponible en **todos** los procesos del grupo, no sólo en un root.

## Intuición

Es un `MPI_Reduce` sin proceso raíz distinguido: la combinación se calcula
una sola vez, pero **todos** se quedan con el resultado final — equivalente
a un reduce seguido de un broadcast del resultado, aunque la librería lo
implementa como una sola operación optimizada.

## Algoritmo

1. Cada proceso tiene un buffer `sendbuf` con `count` elementos de tipo
   `datatype`.
2. Todos llaman a `MPI_Allreduce` con los mismos `count`, `datatype`, `op` y
   `comm` — **no hay parámetro `root`**.
3. Cada proceso recibe en su propio `recvbuf` el resultado de combinar,
   elemento a elemento, los aportes de todos los procesos con el operador
   `op`.

Los operadores predefinidos son los mismos que en
[`MPI_Reduce`](/topics/mpi-collectives/algorithms/reduce) (`MPI_SUM`, `MPI_MAX`,
`MPI_PROD`, etc.).

## Pseudocódigo

```
MPI_Allreduce(&sendbuf, &recvbuf, count, datatype, op, comm)
```

## C++

Este subtema no tiene `cppSteps` propio. El código de ejemplo está en
`cpp/practica/ejemplo03-allreduce.cpp`, referenciado desde la
[página de práctica](/practica).

## Complejidad

El material no da una cota propia distinta a la del broadcast en árbol
documentada en `meta.yaml` de `mpi-collectives`; conceptualmente cuesta al
menos lo que una reducción más lo que cuesta un broadcast del resultado.

## Ejemplo

Del código de laboratorio: cada proceso aporta su propio rank, y todos
terminan con la suma total:

```cpp
int me, numprocs, sum;
MPI_Comm_rank(MPI_COMM_WORLD, &me);
MPI_Comm_size(MPI_COMM_WORLD, &numprocs);

MPI_Allreduce(&me, &sum, 1, MPI_INT, MPI_SUM, MPI_COMM_WORLD);
printf("proceso %i: sum = %i\n", me, sum); // mismo `sum` en todos
```

Con 4 procesos (ranks 0-3), `sum = 0+1+2+3 = 6` se imprime igual desde cada
uno de los 4 procesos.

## Casos especiales

Con $p = 1$, `MPI_Allreduce` degenera en una copia directa del único aporte.
A diferencia de `MPI_Reduce`, aquí **todos** los `recvbuf` reciben el
resultado válido — es la opción a usar cuando el resultado de la combinación
hace falta en todos los procesos y no sólo en un root (evita tener que
encadenar un `MPI_Reduce` con un `MPI_Bcast` manual).
</content>
