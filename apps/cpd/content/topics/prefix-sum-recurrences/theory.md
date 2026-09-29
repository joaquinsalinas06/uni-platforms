---
kind: theory
title: "Prefix-sum (scan) y recurrencias"
visualization:
  type: dag
  steps:
    - note: "Upsweep nivel 1 ($h=1$ de $\\log n = 3$): se combinan pares de hojas adyacentes: $B(1,j) \\leftarrow A(2j-1) \\cdot A(2j)$. Los 4 resultados de este nivel quedan activos; las 8 hojas originales no se vuelven a tocar después de este nivel."
      nodes:
        - { id: a1, value: 2, parent: null, tag: "A(1)" }
        - { id: a2, value: 5, parent: null, tag: "A(2)" }
        - { id: a3, value: 1, parent: null, tag: "A(3)" }
        - { id: a4, value: 4, parent: null, tag: "A(4)" }
        - { id: a5, value: 3, parent: null, tag: "A(5)" }
        - { id: a6, value: 7, parent: null, tag: "A(6)" }
        - { id: a7, value: 6, parent: null, tag: "A(7)" }
        - { id: a8, value: 0, parent: null, tag: "A(8)" }
        - { id: b11, value: 7, parent: a1, tag: "B(1,1)", state: active }
        - { id: b12, value: 5, parent: a3, tag: "B(1,2)", state: active }
        - { id: b13, value: 10, parent: a5, tag: "B(1,3)", state: active }
        - { id: b14, value: 6, parent: a7, tag: "B(1,4)", state: active }
      links:
        - { from: a1, to: b11, kind: tree }
        - { from: a2, to: b11, kind: tree }
        - { from: a3, to: b12, kind: tree }
        - { from: a4, to: b12, kind: tree }
        - { from: a5, to: b13, kind: tree }
        - { from: a6, to: b13, kind: tree }
        - { from: a7, to: b14, kind: tree }
        - { from: a8, to: b14, kind: tree }
    - note: "Upsweep nivel 2 ($h=2$ de $\\log n = 3$): se combinan pares de $B(1,*)$: $B(2,j) \\leftarrow B(1,2j-1) \\cdot B(1,2j)$. $B(1,1..4)$, ya usados, quedan muted; los 2 resultados de este nivel quedan activos."
      nodes:
        - { id: b11, value: 7, parent: null, tag: "B(1,1)", state: muted }
        - { id: b12, value: 5, parent: null, tag: "B(1,2)", state: muted }
        - { id: b13, value: 10, parent: null, tag: "B(1,3)", state: muted }
        - { id: b14, value: 6, parent: null, tag: "B(1,4)", state: muted }
        - { id: b21, value: 12, parent: b11, tag: "B(2,1)", state: active }
        - { id: b22, value: 16, parent: b13, tag: "B(2,2)", state: active }
      links:
        - { from: b11, to: b21, kind: tree }
        - { from: b12, to: b21, kind: tree }
        - { from: b13, to: b22, kind: tree }
        - { from: b14, to: b22, kind: tree }
    - note: "Upsweep nivel 3 ($h=3=\\log n$, la raíz): $B(3,1) \\leftarrow B(2,1) \\cdot B(2,2)$ es la suma total de los 8 elementos. $B(2,1)$ y $B(2,2)$, ya usados, quedan muted. Esto por sí solo no da el prefix-sum, sólo construye el árbol de sumas parciales."
      highlight: ["b31"]
      nodes:
        - { id: b21, value: 12, parent: null, tag: "B(2,1)", state: muted }
        - { id: b22, value: 16, parent: null, tag: "B(2,2)", state: muted }
        - { id: b31, value: 28, parent: b21, state: active, tag: "B(3,1)" }
      links:
        - { from: b21, to: b31, kind: tree }
        - { from: b22, to: b31, kind: tree }
    - note: "Downsweep nivel 3→2 ($h=\\log n=3$, base del descenso): $C(3,1) \\leftarrow B(3,1)$ — el prefijo del nivel raíz es la suma total, que baja al siguiente nivel como punto de partida."
      nodes:
        - { id: croot, value: 28, parent: null, tag: "C(3,1)", state: active }
      links: []
    - note: "Downsweep nivel 2 ($h=2$): $C(2,1) \\leftarrow B(2,1)$ (índice impar, hereda directo de la base) y $C(2,2) \\leftarrow C(3,1)$ (índice par, hereda directo del prefijo del padre). $C(3,1)$ queda muted una vez usado."
      nodes:
        - { id: croot, value: 28, parent: null, tag: "C(3,1)", state: muted }
        - { id: c1, value: 12, parent: croot, tag: "C(2,1)=B(2,1)", state: active }
        - { id: c2, value: 28, parent: croot, tag: "C(2,2)", state: active }
      links:
        - { from: croot, to: c1, kind: tree }
        - { from: croot, to: c2, kind: tree }
    - note: "Downsweep nivel 1 ($h=1$): $C(1,1) \\leftarrow B(1,1)$ (base) y $C(1,2) \\leftarrow C(2,1)$ combinado con $B(1,2)$ (índice par que hereda el prefijo del padre). $C(2,1)$ y $C(2,2)$ quedan muted."
      highlight: ["c3", "c4"]
      nodes:
        - { id: c1, value: 12, parent: null, tag: "C(2,1)", state: muted }
        - { id: c2, value: 28, parent: null, tag: "C(2,2)", state: muted }
        - { id: c3, value: 7, parent: c1, tag: "C(1,1)", state: active }
        - { id: c4, value: 12, parent: c1, tag: "C(1,2)", state: active }
      links:
        - { from: c1, to: c3, kind: tree }
        - { from: c1, to: c4, kind: tree }
    - note: "Lectura final: bajando un nivel más se obtienen los $n=8$ prefijos individuales $s_1..s_8$ (uno por hoja). $C(1,1)$ y $C(1,2)$, ya usados, quedan muted. Este es el paso que realmente entrega el resultado del prefix-sum."
      nodes:
        - { id: c3, value: 7, parent: null, tag: "C(1,1)", state: muted }
        - { id: c4, value: 12, parent: null, tag: "C(1,2)", state: muted }
        - { id: cfinal, value: "s1..s8", parent: c3, state: answer }
      links:
        - { from: c3, to: cfinal, kind: tree }
        - { from: c4, to: cfinal, kind: tree }
