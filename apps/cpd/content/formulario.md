---
title: "Formulario"
---

Resumen condensado de todo el curso — no sólo fórmulas, también definiciones, clasificaciones y listas para repasar rápido antes de un examen. Agrupado por unidad y tema. Para el razonamiento completo de cada una, seguí el link "ver tema completo".

## Unidad 1 — Fundamentos de Paralelismo

### Modelo secuencial / RAM

**Definición.** Un programa secuencial es una fila de instrucciones dependientes entre sí: $I_1 \to I_2 \to I_3 \to \cdots \to I_n$. El modelo RAM (Random Access Machine) es el modelo teórico donde toda operación elemental (`+`,`-`,`*`,`>`,`=`, lectura, escritura) cuesta $O(1)$.

$$T_{mem} = O(1) \text{ (idealización RAM)}$$

Recorrido secuencial de un arreglo bajo el modelo RAM: $T(n) = \Theta(n)$. En hardware real $T_{acceso}$ deja de ser constante porque el dato puede estar en registro, caché L1/L2/L3 o memoria principal (*memory wall*): dos algoritmos con la misma complejidad asintótica pueden rendir muy distinto en la práctica.

**Arquitectura Von Neumann.** Datos e instrucciones comparten la misma memoria. Ciclo básico **Fetch–Decode–Execute**: Fetch (CPU obtiene la instrucción de memoria), Decode (unidad de control determina la operación), Execute (CPU la ejecuta). Ejemplo: `LOAD A; ADD B; STORE C`.

**Ley de Moore.** El número de transistores en un circuito integrado se duplica aproximadamente cada dos años (Gordon Moore, 1965) — hoy sólo se sostiene gracias a la programación concurrente/distribuida.

**Power wall.**

$$P_{dyn}(f) = \gamma \cdot f^3$$

Potencia disipada crece con el cubo de la frecuencia de reloj — motiva el giro hacia multicore en vez de subir frecuencia.

**ILP (Instruction-Level Parallelism).** Incluso una CPU secuencial explota paralelismo interno (pipeline, superescalar, múltiples unidades funcionales), limitado por dependencias de datos y de saltos.

**Procesador vs. core vs. thread.** Procesador/CPU: chip físico, puede tener varios núcleos. Core: unidad capaz de ejecutar instrucciones. Thread: flujo de ejecución de software asignado a un core. Multithreading (SMT/Hyper-Threading): un mismo core mantiene el estado de más de un hilo.

**Paradigmas de paralelismo:**

- **Paralelismo de la data:** comunicación implícita vía memoria compartida (ej. OpenMP). Memoria compartida puede ser **UMA** (latencia/ancho de banda igual para todos los procesadores) o **ccNUMA** (memoria distribuida físicamente pero accesible como un único espacio de direcciones).
- **Paralelismo de la tarea (especialista):** comunicación explícita por paso de mensajes, cada proceso con memoria local propia (ej. MPI).
- **Paralelismo de la agenda (híbrido):** distingue un grupo de datos/objetos de un grupo de procesos, en torno a una agenda de tareas.
- **Sistemas híbridos:** combinan memoria compartida y distribuida (ej. clusters CPU-GPU).

**Secuencial vs. concurrente vs. paralelo.** Secuencial: un único flujo $A\to B\to C$. Concurrente: varias tareas en un intervalo de tiempo, posiblemente intercaladas, sin exigir simultaneidad física. Paralelo: dos o más tareas ejecutándose realmente al mismo tiempo, con múltiples recursos físicos.

**Suma con acumulación por pares (overhead de sincronización).** Comparando 3 estrategias para sumar $n$ números entre $p$ personas: acumular apenas cada quien termina (no determinística, mal performance), acumular secuencialmente (comunicación $O(p)$), o acumular por pares en árbol binario (una persona por etapa se encarga de la suma acumulada) — la de árbol binario reduce las rondas de sincronización de $O(p)$ a $O(\log p)$. [ver tema completo](/topics/sequential-model-architectures)

### Taxonomía de Flynn y método de Foster (PCAM)

**Clasificación — Taxonomía de Flynn** (según flujos de instrucciones y de datos):

- **SISD** (Single Instruction Single Data): procesadores secuenciales, una instrucción sobre una unidad de memoria. Arquitectura Von Neumann. Ejemplo: microcontroladores.
- **SIMD** (Single Instruction Multiple Data): una instrucción se ejecuta sobre múltiples data streams a la vez. Ejemplo: GPUs, arquitecturas vectoriales (suma de vectores, filtros de imagen).
- **MIMD** (Multiple Instruction Multiple Data): múltiples tareas en múltiples procesos sobre distintos data streams. Ejemplo: memoria compartida/distribuida, GPGPU (multiplicación de matrices con hilos independientes, N-Body paralelo).
- **MISD** (Multiple Instruction Single Data): múltiples procesos, distintas instrucciones, misma data. Ejemplo: sistemas tolerantes a fallos en tiempo real (navegación aérea).

