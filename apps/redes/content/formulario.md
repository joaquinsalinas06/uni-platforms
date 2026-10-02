---
title: "Formulario de Referencia Rápida — Redes de Computadoras"
---

## Símbolos y Unidad Base (un solo criterio para todo el formulario)

**Unidad base:** todas las fórmulas y ejemplos de este formulario se evalúan en **bits** (tamaños), **bps** (tasas), **segundos** (tiempos) y **metros** (distancias). Los valores de enunciado en ms, Mbps o MB se convierten **primero** (tabla de abajo); los resultados finales pueden expresarse en ms si es más legible.

| Símbolo | Significado | Unidad base | Se define en |
|---|---|---|---|
| $L$ | Tamaño de un paquete u objeto | bits | Semana 1 |
| $R$ | Tasa de transmisión del enlace | bps | Semana 1 |
| $d$, $s$ | Distancia y velocidad de propagación | m, m/s | Semana 1 |
| $RTT_0$ = $RTT_s$ | RTT cliente $\leftrightarrow$ servidor del objeto | s | Semana 2 §0 |
| $RTT_i$ | RTT al $i$-ésimo servidor DNS | s | Semana 3 §1 |
| $S = \sum_{i=1}^{n} RTT_i$ | **Tiempo total de resolución DNS** (no un tamaño) | s | Semana 3 §1 |
| $N$, $k$ | Nº de objetos referenciados, nº de conexiones paralelas | (adimensional) | Semana 2 |

> **Cuidado con la letra $S$:** en la fórmula del curso (Semana 2 y 3) $S$ es el **tiempo DNS**. Algunos enunciados (parcial 2025-II: "$S = 8$ MB", parcial 2026-I: "$S = 2$ Mbits") usan la misma letra para el **tamaño del objeto**. En este formulario el tamaño siempre es $L$: al resolver, reemplazar $S_{\text{enunciado}} \to L$ y no mezclar ambos.

## Unidades y Conversiones (leer antes de usar cualquier fórmula)

**Regla de oro:** antes de reemplazar en una fórmula, llevar todo a **bits, bps y segundos**. Las tasas de enlace usan prefijos **decimales** (potencias de 10), igual que en las soluciones de los parciales.

| Magnitud | Equivalencia | Inversa |
|---|---|---|
| Tasa | $1\ \text{kbps} = 10^3\ \text{bps}$ | $1\ \text{bps} = 10^{-3}\ \text{kbps}$ |
| Tasa | $1\ \text{Mbps} = 10^6\ \text{bps}$ | $1\ \text{bps} = 10^{-6}\ \text{Mbps}$ |
| Tasa | $1\ \text{Gbps} = 10^9\ \text{bps} = 10^3\ \text{Mbps}$ | $1\ \text{Mbps} = 10^{-3}\ \text{Gbps}$ |
| Tamaño | $1\ \text{byte} = 8\ \text{bits}$ | $1\ \text{bit} = \tfrac{1}{8}\ \text{byte}$ |
| Tamaño | $1\ \text{KB} = 8\times10^3\ \text{bits} = 8\ \text{kb}$ | $1\ \text{kb} = 0{,}125\ \text{KB}$ |
| Tamaño | $1\ \text{MB} = 8\times10^6\ \text{bits} = 8\ \text{Mb}$ | $1\ \text{Mb} = 0{,}125\ \text{MB}$ |
| Tamaño | $1\ \text{GB} = 8\times10^9\ \text{bits} = 8000\ \text{Mb}$ | $1\ \text{Mb} = 0{,}000125\ \text{GB}$ |
| Tiempo | $1\ \text{s} = 10^3\ \text{ms} = 10^6\ \mu\text{s}$ | $1\ \text{ms} = 10^{-3}\ \text{s}$, $1\ \mu\text{s} = 10^{-6}\ \text{s}$ |

