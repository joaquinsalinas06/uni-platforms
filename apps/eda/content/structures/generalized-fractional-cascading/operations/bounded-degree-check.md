---
kind: operation
title: Bounded-degree-check
order: 2
cppSteps:
  - step-2-bounded-degree-check.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  mode: fat-node
  steps:
    - note: >-
        Un vértice v cualquiera del árbol D₄/D₃, con sus 5 vecinos posibles
        enumerados como registro: padre, hijo izquierdo, hijo derecho, y dos
        enlaces auxiliares hacia la estructura invertida gemela del mismo
        nodo. Ninguno se ha contado todavía.
      nodes:
        - id: padre
          value: padre
        - id: v
          value: v
          fields:
            - { name: "vecino 1", value: "padre" }
            - { name: "vecino 2", value: "hijo izq." }
            - { name: "vecino 3", value: "hijo der." }
            - { name: "vecino 4", value: "gemela A" }
            - { name: "vecino 5", value: "gemela B" }
        - id: hijoIzq
          value: "hijo izq."
        - id: hijoDer
          value: "hijo der."
        - id: gemelaA
          value: "gemela A"
        - id: gemelaB
          value: "gemela B"
      links:
        - { from: v, to: padre, kind: pointer, label: padre }
        - { from: v, to: hijoIzq, kind: pointer, label: hijo }
        - { from: v, to: hijoDer, kind: pointer, label: hijo }
        - { from: v, to: gemelaA, kind: pointer, label: gemela }
        - { from: v, to: gemelaB, kind: pointer, label: gemela }
    - note: >-
        Se cuentan los vecinos uno por uno — no se recorre el resto del
        grafo, sólo esta lista fija de a lo más 5 candidatos por vértice.
      highlight: [v]
      nodes:
        - id: padre
          value: padre
        - id: v
          value: v
          state: active
          fields:
            - { name: "vecino 1", value: "padre" }
            - { name: "vecino 2", value: "hijo izq." }
            - { name: "vecino 3", value: "hijo der." }
            - { name: "vecino 4", value: "gemela A" }
            - { name: "vecino 5", value: "gemela B" }
        - id: hijoIzq
          value: "hijo izq."
        - id: hijoDer
          value: "hijo der."
        - id: gemelaA
          value: "gemela A"
        - id: gemelaB
          value: "gemela B"
      links:
        - { from: v, to: padre, kind: pointer, label: padre }
        - { from: v, to: hijoIzq, kind: pointer, label: hijo }
        - { from: v, to: hijoDer, kind: pointer, label: hijo }
        - { from: v, to: gemelaA, kind: pointer, label: gemela }
        - { from: v, to: gemelaB, kind: pointer, label: gemela }
    - note: >-
        |vecinos(v)| = 5 ≤ 5: la condición de grado acotado se cumple para
        este vértice — y, por construcción, para cualquier otro vértice de
        D₄/D₃, porque ningún nodo tiene más de estos 5 tipos de vecino.
      caption: "grado(v) = 5 ≤ d — condición de Applicability cumplida"
      nodes:
        - id: padre
          value: padre
        - id: v
          value: v
          state: answer
          fields:
            - { name: "vecino 1", value: "padre" }
            - { name: "vecino 2", value: "hijo izq." }
            - { name: "vecino 3", value: "hijo der." }
            - { name: "vecino 4", value: "gemela A" }
            - { name: "vecino 5", value: "gemela B" }
        - id: hijoIzq
          value: "hijo izq."
        - id: hijoDer
          value: "hijo der."
        - id: gemelaA
          value: "gemela A"
        - id: gemelaB
          value: "gemela B"
      links:
        - { from: v, to: padre, kind: pointer, label: padre }
        - { from: v, to: hijoIzq, kind: pointer, label: hijo }
        - { from: v, to: hijoDer, kind: pointer, label: hijo }
        - { from: v, to: gemelaA, kind: pointer, label: gemela }
        - { from: v, to: gemelaB, kind: pointer, label: gemela }
