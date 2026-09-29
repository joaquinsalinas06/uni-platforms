---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué un BST sin balancear puede degradar Search/Insert a O(n) y cuál invariante lo evita.
  - Qué hace una rotación exactamente (qué tres nodos toca y por qué el recorrido in-order no cambia).
  - Por qué Predecessor/Successor bastan con un único descenso guardando un "candidato", sin necesitar punteros al padre.
  - Para qué usa el curso un BST balanceado en range-tree (llaves en las hojas) y en el barrido de segmentos (mantener el orden de los cruces), sin que el profesor explique el balanceo mismo.
canDo:
  - Implementar Search, Insert (con rotaciones), Predecessor y Successor de memoria.
  - Trazar a mano qué rotación corrige un desbalance dado, sin ejecutar todo el árbol mentalmente.
  - Reconocer, en un enunciado, cuándo hace falta Predecessor/Successor en vez de Search.
---

Si algo de esto no sale, vuelve a `operations/insert.md` (ahí está la
rotación, la pieza que sostiene todo lo demás) antes de repasar Predecessor
o Successor.
