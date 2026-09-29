---
kind: theory
title: "Introducción a MPI: comunicadores, rank, size, modos de envío"
visualization:
  type: network-topology
  steps:
    - note: "Cada proceso MPI tiene memoria local propia y se comunica sólo enviando/recibiendo mensajes explícitos por la red — nunca leyendo memoria ajena directamente."
      processes:
        - { id: p0, label: "P0", state: active }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      dataFlow: []
    - note: "MPI es agnóstico a la topología física subyacente. Un Fat Tree (típico en centros de datos) conecta cada proceso a través de niveles de switches, minimizando latencia entre nodos cercanos."
      processes:
        - { id: sw, label: "switch", state: marked }
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      dataFlow:
        - { from: sw, to: p0 }
        - { from: sw, to: p1 }
        - { from: sw, to: p2 }
        - { from: sw, to: p3 }
    - note: "Un Hypercube conecta cada proceso con $\\log_2(p)$ vecinos directos — conectividad logarítmica eficiente para algoritmos de reducción, como los que usan las colectivas de MPI."
      processes:
        - { id: p0, label: "P0", state: active }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      dataFlow:
        - { from: p0, to: p1 }
        - { from: p0, to: p2 }
        - { from: p1, to: p3 }
        - { from: p2, to: p3 }
    - note: "MPI_COMM_WORLD agrupa a todos los procesos lanzados por mpirun. Cada uno recibe un rank único desde 0 — el ejemplo Pekaboo usa ese rank para que cada proceso, ejecutando el mismo código (SPMD), tome una decisión distinta."
      processes:
        - { id: p0, label: "rank 0", state: active }
        - { id: p1, label: "rank 1" }
        - { id: p2, label: "rank 2", state: marked }
        - { id: p3, label: "rank 3" }
      dataFlow: []
---

<!--
Esqueleto fijo. Las 9 secciones son obligatorias y van en este orden.
-->

## ¿Qué problema resuelve?

Los modelos de la Unidad 2 (PRAM, análisis de desempeño con Amdahl/Gustafson)
asumen memoria compartida: todos los procesadores ven el mismo espacio de
direcciones. Esa suposición deja de sostenerse en un cluster, donde cada
nodo tiene su propia memoria física y no existe una dirección "global" que
todos puedan leer o escribir directamente.

**Message Passing** resuelve la coordinación entre procesos que **no**
comparten memoria: cada proceso tiene memoria local propia, y toda
comunicación con otro proceso ocurre mediante el envío y recepción explícita
de mensajes. Message Passing Interface (MPI) es la especificación estándar
para implementar ese modelo, independientemente de la topología de red
física sobre la que corra.

## Intuición

Pensá en p oficinas separadas, cada una con sus propios archivadores
(memoria local). Nadie puede entrar al archivador de la oficina vecina: si
una oficina necesita un dato de otra, tiene que pedirlo explícitamente por
correo interno (un mensaje), y la otra oficina tiene que decidir enviarlo.
MPI es el protocolo de ese correo interno: define cómo se dirige un mensaje
(a qué oficina/rank), qué contiene (buffer, count, datatype) y cuándo se da
por entregado (modo de envío).

Una característica clave: MPI es **agnóstico a la topología** de la red que
conecta las oficinas — puede ser un Fat Tree, un Torus, una Dragonfly o un
Hypercube — el programador siempre programa contra el mismo modelo lógico
(`MPI_COMM_WORLD`, rank, send/recv), sin importar el cableado físico.

## Estructura interna

**Espacio de memoria particionado.** La memoria total se divide entre los
p nodos que participan del cómputo; cada proceso sólo accede directamente a
su porción. El acceso a memoria local es significativamente más rápido que
el acceso a memoria remota (arquitectura **NUMA**, *Non-Uniform Memory
Access*).

**Comunicadores y `MPI_COMM_WORLD`.** Un *handle* es una referencia a una
estructura de datos interna de MPI. El comunicador es el handle central:
define un grupo de procesos que pueden enviarse mensajes entre sí. Al llamar
`MPI_Init`, MPI define automáticamente el comunicador global
`MPI_COMM_WORLD`, que agrupa a **todos** los procesos lanzados por `mpirun`.

- **rank**: identificador entero único del proceso dentro del comunicador,
  numerado desde 0: $rank \in [0, p-1]$.
- **size**: número total de procesos del comunicador ($size = p$).

Si se lanzan 4 procesos, $MPI\_COMM\_WORLD = \{P_0, P_1, P_2, P_3\}$.

**Versatilidad y portabilidad.** MPI no es un lenguaje sino una
especificación de biblioteca: el mismo código en C/C++ corre sin cambios
desde una laptop hasta un cluster masivo. Se estableció como estándar
portable en 1994 (versión 1.0); la versión más reciente es MPI-5 (2025), con
soporte de arquitecturas híbridas y paralelismo explícito. Las
implementaciones estables más usadas son **MPICH** y **OpenMPI**, con
bindings para Julia, MATLAB, Python, R y Rust.