**Definición — task y channel (modelo de Foster).** Task: programa + memoria local + puertos de E/S. Channel: mensaje que conecta la salida de un task con la entrada de otro (dependencia). El envío es **asíncrono**, el recibo es **síncrono** (bloquea).

**Clasificación — los 4 pasos de PCAM (Foster), en orden:**

1. **Particionamiento (Partition):** divide datos y tareas en piezas (*primitive tasks*) — descomposición del dominio (divide la data primero) o funcional (divide la tarea primero). Buscar el mayor número de piezas posible.
2. **Comunicación (Communicate):** define channels entre tasks — local (pocos vecinos) o global (muchos tasks interactúan). Es overhead que no existe en la versión secuencial.
3. **Aglomeración (Agglomerate):** agrupa tasks para reducir overhead de comunicación y permitir escalar.
4. **Mapeo (Map):** asigna tasks a procesos, maximizando utilización y minimizando comunicación — balanceo **estático** (carga fija por task) o **dinámico** (compensa desbalance).

**Fórmula — Participación 2 (suma de $n=10^{12}$ números, comparación de topologías):**

$$T_s = n \cdot T_{comp}$$

Propuesta 1 (topología lineal): $T_p = 10^{9}\cdot 10^{-9} + 10^{3}\cdot 10^{-9} + 10^{3}\cdot 8\cdot 10^{-8} \approx 1{,}00008$ s. Propuesta 2 (árbol binario): $T_p = 10^{9}\cdot 10^{-9} + 10\cdot 10^{-9} + 10\cdot 8\cdot 10^{-8} \approx 1{,}0000008$ s — la propuesta en árbol reduce el término de comunicación de $10^3$ a $10$ pasos, aunque en este ejercicio el término dominante es de cómputo (*compute bound*), por lo que la diferencia es mínima. No hay fórmula de costo genérica para Flynn ni PCAM en sí — son taxonomía y método de diseño, no un algoritmo con costo propio. [ver tema completo](/topics/flynn-foster-pcam)

### DAG: trabajo y span

**Definición.** Un DAG (Directed Acyclic Graph) es $G=(V,E)$: vértices = tareas, aristas = dependencias/canales de comunicación, sin ciclos.

**Clasificación de algoritmos según su DAG:**

- **Secuenciales:** cadena estricta $T_0\to T_1\to T_2\to\cdots$, sin paralelismo posible.
- **Paralelos:** todas las tareas ejecutan simultáneamente, sin aristas entre ellas.
- **SPA (Secuencial-Paralelo):** niveles paralelos entre sí, pero secuenciales entre niveles.
- **NSPA (No-Secuencial-Paralelo):** dependencias irregulares, sin niveles limpios.

$$T_\infty = \text{MAX}\left(\sum t_i\right) \quad\text{(span, camino crítico)}, \qquad W(n) = T_s^*(n) \quad\text{(trabajo = tiempo secuencial óptimo)}$$

$$T_p \geq \frac{T_s}{p} \quad\text{(cota por trabajo)}, \qquad T_p \geq T_\infty \quad\text{(cota por span)}$$

$$S = \frac{T_s}{T_p} \le p$$

Un DAG secuencial tiene $T_\infty = W$ (sin ganancia posible); uno puramente paralelo tiene $T_\infty = 1$. SPA y NSPA quedan entre ambos extremos. Ejemplo resuelto (suma de 16 números, $p=8$ vs. $p=5$): $T_s=15$ en ambos casos; con $p=8$, $T_\infty=4$, $S=15/4$, $E=0{,}47$; con $p=5$, $T_\infty=5$, $S=15/5$, $E=0{,}60$ — menor speedup pero mayor eficiencia por mejor aprovechamiento de recursos. [ver tema completo](/topics/dag-cost-model)

## Unidad 2 — Diseño en Paralelo

### Speedup, eficiencia, Amdahl y Gustafson

**Definición.** Speedup $S = T_s/T_p$: cuántas veces más rápido corre con $p$ procesadores que secuencial. Eficiencia $E(n) = S/p = T_s/(p\cdot T_p)$: qué fracción de los $p$ procesadores se aprovecha realmente. En general $S \le p$ y $E \le 1$; $S=p$ (speedup lineal) da $E=1$. Escalabilidad: propiedad distinta de ambas leyes — si se puede mantener eficiencia constante creciendo *a la vez* $p$ y el tamaño $n$; Amdahl no puede describirla porque no depende de $p$ de forma acoplada a $n$.

