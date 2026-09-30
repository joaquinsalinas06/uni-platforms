---
kind: theory
title: "Capa de Transporte: Principios y Demultiplexación"
---

## 1. El Rol Fundamental de la Capa de Transporte

La capa de transporte ocupa una posición central en la arquitectura de protocolos de Internet. Su propósito primario consiste en proveer una **comunicación lógica extremo a extremo entre procesos de aplicación** que se ejecutan en diferentes sistemas terminales (*end systems* o hosts). A diferencia de los enrutadores y conmutadores intermedios del núcleo de la red, los protocolos de la capa de transporte operan exclusivamente en los sistemas finales.

Desde el punto de vista del flujo de datos:
- **En el extremo emisor**: La capa de transporte recibe mensajes generados por la capa de aplicación, los fragmenta o encapsula en unidades de datos del protocolo de transporte denominadas **segmentos** (*segments*), añade los encabezados de control pertinentes y transfiere cada segmento a la capa de red subyacente.
- **En el extremo receptor**: La capa de red extrae los datagramas IP de la interfaz física y los entrega a la capa de transporte. Esta examina los campos de control del encabezado del segmento, reconstruye la secuencia de mensajes de aplicación y los encamina con precisión hacia el proceso destinatario adecuado.

Internet ofrece dos protocolos primarios en esta capa:
1. **TCP (Transmission Control Protocol, RFC 793)**: Proporciona un servicio confiable, orientado a la conexión, con entrega secuencial garantizada, control de flujo y control de congestión.
2. **UDP (User Datagram Protocol, RFC 768)**: Proporciona un servicio no orientado a la conexión, mínimo y ligero (*bare-bones*), sin garantías de entrega, orden o control de congestión, preservando únicamente las primitivas de multiplexación y detección básica de errores.

Es fundamental destacar que la capa de transporte de Internet **no provee garantías temporales de retardo** (*delay guarantees*) ni **garantías de tasa de transferencia** (*bandwidth guarantees*); el rendimiento efectivo queda supeditado al estado dinámico del núcleo de conmutación de paquetes.

---

## 2. Diferenciación Estructural: Transporte vs. Red

La distinción entre la capa de red y la capa de transporte se resume en la granularidad de sus entidades terminales:
- **Capa de Red**: Provee comunicación de **host a host** (*host-to-host*). Su unidad básica de transferencia en Internet es el datagrama IP. La capa de red es responsable de guiar el paquete a través de la topología interconectada mediante tablas de enrutamiento hasta alcanzar la interfaz de red del dispositivo destino.
- **Capa de Transporte**: Provee comunicación de **proceso a proceso** (*process-to-process*). Como un único host puede ejecutar simultáneamente múltiples procesos que interactúan con la red (por ejemplo, múltiples pestañas de un navegador web, clientes de correo electrónico y terminales SSH), la capa de transporte expande el direccionamiento de host para alcanzar el hilo o proceso ejecutable exacto.

### La Analogía Postal de Kurose-Ross
Considérense dos residencias estudiantiles: la Casa A y la Casa B. En la Casa A residen 12 estudiantes, y en la Casa B otros 12 estudiantes. Cada estudiante escribe cartas a sus colegas de la otra casa.
- Los **procesos de aplicación** corresponden a los estudiantes individuales que redactan y leen las cartas.
- Los **sistemas finales** (hosts) corresponden a las casas.
- El **servicio postal nacional** (camiones, centros de clasificación y carteros) corresponde a la **capa de red** (protocolo IP): transporta el correo de casa a casa sin conocer ni interactuar con los residentes individuales.
- Los dos encargados internos designados en cada casa para recolectar las cartas de los estudiantes y entregarlas en la puerta, así como recibir las cartas del cartero y distribuirlas a cada habitación específica, corresponden al **protocolo de la capa de transporte**.

---

## 3. La Abstracción del Socket

El **socket** constituye la puerta de enlace e interfaz de programación de aplicaciones (API) entre el proceso a nivel de usuario y el subsistema de red gestionado por el sistema operativo. Cuando un proceso requiere transmitir o recibir datos a través de la red, crea un socket y solicita al kernel su asociación con el protocolo de transporte respectivo.

Las operaciones canónicas definidas sobre la interfaz de sockets comprenden:
- Creación del socket (`socket()`).
- Asociación a una dirección y puerto local (`bind()`).
- Establecimiento o espera de conexión (`connect()`, `listen()`, `accept()` en protocolos orientados a la conexión).
- Emisión y recepción de bloques de datos (`send()`, `recv()`, `sendto()`, `recvfrom()`).
- Liberación y cierre del canal de comunicación (`close()`).

---

## 4. Principios de Multiplexación y Demultiplexación

Un host receptor en Internet típicamente ejecuta decenas de procesos de red concurrentes. La asignación inequívoca del tráfico entrante exige mecanismos formales de multiplexación y demultiplexación:

