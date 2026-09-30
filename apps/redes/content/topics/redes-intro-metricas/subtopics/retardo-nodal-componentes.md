---
kind: subtopic
title: "Componentes del Retardo Nodal y Modelado de Colas"
order: 1
---

## 1. Definición Rigurosa de los Cuatro Componentes del Retardo

El retardo total que experimenta un paquete al transitar por un nodo de conmutación de red (enrutador o conmutador) se define formalmente como la suma de cuatro variables desacopladas:

$$d_{\text{nodal}} = d_{\text{proc}} + d_{\text{queue}} + d_{\text{trans}} + d_{\text{prop}}$$

### 1.1 Retardo de Procesamiento ($d_{\text{proc}}$)
Cuando los primeros bits de un paquete llegan a la interfaz física de entrada del enrutador, el hardware de red inicia las siguientes operaciones:
1. **Comprobación de errores a nivel de enlace**: Cálculo del código de redundancia cíclica (CRC) o suma de comprobación de la trama Ethernet para validar que los bits no sufrieron corrupción por ruido electromagnético.
2. **Inspección de la cabecera IP**: Extracción de la dirección IP de destino (32 bits en IPv4 o 128 bits en IPv6), verificación del campo de tiempo de vida (*Time To Live* o TTL), decremento de TTL en una unidad y actualización del checksum de la cabecera IP.
3. **Búsqueda en la tabla de reenvío (*Forwarding Table Lookup*)**: Búsqueda por coincidencia de prefijo más largo (*Longest Prefix Match*) para seleccionar la interfaz de salida apropiada.
4. **Conmutación interna (*Switching Fabric*)**: Transferencia del paquete a través de la matriz de conmutación desde la tarjeta de línea de entrada hacia el búfer de la tarjeta de línea de salida.

En la actualidad, los enrutadores de alto rendimiento realizan esta tarea mediante procesadores de red dedicados y memorias direccionables por contenido ternario (TCAM), logrando retardos $d_{\text{proc}} \le 10\,\mu\text{s}$.

### 1.2 Retardo de Encolamiento ($d_{\text{queue}}$)
Una vez conmutado hacia la interfaz de salida, el paquete se ubica en una memoria intermedia (*output buffer* o cola FIFO). Si el enlace de salida se encuentra ocupado transmitiendo otro paquete, o si existen paquetes previos esperando en la cola, el paquete recién llegado debe esperar su turno.

El retardo de encolamiento es una variable aleatoria que depende fuertemente de la naturaleza del tráfico (ráfagas, periodicidad) y de la tasa de llegada de paquetes.

#### Intensidad de Tráfico y Modelado Teórico
Sean:
- $a$: tasa media de llegada de paquetes al búfer ($\text{paquetes/segundo}$).
- $L$: longitud del paquete en bits.
- $R$: tasa de transmisión del enlace de salida ($\text{bits/segundo}$).

El producto $L \cdot a$ representa la tasa promedio a la cual los bits llegan a la cola de salida. La **intensidad de tráfico** $I$ se define como:

$$I = \frac{L \cdot a}{R}$$

- **Régimen $I \ll 1$**: Los paquetes llegan a intervalos de tiempo mayores que el tiempo de transmisión $L/R$. La cola casi siempre está vacía, por lo que $d_{\text{queue}} \approx 0$.
- **Régimen $I \to 1$**: Las fluctuaciones y ráfagas temporales provocan que los paquetes se acumulen rápidamente. Según la teoría de colas (modelo $M/M/1$), el retardo de encolamiento medio se aproxima a:
  $$E[d_{\text{queue}}] = \frac{I}{1 - I} \cdot \frac{L}{R}$$
  A medida que $I$ se aproxima a la unidad, el retardo crece de manera no lineal hacia el infinito.
- **Régimen $I > 1$**: La tasa de llegada excede la capacidad de salida. Dado que los búferes de memoria son finitos en los equipos reales, la cola se llena completamente. Los paquetes que arriban cuando el búfer está lleno son descartados irrevocablemente, fenómeno conocido como **pérdida de paquetes** (*packet drop* o desbordamiento de búfer).

