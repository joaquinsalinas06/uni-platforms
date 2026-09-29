---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué `ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)` formaliza el 'pago diferido' que el análisis agregado sólo sugiere."
  - "Por qué la condición 'Φ nunca cae por debajo de su valor inicial' es suficiente (y necesaria en el argumento) para que la suma amortizada acote a la suma real."
  - "Qué gana y qué pierde frente al análisis amortizado agregado de semana 1 (contador binario): acota operaciones individuales, a costa de tener que elegir y verificar una función Φ."
  - "Por qué en Decrease-Key el término `c` de los cortes en cascada se cancela con `ΔΦ`, y qué papel juega específicamente el coeficiente 2 de `m(H)` en esa cancelación."
canDo:
  - "Derivar ĉᵢ de memoria para Insert, Union, Decrease-Key y Extract-Min a partir de cᵢ y ΔΦ, sin ver el mazo."
  - "Demostrar la suma telescópica `Σ ĉᵢ = Σ cᵢ + Φ(Dₙ) − Φ(D₀)` desde la definición, sin saltarme el paso de cancelación."
  - "Diseñar un Φ distinto para una estructura nueva y verificar si cumple la condición de validez, sin necesitar que sea exactamente t(H) + 2·m(H)."
---

Si algo de la lista no sale sin ver el mazo ni las soluciones de
`exercises.md`, repetir primero el nivel 6 (la demostración de la suma
telescópica) — de ahí sale todo lo demás.
