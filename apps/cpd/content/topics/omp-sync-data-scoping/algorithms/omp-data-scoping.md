---
kind: algorithm
title: "private, firstprivate, lastprivate y threadprivate"
order: 2
cppSteps: ["omp08_private.cpp", "omp09_lastprivate.cpp", "omp10_threadprivate.cpp"]
visualization:
  type: memory-layout
  steps:
    - note: "shared: una única ubicación de memoria para x. Los cuatro hilos leen y escriben la misma celda."
      blocks:
        - { id: x, label: "x compartida", bytes: 4, offset: 0, state: active }
    - note: "private(x): cada hilo recibe su propia celda del mismo tipo. Las copias nacen sin inicializar; el original queda intacto al salir."
      blocks:
        - { id: x, label: "x orig.", bytes: 4, offset: 0, state: muted }
        - { id: x0, label: "x₀", bytes: 4, offset: 4, state: active }
        - { id: x1, label: "x₁", bytes: 4, offset: 8, state: active }
        - { id: x2, label: "x₂", bytes: 4, offset: 12, state: active }
        - { id: x3, label: "x₃", bytes: 4, offset: 16, state: active }
    - note: "firstprivate(x): igual que private, pero cada copia se inicializa con el valor del original justo antes de entrar a la región."
      blocks:
        - { id: x, label: "x = 7", bytes: 4, offset: 0, state: marked }
        - { id: x0, label: "x₀ = 7", bytes: 4, offset: 4, state: active }
        - { id: x1, label: "x₁ = 7", bytes: 4, offset: 8, state: active }
        - { id: x2, label: "x₂ = 7", bytes: 4, offset: 12, state: active }
        - { id: x3, label: "x₃ = 7", bytes: 4, offset: 16, state: active }
    - note: "lastprivate(x): al salir, el original recibe la copia del hilo que ejecutó la última iteración en orden secuencial (aquí el hilo 3, i = n-1) — el mismo valor que daría el programa secuencial."
      blocks:
        - { id: x, label: "x ← x₃", bytes: 4, offset: 0, state: answer }
        - { id: x0, label: "x₀", bytes: 4, offset: 4, state: muted }
        - { id: x1, label: "x₁", bytes: 4, offset: 8, state: muted }
        - { id: x2, label: "x₂", bytes: 4, offset: 12, state: muted }
        - { id: x3, label: "x₃", bytes: 4, offset: 16, state: answer }
---

## Qué hace

Define **qué copia de cada variable ve cada hilo** y qué pasa con ella al entrar y al salir de la región paralela. La slide lo plantea sobre una *tarea*
(*task*); aplica igual a un hilo de una región `parallel`.

## Intuición

`shared` es una pizarra para todos; `private` entrega una hoja en blanco a cada hilo; `firstprivate` entrega una fotocopia del original; `lastprivate`
entrega una hoja en blanco pero **devuelve** al final la hoja de quien hizo el último paso; `threadprivate` es el cajón personal de cada hilo que
**sigue existiendo** entre una región paralela y la siguiente.

## Algoritmo

### `private` y `firstprivate`

Cada tarea que referencia un elemento `private` recibe una copia, y toda referencia al original se reemplaza por la copia. El **valor original podría cambiar sólo si se accede
por punteros**. Una variable que es *parte de otra* (un elemento de arreglo o campo de estructura) no puede estar en la lista de `private`.

```cpp
int main() {
  int i, j, *ptr_i, *ptr_j;
  i = 1;  j = 2;
  ptr_i = &i;  ptr_j = &j;
#pragma omp parallel private(i) firstprivate(j)
  {
    i = 3;
    j = j + 2;
    assert(*ptr_i == 1 && *ptr_j == 2);   // los punteros ven los ORIGINALES
  }
  assert(i == 1 && j == 2);               // el original no cambió
}
```

Dentro de la región, `i` vale 3 y `j` vale 4 (la copia empezó en 2 por `firstprivate`), pero los **originales** `i` y `j` se mantienen al salir. El ejemplo de laboratorio
`omp08_private.cpp` usa `firstprivate(i,j)`: cada hilo imprime `parallel i: 3 j: 4` y al final `i: 1 j: 2`. Cambiá a `private(i,j)` y `j` pasa a ser basura sin inicializar.

### `lastprivate`

