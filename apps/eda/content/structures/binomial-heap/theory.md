---
kind: theory
title: Montículo binomial
---

## ¿Qué problema resuelve?

El [montículo binario](/structures/binary-heap) resuelve bien `Insert`,
`Find-Min` y `Extract-Min`, pero `Union` (mezclar dos montículos) le cuesta
$\Theta(n)$: no hay forma barata de combinar dos arreglos-heap sin reconstruir
uno desde cero. El montículo binomial existe para arreglar exactamente eso:
`Union` en $O(\lg n)$, organizando los árboles de la estructura como los bits
de $n$ en binario.

## Intuición

Un montículo binomial es una colección de [árboles binomiales](/structures/binomial-tree)
$B_k$, a lo mucho uno de cada orden. La cantidad de nodos en cada $B_k$ es
$2^k$, así que la lista de árboles presentes es literalmente la
representación binaria de $n$:

$$n = 13 = 1101_2 = 8 + 4 + 1$$

el montículo tiene exactamente un $B_3$, un $B_2$ y un $B_0$, y ningún $B_1$.

`Union` de dos montículos es análoga a sumar dos números en binario:
mezclar las listas de raíces por grado y, cuando dos árboles del mismo
grado coinciden, "acarrear" combinándolos en uno del grado siguiente — lo
mismo que un acarreo al sumar bit por bit.

> **Nota de apoyo** (no está en las diapositivas): el montículo binario de
> esta misma unidad se enseñó como **máximo** (la raíz siempre es la mayor
> llave); el montículo binomial se enseña aquí como **mínimo** (la raíz de
> cada $B_k$, y por tanto la del montículo, siempre es la menor llave). El
> profesor no explica el cambio en el mazo. La estructura es simétrica: basta
> invertir el criterio de comparación ($\ge$ en vez de $\le$, o negar las
> llaves) para pasar de una convención a la otra; ninguna de las
> complejidades ni de las invariantes cambia.

## Estructura interna

Cada nodo guarda su llave, su grado (número de hijos), y tres punteros:
`padre`, `hijo` (al primero de sus hijos) y `siguiente-hermano` (los hijos
de un nodo forman una lista enlazada entre sí, no un arreglo). El montículo
en sí es sólo una lista de raíces, ordenada por grado ascendente.

El invariante es doble:
1. **A lo mucho un árbol $B_k$ por cada orden $k$** — igual que un bit
   binario sólo puede estar en 0 o 1, nunca "dos veces prendido". Con $n$
   nodos, hay a lo mucho $\lfloor \lg n \rfloor + 1$ árboles.
2. **Cada árbol cumple la propiedad de min-heap**: la llave de un nodo
   nunca es menor que la de su padre. Por eso el mínimo del montículo
   siempre está en alguna raíz — nunca hace falta bajar a un nivel interno
   a buscarlo.

## Operaciones

- [Find-Min](/structures/binomial-heap/operations/find-min) — la menor
  llave entre las raíces.
- [Binomial-Link](/structures/binomial-heap/operations/binomial-link) — la
  pieza que usan Union, Insert y Extract-Min: une dos `B_{k-1}` en un `B_k`.
- [Union](/structures/binomial-heap/operations/union) — mezcla dos
  montículos como una suma binaria con acarreo.
- [Insert](/structures/binomial-heap/operations/insert) — caso particular
  de Union con un `B_0` nuevo.
- [Extract-Min](/structures/binomial-heap/operations/extract-min) — quita
  la raíz mínima y reincorpora sus hijos vía Union.
- [Decrease-Key](/structures/binomial-heap/operations/decrease-key) — baja
  una llave y la burbujea hacia la raíz.
- [Delete](/structures/binomial-heap/operations/delete) — Decrease-Key a
  `-infinito` seguido de Extract-Min.

## Análisis de complejidad

El profesor mezcla dos estilos según la operación (ver `meta.yaml` para el
razonamiento operación por operación):

- **Estructural** para Union, Extract-Min, Decrease-Key y Delete: cuenta
  cuántos árboles, raíces o niveles hay (siempre $O(\lg n)$, porque nunca hay
  más de $\lfloor \lg n \rfloor + 1$ raíces ni árboles de altura mayor a
  $\lg n$) y multiplica por el costo $O(1)$ de cada paso.
- **Amortizado (análisis agregado)** para Insert: en $n$ incrementos
  consecutivos de un contador binario de $b$ bits, el bit $i$ cambia a lo
  mucho $\lceil n / 2^i \rceil$ veces; sumando sobre todos los bits,

  $$\sum_{i=0}^{b-1} \left\lceil \frac{n}{2^i} \right\rceil < 2n$$

  Traducido a Insert: aunque un Insert individual puede costar $O(\lg n)$
  (el "acarreo" se propaga por todos los árboles), en promedio sobre una
  secuencia de $n$ Inserts cada uno cuesta $O(1)$.

El profesor no usa el método del potencial aquí — aparece recién en la
semana 2 con el montículo de Fibonacci.

## Tabla de complejidad

Ver la tabla generada desde `meta.yaml`. Ninguna operación tiene mejor caso,
caso promedio ni complejidad espacial documentados por el profesor para
este tema — el mazo no los da, y no se inventan.

## Ejemplos

Ver [examples.md](/structures/binomial-heap/examples): el mazo no trae
ejemplos numéricos para este tema, así que los ejemplos ahí están
derivados ejecutando a mano el pseudocódigo transcrito.

## Comparación con estructuras relacionadas

| | [binary-heap](/structures/binary-heap) | binomial-heap | fibonacci-heap |
| --- | --- | --- | --- |
| Union | $\Theta(n)$ | $O(\lg n)$ | $O(1)$ amortizado |
| Insert | $O(\lg n)$ | $O(\lg n)$ ($O(1)$ amortizado) | $O(1)$ amortizado |
| Extract-Min | $O(\lg n)$ | $O(\lg n)$ | $O(\lg n)$ amortizado |
| estrategia | arreglo compacto | árboles como bits binarios | perezoso: pospone el trabajo hasta Extract-Min |

El montículo de Fibonacci no se desarrolla en esta unidad (llega en la
semana 2); el profesor sólo lo anuncia como la estructura que gana su
ventaja "siendo perezosa".

## Prueba de dominio

Ver [mastery-check.md](/structures/binomial-heap/mastery-check).
