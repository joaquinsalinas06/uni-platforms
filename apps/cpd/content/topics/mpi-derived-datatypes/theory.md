---
kind: theory
title: "Tipos de datos derivados en MPI"
visualization:
  type: memory-layout
  steps:
    - note: "Con MPI_Type_contiguous, el nuevo tipo agrupa varios elementos consecutivos del mismo tipo básico — sin huecos entre ellos."
      blocks:
        - { id: b0, label: "double", bytes: 8, offset: 0, state: active }
        - { id: b1, label: "double", bytes: 8, offset: 8, state: active }
        - { id: b2, label: "double", bytes: 8, offset: 16, state: active }
    - note: "Con MPI_Type_vector, se seleccionan bloques regularmente espaciados — p.ej. una columna de una matriz, donde entre cada elemento hay un stride de N elementos."
      blocks:
        - { id: v0, label: "a[0][j]", bytes: 8, offset: 0, state: active }
        - { id: gap0, label: "fila 0", bytes: 24, offset: 8, state: muted }
        - { id: v1, label: "a[1][j]", bytes: 8, offset: 32, state: active }
        - { id: gap1, label: "fila 1", bytes: 24, offset: 40, state: muted }
        - { id: v2, label: "a[2][j]", bytes: 8, offset: 64, state: active }
    - note: "Con MPI_Type_create_struct se describe una estructura heterogénea, incluyendo el padding que el compilador inserta entre campos para alinear memoria."
      blocks:
        - { id: s0, label: "char", bytes: 1, offset: 0, state: active }
        - { id: pad, label: "padding", bytes: 3, offset: 1, state: muted }
        - { id: s1, label: "int", bytes: 4, offset: 4, state: active }
        - { id: s2, label: "int", bytes: 4, offset: 8, state: active }
        - { id: gap2, label: "padding", bytes: 4, offset: 12, state: muted }
        - { id: s3, label: "double", bytes: 8, offset: 16, state: active }
---

<!--
Esqueleto fijo. Las 9 secciones son obligatorias y van en este orden.
-->

## ¿Qué problema resuelve?

En [mpi-intro](/topics/mpi-intro) todos los mensajes usan tipos MPI
**predefinidos** (`MPI_INT`, `MPI_DOUBLE`, ...) sobre datos **contiguos** en
memoria. Pero muchos programas reales necesitan enviar datos que:

- **no son contiguos** de un solo tipo (p.ej. una columna de una matriz
  almacenada por filas, o una submatriz), o
- **son contiguos pero de distintos tipos** (p.ej. un contador entero
  seguido de varios doubles, como en un `struct`).

Enviar esos datos elemento por elemento (una llamada `MPI_Send` por
elemento) es extremadamente ineficiente: el tiempo de comunicación
$T_{comm} = \alpha + x\beta$ está dominado por la **latencia de inicio**
($\alpha$) más que por el tiempo de transmisión por palabra ($\beta$), así
que 1000 llamadas pagan 1000 veces esa latencia. Los **tipos de datos
derivados** resuelven esto: describen un patrón de memoria (contiguo, con
stride regular, irregular, o heterogéneo) para que una sola llamada MPI
transmita todos los elementos de una vez.

## Intuición

Un mensaje MPI se describe siempre como `(buffer, count, datatype)`:
dirección inicial, cantidad de elementos, y tipo de cada elemento —
conceptualmente, *Mensaje MPI = cantidad × tipo de dato*. Un tipo derivado
es una "plantilla" que describe **dónde** están los datos en memoria (no
sólo su tipo elemental), para que MPI pueda ir a buscarlos él mismo sin que
el programador tenga que copiarlos antes a un array contiguo. Es la
diferencia entre decirle al cartero "andá a buscar estas 5 cartas sueltas
por toda la oficina" (tipo derivado) versus juntarlas vos mismo antes en un
sobre y dárselas ya listas (copiar a buffer manualmente).

## Estructura interna

**La tripleta (buffer, count, datatype).** MPI no describe los mensajes
únicamente por su cantidad de bytes: cada operación de comunicación
especifica `buffer` (dirección inicial de los datos), `count` (número de
elementos) y `datatype` (tipo MPI de cada elemento). Por ejemplo:

```cpp
int A[100];
MPI_Send(A, 100, MPI_INT, 1, 0, MPI_COMM_WORLD);
```

envía 100 elementos de tipo `MPI_INT` — el sistema usa esta información para
interpretar correctamente los datos incluso en arquitecturas heterogéneas,
donde la representación de un `int` o `double` puede variar de una máquina a
otra.

