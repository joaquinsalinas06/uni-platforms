---
kind: theory
title: "Algoritmos PRAM y teorema de Brent"
visualization:
  type: dag
  steps:
    - note: "Nivel 0: los 8 números de entrada, todavía sueltos. El árbol de reducción está vacío — nada se ha combinado."
      nodes:
        - { id: a1, value: 2, parent: null }
        - { id: a2, value: 5, parent: null }
        - { id: a3, value: 1, parent: null }
        - { id: a4, value: 4, parent: null }
        - { id: a5, value: 3, parent: null }
        - { id: a6, value: 7, parent: null }
        - { id: a7, value: 6, parent: null }
        - { id: a8, value: 0, parent: null }
      links: []
    - note: "Nivel 1 (log2(8) empieza a bajar): 4 procesadores combinan pares de hojas en paralelo (a1+a2, a3+a4, a5+a6, a7+a8). Las hojas ya usadas se oscurecen (muted): siguen visibles como referencia pero ya no son el frente de trabajo."
      nodes:
        - { id: a1, value: 2, parent: null, state: muted }
        - { id: a2, value: 5, parent: null, state: muted }
        - { id: a3, value: 1, parent: null, state: muted }
        - { id: a4, value: 4, parent: null, state: muted }
        - { id: a5, value: 3, parent: null, state: muted }
        - { id: a6, value: 7, parent: null, state: muted }
        - { id: a7, value: 6, parent: null, state: muted }
        - { id: a8, value: 0, parent: null, state: muted }
        - { id: b1, value: 7, parent: a1, state: active }
        - { id: b2, value: 5, parent: a3, state: active }
        - { id: b3, value: 10, parent: a5, state: active }
        - { id: b4, value: 6, parent: a7, state: active }
      links:
        - { from: a1, to: b1, kind: tree }
        - { from: a2, to: b1, kind: tree }
        - { from: a3, to: b2, kind: tree }
        - { from: a4, to: b2, kind: tree }
        - { from: a5, to: b3, kind: tree }
        - { from: a6, to: b3, kind: tree }
        - { from: a7, to: b4, kind: tree }
        - { from: a8, to: b4, kind: tree }
    - note: "Nivel 2: sólo 2 procesadores siguen trabajando — combinan los 4 valores del nivel anterior en 2 sumas parciales (c1=b1+b2, c2=b3+b4). El trabajo por nivel se sigue reduciendo a la mitad, pero el span sólo baja de a un nivel a la vez."
      nodes:
        - { id: a1, value: 2, parent: null, state: muted }
        - { id: a2, value: 5, parent: null, state: muted }
        - { id: a3, value: 1, parent: null, state: muted }
        - { id: a4, value: 4, parent: null, state: muted }
        - { id: a5, value: 3, parent: null, state: muted }
        - { id: a6, value: 7, parent: null, state: muted }
        - { id: a7, value: 6, parent: null, state: muted }
        - { id: a8, value: 0, parent: null, state: muted }
        - { id: b1, value: 7, parent: a1, state: muted }
        - { id: b2, value: 5, parent: a3, state: muted }
        - { id: b3, value: 10, parent: a5, state: muted }
        - { id: b4, value: 6, parent: a7, state: muted }
        - { id: c1, value: 12, parent: b1, state: active }
        - { id: c2, value: 16, parent: b3, state: active }
      links:
        - { from: a1, to: b1, kind: tree }
        - { from: a2, to: b1, kind: tree }
        - { from: a3, to: b2, kind: tree }
        - { from: a4, to: b2, kind: tree }
        - { from: a5, to: b3, kind: tree }
        - { from: a6, to: b3, kind: tree }
        - { from: a7, to: b4, kind: tree }
        - { from: a8, to: b4, kind: tree }
        - { from: b1, to: c1, kind: tree }
        - { from: b2, to: c1, kind: tree }
        - { from: b3, to: c2, kind: tree }
        - { from: b4, to: c2, kind: tree }
    - note: 'Nivel 3 (el último, $\log_2(8) = 3$): el procesador restante combina c1+c2 en el resultado final. Se necesitaron exactamente $\log_2(n) = 3$ niveles paralelos — ese es el span $T_\infty$; el trabajo total fueron 4+2+1=7 sumas, decreciendo por nivel hasta $O(n)$.'
      highlight: ["s1"]
      nodes:
        - { id: a1, value: 2, parent: null, state: muted }
        - { id: a2, value: 5, parent: null, state: muted }
        - { id: a3, value: 1, parent: null, state: muted }
        - { id: a4, value: 4, parent: null, state: muted }
        - { id: a5, value: 3, parent: null, state: muted }
        - { id: a6, value: 7, parent: null, state: muted }
        - { id: a7, value: 6, parent: null, state: muted }
        - { id: a8, value: 0, parent: null, state: muted }
        - { id: b1, value: 7, parent: a1, state: muted }
        - { id: b2, value: 5, parent: a3, state: muted }
        - { id: b3, value: 10, parent: a5, state: muted }
        - { id: b4, value: 6, parent: a7, state: muted }
        - { id: c1, value: 12, parent: b1, state: muted }
        - { id: c2, value: 16, parent: b3, state: muted }
        - { id: s1, value: 28, parent: c1, state: answer }
      links:
        - { from: a1, to: b1, kind: tree }
        - { from: a2, to: b1, kind: tree }
        - { from: a3, to: b2, kind: tree }
        - { from: a4, to: b2, kind: tree }
        - { from: a5, to: b3, kind: tree }
        - { from: a6, to: b3, kind: tree }
        - { from: a7, to: b4, kind: tree }
        - { from: a8, to: b4, kind: tree }
        - { from: b1, to: c1, kind: tree }
        - { from: b2, to: c1, kind: tree }
        - { from: b3, to: c2, kind: tree }
        - { from: b4, to: c2, kind: tree }
        - { from: c1, to: s1, kind: tree }
        - { from: c2, to: s1, kind: tree }
    - note: 'Leer el resultado: S ← s1 = 28. El teorema de Brent usa exactamente este par ($W(n) = O(n)$, $T_\infty(n) = O(\log n)$) para acotar cuánto tarda esta misma suma con cualquier número real de procesadores $p$.'
      caption: "$S = 28$"
      highlight: ["s1"]
      nodes:
        - { id: a1, value: 2, parent: null, state: muted }
        - { id: a2, value: 5, parent: null, state: muted }
        - { id: a3, value: 1, parent: null, state: muted }
        - { id: a4, value: 4, parent: null, state: muted }
        - { id: a5, value: 3, parent: null, state: muted }
        - { id: a6, value: 7, parent: null, state: muted }
        - { id: a7, value: 6, parent: null, state: muted }
        - { id: a8, value: 0, parent: null, state: muted }
        - { id: b1, value: 7, parent: a1, state: muted }
        - { id: b2, value: 5, parent: a3, state: muted }
        - { id: b3, value: 10, parent: a5, state: muted }
        - { id: b4, value: 6, parent: a7, state: muted }
        - { id: c1, value: 12, parent: b1, state: muted }
        - { id: c2, value: 16, parent: b3, state: muted }
        - { id: s1, value: 28, parent: c1, state: answer }
      links:
        - { from: a1, to: b1, kind: tree }
        - { from: a2, to: b1, kind: tree }
        - { from: a3, to: b2, kind: tree }
        - { from: a4, to: b2, kind: tree }
        - { from: a5, to: b3, kind: tree }
        - { from: a6, to: b3, kind: tree }
        - { from: a7, to: b4, kind: tree }
        - { from: a8, to: b4, kind: tree }
        - { from: b1, to: c1, kind: tree }
        - { from: b2, to: c1, kind: tree }
        - { from: b3, to: c2, kind: tree }
        - { from: b4, to: c2, kind: tree }
        - { from: c1, to: s1, kind: tree }
        - { from: c2, to: s1, kind: tree }
