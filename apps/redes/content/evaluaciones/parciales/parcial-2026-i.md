---
title: "Examen Parcial 2026-I"
category: "parciales"
categoryLabel: "Exámenes Parciales"
order: 2
---

## Instrucciones Generales

- **Curso**: CS4054 Redes de Computadoras
- **Fecha**: 4 de junio de 2026
- **Modalidad**: Individual. Se califica el procedimiento matemático riguroso, la especificación de unidades y la justificación técnica fundamentada en los estándares de Internet.

---

## Pregunta 1: Protocolos de Aplicación y HTTP (2.0 Puntos)

Un usuario desea descargar una página web que contiene un archivo base HTML y referencias a **3 imágenes pequeñas**.
- El nombre de dominio no está en la memoria caché local y requiere consultar **dos servidores DNS de forma iterativa** ($RTT_1$ y $RTT_2$).
- Una vez obtenida la dirección IP, se accede al servidor web con un retardo de ida y vuelta de $RTT_s$.
- El archivo HTML base tiene un tamaño despreciable ($S_{\text{HTML}} \approx 0$).
- Cada una de las 3 imágenes posee un tamaño exacto de $S\text{ bits}$.
- La tasa de transmisión del enlace de acceso es de $R\text{ bps}$.

### Incisos:
a) **(1.0 pt) Caso A (HTTP No Persistente sin paralelismo)**: Exprese la fórmula analítica del tiempo total transcurrido desde que el usuario hace clic hasta que las 3 imágenes se reciben completamente, asumiendo conexiones TCP secuenciales.  
b) **(0.5 pt) Caso B (HTTP Persistente sin pipelining)**: Exprese la fórmula general para el mismo proceso.  
c) **(0.5 pt) Cálculo Numérico**: Si $RTT_1 = 50\text{ ms}$, $RTT_2 = 70\text{ ms}$, $RTT_s = 100\text{ ms}$, $S = 2\text{ Mbits}$ (por imagen) y $R = 10\text{ Mbps}$, calcule el tiempo total en segundos para el **Caso B**.

---

### Solución Paso a Paso:

#### Parte (a): Caso A — HTTP No Persistente Secuencial
1. **Resolución DNS**:
   $$T_{\text{DNS}} = RTT_1 + RTT_2$$
2. **Descarga del HTML Base**:
   - Requiere 1 RTT para el Three-Way Handshake de TCP ($RTT_s$).
   - Requiere 1 RTT para la solicitud HTTP GET y el arribo del primer bit de respuesta ($RTT_s$).
   - Como el tamaño es despreciable ($S_{\text{HTML}} \approx 0$), el tiempo de transmisión es $0$:
     $$T_{\text{base}} = 2 \cdot RTT_s$$
3. **Descarga de las 3 Imágenes Secuenciales**:
   - En HTTP no persistente, la conexión TCP se cierra al finalizar cada objeto. Cada imagen requiere abrir una conexión TCP nueva ($1 \cdot RTT_s$), emitir la solicitud HTTP GET ($1 \cdot RTT_s$) y transmitir sus $S$ bits en el enlace ($\frac{S}{R}$):
     $$T_{\text{imagen\_i}} = 2 \cdot RTT_s + \frac{S}{R}$$
   - Para las 3 imágenes consecutivas:
     $$T_{\text{3\_imagenes}} = 3 \cdot \left(2 \cdot RTT_s + \frac{S}{R}\right) = 6 \cdot RTT_s + 3 \cdot \frac{S}{R}$$
4. **Tiempo Total Caso A**:
   $$T_{\text{total\_A}} = (RTT_1 + RTT_2) + 2 \cdot RTT_s + 6 \cdot RTT_s + 3 \cdot \frac{S}{R} = (RTT_1 + RTT_2) + 8 \cdot RTT_s + 3 \cdot \frac{S}{R}$$

---

#### Parte (b): Caso B — HTTP Persistente sin Pipelining
1. **Resolución DNS**:
   $$T_{\text{DNS}} = RTT_1 + RTT_2$$
2. **Descarga del HTML Base**:
   - Handshake TCP ($1 \cdot RTT_s$) + Petición/Respuesta GET ($1 \cdot RTT_s$):
     $$T_{\text{base}} = 2 \cdot RTT_s$$
