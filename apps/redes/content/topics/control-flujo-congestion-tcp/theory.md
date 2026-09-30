---
kind: theory
title: "Control de Flujo (rwnd) y Control de Congestión en TCP"
---

## 1. Distinción Fundamental: Control de Flujo vs. Control de Congestión

Aunque ambos mecanismos modulan la tasa a la que un emisor TCP inyecta datos en el canal mediante el ajuste de una ventana de bytes en vuelo, persiguen objetivos enteramente distintos y responden a diferentes cuellos de botella:

- **Control de Flujo (*Flow Control*)**: Es un servicio de regulación **punto a punto** (extremo a extremo). Su función exclusiva es evitar que un emisor rápido desborde la memoria del búfer de recepción en el host de destino debido a que la aplicación receptora está leyendo los datos con lentitud. Está coordinado directamente por el receptor a través del campo *Receive Window* ($rwnd$) de la cabecera TCP.
- **Control de Congestión (*Congestion Control*)**: Es un mecanismo de regulación **distribuido de extremo a red**. Su objetivo es evitar que la agregación del tráfico emitido por millones de hosts simultáneos sature la capacidad de conmutación y memoria de los conmutadores y enrutadores intermedios del núcleo de la red (*network core*). Dado que la red IP tradicional no proporciona retroalimentación explícita sobre el estado de sus colas, los emisores TCP deben inferir la congestión de forma implícita observando la pérdida de paquetes (timeouts o ACKs duplicados).

### La Ventana de Transmisión Efectiva

Para garantizar simultáneamente la integridad del receptor y la estabilidad de la red global, la cantidad máxima de datos no confirmados que el emisor puede mantener "en vuelo" en cualquier instante viene dictada por el mínimo entre ambas ventanas:

$$\text{VentanaEfectiva} = \min(\text{cwnd}, \text{rwnd})$$

Donde:
- $\text{cwnd}$ (*Congestion Window*): Variable de estado mantenida en el emisor que estima la capacidad disponible de la red.
- $\text{rwnd}$ (*Receive Window*): Valor anunciado por el receptor en la cabecera de sus segmentos confirmatorios.

El emisor garantiza en todo momento que:

$$\text{LastByteSent} - \text{LastByteAcked} \le \min(\text{cwnd}, \text{rwnd})$$

---

## 2. Mecanismo de Control de Flujo: La Ventana de Recepción (rwnd)

Cada extremo de una conexión TCP asigna un búfer de memoria para recibir datos, denominado `RcvBuffer` (cuyo tamaño suele fijarse por defecto en el sistema operativo entre 64 KB y varios megabytes, o ajustarse dinámicamente mediante *TCP buffer autotuning*).

### 2.1 Ecuación de Espacio Libre en el Búfer

Defínanse las siguientes variables en el receptor:
- $\text{LastByteRead}$: Número de secuencia del último byte que el proceso de aplicación local ha extraído del búfer mediante la primitiva de lectura (e.g., `read()` o `recv()`).
- $\text{LastByteRcvd}$: Número de secuencia del último byte que ha llegado de la red y ha sido almacenado en el búfer de recepción.

Dado que TCP no permite que los datos desborden la memoria asignada, se debe satisfacer la restricción física:

$$\text{LastByteRcvd} - \text{LastByteRead} \le \text{RcvBuffer}$$

La ventana de recepción anunciada $\text{rwnd}$ representa el espacio libre remanente disponible en el búfer:

$$\text{rwnd} = \text{RcvBuffer} - [\text{LastByteRcvd} - \text{LastByteRead}]$$

El receptor incluye este valor $\text{rwnd}$ en cada segmento ACK que envía de vuelta al emisor. Si el proceso de aplicación deja de leer del socket mientras el emisor sigue transmitiendo, $\text{rwnd}$ decrece gradualmente hasta llegar a cero ($\text{rwnd} = 0$).

### 2.2 El Problema de Interbloqueo con rwnd = 0 y Sondas de Ventana Cero

Si el receptor anuncia $\text{rwnd} = 0$, el emisor detiene completamente el envío de nuevos datos.
Supóngase que momentos después, la aplicación receptora se reactiva y lee la totalidad de los datos del búfer. El búfer queda completamente vacío y el receptor genera internamente una nueva ventana $\text{rwnd} = 65535$.

