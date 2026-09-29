---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué path copying sólo necesita copiar el camino raíz-punto de
    cambio, y no el resto de la estructura, en cualquier estructura de
    árbol o lista enlazada.
  - Por qué Push del stack persistente es el caso degenerado de la
    técnica, y qué relación tiene el largo de su camino (1) con el de
    Update (O(lg n)) e Insert (O(L)).
  - "Qué gana y qué pierde path copying frente a nodos gordos: sin registro
    de modificaciones ni split, pero limitado a persistencia funcional."
  - Por qué consultar una versión vieja del segment tree no cuesta nada
    adicional frente a consultar la versión actual.
  - Por qué el espacio total de un trie persistente tras n inserciones es
    del mismo orden que un trie efímero, a pesar de guardar todas las
    versiones.
canDo:
  - Trazar Update sobre el segment tree de 4 hojas del profesor para
    cualquier posición, indicando qué nodos se copian y cuáles se
    comparten.
  - Implementar Push, Update y Insert persistentes de memoria, siguiendo
    los tres algoritmos del profesor (con la corrección del caso base en
    Insert).
  - Reconocer, dado el pseudocódigo de una operación sobre una estructura
    nueva, si es una aplicación de path copying (y con qué costo, según el
    largo del camino que modifica).
---

Si algo de la lista no sale, vuelve a
[Update (segment tree persistente)](/structures/path-copying/operations/segment-tree-update)
y traza el ejemplo del profesor a mano, nodo por nodo, antes de repetir los
ejercicios de exercises.md.
