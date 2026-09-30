---
kind: subtopic
title: "Resolución Analítica: Modelos Fluidos de Distribución y Análisis FSM"
order: 2
---

## 1. Problema de Rendimiento de Distribución Masiva (Sem06_Excercises2-2: Pregunta 1)

### Enunciado
Se desea distribuir un archivo de gran tamaño $F = 20\text{ Gbits} = 20000\text{ Mbits}$ a un conjunto de $N$ clientes/pares.
- Tasa de subida del servidor: $u_s = 30\text{ Mbps}$.
- Tasa de descarga de cada par: $d_i = d_{\min} = 2\text{ Mbps}$.
- Tasa de subida de cada par: $u \in \{300\text{ Kbps}, 700\text{ Kbps}, 2\text{ Mbps}\}$.
- Tamaño de la red: $N \in \{10, 100, 1000\}$.

Se requiere construir la tabla comparativa de tiempos mínimos de distribución para ambas arquitecturas.

---

### Formulación y Cálculos

#### 1. Arquitectura Cliente-Servidor (C-S)
El servidor debe transmitir $N$ copias del archivo, limitado por su ancho de banda de subida $u_s$, y ningún cliente puede recibirlo más rápido que su tasa máxima de bajada $d_{\min}$:
$$D_{\text{cs}} = \max\left(\frac{N \cdot F}{u_s}, \; \frac{F}{d_{\min}}\right)$$

Dado que $\frac{F}{d_{\min}} = \frac{20000\text{ Mb}}{2\text{ Mbps}} = 10000\text{ segundos}$ de forma constante:
- Para $N = 10$: $\frac{10 \times 20000}{30} = 6666.67\text{ s} \implies D_{\text{cs}} = \max(6666.67, 10000) = \mathbf{10000\text{ s}}$
- Para $N = 100$: $\frac{100 \times 20000}{30} = 66666.67\text{ s} \implies D_{\text{cs}} = \max(66666.67, 10000) = \mathbf{66667\text{ s}}$
- Para $N = 1000$: $\frac{1000 \times 20000}{30} = 666666.67\text{ s} \implies D_{\text{cs}} = \max(666666.67, 10000) = \mathbf{666667\text{ s}}$

Nótese que en Cliente-Servidor el ancho de banda de subida de los pares $u$ es irrelevante, pues no colaboran.

#### 2. Arquitectura Peer-to-Peer (P2P)
En P2P, el archivo debe salir al menos una vez del servidor ($\frac{F}{u_s}$), ningún par descarga a más de $\frac{F}{d_{\min}}$, y la capacidad agregada total de la red es $u_s + N \cdot u$:
$$D_{\text{P2P}} = \max\left(\frac{F}{u_s}, \; \frac{F}{d_{\min}}, \; \frac{N \cdot F}{u_s + N \cdot u}\right)$$

Valores base: $\frac{F}{u_s} = \frac{20000}{30} = 666.67\text{ s}$, y $\frac{F}{d_{\min}} = 10000\text{ s}$.

Evaluando $\frac{N \cdot F}{u_s + N \cdot u}$ para cada combinación:
- **Para $u = 300\text{ Kbps} = 0.3\text{ Mbps}$**:
  - $N=10$: $\frac{200000}{30 + 3} = 6060.6\text{ s} \implies D_{\text{P2P}} = \max(666.7, 10000, 6060.6) = \mathbf{10000\text{ s}}$
  - $N=100$: $\frac{2000000}{30 + 30} = 33333.3\text{ s} \implies D_{\text{P2P}} = \max(666.7, 10000, 33333.3) = \mathbf{33333\text{ s}}$
  - $N=1000$: $\frac{20000000}{30 + 300} = 60606.1\text{ s} \implies D_{\text{P2P}} = \max(666.7, 10000, 60606.1) = \mathbf{60606\text{ s}}$

- **Para $u = 700\text{ Kbps} = 0.7\text{ Mbps}$**:
  - $N=10$: $\frac{200000}{30 + 7} = 5405.4\text{ s} \implies D_{\text{P2P}} = \max(666.7, 10000, 5405.4) = \mathbf{10000\text{ s}}$
  - $N=100$: $\frac{2000000}{30 + 70} = 20000.0\text{ s} \implies D_{\text{P2P}} = \max(666.7, 10000, 20000.0) = \mathbf{20000\text{ s}}$
  - $N=1000$: $\frac{20000000}{30 + 700} = 27397.3\text{ s} \implies D_{\text{P2P}} = \max(666.7, 10000, 27397.3) = \mathbf{27397\text{ s}}$

- **Para $u = 2\text{ Mbps}$**:
  - $N=10$: $\frac{200000}{30 + 20} = 4000.0\text{ s} \implies D_{\text{P2P}} = \max(666.7, 10000, 4000.0) = \mathbf{10000\text{ s}}$
  - $N=100$: $\frac{2000000}{30 + 200} = 8695.7\text{ s} \implies D_{\text{P2P}} = \max(666.7, 10000, 8695.7) = \mathbf{10000\text{ s}}$
  - $N=1000$: $\frac{20000000}{30 + 2000} = 9852.2\text{ s} \implies D_{\text{P2P}} = \max(666.7, 10000, 9852.2) = \mathbf{10000\text{ s}}$

