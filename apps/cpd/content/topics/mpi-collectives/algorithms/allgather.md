---
kind: algorithm
title: "MPI_Allgather"
order: 4
visualization:
  type: network-topology
  steps:
    - note: "Antes de la llamada, cada proceso tiene sólo su propio dato local — no hay un root distinguido."
      processes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
      dataFlow: []
    - note: "MPI_Allgather actúa como un Gather seguido de un Bcast: cada proceso termina con la colección completa de todos los aportes, en el orden de rank."
      processes:
        - { id: p0, label: "P0", state: answer }
        - { id: p1, label: "P1", state: answer }
        - { id: p2, label: "P2", state: answer }
      dataFlow:
        - { from: p0, to: p1 }
        - { from: p0, to: p2 }
        - { from: p1, to: p0 }
        - { from: p1, to: p2 }
        - { from: p2, to: p0 }
        - { from: p2, to: p1 }
    - note: "Con 4 procesos (p0..p3), MPI_Allgather también puede implementarse como gather-en-árbol seguido de bcast-en-árbol, en vez de la malla completa de arriba. Nivel 1 (de log2(4)=2) del gather: p2 manda a p0, p3 manda a p1 — cada nivel reduce a la mitad la cantidad de mensajes directos."
      processes:
        - { id: p0, label: "P0", state: active }
        - { id: p1, label: "P1", state: active }
        - { id: p2, label: "P2", state: muted }
        - { id: p3, label: "P3", state: muted }
      dataFlow:
        - { from: p2, to: p0, label: "dato 2" }
        - { from: p3, to: p1, label: "dato 3" }
    - note: "Nivel 2: p1 reenvía a p0 lo acumulado (dato 1+3), dejando en p0 la colección completa; luego el mismo patrón en árbol —ahora invertido— reparte esa colección completa de vuelta a p1, p2 y p3 en otros log2(4)=2 niveles, hasta que los 4 terminan con la colección completa."
      processes:
        - { id: p0, label: "P0", state: answer }
        - { id: p1, label: "P1", state: answer }
        - { id: p2, label: "P2", state: answer }
        - { id: p3, label: "P3", state: answer }
      dataFlow:
        - { from: p1, to: p0, label: "dato 1+3" }
        - { from: p0, to: p1, label: "completo" }
        - { from: p0, to: p2, label: "completo" }
        - { from: p1, to: p3, label: "completo" }
---

## Qué hace

`MPI_Allgather` recopila la información de cada proceso del grupo, igual que
[`MPI_Gather`](/topics/mpi-collectives/algorithms/gather), pero el resultado
recolectado queda disponible en **todos** los procesos, no sólo en un root.
Los elementos quedan ordenados según el rank del proceso de donde provienen.

## Intuición

El profesor lo describe como "actúa como un `MPI_Gather` seguido de un
`MPI_Bcast`": primero se recolecta todo en un punto lógico, y luego ese
resultado completo se difunde de vuelta a todos. No hay proceso raíz — todos
los procesos reciben la misma colección completa al terminar.

## Algoritmo

1. Cada proceso tiene un buffer `sendbuf` con `sendcnt` elementos de tipo
   `sendtype` para aportar.
2. Todos llaman a `MPI_Allgather` con los mismos `sendcnt`, `sendtype`,
   `recvcnt`, `recvtype` y `comm` — **no hay parámetro `root`**.
3. Cada proceso recibe, en su propio `recvbuf`, los aportes de **todos** los
   procesos ordenados por rank.

## Pseudocódigo

```
MPI_Allgather(&sendbuf, sendcnt, sendtype, &recvbuf, recvcnt, recvtype, comm)
```

- **sendbuf**: dirección del buffer local que cada proceso aporta.
- **sendcnt**: elementos enviados por cada proceso.
- **sendtype**: tipo de los elementos enviados.
- **recvbuf**: buffer local (en cada proceso) que recibe `recvcnt` elementos
  de tipo `recvtype` **por cada proceso** del comunicador.
- **comm**: comunicador donde residen los procesos.

## C++

Este subtema no tiene ejemplo de código propio en `cpp/practica/` — el
material fuente (slides de `mpi-collectives`) lo introduce sólo a nivel
conceptual y de firma, sin ejercicio de laboratorio dedicado.

## Complejidad

El material no da una cota distinta para allgather respecto al broadcast en
árbol de [bcast](/topics/mpi-collectives/algorithms/bcast); ver `meta.yaml` de
`mpi-collectives`. Conceptualmente cuesta al menos lo que un gather más lo
que cuesta un bcast del resultado, ya que combina ambos patrones.

## Ejemplo

*(derivado; no aparece explícito en el material)* Si 3 procesos aportan sus
propios ranks (0, 1, 2) vía `MPI_Allgather(&rank, 1, MPI_INT, buf, 1,
MPI_INT, comm)`, al terminar la llamada **cada uno** de los 3 procesos tiene
`buf = {0, 1, 2}` — no sólo un root distinguido, como sí ocurriría con
`MPI_Gather`.

## Casos especiales

Con $p = 1$, `MPI_Allgather` degenera en una copia local del único aporte.
A diferencia de `MPI_Gather`, aquí **todos** los buffers de recepción deben
tener espacio para `recvcnt` $\times\ p$ elementos, porque todos terminan con la
colección completa.
</content>
