---
kind: algorithm
title: "MPI_Gather"
order: 3
visualization:
  type: network-topology
  steps:
    - note: "Antes de la llamada, cada proceso tiene su propio dato local; el root todavía no tiene el conjunto completo."
      processes:
        - { id: p0, label: "root", state: active }
        - { id: p1, label: "P1", state: answer }
        - { id: p2, label: "P2", state: answer }
        - { id: p3, label: "P3", state: answer }
      dataFlow: []
    - note: "MPI_Gather recolecta los datos de todos los procesos en un único destino, el root — es el reverso de Scatter."
      processes:
        - { id: p0, label: "root", state: active }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      dataFlow:
        - { from: p1, to: p0, label: "chunk 1" }
        - { from: p2, to: p0, label: "chunk 2" }
        - { from: p3, to: p0, label: "chunk 3" }
    - note: "MPI_Gather también puede propagarse en árbol (reverso del broadcast en árbol): nivel 1 (de log2(4)=2) — p2 manda directo su chunk al root, y en paralelo p3 manda el suyo a p1 (que lo retendrá para reenviarlo junto con el propio)."
      processes:
        - { id: p0, label: "root", state: answer }
        - { id: p1, label: "P1", state: active }
        - { id: p2, label: "P2", state: muted }
        - { id: p3, label: "P3", state: muted }
      dataFlow:
        - { from: p2, to: p0, label: "chunk 2" }
        - { from: p3, to: p1, label: "chunk 3" }
    - note: "Nivel 2 (el último de log2(4)=2): p1 reenvía al root su propio chunk junto con el de p3 que traía acumulado. El root nunca recibió los 3 chunks uno por uno directamente — sólo dos mensajes en total."
      processes:
        - { id: p0, label: "root", state: answer }
        - { id: p1, label: "P1", state: muted }
        - { id: p2, label: "P2", state: muted }
        - { id: p3, label: "P3", state: muted }
      dataFlow:
        - { from: p1, to: p0, label: "chunk 1+3" }
---

## Qué hace

`MPI_Gather` recopila la información de cada proceso del grupo en un único
proceso destino (`root`). Es el reverso exacto de
[`MPI_Scatter`](/topics/mpi-collectives/algorithms/scatter): los elementos recolectados
se ordenan de acuerdo al rank del proceso de donde son recibidos.

## Intuición

Es recoger las porciones que antes repartió `MPI_Scatter`: cada jugador
devuelve su carta (o su resultado parcial) al root, que las reordena en el
mismo orden en que las repartió — por rank.

## Algoritmo

1. Cada proceso, incluido el root, tiene un buffer `sendbuf` con `sendcnt`
   elementos de tipo `sendtype` para aportar.
2. Todos llaman a `MPI_Gather` con los mismos `sendcnt`, `sendtype`,
   `recvcnt`, `recvtype`, `root` y `comm`.
3. El root recibe, en su buffer `recvbuf`, los aportes de todos los procesos
   ordenados por rank: el aporte del proceso $i$ queda en la posición
   $i \times$ `recvcnt`.

## Pseudocódigo

```
MPI_Gather(&sendbuf, sendcnt, sendtype, &recvbuf, recvcnt, recvtype, root, comm)
```

- **sendbuf**: dirección del buffer local que cada proceso aporta.
- **sendcnt**: elementos enviados por cada proceso.
- **sendtype**: tipo de los elementos enviados.
- **recvbuf**: buffer del root que recibe `recvcnt` elementos de tipo
  `recvtype` **por cada proceso**.
- **root**: rank del proceso destino.
- **comm**: comunicador donde residen los procesos.

## C++

Este subtema no tiene `cppSteps` propio. El código de ejemplo está en
`cpp/practica/ejemplo02-scatt-gath.cpp` y `ejemplo03_matrices.cpp` (gather de
submatrices), referenciado desde la [página de práctica](/practica).

## Complejidad

El material no da una cota distinta para gather respecto al broadcast en
árbol de [bcast](/topics/mpi-collectives/algorithms/bcast); ver `meta.yaml` de
`mpi-collectives`.

## Ejemplo

Continuando el Ejemplo 02: tras modificar su dato local, cada proceso lo
devuelve al maestro con `MPI_Gather`:

```cpp
data_local *= 2;
MPI_Gather(&data_local, 1, MPI_INT, data_global, 1, MPI_INT, 0, MPI_COMM_WORLD);
```

## Casos especiales

Con $p = 1$, `MPI_Gather` degenera en una copia local del único aporte al
buffer del root (que es el mismo proceso). El buffer `recvbuf` del root debe
tener espacio para `recvcnt` $\times\ p$ elementos — un error común es dimensionarlo
sólo para `recvcnt`, olvidando multiplicar por la cantidad de procesos.
</content>
