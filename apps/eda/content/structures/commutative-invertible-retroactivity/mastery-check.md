---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué conmutatividad basta para reducir Insert(t, op) a Insert(ahora, op), y por qué invertibilidad basta para reducir Delete(t) a Insert(ahora, op⁻¹)."
  - "Por qué ninguna de las dos propiedades por sí sola es suficiente — qué falla si sólo conmuta, o si sólo es invertible."
  - "Qué gana y qué pierde frente a la retroactividad general: cero overhead, a costa de exigir dos propiedades algebraicas sobre las operaciones que la mayoría de estructuras no cumplen."
  - "Por qué el profesor marca esta técnica como el 'caso fácil' y el 'piso' de la semana, y qué tipo de operación (pilas, colas, BSTs) la deja fuera."
canDo:
  - "Dada una operación concreta de cualquier estructura, determinar si conmuta y si es invertible, y por tanto si esta técnica aplica — sin ver el mazo."
  - "Reducir de memoria un Insert(t, op) y un Delete(t) a sus equivalentes sobre el presente, para una operación dada que cumpla ambas propiedades."
  - "Construir un contraejemplo propio (una operación que no conmute, o que no sea invertible) y explicar en qué paso del argumento se rompe."
---

Si algo de la lista no sale sin ver el mazo, repetir primero el ejercicio 6
(la demostración de por qué ambas propiedades juntas bastan) — de ahí sale
el resto.
