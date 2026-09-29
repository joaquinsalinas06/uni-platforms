---
kind: algorithm
title: "LPRAM (Local-memory PRAM)"
order: 3
---

## Qué hace

LPRAM relaja el supuesto de acceso uniforme a memoria de PRAM clásico:
reconoce que en un computador real cada procesador tiene una memoria local
propia, y que acceder a ella es más rápido que acceder a la memoria global
compartida ($T_{local} < T_{global}$).

## Intuición

En PRAM clásico da lo mismo si un dato está "cerca" o "lejos": todo acceso a
memoria cuesta lo mismo. En la práctica no es así — es más barato reutilizar
un dato que ya tienes en tu propia memoria que ir a buscarlo a la memoria
compartida cada vez. LPRAM hace ese costo explícito, lo que empieza a
premiar los algoritmos que reutilizan datos locales sobre los que acceden
constantemente a memoria global.

## Algoritmo

No hay un algoritmo único: LPRAM es un modelo de costo que se superpone a
cualquier algoritmo PRAM, distinguiendo cada acceso a memoria según si es
local o global.

## Pseudocódigo

```
// mismo pseudocódigo PRAM de siempre, pero cada acceso a memoria
// se clasifica como local (memoria propia del procesador) o
// global (memoria compartida), con costos distintos
```

## C++

No aplica: modelo de costo, sin código de ejemplo propio en el material.

## Complejidad

El material no da una fórmula cerrada para LPRAM (a diferencia de BPRAM o
BSP); su aporte es la distinción cualitativa $T_{local} < T_{global}$, que un
algoritmo concreto debe usar para contar por separado sus accesos locales y
globales al estimar el tiempo total.

## Ejemplo

> **Nota de apoyo** (no está en el material): la idea de LPRAM es la que
> más tarde justifica, en sistemas reales, las jerarquías de caché, las
> arquitecturas NUMA, la memoria local de GPUs y el particionamiento de
> datos en sistemas distribuidos — todos buscan maximizar el trabajo hecho
> sobre memoria local frente a memoria remota.

## Casos especiales

Si $T_{local} = T_{global}$, LPRAM colapsa exactamente en PRAM clásico: el
acceso a memoria vuelve a ser uniforme y la distinción local/global deja de
importar.
