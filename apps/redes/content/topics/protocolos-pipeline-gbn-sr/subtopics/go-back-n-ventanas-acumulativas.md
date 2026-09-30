---
kind: subtopic
title: "Go-Back-N: Ventana Deslizante, ACKs Acumulativos y Resiliencia a Pérdidas"
order: 1
---

## 1. Arquitectura de Estados en Go-Back-N

El protocolo Go-Back-N implementa el paradigma de ventana deslizante gestionando cuatro zonas conceptuales en la secuencia de numeración del emisor:
1. `[0, base - 1]`: Paquetes que han sido transmitidos y confirmados exitosamente.
2. `[base, nextseqnum - 1]`: Paquetes que han sido enviados pero cuyos acuses de recibo aún no han regresado al emisor (paquetes "en vuelo").
3. `[nextseqnum, base + N - 1]`: Números de secuencia que pueden asignarse inmediatamente a nuevos datos provistos por la aplicación sin violar la restricción del tamaño de ventana $N$.
4. `[base + N, \infty)`: Paquetes futuros que no pueden transmitirse hasta que la ventana se desplace hacia la derecha al confirmarse el paquete en `base`.

---

## 2. Robustez Intrínseca de los ACKs Acumulativos

Una de las ventajas ingenieriles más destacadas de Go-Back-N es el uso de **acuses de recibo acumulativos** (*Cumulative ACKs*). En esta convención, un paquete de confirmación con número de secuencia $n$ no significa simplemente "el paquete $n$ llegó bien", sino:
$$\text{ACK}(n) \iff \forall i \le n, \text{ el paquete } i \text{ fue recibido intacto y en orden estricto}$$

### Tolerancia a Pérdidas de Control en el Canal de Retorno
Supóngase que el emisor transmite los paquetes $0, 1, 2$ y $3$ en una ráfaga continua:
- El receptor procesa el paquete $0$ y emite `ACK(0)`.
- El receptor procesa el paquete $1$ y emite `ACK(1)`.
- El receptor procesa el paquete $2$ y emite `ACK(2)`.
- Si `ACK(0)` y `ACK(1)` se pierden o destruyen completamente en el enlace de retorno debido a congestión, pero `ACK(2)` arriba sano al emisor antes del vencimiento del temporizador:
  - El emisor procesa `ACK(2)`.
  - Dado que la semántica es acumulativa, el emisor deduce que los paquetes $0$ y $1$ **necesariamente llegaron a su destino**, puesto que el receptor jamás habría generado un `ACK(2)` si existiese alguna brecha previa.
  - El emisor actualiza su puntero de base directamente a `base = 3`, absorbiendo la pérdida de los acuses de recibo anteriores sin disparar ninguna retransmisión innecesaria.

---

## 3. Descarte Fuera de Orden en el Receptor y la Cascada de Retransmisión

A pesar de su elegancia ante pérdidas de ACKs, GBN paga un costo severo cuando se pierde un **paquete de datos**.

### Inflexibilidad del Receptor
El receptor de GBN se diseña para minimizar el uso de memoria RAM y la complejidad algorítmica. Por diseño:
- No mantiene ningún búfer para almacenar paquetes adelantados.
- Si el emisor transmite los paquetes $0, 1, 2, 3, 4$ y el paquete $1$ se pierde en tránsito, los paquetes subsiguientes $2, 3$ y $4$ arribarán sucesivamente al receptor.
- Para cada uno de ellos, el receptor evalúa:
  $$\text{packet.seqnum} \ne \text{expectedseqnum} \quad (\text{esperaba } 1, \text{ llegó } 2, 3, 4)$$
- El receptor **descarta y desecha de inmediato los paquetes 2, 3 y 4**, liberando su búfer, y por cada descarte retransmite una copia de `ACK(0)` (el último paquete en orden).

### La Cascada de Retransmisión por Timeout
- Mientras tanto, el temporizador del emisor (iniciado cuando se transmitió el paquete 1) sigue descontando tiempo.
- Al expirar el temporizador, el emisor debe retransmitir **todos los paquetes en vuelo dentro de la ventana**:
  $$\text{Retransmite } \{1, 2, 3, 4\}$$
- Incluso si los paquetes $2, 3$ y $4$ habían cruzado la red sin un solo bit de error en el intento anterior, la incapacidad del receptor para almacenarlos fuera de orden obliga a una retransmisión redundante que satura el canal y agrava posibles estados de congestión en los conmutadores de la ruta.