**Ciclo de vida de un programa MPI.** Todo programa MPI sigue el mismo flujo:

```
#include <mpi.h>       -> incluir cabecera
declaración de variables
MPI_Init(&argc, &argv) -> inicializa el entorno (una sola vez, al inicio)
... trabajo y llamadas de paso de mensajes ...
MPI_Finalize()          -> termina el entorno y limpia estructuras
```

**API fundamental.** Las rutinas MPI retornan un entero para gestión de
errores; `MPI_SUCCESS` indica ejecución correcta.

| Función | Qué hace |
| --- | --- |
| `MPI_Init(&argc, &argv)` | Inicializa el entorno. Se llama una sola vez, al inicio. |
| `MPI_Comm_size(comm, &size)` | Obtiene el número total de procesos del comunicador. |
| `MPI_Comm_rank(comm, &rank)` | Obtiene el rank del proceso actual. |
| `MPI_Wtime()` | Retorna el tiempo de reloj en segundos (`double`), útil para medir tiempos de ejecución. |
| `MPI_Abort(comm, error)` | Termina todos los procesos del comunicador (p.ej. ante un error de configuración). |
| `MPI_Finalize()` | Finaliza el entorno y limpia estructuras. |

**Compilación y ejecución.** La compilación requiere wrappers específicos
por lenguaje:

| Lenguaje | Compilador | Comando de ejemplo |
| --- | --- | --- |
| C | `mpicc` | `mpicc -o prog.exe prog.c` |
| C++ | `mpic++` | `mpic++ -o prog.exe prog.cpp` |
| Fortran | `mpifort` | `mpifort -o prog.exe prog.f90` |

Para ejecutar el binario en 4 procesos: `mpirun -np 4 ./prog.exe`.

**Tipos básicos de MPI.** Un mensaje MPI no se describe sólo por su cantidad
de bytes, sino por la tripleta (buffer, count, datatype) — el desarrollo
completo de esto es tema de
[Tipos de datos derivados en MPI](/topics/mpi-derived-datatypes). Los tipos
predefinidos, para garantizar comunicación correcta en arquitecturas
heterogéneas, son:

| Tipo C/C++ | Tipo MPI |
| --- | --- |
| `char` | `MPI_CHAR` |
| `signed char` | `MPI_SIGNED_CHAR` |
| `unsigned char` | `MPI_UNSIGNED_CHAR` |
| `short` | `MPI_SHORT` |
| `unsigned short` | `MPI_UNSIGNED_SHORT` |
| `int` | `MPI_INT` |
| `unsigned int` | `MPI_UNSIGNED` |
| `long` | `MPI_LONG` |
| `unsigned long` | `MPI_UNSIGNED_LONG` |
| `float` | `MPI_FLOAT` |
| `double` | `MPI_DOUBLE` |
| `long double` | `MPI_LONG_DOUBLE` |

**Comunicación punto a punto bloqueante y sus 4 modos de envío.** La forma
más básica de transferencia de datos es punto a punto: un `MPI_Send` y un
`MPI_Recv` correspondiente. En el modo **bloqueante**, la rutina de envío no
retorna hasta que los datos han sido retirados del buffer de la aplicación
(ya sea porque el receptor los tomó, o porque el sistema los copió a un
buffer intermedio). MPI define cuatro modos de envío bloqueante:

| Modo | Función | Semántica |
| --- | --- | --- |
| Standard | `MPI_Send` | El sistema decide si es sincrónico o buffered según el tamaño del mensaje y un *threshold* interno. |
| Sincrónico | `MPI_Ssend` | El envío no finaliza hasta que el receptor ha iniciado la recepción del mensaje. Garantiza sincronía física. |
| Buffered | `MPI_Bsend` | Usa un buffer de usuario, reservado explícitamente con `MPI_Buffer_attach`. |
| Ready | `MPI_Rsend` | Sólo puede llamarse si el receptor ya posteó su `MPI_Recv`; si no, comportamiento indefinido (error). |

Los parámetros típicos de envío (`MPI_Send`) y recepción (`MPI_Recv`) son:

