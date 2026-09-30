---
kind: theory
title: "Fundamentos de Redes, Conmutación y Retardos Nodales"
---

## 1. Visión General de la Red y Estructura de Internet

Una red de computadoras es un sistema interconectado de dispositivos de procesamiento de datos diseñados para intercambiar información mediante reglas y formatos estandarizados conocidos como **protocolos**. La Internet, en su definición más rigurosa, puede analizarse a partir de dos perspectivas complementarias:

### 1.1 Perspectiva de Infraestructura (Tuercas y Tornillos)
Desde el punto de vista del hardware y software que la compone, Internet es una gigantesca infraestructura de telecomunicaciones que conecta miles de millones de dispositivos de cómputo:
- **Sistemas terminales o Hosts**: Dispositivos ubicados en la periferia (*network edge*) de la red que ejecutan programas de aplicación de usuario (e.g., computadoras portátiles, servidores en centros de datos, teléfonos inteligentes, sensores de IoT).
- **Conmutadores de paquetes (Packet Switches)**: Nodos intermedios ubicados en el núcleo de la red (*network core*) que reciben trozos de datos entrantes y los reenvían hacia sus destinos finales. Los dos tipos predominantes son los **enrutadores (routers)**, que operan típicamente en la capa de red coordinando el camino global, y los **conmutadores de enlace (switches)**, que operan en la capa de enlace reenviando tramas dentro de redes de área local (LAN).
- **Enlaces de comunicación (Communication Links)**: Vías de transmisión física que conectan los conmutadores y sistemas terminales. Incluyen medios guiados (fibra óptica monomodo y multimodo, cable de par trenzado de cobre, cable coaxial) y medios no guiados (canales de radiofrecuencia terrestre, microondas y enlaces satelitales). Cada enlace tiene una propiedad física fundamental denominada **tasa de transmisión** o capacidad de canal ($R$), medida en bits por segundo (bps, Mbps o Gbps).
- **Redes de acceso (Access Networks)**: Redes que conectan físicamente los sistemas terminales con el primer enrutador (denominado *edge router*) del núcleo de la red (e.g., fibra óptica al hogar FTTH, redes móviles 4G/5G, Wi-Fi 802.11, Ethernet corporativo).

### 1.2 Perspectiva de Servicios
Desde el punto de vista de las aplicaciones de software, Internet es una infraestructura distribuida que provee servicios de transporte de datos a aplicaciones de red tales como correo electrónico, streaming multimedia, comercio electrónico y la World Wide Web. Internet expone una interfaz de programación de aplicaciones (API) a nivel de transporte mediante **sockets**, que permiten a los desarrolladores invocar primitivas de envío y recepción sin necesidad de manipular manualmente los circuitos electrónicos o enlaces físicos subyacentes.

---

## 2. El Núcleo de la Red: Conmutación de Paquetes vs. Conmutación de Circuitos

Para transferir datos desde un host emisor hacia un host receptor a través de una malla de nodos intermedios, existen dos filosofías arquitectónicas antagónicas: la **conmutación de paquetes** (*packet switching*) y la **conmutación de circuitos** (*circuit switching*).

### 2.1 Conmutación de Circuitos
En una red de conmutación de circuitos (modelo tradicional de la red telefónica PSTN), los recursos de ancho de banda y conmutación requeridos a lo largo de la ruta de comunicación se **reservan de forma exclusiva y constante** durante toda la duración de la sesión. 

La compartición del medio de transmisión físico se realiza mediante dos técnicas clásicas de multiplexación determinista:
1. **FDM (Frequency-Division Multiplexing)**: El espectro de frecuencia del enlace se divide de forma estática en bandas estrechas continuas. Cada llamada o circuito recibe una banda fija y exclusiva.
2. **TDM (Time-Division Multiplexing)**: El tiempo se divide en tramas temporales periódicas, y cada trama se subdivide en un número fijo de ranuras (*time slots*). Durante cada ciclo, una ranura fija se asigna a un circuito particular.

**Limitaciones**:
- Si un usuario que ha reservado un circuito guarda silencio y no transmite datos, los recursos asignados quedan ociosos e inutilizables para otros usuarios (*desperdicio de capacidad*).
- Requiere una compleja fase inicial de establecimiento de circuito (*call setup*) que introduce un retardo inicial no despreciable antes de enviar el primer bit.

### 2.2 Conmutación de Paquetes
En la conmutación de paquetes (el modelo de Internet), los mensajes de la capa de aplicación se segmentan en bloques discretos llamados **paquetes**, de longitud $L$ bits. Los paquetes viajan a través de los enlaces de comunicación a su tasa máxima de línea $R$ bps.

La característica distintiva es la **multiplexación estadística**: los recursos no se reservan de antemano. Múltiples fuentes comparten los enlaces según la demanda instantánea. Si varios paquetes compiten por el mismo enlace de salida al mismo tiempo, se almacenan temporalmente en búferes o memorias intermedias (*queues*) en el conmutador.

