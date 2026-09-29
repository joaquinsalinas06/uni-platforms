---
kind: theory
title: "Taxonomía de Flynn y método de Foster (PCAM)"
visualization:
  type: dag
  steps:
    - note: >-
        Particionamiento (paso 1 de Foster): se divide la suma secuencial en
        primitive tasks, cada una responsable de sumar un bloque de números.
        Esta es una versión reducida y derivada del ejercicio de la
        Participación 2 (topología lineal), sólo para poder dibujar el
        grafo tarea/canal — el material original razona sobre n=10^12.
      highlight: ["t0", "t1", "t2", "t3"]
      nodes:
        - { id: t0, value: "T0", tag: "task", parent: null }
        - { id: t1, value: "T1", tag: "task", parent: null }
        - { id: t2, value: "T2", tag: "task", parent: null }
        - { id: t3, value: "T3", tag: "task", parent: null }
      links: []
    - note: >-
        Comunicación (paso 2): cada task envía su suma parcial a la
        siguiente mediante un channel — la topología lineal de la Propuesta
        1 de la Participación 2. El envío es asíncrono, el recibo es
        síncrono (bloquea a quien recibe hasta que el dato llegue).
      highlight: ["t0-t1", "t1-t2", "t2-t3"]
      nodes:
        - { id: t0, value: "T0", tag: "task", parent: null }
        - { id: t1, value: "T1", tag: "task", parent: null }
        - { id: t2, value: "T2", tag: "task", parent: null }
        - { id: t3, value: "T3", tag: "task", parent: null }
      links:
        - { from: t0, to: t1, kind: tree, label: "channel" }
        - { from: t1, to: t2, kind: tree, label: "channel" }
        - { from: t2, to: t3, kind: tree, label: "channel" }
    - note: >-
        Aglomeración + Mapping (pasos 3 y 4): se agrupan tasks vecinas para
        reducir el número de channels activos y se asigna cada grupo a un
        proceso — el criterio de aglomeración de la Participación 2 es
        reducir canales agrupando más números por task antes de mapear a
        procesos (cada proceso suma como máximo 10^9 números).
      highlight: ["p0", "p1"]
      nodes:
        - { id: p0, value: "P0", tag: "proceso", parent: null }
        - { id: p1, value: "P1", tag: "proceso", parent: null }
      links:
        - { from: p0, to: p1, kind: tree, label: "channel" }
    - note: >-
        Comparación lineal vs. árbol (1/6): versión a escala de la
        Participación 2 con 8 procesos en vez de los $10^3$ procesos-hoja
        reales que resultan de aglomerar $10^{12}$ números en bloques de
        $10^9$. Topología lineal: relevo secuencial, paso 1 de 7 — P1
        recibe de P0.
      highlight: ["p1"]
      nodes:
        - { id: p0, value: "P0", tag: "proceso", parent: null }
        - { id: p1, value: "P1", tag: "proceso", parent: null, state: active }
        - { id: p2, value: "P2", tag: "proceso", parent: null, state: idle }
        - { id: p3, value: "P3", tag: "proceso", parent: null, state: idle }
        - { id: p4, value: "P4", tag: "proceso", parent: null, state: idle }
        - { id: p5, value: "P5", tag: "proceso", parent: null, state: idle }
        - { id: p6, value: "P6", tag: "proceso", parent: null, state: idle }
        - { id: p7, value: "P7", tag: "proceso", parent: null, state: idle }
      links:
        - { from: p0, to: p1, kind: tree, label: "channel" }
    - note: >-
        Comparación lineal vs. árbol (2/6): el relevo avanza — P4 recién
        recibió, pero para llegar hasta ahí tuvo que esperar a que P1, P2 y
        P3 terminaran en fila, uno detrás de otro. Con 8 procesos son 7
        canales en línea recta; con los $10^3$ procesos reales de la
        Participación 2 son $10^3$ canales en fila — de ahí la complejidad
        de comunicación final de la Propuesta 1.
      highlight: ["p4"]
      nodes:
        - { id: p0, value: "P0", tag: "proceso", parent: null, state: muted }
        - { id: p1, value: "P1", tag: "proceso", parent: null, state: muted }
        - { id: p2, value: "P2", tag: "proceso", parent: null, state: muted }
        - { id: p3, value: "P3", tag: "proceso", parent: null, state: muted }
        - { id: p4, value: "P4", tag: "proceso", parent: null, state: active }
        - { id: p5, value: "P5", tag: "proceso", parent: null, state: idle }
        - { id: p6, value: "P6", tag: "proceso", parent: null, state: idle }
        - { id: p7, value: "P7", tag: "proceso", parent: null, state: idle }
      links:
        - { from: p0, to: p1, kind: tree, label: "channel" }
        - { from: p1, to: p2, kind: tree, label: "channel" }
        - { from: p2, to: p3, kind: tree, label: "channel" }
        - { from: p3, to: p4, kind: tree, label: "channel" }
    - note: >-
        Comparación lineal vs. árbol (3/6): cadena completa — P7 (el último)
        sólo puede sumar su bloque al acumulado una vez que los 7 anteriores
        ya terminaron. Profundidad de la cadena: $p - 1 = 7$ pasos para 8
        procesos. Escalado a la Participación 2 ($10^3$ procesos-hoja tras
        aglomerar $10^{12}$ números en bloques de $10^9$), esa misma cadena
        tiene $10^3 - 1 \approx 10^3$ pasos/canales en fila — el número que
        reporta la Propuesta 1.
      highlight: ["p7"]
      nodes:
        - { id: p0, value: "P0", tag: "proceso", parent: null, state: muted }
        - { id: p1, value: "P1", tag: "proceso", parent: null, state: muted }
        - { id: p2, value: "P2", tag: "proceso", parent: null, state: muted }
        - { id: p3, value: "P3", tag: "proceso", parent: null, state: muted }
        - { id: p4, value: "P4", tag: "proceso", parent: null, state: muted }
        - { id: p5, value: "P5", tag: "proceso", parent: null, state: muted }
        - { id: p6, value: "P6", tag: "proceso", parent: null, state: muted }
        - { id: p7, value: "P7", tag: "proceso", parent: null, state: answer }
      links:
        - { from: p0, to: p1, kind: tree, label: "channel" }
        - { from: p1, to: p2, kind: tree, label: "channel" }
        - { from: p2, to: p3, kind: tree, label: "channel" }
        - { from: p3, to: p4, kind: tree, label: "channel" }
        - { from: p4, to: p5, kind: tree, label: "channel" }
        - { from: p5, to: p6, kind: tree, label: "channel" }
        - { from: p6, to: p7, kind: tree, label: "channel" }
    - note: >-
        Comparación lineal vs. árbol (4/6): los mismos 8 procesos,
        reorganizados en árbol binario (Propuesta 2). Nivel 1: 4 pares se
        combinan **al mismo tiempo** (q0..q3), no en fila — a diferencia de
        la cadena, ningún par espera al otro.
      highlight: ["q0", "q1", "q2", "q3"]
      nodes:
        - { id: p0, value: "P0", tag: "proceso", parent: null, state: muted }
        - { id: p1, value: "P1", tag: "proceso", parent: null, state: muted }
        - { id: p2, value: "P2", tag: "proceso", parent: null, state: muted }
        - { id: p3, value: "P3", tag: "proceso", parent: null, state: muted }
        - { id: p4, value: "P4", tag: "proceso", parent: null, state: muted }
        - { id: p5, value: "P5", tag: "proceso", parent: null, state: muted }
        - { id: p6, value: "P6", tag: "proceso", parent: null, state: muted }
        - { id: p7, value: "P7", tag: "proceso", parent: null, state: muted }
        - { id: q0, value: "Q0", parent: p0, state: active }
        - { id: q1, value: "Q1", parent: p2, state: active }
        - { id: q2, value: "Q2", parent: p4, state: active }
        - { id: q3, value: "Q3", parent: p6, state: active }
      links:
        - { from: p0, to: q0, kind: tree, label: "channel" }
        - { from: p1, to: q0, kind: tree, label: "channel" }
        - { from: p2, to: q1, kind: tree, label: "channel" }
        - { from: p3, to: q1, kind: tree, label: "channel" }
        - { from: p4, to: q2, kind: tree, label: "channel" }
        - { from: p5, to: q2, kind: tree, label: "channel" }
        - { from: p6, to: q3, kind: tree, label: "channel" }
        - { from: p7, to: q3, kind: tree, label: "channel" }
    - note: >-
        Comparación lineal vs. árbol (5/6): nivel 2, los 4 resultados
        anteriores (ahora `muted`) se combinan en 2 pares (r0, r1) — sigue
        en paralelo, un solo paso más de profundidad.
      highlight: ["r0", "r1"]
      nodes:
        - { id: q0, value: "Q0", tag: "nivel 1", parent: null, state: muted }
        - { id: q1, value: "Q1", tag: "nivel 1", parent: null, state: muted }
        - { id: q2, value: "Q2", tag: "nivel 1", parent: null, state: muted }
        - { id: q3, value: "Q3", tag: "nivel 1", parent: null, state: muted }
        - { id: r0, value: "R0", parent: q0, state: active }
        - { id: r1, value: "R1", parent: q2, state: active }
      links:
        - { from: q0, to: r0, kind: tree, label: "channel" }
        - { from: q1, to: r0, kind: tree, label: "channel" }
        - { from: q2, to: r1, kind: tree, label: "channel" }
        - { from: q3, to: r1, kind: tree, label: "channel" }
    - note: >-
        Comparación lineal vs. árbol (6/6): nivel 3 (el último), r0 y r1 se
        combinan en el resultado. Profundidad total del árbol para 8
        procesos: $\log_2(8) = 3$ pasos, contra los 7 de la cadena lineal.
        Escalado a los $10^3$ procesos-hoja reales de la Participación 2,
        el árbol binario necesita sólo $\log_2(10^3) \approx 10$ niveles —
        de ahí los **10 pasos** de la Propuesta 2, frente a los $10^3$
        canales en fila de la Propuesta 1. La cantidad de canales y de
        tareas primitivas no cambia entre ambas propuestas (ver texto); lo
        que cambia es esta profundidad de dependencia secuencial.
      highlight: ["s"]
      nodes:
        - { id: r0, value: "R0", tag: "nivel 2", parent: null, state: muted }
        - { id: r1, value: "R1", tag: "nivel 2", parent: null, state: muted }
        - { id: s, value: "S", tag: "resultado", parent: r0, state: answer }
      links:
        - { from: r0, to: s, kind: tree, label: "channel" }
        - { from: r1, to: s, kind: tree, label: "channel" }
