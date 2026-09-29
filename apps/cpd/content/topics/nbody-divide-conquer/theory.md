---
kind: theory
title: "N-Body y divide y vencerás"
visualization:
  type: dag
  steps:
    - note: "Nivel 1 ($\\log n = 3$ niveles totales): las 8 hojas se mezclan de a pares. Los 4 merges de este nivel son independientes entre sí — eso es lo que se ejecuta en pardo — y quedan activos."
      nodes:
        - { id: l1, value: 5, parent: null }
        - { id: l2, value: 3, parent: null }
        - { id: l3, value: 8, parent: null }
        - { id: l4, value: 1, parent: null }
        - { id: l5, value: 9, parent: null }
        - { id: l6, value: 2, parent: null }
        - { id: l7, value: 7, parent: null }
        - { id: l8, value: 4, parent: null }
        - { id: m1, value: "[3,5]", parent: l1, tag: merge, state: active }
        - { id: m2, value: "[1,8]", parent: l3, tag: merge, state: active }
        - { id: m3, value: "[2,9]", parent: l5, tag: merge, state: active }
        - { id: m4, value: "[4,7]", parent: l7, tag: merge, state: active }
      links:
        - { from: l1, to: m1, kind: tree }
        - { from: l2, to: m1, kind: tree }
        - { from: l3, to: m2, kind: tree }
        - { from: l4, to: m2, kind: tree }
        - { from: l5, to: m3, kind: tree }
        - { from: l6, to: m3, kind: tree }
        - { from: l7, to: m4, kind: tree }
        - { from: l8, to: m4, kind: tree }
    - note: "Nivel 2: los 4 merges del nivel 1, ya usados, quedan muted. Sólo 2 merges siguen activos, cada uno combinando dos resultados del nivel anterior en un grupo del doble de tamaño."
      nodes:
        - { id: m1, value: "[3,5]", parent: null, tag: "nivel 1", state: muted }
        - { id: m2, value: "[1,8]", parent: null, tag: "nivel 1", state: muted }
        - { id: m3, value: "[2,9]", parent: null, tag: "nivel 1", state: muted }
        - { id: m4, value: "[4,7]", parent: null, tag: "nivel 1", state: muted }
        - { id: n1, value: "[1,3,5,8]", parent: m1, tag: "nivel 2", state: active }
        - { id: n2, value: "[2,4,7,9]", parent: m3, tag: "nivel 2", state: active }
      links:
        - { from: m1, to: n1, kind: tree }
        - { from: m2, to: n1, kind: tree }
        - { from: m3, to: n2, kind: tree }
        - { from: m4, to: n2, kind: tree }
    - note: "Nivel 3 (la raíz, último de $\\log n = 3$ niveles): un único merge final combina n1 y n2 en el arreglo completo ordenado. El span $T_\\infty(n) = O(n)$ viene de que este merge final, por sí solo, ya cuesta $O(n)$ — a diferencia de la suma en árbol ($T_\\infty = O(\\log n)$), aquí el trabajo por nivel NO decrece con la altura."
      highlight: [root]
      nodes:
        - { id: n1, value: "[1,3,5,8]", parent: null, tag: "nivel 2", state: muted }
        - { id: n2, value: "[2,4,7,9]", parent: null, tag: "nivel 2", state: muted }
        - { id: root, value: "[1,2,3,4,5,7,8,9]", parent: n1, state: answer, tag: "nivel 3" }
      links:
        - { from: n1, to: root, kind: tree }
        - { from: n2, to: root, kind: tree }
---

## ¿Qué problema resuelve?

Hasta acá el curso construyó su caja de herramientas: métricas de
desempeño ([performance-metrics](/topics/performance-metrics)), un modelo
formal para diseñar ([pram-models](/topics/pram-models)), técnicas de
análisis ([pram-algorithms](/topics/pram-algorithms), [prefix-sum](/topics/prefix-sum-recurrences))
y cómo repartir datos con su costo real de comunicación
([partitioning-randomized](/topics/partitioning-randomized)). Este último
tema de la unidad aplica todo eso a dos problemas concretos con estructura
muy distinta: N-Body (partición directa de datos, sin recursión) y divide y
vencerás (partición recursiva del propio problema), usando mergesort y
multiplicación de matrices como casos de estudio.

## Intuición

**N-Body** es el problema de calcular cómo se atraen mutuamente $n$ cuerpos
(estrellas, partículas, moléculas): cada uno siente la fuerza de todos los
demás, así que hay que calcular todos los pares. Es "vergonzosamente
paralelo" en el sentido de que las fuerzas se pueden calcular
independientemente, pero el trabajo total crece con el cuadrado de $n$.