---

## Qué hace

Verifica que la construcción concreta [D₄ sobre D₃](/structures/d4-bound-z)
cumple la condición de [Applicability](/structures/generalized-fractional-cascading/operations/applicability):
que el grado de cada vértice del árbol esté acotado por una constante.

## Intuición

No basta con afirmar "el grafo tiene grado acotado" en abstracto: hay que
mirar la construcción real y contar los vecinos de un nodo cualquiera. Para
D₄/D₃, esos vecinos son de un solo tipo, enumerable a mano: el padre en el
árbol, sus dos hijos, y dos enlaces hacia la estructura invertida gemela del
mismo nodo. Contarlos y comprobar que suman una constante (5) es toda la
verificación.

## Algoritmo

1. Para cada vértice $v$ del árbol $D_4$/$D_3$, enumerar sus vecinos: padre (si
   existe), hijo izquierdo (si existe), hijo derecho (si existe), enlace a
   la gemela invertida — mitad A, enlace a la gemela invertida — mitad B.
2. Contar $|\text{neighbors}(v)|$.
3. Si $|\text{neighbors}(v)| \le 5$ para **todo** $v$: la construcción cumple la
   condición de grado acotado. Si algún vértice excede la cota: la
   construcción no la cumple tal como está (no ocurre en D₄/D₃, pero es el
   chequeo que hay que correr, no asumir).

## Pseudocódigo

```
Verificacion del grado acotado en esta construccion (#52):
cada nodo del arbol en D4/D3 tiene grado acotado por 5:
  su padre, sus dos hijos, y dos enlaces auxiliares hacia la
  estructura invertida gemela del mismo nodo.
Eso basta para aplicar la misma idea.
```

## C++

Ver `step-2-bounded-degree-check.cpp` y `full-implementation.cpp` en el
editor de arriba: `bounded_degree_check` recorre el grafo D₄-like, imprime
el grado de cada vértice y verifica con `assert` que ninguno excede 5.

## Complejidad temporal

$O(V)$ para verificar el grafo completo ($V$ vértices), porque cada vértice
se revisa una sola vez y contar sus vecinos es $O(1)$ — el grado de cada uno
está acotado por la propia condición que se está verificando. Conteo
directo: no hay recursión ni acumulación de trabajo entre vértices.

## Complejidad espacial

$O(1)$ adicional: sólo se necesita un contador por vértice, no una
estructura nueva.

## Ejemplo

Sobre el grafo D₄-like de 5 vértices (`full-implementation.cpp`): el nodo
raíz tiene grado 4 (dos hijos y dos enlaces a la gemela invertida, sin padre
propio en este fragmento) y cada uno de los otros 4 vértices tiene grado 1
(su único vecino es la raíz) — todos por debajo de 5.

## Casos límite

- **Un vértice sin padre (la raíz del árbol D₄/D₃)**: su grado es a lo más
  4, no 5 — sigue cumpliendo la cota, sólo que no la satura.
- **Una hoja sin hijos**: grado a lo más 3 (padre y los dos enlaces a la
  gemela invertida) — igual, dentro de la cota.
- **Contraejemplo de grado no acotado** *(derivado; no aparece en las
  diapositivas)*: si un vértice tuviera, en vez de 5 vecinos fijos, un
  número de vecinos proporcional a $n$ (por ejemplo, un nodo conectado a
  todos los demás), el chequeo fallaría — y con él, la premisa completa de
  [Applicability](/structures/generalized-fractional-cascading/operations/applicability).
  `full-implementation.cpp` construye este caso con números concretos: con
  grado acotado $d = 5$ un vértice necesita del orden de $d \cdot n/2$ puentes;
  con grado no acotado $d = 400$ (sobre las mismas listas de tamaño $n$),
  ese mismo vértice concentra 80 veces más puentes — el tamaño de la
  estructura en ese único vértice deja de ser constante frente a $n$.