- **Mayúscula/minúscula:** $b$ = bit, $B$ = byte. $\text{Mb} \neq \text{MB}$ (factor 8). $\text{Mbps}$ siempre son **bits** por segundo.
- **Atajo coherente:** $\dfrac{\text{Mb}}{\text{Mbps}} = \text{s}$ (los $10^6$ se cancelan, no hace falta escribirlos). Si el tamaño viene en MB: $\dfrac{S\,[\text{MB}] \cdot 8}{R\,[\text{Mbps}]} = \text{s}$. Escribir $\times10^6$ en uno solo de los dos lados es el error típico.
- **Unidades binarias:** si el enunciado dice $1\ \text{MB} = 2^{20}$ bytes el resultado cambia ligeramente (en el parcial 2025-II: 16 s vs. 16,78 s). Por defecto usar la convención decimal.
- **Distancias y velocidades:** $s$ en $\text{m/s}$ ($2\times10^8$ fibra/cobre, $3\times10^8$ vacío), $d$ en metros: $1\ \text{km} = 10^3\ \text{m}$.

**Ejemplos resueltos de conversión**

- $L = 1500\ \text{B}$, $R = 10\ \text{Mbps}$: $d_{\text{trans}} = \dfrac{1500\cdot 8}{10\times10^6} = \dfrac{12\,000}{10^7} = 1{,}2\ \text{ms}$.
- $L = 8\ \text{MB}$, $R = 4\ \text{Mbps}$: $\dfrac{8\cdot8\times10^6}{4\times10^6} = 16\ \text{s}$ (parcial 2025-II).
- $L = 2\ \text{Mbits}$, $R = 10\ \text{Mbps}$: $\dfrac{2\times10^6}{10\times10^6} = 0{,}2\ \text{s}$ (parcial 2026-I).
- $F = 20\ \text{GB} = 20\cdot 8000 = 160\,000\ \text{Mb}$; con $u_s = 40\ \text{Mbps}$: $\dfrac{N F}{u_s} = \dfrac{150\cdot160\,000\ \text{Mb}}{40\ \text{Mbps}} = 600\,000\ \text{s}$ (los $10^6$ se cancelan).
- $d_{\text{prop}} = d_{\text{trans}}$ con $s = 2{,}5\times10^8$, $L = 1500\ \text{B}$, $R = 10\ \text{Mbps}$: $d = s \cdot \dfrac{L}{R} = 2{,}5\times10^8 \cdot 1{,}2\times10^{-3} = 3\times10^5\ \text{m} = 300\ \text{km}$.

---

## Semana 1 — Fundamentos y Rendimiento en Redes

### 1. Descomposición del Retardo Nodal
$$d_{\text{nodal}} = d_{\text{proc}} + d_{\text{queue}} + d_{\text{trans}} + d_{\text{prop}}$$

- **Retardo de Procesamiento ($d_{\text{proc}}$)**: Tiempo que toma el router en examinar la cabecera del paquete, verificar la suma de comprobación (checksum) y determinar el enlace de salida en la tabla de reenvío. Típicamente $\le \text{microsegundos}$.
- **Retardo de Encolamiento ($d_{\text{queue}}$)**: Tiempo que espera el paquete en el búfer de salida antes de ser transmitido. Depende de la congestión y del tráfico previo.
- **Retardo de Transmisión ($d_{\text{trans}}$)**: Tiempo necesario para empujar todos los bits del paquete hacia el medio físico:
  $$d_{\text{trans}} = \frac{L}{R}$$
  Donde $L$ es la longitud del paquete en bits ($\text{bits}$) y $R$ es la tasa de transmisión del enlace en bits por segundo ($\text{bps}$). Si $L$ viene en bytes, multiplicar por 8; si $R$ viene en Mbps, multiplicar por $10^6$ (ver tabla de conversiones).
