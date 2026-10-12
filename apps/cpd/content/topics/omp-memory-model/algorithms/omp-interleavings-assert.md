---
kind: algorithm
title: "¿Puede fallar el assert? Intercalados y prueba por contradicción"
order: 1
cppSteps: ["omp25_assert_sections.cpp", "omp26_assert_critical.cpp"]
visualization:
  type: timeline
  steps:
    - note: "Orden ABCD: f() termina antes de que empiece g(). x=1, y=1 → a=1, b=1 → b >= a. No falla."
      lanes:
        - { id: f, label: "hilo f()" }
        - { id: g, label: "hilo g()" }
      events:
        - { lane: f, tStart: 0, tEnd: 1, label: "A: x=1", state: active }
        - { lane: f, tStart: 1, tEnd: 2, label: "B: y=1", state: active }
        - { lane: g, tStart: 2, tEnd: 3, label: "C: a=y (1)", state: active }
        - { lane: g, tStart: 3, tEnd: 4, label: "D: b=x (1)", state: active }
      messages: []
    - note: "Orden ACBD: g lee y=0 (aún no escrito) y luego, tras A y B, lee x=1. a=0, b=1 → 1 >= 0. No falla."
      lanes:
        - { id: f, label: "hilo f()" }
        - { id: g, label: "hilo g()" }
      events:
        - { lane: f, tStart: 0, tEnd: 1, label: "A: x=1" }
        - { lane: g, tStart: 1, tEnd: 2, label: "C: a=y (0)", state: marked }
        - { lane: f, tStart: 2, tEnd: 3, label: "B: y=1" }
        - { lane: g, tStart: 3, tEnd: 4, label: "D: b=x (1)", state: marked }
      messages: []
    - note: "Orden CDAB: g termina antes de que f empiece. a=0, b=0 → 0 >= 0. No falla. Los 6 intercalados válidos (A antes de B, C antes de D) cumplen el assert."
      lanes:
        - { id: f, label: "hilo f()" }
        - { id: g, label: "hilo g()" }
      events:
        - { lane: g, tStart: 0, tEnd: 1, label: "C: a=y (0)", state: answer }
        - { lane: g, tStart: 1, tEnd: 2, label: "D: b=x (0)", state: answer }
        - { lane: f, tStart: 2, tEnd: 3, label: "A: x=1" }
        - { lane: f, tStart: 3, tEnd: 4, label: "B: y=1" }
      messages: []
    - note: "Sólo si el compilador o el procesador reordenan B antes de A (escritura y=1 visible antes que x=1), el orden B, C, D, A da a=1, b=0 → 0 >= 1 falla. Eso es lo que los intercalados 'ingenuos' no capturan."
      lanes:
        - { id: f, label: "hilo f()" }
        - { id: g, label: "hilo g()" }
      events:
        - { lane: f, tStart: 0, tEnd: 1, label: "B: y=1 (primero)", state: marked }
        - { lane: g, tStart: 1, tEnd: 2, label: "C: a=y (1)", state: marked }
        - { lane: g, tStart: 2, tEnd: 3, label: "D: b=x (0)", state: marked }
        - { lane: f, tStart: 3, tEnd: 4, label: "A: x=1 (después)", state: marked }
      messages: []
---

## Qué hace

Responde, con un ejemplo mínimo, una pregunta de corrección: **¿existe alguna ejecución de dos hilos que haga fallar el `assert`?** Se resuelve de dos maneras complementarias: **enumerando** los intercalados posibles y
**demostrando por contradicción** que ninguno lo viola — y luego se cuestiona la hipótesis de que "ejecutar" significa "ejecutar en el orden escrito".

## Intuición

Si cada hilo ejecuta sus instrucciones **en orden**, `g` sólo puede ver `y = 1` si `y = 1` ya ocurrió, y `y = 1` ocurre **después** de `x = 1`. Entonces quien ve `y = 1` forzosamente ya pudo ver `x = 1`: el assert no puede fallar.

## Algoritmo

```cpp
class C {
  int x = 0;
  int y = 0;
public:
  void f() {
    x = 1;            // A
    y = 1;            // B
  }
  void g() {
    int a = y;        // C
    int b = x;        // D
    assert(b >= a);
  }
};

int main() {
  int i = 1;
  while (true) {
    C c;
#pragma omp parallel
    {
#pragma omp sections
      {
#pragma omp section
        c.f();
#pragma omp section
        c.g();
      }
    }
    if (++i % 1000 == 0) cout << i << endl;
  }
}
```

### 1. Enumerar los intercalados

