---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      ¿Cuál de estos arreglos representa un montículo máximo válido?
      (a) [16, 14, 10, 8, 7, 9, 3, 2, 4, 1]
      (b) [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      (c) [16, 4, 10, 14, 7, 9, 3, 2, 8, 1]
    hints:
      - "Revisa, para cada posición i > 1, que A[i/2] >= A[i]."
      - "En (b) el arreglo está ordenado ascendente: la raíz A[1]=1 no puede ser el máximo."
      - "En (c), compara A[2]=4 contra su hijo A[4]=14: ¿A[2] >= A[4]?"
    solution: >-
      (a) es válido: cada nodo es mayor o igual que sus dos hijos. (b) no lo
      es porque la raíz debería ser el máximo global y en cambio es el
      mínimo. (c) tampoco: A[2]=4 tiene como hijo A[4]=14, que es mayor,
      violando el invariante.
  - level: 2
    statement: >-
      Traza a mano Max-Heapify(A, 1, 8) sobre A = [5, 14, 10, 8, 2, 9, 3, 12].
      Escribe el arreglo después de cada intercambio.
    hints:
      - "El invariante ya es válido en los subárboles de los hijos de la raíz; sólo la raíz puede estar rota."
      - "En el primer paso compara A[1]=5 contra A[2]=14 y A[3]=10: ¿cuál de los tres es el mayor?"
      - "Después del primer intercambio, sigue el mismo proceso en la nueva posición del 5."
    solution: >-
      Paso 1: A[1]=5 contra A[2]=14 y A[3]=10; el mayor es 14, se intercambia:
      [14, 5, 10, 8, 2, 9, 3, 12]. Paso 2: en i=2, A[2]=5 contra A[4]=8 y
      A[5]=2; el mayor es 8, se intercambia: [14, 8, 10, 5, 2, 9, 3, 12].
      Paso 3: en i=4, A[4]=5 contra su único hijo A[8]=12 (no hay A[9]); 12
      es mayor, se intercambia: [14, 8, 10, 12, 2, 9, 3, 5]. Paso 4: en i=8,
      es hoja, termina. Resultado final: [14, 8, 10, 12, 2, 9, 3, 5].
  - level: 3
    statement: >-
      Implementa Build-Max-Heap(A, n) usando la Max-Heapify iterativa de
      full-implementation.cpp, sin usar recursión en ninguna de las dos funciones.
    hints:
      - "El recorrido de Build-Max-Heap va de i = n/2 (división entera) hasta 1, decreciente."
      - "No hace falta tocar las posiciones i > n/2: son hojas y ya son montículos triviales."
      - "Reutiliza exactamente la misma max_heapify de step-2-max-heapify.cpp; no necesitas escribir una versión nueva."
    solution: >-
      for (int i = n / 2; i >= 1; --i) max_heapify(A, i, n); — con max_heapify
      igual a la de step-2-max-heapify.cpp. La corrección se apoya en que al
      llegar a la posición i, todo lo que está a su derecha con índice mayor
      a i ya es un montículo válido (invariante del bucle, procesado en
      orden decreciente).
  - level: 4
    statement: >-
      Adapta Max-Heapify y Build-Max-Heap para un MIN-heap (el que usarías
      para implementar Dijkstra, como en heaps/B_dijkstra.cpp). ¿Qué
      cambia exactamente en el código?
    hints:
      - "Sólo el sentido de las comparaciones se invierte: donde había > ahora va <."
      - "El invariante pasa de 'todo nodo >= sus hijos' a 'todo nodo <= sus hijos'."
      - "Los índices parent/left/right, la forma del arreglo y el recorrido de Build-Max-Heap no cambian en nada."
    solution: >-
      Basta reemplazar cada comparación 'vals[l] > vals[largest]' por
      'vals[l] < vals[largest]' (y lo mismo para right), y renombrar
      'largest' a algo como 'smallest'. Todo lo demás —índices, recorrido de
      Build-Max-Heap, Insert subiendo mientras el hijo sea menor que el
      padre— es una traducción mecánica del mismo argumento. Es la simetría
      max<->min descrita en theory.md.
  - level: 5
    statement: >-
      Diseña Increase-Key para este montículo máximo: cambia la llave de la
      posición i a un valor mayor y restaura el invariante. Justifica por
      qué basta con subir el elemento, sin necesitar Max-Heapify.
    hints:
      - "Si la nueva llave es mayor que la anterior, ¿puede seguir siendo menor que alguno de sus hijos?"
      - "El invariante entre A[i] y sus hijos no se puede romper al AUMENTAR A[i], sólo al subir podría romperse entre A[i] y su padre."
      - "Compara con Decrease-Key (la versión genérica de step-6-decrease-key.cpp): aquí sólo hace falta una de las dos direcciones."
    solution: >-
      void increase_key(int i, int new_key) { vals[i] = new_key; sift_up(i); }
      — no hace falta Max-Heapify porque aumentar A[i] nunca puede volverlo
      menor que sus hijos (si ya era >= antes, sigue siéndolo con un valor
      mayor); sólo puede romper el invariante hacia el padre, que sift_up
      corrige.
  - level: 6
    statement: >-
      Demuestra por qué Build-Max-Heap cuesta Θ(n) y no O(n log n), usando
      el argumento del profesor de suma agregada sobre niveles.
    hints:
      - "El lema clave es que a lo más ⌈n/2^(h+1)⌉ nodos están a altura h."
      - "Max-Heapify sobre un nodo de altura h cuesta O(h), no O(log n): cerca de las hojas el trabajo real es mucho menor que el peor caso global."
      - "Suma T(n) <= Σ_{h=0}^{⌊lg n⌋} ⌈n/2^(h+1)⌉ · O(h) = O(n · Σ h/2^h), y usa que Σ_{h=0}^{∞} h/2^h converge a 2."
    solution: >-
      T(n) ≤ Σ_{h=0}^{⌊lg n⌋} ⌈n/2^(h+1)⌉ · O(h). Factorizando n/2 de cada
      término: T(n) = O(n · Σ_{h=0}^{∞} h/2^h). La serie Σ h/2^h es una
      serie geométrica derivada término a término que converge a 2 (un
      valor constante, independiente de n). Por lo tanto T(n) = O(n·2) =
      O(n). La cota ingenua O(n log n) sobreestima porque asume que las
      n/2 llamadas cuestan O(log n) cada una, ignorando que la gran mayoría
      de los nodos están cerca de las hojas, donde Max-Heapify hace poco
      trabajo real.
---

Seis niveles: 1 reconocer el invariante, 2 trazar Max-Heapify a mano, 3
implementar Build-Max-Heap, 4 adaptar a min-heap, 5 diseñar una operación
nueva a partir de las existentes, 6 demostrar la cota Θ(n) del profesor.
