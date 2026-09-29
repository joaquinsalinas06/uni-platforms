---
kind: theory
title: Fractional cascading generalizado
visualization:
  type: persistent
  mode: fat-node
  steps:
    - note: >-
        El grafo de cascading generalizado para la consulta 3D: D4 sobre D3
        sobre D2 sobre D1, encadenados por aristas de descenso, más el
        enlace de D4 hacia su propia estructura invertida gemela (el quinto
        vecino que da grado acotado — ver Bounded-degree-check). Nada se ha
        recorrido todavía.
      nodes:
        - id: D4
          value: D4
        - id: D4inv
          value: "D4 (gemela invertida)"
        - id: D3
          value: D3
        - id: D2
          value: D2
        - id: D1
          value: D1
      links:
        - { from: D4, to: D3, kind: tree, label: baja }
        - { from: D3, to: D2, kind: tree, label: baja }
        - { from: D2, to: D1, kind: tree, label: baja }
        - { from: D4, to: D4inv, kind: pointer, label: gemela }
    - note: >-
        Se entra por D4 con la única búsqueda binaria real de toda la
        consulta: O(lg n). El resto del grafo, incluida la gemela
        invertida, todavía no se toca.
      highlight: [D4]
      nodes:
        - id: D4
          value: D4
          state: active
        - id: D4inv
          value: "D4 (gemela invertida)"
        - id: D3
          value: D3
        - id: D2
          value: D2
        - id: D1
          value: D1
      links:
        - { from: D4, to: D3, kind: tree, label: baja }
        - { from: D3, to: D2, kind: tree, label: baja }
        - { from: D2, to: D1, kind: tree, label: baja }
        - { from: D4, to: D4inv, kind: pointer, label: gemela }
      caption: "búsqueda real en D4 — O(lg n)"
    - note: >-
        Primer paso de descenso, D4 → D3: se baja el puente que la búsqueda
        en D4 ya dejó apuntando, en vez de volver a buscar — O(1), el mismo
        mecanismo de fractional cascading sobre esta arista concreta.
      highlight: [D3]
      nodes:
        - id: D4
          value: D4
        - id: D4inv
          value: "D4 (gemela invertida)"
        - id: D3
          value: D3
          state: active
        - id: D2
          value: D2
        - id: D1
          value: D1
      links:
        - { from: D4, to: D3, kind: tree, label: baja }
        - { from: D3, to: D2, kind: tree, label: baja }
        - { from: D2, to: D1, kind: tree, label: baja }
        - { from: D4, to: D4inv, kind: pointer, label: gemela }
      caption: "D4 → D3 — O(1)"
    - note: >-
        Segundo paso, D3 → D2: otra vez O(1) por el mismo mecanismo — el
        grado acotado de cada vértice es lo que garantiza que este paso
        cueste lo mismo sin importar cuántos niveles lleve la cadena.
      highlight: [D2]
      nodes:
        - id: D4
          value: D4
        - id: D4inv
          value: "D4 (gemela invertida)"
        - id: D3
          value: D3
        - id: D2
          value: D2
          state: active
        - id: D1
          value: D1
      links:
        - { from: D4, to: D3, kind: tree, label: baja }
        - { from: D3, to: D2, kind: tree, label: baja }
        - { from: D2, to: D1, kind: tree, label: baja }
        - { from: D4, to: D4inv, kind: pointer, label: gemela }
      caption: "D3 → D2 — O(1)"
    - note: >-
        Último paso, D2 → D1: se llega al nivel base con un tercer O(1). En
        total, una búsqueda real más tres pasos de descenso: O(lg n) +
        O(1)·O(lg n) + O(k) = O(lg n + k) — el resultado completo de
        Composition.
      highlight: [D1]
      nodes:
        - id: D4
          value: D4
        - id: D4inv
          value: "D4 (gemela invertida)"
        - id: D3
          value: D3
        - id: D2
          value: D2
        - id: D1
          value: D1
          state: answer
      links:
        - { from: D4, to: D3, kind: tree, label: baja }
        - { from: D3, to: D2, kind: tree, label: baja }
        - { from: D2, to: D1, kind: tree, label: baja }
        - { from: D4, to: D4inv, kind: pointer, label: gemela }
      caption: "O(lg n) + O(1)·O(lg n) + O(k) = O(lg n + k)"
