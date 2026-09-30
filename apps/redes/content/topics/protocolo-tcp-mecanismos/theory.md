---
kind: theory
title: "Protocolo TCP: Estructura del Segmento y Gestión de Conexión"
---

## 1. Abstracción y Propiedades Fundamentales de TCP

El Protocolo de Control de Transmisión (TCP, estandarizado en la RFC 793 con extensiones modernas en RFC 5681 y RFC 7323) proporciona una abstracción de canal de comunicación **punto a punto**, **orientado a la conexión**, **confiable** y de **flujo de bytes continuo** (*byte-stream*) entre dos procesos de aplicación que se ejecutan en sistemas terminales independientes.

A diferencia del protocolo de datagramas de usuario (UDP), que expone el modelo sin conexión de la capa de red con límites de mensaje discretos, TCP enmascara la naturaleza discontinua y propensa a fallas de la infraestructura IP subyacente. Sus características fundamentales incluyen:

- **Orientado a la Conexión (*Connection-Oriented*)**: Antes de que un extremo pueda transmitir datos de aplicación hacia el otro, ambos hosts deben realizar una negociación preliminar de parámetros de estado mediante un procedimiento de enlace de tres vías (*three-way handshake*). Este estado de conexión (buffers, variables de secuencia, ventanas de control) reside exclusivamente en las memorias del emisor y receptor en los extremos (*end-to-end principle*); los enrutadores y conmutadores intermedios de la red no mantienen ningún estado de TCP.
- **Servicio Full-Duplex**: Si existe una conexión TCP entre el Proceso A (Host 1) y el Proceso B (Host 2), los datos de aplicación pueden fluir simultáneamente desde el Proceso A hacia el Proceso B y desde el Proceso B hacia el Proceso A sobre el mismo canal lógico.
- **Punto a Punto (*Point-to-Point*)**: Una conexión TCP siempre vincula con exactitud a un único emisor con un único receptor. Las operaciones de difusión múltiple (*multicast*) o difusión amplia (*broadcast*), donde un paquete se distribuye a múltiples destinatarios en una única operación de envío, no son posibles sobre TCP nativo.
- **Flujo de Bytes sin Delimitación de Mensajes (*Byte-Stream Service*)**: TCP interpreta los datos suministrados por el proceso de aplicación emisor no como una secuencia de paquetes discretos, sino como un flujo continuo, no estructurado y ordenado de bytes. La aplicación puede realizar diez operaciones sucesivas `write()` de 100 bytes cada una, y el receptor puede consumirlas mediante una única lectura `read()` de 1000 bytes, o dos lecturas de 500 bytes. TCP no inserta delimitadores de registro (*record markers*) en el flujo de datos.
- **Búferes de Envío y Recepción**: Cuando un proceso invoca la llamada al sistema de envío a través de un socket TCP, los bytes de datos se copian en el **búfer de envío** (*send buffer*) asociado a la conexión. Periódicamente, o según lo dicten los algoritmos de control de congestión y flujo, TCP toma bloques contiguos de bytes de este búfer, les antepone una cabecera TCP para formar un **segmento TCP**, y pasa el segmento a la capa de red (IP) para su transmisión. En el extremo receptor, los segmentos entrantes se depositan en el **búfer de recepción** (*receive buffer*), desde donde la aplicación de destino los lee a su propio ritmo.

---

## 2. Formato Detallado de la Cabecera TCP

Cada unidad de datos de protocolo (PDU) en TCP se denomina **segmento**. Un segmento consta de una cabecera de control seguida de cero o más bytes de datos de aplicación. La cabecera TCP tiene una longitud variable: tiene un mínimo de 20 bytes (160 bits) cuando no se incluyen opciones, y puede extenderse hasta un máximo de 60 bytes en múltiplos de 32 bits (4 bytes).

A continuación se detalla la estructura y propósito de cada campo de la cabecera:

### 2.1 Puertos de Origen y Destino (16 bits cada uno)
- **Puerto de Origen (*Source Port*)**: Identifica el puerto local del proceso que originó el segmento en el host emisor (0 a 65535).
- **Puerto de Destino (*Destination Port*)**: Identifica el puerto del proceso de destino en el host receptor. Junto con las direcciones IP de origen y destino del datagrama IP, completan la 4-tupla indispensable para la demultiplexación orientada a la conexión.

### 2.2 Número de Secuencia (32 bits)
Representa la posición ordinal en el flujo de bytes global del **primer byte de datos** contenido en el segmento actual. 
TCP no numera los segmentos consecutivamente (1, 2, 3...); numera cada byte transmitido individualmente:
- Si el número de secuencia inicial es $ISN$ y el primer segmento transporta $B$ bytes de datos, el campo *Sequence Number* de ese segmento será $ISN$.
- El siguiente segmento tendrá como número de secuencia $ISN + B$.
- Al ser un campo de 32 bits, los números de secuencia varían entre $0$ y $2^{32} - 1$. Al alcanzar el valor máximo, el contador se reinicia cíclicamente (*wrap around*) a cero.

### 2.3 Número de Acuse de Recibo (32 bits)
Utilizado para implementar transferencia confiable de datos bidireccional. Indica al otro extremo el **número de secuencia del siguiente byte que el host espera recibir**.
- TCP utiliza acuses de recibo **acumulativos**: si el Host A recibe correctamente y en orden todos los bytes hasta el byte 1023 inclusive, su campo ACK tendrá el valor 1024.
- Un valor de $\text{ACK} = 1024$ confirma implícitamente la recepción exitosa de todos los bytes del $0$ al $1023$.
- Si llegan bytes fuera de orden (por ejemplo, del byte 1500 al 2000 cuando faltaba el 1024 al 1499), TCP mantiene su ACK en 1024, indicando que el siguiente byte esperado sigue siendo el 1024. Este comportamiento genera los denominados *ACKs duplicados*.
- El campo ACK solo es válido si el bit de control ACK está activado en 1.

### 2.4 Longitud de Cabecera / Desplazamiento de Datos (4 bits)
Denominado *Data Offset*. Especifica la longitud total de la cabecera TCP expresada en **palabras de 32 bits** (unidades de 4 bytes).
- El valor mínimo es 5 (lo que corresponde a $5 \times 4 = 20$ bytes, cabecera estándar sin opciones).
- El valor máximo es 15 (lo que corresponde a $15 \times 4 = 60$ bytes, permitiendo hasta 40 bytes de opciones).
- Permite al receptor determinar con precisión matemática dónde termina la cabecera de control y dónde comienzan los datos de aplicación.

### 2.5 Reservado (3 bits o 6 bits según RFC histórica)
Bits reservados para uso futuro. Deben transmitirse en 0 en implementaciones conformes.

### 2.6 Banderas de Control (*Flags*, 9 bits en especificaciones modernas)
- **URG (Urgent)**: Indica que el campo *Urgent Pointer* contiene información válida y que los datos apuntados deben procesarse con prioridad por la aplicación.
- **ACK (Acknowledgment)**: Indica que el valor contenido en el campo *Acknowledgment Number* es válido. En todas las transmisiones posteriores al segmento SYN inicial del handshake, este bit permanece en 1.
- **PSH (Push)**: Solicita al receptor que pase inmediatamente los datos almacenados en el búfer a la capa de aplicación sin esperar a que el búfer se llene por completo.
- **RST (Reset)**: Fuerza el restablecimiento o aborto inmediato de una conexión debido a una condición anómala (e.g., llegada de un segmento a un puerto cerrado, o desincronización irrecuperable de estados).
- **SYN (Synchronize)**: Utilizado exclusivamente durante el establecimiento de la conexión para sincronizar los números de secuencia iniciales ($ISN$).
- **FIN (Finish)**: Indica que el emisor ha terminado de transmitir datos y solicita el cierre ordenado de su sentido de transmisión.
- **CWR y ECE (Congestion Notification Flags)**: Utilizados en Explicit Congestion Notification (ECN, RFC 3168) para notificar congestión en enrutadores intermedios sin necesidad de descartar paquetes.

