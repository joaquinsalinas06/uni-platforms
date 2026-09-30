---
kind: subtopic
title: "Encapsulación de Unidades de Datos de Protocolo (PDU)"
order: 2
---

## 1. Concepto de Unidad de Datos de Protocolo (PDU)

En las arquitecturas de red estratificadas, cada capa procesa y transmite una estructura de información específica denominada **PDU** (*Protocol Data Unit*). Una PDU se compone de dos secciones bien diferenciadas:
1. **Información de Control de Cabecera (*Header*)**: Metadatos agregados por el protocolo de la capa para coordinar la entrega, secuenciamiento, detección de errores y multiplexación.
2. **Carga Útil (*Payload*)**: Los datos transparentes que la capa inmediatamente superior entrega para su transporte.

### Correspondencia entre Capas y Nomenclatura de PDUs
- **Capa 5 (Aplicación)**: **Mensaje de Aplicación** (e.g., solicitud HTTP o respuesta SMTP).
- **Capa 4 (Transporte)**: **Segmento** (para TCP) o **Datagrama de Transporte** (para UDP).
- **Capa 3 (Red)**: **Datagrama IP** o Paquete.
- **Capa 2 (Enlace de Datos)**: **Trama** (*Frame*).
- **Capa 1 (Física)**: **Secuencia de Bits**.

---

## 2. Anatomía de las Cabeceras en la Pila Estándar

Al examinar una trama capturada en un medio Ethernet moderno transportando una solicitud web, se observa la siguiente composición de cabeceras anidadas:

### 2.1 Cabecera de Enlace: Trama Ethernet II (14 bytes de cabecera + 4 bytes de cola)
- **MAC Destino (6 bytes)**: Dirección física del siguiente salto (siguiente enrutador o host destino).
- **MAC Origen (6 bytes)**: Dirección física de la interfaz del emisor local.
- **EtherType (2 bytes)**: Identificador del protocolo de capa de red contenido en la carga útil (`0x0800` para IPv4, `0x86DD` para IPv6, `0x0806` para ARP).
- **Frame Check Sequence (FCS) (4 bytes)**: Código de redundancia cíclica (CRC-32) ubicado al final de la trama para validar que los bits no sufrieron interferencia física.

### 2.2 Cabecera de Red: Datagrama IPv4 (20 bytes mínimos sin opciones)
- **Versión e IHL (1 byte)**: Indica versión 4 y la longitud de cabecera en palabras de 32 bits (mínimo 5).
- **Longitud Total (2 bytes)**: Tamaño completo del datagrama (cabecera + datos) en bytes (máximo 65535).
- **TTL (Time to Live) (1 byte)**: Contador de saltos para evitar bucles infinitos de enrutamiento; cada enrutador lo decrementa en 1 y descarta el paquete si llega a 0.
- **Protocolo (1 byte)**: Identifica el protocolo de la capa de transporte contenido en el datagrama (`6` para TCP, `17` para UDP, `1` para ICMP).
- **Header Checksum (2 bytes)**: Suma de comprobación a nivel de 16 bits para verificar exclusivamente la cabecera IP.
- **IP Origen (4 bytes)**: Dirección IPv4 del host emisor.
- **IP Destino (4 bytes)**: Dirección IPv4 del host receptor.

### 2.3 Cabecera de Transporte: Segmento TCP (20 bytes mínimos)
- **Puerto de Origen (2 bytes)**: Identificador del proceso cliente (puerto efímero, e.g., 54210).
- **Puerto de Destino (2 bytes)**: Identificador del proceso servidor (puerto bien conocido, e.g., 80 para HTTP).
- **Número de Secuencia (4 bytes)**: Posición del primer byte del payload dentro del flujo de datos global.
- **Número de Reconocimiento / ACK (4 bytes)**: Siguiente byte esperado del interlocutor.
- **Banderas de Control (Flags, 1 byte)**: Bits `SYN`, `ACK`, `FIN`, `RST`, `PSH`, `URG`.
- **Ventana de Recepción (2 bytes)**: Control de flujo (*flow control*).
- **Checksum de Transporte (2 bytes)**: Verificación matemática de integridad sobre la cabecera TCP, los datos y una pseudo-cabecera IP.

---

## 3. MTU y Tamaño Máximo de Segmento (MSS)

La interacción entre capas impone restricciones cuantitativas sobre el tamaño de los paquetes:

### 3.1 Unidad Máxima de Transmisión (MTU)
La **MTU** (*Maximum Transmission Unit*) es el tamaño máximo de carga útil que la capa de enlace puede transportar en una sola trama.
- En redes Ethernet estándar, la **MTU es de 1500 bytes**.
- Esto significa que el datagrama IP completo (cabecera IP + cabecera de transporte + datos de aplicación) no puede exceder los 1500 bytes sin ser fragmentado.

### 3.2 Maximum Segment Size (MSS) de TCP
El **MSS** es la cantidad máxima de datos de capa de aplicación que TCP puede empaquetar en un único segmento sin provocar fragmentación IP a nivel de red:

$$\text{MSS} = \text{MTU} - (\text{Cabecera IP} + \text{Cabecera TCP})$$

Para conexiones estándar sobre Ethernet con IPv4 sin opciones:

$$\text{MSS} = 1500\,\text{bytes} - 20\,\text{bytes (IP)} - 20\,\text{bytes (TCP)} = 1460\,\text{bytes}$$

---

## 4. Proceso de Enrutamiento y Mutabilidad de Cabeceras

Cuando un datagrama IP atraviesa un enrutador intermedio:
1. **La cabecera de enlace (Ethernet) se descarta completamente**: La dirección MAC de destino correspondía a la interfaz física del enrutador.
2. **La cabecera IP se inspecciona y muta**:
   - Se decrementa el campo `TTL`: $\text{TTL}_{\text{nuevo}} = \text{TTL}_{\text{antiguo}} - 1$.
   - Se recalcula obligatoriamente el `Header Checksum` de IPv4 debido al cambio en el TTL.
   - Las direcciones IP de origen y destino **permanecen invariables** de extremo a extremo (a menos que exista un dispositivo NAT intermedio).
3. **Se genera una nueva cabecera de enlace**: El enrutador encapsula el datagrama en una nueva trama Ethernet, estableciendo como MAC de origen su propia tarjeta de salida y como MAC de destino la dirección física del siguiente enrutador o host receptor (obtenida mediante el protocolo ARP).
4. **Las cabeceras de transporte (TCP) y aplicación (HTTP) son totalmente opacas**: El enrutador no las modifica ni las inspecciona.
