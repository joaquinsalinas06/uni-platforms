---
kind: operation
title: Decrease-Key
order: 5
cppSteps:
  - step-1-node.cpp
  - step-2-structure.cpp
  - step-3-insert-union.cpp
  - step-4-cut-cascading.cpp
  - step-5-decrease-key.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Estado inicial *(derivado del pseudocódigo; no aparece así en las
        diapositivas)*: `g(5)` es raíz y actual `min(H)`, `p(10)` es su
        hijo y ya está marcado (perdió un hijo antes), `y(15)` es hijo de
        `p`. Se va a llamar Decrease-Key(H, y, 2).
      highlight: ["y"]
      nodes:
        - { id: g, value: 5, parent: null }
        - { id: p, value: 10, parent: g, state: marked }
        - { id: y, value: 15, parent: p, state: active }
    - note: >-
        Paso 1: `llave(y) ← 2`. Ahora `llave(y)=2 < llave(p)=10`: se
        rompió el invariante de montículo mínimo entre `y` y su padre.
        A diferencia de un montículo binario, aquí NO se burbujea `y`
        hacia arriba intercambiando con `p` — eso costaría recorrer el
        árbol; en su lugar se va a cortar.
      highlight: ["y", "p"]
      nodes:
        - { id: g, value: 5, parent: null }
        - { id: p, value: 10, parent: g, state: marked }
        - { id: y, value: 2, parent: p, state: active }
    - note: >-
        Cut(H, y, p): `y` se separa de `p` y se agrega como raíz nueva,
        sin marca. grado(p) baja en 1. Este corte es O(1): sólo empalme
        de punteros, sin importar cuán abajo estuviera `y`.
      highlight: ["y", "p"]
      nodes:
        - { id: g, value: 5, parent: null }
        - { id: p, value: 10, parent: g, state: marked }
        - { id: y, value: 2, parent: null, state: active }
    - note: >-
        Cascading-Cut(H, p): como `p` YA estaba marcado, no basta con
        marcarlo de nuevo — perdió su segundo hijo (a `y`), así que se
        corta él mismo, y la cascada sube hacia su padre, `g`.
      highlight: ["p"]
      nodes:
        - { id: g, value: 5, parent: null }
        - { id: p, value: 10, parent: g, state: active }
        - { id: y, value: 2, parent: null }
    - note: >-
        Cut(H, p, g): `p` se separa de `g` y se agrega como raíz, sin
        marca. Cascading-Cut(H, g): `g` no tiene padre (es raíz), así que
        la cascada se detiene aquí sin marcarlo. `c=2` cortes reales en
        esta cascada.
      highlight: ["p", "g"]
      nodes:
        - { id: g, value: 5, parent: null, state: active }
        - { id: p, value: 10, parent: null }
        - { id: y, value: 2, parent: null }
    - note: >-
        Paso final del algoritmo: como `llave(y)=2 < llave(min(H))=5`,
        se actualiza `min(H) ← y`. Quedan tres raíces sueltas — `y(2)`,
        `p(10)`, `g(5)` — ninguna marcada, y el nuevo mínimo es `y`. El
        costo real fue `O(c)=O(2)`, pero el potencial cayó lo suficiente
        (dos nodos desmarcados) para que el amortizado siga siendo `O(1)`.
      highlight: ["y"]
      nodes:
        - { id: g, value: 5, parent: null }
        - { id: p, value: 10, parent: null }
        - { id: y, value: 2, parent: null, state: answer }
---

## Qué hace

Baja la llave de un nodo `x` a un valor `k`, y si eso rompe el invariante
de montículo mínimo con su padre, lo corta y dispara la regla de las
marcas hacia arriba.

## Intuición

Si `x` no tiene padre, o su nueva llave sigue siendo mayor o igual que la
de su padre, no hay nada más que hacer: el invariante local sigue válido.
Pero si `x` se vuelve menor que su padre, no se puede simplemente
"burbujear" hacia arriba como en un montículo binario — eso costaría
$O(\text{altura del árbol})$, que puede ser grande. En cambio, `x` se corta de
inmediato ([Cut](/structures/fibonacci-heap/operations/cut), $O(1)$) y se
convierte en su propia raíz; la regla de las marcas
([Cascading-Cut](/structures/fibonacci-heap/operations/cascading-cut))
se encarga de mantener acotado cuánto se puede desordenar el árbol del
padre por este corte.

