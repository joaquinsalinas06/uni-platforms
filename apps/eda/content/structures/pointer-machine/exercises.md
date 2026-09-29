---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor da tres reglas para la máquina de punteros. Nómbralas y di,
      para la figura del mazo (cadena raíz -> 7 -> 2 -> 7 -> 42), cuál regla
      explica que sólo se pueda entrar por el nodo `7` inicial.
    hints:
      - "Las tres reglas son sobre: cuántos campos tiene un nodo, cuántos puntos de entrada hay, y cuánto cuesta cada operación."
      - "La pregunta es sobre 'un único punto de entrada' — sólo una de las tres reglas habla de eso."
    solution: >-
      Las tres reglas: (1) cada nodo tiene O(1) campos; (2) hay un único
      nodo raíz, punto de entrada a toda la estructura; (3) cada operación
      (leer/escribir un campo, seguir un puntero) cuesta O(1). La regla (2)
      es la que explica que sólo se pueda entrar por la raíz: no hay otra
      forma de llegar al segundo nodo (`2`) que pasar primero por el primero
      (`7`).
  - level: 2
    statement: >-
      Traza el costo de leer el dato del último nodo (`42`) de la figura del
      mazo, paso a paso, usando sólo las tres reglas del modelo. ¿Cuántas
      operaciones de O(1) se necesitan en total?
    hints:
      - "Hay que empezar en la raíz (regla 2) y seguir un puntero por cada nodo intermedio (regla 3) antes de leer el campo final."
      - "La cadena tiene 4 nodos: raíz -> 7 -> 2 -> 7 -> 42. Cuenta cuántos punteros hay que seguir para llegar al cuarto."
    solution: >-
      Empezar en la raíz (O(1)), seguir el puntero al nodo `7` (O(1)),
      seguir al nodo `2` (O(1)), seguir al nodo `7` (O(1)), y finalmente leer
      el campo dato del nodo `42` (O(1)). Son 5 operaciones de O(1) cada
      una — 4 punteros seguidos más 1 lectura final —, es decir O(1) por
      paso pero O(k) en total para llegar al nodo en la posición k.
  - level: 3
    statement: >-
      Implementa en C++ (respetando las tres reglas: nodos con O(1) campos,
      sin aritmética de direcciones ni acceso indexado) una función que
      cuente cuántas veces se sigue un puntero para llegar del nodo raíz al
      último nodo de una cadena de `n` nodos. Verifica con un `assert` que
      para `n = 4` el conteo da `3` (tres punteros seguidos: nodo1->nodo2,
      nodo2->nodo3, nodo3->nodo4).
    hints:
      - "Un nodo del modelo es un struct con un dato y un puntero `next` a otro nodo — nada de índices de arreglo."
      - "La función recorre con un puntero temporal `cur = raiz` y hace `cur = cur->next` mientras cuenta, hasta llegar al último nodo."
    solution: >-
      Ver `cpp/structures/pointer-machine/full-implementation.cpp`: un
      struct `Node` con un campo dato y un puntero `next`, y una función
      `follow_count` que parte de la raíz y cuenta cada `cur = cur->next`
      hasta el último nodo. Para una cadena de 4 nodos el conteo da 3.
  - level: 4
    statement: >-
      Adapta el conteo del nivel 3 para un árbol binario (cada nodo con
      punteros `left` y `right` en vez de un único `next`) y compáralo con
      un arreglo indexado de tamaño equivalente. ¿Qué operación del modelo
      pointer machine no tiene equivalente directo al indexar un arreglo por
      posición?
    hints:
      - "En un árbol, llegar a un nodo cuesta 'seguir un puntero' por cada nivel de profundidad, no una sola operación."
      - "Piensa en qué necesitarías para llegar directo al elemento en la posición 'i' de un arreglo, y por qué eso no existe como regla del modelo."
    solution: >-
      Adaptar `follow_count` a un árbol significa contar cuántos punteros
      (`left`/`right`) se siguen desde la raíz hasta un nodo dado —
      proporcional a la profundidad del nodo. En un arreglo, acceder a la
      posición `i` es una sola operación de aritmética de direcciones
      (`base + i`), sin seguir nada. Esa operación — indexar por posición
      sin pasar por los elementos intermedios — no existe en el modelo
      pointer machine: ahí sólo se puede leer/escribir un campo o seguir un
      puntero, nunca calcular una dirección arbitraria.
  - level: 5
    statement: >-
      Diseña (en prosa, no en código) una estructura enlazada donde una sola
      operación de "actualizar el dato de un nodo" viole la regla 3 del
      modelo (costo O(1) por operación), y explica exactamente qué parte del
      diseño rompe la regla.
    hints:
      - "La regla 3 exige que cada operación individual —leer, escribir, seguir un puntero— cueste O(1); busca una operación que, tal como la definiste, tenga que tocar más de un nodo por sí misma."
      - "Piensa en una operación que, por definición, 'propague' un cambio a todos los nodos que apuntan al nodo modificado."
    solution: >-
      Ejemplo: una estructura donde "actualizar el dato de un nodo" se
      define como "actualizar el dato en el nodo y en todos los nodos que
      tienen un puntero apuntándolo" (para mantenerlos sincronizados). Esa
      operación, tal como está definida, no es una única lectura/escritura
      de campo ni un único seguir-puntero: por definición toca un número de
      nodos que puede crecer con el tamaño de la estructura (todos los
      punteros entrantes), así que no puede acotarse en O(1) bajo la regla
      3 — se necesitaría descomponerla en varias operaciones O(1), una por
      cada puntero entrante, para que el modelo siga aplicando.
  - level: 6
    statement: >-
      Demuestra, usando sólo las tres reglas del modelo, que el costo de
      llegar del nodo raíz a un nodo a profundidad `d` (siguiendo únicamente
      punteros, sin atajos) es O(d) y no puede ser mejor que Ω(d) en el peor
      caso bajo este modelo.
    hints:
      - "Usa la regla 2 (único punto de entrada) para argumentar que cualquier camino a un nodo a profundidad d empieza en la raíz."
      - "Usa la regla 3 (cada 'seguir un puntero' es O(1) pero es una operación separada por cada paso) para sumar el costo de los d pasos."
    solution: >-
      Por la regla 2, el único punto de entrada a la estructura es la raíz:
      cualquier camino hacia un nodo a profundidad `d` tiene que empezar
      ahí. Por definición de profundidad, ese nodo está conectado a la raíz
      por una secuencia de exactamente `d` punteros consecutivos (no existe
      un atajo: el modelo no tiene aritmética de direcciones ni acceso
      indexado, sólo permite avanzar un puntero a la vez). Por la regla 3,
      cada uno de esos `d` pasos —seguir un puntero— cuesta O(1) como
      operación individual, así que la suma de los `d` pasos cuesta O(d) en
      total. Y como no hay ninguna otra forma de llegar al nodo (regla 2) ni
      ninguna operación que salte varios punteros a la vez (regla 3 sólo
      permite seguir uno por operación), en el peor caso —cuando el único
      camino disponible tiene longitud `d`— el costo no puede bajar de
      Ω(d): se necesitan al menos `d` operaciones de seguir-puntero.
---

Los dos primeros niveles trabajan directamente sobre la figura del mazo; los
siguientes cuatro exploran, más allá de esa figura, qué es lo que el modelo
sí y no permite — la base de por qué `fat-nodes` y `path-copying` existen.
