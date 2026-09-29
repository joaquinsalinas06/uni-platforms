---
kind: operation
title: Zig-zig
order: 3
cppSteps:
  - step-1-node.cpp
  - step-2-rotate.cpp
  - step-3-zig-zig.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Caso zig-zig: x, su padre p y su abuelo a están en línea, del
        MISMO lado (aquí, x hijo izquierdo de p, p hijo izquierdo de a).
        Antes de tocar nada: éste es el árbol de tres niveles que hay que
        reacomodar (#65). A, B, C, D son subárboles completos — se dibujan
        colapsados (triángulo) porque su tamaño interno no importa, sólo
        importa de quién cuelgan.
      highlight: [x, p, a]
      nodes:
        - { id: a, value: a, parent: null }
        - { id: p, value: p, parent: a }
        - { id: D, value: D, parent: a, collapsed: true }
        - { id: x, value: x, parent: p }
        - { id: C, value: C, parent: p, collapsed: true }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: B, value: B, parent: x, collapsed: true }
    - note: >-
        Antes de mover nada: se identifica QUÉ par rotar primero. Zig-zig
        rota el par (p, a) — el abuelo — antes que el par (x, p). Es la
        decisión que distingue zig-zig de "move-to-root": ese algoritmo
        ingenuo rotaría (x, p) primero, y produce una forma final distinta
        (peor) para la misma secuencia — ver el contraste al final de
        [splay](/structures/splay-tree/operations/splay).
      highlight: [p, a]
      nodes:
        - { id: a, value: a, parent: null }
        - { id: p, value: p, parent: a }
        - { id: D, value: D, parent: a, collapsed: true }
        - { id: x, value: x, parent: p }
        - { id: C, value: C, parent: p, collapsed: true }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: B, value: B, parent: x, collapsed: true }
    - note: >-
        Right-Rotate(p) en marcha: C, el hijo derecho de p, se desprende de
        p — es el único subárbol que cambia de padre en esta primera
        rotación. x no se toca: sigue colgando de p como hijo izquierdo.
      highlight: [p]
      nodes:
        - { id: a, value: a, parent: null }
        - { id: p, value: p, parent: a }
        - { id: D, value: D, parent: a, collapsed: true }
        - { id: x, value: x, parent: p }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: B, value: B, parent: x, collapsed: true }
        - { id: C, value: C, parent: null, collapsed: true, state: marked }
    - note: >-
        Primera rotación completa: p subió a la posición de a; a bajó a
        ser hijo derecho de p; C (que era hijo derecho de p) ahora es hijo
        izquierdo de a. x sigue exactamente donde estaba, como hijo
        izquierdo de p — todavía falta la segunda rotación.
      highlight: [p, a]
      nodes:
        - { id: p, value: p, parent: null }
        - { id: x, value: x, parent: p }
        - { id: a, value: a, parent: p }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: B, value: B, parent: x, collapsed: true }
        - { id: C, value: C, parent: a, collapsed: true }
        - { id: D, value: D, parent: a, collapsed: true }
    - note: >-
        Ahora sí toca el par (x, p) — igual que un [zig](/structures/splay-tree/operations/zig)
        simple. B, el hijo derecho de x, es el que va a cambiar de padre en
        este segundo giro.
      highlight: [x, p]
      nodes:
        - { id: p, value: p, parent: null }
        - { id: x, value: x, parent: p }
        - { id: a, value: a, parent: p }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: B, value: B, parent: x, collapsed: true }
        - { id: C, value: C, parent: a, collapsed: true }
        - { id: D, value: D, parent: a, collapsed: true }
    - note: >-
        Right-Rotate(x) en marcha: B se desprende de x y va camino a p. A
        se queda colgando de x sin moverse — nunca cambia de padre en todo
        zig-zig, porque es el subárbol "de afuera" de los tres niveles.
      highlight: [x]
      nodes:
        - { id: p, value: p, parent: x }
        - { id: x, value: x, parent: null }
        - { id: a, value: a, parent: p }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: C, value: C, parent: a, collapsed: true }
        - { id: D, value: D, parent: a, collapsed: true }
        - { id: B, value: B, parent: null, collapsed: true, state: marked }
    - note: >-
        Resultado final: x en la raíz, con p y a colgando en CASCADA del
        mismo lado (p es hijo directo de x, a es hijo directo de p) — no
        como dos hijos separados de x. Ésa es la forma que distingue
        zig-zig de zig-zag: comparar contra el resultado final de
        [zig-zag](/structures/splay-tree/operations/zig-zag), donde p y a
        terminan como hijos directos de x en vez de en cadena.
      highlight: [x]
      nodes:
        - { id: x, value: x, parent: null, state: answer }
        - { id: A, value: A, parent: x, collapsed: true }
        - { id: p, value: p, parent: x }
        - { id: B, value: B, parent: p, collapsed: true }
        - { id: a, value: a, parent: p }
        - { id: C, value: C, parent: a, collapsed: true }
        - { id: D, value: D, parent: a, collapsed: true }
