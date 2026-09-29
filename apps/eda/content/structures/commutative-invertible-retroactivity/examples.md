---
kind: examples
title: Ejemplos
---

<!--
El mazo (páginas 27-28) da dos ejemplos de CLASE de operación (tabla hash,
arreglo con +=), sin traza numérica. Los números concretos de abajo son
derivados del pseudocódigo, marcados como tal.
-->

## Mínimo

**Arreglo con `A[i] += Δ`** (páginas 27-28): el ejemplo más simple donde
conmutatividad e invertibilidad son evidentes.

*(derivado del pseudocódigo; no aparece en las diapositivas)*: acumulador
`A[3] = 0`. Historial real: `Add(3, +4)` en t=1 (queda `A[3]=4`). Se quiere
insertar retroactivamente `Add(3, +2)` en t=0 (antes de t=1).

- ¿Conmuta? Sí: sumar `+2` y sumar `+4` en cualquier orden da `A[3]=6`.
- Se aplica `Insert(t=0, Add(3,+2)) ≡ Insert(ahora, Add(3,+2))`: `A[3] = 4 +
  2 = 6`. No se reprodujo `Add(3,+4)`.

## Normal

**Tabla hash con inserciones** (páginas 27-28): el ejemplo del profesor con
`Insert` y `Delete` retroactivos completos.

*(derivado del pseudocódigo; no aparece en las diapositivas)*: tabla hash
`H = {}`. Historial real: `Insert("b")` en t=1, `Insert("c")` en t=2 (queda
`H = {b, c}`).

1. **Insert retroactivo**: insertar `Insert("a")` en t=0 (antes de todo).
   Insertar una llave nueva conmuta con insertar cualquier otra llave
   distinta, así que `Insert(t=0, Insert("a")) ≡ Insert(ahora, Insert("a"))`:
   se aplica directamente sobre `H` → `H = {a, b, c}`. Costo: $O(1)$
   amortizado, el mismo que un `Insert` normal de tabla hash.
2. **Delete retroactivo**: ahora se decide borrar la operación que insertó
   `"a"` en t=0. Como `Insert("a")` es invertible (su inversa es
   `Delete("a")`), se resuelve como `Delete(t=0) ≡ Insert(ahora,
   Delete("a"))`: se aplica `Delete("a")` sobre `H` → `H = {b, c}`. Costo:
   el mismo $O(1)$ amortizado de un `Delete` normal.

En ningún paso se tocó ni se reprodujo el historial de `Insert("b")` /
`Insert("c")`: el efecto se logró operando siempre sobre la tabla presente.

## Límite

**Contraejemplo — una operación que NO conmuta.** El profesor no lo
desarrolla numéricamente, pero sí lo anuncia como el límite de esta técnica
(páginas 30-31, diapositiva 13): "la mayoría de las estructuras interesantes
… tienen operaciones que sí dependen del orden".

*(derivado del pseudocódigo; no aparece en las diapositivas)*: acumulador de
"último valor visto" con la operación `Assign(v)` (asigna, no suma). Estado
presente: dos operaciones reales, `Assign(5)` en t=1 y `Assign(9)` en t=2
(presente = 9, porque `Assign` sobrescribe).

- ¿Conmuta `Assign`? No: `Assign(5)` seguido de `Assign(9)` deja 9;
  `Assign(9)` seguido de `Assign(5)` deja 5. El orden cambia el resultado.
- Consecuencia: `Insert(t=0, Assign(3))` **no** puede resolverse como
  `Insert(ahora, Assign(3))`. Insertar `Assign(3)` *antes* de t=1 no
  necesariamente deja el mismo presente que insertarlo al final — de hecho,
  como `Assign` sobrescribe, insertarlo en cualquier punto antes de t=2 no
  cambia el presente en absoluto (t=2 sigue ganando), pero insertarlo
  *después* de t=2 sí lo cambiaría a 3. La posición temporal **sí importa**,
  así que la equivalencia central de esta técnica falla y no hay atajo:
  hace falta una técnica más general (ver
  [decomposable-search-problem](/structures/decomposable-search-problem) o
  [rollback-method](/structures/rollback-method)).

Un segundo contraejemplo, sobre invertibilidad: un acumulador de **máximo**
(`Max(v)`) sí conmuta ($\max(\max(a,b),c) = \max(a, \max(b,c))$, el orden de
aplicación no afecta el resultado final), pero **no es invertible**: una vez
que `Max(9)` sobrescribe el máximo anterior, ese valor anterior se pierde —
no existe `Max⁻¹` que lo reconstruya sin haberlo guardado aparte. Conmutar
sin ser invertible tampoco basta: sin inversa, `delete-retroactive` no tiene
forma de deshacer el efecto de la operación borrada.