**Divide y vencerás** ataca un problema distinto: en vez de repartir datos
ya dados entre procesos, el problema mismo se parte recursivamente en
subproblemas más chicos del mismo tipo, se resuelven (recursivamente o
directamente si son pequeños) y se combinan sus soluciones. Mergesort
(ordenar) y la multiplicación de matrices por acumulación 3D son los dos
ejemplos que muestran cómo ese patrón se paraleliza.

## Estructura interna

**Problema de N-cuerpos.** La fuerza sobre el cuerpo $i$ debida a los demás
$n-1$ cuerpos es:

$$F_i = -Gm_i \sum_{1 \le j \le n,\, j \ne i} \frac{m_j\, r_{ij}}{|r_{ij}|^3}$$

No hay solución analítica cerrada desde $n = 3$ cuerpos, así que se
resuelve numéricamente: se calcula la fuerza, de ahí la aceleración, y se
integra en pasos de tiempo pequeños $\Delta t$ ($v_{t+1} = v_t + \frac{F}{m}\Delta t$,
$x_{t+1} = x_t + v\Delta t$), recalculando la fuerza en cada paso — típicamente
con un método de interpolación como *leap-frog*, porque la velocidad no es
constante dentro de $\Delta t$.

En paralelo se hace **particionamiento directo**: cada proceso se encarga de
un subgrupo de cuerpos y las fuerzas se comunican entre procesos al final.
Como cada cuerpo es afectado por los $n-1$ restantes, la complejidad es
$O(n(n-1)/p)$. Una optimización clásica es **Barnes-Hut**: agrupa cuerpos
distantes y los trata aproximadamente como un solo cuerpo equivalente, lo
que baja el trabajo a $O(n \log n / p)$. Con memoria compartida (OpenMP/CUDA)
se evita el costo de comunicación entre procesos, pero el límite es la
cantidad de núcleos disponibles; con memoria distribuida (MPI) se paga el
precio de la comunicación, pero el cluster puede escalar para mantener la
eficiencia.

**Paradigma divide y vencerás.** Tres etapas:

1. **Dividir:** separar un problema de tamaño $n$ en subproblemas más
   pequeños (de tamaño $n/b$).
2. **Vencer:** resolver cada subproblema directamente si es pequeño (caso
   base), o recursivamente si no.
3. **Combinar:** unir las soluciones parciales en la solución global.

En paralelo, partes distintas del árbol de recursión se ejecutan a la vez:
el maestro distribuye $n/p$ elementos a cada proceso (dividir), cada
proceso resuelve su subproblema directa o recursivamente (vencer), y los
resultados parciales se sincronizan en el maestro (combinar).

**Mergesort secuencial y paralelo.** El mergesort secuencial sigue
$T_s(n) = 2T_s(n/2) + O(n) = O(n \log n)$ (caso 4 de la
[tabla de recurrencias](/topics/prefix-sum-recurrences)). La versión
paralela ejecuta las dos llamadas recursivas `pardo`:

$$W(n) = 2W(n/2) + O(n) = O(n \log n)$$

El span, en cambio, sigue una recurrencia distinta porque el `Merge(A,n)`
final es inherentemente secuencial (no se puede paralelizar el merge en sí
en esta formulación):

$$T_\infty(n) = T_\infty(n/2) + O(n) = O(n)$$

**Multiplicación de matrices (acumulación 3D).** Para $C = A \cdot B$ con
matrices $n \times n$ ($n = 2^l$): el paso 1 (expansión) calcula, para cada
terna $(i,j,k)$, el producto $C'(i,j,k) \leftarrow A(i,k) \cdot B(k,j)$ de forma
totalmente independiente ($n^3$ productos). El paso 2 (reducción) suma sobre
$k$ en árbol binario, en $\log n$ niveles. El paso 3 extrae el resultado
final $C(i,j) \leftarrow C'(i,j,1)$.

## Operaciones

Este tema no tiene subtemas: `theory.md` cubre N-body (directo y
Barnes-Hut), el paradigma divide y vencerás, mergesort paralelo y
multiplicación de matrices por acumulación 3D en una sola pieza.

## Análisis de complejidad

**N-Body directo.** El número de pares de interacción es $N(N-1)/2$
(o $N(N-1)$ evaluaciones de fuerza si se cuentan ambos sentidos, como hace
el pseudocódigo secuencial del profesor con su doble `for`). Repartiendo el
cómputo de esos pares entre $p$ procesos por partición directa de cuerpos:
$T_p = O(n(n-1)/p)$.

