---
kind: subtopic
title: "RDT 3.0: Pérdidas de Paquetes, Temporizadores y Rendimiento Stop-and-Wait"
order: 2
---

## 1. El Desafío de la Pérdida Total de Paquetes

Mientras que las versiones 2.x de RDT asumían que todo paquete inyectado en el canal alcanzaba eventualmente el extremo opuesto (aunque con posibles alteraciones en sus bits), los canales reales descartan paquetes enteros. La pérdida puede originarse por desbordamiento de búferes en conmutadores intermedios o por fallos en la capa de enlace que invalidan tramas completas.

En este escenario, ni los números de secuencia ni los acuses de recibo tradicionales son suficientes por sí mismos:
- Si el paquete de datos se destruye en el tránsito, el receptor jamás se entera de su emisión y nunca responde.
- Si el paquete de datos llega pero el ACK de respuesta se pierde en el canal de retorno, el emisor permanece esperando indefinidamente una confirmación que nunca llegará.

Ambas situaciones culminan en un **bloqueo mutuo** (*deadlock*): emisor y receptor quedan suspendidos esperando un evento que jamás se generará.

---

## 2. RDT 3.0: Temporizadores de Cuenta Regresiva (Countdown Timers)

Para romper el bloqueo potencial, RDT 3.0 introduce un **temporizador de retransmisión** en el emisor.

### Principio Operativo
1. Al transmitir un paquete con secuencia $n$, el emisor inicializa un temporizador regresivo (`start_timer`).
2. Si el ACK correspondiente arriba antes de que el temporizador expire, el temporizador se cancela (`stop_timer`) y el protocolo progresa al siguiente número de secuencia.
3. Si el temporizador expira (**evento de Timeout**), el emisor asume que el paquete o su respectivo ACK se perdió en el canal. Como consecuencia:
   - Retransmite el paquete de datos idéntico mediante `udt_send(packet)`.
   - Reinicia el temporizador (`start_timer`).

### Manejo de Timeouts Prematuros y Paquetes Duplicados
Si el retardo del canal sufre fluctuaciones temporales y supera la duración configurada en el temporizador, ocurrirá un **timeout prematuro**:
- El emisor retransmite el paquete $0$ antes de recibir el ACK $0$ original que aún viajaba retrasado.
- El receptor recibe el paquete $0$ original, entrega los datos a la aplicación y envía ACK $0$.
- Cuando arriba la retransmisión prematura del paquete $0$, el receptor (que ahora espera el paquete $1$) detecta que es un duplicado gracias al número de secuencia; descarta los datos redundantes y vuelve a generar un ACK $0$.
- El emisor recibe los dos ACK $0$ de manera consecutiva; procesa el primero avanzando a la transmisión del paquete $1$ y descarta el segundo como confirmación redundante.

---

## 3. Análisis Cuantitativo del Rendimiento Stop-and-Wait

Aunque RDT 3.0 proporciona una corrección funcional estricta ante errores y pérdidas, sufre de una severa limitación de rendimiento debida a su operación en modo **Parada y Espera** (*Stop-and-Wait*).

### Derivación de la Ecuación de Utilización
Considérese un enlace caracterizado por:
- $R$: Capacidad de transmisión del enlace en bits por segundo (bps).
- $L$: Tamaño total del paquete transmitido en bits (incluyendo encabezados).
- $RTT$: Tiempo de retardo de ida y vuelta (*Round-Trip Time*) entre emisor y receptor.

El tiempo de transmisión requerido para colocar todos los bits del paquete en el medio físico es:
$$t_{\text{trans}} = \frac{L}{R}$$

Tras finalizar la inyección del paquete en $t = t_{\text{trans}}$, el último bit viaja hacia el receptor, tardando un tiempo de propagación $t_{\text{prop}} \approx \frac{RTT}{2}$. El receptor procesa el paquete y devuelve un ACK cuyo tamaño es despreciable ($L_{\text{ACK}} \approx 0$). Dicho ACK viaja de retorno hacia el emisor durante otros $\frac{RTT}{2}$ segundos.

Por consiguiente, el emisor no puede emitir el siguiente paquete hasta que transcurra un tiempo total de:
$$T_{\text{ciclo}} = t_{\text{trans}} + RTT = \frac{L}{R} + RTT$$

La **utilización del canal** ($U_{\text{sender}}$) representa la fracción del ciclo durante la cual el emisor estuvo ocupado inyectando bits útiles al enlace:
$$U_{\text{sender}} = \frac{t_{\text{trans}}}{T_{\text{ciclo}}} = \frac{\frac{L}{R}}{RTT + \frac{L}{R}}$$

### Ejemplo Numérico Demostrativo
Supóngase una conexión transcontinental por fibra óptica con:
- $R = 1\text{ Gbps} = 10^9\text{ bps}$
- $RTT = 30\text{ ms} = 0.030\text{ s}$
- $L = 1000\text{ bytes} = 8000\text{ bits}$

Calculando los términos:
$$t_{\text{trans}} = \frac{8000\text{ bits}}{10^9\text{ bps}} = 8\text{ }\mu\text{s} = 0.008\text{ ms}$$
$$T_{\text{ciclo}} = 30\text{ ms} + 0.008\text{ ms} = 30.008\text{ ms}$$
$$U_{\text{sender}} = \frac{0.008}{30.008} \approx 0.0002666 \quad (0.0267\%)$$

El ancho de banda efectivo alcanzado (*Throughput*) es:
$$\text{Throughput} = U_{\text{sender}} \cdot R = 0.0002666 \times 10^9\text{ bps} \approx 266.6\text{ Kbps}$$

El emisor desperdicia el $99.973\%$ de la capacidad teórica del canal físico debido al tiempo ocioso impuesto por la espera de la confirmación Stop-and-Wait.