---

## ¿Qué problema resuelve?

Conocido el modelo secuencial y sus límites (ver
[/topics/sequential-model-architectures](/topics/sequential-model-architectures)),
faltan dos cosas: un vocabulario para **clasificar** las arquitecturas
paralelas disponibles (taxonomía de Flynn) y un **método sistemático** para
diseñar un programa paralelo desde cero, en vez de paralelizar a ojo (método
de Foster). En el diseño de una solución paralela conviven tres componentes:
el algoritmo (PRAM, DAG, paradigmas), el performance (speedup, eficiencia,
escalabilidad, precisión) y la topología (canales óptimos de comunicación);
este tema cubre el primero y sienta las bases del segundo.

## Intuición

La taxonomía de Flynn responde a una sola pregunta: ¿cuántos flujos de
instrucciones y cuántos flujos de datos procesa la arquitectura a la vez? El
método de Foster responde a otra: dado un problema secuencial, ¿cómo lo
descompongo, cómo hago que sus piezas se comuniquen, cómo las agrupo para no
pagar de más por esa comunicación, y a qué procesos las asigno? Son dos
preguntas independientes —una de hardware, otra de diseño de algoritmo— que
se complementan: Foster termina, en su primer paso, escogiendo el paradigma
(compartido, distribuido, híbrido) más cercano al problema, y ese paradigma
se apoya en arquitecturas que Flynn ya clasificó.

