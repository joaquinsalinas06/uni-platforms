---
kind: theory
title: "Modelo secuencial y arquitecturas paralelas"
visualization:
  type: timeline
  steps:
    - note: "Instrucción 1: LOAD A. Fetch trae la instrucción desde memoria, Decode determina que es una carga, Execute la ejecuta leyendo el valor de A desde memoria. Fetch y Decode ya se completaron (muted) cuando Execute es el frente de trabajo."
      caption: "I1: LOAD A"
      lanes:
        - { id: cpu, label: "CPU" }
        - { id: mem, label: "Memoria" }
      events:
        - { lane: cpu, tStart: 0, tEnd: 1, label: "Fetch LOAD A", state: muted }
        - { lane: cpu, tStart: 1, tEnd: 2, label: "Decode LOAD A", state: muted }
        - { lane: cpu, tStart: 2, tEnd: 3, label: "Execute LOAD A", state: active }
        - { lane: mem, tStart: 0, tEnd: 1, label: "trae instrucción", state: muted }
        - { lane: mem, tStart: 2, tEnd: 3, label: "entrega A", state: active }
    - note: "Instrucción 2: ADD B. El ciclo se repite: Fetch trae la instrucción, Decode identifica la suma, Execute suma B al valor cargado. Execute de ADD no toca memoria (opera sobre lo ya cargado en CPU), a diferencia de LOAD/STORE."
      caption: "I1→I2: LOAD A; ADD B"
      lanes:
        - { id: cpu, label: "CPU" }
        - { id: mem, label: "Memoria" }
      events:
        - { lane: cpu, tStart: 0, tEnd: 1, label: "Fetch ADD B", state: muted }
        - { lane: cpu, tStart: 1, tEnd: 2, label: "Decode ADD B", state: muted }
        - { lane: cpu, tStart: 2, tEnd: 3, label: "Execute ADD B", state: active }
        - { lane: mem, tStart: 0, tEnd: 1, label: "trae instrucción", state: active }
    - note: "Instrucción 3: STORE C. Fetch y Decode se repiten igual; Execute ahora sí vuelve a tocar memoria, escribiendo el resultado acumulado en C. Con esta instrucción se completa el ejemplo Fetch→Decode→Execute × 3 de la sección de Estructura interna."
      caption: "LOAD A; ADD B; STORE C completo"
      lanes:
        - { id: cpu, label: "CPU" }
        - { id: mem, label: "Memoria" }
      events:
        - { lane: cpu, tStart: 0, tEnd: 1, label: "Fetch STORE C", state: muted }
        - { lane: cpu, tStart: 1, tEnd: 2, label: "Decode STORE C", state: muted }
        - { lane: cpu, tStart: 2, tEnd: 3, label: "Execute STORE C", state: active }
        - { lane: mem, tStart: 0, tEnd: 1, label: "trae instrucción", state: muted }
        - { lane: mem, tStart: 2, tEnd: 3, label: "escribe C", state: answer }
---

## ¿Qué problema resuelve?

Antes de poder razonar sobre "cuánto más rápido" corre un programa en
paralelo, hace falta un modelo preciso de cómo corre un programa
*secuencial*, y de por qué ese modelo dejó de bastar. El diseño de una
solución computacional paralela a un problema considera tres componentes: el
algoritmo (abstracción y código), el alto performance (medido en métricas
como speedup, eficiencia y precisión) y la topología usada. Este tema cubre
el punto de partida: el modelo secuencial, sus dos límites físicos (memoria y
energía) y las arquitecturas que surgieron para superarlos.

## Intuición

Un programa secuencial es una fila de instrucciones que se ejecutan una
detrás de otra, cada una esperando a la anterior. Durante décadas, hacer un
programa "más rápido" significaba simplemente esperar a que saliera un chip
más rápido (Ley de Moore). Esa estrategia choca contra dos paredes físicas —
el acceso a memoria no puede volverse arbitrariamente rápido (*memory wall*)
y la energía que consume un chip crece con el cubo de su frecuencia
(*power wall*). Cuando ya no se puede acelerar un único flujo de
instrucciones, la única salida es tener varios flujos a la vez: paralelismo.

