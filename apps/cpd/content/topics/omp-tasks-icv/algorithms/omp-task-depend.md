---
kind: algorithm
title: "depend(in/out/inout) y DAG de tareas"
order: 2
cppSteps: ["omp22_task_dep_1.cpp", "omp22_task_dep_2.cpp", "omp22_task_dep_3.cpp", "omp22_task_dep_4.cpp", "omp22_task_dep_5.cpp"]
visualization:
  type: dag
  steps:
    - note: "task_dep.5: T1 escribe a (out a) y T2 escribe b (out b); T3 calcula c = a + b (in a,b out c) y T4 imprime c (in c). Al principio todavía no hay aristas."
      nodes:
        - { id: T1, value: "T1", state: active }
        - { id: T2, value: "T2", state: active }
        - { id: T3, value: "T3" }
        - { id: T4, value: "T4" }
      links: []
    - note: "depend(in: a,b) en T3 crea las aristas T1 a T3 (por a) y T2 a T3 (por b). depend(in: c) en T4 crea T3 a T4 (por c). T1 y T2 no se esperan entre sí."
      nodes:
        - { id: T1, value: "T1", state: muted }
        - { id: T2, value: "T2", state: muted }
        - { id: T3, value: "T3", parent: T1, state: active }
        - { id: T4, value: "T4", parent: T3, state: answer }
      links:
        - { from: T1, to: T3, label: "a" }
        - { from: T2, to: T3, label: "b" }
        - { from: T3, to: T4, label: "c" }
    - note: "T5 (c = b + 3, in b out c) está anidada dentro de T2: sus depend sólo se comparan con sus propias tareas hermanas, así que no hay arista hacia T3 ni T4. T3 y T5 escriben c sin orden entre sí (ver la nota abajo)."
      nodes:
        - { id: T1, value: "T1", state: muted }
        - { id: T2, value: "T2", state: muted }
        - { id: T3, value: "T3", parent: T1, state: muted }
        - { id: T4, value: "T4", parent: T3, state: muted }
        - { id: T5, value: "T5", parent: T2, state: marked }
      links:
        - { from: T1, to: T3, label: "a" }
        - { from: T2, to: T3, label: "b" }
        - { from: T3, to: T4, label: "c" }
        - { from: T2, to: T5, label: "hija" }
---

## Qué hace

La cláusula `depend` le dice al runtime **qué variables lee y escribe cada tarea**, para que ordene la ejecución sin que el programador ponga barreras. Cada tarea es un nodo del DAG y cada dependencia una arista.

| Tipo | Significado | Depende de las tareas **anteriores** que tengan la variable en... |
|---|---|---|
| `in` | la tarea **lee** | `out` o `inout` |
| `out` | la tarea **escribe** | `in`, `out` o `inout` |
| `inout` | lee y escribe | `in`, `out` o `inout` |

## Intuición

Es el mismo razonamiento de las dependencias de datos de un procesador: **lectura tras escritura** (RAW) obliga a esperar el dato; **escritura tras lectura** (WAR) obliga a no pisar un dato que alguien aún debe leer;
**escritura tras escritura** (WAW) obliga a mantener el orden final. Dos lecturas no dependen entre sí.

## Algoritmo

Se recorre el código en el **orden en que se crean** las tareas. Para cada tarea nueva y cada variable de su lista `depend`, se agregan aristas desde las tareas ya creadas que escribieron (o leyeron, si la nueva escribe) esa variable.

### Los cuatro ejemplos con `x`

**RAW** — `omp22_task_dep_1.cpp`: imprime `x = 2`.

```cpp
int x = 1;
#pragma omp parallel
#pragma omp single
{
#pragma omp task shared(x) depend(out: x)
  x = 2;
#pragma omp task shared(x) depend(in: x)
  printf("x = %d\n", x);
}
```

**WAR** — `omp22_task_dep_2.cpp`: se invierte el orden de creación y ahora imprime `x = 1`: la escritura `depend(out: x)` **espera a la lectura anterior** y el `print` ocurre antes.

```cpp
#pragma omp task shared(x) depend(in: x)
  printf("x = %d\n", x);       // lee x = 1
#pragma omp task shared(x) depend(out: x)
  x = 2;                        // espera a la lectura
```

**WAW + `taskwait`** — `omp22_task_dep_3.cpp`: dos `out` sobre `x` se serializan en orden de creación, y el `taskwait` evita imprimir antes de que ambas terminen: `x = 2`.

```cpp
#pragma omp task shared(x) depend(out: x)
  x = 1;
#pragma omp task shared(x) depend(out: x)
  x = 2;
#pragma omp taskwait
  printf("x = %d\n", x);
```