## Estructura interna

### Taxonomía de Flynn

Clasificación de arquitecturas de computadoras propuesta por Michael J.
Flynn (1966), basada en el número de flujos de instrucciones y de datos que
puede procesar una arquitectura en paralelo:

- **SISD (Single Instruction Single Data):** procesadores secuenciales que
  ejecutan una instrucción sobre una unidad de memoria. La arquitectura Von
  Neumann es SISD. Ejemplo: microcontroladores.
- **SIMD (Single Instruction Multiple Data):** una única instrucción (tarea)
  se ejecuta en uno o más núcleos sobre múltiples *data streams*, en forma
  simultánea. Ejemplos de arquitectura: GPUs, arquitecturas vectoriales.
  Algoritmos típicos: suma de vectores, filtros de imagen.
- **MIMD (Multiple Instruction Multiple Data):** múltiples tareas en
  múltiples procesos se ejecutan en distintos *data streams* en forma
  simultánea. Ejemplos de arquitectura: memoria compartida o distribuida,
  GPUs modernas en modo GPGPU. Algoritmos típicos: multiplicación de
  matrices con hilos independientes, N-Body paralelo.
- **MISD (Multiple Instruction Single Data):** múltiples procesos ejecutan
  distintas instrucciones sobre la misma data. Ejemplo: sistemas tolerantes
  a fallos en tiempo real (sistemas de navegación aérea).

