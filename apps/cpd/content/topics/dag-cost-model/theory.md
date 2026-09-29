---
kind: theory
title: "DAGs: trabajo, span y clasificación SPA/NSPA"
visualization:
  type: dag
  steps:
    - note: >-
        Ejemplo 3 del profesor (caso a: n=16, p=8): particionamiento en
        primitive tasks — 8 sumas de a pares sobre los 16 números de
        entrada. Cada tarea es O(1), así que cada una aporta 1 al trabajo
        total W.
      highlight: ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7"]
      nodes:
        - { id: l0, value: "+", tag: "t1", parent: null }
        - { id: l1, value: "+", tag: "t2", parent: null }
        - { id: l2, value: "+", tag: "t3", parent: null }
        - { id: l3, value: "+", tag: "t4", parent: null }
        - { id: l4, value: "+", tag: "t5", parent: null }
        - { id: l5, value: "+", tag: "t6", parent: null }
        - { id: l6, value: "+", tag: "t7", parent: null }
        - { id: l7, value: "+", tag: "t8", parent: null }
      links: []
    - note: >-
        Nivel 2: se combinan los 8 resultados parciales en pares (4 tareas
        más). El span acumulado hasta aquí es 2 niveles.
      highlight: ["m0", "m1", "m2", "m3"]
      nodes:
        - { id: l0, value: "+", tag: "t1", parent: null }
        - { id: l1, value: "+", tag: "t2", parent: null }
        - { id: l2, value: "+", tag: "t3", parent: null }
        - { id: l3, value: "+", tag: "t4", parent: null }
        - { id: l4, value: "+", tag: "t5", parent: null }
        - { id: l5, value: "+", tag: "t6", parent: null }
        - { id: l6, value: "+", tag: "t7", parent: null }
        - { id: l7, value: "+", tag: "t8", parent: null }
        - { id: m0, value: "+", tag: "t9", parent: null }
        - { id: m1, value: "+", tag: "t10", parent: null }
        - { id: m2, value: "+", tag: "t11", parent: null }
        - { id: m3, value: "+", tag: "t12", parent: null }
      links:
        - { from: l0, to: m0, kind: tree }
        - { from: l1, to: m0, kind: tree }
        - { from: l2, to: m1, kind: tree }
        - { from: l3, to: m1, kind: tree }
        - { from: l4, to: m2, kind: tree }
        - { from: l5, to: m2, kind: tree }
        - { from: l6, to: m3, kind: tree }
        - { from: l7, to: m3, kind: tree }
    - note: >-
        Nivel 3: se combinan los 4 resultados en pares (2 tareas más). Con
        p=8 disponibles, cada nivel corre en paralelo — el span crece de a
        un nivel por vez.
      highlight: ["n0", "n1"]
      nodes:
        - { id: l0, value: "+", tag: "t1", parent: null }
        - { id: l1, value: "+", tag: "t2", parent: null }
        - { id: l2, value: "+", tag: "t3", parent: null }
        - { id: l3, value: "+", tag: "t4", parent: null }
        - { id: l4, value: "+", tag: "t5", parent: null }
        - { id: l5, value: "+", tag: "t6", parent: null }
        - { id: l6, value: "+", tag: "t7", parent: null }
        - { id: l7, value: "+", tag: "t8", parent: null }
        - { id: m0, value: "+", tag: "t9", parent: null }
        - { id: m1, value: "+", tag: "t10", parent: null }
        - { id: m2, value: "+", tag: "t11", parent: null }
        - { id: m3, value: "+", tag: "t12", parent: null }
        - { id: n0, value: "+", tag: "t13", parent: null }
        - { id: n1, value: "+", tag: "t14", parent: null }
      links:
        - { from: l0, to: m0, kind: tree }
        - { from: l1, to: m0, kind: tree }
        - { from: l2, to: m1, kind: tree }
        - { from: l3, to: m1, kind: tree }
        - { from: l4, to: m2, kind: tree }
        - { from: l5, to: m2, kind: tree }
        - { from: l6, to: m3, kind: tree }
        - { from: l7, to: m3, kind: tree }
        - { from: m0, to: n0, kind: tree }
        - { from: m1, to: n0, kind: tree }
        - { from: m2, to: n1, kind: tree }
        - { from: m3, to: n1, kind: tree }
    - note: >-
        Nivel 4 (raíz): última suma. El camino l0→m0→n0→r es un camino
        crítico de longitud 4 — no el único, pero uno de los más largos —
        y da el span $T_\infty = 4$. El trabajo total es $W = 15$ (número
        de nodos), $T_s = 15$, $S = T_s/T_\infty = 15/4$ y
        $E = S/p = (15/4)/8 = 0.47$.
      highlight: ["l0", "m0", "n0", "r"]
      nodes:
        - { id: l0, value: "+", tag: "t1", parent: null }
        - { id: l1, value: "+", tag: "t2", parent: null }
        - { id: l2, value: "+", tag: "t3", parent: null }
        - { id: l3, value: "+", tag: "t4", parent: null }
        - { id: l4, value: "+", tag: "t5", parent: null }
        - { id: l5, value: "+", tag: "t6", parent: null }
        - { id: l6, value: "+", tag: "t7", parent: null }
        - { id: l7, value: "+", tag: "t8", parent: null }
        - { id: m0, value: "+", tag: "t9", parent: null }
        - { id: m1, value: "+", tag: "t10", parent: null }
        - { id: m2, value: "+", tag: "t11", parent: null }
        - { id: m3, value: "+", tag: "t12", parent: null }
        - { id: n0, value: "+", tag: "t13", parent: null }
        - { id: n1, value: "+", tag: "t14", parent: null }
        - { id: r, value: "+", tag: "t15", parent: null }
      links:
        - { from: l0, to: m0, kind: tree }
        - { from: l1, to: m0, kind: tree }
        - { from: l2, to: m1, kind: tree }
        - { from: l3, to: m1, kind: tree }
        - { from: l4, to: m2, kind: tree }
        - { from: l5, to: m2, kind: tree }
        - { from: l6, to: m3, kind: tree }
        - { from: l7, to: m3, kind: tree }
        - { from: m0, to: n0, kind: tree }
        - { from: m1, to: n0, kind: tree }
        - { from: m2, to: n1, kind: tree }
        - { from: m3, to: n1, kind: tree }
        - { from: n0, to: r, kind: tree }
        - { from: n1, to: r, kind: tree }
