---
kind: algorithm
title: "for, schedule, nowait y ordered"
order: 1
cppSteps: ["omp02_for.cpp"]
visualization:
  type: timeline
  steps:
    - note: "schedule(static) sin chunk: las 16 iteraciones se dividen en 4 bloques contiguos e iguales, uno por hilo. El reparto se decide antes de ejecutar y no cambia."
      lanes:
        - { id: t0, label: "hilo 0" }
        - { id: t1, label: "hilo 1" }
        - { id: t2, label: "hilo 2" }
        - { id: t3, label: "hilo 3" }
      events:
        - { lane: t0, tStart: 0, tEnd: 4, label: "i = 0..3", state: active }
        - { lane: t1, tStart: 0, tEnd: 4, label: "i = 4..7", state: active }
        - { lane: t2, tStart: 0, tEnd: 4, label: "i = 8..11", state: active }
        - { lane: t3, tStart: 0, tEnd: 4, label: "i = 12..15", state: active }
      messages: []
    - note: "schedule(static, 3): bloques de 3 iteraciones repartidos en rueda (round-robin). Los hilos 0 y 1 reciben un segundo bloque, por eso el reparto no queda parejo cuando N no es múltiplo de chunk·p."
      lanes:
        - { id: t0, label: "hilo 0" }
        - { id: t1, label: "hilo 1" }
        - { id: t2, label: "hilo 2" }
        - { id: t3, label: "hilo 3" }
      events:
        - { lane: t0, tStart: 0, tEnd: 3, label: "i = 0..2" }
        - { lane: t0, tStart: 3, tEnd: 6, label: "i = 12..14", state: active }
        - { lane: t1, tStart: 0, tEnd: 3, label: "i = 3..5" }
        - { lane: t1, tStart: 3, tEnd: 4, label: "i = 15", state: active }
        - { lane: t2, tStart: 0, tEnd: 3, label: "i = 6..8" }
        - { lane: t3, tStart: 0, tEnd: 3, label: "i = 9..11" }
      messages: []
    - note: "schedule(dynamic, 3) (ejemplo ilustrativo): cada hilo toma el siguiente bloque apenas termina el suyo. Si el hilo 0 es lento, los demás absorben el resto — balancea carga irregular a costa de más sincronización en el reparto."
      lanes:
        - { id: t0, label: "hilo 0" }
        - { id: t1, label: "hilo 1" }
        - { id: t2, label: "hilo 2" }
        - { id: t3, label: "hilo 3" }
      events:
        - { lane: t0, tStart: 0, tEnd: 5, label: "i = 0..2" }
        - { lane: t1, tStart: 0, tEnd: 3, label: "i = 3..5" }
        - { lane: t1, tStart: 3, tEnd: 6, label: "i = 12..14", state: answer }
        - { lane: t2, tStart: 0, tEnd: 3, label: "i = 6..8" }
        - { lane: t2, tStart: 3, tEnd: 4, label: "i = 15", state: answer }
        - { lane: t3, tStart: 0, tEnd: 3, label: "i = 9..11" }
      messages: []
---

## Qué hace

`#pragma omp for` reparte las iteraciones de uno o más bucles asociados entre los
hilos **de la región paralela que ya existe**: no crea hilos nuevos
(*data parallelism* — los hilos hacen lo mismo sobre datos distintos). Al final del bucle hay una
**barrera implícita**, salvo que se use `nowait`.

## Intuición

Las 16 iteraciones son 16 cajas y los 4 hilos son 4 personas. `schedule` define **quién se lleva qué caja y cuándo**: o se
reparten todas de antemano (*static*), o cada persona va a buscar la siguiente caja cuando termina la suya (*dynamic*).

## Algoritmo

Forma general de la directiva:

```cpp
#pragma omp for [clause ...] newline
    private (list)
    firstprivate (list)
    lastprivate (list)
    reduction (operator : list)
    schedule (kind [, chunk_size])
    collapse (n)
    ordered
    nowait
for_loop
```

`schedule` admite cinco tipos:

| Tipo | Cómo reparte |
|---|---|
| `static` | Iteraciones divididas en bloques de tamaño `chunk` y asignadas a los hilos **estáticamente**. Sin `chunk`, se dividen en partes iguales. |
| `dynamic` | Bloques de tamaño `chunk` asignados **dinámicamente**: apenas un hilo culmina su parte, recibe otro bloque. |
| `guided` | Como `dynamic`, pero el tamaño de cada bloque **disminuye exponencialmente** cada vez que se asigna. (En la slide aparece como *GUIDE*.) |
| `runtime` | La decisión se toma en tiempo de ejecución con `OMP_SCHEDULE` (aquí no se define el chunk). |
| `auto` | Se delega al compilador. |