## Estructura interna

**Modelo secuencial.** Un programa es una secuencia ordenada de
instrucciones con dependencia entre ellas:

$$I_1 \to I_2 \to I_3 \to \cdots \to I_n$$

**Modelo RAM (Random Access Machine).** Modelo teórico para analizar
algoritmos secuenciales: las operaciones elementales (`+`, `-`, `*`, `>`,
`=`, lectura, escritura) tienen costo constante $O(1)$, es decir
$T_{mem} = O(1)$ para acceder a cualquier posición de memoria. Por ejemplo,
en

```cpp
for (int i = 0; i < n; i++)
    suma += A[i];
```

se realizan aproximadamente $n$ operaciones, por lo que $T(n) = \Theta(n)$.
Sin embargo, en una máquina real $T(A[i])$ no es constante, porque el dato
puede estar en registro, caché L1/L2/L3 o memoria principal. El modelo RAM
es excelente para estudiar complejidad algorítmica pero insuficiente para
explicar el rendimiento real: "dos algoritmos con la misma complejidad
asintótica pueden presentar rendimientos muy diferentes debido al acceso a
memoria y a la arquitectura".

**Arquitectura Von Neumann.** Proporciona el modelo conceptual de
implementación del modelo RAM: datos e instrucciones se almacenan en la
misma memoria, de modo que un computador puede ejecutar distintos programas
sin modificar físicamente su hardware. Su ciclo básico es
**Fetch–Decode–Execute**:

- **Fetch:** la CPU obtiene de memoria la instrucción (memoria → CPU).
- **Decode:** la unidad de control determina qué operación debe realizarse.
- **Execute:** la CPU ejecuta la operación.

Por ejemplo, `LOAD A; ADD B; STORE C` se ejecuta como
$Fetch \to Decode \to Execute \to Fetch \to \cdots$. La IAS Machine
(Institute for Advanced Study, 1940s–1950s) materializó estas ideas y
consolidó hace más de 70 años el modelo básico CPU–memoria que aún
reconocemos hoy; ENIAC (1945) y EDVAC (1949) procesaban instrucciones de
forma secuencial con una única unidad de control y procesamiento.

El microprocesador integró la CPU en un circuito integrado (Intel 4004,
1971: 4 bits, 2300 transistores, 740 kHz), y durante décadas cada generación
permitió correr el mismo programa secuencial cada vez más rápido.

**Ley de Moore.** "El número de transistores en un circuito integrado se
duplica aproximadamente cada dos años" (Gordon Moore, 1965). Estableció un
crecimiento exponencial de transistores disponibles. Actualmente sólo se
mantiene vigente gracias a la programación concurrente y distribuida.

**Primera limitación — Memory Wall.** El cuello de botella entre el tiempo
de acceso a memoria y el tiempo de cómputo. La solución fue introducir
niveles intermedios de jerarquía: $CPU \to L1 \to L2 \to L3 \to RAM$. Cuanto
más cerca de la CPU, menor capacidad, mayor velocidad y mayor costo por
byte; cuanto más lejos, mayor capacidad y mayor latencia. Esto rompe una de
las simplificaciones fundamentales del modelo RAM: $T_{acceso}$ deja de ser
constante.

**Segunda limitación — Power Wall.** Incrementar la frecuencia de reloj
produce más calor y consumo energético, proporcional al cubo de la
frecuencia:

$$P_{dyn}(f) = \gamma \cdot f^3$$

**Paralelismo a nivel de instrucciones (ILP).** Incluso antes del multicore,
una CPU secuencial ya explotaba paralelismo interno mediante pipeline,
ejecución superescalar y múltiples unidades funcionales. Este ILP está
limitado por dependencias de datos y de saltos. Por ejemplo, en