**Mecanismo Store-and-Forward**:
Los conmutadores de paquetes de Internet emplean la transmisión de almacenamiento y reenvío (*store-and-forward*). Esto significa que el conmutador **debe recibir por completo todos los $L$ bits de un paquete** antes de poder comenzar a transmitir el primer bit de dicho paquete hacia el enlace de salida siguiente.

Si un paquete de longitud $L$ bits viaja por un camino compuesto por $N$ enlaces sucesivos idénticos con tasa $R$ (con $N-1$ enrutadores intermedios), el tiempo mínimo de transmisión acumulado es:

$$T_{\text{store-and-forward}} = N \cdot \frac{L}{R}$$

---

## 3. Descomposición Matemática de los Retardos Nodales

A medida que un paquete atraviesa la red, experimenta diversos tipos de retardo en cada nodo que visita. El **retardo nodal total** ($d_{\text{nodal}}$) es la suma exacta de cuatro componentes desacoplados e independientes:

$$d_{\text{nodal}} = d_{\text{proc}} + d_{\text{queue}} + d_{\text{trans}} + d_{\text{prop}}$$

### 3.1 Retardo de Procesamiento Nodal ($d_{\text{proc}}$)
Es el tiempo requerido por el procesador del enrutador para examinar la cabecera del paquete, verificar la integridad de los datos mediante algoritmos de suma de comprobación (*checksum* o CRC), y consultar la tabla de reenvío (*forwarding table*) para determinar hacia qué interfaz de salida debe dirigirse el paquete. En enrutadores modernos con procesamiento por hardware en circuitos ASIC/FPGA, $d_{\text{proc}}$ es comúnmente del orden de microsegundos ($\mu\text{s}$).

### 3.2 Retardo de Encolamiento ($d_{\text{queue}}$)
Es el tiempo que el paquete pasa esperando en la memoria intermedia (*buffer*) del enlace de salida hasta que todos los paquetes que llegaron previamente sean transmitidos. Este retardo es de naturaleza puramente estocástica y dinámica: varía paquete a paquete dependiendo del estado instantáneo de congestión de la red.

La severidad del retardo de encolamiento se modela mediante la **intensidad de tráfico** ($I$):

$$I = \frac{L \cdot a}{R}$$

Donde:
- $L$: Longitud promedio del paquete en bits.
- $a$: Tasa promedio de llegada de paquetes a la cola en paquetes por segundo ($\text{pkt/s}$).
- $R$: Tasa de transmisión del enlace de salida en bits por segundo ($\text{bps}$).

**Comportamiento de la cola en función de $I$**:
1. Si $I \approx 0$: Las llegadas de paquetes son esporádicas. La probabilidad de encontrar la cola vacía es muy alta; el retardo de encolamiento medio se aproxima a $0$.
2. Si $I \to 1$: La tasa de inyección de bits se aproxima a la capacidad del enlace. Pequeñas ráfagas de tráfico saturan la cola, y el retardo de encolamiento medio tiende asintóticamente a infinito ($d_{\text{queue}} \to \infty$).
3. Si $I > 1$: La cantidad de bits que llegan por segundo excede permanentemente la capacidad del enlace. La cola se desborda indefectiblemente, provocando **pérdida de paquetes** (*packet drop* o *packet loss*).

### 3.3 Retardo de Transmisión ($d_{\text{trans}}$)
Es el tiempo necesario para expulsar físicamente todos los bits del paquete hacia el medio de transmisión. Depende exclusivamente del tamaño del paquete ($L$) y de la tasa de transmisión del enlace ($R$):

$$d_{\text{trans}} = \frac{L}{R}$$

Un error conceptual recurrente es confundir la tasa del enlace con la velocidad de la luz. $R$ no mide qué tan rápido viajan los electrones o fotones; mide **cuántos bits por unidad de tiempo puede colocar la tarjeta de interfaz de red (NIC) en el medio**.

### 3.4 Retardo de Propagación ($d_{\text{prop}}$)
Es el tiempo que tarda un bit individual en viajar a través del medio físico desde el transmisor en un extremo del enlace hasta el receptor en el otro extremo. Depende de la distancia física ($d$) que separa ambos nodos y de la velocidad de propagación de la señal electromagnética en el medio específico ($s$):

$$d_{\text{prop}} = \frac{d}{s}$$

En conductores de cobre y cables de fibra óptica, la velocidad de propagación $s$ es típicamente del orden de $2 \times 10^8 \text{ m/s}$ a $2.5 \times 10^8 \text{ m/s}$ (aproximadamente dos tercios de la velocidad de la luz en el vacío $c \approx 3 \times 10^8 \text{ m/s}$).

---

## 4. Retardo Extremo a Extremo en Rutas de Múltiples Saltos

Consideremos una conexión entre un host origen y un host destino que atraviesa una secuencia de $Q$ enlaces con $Q-1$ enrutadores intermedios. Suponiendo que el enlace $k$-ésimo posee una tasa de transmisión $R_k$, una longitud física $d_k$, una velocidad de propagación $s_k$, y que el enrutador previo introduce un retardo de procesamiento $d_{\text{proc}, k}$ y un retardo de encolamiento $d_{\text{queue}, k}$, el retardo extremo a extremo acumulado ($D_{\text{end-to-end}}$) para un paquete de tamaño $L$ es:

