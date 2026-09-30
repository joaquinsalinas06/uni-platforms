---
kind: theory
title: "Protocolos de Tubería: Go-Back-N vs Selective Repeat"
---

## 1. El Paradigma de Transmisión en Tubería (Pipelining)

La ineficiencia extrema de los protocolos de parada y espera (*Stop-and-Wait*) motivó la introducción del concepto de **transmisión en tubería** o **pipelining**. En lugar de inyectar un único paquete y aguardar pasivamente el arribo de su acuse de recibo ($RTT$), el emisor tiene autorización para transmitir **múltiples paquetes consecutivos sin confirmación previa**.

La consecuencia directa del pipelining sobre el diseño del protocolo abarca tres exigencias fundamentales:
1. **Ampliación del Rango de Números de Secuencia**: Ya no es viable alternar entre $0$ y $1$. Si se transmiten $N$ paquetes concurrentes, el espacio de números de secuencia debe abarcar un rango finito de $2^k$ valores, donde $k$ es el número de bits asignados al campo de secuencia en la cabecera.
2. **Búferes de Transmisión y Recepción**: El emisor debe almacenar en memoria todos los paquetes transmitidos que aún no han sido confirmados, por si se requiere su retransmisión. El receptor puede requerir búferes adicionales para retener paquetes recibidos fuera de orden.
3. **Manejo de Errores y Confirmaciones Complejas**: Surgen dos filosofías divergentes para gestionar pérdidas y retardos: **Go-Back-N (GBN)** y **Selective Repeat (SR)**.

### Ganancia en la Utilización
Si la ventana de transmisión permite hasta $N$ paquetes en vuelo simultáneamente, la utilización del emisor se multiplica por $N$:
$$U_{\text{pipeline}} = \min\left(1.0, \; \frac{N \cdot \frac{L}{R}}{RTT + \frac{L}{R}}\right)$$

Si se dimensiona $N$ tal que $N \ge 1 + \frac{RTT \cdot R}{L}$, la utilización alcanza el $100\%$ ($U = 1.0$), manteniendo el enlace saturado a su capacidad nominal máxima.

---

## 2. Go-Back-N (GBN): Ventana Deslizante y ACKs Acumulativos

En el protocolo **Go-Back-N**, el emisor mantiene una ventana de transmisión de tamaño máximo fijo $N$. Los números de secuencia se dividen dinámicamente en cuatro segmentos definidos por dos punteros:

```
[0 ... base-1]         : Paquetes ya transmitidos y confirmados (ACK recibido)
[base ... nextseqnum-1]: Paquetes transmitidos pero aún no confirmados (en vuelo)
[nextseqnum ... base+N-1]: Secuencias utilizables inmediatamente si hay datos de aplicación
[base+N ... fin]       : Secuencias bloqueadas hasta que la ventana avance
```

### Características Operativas del Emisor en GBN
- **Invocación desde arriba (`rdt_send`)**: Si el número de paquetes en vuelo es menor que $N$ (`nextseqnum < base + N`), se emite el paquete con secuencia `nextseqnum`. Si `base == nextseqnum` (es el primer paquete en vuelo), se arranca el temporizador. Se incrementa `nextseqnum`. Si la ventana está llena, se rechazan o encolan los datos.
- **Acuse de Recibo Acumulativo (`ACK(n)`)**: Un paquete de confirmación con valor $n$ indica que **todos los paquetes con números de secuencia hasta $n$ inclusive han sido recibidos correctamente** en el destino. Al arribar `ACK(n)`, el emisor actualiza `base = n + 1`. Si aún quedan paquetes en vuelo (`base < nextseqnum`), reinicia el temporizador para el paquete más antiguo; si no quedan paquetes pendientes, detiene el temporizador.
- **Evento de Timeout**: El emisor mantiene **un único temporizador lógico** para el paquete no confirmado más antiguo (`base`). Si este temporizador expira, el emisor asume la pérdida y **retransmite en ráfaga todos los paquetes en vuelo dentro de la ventana** (desde `base` hasta `nextseqnum - 1`). De aquí proviene el nombre *Go-Back-N* ("retroceder N posiciones").