```cpp
a = b + c;
d = a * 2;
e = d + 1;
```

existe una cadena de dependencias que impide reordenar o solapar libremente
estas instrucciones.

**Arquitecturas paralelas.** Ante el power wall, la estrategia dominante
pasó de "hacer un único procesador más potente" (pipeline, superescalar,
SIMD, cachés grandes) a "usar varias unidades de procesamiento". Seymour
Cray (Cray X-MP, 800 MFlops, 4 CPUs, 1982) representa la filosofía de pocos
procesadores muy potentes ("bueyes"); la Connection Machine CM-1 (1985,
65536 microprocesadores en topología de hipercubo de 12 dimensiones,
5-10 GFLOPs, liderada por Tamiko Thiel) representa la filosofía de muchos
procesadores simples ("gallinas"). No existe una respuesta universal sobre
cuál conviene: depende de la naturaleza del problema, la granularidad, la
comunicación, la sincronización y la capacidad de dividir el trabajo.

Términos clave: **procesador/CPU** (chip físico, puede contener varios
núcleos), **core** (unidad capaz de ejecutar instrucciones), **thread**
(flujo de ejecución de software asignado a un core — un core es un recurso
físico, un thread una entidad de software). El **multithreading**
(Simultaneous Multithreading / Hyper-Threading) permite que un mismo core
mantenga el estado de más de un hilo. Las **GPUs** priorizan throughput con
gran cantidad de threads y paralelismo masivo.

**Paradigmas de paralelismo: memoria compartida vs. distribuida vs.
híbrida.**

- **Paralelismo de la data:** la estructura del resultado define el
  programa; cada proceso es responsable de una tarea y la comunicación entre
  procesos es implícita, vía lectura de memoria compartida (p.ej. OpenMP).
  Las computadoras de memoria compartida pueden ser **UMA** (Uniform Memory
  Access, latencia y ancho de banda iguales para todos los procesadores,
  también llamado Symmetric Multiprocessing) o **ccNUMA** (Cache Coherent
  Non-uniform Memory Access: memoria físicamente distribuida pero accesible
  como un único espacio de direcciones vía una red lógica). En ambos casos
  la coherencia de caché mantiene consistencia entre cachés y memoria.
- **Paralelismo de la tarea (especialista):** comunicación explícita por
  envío de mensajes entre procesos, cada uno con su memoria local y sin
  acceso a la memoria de los demás (p.ej. MPI). Se paraleliza la
  especialidad y se conecta a los especialistas en una red lógica.
- **Paralelismo de la agenda (híbrido):** caso intermedio que distingue un
  grupo de datos/objetos de un grupo de procesos, construido en torno a una
  agenda de tareas a la que se asignan procesos paralelos.
- **Sistemas híbridos:** en la práctica, combinaciones de ambos —nodos de
  memoria compartida conectados por una red— que añaden complejidad de
  comunicación (p.ej. clusters CPU-GPU).

**Contexto histórico y escala.** Un computador personal tiene varios cores,
una GPU tiene miles de unidades de ejecución, un cluster tiene muchos nodos,
y un supercomputador combina miles de nodos con CPU, GPU y red de alta
velocidad (ranking Top500). El desarrollo de MPI (1994) y OpenMP (1997)
formalizó la programación distribuida y compartida respectivamente.

**Secuencial, concurrente y paralelo — la distinción es central:**

- **Secuencial:** un único flujo $A \to B \to C$.
- **Concurrente:** varias tareas se ejecutan en un intervalo de tiempo, pero
  pueden hacerlo intercaladas ($A_1 \to B_1 \to A_2 \to C_1 \to \cdots$); la
  concurrencia no exige ejecución física simultánea.
- **Paralelo:** dos o más tareas se ejecutan realmente al mismo tiempo
  ($P_1: A$, $P_2: B$, $P_3: C$), lo que requiere múltiples recursos físicos.
  La concurrencia estructura tareas que pueden progresar; el paralelismo las
  ejecuta simultáneamente para obtener rendimiento.

