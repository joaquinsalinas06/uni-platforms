---
kind: algorithm
title: "APRAM (Asynchronous PRAM)"
order: 1
visualization:
  type: timeline
  steps:
    - note: "En PRAM clásico los tres procesos avanzarían al mismo ritmo. En APRAM cada uno ejecuta sus operaciones a su propia velocidad — no hay avance sincronizado paso a paso."
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
      events:
        - { lane: p0, tStart: 0, tEnd: 3, label: "op1" }
        - { lane: p0, tStart: 3, tEnd: 6, label: "op2" }
        - { lane: p0, tStart: 6, tEnd: 9, label: "op3" }
        - { lane: p1, tStart: 0, tEnd: 2, label: "op1" }
        - { lane: p1, tStart: 2, tEnd: 7, label: "op2" }
        - { lane: p1, tStart: 7, tEnd: 9, label: "op3" }
        - { lane: p2, tStart: 0, tEnd: 4, label: "op1" }
        - { lane: p2, tStart: 4, tEnd: 6, label: "op2" }
        - { lane: p2, tStart: 6, tEnd: 10, label: "op3" }
    - note: "Ejemplo de suma en dos procesos: P0 suma la primera mitad en s0, P1 la segunda mitad en s1 y avisa con flag1. P0 debe esperar explícitamente ese flag antes de calcular $S = s_0 + s_1$ — la sincronización ya no es automática, hay que programarla."
      highlight: ["wait"]
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
      events:
        - { lane: p0, tStart: 0, tEnd: 4, label: "s0 = sum" }
        - { lane: p0, tStart: 4, tEnd: 6, label: "wait(flag1)", state: marked }
        - { lane: p0, tStart: 6, tEnd: 7, label: "S=s0+s1" }
        - { lane: p1, tStart: 0, tEnd: 5, label: "s1 = sum" }
        - { lane: p1, tStart: 5, tEnd: 5, label: "flag1=true" }
      messages:
        - { fromLane: p1, toLane: p0, tStart: 5, tEnd: 6, label: "flag1" }
---

## Qué hace

APRAM (*Asynchronous PRAM*) relaja el supuesto de sincronización global de
PRAM clásico: en vez de que todos los procesadores avancen a pasos
sincronizados, cada uno ejecuta sus instrucciones independientemente y a su
propia velocidad.

## Intuición

En PRAM, todos los procesadores terminan su paso `i` antes de que cualquiera
empiece el paso `i+1`, como si estuvieran marcando el paso al mismo tambor.
En APRAM cada procesador tiene su propio ritmo: uno puede tardar más en una
operación que otro, y sólo se detienen a esperarse cuando hay una
dependencia real entre lo que están haciendo — la sincronización deja de ser
automática y se vuelve algo que el algoritmo debe pedir explícitamente.

## Algoritmo

No hay un único "algoritmo APRAM": es un modelo de ejecución. La regla es
que los procesadores ejecutan instrucciones de forma independiente y sólo
sincronizan cuando existe una dependencia de datos entre operaciones de
distintos procesadores, mediante primitivas explícitas (por ejemplo, un
`wait` sobre una bandera que otro procesador activa).

## Pseudocódigo

```
P0:
    s0 = A[0] + A[1] + ... + A[n/2-1]
    wait(flag1 == true)
    S = s0 + s1

P1:
    s1 = A[n/2] + ... + A[n-1]
    flag1 = true
```

## C++

No aplica: este subtema es un modelo de ejecución formal, no trae código de
ejemplo propio en el material.

## Complejidad

APRAM no define una fórmula de costo propia como BSP o LogP: su aporte es
cualitativo (elimina la sincronización implícita paso a paso). El costo de
un algoritmo APRAM concreto depende de cuántas sincronizaciones explícitas
necesita y de cuánto tiempo se espera en cada una — algo que Phase PRAM sí
formaliza con su costo de barreras.

## Ejemplo

El ejemplo del pseudocódigo de arriba: dos procesos suman mitades distintas
de un arreglo. `P0` no puede calcular `S` hasta que `P1` termine y active
`flag1`; mientras tanto, `P0` sigue esperando aunque en PRAM clásico ambos
habrían "terminado su paso" al mismo tiempo por definición.

## Casos especiales

Si no existiera ninguna dependencia entre los procesadores (cada uno
calcula algo totalmente independiente del resto), APRAM se comporta
exactamente igual que PRAM clásico en cuanto al resultado, salvo que no hay
garantía de en qué orden relativo terminan — sólo importa cuando alguna
sincronización explícita los fuerza a esperarse.