---

## ¿Qué problema resuelve?

Foster da un método de diseño, pero no una forma matemática de comparar
"qué tan bueno" es el resultado, ni de decidir si conviene usar más o menos
procesadores. El modelo DAG (Directed Acyclic Graph) resuelve eso: da una
representación formal de un algoritmo paralelo —qué tareas pueden correr al
mismo tiempo y cuáles deben esperar— junto con un modelo de costo (trabajo,
span, speedup, eficiencia) que permite comparar distintos diseños del mismo
problema de forma cuantitativa, sin depender de una arquitectura concreta.

## Intuición

Un DAG dibuja el algoritmo como una red de tareas conectadas por flechas de
dependencia: si hay una flecha de $A$ a $B$, $B$ no puede empezar hasta que
$A$ termine. Dos números importan de este dibujo: cuánto trabajo hay en
total (todas las tareas sumadas, como si un solo procesador las hiciera una
por una) y cuál es el camino más largo de dependencias (el que ningún
número de procesadores puede acortar, porque es una cadena estricta). El
primero acota cuánto se puede ganar repartiendo trabajo entre procesadores;
el segundo acota cuánto se puede ganar sin importar cuántos procesadores se
usen.

## Estructura interna

Un DAG es un grafo $G = (V, E)$ donde $V$ es el conjunto de vértices o nodos
y $E$ el conjunto de aristas dirigidas, sin ciclos dirigidos. En computación
paralela se interpreta así: los **vértices** representan tareas
(instrucciones simples o en bloque) y las **aristas** representan canales de
comunicación (dependencias) — la misma abstracción tarea/canal de
[/topics/flynn-foster-pcam](/topics/flynn-foster-pcam).

**Clasificación de algoritmos según su DAG:**

- **Secuenciales:** no pueden paralelizarse porque todas las tareas tienen
  dependencia en tareas previas (una cadena $T_0 \to T_1 \to T_2 \to \cdots$).
- **Paralelos:** todas las tareas pueden ejecutarse simultáneamente (sin
  ninguna arista entre ellas).
- **SPA (Secuencial-Paralelo):** el algoritmo está separado en niveles que
  se ejecutan en paralelo, pero esos niveles tienen una forma secuencial de
  ejecución entre sí (nivel $i$ depende del nivel $i-1$ completo).
