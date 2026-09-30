---
title: "Formulario de Referencia Rápida — Redes de Computadoras"
---

# Formulario de Referencia Rápida — Redes y Comunicaciones (CS4054)

Compendio oficial de fórmulas, modelos matemáticos, cotas analíticas y algoritmos del curso, organizado rigurosamente por semanas académicas.

---

## Semana 1 — Fundamentos y Rendimiento en Redes

### 1. Descomposición del Retardo Nodal
$$d_{\text{nodal}} = d_{\text{proc}} + d_{\text{queue}} + d_{\text{trans}} + d_{\text{prop}}$$

- **Retardo de Procesamiento ($d_{\text{proc}}$)**: Tiempo que toma el router en examinar la cabecera del paquete, verificar la suma de comprobación (checksum) y determinar el enlace de salida en la tabla de reenvío. Típicamente $\le \text{microsegundos}$.
- **Retardo de Encolamiento ($d_{\text{queue}}$)**: Tiempo que espera el paquete en el búfer de salida antes de ser transmitido. Depende de la congestión y del tráfico previo.
- **Retardo de Transmisión ($d_{\text{trans}}$)**: Tiempo necesario para empujar todos los bits del paquete hacia el medio físico:
  $$d_{\text{trans}} = \frac{L}{R}$$
  Donde $L$ es la longitud del paquete en bits ($\text{bits}$) y $R$ es la tasa de transmisión del enlace en bits por segundo ($\text{bps}$).
- **Retardo de Propagación ($d_{\text{prop}}$)**: Tiempo que tarda un bit en viajar desde el origen del enlace físico hasta el extremo receptor:
  $$d_{\text{prop}} = \frac{d}{s}$$
  Donde $d$ es la distancia física del enlace ($\text{metros}$) y $s$ es la velocidad de propagación de la señal en el medio (típicamente $s \approx 2 \times 10^8\text{ m/s}$ en fibra o cable coaxial, y $s \approx 3 \times 10^8\text{ m/s}$ en espacio libre).

### 2. Retardo de Extremo a Extremo (Sin Encolamiento)
Para una ruta con $Q$ enlaces homogéneos idénticos y $Q-1$ enrutadores intermedios de conmutación de paquetes *store-and-forward*:
$$d_{\text{end-to-end}} = Q \cdot \left( \frac{L}{R} + \frac{d}{s} \right)$$

Para la transmisión en tubería de $P$ paquetes seguidos:
$$T_{\text{total}} = (Q + P - 1) \cdot \frac{L}{R} + Q \cdot \frac{d}{s}$$

### 3. Intensidad de Tráfico en Colas
$$I = \frac{L \cdot a}{R}$$
- $a$: Tasa media de llegada de paquetes ($\text{paquetes/segundo}$).
- Si $I \approx 0$: Retardo de cola despreciable.
- Si $I \to 1$: El retardo de cola crece asintóticamente hacia el infinito.
- Si $I > 1$: La tasa de llegada supera la de servicio; la cola crece sin límite y se producen pérdidas de paquetes por desbordamiento de búfer (*packet drop*).

### 4. Tasa de Transferencia Eficaz (Throughput)
Para una trayectoria con enlaces en serie con tasas $R_1, R_2, \dots, R_k$:
$$\text{Throughput} = \min\{ R_1, R_2, \dots, R_k \}$$
El enlace con el menor ancho de banda constituye el **cuello de botella** (*bottleneck link*).

---

## Semana 2 — Capa de Aplicación y Protocolo HTTP

### 1. Tiempo de Descarga de Objetos en HTTP
Sea $RTT$ el tiempo de ida y vuelta (*Round Trip Time*) entre cliente y servidor:

#### a) HTTP No Persistente (HTTP/1.0 sin paralelismo)
Para un archivo HTML base y $M$ objetos referenciados:
$$T = \underbrace{2 \cdot RTT + \frac{L_{\text{HTML}}}{R}}_{\text{Objeto base HTML}} + \sum_{i=1}^M \left( 2 \cdot RTT + \frac{L_i}{R} \right)$$
Cada objeto requiere 1 RTT para el Three-way Handshake TCP y 1 RTT para la petición/respuesta HTTP.

