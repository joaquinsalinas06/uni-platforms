---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué Insert, Union y Decrease-Key son O(1) amortizado: la pereza de no reorganizar nada hasta Extract-Min."
  - "Por qué la regla de las marcas (perder a lo mucho un hijo sin cortarse) es exactamente lo que la cota de grado D(n) = O(lg n) necesita, ni más estricta ni más laxa."
  - "Cómo se aplica el método del potencial Φ(H) = t(H) + 2·m(H) operación por operación, distinguiendo siempre el costo real del amortizado."
  - "Por qué Consolidate es 'igual que un montículo binomial' y qué gana Fibonacci frente a binomial siendo perezoso en las demás operaciones."
  - "Qué gana y qué pierde el montículo de Fibonacci frente al binomial y el binario (la tabla comparativa de theory.md)."
canDo:
  - Implementar Cut, Cascading-Cut y Consolidate de memoria, sin mirar el pseudocódigo.
  - Trazar una cadena de cortes en cascada a mano, decidiendo en cada nivel si se marca o se corta.
  - Trazar Consolidate a mano sobre una lista de raíces con grados repetidos, incluyendo colisiones encadenadas.
  - Derivar Find-Min y Delete a partir de las operaciones documentadas, aunque el mazo no les dé pseudocódigo propio.
  - Calcular el costo amortizado de Decrease-Key y Extract-Min aplicando el método del potencial, no memorizando el resultado.
---

Si algo de esta lista no sale sin mirar el material, vuelve a
[Cascading-Cut](/structures/fibonacci-heap/operations/cascading-cut) y
[Consolidate](/structures/fibonacci-heap/operations/consolidate): son las
dos piezas de las que dependen Decrease-Key y Extract-Min respectivamente,
y donde vive casi toda la dificultad real de esta estructura.
