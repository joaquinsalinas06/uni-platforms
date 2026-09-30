---
kind: theory
title: "Principios de Transferencia Confiable (RDT 1.0 a 3.0)"
---

## 1. El Problema Fundamental de la Transferencia Confiable

En los sistemas distribuidos y redes de datos, la capa de aplicación requiere con frecuencia una abstracción de canal de comunicación **completamente confiable**: los bits transmitidos deben recibirse íntegros, sin duplicados, sin pérdidas y estrictamente en el mismo orden secuencial en que fueron emitidos. Sin embargo, la capa de red subyacente (el protocolo IP en Internet) provee únicamente un servicio *best-effort*, lo que implica que el canal físico e inter-red es intrínsecamente no confiable: los paquetes pueden sufrir corrupción de bits, pérdidas catastróficas por desbordamiento de búferes en enrutadores o retardos arbitrarios que alteren su secuencia de llegada.

El protocolo de transferencia confiable de datos (**RDT**, *Reliable Data Transfer*) se sitúa en la capa de transporte para cerrar esta brecha, implementando mecanismos algorítmicos que transforman un canal no confiable en un canal confiable.

---

## 2. Primitivas de la Interfaz y Notación FSM

Para modelar matemáticamente los protocolos RDT se emplean **Máquinas de Estados Finitos (FSM)**. La interacción entre capas adyacentes se formaliza mediante interfaces canónicas:

- `rdt_send(data)`: Invocada por la capa superior (aplicación) para pasar datos a la entidad RDT emisora.
- `udt_send(packet)`: Invocada por la entidad RDT para enviar un paquete a través del canal no confiable (*Unreliable Data Transfer*).
- `rdt_rcv(packet)`: Invocada por la capa de red cuando un paquete arriba al extremo receptor.
- `deliver_data(data)`: Invocada por la entidad RDT receptora para entregar datos limpios a la capa superior.

En los diagramas de transición de estado, cada transición está rotulada con la sintaxis:
$$\frac{\text{Evento que desencadena la transición}}{\text{Acciones ejecutadas durante la transición}}$$

Si una transición no requiere acciones, se indica mediante una línea horizontal vacía ($\Lambda$).

---

## 3. RDT 1.0: Transferencia sobre un Canal Ideal

En **RDT 1.0**, se asume que el canal físico subyacente es 100% confiable: no ocurren errores de bit ni se pierden paquetes.

- **Emisor**: Permanece en un único estado *Wait for call from above*. Al ocurrir `rdt_send(data)`, encapsula los datos mediante `packet = make_pkt(data)` y los transmite mediante `udt_send(packet)`.
- **Receptor**: Permanece en un único estado *Wait for call from below*. Al ocurrir `rdt_rcv(packet)`, extrae los datos mediante `extract(packet, data)` y los entrega a la aplicación con `deliver_data(data)`.

No se requieren números de secuencia, acuses de recibo ni temporizadores, dado que el canal no introduce ninguna distorsión.

---

## 4. RDT 2.0: Canal con Errores de Bit y Mecanismo ARQ

En **RDT 2.0**, los bits de un paquete pueden alterarse durante el tránsito. El protocolo incorpora la técnica **ARQ** (*Automatic Repeat reQuest*), la cual se fundamenta en tres mecanismos elementales:

1. **Detección de Errores**: Se añade un campo de suma de verificación (*checksum*) a cada paquete.
2. **Retroalimentación del Receptor**: El receptor evalúa la integridad y emite un paquete de control explícito:
   - **ACK** (*Positive Acknowledgment*): Indica que el paquete se recibió sin corrupción.
   - **NAK** (*Negative Acknowledgment*): Indica que el paquete contiene bits alterados.
3. **Retransmisión**: Al recibir un NAK, el emisor retransmite el último paquete enviado.

### La Falla Fatal de RDT 2.0: Corrupción de la Retroalimentación
Si un paquete ACK o NAK se corrompe en el enlace de retorno hacia el emisor, este no puede descifrar la respuesta. Si el emisor simplemente retransmite el paquete ante una respuesta ininteligible, el receptor no tiene forma de distinguir si el nuevo paquete es una retransmisión (un duplicado del paquete anterior que sí llegó correctamente) o un paquete nuevo con datos distintos.

---

## 5. RDT 2.1: Números de Secuencia de 1 Bit

Para solucionar la ambigüedad generada por la corrupción de ACKs y NAKs, **RDT 2.1** introduce **números de secuencia alternantes** ($0$ y $1$):

