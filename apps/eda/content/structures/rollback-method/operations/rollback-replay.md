---
kind: operation
title: "Deshacer y rehacer (rollback-replay)"
order: 1
cppSteps:
  - step-1-log-structure.cpp
  - step-2-naive-recompute.cpp
  - step-3-rollback-replay.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  steps:
    - note: >-
        Log real (ejemplo "Normal" de examples.md): cuatro operaciones sobre
        un contador. Se quiere Insert(t=2.5, +4).
      caption: "contador = 14"
      nodes:
        - { id: t1, value: "+5", parent: null }
        - { id: t2, value: "-2", parent: t1 }
        - { id: t3, value: "+10", parent: t2 }
        - { id: t4, value: "+1", parent: t3 }
    - note: >-
        r = 2 operaciones caen después de t = 2.5 (t3, t4). Se deshacen en
        orden inverso: primero t4, luego t3 — es lo único que puede haber
        cambiado.
      caption: "deshacer t4, t3 → contador = 3"
      highlight: ["t4", "t3"]
      nodes:
        - { id: t1, value: "+5", parent: null }
        - { id: t2, value: "-2", parent: t1 }
        - { id: t3, value: "+10", parent: t2, state: marked }
        - { id: t4, value: "+1", parent: t3, state: marked }
    - note: >-
        Con la estructura rebobinada hasta justo antes de t = 2.5, se aplica
        el cambio pedido.
      caption: "aplicar +4 → contador = 7"
      highlight: ["t25"]
      nodes:
        - { id: t1, value: "+5", parent: null }
        - { id: t2, value: "-2", parent: t1 }
        - { id: t25, value: "+4", parent: t2, state: active }
    - note: >-
        Se rehacen t3 y t4 en orden — nada cambió su efecto porque ninguna
        depende del valor exacto de la anterior, sólo del orden. Costo de
        este Insert: r=2 operaciones deshechas + 1 aplicada + 2 rehechas =
        5 operaciones tocadas. Es el caso BARATO: t=2.5 está cerca del
        presente, r es chico.
      caption: "caso barato (t=2.5, cerca del presente): contador = 18, r=2"
      highlight: ["t3", "t4"]
      nodes:
        - { id: t1, value: "+5", parent: null }
        - { id: t2, value: "-2", parent: t1 }
        - { id: t25, value: "+4", parent: t2, state: active }
        - { id: t3, value: "+10", parent: t25, state: active }
        - { id: t4, value: "+1", parent: t3, state: active }
    - note: >-
        Ahora se pide Insert(t=0.5, +100) — ANTES de las cuatro operaciones
        originales, no entre ellas. El log completo (t1..t4, más el +4 ya
        insertado en t2.5) queda todo por delante del punto de inserción:
        esta vez r=5, todas las operaciones posteriores a t=0.5.
      caption: "caso caro (t=0.5, todo el log por delante): se pide Insert(+100)"
      highlight: ["t05"]
      nodes:
        - { id: t05, value: "+100", parent: null, state: marked }
        - { id: t1, value: "+5", parent: t05 }
        - { id: t2, value: "-2", parent: t1 }
        - { id: t25, value: "+4", parent: t2 }
        - { id: t3, value: "+10", parent: t25 }
        - { id: t4, value: "+1", parent: t3 }
    - note: >-
        Deshacer: se rebobina TODO el log en orden inverso — t4, t3, t2.5,
        t2, t1 — porque el punto de inserción cae antes de la primera
        operación real. No hay ningún atajo: rollback no sabe, sin
        recorrerlas, cuáles de esas operaciones "no dependían" del tramo
        que se va a modificar.
      caption: "deshacer t4, t3, t2.5, t2, t1 -> contador = 0"
      highlight: ["t4", "t3", "t25", "t2", "t1"]
      nodes:
        - { id: t05, value: "+100", parent: null }
        - { id: t1, value: "+5", parent: t05, state: marked }
        - { id: t2, value: "-2", parent: t1, state: marked }
        - { id: t25, value: "+4", parent: t2, state: marked }
        - { id: t3, value: "+10", parent: t25, state: marked }
        - { id: t4, value: "+1", parent: t3, state: marked }
    - note: >-
        Con la estructura completamente rebobinada (contador = 0, antes de
        toda operación), se aplica el cambio pedido: +100 en el nuevo
        primer instante.
      caption: "aplicar +100 -> contador = 100"
      highlight: ["t05"]
      nodes:
        - { id: t05, value: "+100", parent: null, state: active }
    - note: >-
        Se rehacen las cinco operaciones originales en orden — t1, t2,
        t2.5, t3, t4 — una por una, cada una pagando su costo individual
        de nuevo. Costo total de este Insert: r=5 deshechas + 1 aplicada +
        5 rehechas = 11 operaciones tocadas, más del doble que el caso
        barato de arriba con el mismo tamaño de log. El trabajo creció
        exactamente con qué tan atrás cayó t: r ≈ m cuando t está al
        principio, r pequeño cuando t está cerca del presente.
      caption: "caso caro (t=0.5): contador = 118, r=5 (vs. r=2 del caso barato)"
      highlight: ["t1", "t2", "t25", "t3", "t4"]
      nodes:
        - { id: t05, value: "+100", parent: null, state: active }
        - { id: t1, value: "+5", parent: t05, state: active }
        - { id: t2, value: "-2", parent: t1, state: active }
        - { id: t25, value: "+4", parent: t2, state: active }
        - { id: t3, value: "+10", parent: t25, state: active }
        - { id: t4, value: "+1", parent: t3, state: active }
