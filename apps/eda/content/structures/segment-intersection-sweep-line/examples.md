---
kind: examples
title: Ejemplos
---

Ninguno de estos ejemplos numéricos aparece en las diapositivas — el
material describe el barrido sólo en prosa (#34-38, #40-51), sin
pseudocódigo ni cifras. Todos están *derivados de esa descripción textual;
no aparecen en las diapositivas*.

## Mínimo

*(derivado de la descripción textual; no aparece en las diapositivas)*

Un segmento horizontal H1 en `[x=1..3, y=2]` y un segmento vertical V1 en
`[x=2, y=0..4]`.

- Barrido en x=1: se activa H1 (antes de procesar x=1, #34). Activos: {y=2}.
- Barrido en x=2: se procesa V1. `RSQ(0, 4)` sobre activos = 1 → V1 aporta
  1 intersección (cruza a H1).
- Barrido en x=3: se desactiva H1 (después de procesar x=3, #34). Activos: {}.

Resultado: 1 intersección total. Es el caso más pequeño donde
activación → conteo → desactivación ocurren en ese orden completo.

## Normal

*(derivado de la descripción textual; no aparece en las diapositivas)*

Dos segmentos horizontales H1 `[x=1..6, y=3]` y H2 `[x=4..7, y=5]`, y un
segmento vertical V1 `[x=4, y=0..5]` (el mismo trazado del diagrama en
`theory.md`).

- x=1: activa H1. Activos: {y=3}.
- x=4: activa H2 (antes de procesar x=4). Activos: {y=3, y=5}. Se procesa
  V1: `RSQ(0, 5)` = 2 → V1 cruza tanto a H1 como a H2.
- x=6: desactiva H1 (después de procesar x=6). Activos: {y=5}.
- x=7: desactiva H2. Activos: {}.

Resultado: V1 aporta 2 intersecciones — el ejemplo que
[intersection-count](/structures/segment-intersection-sweep-line/operations/intersection-count)
referencia.

## Límite

*(derivado de la descripción textual; no aparece en las diapositivas)*

Caso general con dos segmentos oblicuos que se cruzan entre sí: S1 va de
`(0,0)` a `(4,4)` y S2 de `(0,4)` a `(4,0)`. En x=0, S1 está más abajo
(y=0) y S2 más arriba (y=4): el orden en la
[balanced-bst](/structures/balanced-bst) de
[crossing-order](/structures/segment-intersection-sweep-line/operations/crossing-order)
es `[S1, S2]`. En x=4, sus alturas se invirtieron (S1 en y=4, S2 en y=0): el
orden pasa a `[S2, S1]`. En algún punto intermedio (x=2, donde ambos valen
y=2) el orden se invierte — ahí es donde se cruzan, y es exactamente el
tipo de intersección que el caso simple excluye por regla (#29): no es
horizontal-vertical, es oblicuo-oblicuo.

Consulta online sobre este mismo barrido: si se guardó una versión
persistente de la BBST en cada evento (ver
[persistent-online-query](/structures/segment-intersection-sweep-line/operations/persistent-online-query)),
consultar "¿cuál era el orden de cruces en x=1?" devuelve `[S1, S2]` sin
necesidad de rehacer el barrido — la versión guardada en ese instante ya
tiene la respuesta. Es el caso que hace evidente por qué el caso general
online ($O(\log n)$ por consulta, #51) es estrictamente más útil que el
offline ($O((n+q) \log n)$ total, #47) cuando no se conocen las consultas de
antemano.
