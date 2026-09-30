---
title: "Examen Parcial 2025-II"
category: "parciales"
categoryLabel: "Exámenes Parciales"
order: 1
---

## Instrucciones Generales

- **Curso**: CS4055 / CS4054 Redes y Comunicaciones
- **Duración**: 110 minutos
- **Modalidad**: Individual. Se califica el procedimiento matemático, la rigurosidad conceptual y la claridad de redacción técnica.

---

## Sección Teórica (10 Puntos)

### Pregunta 1: Resolución DNS y Retardos de Transferencia Web (2.0 Puntos)

Un cliente accede por primera vez a un sitio web cuyo nombre de dominio no está registrado en su caché local. Debe consultar tres servidores DNS secuencialmente ($RTT_1, RTT_2, RTT_3$) antes de establecer conexión con el servidor web ($RTT_s$).

El archivo principal a descargar es un video corto de tamaño no despreciable. El enlace cliente-servidor posee una tasa de transmisión de $R\text{ bps}$ y el tamaño del archivo es de $S\text{ bits}$.

#### Incisos
a) Exprese algebraicamente el tiempo total transcurrido desde que el usuario solicita la URL hasta que recibe completamente el archivo, considerando tanto la resolución DNS como la descarga sobre HTTP no persistente.  
b) Si $RTT_1 = 60\text{ ms}$, $RTT_2 = 80\text{ ms}$, $RTT_3 = 100\text{ ms}$, $RTT_s = 70\text{ ms}$, $S = 8\text{ MB}$ y $R = 4\text{ Mbps}$, calcule el tiempo total de descarga en segundos.  
c) Analice qué parte del proceso domina la latencia total y discuta cómo podría optimizarse la entrega del recurso.

---

#### Solución Paso a Paso:

**Parte (a): Derivación de la Ecuación General**

1. **Fase de Resolución DNS**: Al ser una consulta iterativa sin caché, el cliente debe esperar la resolución secuencial de los 3 servidores DNS (servidor raíz, servidor TLD y servidor autoritativo):
   $$T_{\text{DNS}} = RTT_1 + RTT_2 + RTT_3$$

2. **Fase de Establecimiento TCP**: Para abrir la conexión de transporte con el servidor web se requiere un Three-Way Handshake. El cliente envía SYN y recibe SYN-ACK, lo que toma exactamente un tiempo de ida y vuelta:
   $$T_{\text{TCP\_handshake}} = RTT_s$$

3. **Fase de Solicitud y Transmisión HTTP**: El cliente envía la solicitud HTTP GET (que viaja en el tercer paquete del handshake o inmediatamente después). El servidor recibe el GET y comienza a inyectar los bits del archivo en el enlace. El primer bit del video llega al cliente tras medio $RTT_s$ adicional (tiempo de propagación de ida y vuelta para solicitud/primer bit). La recepción del último bit concluye tras el retardo de transmisión completo $d_{\text{trans}} = \frac{S}{R}$:
   $$T_{\text{HTTP}} = RTT_s + \frac{S}{R}$$

4. **Tiempo Total Acumulado**:
   $$T_{\text{total}} = T_{\text{DNS}} + T_{\text{TCP\_handshake}} + T_{\text{HTTP}}$$
   $$T_{\text{total}} = (RTT_1 + RTT_2 + RTT_3) + 2 \cdot RTT_s + \frac{S}{R}$$

---

**Parte (b): Cálculo Numérico Riguroso**

1. **Conversión de Unidades**:
   - $S = 8\text{ MB} = 8 \times 10^6\text{ bytes} = 8 \times 8 \times 10^6\text{ bits} = 64 \times 10^6\text{ bits} = 64\text{ Mbits}$ (o en base binaria $8 \times 1024 \times 1024 \times 8 = 67,108,864\text{ bits}$; adoptando el estándar de telecomunicaciones de potencias decimales $1\text{ MB} = 8\text{ Mb}$):
     $$S = 8 \times 8\text{ Mb} = 64\text{ Mb}$$
   - $R = 4\text{ Mbps}$
   - $RTT_1 = 60\text{ ms} = 0.060\text{ s}$
   - $RTT_2 = 80\text{ ms} = 0.080\text{ s}$
   - $RTT_3 = 100\text{ ms} = 0.100\text{ s}$
   - $RTT_s = 70\text{ ms} = 0.070\text{ s}$