**N-Body con Barnes-Hut.** Al aproximar clusters distantes como un único
cuerpo, se evita calcular explícitamente cada interacción par a par, bajando
el trabajo total de $O(n^2)$ a $O(n \log n)$, y con $p$ procesos:
$T_p = O(n \log(n)/p)$.

**Mergesort paralelo — aplicando Brent.** Con $W(n) = O(n \log n)$ y
$T_\infty(n) = O(n)$:

$$T_p(n,p) = O\!\left(\frac{n\log n}{p} + n\right)$$

$$S(n,p) = O\!\left(\frac{n\log n}{\frac{n\log n}{p}+n}\right), \qquad E(n,p) = O\!\left(\frac{1}{1+\frac{p}{\log n}}\right)$$

**Reasoning:** el span $T_\infty(n) = O(n)$ (en vez de $O(\log n)$ como en
la suma por reducción) es la razón por la que la eficiencia de mergesort
paralelo cae cuando $p$ crece frente a $\log n$: el merge secuencial final
domina el camino crítico y no se beneficia de más procesadores, algo que la
nota del profesor marca explícitamente como *"optimizable"* — hay variantes
de merge paralelo que sí reducen $T_\infty$, pero no están cubiertas en el
material.

**Multiplicación de matrices — aplicando Brent.** El span es $T_\infty(n) = O(\log n)$
(sólo el árbol de reducción del paso 2 tiene dependencias; el paso 1 es
$\Theta(1)$ con $n^3$ procesadores). Con $W(n) = O(n^3)$:

$$T_p(n,p) = O\!\left(\frac{n^3}{p} + \log n\right), \qquad S(n,p) = O\!\left(\frac{n^3}{\frac{n^3}{p}+\log n}\right), \qquad E(n,p) = O\!\left(\frac{1}{1+\frac{p\log n}{n^3}}\right)$$

A diferencia de mergesort, aquí el span logarítmico hace que la eficiencia
se mantenga alta para un rango mucho mayor de $p$ antes de que el término
$\log n$ empiece a pesar.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`: N-Body directo, N-Body con
Barnes-Hut, mergesort paralelo y multiplicación de matrices 3D, cada uno
con su razonamiento vía Brent donde aplica.

## Ejemplos

El pseudocódigo de N-body secuencial (clase `Nbody` con posiciones,
velocidades y masas, y la función `force` con el doble `for` sobre pares
$(i,j)$, $j \ne i$) y los pseudocódigos de `MergeSort-Paralelo` y
`Multiplicación de matrices (3D accumulation)` son los ejemplos que trae el
material — ya integrados en la sección de "Estructura interna" y "Análisis
de complejidad" de arriba, por ser inseparables de la derivación de cada
complejidad.

## Comparación con temas relacionados

| | N-Body directo | N-Body Barnes-Hut | Mergesort paralelo | Matrices 3D |
|---|---|---|---|---|
| $W(n)$ | $O(n^2)$ | $O(n \log n)$ | $O(n \log n)$ | $O(n^3)$ |
| $T_\infty(n)$ | — (partición directa, sin recursión) | — | $O(n)$ | $O(\log n)$ |
| Paradigma | Partición directa de datos | Partición directa + aproximación jerárquica | Divide y vencerás | Divide y vencerás (expansión + reducción) |

Frente al [teorema de Brent](/topics/pram-algorithms/algorithms/brent-theorem),
que da la maquinaria general $T_p \le \lceil W/p \rceil + T_\infty$, este tema aporta los $W$ y
$T_\infty$ concretos de dos algoritmos de divide y vencerás (mergesort y
multiplicación de matrices) con spans muy distintos ($O(n)$ vs. $O(\log n)$)
que ilustran por qué el span, no sólo el trabajo, determina qué tan bien
escala un algoritmo.

## Prueba de dominio

- Explicar por qué N-Body directo es $O(n^2)$ de trabajo y qué gana
  Barnes-Hut al aproximar clusters distantes.
- Explicar las tres etapas del paradigma divide y vencerás y cómo se
  paralelizan (dividir = distribuir, vencer = recursión/caso base, combinar
  = sincronizar en el maestro).
- Derivar $W(n)$ y $T_\infty(n)$ de mergesort paralelo, y explicar por qué
  el span es $O(n)$ y no $O(\log n)$.
- Derivar $W(n)$ y $T_\infty(n)$ de la multiplicación de matrices por
  acumulación 3D, y contrastar su span logarítmico con el de mergesort.
- Aplicar el teorema de Brent a ambos algoritmos de divide y vencerás para
  obtener $T_p(n,p)$, $S(n,p)$ y $E(n,p)$.
