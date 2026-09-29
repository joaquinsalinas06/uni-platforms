---
kind: theory
title: "Montículo de Fibonacci"
visualization:
  type: tree
  steps:
    - note: >-
        Un montículo de Fibonacci es una lista de árboles. Las raíces 3 y 8
        están en la lista circular; min(H) apunta a 3, la llave menor.
      highlight: [a]
      nodes:
        - { id: a, value: 3, parent: null, state: active }
        - { id: b, value: 8, parent: null }
        - { id: c, value: 12, parent: b }
    - note: >-
        Si bajar 12 a 2 rompe el orden con su padre 8, el nodo se corta y
        pasa a ser una raíz. No se recorre el camino intercambiando llaves.
      highlight: [b, c]
      nodes:
        - { id: a, value: 3, parent: null }
        - { id: b, value: 8, parent: null }
        - { id: c, value: 2, parent: b, state: active }
    - note: >-
        El nodo 2 queda como raíz y se vuelve el mínimo. Consolidate se
        reserva para Extract-Min, cuando se unen raíces de igual grado.
      highlight: [c]
      nodes:
        - { id: a, value: 3, parent: null }
        - { id: b, value: 8, parent: null, state: marked }
        - { id: c, value: 2, parent: null, state: active }
---

## ¿Qué problema resuelve?

El montículo de Fibonacci es una cola de prioridad que retrasa el trabajo de
reorganizar sus árboles. Así, Insert, Union y Decrease-Key son baratos ahora;
el trabajo pendiente se concentra principalmente en Extract-Min.

## Intuición

No es un solo árbol: es una **colección de árboles** cuyas raíces viven en una
lista circular. El heap mantiene un puntero al mínimo.

~~~text
      3          8          12
     /                     /
    5   7                  20

raíces: 3, 8, 12       min(H) = 3
~~~

La idea clave del profesor es que el heap es **perezoso**: no consolida al
insertar ni al unir. Sólo guarda las raíces y paga el ordenamiento cuando se
extrae el mínimo.

> **Para recordar.** Muchas raíces no son un error: son trabajo pospuesto.

## Estructura interna

Cada nodo guarda una llave, su padre, un hijo, su grado y una marca. El grado
es el número de hijos.

Se conservan tres reglas:

- En cada árbol se cumple min-heap: un padre tiene llave menor o igual que sus hijos.
- Las raíces nunca están marcadas.
- Un nodo que pierde su primer hijo se marca; si pierde otro, se corta y pasa
  a la lista de raíces. Si su padre ya estaba marcado, el corte continúa en
  cascada.

La última regla limita cuánto puede degradarse un árbol sin dejar de permitir
cortes rápidos.

## Operaciones

- [Insert](/structures/fibonacci-heap/operations/insert): agrega una raíz nueva.
- [Union](/structures/fibonacci-heap/operations/union): concatena listas de raíces.
- [Decrease-Key](/structures/fibonacci-heap/operations/decrease-key): baja una
  llave; puede disparar Cut y Cascading-Cut.
- [Extract-Min](/structures/fibonacci-heap/operations/extract-min): elimina el
  mínimo y llama a Consolidate.
- [Consolidate](/structures/fibonacci-heap/operations/consolidate): une raíces
  que tienen el mismo grado.

El código completo del editor sigue el mismo orden: Node, lista de raíces,
Link, Consolidate, Cut, Cascading-Cut y operaciones públicas.

## Análisis de complejidad

Hay dos ideas que sostienen los costos:

1. El grado máximo $D(n)$ es $O(lg n)$. La regla de marcas implica que un
   árbol de grado grande necesita muchos nodos; esa relación sigue los números
   de Fibonacci.
2. El potencial es $Phi(H)=t(H)+2m(H)$, donde $t(H)$ cuenta raíces y $m(H)$
   cuenta nodos marcados. Las raíces y las marcas guardan el crédito que paga
   trabajo futuro.

Por eso:

- Insert y Union son $O(1)$ amortizado.
- Decrease-Key es $O(1)$ amortizado aunque pueda haber cortes en cascada.
- Extract-Min es $O(lg n)$ amortizado: Consolidate reduce las raíces a lo
  sumo una por cada grado posible.

La demostración paso a paso de estas tres cotas está en
[El método del potencial](/structures/potential-method). La derivación de
$D(n)=O(lg n)$ se mantiene sólo donde se necesita en esa explicación.

## Tabla de complejidad

| Operación | Costo amortizado |
| --- | --- |
| Insert | $O(1)$ |
| Union | $O(1)$ |
| Decrease-Key | $O(1)$ |
| Extract-Min | $O(lg n)$ |

## Ejemplos

Para ver cada operación con árboles y pasos concretos:

- [Insert](/structures/fibonacci-heap/operations/insert)
- [Decrease-Key](/structures/fibonacci-heap/operations/decrease-key)
- [Cascading-Cut](/structures/fibonacci-heap/operations/cascading-cut)
- [Consolidate](/structures/fibonacci-heap/operations/consolidate)

## Comparación con estructuras relacionadas

Frente al [montículo binomial](/structures/binomial-heap), Fibonacci mejora
Insert, Union y Decrease-Key al postergar Consolidate. El precio es que
Extract-Min concentra ese trabajo diferido.

## Prueba de dominio

Ver [Prueba de dominio](/structures/fibonacci-heap/mastery-check).
