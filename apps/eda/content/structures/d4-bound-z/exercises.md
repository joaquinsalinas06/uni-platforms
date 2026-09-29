---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      D₄ guarda, en cada nodo de su árbol de rango, dos estructuras
      satélite. ¿Cuáles son, y cuál va a la derecha y cuál a la izquierda?
    hints:
      - "Es exactamente lo mismo que guarda cada nodo de D3-separation-node,
        una estructura más abajo en la cadena."
    solution: >-
      A la derecha, una D₃ normal (acotada por arriba, z ≤ b3); a la
      izquierda, una D₃ invertida (acotada por abajo, z ≥ a3).
  - level: 2
    statement: >-
      Traza la construcción de D₄ para los puntos con z ∈ {2, 5, 9}: dibuja
      el árbol de rango sobre z y anota qué satélite cuelga de cada nodo.
    hints:
      - "El árbol de rango sobre z se construye igual que el de D3 sobre y:
        toma la mediana como raíz."
      - "Con 3 claves, la raíz es la mediana (z=5); z=2 y z=9 quedan como
        hijos."
    solution: >-
      Raíz z=5. Hijo derecho z=9: satélite D₃ normal sobre {9}. Hijo
      izquierdo z=2: satélite D₃ invertida sobre {2}.
  - level: 3
    statement: >-
      Implementa el `build` de D₄ reutilizando la misma función que
      construye el árbol de rango de D3-separation-node, parametrizada por
      la dimensión (y para D₃, z para D₄).
    hints:
      - "No dupliques el código del árbol de rango: escribe una sola función
        que reciba un extractor de coordenada (una lambda) en vez de asumir
        y o z fijo."
      - "Ver cpp/structures/d4-bound-z/step-2-range-tree-generic.cpp."
    solution: >-
      Una función `build_range_tree(puntos, extraer_clave)` genérica; D₃ la
      llama con `extraer_clave = [](p){ return p.y; }` y D₄ con
      `extraer_clave = [](p){ return p.z; }`. El resto del código es idéntico.
  - level: 4
    statement: >-
      Si el profesor hubiera decidido acotar z primero y luego y (en vez de
      x, y, z en ese orden), ¿qué tendría que cambiar en la construcción de
      D₄ tal como está descrita?
    hints:
      - "La construcción no depende del orden de las dimensiones, sólo de
        cuál estructura anida a cuál."
      - "Compara con qué cambia entre D2-bound-x y D3-separation-node al
        pasar de x a y."
    solution: >-
      Nada en el mecanismo cambiaría — sólo los nombres: D₄ seguiría siendo
      un árbol de rango sobre la última dimensión a acotar, con la
      estructura de la dimensión anterior como satélite normal/invertida.
      El orden x→y→z es una elección del profesor, no una restricción de la
      técnica.
  - level: 5
    statement: >-
      El mapa de conocimiento sólo le da a D₄ la operación `build`, sin
      consulta propia. Diseña, en prosa, cómo se vería una consulta de D₄
      para la caja completa [x1,x2] × [a2,b2] × [a3,b3], apoyándote en cómo
      D₃ resuelve su consulta.
    hints:
      - "D3-separation-node localiza un único nodo de separación al buscar
        a2 y b2 en su árbol sobre y, y dispara dos consultas satélite ahí."
      - "La misma idea, sobre z: localiza el nodo de separación al buscar
        a3 y b3 en el árbol sobre z."
    solution: >-
      Localizar el nodo de separación v_split buscando a3 y b3 en el árbol
      sobre z; disparar una consulta a la D₃ normal de derecha(v_split)
      pidiendo z ≤ b3, y una consulta a la D₃ invertida de izquierda(v_split)
      pidiendo z ≥ a3. Cada una de esas dos consultas es, a su vez, una
      consulta completa de D₃ (que internamente hace lo mismo un nivel
      abajo, sobre y). El material no desarrolla esto explícitamente para
      D₄ porque se hereda literalmente de D₃.
  - level: 6
    statement: >-
      Demuestra por qué el costo de D₄ sin fractional cascading es
      O(lg² n + k) y no O(lg³ n + k), a pesar de que hay tres niveles de
      anidamiento (D₄ sobre D₃ sobre D₂).
    hints:
      - "El nodo de separación evita la descomposición canónica en cada
        nivel: en vez de O(lg n) subconsultas por nivel, dispara sólo dos."
      - "Compara con el argumento de #43 para D₃ y el de #47 para D₄."
    solution: >-
      Cada capa (D₄→D₃, y D₃→D₂) sustituye la descomposición canónica de
      O(lg n) nodos por la localización de un único nodo de separación más
      dos consultas satélite — eso convierte lo que sería un factor O(lg n)
      extra por nivel anidado en O(1) niveles "gratis" salvo el último.
      Sólo queda un O(lg n) real: la búsqueda binaria de a3,b3 en el árbol
      de z para encontrar el nodo de separación (#47: "cada nivel todavía
      hace su propia búsqueda binaria real"). Con dos búsquedas binarias
      reales encadenadas (una para localizar el nodo de D₄, otra dentro de
      D₃ para localizar el suyo) el costo es O(lg n) · O(lg n) + k =
      O(lg² n + k) — no O(lg³ n), porque D₂ ya no dispara una tercera
      búsqueda binaria propia (su consulta de dominancia, dentro de D₁, usa
      la cara ya localizada y camina en O(1) por paso). Eliminar también
      esas dos búsquedas binarias reales restantes es exactamente lo que
      resuelve [fractional cascading generalizado](/structures/generalized-fractional-cascading).
---

La cadena D₁→D₂→D₃→D₄ es un solo patrón aplicado cuatro veces. Estos
ejercicios insisten en el paralelismo con D₃ a propósito: entender qué
cambia y qué no es el objetivo del tema, más que la mecánica en sí misma.
