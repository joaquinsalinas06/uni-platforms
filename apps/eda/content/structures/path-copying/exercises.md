---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor dice que el stack persistente es "el caso degenerado del
      path copying". Explica en una frase por qué, comparando el largo del
      camino de un Push contra el de un Update en el segment tree del
      ejemplo del profesor.
    hints:
      - "¿Cuántos nodos hay entre la cima del stack y el resto de la pila?"
      - "Compáralo con la altura del segment tree de 4 hojas: O(lg n) niveles."
    solution: >-
      En un stack como lista enlazada, la cima ya es el único punto de
      entrada: no hay "camino" de más de un nodo entre la raíz y el punto
      que cambia, así que Push copia un solo nodo. En el segment tree, el
      camino raíz-hoja tiene O(lg n) nodos, así que Update copia ese
      número de nodos. El stack es el caso donde el camino relevante mide
      exactamente 1.
  - level: 2
    statement: >-
      Traza Update sobre el segment tree de 4 hojas del profesor (raíz
      [1,4], hijos [1,2] y [3,4], hojas [1,1], [2,2], [3,3], [4,4]) para
      pos=1. Enumera, en orden, qué nodos se copian y cuáles se comparten
      con la versión vieja.
    hints:
      - "Empieza en la raíz [1,4]: con m=2, ¿pos=1 va por la izquierda o la derecha?"
      - "Sigue el mismo criterio de descenso en [1,2]."
    solution: >-
      Se copian: la raíz [1,4]' (pos=1 ≤ m=2, va por [1,2]), luego [1,2]'
      (pos=1 ≤ m=1, va por [1,1]), luego la hoja [1,1]' (caso base, l=r=1).
      Se comparten sin copiar: [3,4] completo (con sus hojas [3,3] y
      [4,4]) y [2,2], que cuelga de [1,2]' apuntando al mismo nodo de la
      versión vieja.
  - level: 3
    statement: >-
      Implementa Push para un stack persistente en C++, siguiendo el
      Algoritmo 2 del profesor. La firma debe devolver un puntero a la
      nueva cima sin modificar la pila recibida.
    hints:
      - "Un nodo del stack necesita sólo un valor y un puntero al siguiente — revisa cpp/structures/path-copying/step-1-node.cpp."
      - "No hay ciclo ni recursión: es literalmente crear un nodo y enlazarlo."
    solution: >-
      Ver cpp/structures/path-copying/step-2-stack-push.cpp: una función
      Push(Node* s, int x) que hace `return new Node{x, s};` — el nodo
      viejo `s` nunca se modifica, así que sigue siendo un puntero válido
      a la versión anterior.
  - level: 4
    statement: >-
      El pseudocódigo del profesor para Insert del trie persistente, tal
      como aparece en las diapositivas, no retorna dentro del caso base
      (i = |s|): sigue ejecutando c ← s[i], que indexa fuera de la
      cadena. Adapta el pseudocódigo para que termine correctamente sin
      cambiar el comportamiento en ningún otro caso.
    hints:
      - "¿Qué instrucción falta justo después de `nuevo.esFinal ← verdadero`?"
      - "Compáralo con el Algoritmo 3 (Update del segment tree): ahí el caso base sí termina la rama con un `si ... en otro caso` bien separado."
    solution: >-
      Agregar `devolver nuevo` inmediatamente después de
      `nuevo.esFinal ← verdadero`, dentro del mismo `si i = |s| entonces`,
      y mover el resto (`c ← s[i]` en adelante) a un bloque `en otro caso`
      explícito. Así el caso base nunca llega a indexar `s[i]` cuando
      `i = |s|`. Ver operations/trie-insert.md para la versión corregida.
  - level: 5
    statement: >-
      Diseña cómo adaptarías Update del segment tree persistente para que,
      además de devolver la raíz nueva, permita también "deshacer" — volver
      a una versión anterior y seguir escribiendo desde ahí, generando una
      rama distinta. ¿Qué parte de la técnica ya lo permite sin cambios, y
      qué tendrías que agregar por fuera del segment tree mismo?
    hints:
      - "Update nunca asume que el `nodo` de entrada es la versión 'más reciente' — ¿qué pasa si le pasas la raíz de una versión de hace 10 updates?"
      - "Lo que falta no está en el segment tree: piensa en qué estructura externa necesitas para nombrar y encontrar cada versión."
    solution: >-
      Update ya soporta esto sin ningún cambio: como nunca muta el nodo
      recibido, se le puede pasar la raíz de cualquier versión pasada y
      genera una rama nueva a partir de ahí (persistencia confluente si
      esas ramas luego se combinan). Lo que hay que agregar es externo a
      la técnica: una estructura que registre, para cada versión, el
      puntero a su raíz (por ejemplo un arreglo indexado por número de
      versión), para poder "volver" a cualquiera de ellas y decidir desde
      cuál seguir escribiendo.
  - level: 6
    statement: >-
      Demuestra, usando conteo directo del camino (el estilo del profesor,
      no potencial ni amortizado), que insertar n cadenas de largo total
      Σ Lᵢ en un trie persistente usa espacio total O(Σ Lᵢ) — el mismo
      orden que un trie efímero normal.
    hints:
      - "¿Cuántos nodos nuevos crea, como máximo, una sola llamada a Insert sobre una cadena de largo Lᵢ?"
      - "Si cada inserción crea a lo más Lᵢ nodos nuevos, ¿qué pasa al sumar sobre las n inserciones?"
    solution: >-
      Cada Insert de una cadena de largo Lᵢ copia exactamente un nodo por
      carácter recorrido: a lo más Lᵢ nodos nuevos (puede ser menos si
      parte de la cadena ya existía como prefijo de otra, pero nunca más).
      Sumando sobre las n inserciones, el espacio nuevo total es a lo más
      Σ Lᵢ. Un trie efímero normal, al insertar las mismas n cadenas,
      también crea a lo más un nodo por carácter no visto antes, es decir
      O(Σ Lᵢ) en total. Ambas cotas son del mismo orden: la persistencia no
      agrega overhead asintótico de espacio, sólo el costo intrínseco de
      construir el trie una vez.
---

Si una pista no alcanza para resolver el nivel, pide la siguiente antes de
mirar la solución.
