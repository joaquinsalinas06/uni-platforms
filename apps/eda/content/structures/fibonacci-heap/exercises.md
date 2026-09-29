---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      ¿Cuál de estas afirmaciones sobre un montículo de Fibonacci es
      correcta?
      (a) Todos los árboles de la lista de raíces son árboles binomiales.
      (b) Una raíz puede estar marcada si perdió dos hijos.
      (c) Insert agrega el nuevo nodo como un árbol de un solo nodo a la
      lista de raíces, sin reorganizar nada más.
    hints:
      - "Revisa la diferencia explícita que hace el profesor entre el montículo de Fibonacci y el binomial: 'una colección de árboles con raíz, no necesariamente binomiales'."
      - "El invariante 'las raíces nunca están marcadas' descarta una de las opciones directamente."
    solution: >-
      (c) es correcta: Insert es O(1) precisamente porque no hace nada más
      que agregar un árbol suelto a la lista de raíces. (a) es falsa: el
      mazo dice explícitamente que los árboles no tienen por qué ser
      binomiales. (b) es falsa: el invariante "las raíces nunca están
      marcadas" es explícito en el mazo (página 20); marca(x) sólo tiene
      sentido si x tiene padre.
  - level: 2
    statement: >-
      Traza a mano Consolidate(H) sobre una lista de raíces con cuatro
      árboles de grado 0, con llaves 12, 4, 9 y 6 (en ese orden de
      recorrido). Indica el contenido del arreglo A después de procesar
      cada raíz y la lista de raíces final.
    hints:
      - "Sigue el mismo ejemplo paso a paso de la página de Consolidate, pero con cuatro raíces en vez de tres: alguna casilla del arreglo A va a colisionar más de una vez."
      - "Binomial-Link(y, x) exige llave(y) >= llave(x): el pseudocódigo intercambia x y y si hace falta antes de enlazar."
      - "Cuando A[d] se limpia tras un enlace y d avanza, puede volver a colisionar con la siguiente raíz que caiga en el nuevo d."
    solution: >-
      Procesar 12: A[0] vacío, A[0] ← 12. Procesar 4: A[0]=12 ocupado;
      como llave(x=4) > llave(y=12) es falsa, no se intercambia;
      Binomial-Link(12, 4) hace de 12 hijo de 4; A[0] se limpia, d=1,
      A[1] vacío, A[1] ← 4 (grado 1, hijo 12). Procesar 9: A[0] vacío,
      A[0] ← 9. Procesar 6: A[0]=9 ocupado; como llave(x=6) > llave(y=9)
      es falsa, no se intercambia; Binomial-Link(9, 6) hace de 9 hijo de
      6; A[0] se limpia, d=1, A[1]=4 ocupado; ahora x=6, y=4, y como
      llave(x=6) > llave(y=4) es verdadera, se intercambian (x=4, y=6);
      Binomial-Link(6, 4) hace de 6 hijo de 4; A[1] se limpia, d=2, A[2]
      vacío, A[2] ← 4. Lista de raíces final: una sola raíz, 4, de grado
      2, con hijos 12 y 6 (y 6 a su vez tiene como hijo a 9). min(H) = 4.
  - level: 3
    statement: >-
      Implementa Cut(H, x, p) y Cascading-Cut(H, y) en C++ siguiendo la
      firma de step-4-cut-cascading.cpp, sin mirar la solución de
      full-implementation.cpp.
    hints:
      - "Cut necesita reconectar la lista de hijos de p (usando removeFromList) y luego agregar x como raíz nueva (usando spliceInto con minNode)."
      - "No olvides los tres efectos de Cut sobre x: padre(x) <- nulo, marca(x) <- falso, y decrementar grado(p)."
      - "Cascading-Cut es directamente recursiva sobre el pseudocódigo: la condición marca(y) decide entre marcar y parar, o cortar y seguir con el padre."
    solution: >-
      void cut(Node* x, Node* p) { if (p->child == x) p->child =
      (x->right == x) ? nullptr : x->right; removeFromList(x);
      --p->degree; x->parent = nullptr; x->mark = false;
      spliceInto(minNode, x); } void cascadingCut(Node* y) { Node* z =
      y->parent; if (z != nullptr) { if (!y->mark) y->mark = true; else {
      cut(y, z); cascadingCut(z); } } } — exactamente los Algoritmos 9 y
      10 del profesor, línea por línea.
  - level: 4
    statement: >-
      Adapta este montículo de Fibonacci (que es de mínimo, como lo enseñó
      el profesor) para que funcione como montículo de MÁXIMO. ¿Qué
      cambia exactamente, y qué NO cambia?
    hints:
      - "Revisa la nota de simetría max<->min ya explicada en /structures/binary-heap: aquí aplica el mismo principio, invirtiendo el comparador."
      - "Todas las comparaciones de llaves (en Insert, decreaseKey, consolidate, extractMin) usan < o >: identifica cada una antes de decidir qué invertir."
      - "La regla de las marcas y la estructura de listas circulares no dependen en nada de si el montículo es de mínimo o máximo."
    solution: >-
      Cambia: cada comparación de llaves se invierte (Insert compara
      x->key < minNode->key -> pasaría a > para maxNode; decreaseKey se
      volvería increaseKey con k > x->key permitido y k < x->key
      rechazado; en Consolidate, "si llave(x) > llave(y) entonces
      intercambiar" seguiría enlazando el menor bajo el mayor, pero
      extractMin extraería el máximo). No cambia: la lista circular de
      raíces, Cut y Cascading-Cut (no comparan llaves, sólo mueven
      punteros y marcas), ni la cota de grado D(n) = O(lg n) (es un
      argumento estructural, no depende del sentido del orden).
  - level: 5
    statement: >-
      Diseña Find-Min(H) y Delete(H, x) para este montículo de Fibonacci.
      El mazo de la semana 2 no da pseudocódigo de ninguna de las dos
      (sólo aparecen con su complejidad en la tabla comparativa de la
      semana 1: Θ(1) y O(lg n)); constrúyelas a partir de las operaciones
      que sí están documentadas.
    hints:
      - "Find-Min no necesita ninguna operación auxiliar: ¿qué campo del montículo ya apunta directamente al mínimo?"
      - "Delete(H, x) se puede reducir a operaciones que ya existen: ¿qué pasa si primero fuerzas a que x sea el mínimo del montículo?"
      - "Piensa en Delete como 'Decrease-Key a menos infinito, seguido de Extract-Min' — verifica que eso preserve el invariante en cada paso intermedio."
    solution: >-
      Find-Min(H): devolver min(H) directamente, O(1), sin recorrer nada
      (coincide con la Θ(1) de la tabla). Delete(H, x): Decrease-Key(H, x,
      -infinito) fuerza a que x se vuelva la raíz mínima real del
      montículo (por transitividad de "menor que todo lo demás"), y luego
      Extract-Min(H) la retira. El costo es el de Decrease-Key (O(c)
      real, O(1) amortizado) más el de Extract-Min (O(D(n)) amortizado),
      dominado por O(lg n) — coincide con la O(lg n) de la tabla de
      semana 1.
  - level: 6
    statement: >-
      Demuestra, usando el método del potencial con Φ(H) = t(H) + 2·m(H),
      que el costo amortizado de Decrease-Key es O(1), incluyendo el caso
      con c cortes en cascada.
    hints:
      - "El costo real de Decrease-Key con c cortes es O(c): un Cut por cada corte, cada uno O(1)."
      - "Cada corte real agrega una raíz (t(H) sube 1) y desmarca un nodo (m(H) baja 1 para ese nodo), salvo el último de la cadena, que sólo se marca sin cortarse."
      - "Escribe ΔΦ como una suma sobre los c cortes más el término final de marcar, y simplifica antes de sumarlo al costo real O(c)."
    solution: >-
      Costo real: cᵢ = O(c) (c llamadas a Cut, cada una O(1), más el
      trabajo O(1) de Decrease-Key en sí). Cambio de potencial: cada uno
      de los c cortes agrega un árbol a la lista de raíces (+1 a t(H)) y
      quita la marca del nodo cortado (-2, porque Cut siempre hace
      marca <- falso); el último nodo de la cadena (el que detiene la
      cascada porque no estaba marcado) sólo se marca, sin cortarse
      (+2). Entonces ΔΦ = c·(1 - 2) + 2 = -c + 2, que el profesor acota
      como ΔΦ <= 4 - c (una cota más holgada que cubre también el
      término O(1) de la llamada externa a Decrease-Key). El costo
      amortizado es ĉᵢ = cᵢ + ΔΦ = O(c) + (4 - c) = O(1): el término -c
      del potencial cancela exactamente el O(c) del costo real, dejando
      una constante. Esto vale para cualquier c >= 0, incluyendo c = 0
      (ningún corte, ΔΦ <= 4, sigue siendo O(1)).
---

Seis niveles: 1 reconocer el invariante y la pereza de Insert, 2 trazar
Consolidate a mano con colisiones múltiples, 3 implementar Cut y
Cascading-Cut, 4 adaptar a máximo, 5 diseñar Find-Min y Delete (ausentes
en el mazo), 6 demostrar con el método del potencial la cota O(1)
amortizada de Decrease-Key.