2. **Cálculo de los Componentes Temporales**:
   - Latencia DNS:
     $$T_{\text{DNS}} = 0.060 + 0.080 + 0.100 = 0.240\text{ s} \quad (240\text{ ms})$$
   - Latencia de Conexión y Solicitud HTTP:
     $$T_{\text{RTT\_web}} = 2 \cdot RTT_s = 2 \times 0.070 = 0.140\text{ s} \quad (140\text{ ms})$$
   - Retardo de Transmisión del Archivo:
     $$d_{\text{trans}} = \frac{S}{R} = \frac{64\text{ Mb}}{4\text{ Mbps}} = 16.0\text{ s}$$

3. **Suma Total**:
   $$T_{\text{total}} = 0.240\text{ s} + 0.140\text{ s} + 16.0\text{ s} = 16.380\text{ segundos}$$

---

**Parte (c): Análisis Crítico de Dominancia y Optimización**

- **Componente Dominante**: El tiempo de transmisión de datos ($16.0\text{ s}$) representa el $\frac{16.0}{16.380} \approx 97.68\%$ del tiempo total. La latencia acumulada de red ($RTT$ de DNS y TCP) apenas constituye el $2.32\%$ restante ($0.380\text{ s}$).
- **Estrategias de Optimización**:
  1. **Aumento del Ancho de Banda o Compresión**: Incrementar $R$ o aplicar codecs de video más eficientes (e.g., H.265/AV1 en lugar de H.264) reduce directamente el término $S/R$, que es el cuello de botella físico.
  2. **Uso de CDN (Content Delivery Network)**: Aproxima el contenido geográficamente al usuario, reduciendo $RTT_s$ y proporcionando enlaces troncales con mayor capacidad $R$.
  3. **Caché DNS Local y Web Caching**: Almacenar en caché el registro DNS elimina los $240\text{ ms}$ de consulta, y un proxy web local elimina la necesidad de atravesar el enlace de acceso si el video fue solicitado previamente.

---

### Pregunta 2: Modelado Analítico de Distribución de Archivos: C/S vs. P2P (2.0 Puntos)

Considere la distribución de un archivo de tamaño $F$ hacia $N$ clientes (*peers*). El servidor posee una tasa de subida $u_s$. Cada cliente $i$ posee una tasa de descarga $d_i$ y una tasa de subida $u_i$. Sea $d_{\min} = \min \{d_1, d_2, \dots, d_N\}$ la tasa de descarga mínima.

Explique formalmente cómo se deducen las expresiones analíticas del tiempo de distribución mínimo para las arquitecturas **Cliente-Servidor ($D_{\text{cs}}$)** y **Peer-to-Peer ($D_{\text{P2P}}$)**, e indique las implicancias operativas cuando el número de usuarios $N$ crece hacia valores muy elevados ($N \to \infty$).

---

#### Solución Paso a Paso:

**1. Deducción del Modelo Cliente-Servidor ($D_{\text{cs}}$)**:
En la arquitectura Cliente-Servidor clásica, los clientes no colaboran redistribuyendo datos; el servidor central debe abastecer a cada uno de los $N$ clientes individualmente.

Existen dos cotas físicas independientes:
1. **Cota del Servidor**: Para entregar una copia completa del archivo a los $N$ clientes, el servidor debe inyectar en la red un volumen total de $N \cdot F$ bits a través de su enlace de subida de tasa $u_s$:
   $$T_{\text{subida\_servidor}} \ge \frac{N \cdot F}{u_s}$$
2. **Cota del Cliente más Lento**: El cliente con la tasa de descarga más baja ($d_{\min}$) no puede recibir los $F$ bits del archivo en un tiempo menor que el retardo impuesto por su propio canal de bajada:
   $$T_{\text{descarga\_cliente}} \ge \frac{F}{d_{\min}}$$