### 1.3 Retardo de Transmisión ($d_{\text{trans}}$)
Representa el intervalo de tiempo necesario para que el transmisor empuje todos los bits del paquete hacia el enlace de transmisión. Viene gobernado por la fórmula:

$$d_{\text{trans}} = \frac{L}{R}$$

Donde $L$ es la longitud del paquete en bits y $R$ es el ancho de banda o capacidad del enlace en bits por segundo.
- Es independiente de la distancia física entre los nodos.
- Depende únicamente de las características de la tarjeta de red y de la velocidad de modulación del enlace físico.

### 1.4 Retardo de Propagación ($d_{\text{prop}}$)
Representa el tiempo requerido por la señal física (onda electromagnética o pulso luminoso) para desplazarse a través del medio de transmisión desde el extremo emisor hasta el extremo receptor:

$$d_{\text{prop}} = \frac{d}{s}$$

Donde:
- $d$: distancia física del enlace en metros ($\text{m}$).
- $s$: velocidad de propagación de la onda en el medio específico ($\text{m/s}$).

En el vacío, la velocidad de la luz es $c \approx 3 \times 10^8\,\text{m/s}$. En medios guiados reales:
- En fibra óptica con índice de refracción $n \approx 1.5$: $s = \frac{c}{n} \approx 2 \times 10^8\,\text{m/s}$.
- En cable de par trenzado o coaxial de cobre: $s \approx 2.1 \times 10^8\,\text{m/s}$ a $2.3 \times 10^8\,\text{m/s}$.
- En enlaces satelitales geoestacionarios (GEO a $\approx 36000\,\text{km}$ sobre la Tierra): $d_{\text{prop}} \approx \frac{36000 \times 10^3}{3 \times 10^8} \approx 120\,\text{ms}$ por sentido (subida o bajada), totalizando un RTT satelital de aproximadamente $480\,\text{ms} - 500\,\text{ms}$.

---

## 2. Diferenciación Crítica: Retardo de Transmisión vs. Retardo de Propagación

Una de las confusiones más comunes en exámenes y evaluaciones radica en no distinguir conceptualmente $d_{\text{trans}}$ de $d_{\text{prop}}$:

| Criterio | Retardo de Transmisión ($d_{\text{trans}}$) | Retardo de Propagación ($d_{\text{prop}}$) |
| :--- | :--- | :--- |
| **Fórmula** | $L / R$ | $d / s$ |
| **Factores clave** | Longitud del paquete ($L$), capacidad del canal ($R$) | Longitud del enlace ($d$), medio físico ($s$) |
| **Analogía de la autopista** | Tiempo que tarda la cabina de peaje en despachar una caravana de autos hacia la pista. | Tiempo que tarda un auto en conducir a la velocidad límite desde la cabina hasta la siguiente ciudad. |
| **Cómo reducirlo** | Aumentando el ancho de banda del enlace ($R$) o reduciendo el tamaño del paquete ($L$). | Acortando la distancia física ($d$) o usando un medio con mayor velocidad de propagación. |

---

## 3. Tiempo de Ida y Vuelta (Round-Trip Time - RTT)

El **RTT** es el tiempo transcurrido desde que un host emisor envía un paquete pequeño hasta que recibe una respuesta o confirmación (*ACK*) inmediata del receptor. 

En un escenario simétrico ideal con dos saltos de enlace directo de ida y vuelta, con procesamiento y encolamiento despreciables y paquetes de confirmación de tamaño mínimo ($L_{\text{ACK}} \approx 0$):

$$\text{RTT} \approx 2 \cdot d_{\text{prop}} = 2 \cdot \frac{d}{s}$$

En presencia de retardos nodales generales a través de $N$ enlaces:

$$\text{RTT} = \sum_{k=1}^N \left( d_{\text{proc}, k}^{\to} + d_{\text{queue}, k}^{\to} + \frac{L}{R_k} + \frac{d_k}{s_k} \right) + \sum_{k=1}^N \left( d_{\text{proc}, k}^{\leftarrow} + d_{\text{queue}, k}^{\leftarrow} + \frac{L_{\text{ACK}}}{R_k} + \frac{d_k}{s_k} \right)$$
