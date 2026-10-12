---
kind: algorithm
title: "reduction"
order: 3
cppSteps: ["omp06_reduction.cpp"]
visualization:
  type: dag
  steps:
    - note: "Cada hilo recibe una copia privada de result (r0..r3) inicializada con el elemento neutro del operador (0 para +). Ninguno toca la variable compartida mientras itera."
      nodes:
        - { id: r, value: "result", state: muted }
        - { id: c0, value: "r0=0", parent: r, state: active }
        - { id: c1, value: "r1=0", parent: r, state: active }
        - { id: c2, value: "r2=0", parent: r, state: active }
        - { id: c3, value: "r3=0", parent: r, state: active }
      links:
        - { from: r, to: c0, label: "copia" }
        - { from: r, to: c1, label: "copia" }
        - { from: r, to: c2, label: "copia" }
        - { from: r, to: c3, label: "copia" }
    - note: "Cada hilo acumula su parte del producto escalar (8 productos de 1.0 x 2.0 = 16) sin sincronización: cada hilo avanza a su ritmo."
      nodes:
        - { id: r, value: "result", state: muted }
        - { id: c0, value: "r0=16", parent: r, state: active }
        - { id: c1, value: "r1=16", parent: r, state: active }
        - { id: c2, value: "r2=16", parent: r, state: active }
        - { id: c3, value: "r3=16", parent: r, state: active }
      links:
        - { from: r, to: c0 }
        - { from: r, to: c1 }
        - { from: r, to: c2 }
        - { from: r, to: c3 }
    - note: "Al terminar, los parciales se combinan con el operador (+) y el resultado se escribe en la variable compartida: 16+16+16+16 = 64. Combinados en árbol cuestan O(log p)."
      nodes:
        - { id: c0, value: "r0", state: muted }
        - { id: c1, value: "r1", state: muted }
        - { id: c2, value: "r2", state: muted }
        - { id: c3, value: "r3", state: muted }
        - { id: r, value: "result=64", parent: c0, state: answer }
      links:
        - { from: c0, to: r, label: "+" }
        - { from: c1, to: r, label: "+" }
        - { from: c2, to: r, label: "+" }
        - { from: c3, to: r, label: "+" }
---

## Qué hace

`reduction(operador : lista)` crea una **copia privada** de cada variable de la lista en cada hilo, inicializada con el elemento neutro del operador, y al final del
constructor **combina** todas las copias privadas con el operador sobre la variable compartida original, que recibe el valor final.

## Intuición

Es la solución al problema del acumulador compartido. Si todos los hilos hacen `result += x` sobre la misma variable hay una condición de carrera; si cada
uno suma en su propio cuaderno y al final se juntan los cuadernos, no hace falta bloquear a nadie mientras se calcula.

## Algoritmo

```cpp
#pragma omp parallel for default(shared) private(i) \
        schedule(static, chunk) reduction(+:result)
for (i = 0; i < n; i++)
    result += (a[i] * b[i]);
printf("Final result = %f\n", result);
```

Condiciones de la slide: las variables de la reducción deben ser **escalares** (no arreglos ni estructuras) y declararse **shared** en el contexto exterior.

Mismo patrón con un bucle que llama a una función:

```cpp
#pragma omp parallel
{
#pragma omp for reduction(+:sm)
  for (int i = 0; i < 20; i++) {
    double r = work(i);
    sm += r;
  }
}
```

### Un error clásico: inicializar la variable de la reducción

```cpp
int main(void) {
  int a, i;
#pragma omp parallel shared(a) private(i)
  {
#pragma omp master
    a = 0;                              // ← no sincronizada con la reducción
    // Para evitar la carrera, agregar una barrera aquí.
#pragma omp for reduction(+:a)
    for (i = 0; i < 10; i++) a += i;
#pragma omp single
    printf("Sum is %d\n", a);
  }
}
```

El código es **incorrecto**: `a = 0` lo ejecuta sólo el master y los demás hilos pueden empezar la reducción antes de que ese valor esté escrito, por lo que imprime un valor errado. Tres soluciones: añadir `#pragma omp barrier` justo
después de `a = 0`, incluir `a = 0` en un `single` (que tiene barrera implícita), o inicializar `a` **antes** de abrir la región paralela.

## Pseudocódigo

```
para cada hilo h:        copia_h ← neutro(op)
para cada iteración i asignada a h:  copia_h ← copia_h op f(i)
(al finalizar el bucle)  original ← original op copia_0 op copia_1 op ... op copia_{p-1}
```

## C++

`omp06_reduction.cpp` calcula el producto escalar $\sum a_i b_i$ con $n = 32$, $a_i = 1$, $b_i = 2$ (esperado: `64`), con `schedule(dynamic)` y
`reduction(+:result)`; imprime el parcial que ve cada hilo. Probalo cambiando `num_threads` y el `schedule`: el resultado final
no cambia, los parciales sí.

## Complejidad

El trabajo se divide entre $p$ hilos, $O(n/p)$ cada uno; la combinación final de los $p$ parciales es una reducción en árbol, $O(\log p)$ (PD04 2026-I). Entonces
$T_p = O(n/p + \log p)$. Contrastá con `critical`/`atomic` *dentro* del bucle: serializa cada iteración, costo $O(n)$ de contención.

## Ejemplo

PD04 2025-II S1 (gradiente logístico): `reduction` sobre el gradiente es la solución más eficiente, comparada con `critical` y `atomic`; ver
[evaluaciones PD4](/evaluaciones).

## Casos especiales

- **Operadores válidos** y su elemento neutro (*nota de apoyo*: la slide sólo muestra `+`; esta lista es del estándar OpenMP): `+`, `-` → 0; `*` → 1; `&&` → 1; `||` → 0; `&` → todos los bits en 1; `|` y `^` → 0; `max`, `min` → el valor extremo del tipo.
- **`p = 1`**: la reducción es el acumulador secuencial.
- **Reducción sobre un arreglo** (por ejemplo, un histograma): no es una reducción escalar; ver la PD04 2025-II S2.
