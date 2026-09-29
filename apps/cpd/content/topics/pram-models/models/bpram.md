---
kind: algorithm
title: "BPRAM (Block PRAM)"
order: 4
visualization:
  type: memory-layout
  steps:
    - note: '$n=4$ transferencias independientes de 1 elemento cada una (4 bytes por elemento): cada bloque paga su propio costo fijo de arranque $\alpha$ además de $\beta$ por el dato movido. $T_1 = n(\alpha+\beta) = 4(\alpha+\beta)$ — el costo fijo $\alpha$ se repite 4 veces, una por transferencia.'
      blocks:
        - { id: t1, label: "t1 (α+β)", bytes: 4, offset: 0, state: active }
        - { id: t2, label: "t2 (α+β)", bytes: 4, offset: 4, state: active }
        - { id: t3, label: "t3 (α+β)", bytes: 4, offset: 8, state: active }
        - { id: t4, label: "t4 (α+β)", bytes: 4, offset: 12, state: active }
    - note: 'Los mismos 16 bytes ($n=4$ elementos) movidos en una sola transferencia en bloque: se paga $\alpha$ una sola vez y $\beta \cdot n$ por el volumen total. $T_2 = \alpha + \beta \cdot n = \alpha + 4\beta$ — mucho más barato que $T_1$ cuando $\alpha \gg \beta$, como señala la sección de Complejidad.'
      blocks:
        - { id: block, label: "bloque (α+β·n)", bytes: 16, offset: 0, state: answer }
---

## Qué hace

BPRAM relaja el supuesto de acceso a memoria "palabra por palabra" de PRAM
clásico: modela la transferencia de datos en bloques, por ejemplo un bloque
contiguo $A[i], A[i+1], \ldots, A[i+b-1]$ de tamaño $b$.

## Intuición

Mover un dato a la vez tiene un costo fijo de arranque cada vez que lo
haces, aunque el dato en sí sea pequeño. Si en cambio agrupas varios datos
en un solo bloque y los mueves juntos, pagas ese costo fijo una sola vez.
BPRAM hace explícita esa diferencia entre "cuántas veces inicias una
transferencia" y "cuántos datos mueves en total".

## Algoritmo

No hay un algoritmo único: BPRAM es un modelo de costo de comunicación que
se aplica a cualquier algoritmo PRAM que mueva datos en memoria.

## Pseudocódigo

```
// transferir un bloque A[i..i+b-1] en una sola operación,
// en vez de b operaciones de transferencia de un elemento
```

## C++

No aplica: modelo de costo, sin código de ejemplo propio en el material.

## Complejidad

$$T_{transferencia} = \alpha + \beta \cdot b$$

donde $\alpha$ es el costo fijo de iniciar la transferencia (latencia, del orden
de microsegundos) y $\beta$ es el costo por elemento transferido (del orden de
nanosegundos), para un bloque de tamaño $b$.

**Reasoning:** el costo total de mover datos se separa en una parte fija
($\alpha$, que se paga una vez por transferencia, sin importar cuánto se mueva) y
una parte proporcional al volumen ($\beta \cdot b$). Esta separación es la que
justifica agrupar transferencias: como generalmente $\alpha \gg \beta$, repetir el
costo fijo muchas veces (muchas transferencias pequeñas) es mucho más caro
que pagarlo una sola vez para un bloque grande.

## Ejemplo

Para transferir `n` datos de dos formas distintas:

- **n transferencias independientes de un elemento:** $T_1 = n(\alpha + \beta)$.
- **una sola transferencia en bloque de los n datos:** $T_2 = \alpha + \beta \cdot n$.

Como $\alpha \gg \beta$, $T_1$ crece con $n$ multiplicando el costo fijo $\alpha$ por $n$,
mientras que $T_2$ sólo lo paga una vez — agrupar los datos reduce
considerablemente el costo total.

## Casos especiales

Si $b = 1$ (bloques de un solo elemento), BPRAM colapsa exactamente en el
acceso palabra por palabra de PRAM clásico: $T = \alpha + \beta$, el mismo costo por
cada acceso individual.