#### b) HTTP Persistente sin Pipelining (HTTP/1.1 por defecto)
$$T = \underbrace{2 \cdot RTT + \frac{L_{\text{HTML}}}{R}}_{\text{Conexión TCP inicial + HTML}} + \sum_{i=1}^M \left( RTT + \frac{L_i}{R} \right)$$
Se reutiliza la conexión TCP abierta; cada objeto solo incurre en 1 RTT adicional.

#### c) HTTP Persistente con Pipelining (o multiplexación HTTP/2)
$$T = 2 \cdot RTT + \frac{L_{\text{HTML}}}{R} + RTT + \frac{\sum_{i=1}^M L_i}{R}$$
Todas las solicitudes de los objetos referenciados se emiten de forma contigua sin esperar las respuestas intermedias.

### 2. Eficiencia y Latencia con Web Proxy Caching
Sea $h$ la tasa de acierto en caché (*hit rate*, $0 \le h \le 1$):
$$T_{\text{promedio}} = h \cdot T_{\text{LAN}} + (1 - h) \cdot T_{\text{Internet}}$$
Donde $T_{\text{LAN}} \approx \text{milisegundos}$ y $T_{\text{Internet}} = RTT_{\text{origen}} + \frac{L}{R_{\text{acceso}}} + \dots$

---

## Semana 3 — Sistema de Nombres de Dominio (DNS)

### 1. Latencia de Resolución DNS
- **Resolución Iterativa Secuencial** (consultando Root, TLD y Autoritativo):
  $$T_{\text{DNS}} = RTT_1 + RTT_2 + \dots + RTT_k$$
- **Tiempo Total de Acceso Web (DNS + HTTP Persistente)**:
  $$T_{\text{total}} = T_{\text{DNS}} + \underbrace{2 \cdot RTT_{\text{servidor}}}_{\text{Handshake TCP + Request HTTP}} + \frac{L_{\text{objeto}}}{R}$$

### 2. Formato del Registro de Recursos (RR)
$$(\text{Name}, \text{Value}, \text{Type}, \text{TTL})$$
- **Tipo A**: Hostname $\to$ IPv4.
- **Tipo AAAA**: Hostname $\to$ IPv6.
- **Tipo NS**: Dominio $\to$ Hostname del servidor DNS autoritativo.
- **Tipo CNAME**: Nombre de alias $\to$ Nombre canónico real.
- **Tipo MX**: Dominio $\to$ Hostname del servidor de correo electrónico.

---

## Semana 4 — Distribución de Archivos: Cliente-Servidor vs. P2P

Sea $F$ el tamaño del archivo en bits, $N$ el número de clientes que desean descargarlo, $u_s$ la tasa de subida del servidor, $d_i$ la tasa de descarga del cliente $i$, y $u_i$ la tasa de subida del cliente $i$. Sea $d_{\min} = \min\{d_1, d_2, \dots, d_N\}$.

### 1. Cota Inferior en Arquitectura Cliente-Servidor
$$D_{\text{CS}} \ge \max\left\{ \frac{N \cdot F}{u_s}, \; \frac{F}{d_{\min}} \right\}$$
- El servidor debe enviar $N$ copias completas del archivo ($N \cdot F$).
- El cliente con la conexión más lenta no puede recibir el archivo más rápido que $F / d_{\min}$.
- **Escalabilidad**: Asintóticamente $O(N)$. Al aumentar $N$, el tiempo de distribución crece linealmente.

### 2. Cota Inferior en Arquitectura P2P
$$D_{\text{P2P}} \ge \max\left\{ \frac{F}{u_s}, \; \frac{F}{d_{\min}}, \; \frac{N \cdot F}{u_s + \sum_{i=1}^N u_i} \right\}$$
- El servidor debe subir al menos una copia del archivo ($F / u_s$).
- Ningún nodo puede descargar más rápido que $F / d_{\min}$.
- La capacidad de subida agregada de todo el sistema es $u_s + \sum u_i$, por lo que la demanda total $N \cdot F$ se reparte entre todos los participantes.
- **Escalabilidad**: Asintóticamente $O(1)$. Si los peers tienen una tasa media de subida $u$, cuando $N \to \infty$:
  $$\frac{N \cdot F}{u_s + N \cdot u} \xrightarrow[N \to \infty]{} \frac{F}{u}$$
  El tiempo se vuelve independiente de la cantidad de usuarios (sistema autoescalable).