3. **Descarga de las 3 Imágenes sobre la Conexión Abierta**:
   - La conexión TCP permanece establecida (`Connection: keep-alive`). Por ende, no se incurre en handshakes adicionales.
   - Sin pipelining, el cliente debe esperar la llegada completa de la imagen $k$ antes de emitir el GET de la imagen $k+1$. Cada imagen consume 1 RTT para la solicitud/respuesta más el retardo de transmisión $\frac{S}{R}$:
     $$T_{\text{3\_imagenes}} = 3 \cdot \left(RTT_s + \frac{S}{R}\right) = 3 \cdot RTT_s + 3 \cdot \frac{S}{R}$$
4. **Tiempo Total Caso B**:
   $$T_{\text{total\_B}} = (RTT_1 + RTT_2) + 2 \cdot RTT_s + 3 \cdot RTT_s + 3 \cdot \frac{S}{R} = (RTT_1 + RTT_2) + 5 \cdot RTT_s + 3 \cdot \frac{S}{R}$$

---

#### Parte (c): Cálculo Numérico para el Caso B
1. **Datos Numéricos**:
   - $RTT_1 = 50\text{ ms} = 0.050\text{ s}$
   - $RTT_2 = 70\text{ ms} = 0.070\text{ s}$
   - $RTT_s = 100\text{ ms} = 0.100\text{ s}$
   - $S = 2\text{ Mbits} = 2 \times 10^6\text{ bits}$
   - $R = 10\text{ Mbps} = 10 \times 10^6\text{ bps}$
2. **Cálculo de Componentes**:
   - $T_{\text{DNS}} = 0.050 + 0.070 = 0.120\text{ s}$
   - Retardo por RTTs web: $5 \cdot RTT_s = 5 \times 0.100 = 0.500\text{ s}$
   - Tiempo de transmisión unitario: $\frac{S}{R} = \frac{2\text{ Mb}}{10\text{ Mbps}} = 0.200\text{ s}$
   - Tiempo de transmisión de las 3 imágenes: $3 \times 0.200 = 0.600\text{ s}$
3. **Suma Total**:
   $$T_{\text{total\_B}} = 0.120\text{ s} + 0.500\text{ s} + 0.600\text{ s} = 1.220\text{ segundos}$$

---

## Pregunta 2: Análisis de Protocolos RDT (4.5 Puntos)

Considere una transferencia de datos confiable (RDT) fundamentada en el modelo RDT 2.0 pero que incorpora un temporizador (*timeout*) para gestionar pérdidas de paquetes en el canal.

### Incisos y Solución Paso a Paso:

#### a) ¿Qué pasaría si el protocolo solo pudiera enviar mensajes ACK? (1.0 pt)
- **Mecanismo Operativo**: El protocolo se convierte en un sistema libre de NAK (análogo a RDT 2.2 o TCP). Para señalar un error o pérdida, el receptor **repite el ACK del último paquete recibido en orden y libre de errores** (*Duplicate ACK*).
- **Desventajas**: Requiere que los mensajes ACK incluyan obligatoriamente el número de secuencia del paquete que confirman. Si un paquete se pierde, el emisor continuará recibiendo ACKs duplicados hasta que el temporizador expire o se alcance el umbral de retransmisión rápida.

#### b) ¿Qué pasaría si el protocolo solo pudiera enviar mensajes NACK? (1.0 pt)
- **Mecanismo Operativo**: El receptor permanece en silencio absoluto mientras los paquetes lleguen correctamente. Únicamente transmite un mensaje NACK cuando detecta un paquete con error de checksum o cuando detecta una discontinuidad en la secuencia de paquetes (e.g., llega el paquete 3 cuando esperaba el paquete 2).
- **Desventajas**:
  1. El emisor nunca tiene la certeza positiva de si sus datos han sido entregados con éxito a la aplicación receptora.
  2. Si un paquete se pierde, el receptor no puede advertirlo hasta que reciba un paquete posterior.
  3. No hay confirmación explícita para liberar los buffers de retransmisión en el emisor.

