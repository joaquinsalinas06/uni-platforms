---
kind: theory
title: Modelo computacional del BST
visualization:
  type: tree
  steps:
    - note: >-
        El modelo arranca de un nodo n solo, antes de fijar qué punteros
        guarda.
      highlight: [n]
      nodes:
        - { id: n, value: n, parent: null, state: active }
    - note: >-
        n conoce a su hijo izquierdo y a su derecho — eso ya lo tenía
        cualquier BST, es el invariante de orden de siempre.
      highlight: [l, r]
      nodes:
        - { id: n, value: n, parent: null }
        - { id: l, value: hijo-izq, parent: n, side: left, state: active }
        - { id: r, value: hijo-der, parent: n, side: right, state: active }
    - note: >-
        El modelo agrega una tercera flecha, de n hacia su padre p — la
        que un BST simple no necesita y este modelo sí exige.
      highlight: [p]
      links:
        - { from: n, to: p, kind: pointer, label: padre }
      nodes:
        - { id: p, value: p, parent: null, state: active }
        - { id: n, value: n, parent: p }
        - { id: l, value: hijo-izq, parent: n, side: left }
        - { id: r, value: hijo-der, parent: n, side: right }
    - note: >-
        Sin ese puntero directo, encontrar a p desde n exigiría bajar de
        nuevo desde la raíz g: g→p→n, dos pointer-moves ya gastados sólo
        para llegar a n — y habría que repetir el camino para volver a
        subir cada vez que una rotación necesite el padre de un nodo
        profundo.
      highlight: [g, p, n]
      nodes:
        - { id: g, value: raíz, parent: null }
        - { id: p, value: p, parent: g }
        - { id: n, value: n, parent: p }
        - { id: l, value: hijo-izq, parent: n, side: left }
        - { id: r, value: hijo-der, parent: n, side: right }
    - note: >-
        Con el puntero directo, subir de n a p es un único pointer-move,
        O(1), sin pasar por g — la ventaja concreta de la tercera flecha
        que fija esta sección, y condición necesaria para que rotate sea
        O(1).
      highlight: [n, p]
      links:
        - { from: n, to: p, kind: pointer, label: padre }
      nodes:
        - { id: g, value: raíz, parent: null }
        - { id: p, value: p, parent: g, state: active }
        - { id: n, value: n, parent: p, state: active }
        - { id: l, value: hijo-izq, parent: n, side: left }
        - { id: r, value: hijo-der, parent: n, side: right }
---

## ¿Qué problema resuelve?

Hasta este punto el curso sabe que un [BST balanceado](/structures/balanced-bst)
resuelve Búsqueda en $O(\log n)$ en el peor caso, y ahí se detenía el análisis. El
profesor abre la semana con dos preguntas que ese resultado no contesta:
"¿existe un BST tan bueno como todos los demás?" y "¿es $O(\log n)$ el mejor
tiempo posible para un BST?" — y responde de entrada: "No sabemos, sigue
siendo un problema abierto." Para poder siquiera formular esas preguntas con
precisión hace falta fijar, antes que nada, **qué cuenta como una operación y
cuánto cuesta cada una**. Eso es lo que este modelo define: "Para analizar un
poco mejor esto definiremos el modelo computacional BST."

Sin este modelo, [`search-sequence-properties`](/structures/search-sequence-properties),
[`dynamic-optimality`](/structures/dynamic-optimality) y el
[Splay Tree](/structures/splay-tree) no tienen sobre qué razonar: las tres
propiedades amortizadas, la pregunta de optimalidad dinámica y el análisis de
Splay citan directamente las reglas de costo que se fijan aquí.

## Intuición

Es la misma idea de la **máquina de punteros** — un mundo donde sólo se puede
navegar celda por celda siguiendo punteros, nunca "saltar" a una posición
arbitraria — pero restringida a que esa estructura de punteros forme
específicamente un BST. Cada nodo conoce a su padre y a sus dos hijos, y esas
son las únicas rutas de movimiento; rotar es el único mecanismo permitido para
reorganizar esos punteros sin romper el orden.