$$S = \frac{T_s}{T_p}, \qquad E(n) = \frac{S}{p} = \frac{T_s}{p \cdot T_p}$$

**Ley de Amdahl (strong scaling — tamaño de problema fijo).** Responde: ¿qué tan rápido corre un problema de tamaño *fijo* con $p$ procesos?

$$T_s = f_s + f_p, \qquad T_p = f_s + \frac{f_p}{p}$$

$$S = \frac{1}{f_s + f_p/p}, \qquad E = \frac{1}{p\left(f_s + \frac{1-f_s}{p}\right)}, \qquad \lim_{p\to\infty} S = \frac{1}{f_s}$$

El speedup queda acotado por la fracción secuencial $f_s$, sin importar cuántos procesadores se agreguen.

**Ley de Gustafson (weak scaling — problema crece con $p$).** Responde una pregunta distinta: si el problema *crece* junto con $p$ (cada proceso mantiene su misma carga $f_p$), ¿cuánto más rápido es en paralelo respecto a resolver ese problema más grande en forma secuencial?

$$T_p = f_s + f_p \text{ (fijo)}, \qquad T_s = f_s + p \cdot f_p$$

$$S = f_s + p \cdot f_p, \qquad E = \frac{f_s + p \cdot f_p}{p}$$

El speedup escala linealmente con $p$ en vez de saturar. Variante generalizada con problema creciendo como $p^\alpha$: $T_s = f_s + f_p p^\alpha$, $T_p = f_s + f_p p^{\alpha-1}$ (colapsa en Amdahl para $\alpha=0$).

**Comparación (tabla del material):**

| | Ley de Amdahl | Ley de Gustafson |
|---|---|---|
| Pregunta que responde | ¿Qué tan rápido corre un problema de tamaño fijo con $p$ procesos? | ¿Cuánto más rápido es resolver un problema creciente en paralelo vs. secuencial? |
| Tamaño del problema | Fijo (*strong scaling*) | Crece con $p$ (*weak scaling*) |
| Comportamiento de $S$ | Satura en $1/f_s$ | Crece linealmente con $p$ |
| Describe escalabilidad | No (independiente de $p$) | Sí, junto con el crecimiento de $n$ |

**FLOPS.** Desempeño medido en operaciones de coma flotante por segundo; cores típicos alcanzan 4–12 GFLOPS. La velocidad de memoria (GB/s) es una métrica distinta del cómputo (GFLOP/s) — en muchos problemas el cuello de botella es mover datos, no calcular. [ver tema completo](/topics/performance-metrics)

### PRAM y sus extensiones

**Definición.** PRAM (Parallel Random Access Machine) extiende el modelo RAM con $p$ procesadores idénticos que comparten una memoria de acceso uniforme, sin red, latencia ni caché. Cada procesador ejecuta: lectura de memoria compartida, cómputo local, escritura.

**Clasificación por acceso concurrente** (jerarquía estricta):

$$\text{EREW} \subset \text{CREW} \subset \text{CRCW}$$

- **EREW** (exclusive read exclusive write): cada posición se lee o escribe por un único procesador a la vez. La más restrictiva.
- **CREW** (concurrent read exclusive write): varios procesadores leen la misma dirección, pero sólo uno escribe.
- **ERCW** (exclusive read concurrent write): lectura exclusiva, escritura simultánea permitida. Poco usada.
- **CRCW** (concurrent read concurrent write): lectura y escritura simultáneas. Requiere regla de resolución de conflictos de escritura: modelo *común* (todos escriben el mismo dato), *arbitrario* (gana uno cualquiera), *combinado* (se acumula el resultado, ej. suma) o *prioritario* (gana el de mayor prioridad).

**Métricas.** $T_p(n)$, $W(n)$ (trabajo), $T_\infty(n)$ (span), $P(n)$ (procesadores), costo $C_p(n) = T_p(n)\cdot P(n)$. Costo óptimo si $C_p(n) = \Theta(T_s(n))$.

**Por qué existen las extensiones** — cada una relaja un supuesto distinto de PRAM clásico:

| Modelo | Supuesto que modifica | Extensión introducida |
|---|---|---|
| APRAM | Sincronización global | Asincronía |
| Phase PRAM | Sincronización "gratuita" | Fases y barreras explícitas |
| LPRAM | Acceso uniforme a memoria | Localidad (memoria local vs. global) |
| BPRAM | Acceso palabra por palabra | Transferencia por bloques |
| BSP | Combina las anteriores | Supersteps $(p,g,L)$ |
| LogP | Asincronía + comunicación fina | Parámetros $L, o, g, P$ |

**Fórmulas de cada extensión:**

APRAM: sin fórmula cerrada — elimina la sincronización implícita paso a paso, sincroniza sólo por primitivas explícitas (ej. `wait` sobre un flag).

