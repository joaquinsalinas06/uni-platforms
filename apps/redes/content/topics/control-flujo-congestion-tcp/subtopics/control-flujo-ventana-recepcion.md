---
kind: subtopic
title: "Control de Flujo: Ventana de Recepción (rwnd), Sondas Zero-Window y Síndrome de la Ventana Tonta"
order: 1
---

## 1. Arquitectura del Búfer de Recepción y Cálculo de rwnd

El servicio de control de flujo de TCP es un mecanismo de emparejamiento de velocidad (*speed-matching service*) diseñado para asegurar que un emisor no abrume la capacidad de absorción del receptor.

Cuando arriban segmentos TCP al host de destino, la pila del sistema operativo los desencapsula, verifica su integridad mediante el checksum y los deposita en una memoria intermedia asignada por el socket denominada `RcvBuffer`. La aplicación de usuario extrae bytes de este búfer a su propio ritmo mediante llamadas al sistema como `read()` o `recv()`.

### 1.1 Variables de Control en Recepción

En cualquier instante de tiempo, el receptor mantiene tres punteros de estado:
1. $\text{LastByteRcvd}$: Número de secuencia del último byte consecutivo que ha sido recibido desde la red e ingresado al búfer.
2. $\text{LastByteRead}$: Número de secuencia del último byte que la aplicación consumidora local ha leído efectivamente.
3. $\text{RcvBuffer}$: Tamaño total en bytes de la memoria asignada al socket receptor.

La cantidad de memoria actualmente ocupada por datos pendientes de lectura es:

$$\text{BytesOcupados} = \text{LastByteRcvd} - \text{LastByteRead}$$

Para garantizar que el búfer nunca se desborde, el kernel impone la restricción:

$$\text{LastByteRcvd} - \text{LastByteRead} \le \text{RcvBuffer}$$

La **Ventana de Recepción** anunciada ($\text{rwnd}$) se calcula como el espacio remanente disponible:

$$\text{rwnd} = \text{RcvBuffer} - (\text{LastByteRcvd} - \text{LastByteRead})$$

Este valor se actualiza dinámicamente y se inserta en el campo *Receive Window* (16 bits) de cada segmento ACK que viaja hacia el emisor.

### 1.2 Traza Numérica del Agotamiento de la Ventana

Considérese un socket TCP receptor con un tamaño de búfer fijado en $\text{RcvBuffer} = 4096\text{ bytes}$:
- **Estado 0**: El socket se inicializa. $\text{LastByteRead} = 0$, $\text{LastByteRcvd} = 0$.
  $$\text{rwnd} = 4096 - (0 - 0) = 4096\text{ bytes}$$
- **Estado 1**: El emisor transmite un segmento con 2048 bytes de datos ($[1, 2048]$). El receptor lo almacena, pero la aplicación consumidora se encuentra ocupada y no ejecuta ninguna lectura ($\text{LastByteRead} = 0$).
  $$\text{rwnd} = 4096 - (2048 - 0) = 2048\text{ bytes}$$
  El receptor emite un ACK con $\text{Ack} = 2049$ y $\text{rwnd} = 2048$.
- **Estado 2**: El emisor transmite otro segmento con 2048 bytes ($[2049, 4096]$). El receptor lo almacena. La aplicación sigue sin leer ($\text{LastByteRead} = 0$).
  $$\text{rwnd} = 4096 - (4096 - 0) = 0\text{ bytes}$$
  El receptor emite un ACK con $\text{Ack} = 4097$ y $\text{rwnd} = 0$.
- **Estado 3**: Al recibir $\text{rwnd} = 0$, el emisor detiene inmediatamente la transmisión de nuevos datos.

---

## 2. El Interbloqueo de Ventana Cero y Segmentos de Sondeo (Zero-Window Probes)

Cuando el emisor recibe $\text{rwnd} = 0$, entra en un estado de espera pasiva. Supóngase ahora que la aplicación consumidora en el receptor se reactiva y lee 4096 bytes del búfer:
- En el receptor: $\text{LastByteRead} = 4096$, por lo que la ventana disponible se reabre completamente a $\text{rwnd} = 4096$.
- El receptor genera un segmento ACK para notificar la apertura de la ventana ($\text{Ack} = 4097$, $\text{rwnd} = 4096$).
- **La Falla del Canal**: Dado que los ACKs puros no consumen números de secuencia y no tienen temporizadores de retransmisión, si este segmento ACK se descarta accidentalmente por ruido o congestión en la red, el emisor nunca se entera de que el búfer se liberó.
- Se produce un **interbloqueo (*deadlock*)**: el emisor espera que el receptor le anuncie ventana libre, mientras que el receptor espera que el emisor transmita nuevos datos.