#### c) ¿Cómo gestionaría el envío en un sistema NACK-only para asegurar la confiabilidad del último paquete? (0.5 pts)
- **Problema de Diseño**: Si se pierde el **último paquete** de un archivo o transmisión, el receptor nunca recibirá un paquete posterior que revele la falta de secuencia. Por consiguiente, el receptor nunca emitirá un NAK y el emisor nunca sabrá que el paquete se perdió.
- **Propuesta de Solución**:
  - **Mecanismo de Sondeo al Cierre (FIN-Sondeo con ACK forzado)**: El emisor marca el último paquete con una bandera especial de finalización (`LAST_PACKET` o `FIN`) y programa un temporizador local. El receptor está obligado por protocolo a responder excepcionalmente a este paquete especial con un acuse de recibo de confirmación total.
  - **Temporizador de Inactividad y Heartbeats**: El receptor, tras recibir datos, inicia un temporizador de silencio; si pasa un tiempo límite sin nuevos paquetes, envía un paquete de sincronización de estado solicitando la confirmación de la secuencia más alta.

#### d) En un sistema que envía datos con poca frecuencia, ¿sería preferible NAK frente a ACK? (1.0 pt)
- **Respuesta**: **No**. Es categóricamente desaconsejable usar un protocolo NAK-only en tráfico de baja frecuencia.
- **Justificación**: Si los envíos son esporádicos (e.g., un sensor meteorológico que transmite un dato cada 30 minutos), si el paquete $k$ se pierde, el receptor no detectará la pérdida hasta que arribe el paquete $k+1$ treinta minutos después. Esto introduce una latencia catastrófica en la recuperación de la información. El esquema basado en **ACKs con timeout** permite al emisor retransmitir en milisegundos tras la ausencia del acuse.

#### e) En un sistema con alto volumen de datos y un canal con muy pocas pérdidas, ¿sería preferible NAK frente a ACK? (1.0 pt)
- **Respuesta**: **Sí**. En este escenario particular, un protocolo NAK-only o con ACKs fuertemente diferidos es altamente ventajoso.
- **Justificación**: En canales de fibra óptica de altísima confiabilidad (donde la probabilidad de pérdida es $p < 10^{-9}$), el envío de un paquete ACK por cada paquete de datos (o cada 2 paquetes) desperdicia el 50% de los paquetes del canal en tráfico de control de retorno. Un protocolo NAK-only elimina prácticamente todo el tráfico en el enlace inverso, pues el receptor se mantiene en silencio durante el 99.999% del tiempo, maximizando la eficiencia de procesamiento y ancho de banda útil.

---

## Pregunta 3: Distribución de Contenidos y Escalabilidad: C/S vs. P2P (3.5 Puntos)

Una universidad desea distribuir una imagen de disco de laboratorio de $F = 20\text{ GB}$ a un grupo de $N = 150$ estaciones de trabajo.
- Tasa de subida del servidor central: $u_s = 40\text{ Mbps}$.
- Tasa de descarga de cada usuario: $d_i = 12\text{ Mbps}$ ($\forall i$).
- Tasa de subida de cada usuario: $u_i = 3\text{ Mbps}$ ($\forall i$).
- Factor de conversión estipulado: $1\text{ GB} = 8000\text{ Mb}$.

### Incisos y Solución Numérica:

#### Conversión del Tamaño del Archivo:
$$F = 20\text{ GB} = 20 \times 8000\text{ Mb} = 160,000\text{ Mbits}$$

---

#### a) Cálculo del Tiempo Mínimo de Distribución en Cliente-Servidor ($D_{\text{cs}}$) (1.0 pt)

Fórmula general:
$$D_{\text{cs}} = \max\left( \frac{N \cdot F}{u_s}, \frac{F}{d_{\min}} \right)$$

1. Cota del servidor central:
   $$\frac{N \cdot F}{u_s} = \frac{150 \times 160,000\text{ Mb}}{40\text{ Mbps}} = \frac{24,000,000\text{ Mb}}{40\text{ Mbps}} = 600,000\text{ segundos}$$
   $$T_{\text{servidor}} = \frac{600,000}{3600} \approx 166.67\text{ horas} \quad (\approx 6.94\text{ días})$$

