---
kind: subtopic
title: "Conmutación de Paquetes vs. Conmutación de Circuitos"
order: 2
---

## 1. Conmutación de Circuitos: Principios y Multiplexación Determinista

En las redes de **conmutación de circuitos**, los recursos requeridos a lo largo de una ruta (búferes y ancho de banda en los enlaces) se reservan de forma fija durante toda la duración de la sesión de comunicación entre los sistemas terminales. Este es el modelo clásico implementado por la red telefónica tradicional pública conmutada (PSTN).

### 1.1 Fases de una Conexión por Circuito
1. **Establecimiento de llamada (*Call Setup*)**: Antes de enviar cualquier dato útil, los conmutadores intermedios intercambian mensajes de señalización para reservar un canal dedicado y continuo de extremo a extremo. Si algún enlace intermedio no posee ranuras libres, la llamada se bloquea (tono de ocupado).
2. **Transferencia de datos**: Los bits fluyen a través del canal dedicado a una tasa constante garantizada, con retardo de transmisión y propagación fijos y sin fluctuaciones de encolamiento (*jitter* nulo).
3. **Liberación de circuito (*Tear-down*)**: Al finalizar la comunicación, los recursos reservados se liberan explícitamente para que queden disponibles para otras conexiones.

### 1.2 Métodos de Multiplexación en Circuitos
El ancho de banda total del enlace físico se reparte entre múltiples circuitos mediante dos esquemas:
- **FDM (Frequency-Division Multiplexing)**: El espectro electromagnético continuo del enlace se divide en sub-bandas de frecuencia discretas. Cada circuito recibe una banda asignada permanentemente (utilizado en transmisiones de radio AM/FM y en cable módem tradicional).
- **TDM (Time-Division Multiplexing)**: El tiempo se estructura en tramas periódicas de duración fija. Cada trama se compone de un número constante de ranuras temporales (*time slots*). Cada circuito tiene asignada exactamente una ranura por trama.

---

## 2. Conmutación de Paquetes: Multiplexación Estadística y Eficiencia

En las redes de **conmutación de paquetes** (el diseño fundamental de Internet), los datos a transmitir se fragmentan en unidades discretas llamadas **paquetes**. Los paquetes de diferentes comunicaciones no tienen ranuras de tiempo ni frecuencias preasignadas; compiten dinámicamente por el uso del enlace de transmisión.

### 2.1 Multiplexación Estadística (*Statistical Multiplexing*)
A diferencia de TDM, donde la ranura temporal de un usuario ocioso se transmite vacía y se desperdicia, en la conmutación de paquetes un paquete se envía inmediatamente si el enlace está libre. El ancho de banda se asigna bajo demanda instantánea.

Esta característica permite admitir a un número significativamente mayor de usuarios en un mismo enlace físico cuando los patrones de tráfico son **a ráfagas** (*bursty*), situación típica de la navegación web, correo electrónico y transferencias de archivos, donde los usuarios permanecen inactivos la mayor parte del tiempo.

### 2.2 Principio de Almacenamiento y Reenvío (*Store-and-Forward*)
Los conmutadores y enrutadores de paquetes reciben el paquete completo en su memoria de entrada, realizan la verificación de integridad mediante suma de comprobación y determinan la ruta antes de comenzar la transmisión del primer bit hacia el siguiente enlace.

Si un mensaje de $M$ bits no se segmenta y se envía a través de $N$ enlaces en serie de tasa $R$, el tiempo total de transmisión es $N \cdot (M / R)$. En cambio, si el mensaje se divide en $P$ paquetes pequeños de tamaño $L = M/P$, los paquetes pueden transmitirse en forma de encauzamiento (*pipelining*):

$$T_{\text{segmentado}} = (N + P - 1) \cdot \frac{L}{R}$$

Este encauzamiento reduce drásticamente la latencia extremo a extremo global.

---

## 3. Comparación Cuantitativa: Capacidad y Probabilidad de Congestión

Consideremos un ejemplo cuantitativo clásico para comparar la eficiencia de ambos modelos:

### Escenario de Análisis
- **Capacidad total del enlace**: $R = 1\,\text{Mbps} = 1000\,\text{kbps}$.
- **Demanda por usuario activo**: Cada usuario genera tráfico a una tasa constante de $100\,\text{kbps}$ cuando transmite.
- **Patrón de actividad**: Cada usuario está activo solo el $p = 10\% = 0.10$ del tiempo, y permanece en silencio el $90\%$ del tiempo.

### 3.1 Bajo Conmutación de Circuitos
Dado que cada usuario requiere la reserva permanente de $100\,\text{kbps}$:

$$N_{\text{circuitos}} = \frac{1000\,\text{kbps}}{100\,\text{kbps}} = 10\,\text{usuarios}$$

La red de circuitos admite como máximo **10 usuarios simultáneos**. Si un undécimo usuario intenta conectarse, la llamada es rechazada, incluso si los 10 usuarios conectados están en silencio en ese instante.

### 3.2 Bajo Conmutación de Paquetes
Supongamos que admitimos a $N = 35$ usuarios en la red de paquetes. Dado que cada usuario actúa de manera independiente con probabilidad $p = 0.1$, el número de usuarios activos simultáneamente $X$ es una variable aleatoria con distribución binomial:

$$X \sim \text{Binomial}(N = 35, p = 0.1)$$

Habrá congestión en el enlace (más de $1000\,\text{kbps}$ de demanda acumulada) únicamente si más de 10 usuarios transmiten en el mismo instante ($X > 10$):

$$P(X > 10) = 1 - \sum_{k=0}^{10} \binom{35}{k} (0.1)^k (0.9)^{35-k}$$

Evaluando la sumatoria binomial:

$$P(X \le 10) \approx 0.9996 \implies P(X > 10) \approx 0.0004 = 0.04\%$$

### Conclusión
Bajo conmutación de paquetes, el enlace puede dar soporte a **35 usuarios** (3.5 veces más que la conmutación de circuitos) con una probabilidad de saturación ínfima de apenas 4 veces en 10,000 instantes. En los infrecuentes instantes en que $X > 10$, los paquetes no se bloquean de inmediato, sino que se encolan en el búfer del enrutador temporalmente.

---

## 4. Tabla Comparativa de Atributos Arquitectónicos

| Característica | Conmutación de Circuitos | Conmutación de Paquetes |
| :--- | :--- | :--- |
| **Reserva de recursos** | Dedicada y previa (fase de llamada) | Dinámica bajo demanda (*on-demand*) |
| **Garantías de servicio** | Ancho de banda y retardo garantizados | Servicio de mejor esfuerzo (*Best-Effort*) |
| **Manejo de sobrecarga** | Bloqueo de llamadas entrantes | Encolamiento con retardo variable y posible descarte |
| **Uso de búferes intermedios**| Mínimo o nulo | Esencial (almacenamiento y reenvío) |
| **Complejidad de señalización**| Alta (estados de conexión por nodo) | Baja en nodos (el estado viaja en la cabecera del paquete) |
| **Tipo de tráfico óptimo** | Voz continua y flujos de tasa constante | Datos a ráfagas (*bursty*) y tráfico web |