### 2.7 Ventana de Recepción (16 bits)
Denominado *Receive Window* ($rwnd$). Informa al emisor la cantidad de bytes que el receptor está dispuesto a aceptar en su búfer de recepción en ese momento. Es el mecanismo central del **control de flujo** de TCP.
- Al ser de 16 bits, el valor máximo nativo es de $65535$ bytes ($64\text{ KB} - 1$).
- Para enlaces de alta capacidad y largo retardo (redes LFN, *Long Fat Networks*), este límite resultaba restrictivo. Por ello, la opción de escalado de ventana (*Window Scale Option*, RFC 7323) permite desplazar este valor hasta 14 bits a la izquierda, alcanzando ventanas efectivas de hasta $1\text{ GB}$.

### 2.8 Suma de Comprobación (*Checksum*, 16 bits)
Proporciona verificación de integridad de extremo a extremo. Cubre la cabecera TCP, los datos de aplicación y una **pseudocabecera** de 12 bytes derivada de la capa IP (IP origen, IP destino, byte de ceros, protocolo 6 y longitud total del segmento TCP). Si el checksum calculado en destino no coincide con el transmitido, el segmento se descarta silenciosamente.

### 2.9 Puntero de Urgencia (*Urgent Pointer*, 16 bits)
Especifica un desplazamiento positivo respecto al número de secuencia del segmento actual para marcar el final de los datos urgentes. Solo es válido si la bandera URG está activada.

### 2.10 Opciones (*Options*, longitud variable, 0 a 40 bytes)
Permiten negociar capacidades avanzadas durante el handshake inicial:
- **MSS (Maximum Segment Size)**: Anuncia el tamaño máximo de carga útil que el host puede recibir.
- **Window Scale**: Multiplicador de escala para superar el límite de 64 KB de la ventana.
- **SACK Permitted (Selective Acknowledgment)**: Habilita el reconocimiento selectivo de bloques discontinuos de bytes recibidos.
- **Timestamps**: Medición precisa de RTT y protección contra números de secuencia reciclados (PAWS).

---

## 3. Relación entre MTU, MSS y Carga Útil

Un concepto de diseño primordial en TCP es evitar que la capa de red IP tenga que fragmentar los datagramas, ya que la fragmentación degrada severamente el rendimiento:

- **Unidad Máxima de Transmisión (MTU, *Maximum Transmission Unit*)**: Es el tamaño máximo en bytes de la trama que la capa de enlace de datos local puede transportar. En redes Ethernet típicas, $\text{MTU} = 1500$ bytes.
- **Tamaño Máximo de Segmento (MSS, *Maximum Segment Size*)**: Es la cantidad máxima de datos de capa de aplicación que TCP puede introducir en un único segmento. El MSS excluye deliberadamente las cabeceras TCP e IP:

$$\text{MSS} = \text{MTU} - (\text{Cabecera IP} + \text{Cabecera TCP})$$

Para paquetes IPv4 con cabeceras estándar mínimas:
- Cabecera IPv4 base $= 20$ bytes.
- Cabecera TCP base $= 20$ bytes.
- Por tanto, en un enlace Ethernet estándar:

$$\text{MSS} = 1500 - (20 + 20) = 1460\text{ bytes}$$

Para IPv6 (cabecera base fija de 40 bytes):

$$\text{MSS} = 1500 - (40 + 20) = 1440\text{ bytes}$$

Durante el *Three-Way Handshake*, cada host comunica en el campo de opciones el valor de MSS que su hardware y red local soportan, y el emisor adopta el mínimo de los dos valores como cota superior para la fragmentación de su flujo de bytes.

---

## 4. Establecimiento de la Conexión: Three-Way Handshake

Para iniciar una conexión TCP, el cliente y el servidor ejecutan una sincronización de 3 pasos denominada **Three-Way Handshake**. Este procedimiento asegura que ambos extremos verifiquen la bidireccionalidad del canal, sincronicen sus números de secuencia iniciales ($ISN$) y reserven los búferes y variables de control requeridos.

