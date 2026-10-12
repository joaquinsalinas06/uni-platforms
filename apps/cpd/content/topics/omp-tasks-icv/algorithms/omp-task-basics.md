---
kind: algorithm
title: "taskwait, taskgroup y taskyield"
order: 1
cppSteps: ["omp20_taskwait01.cpp", "omp21_taskwait02.cpp", "omp23_taskgroup.cpp", "omp24_taskyield.cpp"]
visualization:
  type: dag
  steps:
    - note: "Árbol de tareas de omp21_taskwait02.cpp: la región single crea A y B; B crea C y D, espera con taskwait, y luego crea E."
      nodes:
        - { id: root, value: "single", state: active }
        - { id: A, value: "A", parent: root }
        - { id: B, value: "B", parent: root }
        - { id: C, value: "C", parent: B }
        - { id: D, value: "D", parent: B }
        - { id: E, value: "E", parent: B }
      links:
        - { from: root, to: A }
        - { from: root, to: B }
        - { from: B, to: C }
        - { from: B, to: D }
        - { from: B, to: E }
    - note: "El taskwait interno de B espera a C y D (sus hijas) antes de crear E. El taskwait del padre espera sólo a A y B (sus hijas): no espera a E, que es nieta. Por eso F puede imprimirse antes que E."
      highlight: ["F"]
      nodes:
        - { id: root, value: "single", state: muted }
        - { id: A, value: "A", parent: root, state: marked }
        - { id: B, value: "B", parent: root, state: marked }
        - { id: C, value: "C", parent: B, state: marked }
        - { id: D, value: "D", parent: B, state: marked }
        - { id: E, value: "E", parent: B, state: active }
        - { id: F, value: "F", parent: root, state: answer }
      links:
        - { from: root, to: A }
        - { from: root, to: B }
        - { from: B, to: C }
        - { from: B, to: D }
        - { from: B, to: E }
        - { from: A, to: F, label: "espera" }
        - { from: B, to: F, label: "espera" }
---

## Qué hace

Tres constructores que **controlan el avance entre tareas**:

- **`taskwait`**: la tarea actual espera a que terminen sus tareas **hijas** (las que ella creó directamente).
- **`taskgroup`**: agrupa tareas; al cerrar el grupo se espera a **todas las tareas creadas dentro** (hijas **y** descendientes).
- **`taskyield`**: es un **punto de suspensión**: la tarea actual puede ceder el hilo para que se ejecute otra.

## Intuición

`taskwait` es "esperá a quienes yo contraté". `taskgroup` es "esperá a todo el equipo que salió de este proyecto, aunque lo hayan contratado mis contratados". `taskyield` es "mi trabajo es largo; si hay algo más
corto esperando, atendelo mientras yo descanso".

## Algoritmo

### `taskwait`: sólo espera hijas

```cpp
#pragma omp parallel
#pragma omp single
{
#pragma omp task
  {
    printf("Task 1\n");
#pragma omp task
    { printf("Task 2\n"); }
#pragma omp task
    { printf("Task 4\n"); }
  }
#pragma omp task
  { printf("Task 5\n"); }
#pragma omp taskwait         // espera Task 1 y Task 5 (hijas)
#pragma omp task
  { printf("Task 3\n"); }
}
```

(`omp20_taskwait01.cpp`.) El `taskwait` espera a Task 1 y Task 5, pero **no** a Task 2 y Task 4, que son nietas (hijas de Task 1). Salidas observadas con 8 hilos: `5 1 4 2 3` y `5 1 2 4 3`.
En el archivo hay un `taskgroup` comentado alrededor de las tareas 1, 2, 4 y 5: **descomentarlo** hace que Task 3 espere también a las nietas.

El segundo ejemplo (`omp21_taskwait02.cpp`) tiene un `taskwait` dentro de B y otro afuera:

```cpp
#pragma omp parallel
#pragma omp single
{
#pragma omp task
  { printf("Task A\n"); }
#pragma omp task
  {
    printf("Task B\n");
#pragma omp task
    { printf("Task C\n"); }
#pragma omp task
    { printf("Task D\n"); }
#pragma omp taskwait         // B espera a C y D
#pragma omp task
    { printf("Task E\n"); }
  }
#pragma omp taskwait         // el padre espera a A y B (no a E)
  printf("Task F\n");
}
```