`count` y `datatype` se interpretan **conjuntamente**: `MPI_Send(A, 10,
MPI_DOUBLE, ...)` envía 10 `MPI_DOUBLE`; `MPI_Send(A, 20, MPI_INT, ...)`
envía 20 `MPI_INT`. `count` nunca indica bytes, sino número de elementos del
tipo especificado. El tamaño en bytes de un tipo puede consultarse con
`MPI_Type_size(MPI_DOUBLE, &size)`.

**Tipos básicos** — ver la tabla completa en
[mpi-intro](/topics/mpi-intro) § Estructura interna.

**Qué es un tipo derivado.** Un tipo derivado MPI es, conceptualmente, un
puntero a una lista de entradas confirmadas por tipos básicos y sus
desplazamientos (*displacements*) relativos en memoria — describe la
estructura de la data (de un `struct`, de un subarray) sin copiarla. Por
ejemplo, para una secuencia en memoria `char, int, int, double`:

| basic datatype | displacement |
| --- | --- |
| `MPI_CHAR` | 0 |
| `MPI_INT` | 4 |
| `MPI_INT` | 8 |
| `MPI_DOUBLE` | 16 |

**Ciclo de vida de un tipo derivado:**

1. **Construcción**: llamar a una función constructora (`MPI_Type_contiguous`, `MPI_Type_vector`, `MPI_Type_indexed`, `MPI_Type_create_struct`).
2. **Confirmación (commit)**: llamar a `MPI_Type_commit(&tipo)` antes de usarlo en comunicaciones — sólo después del commit puede usarse en operaciones como `MPI_Send` o `MPI_Bcast`.
3. **Uso**: emplearlo en funciones de comunicación con `count = 1` (un solo elemento del tipo derivado).
4. **Liberación**: llamar a `MPI_Type_free(&tipo)` cuando ya no se necesite.

**`MPI_Type_contiguous` — bloques contiguos del mismo tipo.**

```c
int MPI_Type_contiguous(int count, MPI_Datatype old_type, MPI_Datatype *new_type);
```

Crea un tipo compuesto por `count` elementos consecutivos de `old_type`. Por
ejemplo, un punto 3D como 3 `MPI_DOUBLE` consecutivos:

```cpp
MPI_Datatype punto3D;
MPI_Type_contiguous(3, MPI_DOUBLE, &punto3D);
MPI_Type_commit(&punto3D);
MPI_Send(&P[i][0], 1, punto3D, destino, tag, MPI_COMM_WORLD);
MPI_Type_free(&punto3D);
```

`MPI_Send(A, 1, bloque, ...)` con `bloque` de 4 `MPI_DOUBLE` es equivalente
a `MPI_Send(A, 4, MPI_DOUBLE, ...)`, pero permite darle un nombre lógico al
patrón (útil cuando se envía más de una fila con nombre propio, p.ej.
`rowtype`).

**`MPI_Type_vector` — bloques regularmente espaciados.**

```c
int MPI_Type_vector(int count, int blocklength, int stride,
                     MPI_Datatype datatype, MPI_Datatype *newtype);
```

- `count`: número de bloques.
- `blocklength`: elementos por bloque.
- `stride`: distancia entre el inicio de bloques consecutivos, en cantidad
  de elementos del tipo original.

**Ejemplo: columna de una matriz.** En C, una matriz `double A[4][4]` se
almacena por filas: una fila es contigua, pero una columna
($a_{01}, a_{11}, a_{21}, a_{31}$) no lo es. Para describir la columna `j`:

```cpp
MPI_Datatype columna;
MPI_Type_vector(4, 1, 4, MPI_DOUBLE, &columna);
MPI_Type_commit(&columna);
MPI_Send(&A[0][j], 1, columna, destino, tag, MPI_COMM_WORLD);
```

Acá `count = 4` (cuatro elementos en la columna), `blocklength = 1` (cada
bloque es un único elemento), `stride = 4` (cuatro elementos por fila, la
distancia entre un elemento de la columna y el siguiente).

**`MPI_Type_indexed` — distribución irregular.**

```c
int MPI_Type_indexed(int count, int blocklengths[], int displacements[],
                      MPI_Datatype datatype, MPI_Datatype *newtype);
```

Para cuando los bloques no tienen tamaño ni separación uniformes:
`blocklengths[]` da la longitud de cada bloque, `displacements[]` la
distancia de cada bloque desde el inicio del array. Por ejemplo, con
`count=2`, `blocklengths={4,2}`, `displacements={5,12}` sobre un array de 16
elementos, se seleccionan `a[5..8]` y `a[12..13]` en un solo mensaje —
patrones como $A[0], A[3], A[4], A[10], A[15]$ sin separación constante.

