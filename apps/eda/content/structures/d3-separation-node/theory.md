---
kind: theory
title: "D₃ — nodo de separación"
visualization:
  type: tree
  steps:
    - note: >-
        Árbol de rango sobre y = {1,3,4,6,8,9,11} — el mismo de
        [locate-separation-node](/structures/d3-separation-node/operations/locate-separation-node).
        Cada nodo interno (aquí, los tres marcados como internos: 6, 3 y 9)
        va a guardar dos estructuras satélite sobre los puntos de sus dos
        hijos. Todavía sin ninguna satélite colgada.
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6 }
        - { id: n9, value: 9, parent: r6 }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3 }
        - { id: n8, value: 8, parent: n9 }
        - { id: n11, value: 11, parent: n9 }
    - note: >-
        Se toma un nodo interno cualquiera, v=3, para mostrar qué cuelga de
        él. Tiene dos hijos: derecha(v)=4 e izquierda(v)=1.
      highlight: [n3]
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6, state: active }
        - { id: n9, value: 9, parent: r6 }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3 }
        - { id: n8, value: 8, parent: n9 }
        - { id: n11, value: 11, parent: n9 }
    - note: >-
        Sobre los puntos de derecha(v) (el subárbol de 4) se construye una
        estructura D₂ normal, acotada por arriba ($y \le b_2$). Se dibuja
        como triángulo colgando del hijo derecho porque es una estructura
        completa sobre ese subárbol, no un valor suelto.
      highlight: [n4]
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6 }
        - { id: n9, value: 9, parent: r6 }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3, state: active }
        - { id: sat-r, value: "D₂ normal (y≤b₂)", parent: n4, collapsed: true }
        - { id: n8, value: 8, parent: n9 }
        - { id: n11, value: 11, parent: n9 }
      links:
        - { from: n4, to: sat-r, kind: pointer, label: "satélite" }
    - note: >-
        Simétricamente, sobre los puntos de izquierda(v) (el subárbol de 1)
        se construye una D₂' invertida, acotada por abajo ($y \ge a_2$) —
        la misma D₂, pero comparando en el sentido contrario.
      highlight: [n1]
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6 }
        - { id: n9, value: 9, parent: r6 }
        - { id: n1, value: 1, parent: n3, state: active }
        - { id: sat-l, value: "D₂' invertida (y≥a₂)", parent: n1, collapsed: true }
        - { id: n4, value: 4, parent: n3 }
        - { id: n8, value: 8, parent: n9 }
        - { id: n11, value: 11, parent: n9 }
      links:
        - { from: n1, to: sat-l, kind: pointer, label: "satélite" }
    - note: >-
        El mismo par de satélites se repite en TODO nodo interno (también
        en 6 y en 9) — no sólo en v=3. Por eso, sea cual sea el nodo de
        separación que encuentre una consulta futura, ya va a tener sus dos
        satélites listas: una normal a la derecha, una invertida a la
        izquierda.
      caption: "cada nodo interno paga dos D₂: una normal, una invertida — ningún nodo se queda sin las suyas"
      nodes:
        - { id: r6, value: 6, parent: null, state: active }
        - { id: n3, value: 3, parent: r6, state: active }
        - { id: n9, value: 9, parent: r6, state: active }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3 }
        - { id: n8, value: 8, parent: n9 }
        - { id: n11, value: 11, parent: n9 }
---

## ¿Qué problema resuelve?

[D₂](/structures/d2-bound-x) ya acota x en un rango $[x_1,x_2]$ disparando una
consulta de [D₁](/structures/dominance-2d) en cada uno de los $O(\lg n)$ nodos
canónicos de esa descomposición. El paso siguiente es acotar y **por ambos
lados**, $[a_2,b_2]$, sin repetir el mismo truco: si se acotara y con otra
descomposición canónica anidada dentro de cada nodo canónico de x, el costo
sería "$O(\lg n)$ nodos canónicos en x, cada uno con $O(\lg n)$ nodos canónicos en
y: $O(\lg^2 n)$ consultas. Perdimos el $O(\lg n)$ que queríamos." (Sem5_Fractional_Cascading_II.pdf#36).
$D_3$ resuelve exactamente esto: acotar $[x_1,x_2] \times [a_2,b_2] \times (-\infty,b_3)$ sin pagar
ese factor extra.

## Intuición

