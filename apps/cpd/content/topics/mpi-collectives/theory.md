---
kind: theory
title: "Operaciones colectivas de MPI"
visualization:
  type: network-topology
  steps:
    - note: "Sin colectivas, difundir un dato de un proceso raíz a p-1 procesos con Send/Recv secuenciales cuesta O(p) llamadas."
      processes:
        - { id: p0, label: "root", state: active }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      dataFlow:
        - { from: p0, to: p1, label: "1" }
        - { from: p0, to: p2, label: "2" }
        - { from: p0, to: p3, label: "3" }
    - note: "Un algoritmo en árbol reduce ese costo a O(log2(p)) niveles de envío: cada proceso que ya recibió el dato lo reenvía a otro nuevo en el siguiente nivel."
      processes:
        - { id: p0, label: "root", state: active }
        - { id: p1, label: "P1", state: marked }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      dataFlow:
        - { from: p0, to: p1, label: "nivel 1" }
        - { from: p0, to: p2, label: "nivel 1" }
        - { from: p1, to: p3, label: "nivel 2" }
    - note: "MPI_Barrier no mueve datos: sólo sincroniza, bloqueando a cada proceso hasta que todos los miembros del comunicador la hayan llamado."
      processes:
        - { id: p0, label: "P0", state: marked }
        - { id: p1, label: "P1", state: marked }
        - { id: p2, label: "P2", state: marked }
        - { id: p3, label: "P3", state: active }
      dataFlow: []
---

<!--
Esqueleto fijo. Las 9 secciones son obligatorias y van en este orden.
-->

## ¿Qué problema resuelve?

En [mpi-intro](/topics/mpi-intro) toda comunicación es punto a punto: un
`MPI_Send` y un `MPI_Recv` entre exactamente dos procesos. Muchos patrones
de coordinación son en realidad de **grupo completo**: repartir un mismo
dato a todos, distribuir partes distintas de un array entre todos,
recolectar los resultados parciales de todos en uno, o combinar (sumar,
promediar) los valores de todos en un solo resultado. Implementar esos
patrones a mano con Send/Recv en bucle es correcto pero ineficiente — un
broadcast secuencial cuesta O(p) llamadas desde la raíz — y la librería MPI
puede optimizarlo internamente (p.ej. con un árbol, O(log2(p))). Las
**operaciones colectivas** son la solución: rutinas de comunicación de grupo
ya optimizadas por la implementación MPI.

## Intuición