- **NSPA (No-Secuencial-Paralelo):** el algoritmo no sigue ninguno de los
  patrones anteriores; sus dependencias forman una estructura irregular sin
  niveles limpios.

**Modelo de costo del DAG.** El *scheduling* (plan de ejecución) de un DAG
asigna a cada nodo $i$ un tiempo de ejecución $t_i$ tal que, si
$(i, i+1) \in E$, el tiempo acumulado es $T_{i+1} = T_i + t_{i+1}$ (si las
tareas son $O(1)$, $T_{i+1} = T_i + 1$), y un procesador $p_i$,
$i \in \{0, \dots, p-1\}$. En algunos casos los nodos de entrada
corresponden a $t_0 = 0$.

- **Span ($T_\infty$):** el algoritmo paralelo correspondiente se ejecuta en
  $$T_\infty = \text{MAX}\left(\sum t_i\right)$$
  la longitud del plan de ejecución más largo — el camino crítico del DAG.
- **Trabajo ($W$):** la cantidad total de operaciones (instrucciones), es
  decir, la complejidad secuencial $T_s$. Se busca que el DAG tenga trabajo
  mínimo y span (profundidad) mínimo. El trabajo equivale al tiempo
  secuencial óptimo: $W(n) = T_s^*(n)$.
- **Cota por trabajo:** en paralelo, $p$ procesos ejecutarán por lo menos
  $T_s/p$ unidades de tiempo: $T_p \geq T_s/p$ — ver `work-lower-bound` en
  la tabla de complejidad.
- **Speedup:** $S = T_s / T_p$. Un speedup igual (o proporcional) a $p$ es
  un speedup lineal óptimo, ya que $S = T_s/T_p \leq p$.
- **Cota por span:** para el span, o camino crítico del DAG,
  $T_p \geq T_\infty$ — ver `span-lower-bound` en la tabla de complejidad.

## Operaciones

Este tema no tiene subtemas propios (`algorithms/` o `models/`): el modelo
de costo DAG se documenta íntegramente en este `theory.md`. Se apoya
directamente en la abstracción tarea/canal de
[/topics/flynn-foster-pcam](/topics/flynn-foster-pcam).

## Análisis de complejidad

Las dos cotas fundamentales del modelo —`span-lower-bound` y
`work-lower-bound`— ya están derivadas arriba, en Estructura interna. Aquí
se muestra cómo el profesor las aplica en sus ejemplos resueltos.

**Ejemplo 2 — función recursiva.** Para $f(x) = x$ si $x \leq 1$, y
$f(x) = f(x-1) + f(x-2)$ si $x > 1$ (con $(a,b) = (f(x-1) \,||\, f(x-2))$
ejecutados en paralelo), el trabajo y el span se definen por recurrencia:

$$W(n) = 1 \text{ si } n \leq 1, \qquad W(n) = W(n-1) + W(n-2) + 1$$

$$T_\infty(n) = 1 \text{ si } n \leq 1, \qquad T_\infty(n) = \text{MAX}(T_\infty(n-1), T_\infty(n-2)) + 1$$

La solución recursiva permite obtener una expresión cerrada para
$T_\infty$: como el máximo de las dos ramas recursivas siempre elige la más
profunda, $T_\infty(n)$ crece linealmente con $n$ (cada llamada añade
exactamente un nivel de profundidad), mientras que $W(n)$ crece como la
propia recurrencia de Fibonacci (exponencial en $n$) — de ahí que este DAG
tenga mucho paralelismo potencial ($W/T_\infty$ grande) aunque su span sea
lineal.

**Ejemplo 3 — suma de 16 números.** Se pide construir un DAG eficiente para
sumar $n=16$ enteros en paralelo con $p=8$ procesadores (caso a) y
compararlo con $p=5$ (caso b), determinando $T_s$, $T_\infty(n)$, $W(n)$,
$S(n)$ y la clasificación según Flynn en cada caso. Contabilizando pasos en
cada DAG:

- **Caso a) $p=8$:** $T_s(n{=}16) = 15$, $T_\infty(n{=}16) = 4$,
  $W(n{=}16) = 15$, $S(n) = 15/4$, $E(n) = (15/4)/8 = 0{,}47$.