2. Cota del cliente más lento ($d_{\min} = 12\text{ Mbps}$):
   $$\frac{F}{d_{\min}} = \frac{160,000\text{ Mb}}{12\text{ Mbps}} \approx 13,333.33\text{ segundos} \quad (\approx 3.70\text{ horas})$$

3. Máximo:
   $$D_{\text{cs}} = \max(600,000\text{ s}, 13,333.33\text{ s}) = 600,000\text{ segundos} \quad (166\text{ h } 40\text{ min})$$

---

#### b) Factor Limitante (Cuello de Botella) en Cliente-Servidor (0.5 pt)
- **Cuello de Botella**: El factor limitante absoluto es la **capacidad de subida del servidor central ($u_s = 40\text{ Mbps}$)**.
- El servidor se ve forzado a despachar secuencialmente 150 copias íntegras del archivo de 20 GB a través de un canal estrecho de 40 Mbps, mientras que los enlaces de bajada de los clientes permanecen masivamente ociosos.

---

#### c) Cálculo del Tiempo Mínimo de Distribución en P2P ($D_{\text{P2P}}$) (1.0 pt)

Fórmula general:
$$D_{\text{P2P}} = \max\left( \frac{F}{u_s}, \frac{F}{d_{\min}}, \frac{N \cdot F}{u_s + \sum_{i=1}^N u_i} \right)$$

1. Primera cota (envío inicial del servidor):
   $$\frac{F}{u_s} = \frac{160,000\text{ Mb}}{40\text{ Mbps}} = 4,000\text{ segundos}$$

2. Segunda cota (descarga del cliente más lento):
   $$\frac{F}{d_{\min}} = \frac{160,000\text{ Mb}}{12\text{ Mbps}} \approx 13,333.33\text{ segundos}$$

3. Tercera cota (capacidad agregada de subida del enjambre):
   - Capacidad total de subida:
     $$U_{\text{total}} = u_s + N \cdot u_i = 40\text{ Mbps} + 150 \times 3\text{ Mbps} = 40 + 450 = 490\text{ Mbps}$$
   - Tiempo de transmisión agregado:
     $$\frac{N \cdot F}{U_{\text{total}}} = \frac{150 \times 160,000\text{ Mb}}{490\text{ Mbps}} = \frac{24,000,000\text{ Mb}}{490\text{ Mbps}} \approx 48,979.59\text{ segundos}$$
     $$T_{\text{enjambre}} \approx \frac{48,979.59}{3600} \approx 13.61\text{ horas}$$

4. Máximo:
   $$D_{\text{P2P}} = \max(4,000\text{ s}, 13,333.33\text{ s}, 48,979.59\text{ s}) = 48,979.59\text{ segundos} \quad (\approx 13\text{ h } 36\text{ min})$$

*Ganancia*: P2P reduce el tiempo de descarga de casi **7 días** a solo **13.6 horas** (una aceleración de más de $12\times$).

---

#### d) Análisis de Escalabilidad para $N = 1000$ (1.0 pt)

- Si $N = 1000$:
  - En Cliente-Servidor:
    $$D_{\text{cs}} = \frac{1000 \times 160,000}{40} = 4,000,000\text{ segundos} \approx 1111.11\text{ horas} \quad (\approx 46.3\text{ días})$$
    El tiempo colapsa linealmente.
  - En P2P:
    $$\frac{N \cdot F}{u_s + N \cdot u_i} = \frac{1000 \times 160,000}{40 + 1000 \times 3} = \frac{160,000,000}{3040} \approx 52,631.58\text{ segundos} \approx 14.62\text{ horas}$$
- **Conclusión de Autoescalabilidad**: Al pasar de 150 a 1000 usuarios ($6.67\times$ más clientes), el tiempo en Cliente-Servidor se multiplica por casi 7 veces (llegando a 46 días), mientras que en P2P el tiempo solo pasa de 13.6 horas a 14.6 horas. Esto demuestra que en P2P cada usuario adicional aporta su propio canal de subida ($u_i$), satisfaciendo su propia demanda de tráfico de manera intrínsecamente autoescalable.

---

## Pregunta 4: Petición Condicional HTTP (1.5 Puntos)