- El emisor etiqueta sus paquetes alternando entre secuencia $0$ y secuencia $1$.
- Las FSMs tanto del emisor como del receptor duplican su número de estados:
  - Emisor: *Wait for call 0 from above* $\to$ *Wait for ACK/NAK 0* $\to$ *Wait for call 1 from above* $\to$ *Wait for ACK/NAK 1*.
  - Receptor: *Wait for 0 from below* $\to$ *Wait for 1 from below*.
- Si el receptor se encuentra esperando el paquete $0$ y recibe un paquete válido con número de secuencia $1$, concluye que su ACK anterior se dañó o perdió; descarta el paquete duplicado pero vuelve a enviar un ACK para el paquete $1$.

---

## 6. RDT 2.2: Protocolo Libre de NAK (NAK-Free)

**RDT 2.2** simplifica la lógica eliminando por completo los paquetes NAK. En su lugar:
- El receptor siempre envía un paquete **ACK**, pero incluye explícitamente el **número de secuencia** del último paquete recibido correctamente (`make_pkt(ACK, 0)` o `make_pkt(ACK, 1)`).
- Si el emisor se encuentra esperando un ACK para el paquete $1$ y recibe un paquete corrupto o un `ACK 0`, lo interpreta como un NAK implícito y retransmite inmediatamente el paquete $1$.

---

## 7. RDT 3.0: Canales con Pérdidas y Temporizadores (Stop-and-Wait)

En **RDT 3.0**, el canal no solo altera bits, sino que además puede descartar paquetes por completo (tanto paquetes de datos como paquetes ACK).

### El Mecanismo del Temporizador
Para detectar pérdidas, el emisor implementa un **temporizador de cuenta regresiva** (*countdown timer*):
1. Al transmitir un paquete de datos, inicia el temporizador (`start_timer`).
2. Si el ACK correspondiente arriba antes del vencimiento del tiempo límite, cancela el temporizador (`stop_timer`) y avanza de estado.
3. Si el temporizador expira (**timeout**), el emisor retransmite el paquete y reinicia el temporizador.

Debido a que el timeout puede ocurrir prematuramente (por ejemplo, si el retardo del canal supera transitoriamente la estimación del temporizador), se generarán paquetes duplicados en la red. RDT 3.0 maneja de manera natural estos duplicados gracias a los números de secuencia heredados de RDT 2.2.

---

## 8. Rendimiento de RDT 3.0 y el Cuello de Botella de Stop-and-Wait

RDT 3.0 es funcionalmente correcto pero pésimo en términos de rendimiento. Al ser un protocolo de tipo **Parada y Espera** (*Stop-and-Wait*), el emisor inyecta un único paquete en la red y permanece inactivo hasta recibir la confirmación antes de transmitir el siguiente.

### Formulación de la Utilización
Considérese un enlace con tasa de transmisión de $R = 1\text{ Gbps}$ ($10^9\text{ bps}$), un tamaño de paquete de $L = 1000\text{ bytes} = 8000\text{ bits}$, y un retardo de propagación de ida y vuelta de $RTT = 30\text{ ms} = 0.030\text{ s}$.

El tiempo necesario para transmitir el paquete al canal es:
$$t_{\text{trans}} = \frac{L}{R} = \frac{8000\text{ bits}}{10^9\text{ bps}} = 8 \times 10^{-6}\text{ s} = 0.008\text{ ms}$$

El tiempo total transcurrido desde el inicio de la transmisión hasta la recepción del ACK es:
$$T_{\text{total}} = RTT + \frac{L}{R} = 30\text{ ms} + 0.008\text{ ms} = 30.008\text{ ms}$$

La **utilización del emisor** ($U_{\text{sender}}$) se define como la proporción del tiempo en que el emisor está efectivamente inyectando bits al canal:
$$U_{\text{sender}} = \frac{L / R}{RTT + L / R} = \frac{0.008\text{ ms}}{30.008\text{ ms}} \approx 0.000267 \quad (0.027\%)$$

El **rendimiento efectivo** (*effective throughput*) es:
$$\text{Throughput} = U_{\text{sender}} \times R = 0.000267 \times 1000\text{ Mbps} = 267\text{ Kbps}$$

En un enlace de fibra gigabit capaz de transferir 1 Gbps, el protocolo Stop-and-Wait aprovecha menos de 300 Kbps. Esta ineficiencia radical motivó el desarrollo de los protocolos de transmisión en tubería (*pipelining*).
