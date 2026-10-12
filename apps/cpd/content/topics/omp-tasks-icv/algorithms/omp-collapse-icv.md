---
kind: algorithm
title: "collapse, nowait y variables de control interno"
order: 3
cppSteps: ["omp15_collapse_1.cpp", "omp15_collapse_2.cpp", "omp15_collapse_3.cpp", "omp14_nowait.cpp", "omp13_parallel_subdomain.cpp"]
visualization:
  type: dag
  steps:
    - note: "Región externa con omp_set_num_threads(2): un equipo de 2 hilos (nivel 1) creado por el master."
      nodes:
        - { id: m, value: "master", state: active }
        - { id: o0, value: "hilo 0", parent: m }
        - { id: o1, value: "hilo 1", parent: m }
      links:
        - { from: m, to: o0 }
        - { from: m, to: o1 }
    - note: "Dentro, cada hilo abre otra región con omp_set_num_threads(3): cada hilo externo crea su propio equipo de 3 (6 hilos en total en el nivel 2). Sólo ocurre si el paralelismo anidado está activo."
      nodes:
        - { id: m, value: "master", state: muted }
        - { id: o0, value: "hilo 0", parent: m, state: muted }
        - { id: o1, value: "hilo 1", parent: m, state: muted }
        - { id: a0, value: "a0", parent: o0, state: active }
        - { id: a1, value: "a1", parent: o0, state: active }
        - { id: a2, value: "a2", parent: o0, state: active }
        - { id: b0, value: "b0", parent: o1, state: active }
        - { id: b1, value: "b1", parent: o1, state: active }
        - { id: b2, value: "b2", parent: o1, state: active }
      links:
        - { from: m, to: o0 }
        - { from: m, to: o1 }
        - { from: o0, to: a0 }
        - { from: o0, to: a1 }
        - { from: o0, to: a2 }
        - { from: o1, to: b0 }
        - { from: o1, to: b1 }
        - { from: o1, to: b2 }
---

## Qué hace

Tres herramientas para **afinar el paralelismo** de los constructores ya vistos:

- **`collapse(n)`** fusiona $n$ bucles anidados en un solo espacio de iteración, más grande, que se reparte entre los hilos.
- **`nowait`** quita la barrera implícita al final de un `for`, `sections` o `single` (ver [omp-for-schedule](/topics/omp-intro-parallel/algorithms/omp-for-schedule)).
- Las **ICVs** (*Internal Control Variables*) son variables internas, **copiadas a cada tarea** generada en una región paralela, que controlan el comportamiento del programa: cuántos hilos, si hay paralelismo anidado, cuántos niveles activos y si el número de hilos puede ajustarse dinámicamente.

## Intuición

`collapse` es "tratá los dos bucles como una sola lista larga de $N \times M$ tareas pequeñas para repartirla mejor". Las ICVs son los **mandos** de la región: lo que se configure *antes* de una región vale para esa región, y
cada región anidada hereda una copia que puede cambiar sin afectar al nivel de arriba.

## Algoritmo

### `collapse`

Con dos bucles anidados $N \times M$ hay tres formas de paralelizar, y la diferencia está en **cuántas unidades de trabajo** reciben los hilos (`omp15_collapse_1/2/3.cpp`, con $N = 4$, $M = 16$):

| Variante | Código | Qué se reparte |
|---|---|---|
| 1 | `#pragma omp parallel for` sólo sobre `i` | $N = 4$ unidades: con $p > 4$ hilos sobran |
| 2 | `omp_set_nested(1)` y `parallel for` sobre `i` **y** sobre `j` | regiones anidadas: se crean hilos dentro de hilos (overhead de dos regiones) |
| 3 | `#pragma omp parallel for collapse(2)` | $N \times M = 64$ unidades en **una** sola región |

```cpp
#pragma omp parallel for collapse(2)
for (int i = 0; i < N; i++)
  for (int j = 0; j < M; j++)
    A[i][j] = i + j;
```

Con `collapse` el orden de iteración del bucle colapsado lo determina el orden de los bucles originales: en el ejemplo de la clase, `lastprivate(jlast, klast)` con `k = 1..2`, `j = 1..3` imprime `2 3` (el último valor de `k` y de `j` en el orden secuencial):