$$\text{Phase PRAM: } T_{sync} = S \cdot T_{barrier}, \qquad T_p = T_{comp} + T_{sync}$$

LPRAM: sin fórmula cerrada — sólo distingue cualitativamente $T_{local} < T_{global}$.

$$\text{BPRAM: } T_{transferencia} = \alpha + \beta \cdot b \qquad \text{(latencia + costo por elemento, bloque de tamaño } b\text{)}$$

$$\text{BSP: } T_{superstep} = w + g\cdot h + L, \qquad T_{BSP} = \sum_s (w_s + g\cdot h_s + L) = \sum w_s + g\sum h_s + S\cdot L$$

$$\text{LogP: } T_{mensaje} \approx L + o + g, \qquad T_p = O\!\left(\frac{n}{p} + \log p\cdot(L+o+g)\right)$$

$BSP \approx \text{Phase PRAM} + \text{localidad (LPRAM)} + \text{comunicación (BPRAM)} + \text{sincronización}$. LogP se acerca a APRAM (asincronía, sin barrera global) pero con costo de comunicación explícito en 3 componentes separados (a diferencia de BSP que los junta en $g\cdot h + L$). [ver tema completo](/topics/pram-models) · [APRAM](/topics/pram-models/models/apram) · [Phase PRAM](/topics/pram-models/models/phase-pram) · [LPRAM](/topics/pram-models/models/lpram) · [BPRAM](/topics/pram-models/models/bpram) · [BSP](/topics/pram-models/models/bsp) · [LogP](/topics/pram-models/models/logp)

### Teorema de Brent

**Enunciado.** Dado un algoritmo con trabajo $W(n)$ y span $T_\infty(n)$, ejecutarlo con $p$ procesadores toma:

$$T_p(n,p) \le \left\lceil \frac{W(n)}{p} \right\rceil + T_\infty(n)$$

**Qué traduce.** Da una cota superior constructiva de $T_p$ sin rediseñar el algoritmo para cada $p$: durante los $T_\infty$ pasos del camino crítico se hace al menos una unidad de trabajo por paso; las $W-T_\infty$ unidades restantes se reparten parejo entre los $p$ procesadores. Costo asociado: $C_p(n,p) = T_p(n,p)\cdot p = O(W(n) + T_\infty(n)\cdot p)$; $W(n)$ coincide con $C_p(n)$ cuando $p = O(W(n)/T_\infty(n))$. Si $p \ge W(n)/T_\infty(n)$, agregar más procesadores deja de ayudar significativamente ($T_\infty$ domina). Ejemplo numérico del material: $W=1000$, $T_\infty=20$ → con $p=10$, $T_p\approx120$; con $p=100$, $T_p\approx30$ (multiplicar $p$ por 10 NO divide $T_p$ por 10). [ver tema completo](/topics/pram-algorithms/algorithms/brent-theorem)

### Algoritmos PRAM: OR/AND global, máximo, suma por reducción

**Qué hace cada uno.** OR global: $R = a_0 \lor \cdots \lor a_{n-1}$, cada procesador escribe `Result←1` si su valor es verdadero (CRCW modelo común). AND global: análogo, cada procesador escribe `Result←0` si encuentra un falso. Máximo de $n$: calcula $n^2$ comparaciones por pares `B[i,j]←A[i]≥A[j]` en paralelo y luego resuelve el AND de cada fila (se reduce a Global AND). Suma por reducción: combina pares en árbol binario en $\log n$ niveles (modelo CREW).

| Algoritmo | $T_\infty(n)$ | $W(n)$ | Modelo |
|---|---|---|---|
| OR / AND global | $\Theta(1)$ | $\Theta(n)$ | CRCW combinado |
| Máximo de $n$ | $\Theta(1)$ (vía AND) | $\Theta(n^2)$ | CRCW |
| Suma por reducción en árbol | $O(\log n)$ | $O(n)$ | CREW |

Suma por reducción, aplicando Brent: $T_p(n,p) = O(n/p + \log n)$ — es WT-óptimo ($C_p(n)=\Theta(n)$). OR/AND logran speedup lineal ($S_n=\Theta(n)$, $E_n=\Theta(1)$) a costa de necesitar $n$ procesadores y escritura concurrente combinada. [ver tema completo](/topics/pram-algorithms) · [OR](/topics/pram-algorithms/algorithms/or-reduction) · [AND](/topics/pram-algorithms/algorithms/and-reduction) · [máximo](/topics/pram-algorithms/algorithms/max-reduction) · [suma](/topics/pram-algorithms/algorithms/sum-reduction)

### Prefix-sum (scan) y recurrencias clásicas