### Comportamiento del Receptor en GBN: Simplicidad sin Búfer
El receptor en GBN mantiene una política estricta de **recepción en orden secuencial**:
- Mantiene una única variable de estado: `expectedseqnum`.
- Si arriba un paquete intacto cuyo número de secuencia coincide exactamente con `expectedseqnum`, entrega los datos a la capa superior, incrementa `expectedseqnum` y emite `ACK(expectedseqnum)`.
- Si arriba un paquete fuera de orden (por ejemplo, arriba el paquete $3$ habiéndose perdido el $2$) o corrupto: **el receptor descarta y desecha el paquete por completo**, sin almacenarlo en memoria. Acto seguido, retransmite un ACK confirmando el último paquete recibido en orden consecutivo (`ACK(expectedseqnum - 1)`).

---

## 3. Selective Repeat (SR): Confirmación Individual y Búferes en Recepción

La debilidad de GBN radica en escenarios de canales con alto producto retardo-ancho de banda y tasas de error moderadas: la pérdida de un único paquete obliga a retransmitir innecesariamente una gran cantidad de paquetes que ya habían arribado sanos al receptor.

El protocolo **Selective Repeat (SR)** mitiga este desperdicio retransmitiendo **exclusivamente aquellos paquetes específicos que se sospechan dañados o perdidos**.

### Mecanismos Clave de Selective Repeat
1. **Acuses de Recibo Individuales**: Cada paquete recibido correctamente genera un ACK que confirma única y exclusivamente a ese paquete puntual (no acumulativo).
2. **Búfer en el Receptor**: Si el receptor recibe paquetes fuera de orden dentro del rango de su ventana de recepción $[rcv\_base, rcv\_base + N - 1]$, los almacena temporalmente en un búfer de reordenamiento. Cuando eventualmente arriba el paquete faltante que bloqueaba el inicio de la ventana (`rcv_base`), el receptor entrega a la aplicación en un solo paso todos los paquetes contiguos disponibles y avanza `rcv_base`.
3. **Temporizadores Independientes por Paquete**: El emisor asocia un temporizador lógico individual a cada paquete emitido. Si el temporizador de un paquete particular expira, se retransmite únicamente ese paquete, sin afectar a los demás paquetes en vuelo.

---

## 4. La Restricción Fundamental de la Ventana en Selective Repeat

En cualquier protocolo con espacio de numeración finito de $k$ bits, los números de secuencia son congruentes módulo $2^k$:
$$\text{Secuencia} \in \{0, 1, 2, \dots, 2^k - 1\}$$

Si el tamaño de la ventana de transmisión ($W_s$) y la de recepción ($W_r$) es excesivamente grande respecto al espacio total de numeración, el receptor no puede distinguir si un paquete recibido corresponde a un paquete nuevo o a una retransmisión desfasada de la ronda anterior.

### Teorema del Límite de Ventana
Para garantizar la operación inequívoca en Selective Repeat, la suma del tamaño de la ventana del emisor y la ventana del receptor debe ser estrictamente menor o igual que la cardinalidad del espacio de números de secuencia:
$$W_s + W_r \le 2^k$$

En el caso habitual donde la ventana del emisor y del receptor son idénticas ($W_s = W_r = W$):
$$2W \le 2^k \implies W \le 2^{k-1}$$

El tamaño máximo admisible de ventana en Selective Repeat es **exactamente la mitad del espacio de números de secuencia disponibles**.

---

## 5. Cuadro Comparativo: GBN vs. Selective Repeat

| Criterio | Go-Back-N (GBN) | Selective Repeat (SR) |
| :--- | :--- | :--- |
| **Tipo de Confirmación** | Acumulativa (`ACK(n)` confirma hasta $n$) | Individual (`ACK(n)` confirma únicamente $n$) |
| **Temporizadores** | Un solo temporizador para el paquete más antiguo | Un temporizador independiente por cada paquete |
| **Acción ante Timeout** | Retransmisión de toda la ventana (`base` a `nextseq-1`) | Retransmisión selectiva del paquete vencido |
| **Búfer en el Receptor** | Inexistente (descarta paquetes fuera de orden) | Búfer de reordenamiento de tamaño $W_r$ |
| **Tamaño máx. ventana ($2^k$)** | $W \le 2^k - 1$ | $W \le 2^{k-1}$ (la mitad del espacio) |
| **Complejidad de hardware/SW** | Muy baja; lógica elemental en el receptor | Alta; gestión de múltiples timers y colas |
| **Eficiencia en canales ruidosos** | Pobre (tráfico redundante masivo) | Óptima (transmite estrictamente lo que falta) |
