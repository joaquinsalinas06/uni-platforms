---
kind: operation
title: Delete-retroactive
order: 4
cppSteps:
  - step-1-timeline.cpp
  - step-2-bridge.cpp
  - step-3-compute-m.cpp
  - step-4-insert-retroactive.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  steps:
    - note: >-
        (Ejemplo derivado, no de las diapositivas — el profesor no da
        ninguno para Delete, ver más abajo). Mismo historial de
        Insert-retroactive: ins(5) t=1, ins(2) t=2, del-min t=3 (quita 2),
        ins(8) t=4, del-min t=5 (quita 5). Q_ahora = {8}. Se pide
        Delete-retroactive(t=2): borrar la operación ins(2).
      caption: "Q_ahora = {8}; borrar la operación en t=2"
      highlight: ["t2"]
      nodes:
        - { id: t1, value: "ins(5)", parent: null }
        - { id: t2, value: "ins(2)", parent: t1 }
        - { id: t3, value: "del-min -> quita 2", parent: t2 }
        - { id: t4, value: "ins(8)", parent: t3 }
        - { id: t5, value: "del-min -> quita 5", parent: t4 }
    - note: >-
        Primer paso, seguro para cualquier algoritmo posible: la operación
        en t=2 se saca de la línea de tiempo (se marca como eliminada
        lógicamente). Todo lo que viene después de t=2 quedó calculado
        contra un historial que ya no es válido y hay que rehacerlo — el
        mazo no dice CÓMO acotar ese trabajo (no hay puente para Delete en
        el material), así que aquí se rehace uno por uno, de adelante hacia
        atrás, por simetría con el argumento de Insert.
      caption: "ins(2) eliminada de la línea de tiempo"
      highlight: ["t2"]
      nodes:
        - { id: t1, value: "ins(5)", parent: null }
        - { id: t2, value: "ins(2) (eliminada)", parent: t1, state: muted }
        - { id: t3, value: "del-min -> quita 2", parent: t2 }
        - { id: t4, value: "ins(8)", parent: t3 }
        - { id: t5, value: "del-min -> quita 5", parent: t4 }
    - note: >-
        Se recalcula t=3 sin ins(2): justo antes de t=3 la cola sólo tiene
        {5} (ya no {5, 2}). El del-min de t=3 ahora quita 5 en vez de 2 —
        es el mínimo del nuevo estado.
      caption: "t=3 recalculado: del-min ahora quita 5 (antes quitaba 2)"
      highlight: ["t3"]
      nodes:
        - { id: t1, value: "ins(5)", parent: null }
        - { id: t2, value: "ins(2) (eliminada)", parent: t1, state: muted }
        - { id: t3, value: "del-min -> quita 5 (recalculado)", parent: t2, state: active }
        - { id: t4, value: "ins(8)", parent: t3 }
        - { id: t5, value: "del-min -> quita 5", parent: t4 }
    - note: >-
        Se recalcula t=4: la operación en sí sigue siendo ins(8) — nada
        que rehacer en la operación misma — pero el estado que arrastra
        cambió: después del t=3 recalculado la cola quedó vacía, así que
        tras ins(8) queda {8} en vez de {5, 8}.
      caption: "t=4 recalculado: la cola queda en {8} en vez de {5, 8}"
      highlight: ["t4"]
      nodes:
        - { id: t1, value: "ins(5)", parent: null }
        - { id: t2, value: "ins(2) (eliminada)", parent: t1, state: muted }
        - { id: t3, value: "del-min -> quita 5 (recalculado)", parent: t2, state: shared }
        - { id: t4, value: "ins(8)", parent: t3, state: active }
        - { id: t5, value: "del-min -> quita 5", parent: t4 }
    - note: >-
        Se recalcula t=5: antes de este del-min la cola es {8} (no {8}
        proveniente de {5,8} como antes). El mínimo de {8} es el propio 8,
        así que ahora quita 8 en vez de 5.
      caption: "t=5 recalculado: del-min ahora quita 8 (antes quitaba 5)"
      highlight: ["t5"]
      nodes:
        - { id: t1, value: "ins(5)", parent: null }
        - { id: t2, value: "ins(2) (eliminada)", parent: t1, state: muted }
        - { id: t3, value: "del-min -> quita 5 (recalculado)", parent: t2, state: shared }
        - { id: t4, value: "ins(8)", parent: t3, state: shared }
        - { id: t5, value: "del-min -> quita 8 (recalculado)", parent: t4, state: active }
    - note: >-
        Con toda la línea de tiempo recalculada, Q_ahora pasa de {8} a
        vacío: sin el ins(2) original, el primer del-min ya no tenía un 2
        más chico para quitar y terminó consumiendo el 5; el segundo
        del-min entonces consumió el 8 que antes sobrevivía.
      caption: "Q_ahora: {8} -> {} (vacío)"
      highlight: ["t2", "t5"]
      nodes:
        - { id: t1, value: "ins(5)", parent: null }
        - { id: t2, value: "ins(2) (eliminada)", parent: t1, state: muted }
        - { id: t3, value: "del-min -> quita 5 (recalculado)", parent: t2, state: shared }
        - { id: t4, value: "ins(8)", parent: t3, state: shared }
        - { id: t5, value: "del-min -> quita 8 (recalculado)", parent: t4, state: answer }