**Definición.** Dada $\{x_1,...,x_n\}$ con operación asociativa $*$: $s_i = x_1*x_2*\cdots*x_i$ para cada $i$ (no sólo el total, como las reducciones de arriba).

**Algoritmo no recursivo:** 3 pasos — copia, *upsweep* (subir por árbol combinando pares, igual que suma por reducción), *downsweep* (bajar repartiendo a cada hoja el prefijo que le corresponde: si índice par hereda directo del nivel superior, si es la base toma el valor de upsweep, si no combina ambos).

**Algoritmo recursivo:** combina pares adyacentes, resuelve recursivamente sobre la secuencia reducida a la mitad, reconstruye prefijos originales.

$$W(n) = O(n), \qquad T(n) = O(\log n)$$

Aplicando Brent con $p < n$: $O(n/p) \le T(n,p) \le O(n/p + \log n)$. Recurrencias: no recursivo por upsweep/downsweep sobre árbol; recursivo con $T(n)=T(n/2)+a$, $W(n)=W(n/2)+bn$.

**Recurrencias clásicas** (resolución por sustitución repetida — reaparecen en todo el curso):

| Recurrencia | Solución | Derivación |
|---|---|---|
| $f(n) = f(n-1) + n$ | $\Theta(n^2)$ | $f(n)=f(1)+2+3+\cdots+n = n(n+1)/2-1$ |
| $f(n) = f(n/2) + 1$ | $\Theta(\log n)$ | se suma 1 cada vez que $n$ se divide entre 2, $\log n$ veces |
| $f(n) = f(n/2) + n$ | $\Theta(n)$ | serie geométrica $n+n/2+n/4+\cdots$ converge a $2n$ |
| $f(n) = 2f(n/2) + n$ | $\Theta(n \log n)$ | en cada uno de los $\log n$ niveles de recursión se paga $n$ en total |

[ver tema completo](/topics/prefix-sum-recurrences)

### Particionamiento de datos/tareas y algoritmos aleatorizados

**Definición — modelo de comunicación.**

$$T_{comm} = f(p)(\alpha + x\beta)$$

$\alpha$=latencia, $\beta$=tiempo/byte, $x$=tamaño del mensaje, $f(p)$ depende de la topología.

Broadcast lineal: $T_{bcast} = O(p(\alpha+m\beta))$. Broadcast en árbol: $T_{bcast} = O(\log p\,(\alpha+m\beta))$. Scatter/gather lineal: $O(\alpha p + \beta m)$; en árbol: $O(\alpha\log p + \beta m)$.

**Granularidad.**

$$G = \frac{T_{comp}}{T_{comm}}$$

- **Fina:** muchas tareas pequeñas, facilita balance de carga pero incrementa $T_{comm}$.
- **Gruesa:** pocas tareas grandes, reduce $T_{comm}$ pero dificulta balance.
- **Media:** combina ambas; la más usada en la práctica.

**Distribución de tareas — estática vs. dinámica (work pool).** Estática: cada proceso recibe una porción fija (ej. $n^2/p$ píxeles); no sincronizada si el costo por tarea varía. Dinámica (work pool): las tareas están en un área común, cada proceso libre toma una nueva; balancea mejor a costa de overhead de mensajes y planeamiento.

**Algoritmos aleatorizados — clasificación.** Monte Carlo: tiempo controlado, resultado puede tener error. Las Vegas: resultado siempre correcto, tiempo es variable aleatoria.

Estimación de π por Monte Carlo: $\pi = 4n/N$ (paraleliza trivialmente vía reducción `+`). LCG: $x_{i+1} = (ax_i + c) \bmod m$. Estrategias de paralelizar generación aleatoria: *centralizada* (bajo desempeño), *replicativa* (riesgo de correlación entre streams), *distribuida* (eficiente, difícil de implementar). Generador más robusto: MRG32k3a.

Suma de un arreglo — lineal: $T_p(n,p) = O(p\alpha + (n+p)\beta + n/p)$; en árbol: $T_p(n,p) = O(n/p + \alpha\log p + (n/p)\beta)$. [ver tema completo](/topics/partitioning-randomized)

### N-Body y Divide y Vencerás

**Definición.** N-Body: calcular cómo se atraen mutuamente $n$ cuerpos (cada uno siente la fuerza de todos los demás). Divide y vencerás: 3 etapas — **dividir** (partir el problema en subproblemas más chicos del mismo tipo), **vencer** (resolver directo si es caso base, si no recursivamente), **combinar** (unir soluciones parciales).

$$F_i = -Gm_i \sum_{1\le j\le n,\, j\ne i} \frac{m_j\, r_{ij}}{|r_{ij}|^3}$$

N-Body directo (partición directa de cuerpos): $T_p = O(n(n-1)/p)$. Con Barnes-Hut (aproxima clusters distantes como un cuerpo único): $T_p = O(n\log n/p)$.