---

## ¿Qué problema resuelve?

Los [algoritmos PRAM ya vistos](/topics/pram-algorithms) resuelven
problemas que se reducen a un único valor (OR, AND, máximo, suma total).
Muchas veces hace falta algo más fino: no sólo la suma total, sino la suma
acumulada *hasta cada posición* (el prefix-sum o scan). Este tema muestra
cómo resolver eso en paralelo, no recursiva y recursivamente, y de paso
formaliza las recurrencias que aparecen constantemente al analizar
algoritmos de este tipo.

## Intuición

El prefix-sum de una secuencia da, en cada posición $i$, el resultado de
combinar todos los elementos desde el primero hasta el `i`-ésimo. La
[suma por reducción en árbol](/topics/pram-algorithms/algorithms/sum-reduction)
ya construye, subiendo por el árbol, todas las sumas parciales que hacen
falta (*upsweep*); lo que falta es *bajar* por ese mismo árbol repartiendo a
cada hoja el prefijo que le corresponde (*downsweep*). Es como enterarte
primero del total acumulado en cada bloque grande, y después ir refinando
ese acumulado hacia bloques cada vez más chicos hasta llegar a cada
elemento individual.

## Estructura interna

**Prefix-sum no recursivo.** Dada una secuencia $\{x_1, ..., x_n\}$ sobre un
conjunto con operación binaria asociativa $*$, el prefix-sum es
$s_i = x_1 * x_2 * ... * x_i$ para $1 \le i \le n$. El algoritmo trabaja sobre una
matriz `B`/`C` de $\log n + 1$ niveles:

- **Paso 1:** copiar `A` a la fila base de `B`.
- **Paso 2 (upsweep):** por cada nivel $h = 1..\log n$, combinar pares
  $B(h,j) \leftarrow B(h-1, 2j-1) \cdot B(h-1, 2j)$.
- **Paso 3 (downsweep):** por cada nivel $h = \log n..0$, calcular $C(h,j)$:
  si $j$ es par, hereda directo el prefijo del nivel superior
  ($C(h,j) \leftarrow C(h+1, j/2)$); si $j = 1$, es la base ($C(h,1) \leftarrow B(h,1)$); en
  otro caso, combina el prefijo heredado con el propio $B(h,j)$.

**Prefix-sum recursivo.** Combina pares adyacentes ($y_i = x_{2i-1} \cdot x_{2i}$),
resuelve recursivamente el prefix-sum de esa secuencia reducida a la mitad,
y reconstruye los prefijos originales a partir de los prefijos de la mitad y
los elementos impares originales.

**Recurrencias.** El análisis de ambas versiones (y de muchos otros
algoritmos de este curso) depende de resolver recurrencias por sustitución
repetida — la tabla de recurrencias clásicas es el resultado reutilizable
que sale de este tema.

## Operaciones

Este tema no tiene subtemas: `theory.md` cubre la versión no recursiva, la
recursiva, la tabla de recurrencias y el ejercicio aplicado en una sola
pieza.

## Análisis de complejidad

**Prefix-sum no recursivo.** El paso 1 hace $n$ operaciones. El paso 2
(upsweep) suma, por nivel $m$ ($1 \le m \le k$, con $n = 2^k$), $W_{2,m} = n/2^m$
operaciones; sumando la serie geométrica completa converge a $O(n)$. El
paso 3 (downsweep) suma $W_{3,m} = 2^m$ por nivel, que también converge a
$O(n)$. En total:

$$W(n) = n + n\left(1 - \frac{1}{n}\right) + 2n - 1 = O(n)$$

El tiempo es $2 \cdot O(\log n)$ (subida y bajada del árbol) más el paso constante
de copia: $T(n) = O(\log n)$.

**Algoritmo por proceso ($p < n$).** Aplicando
[Brent](/topics/pram-algorithms/algorithms/brent-theorem) con
$W(n) = O(n)$ y $T(n) = O(\log n)$:

$$\frac{W(n)}{p} \le T(n,p) \le \frac{W(n)}{p} + T(n) \;\Rightarrow\; O\!\left(\frac{n}{p}\right) \le T(n,p) \le O\!\left(\frac{n}{p} + \log n\right)$$

$$S(n,p) = \frac{O(n)}{O(n/p + \log n)}, \qquad E(n,p) = \frac{O(n/p)}{O(n/p + \log n)} = \frac{O(1)}{O(1 + p\log n / n)}$$

**Prefix-sum recursivo.** La recurrencia de tiempo es $T(n) = T(n/2) + a$
(con $a$ constante, por el trabajo de combinar en cada nivel de recursión),
que se resuelve como el caso 2 de la tabla de recurrencias: $T(n) = O(\log n)$.
El trabajo sigue $W(n) = W(n/2) + b \cdot n$ (con $b$ constante), que se resuelve
como el caso 3 de la tabla: $W(n) = O(n)$.

**Tabla de recurrencias clásicas.** Estas cuatro recurrencias se resuelven
por sustitución repetida (expandir la recurrencia hasta llegar al caso
base) y reaparecen en el análisis de muchos algoritmos de este curso:

| Recurrencia | Solución | Derivación |
|---|---|---|
| $f(n) = f(n-1) + n$ | $\Theta(n^2)$ | $f(n) = f(1) + 2 + 3 + ... + n = n(n+1)/2 - 1$ |
| $f(n) = f(n/2) + 1$ | $\Theta(\log n)$ | se suma 1 cada vez que $n$ se divide entre 2, $\log n$ veces |
| $f(n) = f(n/2) + n$ | $\Theta(n)$ | $f(n) = n + n/2 + n/4 + ...$, serie geométrica que converge a $2n$ |
| $f(n) = 2f(n/2) + n$ | $\Theta(n \log n)$ | en cada uno de los $\log n$ niveles de recursión se paga $n$ en total |

## Tabla de complejidad

La tabla se genera desde `meta.yaml` con `W(n)` y `T(n)` de ambas versiones
(no recursiva y recursiva) de prefix-sum. La tabla de recurrencias clásicas
de arriba complementa esa tabla explicando de dónde salen las cotas
logarítmicas y lineales que reaparecen en todo el curso.

## Ejemplos

**Ejemplo resuelto: prefix-sum de 8 elementos** (el mismo esquema de las
diapositivas del profesor). En el paso 1 se ejecutan $n = 8$ operaciones. En
el paso 2, los niveles ejecutan $4, 2, 1$ operaciones respectivamente
($\sum n/2^m$ para $m = 1, 2, 3$). En el paso 3, los niveles ejecutan
$1, 2, 4, 8$ operaciones ($\sum 2^m$ para $m = 0, 1, 2, 3$). Sumando todo,
$W(8) = 8 + 7 + 15 = 30 = O(n)$, consistente con la cota general.

**Ejercicio aplicado (participación): los 4 cajeros de banco.** Un banco
tiene 4 cajeros (procesadores): `C1` y `C2` comparten un espacio de memoria,
igual que `C3` y `C4`, pero entre los dos grupos sólo pueden intercambiar
información por red. Cualquier cajero puede depositar o retirar de la
cuenta `v`. Preguntas del ejercicio: definir el paradigma más adecuado y
diseñar el PRAM correspondiente; clasificar el problema según la taxonomía
de Flynn; y evaluar si un PRAM CRCW aplica aquí. El material lo deja
planteado como ejercicio de participación, sin solución dada.

## Comparación con temas relacionados

| | No recursivo | Recursivo |
|---|---|---|
| Estructura | Upsweep + downsweep explícitos, en 3 pasos | Reducción a la mitad + reconstrucción, en una llamada recursiva |
| $W(n)$ | $O(n)$ (derivación por series geométricas) | $O(n)$ (vía recurrencia $W(n)=W(n/2)+bn$) |
| $T(n)$ | $O(\log n)$ (dos recorridos de árbol) | $O(\log n)$ (vía recurrencia $T(n)=T(n/2)+a$) |

Ambas versiones logran la misma complejidad asintótica; la diferencia es de
estilo de diseño (iterativo por niveles vs. recursivo), igual que la
[suma por reducción](/topics/pram-algorithms/algorithms/sum-reduction) de la
que este algoritmo es una extensión directa (upsweep = esa misma reducción).

## Prueba de dominio

- Explicar la diferencia entre upsweep y downsweep en el prefix-sum no
  recursivo, y por qué ambos son necesarios.
- Derivar $W(n) = O(n)$ y $T(n) = O(\log n)$ del prefix-sum no recursivo a
  partir de las series geométricas de cada paso.
- Plantear y resolver la recurrencia de tiempo y de trabajo del prefix-sum
  recursivo.
- Resolver de memoria las cuatro recurrencias clásicas de la tabla, por
  sustitución repetida.
- Aplicar el teorema de Brent al prefix-sum para estimar $S(n,p)$ y
  $E(n,p)$.