- **Retardo de Propagación ($d_{\text{prop}}$)**: Tiempo que tarda un bit en viajar desde el origen del enlace físico hasta el extremo receptor:
  $$d_{\text{prop}} = \frac{d}{s}$$
  Donde $d$ (en algunos ejercicios escrito $m$) es la distancia física del enlace ($\text{metros}$) y $s$ es la velocidad de propagación de la señal en el medio (típicamente $s \approx 2 \times 10^8\text{ m/s}$ en fibra o cable coaxial, y $s \approx 3 \times 10^8\text{ m/s}$ en espacio libre).

### 2. Retardo de Extremo a Extremo (Sin Encolamiento)
Un solo enlace: $d_{\text{enlace}} = \dfrac{L}{R} + \dfrac{d}{s}$. Para igualar ambos retardos ($d_{\text{prop}} = d_{\text{trans}}$): $d = s\cdot\dfrac{L}{R}$.

Para una ruta con $Q$ enlaces homogéneos idénticos y $Q-1$ enrutadores intermedios de conmutación de paquetes *store-and-forward*:
$$d_{\text{end-to-end}} = Q \cdot \left( \frac{L}{R} + \frac{d}{s} \right)$$

Para la transmisión en tubería de $P$ paquetes seguidos:
$$T_{\text{total}} = (Q + P - 1) \cdot \frac{L}{R} + Q \cdot \frac{d}{s}$$

### 3. Tasa de Transferencia Eficaz (Throughput)
Para una trayectoria con enlaces en serie con tasas $R_1, R_2, \dots, R_k$:
$$\text{Throughput} = \min\{ R_1, R_2, \dots, R_k \}$$
El enlace con el menor ancho de banda constituye el **cuello de botella** (*bottleneck link*).

---

## Semana 2 — Capa de Aplicación y Protocolo HTTP

### 0. Notación de RTT (qué significa cada subíndice)
| Símbolo | Significado | Dónde aparece |
|---|---|---|
| $RTT_0$ o $RTT_s$ | RTT entre el cliente y el **servidor que tiene el objeto** (mismo valor, distinto nombre según el examen) | HTTP, SMTP |
| $RTT_1, RTT_2, \dots, RTT_n$ | RTT hacia cada servidor **DNS** consultado en orden (Root, TLD, autoritativo, ...) | DNS |
| $S = \sum_{i=1}^{n} RTT_i$ | Tiempo total de resolución DNS (se explica en Semana 3 §1) | todas las fórmulas con DNS |
| $RTT_{\text{local}}$ | RTT cliente $\leftrightarrow$ resolver DNS local (si el enunciado lo da, se suma aparte) | Ejercicios DNS |

- **Máximo índice:** la fórmula es general hasta $RTT_n$ ($n$ servidores DNS). En los parciales el máximo concreto es $RTT_3$ (2025-II: Root, TLD, autoritativo); el 2026-I usa solo $RTT_1, RTT_2$.
- **Ojo:** "4 RTT" (p. ej. HTML + 1 imagen en HTTP no persistente) es una **cantidad de viajes**, no un índice. $4\,RTT_0$ significa 4 veces el mismo $RTT_0$.

