---
kind: theory
title: "Protocolo UDP (User Datagram Protocol)"
---

## 1. Filosofía de Diseño y Origen del Protocolo

El protocolo **UDP (User Datagram Protocol)**, estandarizado formalmente por Jon Postel en 1980 mediante la **RFC 768**, representa la expresión más minimalista y directa de la capa de transporte en la arquitectura de Internet. Mientras que TCP construye una compleja maquinaria de abstracción orientada a la conexión con retransmisiones automáticas y adaptación dinámica a la congestión de la red, UDP se concibió como un protocolo "sin adornos" (*no-frills, bare-bones*).

El principio rector de UDP consiste en **extender el servicio de entrega de host a host provisto por IP hacia un servicio de entrega de proceso a proceso**, añadiendo únicamente dos mecanismos elementales:
1. Multiplexación y demultiplexación mediante números de puerto.
2. Comprobación opcional de integridad de datos mediante una suma de verificación (*checksum*).

Cualquier otra propiedad deseable (como orden secuencial estricto, recuperación ante pérdidas, control de flujo o control de congestión) queda deliberadamente fuera del alcance de UDP, delegándose íntegramente a la capa de aplicación si la naturaleza del servicio lo requiere.

---

## 2. Razones Fundamentales para el Uso de UDP

A pesar de no ofrecer garantías de entrega confiable, UDP es la elección tecnológica preferente o indispensable en una vasta gama de escenarios por cuatro factores determinantes:

### 1. Ausencia de Retardo por Negociación de Conexión (0 RTT)
TCP requiere un intercambio formal de tres vías (*Three-Way Handshake*) antes de poder transferir el primer byte de datos útiles de aplicación. Este protocolo previo introduce al menos un tiempo completo de retardo de ida y vuelta ($1\text{ RTT}$) de penalización antes de recibir cualquier respuesta. UDP no mantiene ningún tipo de apretón de manos inicial; una aplicación puede inyectar datos en la red de manera instantánea en $0\text{ RTT}$. Esta inmediatez resulta crucial en transacciones de consulta y respuesta breves como **DNS (Domain Name System)**.

### 2. Inexistencia de Estado de Conexión en los Extremos
Un host TCP debe reservar y mantener bloques de control de transmisión (**TCB**, *Transmission Control Block*) que consumen memoria del kernel para almacenar buffers de recepción y envío, ventanas de congestión ($cwnd$), umbrales de inicio lento ($ssthresh$), números de secuencia y temporizadores de retransmisión por cada cliente conectado. Un servidor UDP no conserva ningún estado de sesión; los datagramas se procesan y despachan de forma independiente. Como resultado directo, un único servidor UDP puede atender simultáneamente a cientos de miles de clientes concurrentes sin agotar la memoria del sistema operativo.

### 3. Sobrecarga Mínima de Encabezado (Header Overhead)
Mientras que un encabezado TCP estándar sin opciones ocupa un mínimo ineludible de **20 bytes** (pudiendo crecer hasta 60 bytes si incluye opciones de sellos de tiempo o SACK), la cabecera completa de UDP tiene un tamaño fijo de apenas **8 bytes**. Esto representa un ahorro de ancho de banda del $60\%$ en paquetes pequeños, maximizando la relación entre carga útil y tráfico de red en enlaces restringidos.

### 4. Control Fino de Emisión a Nivel de Aplicación
En TCP, el mecanismo de control de congestión desacelera forzosamente la tasa de transmisión del emisor cuando los conmutadores intermedios experimentan acumulación de tráfico o pérdidas de paquetes. Ciertas aplicaciones en tiempo real (como telefonía IP, videoconferencias o videojuegos multijugador competitivos) no pueden tolerar que un algoritmo de transporte congele o retrase la emisión de paquetes frescos: prefieren descartar muestras de voz o posiciones de coordenadas desfasadas antes que esperar retransmisiones que llegarán tarde e inútiles. UDP permite que la aplicación inyecte datos a la tasa que considere oportuna (*blast away*).

---

## 3. Estructura y Campos del Datagrama UDP