---

## Qué hace

Elimina de la línea de tiempo una operación (`insert(k)` o `del-min`) que
ocurrió en el tiempo `t`, y actualiza `Q_ahora` con el efecto neto
correspondiente.

## Intuición

> **Ausencia del material**: el mazo **no desarrolla** esta operación. La
> menciona una sola vez, en el enunciado del resultado final (páginas
> 63-64, diapositiva 30): "Insert y Delete retroactivos parciales sobre
> una priority queue cuestan $O(\lg n)$ amortizado" — Delete aparece ahí y en
> ningún otro lado. No hay fórmula de efecto neto propia para Delete, no
> hay pseudocódigo, y no hay ejemplo numérico. De las cuatro operaciones
> del tema, es la única sin ningún desarrollo del profesor.

Lo que sí puede decirse, apoyado en lo que el profesor *sí* desarrolla
para [Insert-retroactive](/structures/retroactive-priority-queue/operations/insert-retroactive):
si insertar en el pasado tiene un efecto neto acotado a un único
intercambio, es razonable esperar (por simetría del problema) que borrar
una operación del pasado tenga una estructura de efecto igual de acotada.
Pero **el mazo no dice cuál es ese efecto**, y encima Delete tiene una
dificultad extra que Insert no tiene: la operación borrada pudo haber sido
un `insert(k)` (símil directo de deshacer una inserción) o un `del-min`
(¿qué significa "deshacer" una extracción, si no se sabe qué habría
eliminado la cola de no haber existido ese `del-min`?). El profesor no
distingue estos dos casos en ningún momento.

## Algoritmo

**No hay algoritmo del profesor para transcribir.** A diferencia de
[Bridge](/structures/retroactive-priority-queue/operations/bridge) y
[Compute-M](/structures/retroactive-priority-queue/operations/compute-m),
que sí tienen una fórmula explícita aunque no un "Algoritmo N" con ese
nombre, Delete-retroactivo no tiene ni fórmula: sólo la cota final citada.
Escribir aquí un algoritmo completo sería inventar contenido que el curso
no cubre — contra la regla de fidelidad al profesor de este proyecto.

## Pseudocódigo

**No hay material fuente para derivarlo.** El pseudocódigo de
[Insert-retroactive](/structures/retroactive-priority-queue/operations/insert-retroactive)
sí es una derivación defendible (traduce directamente la fórmula de `M`
que el profesor sí da); esto no lo es, porque no hay ninguna fórmula de la
que partir.

## C++

No hay una función `delete_retroactive` propia en
`cpp/structures/retroactive-priority-queue/`: implementarla exigiría
inventar el algoritmo que el punto anterior explica que no está en el
material. Ver `full-implementation.cpp`, que sí demuestra por completo
[Bridge](/structures/retroactive-priority-queue/operations/bridge),
[Compute-M](/structures/retroactive-priority-queue/operations/compute-m)
e [Insert-retroactive](/structures/retroactive-priority-queue/operations/insert-retroactive).

## Complejidad temporal

$O(\lg n)$ amortizado — la misma cota citada que Insert-retroactivo, de la
misma línea del profesor (páginas 63-64): "Insert y Delete retroactivos
parciales... cuestan $O(\lg n)$ amortizado". Es una cita, no una derivación;
y a diferencia de Insert, aquí el mazo ni siquiera da el argumento
estructural (el "efecto neto es un único intercambio") que sostiene la
cota de Insert — sólo el número final.

## Complejidad espacial

No la da el profesor.

## Ejemplo

**No hay ejemplo del profesor**, y tampoco hay base para derivar uno con
confianza: la fórmula que se derivaría un ejemplo (el equivalente a
$M = \max(\{k\} \cup \{...\})$ de Insert) no existe para Delete. Inventar un
número aquí sería inventar el algoritmo, no sólo el ejemplo.

La visualización de arriba **no** es ese algoritmo inexistente: es una
ilustración derivada de lo único defendible por simetría con
Insert-retroactive — que borrar una operación obliga a rehacer, uno por
uno, todo lo que viene después de ella, sin bridge que acote el trabajo
(porque el material no define uno para Delete). Muestra el mecanismo
obligado (recalcular en cascada), no una cota ni una fórmula de efecto
neto propia.

## Casos límite

**No aplica** en ausencia de un algoritmo: no hay casos límite propios de
Delete-retroactivo que discutir sin antes tener el algoritmo mismo. Los
casos límite reales de este tema — $M = k$ vs $M \ne k$, ausencia de puente
interior— están documentados en
[Insert-retroactive](/structures/retroactive-priority-queue/operations/insert-retroactive)
y [Bridge](/structures/retroactive-priority-queue/operations/bridge).
