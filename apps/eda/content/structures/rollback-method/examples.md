---
kind: examples
title: Ejemplos
---

<!-- El profesor no trae ningún ejemplo numérico en esta sección (páginas
     38-44): "ninguno. Ni una estructura concreta, ni una secuencia, ni la
     familia de instancias que realizaría la cota inferior Ω(r)." Los tres
     ejemplos siguientes están derivados ejecutando a mano el método sobre
     una estructura mínima (un contador con historial de sumas), y marcados
     como tales. -->

## Mínimo

*(derivado del pseudocódigo; no aparece en las diapositivas)*

Log con una sola operación: `[(t=1, +5)]`, contador en 5. Insertar
`Insert(t=2, +3)` — en el presente, después de la única operación existente.

- `r = 0`: no hay ninguna operación posterior a `t=2` que deshacer.
- Deshacer: nada. Aplicar: contador `5 + 3 = 8`. Rehacer: nada.
- Costo: $O(0)$ × (costo de una operación) — el caso más barato posible, y
  el que ilustra por qué "si `t` está muy cerca del presente, el método es
  barato".

## Normal

*(derivado del pseudocódigo; no aparece en las diapositivas)*

Log con cuatro operaciones, en orden: `[(t=1, +5), (t=2, −2), (t=3, +10),
(t=4, +1)]`. Contador final: `5 − 2 + 10 + 1 = 14`.

`Insert(t=2.5, +4)` (un tiempo entre la segunda y la tercera operación,
como el `t = 2,5` fraccionario que usa el material de retroactividad):

1. Operaciones posteriores a `t=2.5`: `(t=3, +10)` y `(t=4, +1)` → `r = 2`.
2. Deshacer, en orden inverso: contador `14 − 1 = 13`, luego `13 − 10 = 3`
   (queda como estaba justo después de `(t=2, −2)`).
3. Aplicar el cambio: `3 + 4 = 7`.
4. Rehacer, en orden: `7 + 10 = 17`, luego `17 + 1 = 18`.
5. Costo: $O(2)$ × (costo de una operación) — se tocaron 2 operaciones de
   ida y 2 de vuelta, más la nueva.

## Límite

*(derivado del pseudocódigo; no aparece en las diapositivas)*

Mismo log de cuatro operaciones, pero ahora `Insert(t=0.5, +100)` —
**antes** de la primera operación existente:

1. Operaciones posteriores a `t=0.5`: las cuatro → `r = 4 = m` (todo el
   log).
2. Deshacer las cuatro en orden inverso, aplicar el cambio, rehacer las
   cuatro en orden.
3. Costo: $O(4)$ × (costo de una operación) — el caso patológico: "si `t`
   está muy atrás, `r ≈ m` y es tan caro como rehacerlo todo."

Contrastando este caso con el "Normal" de arriba sobre el mismo log (`r=2`
vs. `r=4`) se ve directamente la dependencia lineal en `r` que predice el
análisis de
[amortized-cost](/structures/rollback-method/operations/amortized-cost).
Ninguna estructura arregla este caso dentro del propio método de rollback —
para eso existen las técnicas especializadas, como la de
[retroactive-priority-queue](/structures/retroactive-priority-queue), que
rompen la barrera $O(r)$ explotando propiedades específicas del problema.
