---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué retroactividad no es lo mismo que persistencia, con la frase exacta del profesor: una ramifica el futuro, la otra reescribe el pasado y propaga el efecto al presente."
  - "Qué significan Insert(t, op), Delete(t) y Query(t, op), y por qué son la interfaz común a todas las técnicas de la semana."
  - "Qué distingue retroactividad parcial de completa, y por qué la parcial suele ser más barata."
  - "Por qué la solución ingenua cuesta O(m), y qué es exactamente lo que 'm' cuenta."
canDo:
  - "Trazar a mano el efecto de una secuencia de Insert-retroactive/Delete-retroactive sobre una línea de tiempo, y decir qué cambia en Query(ahora)."
  - "Distinguir, dado un enunciado de operación sobre una estructura, si la consulta que pide es válida bajo retroactividad parcial, o si necesita retroactividad completa."
  - "Ubicar, para una estructura o técnica nueva, si lo que hace es una forma de Insert-retroactive, Delete-retroactive o Query — sin inventar una cuarta operación que el modelo no tiene."
---

Si algo de esta lista no sale, vuelve a la tabla de theory.md (parcial vs.
completa) y a la comparación con [persistencia](/structures/persistence-levels)
antes de seguir con cualquiera de las cuatro técnicas que usan este modelo.
