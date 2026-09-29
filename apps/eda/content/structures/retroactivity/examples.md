---
kind: examples
title: Ejemplos
---

<!-- El mazo no trae ningún ejemplo numérico en esta sección (páginas 8-20):
     el único "ejemplo" es la narrativa "olvidaste una operación". Los tres
     casos de abajo son *derivados del modelo* (Insert(t, op)/Delete(t)/
     Query(t, op)) sobre una estructura mínima — un contador acumulado por
     `add(x)` — para hacerlo tangible; ninguno aparece en las diapositivas. -->

## Mínimo

*(derivado del modelo; no aparece en las diapositivas)*

Línea de tiempo vacía. `Insert-retroactive(1, add(5))` agrega una única
operación en `t = 1`. `Query(ahora)` recorre la línea de tiempo (una sola
entrada) y responde `5`. No hay nada que rehacer porque no hay nada antes
ni después de `t = 1`.

## Normal

*(derivado del modelo; no aparece en las diapositivas)*

Línea de tiempo con tres operaciones: `add(5)@1`, `add(3)@2`, `add(10)@3`.
`Query(ahora)` = `18`.

Ahora se inserta retroactivamente `add(100)` en `t = 1.5` — entre la
primera y la segunda operación:

```
antes:   add(5)@1        add(3)@2   add(10)@3
después: add(5)@1  add(100)@1.5  add(3)@2   add(10)@3
```

`Query(ahora)` pasa de `18` a `118`. No se creó una "versión anterior"
consultable con el `18` original: sólo hay una línea de tiempo, y el
presente refleja el cambio como si `add(100)` siempre hubiera estado ahí —
la diferencia con [persistencia](/structures/persistence-levels), que sí
dejaría esa versión intacta y consultable en paralelo.

## Límite

*(derivado del modelo; no aparece en las diapositivas)*

Sobre la misma línea de tiempo (`add(5)@1`, `add(100)@1.5`, `add(3)@2`,
`add(10)@3`), se aplica `Delete-retroactive(1)`: se borra la operación más
antigua. La versión ingenua debe rehacer **las tres operaciones restantes**
desde `t = 1.5` en adelante para que `Query(ahora)` pase de `118` a `113`.

Éste es el caso patológico que motiva el resto de la semana: borrar (o
insertar) cerca del principio de una línea de tiempo larga fuerza a
rehacer casi toda la secuencia, el costo $O(m)$ completo. Las estructuras
que arreglan esto — sin cambiar la interfaz Insert/Delete/Query — son
[retroactividad conmutativa e invertible](/structures/commutative-invertible-retroactivity),
[problemas de búsqueda descomponibles](/structures/decomposable-search-problem)
y el [método de rollback](/structures/rollback-method).
