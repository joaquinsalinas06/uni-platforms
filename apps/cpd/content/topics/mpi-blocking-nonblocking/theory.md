---
kind: theory
title: "Comunicación bloqueante vs no bloqueante"
visualization:
  type: timeline
  steps:
    - note: "Bajo el threshold (protocolo eager), MPI_Send copia el mensaje al buffer del sistema y retorna de inmediato; el emisor puede seguir operando aunque el receptor todavía no haya llamado a Recv."
      lanes:
        - { id: s, label: "S (emisor)" }
        - { id: r, label: "R (receptor)" }
      events:
        - { lane: s, tStart: 0, tEnd: 1, label: "copia al buffer" }
        - { lane: s, tStart: 1, tEnd: 4, label: "sigue operando" }
        - { lane: r, tStart: 3, tEnd: 5, label: "espera" }
      messages:
        - { fromLane: s, toLane: r, tStart: 1, tEnd: 5, label: "MPI_Send" }
    - note: "Sobre el threshold (protocolo rendezvous), MPI_Send funciona como un envío sincrónico: no se completa hasta que el receptor ha iniciado su MPI_Recv."
      lanes:
        - { id: s, label: "S (emisor)" }
        - { id: r, label: "R (receptor)" }
      events:
        - { lane: s, tStart: 0, tEnd: 4, label: "espera" }
        - { lane: r, tStart: 2, tEnd: 3, label: "directiva inicia recibo" }
      messages:
        - { fromLane: s, toLane: r, tStart: 0, tEnd: 4, label: "MPI_Send" }
    - note: "Bloqueo mutuo (deadlock): si todos los procesos de un anillo hacen primero Send sincrónico hacia la derecha, ninguno llega nunca a su Recv, porque todos están esperando dentro de su propio Send."
      lanes:
        - { id: p0, label: "rank 0" }
        - { id: p1, label: "rank 1" }
        - { id: p2, label: "rank 2" }
        - { id: p3, label: "rank 3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 5, label: "MPI_Send (bloqueado)", state: marked }
        - { lane: p1, tStart: 0, tEnd: 5, label: "MPI_Send (bloqueado)", state: marked }
        - { lane: p2, tStart: 0, tEnd: 5, label: "MPI_Send (bloqueado)", state: marked }
        - { lane: p3, tStart: 0, tEnd: 5, label: "MPI_Send (bloqueado)", state: marked }
      messages: []
    - note: "Orden seguro: si el rank 0 rompe el ciclo recibiendo primero y enviando después (mientras el resto envía primero y recibe después), el anillo se completa sin bloqueo mutuo."
      lanes:
        - { id: p0, label: "rank 0" }
        - { id: p1, label: "rank 1" }
        - { id: p2, label: "rank 2" }
        - { id: p3, label: "rank 3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 2, label: "Recv", state: answer }
        - { lane: p0, tStart: 2, tEnd: 4, label: "Send" }
        - { lane: p1, tStart: 0, tEnd: 2, label: "Send", state: answer }
        - { lane: p1, tStart: 2, tEnd: 4, label: "Recv" }
        - { lane: p2, tStart: 0, tEnd: 2, label: "Send", state: answer }
        - { lane: p2, tStart: 2, tEnd: 4, label: "Recv" }
        - { lane: p3, tStart: 0, tEnd: 2, label: "Send", state: answer }
        - { lane: p3, tStart: 2, tEnd: 4, label: "Recv" }
      messages: []
---

<!--
Esqueleto fijo. Las 9 secciones son obligatorias y van en este orden.
-->

## ¿Qué problema resuelve?

En [mpi-intro](/topics/mpi-intro) toda la comunicación punto a punto vista
es **bloqueante**: la rutina de envío/recepción no retorna hasta que el
buffer puede reutilizarse con seguridad. Eso es simple de razonar, pero
tiene dos costos: (1) el proceso queda parado esperando en vez de seguir
computando, y (2) un patrón de comunicación mal ordenado entre varios
procesos (p.ej. un anillo donde todos envían primero) puede producir
**bloqueo mutuo** (deadlock) — ningún proceso avanza porque todos esperan a
que otro reciba primero. La comunicación **no bloqueante** resuelve el
primer problema (solapar cómputo con comunicación) y, bien usada, también
ayuda a evitar el segundo.

## Intuición

**Bloqueante** es como hacer una llamada telefónica: no podés colgar (seguir
haciendo otra cosa) hasta que la otra persona atienda y termine de escuchar
el mensaje (o, en el caso *buffered*, hasta que lo dejaste grabado en un
contestador). **No bloqueante** es como mandar un correo: lo redactás
(`MPI_Isend`), seguís con otras tareas, y en algún momento posterior
verificás si ya fue entregado (`MPI_Wait`/`MPI_Test`) antes de reutilizar lo
que escribiste.

## Estructura interna

### Repaso: comunicación bloqueada

En un envío bloqueante existe un **umbral** (threshold, típicamente de
algunos KB a MB) que determina el protocolo interno:

- **Bajo el umbral (protocolo *eager*)**: `MPI_Send` copia el mensaje a un
  buffer del sistema y retorna de inmediato — el proceso origen puede seguir
  operando. El buffer se copia al proceso destino recién cuando éste llama a
  `MPI_Recv`.
- **Sobre el umbral (protocolo *rendezvous*)**: `MPI_Send` funciona como un
  envío sincrónico — no se completa hasta que el receptor ha comenzado su
  `MPI_Recv`. De esta forma, mensajes pequeños tienen menor overhead (por el
  uso del buffer), mientras que mensajes grandes no ocupan rápidamente todo
  el espacio de buffer disponible.

> **Nota de apoyo** (no está en el material): cuál de los dos protocolos se
> activa depende de la implementación MPI concreta (MPICH, OpenMPI) y de su
> configuración de threshold — el estándar MPI no fija ese valor.

### Comunicación cíclica y no cíclica — el problema del deadlock

Considerá un anillo de procesos donde cada uno envía a su vecino derecho y
recibe de su vecino izquierdo:

```
MPI_Send(..., right_rank, ...);
MPI_Recv(..., left_rank, ...);
```

Si el envío es sincrónico (o estándar por encima del threshold), **todos**
los procesos quedan esperando dentro de su propio `MPI_Send` a que su vecino
llame a `MPI_Recv` — pero ese vecino también está bloqueado en su propio
`MPI_Send`. Es un **bloqueo mutuo (deadlock)** cíclico: nadie avanza.

Dos formas de romper el ciclo con comunicación **bloqueante**:

1. **Orden distinto por rank**: si `myrank < size-1`, primero `Send` y
   luego `Recv`; si `myrank == size-1` (el último), primero `Recv` y luego
   `Send`. Esto rompe la dependencia circular.
2. **Alternar por paridad**: si `myrank % 2 == 0`, primero `Send` luego
   `Recv`; si es impar, al revés.

### Comunicación no bloqueada

Se realiza en 3 pasos:

1. **Inicializa** la comunicación no bloqueada — la "I" de `MPI_Isend`/
   `MPI_Irecv` significa retorno inmediato ("immediate"), la ejecución
   continúa sin esperar a que la operación termine.
2. **Realiza cómputo o comunicación** — otro trabajo útil mientras la
   comunicación avanza en segundo plano.
3. **Espera** hasta que se completa la comunicación: el buffer de envío es
   leído, o el buffer de recibo se llena.

> Analogía del profesor: un `Send` no bloqueado es como un correo de
> invitación a una reunión (se confirma después); un `Receive` no bloqueado
> es como recibir mensajes sin tener la aplicación abierta en primer plano.

**Firma de las rutinas no bloqueantes:**

```
int MPI_Isend(void* buf, int count, MPI_Datatype datatype,
              int dest, int tag, MPI_Comm comm, MPI_Request *request);

int MPI_Irecv(void* buf, int count, MPI_Datatype datatype,
              int source, int tag, MPI_Comm comm, MPI_Request *request);
```

Cada llamada no bloqueante devuelve un **request** (`MPI_Request`), que se
usa después para verificar o esperar la finalización:

```
int MPI_Wait(MPI_Request *req, MPI_Status *status);
int MPI_Test(MPI_Request *req, int *flag, MPI_Status *status);
```

`MPI_Wait` bloquea hasta que la operación referenciada por `req` se
completa. `MPI_Test` sólo observa: `flag` indica si ya terminó (`TRUE`) o no
(`FALSE`), sin bloquear.

**Comunicación múltiple.** MPI permite controlar varias operaciones a la
vez, esperando a que se completen todas (`all`), al menos una (`any`), o
algunas (`some`):

| Para completar | WAIT (bloqueante) | TEST (sólo consulta) |
| --- | --- | --- |
| Al menos una, retorna exactamente una | `MPI_WAITANY` | `MPI_TESTANY` |
| Todas | `MPI_WAITALL` | `MPI_TESTALL` |
| Al menos una, retorna todas las completadas | `MPI_WAITSOME` | `MPI_TESTSOME` |

**Cada modo de envío bloqueante tiene su contraparte no bloqueante:**

| Non-Blocking Operation | MPI Call |
| --- | --- |
| Standard send | `MPI_Isend` |
| Synchronous send | `MPI_Issend` |
| Buffered Send | `MPI_Ibsend` |
| Ready send | `MPI_Irsend` |
| Receive | `MPI_Irecv` |

Un `Send` bloqueado puede combinarse con un `Recv` no bloqueado, y
viceversa; los `Send` no bloqueados pueden usar cualquiera de los 4 modos
(sincronizado, buffered, standard o ready) descritos en
[mpi-intro](/topics/mpi-intro).

**Anillo cíclico con no bloqueante.** Con `MPI_Isend`, cada proceso
inicializa el envío hacia su vecino derecho y **continúa trabajando** —
en particular, puede seguir recibiendo del vecino izquierdo — sin quedar
atrapado en el ciclo de espera mutua. La comunicación se completa recién con
el `MPI_Wait` del envío no bloqueado. Simétricamente, con `MPI_Irecv` el
proceso inicializa el recibo y sigue trabajando (p.ej. enviando al vecino
derecho) antes de esperar con `MPI_Wait`.

**Ejemplo aplicado: suavizado (smoothing).** Un algoritmo de suavizado 1D
promedia cada elemento con sus vecinos inmediatos; los extremos de cada
sub-array (halo/boundary) necesitan comunicarse con los procesos vecinos:

- **Con bloqueo**: la comunicación no retorna ningún valor hasta que está
  terminada (buffer libre de nuevo) — el proceso no puede empezar a
  actualizar celdas internas mientras espera el borde.
- **Sin bloqueo**: se separa el envío/recibo de los bordes del cómputo de
  las celdas internas. `MPI_Isend`/`MPI_Irecv` retornan de inmediato,
  permitiendo actualizar las celdas internas (`update inner cells`)
  mientras la comunicación de frontera avanza en paralelo, y sólo al final
  se actualizan las celdas de borde (`update bound. cells`) tras el
  `MPI_Wait`.

## Operaciones

`mpi-blocking-nonblocking` no tiene subtemas propios: bloqueante y no
bloqueante se desarrollan juntos en la sección anterior, por ser dos caras
del mismo mecanismo de comunicación punto a punto.

## Análisis de complejidad

Este tema es conceptual (protocolos y patrones de sincronización, no una
fórmula de costo por elemento) — el material no da una cota distinta a la
ya vista en [mpi-intro](/topics/mpi-intro) para $T_{comm} = \alpha + x\beta$.
Por eso `meta.yaml` deja `complexity: {}`. Lo relevante para este tema no es
"cuánto cuesta" sino "cuándo se solapa con cómputo" — que la comunicación no
bloqueante permite ocultar parte de $\alpha$ (latencia) detrás de trabajo
útil.

## Tabla de complejidad

No aplica — ver la sección anterior.

## Ejemplos

**Algoritmo de suavizado bloqueante (PRAM por proceso).** Del material de
clase, para un array $A$ de $n/p + 2$ elementos por proceso $j$ (de $p$
procesos):

```
for i = 1 to n/p do
  A(i) := smooth(i-1, i, i+1)
if (j == 1) then
  Send(A(n/p) -> j+1), Receive(A(1) <- j+1)
else if (j == p) then
  Send(A(1) -> j-1), Receive(A(n/p) <- j-1)
else
  Send(A(1) -> j-1), Send(A(n/p) -> j+1)
  Receive(A(n/p) <- j-1), Receive(A(1) <- j+1)
```

**Algoritmo de suavizado no bloqueante**, separando la actualización de
bordes (`Isend`/`Ireceive`) de la actualización de celdas internas:

```
A(1) := smooth(0, 1, 2)
A(n/p) := smooth((n/p-1), (n/p), (n/p+1))
if (j == 1) then
  Isend(A(n/p) -> j+1), Ireceive(A(1) <- j+1)
else if (j == p) then
  Isend(A(1) -> j-1), Ireceive(A(n/p) <- j-1)
else
  Isend(A(1) -> j-1), Isend(A(n/p) -> j+1)
  Ireceive(A(n/p) <- j-1), Ireceive(A(1) <- j+1)

for i = 2 to n/p - 1 do
  A(i) := smooth(i-1, i, i+1)  // celdas internas, mientras el borde viaja
MPI_Wait()
```

El código de laboratorio equivalente (envío/recibo bloqueado vs. no
bloqueado en un anillo) está en `cpp/practica/ejemplo01a_bloqueada.cpp`
hasta `ejemplo01d_nobloqueada.cpp`, referenciado con su enunciado completo
en la [página de práctica](/practica).

## Comparación con temas relacionados

| | Bloqueante | No bloqueante |
| --- | --- | --- |
| Retorno de la llamada | Cuando el buffer puede reutilizarse | Inmediato; requiere `MPI_Wait`/`MPI_Test` después |
| Riesgo de deadlock cíclico | Sí, si el orden Send/Recv no se rompe | Mucho menor: `Isend`/`Irecv` no esperan a su contraparte |
| Solapamiento cómputo/comunicación | No | Sí |
| Funciones | `MPI_Send`, `MPI_Ssend`, `MPI_Bsend`, `MPI_Rsend`, `MPI_Recv` | `MPI_Isend`, `MPI_Issend`, `MPI_Ibsend`, `MPI_Irsend`, `MPI_Irecv` |

Respecto a [mpi-intro](/topics/mpi-intro): los 4 modos de envío (Standard,
Sincrónico, Buffered, Ready) son los mismos conceptos; acá se agrega su
versión no bloqueante y el mecanismo de `request`/`MPI_Wait` para
completarlos.

## Prueba de dominio

Al terminar este tema debo poder:

- Explicar la diferencia entre protocolo *eager* y *rendezvous*, y cuándo se
  activa cada uno.
- Identificar, en un patrón de anillo dado, si genera deadlock cíclico o no,
  y proponer un reordenamiento (por rank o por paridad) que lo evite.
- Escribir la secuencia mínima `Isend`/`Irecv` + `Wait` para no bloquear el
  proceso mientras espera.
- Explicar qué distingue `MPI_Wait` de `MPI_Test`, y cuándo usar
  `MPI_Waitall` en vez de esperar cada request por separado.
- Explicar por qué separar la comunicación de bordes del cómputo de celdas
  internas (ejemplo de suavizado) mejora el desempeño con comunicación no
  bloqueante.
</content>