La cabecera de UDP consta de cuatro campos de longitud fija de 16 bits (2 bytes por campo), totalizando exactamente **8 bytes** (64 bits):

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Source Port (16 bits)   |    Destination Port (16 bits) |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Length (16 bits)      |        Checksum (16 bits)     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
|                       Application Data                        |
|                            (Payload)                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### Descripción Detallada de Campos
1. **Source Port Number (Puerto Origen - 16 bits)**: Identifica el puerto local del proceso emisor en el host fuente. Es opcional en ciertas transmisiones unidireccionales donde no se espera respuesta (en cuyo caso se rellena con ceros binarios), pero se utiliza comúnmente para dirigir datagramas de réplica hacia el socket cliente.
2. **Destination Port Number (Puerto Destino - 16 bits)**: Campo obligatorio que especifica el número de puerto del proceso receptor en el host destinatario. Permite al sistema operativo receptor demultiplexar el payload hacia el socket correspondiente.
3. **Length (Longitud Total - 16 bits)**: Especifica la longitud total del datagrama UDP en **bytes**, considerando conjuntamente tanto los 8 bytes de cabecera como el tamaño de los datos de aplicación. Su valor mínimo posible es $8$ (datagrama vacío sin payload).
4. **Checksum (Suma de Verificación - 16 bits)**: Almacena el valor calculado de verificación de errores sobre la cabecera UDP, los datos de aplicación y una pseudocabecera conceptual proveniente de la capa IP. En IPv4 su cálculo es opcional (un valor de `0x0000` indica que el checksum no fue calculado por el emisor), mientras que en IPv6 su implementación es mandatoria.

---

## 4. Límites Teóricos y Prácticos de Tamaño

Dado que el campo `Length` de UDP está codificado en un entero sin signo de 16 bits, el valor numérico máximo representable es:
$$L_{\max} = 2^{16} - 1 = 65535\text{ bytes}$$

### Capacidad Máxima de Carga Útil en la Capa de Transporte
Restando el tamaño inmutable del encabezado UDP (8 bytes):
$$\text{Payload}_{\max, \text{UDP}} = 65535\text{ bytes} - 8\text{ bytes} = 65527\text{ bytes}$$

### Restricción Real Impuesta por IPv4
El datagrama UDP viaja encapsulado dentro del campo de datos de un paquete IPv4. El encabezado IPv4 posee su propio campo `Total Length` de 16 bits, con el mismo límite de $65535$ bytes. Considerando que la cabecera IPv4 mínima obligatoria ocupa **20 bytes**:
$$\text{Tamaño total disponible para UDP} = 65535 - 20 = 65515\text{ bytes}$$
$$\text{Payload}_{\max, \text{IPv4}} = 65515 - 8 = 65507\text{ bytes}$$

Cualquier intento de un programa de enviar un buffer superior a $65507$ bytes mediante un socket UDP sobre IPv4 provocará un error inmediato a nivel de la API del sistema operativo (`EMSGSIZE` - *Message too long*).

---

## 5. Ecosistema de Aplicaciones y el Nuevo Paradigma QUIC

El espectro de aplicaciones que sustentan su operación sobre UDP abarca:
- **Infraestructura Crítica**: DNS (resolución de nombres, puerto 53), DHCP (configuración dinámica de red, puertos 67/68), NTP (sincronización horaria, puerto 123), SNMP (gestión de dispositivos de red, puertos 161/162).
- **Streaming Multimedia y Telefonía**: RTP (Real-time Transport Protocol), VoIP, videoconferencias (Zoom, WebRTC) y juegos en línea en tiempo real.
- **Protocolo QUIC y HTTP/3**: Desarrollado inicialmente por Google y formalizado en la RFC 9000, QUIC opera directamente sobre UDP en el espacio de usuario. QUIC reimplementa la transferencia confiable, la seguridad criptográfica (TLS 1.3 integrado) y el control de congestión en la capa de aplicación, eliminando el bloqueo de cabeza de línea (*Head-of-Line Blocking*) de TCP al multiplexar múltiples flujos independientes sobre datagramas UDP individuales.