Sin embargo, en TCP los acuses de recibo puros no se retransmiten si se pierden (no tienen temporizador asociado). Si el segmento ACK donde el receptor anuncia la reapertura de la ventana se pierde en el canal, se genera un **interbloqueo catastrófico (*deadlock*)**:
- El emisor permanece bloqueado esperando indefinidamente un ACK con $\text{rwnd} > 0$.
- El receptor permanece bloqueado esperando indefinidamente que el emisor envíe datos.

#### Solución: Segmentos de Sondeo de Ventana Cero (*Zero-Window Probes*)
Para romper este punto muerto, cuando el emisor recibe un anuncio de $\text{rwnd} = 0$, inicia un temporizador de persistencia (*persist timer*). Al expirar este temporizador, el emisor transmite forzosamente un **segmento de prueba de 1 byte de datos**.
El receptor está obligado por especificación a procesar este byte y responder con un ACK actualizado. Si el búfer sigue lleno, el receptor descarta el byte y vuelve a responder $\text{rwnd} = 0$ (reiniciando el temporizador de persistencia con backoff exponencial). Tan pronto como el receptor haya liberado memoria, su respuesta al sondeo anunciará $\text{rwnd} > 0$, reactivando el flujo sin riesgo de estancamiento.

---

## 3. Principios del Control de Congestión y el Modelo AIMD

En una red compartida, si todos los emisores transmiten a su máxima velocidad de enlace, las colas de los conmutadores se llenan, provocando pérdidas masivas por desbordamiento (*buffer overflow*). La retransmisión de paquetes descartados consume aún más recursos, conduciendo al fenómeno destructivo conocido como **colapso por congestión**.

### 3.1 El Paradigma AIMD (Additive-Increase Multiplicative-Decrease)

El algoritmo de control de congestión de TCP se fundamenta en el principio matemático de Chiu y Jain: **Incremento Aditivo y Decremento Multiplicativo** (AIMD).

- **Incremento Aditivo (*Additive Increase*)**: Mientras la red opere sin pérdidas, el emisor incrementa linealmente su ventana de congestión a razón de **1 MSS por cada RTT**. El emisor sondea cautelosamente la capacidad ociosa de la red:
  $$\text{cwnd} \leftarrow \text{cwnd} + \text{MSS} \quad (\text{por cada RTT transcurrido})$$
- **Decremento Multiplicativo (*Multiplicative Decrease*)**: Al detectar la primera señal de pérdida de paquetes (síntoma de que las colas de los enrutadores han alcanzado su límite), el emisor reduce drásticamente su tasa, **dividiendo la ventana a la mitad**:
  $$\text{cwnd} \leftarrow \frac{\text{cwnd}}{2}$$

Se ha demostrado teóricamente que AIMD es la única regla de control lineal descentralizada que converge de forma asintótica y estable tanto a la **eficiencia óptima del enlace** como a la **justicia distributiva (*fairness*)**, asegurando que múltiples conexiones que compiten por un mismo enlace cuello de botella reciban partes iguales del ancho de banda independientemente de sus ventanas iniciales.

---

## 4. Las Fases del Control de Congestión en TCP

El estándar RFC 5681 formaliza cuatro fases algorítmicas en la evolución de $\text{cwnd}$:

### 4.1 Arranque Lento (Slow Start)
Cuando se establece una conexión TCP, comenzar transmitiendo con una ventana aditiva lineal (+1 MSS por RTT) tomaría un tiempo inaceptable para saturar enlaces de alta capacidad (e.g., redes de 10 Gbps). Por ello, TCP inicia en la fase de **Arranque Lento**:
- Valor inicial: $\text{cwnd} = 1\text{ MSS}$ (en implementaciones contemporáneas, RFC 6928 permite un inicio rápido de $\text{cwnd} = 10\text{ MSS}$).
- Regla de actualización: Por cada segmento confirmado por un ACK válido, $\text{cwnd}$ se incrementa en $1\text{ MSS}$:
  $$\text{cwnd} \leftarrow \text{cwnd} + \text{MSS} \quad (\text{por cada ACK recibido})$$
- **Efecto dinámico**: Dado que una ventana completa de $W$ paquetes genera $W$ acuses de recibo en un RTT, el tamaño de la ventana **se duplica en cada RTT sucesivo** ($1 \to 2 \to 4 \to 8 \to 16 \to \dots$). Por ende, el crecimiento en Slow Start es en realidad **exponencial**.

El crecimiento exponencial cesa cuando ocurre cualquiera de los siguientes tres eventos:
1. Se detecta una pérdida por temporizador (Timeout).
2. Se detecta una pérdida por tres ACKs duplicados (Fast Retransmit).
3. $\text{cwnd}$ alcanza o supera el umbral de arranque lento: $\text{cwnd} \ge \text{ssthresh}$. Al cruzar este umbral, TCP transiciona a la fase de **Prevención de Congestión**.

