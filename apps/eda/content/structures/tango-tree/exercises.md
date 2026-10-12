---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Define hijo preferido y explica por qué los punteros de hijo preferido particionan el árbol de referencia en caminos disjuntos de a lo más $O(\lg n)$ nodos.
    hints:
      - "Cada nodo tiene a lo más un hijo preferido."
      - "La altura de P es Theta(lg n)."
    solution: >-
      El hijo preferido de y es el hijo por el que pasó el acceso más reciente dentro de su subárbol. Como cada nodo tiene a lo más un hijo preferido, siguiendo los punteros se obtienen caminos que no se bifurcan ni se cruzan; como P tiene altura
      Theta(lg n), cada camino tiene a lo más O(lg n) nodos, y todo nodo pertenece a exactamente un camino (aunque sea de un solo nodo).
  - level: 2
    statement: >-
      En el árbol perfecto sobre $1..7$, secuencia $2, 6, 2$. Escribe, tras cada acceso, los caminos preferidos y cuenta los cambios de hijo preferido.
    hints:
      - "El acceso a 2 baja 4 → 2. El de 6 baja 4 → 6."
      - "El nodo 4 es el único donde puede haber cambio."
    solution: >-
      Acceso 2 (4 → 2): caminos {4,2}; 0 cambios. Acceso 6 (4 → 6): en 4 el preferido pasa de 2 a 6: 1 cambio; caminos {4,6}, {2}. Acceso 2 (4 → 2): en 4 pasa de 6 a 2: 1 cambio; caminos {4,2}, {6}.
      Total: 2 cambios, igual que Wilber-1 (accesos a 4: L R L → 2 alternancias).
  - level: 3
    statement: >-
      Ejecuta `acceder` (paso 2 del código) sobre el árbol de 7 llaves con la secuencia $1, 5, 3, 7$ y verifica la salida (0, 1, 2, 2 cambios).
    hints:
      - "Lleva a mano pref[] de los nodos 4, 2 y 6."
      - "Un cambio se cuenta sólo si pref[y] ya estaba definido y es distinto."
    solution: >-
      Acceso 1: pref[4]=2, pref[2]=1, 0 cambios. Acceso 5: pref[4] 2→6 (1 cambio), pref[6]=5. Acceso 3: pref[4] 6→2 (cambio), pref[2] 1→3 (cambio): 2 cambios. Acceso 7: pref[4] 2→6 (cambio), pref[6] 5→7 (cambio): 2 cambios. Total 5; coincide con Wilber-1.
  - level: 4
    statement: >-
      Adapta `acceder` para que además devuelva el número de nodos del camino que **no** cambian de hijo preferido (los que se recorren "gratis" dentro de un camino).
    hints:
      - "Cuenta los nodos del camino donde pref[y] == hijo."
      - "Esos son los pasos que cuestan O(lg lg n) dentro de un mismo árbol auxiliar."
    solution: >-
      Agregar un contador dentro: if (P[y].pref == hijo) gratis++; antes de asignar pref. La suma (gratis + cambios + nodos nuevos) es la longitud del camino. Para el acceso 3 del ejercicio 3: camino 4 → 2 → 3, con 2 cambios y 0 gratis.
  - level: 5
    statement: >-
      Diseña una secuencia de $n$ accesos para la que el costo de Tango $O(\lg\lg n)(m + \text{Wilber-1})$ sea mucho mayor que el de un Splay Tree, o explica por qué no existe tal secuencia en las diapositivas.
    hints:
      - "Compara las dos cotas: Tango pierde un factor lg lg n frente a OPT; el Splay no tiene cota contra OPT."
      - "Piensa en el acceso repetido a una llave."
    solution: >-
      Las diapositivas no dan tal secuencia. Pero se puede razonar: en el acceso repetido a una misma llave Tango no tiene cruces (cada acceso cuesta O(lg lg n)), y un Splay Tree lo hace en O(1) amortizado (la llave queda en la raíz). Es un caso donde la garantía de Tango es peor
      en constante lg lg n que la del Splay. La competitividad de Tango no compite con las propiedades específicas del Splay (como el conjunto de trabajo), sólo con OPT. Nota: es un razonamiento propio.
  - level: 6
    statement: >-
      Demuestra que, con el árbol de referencia perfecto fijo, el número de cambios de hijo preferido que hace un Tango Tree sobre una secuencia es **igual** a Wilber-1 de esa secuencia.
    hints:
      - "Mira un nodo y: sus cambios de hijo preferido ocurren exactamente cuando el acceso baja por un lado distinto al del acceso anterior dentro de su subárbol."
      - "Wilber-1 ignora los accesos al propio y: ¿qué hace el código en ese caso?"
    solution: >-
      Fija un nodo y. Sea a_1, a_2, ... la subsecuencia de accesos que caen en el subárbol de y y no son y. El hijo preferido de y tras el acceso a_j es el lado de a_j. El código cuenta un cambio en y exactamente cuando
      pref[y] ya estaba definido (hay un acceso anterior a_{j-1} en el subárbol) y el lado de a_j es distinto: es decir, cuando los lados de dos accesos consecutivos de la subsecuencia son distintos: una alternancia de Wilber-1 en y.
      Los accesos a y mismo no pasan por la rama "baja a un hijo de y" (el while se detiene en x == y), así que no modifican pref[y]: igual que Wilber-1 los ignora. Sumando sobre todos los y, cambios = Wilber-1.
---

El nivel 6 es la justificación del punto central de la clase (#14–#17): la alternancia de Wilber-1 y el cambio de hijo preferido son la misma cosa.
