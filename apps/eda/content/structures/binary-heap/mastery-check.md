---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué el arreglo 1-indexado con las fórmulas parent = i/2, left = 2i, right = 2i+1 representa exactamente un árbol binario casi completo, sin punteros."
  - "Por qué Max-Heapify sólo necesita revisar la raíz de su subárbol, y no todo el subárbol, para restaurar el invariante."
  - "Por qué Build-Max-Heap es Θ(n) y no O(n log n): el argumento de suma agregada sobre niveles, no una llamada ingenua a Max-Heapify por nodo."
  - "Qué gana y qué pierde el montículo binario frente al binomial (simple y Θ(n) para construir, pero Θ(n) para Union, la razón declarada para pasar al binomial)."
  - "Cómo se traduce cada operación de este montículo máximo a su versión simétrica de mínimo (la nota de apoyo en theory.md)."
canDo:
  - Implementar Max-Heapify y Build-Max-Heap de memoria, sin mirar el
    pseudocódigo.
  - Trazar Max-Heapify e Insert a mano sobre un arreglo dado, paso a paso,
    sin equivocarme con los índices.
  - Adaptar la implementación de max-heap a min-heap invirtiendo sólo el
    sentido de las comparaciones.
  - Derivar Insert, Extract-Min, Decrease-Key y Delete a partir de
    Max-Heapify y del argumento de altura, sin que estén dados explícitamente.
---

Si algo de esta lista no sale sin mirar el material, vuelve a
[Max-Heapify](/structures/binary-heap/operations/max-heapify) y
[Build-Max-Heap](/structures/binary-heap/operations/build-max-heap): todo
lo demás en esta estructura se deriva de esas dos.