En vez de que la raíz llame a `MPI_Send` p-1 veces (uno por uno, como
repartir cartas una por una en fila), una colectiva es una única llamada que
**todos** los procesos del comunicador hacen a la vez, y la librería decide
internamente el mejor patrón de comunicación física para cumplirla (árbol,
anillo, etc.) — el ejemplo de la diapositiva del profesor compara
exactamente esto: $O(\#\text{procesos})$ de un broadcast secuencial ingenuo contra
$O(\log_2(\#\text{procesos}))$ de un broadcast en árbol.

## Estructura interna

**Propiedades comunes a toda operación colectiva:**

- Facilitan operaciones de comunicación de grupo sin interferir con la
  comunicación punto a punto.
- **Todos** los procesos en el comunicador deben participar de la llamada
  colectiva.
- En un comunicador, cada llamada colectiva debe incluir a todos los
  procesos del grupo (no hay colectivas "parciales").
- El buffer se reutiliza sólo cuando el proceso termina su participación en
  la operación.

> **Nota de apoyo** (no está en el material): las llamadas colectivas no
> están necesariamente sincronizadas entre sí como una barrera — un proceso
> puede retornar de la colectiva antes de que otro lo haga — salvo
> `MPI_Barrier`, que sí bloquea explícitamente hasta que todos llegan.

**MPI_Barrier — sincronización pura.** Es la única colectiva que no
transporta datos: bloquea al proceso llamante hasta que todos los miembros
del grupo han llamado también a `MPI_Barrier`.

```
MPI_Barrier(comm)
```

Normalmente `MPI_Barrier` **no** hace falta, porque la sincronización de
datos ya es automática (un proceso no puede seguir sin la data que espera
recibir). Es útil para *debugging*, pero debe removerse en la versión final
del código — usarla de forma permanente introduce sincronización
innecesaria y penaliza el desempeño.

## Operaciones

Los 6 subtemas de esta unidad, en el orden en que la práctica de clase los
introduce:

1. [`bcast`](/topics/mpi-collectives/algorithms/bcast) — `MPI_Bcast`, difusión de un dato del root a todos.
2. [`scatter`](/topics/mpi-collectives/algorithms/scatter) — `MPI_Scatter`, reparto de porciones distintas del root a cada proceso.
3. [`gather`](/topics/mpi-collectives/algorithms/gather) — `MPI_Gather`, recolección inversa a scatter.
4. [`allgather`](/topics/mpi-collectives/algorithms/allgather) — `MPI_Allgather`, gather seguido de un broadcast del resultado completo.
5. [`reduce`](/topics/mpi-collectives/algorithms/reduce) — `MPI_Reduce`, recolección con combinación (suma, máx, etc.) en el root.
6. [`allreduce`](/topics/mpi-collectives/algorithms/allreduce) — `MPI_Allreduce`, reduce seguido de un broadcast del resultado a todos.

## Análisis de complejidad

El único costo que el profesor compara explícitamente es el de un broadcast:
un algoritmo secuencial ingenuo (la raíz envía uno por uno) cuesta
$O(\#\text{procesos})$; un algoritmo en árbol binario cuesta $O(\log_2(\#\text{procesos}))$,
porque en cada nivel del árbol se duplica la cantidad de procesos que ya
tienen el dato y pueden reenviarlo. La librería MPI decide internamente cuál
usar — el programador sólo ve la llamada `MPI_Bcast`. El razonamiento
detallado de cada colectiva individual (bcast, scatter, gather, allgather,
reduce, allreduce) va en su propio archivo de `algorithms/`.

## Tabla de complejidad

Ver `meta.yaml` — el único caso con costo propio en este nivel es el
broadcast en árbol (`bcast-arbol`), documentado arriba. Los archivos de
`algorithms/*.md` no repiten costos que el material no distingue por
colectiva individual (el profesor no dio, por ejemplo, una cota distinta
para scatter vs. gather).

## Ejemplos

**Ejemplo 01: Bcast y reducción.** El maestro (rank 0) fija `data=5`, lo
difunde a todos con `MPI_Bcast`, cada proceso lo multiplica por su rank, y
`MPI_Reduce` suma los resultados parciales de vuelta en el maestro:

```cpp
if (rank == 0) data = 5;
MPI_Bcast(&data, 1, MPI_INT, 0, MPI_COMM_WORLD);
data *= rank;
MPI_Reduce(&data, &resultado, 1, MPI_INT, MPI_SUM, 0, MPI_COMM_WORLD);
```

**Ejemplo 02: Scatter/Gather.** El maestro inicializa un array `globaldata`
de tamaño `np` en el proceso 0, lo reparte con `MPI_Scatter` (uno por
proceso), cada proceso multiplica su valor local por 2, y `MPI_Gather` lo
recolecta de vuelta.

**Ejercicios de práctica derivados de estas colectivas** — el cálculo de π
por integración numérica (con `MPI_Bcast` + `MPI_Reduce`) y el promedio de
1000 números (con `MPI_Scatter` + `MPI_Gather`) — están desarrollados con su
enunciado completo en la [página de práctica](/practica), junto al código
correspondiente en `cpp/practica/`.

## Comparación con temas relacionados

Todas las colectivas comparten las propiedades de esta sección "Estructura
interna" — la comparación entre ellas específicamente (qué mueve cada una,
en qué dirección) está en la tabla de cada `algorithms/*.md`. Frente a la
comunicación punto a punto de [mpi-intro](/topics/mpi-intro), la diferencia
es de alcance: point-to-point mueve datos entre 2 procesos con control total
sobre el modo de envío; una colectiva mueve datos entre **todos** los
procesos del comunicador con un patrón fijo que la librería optimiza.

## Prueba de dominio

Al terminar este tema debo poder:

- Explicar por qué una colectiva puede ser más eficiente que su equivalente
  con Send/Recv en bucle, y en qué se basa esa ganancia (árbol vs.
  secuencial).
- Enumerar las propiedades que toda colectiva respeta (participación total,
  reutilización del buffer, no interferencia con punto a punto).
- Explicar cuándo usar `MPI_Barrier` y por qué normalmente no hace falta.
- Distinguir, para cada una de las 6 colectivas, quién envía, quién recibe,
  y si hay o no un proceso raíz.
</content>