## Algoritmo

1. `llave(x) ← k`.
2. `p ← padre(x)`.
3. Si `p ≠ nulo` y `llave(x) < llave(p)`: `Cut(H, x, p)` y
   `Cascading-Cut(H, p)`.
4. Si `llave(x) < llave(min(H))`: `min(H) ← x`.

## Pseudocódigo

```
Algoritmo 12: Decrease-Key(H, x, k)
llave(x) ← k ;
p ← padre(x) ;
si p ≠ nulo y llave(x) < llave(p) entonces
    Cut(H, x, p) ;
    Cascading-Cut(H, p) ;
si llave(x) < llave(min(H)) entonces
     min(H) ← x ;
```

## C++

Ver `step-5-decrease-key.cpp` y `full-implementation.cpp` en el editor de
arriba. La implementación rechaza explícitamente `k > llave(x)`: el
pseudocódigo del profesor asignaría la llave igual, rompiendo en silencio
el invariante de montículo mínimo (caso que el mazo no comenta).

## Complejidad temporal

Si esta llamada provoca `c` cortes, su costo real es $O(c)$: cada Cut hace
trabajo constante. Su costo amortizado es $O(1)$; las marcas que se eliminan
en una cascada pagan los cortes adicionales.

La demostración paso a paso —origen de $+c$, $-2(c-1)$ y $+2$, más el caso
numérico `c=3`— está en
[El método del potencial](/structures/potential-method#análisis-de-complejidad).

## Complejidad espacial

$O(c)$ de pila de recursión dentro de `Cascading-Cut` (o $O(1)$ con una
versión iterativa).

## Ejemplo

### Dos casos antes de pensar en una cascada

Si bajar una llave no la hace menor que su padre, no se corta nada:

```text
      2                 2
     /                 /
    8       8 → 5      5
```

En cambio, si la nueva llave viola el invariante de montículo mínimo, el
nodo se convierte en raíz:

```text
      2                 2       1
     /       8 → 1              ↑
    8                         min(H)
```

El primer dibujo tiene costo real `O(1)` porque sólo cambia una llave. El
segundo puede activar más cortes; si hay `c` cortes, su costo real es
`O(c)`, aunque su costo amortizado se analiza como `O(1)`.

> **Duda frecuente: ¿por qué cortar en vez de intercambiar?** El material
> conserva la llave del nodo y lo vuelve raíz; así evita recorrer el camino
> hacia arriba. Las marcas controlan el desorden que ese corte deja atrás.

*(Derivado del pseudocódigo; no aparece en las diapositivas.)* Sobre el
mismo escenario `G → P → C` de la visualización de
[Cascading-Cut](/structures/fibonacci-heap/operations/cascading-cut), con
`P` ya marcado: `Decrease-Key(H, C, k)` con `k` menor que `llave(P)`
dispara `Cut(H, C, P)` y luego `Cascading-Cut(H, P)`, que al encontrar a
`P` ya marcado también lo corta y sube hasta `G`, deteniéndose ahí. Si
además `k < llave(min(H))`, el propio `C` se vuelve el nuevo mínimo.

## Casos límite

- **La llave baja, pero no rompe con el padre**. De `2` con hijo `8`,
  `Decrease-Key(8, 5)` deja `5 > 2`. `5` sigue siendo hijo: no hay Cut ni
  Cascading-Cut.
- **La llave queda menor que el padre**. En el mismo árbol,
  `Decrease-Key(8, 1)` deja temporalmente `1 < 2`. Se viola el orden de
  min-heap, así que `Cut(1, 2)` mueve `1` a la lista de raíces.
- **`x` ya es una raíz** (`p = nulo`). Entre `5    8    10`, bajar `8` a
  `2` no puede romper una relación con padre: sólo cambia la llave y
  `min(H)` pasa a `2`.
- **$c = 0$ cortes** (el caso anterior): el costo real es $O(1)$, y el
  amortizado sigue siendo $O(1)$ — el análisis de potencial cubre ambos
  extremos con la misma fórmula.
- **`k > llave(x)`**. No es una petición válida para Decrease-Key: la
  nueva llave debe ser menor o igual a la actual. El código del editor la
  rechaza antes de modificar el nodo.
