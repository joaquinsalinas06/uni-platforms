---
kind: theory
title: "Estimación de RTT, Timeout y Fast Retransmit en TCP"
---

## 1. El Dilema del Temporizador de Retransmisión en Internet

En los protocolos de transporte confiable, el temporizador de retransmisión (*Retransmission TimeOut*, RTO) es el mecanismo fundamental de última instancia para recuperarse de la pérdida de paquetes. Si un emisor transmite un segmento y no recibe acuse de recibo antes de que expire el temporizador, asume que el segmento (o su acuse) se perdió y procede a retransmitirlo.

Determinar la duración óptima de este intervalo representa un desafío mayúsculo en redes de conmutación de paquetes como Internet, donde las condiciones de tráfico, rutas físicas y cargas de encolamiento fluctúan drásticamente en milisegundos:
- **Si el intervalo de expiración es demasiado corto**: Se producen **retransmisiones prematuras o espurias**. Segmentos que simplemente sufrieron un ligero retardo de encolamiento se retransmiten innecesariamente, inyectando paquetes redundantes en una red que probablemente ya está congestionada y desperdiciando ancho de banda.
- **Si el intervalo de expiración es demasiado largo**: El protocolo reacciona con lentitud extrema ante pérdidas reales. El canal de comunicación queda inactivo durante cientos de milisegundos esperando la expiración del temporizador, degradando severamente el rendimiento y la tasa de transferencia efectiva (*throughput*).

Por consiguiente, el temporizador de TCP no puede ser un valor estático: **debe ser dinámico y adaptarse continuamente a las variaciones del tiempo de ida y vuelta** ($RTT$, *Round-Trip Time*).

---

## 2. Medición y Estimación de RTT: Algoritmo de Jacobson y Karels (RFC 6298)

Para estimar el retardo de la red, un extremo emisor TCP mide periódicamente el tiempo que transcurre desde que envía un segmento hasta que recibe el correspondiente acuse de recibo ($ACK$). Esta medición puntual se denomina **SampleRTT**.

### 2.1 La Ambigüedad de la Retransmisión y el Algoritmo de Karn

Cuando un segmento se retransmite (por ejemplo, tras expirar un temporizador previo) y posteriormente arriba un acuse de recibo, surge una incertidumbre insalvable conocida como la **ambigüedad del ACK**: ¿El acuse de recibo recibido corresponde a la primera transmisión del segmento o a la segunda retransmisión?
- Si el emisor asume que corresponde a la primera transmisión, calculará un `SampleRTT` artificialmente gigante (incluyendo el tiempo de espera del timeout).
- Si el emisor asume que corresponde a la segunda transmisión, pero en realidad fue la primera transmisión demorada, calculará un `SampleRTT` artificialmente diminuto.

Para erradicar este sesgo, el **Algoritmo de Karn** (RFC 6298) impone dos reglas inviolables:
1. **Regla de Medición**: **Nunca** se debe computar un `SampleRTT` para segmentos que hayan sido retransmitidos. Las mediciones de `SampleRTT` se obtienen exclusivamente a partir de segmentos transmitidos una única vez.
2. **Regla de Respaldo**: Mientras una conexión esté retransmitiendo segmentos tras un timeout, el valor de `TimeoutInterval` no se actualiza con la fórmula habitual; en su lugar, se duplica exponencialmente ante cada timeout sucesivo.

### 2.2 Estimación del Promedio: EWMA (EstimatedRTT)

Dado que las mediciones individuales de `SampleRTT` presentan alta varianza debido a fluctuaciones momentáneas de colas en enrutadores intermedios, TCP aplica un filtro paso bajo denominado **Media Móvil Ponderada Exponencial** (*Exponentially Weighted Moving Average*, EWMA):

$$\text{EstimatedRTT} = (1 - \alpha) \cdot \text{EstimatedRTT} + \alpha \cdot \text{SampleRTT}$$

El parámetro $\alpha$ determina la velocidad de adaptación frente al peso del historial acumulado:
- En las recomendaciones canónicas del RFC 6298, el valor estándar adoptado es:
  $$\alpha = \frac{1}{8} = 0.125$$
- Desarrollando la recursión matemática, el peso de una muestra obtenida hace $k$ iteraciones decae exponencialmente según $(1 - \alpha)^k = (0.875)^k$. Esto otorga mayor relevancia a las mediciones recientes pero suaviza picos transitorios aislados.

### 2.3 Estimación de la Dispersión y Variabilidad: DevRTT

El tiempo de timeout no solo debe seguir la media, sino que debe situarse por encima de la media con un margen de seguridad proporcional a la dispersión estadística de los retardos. Si la red es muy volátil, el margen debe ser amplio; si la red es sumamente estable, el margen puede ser estrecho.

TCP modela esta dispersión mediante la desviación absoluta media, denominada **DevRTT** (estimación de la desviación estándar de RTT mediante EWMA):

