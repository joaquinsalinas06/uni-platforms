---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El range tree 1D se construye, según el profesor, "usando árboles
      binarios de búsqueda balanceados que almacenen a los puntos en las
      hojas". ¿En qué se diferencia eso de un BST balanceado de libro como
      el de esta página, donde las llaves viven en cualquier nodo (interno
      o hoja)?
    hints:
      - "Piensa qué guardan los nodos internos si las llaves reales sólo están en las hojas: ¿para qué sirven entonces?"
      - "En el BST de esta página, `Search(x)` puede terminar en un nodo interno. En el range tree, ¿puede terminar ahí también?"
    solution: >-
      En el BST de esta página cualquier nodo (interno o hoja) puede
      contener una llave real, y `Search` puede terminar en un nodo interno.
      En el range tree 1D las llaves reales sólo están en las hojas; los
      nodos internos no son datos, son sólo delimitadores (guardan un valor
      que orienta la búsqueda hacia la hoja correcta) — la búsqueda siempre
      termina bajando hasta una hoja, nunca se detiene antes.
  - level: 2
    statement: >-
      Sobre el árbol de 5 nodos de `theory.md` (raíz `20`, hijo izq `10`,
      hijo der `30` con hijo izq `27` y der `40`), traza a mano
      `Predecessor(35)` y `Successor(35)` paso a paso (qué nodo se visita,
      hacia qué lado se compara, qué queda como candidato).
    hints:
      - "Desciende como en Search comparando 35 contra cada nodo, y en cada paso hacia la izquierda o derecha decide si ese nodo puede ser candidato a predecesor o a sucesor."
      - "35 no está en el árbol: el descenso termina en un hijo nulo, y el candidato guardado hasta ahí es la respuesta."
    solution: >-
      Predecessor(35): en `20`, 35 > 20 → candidato a predecesor = 20,
      bajamos a la derecha (`30`). En `30`, 35 > 30 → candidato = 30,
      bajamos a la derecha (`40`). En `40`, 35 < 40 → no se actualiza el
      candidato, bajamos a la izquierda (nulo). Termina: Predecessor(35) =
      30. Successor(35): en `20`, 35 > 20 → no se actualiza el candidato a
      sucesor, bajamos a la derecha (`30`). En `30`, 35 > 30 → tampoco se
      actualiza, bajamos a la derecha (`40`). En `40`, 35 < 40 → candidato a
      sucesor = 40, bajamos a la izquierda (nulo). Termina: Successor(35) =
      40.
  - level: 3
    statement: >-
      Implementa `int height(Node*)` y una función `bool isBalanced(Node*)`
      que recorra el árbol una sola vez y devuelva `false` en cuanto
      encuentre un nodo donde la diferencia de alturas de sus dos
      subárboles exceda 1 (el invariante AVL). Verifica con un `assert`
      que el árbol de 5 nodos de `theory.md` cumple `isBalanced`, y que
      encadenar manualmente tres nodos en línea recta (sin rebalancear) no
      lo cumple.
    hints:
      - "Un nodo nulo tiene altura -1 (o 0, según la convención que elijas, pero sé consistente en toda la función)."
      - "No calcules la altura de cada subárbol por separado con dos recorridos: hazlo en una sola pasada que devuelva -1 (o cualquier centinela) apenas detecta un desbalance, para no recorrer dos veces el mismo árbol."
    solution: >-
      Una versión de una sola pasada devuelve la altura o un centinela
      (p. ej. -2) apenas detecta desbalance, y `isBalanced` sólo revisa si
      el resultado es el centinela:
      `int chk(Node* n){ if(!n) return -1; int l=chk(n->left); if(l==-2)
      return -2; int r=chk(n->right); if(r==-2) return -2; if(abs(l-r)>1)
      return -2; return 1+max(l,r); } bool isBalanced(Node* n){ return
      chk(n)!=-2; }`. Sobre el árbol de `theory.md` (alturas 0 y 1 en los
      subárboles de `30`, diferencia ≤ 1 en todo nodo) da `true`; sobre una
      cadena de tres nodos en línea recta (p. ej. 10 con hijo derecho 20 con
      hijo derecho 30, sin rebalancear) el nodo raíz tiene subárbol
      izquierdo de altura -1 y derecho de altura 1, diferencia 2 → `false`.
  - level: 4
    statement: >-
      El barrido de segmentos usa `Successor(y)` sobre la estructura que
      mantiene el orden de los cruces con la recta de barrido, y la
      resuelve como parte de `Query(t, Successor(y))`. Adapta el
      pseudocódigo de `Successor` de esta página para que, en vez de
      devolver sólo la llave, devuelva también cuántos nodos visitó en el
      descenso (para razonar sobre el costo real de esa consulta dentro del
      barrido).
    hints:
      - "No cambies el criterio de qué nodo es candidato a sucesor: sólo agrega un contador que se incremente en cada paso del descenso, sea cual sea la dirección."
      - "El contador final está acotado por la altura del árbol — es la misma cota O(lg n) de Successor, ahora explícita como número."
    solution: >-
      `pair<optional<int>,int> successorWithCount(Node* root, int x) {
      Node* cur = root; optional<int> candidate; int steps = 0; while (cur)
      { steps++; if (x < cur->key) { candidate = cur->key; cur = cur->left;
      } else { cur = cur->right; } } return {candidate, steps}; }`. `steps`
      queda acotado por la altura del árbol en el momento de la consulta —
      la misma cota O(lg n) que ya tenía `Successor`, sólo que ahora
      medible operación por operación, que es justo lo que necesita el
      barrido para argumentar el costo total sobre las n consultas.
  - level: 5
    statement: >-
      Diseña (en pseudocódigo, sin implementarlo) cómo construirías, a
      partir de un arreglo ya ordenado de n puntos, un árbol binario de
      búsqueda balanceado que almacene los puntos **en las hojas** — la
      forma que usa el range tree 1D — de modo que la construcción tome
      O(n) y el árbol resultante tenga altura O(lg n) sin necesitar
      rotaciones después.
    hints:
      - "Con el arreglo ya ordenado no hace falta insertar uno por uno con rotaciones: divide el arreglo por la mitad recursivamente, como en un merge sort al revés."
      - "El punto de corte de cada nodo interno no tiene que ser un punto real: puede ser cualquier valor que separe correctamente la mitad izquierda de la derecha (p. ej. la llave mínima de la mitad derecha)."
    solution: >-
      `Build(puntos[lo..hi])`: si `hi - lo == 1`, crear una hoja con el
      punto `puntos[lo]`. Si no, sea `mid = (lo+hi)/2`; construir
      recursivamente la mitad izquierda `Build(puntos[lo..mid])` y la
      derecha `Build(puntos[mid..hi])`, y crear un nodo interno cuyo valor
      de corte es la llave mínima de la mitad derecha (`puntos[mid]`), con
      esos dos subárboles como hijos. Como el arreglo ya está ordenado, cada
      llamada divide exactamente a la mitad sin comparar ni rotar: la
      recurrencia T(n) = 2T(n/2) + O(1) da T(n) = O(n), y como cada
      división es exacta (mitad y mitad), la altura queda en ⌈lg n⌉ sin
      necesitar ningún rebalanceo posterior — el árbol nace balanceado
      porque los datos ya venían ordenados.
  - level: 6
    statement: >-
      La semana 5 (modelo computacional BST) trata la rotación como
      primitiva de costo O(1) sin definirla en detalle. Demuestra, a partir
      de la definición de rotación de `operations/insert.md`, que una
      rotación (derecha o izquierda) nunca cambia el recorrido in-order del
      árbol — es decir, que el conjunto de llaves y su orden quedan
      idénticos antes y después, sólo cambia la forma.
    hints:
      - "El recorrido in-order de un subárbol con raíz r, izquierdo I y derecho D es: in-order(I), r, in-order(D). Escribe el in-order de ambos lados (antes y después de rotar) en términos de A, n, B, p, C."
      - "No necesitas los valores concretos de las llaves: basta con que el orden relativo de los cinco bloques (A, n, B, p, C) sea el mismo en ambas formas."
    solution: >-
      Antes de rotar (con `p` raíz del subárbol, `n` su hijo izquierdo,
      `A`/`B` hijos de `n`, `C` hijo derecho de `p`), el in-order es:
      in-order(A), n, in-order(B), p, in-order(C) — es decir A, n, B, p, C
      en bloques. Después de una rotación derecha (`n` sube como raíz, `p`
      queda como su hijo derecho con hijos `B` y `C`), el in-order es:
      in-order(A), n, [in-order(B), p, in-order(C)] = A, n, B, p, C — el
      mismo orden de bloques. Como ninguna llave migra de un bloque a otro
      (A, B y C no se tocan; sólo se reasignan los punteros que conectan a
      `n` y `p`), el recorrido in-order completo es idéntico antes y
      después. Esto es exactamente lo que permite a la semana 5 tratar la
      rotación como una operación O(1) "gratis" en términos de corrección:
      cambia la forma (y por tanto el costo futuro de acceso) sin romper
      nunca el invariante de orden de búsqueda.
---

Los niveles 1 y 5 apuntan al uso del range tree (llaves en las hojas, no en
cualquier nodo); el 2 y el 4 a Predecessor/Successor tal como los necesita
el barrido de segmentos; el 3 al invariante de balance en sí; el 6 a la
rotación como la pieza que la semana 5 usa sin volver a derivar.
