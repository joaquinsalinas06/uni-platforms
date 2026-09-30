---
kind: subtopic
title: "Retransmisión Rápida: Inferencia de Pérdidas por Tres ACKs Duplicados"
order: 2
---

## 1. Fundamentos de la Retransmisión Rápida (Fast Retransmit)

En un esquema de tubería (*pipelining*) con ventana deslizante, el emisor transmite múltiples segmentos consecutivos antes de esperar los acuses de recibo correspondientes. Si uno de esos segmentos se pierde en tránsito mientras que los segmentos posteriores arriban con éxito al receptor, se desencadena una secuencia predecible de eventos en la capa de transporte:

1. El receptor detecta que el segmento entrante tiene un número de secuencia mayor que el esperado (existe un hueco o discontinuidad en el flujo de bytes).
2. Dado que los acuses de recibo en TCP son estrictamente acumulativos, el receptor **no puede avanzar el puntero de confirmación**.
3. El receptor almacena los datos desordenados en su búfer de reordenamiento (*reordering queue*) y genera de forma mandatoria un acuse de recibo que **repite exactamente el último valor de ACK válido**.
4. Este mensaje se denomina **ACK Duplicado** (*Duplicate ACK* o *DupACK*).

La técnica de **Retransmisión Rápida** (*Fast Retransmit*, RFC 5681) aprovecha esta cascada de ACKs duplicados para inferir la pérdida y retransmitir el segmento faltante de inmediato, evitando esperar a que el temporizador de retransmisión ($RTO$) expire.

---

## 2. Traza Operativa Detallada de Generación de DupACKs

Considérese el siguiente escenario donde el Host Emisor A transmite una ventana de 5 segmentos contiguos (cada uno de $\text{MSS} = 1000\text{ bytes}$) hacia el Host Receptor B:

- **Segmento 1**: Bytes $[1000, 1999]$ ($\text{Seq} = 1000$).
- **Segmento 2**: Bytes $[2000, 2999]$ ($\text{Seq} = 2000$).
- **Segmento 3**: Bytes $[3000, 3999]$ ($\text{Seq} = 3000$).
- **Segmento 4**: Bytes $[4000, 4999]$ ($\text{Seq} = 4000$).
- **Segmento 5**: Bytes $[5000, 5999]$ ($\text{Seq} = 5000$).

Supóngase que el **Segmento 2 se pierde** por desbordamiento de búfer en un enrutador intermedio, mientras que los segmentos 1, 3, 4 y 5 alcanzan el destino.

### Cronología de Eventos:

| Evento | Acción en el Receptor B | Segmento Enviado por B | Estado en el Emisor A |
| :--- | :--- | :--- | :--- |
| Llega Seg 1 | Recibe en orden $[1000, 1999]$. Espera byte $2000$. | $\text{ACK} = 2000$ (ACK original) | Confirma Seg 1. Ventana avanza. |
| Seg 2 perdido | *No llega ningún paquete a B.* | Ninguno | Temporizador de Seg 2 sigue corriendo. |
| Llega Seg 3 | Detecta hueco (falta $[2000, 2999]$). Bufferea $[3000, 3999]$. | $\text{ACK} = 2000$ (**1º DupACK**) | Emisor recibe 1º DupACK. Ignora (posible reordenamiento). |
| Llega Seg 4 | Detecta que el hueco persiste. Bufferea $[4000, 4999]$. | $\text{ACK} = 2000$ (**2º DupACK**) | Emisor recibe 2º DupACK. Sospecha pérdida. |
| Llega Seg 5 | Detecta que el hueco persiste. Bufferea $[5000, 5999]$. | $\text{ACK} = 2000$ (**3º DupACK**) | **¡Disparo de Fast Retransmit!** |

Al registrar el **3º ACK duplicado** (cuarto acuse de recibo con valor 2000):
1. El emisor tiene la certeza estadística de que el segmento con $\text{Seq} = 2000$ no está simplemente demorado por una ruta más lenta, sino que se ha perdido. Si solo estuviera demorado, a lo sumo uno o dos paquetes se le habrían adelantado.
2. El emisor retransmite inmediatamente el Segmento 2 ($\text{Seq} = 2000, 1000\text{ bytes}$) **sin esperar a que expire el temporizador RTO**.
3. **Efecto en el Receptor B**: Cuando la retransmisión del Segmento 2 llega exitosamente a B, B ensambla inmediatamente el Segmento 2 con los segmentos 3, 4 y 5 que ya tenía retenidos en su búfer.
4. B emite un único **ACK acumulativo masivo**: $\text{ACK} = 6000$, confirmando de golpe toda la secuencia hasta el byte 5999.

---

## 3. Comparativa: Detección por Timeout vs. Fast Retransmit

La dualidad entre la detección por timeout y la detección por triple ACK duplicado marca dos modos operacionales radicalmente distintos en el rendimiento de TCP:

### 3.1 Detección por Temporizador (Timeout)
- **Causa típica**: Pérdida masiva de paquetes en ráfaga (donde se descartan todos los segmentos de la ventana), o pérdida del último paquete de una ráfaga (donde no hay segmentos posteriores que provoquen ACKs duplicados).
- **Impacto temporal**: El emisor se detiene y espera el valor completo de $RTO$ (que suele ser $\ge 200\text{ ms}$ y a menudo $1.0\text{ s}$). Durante este intervalo, la tubería de transmisión se vacía por completo.
- **Diagnóstico de la red**: Indica una congestión potencialmente severa en la infraestructura intermedia.
- **Respuesta de congestión**: Reducción drástica de la ventana de congestión ($\text{cwnd} = 1\text{ MSS}$), reiniciando el proceso desde la fase de *Slow Start*.

### 3.2 Detección por Fast Retransmit (3 DupACKs)
- **Causa típica**: Pérdida aislada de un único paquete mientras la red sigue transmitiendo con éxito los paquetes subsecuentes.
- **Impacto temporal**: Ocurre en el orden de un solo $RTT$ (el tiempo que tardan los paquetes posteriores en llegar al receptor y sus ACKs en regresar). La tubería nunca se vacía del todo.
- **Diagnóstico de la red**: Indica una congestión moderada o localizada; la red todavía es capaz de cursar el resto del tráfico con normalidad.
- **Respuesta de congestión**: En algoritmos modernos como TCP Reno, no se reinicia a $\text{cwnd} = 1$, sino que se divide la ventana a la mitad ($\text{cwnd} = \text{ssthresh} = \frac{\text{cwnd}}{2}$) y se entra en la fase de **Recuperación Rápida** (*Fast Recovery*), manteniendo un rendimiento promedio significativamente superior.
