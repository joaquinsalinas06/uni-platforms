---
kind: algorithm
title: "sections y single"
order: 2
cppSteps: ["omp03_sections.cpp", "omp04_single.cpp"]
visualization:
  type: dag
  steps:
    - note: "sections agrupa bloques de código distintos e independientes. Cada section (S1..S4, cada una con dos asignaciones) es una tarea que se ejecuta una sola vez."
      nodes:
        - { id: sec, value: "sections", state: active }
        - { id: s1, value: "S1", parent: sec }
        - { id: s2, value: "S2", parent: sec }
        - { id: s3, value: "S3", parent: sec }
        - { id: s4, value: "S4", parent: sec }
      links:
        - { from: sec, to: s1 }
        - { from: sec, to: s2 }
        - { from: sec, to: s3 }
        - { from: sec, to: s4 }
    - note: "Secciones distintas las toman hilos distintos; si hay menos hilos que secciones, un hilo ejecuta varias. Al final hay una barrera implícita que espera a todas, aunque la siguiente tarea no dependa de algunas: esa es la diferencia clave con task + depend."
      highlight: ["join"]
      nodes:
        - { id: sec, value: "sections", state: muted }
        - { id: s1, value: "S1", parent: sec, state: active }
        - { id: s2, value: "S2", parent: sec, state: active }
        - { id: s3, value: "S3", parent: sec, state: active }
        - { id: s4, value: "S4", parent: sec, state: active }
        - { id: join, value: "barrera", state: marked }
      links:
        - { from: sec, to: s1 }
        - { from: sec, to: s2 }
        - { from: sec, to: s3 }
        - { from: sec, to: s4 }
        - { from: s1, to: join }
        - { from: s2, to: join }
        - { from: s3, to: join }
        - { from: s4, to: join }
---

## Qué hace

- **`sections`** especifica que bloques de código *distintos* se dividen entre los hilos. Cada `section` se ejecuta **una vez** por un hilo, y
  secciones distintas pueden ejecutarlas hilos distintos. Es paralelismo de **tareas** (a diferencia de `for`, que es paralelismo de datos).
- **`single`** indica que el bloque lo ejecuta **un solo hilo** (cualquiera, no necesariamente el master). Se usa donde ejecutar en
  paralelo no es seguro, como en I/O.

## Intuición

`sections` es una lista de encargos distintos repartida entre personas; `single` es "sólo uno de ustedes se encarga de esto,
los demás esperan a que termine".

## Algoritmo

```cpp
#pragma omp sections [clause ...] newline      // private, firstprivate, lastprivate, reduction, nowait
{
  #pragma omp section newline
    structured_block
  #pragma omp section newline
    structured_block
}

#pragma omp single [clause ...] newline         // private, firstprivate, nowait
    structured_block
```

- Hay **barrera implícita** al final de `sections` salvo `nowait`. No usar `goto` dentro de las secciones.
- Los hilos que no ejecutan `single` esperan hasta el final del bloque, salvo `nowait`.

Ejemplo de la clase (`omp03_sections.cpp`): una sección suma dos arreglos y la otra los multiplica, con 2 hilos:

```cpp
#pragma omp parallel num_threads(2) shared(a,b,c,d) private(i,id)
{
#pragma omp sections nowait
  {
#pragma omp section
    { for (i = 0; i < N; i++) c[i] = a[i] + b[i]; }   // sección 1
#pragma omp section
    { for (i = 0; i < N; i++) d[i] = a[i] * b[i]; }   // sección 2
  }
}
```

Ejemplo de `single` (`omp04_single.cpp`): un único hilo ejecuta el bloque y escribe en `b[id]` con `id` = su identificador; el resto
de posiciones queda en `-1`. Cuál hilo gana no está determinado:

```cpp
#pragma omp parallel
{
#pragma omp single nowait
  {
    a = 10;
    id = omp_get_thread_num();
    b[id] = a;
    cout << "constructor Single ejecutado por el hilo " << id << endl;
  }
}
```

### `firstprivate` en secciones

Como cada sección modifica `section_count`, `firstprivate(section_count)` le da a cada hilo una copia inicializada en 0. Si dos hilos ejecutan una
sección cada uno, ambos imprimen 1; si el **mismo** hilo ejecuta las dos, imprime 1 y luego 2:

```cpp
#pragma omp parallel
#pragma omp sections firstprivate(section_count)
{
#pragma omp section
  { section_count++; printf("section_count %d\n", section_count); }
#pragma omp section
  { section_count++; printf("section_count %d\n", section_count); }
}
```

### `single` con mensajes de avance

Sólo un hilo imprime cada mensaje; los demás se detienen en la barrera implícita del `single`. En el último trabajo se puede
continuar sin esperar con `nowait`:

```cpp
#pragma omp parallel
{
#pragma omp single
  printf("Beginning work1.\n");
  work1();
#pragma omp single
  printf("Finishing work1.\n");
#pragma omp single nowait
  printf("Finished work1 and beginning work2.\n");
  work2();
}
```

## Pseudocódigo

```
sections:  lista de bloques B1..Bk
  cada hilo libre toma el siguiente bloque no ejecutado
  ... barrera implícita ...
single:    el primer hilo que llega ejecuta el bloque; los demás saltan hasta la barrera
```

## C++

El editor trae `omp03_sections.cpp` y `omp04_single.cpp`. En el primero, `sections nowait` está comentado como pregunta:
*¿se puede usar nowait?* Sí, porque al final de la región paralela ya hay una barrera.

## Complejidad

Si hay $k$ secciones de costo $c_1, ..., c_k$ y $p \ge k$ hilos, $T_p = \max_i c_i + T_{overhead}$: el tiempo lo fija la sección **más larga**,
no la suma. Con $p < k$ hay reparto y el tiempo crece. Como el número de secciones queda fijado **en el código**,
`sections` no escala con $p$ más allá de $k$ — por eso no sirve para paralelismo de datos.

## Ejemplo

PD04 2025-I, ejercicio 2: la secuencia `min_x`, `max_x`, `calculo_z`, `calculo_y`, `calculo_x`, `calculo_v` se resuelve con `sections` **y** con
`task`. La solución del profesor indica que `sections` es comparable a `tasks` en tiempo de ejecución (pocas tareas en paralelo), es más simple de
programar, pero la **barrera implícita** hace esperar a todo el bloque aunque no haya dependencia con lo que sigue; `tasks` expresa dependencias
explícitas — ver [omp-tasks-icv](/topics/omp-tasks-icv).

## Casos especiales

- **Más hilos que secciones**: los hilos sobrantes quedan ociosos hasta la barrera.
- **`sections` dentro de `parallel for`**: no es válido (ver nota en [omp-intro-parallel](/topics/omp-intro-parallel)).
- **`single` vs `master`**: `master` lo ejecuta siempre el hilo 0 y **no** tiene barrera; `single` lo ejecuta cualquier hilo y **sí** la tiene.