**`MPI_Type_create_struct` — estructuras heterogéneas y el problema del
padding.** Es la herramienta para transmitir un `struct` de C con campos de
distinto tipo en una sola comunicación, en vez de una llamada `MPI_Send` por
campo.

```c
int MPI_Type_create_struct(int count, int array_of_blocklengths[],
                            MPI_Aint array_of_displacements[],
                            MPI_Datatype array_of_types[],
                            MPI_Datatype *new_type_p);
```

El problema central: los compiladores insertan **padding** (bytes vacíos)
entre los campos de un `struct` para alinear el acceso a memoria del
procesador, así que los desplazamientos **no pueden adivinarse
matemáticamente** sumando los tamaños de los campos anteriores. La forma
segura de obtenerlos es consultar la dirección física real de cada campo en
tiempo de ejecución con `MPI_Get_address`:

```cpp
struct Particula { int id; double x, y, z; };

MPI_Aint a_addr, b_addr, n_addr;
int array_of_blocklengths[3] = {1, 1, 1};
MPI_Datatype array_of_types[3] = {MPI_DOUBLE, MPI_DOUBLE, MPI_INT};
MPI_Aint array_of_displacements[3];

MPI_Get_address(&a, &a_addr);
MPI_Get_address(&b, &b_addr);
MPI_Get_address(&n, &n_addr);
array_of_displacements[0] = 0;
array_of_displacements[1] = b_addr - a_addr;
array_of_displacements[2] = n_addr - a_addr;

MPI_Datatype input_mpi;
MPI_Type_create_struct(3, array_of_blocklengths, array_of_displacements,
                        array_of_types, &input_mpi);
MPI_Type_commit(&input_mpi);
```

**`MPI_Pack`/`MPI_Unpack` — empaquetado dinámico.** Alternativa a construir
un tipo derivado formal: empaquetar variables secuencialmente en un arreglo
de bytes (`MPI_PACKED`) antes de enviarlo.

```c
int MPI_Pack(void *inbuf, int incount, MPI_Datatype datatype,
             void *outbuf, int outsize, int *position, MPI_Comm comm);
int MPI_Unpack(void *inbuf, int insize, int *position,
               void *outbuf, int outcount, MPI_Datatype datatype, MPI_Comm comm);
```

- **Ventaja**: extremadamente dinámico — ideal cuando la estructura del
  mensaje varía en tiempo de ejecución o es una comunicación de un solo uso.
- **Desventaja**: incurre en un costo extra de copiar explícitamente los
  datos al buffer de empaquetado (overhead de memoria por parte de la CPU).

`MPI_Type_create_struct` es preferible cuando la comunicación del mismo tipo
de estructura se repite dentro de un bucle (se paga el costo de construcción
una sola vez); `MPI_Pack`/`MPI_Unpack` conviene para mensajes ad hoc,
heterogéneos y de una sola vez.

**`MPI_Sendrecv` — evitar deadlocks en anillo.** Función diseñada
específicamente para enviar y recibir un mensaje simultáneamente, operando
de forma segura internamente. Es la solución óptima y nativa para prevenir
**deadlocks** en topologías cíclicas (como el intercambio de fronteras en
anillos 1D visto en
[mpi-blocking-nonblocking](/topics/mpi-blocking-nonblocking)), reemplazando
la necesidad de ordenar lógicamente pares de `MPI_Send`/`MPI_Recv`.

```c
MPI_Sendrecv(&sendbuf, sendcount, sendtype, dest, sendtag,
             &recvbuf, recvcount, recvtype, source, recvtag,
             comm, status);
```

**Ejemplo aplicado: intercambio de bordes.** Con una matriz distribuida por
filas entre procesos ($P_0$: filas $0..k-1$, $P_1$: filas $k..2k-1$, ...),
una fila completa es contigua y puede enviarse directamente con
`MPI_Send(&A[fila][0], N, MPI_DOUBLE, ...)`. Si en cambio el dominio se
divide por **columnas**, una columna no es contigua — ahí se define un tipo
`MPI_Type_vector` para la columna, evitando copiar manualmente los datos a
un buffer auxiliar antes de enviarlos.

## Operaciones

`mpi-derived-datatypes` no tiene subtemas propios: los 4 constructores
(`contiguous`, `vector`, `indexed`, `create_struct`) más `Pack`/`Unpack` y
`Sendrecv` se desarrollan todos dentro de esta misma sección, siguiendo el
orden del material fuente.

