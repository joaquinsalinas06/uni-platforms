---
kind: algorithm
title: "critical vs atomic vs locks, y el problema de los filósofos"
order: 2
cppSteps: ["omp27_suma_prod_critical.cpp", "omp28_contador_critical.cpp", "omp28_contador_atomic.cpp", "omp28_contador_lock.cpp", "omp29_filosofos.cpp", "omp29b_filosofos_orden.cpp"]
visualization:
  type: network-topology
  steps:
    - note: "5 filósofos (hilos) y 5 tenedores (locks) en círculo. Cada filósofo necesita dos tenedores: el suyo (izquierda) y el del vecino (derecha)."
      processes:
        - { id: f0, label: "F0", state: active }
        - { id: f1, label: "F1", state: active }
        - { id: f2, label: "F2", state: active }
        - { id: f3, label: "F3", state: active }
        - { id: f4, label: "F4", state: active }
      dataFlow:
        - { from: f0, to: f1, label: "tenedor 1" }
        - { from: f1, to: f2, label: "tenedor 2" }
        - { from: f2, to: f3, label: "tenedor 3" }
        - { from: f3, to: f4, label: "tenedor 4" }
        - { from: f4, to: f0, label: "tenedor 0" }
    - note: "Deadlock: si todos toman primero su tenedor izquierdo, cada uno retiene uno y espera el del vecino. Ciclo de espera completo: ninguno puede comer y ninguno suelta el suyo."
      processes:
        - { id: f0, label: "F0", state: marked }
        - { id: f1, label: "F1", state: marked }
        - { id: f2, label: "F2", state: marked }
        - { id: f3, label: "F3", state: marked }
        - { id: f4, label: "F4", state: marked }
      dataFlow:
        - { from: f0, to: f1, label: "espera t1" }
        - { from: f1, to: f2, label: "espera t2" }
        - { from: f2, to: f3, label: "espera t3" }
        - { from: f3, to: f4, label: "espera t4" }
        - { from: f4, to: f0, label: "espera t0" }
    - note: "Solución por jerarquía: todos toman primero el tenedor de menor índice. F4 (izq = 4, der = 0) ya no toma primero el 4 sino el 0, así que la espera circular se rompe — F4 compite con F0 por el tenedor 0 en vez de cerrar el ciclo."
      processes:
        - { id: f0, label: "F0", state: answer }
        - { id: f1, label: "F1", state: active }
        - { id: f2, label: "F2", state: active }
        - { id: f3, label: "F3", state: active }
        - { id: f4, label: "F4", state: answer }
      dataFlow:
        - { from: f4, to: f0, label: "t0 primero" }
---

## Qué hace

Compara tres formas de lograr **exclusión mutua** en OpenMP y muestra qué ocurre cuando varios cerrojos se piden en orden inconsistente:

- **`critical`**: bloque con un cerrojo implícito (único o con nombre).
- **`atomic`**: una sola actualización de memoria, sin bloque.
- **Locks** (`omp_lock_t`): objetos que el programador crea, toma y suelta; permiten **muchos cerrojos independientes** y cerrojos por dato.

Un lock en OpenMP es un objeto que sólo **un hilo a la vez** puede poseer. Tiene cuatro operaciones:

| Función | Efecto |
|---|---|
| `omp_init_lock(&l)` | Inicializa el lock |
| `omp_set_lock(&l)` | Espera hasta que el lock esté disponible y lo toma; nadie más lo obtiene hasta que se libere |
| `omp_unset_lock(&l)` | Libera el lock |
| `omp_destroy_lock(&l)` | Termina el lock (lo contrario de `init`) |

## Intuición

`critical` es una puerta que el compilador pone y quita; un lock es una llave que **vos** manejás. Tener muchas llaves da mucha libertad (un lock por cada casilla de un histograma) pero también permite **dos errores nuevos**: olvidar soltar una llave, o que dos personas pidan las llaves en orden contrario y se queden esperándose para siempre.

## Algoritmo

### Contar con `critical`, `atomic` y lock

Tres programas idénticos salvo la exclusión (8 hilos, 100 000 incrementos cada uno, `x = x + 1`):

```cpp
// omp28_contador_critical.cpp
for (int i = 0; i < 100000; i++)
#pragma omp critical
  x = x + 1;

// omp28_contador_atomic.cpp
for (int i = 0; i < 100000; i++)
#pragma omp atomic
  x = x + 1;

// omp28_contador_lock.cpp
omp_lock_t writelock;  omp_init_lock(&writelock);
for (int i = 0; i < 100000; i++) {
  omp_set_lock(&writelock);
  x = x + 1;
  omp_unset_lock(&writelock);
}
omp_destroy_lock(&writelock);
```

Los tres dan `x = 800000`. Medición propia (Apple M5, `-O2`, 5 corridas): ≈ 11–12 ms (`critical` y `lock`) y entre 12 y 30 ms (`atomic`). Es un recordatorio de **medir** antes de elegir.

### Suma y producto con `critical` por hilo

Cada hilo acumula localmente y entra a la sección crítica **una vez** por variable; con nombres distintos, `sum` y `prod` no se bloquean entre sí:

```cpp
#pragma omp parallel default(shared)
{
  int psum = 0, pprod = 1;
#pragma omp for
  for (int i = 0; i < ARR_SIZE; i++) { psum += a[i]; pprod *= a[i]; }
#pragma omp critical (section1)
  sum += psum;
#pragma omp critical (section2)
  prod *= pprod;
}
```