Garantizado: B se imprime antes que C y D; C y D antes que E. **No** está garantizado que E preceda a F. Seis corridas con 8 hilos dieron, entre otras, `B D C E A F` y `B C D A F E` (F **antes** que E).

### `taskgroup`: espera a todas las descendientes

```cpp
#pragma omp taskgroup
{
#pragma omp task
  { printf("Tarea A\n");
#pragma omp task
    { printf("Tarea A1\n"); } }
#pragma omp task
  { printf("Tarea B\n");
#pragma omp task
    { printf("Tarea B1\n"); } }
}   // ← espera A, B, A1 y B1
printf("Después del taskgroup\n");
#pragma omp task
{ printf("Tarea C\n"); }
#pragma omp taskwait          // espera sólo C
printf("Fin del programa\n");
```

`omp23_taskgroup.cpp`: "Después del taskgroup" **siempre** sale después de A, B, A1 y B1. La diferencia con `taskwait` es que `taskgroup` atrapa **también a las nietas**.

El ejemplo de la clase con un árbol: `start_background_work()` se lanza como tarea **fuera** del `taskgroup` y por eso **no** participa de la sincronización (corre libre en paralelo); dentro del bucle cada
paso crea `compute_tree(tree)` dentro de un `taskgroup` y espera a todo el recorrido. Con `taskwait` en su lugar, todas las tareas pendientes, incluida la de fondo, entrarían en la espera.

### `taskyield`

```cpp
#pragma omp task
{
  printf("Task A start (hilo %d)\n", omp_get_thread_num());
  for (int i = 0; i < 3; ++i) {
    printf("Task A paso %d (hilo %d)\n", i, omp_get_thread_num());
    sleep(1);                    // trabajo largo simulado
#pragma omp taskyield            // cede el hilo a otra tarea
  }
  printf("Task A end\n");
}
```

Sin `taskyield`, la tarea A podría **acaparar un hilo** y retrasar el inicio de otras (B y C en `omp24_taskyield.cpp`). Con `taskyield` el runtime *puede* ejecutar otra tarea pendiente en ese punto; es una sugerencia, no una garantía.

## Pseudocódigo

```
taskwait:   esperar hasta que terminen las tareas HIJAS de la tarea actual
taskgroup:  { ... crea tareas ... }  ← al cerrar: esperar a TODAS las tareas creadas dentro, descendientes incluidas
taskyield:  punto de suspensión: si hay tareas pendientes, el hilo puede ejecutar otra y volver luego
```

## C++

El editor trae los cuatro archivos de la clase. Sugerencia de trabajo: en `omp20_taskwait01.cpp` descomentá el `taskgroup` y verificá que Task 3 ya nunca aparece antes de Task 2 y Task 4.

## Complejidad

Cada espera agrega un **punto de sincronización** al DAG de tareas: alarga el camino crítico $T_\infty$ por el tiempo de la tarea más lenta que se espera. `taskgroup` puede esperar más que `taskwait` (más tareas),
pero es la única forma de esperar a **toda** una subestructura (un recorrido de árbol) sin conocer su tamaño. Ver la cota de Brent en [omp-tasks-icv](/topics/omp-tasks-icv).

## Ejemplo

PD04 2025-I, ejercicio 3 (post-orden de un árbol binario con `omp task`): el padre debe esperar a los dos recorridos de sus hijos **antes** de procesarse, que es un `taskwait` en cada nodo
(o un `taskgroup` si el recorrido se lanza desde la raíz).

## Casos especiales

- **`taskwait` sin tareas hijas**: retorna de inmediato.
- **Nietas y `taskwait`**: una tarea nieta **no** se espera con `taskwait` del abuelo.
- **`taskyield` sin tareas pendientes**: no hace nada.
- **Fuera de `parallel`**: `task` y `taskwait` funcionan, pero las tareas las ejecuta el único hilo.