---

## Semana 5 — Capa de Transporte y Protocolos de Tubería

### 1. Protocolo Stop-and-Wait (RDT 3.0)
- **Tiempo de ciclo de paquete**: $RTT + \frac{L}{R}$
- **Utilización del emisor ($U_{\text{sender}}$)**:
  $$U_{\text{sender}} = \frac{L/R}{RTT + \frac{L}{R}}$$
- **Rendimiento eficaz (Throughput)**:
  $$\text{Throughput} = U_{\text{sender}} \cdot R = \frac{L}{RTT + \frac{L}{R}}$$

### 2. Protocolos de Tubería con Ventana $N$ (GBN y SR)
- **Utilización con ventana de transmisión $N$**:
  $$U_{\text{pipelined}} = \min\left\{ 1, \; N \cdot \frac{L/R}{RTT + \frac{L}{R}} \right\}$$
- **Ventana óptima para saturar el canal ($U = 1$)**:
  $$N \ge \frac{RTT + L/R}{L/R} = 1 + \frac{RTT \cdot R}{L}$$
  Donde $RTT \cdot R$ es el producto retardo-ancho de banda (*Bandwidth-Delay Product*, BDP).

### 3. Restricción del Tamaño de Ventana en Selective Repeat
Para evitar la ambigüedad entre paquetes nuevos y retransmisiones bajo números de secuencia de $k$ bits (módulo $2^k$):
$$W_{\text{sender}} + W_{\text{receiver}} \le 2^k$$
Dado que en Selective Repeat simétrico $W_s = W_r = W$:
$$W \le 2^{k-1}$$
En Go-Back-N, dado que $W_r = 1$:
$$W_s \le 2^k - 1$$

---

## Semana 6 — Protocolo UDP y Checksum de Internet

### 1. Sobrecarga y Tamaños Máximos en UDP
- Longitud de cabecera fija de UDP: $8\text{ bytes} = 64\text{ bits}$ (Source Port, Dest Port, Length, Checksum; 16 bits cada uno).
- Campo `Length` de 16 bits: Permite un tamaño total máximo de datagrama de $2^{16} - 1 = 65,535\text{ bytes}$.
- **Carga útil (Payload) máxima de UDP sobre IPv4**:
  $$\text{Max Payload} = 65,535 - 20\text{ (IPv4 Header)} - 8\text{ (UDP Header)} = 65,507\text{ bytes}$$
- **Carga útil máxima sin fragmentación sobre Ethernet (MTU = 1500 B)**:
  $$\text{Payload sin fragmentar} = 1500 - 20\text{ (IPv4)} - 8\text{ (UDP)} = 1472\text{ bytes}$$

### 2. Algoritmo de Checksum de Internet (RFC 1071)
1. Los datos se dividen en palabras de 16 bits. Si el tamaño total es impar, se añade un byte cero de relleno al final (*padding*).
2. Se suman todas las palabras de 16 bits en aritmética de complemento a 1:
   - Todo acarreo (*carry-out*) más allá del bit 15 se suma al bit menos significativo (acarreo circular / *end-around carry*):
     $$\text{Suma final} = (\text{Suma} \ \& \ \text{0xFFFF}) + (\text{Suma} \gg 16)$$
3. Se invierte cada bit del resultado (operador NOT / complemento a uno):
   $$\text{Checksum} = \sim \text{Suma final}$$
4. **Verificación en el Receptor**: Se suman todas las palabras recibidas **incluyendo el campo checksum recibido**. Si no hubo errores, el resultado debe ser exactamente `0xFFFF` (`~0xFFFF = 0x0000`).

---

## Semana 7 — Protocolo TCP: RTT, Temporizadores y Control de Congestión

### 1. Estimación del RTT y Temporizador de Retransmisión (RFC 6298)
- **Media móvil exponencial ponderada (EWMA) de SampleRTT**:
  $$\text{EstimatedRTT} = (1 - \alpha) \cdot \text{EstimatedRTT} + \alpha \cdot \text{SampleRTT}$$
  *(Valor recomendado por el estándar: $\alpha = 0.125 = 1/8$)*.