- **Caso b) $p=5$:** $T_s(n{=}16) = 15$, $T_\infty(n{=}16) = 5$,
  $W(n{=}16) = 15$, $S(n) = 15/5$, $E(n) = (15/5)/5 = 0{,}60$.

El profesor aclara que se usa la misma operación en cada nodo, lo que
permite calcular estas cantidades por simple conteo de aristas —esto no es
posible si las operaciones entre nodos difieren, como en el Ejemplo 4—. Se
observa un menor speedup pero una mayor eficiencia en el caso b): se
explica por el mayor aprovechamiento de los recursos disponibles (menos
procesadores ociosos por unidad de trabajo).

**Ejemplo 4 — DAG con dependencias de datos.** Para el código

```cpp
double a[N], b[N], c[N], v=0.0, w=0.0;
T1(a,&v);
T2(b,&w);
T3(b,&v);
T4(c,&w);
T5(c,&v);
T6(a,&w);
```

donde cada función lee y modifica ambos argumentos, se pide determinar
$T_s$, $T_\infty(n)$, $W(n)$, $S(n)$ asumiendo primero complejidad constante
para todas las tareas, y luego recalcular si $T_1, T_2, T_5$ son $O(n)$,
$T_3(n) = O(n \log n)$, $T_4(n) = O(\log n)$ y $T_6(n) = O(n^2)$.

> **Nota de apoyo** (no está en el material): el enunciado del Ejemplo 4 no
> trae la solución numérica en los apuntes fuente disponibles para esta
> unidad — se deja planteado tal como lo presenta el profesor, ya que
> resolverlo requiere primero construir el DAG de dependencias
> lectura/escritura entre `T1..T6` sobre `a,b,c,v,w`, que no está dibujado
> en el material.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`: las dos cotas generales
($T_p \geq T_\infty$, $T_p \geq T_s/p$) y los dos resultados numéricos del
Ejemplo 3 ($n=16$ con $p=8$ y con $p=5$).

## Ejemplos

**Ejemplo 1 (DAG con $W=18$, $T_\infty=9$).** Dado un DAG de 18 tareas
($T_1$ a $T_{18}$) con complejidad constante por tarea, el profesor
determina directamente $W = 18$ (número total de tareas, equivale a la
complejidad secuencial) y $T_\infty = 9$ (longitud del camino crítico,
contando aristas del nodo raíz al nodo hoja más profundo).

Los ejemplos 2, 3 y 4 (función recursiva, suma de 16 números, DAG con
dependencias de datos) están desarrollados en la sección de análisis de
complejidad de arriba, tal como los resuelve el profesor.

## Comparación con temas relacionados

| | Método de Foster (PCAM) | Modelo DAG |
|---|---|---|
| Qué produce | un plan de tasks/channels a partir de un problema | un grafo con costo (trabajo, span) a partir de ese plan |
| Qué mide | cómo particionar/comunicar/aglomerar/mapear | cuánto tiempo mínimo puede tomar la ejecución resultante |
| Relación | ver [/topics/flynn-foster-pcam](/topics/flynn-foster-pcam) | formaliza cuantitativamente el resultado de aplicar Foster |

Dentro del propio modelo DAG, la clasificación Secuencial vs. Paralelo vs.
SPA vs. NSPA es una jerarquía de "cuánto puede aprovecharse el paralelismo":
un DAG secuencial tiene $T_\infty = W$ (sin ganancia posible), mientras que
uno puramente paralelo tiene $T_\infty = 1$ tarea (ganancia máxima, limitada
sólo por $p$); SPA y NSPA quedan entre ambos extremos.

## Prueba de dominio

- Definir $G=(V,E)$ para un DAG de cómputo paralelo y explicar qué
  representan vértices y aristas.
- Clasificar un DAG dado como Secuencial, Paralelo, SPA o NSPA.
- Calcular $W$ y $T_\infty$ de un DAG concreto por conteo de nodos y del
  camino crítico.
- Derivar y aplicar las dos cotas $T_p \geq T_s/p$ y $T_p \geq T_\infty$, y
  explicar por qué ambas son necesarias (una depende de $p$, la otra no).
- Calcular $S = T_s/T_p$ y $E = S/p$ para un caso concreto, y explicar por
  qué un mayor $p$ no siempre da mayor eficiencia (Ejemplo 3, casos a y b).
- Plantear la recurrencia de $W(n)$ y $T_\infty(n)$ para un DAG generado por
  una función recursiva (Ejemplo 2).
