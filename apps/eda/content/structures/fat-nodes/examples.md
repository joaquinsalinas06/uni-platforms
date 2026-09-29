---
kind: examples
title: Ejemplos
---

## Mínimo

*(Derivado del pseudocódigo; no aparece en las diapositivas.)* Un nodo
`v` recién creado, con `valor = 10` y registro vacío. `leerCampo(v, valor,
0)` devuelve `10` — el valor original, porque el registro no tiene ninguna
entrada. Es el caso base explícito del profesor: "si no hay ninguna, se
usa el valor original del nodo" (página 24). Ninguna escritura sobre este
nodo dispara un split todavía: hace falta llenar el registro ($2p$
entradas) antes de que
[node-split](/structures/fat-nodes/operations/node-split) entre en juego.

## Normal

*(Derivado de la descripción; no aparece en las diapositivas.)* Con
$p = 2$ ($2p = 4$ entradas máximo por registro). Un nodo `n` nace con
`valor = 20` en `t = 0`, con un único predecesor `a1` que apunta a él.

1. `escribirCampo(n, valor, 200, t=1)` — registro: 1 de 4 entradas.
2. `escribirCampo(n, valor, 201, t=2)` — registro: 2 de 4.
3. `escribirCampo(n, valor, 202, t=3)` — registro: 3 de 4.
4. `escribirCampo(n, valor, 203, t=4)` — registro: 4 de 4 (**lleno**).

En este punto, `leerCampo(n, valor, 4)` devuelve `203`, y `leerCampo(n,
valor, 1)` sigue devolviendo `200` — cada versión intermedia sigue siendo
consultable, exactamente lo que promete la persistencia parcial.

5. `escribirCampo(n, valor, 999, t=5)` — el registro ya tenía $2p = 4$
   entradas: se dispara
   [node-split](/structures/fat-nodes/operations/node-split). Nace `n'`
   con `valor original = 203` (el valor vigente en `t=4`) y registro
   vacío; se agrega `(valor, 999, 5)` a `n'`. El predecesor `a1` se
   redirige: su propio campo `siguiente` recibe una nueva entrada
   `(siguiente, n', 5)` en su registro — una escritura más, no una
   mutación directa.

Después del split: `leerCampo(a1.siguiente, valor, 5)` sigue el puntero de
`a1` en `t=5` (que ahora es `n'`) y devuelve `999`; `leerCampo(a1.siguiente,
valor, 4)` sigue el puntero de `a1` en `t=4` (que en esa versión todavía
es `n`, el viejo) y devuelve `203`. El nodo `n` queda congelado, con su
registro lleno, intacto para siempre como respuesta a versiones $\le 4$.

## Límite

*(Derivado de la descripción; no aparece en las diapositivas.)* El caso
límite central de todo el análisis (páginas 25-26) es exactamente el
registro lleno ($2p$ modificaciones) descrito arriba — no un caso raro
sino el que dispara la mitad del argumento de potencial. Lo que lo vuelve
"límite" en el sentido de peor caso es cuando ocurre con $p$ en su máximo:
un nodo con el número máximo de predecesores permitido por la hipótesis
del teorema ($p = O(1)$), todos apuntando al mismo nodo, y todos
necesitando redirección en el mismo split.

Con $p = 2$ y dos predecesores `a1`, `a2` apuntando a un nodo compartido
`n` cuyo registro se llena: la escritura que dispara el split paga
$O(1)$ (nodo nuevo) $+ O(p) = O(2)$ (redirigir a `a1` y a `a2`, una
escritura de campo por cada uno). El costo real de *este* split es mayor
que el de un split con $p = 1$, pero el análisis de potencial muestra que
sigue siendo $O(1)$ **amortizado**: el registro viejo libera $2p$
unidades de potencial, y las $p$ redirecciones cuestan a lo más $p$
unidades — la diferencia $-2p + p = -p$ paga exactamente el $O(p)$ real
que costó redirigir. **Esta es la estructura que el propio análisis de
potencial "arregla"**: sin él, un split con $p$ predecesores parecería
costar $O(p)$ cada vez; con él, se ve que ese costo queda cubierto por el
potencial que el mismo nodo acumuló al llenar su registro.

Si $p$ no fuera $O(1)$ (caso que el mazo no discute, sólo dice que "no
aplica"), este mismo split dejaría de ser $O(1)$ amortizado: el argumento
$\hat{c}_i = O(p) - p$ sólo es $O(1)$ porque $p$ es una constante fija por
hipótesis, no una cantidad que crece con $n$.
