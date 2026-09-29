---
kind: operation
title: Extract-Min
order: 5
cppSteps:
  - step-1-node.cpp
  - step-2-structure.cpp
  - step-3-binomial-link.cpp
  - step-4-find-min.cpp
  - step-5-union.cpp
  - step-6-insert.cpp
  - step-7-extract-min.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Montículo inicial H: dos raíces, un B2 (raíz 3, mínimo de todo H)
        y un B0 suelto (50). La raíz 3 es el mínimo: la marcamos porque es
        el nodo que Extract-Min va a quitar.
      highlight: ["x"]
      nodes:
        - { id: x, value: 3, tag: x, parent: null, state: active }
        - { id: c1, value: 8, parent: x }
        - { id: d1, value: 15, parent: c1 }
        - { id: c0, value: 20, parent: x }
        - { id: r50, value: 50, parent: null }
    - note: >-
        Se quita x=3 de la lista de raíces de H (Extract-Min devuelve ese
        valor). Sus dos hijos, 8-con-hijo-15 y 20, quedan sueltos —ya no
        cuelgan de nadie— mientras 50 sigue como raíz de H sin cambios.
      highlight: []
      nodes:
        - { id: c1, value: 8, parent: null }
        - { id: d1, value: 15, parent: c1 }
        - { id: c0, value: 20, parent: null }
        - { id: r50, value: 50, parent: null }
    - note: >-
        Binomial-Link siempre engancha el hijo nuevo al frente: por eso la
        lista de hijos de x quedó en orden de grado DESCENDENTE — primero
        8 (grado 1, con su propio hijo 15), después 20 (grado 0). 50 sigue
        ahí, aparte, sin tocar — no participa de este reordenamiento.
      highlight: ["c1", "c0"]
      nodes:
        - { id: c1, value: 8, parent: null }
        - { id: d1, value: 15, parent: c1 }
        - { id: c0, value: 20, parent: null }
        - { id: r50, value: 50, parent: null, state: muted }
    - note: >-
        Se invierte esa lista antes de tratarla como raíces de H': ahora
        queda en orden ASCENDENTE — primero 20 (grado 0), después 8 (grado
        1). Ningún puntero padre-hijo cambia, sólo el orden de la lista de
        raíces con la que se va a construir H'. 50 sigue sin tocar.
      highlight: ["c0", "c1"]
      nodes:
        - { id: c0, value: 20, parent: null }
        - { id: c1, value: 8, parent: null }
        - { id: d1, value: 15, parent: c1 }
        - { id: r50, value: 50, parent: null, state: muted }
    - note: >-
        H' = {20 (B0), 8-con-hijo-15 (B1)}, ya en orden ascendente. Lo que
        queda de H es sólo {50 (B0)}. A partir de aquí, Extract-Min hace
        H ← Union(H, H') — mismo mecanismo grado por grado que en
        [Union](/structures/binomial-heap/operations/union), no se repite
        aquí.
      highlight: []
      nodes:
        - { id: r50, value: 50, parent: null }
        - { id: c0, value: 20, parent: null }
        - { id: c1, value: 8, parent: null }
        - { id: d1, value: 15, parent: c1 }
    - note: >-
        Union, grado 0: dos árboles (50 y 20), se enlazan ya. 20 gana
        (20 < 50): nace un B1 con raíz 20 e hijo 50 — el acarreo hacia el
        grado 1.
      highlight: ["c0", "r50"]
      nodes:
        - { id: c0, value: 20, parent: null, state: active }
        - { id: r50, value: 50, parent: c0, state: active }
        - { id: c1, value: 8, parent: null }
        - { id: d1, value: 15, parent: c1 }
    - note: >-
        Union, grado 1: dos árboles (el acarreo 20-con-hijo-50, y el
        8-con-hijo-15 original), se enlazan. 8 gana (8 < 20): 20 se vuelve
        su nuevo hijo, al frente de la lista — 8 queda con hijos [20, 15],
        en ese orden.
      highlight: ["c1", "c0"]
      nodes:
        - { id: c1, value: 8, parent: null, state: active }
        - { id: c0, value: 20, parent: c1, state: active }
        - { id: r50, value: 50, parent: c0 }
        - { id: d1, value: 15, parent: c1 }
    - note: >-
        Estado final: un único árbol, B2 con raíz 8, hijos 20 (que a su
        vez tiene a 50 como hijo) y 15. Los 5 nodos de H, menos la raíz
        mínima extraída (3), quedaron reorganizados en esta sola forma.
      highlight: []
      nodes:
        - { id: c1, value: 8, parent: null }
        - { id: c0, value: 20, parent: c1 }
        - { id: r50, value: 50, parent: c0 }
        - { id: d1, value: 15, parent: c1 }
---

## Qué hace

Quita y devuelve el nodo con la menor llave de todo el montículo.

## Intuición

La raíz mínima desaparece, pero sus hijos ya son, cada uno, la raíz de un
árbol binomial válido más pequeño (un $B_k$ sin su raíz se descompone en un
$B_0, B_1, \ldots, B_{k-1}$, exactamente uno de cada orden menor). Esos hijos
forman por sí solos un montículo binomial nuevo, y basta unirlo
([Union](/structures/binomial-heap/operations/union)) de vuelta con lo que
quedó del montículo original.

## Algoritmo

1. Encontrar la raíz `x` con la menor llave (Find-Min), recorriendo la
   lista de raíces.
2. Quitar `x` de la lista de raíces de `H`.
3. Construir `H'`, un montículo binomial cuya lista de raíces son los
   hijos de `x`.
4. `H ← Union(H, H')`.

## Pseudocódigo

```
Algoritmo 9: Extract-Min(H)
Encontrar la raíz x con menor llave, recorriendo la lista de raíces ;
Quitar x de la lista de raíces de H ;
H' ← montículo binomial con los hijos de x como su lista de raíces ;
H ← Union(H, H') ;
devolver x ;
```

## C++

Ver `cpp/structures/binomial-heap/step-7-extract-min.cpp`: `extractMin`
localiza el mínimo con `findMin`, lo desengancha de la lista de raíces,
invierte la lista de sus hijos (Binomial-Link siempre inserta el hijo más
nuevo al frente, así que la lista de hijos queda en orden de grado
descendente y hay que invertirla antes de tratarla como raíces de `H'`), y
llama `heapUnion`.

## Complejidad temporal

$O(\lg n)$. Encontrar el mínimo recorre a lo mucho $\lfloor \lg n \rfloor + 1$
raíces: $O(\lg n)$. Los hijos de la raíz mínima son a lo mucho $\lg n$
nuevas raíces (un $B_k$ tiene hijos $B_0, \ldots, B_{k-1}$, y
$k = O(\lg n)$), y Union entre `H` y `H'` cuesta, a su vez, $O(\lg n)$.
Sumando los dos términos: $O(\lg n)$.

## Complejidad espacial

$O(1)$ adicional: no se copian nodos, sólo se reconecta la lista de hijos
de la raíz extraída como la nueva lista de raíces de `H'`.

## Ejemplo

*(Derivado a mano; el mazo no trae esta traza. Se eligió un montículo con un
grado 2 en vez de reusar el de* [Insert](/structures/binomial-heap/operations/insert)
*porque con un solo hijo no se aprecia la inversión de la lista de hijos —
hace falta al menos un $B_k$ con $k \ge 2$ para ver más de un hijo cambiando
de orden.)*

`H` tiene 5 nodos y dos raíces: un $B_2$ (raíz 3, hijos 8 —que a su vez tiene
hijo 15— y 20) y un $B_0$ suelto (50). Extract-Min encuentra el mínimo (3, la
raíz del $B_2$) y lo quita: sus dos hijos, 8-con-hijo-15 y 20, quedan sueltos.
Binomial-Link siempre engancha el hijo nuevo al frente, así que esa lista
llegó en orden de grado descendente (8 primero, 20 después); invertirla la
deja en orden ascendente (20, luego 8), que es como Extract-Min construye
`H'` = `{20 (B0), 8-con-hijo-15 (B1)}`. Lo que queda de `H` es `{50 (B0)}`.

`Union(H, H')` procesa grado 0 (50 y 20 se enlazan: 20 gana, nace un $B_1$
raíz 20 hijo 50) y luego grado 1 (ese $B_1$ recién nacido contra el
8-con-hijo-15 original: 8 gana, 20 se vuelve su nuevo primer hijo). Resultado
final: un solo árbol, $B_2$ con raíz 8, hijos 20 (con hijo 50) y 15.

## Casos límite

- Si la raíz mínima no tiene hijos (es un $B_0$), `H'` queda vacío y
  `Union(H, ∅)` simplemente devuelve `H` sin la raíz extraída. El mazo no
  comenta este caso, pero el pseudocódigo lo cubre sin necesitar un `si`
  aparte.
- Si `H` tiene un solo nodo, tras extraerlo `H` queda vacío.
- Montículo vacío de entrada: no hay mínimo que extraer; el mazo no lo
  discute (en la implementación, se devuelve "no hay nada que extraer").
