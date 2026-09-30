---
kind: subtopic
title: "Conexiones HTTP No Persistentes vs. Persistentes con y sin Pipelining"
order: 1
---

## 1. El Modelo de Conexión en HTTP

La interacción entre el protocolo HTTP de la capa de aplicación y el protocolo TCP de la capa de transporte define de forma directa el tiempo de respuesta percibido por el usuario final, la utilización del ancho de banda y la carga sobre los servidores web.

---

## 2. HTTP No Persistente (HTTP/1.0)

En las primeras especificaciones de la Web (HTTP/1.0, RFC 1945), el modelo de conexión adoptaba la estrategia más elemental: **una conexión TCP dedicada por cada objeto transferido**.

### 2.1 Cronograma Temporal de una Transacción No Persistente
Para descargar un único objeto web (e.g., el documento HTML base o una imagen):
1. **Paso 1 (TCP Handshake)**: El cliente envía un segmento TCP `SYN` con un número de secuencia inicial al servidor (puerto 80). El servidor asigna búferes y variables de conexión y responde con un segmento `SYN-ACK`. Este intercambio consume exactamente **$1 \cdot \text{RTT}$**.
2. **Paso 2 (HTTP Request/Response)**: El cliente confirma la conexión mediante un segmento TCP `ACK` y, simultáneamente en el mismo segmento, envía el mensaje de solicitud `GET /recurso HTTP/1.0`. El servidor procesa la petición y transmite los datos del recurso en un mensaje `HTTP/1.0 200 OK`. Una vez recibido el último byte en el cliente, transcurre **$1 \cdot \text{RTT}$** más el tiempo de transmisión del objeto:
   $$t_{\text{objeto}} = \text{RTT} + \frac{L_{\text{objeto}}}{R}$$
3. **Paso 3 (Cierre de Conexión)**: El servidor finaliza activamente la conexión TCP enviando un segmento `FIN`, el cual es confirmado por el cliente.

El tiempo total para un único objeto bajo HTTP no persistente es:

$$T = 2 \cdot \text{RTT} + \frac{L_{\text{objeto}}}{R}$$

### 2.2 Descarga de Páginas Web con Múltiples Objetos Embebidos
Si una página consta de un archivo base y $M$ imágenes referenciadas:
- **Descarga Serial**: Si el cliente abre una conexión a la vez de forma estrictamente secuencial, el tiempo total acumulado es:
  $$T_{\text{serial}} = \underbrace{2 \cdot \text{RTT} + \frac{L_{\text{base}}}{R}}_{\text{HTML Base}} + \sum_{i=1}^M \left( 2 \cdot \text{RTT} + \frac{L_i}{R} \right) = 2(M+1)\,\text{RTT} + \frac{L_{\text{base}} + \sum L_i}{R}$$
- **Descarga con Conexiones Paralelas**: Los navegadores modernos abren habitualmente entre 4 y 6 conexiones TCP simultáneas hacia el mismo dominio para descargar varios objetos a la vez. Aunque reduce el tiempo total de reloj, introduce una severa contención por el ancho de banda compartido y agota rápidamente las tablas de descriptores de sockets en el kernel del servidor.

### 2.3 Desventajas Arquitectónicas del Modelo No Persistente
1. **Multiplicación de RTTs**: La latencia de la red domina el tiempo de carga, especialmente en enlaces con RTT elevado (conexiones móviles o transcontinentales).
2. **Incompatibilidad con el Control de Congestión de TCP**: Cada nueva conexión TCP arranca desde el principio en la fase de **Slow Start** (ventana de congestión pequeña, típicamente de 1 a 10 MSS). La conexión se cierra justo cuando la ventana comenzaba a expandirse para aprovechar el ancho de banda del canal.

---

## 3. HTTP Persistente (HTTP/1.1)

Para superar las deficiencias de HTTP/1.0, la especificación HTTP/1.1 (RFC 2616 y RFC 7230) estableció las **conexiones persistentes como el comportamiento predeterminado**.

En este esquema, el servidor mantiene abierta la conexión TCP después de enviar una respuesta. Las solicitudes y respuestas subsiguientes se envían a través del mismo socket TCP existente.

