---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      En la linea de tiempo ins(5)@1, ins(2)@2, del-min@3, ins(8)@4,
      del-min@5 (con Q_ahora = {8}), ¿cual de estos tiempos es un puente:
      t=1 (justo despues de ins(5)) o t=3 (justo despues del primer
      del-min)?
    hints:
      - "Un tiempo t' es puente si Q_t' esta contenido en Q_ahora."
      - "En t=1, Q_1 = {5}. ¿Esta 5 en Q_ahora = {8}?"
      - "En t=3, Q_3 = {5} tambien (el del-min elimino el 2, no el 5)."
    solution: >-
      Ninguno de los dos es puente: en ambos casos Q_t' = {5}, y 5 no esta
      en Q_ahora = {8}. El unico puente en este ejemplo es el inicio de la
      linea de tiempo (Q = vacio antes de t=1), que es trivialmente
      subconjunto de cualquier cosa.
  - level: 2
    statement: >-
      Traza a mano Insert(2,5, 'insert(3)') sobre la linea de tiempo
      ins(5)@1, ins(2)@2, del-min@3, ins(8)@4, del-min@5 (Q_ahora = {8}).
      Calcula M y di que le pasa a Q_ahora.
    hints:
      - "M = max({k} union {k' eliminados en tiempo >= t}), con k=3 y t=2.5."
      - "¿Que se elimino en tiempo >= 2.5? El del-min de t=3 (elimina 2) y el de t=5 (elimina 5)."
      - "Compara M contra k=3: ¿son iguales?"
    solution: >-
      Eliminados desde t=2.5: {2, 5}. M = max({3, 2, 5}) = 5. Como M != 3,
      se inserta 5 en Q_ahora (que pasa de {8} a {8, 5}), y 3 pasa a
      formar parte del conjunto de eliminados en el lugar donde antes
      estaba 5.
  - level: 3
    statement: >-
      Implementa una funcion es_puente(t_prima, estado_en_t_prima,
      Q_ahora) que devuelva true si t_prima es un puente, usando
      std::set<int> para representar los estados.
    hints:
      - "La definicion es un solo std::includes o un bucle que revise que todo elemento de estado_en_t_prima este en Q_ahora."
      - "std::includes requiere que ambos conjuntos esten ordenados; std::set ya lo garantiza."
      - "El conjunto vacio siempre debe dar true, sin casos especiales: revisa que tu implementacion no falle con un set vacio."
    solution: >-
      bool es_puente(const std::set<int>& q_tprima, const std::set<int>&
      q_ahora) { return std::includes(q_ahora.begin(), q_ahora.end(),
      q_tprima.begin(), q_tprima.end()); } — std::includes ya maneja el
      caso vacio correctamente (todo esta contenido en todo).
  - level: 4
    statement: >-
      Adapta Compute-M para que, en vez de recorrer todo lo eliminado
      desde t (metodo ingenuo O(r)), use el puente mas cercano antes de t
      para acotar el conjunto de candidatos.
    hints:
      - "Primero encuentra t' = puente mas cercano antes de t, retrocediendo desde t."
      - "Los candidatos ya no son 'eliminado desde t' sino 'insertado desde t' y que no este en Q_ahora'."
      - "Verifica con un assert que el resultado coincide con el metodo ingenuo en al menos dos ejemplos distintos."
    solution: >-
      Encontrar t' retrocediendo desde t hasta el primer tiempo donde
      Q_t' esta contenido en Q_ahora (en el peor caso, el inicio de la
      linea de tiempo). Luego candidatos = { k' insertado en tiempo >= t'
      : k' no esta en Q_ahora }; M = max({k} union candidatos). Es
      exactamente lo que hace step-3-compute-m.cpp, con un assert
      comparando ambos metodos.
  - level: 5
    statement: >-
      Disena un caso de prueba (una linea de tiempo completa) donde el
      puente mas cercano antes de t NO sea el inicio de la linea de
      tiempo, y donde eso realmente reduzca cuantos elementos hay que
      revisar en Compute-M comparado con el metodo ingenuo.
    hints:
      - "Necesitas un momento donde Q quede vacio (o identico a Q_ahora) antes del tiempo t que te interesa: el vacio siempre es puente."
      - "Prueba: insertar algo grande, borrarlo con del-min (eso deja Q vacio: puente), y despues insertar/borrar otras cosas antes de tu t."
      - "Cuenta cuantos elementos revisa el metodo ingenuo (todo lo eliminado desde t) contra cuantos revisa el metodo del puente (todo lo insertado desde t')."
    solution: >-
      Ejemplo: ins(10)@1, del-min@2 (elimina 10, Q queda vacio: t=2 es
      puente), ins(1)@3, ins(2)@4, del-min@5 (elimina 1, Q_ahora={2}). Para
      t=2.5, k=5: el metodo ingenuo mira todo lo eliminado desde 2.5 (solo
      el 1, en t=5). El metodo del puente usa t'=2 y mira lo insertado
      desde t=2 que no este en Q_ahora: {1} (2 esta en Q_ahora, se
      excluye). Mismo resultado, pero el puente evita tener que rastrear
      "eliminado desde t" como concepto separado — solo necesita
      insertados y el filtro contra Q_ahora, que es lo que permite el
      agregado por subarbol del BST balanceado.
  - level: 6
    statement: >-
      Demuestra que el efecto neto de Insert(t, 'insert(k)') nunca puede
      reemplazar a mas de un elemento entre los eliminados (la afirmacion
      central del profesor en la pagina 50-51), usando la definicion de M.
    hints:
      - "M es un unico valor (el maximo de un conjunto): por construccion, solo puede haber 'un' elemento desplazado, nunca varios, porque max() devuelve un solo elemento."
      - "Piensa en que pasaria si dos elementos distintos, digamos a y b, ambos tuvieran que ser desplazados: ¿que dirian sobre M?"
      - "Repasa Insert-retroactive: el caso M=k y el caso M!=k son exhaustivos y mutuamente excluyentes."
    solution: >-
      M se define como el maximo de un conjunto ({k} union eliminados desde
      t), y el maximo de un conjunto es, por definicion, un unico elemento.
      Si M=k, no se desplaza nada. Si M!=k, se desplaza exactamente ese M
      (el que era el mayor entre los eliminados, y por tanto el que habria
      sobrevivido si k hubiera estado desde el principio) — no hay un
      tercer caso ni una forma de que dos elementos distintos sean "el
      maximo" simultaneamente. La cascada aparente de Delete-Mins
      recalculandose en cadena colapsa a esta unica sustitucion porque en
      cada paso de la cadena solo el elemento estrictamente mayor puede
      "sobrevivir" un paso mas, y ese proceso tiene un unico ganador final.
---

Los seis niveles cubren desde reconocer un puente a mano hasta demostrar el
teorema estructural del efecto neto que sostiene toda la técnica.