---

## Qué hace

Implementa `Insert(t, op)` y `Delete(t)` retroactivos — insertar o eliminar
una operación en el tiempo `t` del [log de retroactividad](/structures/retroactivity) —
cuando la estructura no cumple ni conmutatividad ni invertibilidad
combinadas ni es un problema de búsqueda descomponible: el único recurso
genérico que queda.

## Intuición

No hay atajo: para que el cambio en `t` se refleje en el presente, hay que
"reproducir" de nuevo, en orden, todas las operaciones que ocurrieron
después de `t` — porque cualquiera de ellas pudo depender del estado que el
cambio en `t` acaba de alterar. Antes de poder reproducirlas, hay que
"rebobinar" la estructura hasta justo antes de `t`, deshaciendo esas mismas
operaciones en orden inverso.

## Algoritmo

Textual del profesor (páginas 39-40, diapositiva 18):

1. Guardar la secuencia completa de operaciones (el log).
2. Deshacer (rollback) todas las operaciones posteriores a `t`.
3. Aplicar el cambio (insertar `op` en `t`, o eliminar la operación que
   estaba en `t`).
4. Rehacerlas (replay) en orden.

Requiere que cada operación (y su inversa) sea $O(1)$ u $O(\lg n)$ —
cualquier estructura eficiente y reversible sirve.

## Pseudocódigo

```
Método de rollback (para Insert(t, op) o Delete(t)):
1. Guardamos la secuencia completa de operaciones (un log).
2. Deshacemos (rollback) todas las operaciones posteriores a t.
3. Aplicamos el cambio.
4. Las rehacemos en orden.

Requiere: que cada operación (y su inversa) sea O(1) u O(lg n)
          — cualquier estructura eficiente y reversible sirve.

Costo: O(r) × (costo de una operación individual),
       donde r = número de operaciones después de t.
```

## C++

Ver `step-3-rollback-replay.cpp` y `full-implementation.cpp` en el editor de
arriba. `full-implementation.cpp` cuenta explícitamente cuántas operaciones
se deshicieron/rehicieron por cada llamada — es la cifra que hace visible el
costo del método (ver [amortized-cost](/structures/rollback-method/operations/amortized-cost)).

## Complejidad temporal

$O(r)$ × (costo de una operación individual), con `r` = número de
operaciones posteriores a `t` en el log — deshacer `r`, aplicar 1, rehacer
`r`. Razonamiento completo en
[amortized-cost](/structures/rollback-method/operations/amortized-cost).

## Complejidad espacial

> **Nota de apoyo** (no está en las diapositivas): el profesor no cuantifica
> el espacio del log. Implícitamente hace falta guardar las `m` operaciones
> completas (y ser capaz de reconstruir/almacenar su inversa), es decir
> $O(m)$ operaciones guardadas, donde `m` es el tamaño total del log.

## Ejemplo

Ver [examples.md](/structures/rollback-method/examples) — el profesor no
trae valores concretos en esta sección; los ejemplos ahí están derivados y
marcados como tales.

## Casos límite

- **`t` cerca del presente**: `r` es pequeño, el método es barato (página
  42).
- **`t` muy atrás en la historia**: `r ≈ m` (el tamaño completo del log), tan
  caro como rehacer toda la secuencia desde cero (página 42).
- **No lo menciona el profesor**: qué pasa si `t` cae en un tiempo ya
  ocupado por otra operación, ni qué pasa si alguna operación en el rango a
  rehacer no es invertible — el método simplemente deja de aplicar, pero el
  mazo no lo dice explícitamente.
