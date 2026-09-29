---
kind: examples
title: Ejemplos
---

<!--
El mazo no da secuencias numéricas para este tema (a diferencia de otras
secciones, aquí sólo aparece la fórmula `Complejidad total(S) = O(OPT(S))`,
#53). Las tres secuencias de abajo son *(derivadas del pseudocódigo; no
aparece en las diapositivas)* — en realidad derivadas de la definición de
OPT(S) del modelo computacional BST, tratando cada árbol posible sobre las
llaves como candidato y contando el costo de la secuencia con el modelo de
costo unitario de bst-computational-model (profundidad = costo de acceder a
un nodo, empezando en 1 para la raíz). Sirven para hacer tangible qué es
"el óptimo offline" antes de preguntar si algún algoritmo online lo alcanza.
-->

## Mínimo

*(derivado; no aparece en las diapositivas)*

Llaves $\{1, 2, 3\}$, secuencia $S = (2, 2, 2)$: la misma búsqueda repetida
tres veces.

Con sólo 3 llaves hay 5 BST distintos posibles. $OPT(S)$ es el mínimo, sobre
los 5, de la suma de profundidades de `2` en cada acceso — y como la
secuencia es constante, basta con el árbol que pone `2` como raíz (profundidad
1): $OPT(S) = 1 + 1 + 1 = 3$. Cualquier otro árbol donde `2` no sea la raíz
paga al menos 2 por acceso, así que ese árbol con `2` en la raíz es
óptimo — sin necesitar ninguna rotación entre accesos.

Este caso no distingue todavía entre "online" y "offline": un algoritmo que
sólo ve $S$ de a un elemento también puede adivinar que conviene poner `2`
arriba desde el primer acceso repetido.

## Normal

*(derivado; no aparece en las diapositivas — verificado por búsqueda
exhaustiva en full-implementation.cpp)*

Llaves $\{1, 2, 3, 4\}$, secuencia $S = (1,1,1,1,4,4,4,4)$: un bloque de
accesos a `1` seguido de un bloque de accesos a `4`.

Un árbol estático tiene que fijar de antemano un único árbol para toda la
secuencia: el mejor posible sobre las 14 formas de BST con 4 llaves cuesta
**12** (no puede tener a la vez `1` y `4` cerca de la raíz, así que uno de
los dos bloques paga profundidad alta).

$OPT(S)$ sí puede reestructurar entre búsquedas: sube `1` cerca de la raíz
para el primer bloque, rota una vez en la frontera entre bloques, y sube `4`
para el segundo. El cálculo exhaustivo (todos los árboles, todas las
distancias de rotación entre ellos) da **$OPT(S) = 9$** — estrictamente
mejor que el estático, y también mejor que una heurística simple como
move-to-root (que da 14 aquí, porque reacomoda después de cada acceso en
vez de anticipar el cambio de bloque).

Este es el ejemplo que hace tangible la pregunta central: un algoritmo
*online* (splay tree, por ejemplo) no sabe de antemano dónde termina cada
bloque — sólo lo puede notar *después* de ver varios accesos repetidos. Que
un algoritmo así logre, sobre secuencias arbitrarias, un costo total cercano
a $OPT(S)$ sin conocer el futuro es exactamente lo que "$O(1)$-competitivo"
pediría.

## Límite

*(derivado; no aparece en las diapositivas)*

El caso patológico es una secuencia con patrón —no aleatoria— que un árbol
estático maneja mal en el peor caso, pero que $OPT(S)$ maneja barato porque
puede anticipar la estructura del patrón completo. El ejemplo clásico del
área (secuencial: buscar $1, 2, 3, \ldots, n$ en orden, repetidamente) hace que
cualquier árbol estático balanceado pague $\Theta(\log n)$ por acceso, mientras que
un árbol que se reestructura a tiempo (sabiendo que el patrón se repite)
puede acercarse a $O(1)$ amortizado por acceso explotando la localidad de la
secuencia.

No hay ninguna estructura del curso que se sepa que logra esto de forma
online y en general — ésa es, otra vez, la pregunta abierta (#56). Este caso
límite es justamente el que motiva por qué "$O(1)$-competitivo" sería un
resultado fuerte y por qué no basta con $O(\log n)$ por acceso, cota que ya se
sabe alcanzar con cualquier BST balanceado: el punto de la conjetura es
igualar a $OPT(S)$, no sólo a $O(\log n)$.