Restricciones: **A antes de B** (orden del programa en `f`) y **C antes de D** (orden del programa en `g`). Hay $\binom{4}{2} = 6$ formas:

| Intercalado | a = y | b = x | `b >= a` |
|---|---|---|---|
| ABCD | 1 | 1 | ✔ |
| ACBD | 0 | 1 | ✔ |
| ACDB | 0 | 1 | ✔ |
| CABD | 0 | 1 | ✔ |
| CADB | 0 | 1 | ✔ |
| CDAB | 0 | 0 | ✔ |

Para el caso general, con 2 hilos y $k$ sentencias, hay $\binom{2k}{k} \sim 4^k/\sqrt{2k}$ formas — enumerar no escala (ver [omp-memory-model](/topics/omp-memory-model)).

### 2. Prueba por contradicción

Supongamos que el assert falla: $b < a$, o sea $a = 1$ y $b = 0$.

- Si $a = 1$, entonces `y = 1` (B) se ejecutó **antes** de `a = y` (C).
- Si $b = 0$, entonces `b = x` (D) se ejecutó **antes** de `x = 1` (A).
- Cada hilo ejecuta sus instrucciones secuencialmente: C antes de D, y A antes de B.

Por transitividad: $C \to D \to A \to B \to C$, es decir, `a=y` → `b=x` → `x=1` → `y=1` → `a=y`. **Un ciclo**, y un ciclo de "ocurre antes" es imposible en una ejecución paralela. Contradicción: el assert no puede fallar.

### 3. Dónde está el supuesto escondido

La demostración supone que **cada hilo se ejecuta en el orden en que está escrito y que todos ven las escrituras en un único orden global**. Las diapositivas siguientes ([omp-memory-model](/topics/omp-memory-model)) muestran por qué eso **no** está garantizado:
el compilador puede reordenar o eliminar sentencias y el procesador puede reordenar accesos a memoria. Si `B` ocurre antes que `A` (4.º paso del diagrama), el ciclo de la prueba desaparece y el assert **puede** fallar.
En C++ además, acceder a `x` e `y` desde dos hilos sin sincronizar es una **carrera de datos** (comportamiento indefinido) — el programa de la clase es un experimento, no un patrón a imitar.

> **Nota de apoyo**: en la slide la conclusión "no puede fallar" es la del razonamiento de orden secuencial. Que falle o no en la práctica depende del compilador, de las optimizaciones y del procesador;
> en una corrida de 8 s con `-O2` en un Apple M5 (≈55 000 repeticiones del bucle `while`) **no** falló ni la versión con `sections` ni la de `critical`.
> No observar un fallo no demuestra su ausencia.

### 4. La versión con `critical`

`omp26_assert_critical.cpp` encierra `c.f()` y `c.g()` en dos secciones `critical`: ahora cada función es **atómica** respecto a la otra y sólo existen dos intercalados reales, `f` entera antes de `g` o al revés (ABCD o CDAB). Además `critical` impone
`flush` al entrar y salir, así que la visibilidad ya no depende de la suerte.

## Pseudocódigo

```
dado un conjunto de sentencias por hilo con orden interno fijo:
  intercalados ← todas las formas de mezclar respetando el orden interno   // C(2k, k)
  para cada intercalado: evaluar la aserción
asumir que existe una ejecución que falla → derivar el orden que debió ocurrir → buscar un ciclo
```

## C++

Los dos programas de la clase están en el editor: `omp25_assert_sections.cpp` (el experimento con `sections`) y `omp26_assert_critical.cpp` (la versión con `critical`). Ambos imprimen el contador cada 1000 iteraciones
para mostrar que siguen vivos; si el `assert` fallara, el programa abortaría.

## Complejidad

Enumerar es $\binom{2k}{k}$ — exponencial; la prueba por contradicción cuesta **una** cadena de $O(k)$ pasos. Por eso la clase insiste en **razonar con relaciones de orden** (*happens-before*) y no en probar ejecuciones.

## Ejemplo

El ejemplo **es** el algoritmo. Para $k = 2$ la tabla completa tiene 6 filas; para extenderlo, añadí una tercera sentencia a cada hilo y contá $\binom{6}{3} = 20$ intercalados.

## Casos especiales

- **Un solo hilo disponible**: si el runtime ejecuta ambas secciones en el **mismo** hilo, sólo existen ABCD o CDAB.
- **Ciclo de espera sin reordenamiento**: la prueba por contradicción **no** aplica si algún par de instrucciones puede reordenarse.
- **`critical`/`atomic` en una sola de las dos funciones**: no alcanza; la exclusión mutua debe existir en **ambas** partes del par.