Mergesort paralelo: $W(n)=O(n\log n)$, $T_\infty(n)=O(n)$ (el merge secuencial final domina el camino crítico, no se beneficia de más procesadores) → $T_p = O(n\log n/p + n)$.

Multiplicación de matrices 3D (expansión de $n^3$ productos independientes + reducción en árbol sobre $k$): $W(n)=O(n^3)$, $T_\infty(n)=O(\log n)$ → $T_p = O(n^3/p + \log n)$ — a diferencia de mergesort, aquí el span logarítmico mantiene la eficiencia alta para un rango mucho mayor de $p$.

| | N-Body directo | N-Body Barnes-Hut | Mergesort paralelo | Matrices 3D |
|---|---|---|---|---|
| $W(n)$ | $O(n^2)$ | $O(n\log n)$ | $O(n\log n)$ | $O(n^3)$ |
| $T_\infty(n)$ | — (sin recursión) | — | $O(n)$ | $O(\log n)$ |
| Paradigma | Partición directa | Partición directa + aproximación jerárquica | Divide y vencerás | Divide y vencerás |

[ver tema completo](/topics/nbody-divide-conquer)

## Unidad 3 — Paralelismo Distribuido (MPI)

### Introducción a MPI: comunicadores, rank, size, modos de envío

**Definición.** Message Passing: coordinación entre procesos que no comparten memoria — cada uno tiene memoria local propia (NUMA), toda comunicación es envío/recepción explícita de mensajes. MPI es la especificación estándar (1994, MPI-5 en 2025) para implementar ese modelo, agnóstica a la topología física de red (Fat Tree, Torus, Dragonfly, Hypercube).

**Comunicador.** `MPI_COMM_WORLD`: agrupa a todos los procesos lanzados por `mpirun`, creado automáticamente al llamar `MPI_Init`. **rank**: id entero único del proceso, $rank\in[0,p-1]$. **size**: número total de procesos.

**Funciones básicas del ciclo de vida:**

| Función | Qué hace |
|---|---|
| `MPI_Init(&argc, &argv)` | Inicializa el entorno. Una sola vez, al inicio. |
| `MPI_Comm_size(comm, &size)` | Número total de procesos del comunicador. |
| `MPI_Comm_rank(comm, &rank)` | Rank del proceso actual. |
| `MPI_Wtime()` | Tiempo de reloj en segundos (`double`). |
| `MPI_Abort(comm, error)` | Termina todos los procesos del comunicador. |
| `MPI_Finalize()` | Finaliza el entorno y limpia estructuras. |

Ciclo: `MPI_Init` → trabajo → `MPI_Finalize`. Compiladores: `mpicc` (C), `mpic++` (C++), `mpifort` (Fortran). Ejecución: `mpirun -np 4 ./prog.exe`.

**Clasificación — los 4 modos de envío bloqueante:**

| Modo | Función | Semántica |
|---|---|---|
| Standard | `MPI_Send` | El sistema decide sincrónico o buffered según el tamaño del mensaje y un *threshold* interno. |
| Sincrónico | `MPI_Ssend` | No finaliza hasta que el receptor inició su recepción. |
| Buffered | `MPI_Bsend` | Usa un buffer de usuario (`MPI_Buffer_attach`). |
| Ready | `MPI_Rsend` | Sólo válido si el receptor ya posteó su `MPI_Recv`; si no, comportamiento indefinido. |

Parámetros de `MPI_Send`/`MPI_Recv`: **buffer**, **count**, **datatype**, **dest/source**, **tag**, **status** (`status.MPI_SOURCE`, `status.MPI_TAG`, `MPI_Get_count`).

**Tipos MPI básicos:** `MPI_CHAR`, `MPI_SIGNED_CHAR`, `MPI_UNSIGNED_CHAR`, `MPI_SHORT`, `MPI_UNSIGNED_SHORT`, `MPI_INT`, `MPI_UNSIGNED`, `MPI_LONG`, `MPI_UNSIGNED_LONG`, `MPI_FLOAT`, `MPI_DOUBLE`, `MPI_LONG_DOUBLE` (mapean 1 a 1 a los tipos de C/C++).

Este tema no tiene fórmula de costo propia (`complexity: {}` en el material) — el análisis de costo aparece recién con las colectivas. [ver tema completo](/topics/mpi-intro)

### Comunicación bloqueante vs. no bloqueante

**Definición.** Bloqueante: la rutina no retorna hasta que el buffer puede reutilizarse con seguridad. No bloqueante: retorno inmediato (la "I" de Isend/Irecv = "immediate"), se completa después con `MPI_Wait`/`MPI_Test`.

