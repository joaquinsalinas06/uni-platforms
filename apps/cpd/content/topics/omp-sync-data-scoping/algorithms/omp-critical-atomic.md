---
kind: algorithm
title: "critical y atomic"
order: 1
cppSteps: ["omp11_critical_max.cpp", "omp12_atomic_pi.cpp"]
visualization:
  type: timeline
  steps:
    - note: "critical sin nombre: todas las secciones críticas de la región comparten un único cerrojo. Mientras el hilo 0 está dentro, los hilos 1 y 2 esperan aunque quieran entrar a bloques distintos."
      lanes:
        - { id: t0, label: "hilo 0" }
        - { id: t1, label: "hilo 1" }
        - { id: t2, label: "hilo 2" }
      events:
        - { lane: t0, tStart: 0, tEnd: 2, label: "critical", state: active }
        - { lane: t1, tStart: 0, tEnd: 2, label: "espera", state: muted }
        - { lane: t1, tStart: 2, tEnd: 4, label: "critical", state: active }
        - { lane: t2, tStart: 0, tEnd: 4, label: "espera", state: muted }
        - { lane: t2, tStart: 4, tEnd: 6, label: "critical", state: active }
      messages: []
    - note: "critical (xaxis) y critical (yaxis): nombres distintos son secciones críticas independientes. El hilo 0 puede estar en xaxis mientras el hilo 1 está en yaxis sin bloquearse."
      lanes:
        - { id: t0, label: "hilo 0" }
        - { id: t1, label: "hilo 1" }
        - { id: t2, label: "hilo 2" }
      events:
        - { lane: t0, tStart: 0, tEnd: 2, label: "critical (xaxis)", state: active }
        - { lane: t1, tStart: 0, tEnd: 2, label: "critical (yaxis)", state: answer }
        - { lane: t2, tStart: 0, tEnd: 2, label: "espera xaxis", state: muted }
        - { lane: t2, tStart: 2, tEnd: 4, label: "critical (xaxis)", state: active }
      messages: []
---

## Qué hace

Ambos garantizan **exclusión mutua**, pero a distinta escala:

- **`critical`** restringe la ejecución de un **bloque** a un hilo a la vez. Influye sobre todos los hilos de la región paralela y se le puede asignar un
  **nombre**. Un hilo espera al entrar hasta que ningún otro esté ejecutando esa región crítica.
- **`atomic`** asegura que **una ubicación de memoria** se accede atómicamente, evitando lecturas y escrituras simultáneas. Fuerza acceso exclusivo con
  respecto a **otras regiones `atomic` sobre la misma ubicación `x`**, entre todos los hilos del programa, sin importar a qué bloques pertenezcan. Actúa como una **mini-critical** que sólo
  aplica a la línea que le sigue inmediatamente.

## Intuición

`critical` es una puerta con llave: sólo entra uno y puede hacer lo que quiera adentro. `atomic` es un mostrador con un solo botón: cada persona presiona
**ese** botón sin que nadie lo interrumpa, pero sólo puede hacer **esa** acción.

## Algoritmo

### `critical` con nombre

La tarea se saca de la cola (*dequeue*) dentro de la sección crítica para que **la misma tarea no la ejecuten dos hilos**. Dos colas independientes se
nombran `xaxis` e `yaxis`, de modo que sacar de una no bloquea a quien saca de la otra:

```cpp
void critical_example(float *x, float *y) {
  int ix_next, iy_next;
#pragma omp parallel shared(x, y) private(ix_next, iy_next)
  {
#pragma omp critical (xaxis)
    ix_next = dequeue(x);
    work(ix_next, x);
#pragma omp critical (yaxis)
    iy_next = dequeue(y);
    work(iy_next, y);
  }
}
```

### Las cuatro formas de `atomic`

```cpp
#pragma omp atomic [read | write | update | capture] newline
    expression-stmt
```

| Forma | Qué fuerza | Sentencias admitidas |
|---|---|---|
| `read` | Lectura atómica de `x` | `v = x;` (`v` es un escalar que no accede a la memoria de `x`) |
| `write` | Escritura atómica en `x` | `x = expr;` (`expr` escalar) |
| `update` (por defecto) | Actualización atómica de `x` | `x++; x--; ++x; --x; x binop= expr; x = x binop expr; x = expr binop x;` |
| `capture` | Actualización atómica **y** captura del valor original o final de `x` | `v = x++; v = x--; v = ++x; v = --x; v = x binop= expr; ...` o un bloque `{ v = x; x binop= expr; }` |