### 3.1 Cabeceras de Control de Persistencia
- `Connection: keep-alive`: Indica la intención de mantener la conexión abierta tras finalizar la respuesta actual.
- `Keep-Alive: timeout=5, max=100`: Parámetros declarados por el servidor indicando que mantendrá la conexión inactiva por un máximo de 5 segundos antes de cerrarla unilateralmente, o que aceptará hasta 100 peticiones adicionales a través del mismo socket.
- `Connection: close`: Cabecera explícita que se incluye cuando cualquiera de las dos partes (cliente o servidor) decide dar por terminada la sesión TCP tras el mensaje actual.

### 3.2 Persistente sin Encauzamiento (*without Pipelining*)
El cliente emite una nueva solicitud HTTP únicamente después de haber recibido la respuesta íntegra del objeto previo:
- Tras la conexión TCP inicial para el HTML base (que cuesta $2 \cdot \text{RTT} + L_{\text{base}}/R$), cada objeto adicional $i$ se obtiene en **solo 1 RTT** (la ida de la solicitud y la vuelta de la respuesta):

$$T_{\text{sin-pipelining}} = 2 \cdot \text{RTT} + \frac{L_{\text{base}}}{R} + \sum_{i=1}^M \left( \text{RTT} + \frac{L_i}{R} \right) = (M + 2)\,\text{RTT} + \frac{L_{\text{base}} + \sum L_i}{R}$$

Se ahorran $M \cdot \text{RTT}$ completos al evitar handshakes TCP redundantes.

### 3.3 Persistente con Encauzamiento (*with Pipelining*)
En lugar de esperar la confirmación de cada objeto, el cliente envía las solicitudes de todos los $M$ objetos referenciados en una ráfaga inmediata y continua en cuanto analiza el HTML base:
- Todas las solicitudes viajan en el mismo lapso de ida.
- Si el enlace cuenta con capacidad suficiente, los objetos se transfieren de forma continua uno tras otro:

$$T_{\text{pipelining}} \approx 2 \cdot \text{RTT} + \frac{L_{\text{base}}}{R} + \text{RTT} + \sum_{i=1}^M \frac{L_i}{R} = 3 \cdot \text{RTT} + \frac{L_{\text{base}} + \sum L_i}{R}$$

#### El problema del Head-of-Line Blocking en HTTP/1.1:
A pesar de su eficiencia teórica, HTTP pipelining exige que el servidor devuelva las respuestas en el mismo orden exacto en que llegaron las peticiones. Si el primer objeto en la cola requiere un cómputo pesado en base de datos o almacenamiento en disco lento, todos los objetos posteriores permanecen bloqueados. Por esta razón, la mayoría de navegadores deshabilitaron el pipelining por defecto y la industria impulsó el desarrollo de HTTP/2.

---

## 4. Resumen Cuantitativo de Latencias Teóricas

| Modalidad de Conexión | RTTs Consumidos por Enlace (para $M$ objetos) | Tiempo de Transmisión Acumulado |
| :--- | :--- | :--- |
| **No Persistente Secuencial** | $2(M + 1) \cdot \text{RTT}$ | $\frac{L_{\text{base}} + \sum_{i=1}^M L_i}{R}$ |
| **No Persistente ($P$ Conexiones Paralelas)** | $\approx 2 \cdot \left(1 + \lceil M / P \rceil \right) \cdot \text{RTT}$ | $\approx \frac{L_{\text{base}}}{R} + \frac{\sum L_i}{R}$ *(con contención de ancho de banda)* |
| **Persistente sin Pipelining** | $(M + 2) \cdot \text{RTT}$ | $\frac{L_{\text{base}} + \sum_{i=1}^M L_i}{R}$ |
| **Persistente con Pipelining** | $3 \cdot \text{RTT}$ *(ideal)* | $\frac{L_{\text{base}} + \sum_{i=1}^M L_i}{R}$ |
| **HTTP/2 Multiplexado (Streams)** | $3 \cdot \text{RTT}$ *(con priorización fina)* | $\frac{L_{\text{base}} + \sum_{i=1}^M L_i}{R}$ |