**Protocolos internos de envío bloqueante (según umbral/threshold):** *eager* (bajo el umbral: copia a buffer del sistema, retorna de inmediato) vs. *rendezvous* (sobre el umbral: actúa como envío sincrónico, no completa hasta que el receptor empieza a recibir).

**Deadlock cíclico.** En un anillo donde todos hacen `Send` antes que `Recv` hacia su vecino, todos quedan bloqueados esperando — nadie llega a su `Recv`. Dos formas de romperlo con comunicación bloqueante: orden distinto por rank (el último invierte Send/Recv), o alternar por paridad (pares vs. impares invierten el orden).

**Rutinas no bloqueantes — 3 pasos:** (1) inicializar (`MPI_Isend`/`MPI_Irecv`, retorno inmediato con un `MPI_Request`), (2) cómputo/comunicación útil mientras avanza en segundo plano, (3) esperar la finalización (`MPI_Wait` bloquea; `MPI_Test` sólo consulta con un `flag`).

```
int MPI_Isend(void* buf, int count, MPI_Datatype datatype, int dest, int tag, MPI_Comm comm, MPI_Request *request);
int MPI_Irecv(void* buf, int count, MPI_Datatype datatype, int source, int tag, MPI_Comm comm, MPI_Request *request);
int MPI_Wait(MPI_Request *req, MPI_Status *status);
int MPI_Test(MPI_Request *req, int *flag, MPI_Status *status);
```

**Comunicación múltiple — completar varias operaciones a la vez:**

| Para completar | WAIT (bloqueante) | TEST (sólo consulta) |
|---|---|---|
| Al menos una, retorna exactamente una | `MPI_WAITANY` | `MPI_TESTANY` |
| Todas | `MPI_WAITALL` | `MPI_TESTALL` |
| Al menos una, retorna todas las completadas | `MPI_WAITSOME` | `MPI_TESTSOME` |

**Correspondencia bloqueante ↔ no bloqueante:**

| Bloqueante | No bloqueante |
|---|---|
| `MPI_Send` (Standard) | `MPI_Isend` |
| `MPI_Ssend` (Synchronous) | `MPI_Issend` |
| `MPI_Bsend` (Buffered) | `MPI_Ibsend` |
| `MPI_Rsend` (Ready) | `MPI_Irsend` |
| `MPI_Recv` | `MPI_Irecv` |

No hay fórmula de costo propia distinta a $T_{comm}=\alpha+x\beta$; lo relevante es que la comunicación no bloqueante permite ocultar parte de $\alpha$ (latencia) detrás de trabajo útil (solapamiento cómputo/comunicación), y reduce mucho el riesgo de deadlock cíclico frente a la bloqueante. [ver tema completo](/topics/mpi-blocking-nonblocking)

### Operaciones colectivas de MPI

**Definición.** Comunicación de grupo optimizada internamente por la implementación MPI (árbol, anillo, etc.), en vez de Send/Recv en bucle. Propiedades comunes: todos los procesos del comunicador deben participar; no hay colectivas "parciales"; el buffer se reutiliza sólo al terminar la participación del proceso; no interfieren con la comunicación punto a punto.

**Costo — secuencial vs. árbol:**

$$T_{bcast,\,secuencial} = O(p), \qquad T_{bcast,\,árbol} = O(\log_2 p)$$

Un broadcast en árbol binario duplica en cada nivel los procesos que ya tienen el dato; scatter/gather y reduce siguen el mismo patrón ($O(\log_2 p)$ pasos). El material no distingue costos propios distintos por colectiva — todas comparten esta cota.

**`MPI_Barrier`** — única colectiva que no transporta datos: bloquea a cada proceso hasta que todos llaman a `MPI_Barrier`. Normalmente no hace falta (la sincronización de datos ya es implícita); útil sólo para debugging, debe removerse en la versión final.

**Las 6 colectivas — qué mueve cada una:**

| Colectiva | Firma | Qué hace |
|---|---|---|
| `MPI_Bcast` | `MPI_Bcast(&buf, count, datatype, root, comm)` | Difunde el mismo dato del root a **todos** los procesos, incluido el root. |
| `MPI_Scatter` | `MPI_Scatter(&sendbuf, sendcnt, sendtype, &recvbuf, recvcnt, recvtype, root, comm)` | Reparte porciones **distintas** del array del root, una a cada proceso según su rank. |
| `MPI_Gather` | `MPI_Gather(&sendbuf, sendcnt, sendtype, &recvbuf, recvcnt, recvtype, root, comm)` | Recolecta el aporte de cada proceso en el root, ordenado por rank (reverso de Scatter). |
| `MPI_Allgather` | `MPI_Allgather(&sendbuf, sendcnt, sendtype, &recvbuf, recvcnt, recvtype, comm)` | Gather seguido de Bcast: **todos** terminan con la colección completa, sin root. |
| `MPI_Reduce` | `MPI_Reduce(&sendbuf, &recvbuf, count, datatype, op, root, comm)` | Combina los aportes de todos con un operador (`op`), deja el resultado en el root. |
| `MPI_Allreduce` | `MPI_Allreduce(&sendbuf, &recvbuf, count, datatype, op, comm)` | Reduce seguido de Bcast: **todos** terminan con el resultado combinado, sin root. |