### Tabla Resumen Comparativa (Tiempo en segundos)

| $N$ | Arquitectura C-S | P2P ($u=300\text{ Kbps}$) | P2P ($u=700\text{ Kbps}$) | P2P ($u=2\text{ Mbps}$) |
| :---: | :---: | :---: | :---: | :---: |
| **10** | $10000\text{ s}$ | $10000\text{ s}$ | $10000\text{ s}$ | $10000\text{ s}$ |
| **100** | $66667\text{ s}$ | $33333\text{ s}$ | $20000\text{ s}$ | $10000\text{ s}$ |
| **1000** | $666667\text{ s}$ | $60606\text{ s}$ | $27397\text{ s}$ | $10000\text{ s}$ |

Obsérvese la escalabilidad intrínseca de P2P: para $N=1000$ pares con $u=2\text{ Mbps}$, el tiempo de distribución permanece invariante en $10000\text{ s}$ (menos de 3 horas), mientras que en Cliente-Servidor colapsa a $666667\text{ s}$ (aproximadamente $7.7\text{ días}$).

---

## 2. Derivación del Modelo Fluido (Sem06_Excercises2-2: Preguntas 2 y 3)

### Distribución Cliente-Servidor (Pregunta 2)
Bajo el modelo fluido, el servidor reparte su tasa $u_s$ entre los $N$ clientes:
1. **Caso $\frac{u_s}{N} \le d_{\min}$**: El cuello de botella radica exclusivamente en la tasa de subida del servidor. La tasa asignada a cada cliente es $r_i = \frac{u_s}{N} \le d_{\min}$, por lo que todos los clientes descargan simultáneamente a dicha tasa. El tiempo total de distribución es:
   $$D = \frac{F}{r_i} = \frac{F}{\frac{u_s}{N}} = \frac{N \cdot F}{u_s}$$
2. **Caso $\frac{u_s}{N} \ge d_{\min}$**: El servidor dispone de suficiente ancho de banda para saturar la tasa de descarga máxima de los clientes. Se fija la tasa para cada cliente en $r_i = d_{\min}$, consumiendo una tasa agregada del servidor de $N \cdot d_{\min} \le u_s$. El tiempo de distribución resultante es:
   $$D = \frac{F}{d_{\min}}$$
3. **Conclusión general**:
   $$D_{\text{cs}} = \max\left(\frac{N \cdot F}{u_s}, \; \frac{F}{d_{\min}}\right)$$

### Distribución P2P (Pregunta 3)
Suponiendo $d_{\min}$ arbitrariamente grande (sin estrangulamiento de descarga):
1. **Caso $u_s \le \frac{u_s + \sum_{i=1}^N u_i}{N}$**: El servidor envía fragmentos distintos a los clientes a tasa agregada $u_s$. Los pares redistribuyen inmediatamente los fragmentos entre sí. Como la tasa agregada de los pares es abundante, el servidor solo necesita emitir cada bit del archivo una única vez hacia la red. El tiempo para que el archivo completo salga del servidor es:
   $$D = \frac{F}{u_s}$$
2. **Caso $u_s \ge \frac{u_s + \sum_{i=1}^N u_i}{N}$**: La capacidad agregada de la red entera está limitada por la suma total de subida disponible en el sistema ($u_s + \sum u_i$). Para que $N$ clientes obtengan los $F$ bits, se deben inyectar $N \cdot F$ bits en total al sistema. El tiempo mínimo viene dado por:
   $$D = \frac{N \cdot F}{u_s + \sum_{i=1}^N u_i}$$
3. **Conclusión general**:
   $$D_{\text{P2P}} = \max\left(\frac{F}{u_s}, \; \frac{F}{d_{\min}}, \; \frac{N \cdot F}{u_s + \sum_{i=1}^N u_i}\right)$$

---

## 3. Análisis de Bloqueo Mutuo en RDT 2.1 (Sem06_Excercises2-2: Pregunta 5)

En el análisis de corrección de RDT 2.1, supóngase un diseño defectuoso en el receptor donde este no reenvía el ACK cuando detecta un paquete de datos fuera de secuencia:
- El emisor envía el paquete $0$ y espera en `Wait for ACK or NAK 0`.
- El receptor recibe el paquete $0$ sano, entrega los datos, envía `ACK` y transiciona al estado `Wait for 1 from below`.
- **Falla**: El paquete `ACK` se corrompe en el enlace de retorno hacia el emisor.
- El emisor recibe un paquete de control irreconocible (`corrupt(rcvpacket)`). Siguiendo las reglas de RDT 2.1, el emisor retransmite el paquete $0$.
- Si el receptor (que ahora espera el paquete $1$) no estuviera programado para responder con `ACK 0` ante la llegada de un paquete $0$ duplicado, simplemente descartaría el paquete en silencio.
- **Resultado del Deadlock**: El receptor permanece en silencio esperando que el emisor envíe el paquete $1$. El emisor permanece bloqueado en su estado esperando un ACK válido para el paquete $0$. Ninguno de los dos extremos generará jamás el evento que el otro espera, produciendo un bloqueo permanente (*deadlock*).
- Esta falla demuestra que en canales no confiables, **el receptor está estrictamente obligado a retransmitir la confirmación previa incluso cuando descarta paquetes duplicados**.
