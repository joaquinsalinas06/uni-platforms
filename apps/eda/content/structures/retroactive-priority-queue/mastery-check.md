---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué una inserción retroactiva parece desencadenar una cascada de Delete-Mins que se recalculan, pero el efecto neto en el presente se reduce a un único intercambio."
  - "Qué es un puente (Q_t' ⊆ Q_ahora) y por qué encontrar el más cercano antes de t acota el trabajo de Compute-M."
  - "Por qué el cálculo ingenuo de M cuesta O(r) — 'de vuelta al O(r) del rollback genérico' — y qué evita ese costo."
  - "Qué gana esta técnica frente al método de rollback (O(r)) y frente al Segment Tree genérico (O(lg n · lg m), que además no aplica limpio porque Delete-Min no es descomponible)."
  - "Por qué la cota final, O(lg n) amortizado, se cita como resultado externo (Demaine, Iacono, Langerman 2007) y no se demuestra en el mazo — y qué parte exacta queda sin desarrollar (cómo se mantienen los puentes dinámicamente)."
  - "Por qué Delete-retroactivo no tiene desarrollo propio en el material, más allá del enunciado del resultado final."
canDo:
  - Calcular M a mano dado un tiempo t, una llave k, y una línea de tiempo
    con sus Delete-Mins.
  - Encontrar el puente más cercano antes de un tiempo dado, sobre una
    línea de tiempo concreta.
  - Trazar el ejemplo del profesor (ins(5), ins(2), del-min, ins(8),
    del-min, luego Insert(2,5, 'insert(3)')) sin mirar el material.
  - Implementar el método directo (recalcular) para Delete-retroactivo,
    reconociendo que no es la técnica O(lg n) amortizado que el resultado
    citado supone.
---

Si algo de esta lista no sale sin mirar el material, vuelve a
[Bridge](/structures/retroactive-priority-queue/operations/bridge) — es lo
único de este tema que realmente hay que entender a fondo; todo lo demás
(Compute-M, Insert-retroactive, y el Delete-retroactive derivado) se apoya
en esa idea.