```cpp
#pragma omp parallel
{
#pragma omp for collapse(2) lastprivate(jlast, klast)
  for (k = 1; k <= 2; k++)
    for (j = 1; j <= 3; j++) { jlast = j; klast = k; }
#pragma omp single
  printf("%d %d\n", klast, jlast);   // 2 3
}
```

### ICVs y paralelismo anidado

```cpp
void omp_set_num_threads(int num_threads);          // hilos de la región siguiente
void omp_set_max_active_levels(int max_levels);     // tope de regiones paralelas anidadas activas
void omp_set_nested(int nested);                    // activa/desactiva paralelismo anidado
void omp_set_dynamic(int dynamic_threads);          // activa/desactiva ajuste dinámico del nº de hilos
```

Ejemplo de la clase: la región externa crea equipos de **2** hilos, la interna de **3**, y se asigna **4** a `nthreads` para una tercera región:

```cpp
omp_set_nested(1);
omp_set_max_active_levels(8);
omp_set_dynamic(0);
omp_set_num_threads(2);
#pragma omp parallel
{
  omp_set_num_threads(3);
#pragma omp parallel
  {
    omp_set_num_threads(4);
#pragma omp single
    printf("Inner: max_act_lev=%d, num_thds=%d, max_thds=%d\n",
           omp_get_max_active_levels(), omp_get_num_threads(), omp_get_max_threads());
  }
#pragma omp barrier
#pragma omp single
  printf("Outer: max_act_lev=%d, num_thds=%d, max_thds=%d\n",
         omp_get_max_active_levels(), omp_get_num_threads(), omp_get_max_threads());
}
```

El `printf` de la región **externa** lo ejecuta **un solo** hilo del equipo (por el `single`); el de la región **interna**, en cambio, se ejecuta **2 veces**, una por cada hilo externo, porque hay dos equipos internos. Cada equipo interno tiene
su propio hilo que entra al `single`.

## Pseudocódigo

```
omp_set_num_threads(k)    → ICV nthreads ← k (afecta a la PRÓXIMA región, en este nivel)
parallel:                 → crea un equipo de nthreads; cada hilo recibe una COPIA de las ICVs
parallel anidada:         → sólo crea equipo nuevo si nested=1 y nivel_activo < max_active_levels
collapse(n):              → espacio_iteración ← producto de los n bucles ; repartir ese espacio
```

## C++

Los archivos del editor: las tres versiones de `collapse` (el `printf` sólo sale del hilo 0, para ver qué bloque le toca), `omp14_nowait.cpp` (tres bucles con `nowait`) y `omp13_parallel_subdomain.cpp` (descomposición por `iam`/`nt`).

## Complejidad

`collapse` no cambia el trabajo total ($N \cdot M$) pero **mejora el balance**: con $N < p$ la variante 1 deja ociosos $p - N$ hilos y su tiempo es $O(M)$ (cada hilo hace una fila completa), mientras que con `collapse(2)` es $O(NM/p)$. El paralelismo anidado
(variante 2) suma el overhead de crear $N$ equipos internos, cada uno con su sincronización $O(p_{int})$; por eso **no es la forma recomendada** de paralelizar dos bucles perfectamente anidados.

## Ejemplo

PD04 2026-I, ejercicio 3: `#pragma omp parallel for collapse(2) reduction(+:sum)` sobre una doble sumatoria de una matriz $N \times N$, seguido de un segundo `collapse(2)` con `atomic capture`; ver las evaluaciones PD4.

## Casos especiales

- **`collapse(n)` exige bucles perfectamente anidados** (nada de código entre `for` y `for`) con límites que no dependan del bucle exterior.
- **`omp_set_nested` y `omp_set_max_active_levels`**: con `nested=0` o `max_active_levels=1`, la región interna se ejecuta con **un solo hilo**.
- **`omp_set_dynamic(1)`**: el runtime puede usar **menos** hilos que los pedidos; para experimentos reproducibles conviene `omp_set_dynamic(0)`.