### El problema de los filósofos

$N$ filósofos cenan en una mesa redonda con $N$ tenedores; cada uno necesita **dos** (el izquierdo y el derecho) y comparte cada tenedor con un vecino. Algoritmo propuesto: piensa hasta que el tenedor izquierdo esté disponible, luego hasta que el derecho lo esté, come, deja el izquierdo, deja el derecho, repite. Con locks, un tenedor es un `omp_lock_t`:

```cpp
omp_lock_t forks[N];
for (int i = 0; i < N; ++i) omp_init_lock(&forks[i]);

#pragma omp parallel num_threads(N) private(id, left, right)
{
  id = omp_get_thread_num();
  left = id;
  right = (id + 1) % N;
  for (int i = 0; i < 30; ++i) {
    think(id);
    omp_set_lock(&forks[left]);      // izquierdo primero
    omp_set_lock(&forks[right]);     // luego derecho
    eat(id);
    omp_unset_lock(&forks[left]);
    omp_unset_lock(&forks[right]);
  }
}
for (int i = 0; i < N; ++i) omp_destroy_lock(&forks[i]);
```

La diapositiva cierra con una pregunta: **"Hay un problema de concurrencia en el código. ¿Cómo lo solucionaría?"** El problema es el **deadlock** del diagrama: si los 5 hilos obtienen su tenedor izquierdo antes de que alguno pida el derecho, quedan esperando en círculo. En 8 corridas de `omp29_filosofos.cpp` en esta máquina, **una** se colgó.

**Solución (propuesta, no está en la slide)**: ordenar los recursos. Si todos piden primero el tenedor de menor índice y luego el de mayor, el último filósofo (izq. 4, der. 0) pide primero el 0, y **no puede existir un ciclo de espera**:

```cpp
int first  = left < right ? left : right;
int second = left < right ? right : left;
omp_set_lock(&forks[first]);
omp_set_lock(&forks[second]);
eat(id);
omp_unset_lock(&forks[second]);
omp_unset_lock(&forks[first]);
```

`omp29b_filosofos_orden.cpp`: 25 corridas, ninguna colgada.

### Histograma: carrera, `critical` y un lock por casilla

```cpp
#pragma omp parallel for private(key)
for (int i = 0; i < INP_SIZE; i++) {
  key = inp[i];
  hist[key]++;                 // CARRERA: dos hilos pueden tener el mismo key
}
```

- **`critical`** alrededor de `hist[key]++`: correcto pero **serializa todo** el bucle ("no es eficiente"). Pregunta de la slide: *¿se podrá usar secciones críticas?* Sí, pero con costo $O(n)$ de contención.
- **Un lock por casilla** (`lock[HIST_SIZE]`): hilos que incrementan **casillas distintas** no se bloquean entre sí.

```cpp
omp_lock_t lock[HIST_SIZE];
for (int i = 0; i < HIST_SIZE; i++) omp_init_lock(&lock[i]);
#pragma omp parallel for private(key)
for (int i = 0; i < INP_SIZE; i++) {
  key = inp[i];
  omp_set_lock(&lock[key]);      // ← lock[key], no lock[i]
  hist[key]++;
  omp_unset_lock(&lock[key]);
}
```

> **Corrección a la slide**: la diapositiva escribe `omp_set_lock(&(lock[i]))`. Eso protege la casilla **`i`** (el índice del bucle), no la casilla `key` que se está modificando, y no resuelve la carrera.
> Debe bloquearse `lock[key]`.

La PD04 2025-II S2 vuelve sobre este problema con `reduction` (histograma privado por hilo) y `atomic`.

## Pseudocódigo

```
deadlock: existe un ciclo  h1 espera lock de h2, h2 espera lock de h3, ..., hk espera lock de h1
prevención: imponer un orden total a los locks y pedir siempre en ese orden (se rompe la espera circular)
```

## C++

El editor trae `omp27_suma_prod_critical.cpp`, los tres contadores, y las dos versiones de los filósofos (con deadlock posible y con jerarquía). Para ver el deadlock, ejecutá la primera varias veces: cada ejecución
que no se cuelga imprime 300 líneas de pensar/comer y 5 de "ha terminado".

## Complejidad

- Contador con exclusión mutua: los $p$ hilos hacen $m$ incrementos cada uno, todos serializados: $T = O(p \cdot m)$ en lugar de $O(m)$ — **no hay speedup** porque toda la región está serializada. El paralelismo útil sale de **acumular local**.
- Histograma con un lock por casilla: la contención baja de $O(n)$ a $O(n/B)$ en promedio para $B$ casillas con claves uniformes, a cambio de $B$ locks (memoria).
- Filósofos: la solución por jerarquía no agrega espera esperable; sólo evita el bloqueo definitivo.

## Ejemplo

PD04 2025-II S2, ejercicio 1 (histograma): con `reduction` (1 pt) y con `atomic` (0.5 pt), y un PRAM (1 pt) para uno de los dos. Ver las evaluaciones PD4.

## Casos especiales

- **Olvidar `omp_unset_lock`** en alguna rama (`return`, `break`): el lock queda tomado y el resto de los hilos esperan para siempre.
- **Un lock tomado dos veces por el mismo hilo**: bloqueo propio; para eso existe `omp_nest_lock_t`. (*Nota de apoyo*: no está en la clase.)
- **`critical` sin nombre**: protege **todo** código crítico del programa con un único cerrojo; con nombres se obtienen secciones independientes.
