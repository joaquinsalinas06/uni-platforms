---
kind: algorithm
title: "MPI_Scatter"
order: 2
visualization:
  type: network-topology
  steps:
    - note: "Antes de la llamada, el root tiene el array completo; los demás procesos no tienen nada todavía."
      processes:
        - { id: p0, label: "root", state: active }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      dataFlow: []
    - note: "MPI_Scatter reparte porciones DISTINTAS del array del root, una a cada proceso, en orden de rank."
      processes:
        - { id: p0, label: "root", state: active }
        - { id: p1, label: "P1", state: answer }
        - { id: p2, label: "P2", state: answer }
        - { id: p3, label: "P3", state: answer }
      dataFlow:
        - { from: p0, to: p1, label: "chunk 1" }
        - { from: p0, to: p2, label: "chunk 2" }
        - { from: p0, to: p3, label: "chunk 3" }
    - note: "MPI_Scatter también puede propagarse en árbol: nivel 1 (de log2(4)=2) — el root p0 manda a p1 un mensaje que incluye tanto el chunk de p1 como el de p3 (que p1 reenviará); p2 todavía no recibe nada."
      processes:
        - { id: p0, label: "root", state: active }
        - { id: p1, label: "P1", state: answer }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      dataFlow:
        - { from: p0, to: p1, label: "chunk 1+3" }
    - note: "Nivel 2 (el último de log2(4)=2): p0 manda directo su chunk restante a p2, y p1 reenvía a p3 el chunk que traía empaquetado desde el nivel anterior. Cada proceso recibe su porción sin que el root haga los 3 envíos por sí solo."
      processes:
        - { id: p0, label: "root", state: muted }
        - { id: p1, label: "P1", state: muted }
        - { id: p2, label: "P2", state: answer }
        - { id: p3, label: "P3", state: answer }
      dataFlow:
        - { from: p0, to: p2, label: "chunk 2" }
        - { from: p1, to: p3, label: "chunk 3" }
---

## Qué hace

`MPI_Scatter` distribuye los elementos de un array que reside en el proceso
raíz entre todos los procesos del grupo, entregando a cada uno una porción
distinta según el orden de su rank (a diferencia de `MPI_Bcast`, que envía
el **mismo** dato a todos).

## Intuición

Es repartir una baraja: el root tiene el mazo completo y le da una porción
distinta a cada jugador, en el orden en que están sentados (por rank). El
root también se queda con su propia porción.

## Algoritmo

1. El root tiene un buffer de origen (`sendbuf`) con `sendcnt` $\times\ p$ elementos
   de tipo `sendtype`.
2. Cada proceso, incluido el root, llama a `MPI_Scatter` con los mismos
   `sendcnt`, `sendtype`, `recvcnt`, `recvtype`, `root` y `comm`.
3. El proceso de rank $i$ recibe los `recvcnt` elementos ubicados en la
   posición $i \times$ `sendcnt` del buffer de origen del root, en su propio buffer
   `recvbuf`.

## Pseudocódigo

```
MPI_Scatter(&sendbuf, sendcnt, sendtype, &recvbuf, recvcnt, recvtype, root, comm)
```

- **sendbuf**: dirección del buffer que reside en el proceso raíz.
- **sendcnt**: número de elementos enviados a *cada* proceso (no el total).
- **sendtype**: tipo de los elementos enviados.
- **recvbuf**: buffer que recibe `recvcnt` elementos de tipo `recvtype`.
- **root**: rank del proceso raíz.
- **comm**: comunicador donde residen los procesos.

## C++

Este subtema no tiene `cppSteps` propio. El código de ejemplo está en
`cpp/practica/ejemplo02-scatt-gath.cpp` (un elemento por proceso) y
`ejemplo02-scatt-gath-array.cpp` (varios elementos por proceso), referenciado
desde la [página de práctica](/practica).

## Complejidad

El material no da una cota distinta para scatter respecto al broadcast en
árbol de [bcast](/topics/mpi-collectives/algorithms/bcast); ver `meta.yaml` de
`mpi-collectives` para el único caso de costo que el profesor sí distingue
explícitamente.

## Ejemplo

Del Ejemplo 02 de clase (Scatter/Gather): el maestro genera un array
`data_global` con tantos elementos como procesos, y reparte uno a cada uno:

```cpp
if (rank == 0)
    for (int i = 0; i < size; i++) data_global[i] = 2 * i + 1;

MPI_Scatter(data_global, 1, MPI_INT, &data_local, 1, MPI_INT, 0, MPI_COMM_WORLD);
```

## Casos especiales

Con $p = 1$, `MPI_Scatter` degenera en una copia local del array completo al
único proceso (que es root y a la vez el único destino). Si `sendcnt` no es
divisible exactamente entre lo que cada proceso necesita, es responsabilidad
del programador dimensionar el array de origen como múltiplo de $p$ — el
profesor lo señala explícitamente en el Ejemplo 02 ("array de tamaño
suficientemente grande, múltiplo de size").
</content>