### Método de Foster: tasks y channels

El método fue propuesto por Ian Foster en el contexto de su trabajo en
computación paralela durante los años 1980–1990, y sistematizado en
*Designing and Building Parallel Programs* (1995). Se apoya en dos
abstracciones fundamentales:

- **Task:** programa, memoria local y puertos de entrada/salida.
- **Channel:** mensaje que conecta la salida de un task con la entrada de
  otro; define la dependencia entre tasks.

Características del modelo task/channel:

- Un cálculo en paralelo consiste de dos o más tasks que se ejecutan en
  forma concurrente/simultánea.
- Cada task es **secuencial** en memoria local.
- Los tasks realizan lectura, escritura, envío y recibo de datos, creación
  de nuevos tasks y término de los mismos.
- El **envío** de datos es **asíncrono**; el **recibo** es **síncrono**
  (causa bloqueo).
- La entrada/salida de datos hacia/desde tasks se conecta a través de colas
  de mensajes (channels) que pueden crearse y destruirse.
- Los tasks pueden asignarse a uno o varios procesos.

Propiedades que se buscan: **performance** (vía el mapeo de tasks a procesos
y la implementación de channels), **independencia** (el resultado de un
task no depende de en qué proceso se ejecute), **modularidad** (un task
encapsula data y cómputo, los puertos de comunicación son su interfaz) y
**determinismo** (generalmente requerido en algoritmos paralelos).

### Método de Foster: PCAM

El método propone cuatro pasos, en este orden:

**1. Particionamiento (Partition).** Divide datos y tareas en piezas
(subdominios). Un buen particionamiento separa datos y tareas en muchas
piezas pequeñas. Se puede aplicar:

- **Descomposición del dominio:** divide la data en piezas y luego
  determina qué tareas se ejecutan en cada pieza (típicamente la data de
  mayor tamaño o a la que se accede con más frecuencia).
- **Descomposición funcional:** divide la tarea en piezas y luego determina
  qué data ejecuta cada pieza.

En ambos casos se busca la mayor cantidad de piezas posible (*primitive
tasks*), que dan un límite superior al paralelismo. Reglas de un buen
particionamiento: la cantidad de primitive tasks es al menos un orden de
magnitud mayor que la cantidad de procesos disponibles (punto de partida
para un diseño más sofisticado); las primitive tasks son aproximadamente
del mismo tamaño (particionamiento óptimo); y la cantidad de tasks crece
con el tamaño del problema (escalabilidad).

**2. Comunicación (Communicate).** Define la comunicación entre los tasks
del paso 1. Existen dos tipos:

- **Local:** un task necesita información de un número pequeño de otros
  tasks.
- **Global:** un número significativo de tasks debe interactuar.

La comunicación se realiza vía channels abiertos entre tasks y se considera
un *overhead* del algoritmo paralelo, porque no existe en la versión
secuencial. Se busca que la comunicación sea balanceada entre tasks, que
cada task comunique sólo a un número pequeño de vecinos, y que tasks puedan
comunicar y ejecutar tareas en forma concurrente.

**3. Aglomeración (Agglomerate).** Agrupa tasks para elevar performance o
simplificar la programación. Busca reducir el overhead —agrupando tasks que
implican comunicación, tasks que no pueden ser concurrentes, o tasks que
envían y reciben para reducir la latencia— y garantizar que el diseño
escale para aprovechar al máximo los recursos (procesos) disponibles.

