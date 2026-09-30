---
kind: subtopic
title: "Selective Repeat: Búferes de Recepción, Temporización Individual y Regla de la Ventana"
order: 2
---

## 1. Arquitectura de Búferes y Temporización Individual

Selective Repeat (SR) optimiza la tasa de transferencia en canales ruidosos desacoplando el destino de cada paquete dentro de la ventana de transmisión:
- **En el Emisor**: Cada paquete individual posee su propio temporizador lógico de cuenta regresiva. Si el temporizador del paquete $i$ expira, solo el paquete $i$ es reinyectado al canal, dejando intactos a los paquetes $i+1, i+2, \dots$ cuyos acuses de recibo aún están en tránsito o ya fueron confirmados.
- **En el Receptor**: Dispone de un búfer de tamaño igual a la ventana de recepción ($W_r$). Cuando arriba un paquete intacto con número de secuencia dentro del rango $[rcv\_base, rcv\_base + W_r - 1]$ pero fuera de orden estricto (por ejemplo, arriba el paquete $2$ cuando $rcv\_base = 0$), el receptor:
  1. Almacena el paquete $2$ en su ranura correspondiente del búfer.
  2. Genera y transmite inmediatamente un `ACK(2)` selectivo.
  3. No entrega datos a la aplicación todavía, ya que debe preservar la entrega secuencial estricta.
  4. Cuando el paquete rezagado $0$ arriba, se entrega el paquete $0$; si el paquete $1$ ya estaba almacenado, se entregan consecutivamente los paquetes $0, 1$ y $2$, desplazando la base de la ventana de recepción en 3 posiciones.

---

## 2. El Dilema del Espacio Finito de Secuencias

En cualquier implementación práctica, los números de secuencia no pueden crecer indefinidamente; se codifican en un campo de cabecera de tamaño fijo de $k$ bits, lo que restringe los valores admisibles al rango modular:
$$\{0, 1, 2, \dots, 2^k - 1\}$$

Cuando la base de la ventana avanza más allá de $2^k - 1$, la numeración vuelve a envolverse circularmente (*wraparound*) hacia $0$.

### Demostración del Escenario de Ambigüedad ($W > 2^{k-1}$)
Considérese un sistema con un campo de secuencia de $k = 2$ bits. El espacio total de números de secuencia consta de $2^2 = 4$ identificadores: $\{0, 1, 2, 3\}$.
Supóngase que se fija erróneamente un tamaño de ventana de $W = 3$ (nótese que $3 > 2^{2-1} = 2$).

Obsérvese la siguiente secuencia cronológica de eventos:
1. **Transmisión inicial**: El emisor envía los paquetes $0, 1$ y $2$. La ventana del emisor abarca $[0, 2]$.
2. **Recepción exitosa**: El receptor recibe los paquetes $0, 1$ y $2$ sin corrupción. Como llegaron en orden, entrega los tres paquetes a la capa de aplicación.
3. **Avance del receptor**: La ventana del receptor se desplaza 3 posiciones y ahora espera los paquetes con números de secuencia $[3, 0, 1]$ (la secuencia $0$ aquí representa un **paquete nuevo** de la siguiente ronda).
4. **Respuesta del receptor**: El receptor transmite acuses de recibo individuales `ACK(0)`, `ACK(1)` y `ACK(2)`.
5. **Pérdida en el canal de retorno**: **Todos los ACKs (0, 1 y 2) se pierden** debido a congestión en la red.
6. **Vencimiento de temporizador en el emisor**: El emisor no recibe confirmación alguna. El temporizador del paquete $0$ expira.
7. **Retransmisión**: El emisor retransmite el paquete $0$ original.
8. **Catástrofe de ambigüedad en el receptor**:
   - El receptor recibe un paquete con número de secuencia $0$.
   - El receptor consulta su ventana actual: $[3, \mathbf{0}, 1]$.
   - El receptor encuentra que el número $0$ coincide perfectamente con su ranura de recepción esperada.
   - El receptor interpreta erróneamente que este paquete es el **quinto paquete nuevo** de la transmisión, cuando en realidad es una **retransmisión redundante del primer paquete transmitido**.
   - Los datos duplicados se entregarán corruptamente a la aplicación como datos nuevos.

---

## 3. Teorema Fundamental del Tamaño de la Ventana

Para evitar de manera absoluta cualquier solapamiento entre la ventana actual del receptor y los paquetes retransmitidos desde la ventana anterior del emisor, se debe cumplir que la suma de ambas ventanas sea inferior o igual a la cardinalidad del espacio de números de secuencia:
$$W_s + W_r \le 2^k$$

Bajo la condición simétrica estándar donde la ventana del emisor es igual a la del receptor ($W_s = W_r = W$):
$$2W \le 2^k \implies W \le 2^{k-1}$$

### Aplicación al Ejemplo
Con $k = 2$ bits ($2^k = 4$), el tamaño máximo admisible de ventana es:
$$W \le 2^{2-1} = 2$$

Si $W = 2$, en el peor de los casos descritos:
- El receptor espera $[2, 3]$.
- El paquete retransmitido por el emisor es $0$.
- Dado que $0 \notin [2, 3]$, el receptor reconoce inmediatamente que se trata de un paquete antiguo de la ronda previa; emite el ACK correspondiente para desbloquear al emisor pero **descarta el contenido sin corromper el flujo de la aplicación**.