---

## ¿Qué problema resuelve?

[PRAM y sus extensiones](/topics/pram-models) dan el modelo formal, pero
todavía falta responder algo muy concreto: dado un algoritmo diseñado para
un número ilimitado de procesadores (su versión "ideal", con trabajo $W(n)$
y span $T_\infty(n)$), ¿cuánto tarda si en la práctica sólo tenemos $p$
procesadores, con $p \ll n$? El teorema de Brent responde exactamente esa
pregunta, y los algoritmos PRAM resueltos aquí (OR/AND global, máximo, suma)
son los ejemplos concretos donde se aplica.

## Intuición

Piensa en repartir $W$ unidades de trabajo entre $p$ trabajadores, pero
algunas de esas unidades no se pueden hacer hasta que otras terminen (hay
dependencias). El camino más largo de dependencias ($T_\infty$, el span) es un
piso que ni con infinitos trabajadores puedes bajar. El resto del trabajo sí
se puede repartir parejo entre los $p$ disponibles. Brent junta ambas ideas:
el tiempo real está limitado por lo que cuesta repartir el trabajo
($W/p$) más lo que cuesta esperar la cadena de dependencias ($T_\infty$).

## Estructura interna

**Paradigma Work-Time.** El diseño de un algoritmo paralelo se analiza bajo
dos criterios independientes de $p$:

- **Trabajo $W(n)$:** cantidad total de operaciones (equivalente al costo
  del mejor algoritmo secuencial).
- **Span/profundidad $T_\infty(n)$:** número de pasos paralelos con procesadores
  ilimitados — el camino crítico de dependencias.

