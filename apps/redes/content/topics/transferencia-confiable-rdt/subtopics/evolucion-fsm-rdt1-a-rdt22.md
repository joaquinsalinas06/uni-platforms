---
kind: subtopic
title: "Evolución FSM: RDT 1.0 a RDT 2.2 y Eliminación de NAKs"
order: 1
---

## 1. Fundamentos de Modelado por FSM

El diseño riguroso de protocolos de transporte confiables descansa sobre el formalismo de las Máquinas de Estados Finitos (FSM). Una FSM encapsula:
- Un conjunto discreto de **estados internos** que determinan el comportamiento del agente ante estímulos externos.
- Un conjunto de **eventos de entrada** generados por capas adyacentes (`rdt_send` desde la capa superior o `rdt_rcv` desde la capa de red).
- Un conjunto de **acciones de salida** que ejecutan cómputos locales o emiten paquetes hacia el canal (`make_pkt`, `udt_send`, `deliver_data`).

En cualquier instante, un agente RDT se encuentra exactamente en un estado. El arribo de un evento desencadena una evaluación condicional (por ejemplo, verificar si el checksum es válido o si un número de secuencia coincide con el esperado) que determina la transición al siguiente estado y las acciones a ejecutar.

---

## 2. RDT 1.0: El Modelo de Referencia Libre de Errores

En RDT 1.0, el canal subyacente es ideal. Las máquinas de estado tanto del emisor como del receptor constan de un único estado persistente:

### FSM del Emisor
- **Estado**: `Wait for call from above`
- **Transición**:
  - Evento: `rdt_send(data)`
  - Acciones: `packet = make_pkt(data)`; `udt_send(packet)`

### FSM del Receptor
- **Estado**: `Wait for call from below`
- **Transición**:
  - Evento: `rdt_rcv(packet)`
  - Acciones: `extract(packet, data)`; `deliver_data(data)`

Dado que no existe probabilidad de pérdida ni de inversión de bits, el receptor procesa los paquetes en estricta sincronía con la tasa a la que el emisor los suministra.

---

## 3. RDT 2.0: Canal con Errores de Bit y Mecanismo Stop-and-Wait ARQ

Cuando los bits del canal pueden invertirse debido al ruido térmico o interferencia electromagnética, RDT 2.0 implementa el paradigma **ARQ (Automatic Repeat reQuest)**.

### Componentes de Control
- **Detección de errores**: Inclusión de un campo `checksum` calculado sobre el payload.
- **Canal de retroalimentación**: El receptor evalúa `corrupt(packet)` mediante la función `checksum`. Si es válido, transmite `make_pkt(ACK)`. Si está corrupto, transmite `make_pkt(NAK)`.

### El Defecto Crítico: La Corrupción del Canal de Retorno
RDT 2.0 asume ingenuamente que los paquetes de control (ACK/NAK) viajan por un canal inmune a errores. Considérese la situación en que el receptor envía un ACK, pero este sufre inversión de bits durante el trayecto:
1. El emisor recibe un paquete irreconocible (`corrupt(rcvpacket)`).
2. Si el emisor decide retransmitir el paquete de datos anterior, el receptor (que ya procesó exitosamente dicho paquete) recibirá un duplicado y lo tratará como un paquete de datos totalmente nuevo, inyectando datos redundantes en la capa de aplicación.
3. Si el emisor ignora el paquete corrupto y procede a enviar el siguiente paquete, se producirá una pérdida irrecuperable de datos si la respuesta original era en realidad un NAK.

Este dilema demuestra que la retroalimentación simple no puede ser autosuficiente frente a la corrupción en ambas direcciones.

---

## 4. RDT 2.1: Secuenciación de 1 Bit para Resolver la Ambigüedad

RDT 2.1 resuelve la ambigüedad introduciendo un **número de secuencia de 1 bit** ($0$ o $1$) en la cabecera de cada paquete de datos:

### Estados del Emisor (4 estados)
1. `Wait for call 0 from above`: Al recibir datos, crea el paquete con secuencia 0 (`packet = make_pkt(0, data, checksum)`), transmite y pasa al estado 2.
2. `Wait for ACK or NAK 0`:
   - Si recibe un paquete corrupto o un NAK: `udt_send(packet)` (retransmite paquete 0) y permanece en este estado.
   - Si recibe un paquete íntegro y es ACK (`notcorrupt(rcvpacket) && isACK(rcvpacket)`): avanza al estado 3.
3. `Wait for call 1 from above`: Idéntico al estado 1 pero asignando número de secuencia 1.
4. `Wait for ACK or NAK 1`: Espera confirmación del paquete 1.

### Estados del Receptor (2 estados)
1. `Wait for 0 from below`:
   - Si recibe paquete íntegro con secuencia 0: extrae datos, entrega a la aplicación, transmite `make_pkt(ACK, checksum)` y avanza al estado `Wait for 1 from below`.
   - Si recibe paquete corrupto: transmite `make_pkt(NAK, checksum)` y permanece en el estado actual.
   - Si recibe paquete íntegro con secuencia 1: el receptor detecta que es un **duplicado** (el emisor no recibió el ACK del paquete 1 previo). Por ende, **descarta los datos** pero vuelve a emitir `make_pkt(ACK, checksum)` para desbloquear al emisor.
2. `Wait for 1 from below`: Lógica simétrica esperando secuencia 1.

---

## 5. RDT 2.2: Eliminación Total de NAKs mediante ACKs Duplicados

RDT 2.2 refina la arquitectura demostrando que los mensajes explícitos NAK son superfluos. Se logra la misma semántica obligando al receptor a incluir explícitamente el número de secuencia en el mensaje ACK:

- En lugar de enviar un NAK ante un paquete corrupto o inesperado, el receptor retransmite un **ACK confirmando el último paquete recibido correctamente**.
- Por ejemplo, si el receptor se encuentra en `Wait for 1 from below` y recibe un paquete corrupto o con número de secuencia 0, envía `make_pkt(ACK, 0)`.
- Cuando el emisor está esperando en `Wait for ACK 1` y recibe un `ACK 0`, detecta inmediatamente que el paquete 1 no fue procesado con éxito. Este ACK duplicado actúa formalmente como un NAK implícito, desencadenando la retransmisión inmediata del paquete 1.

Esta eliminación simplifica la cabecera del protocolo y sienta la base del mecanismo de acuses de recibo que implementará posteriormente TCP.
