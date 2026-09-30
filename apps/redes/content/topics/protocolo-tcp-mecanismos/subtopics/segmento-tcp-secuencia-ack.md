---
kind: subtopic
title: "Estructura del Segmento TCP, Números de Secuencia y ACKs Acumulativos"
order: 1
---

## 1. La Filosofía de Numeración de Bytes en TCP

A diferencia de los protocolos de capa de enlace o de transporte que asignan un identificador correlativo entero a cada paquete (por ejemplo, trama 0, trama 1, trama 2 en protocolos elementales), TCP opera sobre una abstracción de **flujo continuo de bytes**.

Para TCP, los datos transmitidos son una cadena lineal y contigua de octetos ($0, 1, 2, \dots, N-1$). Por lo tanto:
- El **Número de Secuencia** (*Sequence Number*) de un segmento no es el ordinal del paquete, sino el **número de orden del primer byte de datos** contenido en ese segmento específico dentro del flujo global.
- Si el número de secuencia inicial aleatorio del emisor es $ISN_A = 50000$ y el emisor envía un segmento que contiene $1000$ bytes de datos de aplicación:
  - $\text{Seq} = 50000$.
  - Los bytes transportados corresponden al rango $[50000, 50999]$.
  - El siguiente segmento comenzará con $\text{Seq} = 50000 + 1000 = 51000$.

### 1.1 Cálculo del Desplazamiento y Tamaño de Carga Útil

La cantidad de bytes de carga útil (*payload*) contenida en un segmento no se declara explícitamente en ningún campo específico de la cabecera TCP. En su lugar, el receptor la deduce matemáticamente a partir de las cabeceras de red y transporte:

$$\text{Longitud Payload TCP} = \text{Total Length IP} - \text{Header Length IP} - \text{Data Offset TCP}$$

Donde:
- $\text{Total Length IP}$ proviene de la cabecera IPv4 (en bytes).
- $\text{Header Length IP}$ es el campo IHL multiplicado por 4 bytes.
- $\text{Data Offset TCP}$ es el campo de longitud de cabecera TCP multiplicado por 4 bytes.

---

## 2. Acuses de Recibo Acumulativos y Manejo de Segmentos Fuera de Orden

TCP emplea el principio de **Acuse de Recibo Acumulativo** (*Cumulative Acknowledgment*). El valor numérico colocado en el campo *Acknowledgment Number* representa el número de secuencia del **siguiente byte consecutivo que el receptor espera recibir**:

$$\text{ACK} = \text{Último Byte Recibido Consecutivamente} + 1$$

### 2.1 Propiedades del ACK Acumulativo

1. **Confirmación Implícita Total**: Un mensaje de confirmación con $\text{ACK} = K$ garantiza al emisor que **todos** los bytes comprendidos entre el número de secuencia inicial y el byte $K - 1$ han sido recibidos exitosamente y depositados en orden en el búfer de recepción.
2. **Robustez ante Pérdida de ACKs Intermedios**: Supóngase que el Host A envía tres segmentos sucesivos con bytes $[1000, 1999]$, $[2000, 2999]$ y $[3000, 3999]$. El Host B recibe los tres segmentos y genera acuses $\text{ACK} = 2000$, $\text{ACK} = 3000$ y $\text{ACK} = 4000$. Si los acuses $2000$ y $3000$ se pierden en el enlace de retorno por congestión, pero el acuse $4000$ llega intacto al Host A, el Host A sabe inequívocamente que los tres segmentos fueron recibidos correctamente. La pérdida de los dos primeros ACKs no provoca retransmisiones innecesarias.

### 2.2 Segmentos Fuera de Orden y Generación de ACKs Duplicados

¿Qué ocurre cuando un segmento se pierde o se retrasa y los segmentos posteriores llegan antes?
Por ejemplo:
- Se envían tres segmentos: Segmento 1 ($\text{Seq} = 1000$, $500$ bytes, rango $[1000, 1499]$), Segmento 2 ($\text{Seq} = 1500$, $500$ bytes, rango $[1500, 1999]$) y Segmento 3 ($\text{Seq} = 2000$, $500$ bytes, rango $[2000, 2499]$).
- El Segmento 1 llega correctamente $\to$ El receptor emite $\text{ACK} = 1500$.
- El Segmento 2 **se pierde** en un enrutador intermedio.
- El Segmento 3 llega intacto al receptor.

El receptor detecta un hueco (*gap*) en la secuencia esperada (esperaba el byte $1500$, pero llegó el byte $2000$). La especificación de TCP establece:
1. El receptor almacena en un búfer temporal (*reordering buffer*) los bytes válidos recibidos fuera de orden ($[2000, 2499]$) para no tener que descartarlos.
2. El receptor **no puede** confirmar los bytes del segmento 3 de forma acumulativa, porque violaría la semántica de que todos los bytes previos están completos.
3. El receptor genera de forma inmediata un segmento de confirmación repitiendo el último ACK acumulativo válido: $\text{ACK} = 1500$.
4. Este mensaje se denomina **ACK Duplicado** (*Duplicate ACK*). La llegada reiterada de estos ACKs duplicados al emisor constituye la señal directa utilizada por el algoritmo de *Fast Retransmit* para detectar la pérdida prematura del segmento faltante sin esperar al temporizador.

---

## 3. Piggybacking y Estrategias de Retardo de ACKs

En una sesión interactiva (como SSH o Telnet), la comunicación es bidireccional continua:
- Cuando el Host A envía datos al Host B, el Host B puede incluir su acuse de recibo de los datos del Host A dentro de un segmento que transporta al mismo tiempo datos de aplicación producidos por el propio Host B.
- Esta técnica se denomina **Piggybacking** (transporte a cuestas), y ahorra el consumo de cabeceras innecesarias en la red.

Cuando el receptor no tiene datos inmediatos para enviar en sentido inverso, aplicar un ACK de inmediato por cada segmento entrante generaría una sobrecarga del 100% en paquetes de control pequeños (40 bytes de cabecera por cada segmento de datos). Por ello, el RFC 1122 define la recomendación de **ACK Diferido** (*Delayed ACK*):
- Un receptor TCP puede retener el envío de un ACK puro hasta por $200\text{ ms}$ (típicamente hasta $50\text{ ms}$ en sistemas modernos), a la espera de que la aplicación local genere datos para acoplar el ACK (*piggyback*), o de que arribe un segundo segmento contiguo.
- Si arriba un segundo segmento consecutivo antes de que expire el temporizador de retraso, el receptor debe emitir de inmediato un único ACK acumulativo que confirme ambos segmentos. Como regla estándar: se debe emitir al menos un ACK por cada dos segmentos de datos consecutivos recibidos en orden.