La salida es evitar la descomposición canónica en y por completo
(Sem5_Fractional_Cascading_II.pdf#36) y reemplazarla por la misma idea que ya
resuelve el caso 1D clásico: al buscar los dos extremos $a_2$ y $b_2$ en un
árbol ordenado por y, sus caminos de búsqueda **coinciden** mientras bajan
juntos, y se **separan en un único nodo** — "exactamente como en un árbol de
rangos 1D clásico" (#40). Ese nodo, el nodo de separación ($v_{\text{split}}$), es
donde toda la información que hace falta ya está disponible de un solo golpe:
de ahí en adelante ya no hace falta seguir bajando (#45).

## Estructura interna

Un árbol de rango sobre y (no sobre x, a diferencia de [D₂](/structures/d2-bound-x)).
Cada nodo `v` de este árbol guarda, sobre los puntos de sus dos hijos, dos
estructuras satélite (#37-39):

- en `derecha(v)`: una estructura [D₂](/structures/d2-bound-x) normal,
  acotada por arriba ($y \le b_2$);
- en `izquierda(v)`: una estructura $D_2$ **invertida**, $D_2'$, acotada por
  abajo ($y \ge a_2$).

El porqué de "normal" a la derecha e "invertida" a la izquierda sale
directamente de la propiedad del nodo de separación: todo punto en
`derecha(v_split)` ya tiene $y \ge a_2$ automáticamente (por eso basta acotar
arriba con $D_2$ normal), y todo punto en `izquierda(v_split)` ya tiene $y \le b_2$
automáticamente (por eso basta acotar abajo con $D_2'$). Ver
[localización del nodo de separación](/structures/d3-separation-node/operations/locate-separation-node)
para el argumento completo.

## Operaciones

- [Construcción](/structures/d3-separation-node/operations/build) — arma el
  árbol de rango sobre y y, en cada nodo, las dos satélites $D_2$ / $D_2'$.
- [Localización del nodo de separación](/structures/d3-separation-node/operations/locate-separation-node)
  — encuentra $v_{\text{split}}$, donde los caminos de $a_2$ y $b_2$ se bifurcan. La
  operación central de $D_3$.
- [Consulta](/structures/d3-separation-node/operations/query) — dos
  disparos, un solo nodo: una consulta a la $D_2$ de `derecha(v_split)` y otra a
  la $D_2'$ de `izquierda(v_split)`.

## Análisis de complejidad

Estilo *composición estructural*: el profesor no plantea una recurrencia ni
amortiza nada para $D_3$. Razona directamente sobre **cuántas subconsultas se
disparan** (#36, #43), comparando dos diseños:

- descomposición canónica en y (rechazada): $O(\lg n)$ nodos canónicos, cada
  uno disparando su propia consulta ⇒ $O(\lg n)$ consultas adicionales sobre
  el $O(\lg n)$ que ya costaba acotar x en $D_2$ ⇒ $O(\lg^2 n)$ en total (#36);
  el caso límite que $D_3$ existe para evitar.
- nodo de separación ($D_3$): "Dos consultas, en un único nodo — no $O(\lg n)$
  nodos canónicos." (#43). El ahorro no está en que cada consulta individual
  sea más barata, sino en que **el número de consultas pasa de $O(\lg n)$ a 2**,
  sin importar qué tan grande sea el árbol.

El profesor no cierra esto en una cota $\Theta(\cdot)$ propia de $D_3$: el costo real de
esas dos consultas depende de lo que cuesten las satélites $D_2$ / $D_2'$ (que a
su vez heredan de [D₁](/structures/dominance-2d) y del [árbol de
rango](/structures/range-tree)), y esa cuenta final la hace la sección de
cierre de la pila completa. Ver [D₄](/structures/d4-bound-z), que en #47
todavía reporta $O(\lg n) \cdot O(\lg n) + k = O(\lg^2 n + k)$ **sin** fractional
cascading aplicado — el problema que motiva la última pieza del curso.

## Tabla de complejidad

`meta.yaml` deja `complexity: {}`: el profesor no da ninguna cota numérica
propia de $D_3$, sólo el argumento cualitativo de conteo de consultas anterior.
Rellenar una tabla aquí sería inventar un número que el material no da.

## Ejemplos

Ver [Ejemplos](/structures/d3-separation-node/examples).

## Comparación con estructuras relacionadas

| | Consultas disparadas para acotar y |
| --- | --- |
| Descomposición canónica en y (rechazada, #36) | $O(\lg n)$ |
| Nodo de separación — $D_3$ (#43) | 2 |

## Prueba de dominio

Ver [Prueba de dominio](/structures/d3-separation-node/mastery-check).
