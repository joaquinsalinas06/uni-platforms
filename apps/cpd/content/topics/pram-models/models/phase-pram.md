---
kind: algorithm
title: "Phase PRAM"
order: 2
visualization:
  type: timeline
  steps:
    - note: "Fase 1: los 4 procesadores calculan sus 4 sumas parciales de forma completamente independiente, como en APRAM — nadie ha llegado todavía a ningún punto de sincronización."
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 1, label: "nivel 1", state: active }
        - { lane: p1, tStart: 0, tEnd: 1, label: "nivel 1", state: active }
        - { lane: p2, tStart: 0, tEnd: 1, label: "nivel 1", state: active }
        - { lane: p3, tStart: 0, tEnd: 1, label: "nivel 1", state: active }
    - note: "Barrera 1: los 4 procesadores terminan su cómputo local y esperan en la barrera. Ésta es la regla que define Phase PRAM: nadie puede empezar la fase 2 hasta que TODOS —los 4— la hayan cruzado."
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p1, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p2, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p3, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p0, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p1, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p2, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p3, tStart: 1, tEnd: 1, label: "barrera", state: marked }
    - note: "Fase 2: la barrera se cruzó y ahora sólo 2 procesadores tienen trabajo — la reducción a la mitad de los datos deja la mitad de procesadores activos. p2 y p3 ya no participan en el resto del algoritmo."
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p1, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p2, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p3, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p0, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p1, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p2, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p3, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p0, tStart: 2, tEnd: 3, label: "nivel 2", state: active }
        - { lane: p1, tStart: 2, tEnd: 3, label: "nivel 2", state: active }
    - note: "Fase 3 (última) y barrera 2: los 2 procesadores de la fase anterior cruzan una segunda barrera, y el único procesador restante calcula la suma final. El patrón se repite: cada fase reduce a la mitad los procesadores activos, y cada barrera garantiza que la fase anterior terminó por completo antes de leer sus resultados."
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p1, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p2, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p3, tStart: 0, tEnd: 1, label: "nivel 1", state: muted }
        - { lane: p0, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p1, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p2, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p3, tStart: 1, tEnd: 1, label: "barrera", state: marked }
        - { lane: p0, tStart: 2, tEnd: 3, label: "nivel 2", state: muted }
        - { lane: p1, tStart: 2, tEnd: 3, label: "nivel 2", state: muted }
        - { lane: p0, tStart: 3, tEnd: 3, label: "barrera", state: marked }
        - { lane: p1, tStart: 3, tEnd: 3, label: "barrera", state: marked }
        - { lane: p0, tStart: 4, tEnd: 5, label: "nivel 3", state: answer }
---

## Qué hace

Phase PRAM es una solución intermedia entre PRAM (completamente síncrono) y
APRAM (completamente asíncrono): divide la ejecución en fases, y dentro de
cada fase los procesadores trabajan de forma independiente, pero ningún
procesador comienza la fase siguiente hasta que todos hayan terminado la
anterior (barrera global al final de cada fase).

## Intuición

Es como trabajar en rondas: dentro de una ronda cada quien avanza a su
propio ritmo (como en APRAM), pero nadie empieza la ronda siguiente hasta
que todos terminaron la actual. Eso da algo del realismo de APRAM
(paralelismo dentro de la fase) sin perder la comodidad de razonar en pasos
discretos, como en PRAM clásico.

## Algoritmo

    cómputo paralelo -> barrera -> cómputo paralelo -> barrera -> ...

Cada nivel de un cómputo estructurado en árbol (por ejemplo, una reducción
binaria) es una fase natural: todos los procesadores activos en ese nivel
calculan de forma independiente, y la barrera asegura que el siguiente nivel
sólo empiece con todos los resultados del nivel anterior ya disponibles.

## Pseudocódigo

```
while m > 1
    for i = 0 ... m/2-1 pardo
        B[i] = A[2*i] + A[2*i+1]
    BARRIER
    A = B
    m = m/2
```

## C++

No aplica: modelo formal sin código de ejemplo propio en el material.

## Complejidad

Para $n$ elementos en la reducción binaria de arriba existen $\log n$
niveles y, por tanto, $\Theta(\log n)$ fases de sincronización. Si una barrera
cuesta $T_{barrier}$ y hay $S$ fases:

$$T_{sync} = S \cdot T_{barrier}, \qquad T_p = T_{comp} + T_{sync}$$

**Reasoning:** a diferencia de PRAM clásico, que ignora el costo de
sincronizar, Phase PRAM lo hace explícito multiplicando el número de fases
por el costo fijo de una barrera — es el primer modelo de esta familia que
mete un término de costo que PRAM no tenía.

## Ejemplo

La reducción binaria de arriba: para $n = 8$ hay $\log_2(8) = 3$ niveles/fases.
En la fase 1, 4 procesadores calculan 4 sumas parciales; en la fase 2, 2
procesadores calculan 2 sumas; en la fase 3, 1 procesador calcula la suma
final. Cada fase cierra con una barrera antes de que el siguiente nivel
pueda empezar a leer los resultados del anterior.

## Casos especiales

Si $T_{barrier} = 0$ (barrera sin costo), Phase PRAM colapsa exactamente en
PRAM clásico: sincronización síncrona por paso pero gratuita. Si en cambio
cada fase tuviera una sola operación (una fase por cada paso PRAM), Phase
PRAM también se reduce a PRAM síncrono estándar, sólo que con el costo de
barrera hecho explícito en cada paso.