## Operaciones

Este tema es puramente conceptual: no tiene subtemas propios
(`algorithms/` o `models/`). El método de diseño que se apoya en estas ideas
—taxonomía de Flynn y método de Foster (PCAM)— se cubre en
[/topics/flynn-foster-pcam](/topics/flynn-foster-pcam).

## Análisis de complejidad

El profesor deriva dos cotas concretas a partir de estas ideas, ambas en el
estilo de "de dónde sale la cota":

- **Recorrido secuencial de un arreglo:** bajo el modelo RAM, cada uno de
  los $n$ accesos/operaciones cuesta $O(1)$, así que el costo total es
  $T(n) = \Theta(n)$ — ver `suma-vector-ram` en la tabla.
- **Suma paralela con acumulación por pares:** la Participación 1 (suma de
  $n$ números por 1, 2 y 4 personas) muestra que el tiempo no se reduce a la
  mitad al duplicar personas, porque aparece un **overhead** de
  sincronización que crece con la cantidad de personas. De las tres
  estrategias que compara el profesor —acumular en cuanto cada quien
  termina (no determinística, mal performance), acumular en forma
  secuencial (comunicación proporcional a $p$) y acumular por pares en
  árbol binario (una persona por etapa se encarga de la suma acumulada)—
  la de árbol binario reduce las rondas de sincronización de $O(p)$ a
  $O(\log p)$, porque en cada ronda el número de sumas parciales activas se
  reduce a la mitad — ver `suma-arbol-binario` en la tabla.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`. Ambas cotas son las que da
explícitamente el profesor: la del modelo RAM para el recorrido secuencial,
y la de $O(\log p)$ para la estrategia óptima de sincronización de la
Participación 1.

## Ejemplos

**Participación 1: Suma de números.** Se pide sumar números con 1, 2 y 4
personas. El tiempo obtenido en cada caso no se reduce a la mitad, por el
tiempo necesario para sincronizar los resultados parciales (el overhead,
que crece con la cantidad de personas). Pregunta del profesor: ¿cómo reducir
ese overhead? Las alternativas comparadas son:

1. Acumular las sumas parciales en cuanto cada persona termina su cálculo:
   no determinística y de bajo performance (desordenada).
2. Acumular las sumas parciales en forma secuencial: no óptima, porque la
   comunicación es proporcional a $p$ (personas).
3. Acumular las sumas parciales por pares (árbol binario), donde una
   persona en cada etapa se encarga de la suma acumulada: aprovecha
   recursos y da una complejidad algorítmica de $O(\log p)$.

El profesor aclara que también se puede optimizar el cómputo (pipelining),
pero la pregunta apunta al overhead, porque esa componente domina el tiempo
total de ejecución.

## Comparación con temas relacionados

No aplica: este es el primer tema de la unidad y no hay contenido previo
del curso contra el cual compararlo. La comparación natural (arquitecturas
según Flynn: SISD/SIMD/MISD/MIMD) se desarrolla en
[/topics/flynn-foster-pcam](/topics/flynn-foster-pcam), que retoma estas
arquitecturas y las clasifica formalmente.

## Prueba de dominio

- Explicar por qué el modelo RAM predice complejidad algorítmica pero no
  rendimiento real, y qué rompe esa suposición (memory wall).
- Derivar/explicar $P_{dyn}(f) = \gamma f^3$ como motivo del power wall y
  del giro hacia el multicore.
- Distinguir procesador, core y thread, y explicar SMT/Hyper-Threading.
- Explicar la diferencia entre UMA y ccNUMA, y entre paralelismo de datos,
  de tarea y de agenda.
- Distinguir con un ejemplo propio secuencial, concurrente y paralelo.
- Resolver la Participación 1 explicando por qué la estrategia de árbol
  binario reduce el overhead de $O(p)$ a $O(\log p)$.