### 4.1 Secuencia Paso a Paso del Handshake

1. **Paso 1: Segmento SYN del Cliente (Cliente $\to$ Servidor)**:
   - El proceso cliente solicita al sistema operativo abrir una conexión TCP hacia la IP y puerto del servidor (llamada `connect()`).
   - La pila TCP del cliente genera un segmento especial que **no transporta datos de aplicación**.
   - Se activa la bandera $\text{SYN} = 1$ y $\text{ACK} = 0$.
   - El cliente selecciona de manera pseudoaleatoria un número de secuencia inicial: $\text{Seq} = ISN_C$ (e.g., $ISN_C = 8000$). La aleatorización previene colisiones con segmentos residuales de conexiones previas y mitiga ataques de predicción de secuencia.
   - El cliente entra en el estado `SYN_SENT`.
   - *Nota técnica*: Aunque no lleva datos, el flag SYN consume conceptualmente un número de secuencia virtual.

2. **Paso 2: Segmento SYN-ACK del Servidor (Servidor $\to$ Cliente)**:
   - El servidor, que se encontraba escuchando en el estado `LISTEN` (llamadas `bind()` y `listen()`), recibe el segmento SYN.
   - Si acepta la conexión, el servidor asigna memoria de buffers y variables de control TCP para este nuevo socket.
   - Responde con un segmento que activa simultáneamente las banderas $\text{SYN} = 1$ y $\text{ACK} = 1$.
   - Establece su propio número de secuencia inicial independiente: $\text{Seq} = ISN_S$ (e.g., $ISN_S = 15000$).
   - Establece el acuse de recibo confirmando el SYN del cliente: $\text{Ack} = ISN_C + 1$ (e.g., $\text{Ack} = 8001$).
   - El servidor transiciona al estado `SYN_RCVD`.

3. **Paso 3: Segmento ACK del Cliente (Cliente $\to$ Servidor)**:
   - Al recibir el SYN-ACK, el cliente constata que el servidor está activo y accesible.
   - Asigna los búferes y variables locales de la conexión.
   - Envía un tercer segmento al servidor confirmando la recepción del SYN del servidor.
   - Se activa $\text{ACK} = 1$ y se desactiva $\text{SYN} = 0$.
   - El número de secuencia es $\text{Seq} = ISN_C + 1$ (e.g., $8001$).
   - El acuse de recibo es $\text{Ack} = ISN_S + 1$ (e.g., $15001$).
   - **Carga útil**: Este tercer segmento ya **puede transportar datos de aplicación** (por ejemplo, una solicitud HTTP GET).
   - El cliente entra en el estado `ESTABLISHED`. Al recibir este segmento, el servidor entra igualmente en el estado `ESTABLISHED`. La conexión queda plenamente operativa.

### 4.2 Ataques SYN Flood y Defensa con SYN Cookies

Dado que en el Paso 2 el servidor reserva memoria de buffers y estructuras de control antes de que el cliente confirme el Paso 3, un atacante malicioso puede enviar una ráfaga masiva de segmentos SYN con direcciones IP de origen falsificadas (*IP Spoofing*). El servidor responde con SYN-ACKs a IPs inexistentes o inocentes y mantiene entradas en su tabla de conexiones semiabiertas (*half-open connections backlog*) esperando el timeout. Cuando la tabla se satura, el servidor rechaza conexiones legítimas de usuarios reales.

Para neutralizar este ataque, las implementaciones modernas utilizan **SYN Cookies**:
- El servidor **no reserva memoria ni crea estado** al recibir el primer SYN.
- En su lugar, codifica el estado inicial de la conexión dentro de su propio $ISN_S$, calculando un hash criptográfico unidireccional:
  $$ISN_S = \text{Hash}(\text{IP}_{\text{src}}, \text{IP}_{\text{dst}}, \text{Port}_{\text{src}}, \text{Port}_{\text{dst}}, \text{SecretKey}, t) + \text{MSS}_{\text{index}}$$