---

## ¿Qué problema resuelve?

Con $D_1$, $D_2$, $D_3$ y $D_4$ correctamente anidadas, cada nivel de la composición
final para la consulta 3D **todavía re-busca desde cero** en el nivel de
abajo: "Ya vimos cómo evitar exactamente eso con fractional cascading — solo
que ahora las 'listas' no son simples arreglos, sino estructuras enteras con
más de un vecino" (#49). El problema concreto: en
[fractional cascading](/structures/fractional-cascading) las listas forman
una **cadena** ($L_1 \to L_2 \to \dots \to L_k$), cada una con un único vecino hacia
donde bajar el puente. $D_4$ sobre $D_3$ (ver [/structures/d4-bound-z](/structures/d4-bound-z))
ya no es una cadena: cada nodo tiene padre, hijos, y enlaces hacia su
estructura invertida gemela. "Necesitamos generalizar fractional cascading
de 'una cadena de listas' a 'un grafo de estructuras'" (#50).

## Intuición

La pregunta que responde este tema es siempre la misma: **dado un grafo de
listas, ¿puedo aplicar fractional cascading aquí?** No hace falta que el
grafo sea una cadena — hace falta que cada vértice tenga un número
**constante** de vecinos. Si eso se cumple, la misma idea de
[fractional cascading](/structures/fractional-cascading) (bajar un puente
en vez de rebuscar) funciona igual sobre cualquier arista del grafo: una
única búsqueda real al entrar, y $O(1)$ por cada paso que se recorre, sin
importar qué camino del grafo se siga.

## Estructura interna

