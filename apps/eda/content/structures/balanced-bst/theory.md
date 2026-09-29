---
kind: theory
title: Árbol binario de búsqueda balanceado
visualization:
  type: tree
  steps:
    - note: >-
        El árbol de 5 nodos que reutilizan Search, Predecessor y Successor
        más abajo: raíz 20, hijo izquierdo 10, hijo derecho 30, y 30 con
        hijo izquierdo 27 y derecho 40.
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        El invariante de BST en la raíz: todo lo que cuelga a la izquierda
        de 20 (aquí, sólo 10) es menor que 20, y todo lo que cuelga a la
        derecha (27, 30, 40) es mayor.
      highlight: ["n20"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        El mismo invariante se cumple recursivamente en cada nodo interno:
        dentro del subárbol derecho, 27 (hijo izquierdo de 30) es menor que
        30 y 40 (hijo derecho) es mayor.
      highlight: ["n30"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
    - note: >-
        El invariante de balance no exige un árbol perfecto: la altura del
        subárbol izquierdo de 20 (sólo la hoja 10, altura 1) y la del
        derecho (30 con hojas 27 y 40, altura 2) difieren en 1 — dentro de
        la constante que el invariante permite —, así que el árbol sigue
        balanceado.
      highlight: ["n10", "n27", "n40"]
      nodes:
        - { id: n20, value: 20, parent: null }
        - { id: n10, value: 10, parent: n20 }
        - { id: n30, value: 30, parent: n20 }
        - { id: n27, value: 27, parent: n30 }
        - { id: n40, value: 40, parent: n30 }
---

> **Concepto de apoyo, no material del curso.** El profesor nunca explica un
> esquema de balanceo (AVL, rojo-negro, treap...) en ninguna diapositiva
> (`sourceSlides` está vacío en el knowledge map) — lo usa como pieza ya
> conocida: el range tree 1D son "árboles binarios de búsqueda balanceados
> que almacenen los puntos en las hojas", el barrido de segmentos mantiene
> el orden de los cruces sobre uno, y toda la semana 5 de optimalidad
> dinámica razona sobre el modelo de costo de un BST. Esta página es el
> andamio mínimo para esos tres usos, no un tutorial de AVL, rojo-negro ni
> una comparativa de variantes. Todo lo que sigue es derivación estándar, no
> una cita del profesor.

## ¿Qué problema resuelve?

Un árbol binario de búsqueda (BST) sin más garantías puede degenerar en una
lista enlazada — por ejemplo, insertando llaves ya ordenadas — y entonces
`Search`, `Insert`, `Predecessor` y `Successor` cuestan $O(n)$ en vez de
$O(\lg n)$. Un BST **balanceado** añade un invariante de forma (la altura de
los dos subárboles de cualquier nodo difiere en a lo más una constante) y
restaura ese invariante tras cada `Insert` mediante **rotaciones**, para
garantizar que la altura del árbol se mantenga siempre $O(\lg n)$.

Esto es exactamente lo que el curso necesita en tres sitios que **no**
enseñan cómo balancear, sólo lo usan como pieza dada:

- **Range tree 1D**: se construye "usando árboles binarios de búsqueda
  balanceados que almacenen a los puntos en las hojas" — un uso distinto
  al de un BST de libro, donde las llaves viven en las hojas y los nodos
  internos son sólo delimitadores para guiar la búsqueda.
- **Barrido de segmentos (sweep line)**: mantiene el orden de los puntos de
  cruce con la recta de barrido en una estructura de tipo BBST, y usa
  `Successor` para resolver la consulta online de localización de puntos.
- **Modelo computacional BST (semana 5)**: la semana entera de optimalidad
  dinámica razona sobre el costo de moverse por punteros y de **rotar** un
  nodo con su padre, ambos $O(1)$; esta página define la rotación para que
  ese análisis, que no se repite aquí, tenga sobre qué apoyarse.

## Intuición

Un BST balanceado es un BST común (para cualquier nodo, todo lo del
subárbol izquierdo es menor y todo lo del subárbol derecho es mayor) al que
se le exige, además, no crecer en forma de lista. Cada vez que una
inserción rompe esa forma, una **rotación** reordena localmente tres nodos
sin romper el orden de búsqueda, corrigiendo el desbalance en $O(1)$.

## Estructura interna

Cada nodo guarda:

- una llave (el valor por el que se ordena),
- dos hijos (o ninguno, si es hoja),
- información de balance suficiente para decidir cuándo rotar (por ejemplo,
  la altura del subárbol, o el factor de balance altura-izq − altura-der).

Invariante de forma: para todo nodo, la altura de su subárbol izquierdo y
la de su subárbol derecho difieren en a lo más una constante fija. Está
formulado así — una cota sobre la *diferencia* de alturas, no sobre la
forma exacta — porque es la condición más débil que ya implica altura total
$O(\lg n)$: no hace falta un árbol perfecto, sólo evitar que un lado crezca
sin control mientras el otro se queda plano.

**Rotación** (la operación que el modelo computacional BST de la semana 5
usa sin definirla en detalle): reestructura tres nodos en $O(1)$ preservando
el orden in-order. Con `p` como padre de `n`, e hijos `A`, `B` (de `n`) y
`C` (de `p`):

```
Rotación derecha (p, n, C) <-> (n, A, p con hijos B, C)

        p                     n
       / \                   / \
      n   C     -- rot. der ->  A   p
     / \             <- rot. izq   / \
    A   B                         B   C
```

`Right Rotation` sube a `n` como raíz del subárbol (deja a `p` como hijo
derecho de `n`, y a `B` — antes hijo derecho de `n` — como hijo izquierdo
de `p`); `Left Rotation` es la inversa. En ambos casos el recorrido in-order
`A, n, B, p, C` no cambia, así que el orden de búsqueda queda intacto.

Para 5 nodos, el ejemplo *(derivado; ilustra el invariante, no una cita del
profesor)* que reutilizan las operaciones de abajo:

```
      30                    20
     /  \                  /  \
   20   40      -- Insert(10) rompe el balance en 30, se corrige con
   /                       10   30
  10                              \
                                   40
```

## Operaciones

- [Search](/structures/balanced-bst/operations/search) — desciende un único
  camino comparando la llave buscada contra cada nodo.
- [Predecessor](/structures/balanced-bst/operations/predecessor) — halla la
  llave inmediatamente menor a una dada. Es la operación que el range tree
  usa para acotar un rango por la izquierda.
- [Successor](/structures/balanced-bst/operations/successor) — simétrica a
  Predecessor. Es la que usa el barrido de segmentos para resolver
  `Query(t, Successor(y))`.
- [Insert](/structures/balanced-bst/operations/insert) — inserta como en un
  BST común y luego restaura el invariante de balance con rotaciones. Aquí
  se define la rotación que reutiliza el modelo computacional BST.

## Análisis de complejidad

No hay un estilo del profesor que seguir aquí (no hay diapositivas). El
razonamiento es el estándar de la literatura, por invariante de altura:

- El invariante de balance (diferencia de alturas acotada por una
  constante en todo nodo) implica, por inducción sobre el tamaño del
  subárbol, que la altura de un árbol con n nodos es $O(\lg n)$ — nunca $O(n)$
  como en un BST sin balancear.
- **Search / Predecessor / Successor**: cada una sigue un único camino
  desde la raíz (o hacia el padre), de longitud a lo más la altura del
  árbol → $O(\lg n)$.
- **Insert**: baja $O(\lg n)$ niveles para ubicar la nueva hoja y sube por el
  mismo camino aplicando rotaciones de $O(1)$ cada una para restaurar el
  invariante → $O(\lg n)$ también.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`. Como en las estructuras que no vienen
del profesor, se omite `source` en cada entrada porque no hay diapositiva
que citar — el `reasoning` deja explícito que es derivación estándar.

## Ejemplos

Ver [Ejemplos](/structures/balanced-bst/examples).

## Comparación con estructuras relacionadas

| | Altura | Search / Predecessor / Successor | Insert |
| --- | --- | --- | --- |
| BST sin balancear | $O(n)$ en el peor caso (llaves ordenadas) | $O(n)$ en el peor caso | $O(n)$ en el peor caso |
| BST balanceado | $O(\lg n)$ siempre | $O(\lg n)$ | $O(\lg n)$ (incluye rotaciones) |

El costo de mantener el invariante son las rotaciones en cada `Insert`;
a cambio, `Search`, `Predecessor` y `Successor` nunca degradan a $O(n)$, que
es justo la garantía que necesitan el range tree (para no perder el $O(\lg n)$
prometido en sus consultas) y el barrido de segmentos (para mantener el
orden de los cruces sin degradar la consulta online).

## Prueba de dominio

Ver [Prueba de dominio](/structures/balanced-bst/mastery-check).
