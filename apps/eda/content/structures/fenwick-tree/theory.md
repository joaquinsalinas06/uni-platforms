---
kind: theory
title: Fenwick tree
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        El arreglo de índices 1..8. Cada índice `i` no guarda un elemento
        suelto: guarda la suma de un rango que termina en `i`, cuyo tamaño
        es `lowbit(i) = i & (-i)`. Antes de tocar ningún índice en
        particular, este es el arreglo completo tal cual lo ve `tree[]`.
      mode: layers
      arrays:
        - { id: idx, label: i, row: 0, cells: [1, 2, 3, 4, 5, 6, 7, 8] }
    - note: >-
        `i=5` es `0101` en binario: su bit más bajo activado aísla
        `lowbit(5)=1`, así que sólo cubre el rango `(4,5]` — un solo
        elemento. `i=6` es `0110`: `lowbit(6)=2`, cubre `(4,6]`, dos
        elementos. `i=8` es `1000`: `lowbit(8)=8`, cubre `(0,8]`, el arreglo
        entero. A más ceros al final de `i`, más grande el rango que cubre.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, idle, marked, marked, idle, marked]
        - id: rng
          label: rango
          row: 1
          cells: ["4-5", "4-6", "0-8"]
          states: [marked, marked, marked]
      bridges:
        - { from: idx, fromIndex: 4, to: rng, toIndex: 0, active: true }
        - { from: idx, fromIndex: 5, to: rng, toIndex: 1, active: true }
        - { from: idx, fromIndex: 7, to: rng, toIndex: 2, active: true }
    - note: >-
        Salto de `update`, que sube con `i += lowbit(i)`. Desde `i=5`
        (`0101`), sumar `lowbit(5)=1` da `6` (`0110`): el bit `1` se apaga y
        el bit `2` se prende — subir siempre apaga al menos un bit y activa
        uno más alto, así que el rango que cubre el nuevo índice es
        estrictamente mayor y todavía incluye la posición original.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, idle, active, active, idle, idle]
      bridges:
        - { from: idx, fromIndex: 4, to: idx, toIndex: 5, active: true }
    - note: >-
        Segundo salto de `update`, desde `i=6` (`0110`): `lowbit(6)=2`,
        `6+2=8` (`1000`). Ambos bits bajos de `6` se apagan de un golpe y se
        prende el bit `8`: el próximo salto ya se sale de `[1,8]` y el
        ciclo termina. La cadena completa para `update(5)` es
        `5 → 6 → 8 → (16, fuera de rango)`.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, idle, muted, active, idle, active]
      bridges:
        - { from: idx, fromIndex: 4, to: idx, toIndex: 5, active: false }
        - { from: idx, fromIndex: 5, to: idx, toIndex: 7, active: true }
    - note: >-
        Salto de `prefix-query`, que baja con `i -= lowbit(i)` — la
        dirección opuesta. Desde `i=7` (`0111`), `lowbit(7)=1`, `7-1=6`
        (`0110`): se apaga sólo el bit más bajo. El rango `(6,7]` ya quedó
        sumado; ahora falta cubrir `[1,6]`.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, idle, idle, active, active, idle]
      bridges:
        - { from: idx, fromIndex: 6, to: idx, toIndex: 5, active: true }
    - note: >-
        Segundo y tercer salto de `prefix-query`: desde `i=6` (`0110`),
        `lowbit(6)=2`, baja a `4` (`0100`); desde `i=4`, `lowbit(4)=4`, baja
        a `0` y el ciclo termina. Cada salto apaga exactamente un bit, así
        que con `⌈lg 8⌉=3` bits activos como máximo el ciclo no puede durar
        más de 3 pasos. La cadena completa para `prefixQuery(7)` es
        `7 → 6 → 4 → 0`, sumando `tree[7] + tree[6] + tree[4]`.
      mode: layers
      arrays:
        - id: idx
          label: i
          row: 0
          cells: [1, 2, 3, 4, 5, 6, 7, 8]
          states: [idle, idle, idle, active, idle, muted, muted, idle]
      bridges:
        - { from: idx, fromIndex: 5, to: idx, toIndex: 3, active: true }
---

> **Concepto de apoyo, no material del curso.** El profesor lo nombra una
> sola vez, sin explicarlo: "usando un Segment tree o un Fenwick tree se
> puede resolver este caso especial en O(n lg n)"
> (`content/analysis/week-04-sem4-planar-point-location.md`, mención #38,
> caso simple del barrido de segmentos). `sourceSlides` está vacío en el
> knowledge map. Esta página es sólo lo necesario para entender esa mención
> al lado del [segment tree](/structures/segment-tree), no un tutorial
> completo de Fenwick trees. Todo lo que sigue es derivación estándar.