**Lecturas concurrentes** — `omp22_task_dep_4.cpp`: las dos tareas con `in: x` dependen de la escritura pero no entre sí, así que el orden de sus impresiones **no está determinado** (`x+1=3, x+2=4` o al revés).

### El ejemplo 5: dibujar el DAG

`omp22_task_dep_5.cpp` trae la consigna "Elabore el DAG correspondiente al código":

```cpp
#pragma omp parallel
{
#pragma omp master
  {
#pragma omp task depend(out: a)
    { a = 1; sleep(1); printf("Task 1, a: %d\n", a); }

#pragma omp task depend(out: b)
    { b = 2; sleep(1); printf("Task 2, b: %d\n", b);
#pragma omp task depend(in: b) depend(out: c)
      { c = b + 3; sleep(1); printf("Task 5, c: %d\n", c); }
    }

#pragma omp task depend(in: a, b) depend(out: c)
    { c = a + b; sleep(1); printf("Task 3, c: %d\n", c); }

#pragma omp task depend(in: c)
    { sleep(1); printf("Task 4, c: %d\n", c); }
  }
}
```

Aristas por **variable**: `a`: T1 → T3. `b`: T2 → T3. `c`: T3 → T4. Camino crítico: T1 (o T2) → T3 → T4, de **3 tareas** (3 s con `sleep(1)`).

> **Nota de apoyo** (regla del estándar OpenMP, no está en la slide): las dependencias sólo se establecen entre tareas **hermanas** (hijas de la misma tarea). T5 es hija de T2,
> por lo que su `depend(in: b)` no la ata a T2 (que la creó) ni a T3/T4. Consecuencia: T5 y T3 escriben `c` **sin orden**, y T4 sólo espera a T3. Si el DAG que se esperaba en clase
> dibuja T2 → T5, ese sería un DAG *lógico*, no el que garantiza el runtime. Observado: `Task 5, c: 3` / `Task 3, c: 3` / `Task 4, c: 3` — coinciden por casualidad, porque $a+b = b+3 = 3$.

## Pseudocódigo

```
para cada tarea t, en orden de creación:
  para cada (tipo, v) en depend(t):
    si tipo == in:      añadir arista  última_escritura(v) → t
    si tipo ∈ {out,inout}: añadir aristas  (última_escritura(v) ∪ lecturas_desde_esa_escritura(v)) → t
  registrar t como última escritura / lectura de sus variables
el planificador ejecuta una tarea cuando todas sus predecesoras terminaron
```

## C++

Los cinco archivos están en el editor. Ejecutalos varias veces: `task_dep_1`, `_2` y `_3` siempre dan la misma salida; `_4` no.

## Complejidad

Con $W$ = suma de los costos de todas las tareas y $T_\infty$ = camino crítico, un planificador voraz con $p$ hilos cumple $T_p \le W/p + T_\infty$ (Brent). Para `task_dep_5` con cada tarea de costo 1: $W = 5$ y $T_\infty = 3$ (el camino T1 → T3 → T4); con $p = 2$, $T_p \le 5/2 + 3$.
El speedup nunca supera $W/T_\infty$ (paralelismo del DAG).

## Ejemplo

**PD04 2025-I, ejercicio 2** (dependencias definidas en el enunciado, sólo el primer argumento de cada `calculo_*` se modifica):

```cpp
min_x = minimo(x, n);
max_x = maximo(x, n);
calculo_z(z, min_x, max_x, n);
calculo_y(y, x, n);
calculo_x(x, y, n);
calculo_v(v, z, x);
```

Aristas (derivadas del enunciado): `minimo` → `calculo_z`, `maximo` → `calculo_z`, `calculo_y` → `calculo_x` (lee `y`), `calculo_z` → `calculo_v` (lee `z`), `calculo_x` → `calculo_v` (lee `x`). Además `calculo_x` **escribe** `x`, que `minimo`, `maximo` y `calculo_y` leen:
hay WAR de esas tres hacia `calculo_x`. Con `task`+`depend` cada dependencia se declara por variable y el runtime respeta exactamente eso; con `sections` hay que agrupar a mano y la barrera final espera de más.

**PD04 2025-II S1 y S2, ejercicio 3** piden el mismo ejercicio sobre otros algoritmos (sistema con prefix-sum; `OpArr` con `sumas_de_prefijos`, `quicksort`, `scan_left` y tareas 4 y 5); ver las evaluaciones PD4.

## Casos especiales

- **Sin `shared(x)`**: una tarea trata `x` como `firstprivate` y escribiría una copia; para que `depend` tenga efecto sobre una variable compartida hay que declararla `shared` (como en los ejemplos).
- **Tareas anidadas**: `depend` sólo ordena hermanas (nota anterior).
- **`depend` no reemplaza a `taskwait`**: ordena entre tareas, pero para leer el resultado fuera de ellas hace falta esperar (`taskwait`, ejemplo WAW).