Dado que ambas restricciones deben cumplirse simultáneamente, el tiempo mínimo de distribución en Cliente-Servidor es:
$$D_{\text{cs}} = \max\left( \frac{N \cdot F}{u_s}, \frac{F}{d_{\min}} \right)$$

---

**2. Deducción del Modelo Peer-to-Peer ($D_{\text{P2P}}$)**:
En P2P, los clientes actúan como *servents* (servidores y clientes a la vez), cooperando al redistribuir las piezas del archivo que ya han descargado.

Existen tres cotas físicas fundamentales:
1. **Cota de Envío Inicial del Servidor**: El servidor debe enviar al menos una copia completa del archivo a la red de pares para que el archivo exista en el enjambre:
   $$T_{\text{servidor}} \ge \frac{F}{u_s}$$
2. **Cota de Descarga del Par más Lento**: Ningún cliente individual puede terminar antes de que su propio enlace reciba los $F$ bits del archivo:
   $$T_{\text{descarga}} \ge \frac{F}{d_{\min}}$$
3. **Cota de Capacidad de Subida Global del Sistema**: La red completa debe recibir un total acumulado de $N \cdot F$ bits. La capacidad máxima instantánea de subida de toda la comunidad está formada por la tasa del servidor más la suma de las tasas de subida de todos los clientes activos ($u_s + \sum_{i=1}^N u_i$):
   $$T_{\text{sistema\_total}} \ge \frac{N \cdot F}{u_s + \sum_{i=1}^N u_i}$$

Uniendo las tres cotas:
$$D_{\text{P2P}} = \max\left( \frac{F}{u_s}, \frac{F}{d_{\min}}, \frac{N \cdot F}{u_s + \sum_{i=1}^N u_i} \right)$$

---

**3. Implicancias Asintóticas cuando $N \to \infty$ (Escalabilidad)**:

- **En Cliente-Servidor**:
  $$\lim_{N \to \infty} D_{\text{cs}} = \lim_{N \to \infty} \frac{N \cdot F}{u_s} = \infty$$
  El tiempo de distribución crece de manera **estrictamente lineal** respecto al número de usuarios ($O(N)$). Si $N$ se multiplica por 1000, el tiempo de distribución se multiplica por 1000. El servidor central se convierte en un cuello de botella fatal.

- **En Peer-to-Peer**:
  Asumiendo pares con tasa de subida promedio idéntica $u$, la capacidad total de subida es $u_s + N \cdot u$. La tercera cota se comporta como:
  $$\lim_{N \to \infty} \frac{N \cdot F}{u_s + N \cdot u} = \lim_{N \to \infty} \frac{F}{\frac{u_s}{N} + u} = \frac{F}{u}$$
  Por lo tanto, cuando $N$ es grande, el tiempo de distribución está acotado superiormente por:
  $$D_{\text{P2P}} \to \max\left( \frac{F}{u_s}, \frac{F}{d_{\min}}, \frac{F}{u} \right)$$
  El tiempo de distribución en P2P **se estabiliza en una constante independiente de $N$**. Cada nuevo usuario que se une al sistema aporta capacidad de subida adicional ($u_i$) al mismo tiempo que demanda datos, confiriéndole a la arquitectura P2P su propiedad fundamental de **autoescalabilidad** (*self-scalability*).

---

### Pregunta 3: Máquina de Estados Finitos (FSM) de RDT 2.1 Receptor y Transición a RDT 2.2 (3.0 Puntos)

Resolver conceptualmente la Máquina de Estados Finitos (FSM) de un receptor en el protocolo **RDT 2.1**.
a) Explique cómo funciona el receptor y cómo lidia con el problema de paquetes duplicados.  
b) ¿Qué modificación estructural debe realizarse en el protocolo para transicionar de RDT 2.1 a RDT 2.2? Justifique la eliminación del mensaje NAK.

---

#### Solución Paso a Paso:

**Parte (a): Funcionamiento de RDT 2.1 Receiver y Manejo de Duplicados**

1. **Estados del Receptor**:
   El receptor de RDT 2.1 posee dos estados operativos principales:
   - `Wait for 0 from below` (Esperando paquete con número de secuencia 0).
   - `Wait for 1 from below` (Esperando paquete con número de secuencia 1).

2. **Manejo de Casos en cada Estado (e.g., en `Wait for 0`)**:
   - **Caso 1: Paquete corrupto recibido** (`corrupt(rcvpkt)`): El receptor detecta falla en el checksum. Genera y transmite un acuse negativo `NAK` y permanece en el mismo estado esperando el paquete 0.
   - **Caso 2: Paquete correcto pero con número de secuencia desfasado (Duplicado 1)** (`notcorrupt(rcvpkt) && has_seq1(rcvpkt)`): Ocurre cuando el ACK anterior enviado por el receptor se corrompió en el canal y el emisor retransmitió el paquete 1. El receptor **no debe entregar estos datos por segunda vez a la capa superior** (evita duplicidad). Por lo tanto, descarta los datos de aplicación pero **vuelve a transmitir un mensaje `ACK`** para que el emisor se entere de que ya lo recibió y pueda avanzar. Permanece en el estado `Wait for 0`.
   - **Caso 3: Paquete correcto con la secuencia esperada (Paquete 0)** (`notcorrupt(rcvpkt) && has_seq0(rcvpkt)`): Extrae los datos, los entrega a la aplicación mediante `deliver_data()`, transmite un `ACK`, y transiciona al estado `Wait for 1 from below`.

El uso de un campo de número de secuencia de 1 bit ($0$ o $1$) permite al receptor distinguir inequívocamente si el paquete que acaba de llegar es un paquete nuevo o si es una retransmisión de un paquete ya procesado.

---

**Parte (b): Transición a RDT 2.2 (Protocolo NAK-Free)**

Para pasar de RDT 2.1 a RDT 2.2, se **eliminan por completo los mensajes NAK**. En su lugar, el receptor **incorpora el número de secuencia dentro del paquete ACK**:
- En lugar de enviar un `NAK` cuando un paquete llega corrupto o desordenado, el receptor envía un **`ACK` explícito confirmando el último paquete recibido con éxito**:
  - Si el receptor está esperando el paquete $1$ y recibe un paquete $0$ (duplicado) o un paquete corrupto, emite un `ACK 0`.
- **Lógica en el Emisor**: El emisor interpreta la llegada de un `ACK 0` (cuando él estaba esperando la confirmación del paquete $1$) como un **ACK duplicado**, lo cual es semánticamente equivalente a recibir un `NAK 1`.
- **Ventajas de Diseño**: Simplifica la semántica de la cabecera (se requiere un único tipo de mensaje de confirmación, reduciendo bits y complejidad en el parser de paquetes) y sienta las bases directas del mecanismo de acuses acumulativos adoptado finalmente por TCP.

---

### Pregunta 4: Confiabilidad en Canales con Pérdida: Protocolos Basados Únicamente en NAKs (3.0 Puntos)

Considere un canal de comunicación que admite tanto errores en los bits como pérdida de paquetes en el medio. Suponga que se propone implementar un protocolo de transferencia de datos confiable que utiliza **únicamente acuses negativos (NAK-only)**:

a) ¿Cómo se daría cuenta el sistema de que ocurrió un error de bit o una pérdida de paquete?  
b) Suponga que el emisor transmite datos con muy poca frecuencia (tráfico esporádico). ¿Sería preferible un protocolo basado solo en NAKs frente a uno basado en ACKs? Justifique.

---

#### Solución Paso a Paso:

**Parte (a): Mecanismo de Detección de Fallas en Protocolos NAK-Only**

