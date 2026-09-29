---
kind: examples
title: Ejemplos
---

## Mínimo

Un árbol de un solo nodo, `raíz = 5`. Buscar(5) cuesta 0 pointer-moves: ya se
está en el nodo. Es el caso donde `search` termina antes de moverse.

*(derivado; no aparece en las diapositivas — el profesor no numeraliza
ningún caso en esta sección)*

## Normal

BST balanceado con llaves {1, ..., 7} en forma completa (raíz 4, hijos 2 y 6,
nietos 1, 3, 5, 7). Buscar(1): 4 → pointer-move(izquierda) → 2 →
pointer-move(izquierda) → 1. Costo: 2 pointer-moves, que coincide con la
profundidad de 1 ($\lfloor \log_2 7 \rfloor = 2$). Rotar(2) con su padre (4) — Right
Rotation — deja a 2 como raíz, a 4 como su hijo derecho, y al antiguo hijo
derecho de 2 (el nodo 3) como hijo izquierdo de 4: costo 1 rotación, $O(1)$
sin importar que 4 tenga siete nodos en su subárbol.

*(derivado del pseudocódigo; no aparece en las diapositivas)*

## Límite

El mismo conjunto de llaves {1, ..., 7}, insertadas en orden creciente,
produce una cadena degenerada: 1 → 2 → 3 → ... → 7, cada uno hijo derecho
del anterior. Buscar(7) cuesta 6 pointer-moves — $O(n)$, no $O(\log n)$ — con el
mismo n que el árbol balanceado de arriba costaba 2. Ninguna estructura
"arregla" esto dentro del modelo: el modelo sólo define el costo, no impone
una forma. Mantener la forma balanceada es exactamente lo que hace
[`/structures/balanced-bst`](/structures/balanced-bst) con rotaciones tras
cada Insert, y es la motivación de fondo detrás de
[`search-sequence-properties`](/structures/search-sequence-properties): medir
el costo en función de la secuencia, ya que la forma sola no alcanza.

*(derivado del pseudocódigo; no aparece en las diapositivas)*