$$\text{DevRTT} = (1 - \beta) \cdot \text{DevRTT} + \beta \cdot |\text{SampleRTT} - \text{EstimatedRTT}|$$

El valor estándar recomendado por el RFC 6298 es:
$$\beta = \frac{1}{4} = 0.25$$

### 2.4 Intervalo de Temporización de Retransmisión (TimeoutInterval)

Una vez calculadas la media suavizada y la variabilidad, el temporizador de retransmisión se fija como la media más un margen de seguridad de **cuatro desviaciones medias**:

$$\text{TimeoutInterval} = \text{EstimatedRTT} + 4 \cdot \text{DevRTT}$$

El factor $4$ garantiza teóricamente que, para una distribución razonable de retardos, más del $99\%$ de los paquetes recibirán su confirmación antes de la expiración del temporizador, minimizando las retransmisiones innecesarias.

#### Condiciones Iniciales y Cotas:
1. **Primera Medición**: Antes de obtener la primera muestra, se asigna $\text{TimeoutInterval} = 1.0\text{ s}$. Al recibir la primera muestra $\text{SampleRTT}_1$:
   $$\text{EstimatedRTT} = \text{SampleRTT}_1$$
   $$\text{DevRTT} = \frac{\text{SampleRTT}_1}{2}$$
   $$\text{TimeoutInterval} = \text{EstimatedRTT} + 4 \cdot \text{DevRTT}$$
2. **Cota Mínima**: Las especificaciones recomiendan un límite inferior estricto ($\text{TimeoutInterval} \ge 200\text{ ms}$ en Linux o $1.0\text{ s}$ en RFC 6298 clásico) para evitar colapsos por congestión ante ráfagas ultra-rápidas.

---

## 3. Retransmisión Rápida (Fast Retransmit)

A pesar de la optimización del cálculo de RTO, esperar la expiración de un temporizador impone penalizaciones de tiempo inaceptables en conexiones de alto rendimiento (redes de fibra óptica o centros de datos donde el RTT es de pocos milisegundos pero el temporizador tiene cotas mínimas).

Para acelerar la recuperación ante pérdidas aisladas sin incurrir en la latencia del temporizador, TCP implementa el mecanismo de **Retransmisión Rápida** (*Fast Retransmit*).

### 3.1 El Principio de los ACKs Duplicados

Cuando el receptor TCP recibe un segmento fuera de orden (por ejemplo, llegó el segmento con $\text{Seq} = 3000$ pero aún no ha llegado el segmento con $\text{Seq} = 2000$), la especificación le prohíbe avanzar la ventana acumulativa. Por lo tanto, el receptor genera inmediatamente un acuse de recibo repitiendo el último byte consecutivo validado ($\text{ACK} = 2000$).

Si el emisor estaba transmitiendo una ráfaga continua de paquetes bajo un régimen de tubería (*pipelining*):
1. Envía segmentos 1, 2, 3, 4 y 5.
2. El segmento 2 se destruye o descarta en un enrutador intermedio.
3. El segmento 1 llega $\to$ Receptor emite $\text{ACK} = 2$ (acuse normal).
4. El segmento 3 llega $\to$ Receptor detecta hueco y emite $\text{ACK} = 2$ (**1º ACK duplicado**).
5. El segmento 4 llega $\to$ Receptor detecta hueco y emite $\text{ACK} = 2$ (**2º ACK duplicado**).
6. El segmento 5 llega $\to$ Receptor detecta hueco y emite $\text{ACK} = 2$ (**3º ACK duplicado**).

### 3.2 ¿Por qué se requieren exactamente 3 ACKs duplicados?

En Internet, los datagramas IP pueden tomar rutas divergentes con retardos asimétricos, provocando que los paquetes lleguen levemente **desordenados** (*packet reordering*) al destino sin que ninguno se haya perdido realmente:
- Si el reordenamiento es menor (por ejemplo, el paquete 2 llegó una fracción de milisegundo después del paquete 3), el receptor generará uno o a lo sumo dos ACKs duplicados antes de recibir el paquete 2 y restablecer la secuencia normal.
- Sin embargo, si el emisor recibe **tres ACKs duplicados consecutivos** (lo que equivale a recibir **cuatro ACKs idénticos en total**), la probabilidad de que se trate de un simple desordenamiento se vuelve matemáticamente despreciable. La inferencia casi segura es que el paquete faltante **se ha perdido irrevocablemente**.

### 3.3 Mecanismo de Disparo de Fast Retransmit

Al contabilizar el **tercer ACK duplicado**:
1. El emisor **no espera a que expire el temporizador RTO**.
2. Retransmite inmediatamente el segmento no confirmado más antiguo indicado por el campo ACK (en el ejemplo, el segmento 2).
3. Transiciona a los algoritmos de control de congestión avanzados (Recuperación Rápida en TCP Reno, o reinicio en TCP Tahoe), permitiendo restaurar el flujo de datos en una fracción del tiempo de un timeout completo.