> **Nota de apoyo** (no está en las diapositivas): la máquina de punteros
> (pointer machine) es un modelo de cómputo donde la memoria es un grafo de
> celdas enlazadas por punteros y el único acceso permitido es seguir un
> puntero desde una celda ya alcanzada — a diferencia de un arreglo, no hay
> acceso directo por índice. El profesor la nombra (#14) sin definirla.

## Estructura interna

"Es un modelo computacional basado en la máquina de punteros pero con la
restricción estructural de ser un BST." Concretamente: "Todos los datos son
almacenados en un BST en el cual cada nodo tiene un puntero hacia su padre,
hijo izquierdo e hijo derecho."

El invariante no es nuevo — es el invariante de orden de un
[BST balanceado](/structures/balanced-bst) — lo que el modelo agrega es la
tercera flecha de puntero (**al padre**, no sólo a los hijos). Esa flecha
extra es lo que permite postular movimiento en ambas direcciones (bajar a un
hijo, subir al padre) como la misma operación de costo unitario, y es
condición necesaria para que rotar sea $O(1)$: sin puntero al padre, encontrarlo
para rotar costaría recorrer el árbol de nuevo.

## Operaciones

- [`pointer-move`](/structures/bst-computational-model/operations/pointer-move) —
  la operación primitiva del modelo: moverse por un puntero, al padre o a un
  hijo.
- [`rotate`](/structures/bst-computational-model/operations/rotate) — rotar
  un nodo con su padre; se construye sobre un número constante de
  reasignaciones de punteros, la misma clase de paso que `pointer-move`.
- [`search`](/structures/bst-computational-model/operations/search) — la
  única operación de consulta que el modelo soporta; se define como una
  secuencia de `pointer-move`.

## Análisis de complejidad

El estilo aquí no es una derivación: el profesor **postula** los costos, no
los prueba. Dos reglas, ambas de costo unitario:

1. "Moverse a través de un puntero — ir al padre o alguno de sus hijos en
   $O(1)$." (#19)
2. "Rotar un nodo x con su padre — también en $O(1)$." (#20)

Sobre esas dos reglas se define el costo de Buscar(x): "Empezando desde el
nodo raíz, se debe visitar el nodo con valor x." (#23) — es decir, el costo
real de una búsqueda es el número de `pointer-move` que hacen falta para
llegar de la raíz a x, que es exactamente la profundidad de x. El modelo
**sólo** soporta Buscar (#22-23): no hay inserción ni eliminación, y el
profesor restringe incluso las búsquedas a las que sí encuentran el valor:
"Asumiremos solo búsquedas en las que x sí se encuentra en el árbol." (#24)

De ahí sale la observación que organiza el resto de la semana: "En el peor
caso, ciertamente $O(\log n)$ es el mejor tiempo posible." (#26) pero "el
trabajo de las búsquedas depende de la secuencia de elementos que se buscan"
(#27) — el peor caso sobre *un* árbol no es la métrica interesante, porque el
mismo n admite árboles de forma muy distinta (uno balanceado, uno degenerado
en cadena) y una misma secuencia de búsquedas cuesta distinto en cada uno.
Ese contraste — misma secuencia, forma distinta, costo distinto — es
exactamente lo que instrumenta el C++ de este tema.

> **Nota de apoyo**: por simplicidad de notación el profesor asume "que las
> llaves son enteros entre el 1 y el n y la secuencia de búsqueda es
> {x1, x2, ..., xm}" (#28) — convención que reaparece en
> [`search-sequence-properties`](/structures/search-sequence-properties).

## Tabla de complejidad

La tabla de `meta.yaml` ya cubre las tres cotas (`pointer-move` y `rotate` en
$O(1)$, `search` en $O(\log n)$ en el peor caso). Lo que la tabla no puede decir:
la cota de `search` es sobre **la forma del árbol en el peor caso**, no una
propiedad de la secuencia — esa distinción es precisamente lo que
[`search-sequence-properties`](/structures/search-sequence-properties) viene
a refinar.

## Ejemplos

Ver [examples.md](/structures/bst-computational-model/examples).

## Comparación con estructuras relacionadas

| | [BST balanceado](/structures/balanced-bst) | modelo computacional BST |
| --- | --- | --- |
| qué mide | cotas de Search/Insert bajo un invariante de balance activo | el costo de las operaciones primitivas (`pointer-move`, `rotate`) sobre *cualquier* forma de BST, balanceado o no |
| qué rotación significa | el mecanismo que restaura el invariante de balance | una operación de costo $O(1)$ del modelo, sin que el modelo exija usarla para balancear nada |
| a qué pregunta sirve | "¿cómo mantengo $O(\log n)$ garantizado?" | "¿es $O(\log n)$ lo mejor posible, y depende de qué?" (#9-10) |

## Prueba de dominio

Ver [mastery-check.md](/structures/bst-computational-model/mastery-check).