1. **Detección de Error de Bit**: El receptor calcula el checksum del paquete entrante. Si el valor calculado difiere del campo checksum de la cabecera, se detecta que los bits sufrieron corrupción electromagnética. El receptor emite inmediatamente un mensaje `NAK` solicitando la retransmisión del número de paquete corrupto.
2. **Detección de Pérdida de Paquete**: En un protocolo NAK-only, el receptor **no puede detectar la pérdida de un paquete $i$ en el instante en que se pierde**, porque no sabe que dicho paquete fue transmitido. El receptor detecta la pérdida únicamente **cuando arriba con éxito un paquete posterior ($i+1$)**:
   - Al recibir el paquete $i+1$, el receptor constata una discontinuidad o salto en los números de secuencia (esperaba el paquete $i$, pero recibió el $i+1$).
   - En ese momento infiere que el paquete $i$ se perdió en tránsito y emite un `NAK` para el paquete $i$.
3. **El Problema del Último Paquete**: Si el paquete que se pierde es el **último paquete de una transmisión**, el receptor nunca recibirá un paquete posterior que revele el hueco de secuencia. Por ende, nunca emitirá un NAK y el sistema quedará bloqueado indefinidamente a menos que se incorpore un temporizador especial de sondeo o paquetes de control periódicos.

---

**Parte (b): Tráfico Poco Frecuente: NAK vs. ACK**

- **Respuesta**: **No sería preferible** un protocolo NAK-only; es sustancialmente mejor utilizar un protocolo basado en **ACKs**.
- **Justificación**:
  - En un régimen de tráfico esporádico (baja frecuencia de envío), el intervalo temporal entre dos paquetes consecutivos de datos ($t_{i+1} - t_i$) puede ser de muchos segundos, minutos u horas.
  - Si el paquete $i$ se pierde, el receptor permanecerá en silencio total esperando el paquete $i$. Como el emisor no volverá a transmitir datos hasta dentro de un largo período, la pérdida del paquete $i$ no se descubrirá hasta que llegue el paquete $i+1$ mucho tiempo después, introduciendo una **latencia de recuperación inaceptable**.
  - Si se pierde el último paquete de una ráfaga esporádica, la pérdida no se detectará jamás.
  - Con un protocolo basado en **ACKs y temporizadores (como RDT 3.0 o TCP)**, el emisor programa un temporizador local al enviar el paquete $i$. Si el ACK no regresa en un intervalo razonable ($RTO$), el emisor retransmite proactivamente el paquete sin depender de que haya tráfico futuro.

---

## Sección Práctica (10 Puntos)

### Pregunta 5: Prioridad de Registros MX en DNS (1.0 Punto)

Al ejecutar el comando `nslookup` con el comando interactivo `set type=mx` para un dominio corporativo, se despliegan múltiples servidores de correo con sus respectivos identificadores de preferencia:

```
example.com    mail exchanger = 10 mail-backup.example.com
example.com    mail exchanger = 5  mail-primary.example.com
example.com    mail exchanger = 20 mail-dr.example.com
```

¿Qué servidor se contactará en primer lugar cuando un agente de transferencia de correo (MTA) intente entregar un correo electrónico al dominio `example.com`? ¿Por qué?

#### Solución:
- **Servidor contactado en primer lugar**: Se contactará primero a `mail-primary.example.com`.
- **Justificación Técnica**: En el Sistema de Nombres de Dominio (DNS, RFC 974 y RFC 5321), los registros de intercambio de correo (tipo MX) constan de un nombre de host de destino y un valor numérico entero que representa la **prioridad o preferencia**. La regla de protocolo establece que **a menor valor numérico, mayor es la prioridad de entrega**:
  - `mail-primary.example.com` posee una prioridad de **5** (la más alta).
  - Los servidores con prioridades 10 y 20 actúan exclusivamente como sistemas de respaldo (*fallback/secondary MX*) y solo serán contactados si el servidor de prioridad 5 resulta inalcanzable tras múltiples reintentos o timeouts de conexión TCP en el puerto 25.

---

### Pregunta 6: Cálculo y Traza de RTT mediante EWMA (2.5 Puntos)

A partir de una captura de Wireshark de una sesión TCP, se registran los siguientes tiempos de ida y vuelta muestrales (`SampleRTT`) para 5 segmentos consecutivos enviados y confirmados en orden:

| Muestra ($k$) | SampleRTT |
| :---: | :---: |
| 1 | $80.0\text{ ms}$ |
| 2 | $104.0\text{ ms}$ |
| 3 | $92.0\text{ ms}$ |
| 4 | $120.0\text{ ms}$ |
| 5 | $88.0\text{ ms}$ |

Asuma las condiciones iniciales del estándar RFC 6298 para la primera muestra:
$$\text{EstimatedRTT}_1 = \text{SampleRTT}_1 = 80.0\text{ ms}$$
$$\text{DevRTT}_1 = \frac{\text{SampleRTT}_1}{2} = 40.0\text{ ms}$$
Utilizando los parámetros estandarizados $\alpha = 0.125$ y $\beta = 0.25$, complete la tabla calculando analíticamente para cada paso $k$:
1. $\text{EstimatedRTT}_k$
2. $\text{DevRTT}_k$
3. $\text{TimeoutInterval}_k$

#### Solución Paso a Paso:

**Muestra 1 ($k=1$): Inicialización**
- $\text{SampleRTT}_1 = 80.0\text{ ms}$
- $\text{EstimatedRTT}_1 = 80.0\text{ ms}$
- $\text{DevRTT}_1 = 40.0\text{ ms}$
- $\text{TimeoutInterval}_1 = 80.0 + 4 \cdot 40.0 = 80.0 + 160.0 = 240.0\text{ ms}$

---

**Muestra 2 ($k=2$): $\text{SampleRTT}_2 = 104.0\text{ ms}$**
1. $\text{EstimatedRTT}_2 = (1 - 0.125) \cdot 80.0 + 0.125 \cdot 104.0 = 0.875 \cdot 80.0 + 13.0 = 70.0 + 13.0 = 83.0\text{ ms}$
2. Error absoluto: $|\text{SampleRTT}_2 - \text{EstimatedRTT}_2| = |104.0 - 83.0| = 21.0\text{ ms}$
3. $\text{DevRTT}_2 = (1 - 0.25) \cdot 40.0 + 0.25 \cdot 21.0 = 30.0 + 5.25 = 35.25\text{ ms}$
4. $\text{TimeoutInterval}_2 = 83.0 + 4 \cdot (35.25) = 83.0 + 141.0 = 224.0\text{ ms}$

---

**Muestra 3 ($k=3$): $\text{SampleRTT}_3 = 92.0\text{ ms}$**
1. $\text{EstimatedRTT}_3 = 0.875 \cdot 83.0 + 0.125 \cdot 92.0 = 72.625 + 11.5 = 84.125\text{ ms}$
2. Error absoluto: $|92.0 - 84.125| = 7.875\text{ ms}$
3. $\text{DevRTT}_3 = 0.75 \cdot 35.25 + 0.25 \cdot 7.875 = 26.4375 + 1.96875 = 28.40625\text{ ms}$
4. $\text{TimeoutInterval}_3 = 84.125 + 4 \cdot (28.40625) = 84.125 + 113.625 = 197.75\text{ ms}$

---

**Muestra 4 ($k=4$): $\text{SampleRTT}_4 = 120.0\text{ ms}$**
1. $\text{EstimatedRTT}_4 = 0.875 \cdot 84.125 + 0.125 \cdot 120.0 = 73.609375 + 15.0 = 88.609375\text{ ms}$
2. Error absoluto: $|120.0 - 88.609375| = 31.390625\text{ ms}$
3. $\text{DevRTT}_4 = 0.75 \cdot 28.40625 + 0.25 \cdot 31.390625 = 21.3046875 + 7.84765625 = 29.15234375\text{ ms}$
4. $\text{TimeoutInterval}_4 = 88.609375 + 4 \cdot (29.15234375) = 88.609375 + 116.609375 = 205.21875\text{ ms}$

---

