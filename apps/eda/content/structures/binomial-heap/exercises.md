---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Un montículo binomial tiene 11 nodos. ¿Qué árboles binomiales
      (órdenes) lo componen, y cuántas raíces tiene en total?
    hints:
      - "11 en binario: escribe 11 como suma de potencias de 2."
      - "Cada bit encendido en la representación binaria de n es un árbol B_k presente."
    solution: >-
      11 = 1011₂ = 8 + 2 + 1, así que el montículo tiene un B3 (8 nodos),
      un B1 (2 nodos) y un B0 (1 nodo): tres raíces en total.
  - level: 2
    statement: >-
      Traza a mano Insert(H, 4) sobre el montículo de dos raíces
      {6, 3(hijo 9)} (un B0 de llave 6 y un B1 de raíz 3 con hijo 9).
      ¿Qué montículo queda?
    hints:
      - "Insert(H, x) es Union(H, {x}), con x como un B0 nuevo."
      - "El nuevo B0 (4) tiene el mismo grado que la raíz 6 (también B0): se enlazan primero."
      - "Compara la llave del B0 nuevo con la del existente para saber quién queda como raíz."
    solution: >-
      4 y 6 son ambos B0: se enlazan (4 ≤ 6, así que 4 queda como raíz con
      hijo 6). Ese B1 nuevo (raíz 4, hijo 6) choca en grado con el B1 ya
      existente (raíz 3, hijo 9): segundo acarreo. Como 3 ≤ 4, 4 se enlaza
      como hijo de 3. Resultado: un único B2 con raíz 3, hijos 4 (con hijo
      6) y 9.
  - level: 3
    statement: >-
      Implementa Binomial-Link en C++ siguiendo la firma
      `void binomialLink(Node* y, Node* z)` del Algoritmo 5, sin mirar
      `cpp/structures/binomial-heap/step-3-binomial-link.cpp`. Verifica que
      tu versión pase el mismo caso de prueba que `full-implementation.cpp`
      (la unión con acarreo binario de 3 + 1 nodos).
    hints:
      - "Son exactamente cuatro reasignaciones de punteros, en este orden: parent, sibling, child, degree."
      - "y se convierte en el primer hijo de z; el antiguo primer hijo de z pasa a ser el siguiente hermano de y."
      - "No olvides incrementar grado(z): z acaba de ganar un hijo."
    solution: >-
      ```cpp
      void binomialLink(Node* y, Node* z) {
          y->parent = z;
          y->sibling = z->child;
          z->child = y;
          z->degree++;
      }
      ```
  - level: 4
    statement: >-
      El Algoritmo 7 (Union) trata como caso especial "una tercera raíz z
      después de y con grado(z) = grado(x)". Explica, con un ejemplo
      concreto de listas de raíces, qué saldría mal si Union enlazara x con
      y de inmediato en ese caso, ignorando la existencia de esa tercera
      raíz.
    hints:
      - "Piensa en qué pasaría con la tercera raíz z si x y y ya se fusionaron en un árbol de grado k+1: ¿con quién se supone que debía compararse z ahora?"
      - "El invariante del montículo binomial es 'a lo mucho un árbol por orden'. ¿Se puede romper si hay tres candidatos al mismo grado y solo se resuelven dos?"
      - "Construye listas de grados [1, 1, 1, 2] (tres raíces de grado 1 seguidas de una de grado 2) y sigue el algoritmo paso a paso con y sin el caso especial."
    solution: >-
      Con grados [1,1,1,2]: si x y y (las dos primeras de grado 1) se
      enlazan de inmediato, nace un árbol de grado 2 justo antes de la
      tercera raíz de grado 1 (z) y de la raíz de grado 2 ya existente.
      Ahora hay DOS raíces de grado 2 consecutivas sin haberlas comparado
      nunca entre sí: se rompe el invariante de "a lo mucho un árbol por
      orden", y ni Find-Min ni operaciones futuras pueden asumir que el
      grado identifica un árbol único. El caso especial evita esto:
      cuando hay una tercera raíz z de grado igual a x, Union avanza sin
      enlazar todavía, dejando que x y z (ahora consecutivas) se comparen
      en la siguiente vuelta, y que z compita correctamente contra el
      árbol que ya tenía grado 2.
  - level: 5
    statement: >-
      Diseña Decrease-Key-Múltiple(H, lista de pares (x, k)): dado un
      montículo H y una lista de m pares (nodo, nueva llave), aplica
      Decrease-Key a cada uno. ¿Qué complejidad total garantizas, y qué
      supuesto necesitas sobre la lista para que ese análisis valga?
    hints:
      - "Decrease-Key individual es O(lg n) en el peor caso, sin importar el estado del montículo entre llamadas."
      - "¿Los m Decrease-Key son independientes entre sí, o el resultado de uno afecta la profundidad del siguiente?"
      - "Piensa si necesitas ordenar la lista de alguna forma (por ejemplo, por profundidad del nodo) para acotar el trabajo total, o si O(m·lg n) ya es una cota válida sin ningún supuesto extra."
    solution: >-
      Aplicar Decrease-Key uno tras otro, en cualquier orden, cuesta
      O(m·lg n) en el peor caso: cada llamada es independiente y O(lg n)
      por sí sola (el argumento estructural de profundidad-a-lo-mucho-lg n
      no depende de qué otros Decrease-Key se hayan hecho antes, porque
      cada uno solo reordena llaves dentro de su propio camino a la raíz).
      No hace falta ningún supuesto sobre el orden de la lista para esa
      cota; ordenarla no la mejora, porque el peor caso de cada llamada
      individual ya está acotado y no se acumula superlinealmente.
  - level: 6
    statement: >-
      Demuestra, usando el argumento estructural del profesor (conteo de
      raíces y nodos), que un montículo binomial con n nodos tiene a lo
      mucho ⌊lg n⌋ + 1 árboles, y que esa cota es exactamente la que hace
      que Find-Min, Union, Extract-Min y Decrease-Key sean todos O(lg n).
    hints:
      - "El invariante es 'a lo mucho un B_k por cada orden k'. ¿Cuántos nodos tiene un B_k?"
      - "Si n en binario tiene b bits, ¿cuántos de esos bits pueden estar encendidos como máximo, y qué relación hay entre b y lg n?"
      - "Conecta la cota de 'número de raíces' con cada operación por separado: ¿en qué paso de cada una aparece exactamente ese conteo?"
    solution: >-
      Cada B_k presente aporta 2^k nodos, y el invariante prohíbe dos B_k
      del mismo orden, así que n es la suma de un subconjunto de potencias
      de 2 distintas: exactamente la representación binaria de n. Un
      número n tiene ⌊lg n⌋ + 1 bits, así que hay a lo mucho ⌊lg n⌋ + 1
      árboles (uno por cada bit encendido). Esto es O(lg n) raíces, y esa
      es la cantidad que Find-Min recorre completa; que Union mezcla y
      consolida (cada raíz participa en a lo mucho un enlace por "vuelta"
      de acarreo, y hay a lo mucho O(lg n) vueltas); que Extract-Min hereda
      al construir H' con los hijos de la raíz mínima (a lo mucho lg n de
      ellos, porque un B_k tiene hijos B_0..B_{k-1}); y que acota la altura
      de cualquier árbol del montículo, que es exactamente la profundidad
      máxima que recorre Decrease-Key. Las cuatro operaciones son O(lg n)
      por la misma razón estructural: ninguna puede visitar más de
      O(lg n) raíces o niveles, porque esa es la cota que impone n en
      binario.
---

Ver también las [pruebas de dominio](/structures/binomial-heap/mastery-check)
para verbos verificables antes de dar por aprendido este tema.