- **buffer**: dirección de la variable de datos.
- **count**: cantidad de elementos.
- **datatype**: tipo MPI del dato.
- **dest**/**source**: rank del proceso destino o remitente.
- **tag**: identificador del mensaje, para diferenciar múltiples envíos entre el mismo par de procesos.
- **status**: objeto (`MPI_Status`) con información del remitente y el tag del mensaje recibido — especialmente útil cuando se usa el comodín `MPI_ANY_SOURCE`. `status.MPI_SOURCE` da el rank del remitente, `status.MPI_TAG` el tag, y `MPI_Get_count` cuenta cuántos elementos del tipo especificado se recibieron realmente.

La comunicación **no bloqueante**, con `MPI_Isend`/`MPI_Irecv`/`MPI_Wait`, se
desarrolla en
[Comunicación bloqueante vs no bloqueante](/topics/mpi-blocking-nonblocking).

## Operaciones

`mpi-intro` no tiene subtemas propios. Las operaciones colectivas
(`MPI_Bcast`, `MPI_Scatter`, `MPI_Gather`, etc.) construidas sobre este
modelo se desarrollan en
[Operaciones colectivas de MPI](/topics/mpi-collectives).

## Análisis de complejidad

Este tema es puramente conceptual/estructural: no introduce una fórmula de
costo propia (esa discusión aparece recién con las colectivas y su
comparación árbol vs. secuencial en
[mpi-collectives](/topics/mpi-collectives)). Por eso `meta.yaml` deja
`complexity: {}` para este tema.

## Tabla de complejidad

No aplica — ver la sección anterior.

## Ejemplos

**Ejemplo Pekaboo (visto en clase).** Ilustra el modelo SPMD (*Single
Program Multiple Data*): todos los procesos ejecutan el mismo binario, pero
cada uno toma decisiones distintas usando su rank.

```cpp
#include <mpi.h>
#include <iostream>
using namespace std;

int main(int argc, char* argv[]) {
    int ierr, rank, size, dato = 10;

    ierr = MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    // 1. ejecutar la impresion solo si MPI_Init resulto (use MPI_SUCCESS)
    if (ierr == MPI_SUCCESS)
        printf("Pekaboo! desde %d de %d con dato: %d\n", rank, size, dato);

    // 2. modificar el valor de dato solo para que el proceso 2 tenga dato=20
    if (rank == 2) dato = 20;
    printf("rank %d de %d, con dato: %d\n", rank, size, dato);

    MPI_Finalize();
}
```

Con `mpirun -n 4 ./programa`, MPI crea cuatro procesos $P_0, P_1, P_2, P_3$.
El orden de impresión **no está determinado** porque los procesos se
ejecutan concurrentemente; una salida posible es:

```
Pekaboo! desde 0 de 4 con dato 10
Pekaboo! desde 1 de 4 con dato 10
Pekaboo! desde 3 de 4 con dato 10
Pekaboo! desde 2 de 4 con dato 10
```

**Ejemplo: intercambio de datos 1 a 1.** Envío estándar bloqueante de un
entero entre los ranks 0 y 1:

```cpp
#include <mpi.h>
#include <iostream>

int main(int argc, char* argv[]) {
    int rank, number;
    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);

    if (rank == 0) {
        number = -1;
        MPI_Send(&number, 1, MPI_INT, 1, 0, MPI_COMM_WORLD); // envío estandar bloqueante
    } else if (rank == 1) {
        MPI_Recv(&number, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
        std::cout << "Rank 1 recibio: " << number << std::endl;
    }

    MPI_Finalize();
    return 0;
}
```

Los ejercicios de práctica que usan esta base punto a punto (envío de
subvectores, filas de matrices, y el `MPI_Abort` con más de 2 procesos)
están en la [página de práctica](/practica).

## Comparación con temas relacionados

`mpi-intro` es el prerrequisito compartido de los otros tres temas de esta
unidad: [Operaciones colectivas de MPI](/topics/mpi-collectives) construye
sobre el modelo de comunicador/rank para definir patrones de comunicación
de grupo; [Comunicación bloqueante vs no bloqueante](/topics/mpi-blocking-nonblocking)
extiende los 4 modos de envío bloqueante vistos acá con sus contrapartes no
bloqueantes; [Tipos de datos derivados en MPI](/topics/mpi-derived-datatypes)
profundiza la tripleta (buffer, count, datatype) mencionada aquí. Frente al
modelo de memoria compartida de PRAM/OpenMP (Unidad 2), la diferencia
esencial es que aquí cada proceso posee su propio espacio de
direccionamiento privado — no hay lectura/escritura directa de datos ajenos.

## Prueba de dominio

Al terminar este tema debo poder:

- Explicar por qué el modelo de paso de mensajes es necesario cuando la
  memoria está distribuida entre nodos, y qué significa "arquitectura NUMA".
- Identificar `MPI_COMM_WORLD`, rank y size en un programa dado, y predecir
  qué imprime cada proceso en un ejemplo tipo SPMD.
- Nombrar los pasos del ciclo de vida de un programa MPI (`MPI_Init` →
  trabajo → `MPI_Finalize`) y las funciones básicas asociadas.
- Distinguir los 4 modos de envío bloqueante (Standard, Sincrónico,
  Buffered, Ready) por su función MPI y su condición de finalización.
- Escribir la sintaxis de `MPI_Send`/`MPI_Recv` con sus 6 parámetros
  (buffer, count, datatype, dest/source, tag, status).
</content>