**Muestra 5 ($k=5$): $\text{SampleRTT}_5 = 88.0\text{ ms}$**
1. $\text{EstimatedRTT}_5 = 0.875 \cdot 88.609375 + 0.125 \cdot 88.0 = 77.5332 + 11.0 = 88.5332\text{ ms}$
2. Error absoluto: $|88.0 - 88.5332| = 0.5332\text{ ms}$
3. $\text{DevRTT}_5 = 0.75 \cdot 29.1523 + 0.25 \cdot 0.5332 = 21.8642 + 0.1333 = 21.9975\text{ ms}$
4. $\text{TimeoutInterval}_5 = 88.5332 + 4 \cdot (21.9975) = 88.5332 + 87.99 = 176.5232\text{ ms}$

#### Tabla Resumen Final:

| $k$ | SampleRTT | EstimatedRTT | DevRTT | TimeoutInterval |
| :---: | :---: | :---: | :---: | :---: |
| 1 | $80.00\text{ ms}$ | $80.00\text{ ms}$ | $40.00\text{ ms}$ | $240.00\text{ ms}$ |
| 2 | $104.00\text{ ms}$ | $83.00\text{ ms}$ | $35.25\text{ ms}$ | $224.00\text{ ms}$ |
| 3 | $92.00\text{ ms}$ | $84.13\text{ ms}$ | $28.41\text{ ms}$ | $197.75\text{ ms}$ |
| 4 | $120.00\text{ ms}$ | $88.61\text{ ms}$ | $29.15\text{ ms}$ | $205.22\text{ ms}$ |
| 5 | $88.00\text{ ms}$ | $88.53\text{ ms}$ | $22.00\text{ ms}$ | $176.52\text{ ms}$ |

---

### Pregunta 7: Auditoría de Popularidad Web mediante Caché DNS Local (1.5 Puntos)

Supongamos que un administrador de red puede acceder y volcar el contenido de la caché de los servidores DNS locales de un departamento universitario. ¿Es posible determinar aproximadamente cuáles son los servidores web externos más populares entre los usuarios? Explique el procedimiento y sus fundamentos.

#### Solución:
- **Procedimiento Propuesto**:
  1. **Inspección de Presencia de Registros (Presencia en Caché)**: Volcar periódicamente la tabla de caché DNS (usando comandos como `rndc dumpdb -cache` en BIND o `ipconfig /displaydns`). Todo dominio externo que aparezca en la caché indica que al menos un usuario local intentó acceder a él recientemente dentro del período delimitado por su TTL (*Time-To-Live*).
  2. **Análisis del TTL Restante y Frecuencia de Refresco**: Los registros DNS se almacenan con el TTL estipulado por el servidor autoritativo y su contador decrece con cada segundo transcurrido. Si se sondea la caché a intervalos regulares, aquellos dominios cuyo TTL se reinicia constantemente al valor máximo indican que múltiples usuarios están resolviendo ese dominio de manera continua a lo largo del día.
  3. **Monitoreo de Contadores de Aciertos (Hit Counters)**: Si el software DNS local (como Unbound o PowerDNS) tiene habilitadas métricas estadísticas, se pueden extraer directamente los contadores de *Cache Hits* por cada registro de tipo A o AAAA.
- **Limitaciones**: Si un dominio posee un TTL muy prolongado (e.g., 86400 segundos o 24 horas), una sola consulta mantendrá el registro en caché todo el día; por ello, la presencia por sí sola no indica el número exacto de visitas, requiriendo el análisis de la tasa de consultas o contadores de acceso.

---

### Pregunta 8: Análisis de Trama HTTP en Wireshark (2.0 Puntos)

A partir de la decodificación de una trama de respuesta HTTP en Wireshark:
```
HTTP/1.1 200 OK\r\n
Date: Thu, 09 Oct 2025 15:30:00 GMT\r\n
Server: Apache/2.4.52 (Ubuntu)\r\n
Keep-Alive: timeout=5, max=100\r\n
Connection: Keep-Alive\r\n
Content-Type: text/html; charset=UTF-8\r\n
Content-Length: 4850\r\n
\r\n
[4850 bytes of data]
```