### `nowait`

Si se especifica `nowait`, los hilos **no se sincronizan** al final del bucle. Es seguro sólo cuando lo que sigue no depende de iteraciones
que ejecutó otro hilo. Ejemplo de clase: tres bucles seguidos con `schedule(static)` y el mismo número de iteraciones; como
`static` reparte la **misma secuencia de índices** a cada hilo en los tres bucles, cada hilo trabaja sobre los mismos índices en los tres bucles, y la slide lo presenta como un caso donde se puede
quitar la barrera aun habiendo dependencia entre los bucles:

```cpp
void nowait_example2(int n, float *a, float *b, float *c, float *y, float *z) {
  int i;
#pragma omp parallel
  {
#pragma omp for schedule(static) nowait
    for (i = 0; i < n; i++) c[i] = (a[i] + b[i]) / 2.0f;
#pragma omp for schedule(static) nowait
    for (i = 0; i < n; i++) z[i] = sqrtf(c[i]);
#pragma omp for schedule(static) nowait
    for (i = 1; i <= n; i++) y[i] = z[i-1] + a[i];
  }
}
```

> **Cuidado** (observación del código de clase, `omp14_nowait.cpp`): el tercer bucle lee `z[i-1]`, que produjo
> el hilo *vecino* (iteración `i-1`) y no el mismo hilo; con `nowait` esa lectura puede ocurrir antes de la escritura, así que sólo es
> correcto en los índices que cada hilo produjo él mismo. Ver el experimento que imprime `z`/`y` en ese archivo.

### `ordered`

`ordered` hace que un bloque dentro del bucle se ejecute **en el orden de las iteraciones secuenciales**, mientras el resto del cuerpo corre en paralelo.
La iteración 1 entra sin esperar; una iteración posterior espera a que las anteriores terminen su región `ordered`. El bucle debe declarar la
cláusula `ordered` y cada iteración puede ejecutar **a lo sumo una** región `ordered`:

```cpp
void work(int k) {
#pragma omp ordered
  printf(" %d\n", k);
}
void ordered_example(int lb, int ub, int stride) {
#pragma omp parallel for ordered schedule(dynamic)
  for (int i = lb; i < ub; i += stride) work(i);
}
```

Dos regiones `ordered` consecutivas en el **mismo** cuerpo no son válidas (cada iteración ejecutaría dos);
sí lo es si están en ramas excluyentes de un `if` (una iteración con `i <= 10` y otra con `i > 10` ejecutan una sola).

## Pseudocódigo

```
parallel región con p hilos:
  repartir las N iteraciones según schedule(kind, chunk)
  cada hilo ejecuta sus iteraciones asignadas
  barrera implícita            ← omitida si hay nowait
```

## C++

El editor de arriba trae `omp02_for.cpp`: suma de vectores con `schedule(static)` y cada iteración imprime
`hilo / contador`. Descomentá, una por una, las líneas alternativas (`static, CHUNKSIZE`, `dynamic`, `dynamic, CHUNKSIZE`) y observá cómo cambia
**qué hilo ejecuta qué `i`**.

## Complejidad

El reparto de $N$ iteraciones de costo uniforme entre $p$ hilos deja $\lceil N/p \rceil$ iteraciones por hilo:
$T_p = O(N/p) + T_{overhead}$. Con `static` el overhead de reparto es casi nulo (se calcula una vez); con
`dynamic` cada solicitud de bloque es una operación sincronizada, así que conviene un `chunk` razonable.
**Elegir `static` o `dynamic` es una decisión de balance de carga**: iteraciones parejas → `static`; costos irregulares → `dynamic`/`guided`.

## Ejemplo

`omp02_for.cpp` (U4.1) con $N = 2^4 = 16$ imprime pares `hilo \t i`. Con `static` y 4 hilos verás bloques contiguos
(hilo 0 → 0..3, ...), exactamente la primera línea de la figura.

## Casos especiales

- **`p = 1`**: todos los esquemas ejecutan el bucle secuencial completo.
- **`N < p`**: algunos hilos no reciben ninguna iteración (y esperan igual en la barrera).
- **`nowait` + dependencia**: sólo es seguro con `static` y mismo reparto en los bucles encadenados.
- **Reparto `static` sin chunk** no es "round robin": son **bloques contiguos** (distinto de `static, 1`).