### La Solución: Temporizador de Persistencia y Zero-Window Probes (ZWP)

Para erradicar este bloqueo, la especificación de TCP define el **Temporizador de Persistencia** (*Persist Timer*):
1. Cuando el emisor recibe un anuncio de $\text{rwnd} = 0$, activa su temporizador de persistencia.
2. Si el temporizador expira sin que haya llegado una actualización de ventana, el emisor transmite un **segmento de sondeo de ventana cero** (*Zero-Window Probe*, ZWP), el cual transporta **exactamente 1 byte de datos** con el número de secuencia correspondiente al siguiente byte esperado.
3. El receptor está obligado a procesar este segmento de 1 byte y responder con un nuevo ACK que declare su estado de búfer actual.
4. Si el búfer sigue saturado, el receptor descarta el byte del sondeo y responde $\text{rwnd} = 0$. El emisor reajusta el temporizador de persistencia aplicando retroceso exponencial (*exponential backoff*).
5. En el instante en que el receptor tenga espacio libre, su ACK en respuesta al sondeo anunciará $\text{rwnd} > 0$, restaurando el flujo normal de datos y disolviendo el interbloqueo.

---

## 3. Síndrome de la Ventana Tonta (Silly Window Syndrome - SWS)

El Síndrome de la Ventana Tonta es una condición patológica en la que los datos se intercambian a través de la red en micropaquete diminutos (por ejemplo, segmentos que contienen 1 o 2 bytes de datos útiles dentro de 40 bytes de cabeceras TCP/IP), degradando la eficiencia del canal hasta niveles insignificantes.

Puede originarse tanto por el comportamiento del receptor como por el del emisor:

### 3.1 SWS Originado en el Receptor y la Solución de Clark
- **El Problema**: El búfer del receptor está lleno. La aplicación consumidora lee un único carácter (1 byte) del socket. Si el receptor generara inmediatamente un ACK anunciando $\text{rwnd} = 1\text{ byte}$, el emisor enviaría un segmento con solo 1 byte de carga útil (41 bytes de tráfico de red para 1 byte útil). El ciclo se repetiría indefinidamente.
- **Solución de Clark**: El receptor **no debe anunciar ventanas pequeñas**. Debe retener el anuncio de apertura y continuar reportando $\text{rwnd} = 0$ hasta que ocurra una de las siguientes dos condiciones:
  1. Haya suficiente espacio libre en el búfer para albergar un segmento completo de tamaño máximo ($\text{rwnd} \ge \text{MSS}$).
  2. Al menos la mitad del búfer de recepción se encuentre vacía ($\text{rwnd} \ge \frac{\text{RcvBuffer}}{2}$).

### 3.2 SWS Originado en el Emisor y el Algoritmo de Nagle
- **El Problema**: La aplicación en el emisor genera datos byte a byte (por ejemplo, pulsaciones de teclas en una sesión SSH interactiva). Si TCP transmitiera cada byte en un segmento individual, se saturaría la red con una sobrecarga abrumadora.
- **Algoritmo de Nagle (RFC 896)**: Establece una regla estricta para empaquetar datos:
  - Si los datos acumulados en el búfer de envío llenan al menos un segmento completo de tamaño $\text{MSS}$, transmitir de inmediato.
  - Si los datos acumulados son menores que un $\text{MSS}$:
    - Si **no hay datos no confirmados previamente en vuelo** (es decir, todos los segmentos anteriores ya recibieron ACK), transmitir el segmento pequeño de inmediato (asegura interactividad para la primera pulsación de tecla).
    - Si **todavía existen segmentos en vuelo esperando ACK**, retener los nuevos bytes en el búfer local y acumularlos hasta que arribe el ACK pendiente o hasta acumular un segmento de tamaño $\text{MSS}$.

El algoritmo de Nagle fusiona de forma adaptativa pequeños paquetes en segmentos de tamaño óptimo sin requerir temporizadores explícitos adicionales, optimizando drásticamente la utilización del ancho de banda.