### 1. Tiempo de Descarga de Objetos en HTTP
Sea $N$ el número de objetos referenciados por el HTML base (se pide el HTML + $N$ objetos). $T$ incluye $S$ (tiempo de resolución DNS, definido en la [Semana 3 §1](#semana-3--sistema-de-nombres-de-dominio-dns)) solo si el dominio no está en caché; con caché, $S = 0$. Convención: el HTML base cuesta $2\,RTT_0$ (handshake + GET) en todos los modos.

| Modo | Tiempo (transmisión despreciable) | RTTs totales tras DNS |
|---|---|---|
| No persistente, secuencial | $T = S + 2\,RTT_0\,(1+N)$ | $2(N+1)$ |
| No persistente, $k$ conexiones paralelas | $T = S + 2\,RTT_0 + \left\lceil \tfrac{N}{k} \right\rceil 2\,RTT_0$ | $2 + 2\lceil N/k \rceil$ |
| Persistente sin pipelining | $T = S + 2\,RTT_0 + N\,RTT_0$ | $N+2$ |
| Persistente con pipelining / HTTP/2 | $T = S + 2\,RTT_0 + RTT_0$ | $3$ |

Con transmisión **no** despreciable, sumar $\dfrac{L}{R}$ de cada objeto (ya en bits y bps):

#### a) HTTP No Persistente (HTTP/1.0 sin paralelismo)
$$T = S + \underbrace{2 \cdot RTT_0 + \frac{L_{\text{HTML}}}{R}}_{\text{Objeto base HTML}} + \sum_{i=1}^N \left( 2 \cdot RTT_0 + \frac{L_i}{R} \right)$$
Cada objeto requiere 1 RTT para el Three-way Handshake TCP y 1 RTT para la petición/respuesta HTTP.

#### b) HTTP Persistente sin Pipelining (HTTP/1.1 por defecto)
$$T = S + \underbrace{2 \cdot RTT_0 + \frac{L_{\text{HTML}}}{R}}_{\text{Conexión TCP inicial + HTML}} + \sum_{i=1}^N \left( RTT_0 + \frac{L_i}{R} \right)$$
Se reutiliza la conexión TCP abierta; cada objeto solo incurre en 1 RTT adicional.

#### c) HTTP Persistente con Pipelining (o multiplexación HTTP/2)
$$T = S + 2 \cdot RTT_0 + \frac{L_{\text{HTML}}}{R} + RTT_0 + \frac{\sum_{i=1}^N L_i}{R}$$
Todas las solicitudes de los objetos referenciados se emiten de forma contigua sin esperar las respuestas intermedias.

**Ejemplo ($S = 0{,}120$ s, $RTT_0 = 0{,}080$ s, $N = 10$):** no persistente $= 0{,}120 + 2(0{,}080)(11) = 1{,}880$ s; persistente $= 0{,}120 + 0{,}080\cdot12 = 1{,}080$ s; pipelining $= 0{,}120 + 0{,}080\cdot3 = 0{,}360$ s.

### 2. Web Proxy Caching: modelo del enlace de acceso
Sea $\beta$ la tasa de llegada de peticiones (objetos/s), $L$ el tamaño medio del objeto (bits), $R$ la tasa del enlace de acceso (bps) y $h$ la tasa de acierto de la caché ($p_{\text{miss}} = 1 - h$).

- **Tiempo de transmisión medio por el enlace de acceso**: $\Delta = \dfrac{L}{R}$ (s). Es el mismo $d_{\text{trans}} = L/R$ de la Semana 1, solo que con $L$ = tamaño **medio** del objeto y $R$ = enlace de acceso; el ejercicio lo llama $\Delta$.
- **Intensidad de tráfico**: $\Delta\beta$ (adimensional). **Válido solo si $\Delta\beta < 1$**; si $\Delta\beta \ge 1$ el enlace está saturado y la cola crece sin límite (no aplicar la fórmula, daría un valor sin sentido).
- **Retardo medio de acceso** (el enunciado del ejercicio de la Semana 7, pregunta 4, **entrega** esta fórmula: "use $\Delta/(1-\Delta\beta)$"; el curso no la deduce). La condición $\Delta\beta < 1$ no viene del enunciado: es necesaria para que el denominador sea positivo (si no, sale un retardo negativo):
  $$d_{\text{acceso}} = \frac{\Delta}{1 - \Delta\beta}$$
- **Respuesta media sin caché**: $T = d_{\text{acceso}} + d_{\text{Internet}}$
- **Con caché**: solo los fallos cruzan el enlace, así que la tasa efectiva baja a $\beta' = p_{\text{miss}}\cdot\beta$ y $d_{\text{acceso}}' = \dfrac{\Delta}{1 - \Delta\beta'}$:
  $$T = p_{\text{miss}}\left(d_{\text{acceso}}' + d_{\text{Internet}}\right)$$
  Los aciertos se atienden en la LAN (tiempo $\approx$ milisegundos, despreciable).
- **Ejemplo** ($L = 10^6$ bits, $R = 15\times10^6$ bps, $\beta = 16$ req/s, $p_{\text{miss}} = 0{,}4$): $\Delta = 0{,}0667$ s; sin caché $\Delta\beta = 1{,}067 > 1$ (saturado); con caché $\beta' = 6{,}4$, $\Delta\beta' = 0{,}427$, $d_{\text{acceso}}' = 0{,}116$ s.

---

## Semana 3 — Sistema de Nombres de Dominio (DNS)

### 1. Latencia de Resolución DNS
- **Resolución Iterativa Secuencial** (consultando Root, TLD y Autoritativo; $n$ servidores en general, $n=3$ en el caso típico):
  $$T_{\text{DNS}} = S = \sum_{i=1}^{n} RTT_i = RTT_1 + RTT_2 + \dots + RTT_n$$
- **Con caché parcial**: se omiten los $RTT_i$ de los niveles ya conocidos (p. ej. solo el autoritativo: $T_{\text{DNS}} = RTT_3$). Ahorro $= T_{\text{sin caché}} - T_{\text{con caché}}$.
- **Si el enunciado da el RTT al resolver local** ($RTT_{\text{local}}$): $T_{\text{DNS}} = RTT_{\text{local}} + \sum_{i=1}^{n} RTT_i$.
- **Tiempo Total de Acceso Web (DNS + HTTP Persistente)**:
  $$T_{\text{total}} = T_{\text{DNS}} + \underbrace{2 \cdot RTT_s}_{\text{Handshake TCP + Request HTTP}} + \frac{L_{\text{objeto}}}{R}$$
  Ejemplo parcial 2025-II ($L = 8\ \text{MB} = 64\times10^6$ bits, $R = 4\times10^6$ bps): $0{,}240 + 2(0{,}070) + \frac{64\times10^6}{4\times10^6} = 16{,}38\ \text{s}$.
- **Correo (SMTP)**: DNS (registro MX) + handshake TCP ($1\,RTT$) + intercambio SMTP previo ($3\,RTT$) + transmisión del mensaje:
  $$T_{\text{mail}} = S + RTT_{\text{local}} + 1\,RTT + 3\,RTT + \frac{L}{R}$$
  donde los $RTT$ de TCP/SMTP son con el servidor destino. Ejemplo: $L = 2\ \text{MB} = 16\times10^6$ bits, $R = 20\times10^6$ bps $\to \frac{16\times10^6}{20\times10^6} = 0{,}8\ \text{s}$.

### 2. Formato del Registro de Recursos (RR)
$$(\text{Name}, \text{Value}, \text{Type}, \text{TTL})$$
- **Tipo A**: Hostname $\to$ IPv4.
- **Tipo AAAA**: Hostname $\to$ IPv6.
- **Tipo NS**: Dominio $\to$ Hostname del servidor DNS autoritativo.
- **Tipo CNAME**: Nombre de alias $\to$ Nombre canónico real.
- **Tipo MX**: Dominio $\to$ Hostname del servidor de correo electrónico.

---

## Semana 4 — Distribución de Archivos: Cliente-Servidor vs. P2P

**Unidades:** $F$ en bits (o Mb) y todas las tasas en la misma unidad (bps o Mbps); $F=20\ \text{GB}=160\,000\ \text{Mb}$ con tasas en Mbps da tiempos en segundos.

Sea $F$ el tamaño del archivo en bits, $N$ el número de clientes que desean descargarlo, $u_s$ la tasa de subida del servidor, $d_i$ la tasa de descarga del cliente $i$, y $u_i$ la tasa de subida del cliente $i$. Sea $d_{\min} = \min\{d_1, d_2, \dots, d_N\}$.

### 1. Cota Inferior en Arquitectura Cliente-Servidor
$$D_{\text{CS}} \ge \max\left\{ \frac{N \cdot F}{u_s}, \; \frac{F}{d_{\min}} \right\}$$
- El servidor debe enviar $N$ copias completas del archivo ($N \cdot F$).
- El cliente con la conexión más lenta no puede recibir el archivo más rápido que $F / d_{\min}$.
- **Escalabilidad**: Asintóticamente $O(N)$. Al aumentar $N$, el tiempo de distribución crece linealmente.

### 2. Cota Inferior en Arquitectura P2P
$$D_{\text{P2P}} \ge \max\left\{ \frac{F}{u_s}, \; \frac{F}{d_{\min}}, \; \frac{N \cdot F}{u_s + \sum_{i=1}^N u_i} \right\}$$
- Capacidad de subida total del sistema: $u_{\text{total}} = u_s + \sum_{i=1}^N u_i$.
- El servidor debe subir al menos una copia del archivo ($F / u_s$).
- Ningún nodo puede descargar más rápido que $F / d_{\min}$.
- La capacidad de subida agregada de todo el sistema es $u_s + \sum u_i$, por lo que la demanda total $N \cdot F$ se reparte entre todos los participantes.
- **Escalabilidad**: Asintóticamente $O(1)$. Si los peers tienen una tasa media de subida $u$, cuando $N \to \infty$:
  $$\frac{N \cdot F}{u_s + N \cdot u} \xrightarrow[N \to \infty]{} \frac{F}{u}$$
  El tiempo se vuelve independiente de la cantidad de usuarios (sistema autoescalable).

---

## Semana 5 — Capa de Transporte y Protocolos de Tubería

**Unidades:** $L$ en bits, $R$ en bps, $RTT$ en segundos (convertir ms $\to$ s). Ej.: $L=8000\ \text{bits}$, $R=1\ \text{Gbps}=10^9\ \text{bps}\Rightarrow L/R=8\ \mu\text{s}$.

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
- **Longitud del segmento UDP**: $\text{length} = 8\text{ bytes} + L_{\text{datos}}$.
- **Carga útil máxima de un segmento UDP (sin considerar IP)**: $65\,535 - 8 = 65\,527\text{ bytes}$.
- **Carga útil (Payload) máxima de UDP sobre IPv4**:
  $$\text{Max Payload} = 65,535 - 20\text{ (IPv4 Header)} - 8\text{ (UDP Header)} = 65,507\text{ bytes}$$
- **Carga útil máxima sin fragmentación sobre Ethernet (MTU = 1500 B)**:
  $$\text{Payload sin fragmentar} = 1500 - 20\text{ (IPv4)} - 8\text{ (UDP)} = 1472\text{ bytes}$$

### 2. Algoritmo de Checksum de Internet (RFC 1071)
$$\text{checksum} = \overline{w_1 + w_2 + \cdots + w_k}$$
donde $w_i$ son las palabras de 16 bits, la suma es en complemento a 1 y la barra indica invertir todos los bits. Pasos:

1. Los datos se dividen en palabras de 16 bits. Si el tamaño total es impar, se añade un byte cero de relleno al final (*padding*).
2. Se suman todas las palabras de 16 bits en aritmética de complemento a 1:
   - Todo acarreo (*carry-out*) más allá del bit 15 se suma al bit menos significativo (acarreo circular / *end-around carry*):
     $$\text{Suma final} = (\text{Suma} \ \& \ \text{0xFFFF}) + (\text{Suma} \gg 16)$$
3. Se invierte cada bit del resultado (operador NOT / complemento a uno):
   $$\text{Checksum} = \sim \text{Suma final}$$
4. **Verificación en el Receptor**: Se suman todas las palabras recibidas **incluyendo el campo checksum recibido**. Si no hubo errores, el resultado debe ser exactamente `0xFFFF` (`~0xFFFF = 0x0000`).

---

## Semana 7 — Protocolo TCP: RTT

### 1. Estimación del RTT (fórmula del parcial 2025-II, pregunta 6)
$$\text{SampleRTT} = t_{\text{ACK recibido}} - t_{\text{segmento enviado}}$$
$$\text{EstimatedRTT}_n = 0{,}875 \cdot \text{EstimatedRTT}_{n-1} + 0{,}125 \cdot \text{SampleRTT}_n$$

El material no incluye DevRTT, fórmula de timeout de TCP, control de flujo ni de congestión (ver [Semana 7](/units/s7)).

---

## Resumen de Examen — Todas las Fórmulas en una Tabla

Todo en bits, bps y segundos (ver [Símbolos y Unidad Base](#símbolos-y-unidad-base-un-solo-criterio-para-todo-el-formulario)).

| Tema | Fórmula |
|---|---|
| Transmisión | $d_{\text{trans}} = L/R$ |
| Propagación | $d_{\text{prop}} = d/s$ |
| Nodal | $d_{\text{nodal}} = d_{\text{proc}} + d_{\text{queue}} + d_{\text{trans}} + d_{\text{prop}}$ |
| $Q$ enlaces, 1 paquete | $Q\,(L/R + d/s)$ |
| $P$ paquetes en tubería | $(Q+P-1)\,L/R + Q\,d/s$ |
| Throughput | $\min\{R_1,\dots,R_k\}$ |
| DNS sin caché | $S = RTT_{\text{local}} + \sum_{i=1}^{n} RTT_i$ (omitir $RTT_{\text{local}}$ si no se da); ahorro $= T_{\text{sin}} - T_{\text{con}}$ |
| HTTP no persistente | $S + 2\,RTT_0\,(1+N)$ |
| HTTP no persistente, $k$ paralelas | $S + 2\,RTT_0 + \lceil N/k \rceil\, 2\,RTT_0$ |
| HTTP persistente | $S + 2\,RTT_0 + N\,RTT_0$ |
| HTTP pipelining | $S + 3\,RTT_0$ |
| Si hay transmisión | sumar $L_i/R$ de cada objeto |
| Web + DNS | $S + 2\,RTT_s + L/R$ |
| SMTP | $S + RTT_{\text{local}} + 4\,RTT + L/R$ |
| Caché web | $\Delta = L/R$; $d_{\text{acc}} = \Delta/(1-\Delta\beta)$ si $\Delta\beta<1$; $T = p_{\text{miss}}(d_{\text{acc}}' + d_{\text{Internet}})$ |
| Cliente-servidor | $D_{\text{CS}} \ge \max\{NF/u_s,\ F/d_{\min}\}$ |
| P2P | $D_{\text{P2P}} \ge \max\{F/u_s,\ F/d_{\min},\ NF/(u_s+\sum u_i)\}$ |
| Stop-and-wait | $U = \dfrac{L/R}{RTT + L/R}$; ciclo $= RTT + L/R$ |
| Ventana $N$ | $U = \min\{1,\ N\,\dfrac{L/R}{RTT+L/R}\}$; $N \ge 1 + RTT\cdot R/L$ |
| Ventanas con $k$ bits | SR: $W \le 2^{k-1}$; GBN: $W_s \le 2^k - 1$ |
| UDP | cabecera 8 B; $\text{length} = 8 + L_{\text{datos}}$; máx $65\,527$ (sin IP), $65\,507$ (IPv4), $1472$ (MTU 1500) |
| Checksum | suma 16 bits en comp. a 1, invertir; receptor suma todo $= \text{0xFFFF}$ |
| TCP RTT | $\text{Est}_n = 0{,}875\,\text{Est}_{n-1} + 0{,}125\,\text{Sample}_n$ |
