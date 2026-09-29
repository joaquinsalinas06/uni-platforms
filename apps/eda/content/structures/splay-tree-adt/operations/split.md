---
kind: operation
title: Separar
order: 1
cppSteps:
  - step-1-base.cpp
  - step-2-split.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Punto de partida: la PRECONDICIÓN. Ya se ejecutó
        [`Buscar(k)`](/structures/splay-tree/operations/search), así que la
        raíz r es k (si k estaba) o su predecesor/sucesor (si no estaba,
        #14). L y R son los dos subárboles de r, dibujados colapsados
        porque su contenido interno no importa — sólo importa de quién
        cuelgan.
      caption: "Precondición: ya se ejecutó Buscar(k)"
      highlight: [r]
      nodes:
        - { id: r, value: r, parent: null, tag: r, state: marked }
        - { id: L, value: L, parent: r, collapsed: true }
        - { id: R, value: R, parent: r, collapsed: true }
    - note: >-
        Lo que Buscar ya garantizó, sin que Separar haga nada: "Tras
        Buscar(k), la raíz r ya cumple: uno de sus dos subárboles es todo
        menor o igual que k y el otro todo mayor que k" (#16). La frontera
        entre los dos conjuntos está EN la raíz — por eso r se dibuja como
        delimitador, no como nodo activo.
      caption: "uno de los dos lados es ≤ k, el otro > k"
      highlight: [r, L, R]
      nodes:
        - { id: r, value: r, parent: null, tag: r, state: marked }
        - { id: L, value: L, parent: r, collapsed: true }
        - { id: R, value: R, parent: r, collapsed: true }
    - note: >-
        La pregunta del profesor: "¿Cuántas comparaciones más hacen falta
        para partirlo?" — respuesta: "Ninguna: solo hay que mirar el valor de
        r y cortar un puntero" (#16). Ésta es esa única mirada: se compara
        r.valor contra k, y nada más. No se baja al árbol.
      caption: "¿r.valor ≤ k?  — la única comparación de toda la operación"
      highlight: [r]
      nodes:
        - { id: r, value: r, parent: null, tag: r, state: active }
        - { id: L, value: L, parent: r, collapsed: true }
        - { id: R, value: R, parent: r, collapsed: true }
    - note: >-
        PRIMERA RAMA — r.valor ≤ k. Entonces r pertenece al lado de los
        valores menores o iguales que k: I ← r. La raíz se queda del lado
        izquierdo, con su subárbol L intacto colgando.
      caption: "r.valor ≤ k  ⇒  I ← r"
      highlight: [r]
      nodes:
        - { id: r, value: r, parent: null, tag: I, state: active }
        - { id: L, value: L, parent: r, collapsed: true }
        - { id: R, value: R, parent: r, collapsed: true }
    - note: >-
        D ← r.der. Como r es a lo más k y el árbol es un BST, TODO lo que
        cuelga a la derecha de r es estrictamente mayor que r y, por la
        precondición, mayor que k. R se marca como la frontera que se va a
        desprender.
      caption: "D ← r.der  — R entero es > k"
      highlight: [R]
      nodes:
        - { id: r, value: r, parent: null, tag: I }
        - { id: L, value: L, parent: r, collapsed: true }
        - { id: R, value: R, parent: r, collapsed: true, tag: D, state: marked }
    - note: >-
        El corte: r.der ← NULO. Una sola asignación de puntero, y R queda
        como raíz de un árbol independiente. Éste es el momento en que el
        árbol se parte — no hay recorrido, no hay copia de nodos, no hay
        segunda llamada a Splay.
      caption: "r.der ← NULO  — el único puntero que se toca"
      highlight: [r, R]
      nodes:
        - { id: r, value: r, parent: null, tag: I, state: active }
        - { id: L, value: L, parent: r, collapsed: true }
        - { id: R, value: R, parent: null, collapsed: true, tag: D, state: marked }
    - note: >-
        Resultado de la primera rama: dos splay trees independientes. I con
        r en la raíz y L debajo (todo ≤ k); D es R entero (todo > k). Ambos
        son BST válidos porque cada uno era ya un subárbol de un BST.
      caption: "devolver (I, D)"
      highlight: [r, R]
      nodes:
        - { id: r, value: r, parent: null, tag: I, state: answer }
        - { id: L, value: L, parent: r, collapsed: true }
        - { id: R, value: R, parent: null, collapsed: true, tag: D, state: answer }
    - note: >-
        SEGUNDA RAMA — se vuelve al árbol de partida, pero ahora r.valor > k
        (la raíz que dejó Buscar es el SUCESOR de k, no el predecesor).
        Misma comparación, resultado opuesto: corre el `en otro caso` del
        pseudocódigo.
      caption: "r.valor > k  — la rama espejo"
      highlight: [r]
      nodes:
        - { id: r, value: r, parent: null, tag: r, state: active }
        - { id: L, value: L, parent: r, collapsed: true }
        - { id: R, value: R, parent: r, collapsed: true }
    - note: >-
        D ← r, I ← r.izq. Ahora es r quien pertenece al lado de los mayores
        que k, y el subárbol IZQUIERDO es el que se desprende: todo lo que
        cuelga a la izquierda de r es menor que r y, por la precondición,
        a lo más k.
      caption: "D ← r,  I ← r.izq"
      highlight: [L]
      nodes:
        - { id: r, value: r, parent: null, tag: D }
        - { id: L, value: L, parent: r, collapsed: true, tag: I, state: marked }
        - { id: R, value: R, parent: r, collapsed: true }
    - note: >-
        El corte espejo: r.izq ← NULO. Exactamente el mismo trabajo que la
        primera rama — una comparación y un puntero — y por eso Separar no
        necesita saber si k estaba en el árbol ni de qué lado quedó la raíz.
        Los cuatro casos (k presente o ausente, raíz predecesor o sucesor)
        los resuelve la misma comparación.
      caption: "r.izq ← NULO  ⇒  devolver (I, D)"
      highlight: [r, L]
      nodes:
        - { id: L, value: L, parent: null, collapsed: true, tag: I, state: answer }
        - { id: r, value: r, parent: null, tag: D, state: answer }
        - { id: R, value: R, parent: r, collapsed: true }
---

## Qué hace

Parte el splay tree en dos splay trees independientes: `I` con todas las
llaves menores o iguales que `k`, y `D` con todas las estrictamente mayores.
El árbol original deja de existir — sus nodos quedan repartidos entre los
dos pedazos, sin copiar ninguno.

Tiene una **precondición** que el pseudocódigo declara en su primera línea:
ya se ejecutó
[`Buscar(k)`](/structures/splay-tree/operations/search) (#15). Sin esa
precondición la operación es sencillamente incorrecta: partiría el árbol por
donde esté la raíz, no por `k`.

## Intuición

Toda la operación es la respuesta a una pregunta del profesor: "Tras
Buscar(k), la raíz r ya cumple: uno de sus dos subárboles es todo menor o
igual que k y el otro todo mayor. ¿Cuántas comparaciones más hacen falta
para partirlo?" (#16).

**Ninguna.** El recorrido que haría falta para separar ya se pagó — lo pagó
`Buscar`, que además dejó la frontera exacta en la raíz. Lo único que falta
es mirar de qué lado quedó `r` y soltar un puntero.

Es la operación más barata de las cinco y la que mejor ilustra la tesis del
tema (#12): no hay ningún recorrido extra del árbol porque no hace falta
ninguno.

## Algoritmo

1. Si la raíz es `NULO`, devolver `(NULO, NULO)` — no hay nada que partir.
2. `r ← raiz`.
3. Comparar `r.valor` contra `k` — la única comparación de la operación.
4. Si `r.valor ≤ k`: `r` va al lado izquierdo. `I ← r`, `D ← r.der`, y se
   corta `r.der ← NULO`.
5. Si no: `r` va al lado derecho. `D ← r`, `I ← r.izq`, y se corta
   `r.izq ← NULO`.
6. Devolver `(I, D)`.

## Pseudocódigo

```
Algoritmo: Separar(k)
// Precondición: ya se ejecutó Buscar(k)
si raiz = NULO entonces
    devolver (NULO, NULO)
r ← raiz
si r.valor ≤ k entonces
    I ← r,  D ← r.der,  r.der ← NULO
en otro caso
    D ← r,  I ← r.izq,  r.izq ← NULO
devolver (I, D)
```

## C++

Ver `step-2-split.cpp` y `full-implementation.cpp` en el editor de arriba.
`split(root, k)` devuelve un `std::pair<Node*, Node*>` y deja `root` en
`nullptr`: el árbol original se consumió, y dejarlo apuntando a medio árbol
sería una fuente de errores. El pseudocódigo no gestiona punteros al padre;
la implementación sí tiene que poner en `nullptr` el del subárbol que se
desprende, porque
[`splay`](/structures/splay-tree/operations/splay) los usa para subir.

## Complejidad temporal

$O(1)$ **adicional**, costo real (no amortizado): una comparación y una
asignación de puntero, sin importar el tamaño de `L` ni de `R` (#16).

La palabra "adicional" es esencial. El costo total de *partir el árbol por
una llave k* es el de `Buscar(k)` — que en real puede ser $O(n)$ y en
amortizado es $O(\log n)$ por [access-lemma](/structures/access-lemma). Lo
que es constante es lo que `Separar` añade **encima** de ese `Buscar`. Por
eso el conteo del #20 le asigna **cero llamadas propias a Splay**: reutiliza
la que ya hizo `Buscar`.

## Complejidad espacial

$O(1)$ adicional: dos variables locales (`I`, `D`) y ningún nodo nuevo. Los
dos árboles resultantes están hechos de los mismos nodos del original.

## Ejemplo

Ver [examples.md](/structures/splay-tree-adt/examples).

## Casos límite

- **Árbol vacío**: `raiz = NULO` ⇒ `(NULO, NULO)`. Es la primera línea del
  pseudocódigo (#15), y existe porque `Insertar` sobre un árbol vacío llega
  a `Separar` con la raíz en nulo.
- **Un solo nodo**: uno de los dos resultados es el nodo y el otro es `NULO`.
  Cuál de los dos depende de la comparación: con `k` mayor o igual que el
  valor del nodo, `D = NULO`; con `k` menor, `I = NULO`.
- **`k` no está en el árbol**: es el caso normal, no una excepción — es
  exactamente el que usa [`insert`](/structures/splay-tree-adt/operations/insert).
  La raíz es el predecesor o el sucesor de `k` (#14) y la comparación
  `r.valor ≤ k` resuelve los dos por igual.
- **`k` es la llave máxima del árbol**: tras `Buscar(k)`, `k` es la raíz y
  `k.der = NULO`, así que `D` sale vacío. Correcto: no hay ninguna llave
  mayor que `k`.
- **Se llama sin haber hecho `Buscar(k)`**: no falla, pero parte el árbol
  por la raíz que hubiera, no por `k`. La precondición no es un adorno del
  pseudocódigo.
