---
kind: algorithm
title: "master, barrier y flush"
order: 3
cppSteps: ["omp07_master.cpp"]
visualization:
  type: timeline
  steps:
    - note: "Región paralela con 3 hilos. Cada uno hace su parte del for (relajación de Jacobi): trabajo repartido."
      lanes:
        - { id: t0, label: "master" }
        - { id: t1, label: "hilo 1" }
        - { id: t2, label: "hilo 2" }
      events:
        - { lane: t0, tStart: 0, tEnd: 3, label: "for", state: active }
        - { lane: t1, tStart: 0, tEnd: 3, label: "for", state: active }
        - { lane: t2, tStart: 0, tEnd: 3, label: "for", state: active }
      messages: []
    - note: "Al final de un for hay una barrera implícita: todos esperan al más lento antes de seguir."
      lanes:
        - { id: t0, label: "master" }
        - { id: t1, label: "hilo 1" }
        - { id: t2, label: "hilo 2" }
      events:
        - { lane: t0, tStart: 0, tEnd: 3, label: "for", state: muted }
        - { lane: t1, tStart: 0, tEnd: 4, label: "for (lento)", state: muted }
        - { lane: t2, tStart: 0, tEnd: 3, label: "for", state: muted }
        - { lane: t0, tStart: 3, tEnd: 4, label: "barrera", state: marked }
        - { lane: t2, tStart: 3, tEnd: 4, label: "barrera", state: marked }
      messages: []
    - note: "master: sólo el hilo 0 ejecuta ++c e imprime el avance. Los hilos 1 y 2 saltan el bloque y siguen, sin esperar."
      lanes:
        - { id: t0, label: "master" }
        - { id: t1, label: "hilo 1" }
        - { id: t2, label: "hilo 2" }
      events:
        - { lane: t0, tStart: 4, tEnd: 6, label: "master: ++c; printf", state: answer }
        - { lane: t1, tStart: 4, tEnd: 6, label: "siguen (sin esperar)", state: active }
        - { lane: t2, tStart: 4, tEnd: 6, label: "siguen (sin esperar)", state: active }
      messages: []
---

## Qué hace

- **`master`**: define una región que **sólo ejecuta el hilo master** (el 0). Los demás hilos **la evitan sin esperar**.
- **`barrier`**: sincroniza todos los hilos. Quien llega espera a los demás; luego todos continúan en paralelo.
- **`flush`**: punto de sincronización donde el programa debe tener una vista **consistente** de la memoria: las variables activas de cada hilo se escriben en memoria. Una lista opcional
  restringe qué variables se consolidan.

## Intuición

`master` es "esto lo hace el jefe, nadie lo espera"; `barrier` es "nadie pasa hasta que todos lleguen"; `flush` es "anoten lo que tienen en la pizarra común antes de seguir".

## Algoritmo

```cpp
#pragma omp master newline
    structured_block
```

Ejemplo de clase (`omp07_master.cpp`): el **master** lleva la cuenta de iteraciones e imprime el avance, mientras todos los hilos participan en la relajación:

```cpp
void master_example(float *x, float *xold, int n, float tol) {
  int c = 0, i, toobig;
  float error, y;
#pragma omp parallel num_threads(4)
  {
    do {
#pragma omp for
      for (i = 1; i < n - 1; ++i) xold[i] = x[i];
#pragma omp single
      { toobig = 0; }
#pragma omp for private(y, error) reduction(+:toobig)
      for (i = 1; i < n - 1; ++i) {
        y = x[i];
        x[i] = average(xold[i-1], x[i], xold[i+1]);
        error = y - x[i];
        if (error > tol || error < -tol) ++toobig;
      }
#pragma omp master
      { ++c; printf("iteration %d, toobig=%d\n", c, toobig); }
    } while (toobig > 0);
  }
}
```

Observá tres cosas: `single` reinicia `toobig` (y tiene barrera, así que nadie lo lee antes de tiempo); `reduction(+:toobig)` cuenta cuántos puntos todavía cambian más que `tol`; y
`master` **no** tiene barrera, por eso el resultado de `toobig` ya fue sincronizado por la barrera implícita del `for` anterior.

### `barrier` se liga a la región paralela más inmediata

Un `barrier` se asocia a la región `parallel` **más cercana que lo contiene**, no a la función donde está escrito. En el ejemplo, el `barrier` de `sub3` está ligado
a la región paralela abierta en `sub2`, aunque `sub3` se llame dentro de otra región más externa (`sub1`):

```cpp
void sub3(int n) { work(n);
#pragma omp barrier
                   work(n); }
void sub2(int k) {
#pragma omp parallel shared(k)
  sub3(k);
}
void sub1(int n) {
  int i;
#pragma omp parallel private(i) shared(n)
  {
#pragma omp for
    for (i = 0; i < n; i++) sub2(i);
  }
}
```

**Todos los hilos de esa región** deben ejecutar el `barrier` (y las tareas previas) antes de que alguno continúe: poner un `barrier` donde sólo algunos hilos llegan produce un bloqueo.

## Pseudocódigo

```
master:   si soy el hilo 0 → ejecutar bloque ; (los demás pasan de largo)
barrier:  contador ← contador + 1
          mientras contador < p: esperar
          (flush implícito) ; continuar
```

## C++

El editor trae `omp07_master.cpp` con $n = 512$ y `tol = 0.01`. En el código original la impresión de iteración queda **fuera** de la región paralela (comentada dentro), para no mezclar la salida de los hilos.

## Complejidad

Una barrera cuesta lo que tarda el hilo **más lento** más la latencia de sincronización, $O(p)$ en el modelo de overhead de la PD04 2026-I. `master` no agrega costo de
sincronización; ejecuta un trabajo de **un solo hilo**, así que deja ociosos a los demás sólo si luego hay una barrera.

## Ejemplo

El patrón `parallel` + `single`/`master` que **lanza trabajo** para el resto de los hilos es el de los ejemplos de tareas (`omp17_task01.cpp`: `parallel` → `single` → varios `task`) — ver [omp-tasks-icv](/topics/omp-tasks-icv).

## Casos especiales

- **`master` vs `single`**: `master` = siempre el hilo 0 y **sin** barrera; `single` = cualquier hilo y **con** barrera al final (salvo `nowait`).
- **Barrera dentro de un `if` por hilo**: bloquea el programa si no todos los hilos la alcanzan.
- **`master` y la lectura de variables escritas por otros hilos**: como no hay barrera, el valor leído puede no estar actualizado; por eso en el ejemplo `toobig` se lee tras la barrera del `for`.