$$D_{\text{end-to-end}} = \sum_{k=1}^{Q} \left( d_{\text{proc}, k} + d_{\text{queue}, k} + \frac{L}{R_k} + \frac{d_k}{s_k} \right)$$

### 4.1 Enlace Cuello de Botella (Bottleneck Link) y Throughput
El **throughput** instantáneo es la tasa (en bits/segundo) a la cual un host receptor recibe efectivamente datos del emisor. El throughput promedio está condicionado por el enlace con la menor capacidad a lo largo de toda la ruta de transmisión, conocido formalmente como el **enlace cuello de botella**:

$$\text{Throughput} \le \min \{R_1, R_2, \dots, R_Q\}$$

---

## 5. Ejemplos de Examen Resueltos Paso a Paso

### Problema Tipo 1: Cálculo de Retardos en Enlace Directo
**Enunciado**: Se transmite un paquete de $L = 1500 \text{ bytes}$ a través de un enlace de fibra óptica de $d = 2500 \text{ km}$ con una tasa de transmisión $R = 100 \text{ Mbps}$. La velocidad de propagación en la fibra es $s = 2 \times 10^8 \text{ m/s}$. El retardo de procesamiento en el nodo origen es $d_{\text{proc}} = 5 \mu\text{s}$ y el encolamiento es nulo ($d_{\text{queue}} = 0$). Calcule $d_{\text{trans}}$, $d_{\text{prop}}$ y el retardo nodal total.

**Solución**:
1. Convertir el tamaño del paquete a bits:
   $$L = 1500 \text{ bytes} \times 8 \text{ bits/byte} = 12000 \text{ bits}$$
2. Calcular el retardo de transmisión:
   $$d_{\text{trans}} = \frac{12000 \text{ bits}}{100 \times 10^6 \text{ bps}} = 0.00012 \text{ s} = 120 \mu\text{s}$$
3. Calcular el retardo de propagación:
   $$d_{\text{prop}} = \frac{2500 \times 10^3 \text{ m}}{2 \times 10^8 \text{ m/s}} = 0.0125 \text{ s} = 12.5 \text{ ms} = 12500 \mu\text{s}$$
4. Sumar componentes:
   $$d_{\text{nodal}} = 5 \mu\text{s} + 0 + 120 \mu\text{s} + 12500 \mu\text{s} = 12625 \mu\text{s} \approx 12.625 \text{ ms}$$
*Conclusión analítica*: El retardo de propagación domina ampliamente la latencia frente al retardo de transmisión ($12.5 \text{ ms} \gg 0.12 \text{ ms}$).

### Problema Tipo 2: Enrutamiento Store-and-Forward con Múltiples Paquetes
**Enunciado**: Un host emisor desea transferir un archivo grande segmentado en $P = 3$ paquetes de tamaño $L = 1000 \text{ bytes}$ cada uno hacia un destino a través de 2 enrutadores intermedios (es decir, 3 enlaces en serie). Todos los enlaces operan a $R = 1 \text{ Mbps}$. Suponga retardos de propagación, procesamiento y encolamiento despreciables. Calcule el tiempo total hasta que el último bit del tercer paquete sea recibido en el destino.

**Solución**:
1. Tiempo de transmisión de un paquete en un solo enlace:
   $$t_{\text{trans}} = \frac{1000 \times 8 \text{ bits}}{10^6 \text{ bps}} = 8 \text{ ms}$$
2. Secuencia temporal de eventos (pipeline de paquetes):
   - En $t = 0 \text{ ms}$: El host emisor comienza a transmitir el Paquete 1.
   - En $t = 8 \text{ ms}$: El Enrutador 1 ha recibido por completo el Paquete 1 (store-and-forward). El host emisor comienza a transmitir el Paquete 2 sobre el enlace 1, mientras el Enrutador 1 comienza a retransmitir el Paquete 1 sobre el enlace 2.
   - En $t = 16 \text{ ms}$: El Enrutador 2 recibe el Paquete 1; el Enrutador 1 recibe el Paquete 2; el host emisor comienza a transmitir el Paquete 3 sobre el enlace 1.
   - En $t = 24 \text{ ms}$: El destino recibe completamente el Paquete 1; el Enrutador 2 recibe el Paquete 2; el Enrutador 1 recibe el Paquete 3.
   - En $t = 32 \text{ ms}$: El destino recibe completamente el Paquete 2; el Enrutador 2 recibe el Paquete 3.
   - En $t = 40 \text{ ms}$: El destino recibe completamente el Paquete 3.
3. Expresión general para $P$ paquetes sobre $N$ enlaces idénticos:
   $$T_{\text{total}} = (N + P - 1) \cdot \frac{L}{R} = (3 + 3 - 1) \cdot 8 \text{ ms} = 5 \cdot 8 \text{ ms} = 40 \text{ ms}$$
