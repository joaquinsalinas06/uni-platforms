---
kind: operation
title: Insert-retroactive
order: 1
cppSteps:
  - step-1-timeline.cpp
  - step-2-insert-retroactive.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  steps:
    - note: >-
        Línea de tiempo real (ejemplo "Normal" de examples.md): tres
        operaciones add(x). Σ acumulada hasta ahora = 18.
      caption: "Σ = 18"
      nodes:
        - { id: t1, value: "add(5)", parent: null }
        - { id: t2, value: "add(3)", parent: t1 }
        - { id: t3, value: "add(10)", parent: t2 }
    - note: >-
        Se ubica t = 1.5, entre t1 y t2: ahí es donde entra la nueva
        operación, no "al final" de la línea de tiempo.
      caption: "insertar add(100) en t = 1.5"
      highlight: ["t1", "t2"]
      nodes:
        - { id: t1, value: "add(5)", parent: null }
        - { id: t2, value: "add(3)", parent: t1 }
        - { id: t3, value: "add(10)", parent: t2 }
    - note: >-
        La nueva entrada se intercala en la línea de tiempo: t2 y t3 quedan
        después de ella, no se pierde ningún orden relativo.
      highlight: ["t15"]
      nodes:
        - { id: t1, value: "add(5)", parent: null }
        - { id: t15, value: "add(100)", parent: t1, state: active }
        - { id: t2, value: "add(3)", parent: t15 }
        - { id: t3, value: "add(10)", parent: t2 }
    - note: >-
        Hay que rehacer todo lo que hay desde t = 1.5 en adelante (t15, t2,
        t3) porque cada uno dependía del estado acumulado — es el costo
        O(m) de la versión ingenua.
      caption: "Σ = 118"
      highlight: ["t15", "t2", "t3"]
      nodes:
        - { id: t1, value: "add(5)", parent: null }
        - { id: t15, value: "add(100)", parent: t1, state: active }
        - { id: t2, value: "add(3)", parent: t15, state: active }
        - { id: t3, value: "add(10)", parent: t2, state: active }
---

## Qué hace

Inserta una operación `op` en un tiempo `t` de la línea de tiempo — un
tiempo que puede ser pasado. No agrega `op` "al final"; la coloca en el
punto `t` de la secuencia, entre las operaciones que ya estaban antes y
después de `t`.

## Intuición

La línea de tiempo es la única fuente de verdad: no existe una copia
"anterior a la inserción" que siga viva en paralelo (eso es lo que haría
persistencia). Insertar en `t` significa que, a partir de ahora, **la
historia siempre incluyó `op` en ese punto** — así que todo lo que dependía
del estado en tiempos posteriores a `t` queda, en principio, desactualizado
y debe reflejar el cambio.

## Algoritmo

> **Derivado** (no está en las diapositivas: el mazo da la firma de
> `Insert(t, op)` pero ningún pseudocódigo). La versión ingenua, que es el
> punto de referencia contra el que se mide todo el resto de la semana:

1. Ubicar la posición de `t` en la línea de tiempo ordenada por tiempo.
2. Colocar `op` ahí, desplazando lo que venía después de `t` sin
   eliminarlo.
3. Recalcular el estado presente rehaciendo, en orden, todas las
   operaciones desde `t` en adelante — costo $O(m)$ si hay `m` operaciones
   en la línea de tiempo.

Las técnicas de la semana ([retroactividad conmutativa e
invertible](/structures/commutative-invertible-retroactivity),
[problemas de búsqueda descomponibles](/structures/decomposable-search-problem),
el [método de rollback](/structures/rollback-method)) existen exactamente
para evitar el paso 3 completo.

## Pseudocódigo

```
Insert-Retroactive(línea_de_tiempo, t, op)
insertar (t, op) en línea_de_tiempo, ordenado por tiempo
para cada (tʼ, opʼ) en línea_de_tiempo con tʼ ≥ t, en orden creciente:
    reaplicar opʼ sobre el estado acumulado
// costo ingenuo: O(m), m = |línea_de_tiempo|
```

## C++

Ver `step-1-timeline.cpp`, `step-2-insert-retroactive.cpp` y
`full-implementation.cpp` en el editor de arriba. La estructura mínima usada
para hacer el modelo tangible es un contador: la línea de tiempo guarda
operaciones `add(x)` y el "estado" es la suma acumulada hasta un tiempo
dado.

## Complejidad temporal

$O(m)$ en la versión ingenua (m = número de operaciones en la línea de
tiempo), por rehacer todo lo que ocurre desde `t` en adelante. Es el número
contra el que se compara cada técnica posterior; el modelo en sí no
promete nada mejor.

## Complejidad espacial

$O(1)$ adicional sobre la línea de tiempo existente (sólo se agrega una
entrada); la línea de tiempo completa ocupa $O(m)$.

## Ejemplo

Ver el caso "normal" de [examples.md](/structures/retroactivity/examples):
insertar `add(100)` en `t = 1.5` sobre una línea de tiempo con operaciones
en `t = 1, 2, 3` cambia la suma presente sin que la versión anterior deje
rastro alguno — a diferencia de persistencia, que dejaría esa versión
intacta y consultable.

## Casos límite

- **Insertar en el tiempo más reciente**: equivale a agregar "al final"
  como en el uso normal, sin efecto retroactivo — ningún estado posterior
  necesita recalcularse porque no hay ninguno.
- **Insertar en el tiempo más antiguo**: obliga a rehacer toda la línea de
  tiempo, el caso $O(m)$ completo.
- **Insertar en un `t` ya ocupado por otra operación**: el material no dice
  qué debe pasar (ver nota de apoyo en [theory.md](/structures/retroactivity)).