Analice la siguiente solicitud enviada por un navegador web:
```http
GET /index.html HTTP/1.1
Host: www.somosciclo262.com
If-Modified-Since: Thu, 07 May 2026 10:15:00 GMT-5
```

### Respuestas:
a) **(0.5 pt) Finalidad del encabezado `If-Modified-Since`**:  
Implementa el mecanismo de **GET Condicional** (*Conditional GET*). Permite al navegador consultar al servidor web si el recurso `/index.html` ha sufrido alguna modificación posterior a la fecha y hora almacenada en la copia local de su memoria caché.

b) **(0.5 pt) Respuesta del servidor si el recurso no ha sido modificado**:  
El servidor responde con una cabecera de estado sin cuerpo de datos:
```http
HTTP/1.1 304 Not Modified
Date: ...
```
No se incluye ninguna carga útil ni bytes de contenido HTML en el cuerpo del mensaje.

c) **(0.5 pt) Ventajas en ancho de banda y rendimiento**:  
1. **Ahorro masivo de ancho de banda**: Se evita transferir innecesariamente los cientos de kilobytes o megabytes del archivo a través del enlace de red, reduciendo el consumo de datos a una cabecera de unos pocos bytes.
2. **Menor latencia de renderizado**: El navegador carga instantáneamente la página desde su disco o memoria RAM local tan pronto como recibe el código 304, mejorando drásticamente la experiencia de usuario.

---

## Pregunta 5: Detección de Dominios Populares en Caché DNS Local (1.5 Puntos)

*(Consistente con Pregunta 7 del EP-2025-II)*: El administrador vuelca periódicamente la caché DNS del departamento. Al evaluar el campo TTL decreciente de los registros tipo A, aquellos dominios cuyo TTL se refresca repetidamente a su valor máximo autorizado por el servidor autoritativo corresponden a dominios solicitados frecuentemente por múltiples clientes en la red interna.

---

## Pregunta 6: Diagnóstico y Análisis de Datagramas UDP (4.0 Puntos)

Topología de red con MTU de 1500 bytes en ambas viviendas:
- **Vivienda 1**: PC-PT (`192.168.1.10`, Puerto `5000`), Laptop-PT (`192.168.1.20`, Puerto `6000`), Printer-PT (`192.168.1.30`).
- **Vivienda 2**: Laptop-PT (`192.168.2.15`, Puerto `8000`), Smartphone-PT (`192.168.2.25`, Puerto `9000`).

### Respuestas:
a) **(0.5 pt) Datagrama UDP de 1000 bytes desde PC-PT a Laptop-PT (Vivienda 1)**:
- **Capa IP**:
  - IP Origen: `192.168.1.10`
  - IP Destino: `192.168.1.20`
  - Protocolo: `17` (UDP)
- **Capa UDP**:
  - Puerto Origen: `5000`
  - Puerto Destino: `6000`
  - Longitud UDP: $1000\text{ bytes (datos)} + 8\text{ bytes (cabecera)} = 1008\text{ bytes}$.
  - Checksum: Calculado sobre la pseudocabecera IPv4 y los 1008 bytes.

b) **(1.0 pt) Datagrama de 5000 bytes desde Laptop-PT (Vivienda 1) a Smartphone (Vivienda 2)**:
- **Fenómeno en la Capa de Red**: Se produce **Fragmentación IP** (*IP Fragmentation*).
- **Justificación**: El datagrama UDP total tiene una longitud de $5008$ bytes. Al sumarle la cabecera IPv4 base (20 bytes), el tamaño total del datagrama IP sería de $5028$ bytes, lo que supera ampliamente el $\text{MTU} = 1500$ bytes de la interfaz.
- La capa IP fragmenta el datagrama en múltiples paquetes de tamaño máximo 1500 bytes (con múltiplos de 8 bytes en la carga útil y el flag *More Fragments* activado en los fragmentos iniciales).

c) **(0.5 pt) Envío UDP PC-PT a Printer-PT: ¿Existe sincronización previa?**:  
- **No**. UDP es intrínsecamente **no orientado a la conexión** (*connectionless*). No existe ningún Three-Way Handshake preliminar ni reserva de buffers de sesión. El emisor simplemente inyecta el datagrama hacia la red esperando que el receptor esté escuchando.