#### Preguntas y Respuestas:
a) **(0.5P) ¿Qué código de estado devuelve el servidor y qué significa?**  
   - Código: `200 OK`.  
   - Significado: La petición del cliente fue procesada de forma exitosa por el servidor web y el recurso solicitado se encuentra adjunto en el cuerpo del mensaje (*entity body*).
b) **(0.5P) ¿Qué versión de HTTP se está utilizando?**  
   - Versión: `HTTP/1.1`.
c) **(0.5P) ¿Cuál es el tamaño de la información recibida?**  
   - Tamaño: `4850 bytes`, especificado explícitamente en el encabezado `Content-Length: 4850`.
d) **(0.5P) ¿Qué significa el encabezado Keep-Alive y cuál es su valor?**  
   - Significado: Habilita y parametriza la conexión TCP persistente, evitando cerrar la conexión tras entregar esta respuesta.  
   - Parámetros: `timeout=5, max=100` indica que el servidor mantendrá la conexión TCP abierta en espera de solicitudes posteriores durante un máximo de $5\text{ segundos}$ de inactividad, y permitirá atender hasta un límite de $100$ peticiones sucesivas sobre este mismo socket antes de forzar su cierre.

---

### Pregunta 9: Topología P2P sobre UDP con Routers Residenciales y NAT (3.0 Puntos)

Se desea establecer comunicación P2P mediante sockets UDP entre dos estaciones ubicadas en diferentes viviendas interconectadas por Internet:
- **Vivienda 1**:
  - Router 1 LAN IP: `192.168.1.1/24`, WAN IP pública: `200.48.10.5`
  - Laptop A: IP `192.168.1.50`, Puerto local UDP: `10001`
  - Laptop B: IP `192.168.1.60`, Puerto local UDP: `10002`
- **Vivienda 2**:
  - Router 2 LAN IP: `192.168.10.1/24`, WAN IP pública: `190.222.50.8`
  - Laptop C: IP `192.168.10.100`, Puerto local UDP: `12345`

#### Preguntas y Respuestas:
a) **(0.5P) ¿Cuál es el Default Gateway de la Laptop A?**  
   - Respuesta: `192.168.1.1` (la interfaz LAN del Router 1 dentro de su misma subred).

b) **(0.5P) ¿Cuál es el Default Gateway de la Laptop C?**  
   - Respuesta: `192.168.10.1` (la interfaz LAN del Router 2).

c) **(1.0P) ¿Cuáles serían los datos del datagrama UDP del paquete que sale de la Laptop A a la Laptop B?**  
   - Dado que ambas estaciones conviven en la misma subred local (`192.168.1.0/24`), el tráfico conmuta directamente en el switch interno sin intervención de NAT:
     - IP Origen: `192.168.1.50`
     - IP Destino: `192.168.1.60`
     - Puerto Origen UDP: `10001`
     - Puerto Destino UDP: `10002`

d) **(0.5P) ¿Qué sucede si la Laptop C quiere escuchar y enviar mensajes UDP en el puerto 12345?**  
   - Localmente en el sistema operativo, la llamada `socket.bind(('', 12345))` reserva exitosamente el puerto UDP 12345 para recibir y transmitir.
   - Sin embargo, **desde Internet**, ningún host externo puede iniciar tráfico hacia la Laptop C en el puerto 12345 a menos que el Router 2 tenga configurada una regla estática de reenvío de puertos (*Port Forwarding*) o se implementen técnicas de cruce de NAT como STUN o *UDP Hole Punching*, porque el firewall del router descarta datagramas entrantes no solicitados.

e) **(0.5P) Suponga que la Laptop C envía paquetes UDP a la IP 192.168.10.101. ¿Se recibirán los paquetes?**  
   - Sí, se transmitirán y conmutarán dentro de la red local de la Vivienda 2. Si existe un dispositivo conectado con la dirección IP `192.168.10.101` que posea un socket escuchando en el puerto de destino del datagrama, el paquete se recibirá con éxito. Si no existe ningún host con dicha IP, el protocolo ARP fallará y el sistema reportará *Host Unreachable*.