**4. Mapeo (Map).** Asigna tasks a procesos. Se busca maximizar la
utilización de procesos (cómputo balanceado) y minimizar la comunicación
entre ellos (tasks dependientes se asignan al mismo proceso). Se puede
asignar tanto un único task como múltiples tasks por proceso, y considerar
balanceo:

- **Estático:** cada task ejecuta el mismo cálculo y se comunica con un
  número fijo de vecinos; la data se distribuye entre los procesos
  equitativamente.
- **Dinámico:** cada proceso recibe un número variable de tasks para
  compensar el desbalance de carga.

### Estrategia de diseño de un algoritmo en paralelo

El problema de diseño de un algoritmo paralelo tiene dos direcciones: dado
un algoritmo, buscar la arquitectura adecuada; o —el caso clásico— dada una
arquitectura, buscar el algoritmo adecuado, lo cual requiere identificar
tareas con o por procesos (threads), diseñar un plan de ejecución
(*scheduling*) según las dependencias y el I/O, e identificar los puntos de
comunicación entre procesos y de I/O. Los principales problemas que
aparecen son desbalance de cargas, cuellos de botella y comunicación. El
profesor propone iterar: aplicar Foster y escoger el paradigma más cercano
al problema (compartido, distribuido, híbrido) → desarrollar el algoritmo
según ese paradigma (pseudocódigo/código) → evaluar métricas de
sincronización y comunicación (un mal diseño de comunicación implica mayor
costo computacional; una mala sincronización origina tiempos muertos) → si
el código no es eficiente, volver al primer paso.

Los objetivos (métricas) del diseño son, en orden: primero, minimizar el
tiempo total de ejecución (tiempo de cálculo, optimizado asignando tareas a
procesadores distintos para maximizar concurrencia; tiempo de comunicación,
asignando tareas independientes a cada proceso; y tiempo de ocio, evitando
inactividad); segundo, mantener o mejorar la precisión del algoritmo
secuencial correspondiente — problema no trivial, porque existe una
tensión entre complejidad y precisión.

## Operaciones

Este tema no tiene subtemas propios (`algorithms/` o `models/`): la
taxonomía de Flynn y el método PCAM se documentan íntegramente en este
`theory.md`. El modelo de costo por DAG que formaliza el trabajo y el span
de un algoritmo paralelo se cubre en
[/topics/dag-cost-model](/topics/dag-cost-model).

## Análisis de complejidad

El profesor no da una fórmula de complejidad genérica para Flynn ni para
PCAM en sí (son un marco de clasificación y un método de diseño, no un
algoritmo con costo propio), pero sí resuelve numéricamente la
Participación 2, comparando dos topologías de comunicación para paralelizar
la suma de $n = 10^{12}$ números, con $T_{comp} = 10^{-9}$ s por suma y
$T_{comm} = 10^{-8}$ s/byte de ancho de banda:

**Propuesta 1 — suma lineal.** Particionamiento: suma de dos números por
task, topología lineal → $10^{12} - 1$ tareas. Comunicación: $10^{12} - 2$
canales. Aglomeración: agrupando $10^5$ números por task, los canales se
reducen a $10^7$. Mapeo: como cada proceso suma como máximo $10^9$ números,
la complejidad de comunicación final se reduce a $10^3$ canales.

$$T_s = 10^{12} \cdot 10^{-9} = 1000 \text{ s (suma acumulada secuencial)}$$

$$T_p = 10^{9}\cdot 10^{-9} + 10^{3}\cdot 10^{-9} + 10^{3}\cdot 8\cdot 10^{-8} \approx 1{,}00008 \text{ s}$$

($10^9$ sumas por proceso + $10^3$ sumas de vecinos + $10^3$ envíos entre
procesos) — ver `suma-n-lineal-p12` en la tabla de complejidad.

**Propuesta 2 — suma por reducción (árbol binario).** Particionamiento:
suma de dos números por task, topología de árbol binario →
$2\cdot10^{12}/2 - 1$ tareas, acumulando por pares en cada nivel.
Comunicación: $10^{12} - 2$ canales. Aglomeración: igual criterio, agrupando
$10^5$ números por task → $10^7$ canales. Mapeo: igual límite de $10^9$
números por proceso → $10^3$ canales... salvo que, al tratarse de un árbol
binario, el camino de acumulación entre vecinos se reduce a **10** pasos en
vez de $10^3$:

$$T_p = 10^{9}\cdot 10^{-9} + 10\cdot 10^{-9} + 10\cdot 8\cdot 10^{-8} \approx 1{,}0000008 \text{ s}$$

— ver `suma-n-arbol-p12` en la tabla de complejidad. En ambos casos
$T_p \ll T_s$: el tiempo en paralelo es muchísimo menor que el secuencial.
El profesor señala explícitamente que la cantidad de canales y tareas
primitivas, y el resultado del mapeo, **no cambian** entre ambas
propuestas; lo que cambia es cómo se distribuyen las tareas en paralelo, lo
que sí afecta el tiempo de ejecución — aunque la diferencia es mínima
porque el término dominante en este ejercicio es de **cómputo**
(*compute bound*), no de comunicación.

## Tabla de complejidad

La tabla se genera desde `meta.yaml` con los dos tiempos totales de
ejecución de la Participación 2 ($T_p$ para topología lineal y para árbol
binario). Ninguna de las dos es una cota asintótica en $n$: son tiempos
numéricos concretos, derivados para el valor fijo $n = 10^{12}$ que plantea
el enunciado.

## Ejemplos

**Participación 2 (Foster):** "Describa los pasos necesarios para
paralelizar la suma secuencial de $n$ números, utilizando el método de
Foster. Aplique el método para $n=10^{12}$ e indique la cantidad óptima de
procesadores necesarios para paralelizar esta tarea en forma eficiente.
Desarrolle los 4 pasos de Foster [...]. Mapeo: cada proceso puede sumar como
máximo $10^9$ números." Resuelto íntegramente en la sección de análisis de
complejidad de arriba (propuestas 1 y 2).

> **Nota de apoyo** (no está en el material): el bloque de visualización de
> arriba usa una versión reducida (4 tareas en vez de $10^{12}$) del grafo
> tarea/canal de la Propuesta 1, sólo para poder dibujarlo — el razonamiento
> numérico completo sigue siendo el de la Participación 2 tal como la
> resolvió el profesor. Los últimos 6 pasos de ese mismo bloque muestran,
> con 8 procesos a escala, de dónde sale la diferencia entre los $10^3$
> canales de la Propuesta 1 (cadena de profundidad $p-1$) y los 10 pasos de
> la Propuesta 2 (árbol de profundidad $\log_2 p$).

## Comparación con temas relacionados

| | Taxonomía de Flynn | Método de Foster (PCAM) |
|---|---|---|
| Qué clasifica/produce | arquitecturas de hardware, por flujos de instrucción/datos | un plan de descomposición de un algoritmo en tasks/channels |
| Cuándo se usa | para elegir/reconocer el hardware disponible | para diseñar el algoritmo paralelo en sí |
| Depende de | [/topics/sequential-model-architectures](/topics/sequential-model-architectures) (arquitectura Von Neumann como caso SISD) | de la arquitectura elegida vía Flynn, en el primer paso del ciclo de diseño |

Ambos se relacionan con [/topics/dag-cost-model](/topics/dag-cost-model): el
grafo tarea/canal de Foster es, en esencia, el mismo tipo de estructura
(nodos = tareas, aristas = dependencias/comunicación) que formaliza el
modelo DAG con su noción de trabajo y span.

## Prueba de dominio

- Clasificar un algoritmo o arquitectura dada en SISD/SIMD/MISD/MIMD, con
  justificación.
- Explicar la diferencia entre task y channel, y por qué el envío es
  asíncrono pero el recibo es síncrono.
- Enumerar y explicar, en orden, los 4 pasos de PCAM y qué overhead o
  problema ataca cada uno.
- Distinguir balanceo de carga estático de dinámico.
- Resolver la Participación 2 completa: dado $T_{comp}$, $T_{comm}$ y un
  límite de números por proceso, calcular $T_s$ y $T_p$ para una topología
  lineal y una de árbol binario, y explicar por qué la diferencia entre
  ambas es mínima en este caso (compute bound).
