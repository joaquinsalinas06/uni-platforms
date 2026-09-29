---
kind: theory
title: "D₄ — acotar z"
visualization:
  type: range-tree
  steps:
    - note: >-
        El árbol de rango sobre z, en reposo — antes de buscar nada.
      nodes:
        - { id: rz, value: "z_raíz", parent: null }
        - { id: zc, value: "camino común", parent: rz }
        - { id: za, value: "izquierda(zc)", parent: zc }
        - { id: zb, value: "derecha(zc)", parent: zc }
    - note: >-
        Una consulta con caja $[a_3,b_3]$ en z busca $a_3$ y $b_3$ desde la
        raíz. Mientras el bit de z que decide el camino es el mismo para
        ambos, los dos recorridos bajan juntos: por z_raíz y por camino
        común, sin separarse todavía.
      highlight: [rz, zc]
      nodes:
        - { id: rz, value: "z_raíz", parent: null, state: active }
        - { id: zc, value: "camino común", parent: rz, state: active }
        - { id: za, value: "izquierda(zc)", parent: zc }
        - { id: zb, value: "derecha(zc)", parent: zc }
      caption: "búsqueda de a3 y b3: todavía un solo camino"
    - note: >-
        En camino común los dos recorridos divergen: el de $a_3$ sigue por
        izquierda(zc), el de $b_3$ por derecha(zc). Ese es el nodo de
        separación — el único que hace falta visitar para responder la
        consulta (la razón de por qué alcanza con uno solo ya se justificó
        en D3-separation-node; aquí sólo se ve dónde ocurre para z).
      highlight: [zc, za, zb]
      nodes:
        - { id: rz, value: "z_raíz", parent: null }
        - { id: zc, value: "camino común", parent: rz, state: marked }
        - { id: za, value: "izquierda(zc)", parent: zc, state: active }
        - { id: zb, value: "derecha(zc)", parent: zc, state: active }
      caption: "camino común = nodo de separación: aquí divergen a3 y b3"
    - note: >-
        derecha(zc) sólo necesita la cota superior de z (b3) — nunca la
        inferior, porque todo punto de ese lado ya quedó por encima de
        camino común. Por eso ahí cuelga una D₃ normal, acotada por arriba
        ($z \le b_3$).
      highlight: [zb]
      nodes:
        - { id: rz, value: "z_raíz", parent: null }
        - { id: zc, value: "camino común", parent: rz }
        - { id: za, value: "izquierda(zc)", parent: zc }
        - { id: zb, value: "derecha(zc)", parent: zc, state: active }
        - { id: d3n, value: "D₃ normal (z ≤ b3)", parent: null, panel: sat }
      panels:
        - { id: sat, label: "satélite de derecha(zc)", anchor: zb }
    - note: >-
        izquierda(zc) es la gemela simétrica: sólo necesita la cota inferior
        de z (a3). Por eso ahí cuelga la D₃′ invertida, acotada por abajo
        ($z \ge a_3$) — la mitad que D₃ sola no provee.
      highlight: [za]
      nodes:
        - { id: rz, value: "z_raíz", parent: null }
        - { id: zc, value: "camino común", parent: rz }
        - { id: za, value: "izquierda(zc)", parent: zc, state: active }
        - { id: zb, value: "derecha(zc)", parent: zc }
        - { id: d3n, value: "D₃ normal (z ≤ b3)", parent: null, panel: sat }
        - { id: d3i, value: "D₃′ invertida (z ≥ a3)", parent: null, panel: sat2 }
      panels:
        - { id: sat, label: "satélite de derecha(zc)", anchor: zb }
        - { id: sat2, label: "satélite de izquierda(zc)", anchor: za }
    - note: >-
        Con las dos satélites disparadas — D₃ normal en derecha(zc) para
        $z \le b_3$ y D₃′ invertida en izquierda(zc) para $z \ge a_3$ — la caja
        $[x_1,x_2] \times [a_2,b_2] \times [a_3,b_3]$ queda cerrada en las tres
        coordenadas: la respuesta se arma combinando el resultado de las dos,
        sin bajar a ningún otro nodo del árbol sobre z.
      nodes:
        - { id: rz, value: "z_raíz", parent: null }
        - { id: zc, value: "camino común", parent: rz }
        - { id: za, value: "izquierda(zc)", parent: zc }
        - { id: zb, value: "derecha(zc)", parent: zc }
        - { id: d3n, value: "D₃ normal (z ≤ b3)", parent: null, panel: sat, state: answer }
        - { id: d3i, value: "D₃′ invertida (z ≥ a3)", parent: null, panel: sat2, state: answer }
      panels:
        - { id: sat, label: "satélite de derecha(zc)", anchor: zb }
        - { id: sat2, label: "satélite de izquierda(zc)", anchor: za }
      caption: "caja cerrada en x, y y z — D₄ completo"
---

## ¿Qué problema resuelve?

$D_4$ responde la consulta completa de la clase: una caja 3D cerrada en las tres
coordenadas, $[x_1,x_2] \times [a_2,b_2] \times [a_3,b_3]$ — "la pregunta única de toda la
clase" desde la diapositiva #2. [D3-separation-node](/structures/d3-separation-node)
ya cerraba x y y, pero dejaba z abierta sólo por abajo: $[x_1,x_2] \times [a_2,b_2] \times (-\infty,b_3]$. $D_4$ acota z también por arriba, sin pagar el costo extra de una
descomposición canónica.

## Intuición