- Si el cliente es legítimo, responderá con un ACK que contiene $\text{Ack} = ISN_S + 1$.
- Al recibir el ACK, el servidor resta 1 al número de acuse, recalcula el hash con su clave secreta y verifica la autenticidad del valor. Solo en ese instante crea y asigna la estructura de socket y buffers en memoria, neutralizando el agotamiento de recursos.

---

## 5. Terminación de la Conexión y el Estado TIME_WAIT

Dado que una conexión TCP es full-duplex, cada extremo debe cerrar de manera independiente su canal de transmisión cuando ya no tenga más datos que enviar.

### 5.1 Cierre Simétrico Estándar (Four-Way Teardown)

1. **Paso 1 (Cliente $\to$ Servidor)**: El proceso cliente invoca `close()`. La pila TCP envía un segmento con la bandera $\text{FIN} = 1$ y $\text{Seq} = u$. El cliente transiciona al estado `FIN_WAIT_1`.
2. **Paso 2 (Servidor $\to$ Cliente)**: El servidor recibe el FIN y envía un segmento con $\text{ACK} = 1$ y $\text{Ack} = u + 1$. El servidor entra en el estado `CLOSE_WAIT`. Al recibir este ACK, el cliente transiciona al estado `FIN_WAIT_2`. En esta condición (*half-close*), el cliente ya no puede enviar datos, pero aún puede seguir recibiendo datos pendientes que el servidor esté transmitiendo.
3. **Paso 3 (Servidor $\to$ Cliente)**: Una vez que la aplicación en el servidor concluye todas sus transferencias y llama a `close()`, TCP envía su propio segmento $\text{FIN} = 1$ con $\text{Seq} = v$ y $\text{Ack} = u + 1$. El servidor pasa al estado `LAST_ACK`.
4. **Paso 4 (Cliente $\to$ Servidor)**: El cliente recibe el FIN del servidor y envía el último segmento de confirmación con $\text{ACK} = 1$ y $\text{Ack} = v + 1$. El cliente transiciona al estado `TIME_WAIT`. El servidor, al recibir este último ACK, destruye el socket y pasa a `CLOSED`.

### 5.2 Propósito Crucial del Estado TIME_WAIT

El extremo que inicia activamente el cierre (típicamente el cliente, o un servidor web HTTP/1.1 que cierra la conexión) **no pasa inmediatamente al estado CLOSED**. Permanece en el estado `TIME_WAIT` durante un tiempo equivalente a:

$$T_{\text{TIME\_WAIT}} = 2 \cdot \text{MSL}$$

Donde **MSL** (*Maximum Segment Lifetime*) es el tiempo máximo estimado que un paquete IP puede sobrevivir vagando por la red antes de ser descartado por los enrutadores (según el RFC 793, $\text{MSL} \approx 2\text{ minutos}$, aunque en sistemas Linux modernos se parametriza comúnmente a 30 o 60 segundos, resultando en un tiempo de espera de 1 a 2 minutos).

El estado `TIME_WAIT` satisface dos requisitos arquitectónicos indispensables:
1. **Garantizar el Cierre Confiable de la Conexión**: Si el último segmento ACK (Paso 4) se pierde en el canal, el servidor retransmitirá su segmento FIN (Paso 3) al expirar su temporizador. Si el cliente hubiera pasado inmediatamente a `CLOSED`, no tendría registro de la conexión y respondería con un segmento `RST`, provocando una terminación de error anormal en el servidor en lugar de un cierre ordenado. Al permanecer en `TIME_WAIT`, el cliente puede reenviar el ACK final.
2. **Drenar Segmentos Viejos Duplicados en la Red**: Evita que paquetes residuales o demorados de una encarnación anterior de la conexión sean recibidos e interpretados erróneamente como datos válidos por una nueva conexión posterior que reuse casualmente la misma 4-tupla (mismos puertos e IPs). Al esperar $2 \cdot \text{MSL}$, se garantiza que cualquier paquete errante habrá expirado y desaparecido de la red.
