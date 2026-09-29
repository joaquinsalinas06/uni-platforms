---
kind: operation
title: Consulta (dos disparos, un solo nodo)
order: 3
cppSteps:
  - step-1-node.cpp
  - step-2-build.cpp
  - step-3-locate-separation-node.cpp
  - step-4-query.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Punto de partida: $v_{\text{split}}=3$ ya localizado para
        $[a_2,b_2]=[1,4]$ — el resultado exacto de
        [locate-separation-node](/structures/d3-separation-node/operations/locate-separation-node),
        que no se repite aquí. El resto del árbol (9, 8, 11) ya quedó
        descartado del descenso: de aquí en adelante sólo se dispara sobre
        derecha(3)=4 e izquierda(3)=1.
      highlight: [n3]
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6, state: marked, tag: v_split }
        - { id: n9, value: 9, parent: r6, state: muted }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3 }
        - { id: n8, value: 8, parent: n9, state: muted }
        - { id: n11, value: 11, parent: n9, state: muted }
    - note: >-
        Primer disparo: sobre derecha(v_split)=4, la D₂ normal, con
        $x\in[1,6]$ y cota superior $y\le b_2=4$ *(x derivado para este
        diagrama, no del ejemplo de examples.md)*. La cota $y\ge a_2$ ya
        está garantizada por construcción, así que D₂ sólo tiene que
        resolver x — ese trabajo es de [D₂](/structures/d2-bound-x), no se
        reimplementa aquí.
      highlight: [n4]
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6, state: marked, tag: v_split }
        - { id: n9, value: 9, parent: r6, state: muted }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3, state: active }
        - { id: n8, value: 8, parent: n9, state: muted }
        - { id: n11, value: 11, parent: n9, state: muted }
        - { id: q-r, value: "D₂ normal: x∈[1,6], y≤4", parent: n4, collapsed: true, state: active }
      links:
        - { from: n4, to: q-r, kind: pointer, label: "consulta" }
    - note: >-
        El punto (x=2, y=4) que vive en derecha(v_split) cae dentro de
        $x\in[1,6]$, así que D₂ normal lo devuelve — pasa a formar parte de
        la respuesta canónica de esta consulta.
      highlight: [n4]
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6, state: marked, tag: v_split }
        - { id: n9, value: 9, parent: r6, state: muted }
        - { id: n1, value: 1, parent: n3 }
        - { id: n4, value: 4, parent: n3, state: answer }
        - { id: n8, value: 8, parent: n9, state: muted }
        - { id: n11, value: 11, parent: n9, state: muted }
        - { id: q-r, value: "(2,4) ∈ respuesta", parent: n4, collapsed: true, state: answer }
      links:
        - { from: n4, to: q-r, kind: pointer, label: "resultado" }
    - note: >-
        Segundo disparo: sobre izquierda(v_split)=1, la D₂' invertida, con
        el mismo $x\in[1,6]$ y cota inferior $y\ge a_2=1$. Aquí la cota
        $y\le b_2$ ya está garantizada; D₂' sólo resuelve x, igual que D₂
        normal pero comparando al revés.
      highlight: [n1]
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6, state: marked, tag: v_split }
        - { id: n9, value: 9, parent: r6, state: muted }
        - { id: n1, value: 1, parent: n3, state: active }
        - { id: n4, value: 4, parent: n3, state: answer }
        - { id: n8, value: 8, parent: n9, state: muted }
        - { id: n11, value: 11, parent: n9, state: muted }
        - { id: q-l, value: "D₂' invertida: x∈[1,6], y≥1", parent: n1, collapsed: true, state: active }
      links:
        - { from: n1, to: q-l, kind: pointer, label: "consulta" }
    - note: >-
        El punto (x=2, y=1) que vive en izquierda(v_split) también cae en
        $x\in[1,6]$, así que D₂' lo devuelve — segundo punto de la
        respuesta canónica.
      highlight: [n1]
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6, state: marked, tag: v_split }
        - { id: n9, value: 9, parent: r6, state: muted }
        - { id: n1, value: 1, parent: n3, state: answer }
        - { id: n4, value: 4, parent: n3, state: answer }
        - { id: n8, value: 8, parent: n9, state: muted }
        - { id: n11, value: 11, parent: n9, state: muted }
        - { id: q-l, value: "(2,1) ∈ respuesta", parent: n1, collapsed: true, state: answer }
      links:
        - { from: n1, to: q-l, kind: pointer, label: "resultado" }
    - note: >-
        La respuesta final es la unión de los dos disparos — (2,4) y
        (2,1) — sin haber recorrido más nodos que v_split y sus dos hijos.
        Dos consultas, un solo nodo (#43): no $O(\lg n)$ nodos canónicos
        como en la descomposición canónica en y que este diseño evita (#36).
      caption: "respuesta = {(2,4), (2,1)} — 2 disparos totales"
      nodes:
        - { id: r6, value: 6, parent: null }
        - { id: n3, value: 3, parent: r6, state: marked, tag: v_split }
        - { id: n9, value: 9, parent: r6, state: muted }
        - { id: n1, value: 1, parent: n3, state: answer }
        - { id: n4, value: 4, parent: n3, state: answer }
        - { id: n8, value: 8, parent: n9, state: muted }
        - { id: n11, value: 11, parent: n9, state: muted }
---

## Qué hace

Resuelve $[x_1,x_2] \times [a_2,b_2] \times (-\infty,b_3)$ disparando exactamente **dos**
consultas satélite desde el
[nodo de separación](/structures/d3-separation-node/operations/locate-separation-node),
en vez de recorrer $O(\lg n)$ nodos canónicos de una descomposición en y.

## Intuición

Una vez localizado $v_{\text{split}}$, ya no hace falta bajar más (#45): toda la
información sobre y que la consulta necesita vive en las dos satélites
construidas en ese nodo.

- "Todo derecha(v_split) ya cumple $y \ge a_2$ automáticamente: solo falta pedir
  $y \le b_2$ ⇒ una consulta a su $D_2$." (#41)
- "Todo izquierda(v_split) ya cumple $y \le b_2$ automáticamente: solo falta pedir
  $y \ge a_2$ ⇒ una consulta a su $D_2'$ (invertida)." (#42)
- "Dos consultas, en un único nodo — no $O(\lg n)$ nodos canónicos." (#43)

Cada una de esas dos consultas es, a su vez, una consulta
[D₂](/structures/d2-bound-x) ordinaria (normal o invertida): acota x con la
descomposición canónica de $D_2$ y dispara la dominancia
[D₁](/structures/dominance-2d) correspondiente. $D_3$ no reemplaza ese trabajo,
sólo evita multiplicarlo por $O(\lg n)$ nodos.

## Algoritmo

1. Localizar $v_{\text{split}}$ para $[a_2,b_2]$
   ([locate-separation-node](/structures/d3-separation-node/operations/locate-separation-node)).
2. Disparar una consulta $D_2$ normal sobre `derecha(v_split)` con
   $[x_1,x_2] \times (-\infty,b_2]$ (el $y \ge a_2$ ya está garantizado).
3. Disparar una consulta $D_2'$ invertida sobre `izquierda(v_split)` con
   $[x_1,x_2] \times [a_2,+\infty)$ (el $y \le b_2$ ya está garantizado).
4. La respuesta es la unión de ambos resultados.

## Pseudocódigo

```
función consultarD3(raiz, x1, x2, a2, b2):
    v = localizarNodoDeSeparacion(raiz, a2, b2)
    resultado = []
    resultado += consultarD2Normal(derecha(v), x1, x2, cotaSuperior=b2)
    resultado += consultarD2Invertida(izquierda(v), x1, x2, cotaInferior=a2)
    devolver resultado
```

## C++

Ver `step-4-query.cpp` en el editor de arriba. Las satélites $D_2$ / $D_2'$ se
implementan aquí como estructuras funcionalmente correctas y verificadas
contra fuerza bruta (no como una reimplementación completa de
[D₂](/structures/d2-bound-x), que es alcance de otro agente): filtran por
`x` y por el lado de `y` que todavía falta, exactamente como describe la
intuición de esta operación.

## Complejidad temporal

El profesor no cierra un número propio para $D_3$: el ahorro que reporta es de
**conteo de consultas** (2, no $O(\lg n)$, #43), no de tiempo por consulta —
eso depende del costo de $D_2$ / $D_2'$, que hereda de
[D₁](/structures/dominance-2d) y no se resuelve en esta sección (ver
[Análisis de complejidad](/structures/d3-separation-node#análisis-de-complejidad)).

## Complejidad espacial

No aplica a la consulta en sí; el espacio ya está pagado en `build`.

## Ejemplo

Ver [Ejemplos](/structures/d3-separation-node/examples).

## Casos límite

- El caso que esta operación existe para evitar es la descomposición
  canónica en y, que el profesor descarta explícitamente por costar
  $O(\lg^2 n)$ en vez de las 2 consultas de aquí (#36).
- Si $v_{\text{split}}$ es una hoja (ver
  [Casos límite de localización](/structures/d3-separation-node/operations/locate-separation-node)),
  no hay `derecha(v_split)` ni `izquierda(v_split)` con puntos: la consulta
  devuelve vacío. No discutido por el profesor.
