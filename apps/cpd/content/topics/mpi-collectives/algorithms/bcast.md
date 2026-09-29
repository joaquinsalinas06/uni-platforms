---
kind: algorithm
title: "MPI_Bcast"
order: 1
visualization:
  type: network-topology
  steps:
    - note: "Antes de la llamada, sólo el proceso root (rank 0) tiene el dato válido."
      processes:
        - { id: p0, label: "root", state: active }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      dataFlow: []
    - note: "MPI_Bcast envía el mismo mensaje completo del root a todos los demás procesos del grupo."
      processes:
        - { id: p0, label: "root", state: active }
        - { id: p1, label: "P1", state: answer }
        - { id: p2, label: "P2", state: answer }
        - { id: p3, label: "P3", state: answer }
      dataFlow:
        - { from: p0, to: p1, label: "buf" }
        - { from: p0, to: p2, label: "buf" }
        - { from: p0, to: p3, label: "buf" }
    - note: "En vez de que el root envíe directo a los 3 restantes, la implementación puede propagar en árbol: nivel 1 (de log2(4)=2) — el root p0 manda el buffer sólo a p1; p2 y p3 todavía no lo tienen."
      processes:
        - { id: p0, label: "root", state: active }
        - { id: p1, label: "P1", state: answer }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      dataFlow:
        - { from: p0, to: p1, label: "buf" }
    - note: "Nivel 2 (el último de log2(4)=2): ahora p0 y p1 —cada uno ya con el buffer— lo reenvían en paralelo a su par (p2 y p3 respectivamente). Con 4 procesos son 2 niveles en vez de 3 envíos secuenciales del root."
      processes:
        - { id: p0, label: "root", state: muted }
        - { id: p1, label: "P1", state: muted }
        - { id: p2, label: "P2", state: answer }
        - { id: p3, label: "P3", state: answer }
      dataFlow:
        - { from: p0, to: p2, label: "buf" }
        - { from: p1, to: p3, label: "buf" }
---

## Qué hace

`MPI_Bcast` envía un mensaje desde un proceso raíz (`root`) a **todos** los
procesos del grupo del comunicador, incluido el propio root. Al terminar la
llamada, el buffer tiene el mismo contenido en todos los procesos.

## Intuición

Es un anuncio: el root "publica" un valor y todos los demás procesos lo
reciben en la misma variable local. A diferencia de un `MPI_Send` en bucle
desde el root, la librería MPI puede optimizar internamente la propagación
(p.ej. en árbol, ver [mpi-collectives](/topics/mpi-collectives) § Análisis
de complejidad) en vez de enviar uno por uno.

## Algoritmo

1. Todos los procesos del comunicador (incluido `root`) llaman a
   `MPI_Bcast` con los mismos argumentos `count`, `datatype`, `root` y
   `comm`.
2. El proceso `root` provee el valor en `buf`; los demás proveen un buffer
   del mismo tamaño donde recibirán el valor.
3. Al retornar la llamada, `buf` contiene el mismo valor en todos los
   procesos.

## Pseudocódigo

```
MPI_Bcast(&buf, count, datatype, root, comm)
```

## C++

Este subtema no tiene `cppSteps` propio — el código de ejemplo (bcast +
reducción) está en `cpp/practica/ejemplo01-bcast-reduce.cpp` y se referencia
desde la [página de práctica](/practica).

## Complejidad

Ver [mpi-collectives](/topics/mpi-collectives) § Análisis de complejidad: un
broadcast secuencial (root envía uno por uno) cuesta $O(p)$; un
broadcast en árbol binario, $O(\log_2 p)$. La elección concreta de
algoritmo interno la hace la implementación MPI, no el programador.

## Ejemplo

Del Ejemplo 01 de clase: el maestro fija `data=5` y lo difunde a todos antes
de que cada proceso lo multiplique por su rank:

```cpp
if (rank == 0) data = 5;
MPI_Bcast(&data, 1, MPI_INT, 0, MPI_COMM_WORLD);
data *= rank; // ahora cada proceso tiene un valor distinto
```

## Casos especiales

Con $p = 1$ (un solo proceso en el comunicador), `MPI_Bcast` es un no-op: el
único proceso ya tiene su propio dato como root. Con `count = 0`, la llamada
sigue siendo válida pero no transmite payload — sólo participa como punto de
sincronización implícito del grupo.
</content>