**Teorema de Brent.** Dado un algoritmo con trabajo $W(n)$ y span $T_\infty(n)$,
ejecutarlo en un PRAM con $p$ procesadores toma:

$$T_p(n,p) \le \left\lceil \frac{W(n)}{p} \right\rceil + T_\infty(n)$$

Esto da un límite superior constructivo: no hace falta rediseñar el
algoritmo para cada $p$ distinto, basta con saber $W(n)$ y $T_\infty(n)$ del
algoritmo ideal.

**Los cuatro algoritmos PRAM del tema** son ejemplos de análisis Work-Time
completo: Global OR y Global AND resuelven un problema de decisión en
$T_\infty = \Theta(1)$ bajo CRCW combinado; máximo de $n$ números lo reduce a un Global
AND sobre comparaciones por pares; suma por reducción en árbol construye el
$W(n) = O(n)$, $T_\infty(n) = O(\log n)$ que Brent usa para acotar $T_p$.

## Operaciones

1. [OR global](/topics/pram-algorithms/algorithms/or-reduction) — CRCW, $T_\infty=\Theta(1)$.
2. [AND global](/topics/pram-algorithms/algorithms/and-reduction) — CRCW, análogo a OR.
3. [Máximo de n números](/topics/pram-algorithms/algorithms/max-reduction) — se reduce a un AND global sobre comparaciones.
4. [Suma por reducción en árbol binario](/topics/pram-algorithms/algorithms/sum-reduction) — $W=O(n)$, $T_\infty=O(\log n)$, WT-óptimo.
5. [Teorema de Brent](/topics/pram-algorithms/algorithms/brent-theorem) — la cota general $T_p \le \lceil W/p \rceil + T_\infty$, con su derivación completa.

## Análisis de complejidad

La derivación completa del teorema de Brent está en su propio archivo (es
el subtema central de este tema). En términos generales: durante los
$T_\infty(n)$ pasos del camino crítico se hace al menos una unidad de trabajo por
paso. Eso deja $W(n) - T_\infty(n)$ unidades de trabajo restantes, que sí se
pueden repartir libremente entre los $p$ procesadores disponibles:

$$T_p \le T_\infty + \frac{W - T_\infty}{p} = \frac{W}{p} + \left(1 - \frac{1}{p}\right) T_\infty = O\!\left(\frac{W}{p} + T_\infty\right)$$

Cada uno de los cuatro algoritmos (OR, AND, máximo, suma) calcula
explícitamente su $W(n)$ y $T_\infty(n)$ para poder aplicar esta cota — ver el
razonamiento propio de cada uno en su archivo.

## Tabla de complejidad

La tabla se genera desde `meta.yaml` con la cota general de Brent. Las
complejidades específicas de cada algoritmo ($W$ y $T_\infty$ de OR, AND, máximo y
suma) están en la tabla de su propio archivo bajo `algorithms/`.

## Ejemplos

Cada algoritmo trae su propio ejemplo numérico resuelto en su archivo. El
ejemplo numérico general de Brent ($W=1000$, $T_\infty=20$, comparando $p=10$ vs.
$p=100$) está en [brent-theorem](/topics/pram-algorithms/algorithms/brent-theorem).

## Comparación con temas relacionados

| Algoritmo | $T_\infty(n)$ | $W(n)$ | Modelo PRAM |
|---|---|---|---|
| OR global | $\Theta(1)$ | $\Theta(n)$ | CRCW combinado |
| AND global | $\Theta(1)$ | $\Theta(n)$ | CRCW combinado |
| Máximo de n | $\Theta(1)$ (vía AND) | $\Theta(n^2)$ (comparaciones por pares) | CRCW |
| Suma por reducción | $O(\log n)$ | $O(n)$ | CREW |

OR y AND global logran speedup lineal ($T_\infty = \Theta(1)$) a costa de necesitar
$n$ procesadores y escritura concurrente combinada; la suma por reducción es
más "realista" ($T_\infty = O(\log n)$, sólo necesita CREW) y es la que se
generaliza directamente al [prefix-sum](/topics/prefix-sum-recurrences), que
usa la misma estructura de árbol binario.

## Prueba de dominio

- Enunciar el teorema de Brent y derivarlo desde la idea de repartir
  $W - T_\infty$ unidades de trabajo restantes entre $p$ procesadores.
- Calcular $W(n)$ y $T_\infty(n)$ de OR global, AND global, máximo y suma por
  reducción, y justificar cada uno con el pseudocódigo.
- Explicar por qué máximo de $n$ números se puede resolver con un Global AND
  sobre una matriz de comparaciones.
- Aplicar Brent con valores concretos de $W$, $T_\infty$ y $p$ para estimar $T_p$.
