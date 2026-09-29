---
kind: algorithm
title: "MPI_Reduce"
order: 5
visualization:
  type: network-topology
  steps:
    - note: "Antes de la llamada, cada proceso tiene su propio valor local (3, 8, 2, 4)."
      processes:
        - { id: p0, label: "P0: 3" }
        - { id: p1, label: "P1: 8" }
        - { id: p2, label: "P2: 2" }
        - { id: p3, label: "P3: 4", state: active }
      dataFlow: []
    - note: "MPI_Reduce combina los datos de todos los procesos con un operador (p.ej. suma) y deja el resultado en un único proceso raíz."
      processes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "root: 17", state: answer }
      dataFlow:
        - { from: p0, to: p3, label: "+" }
        - { from: p1, to: p3, label: "+" }
        - { from: p2, to: p3, label: "+" }
    - note: "MPI_Reduce también puede combinarse en árbol en vez de que el root sume los 3 aportes uno por uno: nivel 1 (de log2(4)=2) — p0 combina con p1 (3+8=11 en p1), y en paralelo p2 combina directo con el root p3 (2+4=6 en p3)."
      processes:
        - { id: p0, label: "P0", state: muted }
        - { id: p1, label: "P1: 11", state: active }
        - { id: p2, label: "P2", state: muted }
        - { id: p3, label: "root: 6", state: active }
      dataFlow:
        - { from: p0, to: p1, label: "+3" }
        - { from: p2, to: p3, label: "+2" }
    - note: "Nivel 2 (el último de log2(4)=2): p1 combina su suma parcial (11) con el root, dejando el total (17) en p3 — la misma cuenta que arriba, pero en sólo 2 pasos de combinación en vez de 3 sumas secuenciales."
      processes:
        - { id: p0, label: "P0", state: muted }
        - { id: p1, label: "P1", state: muted }
        - { id: p2, label: "P2", state: muted }
        - { id: p3, label: "root: 17", state: answer }
      dataFlow:
        - { from: p1, to: p3, label: "+11" }
---

## Qué hace

`MPI_Reduce` recopila los datos de todos los procesos del grupo y los
combina aplicando un operador (`op`) — por ejemplo suma, máximo, producto —
dejando el resultado final en un único proceso raíz.

## Intuición

Es como `MPI_Gather`, pero en vez de guardar cada aporte por separado en el
root, los va combinando en el camino con una operación (p.ej. sumándolos)
hasta quedarse con un solo valor final.

## Algoritmo

1. Cada proceso tiene un buffer `sendbuf` con `count` elementos de tipo
   `datatype`.
2. Todos llaman a `MPI_Reduce` con los mismos `count`, `datatype`, `op`,
   `root` y `comm`.
3. El root recibe en `recvbuf` el resultado de combinar, elemento a
   elemento, los aportes de todos los procesos con el operador `op`.

Operadores predefinidos:

| Nombre MPI | Función |
| --- | --- |
| `MPI_MAX` | Máximo |
| `MPI_MIN` | Mínimo |
| `MPI_SUM` | Suma |
| `MPI_PROD` | Producto |
| `MPI_LAND` | AND lógico |
| `MPI_BAND` | AND bit a bit |
| `MPI_LOR` | OR lógico |
| `MPI_BOR` | OR bit a bit |
| `MPI_LXOR` | XOR lógico |
| `MPI_BXOR` | XOR bit a bit |
| `MPI_MAXLOC` | Máximo y su ubicación |
| `MPI_MINLOC` | Mínimo y su ubicación |

## Pseudocódigo

```
MPI_Reduce(&sendbuf, &recvbuf, count, datatype, op, root, comm)
```

## C++

Este subtema no tiene `cppSteps` propio. El código de ejemplo está en
`cpp/practica/ejemplo01-bcast-reduce.cpp` y `ejemplo03-PI-reduce.cpp`
(cálculo de π), referenciado desde la [página de práctica](/practica).

## Complejidad

El material no da una cota propia distinta a la del broadcast en árbol
documentada en `meta.yaml` de `mpi-collectives` — conceptualmente una
reducción en árbol combina resultados parciales en $O(\log_2 p)$ pasos, de
forma simétrica a un broadcast.

## Ejemplo

Continuando el Ejemplo 01: tras el `MPI_Bcast` y la multiplicación por
rank, `MPI_Reduce` suma los resultados parciales de todos los procesos de
vuelta en el maestro:

```cpp
MPI_Reduce(&data, &resultado, 1, MPI_INT, MPI_SUM, 0, MPI_COMM_WORLD);
if (rank == 0)
    cout << "resultado: " << resultado << endl;
```

Con 4 procesos (ranks 0-3) y `data = 5` inicial multiplicado por cada rank
(0, 5, 10, 15), `resultado = 0+5+10+15 = 30` en el maestro.

## Casos especiales

Con $p = 1$, `MPI_Reduce` degenera en una copia directa del único aporte al
buffer de resultado del root (la "combinación" de un solo elemento es él
mismo). Sólo el root recibe un valor válido en `recvbuf`; en el resto de
procesos su contenido es indefinido — si todos necesitan el resultado, se
usa [`MPI_Allreduce`](/topics/mpi-collectives/algorithms/allreduce) en su lugar.
</content>
