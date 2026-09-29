---
kind: theory
title: "D₂ — acotar x"
visualization:
  type: range-tree
  steps:
    - note: >-
        Un BST estándar sobre x — el mismo [/structures/range-tree](/structures/range-tree)
        de siempre, sin nada nuevo todavía: raíz x=4, hijo izquierdo x=3 (con
        su propio hijo izquierdo x=1) e hijo derecho x=6.
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4 }
        - { id: n6, value: 6, parent: r4 }
        - { id: n1, value: 1, parent: n3 }
    - note: >-
        Lo único que $D_2$ le agrega: cada nodo, además de su rol en el BST,
        guarda una copia completa de la estructura de dominancia
        [/structures/dominance-2d](/structures/dominance-2d) ($D_1$) sobre
        los puntos de su propio subárbol — aquí, en la raíz, $D_1$ sobre los
        4 puntos. $D_2$ es literalmente $D_1$ colgado de un árbol.
      highlight: [r4]
      nodes:
        - { id: r4, value: 4, parent: null, state: active }
        - { id: n3, value: 3, parent: r4 }
        - { id: n6, value: 6, parent: r4 }
        - { id: n1, value: 1, parent: n3 }
        - { id: d1-r4, value: "D₁({1,3,4,6})", parent: null, panel: sat }
      panels:
        - { id: sat, label: "D₁ satélite de la raíz", anchor: r4 }
    - note: >-
        Acotar x se resuelve exactamente como en el range tree: descomposición
        canónica sobre el BST. Aquí x=3 es un nodo canónico de un rango que
        acote x — se marca como delimitador de esa descomposición, igual que
        en range tree (no se reexplica esa parte).
      highlight: [n3]
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4, state: marked }
        - { id: n6, value: 6, parent: r4 }
        - { id: n1, value: 1, parent: n3 }
        - { id: d1-r4, value: "D₁({1,3,4,6})", parent: null, panel: sat }
      panels:
        - { id: sat, label: "D₁ satélite de la raíz", anchor: r4 }
    - note: >-
        Acotar (y, z) se resuelve delegando en $D_1$, que ya sabe hacerlo:
        sobre ese nodo canónico se dispara **una** consulta de dominancia
        sobre su propia $D_1$ satélite — no una nueva descomposición canónica
        en y, sólo delegación directa.
      highlight: [n3]
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4, state: marked }
        - { id: n6, value: 6, parent: r4 }
        - { id: n1, value: 1, parent: n3 }
        - { id: d1-n3, value: "D₁({1,3}) ⊳ dominance-query", parent: null, panel: sat2, state: active }
      panels:
        - { id: sat2, label: "D₁ satélite de x=3", anchor: n3 }
    - note: >-
        Composición final: descomposición canónica en x (delimitador ámbar)
        × delegación en $D_1$ (consulta activa) = $D_2$. Ningún dato se
        recalcula: x=3 reutiliza la $D_1$ ya construida sobre su subárbol.
      highlight: [n3]
      caption: "D₂ = BST sobre x + D₁ por nodo"
      nodes:
        - { id: r4, value: 4, parent: null }
        - { id: n3, value: 3, parent: r4, state: marked }
        - { id: n6, value: 6, parent: r4 }
        - { id: n1, value: 1, parent: n3 }
        - { id: d1-n3, value: "D₁({1,3}) ⊳ dominance-query", parent: null, panel: sat2, state: answer }
      panels:
        - { id: sat2, label: "D₁ satélite de x=3", anchor: n3 }
---

## ¿Qué problema resuelve?

[/structures/dominance-2d](/structures/dominance-2d) ($D_1$) responde consultas de
dominancia: $(-\infty, b_2] \times (-\infty, b_3)$. $D_2$ añade la primera acotación real de la
cadena que este curso construye hacia el rango 3D completo — un intervalo
cerrado en x — para responder consultas de la forma:

```
[x1, x2] × (−∞, b2] × (−∞, b3)
```

rango cerrado en x, dominancia en (y, z).

## Intuición

$D_2$ es literalmente $D_1$ colgado de un árbol. Un
[/structures/range-tree](/structures/range-tree) (BST estándar) organiza los
puntos por x; cada nodo, además de su rol en el BST, guarda una copia de la
estructura de dominancia $D_1$ para los puntos de su subárbol. Acotar x se
resuelve exactamente como en el range tree: descomposición canónica sobre el
BST. Acotar (y, z) se resuelve delegando en $D_1$, que ya sabe hacerlo.

> **Nota de apoyo** (no está en las diapositivas): esto es la misma
> composición "árbol de rangos con estructura satélite por nodo" que ya
> aparece en range tree 2D — aquí la estructura satélite no es otro BST, es
> $D_1$.

## Estructura interna

Un BST estándar sobre x. Cada nodo guarda, para los puntos de su subárbol,
una copia de la estructura de dominancia ($D_1$) que acabamos de construir.

El invariante es el mismo del BST sobre x (no se reexplica aquí —
[/structures/range-tree](/structures/range-tree)); lo único nuevo es qué
guarda cada nodo como estructura satélite: no un valor, sino una instancia
completa de $D_1$ sobre los puntos de ese subárbol.

## Operaciones

- [Construcción](/structures/d2-bound-x/operations/build) — BST sobre x, $D_1$
  satélite por nodo.
- [Consulta](/structures/d2-bound-x/operations/query) — descomposición
  canónica en x, una consulta de dominancia por nodo canónico.

## Análisis de complejidad

Estilo del profesor: **composición estructural** — descomposición canónica ×
costo de la subestructura, sin plantear recurrencia ni amortizar (#34).

El profesor no da una cota numérica propia para $D_2$ en esta sección: "Nada
nuevo todavía — lo interesante empieza al agregar la segunda dimensión
acotada." (#34). La cota se compone después, cuando $D_2$ se combina con
[/structures/d3-separation-node](/structures/d3-separation-node) y con
fractional cascading generalizado — no le corresponde a esta sección
adelantarla.

> **¡Piénsalo!** advertencia del profesor (#35-36): si se acotara y con la
> misma técnica —descomposición canónica sobre un árbol de y dentro de cada
> nodo canónico de x— el costo sería $O(\lg n)$ nodos canónicos en x, cada uno
> con $O(\lg n)$ nodos canónicos en y: **$O(\lg^2 n)$** consultas. Se perdería el
> $O(\lg n)$ buscado. Esto es exactamente lo que motiva
> [/structures/d3-separation-node](/structures/d3-separation-node): evitar la
> descomposición canónica en y por completo.

## Tabla de complejidad

Sin entradas propias: $D_2$ no tiene una fila de complejidad en meta.yaml
(`complexity: {}`) porque el profesor no la da en esta sección (ver arriba).

## Ejemplos

Ver [examples.md](/structures/d2-bound-x/examples).

## Comparación con estructuras relacionadas

| Estructura | Qué acota | Delega en |
| --- | --- | --- |
| [dominance-2d](/structures/dominance-2d) ($D_1$) | nada (dominancia pura en y, z) | — |
| **d2-bound-x ($D_2$)** | x (intervalo cerrado) | $D_1$ por nodo |
| [d3-separation-node](/structures/d3-separation-node) ($D_3$) | x e y (ambos intervalos) | $D_2$ / $D_2'$ por nodo de separación |

## Prueba de dominio

Ver [mastery-check.md](/structures/d2-bound-x/mastery-check).