d) **(1.0 pt) Smartphone envía datagrama a Laptop-PT al puerto cerrado 9999**:  
- **Protocolo de Notificación**: Protocolo **ICMP** (*Internet Control Message Protocol*, Tipo 3).
- **Mensaje Específico en Wireshark**:  
  `ICMP Destination Unreachable (Port Unreachable)` (Tipo 3, Código 3).

e) **(0.5 pt) Interrupción en flujo de voz UDP: ¿Mensaje FIN/RST? ¿Detección de transporte?**:  
- **No** se emitirá ningún mensaje FIN ni RST; esos paquetes de control son exclusivos de TCP y no existen en la especificación de UDP.
- La capa de transporte de UDP **no se entera jamás de la interrupción** (no tiene mecanismos de detección ni mantiene estado). Si la pérdida debe detectarse, la responsabilidad recae íntegramente en la **capa de aplicación** mediante protocolos como RTP/RTCP.

f) **(0.5 pt) Laptop-PT (Vivienda 2) intenta `ncat` UDP directo hacia `192.168.101.20` a través de Internet**:  
- **No es posible**. La dirección `192.168.101.20` pertenece al bloque de direcciones IP privadas definido en el RFC 1918. Los enrutadores del núcleo de Internet tienen instrucciones de configuración estándar para **descartar inmediatamente cualquier datagrama cuya dirección de destino pertenezca al espacio privado**. Solo se podría comunicar mediante una dirección IP pública enrutable con NAT configurado o a través de un túnel VPN.

---

## Pregunta 7: Pruebas con NCAT y Verificación de Checksum en Wireshark (4.0 Puntos)

### Respuestas:
a) **(1.0 pt) Datagramas UDP correspondientes a los mensajes**:  
La cabecera UDP consta de 4 campos de 16 bits (8 bytes):
- Puerto Origen (16 bits)
- Puerto Destino (16 bits)
- Longitud Total (16 bits, mínimo 8 bytes)
- Checksum (16 bits)
Seguidos por la carga útil enviada por la consola de NCAT.

b) **(0.5 pt) ¿Por qué el Checksum de UDP es diferente al de la capa IP?**:  
- El **checksum de IPv4** cubre **únicamente la cabecera IP de 20 bytes** para verificar que el direccionamiento y las opciones no se corrompan durante el enrutamiento salto a salto.
- El **checksum de UDP** cubre de extremo a extremo: la cabecera UDP completa, la carga útil de la aplicación, y una **pseudocabecera IP de 12 bytes** (que incluye IPs de origen y destino), garantizando que los datos no hayan sido entregados al host o proceso equivocado.

c) **(0.5 pt) ¿Por qué el Checksum se muestra como "unverified" en Wireshark?**:  
- Se debe a la característica de hardware de la tarjeta de red denominada **Checksum Offloading** (o *Hardware Checksumming*).
- El sistema operativo delega el cálculo matemático del checksum a la tarjeta de red física (NIC) para ahorrar ciclos de CPU. Como Wireshark captura los paquetes antes de que estos salgan físicamente de la tarjeta de red hacia el cable, el campo de checksum aún contiene ceros o valores basura sin calcular, activando la advertencia *[unverified]* en el software de análisis.

d) **(0.5 pt) Fragmentación y Fragment Offset del Paquete No. 30**:  
- Si el paquete excede los 1500 bytes de MTU, se divide en fragmentos. El campo `Fragment Offset` en la cabecera IP indica la posición relativa del fragmento respecto al inicio del datagrama original en **bloques de 8 bytes** (unidades de 64 bits).

e) **(0.5 pt) Valor del MTU**:  
- El valor estándar de la Unidad Máxima de Transmisión para redes Ethernet es de **1500 bytes**.

f) **(1.0 pt) ¿Por qué un frame tiene el tag "Malformed Packet" en Wireshark?**:  
- Ocurre cuando existe una discrepancia estructural en la longitud de las cabeceras: por ejemplo, cuando el campo `Length` declarado en la cabecera UDP indica un tamaño superior a la cantidad real de bytes recibidos en la trama Ethernet, o cuando un fragmento IP se truncó antes de recibirse completamente, impidiendo a los disectores de Wireshark decodificar los campos correspondientes.