## ¿Qué problema resuelve?

Mantener un arreglo bajo `update` (sumar un valor a una posición) y
`prefix-query` (suma de `A[1..i]`) en $O(\lg n)$ ambas — el mismo problema que
resuelve el segment tree, pero restringido a sumas (o cualquier operación
invertible), a cambio de un arreglo auxiliar de tamaño `n` en vez de un
árbol de `2n-1` nodos.

Es exactamente lo que el caso simple del barrido de segmentos necesita
(#34-38): contar cuántas posiciones activas hay en un rango del sweep line
es una suma de indicadores 0/1, nada más.

## Intuición

Cada índice `i` no guarda un solo elemento: guarda la suma de un rango que
termina en `i`, cuyo tamaño lo determina el bit menos significativo de `i`
(`i & (-i)`, el "lowbit"). Ese truco es todo el mecanismo:

- `i & (-i)` aísla el bit `1` más bajo de `i` en binario.
- El rango que cubre el índice `i` tiene exactamente ese tamaño:
  `(i - lowbit(i), i]`.

Para `n = 8`:

```
i    binario   lowbit   rango que cubre
1    0001        1      (0,1]
2    0010        2      (0,2]
3    0011        1      (2,3]
4    0100        4      (0,4]
5    0101        1      (4,5]
6    0110        2      (4,6]
7    0111        1      (6,7]
8    1000        8      (0,8]
```

Como diagrama de barras (cada `#` es una posición cubierta):

```
i=1 #
i=2 ##
i=3   #
i=4 ####
i=5     #
i=6    ##
i=7      #
i=8 ########
```

`update(i)` sólo necesita tocar los índices que **incluyen** a `i` en su
rango — se llega a ellos subiendo con `i += lowbit(i)`. `prefix-query(i)`
necesita sumar los rangos que **cubren** `[1,i]` sin traslape — se llega a
ellos bajando con `i -= lowbit(i)`. Son la misma familia de saltos, en
direcciones opuestas.

## Estructura interna

Un arreglo `tree[1..n]` donde `tree[i] = suma(A[i - lowbit(i) + 1 .. i])`.
No hay nodos ni punteros: el árbol implícito en el nombre "Fenwick tree" está
codificado enteramente en la aritmética de bits sobre el índice.

## Operaciones

- [Update](/structures/fenwick-tree/operations/update) — suma un valor a la
  posición `i` y propaga el cambio a todos los índices cuyo rango la cubre.
- [Prefix query](/structures/fenwick-tree/operations/prefix-query) — suma
  `A[1..i]` combinando $O(\lg n)$ rangos ya precomputados.

## Análisis de complejidad

No hay estilo del profesor que seguir (no hay diapositivas). El argumento
estándar: tanto `i += lowbit(i)` como `i -= lowbit(i)` cambian el patrón de
bits de `i` de forma monótona (el primero apaga y sube al menos un bit; el
segundo apaga un bit) — con $\lg n$ bits en total, ninguno de los dos puede
repetirse más de $\lg n$ veces antes de salir del rango `[1,n]` o llegar a 0.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`; se omite `source` en cada entrada
porque no hay diapositiva que citar.

## Ejemplos

Ver [Ejemplos](/structures/fenwick-tree/examples).

## Comparación con estructuras relacionadas

| | Update | Prefix-query | Memoria | Restricción |
| --- | --- | --- | --- | --- |
| [Segment tree](/structures/segment-tree) | $O(\lg n)$ | $O(\lg n)$ | $O(n)$ (≈2n-1 nodos) | ninguna: cualquier función asociativa (suma, mínimo, máximo) |
| Fenwick tree | $O(\lg n)$ | $O(\lg n)$ | $O(n)$ (un arreglo) | sólo funciones **invertibles** (suma, XOR) |

Esto es exactamente por qué el profesor ofrece los dos como alternativas
para el caso simple del barrido (#38) y no en el caso general: ahí sólo se
necesita contar (sumar indicadores), así que el Fenwick tree alcanza con
menos código y menos memoria. Si la operación necesaria fuera mínimo o
máximo — como pasaría en otra variante del problema — el Fenwick tree no
serviría (no invertible: no hay forma de "restar" un mínimo) y el segment
tree sería la única opción de las dos.

## Prueba de dominio

Ver [Prueba de dominio](/structures/fenwick-tree/mastery-check).