## Análisis de complejidad

El único costo formal que da el profesor para este tema es el modelo general
de comunicación $T_{comm} = \alpha + x\beta$ (latencia de inicio más tiempo
de transmisión por palabra), documentado en `meta.yaml`. La razón de ser de
los tipos derivados es evitar pagar $\alpha$ múltiples veces: agrupar $x$
elementos dispersos en una sola llamada paga la latencia una vez en vez de
$x$ veces, aunque el volumen de datos transmitido ($x\beta$) sea el mismo.

## Tabla de complejidad

Ver `meta.yaml` — un único caso (`comunicacion-elemento-a-elemento`), que
documenta por qué agrupar en un tipo derivado reduce el número de llamadas
y, con ello, la latencia acumulada.

## Ejemplos

**Ejemplo con dato escalar.** El proceso 0 envía un entero al proceso 1;
`count=1` indica que se transmite un solo elemento, es decir $1 \times
MPI\_INT$:

```cpp
int x = 20;
if (rank == 0)
    MPI_Send(&x, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
if (rank == 1)
    MPI_Recv(&x, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
```

**Ejemplo con un vector.** Enviar un array de 100 `double` no requiere 100
llamadas `MPI_Send`, sino una sola con `count=100`:

```cpp
double A[100];
MPI_Send(A, 100, MPI_DOUBLE, destino, tag, MPI_COMM_WORLD);
```

**Ejemplo con struct empaquetado (`MPI_Pack`/`MPI_Unpack`).** El proceso
origen empaqueta dos `float` y un `int` en un buffer antes de un único
`MPI_Send`; el destino los desempaqueta en el mismo orden:

```cpp
char buffer[TAM_BUFFER];
int posicion = 0;
MPI_Pack(&a, 1, MPI_FLOAT, buffer, TAM_BUFFER, &posicion, MPI_COMM_WORLD);
MPI_Pack(&b, 1, MPI_FLOAT, buffer, TAM_BUFFER, &posicion, MPI_COMM_WORLD);
MPI_Pack(&n, 1, MPI_INT,   buffer, TAM_BUFFER, &posicion, MPI_COMM_WORLD);
MPI_Send(buffer, TAM_BUFFER, MPI_PACKED, DEST, TAG, MPI_COMM_WORLD);
```

Los ejercicios de laboratorio con `MPI_Type_contiguous`, `MPI_Type_vector`
(columna de matriz, submatriz) y `MPI_Type_create_struct` (anillo con suma
de atributos) están desarrollados con su enunciado completo en la
[página de práctica](/practica).

## Comparación con temas relacionados

| Tipo derivado | Distribución | Constructor |
| --- | --- | --- |
| Bloques contiguos | Regular, sin huecos | `MPI_Type_contiguous` |
| Bloques con separación regular | Regular, con stride fijo | `MPI_Type_vector` |
| Bloques con separación irregular | Irregular | `MPI_Type_indexed` |
| Campos heterogéneos (struct) | Irregular, tipos mixtos | `MPI_Type_create_struct` |

Frente al empaquetado dinámico (`MPI_Pack`/`MPI_Unpack`): un tipo derivado
describe la distribución de memoria una sola vez y MPI accede directamente a
los elementos según esa descripción; el empaquetado copia explícitamente los
datos a un buffer intermedio en cada envío. Respecto a
[mpi-blocking-nonblocking](/topics/mpi-blocking-nonblocking): `MPI_Sendrecv`
es la alternativa recomendada a ordenar manualmente pares Send/Recv para
evitar deadlocks cíclicos en anillo.

## Prueba de dominio

Al terminar este tema debo poder:

- Explicar por qué MPI describe los mensajes como (buffer, count, datatype)
  en vez de simplemente como una cantidad de bytes.
- Elegir el constructor de tipo derivado correcto (`contiguous`, `vector`,
  `indexed`, `create_struct`) según el patrón de memoria del dato a enviar.
- Calcular a mano los parámetros `count`/`blocklength`/`stride` de un
  `MPI_Type_vector` para extraer una columna de una matriz dada.
- Explicar por qué el padding de un `struct` obliga a usar
  `MPI_Get_address` en vez de calcular desplazamientos a mano.
- Explicar la ventaja/desventaja de `MPI_Pack`/`MPI_Unpack` frente a un tipo
  derivado formal, y cuándo usar `MPI_Sendrecv`.
</content>