**Operadores predefinidos de `MPI_Reduce`/`MPI_Allreduce`:** `MPI_MAX`, `MPI_MIN`, `MPI_SUM`, `MPI_PROD`, `MPI_LAND`, `MPI_BAND`, `MPI_LOR`, `MPI_BOR`, `MPI_LXOR`, `MPI_BXOR`, `MPI_MAXLOC`, `MPI_MINLOC`.

Ejemplo Bcast+Reduce: `data=5` en root, `MPI_Bcast`, cada proceso hace `data*=rank`, `MPI_Reduce` con `MPI_SUM` → con 4 procesos, resultado $=0+5+10+15=30$. [ver tema completo](/topics/mpi-collectives) · [Bcast](/topics/mpi-collectives/algorithms/bcast) · [Scatter](/topics/mpi-collectives/algorithms/scatter) · [Gather](/topics/mpi-collectives/algorithms/gather) · [Allgather](/topics/mpi-collectives/algorithms/allgather) · [Reduce](/topics/mpi-collectives/algorithms/reduce) · [Allreduce](/topics/mpi-collectives/algorithms/allreduce)

### Tipos de datos derivados en MPI

**Definición.** Un mensaje MPI se describe como la tripleta `(buffer, count, datatype)` — no sólo por su cantidad de bytes. `count` es número de elementos, nunca bytes. Un tipo derivado describe **dónde** están los datos en memoria (patrón, no sólo tipo elemental), para que una sola llamada MPI transmita todo el patrón de una vez, en vez de pagar la latencia $\alpha$ una vez por elemento.

**Ciclo de vida de un tipo derivado:** (1) Construcción (constructor), (2) Confirmación (`MPI_Type_commit`), (3) Uso (con `count=1`), (4) Liberación (`MPI_Type_free`).

**Clasificación — los 4 constructores:**

| Tipo derivado | Distribución | Constructor | Parámetros clave |
|---|---|---|---|
| Bloques contiguos | Regular, sin huecos | `MPI_Type_contiguous(count, old_type, *new_type)` | `count` elementos consecutivos del mismo tipo. |
| Bloques con separación regular | Regular, con stride fijo | `MPI_Type_vector(count, blocklength, stride, datatype, *newtype)` | `count`=nº de bloques, `blocklength`=elementos/bloque, `stride`=distancia entre inicios de bloques consecutivos (en elementos del tipo base). |
| Bloques con separación irregular | Irregular | `MPI_Type_indexed(count, blocklengths[], displacements[], datatype, *newtype)` | `blocklengths[]`=longitud de cada bloque, `displacements[]`=distancia de cada bloque desde el inicio. |
| Campos heterogéneos (struct) | Irregular, tipos mixtos | `MPI_Type_create_struct(count, blocklengths[], displacements[], types[], *new_type)` | Displacements obtenidos con `MPI_Get_address` (por el padding que inserta el compilador — no se pueden calcular sumando tamaños). |

Ejemplo `MPI_Type_vector` para columna `j` de `double A[4][4]`: `MPI_Type_vector(4, 1, 4, MPI_DOUBLE, &columna)` — `count=4` (elementos en la columna), `blocklength=1` (un elemento por bloque), `stride=4` (elementos por fila).

**`MPI_Pack`/`MPI_Unpack`** — empaquetado dinámico alternativo: copia variables a un buffer (`MPI_PACKED`) antes de enviar. Ventaja: dinámico, útil para mensajes ad hoc de un solo uso. Desventaja: overhead de copia explícita. `MPI_Type_create_struct` conviene cuando la comunicación se repite en un bucle (se paga la construcción una sola vez).

**`MPI_Sendrecv`** — envía y recibe en una sola llamada segura; es la solución nativa recomendada para evitar deadlocks en topologías cíclicas (anillo), en vez de ordenar manualmente pares Send/Recv.

$$T_{comm} = \alpha + x\beta$$

No hay fórmula de costo propia distinta de $T_{comm}=\alpha+x\beta$; el ahorro de un tipo derivado es pagar $\alpha$ una sola vez en vez de $x$ veces. [ver tema mpi-intro](/topics/mpi-intro) · [ver tema mpi-derived-datatypes](/topics/mpi-derived-datatypes)