- **Desviación media del RTT ($\text{DevRTT}$)**:
  $$\text{DevRTT} = (1 - \beta) \cdot \text{DevRTT} + \beta \cdot \left| \text{SampleRTT} - \text{EstimatedRTT} \right|$$
  *(Valor recomendado por el estándar: $\beta = 0.25 = 1/4$)*.

- **Intervalo de Expiración del Temporizador ($\text{TimeoutInterval}$)**:
  $$\text{TimeoutInterval} = \text{EstimatedRTT} + 4 \cdot \text{DevRTT}$$

- **Regla de Karn y Respaldo del Temporizador (*Timer Backoff*)**:
  - No se toma `SampleRTT` de segmentos que hayan sido retransmitidos.
  - Cada vez que expira el temporizador (*Timeout*), el nuevo valor se duplica:
    $$\text{TimeoutInterval}_{\text{nuevo}} = 2 \cdot \text{TimeoutInterval}_{\text{actual}}$$

### 2. Control de Flujo TCP
Para evitar saturar el búfer de recepción del receptor:
$$\text{rwnd} = \text{RcvBuffer} - \left( \text{LastByteRcvd} - \text{LastByteRead} \right)$$
El emisor garantiza en todo momento que la cantidad de datos enviados sin confirmar no exceda la ventana advertida:
$$\text{LastByteSent} - \text{LastByteAcked} \le \text{rwnd}$$

### 3. Dinámica de la Ventana de Congestión (`cwnd`)
El emisor transmite a una tasa acotada por:
$$\text{Ventana efectiva} = \min\{ \text{cwnd}, \; \text{rwnd} \}$$

#### Fases del Algoritmo de Congestión (TCP Reno):
1. **Slow Start (Arranque Lento)**:
   - Inicialización: $\text{cwnd} = 1\text{ MSS}$.
   - Por cada ACK recibido: $\text{cwnd} \leftarrow \text{cwnd} + 1\text{ MSS}$.
   - Crecimiento exponencial: $\text{cwnd}$ se duplica en cada RTT ($1 \to 2 \to 4 \to 8 \dots$).
   - Termina cuando $\text{cwnd} \ge \text{ssthresh}$ o ante pérdida.

2. **Congestion Avoidance (Prevención de Congestión)**:
   - Crecimiento lineal: Por cada RTT completo, $\text{cwnd} \leftarrow \text{cwnd} + 1\text{ MSS}$.
   - Por cada ACK individual: $\text{cwnd} \leftarrow \text{cwnd} + \text{MSS} \cdot \left( \frac{\text{MSS}}{\text{cwnd}} \right)$.

3. **Reacción ante Pérdidas**:
   - **Ante Timeout (evento grave de congestión)**:
     $$\text{ssthresh} = \max\left( \frac{\text{cwnd}}{2}, \; 2\text{ MSS} \right), \quad \text{cwnd} = 1\text{ MSS}$$
     *(Tanto en TCP Tahoe como en TCP Reno se regresa a Slow Start)*.
   - **Ante 3 ACKs Duplicados (Fast Retransmit / Fast Recovery)**:
     - **TCP Tahoe**: $\text{ssthresh} = \text{cwnd} / 2$, $\text{cwnd} = 1\text{ MSS}$ (Slow Start).
     - **TCP Reno**: $\text{ssthresh} = \text{cwnd} / 2$, $\text{cwnd} = \text{ssthresh} + 3\text{ MSS}$ (Fast Recovery, entra directo a Congestion Avoidance tras retransmitir).

### 4. Throughput Promedio de TCP (Modelo de Dientes de Sierra)
Para un régimen con tasa de pérdida de paquetes $L$:
$$\text{Throughput}_{\text{promedio}} \approx \frac{1.22 \cdot \text{MSS}}{RTT \cdot \sqrt{L}}$$
Entre pérdidas con ventana máxima $W$:
$$\text{Throughput}_{\text{promedio}} = \frac{0.75 \cdot W \cdot \text{MSS}}{RTT}$$