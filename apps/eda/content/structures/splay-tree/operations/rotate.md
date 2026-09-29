---
kind: operation
title: Rotar
order: 1
cppSteps:
  - step-1-node.cpp
  - step-2-rotate.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        La primitiva sola, antes de hablar de casos. `Rotar(v)` recibe UN
        nodo y lo sube un nivel sobre su padre (Sem6 #8). Aquí v es hijo
        izquierdo de p; A, B, C son subárboles completos (colapsados) — su
        contenido no importa, sólo de quién cuelgan.
      caption: "in-order antes: A · v · B · p · C"
      highlight: [v, p]
      nodes:
        - { id: p, value: p, tag: padre, parent: null }
        - { id: v, value: v, tag: v, parent: p, side: left, state: active }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
        - { id: A, value: A, parent: v, side: left, collapsed: true }
        - { id: B, value: B, parent: v, side: right, collapsed: true }
    - note: >-
        Primer puntero. B — el hijo derecho de v, el subárbol "de adentro" —
        se desprende de v. Es el único subárbol que cambia de padre en toda
        la rotación: A y C se quedan donde están.
      caption: "B es el único que cambia de padre"
      highlight: [v]
      nodes:
        - { id: p, value: p, tag: padre, parent: null }
        - { id: v, value: v, tag: v, parent: p, side: left, state: active }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
        - { id: A, value: A, parent: v, side: left, collapsed: true }
        - { id: B, value: B, parent: null, collapsed: true, state: marked }
    - note: >-
        Segundo puntero — `p.izq ← B`. B pasa a colgar de p por el mismo
        lado del que colgaba v. Esto es lo que preserva el orden: todo lo
        que hay en B es mayor que v y menor que p, y sigue quedando entre
        los dos.
      caption: "p.izq ← B"
      highlight: [p]
      nodes:
        - { id: p, value: p, tag: padre, parent: null }
        - { id: v, value: v, tag: v, parent: p, side: left, state: active }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
        - { id: A, value: A, parent: v, side: left, collapsed: true }
        - { id: B, value: B, parent: p, side: left, collapsed: true, state: marked }
    - note: >-
        Tercer puntero — `v.der ← p`. Es el giro en sí: p se desprende de su
        posición y pasa a colgar de v. v ocupa el lugar que tenía p, un
        nivel más arriba.
      highlight: [v, p]
      nodes:
        - { id: v, value: v, tag: v, parent: null, state: active }
        - { id: A, value: A, parent: v, side: left, collapsed: true }
        - { id: p, value: p, tag: padre, parent: v, side: right }
        - { id: B, value: B, parent: p, side: left, collapsed: true }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
    - note: >-
        Rotación completa. v subió exactamente un nivel, p bajó exactamente
        uno, y el recorrido in-order es el mismo que antes — por eso una
        rotación nunca rompe el invariante del BST. Tres reasignaciones de
        punteros, ninguna dependiente del tamaño de A, B o C: O(1).
      caption: "in-order después: A · v · B · p · C — idéntico"
      highlight: [v]
      nodes:
        - { id: v, value: v, tag: v, parent: null, state: answer }
        - { id: A, value: A, parent: v, side: left, collapsed: true }
        - { id: p, value: p, tag: padre, parent: v, side: right }
        - { id: B, value: B, parent: p, side: left, collapsed: true }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
    - note: >-
        Primera composición — **Zig**, una sola llamada. x es hijo de la
        raíz, no hay abuelo, así que basta `Rotar(x)` (Sem6 #9). Es la
        rotación de arriba, sin nada añadido.
      caption: "Zig = Rotar(x)"
      highlight: [x, p]
      nodes:
        - { id: p, value: p, tag: p, parent: null }
        - { id: x, value: x, tag: x, parent: p, side: left, state: active }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
        - { id: A, value: A, parent: x, side: left, collapsed: true }
        - { id: B, value: B, parent: x, side: right, collapsed: true }
    - note: >-
        Zig terminado. Detalle completo en
        [zig](/structures/splay-tree/operations/zig) — acá sólo interesa
        contar llamadas: una.
      caption: "1 llamada a Rotar"
      highlight: [x]
      nodes:
        - { id: x, value: x, tag: x, parent: null, state: answer }
        - { id: A, value: A, parent: x, side: left, collapsed: true }
        - { id: p, value: p, tag: p, parent: x, side: right }
        - { id: B, value: B, parent: p, side: left, collapsed: true }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
    - note: >-
        Segunda composición — **Zig-Zig**, mismo lado. x es izquierdo de p y
        p es izquierdo de g. La primera llamada NO es sobre x: es
        `Rotar(padre(x))`, es decir rotar p con g (Sem6 #9). Por eso el nodo
        activo de este paso es p, no x.
      caption: "Zig-Zig = Rotar(padre(x)); Rotar(x) — primera llamada: Rotar(p)"
      highlight: [p, g]
      nodes:
        - { id: g, value: g, tag: g, parent: null }
        - { id: p, value: p, tag: p, parent: g, side: left, state: active }
        - { id: D, value: D, parent: g, side: right, collapsed: true }
        - { id: x, value: x, tag: x, parent: p, side: left }
        - { id: C, value: C, parent: p, side: right, collapsed: true }
        - { id: A, value: A, parent: x, side: left, collapsed: true }
        - { id: B, value: B, parent: x, side: right, collapsed: true }
    - note: >-
        Tras `Rotar(p)`: p subió sobre g, y x viajó pegado a p sin que
        ninguna rotación mirara su interior — sigue siendo hijo izquierdo de
        p, ahora un nivel más arriba. g quedó como hijo derecho de p.
      caption: "segunda llamada: Rotar(x)"
      highlight: [x, p]
      nodes:
        - { id: p, value: p, tag: p, parent: null }
        - { id: x, value: x, tag: x, parent: p, side: left, state: active }
        - { id: g, value: g, tag: g, parent: p, side: right }
        - { id: A, value: A, parent: x, side: left, collapsed: true }
        - { id: B, value: B, parent: x, side: right, collapsed: true }
        - { id: C, value: C, parent: g, side: left, collapsed: true }
        - { id: D, value: D, parent: g, side: right, collapsed: true }
    - note: >-
        Tras la segunda llamada, `Rotar(x)`. p y g terminan en CASCADA
        colgando uno del otro — la forma que distingue zig-zig. Detalle en
        [zig-zig](/structures/splay-tree/operations/zig-zig).
      caption: "2 llamadas: Rotar(p) y después Rotar(x)"
      highlight: [x]
      nodes:
        - { id: x, value: x, tag: x, parent: null, state: answer }
        - { id: A, value: A, parent: x, side: left, collapsed: true }
        - { id: p, value: p, tag: p, parent: x, side: right }
        - { id: B, value: B, parent: p, side: left, collapsed: true }
        - { id: g, value: g, tag: g, parent: p, side: right }
        - { id: C, value: C, parent: g, side: left, collapsed: true }
        - { id: D, value: D, parent: g, side: right, collapsed: true }
    - note: >-
        Tercera composición — **Zig-Zag**, lados opuestos. x es derecho de p
        y p es izquierdo de g. Acá las DOS llamadas son sobre x mismo
        (Sem6 #9): la primera es `Rotar(x)`, y el nodo activo ya es x, no p.
        Ésa es toda la diferencia con zig-zig.
      caption: "Zig-Zag = Rotar(x); Rotar(x) — primera llamada: Rotar(x)"
      highlight: [x, p]
      nodes:
        - { id: g, value: g, tag: g, parent: null }
        - { id: p, value: p, tag: p, parent: g, side: left }
        - { id: D, value: D, parent: g, side: right, collapsed: true }
        - { id: A, value: A, parent: p, side: left, collapsed: true }
        - { id: x, value: x, tag: x, parent: p, side: right, state: active }
        - { id: B, value: B, parent: x, side: left, collapsed: true }
        - { id: C, value: C, parent: x, side: right, collapsed: true }
    - note: >-
        Tras la primera `Rotar(x)`: x subió sobre p y ahora cuelga
        directamente de g. El segundo `Rotar(x)` es sobre el MISMO nodo x,
        que ya está en el lugar donde antes estaba p — por eso el
        pseudocódigo escribe dos veces la misma llamada y aun así rota
        pares distintos.
      caption: "segunda llamada: Rotar(x) otra vez, ahora contra g"
      highlight: [x, g]
      nodes:
        - { id: g, value: g, tag: g, parent: null }
        - { id: x, value: x, tag: x, parent: g, side: left, state: active }
        - { id: D, value: D, parent: g, side: right, collapsed: true }
        - { id: p, value: p, tag: p, parent: x, side: left }
        - { id: A, value: A, parent: p, side: left, collapsed: true }
        - { id: B, value: B, parent: p, side: right, collapsed: true }
        - { id: C, value: C, parent: x, side: right, collapsed: true }
    - note: >-
        Zig-zag terminado: p y g quedan como los dos hijos DIRECTOS de x, no
        en cascada. Misma primitiva, mismo número de llamadas que zig-zig,
        distinto argumento en la primera — y forma final distinta. Detalle en
        [zig-zag](/structures/splay-tree/operations/zig-zag).
      caption: "2 llamadas: Rotar(x) y Rotar(x)"
      highlight: [x]
      nodes:
        - { id: x, value: x, tag: x, parent: null, state: answer }
        - { id: p, value: p, tag: p, parent: x, side: left }
        - { id: g, value: g, tag: g, parent: x, side: right }
        - { id: A, value: A, parent: p, side: left, collapsed: true }
        - { id: B, value: B, parent: p, side: right, collapsed: true }
        - { id: C, value: C, parent: g, side: left, collapsed: true }
        - { id: D, value: D, parent: g, side: right, collapsed: true }
---

## Qué hace

`Rotar(v)` sube el nodo `v` un nivel: lo intercambia con su padre, dejando
al padre como hijo de `v`. Es la **única** operación primitiva del splay
tree — "los tres casos (Zig, Zig-Zig, Zig-Zag) se arman todos a partir de
**una** operación primitiva: rotar un nodo `v` con su padre, para que `v`
suba un nivel" (Sem6 #8).

Es la misma rotación del modelo computacional:
[`rotate`](/structures/bst-computational-model/operations/rotate), donde ya
está la mecánica de punteros y su postulado de costo $O(1)$. Acá no se
reexplica: lo que este archivo agrega es **cómo se compone**.

## Intuición

En vez de tres operaciones distintas hay una sola, llamada dos veces con
argumentos distintos. Lo que cambia de caso a caso no es el mecanismo, es
**sobre qué nodo se llama primero**:

| Caso | En términos de Rotar |
| --- | --- |
| Zig | `Rotar(x)` |
| Zig-Zig | `Rotar(padre(x));  Rotar(x)` |
| Zig-Zag | `Rotar(x);  Rotar(x)` |

*(Sem6 #9)*

Zig-zig y zig-zag hacen exactamente dos llamadas cada uno y se distinguen
sólo por el argumento de la primera. Eso es lo que hay que leer de la tabla:

- En **Zig-Zig** la primera llamada es sobre el **padre** de x (rota `p` con
  `g`), no sobre x. Sólo la segunda es sobre x.
- En **Zig-Zag** ambas llamadas son sobre **x mismo**: la primera rota `x`
  con `p`; después de esa rotación x ocupa el lugar que tenía p, así que la
  segunda `Rotar(x)` ya lo rota contra `g`. Misma línea escrita dos veces,
  pares distintos.

El orden importa y no es intercambiable: "primero `y` con `z`, luego `x` con
`y` — nunca al revés" (Sem6 #9, retomando el *¡Piénsalo!* de Sem6 #6). Ver
[zig-zig](/structures/splay-tree/operations/zig-zig) para qué se rompe si se
invierte.

## Algoritmo

1. Sea `p ← padre(v)` y `g ← padre(p)` (posiblemente `nulo`).
2. Desprender de `v` su hijo "de adentro" (el derecho si `v` es hijo
   izquierdo; el izquierdo si es hijo derecho) y colgarlo de `p`, del lado
   por el que colgaba `v`.
3. Colgar `p` de `v`, del lado opuesto.
4. Enganchar `v` bajo `g` (o, si `g` es nulo, `v` pasa a ser la raíz del
   árbol).

El paso 2 es el que preserva el orden in-order: ese subárbol está entre `v`
y `p` en el recorrido, y sigue estándolo después.

## Pseudocódigo

```
Algoritmo: Rotar(v)
// sube v un nivel sobre su padre (Sem6 #8)
p ← padre(v)
g ← padre(p)
si v = p.izq entonces
     p.izq ← v.der;   si v.der ≠ nulo entonces padre(v.der) ← p
     v.der ← p
sino
     p.der ← v.izq;   si v.izq ≠ nulo entonces padre(v.izq) ← p
     v.izq ← p
padre(p) ← v
padre(v) ← g
si g = nulo entonces raiz ← v
sino si g.izq = p entonces g.izq ← v
sino g.der ← v
```

Y los tres casos, escritos sólo con esta función (Sem6 #9):

```
Zig(x)      →  Rotar(x)
ZigZig(x)   →  Rotar(padre(x));  Rotar(x)
ZigZag(x)   →  Rotar(x);         Rotar(x)
```

## C++

Ver `step-2-rotate.cpp` y `full-implementation.cpp` en el editor de arriba:
`rotate(root, x)` es esta única primitiva — decide `left`/`right` según de
qué lado cuelga `x`, y actualiza `root` cuando `g` es `nullptr`. `zig`,
`zigZig` y `zigZag` son literalmente las tres líneas de la tabla.

## Complejidad temporal

$O(1)$, costo real. Son tres reasignaciones de punteros (más el enganche
bajo `g`), ninguna dependiente del tamaño de los subárboles que cuelgan —
es el postulado de
[`rotate`](/structures/bst-computational-model/operations/rotate) del modelo
computacional, que el splay tree usa tal cual (Sem6 #8). Por eso cada uno de
los tres casos cuesta $O(1)$ real: uno hace una llamada, los otros dos hacen
dos.

## Complejidad espacial

$O(1)$ adicional: tres variables locales (`p`, `g`, el hijo que se
desprende), sin recursión ni estructuras auxiliares.

## Ejemplo

Ver la visualización de arriba (una rotación paso a paso, y después los tres
casos armados con ella) y
[examples.md](/structures/splay-tree/examples).

## Casos límite

- **`v` es la raíz**: `Rotar(v)` no aplica — no hay padre con quien rotar.
  [`Splay`](/structures/splay-tree/operations/splay) nunca llega a llamarlo
  en ese estado, porque su bucle es `mientras x ≠ raiz` (Sem6 #10).
- **`g` es nulo** (el padre era la raíz): `v` pasa a ser la nueva raíz del
  árbol; quien mantenga un puntero a la raíz debe actualizarlo. Es el único
  caso donde la rotación toca algo fuera de los tres niveles.
- **El hijo "de adentro" es nulo**: no hay nada que recolgar, la rotación
  sigue siendo $O(1)$ y algún puntero queda en `nulo`.
- **Espejo**: si `v` es hijo derecho, todo es simétrico. El mazo dibuja una
  sola orientación por caso; la otra se deriva por simetría.
