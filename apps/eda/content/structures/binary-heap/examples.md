---
kind: examples
title: Ejemplos
---

## Mínimo

Un montículo de un solo elemento, `A = [7]`, es trivialmente válido: no
tiene padre ni hijos que comparar. `Insert` sobre un montículo vacío
termina sin ninguna comparación (la condición `i > 1` es falsa de
inmediato), y `Extract-Min`/`Find-Min` sobre ese único elemento devuelven
ese valor sin llamar Max-Heapify. Es el caso donde todas las operaciones
degeneran a $O(1)$ real, aunque su cota siga siendo $O(\lg n)$.

*(Derivado del pseudocódigo; no aparece en las diapositivas.)*

## Normal

El único ejemplo numérico que trae el mazo (páginas 11-15, diapositiva 8):

`A = [4, 14, 10, 8, 2, 9, 3]`, llamada `Max-Heapify(A, 1, 7)`.

- Paso 1: el mayor hijo de la raíz es `14` (en la posición 2), se
  intercambia con `4`.
- Paso 2: en la posición donde quedó el `4` (posición 2), su mayor hijo es
  `8` (posición 4), se intercambia de nuevo.
- Resultado: `A = [14, 8, 10, 4, 2, 9, 3]`.

Ver la visualización completa en
[Max-Heapify](/structures/binary-heap/operations/max-heapify).

## Límite

El peor caso real de Build-Max-Heap es un arreglo en orden creciente
(`A = [1, 2, 3, 4, 5, 6, 7]`, que hace que casi todos los nodos internos
necesiten hundirse hasta una hoja). Aun así, el análisis agregado por
niveles del profesor demuestra que el total sigue siendo $\Theta(n)$, no
$O(n \lg n)$ — es justamente el caso que la cota ingenua (multiplicar
`n/2` llamadas por $O(\lg n)$ cada una) sobreestima. Ningún caso de entrada
hace que Build-Max-Heap supere $\Theta(n)$; la estructura que "arregla" la
debilidad real del montículo binario —Union en $\Theta(n)$— es el
[montículo binomial](/structures/binomial-heap), según el resumen del
profesor.

*(Derivado del pseudocódigo; no aparece en las diapositivas.)*