### 4.2 Prevención de Congestión (Congestion Avoidance)
Una vez alcanzado `ssthresh`, TCP asume que la red se encuentra próxima a su capacidad de saturación y abandona el crecimiento exponencial para evitar provocar congestión abrupta. En esta fase, aplica el incremento aditivo estricto:
- Por cada ACK individual recibido:
  $$\text{cwnd} \leftarrow \text{cwnd} + \text{MSS} \cdot \frac{\text{MSS}}{\text{cwnd}}$$
- Tras recibir la confirmación de todos los segmentos correspondientes a un RTT completo, la suma de estos incrementos fraccionarios da como resultado neto:
  $$\Delta \text{cwnd} \approx +1\text{ MSS por RTT}$$
- El gráfico de evolución temporal de $\text{cwnd}$ en esta fase es una recta con pendiente constante.

---

## 5. Análisis Comparativo: TCP Tahoe vs. TCP Reno

La gestión de eventos de pérdida marca la diferencia evolutiva entre las dos arquitecturas históricas canónicas de TCP:

### 5.1 TCP Tahoe (1988)
TCP Tahoe no distingue entre el origen de la pérdida (ya sea por Timeout o por triple ACK duplicado). Ante cualquier indicio de pérdida:
1. Actualiza el umbral a la mitad de la ventana en vuelo actual:
   $$\text{ssthresh} = \max\left(\frac{\text{cwnd}}{2}, 2\text{ MSS}\right)$$
2. Reinicia la ventana de congestión forzosamente a:
   $$\text{cwnd} = 1\text{ MSS}$$
3. Entra de inmediato en la fase de **Slow Start** hasta alcanzar el nuevo `ssthresh`, momento en el cual prosigue con Congestion Avoidance.

### 5.2 TCP Reno (1990) y Recuperación Rápida (Fast Recovery)
TCP Reno introduce la distinción clave entre pérdidas catastróficas (Timeout) y pérdidas aisladas leves (3 ACKs duplicados):
- **Ante Timeout**: Actúa con severidad idéntica a Tahoe ($\text{ssthresh} = \text{cwnd}/2$, $\text{cwnd} = 1\text{ MSS}$, entra en Slow Start).
- **Ante 3 ACKs Duplicados**: Infiere que la red todavía está transportando paquetes con éxito. Por ende:
  1. Ejecuta *Fast Retransmit* del paquete perdido.
  2. Ajusta el umbral: $\text{ssthresh} = \frac{\text{cwnd}}{2}$.
  3. Fija $\text{cwnd} = \text{ssthresh} + 3\text{ MSS}$ (los 3 MSS compensan artificialmente los 3 segmentos que ya abandonaron la red y generaron los 3 DupACKs).
  4. Entra en la fase de **Recuperación Rápida** (*Fast Recovery*): por cada ACK duplicado adicional recibido, incrementa $\text{cwnd} \leftarrow \text{cwnd} + 1\text{ MSS}$ y transmite nuevos segmentos si la ventana lo permite.
  5. Cuando finalmente arriba el "ACK nuevo" (que confirma la retransmisión y los segmentos bufferizados), colapsa la ventana al valor del umbral:
     $$\text{cwnd} = \text{ssthresh}$$
  6. Entra **directamente en Congestion Avoidance**, evitando por completo el reinicio desde 1 MSS de Slow Start.

### 5.3 El Patrón de Diente de Sierra y Rendimiento Promedio

Bajo TCP Reno en estado estacionario con pérdidas provocadas únicamente por saturación de buffers, la ventana oscila periódicamente entre $\frac{W_{\max}}{2}$ y $W_{\max}$, trazando el clásico patrón en **diente de sierra** (*sawtooth pattern*).

El throughput promedio de una conexión TCP bajo este régimen viene dado aproximadamente por el valor medio de la ventana dividido por el RTT:

$$\text{Throughput}_{\text{promedio}} = \frac{\frac{W_{\max} + \frac{W_{\max}}{2}}{2} \cdot \text{MSS}}{\text{RTT}} = 0.75 \cdot \frac{W_{\max} \cdot \text{MSS}}{\text{RTT}}$$

Esta formulación explica por qué las conexiones con RTTs prolongados (e.g., enlaces transcontinentales o satelitales) experimentan tasas efectivas notablemente inferiores a conexiones locales idénticas.