---

## Qué hace

Es uno de los tres casos de [`splay`](/structures/splay-tree/operations/splay):
x, su padre p y su abuelo a están alineados del mismo lado (x izquierdo de p,
p izquierdo de a — o el espejo, ambos derechos). Dos rotaciones dejan a x en
la raíz de ese subárbol de tres niveles.

## Intuición

Es el caso que decide si Splay consigue o no la cota amortizada de
$O(\log n)$. La tentación es "subir x un nivel, y luego otro" (rotar (x, p),
después rotar (x, a)) — eso es el algoritmo move-to-root ingenuo. Zig-zig
hace algo distinto: **rota primero el par (p, a)** — la arista que
involucra al abuelo — y sólo después rota (x, p). El destino final (x en la
raíz) es el mismo en ambos órdenes, pero la forma **intermedia** no lo es:
rotar (p, a) primero reparte el subárbol que compartían p y a de forma más
pareja entre los dos, en vez de dejar a uno de ellos casi tan profundo como
estaba. Esa forma intermedia es la que hace que el argumento de potencial de
[access-lemma](/structures/access-lemma) cierre.

El profesor plantea esto mismo como pregunta: "x e y son **ambos** hijos
izquierdos (o ambos derechos) de sus padres. ¿Por qué no basta con rotar x
con y, y luego x con z (dos rotaciones «ingenuas»)?" (Sem6 #6). Y da la
mitad de la respuesta al traducirlo a la primitiva
[`Rotar`](/structures/splay-tree/operations/rotate): "el orden de las
rotaciones importa: primero y con z, luego x con y — nunca al revés"
(Sem6 #9), es decir `Rotar(padre(x)); Rotar(x)`.

> **Nota de apoyo** (no está en las diapositivas): la otra mitad — *por qué*
> el orden importa — es ésta. Si se rotara (x, p) primero y luego (x, a)
> —subir a x un nivel a la vez— se obtiene el algoritmo "move-to-root", que
> **no** logra $O(\log n)$ amortizado: existen secuencias de búsquedas donde
> move-to-root cuesta $\Omega(n)$ por operación en promedio, mientras que
> zig-zig (rotando el abuelo primero) sí logra $O(\log n)$. El profesor
> plantea la pregunta pero no exhibe ese contraejemplo; lo que sí hace es
> acotar el paso zig-zig formalmente en
> [access-lemma](/structures/access-lemma), y ahí se ve que el argumento
> sólo cierra con este orden.

## Algoritmo

1. Sean `x` hijo de `p`, `p` hijo de `a`, ambos del mismo lado (caso
   izquierdo-izquierdo mostrado arriba; derecho-derecho es simétrico).
2. Rotar el par `(p, a)`: `Rotate(p)` — p sube a la posición de a.
3. Rotar el par `(x, p)`: `Rotate(x)` — x sube a la posición de p (que ahora
   es la raíz del subárbol).
4. `x` queda como raíz de los tres niveles; `p` es su hijo, `a` es hijo de
   `p`.

## Pseudocódigo

En términos de la primitiva
[`Rotar`](/structures/splay-tree/operations/rotate), la tabla del profesor
(Sem6 #9) lo escribe en una línea: `Zig-Zig = Rotar(padre(x)); Rotar(x)`.

```
Algoritmo: ZigZig(x)
p ← padre(x)
a ← padre(p)
// mismo lado: x es izquierdo de p, y p es izquierdo de a (o el espejo)
Rotar(p)           // rota el par (p, a) — el abuelo — PRIMERO
Rotar(x)           // rota el par (x, p) — ahora x llega a la raíz
```

## C++

Ver `step-3-zig-zig.cpp` y `full-implementation.cpp` en el editor de
arriba: `zigZig(x)` llama `rotate(p)` antes que `rotate(x)`, en ese orden
exacto — invertir el orden de esas dos líneas reproduce move-to-root.

## Complejidad temporal

$O(1)$, costo real (no amortizado): dos rotaciones, cada una $O(1)$ por el
modelo BST, sin importar el tamaño de A, B, C o D (#65). Lo amortizado
—$O(\log n)$— es una propiedad de la secuencia completa de pasos que hace
[`splay`](/structures/splay-tree/operations/splay), no de este paso
aislado.

## Complejidad espacial

$O(1)$ adicional.

## Ejemplo

Ver [examples.md](/structures/splay-tree/examples).

## Casos límite

- **Espejo (derecho-derecho)**: x hijo derecho de p, p hijo derecho de a —
  simétrico, mismo orden de rotaciones (rotar `(p, a)` primero). El deck
  sólo dibuja la orientación izquierda (#65); la derecha no está pero se
  deriva por simetría.
- **A, B, C o D vacíos**: cada rotación sigue siendo $O(1)$; algún puntero
  queda en `null`.
- **`a` era la raíz del árbol completo**: tras zig-zig, `x` es la nueva
  raíz global.