La condición completa, tal como la da el profesor (#51):

> Fractional cascading funciona en cualquier grafo donde cada vértice guarda
> un conjunto de elementos, las aristas están etiquetadas con boletos hacia
> elementos vecinos, y cada vértice tiene **grado acotado** (un número
> constante de vecinos). Bajo esas condiciones, la navegación completa
> cuesta $O(k + \lg n)$: una búsqueda real al entrar, y $O(1)$ por cada paso.

Tres piezas, en el orden en que hay que verificarlas sobre un grafo dado:

- **La condición** ([Applicability](/structures/generalized-fractional-cascading/operations/applicability)):
  ¿el grafo guarda conjuntos en sus vértices, tiene boletos en sus aristas, y
  grado acotado? Si sí, aplica. Un contraejemplo (grado no acotado) vale
  tanto como un ejemplo que sí cumple.
- **La verificación sobre esta construcción**
  ([Bounded-degree-check](/structures/generalized-fractional-cascading/operations/bounded-degree-check)):
  cada nodo del árbol en [$D_4$/$D_3$](/structures/d4-bound-z) tiene grado acotado
  por **5** — su padre, sus dos hijos, y dos enlaces auxiliares hacia la
  estructura invertida gemela del mismo nodo (#52). Eso basta para aplicar
  la misma idea.
- **El resultado** ([Composition](/structures/generalized-fractional-cascading/operations/composition)):
  con el grafo de cascading generalizado conectando $D_4$ sobre $D_3$ sobre $D_2$
  sobre $D_1$, una sola búsqueda binaria real al entrar por $x$ alcanza para
  todos los niveles — cada paso hacia abajo, incluyendo los saltos entre
  estructura normal e invertida, es $O(1)$ (#53).

Este tema no reexplica [fractional cascading](/structures/fractional-cascading)
(el mecanismo de puentes) ni [$D_4$](/structures/d4-bound-z) (la construcción
concreta que se verifica): es el resultado que conecta a ambos.

## Operaciones

- [Applicability](/structures/generalized-fractional-cascading/operations/applicability) —
  la condición sobre el grafo (grado acotado). No es un algoritmo.
- [Bounded-degree-check](/structures/generalized-fractional-cascading/operations/bounded-degree-check) —
  verificar que $D_4$/$D_3$ cumple la condición, con grado $\le 5$.
- [Composition](/structures/generalized-fractional-cascading/operations/composition) —
  la navegación completa $D_1$-$D_2$-$D_3$-$D_4$ con una sola búsqueda real y $O(1)$ por
  paso.

## Análisis de complejidad

Estilo del profesor: **conteo directo**, igual que en
[fractional cascading](/structures/fractional-cascading#análisis-de-complejidad).
La descomposición textual (#54):

```
O(lg n)              + O(1) · O(lg n) + O(k) = O(lg n + k)
└ una búsqueda real    └ pasos de descenso    └ reporte
```

Nada de recurrencia ni de potencial: se cuentan los pasos uno por uno. El
espacio (#57) usa el mismo argumento de **multiplicidad** que el range tree
2D de la semana 4: "cada punto aparece, en promedio, $O(\lg^3 n)$ veces entre
las distintas copias de $D_1$, $D_2$ y $D_3$ anidadas dentro de $D_4$" — de ahí
$O(n \lg^3 n)$, más que los $O(n)$ de 2D, pero polinomial en $\lg n$, no en $n$.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`. La tabla comparativa del propio
profesor (#59-63) sitúa este resultado frente a las alternativas:

| Técnica | Consulta | Espacio |
| --- | --- | --- |
| BSTs anidados (sin cascading) | $O(\lg^3 n + k)$ | $O(n)$ |
| Cascading solo en la base 2D | $O(\lg^2 n + k)$ | $O(n \lg n)$ |
| Cascading completo ($D_1$–$D_4$) | $O(\lg n + k)$ | $O(n \lg^3 n)$ |

"Cada nivel adicional de cascading bien aplicado quita un factor de $\lg n$
del tiempo de consulta, al costo de un factor de $\lg n$ extra en espacio"
(#63) — el trade-off espacio/tiempo típico de estructuras geométricas
avanzadas (#58).

## Ejemplos

Ver [examples.md](/structures/generalized-fractional-cascading/examples).

## Comparación con estructuras relacionadas

Este resultado es el caso $d = 3$ de una familia más general (#64-66):

| Técnica | Dimensión | Consulta | Espacio |
| --- | --- | --- | --- |
| Chazelle & Guibas (1986), cascading completo | $d \ge 3$ | $O(\lg^{d-2} n + k)$ | $O(n \lg^{d-1} n)$ |
| Willard (1985); Gabow, Bentley & Tarjan (1984), layered range tree, cascading solo en el nivel más interno | $d \ge 3$ | $O(\lg^{d-1} n + k)$ | $O(n \lg^{d-1} n)$ |

"Para $d = 3$: $\lg^{d-2} n = \lg n$ (lo que acabamos de construir) contra
$\lg^{d-1} n = \lg^2 n$ (la versión más simple)" (#66) — el cascading completo
sobre el grafo generalizado es, literalmente, lo que separa a este curso de
la versión que no lo usa.

Como cierre: en cinco semanas, el curso fue de un problema de búsqueda
simple sobre un arreglo a una técnica que funciona sobre **cualquier grafo
de listas con grado acotado**, y ese resultado generaliza, sin cambiar de
argumento, a rangos en cualquier número de dimensiones. La pregunta con la
que arrancó fractional cascading — "¿cómo evito rebuscar en cada nivel?" —
termina siendo, en su forma más general, una pregunta sobre el grado de un
grafo, no sobre la forma particular de las listas.

## Prueba de dominio

Ver [mastery-check.md](/structures/generalized-fractional-cascading/mastery-check).