### Multiplexación en el Emisor
Consiste en la recolección de fragmentos de datos provenientes de múltiples sockets de aplicación concurrentes, la adición de encabezados de transporte estructurados que contienen los campos identificadores (especialmente los números de puerto), y la entrega coordinada de los segmentos resultantes a la capa de red para su posterior encapsulación en datagramas IP.

### Demultiplexación en el Receptor
Consiste en la recepción de datagramas procedentes de la capa de red, el análisis de los campos de dirección de red y encabezado de transporte en cada segmento, y la canalización física del mensaje hacia el socket de destino exacto al que está asociado el proceso receptor.

### Formato General del Encabezado de Transporte
Cualquier segmento de transporte en Internet reserva sus primeros 32 bits para el direccionamiento de procesos:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Source Port (16 bits)   |    Destination Port (16 bits) |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|              Campos de encabezado específicos (TCP / UDP)     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Datos de Aplicación                     |
|                            (Payload)                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

Dado que el campo del número de puerto posee una longitud fija de 16 bits, el rango disponible abarca:
$$0 \le \text{Port} \le 2^{16} - 1 = 65535$$

La convención estándar de la IANA clasifica los puertos en tres rangos:
1. **Puertos Conocidos / Well-Known Ports** ($0$ a $1023$): Reservados para servicios de infraestructura y protocolos privilegiados del sistema (ej. HTTP en puerto 80, HTTPS en 443, DNS en 53, SSH en 22). Requieren privilegios de superusuario para ser enlazados.
2. **Puertos Registrados** ($1024$ a $49151$): Asignados a aplicaciones y servicios comerciales registrados ante IANA.
3. **Puertos Dinámicos, Privados o Efímeros** ($49152$ a $65535$): Asignados dinámicamente por el kernel a procesos clientes durante la apertura de sockets salientes.

---

## 5. Demultiplexación Sin Conexión (UDP)

En el modelo sin conexión de UDP, un socket queda determinado exclusivamente por una **2-tupla**:
$$\text{Socket}_{\text{UDP}} = (\text{IP}_{\text{dest}}, \text{Port}_{\text{dest}})$$

Cuando un host receptor recibe un segmento UDP:
1. El kernel extrae el campo **Destination Port Number** de la cabecera UDP.
2. Localiza en su tabla interna de puertos el socket que realizó `bind()` en dicho puerto.
3. Deposita el payload del segmento en la cola de mensajes (*Message Queue*) vinculada a dicho socket.

### Consecuencia Arquitectural
Si dos o más paquetes IP provienen de diferentes direcciones IP de origen ($\text{IP}_{src, 1} \ne \text{IP}_{src, 2}$) o distintos puertos de origen ($\text{Port}_{src, 1} \ne \text{Port}_{src, 2}$), pero ambos especifican la misma dirección IP de destino y el mismo puerto de destino, **ambos segmentos serán demultiplexados exactamente hacia el mismo socket receptor**. El proceso que lee el socket puede conocer la identidad del remitente invocando funciones que retornan la dirección de origen (como `recvfrom()` en la API de sockets POSIX), pero el flujo de entrada no se aísla a nivel de transporte.

---

## 6. Demultiplexación Orientada a la Conexión (TCP)

En contraposición a UDP, un socket TCP queda identificado de forma unívoca por una **4-tupla**:
$$\text{Socket}_{\text{TCP}} = (\text{IP}_{\text{src}}, \text{Port}_{\text{src}}, \text{IP}_{\text{dest}}, \text{Port}_{\text{dest}})$$

### Dinámica de Demultiplexación en Servidores Concurrentes
1. **Socket de Escucha (Welcome / Listening Socket)**: El proceso servidor abre un socket pasivo en un puerto bien conocido (ej. puerto 80) y ejecuta `listen()`.
2. **Llegada del Handshake**: Un cliente con dirección $\text{IP}_A$ y puerto efímero $9157$ envía un segmento SYN hacia $(\text{IP}_B, 80)$.
3. **Generación del Socket Conectado**: Al completarse la negociación en tres vías (*Three-Way Handshake*), el sistema operativo del servidor crea un **nuevo socket independiente** asociado explícitamente a la 4-tupla $(\text{IP}_A, 9157, \text{IP}_B, 80)$.
4. **Tráfico Concurrente**: Si un segundo cliente con dirección $\text{IP}_C$ y puerto $5775$ se conecta simultáneamente al mismo servidor $(\text{IP}_B, 80)$, el servidor genera un segundo socket conectado asociado a $(\text{IP}_C, 5775, \text{IP}_B, 80)$. Incluso si el cliente $C$ abriera una segunda conexión desde un puerto efímero distinto (ej. $9157$), la 4-tupla resultante $(\text{IP}_C, 9157, \text{IP}_B, 80)$ diferirá en $\text{IP}_{\text{src}}$, garantizando aislamiento absoluto de buffers y estados de control.

Los servidores web modernos emplean arquitecturas multihilo (*multi-threaded*) o basadas en eventos asíncronos (*event-driven*) donde cada conexión demultiplexada por su 4-tupla se despacha a un hilo de ejecución o manejador de eventos dedicado, preservando la continuidad de la sesión y el estado de la ventana de transmisión TCP.