Cuando el programa depende del valor de la **última iteración**, `lastprivate` hace que los valores sean equivalentes a los de la ejecución secuencial:

```cpp
void lastpriv(int n, float *a, float *b) {
  int i;
#pragma omp parallel
  {
#pragma omp for lastprivate(i)
    for (i = 0; i < n - 1; i++)
      a[i] = b[i] + b[i + 1];
  }
  a[i] = b[i];        /* i == n-1 aquí */
}
```

### `threadprivate`

Replica una variable global: **cada hilo tiene su copia** y cada copia se inicializa una vez. Se usa para mantener una variable global por hilo
**a lo largo de varias regiones paralelas**:

```cpp
int a, b, i, tid;
float x;
#pragma omp threadprivate(a, x)

int main() {
  omp_set_dynamic(0);           // sin hilos dinámicos: el mapeo hilo→copia debe ser estable
  printf("1st Parallel Region:\n");
#pragma omp parallel private(b, tid)
  {
    tid = omp_get_thread_num();
    a = tid;  b = tid;
    x = 1.1 * tid + 1.0;
    printf("Thread %d: a,b,x= %d %d %f\n", tid, a, b, x);
  }
  printf("Master thread doing serial work here\n");
  printf("2nd Parallel Region:\n");
#pragma omp parallel private(tid)
  {
    tid = omp_get_thread_num();
    printf("Thread %d: a,b,x= %d %d %f\n", tid, a, b, x);
  }
}
```

En la **segunda** región, `a` y `x` (threadprivate) **conservan** el valor que cada hilo les dio en la primera (`a,b,x = 0 0 1.0`, `3 0 4.3`...), mientras que `b` (sólo `private`) vuelve a un valor
sin inicializar (0 en la salida de la slide). Es la diferencia entre `private` (vive una región) y `threadprivate` (vive entre regiones).

> La slide lista `threadprivate(a, x)` en el código de la diapositiva; el archivo de laboratorio (`omp10_threadprivate.cpp`) declara sólo `#pragma omp threadprivate(x)`.

### `shared`, `default`, `copyin`, `copyprivate`

- `default(shared | none)`: alcance por defecto. `default(none)` obliga a declarar el alcance de **cada** variable — útil para cazar carreras por olvido.
- `copyin`: inicializa las copias `threadprivate` de todos los hilos con el valor de las del master.
- `copyprivate`: con `single`, difunde el valor leído por un hilo a las copias privadas de los demás.

## Pseudocódigo

```
entrar a la región:
  private(v):       cada hilo h crea v_h (sin inicializar)
  firstprivate(v):  cada hilo h crea v_h ← v
  threadprivate(v): v_h ya existe y conserva el valor de la región anterior
salir de la región:
  lastprivate(v):   v ← v_h donde h ejecutó la última iteración/sección
  (private/firstprivate): el original no se modifica
```

## C++

- `omp08_private.cpp` — comparar `private(i,j)` y `firstprivate(i,j)`.
- `omp09_lastprivate.cpp` — `lastprivate(i)` en un `for` con $n = 10$; la propia consigna pide "paralelice y mida el efecto de lastprivate".
- `omp10_threadprivate.cpp` — dos regiones paralelas con 4 hilos; ver qué sobrevive entre una y otra.

## Complejidad

Sin costo asintótico propio. En la práctica, `private`/`firstprivate` **cuestan memoria** ($p$ copias) y `firstprivate`/`copyin` cuestan una copia por hilo al entrar; pero evitan
la contención de acceder a un dato compartido: es el mismo principio de "acumular local, combinar al final".

## Ejemplo

Ejemplo de `reduction` y su inicialización (variable `a` de la clase): `a` es `shared` y se inicializa en un `master`; la corrección usa una barrera o un `single` — ver
[omp-reduction](/topics/omp-intro-parallel/algorithms/omp-reduction).

## Casos especiales

- **`private` no inicializa**: leer la copia antes de escribirla es un error.
- **`lastprivate` en `sections`**: el valor sale de la **última sección** del código, no de la que terminó más tarde.
- **`threadprivate` y regiones anidadas o hilos dinámicos**: la persistencia entre regiones sólo está garantizada si el número de hilos no cambia; por eso la slide hace `omp_set_dynamic(0)`.
- **Punteros**: `private(p)` privatiza el puntero, no lo que apunta.