`binop` es uno de `+ * - / & ^ | << >>`. La especificación admite 15 formas de bloque para `capture` (por ejemplo `{ v = x; x++; }`, `{ ++x; v = x; }`,
`{ x = expr binop x; v = x; }`).

Ejemplo de la clase — evitar la carrera sobre `x[index[i]]`, que **puede repetirse** entre iteraciones:

```cpp
void atomic_example(float *x, float *y, int *index, int n) {
  int i;
#pragma omp parallel for shared(x, y, index, n)
  for (i = 0; i < n; i++) {
#pragma omp atomic update
    x[index[i]] += work1(i);
    y[i] += work2(i);
  }
}
```

`atomic` se aplica **sólo** a la sentencia que le sigue: los elementos de `y` **no** se actualizan atómicamente (no hace falta: `y[i]` es distinto en cada iteración).
Si en cambio se usara `critical`, las actualizaciones de `x` se ejecutarían secuencialmente.

### `atomic capture`: reservar una posición única

Cuando varios hilos van agregando a un arreglo y el índice de escritura es compartido, `capture` entrega a cada hilo **su** posición:

```cpp
int idx;
#pragma omp atomic capture
idx = k++;               // atómicamente: idx ← k ; k ← k + 1
posiciones[idx][0] = i;  // cada hilo escribe en una posición distinta
posiciones[idx][1] = j;
```

(Es la solución de la PD04 2026-I, ejercicio 3: posiciones de los valores mayores al promedio.)

## Pseudocódigo

```
critical(nombre):  adquirir cerrojo[nombre] ; ejecutar bloque ; liberar cerrojo[nombre]
atomic update:     x ← x op expr  como UNA operación indivisible sobre x
atomic capture:    (v, x) ← (x, x op expr)  indivisible
```

## C++

El editor trae dos ejemplos de la clase:

- `omp11_critical_max.cpp` — máximo de `work(i)` con un `critical` **fuera** del `for` (una entrada por hilo). El comentario propone evaluar el `critical` dentro del `for` y comparar tiempos.
- `omp12_atomic_pi.cpp` — cálculo de $\pi$ por integración (regla del rectángulo) con $2^{20}$ pasos, repartiendo `i` en rueda (`i = id; i += nthrds`) y combinando con `atomic` (o `critical`) al final.

> **Corrección al código de clase**: en `omp12_atomic_pi.cpp` el acumulador local `double sum;` no estaba inicializado; aquí se declaró `sum = 0`. Sin esa
> inicialización el resultado depende de basura de la pila.

## Complejidad

Cada vez que $M$ accesos compiten por la misma sección, el costo de serializar es $O(M)$ (PD04 2026-I) por la contención; en teoría `atomic` tiene una constante menor que `critical` porque
sólo cubre una operación (el compilador puede usar instrucciones atómicas de hardware). La estrategia que más reduce $M$ es **acumular localmente por hilo y combinar una vez por hilo**: $M = p$ en vez de $M = n$.

**Medición en esta máquina** (Apple M5, 8 hilos, $8 \times 10^5$ incrementos de un contador compartido, `-O2`; `omp28_contador_*.cpp`, 5 corridas): `critical` ≈ 12 ms, `lock` ≈ 11 ms y `atomic` entre 12 y 30 ms.
Los tres dan `800000` (correctos); **no** se observó que `atomic` ganara. La ventaja teórica de `atomic` depende de la arquitectura y del compilador; medir antes de afirmar.

## Ejemplo

PD04 2025-II S1, ejercicio 1.2 y 1.3: el gradiente de la regresión logística con `critical` (1 pt) y con `atomic` (0.5 pt), comparados contra `reduction`.
La PD04 2025-II S2 repite el patrón con un histograma.

## Casos especiales

- **`critical` sin nombre**: todas las regiones críticas sin nombre del programa son **la misma** región.
- **`atomic` sólo cubre una sentencia**: no protege `a[i] = b[i]; c += a[i];` — sólo la línea inmediata.
- **`atomic` con `capture`**: es la forma que permite usar el valor "antes" o "después" de la actualización sin una sección crítica completa.
- **Nombres de `critical` en funciones llamadas**: la exclusión se da por nombre en todo el programa, no por función.