El profesor lo presenta como "la misma idea, un nivel más": $D_3$ resolvió
exactamente este problema para y usando $D_2$ como estructura satélite en un
árbol de rango. $D_4$ repite ese mismo movimiento una dimensión arriba, usando
$D_3$ como satélite. Si en $D_3$ el árbol de rango era sobre y y guardaba $D_2$ normal
a un lado del nodo de separación y $D_2$ invertida al otro, en $D_4$ el árbol de
rango es sobre **z** y guarda $D_3$ normal a un lado y $D_3$ invertida al otro.

> **Nota de apoyo** (no está en las diapositivas): "invertida" significa lo
> mismo que en $D_3$ — la misma estructura, pero acotando su dimensión libre por
> abajo (≥) en vez de por arriba (≤), para el lado del árbol donde esa
> dirección es la que falta por cerrar.

## Estructura interna

Un árbol de rango sobre z. Cada nodo v de este árbol guarda dos estructuras
satélite, sobre los puntos de sus dos hijos (#46):

- en derecha(v): una **$D_3$ normal** (acotada por arriba, $z \le b_3$);
- en izquierda(v): una **$D_3$ invertida** (acotada por abajo, $z \ge a_3$).

Esto es exactamente lo mismo que guarda cada nodo de $D_3$ — sólo que ahí la
estructura satélite era $D_2$ y la dimensión del árbol era y. Nada del
mecanismo cambia: la razón de por qué alcanza con un nodo (el nodo de
separación, localizado al buscar $a_3$ y $b_3$ y ver dónde divergen sus caminos)
es idéntica a la de $D_3$, y el material no repite esa justificación para $D_4$ —
la da por heredada de $D_3$ (#46). Ver
[D3-separation-node](/structures/d3-separation-node) para esa justificación
completa: aquí no se reexplica.

Qué cambia, exactamente:
- la dimensión sobre la que se construye el árbol de rango (z en vez de y);
- la estructura satélite que cuelga de cada nodo ($D_3$ en vez de $D_2$).

Qué se hereda sin cambios:
- el árbol de rango en sí y su invariante (BST balanceado sobre la
  coordenada elegida);
- la idea de nodo de separación y por qué basta un único nodo en vez de
  O(lg n) nodos canónicos;
- la noción de estructura "normal" a un lado y "invertida" al otro.

## Operaciones

- [Build](/structures/d4-bound-z/operations/build) — la única operación que
  el mapa de conocimiento le asigna a $D_4$.

> **Nota de apoyo** (no está en las diapositivas, es información sobre el
> material): el profesor no desarrolla una consulta propia para $D_4$ en esta
> sección — ni la localización del nodo de separación ni el disparo de las
> dos consultas satélite se repiten para z. Las diapositivas #46-47 sólo
> describen la construcción y, a partir de ella, el costo de *usar* $D_4$ antes
> de aplicar cascading (ver abajo). La consulta se hereda literalmente de
> $D_3$: es el mismo procedimiento sobre z. Por eso el mapa de conocimiento le
> da a este tema una sola operación (`build`) y ninguna consulta propia.

## Análisis de complejidad

El profesor no da una cota numérica para construir $D_4$ — tampoco la dio para
$D_2$ ni $D_3$ (#34, y ningún dato análogo en #35-45): "exactamente la misma
construcción que $D_3$" no trae, en la sección de $D_4$, un análisis nuevo de
tiempo de construcción.

Lo que sí da en esta sección es el costo de **usar** $D_4$ tal como queda
construido, en dos estados distintos, con el mismo **estilo de composición
estructural** que $D_2$ y $D_3$ (multiplicar el costo de cada nivel anidado, no
recurrencia ni amortización):

| estado | consulta | espacio |
| --- | --- | --- |
| sin cascading todavía (#47) | $O(\lg^2 n + k)$ | — |
| con cascading completo (#54, #57, #62) | $O(\lg n + k)$ | $O(n \lg^3 n)$ |

Cita literal (#47): "Tal como está, cada nivel ($D_3$ dentro de $D_4$) todavía
hace su propia búsqueda binaria real: $O(\lg n) \cdot O(\lg n) + k = O(\lg^2 n + k)$.
Falta la pieza final." Esa "pieza final" es
[fractional cascading generalizado](/structures/generalized-fractional-cascading),
que no se desarrolla aquí — sólo se menciona como destino, tal como lo hace
el material (#48-55).

## Tabla de complejidad

`complexity: {}` en el meta.yaml: no hay una cota propia de `build` que
tabular. La tabla de arriba describe el costo de **usar** la estructura ya
construida, en dos momentos distintos de la exposición — no el costo de
construirla — y por eso vive en prosa y no en la tabla generada por la
plataforma.

## Ejemplos

Ver [Ejemplos](/structures/d4-bound-z/examples). El profesor no da ningún
valor concreto en las 76 páginas del mazo; el ejemplo se deriva a mano de la
descripción de la construcción, marcado como tal.

## Comparación con estructuras relacionadas

| | dimensión del árbol de rango | estructura satélite | qué acota |
| --- | --- | --- | --- |
| [D2-bound-x](/structures/d2-bound-x) | x (BST simple) | $D_1$ (dominancia) | x cerrado, y y z abiertos por arriba |
| [D3-separation-node](/structures/d3-separation-node) | y | $D_2$ normal / $D_2$ invertida | x e y cerrados, z abierto por arriba |
| $D_4$ (aquí) | z | $D_3$ normal / $D_3$ invertida | x, y y z cerrados — la caja completa |

Cada fila es la anterior, un nivel más. Es exactamente el patrón que el
material señala como preparación para
[fractional cascading generalizado](/structures/generalized-fractional-cascading):
"$D_4$ sobre $D_3$ sobre $D_2$ sobre $D_1$" (#53).

## Prueba de dominio

Ver [Prueba de dominio](/structures/d4-bound-z/mastery-check).
